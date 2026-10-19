import re
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone, timedelta

class DetectionEngine:
    SUSPICIOUS_PATHS = [
        "/admin", "/login", "/wp-login.php", "/.env", "/config.json",
        "/api/v1/users", "/api/v1/auth", "/debug", "/actuator"
    ]
    
    AGENT_PATHS = [
        "/.well-known/agent.json", "/mcp", "/agent/tools", "/agent/execute",
        "/v1/models", "/openapi.json"
    ]
    
    SUSPICIOUS_COMMANDS = [
        "cat /etc/passwd", "cat /etc/shadow", "wget ", "curl ", "chmod +x",
        "nc -e", "/bin/sh", "/bin/bash", "python -c", "bash -i", "rm -rf",
        "uname -a", "id", "whoami", "sudo su", "iptables"
    ]

    @staticmethod
    def evaluate_event(event_dict: Dict[str, Any], recent_events: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Evaluate an event against deterministic detection rules.
        Returns incident specification dict if a rule matches, else None.
        """
        sensor_type = event_dict.get("sensor_type", "")
        event_type = event_dict.get("event_type", "")
        source_ip = event_dict.get("source_ip", "")
        payload = (event_dict.get("payload") or "").lower()
        metadata = event_dict.get("metadata", {}) or {}
        
        # 1. AI Agent Discovery Probing
        is_agent_path = any(path in payload for path in DetectionEngine.AGENT_PATHS)
        ua = str(metadata.get("user_agent", "")).lower()
        is_agent_ua = any(term in ua for term in ["agent", "langchain", "cline", "autogpt", "bot", "assistant"])
        if is_agent_path or is_agent_ua or event_type == "agent_probing":
            return {
                "classification": "ai_agent_discovery",
                "title": f"AI Agent Reconnaissance Probing from {source_ip}",
                "description": f"Automated entity initiated structured tool/MCP agent schema discovery: {payload or 'agent endpoint'}",
                "severity": "medium",
                "attack_risk": 0.72,
                "automation_likelihood": 0.95,
                "ai_agent_likelihood": 0.88,
                "requires_human_approval": False
            }
            
        # 2. Suspicious Command Execution (SSH / Decoy)
        if event_type == "command_executed":
            matched_cmds = [cmd for cmd in DetectionEngine.SUSPICIOUS_COMMANDS if cmd in payload]
            if matched_cmds:
                return {
                    "classification": "suspicious_command_execution",
                    "title": f"Reconnaissance / Exploitation Commands from {source_ip}",
                    "description": f"Attacker executed suspicious shell commands: {', '.join(matched_cmds)}",
                    "severity": "critical" if any(c in payload for c in ["shadow", "chmod +x", "nc -e", "bash -i"]) else "high",
                    "attack_risk": 0.94,
                    "automation_likelihood": 0.75,
                    "ai_agent_likelihood": None,  # Unknown
                    "requires_human_approval": True
                }

        # 3. SSH Brute Force
        if sensor_type == "ssh" and event_type == "authentication_failed":
            # Check recent failed logins from this IP
            recent_fails = [
                e for e in recent_events
                if e.get("source_ip") == source_ip and e.get("event_type") == "authentication_failed"
            ]
            if len(recent_fails) >= 3:
                return {
                    "classification": "ssh_brute_force",
                    "title": f"SSH Brute-Force Spraying from {source_ip}",
                    "description": f"Detected {len(recent_fails) + 1} repeated SSH authentication failures within detection window.",
                    "severity": "high",
                    "attack_risk": 0.88,
                    "automation_likelihood": 0.98,
                    "ai_agent_likelihood": 0.15,
                    "requires_human_approval": False
                }

        # 4. Web Admin / Endpoint Scanning
        if sensor_type == "web" and any(p in payload for p in DetectionEngine.SUSPICIOUS_PATHS):
            return {
                "classification": "endpoint_enumeration",
                "title": f"Sensitive Web Endpoint Enumeration from {source_ip}",
                "description": f"Probing sensitive administrative and configuration paths: {payload}",
                "severity": "medium",
                "attack_risk": 0.68,
                "automation_likelihood": 0.90,
                "ai_agent_likelihood": 0.25,
                "requires_human_approval": False
            }

        # 5. Perimeter Reconnaissance (Low Risk)
        if sensor_type == "web" and any(p in payload for p in ["robots.txt", "sitemap.xml", "favicon"]):
            return {
                "classification": "perimeter_reconnaissance",
                "title": f"Perimeter Crawler Discovery from {source_ip}",
                "description": f"Automated crawler inspected public resource index: {payload}",
                "severity": "low",
                "attack_risk": 0.20,
                "automation_likelihood": 0.85,
                "ai_agent_likelihood": 0.10,
                "requires_human_approval": False
            }

        # 5. Credential Stuffing
        if "login" in payload and (event_type in ["authentication_failed", "credential_access"]):
            return {
                "classification": "credential_stuffing",
                "title": f"Credential Stuffing Attack from {source_ip}",
                "description": f"Automated authentication attempt against exposed credentials endpoint.",
                "severity": "high",
                "attack_risk": 0.84,
                "automation_likelihood": 0.96,
                "ai_agent_likelihood": 0.12,
                "requires_human_approval": False
            }

        return None

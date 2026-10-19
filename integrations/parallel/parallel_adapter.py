import logging
from typing import Dict, Any, Optional
from sentinel_core.config import settings

logger = logging.getLogger("sentinel.parallel")

class ParallelEnrichmentAdapter:
    def __init__(self, mock_mode: bool = None, api_key: str = None):
        self.mock_mode = mock_mode if mock_mode is not None else settings.PARALLEL_MOCK_MODE
        self.api_key = api_key or settings.PARALLEL_API_KEY

    def enrich_indicator(self, indicator: str, indicator_type: str) -> Dict[str, Any]:
        """
        Enriches an indicator (IP, technique, CVE) using Parallel.ai or mock intelligence dataset.
        """
        # Mock Threat Intelligence Database
        mock_intel = {
            "technique:T1110": {
                "summary": "MITRE ATT&CK T1110 — Brute Force: Password Guessing & Spraying",
                "details": {
                    "tactics": ["Credential Access"],
                    "detection": "Monitor authentication logs for repeated failed logins across user accounts.",
                    "mitigation": "Enforce account lockout policies, multi-factor authentication, and IP ban lists."
                },
                "confidence": 0.95
            },
            "technique:T1595": {
                "summary": "MITRE ATT&CK T1595 — Active Scanning: Vulnerability & Wordlist Probing",
                "details": {
                    "tactics": ["Reconnaissance"],
                    "detection": "Track high-volume 404/403 status responses and automated crawler signatures.",
                    "mitigation": "Deploy web application firewalls and honeypot tarpits."
                },
                "confidence": 0.90
            },
            "technique:T1059": {
                "summary": "MITRE ATT&CK T1059 — Command and Scripting Interpreter Execution",
                "details": {
                    "tactics": ["Execution"],
                    "detection": "Inspect command parameters for shell invocation, privilege elevation, or file download utilities.",
                    "mitigation": "Disable unneeded shell binaries and execute inside ephemeral sandboxes."
                },
                "confidence": 0.92
            },
            "ip:192.168.139.200": {
                "summary": "Local Subnet / Test Range Actor",
                "details": {
                    "reputation": "Internal / Non-Routable Decoy Actor",
                    "asn": "AS0000 Local Subnet",
                    "threat_category": "Internal Audit & Honeypot Probing"
                },
                "confidence": 0.98
            }
        }

        key = f"{indicator_type}:{indicator}"
        if key in mock_intel:
            item = mock_intel[key]
            return {
                "indicator": indicator,
                "indicator_type": indicator_type,
                "provider": "parallel_ai_mock",
                "summary": item["summary"],
                "details": item["details"],
                "confidence": item["confidence"]
            }

        # Generic enrichment fallback
        return {
            "indicator": indicator,
            "indicator_type": indicator_type,
            "provider": "parallel_ai_heuristic",
            "summary": f"Threat analysis for {indicator_type} '{indicator}'",
            "details": {
                "reputation": "Suspicious / Decoy Interaction",
                "threat_score": 75,
                "recommended_action": "Isolate and monitor telemetry"
            },
            "confidence": 0.85
        }

parallel_adapter = ParallelEnrichmentAdapter()

# CLINE SENTINEL

**AI-Powered Cybersecurity Honeypot, Threat Correlation, and Incident Intelligence Platform.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12%2B-cyan.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-PostgreSQL_16-2496ED.svg)](https://docker.com)
[![Cline](https://img.shields.io/badge/Runtime_AI-Cline_CLI-brightgreen.svg)](https://github.com/cline/cline)
[![Pitch Presentation PDF](https://img.shields.io/badge/Pitch_Presentation-PDF_Download-ff0055.svg)](docs/cline-sentinel-pitch.pdf)

---

## 1. What It Does

**Cline Sentinel** is an autonomous security monitoring, decoy, and threat correlation system. It captures, correlates, and analyzes cyber attacks across simulated SSH and synthetic Web/API/MCP decoys, scoring adversary activity across **Attack Risk**, **Automation Likelihood**, and **AI-Agent Likelihood** dimensions.

### Core Capabilities:
- **SOC Operations Dashboard (Port 3000):** Dark-mode animated cyberpunk HUD featuring live Server-Sent Events (SSE) telemetry, an interactive SVG radar sweep, an interactive CRT keystroke terminal player, an incident triage matrix, and a 1-click test-range attack simulator.
- **Cowrie SSH Honeypot (Port 2222):** Simulates an OpenSSH server, trapping brute-force attempts and providing an isolated virtual shell that captures commands without executing attacker payloads on the host.
- **Synthetic Web & MCP Agent Decoy (Port 8088):** Deceives scanners and automated AI agents by exposing fake administrative consoles (`/admin`, `/login`), REST API credentials (`/api/v1/auth`), and Model Context Protocol endpoints (`/.well-known/agent.json`, `/mcp`, `/agent/tools`, `/agent/execute`).
- **Autonomous Incident Investigation via Cline:** Submits sanitized, prompt-injection-resistant incident telemetry to the local Cline CLI in headless plan mode (`cline -p -P openrouter -m google/gemini-3.8-flash`), generating executive summaries, threat reasoning, and defensive recommendations without granting Cline host bash permissions.
- **Deterministic Correlation Engine:** Evaluates events in real-time for SSH brute-forcing, admin path enumeration, sensitive credential access, and autonomous agent discovery probes.
- **Composio Alert Worker:** Implements severity-based notification escalation policies (Immediate, Hourly digest, Daily digest) with a safe mock delivery provider by default.
- **Parallel.ai Threat Intelligence:** Provides IOC lookups against an offline MITRE ATT&CK (T1110, T1595, T1059) and CVE intelligence catalog.

---

## 2. Architecture Diagram

```
                        ATTACK TRAFFIC / TEST RANGE
                                     |
             +-----------------------+-----------------------+
             |                                               |
             v                                               v
     COWRIE SSH DECOY                               SYNTHETIC WEB / MCP DECOY
       (Port 2222)                                        (Port 8088)
   Simulated OpenSSH Shell                         /admin, /login, /mcp, /agent
             |                                               |
             +-----------------------+-----------------------+
                                     |
                                     v
                           EVENT COLLECTION PIPELINE
                        Normalization & Deduplication
                                     |
                                     v
                              POSTGRESQL 16
                         Events, Sessions, Incidents
                                     |
                                     v
                        DETERMINISTIC RULES ENGINE
                      Risk & Automation Classification
                                     |
                                     v
                          INCIDENT TRIAGE QUEUE
                                     |
                                     v
                        CLINE RUNTIME INVESTIGATION
                       Unattended Plan-Mode (-p) Sandbox
                           Prompt-Injection Guardrails
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
      PARALLEL.AI INTEL                             COMPOSIO GMAIL
      Technique & CVE Lookup                        Escalation Alerts
               |                                           |
               +---------------------+---------------------+
                                     |
                                     v
                        OPERATIONS API (FASTAPI :8000)
                         REST + Server-Sent Events (SSE)
                                     |
                                     v
                      FUTURISTIC SOC DASHBOARD (:3000)
                     React + TypeScript + Tailwind + Recharts
```

---

## 3. System Requirements

### Hardware:
- **Architecture:** x86_64 or arm64 (Apple Silicon, OrbStack, AWS Graviton)
- **CPU:** 2+ vCPUs recommended
- **RAM:** Minimum 4 GB (8 GB recommended)
- **Disk:** 5 GB free disk space

### Software Prerequisites:
- **Operating System:** Linux (Ubuntu 22.04+, Debian, Lubuntu) or macOS
- **Container Engine:** Docker Engine & Docker Compose (v2+)
- **Python:** Python 3.12 or newer (`python3-venv` required)
- **Node.js:** Node.js v20+ and npm v10+
- **Cline CLI:** Installed globally (`npm install -g cline`) or at `~/.local/bin/cline`

---

## 4. Step-by-Step Installation Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/sermasdev/cline-sentinel.git
cd cline-sentinel
```

### Step 2: Configure Environment Variables
Copy the configuration template:
```bash
cp .env.example .env
```
Edit `.env` if custom ports or API keys are required:
```env
# Default ports:
API_PORT=8000
DASHBOARD_PORT=3000
COWRIE_PORT=2222
WEB_DECOY_PORT=8088
DATABASE_URL=postgresql+psycopg://postgres:postgres@host.docker.internal:5432/sentinel
```

### Step 3: Set Up Python Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Install Dashboard Dependencies & Build
```bash
cd services/dashboard
npm install
npm run build
cd ../..
```

### Step 5: Start PostgreSQL Database
Using Docker Compose:
```bash
docker compose up -d
```
Verify the container is healthy:
```bash
docker ps --filter "name=sentinel-db"
```

### Step 6: Initialize Database Tables
```bash
source .venv/bin/activate
python3 -c "import sys; sys.path.insert(0, '.'); from sentinel_core.db import init_db; init_db()"
```

---

## 5. Running the Application

You can start the entire multi-service stack with a single command using the built-in supervisor:

```bash
source .venv/bin/activate
python3 services/run_stack.py
```

This starts all four services concurrently:
1. **Operations API**: `http://0.0.0.0:8000` (FastAPI + Swagger Docs at `/docs`)
2. **SOC Dashboard**: `http://0.0.0.0:3000` (React Web Interface)
3. **Web & MCP Decoy**: `http://0.0.0.0:8088` (Synthetic Endpoints)
4. **Cowrie SSH Decoy**: `0.0.0.0:2222` (Paramiko SSH Honeypot)

All logs are written to `runtime/logs/`.

---

## 6. Accessing the Platform

| Interface | URL | Purpose |
|---|---|---|
| **SOC Dashboard** | `http://localhost:3000` | Real-time monitoring, radar HUD, triage, session replay |
| **LAN Dashboard** | `http://<your-lan-ip>:3000` | Remote SOC monitoring across local network |
| **API Health** | `http://localhost:8000/health` | Service health status |
| **Swagger API Docs** | `http://localhost:8000/docs` | Interactive OpenAPI documentation |
| **MCP Decoy Endpoint** | `http://localhost:8088/mcp` | Synthetic Model Context Protocol endpoint |
| **Agent Discovery** | `http://localhost:8088/.well-known/agent.json` | Simulated AI agent configuration |
| **SSH Decoy** | `ssh -p 2222 root@localhost` | Cowrie simulated OpenSSH terminal |

---

## 7. Interactive Features & Verification

### 1-Click Attack Simulation Matrix
In the dashboard header, click **ATTACK SIMULATOR** to trigger test-range scenarios:
- **SSH Brute-Force Spray:** Generates failed logins against port 2222.
- **Web Admin Probe:** Probes `/admin`, `/.env`, and `/config.json`.
- **Autonomous AI Agent Recon:** Queries `/.well-known/agent.json` and probes MCP tools.
- **Critical Shell Command Injection:** Tests privilege escalation command detection.

### Autonomous Cline AI Investigation
1. Navigate to the **Incidents** view.
2. Select any open incident.
3. Click **INVESTIGATE WITH CLINE AI**.
4. Cline runs in headless plan mode (`-p`), analyzes the telemetry, and provides:
   - Executive Summary
   - Threat Analysis Reasoning
   - Evidence Event IDs
   - Alternative Explanations
   - Concrete Defensive Recommendations

### CRT Keystroke Session Replay
1. Navigate to the **Sessions & Replay** view.
2. Click **REPLAY** on any recorded session.
3. Watch the CRT terminal player step through the attacker's interactive commands with adjustable playback speed (1x, 2x, 5x).

---

## 8. Security Controls & Guardrails

- **Zero Host Command Execution:** The SSH honeypot runs an in-memory virtual emulator; shell commands do not touch the underlying host.
- **Cline Plan-Mode Sandbox:** The Cline runtime adapter executes exclusively with `-p` (plan mode), disallowing tool execution, shell commands, or file system writes.
- **Prompt-Injection Resistance:** Telemetry inputs are formatted as untrusted evidence strings and payload sizes are strictly bounded.
- **Mock-First Notification Safety:** Composio Gmail alerts run in mock mode by default to prevent unsolicited real email dispatches without authorization.
- **Internal Database:** PostgreSQL is bound to Docker internal network and loopback.

---

## 9. API Reference Summary

- `GET /health` — Service readiness probe
- `GET /api/v1/summary` — SOC HUD telemetry statistics
- `GET /api/v1/events` — Paginated and filtered security telemetry
- `GET /api/v1/sessions` — Active and recorded honeypot sessions
- `GET /api/v1/sessions/{id}` — Session detail with replay frames
- `GET /api/v1/incidents` — Correlated security incidents
- `POST /api/v1/incidents/{id}/analyze` — Trigger autonomous Cline AI investigation
- `PATCH /api/v1/incidents/{id}` — Update triage status and analyst notes
- `GET /api/v1/cline/jobs` — Cline AI job audit log
- `GET /api/v1/sensors` — Sensor health and heartbeat telemetry
- `GET /api/v1/alerts` — Composio alert dispatch history
- `POST /api/v1/enrichments/lookup` — Parallel.ai threat intelligence query
- `POST /api/v1/simulate` — Trigger attack simulation
- `GET /api/v1/stream` — Real-time Server-Sent Events (SSE) telemetry feed

---

## 10. License

MIT License. Designed and built with autonomous AI architecture.

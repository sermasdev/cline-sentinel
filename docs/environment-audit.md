# Environment Audit — HERMES SENTINEL

Audit Date: 2026-10-20
Auditor: Hermes Agent (Lead Autonomous Engineering Agent)

## 1. Host & Hardware Architecture
- OS: Linux 7.2.9-orbstack-00391-g2b298d05fbd4 #1 SMP PREEMPT aarch64 (Lubuntu in OrbStack VM)
- Hostname: Cybersecurity2
- Architecture: aarch64 (Apple Silicon arm64 under OrbStack)
- CPUs: 18 vCPUs
- Memory: 15 GiB Total RAM, 3.9 GiB Used, 11 GiB Available, 16 GiB Swap
- Disk Storage: 1.2 TB root filesystem, 172 GB used, 978 GB available (15% utilization)

## 2. Network & Interfaces
- Primary Interface (eth0): inet 192.168.139.200/24
- Loopback (lo): inet 127.0.0.1/8
- OrbStack Local DNS: `cybersecurity2.orb.local`
- External Public/WAN IP: `148.64.100.237`
- Listening Ports Audited:
  - 2222: Available (Cowrie SSH decoy target)
  - 8088: Available (Web/API/MCP decoy target)
  - 8000: Available (FastAPI backend)
  - 3000: Available (React Dashboard)
  - 5432: Available (PostgreSQL)

## 3. Container Runtime
- Docker Engine: 29.8.2 Community (linux/arm64)
- Docker Compose: v5.5.0
- Docker Context: `orbstack` (unix:///Users/admin/.orbstack/run/docker.sock)
- Existing Containers: None active (clean slate)

## 4. Runtime AI Agent: Cline
- Cline CLI Version: 3.0.73
- Core Version: 0.0.95
- Path: `/home/admin/.local/bin/cline` -> `/home/admin/.npm-global/bin/cline`
- Capabilities Verified:
  - Supports non-interactive plan mode (`cline -p --timeout <sec> "<prompt>"`)
  - Supports JSON output format
  - Authenticated with OpenRouter provider
  - Model: Default OpenRouter (`google/gemini-3.8-flash`)
  - Sandbox verification: In plan mode (`-p`), tool execution and file modifications are disabled. Attacker prompts cannot execute shell commands or arbitrary host manipulations.
  - Verified test invocation: `cline -p -P openrouter -m google/gemini-3.8-flash --timeout 45 "..."` executed and returned clean structured JSON.

## 5. Integrations
- Composio:
  - CLI: `/home/admin/.local/bin/composio`
  - Account: `[REDACTED_ACCOUNT]`
  - Policy: Real email delivery disabled by default; mock provider active until explicit user approval.
- Parallel.ai:
  - CLI: `/home/admin/.local/bin/parallel-cli`
  - API Key: Unconfigured (`PARALLEL_API_KEY` not present in environment).
  - Policy: Mock enrichment provider active with realistic CVE/threat intelligence offline database.

## 6. Development Tools
- Python: 3.14.7 / 3.12 available
- Node.js: v22.22.1
- npm: available
- curl, git, ss, pgrep: verified

# AGENTS.md — HERMES SENTINEL

## Role Separation Directives

1. **Hermes Agent**:
   - Acted as the lead software engineer during development.
   - Built the codebase, configured Docker services, developed the React dashboard, ran verification tests.
   - Does NOT exist in the runtime dependency graph.

2. **Cline**:
   - Designated autonomous runtime AI agent.
   - Operates strictly in unattended plan mode (`-p`) via OpenRouter (`google/gemini-3.8-flash`).
   - Analyzes incident telemetry without tool execution permissions to prevent prompt-injection escalation.

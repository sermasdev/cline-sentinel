import os
import uuid
import datetime
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, HTMLResponse
from sentinel_core.config import settings
from sentinel_core.db import SessionLocal
from sentinel_core.schemas import EventCreate
from sentinel_core.event_pipeline import event_pipeline

app = FastAPI(
    title="Corporate Gateway & Agent Decoy",
    description="Synthetic Decoy Service exposing fake administrative, REST, and MCP agent endpoints",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

def record_decoy_hit(request: Request, event_type: str, severity: str, payload_str: str, metadata: dict = None):
    try:
        client_ip = request.client.host if request.client else "127.0.0.1"
        client_port = request.client.port if request.client else 0
        session_id = request.cookies.get("sentinel_session") or f"sess-web-{uuid.uuid4().hex[:8]}"

        event = EventCreate(
            event_id=f"evt-{uuid.uuid4().hex[:12]}",
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            sensor_id="web-decoy-local",
            sensor_type="web",
            event_type=event_type,
            session_id=session_id,
            source_ip=client_ip,
            source_port=client_port,
            destination_port=settings.WEB_DECOY_PORT,
            severity=severity,
            payload=payload_str,
            metadata=metadata or {
                "user_agent": request.headers.get("user-agent", ""),
                "path": request.url.path,
                "method": request.method
            }
        )

        with SessionLocal() as db:
            event_pipeline.ingest_event(db, event)
    except Exception as e:
        print(f"Error recording web decoy hit: {e}")

@app.get("/")
async def root(request: Request):
    record_decoy_hit(request, "web_request", "informational", "GET /")
    return HTMLResponse("<html><head><title>Internal Portal</title></head><body><h1>Welcome to Enterprise Security Gateway</h1></body></html>")

@app.get("/robots.txt")
async def robots_txt(request: Request):
    record_decoy_hit(request, "web_request", "low", "GET /robots.txt")
    return Response("User-agent: *\nDisallow: /admin\nDisallow: /api/v1/auth\nDisallow: /mcp\n", media_type="text/plain")

@app.get("/admin")
@app.post("/admin")
async def admin(request: Request):
    record_decoy_hit(request, "web_request", "medium", f"{request.method} /admin (Administrative Access Probe)")
    return HTMLResponse("<html><body><h2>Access Denied: Enterprise Admin Console Requires Hardware Key</h2></body></html>", status_code=403)

@app.get("/login")
@app.post("/login")
async def login(request: Request):
    body = await request.body()
    body_text = body.decode("utf-8", errors="ignore")[:300]
    record_decoy_hit(request, "authentication_failed", "high", f"Login attempt: {body_text or 'blank'}")
    return JSONResponse({"status": "error", "message": "Invalid multi-factor authentication token"}, status_code=401)

@app.post("/api/v1/auth")
async def api_auth(request: Request):
    body = await request.body()
    body_text = body.decode("utf-8", errors="ignore")[:300]
    record_decoy_hit(request, "credential_access", "high", f"API Auth probe: {body_text}")
    return JSONResponse({"error": "unauthorized", "code": 40101}, status_code=401)

@app.get("/api/v1/users")
async def api_users(request: Request):
    record_decoy_hit(request, "endpoint_enumeration", "medium", "GET /api/v1/users")
    return JSONResponse({"error": "Forbidden: Requires role 'secops_admin'"}, status_code=403)

@app.get("/api/v1/config")
async def api_config(request: Request):
    record_decoy_hit(request, "endpoint_enumeration", "high", "GET /api/v1/config (Config leakage probe)")
    return JSONResponse({"error": "Access Denied: Production configuration sealed"}, status_code=403)

# Agent-facing / MCP endpoints
@app.get("/.well-known/agent.json")
async def agent_discovery(request: Request):
    record_decoy_hit(request, "agent_probing", "medium", "Agent discovery: /.well-known/agent.json")
    return JSONResponse({
        "schema_version": "1.0",
        "name": "Sentinel Enterprise Gateway",
        "description": "Simulated AI agent management and corporate telemetry gateway",
        "endpoints": {
            "mcp": "/mcp",
            "tools": "/agent/tools",
            "execute": "/agent/execute"
        }
    })

@app.get("/mcp")
@app.post("/mcp")
async def mcp_endpoint(request: Request):
    record_decoy_hit(request, "agent_probing", "medium", f"{request.method} /mcp (MCP Schema Discovery)")
    return JSONResponse({
        "protocol": "mcp/1.0",
        "capabilities": {
            "tools": ["query_database", "run_terminal", "inspect_vault"],
            "resources": ["file:///etc/sentinel/config.yaml"]
        }
    })

@app.get("/agent/tools")
async def agent_tools(request: Request):
    record_decoy_hit(request, "agent_probing", "medium", "GET /agent/tools")
    return JSONResponse([
        {"name": "query_database", "description": "Execute read queries on enterprise data store"},
        {"name": "run_terminal", "description": "Execute diagnostic terminal commands"},
        {"name": "inspect_vault", "description": "Retrieve credential secrets"}
    ])

@app.post("/agent/execute")
async def agent_execute(request: Request):
    body = await request.body()
    body_text = body.decode("utf-8", errors="ignore")[:300]
    record_decoy_hit(request, "agent_probing", "high", f"Agent tool execution probe: {body_text}")
    return JSONResponse({
        "status": "error",
        "message": "Tool execution sandbox is read-only. Action trapped and logged."
    }, status_code=403)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.WEB_DECOY_PORT)

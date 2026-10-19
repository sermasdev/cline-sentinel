from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field

class EventBase(BaseModel):
    timestamp: Optional[datetime] = None
    sensor_id: str
    sensor_type: str  # ssh, web, api_agent
    event_type: str  # authentication_failed, command_executed, etc.
    session_id: Optional[str] = None
    source_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    severity: str = "informational"
    payload: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class EventCreate(EventBase):
    event_id: Optional[str] = None

class EventRead(EventBase):
    event_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionReplayItem(BaseModel):
    t: float  # relative timestamp in seconds
    prompt: str
    command: str
    output: str

class SessionRead(BaseModel):
    id: str
    sensor_id: str
    source_ip: str
    source_port: Optional[int] = None
    destination_port: Optional[int] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: float
    event_count: int
    auth_attempts: int
    commands: List[Dict[str, Any]] = []
    replay_data: List[Dict[str, Any]] = []
    risk_score: float
    metadata: Dict[str, Any] = Field(default_factory=dict, alias="metadata_")

    class Config:
        from_attributes = True
        populate_by_name = True

class IncidentRead(BaseModel):
    id: str
    title: str
    description: str
    classification: str
    severity: str
    status: str
    attack_risk: float
    automation_likelihood: float
    ai_agent_likelihood: Optional[float] = None
    source_ip: str
    sensor_id: str
    first_seen: datetime
    last_seen: datetime
    event_count: int
    requires_human_approval: bool
    analyst_notes: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentUpdate(BaseModel):
    status: Optional[str] = None  # open, investigating, resolved, dismissed
    analyst_notes: Optional[str] = None

class ClineInvestigationResponse(BaseModel):
    incident_id: str
    classification: str
    severity: str
    attack_risk: float
    automation_likelihood: float
    ai_agent_likelihood: Optional[float] = None
    summary: str
    reasoning: Optional[str] = None
    evidence_event_ids: List[str] = []
    alternative_explanations: List[str] = []
    recommended_actions: List[str] = []
    requires_human_approval: bool = False

class ClineJobRead(BaseModel):
    id: str
    incident_id: str
    status: str
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    cost_estimate: float
    execution_time_seconds: float
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[ClineInvestigationResponse] = None

    class Config:
        from_attributes = True

class SensorRead(BaseModel):
    id: str
    name: str
    sensor_type: str
    port: int
    status: str
    event_count: int
    last_heartbeat: datetime
    config_json: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class AlertRead(BaseModel):
    id: str
    incident_id: Optional[str] = None
    severity: str
    channel: str
    recipient: str
    subject: str
    body: str
    status: str
    retry_count: int
    last_error: Optional[str] = None
    created_at: datetime
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EnrichmentRead(BaseModel):
    id: str
    indicator: str
    indicator_type: str
    provider: str
    summary: str
    details: Dict[str, Any] = {}
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True

class SystemHealthRead(BaseModel):
    id: str
    service_name: str
    status: str
    cpu_percent: float
    memory_mb: float
    queue_depth: int
    details: Dict[str, Any] = {}
    updated_at: datetime

    class Config:
        from_attributes = True

class SummaryStats(BaseModel):
    events_24h: int
    active_sessions: int
    total_incidents: int
    critical_incidents: int
    auth_attempts: int
    distinct_source_ips: int
    sensor_count: int
    cline_queue_depth: int
    alert_status: str
    ingestion_rate_eps: float
    sensors: List[SensorRead] = []

class SimulateRequest(BaseModel):
    attack_type: str  # "ssh_bruteforce", "web_admin_probe", "mcp_agent_probe", "credential_stuffing", "command_injection"
    source_ip: Optional[str] = None
    iterations: int = 3

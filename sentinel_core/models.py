import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Table
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

incident_events_table = Table(
    "incident_events",
    Base.metadata,
    Column("incident_id", String(64), ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True),
    Column("event_id", String(64), ForeignKey("events.event_id", ondelete="CASCADE"), primary_key=True),
)

class Sensor(Base):
    __tablename__ = "sensors"
    
    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    sensor_type = Column(String(64), nullable=False)  # ssh, web, api_agent
    port = Column(Integer, nullable=False)
    status = Column(String(32), default="active")  # active, degraded, inactive
    event_count = Column(Integer, default=0)
    last_heartbeat = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))
    config_json = Column(JSON, default=dict)
    
    events = relationship("EventModel", back_populates="sensor", cascade="all, delete-orphan")
    sessions = relationship("SessionModel", back_populates="sensor", cascade="all, delete-orphan")

class SessionModel(Base):
    __tablename__ = "sessions"
    
    id = Column(String(64), primary_key=True)
    sensor_id = Column(String(64), ForeignKey("sensors.id"), nullable=False)
    source_ip = Column(String(64), nullable=False, index=True)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    start_time = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc), index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Float, default=0.0)
    event_count = Column(Integer, default=0)
    auth_attempts = Column(Integer, default=0)
    commands = Column(JSON, default=list)  # list of executed commands
    replay_data = Column(JSON, default=list)  # list of {t, prompt, command, output} for terminal player
    risk_score = Column(Float, default=0.0)
    metadata_ = Column("metadata", JSON, default=dict)
    
    sensor = relationship("Sensor", back_populates="sessions")
    events = relationship("EventModel", back_populates="session")

class EventModel(Base):
    __tablename__ = "events"
    
    event_id = Column(String(64), primary_key=True)
    timestamp = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc), index=True)
    sensor_id = Column(String(64), ForeignKey("sensors.id"), nullable=False, index=True)
    sensor_type = Column(String(64), nullable=False)
    event_type = Column(String(64), nullable=False, index=True)
    session_id = Column(String(64), ForeignKey("sessions.id"), nullable=True, index=True)
    source_ip = Column(String(64), nullable=False, index=True)
    source_port = Column(Integer, nullable=True)
    destination_port = Column(Integer, nullable=True)
    severity = Column(String(32), default="informational", index=True)
    payload = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
    
    sensor = relationship("Sensor", back_populates="events")
    session = relationship("SessionModel", back_populates="events")
    incidents = relationship("IncidentModel", secondary=incident_events_table, back_populates="events")

class IncidentModel(Base):
    __tablename__ = "incidents"
    
    id = Column(String(64), primary_key=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    classification = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), nullable=False, index=True)  # low, medium, high, critical
    status = Column(String(32), default="open", index=True)  # open, investigating, resolved, dismissed
    attack_risk = Column(Float, default=0.0)
    automation_likelihood = Column(Float, default=0.0)
    ai_agent_likelihood = Column(Float, nullable=True)  # null represents unknown
    source_ip = Column(String(64), nullable=False, index=True)
    sensor_id = Column(String(64), nullable=False)
    first_seen = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))
    last_seen = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))
    event_count = Column(Integer, default=1)
    requires_human_approval = Column(Boolean, default=False)
    analyst_notes = Column(Text, nullable=True)
    
    events = relationship("EventModel", secondary=incident_events_table, back_populates="incidents")
    cline_jobs = relationship("ClineJob", back_populates="incident", cascade="all, delete-orphan")
    cline_results = relationship("ClineAnalysisResult", back_populates="incident", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="incident", cascade="all, delete-orphan")

class ClineJob(Base):
    __tablename__ = "cline_jobs"
    
    id = Column(String(64), primary_key=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False, index=True)
    status = Column(String(32), default="queued", index=True)  # queued, running, completed, failed, blocked
    provider = Column(String(64), default="openrouter")
    model = Column(String(128), default="google/gemini-3.8-flash")
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    cost_estimate = Column(Float, default=0.0)
    execution_time_seconds = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    incident = relationship("IncidentModel", back_populates="cline_jobs")
    result = relationship("ClineAnalysisResult", back_populates="job", uselist=False, cascade="all, delete-orphan")

class ClineAnalysisResult(Base):
    __tablename__ = "cline_analysis_results"
    
    id = Column(String(64), primary_key=True)
    job_id = Column(String(64), ForeignKey("cline_jobs.id"), nullable=False, unique=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False, index=True)
    classification = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False)
    attack_risk = Column(Float, nullable=False)
    automation_likelihood = Column(Float, nullable=False)
    ai_agent_likelihood = Column(Float, nullable=True)
    summary = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True)
    evidence_event_ids = Column(JSON, default=list)
    alternative_explanations = Column(JSON, default=list)
    recommended_actions = Column(JSON, default=list)
    requires_human_approval = Column(Boolean, default=False)
    raw_output = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))
    
    job = relationship("ClineJob", back_populates="result")
    incident = relationship("IncidentModel", back_populates="cline_results")

class Enrichment(Base):
    __tablename__ = "enrichments"
    
    id = Column(String(64), primary_key=True)
    indicator = Column(String(128), nullable=False, index=True)
    indicator_type = Column(String(32), nullable=False)  # ip, cve, technique, user_agent
    provider = Column(String(64), default="parallel_ai")
    summary = Column(Text, nullable=False)
    details = Column(JSON, default=dict)
    confidence = Column(Float, default=0.85)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String(64), primary_key=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=True, index=True)
    severity = Column(String(32), nullable=False)
    channel = Column(String(32), default="gmail")
    recipient = Column(String(128), nullable=False)
    subject = Column(String(256), nullable=False)
    body = Column(Text, nullable=False)
    status = Column(String(32), default="mock_delivered", index=True)  # pending, sent, failed, mock_delivered, suppressed
    retry_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    
    incident = relationship("IncidentModel", back_populates="alerts")

class SystemHealth(Base):
    __tablename__ = "system_health"
    
    id = Column(String(64), primary_key=True)
    service_name = Column(String(64), nullable=False, unique=True)
    status = Column(String(32), default="healthy")  # healthy, degraded, down
    cpu_percent = Column(Float, default=0.0)
    memory_mb = Column(Float, default=0.0)
    queue_depth = Column(Integer, default=0)
    details = Column(JSON, default=dict)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(64), primary_key=True)
    action = Column(String(64), nullable=False)
    actor = Column(String(64), nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))

class Setting(Base):
    __tablename__ = "settings"
    
    key = Column(String(64), primary_key=True)
    value = Column(JSON, default=dict)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))

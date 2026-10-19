import uuid
import datetime
import asyncio
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sentinel_core.models import (
    Sensor, SessionModel, EventModel, IncidentModel, Alert, SystemHealth, AuditLog
)
from sentinel_core.schemas import EventCreate
from sentinel_core.detection_rules import DetectionEngine

class EventPipeline:
    def __init__(self):
        self._subscribers: List[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self._subscribers:
            self._subscribers.remove(q)

    async def broadcast(self, message: Dict[str, Any]):
        for q in list(self._subscribers):
            try:
                await q.put(message)
            except Exception:
                pass

    def ingest_event(self, db: Session, event_in: EventCreate) -> Dict[str, Any]:
        """
        Processes, validates, normalizes, persists event, updates session and sensor,
        evaluates detection rules, and returns event + incident metadata.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        event_id = event_in.event_id or f"evt-{uuid.uuid4().hex[:12]}"
        timestamp = event_in.timestamp or now

        # 1. Ensure Sensor exists and update stats
        sensor = db.query(Sensor).filter(Sensor.id == event_in.sensor_id).first()
        if not sensor:
            sensor = Sensor(
                id=event_in.sensor_id,
                name=f"Sensor {event_in.sensor_id}",
                sensor_type=event_in.sensor_type,
                port=event_in.destination_port or 8088,
                status="active",
                event_count=1,
                last_heartbeat=now,
                config_json={}
            )
            db.add(sensor)
        else:
            sensor.event_count = (sensor.event_count or 0) + 1
            sensor.last_heartbeat = now
            sensor.status = "active"

        # 2. Session Management
        session_obj = None
        if event_in.session_id:
            session_obj = db.query(SessionModel).filter(SessionModel.id == event_in.session_id).first()
            if not session_obj:
                session_obj = SessionModel(
                    id=event_in.session_id,
                    sensor_id=event_in.sensor_id,
                    source_ip=event_in.source_ip,
                    source_port=event_in.source_port,
                    destination_port=event_in.destination_port,
                    start_time=timestamp,
                    end_time=timestamp,
                    duration_seconds=0.0,
                    event_count=1,
                    auth_attempts=1 if "auth" in event_in.event_type else 0,
                    commands=[],
                    replay_data=[],
                    risk_score=0.1,
                    metadata_={}
                )
                db.add(session_obj)
            else:
                session_obj.event_count += 1
                session_obj.end_time = timestamp
                delta = (timestamp - session_obj.start_time).total_seconds()
                session_obj.duration_seconds = max(0.0, delta)
                if "auth" in event_in.event_type:
                    session_obj.auth_attempts += 1

            # If command was executed or web request, record replay frame
            if event_in.event_type == "command_executed" and event_in.payload:
                cmds = list(session_obj.commands or [])
                cmds.append({
                    "timestamp": timestamp.isoformat(),
                    "command": event_in.payload,
                    "metadata": event_in.metadata
                })
                session_obj.commands = cmds
                
                replay = list(session_obj.replay_data or [])
                elapsed = max(0.0, (timestamp - session_obj.start_time).total_seconds())
                replay.append({
                    "t": round(elapsed, 2),
                    "prompt": f"root@sentinel-decoy:~# ",
                    "command": event_in.payload,
                    "output": event_in.metadata.get("output", "")
                })
                session_obj.replay_data = replay
                session_obj.risk_score = min(1.0, session_obj.risk_score + 0.3)

        # 3. Create Event Model
        event_model = EventModel(
            event_id=event_id,
            timestamp=timestamp,
            sensor_id=event_in.sensor_id,
            sensor_type=event_in.sensor_type,
            event_type=event_in.event_type,
            session_id=event_in.session_id,
            source_ip=event_in.source_ip,
            source_port=event_in.source_port,
            destination_port=event_in.destination_port,
            severity=event_in.severity,
            payload=event_in.payload,
            metadata_=event_in.metadata
        )
        db.add(event_model)

        # 4. Check Recent Events for Correlation
        window_start = now - datetime.timedelta(minutes=10)
        recent = db.query(EventModel).filter(
            EventModel.source_ip == event_in.source_ip,
            EventModel.timestamp >= window_start
        ).order_by(EventModel.timestamp.desc()).limit(20).all()

        recent_dicts = [
            {
                "event_id": r.event_id,
                "event_type": r.event_type,
                "sensor_type": r.sensor_type,
                "source_ip": r.source_ip,
                "payload": r.payload,
                "metadata": r.metadata_
            }
            for r in recent
        ]

        # 5. Evaluate Detection Engine
        event_dict = {
            "event_id": event_id,
            "sensor_type": event_in.sensor_type,
            "event_type": event_in.event_type,
            "source_ip": event_in.source_ip,
            "payload": event_in.payload,
            "metadata": event_in.metadata
        }
        inc_spec = DetectionEngine.evaluate_event(event_dict, recent_dicts)
        incident_created = None

        if inc_spec:
            # Check for existing open incident for this source_ip and classification within 30 mins
            cutoff = now - datetime.timedelta(minutes=30)
            existing_inc = db.query(IncidentModel).filter(
                IncidentModel.source_ip == event_in.source_ip,
                IncidentModel.classification == inc_spec["classification"],
                IncidentModel.status.in_(["open", "investigating"]),
                IncidentModel.last_seen >= cutoff
            ).first()

            if existing_inc:
                existing_inc.last_seen = now
                existing_inc.event_count += 1
                if event_model not in existing_inc.events:
                    existing_inc.events.append(event_model)
                incident_created = existing_inc
            else:
                inc_id = f"inc-{uuid.uuid4().hex[:8]}"
                new_inc = IncidentModel(
                    id=inc_id,
                    title=inc_spec["title"],
                    description=inc_spec["description"],
                    classification=inc_spec["classification"],
                    severity=inc_spec["severity"],
                    status="open",
                    attack_risk=inc_spec["attack_risk"],
                    automation_likelihood=inc_spec["automation_likelihood"],
                    ai_agent_likelihood=inc_spec.get("ai_agent_likelihood"),
                    source_ip=event_in.source_ip,
                    sensor_id=event_in.sensor_id,
                    first_seen=now,
                    last_seen=now,
                    event_count=1,
                    requires_human_approval=inc_spec.get("requires_human_approval", False),
                    analyst_notes=None
                )
                new_inc.events.append(event_model)
                db.add(new_inc)
                incident_created = new_inc

                # Generate Alert entry for High / Critical incidents
                if inc_spec["severity"] in ["high", "critical"]:
                    alert = Alert(
                        id=f"alt-{uuid.uuid4().hex[:8]}",
                        incident_id=inc_id,
                        severity=inc_spec["severity"],
                        channel="gmail",
                        recipient=settings.ALERT_EMAIL_RECIPIENT,
                        subject=f"[HERMES SENTINEL {inc_spec['severity'].upper()}] {inc_spec['title']}",
                        body=f"Security alert triggered: {inc_spec['description']}\nSource IP: {event_in.source_ip}\nSensor: {event_in.sensor_id}",
                        status="mock_delivered",
                        created_at=now,
                        delivered_at=now
                    )
                    db.add(alert)

        db.commit()

        # Update event severity if upgraded by detection
        if inc_spec and inc_spec.get("severity"):
            event_model.severity = inc_spec["severity"]
            db.commit()

        result = {
            "event_id": event_id,
            "timestamp": timestamp.isoformat(),
            "sensor_id": event_in.sensor_id,
            "sensor_type": event_in.sensor_type,
            "event_type": event_in.event_type,
            "session_id": event_in.session_id,
            "source_ip": event_in.source_ip,
            "severity": event_model.severity,
            "payload": event_in.payload,
            "incident_id": incident_created.id if incident_created else None
        }

        return result

event_pipeline = EventPipeline()

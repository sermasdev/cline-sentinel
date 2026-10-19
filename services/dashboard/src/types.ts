export interface Sensor {
  id: string;
  name: string;
  sensor_type: string;
  port: number;
  status: string;
  event_count: number;
  last_heartbeat: string;
  config_json?: Record<string, any>;
}

export interface SecurityEvent {
  event_id: string;
  timestamp: string;
  sensor_id: string;
  sensor_type: string;
  event_type: string;
  session_id?: string;
  source_ip: string;
  source_port?: number;
  destination_port?: number;
  severity: 'informational' | 'low' | 'medium' | 'high' | 'critical';
  payload?: string;
  metadata?: Record<string, any>;
}

export interface SessionItem {
  id: string;
  sensor_id: string;
  source_ip: string;
  source_port?: number;
  destination_port?: number;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  event_count: number;
  auth_attempts: number;
  commands_count: number;
  risk_score: number;
  commands: Array<{ timestamp?: string; command: string; metadata?: any }>;
  replay_data?: Array<{ t: number; prompt: string; command: string; output: string }>;
  metadata?: Record<string, any>;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  classification: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  attack_risk: number;
  automation_likelihood: number;
  ai_agent_likelihood?: number | null;
  source_ip: string;
  sensor_id: string;
  first_seen: string;
  last_seen: string;
  event_count: number;
  requires_human_approval: boolean;
  analyst_notes?: string;
  has_cline_analysis?: boolean;
}

export interface ClineInvestigation {
  classification: string;
  severity: string;
  attack_risk: number;
  automation_likelihood: number;
  ai_agent_likelihood?: number | null;
  summary: string;
  reasoning?: string;
  evidence_event_ids: string[];
  alternative_explanations: string[];
  recommended_actions: string[];
  requires_human_approval: boolean;
  created_at: string;
}

export interface ClineJob {
  id: string;
  incident_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'blocked';
  provider: string;
  model: string;
  execution_time_seconds: number;
  created_at: string;
  has_result: boolean;
}

export interface ThreatEnrichment {
  id: string;
  indicator: string;
  indicator_type: string;
  provider: string;
  summary: string;
  details: Record<string, any>;
  confidence: number;
  created_at: string;
}

export interface SecurityAlert {
  id: string;
  incident_id?: string;
  severity: string;
  channel: string;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  retry_count: number;
  created_at: string;
  delivered_at?: string;
}

export interface SummaryStats {
  events_24h: number;
  active_sessions: number;
  total_incidents: number;
  critical_incidents: number;
  auth_attempts: number;
  distinct_source_ips: number;
  sensor_count: number;
  cline_queue_depth: number;
  alert_status: string;
  ingestion_rate_eps: number;
  sensors: Sensor[];
}

export interface SystemHealthData {
  overall_status: string;
  cpu_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  memory_percent: number;
  disk_percent: number;
  services: Array<{ name: string; status: string; description: string }>;
}

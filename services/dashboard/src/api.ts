import {
  SummaryStats, SecurityEvent, Incident, SessionItem,
  ClineJob, ThreatEnrichment, SecurityAlert, SystemHealthData
} from './types';

const API_BASE = '/api/v1';

export async function fetchSummary(): Promise<SummaryStats> {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.json();
}

export async function fetchEvents(params: Record<string, any> = {}): Promise<{ total: number; items: SecurityEvent[] }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  const res = await fetch(`${API_BASE}/events?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventDetail(eventId: string): Promise<SecurityEvent> {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  if (!res.ok) throw new Error('Failed to fetch event detail');
  return res.json();
}

export async function analyzeEvent(eventId: string): Promise<{
  event_id: string;
  attack_title: string;
  classification: string;
  mitre_technique: string;
  attack_risk: number;
  automation_likelihood: number;
  what_it_is_about: string;
  what_it_tries_to_do: string;
  how_to_fix_it: string[];
  remediation_command: string;
}> {
  const res = await fetch(`${API_BASE}/events/${eventId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to run Cline Agent Analysis on event');
  return res.json();
}

export async function fetchIncidents(params: Record<string, any> = {}): Promise<{ total: number; items: Incident[] }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentDetail(incidentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  if (!res.ok) throw new Error('Failed to fetch incident detail');
  return res.json();
}

export async function updateIncidentStatus(incidentId: string, status?: string, notes?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, analyst_notes: notes }),
  });
  if (!res.ok) throw new Error('Failed to update incident');
  return res.json();
}

export async function triggerClineAnalysis(incidentId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/analyze`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to trigger Cline analysis');
  return res.json();
}

export async function fetchSessions(params: Record<string, any> = {}): Promise<{ total: number; items: SessionItem[] }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
  });
  const res = await fetch(`${API_BASE}/sessions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionItem> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session detail');
  return res.json();
}

export async function fetchClineJobs(): Promise<ClineJob[]> {
  const res = await fetch(`${API_BASE}/cline/jobs`);
  if (!res.ok) throw new Error('Failed to fetch Cline jobs');
  return res.json();
}

export async function fetchEnrichments(): Promise<ThreatEnrichment[]> {
  const res = await fetch(`${API_BASE}/enrichments`);
  if (!res.ok) throw new Error('Failed to fetch enrichments');
  return res.json();
}

export async function lookupEnrichment(indicator: string, type: string = 'technique'): Promise<any> {
  const res = await fetch(`${API_BASE}/enrichments/lookup?indicator=${encodeURIComponent(indicator)}&indicator_type=${encodeURIComponent(type)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to lookup threat intelligence');
  return res.json();
}

export async function fetchAlerts(): Promise<SecurityAlert[]> {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function triggerTestAlert(): Promise<any> {
  const res = await fetch(`${API_BASE}/alerts/test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger test alert');
  return res.json();
}

export async function fetchSystemHealth(): Promise<SystemHealthData> {
  const res = await fetch(`${API_BASE}/system/health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchSettings(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function saveSettings(settings: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export async function simulateAttack(attackType: string, iterations: number = 3): Promise<any> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attack_type: attackType, iterations }),
  });
  if (!res.ok) throw new Error('Failed to simulate attack');
  return res.json();
}

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Activity, Users, Terminal, Database,
  Cpu, Mail, Server, Settings as SettingsIcon, Play,
  Bot, Radio, Bell, RefreshCw
} from 'lucide-react';

import {
  SummaryStats, SecurityEvent, Incident, SessionItem,
  ClineJob, ThreatEnrichment, SecurityAlert, SystemHealthData
} from './types';

import {
  fetchSummary, fetchEvents, fetchIncidents, fetchSessions,
  fetchClineJobs, fetchEnrichments, fetchAlerts, fetchSystemHealth
} from './api';

import { OverviewView } from './views/OverviewView';
import { LiveActivityView } from './views/LiveActivityView';
import { IncidentsView } from './views/IncidentsView';
import { SessionsView } from './views/SessionsView';
import { ClineInvestigationsView } from './views/ClineInvestigationsView';
import { ThreatIntelView } from './views/ThreatIntelView';
import { HoneypotsView } from './views/HoneypotsView';
import { AlertsView } from './views/AlertsView';
import { SystemHealthView } from './views/SystemHealthView';
import { SettingsView } from './views/SettingsView';

import { EventInspectorModal } from './components/EventInspectorModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { TerminalReplayModal } from './components/TerminalReplayModal';
import { SimulatorModal } from './components/SimulatorModal';

type NavView =
  | 'overview'
  | 'live_activity'
  | 'incidents'
  | 'sessions'
  | 'cline_ai'
  | 'threat_intel'
  | 'honeypots'
  | 'alerts'
  | 'health'
  | 'settings';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<NavView>('overview');

  // Application Data State
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [clineJobs, setClineJobs] = useState<ClineJob[]>([]);
  const [enrichments, setEnrichments] = useState<ThreatEnrichment[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [health, setHealth] = useState<SystemHealthData | null>(null);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(true);

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Load Initial Data
  const loadData = async () => {
    try {
      const [s, ev, inc, sess, cJobs, enr, alt, h] = await Promise.all([
        fetchSummary().catch(() => null),
        fetchEvents({ limit: 100 }).catch(() => ({ total: 0, items: [] })),
        fetchIncidents().catch(() => ({ total: 0, items: [] })),
        fetchSessions().catch(() => ({ total: 0, items: [] })),
        fetchClineJobs().catch(() => []),
        fetchEnrichments().catch(() => []),
        fetchAlerts().catch(() => []),
        fetchSystemHealth().catch(() => null),
      ]);
      if (s) setStats(s);
      if (ev) setEvents(ev.items);
      if (inc) setIncidents(inc.items);
      if (sess) setSessions(sess.items);
      if (cJobs) setClineJobs(cJobs);
      if (enr) setEnrichments(enr);
      if (alt) setAlerts(alt);
      if (h) setHealth(h);
    } catch (e) {
      console.error('Data load error:', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // SSE Live Stream Listener
  useEffect(() => {
    if (!isStreaming) return;
    const es = new EventSource('/api/v1/stream');
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.telemetry && payload.telemetry.event_id !== 'init') {
          setEvents((prev) => {
            if (prev.some((e) => e.event_id === payload.telemetry.event_id)) return prev;
            return [payload.telemetry, ...prev].slice(0, 150);
          });
        }
      } catch (e) {
        // Ignore parse heartbeats
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, [isStreaming]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Radio },
    { id: 'live_activity', label: 'Live Activity', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: incidents.filter((i) => i.status === 'open').length },
    { id: 'sessions', label: 'Sessions & Replay', icon: Terminal },
    { id: 'cline_ai', label: 'Cline AI Center', icon: Bot },
    { id: 'threat_intel', label: 'Threat Intel', icon: Database },
    { id: 'honeypots', label: 'Decoys & Sensors', icon: Cpu },
    { id: 'alerts', label: 'Alerts (Gmail)', icon: Mail },
    { id: 'health', label: 'System Health', icon: Server },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#050811] bg-grid-cyber text-slate-100 flex flex-col font-sans">
      {/* Top Futuristic Cyber Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center font-cyber font-bold text-black text-lg shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              S
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-cyber text-lg font-bold tracking-wider text-white">
                CLINE <span className="text-cyan-400">SENTINEL</span>
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v2.0 CLINE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 -mt-0.5">
              AUTONOMOUS AI SECURITY HONEYPOT & THREAT INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 font-mono text-xs px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88]"></div>
            <span className="text-slate-300">GRID: SECURE</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">{new Date().toISOString().slice(11, 19)} UTC</span>
          </div>

          <button
            onClick={() => setSimulatorOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold rounded-lg transition shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Play className="w-3.5 h-3.5" />
            <span>ATTACK SIMULATOR</span>
          </button>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 bg-slate-950/70 border-r border-slate-800/80 p-3 flex flex-col justify-between hidden md:flex">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              MISSION CONTROL
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as NavView)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-xs transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold shadow-[0_0_15px_rgba(0,240,255,0.08)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {Boolean(item.badge) && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-400">
            <div className="flex items-center justify-between">
              <span>CLINE RUNTIME</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SSH DECOY (2222)</span>
              <span className="text-cyan-400 font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WEB DECOY (8088)</span>
              <span className="text-cyan-400 font-bold">ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeView === 'overview' && (
            <OverviewView
              stats={stats}
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
              onOpenSimulator={() => setSimulatorOpen(true)}
              onNavigate={(v) => setActiveView(v as NavView)}
            />
          )}

          {activeView === 'live_activity' && (
            <LiveActivityView
              events={events}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
              onSelectEvent={setSelectedEvent}
              onClearEvents={() => setEvents([])}
            />
          )}

          {activeView === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
            />
          )}

          {activeView === 'sessions' && (
            <SessionsView
              sessions={sessions}
              onSelectReplay={setSelectedSession}
            />
          )}

          {activeView === 'cline_ai' && (
            <ClineInvestigationsView
              jobs={clineJobs}
              incidents={incidents}
              onSelectIncident={setSelectedIncident}
            />
          )}

          {activeView === 'threat_intel' && (
            <ThreatIntelView
              enrichments={enrichments}
              onRefresh={loadData}
            />
          )}

          {activeView === 'honeypots' && (
            <HoneypotsView
              sensors={stats?.sensors || []}
            />
          )}

          {activeView === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onRefresh={loadData}
            />
          )}

          {activeView === 'health' && (
            <SystemHealthView
              health={health}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <EventInspectorModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onRefresh={loadData}
      />

      <TerminalReplayModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />

      <SimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        onTriggered={loadData}
      />
    </div>
  );
};

import React from 'react';
import {
  ShieldAlert, Activity, Users, Terminal, Database,
  Cpu, AlertTriangle, ArrowUpRight, Play, CheckCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { CyberRadar } from '../components/CyberRadar';
import { SummaryStats, Incident } from '../types';

interface OverviewProps {
  stats: SummaryStats | null;
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
  onOpenSimulator: () => void;
  onNavigate: (view: 'live_activity' | 'sessions' | 'incidents' | 'honeypots') => void;
}

export const OverviewView: React.FC<OverviewProps> = ({
  stats,
  incidents,
  onSelectIncident,
  onOpenSimulator,
  onNavigate,
}) => {
  // Chart demo data
  const velocityData = [
    { time: '12:00', eps: 2.1 },
    { time: '13:00', eps: 4.8 },
    { time: '14:00', eps: 3.2 },
    { time: '15:00', eps: 8.5 },
    { time: '16:00', eps: 6.1 },
    { time: '17:00', eps: 12.4 },
    { time: '18:00', eps: 9.8 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Alert Strip */}
      <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#00ff88] animate-ping"></div>
          <div>
            <h2 className="font-mono text-sm font-bold text-white tracking-wider uppercase">
              DEFENSE GRID ACTIVE // COLD-STANDBY SENSORS ENGAGED
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Cowrie SSH (Port 2222) and Web/MCP Decoy (Port 8088) actively trapping unauthorized probes.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSimulator}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs rounded-lg transition shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>LAUNCH ATTACK SIMULATOR</span>
        </button>
      </div>

      {/* Primary Metrics Grid - All 4 boxes clickable with expert hover/active effects */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        
        {/* 1. 24H TELEMETRY EVENTS -> Live Activity */}
        <div
          onClick={() => onNavigate('live_activity')}
          className="cyber-card p-4 rounded-xl border-l-4 border-l-cyan-400 cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col justify-between"
          title="Click to view real-time live telemetry stream"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase">24H TELEMETRY EVENTS</span>
              <Activity className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 group-hover:text-cyan-300 transition-colors">
              {stats?.events_24h ?? 0}
            </div>
            <div className="text-[10px] text-cyan-400/80 mt-1">
              <span>VELOCITY: {stats?.ingestion_rate_eps ?? 0} EPS</span>
            </div>
          </div>
          
          <div className="text-[10px] text-cyan-400 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between group-hover:text-cyan-300">
            <span>OPEN LIVE STREAM</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* 2. ACTIVE SESSIONS -> Sessions & Replay */}
        <div
          onClick={() => onNavigate('sessions')}
          className="cyber-card p-4 rounded-xl border-l-4 border-l-amber-400 cursor-pointer hover:border-amber-400 hover:shadow-[0_0_25px_rgba(255,170,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col justify-between"
          title="Click to view active sessions and interactive CRT terminal replay"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase">ACTIVE SESSIONS</span>
              <Users className="w-4 h-4 text-amber-400 group-hover:animate-bounce" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
              {stats?.active_sessions ?? 0}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1">
              <span>{stats?.auth_attempts ?? 0} AUTH ATTEMPTS</span>
            </div>
          </div>

          <div className="text-[10px] text-amber-400 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between group-hover:text-amber-300">
            <span>VIEW SESSIONS & REPLAY</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* 3. CORRELATED INCIDENTS -> Incidents Triage */}
        <div
          onClick={() => onNavigate('incidents')}
          className="cyber-card p-4 rounded-xl border-l-4 border-l-rose-500 cursor-pointer hover:border-rose-500 hover:shadow-[0_0_25px_rgba(255,0,85,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col justify-between"
          title="Click to view full security incidents triage matrix"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase">CORRELATED INCIDENTS</span>
              <ShieldAlert className="w-4 h-4 text-rose-500 group-hover:animate-bounce" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 group-hover:text-rose-400 transition-colors">
              {stats?.total_incidents ?? 0}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1">
              <span>{stats?.critical_incidents ?? 0} CRITICAL PROBES</span>
            </div>
          </div>

          <div className="text-[10px] text-rose-400 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between group-hover:text-rose-300">
            <span>OPEN INCIDENT TRIAGE</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* 4. HONEYPOT SENSORS -> Decoys & Sensors */}
        <div
          onClick={() => onNavigate('honeypots')}
          className="cyber-card p-4 rounded-xl border-l-4 border-l-emerald-400 cursor-pointer hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(0,255,136,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all group flex flex-col justify-between"
          title="Click to view sensor health and synthetic decoy catalog"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 uppercase">HONEYPOT SENSORS</span>
              <Cpu className="w-4 h-4 text-emerald-400 group-hover:animate-bounce" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors">
              {stats?.sensor_count ?? 3} / 3 ONLINE
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1">
              <span>CLINE QUEUE: {stats?.cline_queue_depth ?? 0}</span>
            </div>
          </div>

          <div className="text-[10px] text-emerald-400 mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between group-hover:text-emerald-300">
            <span>VIEW SENSOR CATALOG</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* Middle Section: Functional Radar + Ingestion Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Widget */}
        <div className="cyber-card p-5 rounded-xl flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
              REAL-TIME SENSOR RADAR
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              TARGETS: <strong className="text-white">{incidents.length}</strong>
            </span>
          </div>

          {/* Functional Radar with real clickable incidents */}
          <CyberRadar incidents={incidents} onSelectIncident={onSelectIncident} />

          <div className="w-full text-center mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            Click any colored radar dot to inspect incident with Cline AI
          </div>
        </div>

        {/* Telemetry Velocity Chart */}
        <div className="cyber-card p-5 rounded-xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                INGESTION TELEMETRY & ATTACK VELOCITY
              </span>
              <span className="text-[10px] font-mono text-slate-500">Events per second stream</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>LIVE FEED</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="epsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090e1d', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="eps" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#epsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Incidents Quick-Triage Feed */}
      <div className="cyber-card p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
            RECENT DETECTED INCIDENTS // AWAITING TRIAGE
          </span>
          <span className="text-xs font-mono text-cyan-400">{incidents.length} TOTAL INCIDENTS</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No active incidents detected. Use the Attack Simulator above to trigger test telemetry.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {incidents.slice(0, 5).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="py-3 px-2 flex items-center justify-between hover:bg-slate-800/40 rounded cursor-pointer transition group"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      inc.severity === 'critical'
                        ? 'bg-rose-500 shadow-[0_0_10px_#ff0055]'
                        : inc.severity === 'high'
                        ? 'bg-orange-500 shadow-[0_0_8px_#ff8800]'
                        : 'bg-amber-400'
                    }`}
                  ></span>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {inc.title}
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-0.5">
                      <span>IP: <strong className="text-emerald-400">{inc.source_ip}</strong></span>
                      <span>•</span>
                      <span>{inc.classification}</span>
                      <span>•</span>
                      <span>{inc.event_count} events</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                    {inc.status}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

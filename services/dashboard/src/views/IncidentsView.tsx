import React, { useState } from 'react';
import {
  ShieldAlert, Bot, ArrowUpRight, CheckCircle, Clock,
  AlertTriangle, Filter, Search
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [statusTab, setStatusTab] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [search, setSearch] = useState('');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesTab = statusTab === 'all' || inc.status === statusTab;
    const matchesSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.source_ip.includes(search) ||
      inc.classification.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'high':
        return 'bg-orange-950/80 text-orange-400 border-orange-800';
      case 'medium':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="cyber-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              CORRELATED SECURITY INCIDENTS // TRIAGE MATRIX
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic correlation across SSH and Web sensor decoys with automated Cline AI investigation
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
          {(['all', 'open', 'investigating', 'resolved', 'dismissed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded uppercase tracking-wider transition ${
                statusTab === tab
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter incidents by title, IP, or classification..."
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Incidents Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncidents.length === 0 ? (
          <div className="col-span-2 cyber-card p-12 text-center text-xs font-mono text-slate-500">
            No incidents matching active triage filter.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className="cyber-card p-5 rounded-xl hover:border-cyan-500/50 transition cursor-pointer flex flex-col justify-between space-y-4"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase">
                      {inc.status}
                    </span>
                  </div>
                  <h3 className="font-mono text-sm font-bold text-white mt-1 leading-snug">
                    {inc.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-mono">
                    {inc.description}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition flex-shrink-0" />
              </div>

              {/* Threat Scoring Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-center">
                <div className="p-2 bg-slate-950 rounded border border-slate-800/60">
                  <span className="text-[9px] text-slate-400 block uppercase">ATTACK RISK</span>
                  <span className="text-sm font-bold text-rose-400">{Math.round(inc.attack_risk * 100)}%</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800/60">
                  <span className="text-[9px] text-slate-400 block uppercase">AUTOMATION</span>
                  <span className="text-sm font-bold text-amber-400">{Math.round(inc.automation_likelihood * 100)}%</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800/60">
                  <span className="text-[9px] text-slate-400 block uppercase">AI AGENT</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {inc.ai_agent_likelihood !== null && inc.ai_agent_likelihood !== undefined
                      ? `${Math.round(inc.ai_agent_likelihood * 100)}%`
                      : 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>IP: <strong className="text-emerald-400">{inc.source_ip}</strong></span>
                <span>{inc.event_count} events correlated</span>
                <span className="text-cyan-400 hover:underline flex items-center space-x-1">
                  <span>TRIAGE // CLINE AI</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

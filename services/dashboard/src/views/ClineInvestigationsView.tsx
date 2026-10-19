import React from 'react';
import { Bot, CheckCircle, Clock, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';
import { ClineJob, Incident } from '../types';

interface ClineViewProps {
  jobs: ClineJob[];
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const ClineInvestigationsView: React.FC<ClineViewProps> = ({
  jobs,
  incidents,
  onSelectIncident,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="cyber-card p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              CLINE RUNTIME INVESTIGATION CENTER
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Unattended AI Security Analyst operating in restricted plan-mode with prompt-injection guardrails
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">DEFAULT MODEL</span>
            <span className="text-cyan-400 font-bold">google/gemini-3.8-flash</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">RUNTIME MODE</span>
            <span className="text-emerald-400 font-bold">Safe Plan-Mode (-p)</span>
          </div>
        </div>
      </div>

      {/* Jobs Feed */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
          AI INVESTIGATION AUDIT LOG // {jobs.length} JOBS EXECUTED
        </h3>

        {jobs.length === 0 ? (
          <div className="cyber-card p-12 text-center text-xs font-mono text-slate-500">
            No autonomous Cline AI jobs have been executed yet. Select an incident in the Incidents view to trigger Cline investigation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const matchedInc = incidents.find((i) => i.id === job.incident_id);
              return (
                <div
                  key={job.id}
                  className="cyber-card p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">{job.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {job.status}
                    </span>
                  </div>

                  <div className="text-xs font-mono">
                    <span className="text-slate-400 block">TARGET INCIDENT:</span>
                    <span className="text-white font-bold">{job.incident_id}</span>
                    {matchedInc && (
                      <span className="text-slate-400 block mt-0.5">{matchedInc.title}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 bg-slate-950 rounded border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">PROVIDER</span>
                      <span className="text-slate-300 font-semibold">{job.provider}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">EXECUTION TIME</span>
                      <span className="text-cyan-400 font-semibold">{job.execution_time_seconds}s</span>
                    </div>
                  </div>

                  {matchedInc && (
                    <button
                      onClick={() => onSelectIncident(matchedInc)}
                      className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono rounded transition flex items-center justify-center space-x-1"
                    >
                      <span>VIEW FULL AI ANALYSIS IN INCIDENT</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

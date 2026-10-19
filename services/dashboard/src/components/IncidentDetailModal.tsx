import React, { useState } from 'react';
import { X, Bot, ShieldAlert, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { Incident } from '../types';
import { triggerClineAnalysis, updateIncidentStatus } from '../api';

interface IncidentModalProps {
  incident: Incident | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const IncidentDetailModal: React.FC<IncidentModalProps> = ({ incident, onClose, onRefresh }) => {
  if (!incident) return null;

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [status, setStatus] = useState(incident.status);
  const [notes, setNotes] = useState(incident.analyst_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const handleRunCline = async () => {
    setLoadingAI(true);
    try {
      const res = await triggerClineAnalysis(incident.id);
      setAiResult(res.analysis);
      setStatus('investigating');
      onRefresh();
    } catch (e: any) {
      alert(`Cline investigation error: ${e.message}`);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setStatus(newStatus as any);
    await updateIncidentStatus(incident.id, newStatus, notes);
    onRefresh();
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await updateIncidentStatus(incident.id, status, notes);
    setSavingNotes(false);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                INCIDENT TRIAGE // {incident.id}
              </h3>
              <p className="text-xs text-slate-400">{incident.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status & Severity Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/70 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">TRIAGE STATUS</span>
              <div className="flex space-x-1.5 mt-1">
                {(['open', 'investigating', 'resolved', 'dismissed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(s)}
                    className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider transition ${
                      status === s
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono block">SEVERITY LEVEL</span>
              <span className="inline-block mt-1 px-2.5 py-1 rounded text-xs font-mono uppercase font-bold bg-rose-950 text-rose-400 border border-rose-800">
                {incident.severity}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono block">SOURCE IP</span>
              <span className="font-mono text-xs text-emerald-400 font-bold block mt-1">{incident.source_ip}</span>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">ATTACK RISK</span>
              <span className="text-xl font-mono font-bold text-rose-400">
                {Math.round(incident.attack_risk * 100)}%
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">AUTOMATION SCORE</span>
              <span className="text-xl font-mono font-bold text-amber-400">
                {Math.round(incident.automation_likelihood * 100)}%
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">AI AGENT LIKELIHOOD</span>
              <span className="text-xl font-mono font-bold text-cyan-400">
                {incident.ai_agent_likelihood !== null && incident.ai_agent_likelihood !== undefined
                  ? `${Math.round(incident.ai_agent_likelihood * 100)}%`
                  : 'UNKNOWN'}
              </span>
            </div>
          </div>

          {/* Cline AI Section */}
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h4 className="font-mono text-xs font-bold text-cyan-300 uppercase">
                  CLINE RUNTIME INVESTIGATION ENGINE
                </h4>
              </div>
              <button
                onClick={handleRunCline}
                disabled={loadingAI}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition disabled:opacity-50"
              >
                {loadingAI ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                <span>{loadingAI ? 'INVESTIGATING...' : 'INVESTIGATE WITH CLINE AI'}</span>
              </button>
            </div>

            {aiResult ? (
              <div className="space-y-2 text-xs font-mono pt-2 border-t border-cyan-500/20">
                <div className="text-slate-300">
                  <span className="text-cyan-400 font-bold block mb-1">EXECUTIVE SUMMARY:</span>
                  {aiResult.summary}
                </div>
                {aiResult.reasoning && (
                  <div className="text-slate-400">
                    <span className="text-cyan-400 font-bold block mb-1">ANALYTICAL REASONING:</span>
                    {aiResult.reasoning}
                  </div>
                )}
                {aiResult.recommended_actions?.length > 0 && (
                  <div>
                    <span className="text-cyan-400 font-bold block mb-1">RECOMMENDED ACTIONS:</span>
                    <ul className="list-disc list-inside text-emerald-400 space-y-0.5">
                      {aiResult.recommended_actions.map((act: string, idx: number) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono">
                Click above to submit sanitized telemetry to Cline CLI in autonomous plan mode.
              </p>
            )}
          </div>

          {/* Analyst Notes Editor */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1">ANALYST NOTES</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record forensic notes, containment decisions, or follow-up actions..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 rounded transition"
              >
                {savingNotes ? 'SAVING...' : 'SAVE NOTES'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

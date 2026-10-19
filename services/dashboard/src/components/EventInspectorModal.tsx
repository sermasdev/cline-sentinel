import React, { useState } from 'react';
import {
  X, Copy, Check, ShieldAlert, Cpu, Bot, Sparkles,
  Terminal, ShieldCheck, ArrowRight, Zap, RefreshCw, AlertTriangle
} from 'lucide-react';
import { SecurityEvent } from '../types';
import { analyzeEvent } from '../api';

interface EventInspectorProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

interface AnalysisData {
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
}

export const EventInspectorModal: React.FC<EventInspectorProps> = ({ event, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'cline_analysis'>('telemetry');

  if (!event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleRunClineAnalysis = async () => {
    setLoadingAI(true);
    setActiveTab('cline_analysis');
    try {
      const res = await analyzeEvent(event.event_id);
      setAnalysis(res);
    } catch (e: any) {
      alert(`Cline Analysis Error: ${e.message}`);
    } finally {
      setLoadingAI(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-400 border-rose-600/50 shadow-[0_0_10px_rgba(255,0,85,0.3)]';
      case 'high':
        return 'bg-orange-950/80 text-orange-400 border-orange-600/50';
      case 'medium':
        return 'bg-amber-950/80 text-amber-400 border-amber-600/50';
      case 'low':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50';
      default:
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-600/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[88vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  TELEMETRY INSPECTOR // {event.event_id}
                </h3>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${getSeverityBadge(event.severity)}`}>
                  {event.severity}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Captured via {event.sensor_id} ({event.sensor_type}) from IP {event.source_ip}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Primary Action Button: Cline Agent Analysis */}
            <button
              onClick={handleRunClineAnalysis}
              disabled={loadingAI}
              className="relative group overflow-hidden px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_25px_rgba(0,255,136,0.5)] flex items-center space-x-1.5 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loadingAI ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin relative z-10" />
              ) : (
                <Bot className="w-3.5 h-3.5 relative z-10 animate-bounce" />
              )}
              <span className="relative z-10">
                {loadingAI ? 'CLINE INVESTIGATING...' : 'CLINE AGENT ANALYSIS'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-950/60 border-b border-slate-800 font-mono text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1 rounded-md transition ${
                activeTab === 'telemetry'
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RAW TELEMETRY RECORD
            </button>
            <button
              onClick={handleRunClineAnalysis}
              className={`px-3 py-1 rounded-md transition flex items-center space-x-1.5 ${
                activeTab === 'cline_analysis'
                  ? 'bg-cyan-950/80 text-cyan-400 font-bold border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>CLINE AGENT ANALYSIS</span>
              {analysis && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            TIMESTAMP: <span className="text-slate-300">{new Date(event.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-mono">
          
          {/* Key Metric Strip (Always visible) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">SENSOR ID</span>
              <span className="text-xs text-cyan-300 font-bold">{event.sensor_id}</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">EVENT TYPE</span>
              <span className="text-xs text-white font-bold">{event.event_type}</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">SOURCE IP</span>
              <span className="text-xs text-emerald-400 font-bold">{event.source_ip}</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">DEST PORT</span>
              <span className="text-xs text-purple-400 font-bold">{event.destination_port || 'N/A'}</span>
            </div>
          </div>

          {/* Intercepted Payload Box */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block">INTERCEPTED ATTACK PAYLOAD / QUERY</span>
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-amber-300 break-all font-mono leading-relaxed relative">
              <div className="absolute top-2 right-2 text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                DECOY CAPTURE
              </div>
              {event.payload || 'No raw payload recorded'}
            </div>
          </div>

          {/* TAB 1: RAW TELEMETRY JSON */}
          {activeTab === 'telemetry' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">NORMALIZED JSON RECORD</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 py-0.5 px-2 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 overflow-x-auto max-h-60">
                {JSON.stringify(event, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 2: CLINE AGENT FORENSIC ANALYSIS */}
          {activeTab === 'cline_analysis' && (
            <div className="space-y-4">
              {loadingAI ? (
                /* Scanning Laser Animation State */
                <div className="p-10 bg-slate-950 rounded-xl border border-cyan-500/30 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center animate-spin">
                    <Bot className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-widest animate-pulse">
                      CLINE AI AGENT DISPATCHED
                    </h4>
                    <p className="text-xs text-slate-400">
                      Executing unattended forensic reasoning in plan-mode sandbox with OpenRouter...
                    </p>
                  </div>
                  {/* Glowing Laser Scanline */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                </div>
              ) : analysis ? (
                /* Rich Forensic Intelligence Display */
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Report Header Card */}
                  <div className="p-4 bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500 text-black uppercase">
                          CLINE FORENSIC REPORT
                        </span>
                        <span className="text-[10px] text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                          MITRE: {analysis.mitre_technique}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {analysis.attack_title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Category: <strong className="text-cyan-300">{analysis.classification}</strong>
                      </p>
                    </div>

                    {/* Threat Score Gauges */}
                    <div className="flex items-center space-x-4">
                      <div className="text-center p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-400 block uppercase">ATTACK RISK</span>
                        <span className="text-sm font-bold text-rose-400">
                          {Math.round(analysis.attack_risk * 100)}%
                        </span>
                      </div>
                      <div className="text-center p-2 bg-slate-900/90 rounded-lg border border-slate-800">
                        <span className="text-[9px] text-slate-400 block uppercase">AUTOMATION</span>
                        <span className="text-sm font-bold text-amber-400">
                          {Math.round(analysis.automation_likelihood * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1. What the attack is about */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="uppercase tracking-wider">1. WHAT THE ATTACK IS ABOUT</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-cyan-500/40">
                      {analysis.what_it_is_about}
                    </p>
                  </div>

                  {/* 2. What it tries to do */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                      <Terminal className="w-4 h-4" />
                      <span className="uppercase tracking-wider">2. WHAT IT TRIES TO DO (ATTACKER INTENT)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-amber-500/40">
                      {analysis.what_it_tries_to_do}
                    </p>
                  </div>

                  {/* 3. How to fix it */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/20 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="uppercase tracking-wider">3. HOW TO FIX IT (REMEDIATION CHECKLIST)</span>
                    </div>

                    <div className="space-y-2 pl-6 border-l-2 border-emerald-500/40">
                      {analysis.how_to_fix_it?.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                          <span className="text-emerald-400 font-bold flex-shrink-0">Step {idx + 1}:</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Remediation Firewall Command Box */}
                    {analysis.remediation_command && (
                      <div className="mt-3 p-3 bg-[#02050b] rounded-lg border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>ONE-CLICK REMEDIATION COMMAND</span>
                          </span>
                          <button
                            onClick={() => handleCopyCommand(analysis.remediation_command)}
                            className="flex items-center space-x-1 text-[10px] text-cyan-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 transition"
                          >
                            {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedCmd ? 'COPIED' : 'COPY COMMAND'}</span>
                          </button>
                        </div>
                        <code className="text-xs text-emerald-300 block select-all">
                          {analysis.remediation_command}
                        </code>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                  Click the <strong>CLINE AGENT ANALYSIS</strong> button above to start an AI forensic investigation.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 font-mono">
            CLINE SENTINEL // FORENSIC TELEMETRY PROTOCOL
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

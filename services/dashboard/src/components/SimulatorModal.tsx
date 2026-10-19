import React, { useState } from 'react';
import { X, Play, ShieldAlert, Terminal, Globe, Cpu, CheckCircle } from 'lucide-react';
import { simulateAttack } from '../api';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggered: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ isOpen, onClose, onTriggered }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const attacks = [
    {
      id: 'ssh_bruteforce',
      name: 'SSH Brute-Force Spray',
      icon: Terminal,
      color: 'text-amber-400',
      desc: 'Simulates rapid credential guessing against Cowrie SSH sensor (Port 2222) with admin/root dictionaries.',
    },
    {
      id: 'web_admin_probe',
      name: 'Web Admin & Config Leak Scan',
      icon: Globe,
      color: 'text-cyan-400',
      desc: 'Probes synthetic decoy endpoints (/admin, /.env, /config.json, /api/v1/users) on port 8088.',
    },
    {
      id: 'mcp_agent_probe',
      name: 'Autonomous AI Agent Recon',
      icon: Cpu,
      color: 'text-purple-400',
      desc: 'Simulates an autonomous AI agent probing /.well-known/agent.json, querying MCP tools, and attempting tool execution.',
    },
    {
      id: 'command_injection',
      name: 'Critical Shell Command Injection',
      icon: ShieldAlert,
      color: 'text-rose-400',
      desc: 'Sends privilege escalation and reconnaissance commands (cat /etc/passwd, wget payload.sh, chmod +x).',
    },
  ];

  const handleLaunch = async (attackId: string) => {
    setLoading(attackId);
    setLastResult(null);
    try {
      const res = await simulateAttack(attackId, 4);
      setLastResult(`Successfully generated ${res.events_count} decoy events from ${res.source_ip}`);
      onTriggered();
    } catch (e: any) {
      setLastResult(`Error: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-cyan-500/20">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              ATTACK SIMULATION MATRIX // TEST RANGE
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs font-mono text-slate-300">
            Launch controlled simulated attack vectors against Sentinel local honeypots to verify ingestion, correlation, and live alert telemetry.
          </p>

          {lastResult && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded text-xs font-mono text-emerald-400 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{lastResult}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attacks.map((atk) => {
              const Icon = atk.icon;
              const isRunning = loading === atk.id;
              return (
                <div
                  key={atk.id}
                  className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${atk.color}`} />
                      <span className="font-mono text-xs font-bold text-white uppercase">{atk.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{atk.desc}</p>
                  </div>
                  <button
                    onClick={() => handleLaunch(atk.id)}
                    disabled={isRunning}
                    className="flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-black rounded text-xs font-mono font-bold transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunning ? 'LAUNCHING...' : 'TRIGGER ATTACK'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

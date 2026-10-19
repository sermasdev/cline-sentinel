import React from 'react';
import { Terminal, Globe, Cpu, CheckCircle, Copy, Check } from 'lucide-react';
import { Sensor } from '../types';

interface HoneypotsProps {
  sensors: Sensor[];
}

export const HoneypotsView: React.FC<HoneypotsProps> = ({ sensors }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const endpoints = [
    { method: 'GET', path: '/admin', desc: 'Administrative console decoy, returns 403 hardware key required', curl: 'curl -i http://127.0.0.1:8088/admin' },
    { method: 'POST', path: '/login', desc: 'Credential trapping login form, records attempted username & password', curl: 'curl -X POST http://127.0.0.1:8088/login -d "user=admin&pass=secret"' },
    { method: 'GET', path: '/.well-known/agent.json', desc: 'AI Agent discovery schema, announces simulated tool capabilities', curl: 'curl -s http://127.0.0.1:8088/.well-known/agent.json' },
    { method: 'GET', path: '/mcp', desc: 'Model Context Protocol (MCP) server decoy, lists fake enterprise tools', curl: 'curl -s http://127.0.0.1:8088/mcp' },
    { method: 'POST', path: '/agent/execute', desc: 'Trapped tool execution endpoint, safely logs attacker command attempts', curl: 'curl -X POST http://127.0.0.1:8088/agent/execute -d \'{"cmd":"whoami"}\'' },
    { method: 'SSH', path: 'port 2222', desc: 'Cowrie simulated OpenSSH daemon with interactive shell replay', curl: 'ssh -p 2222 root@127.0.0.1' },
  ];

  const handleCopy = (curl: string, index: number) => {
    navigator.clipboard.writeText(curl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sensors.map((s) => (
          <div key={s.id} className="cyber-card p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {s.sensor_type === 'ssh' ? (
                  <Terminal className="w-5 h-5 text-amber-400" />
                ) : s.sensor_type === 'api_agent' ? (
                  <Cpu className="w-5 h-5 text-purple-400" />
                ) : (
                  <Globe className="w-5 h-5 text-cyan-400" />
                )}
                <span className="font-mono text-xs font-bold text-white uppercase">{s.name}</span>
              </div>
              <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                <CheckCircle className="w-3 h-3" />
                <span>ONLINE</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 bg-slate-950 rounded border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">LISTENER PORT</span>
                <span className="text-cyan-400 font-bold">{s.port}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">TRAPPED EVENTS</span>
                <span className="text-white font-bold">{s.event_count}</span>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400">
              LAST HEARTBEAT: {new Date(s.last_heartbeat).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Synthetic Decoy Catalog */}
      <div className="cyber-card p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              SYNTHETIC DECOY ENDPOINT CATALOG
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live decoy surfaces designed to trap automated credential sprayers, vulnerability scanners, and AI agents
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                    {ep.method}
                  </span>
                  <span className="text-white font-bold">{ep.path}</span>
                </div>
                <p className="text-[11px] text-slate-400">{ep.desc}</p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                <code className="text-cyan-400 text-[11px]">{ep.curl}</code>
                <button
                  onClick={() => handleCopy(ep.curl, idx)}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy command"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

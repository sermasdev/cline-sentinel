import React from 'react';
import { Terminal, Users, Play, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { SessionItem } from '../types';

interface SessionsViewProps {
  sessions: SessionItem[];
  onSelectReplay: (session: SessionItem) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  onSelectReplay,
}) => {
  return (
    <div className="space-y-4">
      <div className="cyber-card p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Terminal className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              INTERACTIVE SESSION REPLAY & FORENSIC RECORDER
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live keystroke and command stream captures from Cowrie SSH (Port 2222) and Web/MCP decoys
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-slate-400">
          <span className="text-cyan-400 font-bold">{sessions.length}</span> SESSIONS LOGGED
        </div>
      </div>

      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">SESSION ID</th>
                <th className="px-4 py-3">SENSOR</th>
                <th className="px-4 py-3">SOURCE IP</th>
                <th className="px-4 py-3">DURATION</th>
                <th className="px-4 py-3">AUTH ATTEMPTS</th>
                <th className="px-4 py-3">COMMANDS</th>
                <th className="px-4 py-3">RISK SCORE</th>
                <th className="px-4 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No active sessions recorded yet. Trigger SSH or Web attack in the Simulator.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr
                    key={sess.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectReplay(sess)}
                  >
                    <td className="px-4 py-3 font-bold text-cyan-300 whitespace-nowrap">
                      {sess.id}
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                      {sess.sensor_id}
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-bold whitespace-nowrap">
                      {sess.source_ip}
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {sess.duration_seconds}s
                    </td>
                    <td className="px-4 py-3 text-amber-400 font-bold whitespace-nowrap">
                      {sess.auth_attempts}
                    </td>
                    <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                      {sess.commands_count || (sess.commands ? sess.commands.length : 0)} commands
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              sess.risk_score > 0.7
                                ? 'bg-rose-500'
                                : sess.risk_score > 0.4
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.round(sess.risk_score * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {Math.round(sess.risk_score * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReplay(sess);
                        }}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition ml-auto"
                      >
                        <Play className="w-3 h-3" />
                        <span>REPLAY</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

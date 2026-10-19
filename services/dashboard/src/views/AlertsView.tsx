import React, { useState } from 'react';
import { Mail, Send, CheckCircle, ShieldAlert, Clock } from 'lucide-react';
import { SecurityAlert } from '../types';
import { triggerTestAlert } from '../api';

interface AlertsViewProps {
  alerts: SecurityAlert[];
  onRefresh: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, onRefresh }) => {
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestAlert = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await triggerTestAlert();
      setTestResult(`Test alert dispatched: ${res.status}`);
      onRefresh();
    } catch (e: any) {
      setTestResult(`Failed: ${e.message}`);
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Card */}
      <div className="cyber-card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              COMPOSIO GMAIL ALERT WORKER // NOTIFICATION POLICIES
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Configured Recipient: <strong className="text-cyan-300">secops-alerts@example.com</strong> (Mock Provider Active)
            </p>
          </div>
        </div>

        <button
          onClick={handleTestAlert}
          disabled={sendingTest}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold rounded transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{sendingTest ? 'SENDING...' : 'DISPATCH TEST ALERT'}</span>
        </button>
      </div>

      {testResult && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded text-xs font-mono text-cyan-300">
          {testResult}
        </div>
      )}

      {/* Severity Policy Matrix Table */}
      <div className="cyber-card p-5 rounded-xl space-y-3">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          DISPATCH SLA & ESCALATION MATRIX
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded border border-rose-900/40">
            <span className="text-rose-400 font-bold block">CRITICAL</span>
            <span className="text-slate-300">Immediate Dispatch</span>
            <span className="text-[10px] text-slate-500 block mt-1">Direct Gmail + SMS</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-orange-900/40">
            <span className="text-orange-400 font-bold block">HIGH</span>
            <span className="text-slate-300">Immediate Dispatch</span>
            <span className="text-[10px] text-slate-500 block mt-1">Direct Gmail Alert</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-amber-900/40">
            <span className="text-amber-400 font-bold block">MEDIUM</span>
            <span className="text-slate-300">Hourly Digest</span>
            <span className="text-[10px] text-slate-500 block mt-1">Batched Email Summary</span>
          </div>
          <div className="p-3 bg-slate-950 rounded border border-emerald-900/40">
            <span className="text-emerald-400 font-bold block">LOW / INFO</span>
            <span className="text-slate-300">Daily Digest</span>
            <span className="text-[10px] text-slate-500 block mt-1">Dashboard Stream Only</span>
          </div>
        </div>
      </div>

      {/* Alerts Log */}
      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-white uppercase">
            DELIVERED ALERTS LOG // {alerts.length} DISPATCHES
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">TIMESTAMP</th>
                <th className="px-4 py-3">SEVERITY</th>
                <th className="px-4 py-3">SUBJECT</th>
                <th className="px-4 py-3">RECIPIENT</th>
                <th className="px-4 py-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No alerts generated yet. Trigger an attack or click Dispatch Test Alert.
                  </td>
                </tr>
              ) : (
                alerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(alt.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        {alt.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-200 font-medium">{alt.subject}</td>
                    <td className="px-4 py-2.5 text-cyan-400">{alt.recipient}</td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {alt.status}
                      </span>
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

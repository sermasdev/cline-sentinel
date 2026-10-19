import React, { useState } from 'react';
import {
  Activity, Search, Filter, Download, Pause, Play,
  Trash2, Eye, ShieldAlert, Cpu, Globe, Terminal
} from 'lucide-react';
import { SecurityEvent } from '../types';

interface LiveActivityProps {
  events: SecurityEvent[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onSelectEvent: (event: SecurityEvent) => void;
  onClearEvents: () => void;
}

export const LiveActivityView: React.FC<LiveActivityProps> = ({
  events,
  isStreaming,
  onToggleStreaming,
  onSelectEvent,
  onClearEvents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sensorFilter, setSensorFilter] = useState('all');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.source_ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.payload && e.payload.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    const matchesSensor = sensorFilter === 'all' || e.sensor_id === sensorFilter;
    return matchesSearch && matchesSeverity && matchesSensor;
  });

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Sensor', 'Event Type', 'Severity', 'Source IP', 'Payload'];
    const rows = filteredEvents.map((e) => [
      e.event_id,
      e.timestamp,
      e.sensor_id,
      e.event_type,
      e.severity,
      e.source_ip,
      `"${(e.payload || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentinel_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'high':
        return 'bg-orange-950/80 text-orange-400 border-orange-800';
      case 'medium':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'low':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      default:
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
    }
  };

  const getSensorIcon = (sensorType: string) => {
    if (sensorType === 'ssh') return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
    if (sensorType === 'api_agent') return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
    return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="cyber-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              REAL-TIME SENSOR STREAM // SSE PIPELINE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live normalized event buffer — {filteredEvents.length} records matching criteria
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={onToggleStreaming}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition font-bold ${
              isStreaming
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'PAUSE STREAM' : 'RESUME STREAM'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={onClearEvents}
            className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
            title="Clear buffer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search IP, command, or query payload..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">SEVERITY:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">SENSOR:</span>
          <select
            value={sensorFilter}
            onChange={(e) => setSensorFilter(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Sensors</option>
            <option value="cowrie-local">Cowrie SSH (Port 2222)</option>
            <option value="web-decoy-local">Web Decoy (Port 8088)</option>
            <option value="agent-mcp-decoy">MCP Agent Sensor</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">TIMESTAMP</th>
                <th className="px-4 py-3">SEVERITY</th>
                <th className="px-4 py-3">SENSOR</th>
                <th className="px-4 py-3">EVENT TYPE</th>
                <th className="px-4 py-3">SOURCE IP</th>
                <th className="px-4 py-3">PAYLOAD / DETAILS</th>
                <th className="px-4 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No telemetry events currently match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.event_id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectEvent(evt)}
                  >
                    <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityBadge(evt.severity)}`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        {getSensorIcon(evt.sensor_type)}
                        <span>{evt.sensor_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-200 whitespace-nowrap font-semibold">
                      {evt.event_type}
                    </td>
                    <td className="px-4 py-2.5 text-emerald-400 whitespace-nowrap font-bold">
                      {evt.source_ip}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 max-w-md truncate">
                      {evt.payload || '-'}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(evt);
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400"
                        title="Inspect Event"
                      >
                        <Eye className="w-3.5 h-3.5" />
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

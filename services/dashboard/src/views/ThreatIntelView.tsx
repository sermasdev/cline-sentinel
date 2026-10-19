import React, { useState } from 'react';
import { Database, Search, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';
import { ThreatEnrichment } from '../types';
import { lookupEnrichment } from '../api';

interface ThreatIntelProps {
  enrichments: ThreatEnrichment[];
  onRefresh: () => void;
}

export const ThreatIntelView: React.FC<ThreatIntelProps> = ({ enrichments, onRefresh }) => {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('technique');
  const [searching, setSearching] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    try {
      await lookupEnrichment(query, queryType);
      setQuery('');
      onRefresh();
    } catch (e: any) {
      alert(`Lookup error: ${e.message}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              PARALLEL.AI THREAT INTELLIGENCE & MITRE ATT&CK CATALOG
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Enrichment pipeline for adversary techniques, CVE vulnerabilities, and threat actors
            </p>
          </div>
        </div>

        <form onSubmit={handleLookup} className="flex items-center space-x-2">
          <select
            value={queryType}
            onChange={(e) => setQueryType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="technique">MITRE Technique (T1110, T1595)</option>
            <option value="cve">CVE Identifier</option>
            <option value="ip">Threat Actor IP</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. T1110 or 192.168.1.1..."
            className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold rounded transition"
          >
            {searching ? 'QUERYING...' : 'ENRICH'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichments.map((enr) => (
          <div key={enr.id} className="cyber-card p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {enr.indicator_type.toUpperCase()}: {enr.indicator}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                CONFIDENCE: {Math.round(enr.confidence * 100)}%
              </span>
            </div>

            <h3 className="font-mono text-sm font-bold text-white leading-snug">
              {enr.summary}
            </h3>

            {enr.details && (
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                {enr.details.tactics && (
                  <div>
                    <span className="text-slate-500">TACTICS: </span>
                    <span className="text-amber-400">{enr.details.tactics.join(', ')}</span>
                  </div>
                )}
                {enr.details.detection && (
                  <div>
                    <span className="text-slate-500">DETECTION: </span>
                    <span className="text-slate-300">{enr.details.detection}</span>
                  </div>
                )}
                {enr.details.mitigation && (
                  <div>
                    <span className="text-slate-500">MITIGATION: </span>
                    <span className="text-emerald-400">{enr.details.mitigation}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
              <span>SOURCE: {enr.provider}</span>
              <span>INDEXED: {new Date(enr.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

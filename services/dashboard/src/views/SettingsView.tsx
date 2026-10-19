import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, ShieldCheck, Lock, Sliders } from 'lucide-react';
import { fetchSettings, saveSettings } from '../api';

export const SettingsView: React.FC = () => {
  const [settings, setSettingsData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetchSettings().then(setSettingsData).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (e: any) {
      alert(`Error saving: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              DETECTION THRESHOLDS & ENGINE PARAMETERS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live rule configurations persisted directly in PostgreSQL 16
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold rounded-lg transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'SAVING...' : 'SAVE SETTINGS'}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded text-xs font-mono text-emerald-400">
          Configuration updated successfully in PostgreSQL settings table.
        </div>
      )}

      {/* Settings Grid */}
      <div className="cyber-card p-6 rounded-xl space-y-6 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block uppercase">
              SSH BRUTE-FORCE INCIDENT THRESHOLD
            </label>
            <p className="text-[11px] text-slate-400">
              Number of failed authentication attempts from a single IP before generating an incident.
            </p>
            <input
              type="number"
              value={settings['ssh_brute_force_threshold']?.value ?? 3}
              onChange={(e) =>
                setSettingsData({
                  ...settings,
                  ssh_brute_force_threshold: {
                    ...settings['ssh_brute_force_threshold'],
                    value: parseInt(e.target.value) || 3,
                  },
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-bold block uppercase">
              CLINE RUNTIME MODEL ID
            </label>
            <p className="text-[11px] text-slate-400">
              Model invoked by Cline CLI in plan mode for incident investigation.
            </p>
            <input
              type="text"
              value={settings['cline_ai_model']?.value ?? 'google/gemini-3.8-flash'}
              onChange={(e) =>
                setSettingsData({
                  ...settings,
                  cline_ai_model: {
                    ...settings['cline_ai_model'],
                    value: e.target.value,
                  },
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Security Policy Guardrails */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <h3 className="font-bold text-white uppercase flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>MANDATORY SYSTEM GUARDRAILS (ENFORCED)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">ZERO ARBITRARY EXECUTION</span>
              <span className="text-slate-400">
                All decoy shell commands are trapped in a harmless virtual emulator. No host execution is permitted.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">CLINE PLAN-MODE SANDBOX</span>
              <span className="text-slate-400">
                Cline operates strictly with the -p flag. Tool actions, file edits, and bash commands are disabled.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">MOCK ALERT ISOLATION</span>
              <span className="text-slate-400">
                Composio email notifications default to mock delivery to prevent inadvertent unsolicited dispatches.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

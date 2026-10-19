import React from 'react';
import { Cpu, HardDrive, Activity, CheckCircle, Server } from 'lucide-react';
import { SystemHealthData } from '../types';

interface HealthProps {
  health: SystemHealthData | null;
}

export const SystemHealthView: React.FC<HealthProps> = ({ health }) => {
  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-card p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CPU UTILIZATION</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {health?.cpu_percent ?? 0}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${health?.cpu_percent || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="cyber-card p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>RAM UTILIZATION</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {health?.memory_percent ?? 0}%
          </div>
          <div className="text-xs font-mono text-slate-400">
            {health?.memory_used_mb ?? 0} MB / {health?.memory_total_mb ?? 0} MB
          </div>
        </div>

        <div className="cyber-card p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>DISK FOOTPRINT</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {health?.disk_percent ?? 0}%
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-400 h-full transition-all duration-500"
              style={{ width: `${health?.disk_percent || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="cyber-card p-5 rounded-xl space-y-4">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          DISTRIBUTED SENTINEL CONTAINER & MICROSERVICE HEALTH
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {health?.services?.map((svc, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">{svc.name}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 block">{svc.description}</span>
              </div>

              <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle className="w-3 h-3" />
                <span>{svc.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

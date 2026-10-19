import React, { useState } from 'react';
import { Incident } from '../types';
import { ShieldAlert, Crosshair, ArrowUpRight } from 'lucide-react';

interface RadarProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const CyberRadar: React.FC<RadarProps> = ({ incidents = [], onSelectIncident }) => {
  const [hoveredInc, setHoveredInc] = useState<Incident | null>(null);

  // Compute deterministic coordinates inside the circular radar
  const getCoordinates = (inc: Incident, index: number, total: number) => {
    // Generate stable pseudo-random angle and radius from incident ID
    let hash = 0;
    const str = inc.id + inc.source_ip;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Spread angles around the 360 circle
    const baseAngle = (index / Math.max(1, total)) * 2 * Math.PI;
    const jitter = ((absHash % 40) - 20) * (Math.PI / 180);
    const angle = baseAngle + jitter;

    // Radius between 25% and 42% from center (staying safely inside outer circle)
    const radius = 22 + (absHash % 20);

    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return {
          bg: 'bg-rose-500',
          glow: 'shadow-[0_0_15px_#ff0055]',
          border: 'border-rose-400',
          ping: 'bg-rose-500',
          text: 'text-rose-400'
        };
      case 'high':
        return {
          bg: 'bg-orange-500',
          glow: 'shadow-[0_0_12px_#ff8800]',
          border: 'border-orange-400',
          ping: 'bg-orange-400',
          text: 'text-orange-400'
        };
      case 'medium':
        return {
          bg: 'bg-amber-400',
          glow: 'shadow-[0_0_10px_#ffaa00]',
          border: 'border-amber-300',
          ping: 'bg-amber-400',
          text: 'text-amber-400'
        };
      default:
        return {
          bg: 'bg-emerald-400',
          glow: 'shadow-[0_0_10px_#00ff88]',
          border: 'border-emerald-300',
          ping: 'bg-emerald-400',
          text: 'text-emerald-400'
        };
    }
  };

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto flex items-center justify-center select-none">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/25 shadow-[0_0_40px_rgba(0,240,255,0.18)] bg-slate-950/85 backdrop-blur-md"></div>
      
      {/* Concentric Range Rings */}
      <div className="absolute w-[85%] h-[85%] rounded-full border border-cyan-500/15"></div>
      <div className="absolute w-[65%] h-[65%] rounded-full border border-cyan-500/20"></div>
      <div className="absolute w-[45%] h-[45%] rounded-full border border-cyan-500/25"></div>
      <div className="absolute w-[25%] h-[25%] rounded-full border border-cyan-500/30"></div>

      {/* Grid Axis Crosshairs */}
      <div className="absolute w-full h-[1px] bg-cyan-500/15"></div>
      <div className="absolute h-full w-[1px] bg-cyan-500/15"></div>
      <div className="absolute w-full h-[1px] bg-cyan-500/10 rotate-45"></div>
      <div className="absolute w-full h-[1px] bg-cyan-500/10 -rotate-45"></div>

      {/* Rotating Radar Sweep Beam */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div 
          className="w-full h-full origin-center animate-radar-sweep"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(0, 240, 255, 0.05) 325deg, rgba(0, 240, 255, 0.35) 360deg)'
          }}
        ></div>
      </div>

      {/* Sensor Perimeter Beacons */}
      {/* Sensor 1: SSH Decoy (Port 2222) at ~30 deg */}
      <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '15%', left: '78%' }}>
        <div className="w-2.5 h-2.5 rotate-45 bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse"></div>
        <span className="text-[8px] font-mono text-cyan-300 tracking-tighter mt-1 bg-slate-950/90 px-1 rounded border border-cyan-800">
          SSH:2222
        </span>
      </div>

      {/* Sensor 2: Web Decoy (Port 8088) at ~150 deg */}
      <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '78%', left: '70%' }}>
        <div className="w-2.5 h-2.5 rotate-45 bg-emerald-400 shadow-[0_0_8px_#00ff88] animate-pulse"></div>
        <span className="text-[8px] font-mono text-emerald-300 tracking-tighter mt-1 bg-slate-950/90 px-1 rounded border border-emerald-800">
          WEB:8088
        </span>
      </div>

      {/* Sensor 3: MCP Agent Decoy at ~240 deg */}
      <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '65%', left: '16%' }}>
        <div className="w-2.5 h-2.5 rotate-45 bg-purple-400 shadow-[0_0_8px_#a855f7] animate-pulse"></div>
        <span className="text-[8px] font-mono text-purple-300 tracking-tighter mt-1 bg-slate-950/90 px-1 rounded border border-purple-800">
          MCP:TOOL
        </span>
      </div>

      {/* Real Interactive Incident Target Blips */}
      {incidents.map((inc, idx) => {
        const { x, y } = getCoordinates(inc, idx, incidents.length);
        const col = getSeverityColor(inc.severity);
        const isHovered = hoveredInc?.id === inc.id;

        return (
          <div
            key={inc.id}
            className="absolute z-20 cursor-pointer group"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseEnter={() => setHoveredInc(inc)}
            onMouseLeave={() => setHoveredInc(null)}
            onClick={() => onSelectIncident(inc)}
          >
            {/* Pulsing Ripple Wave for Critical / High */}
            {(inc.severity === 'critical' || inc.severity === 'high') && (
              <div className={`absolute inset-0 rounded-full ${col.ping} opacity-75 animate-ping pointer-events-none`}></div>
            )}

            {/* Target Reticle Ring when Hovered */}
            {isHovered && (
              <div className="absolute -inset-2 rounded-full border border-cyan-400 animate-spin pointer-events-none"></div>
            )}

            {/* Core Target Blip Dot */}
            <div
              className={`w-3.5 h-3.5 rounded-full ${col.bg} ${col.glow} border-2 ${col.border} transition-transform duration-200 group-hover:scale-150 flex items-center justify-center`}
            >
              <div className="w-1 h-1 rounded-full bg-white"></div>
            </div>

            {/* Target Tag Label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/95 border ${col.border} ${col.text} shadow-xl flex items-center space-x-1`}>
                <span>{inc.classification.slice(0, 14)}</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        );
      })}

      {/* Center Reticle Core */}
      <div className="absolute w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-950/80 flex items-center justify-center pointer-events-none shadow-[0_0_10px_rgba(0,240,255,0.4)]">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-300"></div>
      </div>

      {/* Floating Target Inspection Tooltip HUD */}
      {hoveredInc && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-cyan-500/50 p-2.5 rounded-lg shadow-[0_0_25px_rgba(0,240,255,0.25)] font-mono text-[11px] w-64 pointer-events-none animate-fadeIn backdrop-blur-md">
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
            <span className="text-cyan-400 font-bold uppercase">TARGET ACQUIRED // {hoveredInc.id}</span>
            <span className={`uppercase font-bold ${getSeverityColor(hoveredInc.severity).text}`}>
              {hoveredInc.severity}
            </span>
          </div>
          <div className="text-white font-bold truncate">{hoveredInc.title}</div>
          <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
            <span>IP: <strong className="text-emerald-400">{hoveredInc.source_ip}</strong></span>
            <span>RISK: <strong className="text-rose-400">{Math.round(hoveredInc.attack_risk * 100)}%</strong></span>
          </div>
          <div className="text-[9px] text-cyan-300 mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span>CLICK TO OPEN INCIDENT</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
          </div>
        </div>
      )}

      {/* HUD Telemetry Overlay Text */}
      <div className="absolute top-2.5 left-4 text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase pointer-events-none">
        RADAR // TARGETS: {incidents.length}
      </div>
      <div className="absolute top-2.5 right-4 text-[9px] font-mono text-emerald-400/80 tracking-widest pointer-events-none">
        GRID: 3 SENSORS
      </div>
      <div className="absolute bottom-2.5 right-4 text-[9px] font-mono text-cyan-400/80 tracking-widest pointer-events-none">
        BEARING: 084° N
      </div>
      <div className="absolute bottom-2.5 left-4 text-[9px] font-mono text-slate-400 tracking-widest pointer-events-none">
        RANGE: 50 KM
      </div>
    </div>
  );
};

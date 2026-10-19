import React, { useState } from 'react';
import { Incident } from '../types';
import { ShieldAlert, Crosshair, ArrowUpRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RadarProps {
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}

export const CyberRadar: React.FC<RadarProps> = ({ incidents = [], onSelectIncident }) => {
  const [hoveredInc, setHoveredInc] = useState<Incident | null>(null);

  // Calculate danger score (0.0 to 1.0)
  const getDangerScore = (inc: Incident): number => {
    let score = inc.attack_risk || 0.5;
    if (inc.severity === 'critical') {
      score = Math.max(score, 0.90);
    } else if (inc.severity === 'high') {
      score = Math.max(score, 0.72);
    } else if (inc.severity === 'medium') {
      score = Math.min(Math.max(score, 0.45), 0.69);
    } else if (inc.severity === 'low' || inc.severity === 'informational') {
      score = Math.min(score, 0.35);
    }
    return Math.max(0.05, Math.min(0.98, score));
  };

  // Compute coordinates: Closer to the center the more dangerous the attack is!
  const getCoordinates = (inc: Incident, index: number, total: number) => {
    const danger = getDangerScore(inc);

    // Radial distance: Inverse relationship with danger
    // danger == 1.0 (most dangerous) -> radius ~10% (right near the middle)
    // danger == 0.0 (least dangerous) -> radius ~41% (outer edge)
    const minRadius = 11; // Closest to middle (critical/lethal danger)
    const maxRadius = 41; // Furthest from middle (low danger perimeter)
    const baseRadius = maxRadius - danger * (maxRadius - minRadius);

    // Deterministic angle distribution so blips don't overlap
    let hash = 0;
    const str = inc.id + inc.source_ip;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Spread angles evenly around the 360 circle with minor jitter
    const baseAngle = (index / Math.max(1, total)) * 2 * Math.PI;
    const jitter = ((absHash % 30) - 15) * (Math.PI / 180);
    const angle = baseAngle + jitter;

    // Small radial micro-jitter (+- 1.5%) to avoid exact overlaps
    const radialJitter = ((absHash % 7) - 3) * 0.5;
    const radius = Math.max(minRadius - 2, Math.min(maxRadius + 1, baseRadius + radialJitter));

    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y, danger, radius };
  };

  // Color from green -> orange -> red based on danger level
  const getDangerVisuals = (danger: number, severity: string) => {
    if (danger >= 0.70 || severity === 'critical' || severity === 'high') {
      // RED: Critical / High Danger (Closest to middle)
      return {
        level: 'CRITICAL',
        colorName: 'red',
        bg: 'bg-rose-500',
        glow: 'shadow-[0_0_18px_#ff0055]',
        border: 'border-rose-400',
        ping: 'bg-rose-500',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-950/90 text-rose-300 border-rose-700',
        description: 'INNER IMPACT ZONE (HIGH DANGER)'
      };
    } else if (danger >= 0.40 || severity === 'medium') {
      // ORANGE: Medium Danger (Midway distance)
      return {
        level: 'ELEVATED',
        colorName: 'orange',
        bg: 'bg-orange-500',
        glow: 'shadow-[0_0_14px_#ff8800]',
        border: 'border-orange-400',
        ping: 'bg-orange-400',
        text: 'text-orange-400',
        badgeBg: 'bg-orange-950/90 text-orange-300 border-orange-700',
        description: 'ELEVATED BUFFER ZONE (MEDIUM DANGER)'
      };
    } else {
      // GREEN: Low Danger / Probe (Furthest from middle)
      return {
        level: 'LOW',
        colorName: 'green',
        bg: 'bg-emerald-400',
        glow: 'shadow-[0_0_10px_#00ff88]',
        border: 'border-emerald-300',
        ping: 'bg-emerald-400',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-950/90 text-emerald-300 border-emerald-700',
        description: 'OUTER PERIMETER (LOW DANGER)'
      };
    }
  };

  return (
    <div className="relative w-72 h-72 md:w-84 md:h-84 mx-auto flex items-center justify-center select-none">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/25 shadow-[0_0_40px_rgba(0,240,255,0.18)] bg-slate-950/90 backdrop-blur-md"></div>
      
      {/* Concentric Threat Range Rings */}
      {/* 1. Outer Ring (Low Danger / Perimeter - Green zone) */}
      <div className="absolute w-[86%] h-[86%] rounded-full border border-emerald-500/20"></div>
      
      {/* 2. Middle Ring (Medium Danger / Elevated - Orange zone) */}
      <div className="absolute w-[62%] h-[62%] rounded-full border border-orange-500/25"></div>
      
      {/* 3. Inner Danger Core Ring (High Danger / Critical - Red zone near center) */}
      <div className="absolute w-[36%] h-[36%] rounded-full border-2 border-rose-500/35 border-dashed shadow-[inset_0_0_20px_rgba(255,0,85,0.12)]"></div>

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

      {/* Radar Distance Zone Labels */}
      <div className="absolute text-[8px] font-mono text-emerald-400/80 tracking-widest pointer-events-none" style={{ top: '8%', left: '50%', transform: 'translateX(-50%)' }}>
        OUTER: LOW THREAT
      </div>
      <div className="absolute text-[8px] font-mono text-orange-400/80 tracking-widest pointer-events-none" style={{ top: '21%', left: '50%', transform: 'translateX(-50%)' }}>
        MID: ELEVATED
      </div>
      <div className="absolute text-[8px] font-mono text-rose-400/90 font-bold tracking-widest pointer-events-none" style={{ top: '34%', left: '50%', transform: 'translateX(-50%)' }}>
        CORE: CRITICAL
      </div>

      {/* Sensor Perimeter Beacons */}
      <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '16%', left: '80%' }}>
        <div className="w-2.5 h-2.5 rotate-45 bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse"></div>
        <span className="text-[7.5px] font-mono text-cyan-300 tracking-tighter mt-0.5 bg-slate-950/90 px-1 rounded border border-cyan-800">
          SSH:2222
        </span>
      </div>

      <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '80%', left: '72%' }}>
        <div className="w-2.5 h-2.5 rotate-45 bg-emerald-400 shadow-[0_0_8px_#00ff88] animate-pulse"></div>
        <span className="text-[7.5px] font-mono text-emerald-300 tracking-tighter mt-0.5 bg-slate-950/90 px-1 rounded border border-emerald-800">
          WEB:8088
        </span>
      </div>

      <div className="absolute flex flex-col items-center pointer-events-none" style={{ top: '68%', left: '14%' }}>
        <div className="w-2.5 h-2.5 rotate-45 bg-purple-400 shadow-[0_0_8px_#a855f7] animate-pulse"></div>
        <span className="text-[7.5px] font-mono text-purple-300 tracking-tighter mt-0.5 bg-slate-950/90 px-1 rounded border border-purple-800">
          MCP:AGENT
        </span>
      </div>

      {/* Real Interactive Incident Target Blips */}
      {incidents.map((inc, idx) => {
        const { x, y, danger } = getCoordinates(inc, idx, incidents.length);
        const visuals = getDangerVisuals(danger, inc.severity);
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
            title={`Threat: ${inc.title} (Danger: ${Math.round(danger * 100)}%)`}
          >
            {/* Pulsing Ripple Wave for Red (High/Critical) and Orange (Medium) */}
            {visuals.colorName === 'red' && (
              <div className="absolute -inset-1 rounded-full bg-rose-500 opacity-80 animate-ping pointer-events-none"></div>
            )}
            {visuals.colorName === 'orange' && (
              <div className="absolute -inset-0.5 rounded-full bg-orange-400 opacity-60 animate-pulse pointer-events-none"></div>
            )}

            {/* Hover Laser Lock-On Reticle Ring */}
            {isHovered && (
              <div className={`absolute -inset-2.5 rounded-full border-2 ${visuals.border} animate-spin pointer-events-none`}></div>
            )}

            {/* Core Target Blip Dot: Green / Orange / Red */}
            <div
              className={`w-3.5 h-3.5 rounded-full ${visuals.bg} ${visuals.glow} border-2 ${visuals.border} transition-all duration-300 group-hover:scale-150 flex items-center justify-center`}
            >
              <div className="w-1 h-1 rounded-full bg-white shadow-sm"></div>
            </div>

            {/* Target Label Callout */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${visuals.badgeBg} shadow-2xl flex items-center space-x-1`}>
                <span>{inc.classification.replace(/_/g, ' ').slice(0, 16)}</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        );
      })}

      {/* Central Core Bullseye (Protected Infrastructure) */}
      <div className="absolute w-5 h-5 rounded-full border-2 border-cyan-400 bg-cyan-950/90 flex items-center justify-center pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.6)]">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff]"></div>
      </div>

      {/* Floating Target Inspection Tooltip HUD */}
      {hoveredInc && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-cyan-500/50 p-3 rounded-lg shadow-[0_0_30px_rgba(0,240,255,0.3)] font-mono text-[11px] w-72 pointer-events-none animate-fadeIn backdrop-blur-md">
          {(() => {
            const danger = getDangerScore(hoveredInc);
            const visuals = getDangerVisuals(danger, hoveredInc.severity);
            return (
              <>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-1.5">
                  <span className="text-cyan-400 font-bold uppercase flex items-center space-x-1">
                    <Crosshair className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>TARGET // {hoveredInc.id}</span>
                  </span>
                  <span className={`uppercase font-bold px-1.5 py-0.5 rounded text-[9px] border ${visuals.badgeBg}`}>
                    {visuals.level} ({Math.round(danger * 100)}%)
                  </span>
                </div>

                <div className="text-white font-bold truncate leading-tight">{hoveredInc.title}</div>
                
                <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1.5">
                  <span>IP: <strong className="text-emerald-400">{hoveredInc.source_ip}</strong></span>
                  <span className={visuals.text}>
                    ZONE: <strong>{visuals.colorName.toUpperCase()}</strong>
                  </span>
                </div>

                <div className="text-[9.5px] text-slate-400 mt-1">
                  RADIAL PROXIMITY: <strong className={visuals.text}>{Math.round(danger * 100)}% to Center Core</strong>
                </div>

                <div className="text-[9px] text-cyan-300 mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span>CLICK TO TRIAGE INCIDENT</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Radar Coordinate & Status Header */}
      <div className="absolute top-2.5 left-4 text-[9px] font-mono text-cyan-400/80 tracking-widest uppercase pointer-events-none">
        RADAR // TARGETS: {incidents.length}
      </div>
      <div className="absolute top-2.5 right-4 text-[9px] font-mono text-emerald-400/80 tracking-widest pointer-events-none">
        GRID: 3 SENSORS
      </div>
      <div className="absolute bottom-2.5 right-4 text-[9px] font-mono text-cyan-400/80 tracking-widest pointer-events-none">
        PROXIMITY: DANGER-INDEX
      </div>
      <div className="absolute bottom-2.5 left-4 text-[9px] font-mono text-slate-400 tracking-widest pointer-events-none">
        R: GREEN➔ORANGE➔RED
      </div>
    </div>
  );
};

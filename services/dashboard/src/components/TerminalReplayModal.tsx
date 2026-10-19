import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, FastForward, Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';
import { SessionItem } from '../types';

interface ReplayModalProps {
  session: SessionItem | null;
  onClose: () => void;
}

export const TerminalReplayModal: React.FC<ReplayModalProps> = ({ session, onClose }) => {
  if (!session) return null;

  const rawReplay = session.replay_data || [];
  // Fallback replay frames if none recorded
  const replayFrames = rawReplay.length > 0 ? rawReplay : [
    { t: 0.5, prompt: "root@corp-gateway:~# ", command: "uname -a", output: "Linux corp-gateway 5.15.0-89-generic #99-Ubuntu SMP Fri Nov 3 14:00:00 UTC 2026 x86_64 GNU/Linux" },
    { t: 1.5, prompt: "root@corp-gateway:~# ", command: "id", output: "uid=0(root) gid=0(root) groups=0(root)" },
    { t: 2.8, prompt: "root@corp-gateway:~# ", command: "cat /etc/passwd", output: "root:x:0:0:root:/root:/bin/bash\ndeploy:x:1000:1000:Deploy User:/home/deploy:/bin/bash" },
    { t: 4.2, prompt: "root@corp-gateway:~# ", command: "cat /etc/shadow", output: "cat: /etc/shadow: Permission denied" }
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);

  useEffect(() => {
    let timer: any;
    if (isPlaying && currentIndex < replayFrames.length - 1) {
      timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 1500 / speed);
    } else if (currentIndex >= replayFrames.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, speed, replayFrames.length]);

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)]">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-cyan-500/20">
          <div className="flex items-center space-x-2">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
              SESSION REPLAY // {session.id}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono border border-cyan-800">
              IP: {session.source_ip}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CRT Screen Display */}
        <div className="relative p-6 bg-[#02050b] min-h-[340px] max-h-[480px] overflow-y-auto font-mono text-sm leading-relaxed border-b border-cyan-500/20">
          {/* Subtle Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>

          <div className="text-emerald-500/70 text-xs mb-4">
            [+] Honeypot Session Captured: {session.start_time} | Duration: {session.duration_seconds}s
            <br />
            [+] Interactive Shell Replay Buffer Active
          </div>

          {replayFrames.slice(0, currentIndex + 1).map((frame, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <span className="text-cyan-400">{frame.prompt}</span>
                <span className="text-white tracking-wide">{frame.command}</span>
              </div>
              {frame.output && (
                <pre className="text-emerald-400/90 text-xs mt-1 whitespace-pre-wrap pl-2 border-l-2 border-emerald-500/20">
                  {frame.output}
                </pre>
              )}
            </div>
          ))}

          {isPlaying && (
            <div className="flex items-center space-x-1 text-emerald-400">
              <span className="text-cyan-400">root@corp-gateway:~# </span>
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse"></span>
            </div>
          )}
        </div>

        {/* Playback Controls Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-semibold transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
            
            <div className="flex items-center space-x-1 bg-slate-800 rounded px-2 py-1">
              <span className="text-slate-400 text-[10px]">SPEED:</span>
              {[1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    speed === s ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-400">
            FRAME <span className="text-cyan-400 font-bold">{currentIndex + 1}</span> / {replayFrames.length}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useRef } from 'react';
import { audio } from '../utils/audioEngine';
import TopographicCanvas from './TopographicCanvas';
import { Shield, Satellite, Radio, Globe, ChevronsRight } from 'lucide-react';

const SECTORS = [
  { id: '01', name: 'COMMAND GRID', icon: Globe, status: 'ONLINE' },
  { id: '02', name: 'SATELLITE UPLINK', icon: Satellite, status: 'LINKED' },
  { id: '03', name: 'SECURE CHANNEL', icon: Shield, status: 'VERIFIED' },
  { id: '04', name: 'WATCHER COMMS', icon: Radio, status: 'READY' },
];

const IntroScreen = ({ onEnter }) => {
  const [step, setStep] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [ready, setReady] = useState(false);
  const [utcNow, setUtcNow] = useState(() => new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  const timers = useRef([]);

  useEffect(() => {
    const clk = setInterval(() => {
      setUtcNow(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1000);

    let delay = 140;
    SECTORS.forEach((_, idx) => {
      const t = setTimeout(() => {
        setStep(idx + 1);
        audio.playTyping();
      }, delay);
      timers.current.push(t);
      delay += 170;
    });

    const readyTimer = setTimeout(() => setReady(true), delay + 140);
    timers.current.push(readyTimer);

    return () => {
      clearInterval(clk);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const progress = Math.min(100, Math.round((step / SECTORS.length) * 100));

  const handleEnter = () => {
    if (!ready) return;
    audio.playInitialize();
    audio.playVoiceClip('comms_online', { cooldownMs: 5000 });
    onEnter();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden select-none font-military text-[#e8eae6]"
      style={{ background: '#070a08' }}
    >
      {/* Animated Topographic / Contour Flow-Field (3-octave Noise2D Marching Squares) */}
      <TopographicCanvas speed={0.14} />

      {/* Subtle directional vignette so left lobby stays ultra-legible while contours shine on the right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(7,10,8,0.88) 0%, rgba(7,10,8,0.52) 42%, rgba(7,10,8,0.18) 100%)',
        }}
      />

      {/* Top minimal status strip */}
      <div className="relative z-10 h-12 px-6 md:px-10 border-b border-white/10 bg-[#0b0e0c]/75 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-stencil tracking-[0.28em] text-[#e8eae6]">RAVEN-X</span>
          <span className="mw4-badge px-1.5 py-0.5 text-[8px] leading-none">OPS</span>
          <span className="hidden sm:inline text-[9px] font-mono tracking-[0.22em] text-white/35 uppercase">
            GLOBAL INTELLIGENCE COMMAND
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.2em] uppercase">
          <span className="flex items-center gap-1.5 text-[#c6d67a]">
            <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-[#7fa872]' : 'bg-[#e0c243]'}`} />
            {ready ? 'UPLINK ESTABLISHED' : `BOOT ${progress}%`}
          </span>
          <span className="hidden md:inline text-white/25">|</span>
          <span className="hidden md:inline text-white/45">{utcNow}</span>
        </div>
      </div>

      {/* Main Open-Stage Lobby: Clean Left Command Rail, Open Topographic Field on Right */}
      <div className="relative z-10 h-[calc(100%-3rem)] max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col justify-center">
        <div className="w-full max-w-[420px]">
          {/* Operator Emblem Card */}
          <div className="flex items-center gap-3.5 mb-8 pb-5 border-b border-white/10">
            <div className="relative w-12 h-12 rounded-full border border-[#c6d67a]/45 bg-[#131814] flex items-center justify-center shrink-0">
              <div
                className="w-6 h-6 bg-[#d8ea96]"
                style={{
                  WebkitMaskImage: 'url(/raven_favicon.png)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: 'url(/raven_favicon.png)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7fa872] border-2 border-[#0b0e0c]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-white/45 tracking-widest">DIR</span>
                <span className="text-[15px] font-bold text-[#e8eae6] tracking-wider">01</span>
                <span className="px-2 py-0.5 bg-[#171e18] border border-[#c6d67a]/30 text-[9px] font-mono text-[#c6d67a] tracking-widest uppercase">
                  WATCHER PROGRAM
                </span>
              </div>
              <div className="text-[9px] font-mono text-white/40 tracking-[0.22em] uppercase mt-1 truncate">
                CLEARANCE // EYES ONLY
              </div>
            </div>
          </div>

          {/* Signature Hero Button */}
          <button
            onClick={handleEnter}
            onMouseEnter={() => { if (ready) audio.playHover(); }}
            disabled={!ready}
            className={`w-full text-left px-5 py-4 mb-6 flex items-center justify-between group ${
              ready
                ? 'mw4-hero-btn cursor-pointer'
                : 'bg-white/[0.03] border border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <ChevronsRight
                size={26}
                className={`shrink-0 transition-transform duration-150 ${
                  ready ? 'text-[#e4f4a4] group-hover:translate-x-1' : 'text-white/20'
                }`}
              />
              <div>
                <div className="text-[22px] md:text-[26px] font-bold tracking-[0.16em] uppercase leading-none">
                  {ready ? 'ENTER SYSTEM' : 'INITIALIZING'}
                </div>
                <div className="text-[9px] font-mono tracking-[0.24em] uppercase mt-1.5 opacity-70">
                  {ready ? 'DEPLOY TACTICAL COMMAND GRID' : `SYNCING TELEMETRY // ${progress}%`}
                </div>
              </div>
            </div>
            {ready && (
              <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#e8eae6] text-[#111413] font-bold shrink-0">
                READY
              </span>
            )}
          </button>

          {/* Clean Minimal Operational Status Rows (No tech-stack details exposed) */}
          <div className="space-y-1.5">
            {SECTORS.map((sec, idx) => {
              const isLoaded = step > idx;
              const isHovered = hoveredIdx === idx;
              const IconComp = sec.icon;
              return (
                <div
                  key={sec.id}
                  onMouseEnter={() => {
                    setHoveredIdx(idx);
                    audio.playHover();
                  }}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 ${
                    isHovered ? 'mw4-row-active' : 'mw4-row'
                  } ${isLoaded ? 'opacity-100' : 'opacity-30'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono font-bold opacity-55 shrink-0">{sec.id}</span>
                    <IconComp size={14} className={isHovered ? 'text-[#e4f4a4] shrink-0' : 'text-white/40 shrink-0'} />
                    <span className="text-[11px] font-bold tracking-[0.16em] uppercase truncate">
                      {sec.name}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 shrink-0 ${
                      isLoaded
                        ? 'text-[#c6d67a] bg-[#7fa872]/15 border border-[#7fa872]/30'
                        : 'text-white/25'
                    }`}
                  >
                    {isLoaded ? sec.status : 'WAIT'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subtle Bottom-Right Classification Stamp */}
      <div className="absolute bottom-5 right-6 md:right-10 z-10 text-right font-mono text-[9px] tracking-[0.22em] uppercase pointer-events-none">
        <div className="text-white/30">RAVEN-X // GLOBAL OPERATIONS</div>
        <div className="text-[#f07167]/65 mt-0.5">18 U.S.C. § 1030 // NOFORN</div>
      </div>
    </div>
  );
};

export default IntroScreen;

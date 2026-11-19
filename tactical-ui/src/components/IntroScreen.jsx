import React, { useEffect, useState, useRef } from 'react';
import { audio } from '../utils/audioEngine';
import { Shield, Satellite, Radio, Activity, Globe, Cpu, ChevronsRight, Crosshair } from 'lucide-react';

const SUBSYSTEMS = [
  { id: '01', name: 'CORE COMMAND KERNEL', detail: 'RAVEN_OS v9.2 // MIL-SPEC', icon: Cpu, status: 'ONLINE', level: 100 },
  { id: '02', name: 'SATELLITE & ADS-B UPLINK', detail: 'GLOBAL AIRSPACE + AIS GRID', icon: Satellite, status: 'LINKED', level: 96 },
  { id: '03', name: 'OSINT INTELLIGENCE FEED', detail: 'GDELT + NEWS + SEISMIC + FIRMS', icon: Globe, status: 'LIVE', level: 100 },
  { id: '04', name: 'CRYPTOGRAPHIC CHANNEL', detail: 'AES-256 // EYES ONLY', icon: Shield, status: 'VERIFIED', level: 100 },
  { id: '05', name: 'WATCHER-1 VOICE COMMS', detail: 'NEURAL HANDLER AUDIO LINK', icon: Radio, status: 'READY', level: 92 },
];

const IntroScreen = ({ onEnter }) => {
  const [step, setStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    let delay = 180;
    SUBSYSTEMS.forEach((_, idx) => {
      const t = setTimeout(() => {
        setStep(idx + 1);
        setSelectedIdx(idx);
        audio.playTyping();
      }, delay);
      timers.current.push(t);
      delay += 220;
    });

    const readyTimer = setTimeout(() => {
      setReady(true);
      setSelectedIdx(0);
    }, delay + 180);
    timers.current.push(readyTimer);

    return () => timers.current.forEach(clearTimeout);
  }, []);

  const progress = Math.min(100, Math.round((step / SUBSYSTEMS.length) * 100));
  const activeSys = SUBSYSTEMS[selectedIdx] || SUBSYSTEMS[0];

  const handleEnter = () => {
    if (!ready) return;
    audio.playInitialize();
    audio.playVoiceClip('comms_online', { cooldownMs: 5000 });
    onEnter();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden select-none font-military text-[#e8eae6]"
      style={{
        background:
          'radial-gradient(ellipse 75% 80% at 22% 48%, rgba(44, 58, 42, 0.55) 0%, rgba(14, 18, 15, 0.96) 55%, #090b0a 100%)',
      }}
    >
      {/* Subtle tactical blueprint grid & atmospheric spotlight */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(198,214,122,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(198,214,122,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute -right-24 top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full pointer-events-none opacity-[0.14]"
        style={{
          background: 'radial-gradient(circle, rgba(163,201,119,0.55) 0%, transparent 68%)',
        }}
      />

      {/* Top minimal status strip */}
      <div className="relative z-10 h-12 px-6 md:px-10 border-b border-white/10 bg-[#0d100e]/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-stencil tracking-[0.28em] text-[#e8eae6]">RAVEN-X</span>
          <span className="mw4-badge px-1.5 py-0.5 text-[8px] leading-none">MW4 // OPS</span>
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
          <span className="hidden md:inline text-white/40">CLEARANCE: TOP SECRET</span>
        </div>
      </div>

      {/* Main MW4 Lobby Grid: Left Vertical Command Column + Right Tactical Dossier */}
      <div className="relative z-10 h-[calc(100%-3rem)] max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ═══ LEFT COLUMN: MW4 LOBBY MENU (Screenshot 1 & 2 Style) ═══ */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {/* Operator Emblem Card (Screenshot 1 Top-Left) */}
          <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-white/10">
            <div className="relative w-12 h-12 rounded-full border border-[#c6d67a]/45 bg-[#171d18] flex items-center justify-center shrink-0">
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
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7fa872] border-2 border-[#0d100e]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-white/45 tracking-widest">DIR</span>
                <span className="text-[15px] font-bold text-[#e8eae6] tracking-wider">01</span>
                <span className="px-2 py-0.5 bg-[#1b221c] border border-[#c6d67a]/30 text-[9px] font-mono text-[#c6d67a] tracking-widest uppercase">
                  WATCHER PROGRAM
                </span>
              </div>
              <div className="text-[9px] font-mono text-white/35 tracking-[0.22em] uppercase mt-1 truncate">
                PROFILE // GLOBAL OSINT OPERATOR
              </div>
            </div>
          </div>

          {/* Signature MW4 "» ENTER SYSTEM" Hero Button (Screenshot 1 "» PLAY") */}
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
                <div className="text-[9px] font-mono tracking-[0.24em] uppercase mt-1.5 opacity-65">
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

          {/* Vertical Subsystem List (Screenshot 1 & 2 Vertical List Navigation) */}
          <div className="space-y-1.5">
            {SUBSYSTEMS.map((sys, idx) => {
              const isLoaded = step > idx;
              const isSelected = selectedIdx === idx;
              const IconComp = sys.icon;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onMouseEnter={() => {
                    setSelectedIdx(idx);
                    audio.playHover();
                  }}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left ${
                    isSelected ? 'mw4-row-active' : 'mw4-row'
                  } ${isLoaded ? 'opacity-100' : 'opacity-30'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono font-bold opacity-55 shrink-0">{sys.id}</span>
                    <IconComp size={14} className={isSelected ? 'text-[#e4f4a4] shrink-0' : 'text-white/40 shrink-0'} />
                    <span className="text-[11px] font-bold tracking-[0.16em] uppercase truncate">
                      {sys.name}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 shrink-0 ${
                      isLoaded
                        ? 'text-[#c6d67a] bg-[#7fa872]/15 border border-[#7fa872]/30'
                        : 'text-white/25'
                    }`}
                  >
                    {isLoaded ? sys.status : 'WAIT'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN: MW4 ARMORY / TELEMETRY PREVIEW CARD (Screenshot 2 & 3 Style) ═══ */}
        <div className="hidden lg:flex lg:col-span-7 flex-col bg-[#121513]/90 border border-white/10 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Crosshair size={15} className="text-[#c6d67a]" />
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-white/75">
                SUBSYSTEM TELEMETRY // {activeSys.id}
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#c6d67a] tracking-widest uppercase">
              {activeSys.status}
            </span>
          </div>

          <div className="mb-6">
            <div className="text-[26px] font-bold tracking-[0.12em] uppercase text-[#e8eae6] leading-tight">
              {activeSys.name}
            </div>
            <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#c6d67a]/80 mt-1">
              {activeSys.detail}
            </div>
          </div>

          {/* MW4 Sage-Green Progress Bars (Screenshot 3 Volume/Level Bars) */}
          <div className="space-y-3.5 mb-6">
            {[
              { label: 'SIGNAL INTEGRITY', val: step >= 2 ? 98 : progress },
              { label: 'DATA PIPELINE SYNC', val: step >= 3 ? 100 : Math.min(progress, 65) },
              { label: 'VOICE COMMS LATENCY', val: step >= 5 ? 94 : Math.min(progress, 40) },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between items-center text-[9px] font-mono tracking-[0.2em] uppercase mb-1.5">
                  <span className="text-white/55">{metric.label}</span>
                  <span className="text-[#c6d67a] font-bold">{metric.val}%</span>
                </div>
                <div className="w-full h-2 bg-[#1c211d] border border-white/8 overflow-hidden">
                  <div
                    className="h-full bg-[#7fa872] transition-all duration-300"
                    style={{ width: `${metric.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Classification Footer */}
          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-mono tracking-[0.18em] uppercase">
            <span className="flex items-center gap-2 text-white/45">
              <Activity size={12} className="text-[#7fa872]" />
              ALL SENSORS NOMINAL
            </span>
            <span className="text-[#f07167]/80">18 U.S.C. § 1030 // NOFORN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;

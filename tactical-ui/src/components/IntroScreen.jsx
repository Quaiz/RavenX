import React, { useEffect, useState, useRef } from 'react';
import { audio } from '../utils/audioEngine';
import TopographicCanvas from './TopographicCanvas';
import { Shield, Satellite, Radio, Globe, Cpu, ChevronsRight, Crosshair, Clock, Wifi } from 'lucide-react';

const SUBSYSTEMS = [
  {
    id: '01',
    name: 'CORE COMMAND KERNEL',
    detail: 'RAVEN-X OSINT ENGINE // v9.2',
    icon: Cpu,
    status: 'ONLINE',
    specs: [
      { k: 'ARCHITECTURE', v: 'FLASK + REACT TACTICAL GRID' },
      { k: 'WORKSPACES', v: 'TACTICAL / OSINT / MACRO' },
      { k: 'RENDER MODE', v: 'MATTE 60FPS HARDWARE ACCEL' },
      { k: 'ACCESS POLICY', v: 'SESSION TOKEN + RATE LIMIT' },
    ],
  },
  {
    id: '02',
    name: 'SATELLITE & ADS-B UPLINK',
    detail: 'GLOBAL AIRSPACE + MARITIME AIS',
    icon: Satellite,
    status: 'LINKED',
    specs: [
      { k: 'AIRSPACE', v: 'ADS-B LIVE TRANSPONDER FEED' },
      { k: 'MARITIME', v: 'AIS CHOKEPOINT TELEMETRY' },
      { k: 'ORBITAL', v: 'TLE SATELLITE PASS TRACKER' },
      { k: 'PROJECTION', v: '3D GLOBE + 2D TACTICAL MAP' },
    ],
  },
  {
    id: '03',
    name: 'OSINT INTELLIGENCE FEED',
    detail: 'GDELT + NEWS + SEISMIC + FIRMS',
    icon: Globe,
    status: 'LIVE',
    specs: [
      { k: 'CONFLICT DATA', v: 'GDELT GLOBAL EVENT STREAM' },
      { k: 'GEOPHYSICS', v: 'USGS SEISMIC + NASA FIRMS' },
      { k: 'NEWS WIRE', v: 'MULTI-SOURCE RSS AGGREGATOR' },
      { k: 'STORAGE', v: 'DUCKDB + PARQUET PIPELINE' },
    ],
  },
  {
    id: '04',
    name: 'CRYPTOGRAPHIC CHANNEL',
    detail: 'TLS 1.3 // STRICT CSP // SSRF GUARD',
    icon: Shield,
    status: 'VERIFIED',
    specs: [
      { k: 'TRANSPORT', v: 'HTTPS TLS 1.3 + HSTS' },
      { k: 'XSS DEFENSE', v: 'DOMPURIFY + STRICT CSP' },
      { k: 'PROXY GUARD', v: 'PUBLIC-IP SSRF VALIDATION' },
      { k: 'CLASSIFICATION', v: 'TOP SECRET // NOFORN' },
    ],
  },
  {
    id: '05',
    name: 'WATCHER-1 VOICE COMMS',
    detail: 'NEURAL HANDLER AUDIO BRIEFINGS',
    icon: Radio,
    status: 'READY',
    specs: [
      { k: 'SYNTHESIS', v: 'CLOUD NEURAL VOICE CLONE' },
      { k: 'CANNED ALERTS', v: '9 PRELOADED TACTICAL CLIPS' },
      { k: 'AI BRIEFINGS', v: 'FULL-TEXT STREAMED PLAYBACK' },
      { k: 'AUDIO ENGINE', v: 'WEB AUDIO API QUEUE' },
    ],
  },
];

const IntroScreen = ({ onEnter }) => {
  const [step, setStep] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [utcNow, setUtcNow] = useState(() => new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
  const [backendProbe, setBackendProbe] = useState({ status: 'PROBING', latencyMs: null });
  const timers = useRef([]);

  useEffect(() => {
    // Live UTC clock
    const clk = setInterval(() => {
      setUtcNow(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1000);

    // Real backend /api/health latency probe
    const t0 = performance.now();
    fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/health`)
      .then((res) => {
        const ms = Math.round(performance.now() - t0);
        setBackendProbe({ status: res.ok ? 'ONLINE' : `HTTP ${res.status}`, latencyMs: ms });
      })
      .catch(() => {
        setBackendProbe({ status: 'OFFLINE', latencyMs: null });
      });

    // Sequential subsystem reveal
    let delay = 140;
    SUBSYSTEMS.forEach((_, idx) => {
      const t = setTimeout(() => {
        setStep(idx + 1);
        setSelectedIdx(idx);
        audio.playTyping();
      }, delay);
      timers.current.push(t);
      delay += 180;
    });

    const readyTimer = setTimeout(() => {
      setReady(true);
      setSelectedIdx(0);
    }, delay + 140);
    timers.current.push(readyTimer);

    return () => {
      clearInterval(clk);
      timers.current.forEach(clearTimeout);
    };
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
          'radial-gradient(ellipse 75% 80% at 22% 48%, rgba(36, 48, 35, 0.55) 0%, rgba(12, 15, 13, 0.97) 58%, #080a09 100%)',
      }}
    >
      {/* Animated Topographic / Contour Flow-Field Background */}
      <TopographicCanvas />

      {/* Subtle edge vignette to keep foreground crisp */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(6, 8, 7, 0.72) 100%)',
        }}
      />

      {/* Top minimal status strip */}
      <div className="relative z-10 h-12 px-6 md:px-10 border-b border-white/10 bg-[#0d100e]/85 flex items-center justify-between">
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

      {/* Main Two-Column Lobby: Left Command Column + Right Live Telemetry Card */}
      <div className="relative z-10 h-[calc(100%-3rem)] max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ═══ LEFT COLUMN: OPERATOR CARD + ENTER SYSTEM + SUBSYSTEM LIST ═══ */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          {/* Operator Emblem Card */}
          <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-white/10">
            <div className="relative w-12 h-12 rounded-full border border-[#c6d67a]/45 bg-[#151b16] flex items-center justify-center shrink-0">
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
              <div className="text-[9px] font-mono text-white/40 tracking-[0.22em] uppercase mt-1 truncate">
                PROFILE // GLOBAL OSINT OPERATOR
              </div>
            </div>
          </div>

          {/* Signature Hero Action Button */}
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

          {/* Vertical Subsystem Navigation List */}
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

        {/* ═══ RIGHT COLUMN: REAL LIVE TELEMETRY & SUBSYSTEM DOSSIER ═══ */}
        <div className="hidden lg:flex lg:col-span-7 flex-col bg-[#111512]/88 border border-white/10 p-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Crosshair size={15} className="text-[#c6d67a]" />
              <span className="text-[11px] font-bold tracking-[0.24em] uppercase text-white/75">
                SUBSYSTEM BRIEF // {activeSys.id}
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

          {/* Real Factual Subsystem Spec Grid (No fake percentage bars) */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {activeSys.specs.map((item) => (
              <div
                key={item.k}
                className="bg-[#0c0f0d]/85 border border-white/8 px-3.5 py-3"
              >
                <div className="text-[8px] font-mono tracking-[0.22em] uppercase text-white/35 mb-1">
                  {item.k}
                </div>
                <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#e8eae6]/90">
                  {item.v}
                </div>
              </div>
            ))}
          </div>

          {/* Real Live Node Health Strip */}
          <div className="flex items-center justify-between bg-[#0c0f0d]/85 border border-white/8 px-3.5 py-2.5 mb-5 font-mono text-[9px] tracking-[0.18em] uppercase">
            <span className="flex items-center gap-2 text-white/55">
              <Wifi size={12} className={backendProbe.status === 'ONLINE' ? 'text-[#7fa872]' : 'text-[#e0c243]'} />
              API NODE: <span className="text-[#c6d67a] font-bold">{backendProbe.status}</span>
              {backendProbe.latencyMs !== null && (
                <span className="text-white/40">({backendProbe.latencyMs} MS)</span>
              )}
            </span>
            <span className="flex items-center gap-1.5 text-white/45">
              <Clock size={11} className="text-white/35" />
              {utcNow.slice(11)}
            </span>
          </div>

          {/* Bottom Classification Footer */}
          <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-mono tracking-[0.18em] uppercase">
            <span className="text-white/45">CLEARANCE: EYES ONLY</span>
            <span className="text-[#f07167]/80">18 U.S.C. § 1030 // NOFORN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;

import React, { useEffect, useState, useRef } from 'react';
import { audio } from '../utils/audioEngine';

const PRIMARY = 'rgb(var(--color-primary))';
const PRIMARY_RGBA = (alpha) => `rgba(var(--color-primary), ${alpha})`;

const BOOT_LINES = [
 { text: 'KERNEL BOOT SEQUENCE INITIATED...', color: 'rgba(255,255,255,0.5)' },
 { text: 'CRYPTOGRAPHIC MODULES....................[OK]', color: '#4ade80' },
 { text: 'SECURE UPLINK ESTABLISHED................[OK]', color: '#4ade80' },
 { text: 'OSINT DATA PIPELINE......................[OK]', color: '#4ade80' },
 { text: 'SATELLITE CHANNEL BINDING................[OK]', color: '#4ade80' },
 { text: 'GDELT CONFLICT FEED...................[LIVE]', color: PRIMARY },
 { text: 'GOOGLE NEWS RSS.......................[LIVE]', color: PRIMARY },
 { text: 'FOREX / CRYPTO TELEMETRY..............[LIVE]', color: PRIMARY },
 { text: 'NASA FIRMS FIRE DETECTION.............[LIVE]', color: PRIMARY },
 { text: 'NUCLEAR FACILITY MONITOR..............[LIVE]', color: PRIMARY },
 { text: '', color: '' },
 { text: 'AUTHORIZATION LEVEL: UNRESTRICTED', color: '#ffffff' },
 { text: 'CLASSIFICATION: TOP SECRET // NOFORN', color: '#f87171' },
 { text: '', color: '' },
 { text: 'ALL SYSTEMS NOMINAL. AWAITING OPERATOR.', color: 'rgba(255,255,255,0.7)' },
];

const IntroScreen = ({ onEnter }) => {
 const [visibleLines, setVisibleLines] = useState([]);
 const [progress, setProgress] = useState(0);
 const [booted, setBooted] = useState(false);
 const [showEnter, setShowEnter] = useState(false);
 const timers = useRef([]);

 useEffect(() => {
 let delay = 200;
 BOOT_LINES.forEach((line, i) => {
 const t = setTimeout(() => {
 setVisibleLines(prev => [...prev, line]);
 setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
 if (line.text) audio.playTyping();
 }, delay);
 timers.current.push(t);
 delay += line.text === '' ? 120 : 180;
 });

 const bootedTimer = setTimeout(() => setBooted(true), delay + 200);
 const enterTimer = setTimeout(() => setShowEnter(true), delay + 500);
 timers.current.push(bootedTimer, enterTimer);

 return () => timers.current.forEach(clearTimeout);
 }, []);

 return (
 <div className="fixed inset-0 z-[99999] overflow-hidden select-none font-military font-bold"
 style={{ background: '#05070a' }}>
 <div className="h-full flex flex-col items-center justify-center py-2 md:py-4 relative">

 {/* Scanlines */}
 <div className="absolute inset-0 pointer-events-none"style={{
 background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.12) 3px,rgba(0,0,0,0.12) 4px)',
 zIndex: 1,
 }} />

 {/* Radial glow — bright */}
 <div className="absolute inset-0 pointer-events-none"style={{
 background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${PRIMARY_RGBA(0.09)} 0%, transparent 70%)`,
 zIndex: 1,
 }} />

 {/* Corner brackets */}
 {['top-6 left-6 border-t-2 border-l-2', 'top-6 right-6 border-t-2 border-r-2',
 'bottom-6 left-6 border-b-2 border-l-2', 'bottom-6 right-6 border-b-2 border-r-2'].map((cls, i) => (
 <div key={i} className={`absolute w-10 h-10 ${cls}`} style={{ borderColor: PRIMARY_RGBA(0.35), zIndex: 2 }} />
 ))}

 {/* Horizontal rule lines */}
 <div className="absolute top-0 left-0 right-0 h-px"style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY_RGBA(0.2)}, transparent)` }} />
 <div className="absolute bottom-0 left-0 right-0 h-px"style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY_RGBA(0.2)}, transparent)` }} />

 <div className="relative flex flex-col items-center w-full max-w-xl px-4 md:px-8"style={{ zIndex: 3 }}>

 {/* ─── Logo ─── */}
 <div className="relative mb-2 md:mb-4 flex items-center justify-center">
 <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-2 relative"
 style={{
 borderColor: booted ? PRIMARY : 'rgba(255,255,255,0.12)',
 background: booted ? PRIMARY_RGBA(0.08) : 'rgba(255,255,255,0.01)',
 transition: 'border-color 0.6s, background 0.6s',
 boxShadow: booted ? `0 0 50px ${PRIMARY_RGBA(0.25)}, inset 0 0 30px ${PRIMARY_RGBA(0.05)}` : 'none',
 }}>
 <div
 className="bg-current"
 style={{
 width: 40,
 height: 40,
 color: booted ? PRIMARY : 'rgba(255,255,255,0.25)',
 transition: 'color 0.6s',
 filter: booted ? `drop-shadow(0 0 8px ${PRIMARY})` : 'none',
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

 {/* Animated corner accents */}
 {booted && ['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
 <div key={i} className={`absolute w-2 h-2 ${pos}`}
 style={{ background: PRIMARY, opacity: 0.8, animation: `cornerBlink 1.5s ease-in-out ${i * 0.2}s infinite alternate` }} />
 ))}
 </div>

 {/* Spinning orbit */}
 <div className="absolute rounded-full border"style={{
 inset: -14,
 borderColor: PRIMARY_RGBA(0.2),
 animation: 'spin 20s linear infinite',
 }} />
 <div className="absolute rounded-full border"style={{
 inset: -24,
 borderColor: 'rgba(255,255,255,0.04)',
 animation: 'spin 35s linear infinite reverse',
 }} />
 </div>

 <div className="mb-1 tracking-[0.2em] text-[32px] md:text-[42px] leading-none font-stencil text-white"style={{ textShadow: `0 0 15px ${PRIMARY_RGBA(0.3)}` }}>
 RAVEN-X
 </div>
 <div className="mb-2 md:mb-6 tracking-[0.4em] text-[9px] md:text-[12px] font-bold uppercase text-center"style={{ color: PRIMARY_RGBA(0.7) }}>
 // GLOBAL INTELLIGENCE PLATFORM V8.1.0
 </div>

 {/* Boot log */}
 <div className="w-full text-[8px] md:text-[10px] leading-5 md:leading-6 min-h-[140px] md:min-h-[160px]">
 {visibleLines.map((line, i) => (
 <div key={i} className="flex gap-3">
 {line.text && (
 <span className="shrink-0"style={{ color: 'rgba(255,255,255,0.2)', minWidth: 20 }}>
 {String(i + 1).padStart(2, '0')}
 </span>
 )}
 <span style={{ color: line.color }}>{line.text}</span>
 </div>
 ))}
 {/* Cursor */}
 {!booted && (
 <span className="inline-block w-2 h-[10px] ml-10 align-middle"
 style={{ background: PRIMARY, animation: 'blink 1s step-end infinite' }} />
 )}
 </div>

 {/* Progress bar */}
 <div className="w-full mt-2 mb-4 md:mt-4 md:mb-6">
 <div className="flex justify-between items-center mb-2">
 <span className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase"style={{ color: 'rgba(255,255,255,0.4)' }}>BOOT PROGRESS</span>
 <span className="text-[10px] md:text-[12px] tracking-widest font-bold"style={{ color: PRIMARY }}>{progress}%</span>
 </div>
 <div className="w-full h-px"style={{ background: 'rgba(255,255,255,0.06)' }}>
 <div className="h-full transition-all duration-200 ease-out relative"
 style={{ width: `${progress}%`, background: PRIMARY }}>
 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 -mt-0.5"
 style={{ background: PRIMARY, boxShadow: `0 0 6px ${PRIMARY}` }} />
 </div>
 </div>
 </div>

 {/* ENTER SYSTEM button */}
 <div style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 {showEnter ? (
 <button
 onClick={() => { audio.playClick(); onEnter(); }}
 onMouseEnter={() => audio.playHover()}
 className="px-6 py-2 md:px-10 md:py-3 font-stencil text-[14px] md:text-[16px] tracking-[0.2em] uppercase transition-all border-4"
 style={{
 borderColor: PRIMARY,
 color: '#05070a',
 background: PRIMARY,
 boxShadow: `0 0 30px ${PRIMARY_RGBA(0.35)}, 0 0 60px ${PRIMARY_RGBA(0.1)}`,
 animation: 'enterPulse 2s ease-in-out infinite',
 }}
 >
 [ ENTER SYSTEM ]
 </button>
 ) : (
 <div className="text-[10px] md:text-[12px] tracking-[0.35em] uppercase text-white/30">
 INITIALIZING...
 </div>
 )}
 </div>

 {/* Classification */}
 <div className="mt-2 md:mt-4 px-4 py-1.5 md:py-2 border-2 text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase text-center"
 style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.6)' }}>
 UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE — 18 U.S.C. § 1030
 </div>
 </div>

 <style>{`
 @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
 @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
 @keyframes cornerBlink { from{opacity:0.4} to{opacity:1} }
 @keyframes enterPulse {
 0%,100% { box-shadow: 0 0 30px rgba(var(--color-primary),0.35), 0 0 60px rgba(var(--color-primary),0.10); }
 50% { box-shadow: 0 0 50px rgba(var(--color-primary),0.55), 0 0 90px rgba(var(--color-primary),0.20); }
 }
 `}</style>
 </div>
 </div>
 );
};

export default IntroScreen;


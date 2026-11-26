import React, { useState, useEffect } from 'react';
import { MessageSquare, Volume2, VolumeX, Square, X } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import AIAnalyst from './AIAnalyst';

/**
 * Watcher02CommsHUD
 * - Only displayed when toggled ON from the Left Vertical Command Bar.
 * - Anchored at bottom-left (`bottom-8 left-14`):
 *   - Chat / Command Drawer (`AIAnalyst`) sits ABOVE.
 *   - `WATCHER-02` Active Speaker Card sits at the BOTTOM.
 * - All voice/chat controls are embedded neatly inside the Active Speaker card.
 * - Diegetic subtitle bar is offset to the open Map area (`md:left-[490px]`) so it never overlaps WATCHER-02 or Chat.
 */
const Watcher02CommsHUD = ({ isOpen, onClose }) => {
  const [voiceState, setVoiceState] = useState({ isSpeaking: false, subtitle: '', mode: 'IDLE' });
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(() => audio.voiceEnabled);
  const [vuLevel, setVuLevel] = useState(0);
  const [vuPeak, setVuPeak] = useState(0);

  useEffect(() => {
    return audio.subscribeVoice((st) => {
      setVoiceState(st);
      if (!st.isSpeaking) {
        setVuLevel(0);
        setVuPeak(0);
      }
    });
  }, []);

  // Real-time Web Audio API amplitude meter (0 when silent, rises/falls dynamically with actual voice audio)
  useEffect(() => {
    if (!voiceState.isSpeaking) {
      setVuLevel(0);
      setVuPeak(0);
      return;
    }
    let rafId;
    let currentSmooth = 0;
    let currentPeak = 0;

    const tick = () => {
      const raw = audio.getVoiceLevel();
      currentSmooth = raw > currentSmooth
        ? currentSmooth * 0.35 + raw * 0.65
        : currentSmooth * 0.82 + raw * 0.18;
      if (currentSmooth < 0.01) currentSmooth = 0;

      if (currentSmooth >= currentPeak) {
        currentPeak = Math.min(0.98, currentSmooth + 0.03);
      } else {
        currentPeak = Math.max(currentSmooth, currentPeak - 0.012);
      }
      if (currentPeak < 0.015) currentPeak = 0;

      setVuLevel(currentSmooth);
      setVuPeak(currentPeak);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [voiceState.isSpeaking]);

  const toggleVoiceMute = (e) => {
    e.stopPropagation();
    const next = !voiceEnabled;
    audio.setVoiceEnabled(next);
    setVoiceEnabled(next);
    if (next) {
      audio.playVoiceClip('comms_online', { cooldownMs: 500 });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ═══ BOTTOM-LEFT WATCHER-02 STACK (Chat ABOVE, Active Speaker Card BELOW) ═══ */}
      <div className="fixed bottom-8 left-14 z-[9500] flex flex-col items-start select-none pointer-events-none">
        {/* 1. CHAT / COMMAND PANEL (Positioned ABOVE Active Speaker Card) */}
        {isChatOpen && (
          <div className="mb-2 w-[390px] sm:w-[435px] max-w-[calc(100vw-4.5rem)] h-[390px] bg-[#060d08]/95 border border-[#4bd865]/45 shadow-[0_20px_50px_rgba(0,0,0,0.92)] flex flex-col overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
            <AIAnalyst />
          </div>
        )}

        {/* 2. ACTIVE SPEAKER BANNER (Positioned at BOTTOM, with all controls embedded neatly inside) */}
        <div className="pointer-events-auto animate-in fade-in slide-in-from-left-3 duration-200">
          <div
            className="w-[390px] sm:w-[435px] max-w-[calc(100vw-4.5rem)] border border-[#4bd865]/50 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.92)] relative overflow-hidden"
            style={{
              background:
                'linear-gradient(90deg, rgba(42,96,48,0.92) 0%, rgba(24,56,29,0.94) 48%, rgba(10,20,12,0.97) 100%)',
            }}
          >
            {/* CRT Scanline texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)',
              }}
            />

            <div className="relative z-10 flex items-stretch h-[92px]">
              {/* Left Column: ON.SE1 + 2 Circular Indicator Sockets */}
              <div className="w-[68px] flex flex-col justify-between py-1.5 px-1.5 shrink-0">
                <span className="text-[11px] font-mono font-bold text-[#39e75f] tracking-wider drop-shadow-[0_0_6px_rgba(57,231,95,0.65)]">
                  ON.SE1
                </span>

                <div className="flex items-center gap-2.5 pb-0.5">
                  {/* Active Green Node (Static, no blinking ping) */}
                  <div className="w-4 h-4 rounded-full bg-[#050806] border-2 border-[#39e75f]/85 flex items-center justify-center shadow-[0_0_6px_rgba(57,231,95,0.5)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#39e75f]" />
                  </div>
                  {/* Secondary Cyan-Ring Node */}
                  <div className="w-4 h-4 rounded-full bg-[#050806] border-2 border-[#48b8d0]/75 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0c181a]" />
                  </div>
                </div>
              </div>

              {/* Vertical Bright Green Divider Bar */}
              <div className="w-[4px] h-full bg-[#39e75f] shadow-[0_0_10px_rgba(57,231,95,0.75)] shrink-0 mr-2" />

              {/* Square Black-Background Portrait */}
              <div className="w-[92px] h-[92px] bg-[#050806] border border-[#39e75f]/40 overflow-hidden relative shrink-0">
                <img
                  src="/watcher02_avatar.png?v=3"
                  alt="WATCHER-02"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Right Column: ACTIVE SPEAKER + Embedded Action Buttons / WATCHER-02 / ID & RANK / Continuous VU Bar */}
              <div className="flex-1 pl-3 pr-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono font-bold tracking-[0.18em] text-[#4de068] uppercase leading-none truncate">
                      ACTIVE SPEAKER
                    </span>

                    {/* Embedded Controls inside Active Speaker Card */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle Chat Panel Above */}
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick?.();
                          setIsChatOpen((prev) => !prev);
                        }}
                        title={isChatOpen ? 'Hide Comms Terminal' : 'Open Comms Terminal'}
                        className={`h-5 px-1.5 border text-[8px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isChatOpen
                            ? 'bg-[#39e75f]/20 border-[#39e75f]/65 text-[#eef6ee]'
                            : 'bg-[#071109]/80 border-[#39e75f]/30 text-[#4de068]/70 hover:text-[#eef6ee]'
                        }`}
                      >
                        <MessageSquare size={10} />
                        <span>COMMS</span>
                      </button>

                      {/* Stop Speaking (visible while speaking) */}
                      {voiceState.isSpeaking && (
                        <button
                          type="button"
                          onClick={() => audio.stopSpeaking()}
                          title="Stop Current Voice Transmission"
                          className="h-5 w-5 bg-[#261111] border border-[#ef5350]/60 text-[#ff6b6b] hover:bg-[#e05252] hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Square size={9} />
                        </button>
                      )}

                      {/* Mute / Unmute Voice */}
                      <button
                        type="button"
                        onClick={toggleVoiceMute}
                        title={voiceEnabled ? 'Mute Voice Audio' : 'Unmute Voice Audio'}
                        className={`h-5 w-5 border flex items-center justify-center transition-colors cursor-pointer ${
                          voiceEnabled
                            ? 'bg-[#071109]/80 border-[#39e75f]/40 text-[#39e75f] hover:border-[#39e75f]'
                            : 'bg-[#261111] border-[#ef5350]/50 text-[#ef5350]'
                        }`}
                      >
                        {voiceEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
                      </button>

                      {/* Close WATCHER-02 HUD */}
                      <button
                        type="button"
                        onClick={() => {
                          audio.playClick?.();
                          onClose?.();
                        }}
                        title="Close WATCHER-02"
                        className="h-5 w-5 bg-[#261111] border border-[#ef5350]/55 hover:bg-[#e05252] text-[#ff6b6b] hover:text-[#090c09] font-mono text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="text-[22px] sm:text-[24px] font-bold text-[#f2faf2] tracking-[0.04em] leading-none mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] truncate">
                    WATCHER-02
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-[0.15em] text-[#a3cca7] uppercase mt-1">
                    <span>ID 63-894-08</span>
                    <span className="text-[#4de068]/85">RANK AI-DIR</span>
                  </div>
                </div>

                {/* Continuous Solid Green Audio Level Bar (0% when silent, rises/falls with real voice audio) */}
                <div className="h-[22px] w-full bg-[#071109]/75 border border-[#39e75f]/25 relative overflow-hidden">
                  {vuLevel > 0.01 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${(vuLevel * 100).toFixed(1)}%`,
                        background: 'linear-gradient(90deg, #27c93f 0%, #38ea52 45%, #48ff62 100%)',
                        boxShadow: '0 0 12px rgba(57,231,95,0.45)',
                      }}
                    />
                  )}
                  {vuPeak > 0.02 && (
                    <div
                      className="absolute top-0 bottom-0 w-[4px] bg-[#48ff62] shadow-[0_0_8px_#48ff62]"
                      style={{
                        left: `calc(${(vuPeak * 100).toFixed(1)}% + 3px)`,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Sub-Strip: RECEIVING COMMUNICATIONS..  CHANNEL OPEN */}
          <div className="flex items-center justify-between px-1 pt-1 text-[10px] font-mono font-bold tracking-[0.16em] uppercase">
            <div className="flex items-center gap-4">
              <span className="text-[#48b8d0] drop-shadow-[0_0_6px_rgba(72,184,208,0.4)]">
                {voiceState.isSpeaking ? 'RECEIVING COMMUNICATIONS..' : 'STANDBY ON TACTICAL NET..'}
              </span>
              <span className="text-[#4de068]">CHANNEL OPEN</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Watcher02CommsHUD;

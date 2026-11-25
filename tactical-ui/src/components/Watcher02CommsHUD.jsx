import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Plus, Radio, Square, X } from 'lucide-react';
import { audio } from '../utils/audioEngine';
import AIAnalyst from './AIAnalyst';

/**
 * Watcher02CommsHUD
 * Diegetic Call of Duty: Modern Warfare 4 "Watcher Program" Active Speaker & Comms HUD.
 * - Compact tactical Mic button strip at top-left (next to the left vertical command rail).
 * - Automatically slides out the WATCHER-02 Active Speaker card (with ON.SE1, black-bg portrait,
 *   ID 63-894-08, and live green barcode spectrum) whenever WATCHER-02 speaks, and collapses when done.
 * - Clicking the Mic button opens/closes the WATCHER-02 tactical briefing/command drawer.
 */
const Watcher02CommsHUD = () => {
  const [voiceState, setVoiceState] = useState({ isSpeaking: false, subtitle: '', mode: 'IDLE' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      // Fast attack, smooth release
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

  const triggerQuickVoiceCheck = (e) => {
    e.stopPropagation();
    if (!voiceEnabled) {
      audio.setVoiceEnabled(true);
      setVoiceEnabled(true);
    }
    if (voiceState.isSpeaking) {
      audio.stopSpeaking();
    } else {
      audio.playVoiceClip('briefing_ready', { cooldownMs: 500, interrupt: true });
    }
  };

  const showSpeakerBanner = voiceState.isSpeaking || isDrawerOpen;

  return (
    <>
      {/* ═══ TOP-LEFT WATCHER-02 COMMS HUD (Exact MW4 Watcher Program Layout) ═══ */}
      <div className="fixed top-3 left-14 z-[9500] flex flex-col items-start select-none pointer-events-none">
        {/* Top Comms Roster Strip (Mic Button + Tactical Channel Slots) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Cyan-tinted tactical lead block (from Image 1 & 2) */}
          <div
            className="hidden sm:block w-11 h-11 border border-[#48b8d0]/25"
            style={{
              background: 'linear-gradient(135deg, rgba(35,110,120,0.42) 0%, rgba(10,20,22,0.85) 100%)',
            }}
          />

          {/* Bright green vertical channel lock bar + Main Mic Button */}
          <div className="flex items-center h-11">
            <div
              className={`w-[3px] h-full transition-colors ${
                voiceState.isSpeaking
                  ? 'bg-[#39e75f] shadow-[0_0_10px_#39e75f]'
                  : isDrawerOpen
                  ? 'bg-[#7fa872]'
                  : 'bg-[#39e75f]/65'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                audio.playClick?.();
                setIsDrawerOpen((prev) => !prev);
              }}
              title="WATCHER-02 Tactical Handler (Click to open Comms / Briefing)"
              className={`w-12 h-11 flex items-center justify-center relative transition-all cursor-pointer border ${
                isDrawerOpen || voiceState.isSpeaking
                  ? 'bg-[#132616]/95 border-[#39e75f]/65 shadow-[0_0_16px_rgba(57,231,95,0.25)]'
                  : 'bg-[#0e1710]/90 border-[#39e75f]/30 hover:bg-[#152417] hover:border-[#39e75f]/55'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${
                  voiceState.isSpeaking
                    ? 'border-[#39e75f] bg-[#2a1d17]/80 scale-105 shadow-[0_0_10px_rgba(57,231,95,0.4)]'
                    : 'border-[#59c96b]/70 bg-[#231915]/70'
                }`}
              >
                {voiceEnabled ? (
                  <Mic size={14} className="text-[#f5e6d8] drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
                ) : (
                  <MicOff size={14} className="text-[#ef5350]" />
                )}
              </div>
              {voiceState.isSpeaking && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-[2px]">
                  <span className="w-[2px] h-2 bg-[#39e75f] animate-pulse" />
                  <span className="w-[2px] h-2.5 bg-[#39e75f] animate-pulse" />
                  <span className="w-[2px] h-2 bg-[#39e75f] animate-pulse" />
                </span>
              )}
            </button>
          </div>

          {/* Slot 2: Quick Voice Check / Stop Speaking [ + ] */}
          <button
            type="button"
            onClick={triggerQuickVoiceCheck}
            title={voiceState.isSpeaking ? 'Stop Voice Transmission' : 'Test WATCHER-02 Voice Channel'}
            className="w-11 h-11 bg-[#080c09]/85 border border-white/10 hover:border-[#39e75f]/45 flex items-center justify-center text-[#7fa872]/60 hover:text-[#39e75f] transition-colors cursor-pointer"
          >
            {voiceState.isSpeaking ? <Square size={12} className="text-[#ef5350]" /> : <Plus size={14} />}
          </button>

          {/* Slot 3: Voice Channel Mute / Unmute [ ((•)) ] */}
          <button
            type="button"
            onClick={toggleVoiceMute}
            title={voiceEnabled ? 'Mute WATCHER-02 Voice' : 'Unmute WATCHER-02 Voice'}
            className={`w-11 h-11 bg-[#080c09]/85 border flex items-center justify-center transition-colors cursor-pointer ${
              voiceEnabled
                ? 'border-[#39e75f]/30 text-[#39e75f]'
                : 'border-[#ef5350]/40 text-[#ef5350]/70'
            }`}
          >
            <Radio size={14} />
          </button>
        </div>

        {/* ═══ ACTIVE SPEAKER BANNER (Image 2 Replica: ON.SE1 + Portrait + WATCHER-02 + Barcode VU) ═══ */}
        {showSpeakerBanner && (
          <div className="mt-1.5 pointer-events-auto animate-in fade-in slide-in-from-left-3 duration-200">
            <div
              className="w-[390px] sm:w-[435px] max-w-[calc(100vw-4.5rem)] border border-[#4bd865]/45 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.9)] relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(90deg, rgba(42,96,48,0.88) 0%, rgba(24,56,29,0.92) 48%, rgba(10,20,12,0.95) 100%)',
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
                    {/* Active Green Node */}
                    <div className="w-4 h-4 rounded-full bg-[#050806] border-2 border-[#39e75f]/85 flex items-center justify-center shadow-[0_0_6px_rgba(57,231,95,0.5)]">
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-[#39e75f] ${
                          voiceState.isSpeaking ? 'animate-ping' : ''
                        }`}
                      />
                    </div>
                    {/* Secondary Cyan-Ring Node */}
                    <div className="w-4 h-4 rounded-full bg-[#050806] border-2 border-[#48b8d0]/75 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0c181a]" />
                    </div>
                  </div>
                </div>

                {/* Vertical Bright Green Divider Bar */}
                <div className="w-[4px] h-full bg-[#39e75f] shadow-[0_0_10px_rgba(57,231,95,0.75)] shrink-0 mr-2" />

                {/* Square Black-Background Portrait (Image 3 processed) */}
                <div className="w-[92px] h-[92px] bg-[#050806] border border-[#39e75f]/35 overflow-hidden relative shrink-0">
                  <img
                    src="/watcher02_avatar.png?v=3"
                    alt="WATCHER-02"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Right Column: ACTIVE SPEAKER / WATCHER-02 / ID & RANK / Barcode Spectrum */}
                <div className="flex-1 pl-3 pr-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-[#4de068] uppercase leading-none">
                        ACTIVE SPEAKER
                      </span>
                      {isDrawerOpen && !voiceState.isSpeaking && (
                        <button
                          type="button"
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-white/40 hover:text-white cursor-pointer"
                          title="Collapse WATCHER-02"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <div className="text-[22px] sm:text-[24px] font-bold text-[#f2faf2] tracking-[0.04em] leading-none mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] truncate">
                      WATCHER-02
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold tracking-[0.15em] text-[#a3cca7] uppercase mt-1">
                      <span>ID 63-894-08</span>
                      <span className="text-[#7fa872]/80">RANK AI-DIR</span>
                    </div>
                  </div>

                  {/* Continuous Solid Green Audio Level Bar (0% when silent, rises/falls with real voice audio) */}
                  <div className="h-[22px] w-full bg-[#071109]/75 border border-[#39e75f]/20 relative overflow-hidden">
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
              {voiceState.isSpeaking && (
                <button
                  type="button"
                  onClick={() => audio.stopSpeaking()}
                  className="text-[9px] text-[#ef5350] hover:underline cursor-pointer"
                >
                  [MUTE TX]
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══ COLLAPSIBLE WATCHER-02 COMMAND / BRIEFING DRAWER (Opens when Mic button clicked) ═══ */}
        {isDrawerOpen && (
          <div className="mt-2 w-[390px] sm:w-[435px] max-w-[calc(100vw-4.5rem)] h-[420px] bg-[#080b09]/95 border border-[#7fa872]/40 shadow-[0_20px_50px_rgba(0,0,0,0.92)] flex flex-col overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
            <AIAnalyst />
          </div>
        )}
      </div>

      {/* ═══ DIEGETIC SUBTITLE BAR AT BOTTOM-CENTER (From Image 1: "WATCHER-02: ...") ═══ */}
      {voiceState.isSpeaking && voiceState.subtitle && (
        <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-[99990] max-w-2xl w-auto px-4 py-1.5 bg-[#080d0e]/92 border border-white/10 shadow-[0_8px_28px_rgba(0,0,0,0.9)] pointer-events-none text-center">
          <span className="text-[12px] font-sans tracking-wide leading-snug">
            <span className="text-[#48b8d0] font-bold mr-1.5">WATCHER-02:</span>
            <span className="text-[#eef4f4]">{voiceState.subtitle}</span>
          </span>
        </div>
      )}
    </>
  );
};

export default Watcher02CommsHUD;

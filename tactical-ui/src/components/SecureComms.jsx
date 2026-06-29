import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ShieldAlert, Radio, Phone, Activity, Send, Terminal } from 'lucide-react';
import useStore from '../store';

const CALLERS = {
  'laswell': { callsign: 'WATCHER-1', name: 'KATE LASWELL', dept: 'CIA OPERATIONS', desc: 'Secure Intel Link' },
  'shepherd': { callsign: 'GOLD EAGLE', name: 'GEN. SHEPHERD', dept: 'US ARMY / COMMAND', desc: 'Command Direct Link' },
  'price': { callsign: 'BRAVO 0-6', name: 'CPT. JOHN PRICE', dept: 'SAS / TASK FORCE 141', desc: 'Field Squad Lead' }
};

const MESSAGES = {
  'laswell': "Raven, target biometric signature verified. Initiating satellite tracking over the designated coordinate sectors.",
  'shepherd': "This is Gold Eagle. Task Force 141 is authorized to execute tactical intercept. Do not let target escape the grid.",
  'price': "Watcher, this is Bravo 0-6. Biometrics match target profile. Standard protocol is active, standing by for grid coordinates."
};

const SecureComms = () => {
  const { commsLink, setCommsLink, addCommsLog, selectedTarget } = useStore();
  const [activeCall, setActiveCall] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [muteStatic, setMuteStatic] = useState(false);
  const [waveformPoints, setWaveformPoints] = useState(new Array(40).fill(2));
  
  const audioCtxRef = useRef(null);
  const staticNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Generate Web Audio API White Noise for Radio Static
  const startRadioStatic = () => {
    if (muteStatic) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create buffer source for white noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate low-bandwidth radio channel
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000; // Peak voice freq
      filter.Q.value = 1.5; // Narrow band

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.015; // Low background static

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      staticNodeRef.current = whiteNoise;
      gainNodeRef.current = gainNode;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by browser:", e);
    }
  };

  const stopRadioStatic = () => {
    try {
      if (staticNodeRef.current) {
        staticNodeRef.current.stop();
        staticNodeRef.current.disconnect();
        staticNodeRef.current = null;
      }
    } catch (e) {}
  };

  // Web Speech Synthesis (Text-to-Speech)
  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    startRadioStatic();

    // Momentarily raise static gain for radio click "chhhk"
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.012, audioCtxRef.current.currentTime + 0.3);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Find a suitable English voice, preferably low/military sounding
    const voices = window.speechSynthesis.getVoices();
    const engVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google')) || 
                     voices.find(v => v.lang.startsWith('en')) || 
                     voices[0];
    if (engVoice) {
      utterance.voice = engVoice;
    }
    utterance.volume = volume;
    utterance.pitch = 0.85; // Low-pitch military voice
    utterance.rate = 0.95; // Slightly slower tactical cadence

    utterance.onend = () => {
      setIsSpeaking(false);
      // Radio click on end
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4);
      }
      setTimeout(stopRadioStatic, 500);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      stopRadioStatic();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Dynamic SVG Waveform oscillator
  useEffect(() => {
    let animId;
    const animateWaveform = () => {
      if (isSpeaking) {
        setWaveformPoints(prev => prev.map(() => 4 + Math.random() * 26));
      } else {
        setWaveformPoints(prev => prev.map(p => Math.max(2, p - 3)));
      }
      animId = requestAnimationFrame(animateWaveform);
    };
    animId = requestAnimationFrame(animateWaveform);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking]);

  // Handle incoming calls
  const initiateCall = (callerKey) => {
    const caller = CALLERS[callerKey];
    setActiveCall(callerKey);
    setCommsLink({ activeCall: caller.callsign });
    
    const rawMsg = MESSAGES[callerKey];
    const speechMsg = selectedTarget 
      ? rawMsg.replace("target", `target ${selectedTarget.name}`) 
      : rawMsg;

    addCommsLog(`[${caller.callsign}] LINK ESTABLISHED. ENCRYPTION KEYS ROTATED.`);
    speakText(speechMsg);
  };

  const terminateCall = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    stopRadioStatic();
    setActiveCall(null);
    setCommsLink({ activeCall: null });
    addCommsLog(`[SYS] LINK TERMINATED BY LOCAL HUB.`);
  };

  const handleSendText = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    
    addCommsLog(`[HQ/RAVEN] ${inputText.toUpperCase()}`);
    speakText(inputText);
    setInputText('');
  };

  // Initialize voice lists
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      window.speechSynthesis?.cancel();
      stopRadioStatic();
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#05070c] border border-cyan-900/30 text-cyan-400 font-mono text-[10px]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b border-cyan-900/50 bg-cyan-950/10">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <div>
            <div className="text-[11px] font-bold text-cyan-300 tracking-[0.2em] uppercase">// COMMS CHANNEL [SECURE]</div>
            <div className="text-[8px] text-cyan-600/70 tracking-widest font-bold">AES-256 SECURE LINK MONITOR</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMuteStatic(!muteStatic)} 
            className={`p-1 border transition-colors ${muteStatic ? 'border-red-950 text-red-500 bg-red-950/20' : 'border-cyan-900/40 text-cyan-500 hover:bg-cyan-950/25'}`}
            title="Mute Radio Noise"
          >
            {muteStatic ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-[8px] font-bold tracking-widest">
            {activeCall ? 'CHANNEL ACTIVE' : 'CARRIER STANDBY'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left pane: Call Controls & Waveform */}
        <div className="flex-1 p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-cyan-900/20 bg-black/30">
          
          {/* Active Voice Waveform */}
          <div className="flex-1 flex flex-col items-center justify-center p-3">
            <div className="w-full max-w-[280px] h-[70px] bg-black/60 border border-cyan-950 flex items-center justify-center relative px-2">
              <div className="absolute top-2 left-3 text-[7px] text-cyan-700/60 font-bold">VAD AMPLITUDE ENVELOPE</div>
              <div className="absolute top-2 right-3 text-[7px] text-cyan-400/80 font-bold tracking-widest flex items-center gap-1">
                <Activity size={10} className={isSpeaking ? 'animate-pulse text-cyan-400' : 'text-cyan-700'} />
                {isSpeaking ? 'SIGNAL STREAMING' : 'CARRIER LOCK'}
              </div>
              
              <svg className="w-full h-full pt-4" viewBox="0 0 160 40">
                <g fill="currentColor" className="text-cyan-500/80">
                  {waveformPoints.map((height, i) => (
                    <rect
                      key={i}
                      x={4 + i * 3.8}
                      y={20 - height / 2}
                      width="1.8"
                      height={height}
                      rx="0.9"
                      className="transition-all duration-75"
                    />
                  ))}
                </g>
              </svg>
            </div>
          </div>

          {/* Caller Selectors */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            {Object.entries(CALLERS).map(([key, caller]) => (
              <button
                key={key}
                onClick={() => activeCall === key ? terminateCall() : initiateCall(key)}
                className={`p-2 border flex flex-col items-center text-center transition-all ${
                  activeCall === key 
                    ? 'bg-red-950/20 border-red-500/80 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
                    : 'bg-cyan-950/5 border-cyan-900/40 text-cyan-500 hover:bg-cyan-950/20 hover:border-cyan-400/60'
                }`}
              >
                <Phone size={13} className={activeCall === key ? 'animate-bounce text-red-500' : ''} />
                <span className="text-[8px] font-bold mt-1 tracking-wider">{caller.callsign}</span>
                <span className="text-[6px] text-cyan-600/70 truncate w-full">{caller.name}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Right pane: Comms Channel Logs */}
        <div className="w-full md:w-[260px] p-3 flex flex-col justify-between space-y-3 bg-black/40">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-1 mb-1.5 text-cyan-700/80 text-[7px] font-bold tracking-widest shrink-0 uppercase">
              <Terminal size={10} /> TRANSMISSION LOG STREAM
            </div>
            
            {/* Logs console */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/80 border border-cyan-950 p-2 space-y-1.5 font-mono text-[8px] text-cyan-400/80">
              {commsLink.logs.length === 0 ? (
                <div className="text-cyan-700/40 text-center py-8">SECURE LOG EMPTY. ROTATING CHANNELS...</div>
              ) : (
                commsLink.logs.map((log, idx) => (
                  <div key={idx} className="leading-normal break-words border-b border-cyan-950/30 pb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Text transmitter box */}
          <form onSubmit={handleSendText} className="flex gap-1.5 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="SEND CLASSIFIED TEXT MSG..."
              className="flex-1 bg-black border border-cyan-900/50 px-2 py-1.5 text-[8px] text-cyan-300 placeholder:text-cyan-950 focus:outline-none focus:border-cyan-400 uppercase"
            />
            <button 
              type="submit" 
              className="p-1.5 bg-cyan-950/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-white transition-all cursor-pointer"
            >
              <Send size={11} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecureComms;

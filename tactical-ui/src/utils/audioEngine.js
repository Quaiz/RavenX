class TacticalAudioEngine {
  constructor() {
    this.enabled = true;
    this.buffers = {};
    this.arrayBuffers = {};
    this.audioContext = null;
    this.initialized = false;
    this.voiceEnabled = typeof window !== 'undefined'
      ? localStorage.getItem('ravenx_voice_comms') !== 'false'
      : true;
    this._voiceQueue = [];
    this._isSpeaking = false;
    this._activeVoiceSource = null;
    this._clipCooldowns = {};
    
    if (typeof window !== 'undefined') {
      this.preload('/sounds/notification.mp3', 'notification');
      this.preload('/sounds/success.mp3', 'success');
      this.preload('/sounds/auth_click.mp3', 'auth_click');
      this.preload('/sounds/initialize.mp3', 'initialize');
      this.preload('/sounds/generic_click.mp3', 'generic_click');
      // Pre-rendered Watcher Handler voice clips
      [
        'comms_online', 'alert_critical', 'alert_seismic',
        'airspace_scan', 'maritime_alert', 'target_locked',
        'briefing_ready', 'sector_focused', 'comms_muted'
      ].forEach(id => this.preload(`/sounds/voice/${id}.wav`, `voice_${id}`));
      
      const initAudio = () => {
        this.init();
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
        window.removeEventListener('touchstart', initAudio);
      };
      window.addEventListener('click', initAudio);
      window.addEventListener('keydown', initAudio);
      window.addEventListener('touchstart', initAudio);
    }
  }

  async preload(url, id) {
    try {
      const res = await fetch(url);
      this.arrayBuffers[id] = await res.arrayBuffer();
    } catch (e) {}
  }

  async init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      for (const [id, buffer] of Object.entries(this.arrayBuffers)) {
        if (!this.buffers[id]) {
          const bufferCopy = buffer.slice(0);
          this.audioContext.decodeAudioData(bufferCopy, (decoded) => {
            this.buffers[id] = decoded;
          });
        }
      }
    } catch (e) {
      console.warn('Web Audio API init failed', e);
    }
  }

  play(id, clone = true, vol = 1.0) {
    if (!this.enabled) return;
    
    if (!this.audioContext) {
      this.init();
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    if (!this.buffers[id] || !this.audioContext) return;

    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const finalVol = isMobile ? vol * 0.15 : vol;

      const source = this.audioContext.createBufferSource();
      source.buffer = this.buffers[id];
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = finalVol;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (e) {}
  }

  // Generic interactions
  playClick() {
    this.play('generic_click');
  }

  playHover() {
    this.play('generic_click', true, 0.1);
  }

  playTyping() {
    this.play('generic_click', true, 0.05);
  }

  playError() {
    this.play('notification'); // Fallback for error
  }

  // Specific Call of Duty Mappings
  playNotification() {
    this.play('notification');
  }

  playAuthClick() {
    this.play('auth_click');
  }

  playSuccess() {
    this.play('success', false);
  }

  playInitialize() {
    this.play('initialize');
  }

  // Radio Squelch & Comms Chirp (Call of Duty Watcher Program FX)
  playRadioSquelch() {
    if (!this.enabled) return;
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') this.audioContext.resume();

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // 1. White noise burst (Radio burst)
      const bufferSize = ctx.sampleRate * 0.08; // 80ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass filter to sound like military comms (800Hz - 3200Hz)
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);

      // 2. High-pitch roger chirp tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

      oscGain.gain.setValueAtTime(0.04, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      this.play('generic_click');
    }
  }

  setEnabled(val) {
    this.enabled = val;
  }

  setVoiceEnabled(val) {
    this.voiceEnabled = Boolean(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ravenx_voice_comms', String(this.voiceEnabled));
    }
    if (!this.voiceEnabled) {
      this.stopSpeaking();
    }
  }

  stopSpeaking() {
    this._voiceQueue = [];
    if (this._activeVoiceSource) {
      try { this._activeVoiceSource.stop(); } catch (e) {}
      this._activeVoiceSource = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    this._isSpeaking = false;
  }

  _ensureAudioContext() {
    if (!this.audioContext) this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  _playBufferWithRadioFx(audioBuffer, vol = 0.9) {
    return new Promise((resolve) => {
      const ctx = this._ensureAudioContext();
      if (!ctx || !audioBuffer) return resolve();
      try {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;

        // Subtle tactical comms bandpass filter (300Hz - 3600Hz)
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 260;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 3800;

        const gainNode = ctx.createGain();
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        gainNode.gain.value = isMobile ? vol * 0.4 : vol;

        source.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(gainNode);
        gainNode.connect(ctx.destination);

        this._activeVoiceSource = source;
        source.onended = () => {
          if (this._activeVoiceSource === source) this._activeVoiceSource = null;
          resolve();
        };
        source.start(0);
      } catch (e) {
        resolve();
      }
    });
  }

  _speakBrowserFallback(text) {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return resolve();
      try {
        const clean = (text || '')
          .replace(/\[INCOMING TRANSMISSION[^\]]*\]/gi, '')
          .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/^#+\s*/gm, '')
          .replace(/\/\//g, ',')
          .replace(/[▸⚠]/g, '')
          .trim()
          .slice(0, 800);
        if (!clean) return resolve();

        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = 'en-US';
        utter.rate = 1.02;
        utter.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && /aria|jenny|zira|samantha|victoria|karen|natasha|female|google us english/i.test(v.name))
          || voices.find(v => v.lang.startsWith('en') && !/david|mark|george|daniel|ryan|guy/i.test(v.name))
          || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utter.voice = enVoice;
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        window.speechSynthesis.speak(utter);
      } catch (e) {
        resolve();
      }
    });
  }

  async _processVoiceQueue() {
    if (this._isSpeaking || this._voiceQueue.length === 0) return;
    this._isSpeaking = true;

    while (this._voiceQueue.length > 0) {
      if (!this.enabled || !this.voiceEnabled) {
        this._voiceQueue = [];
        break;
      }
      const task = this._voiceQueue.shift();
      try {
        await task();
      } catch (e) {}
    }

    this._isSpeaking = false;
  }

  playVoiceClip(clipId, { cooldownMs = 3000, interrupt = false } = {}) {
    if (!this.enabled || !this.voiceEnabled) return;
    const now = Date.now();
    const last = this._clipCooldowns[clipId] || 0;
    if (now - last < cooldownMs) return;
    this._clipCooldowns[clipId] = now;

    if (interrupt) this.stopSpeaking();

    const bufKey = `voice_${clipId}`;
    this._voiceQueue.push(async () => {
      const ctx = this._ensureAudioContext();
      if (!ctx) return;
      if (!this.buffers[bufKey] && this.arrayBuffers[bufKey]) {
        try {
          this.buffers[bufKey] = await ctx.decodeAudioData(this.arrayBuffers[bufKey].slice(0));
        } catch (e) {
          return;
        }
      }
      if (this.buffers[bufKey]) {
        await this._playBufferWithRadioFx(this.buffers[bufKey], 0.95);
      }
    });
    this._processVoiceQueue();
  }

  async speakText(text, { token, interrupt = true, onDone } = {}) {
    if (!this.enabled || !this.voiceEnabled || !text?.trim()) {
      if (onDone) onDone();
      return;
    }
    if (interrupt) this.stopSpeaking();

    this._voiceQueue.push(async () => {
      this.playRadioSquelch();
      try {
        const sessionToken = token || JSON.parse(localStorage.getItem('ravenx_session') || '{}')?.token;
        const headers = { 'Content-Type': 'application/json' };
        if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/tts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text }),
        });

        if (res.ok) {
          const arrBuf = await res.arrayBuffer();
          const ctx = this._ensureAudioContext();
          if (ctx) {
            const decoded = await ctx.decodeAudioData(arrBuf);
            await this._playBufferWithRadioFx(decoded, 1.0);
            if (onDone) onDone();
            return;
          }
        }
      } catch (e) {
        console.warn('[TTS] Remote GPU worker offline, using browser voice fallback');
      }

      await this._speakBrowserFallback(text);
      if (onDone) onDone();
    });
    this._processVoiceQueue();
  }
}

export const audio = new TacticalAudioEngine();

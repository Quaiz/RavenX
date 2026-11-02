class TacticalAudioEngine {
  constructor() {
    this.enabled = true;
    this.buffers = {};
    this.arrayBuffers = {};
    this.audioContext = null;
    this.initialized = false;
    
    if (typeof window !== 'undefined') {
      this.preload('/sounds/notification.mp3', 'notification');
      this.preload('/sounds/success.mp3', 'success');
      this.preload('/sounds/auth_click.mp3', 'auth_click');
      this.preload('/sounds/initialize.mp3', 'initialize');
      this.preload('/sounds/generic_click.mp3', 'generic_click');
      
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
}

export const audio = new TacticalAudioEngine();

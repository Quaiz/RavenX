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

  setEnabled(val) {
    this.enabled = val;
  }
}

export const audio = new TacticalAudioEngine();

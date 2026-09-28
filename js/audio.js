// Web Audio API Retro Neon Synthesizer
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopAmbientMusic();
      this.stopAnticipationLoop();
    } else {
      this.startAmbientMusic();
    }
    return this.enabled;
  }

  // Klik za dugmiće
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Zvuk pokretanja spina (elektronski glissando)
  playSpinStart() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Zaustavljanje jednog koluta (mehanički neon klik)
  playReelStop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);

    // Haptički feedback za podržane mobilne telefone
    if ('vibrate' in navigator) {
      navigator.vibrate(18);
    }
  }

  // Zvuk dobitka (Synth Arpeggio)
  playWin(isBig = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = isBig ? [261.63, 329.63, 392.00, 523.25, 659.25, 783.99] : [329.63, 392.00, 523.25, 659.25];
    const duration = isBig ? 0.12 : 0.09;
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * duration);

      gain.gain.setValueAtTime(0.12, t + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (idx + 1) * duration + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * duration);
      osc.stop(t + (idx + 1) * duration + 0.05);
    });

    if ('vibrate' in navigator) {
      navigator.vibrate(isBig ? [50, 50, 100, 50, 150] : [30, 40, 60]);
    }
  }

  // Zvuk kaskadne eksplozije (laser crunch)
  playCascadeExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);

    if ('vibrate' in navigator) {
      navigator.vibrate([25, 30, 40]);
    }
  }

  // Kratak tick pri kotrljanju brojača dobitka
  playRollupTick(pitch = 300) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';

    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, t + 0.04);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Zvuk udara munje (Neon Lightning Strike)
  playLightningStrike() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);

    if ('vibrate' in navigator) {
      navigator.vibrate([40, 50, 80]);
    }
  }

  // Zvuk rasta multiplikatora (akcelerisani synth powerup)
  playMultiplierRise(mult = 2) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 220 + (mult * 110);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.22);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Bonus triger fanfare
  playBonusTrigger() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);

      gain.gain.setValueAtTime(0.2, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.35);
    });
  }

  // Zvuk mehaničkog klika jackpot točka (perkusivni klik / flapper peg hit)
  playWheelTick(pitch = 700) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.025);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.025);

    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  // Napeta pulsirajuća anticipation audio petlja (Heartbeat + rising riser)
  startAnticipationLoop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.stopAnticipationLoop();

    let step = 0;
    this.anticipationInterval = setInterval(() => {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime;

      // Napeti pulsirajući bas
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const freq = 130 + (step * 8);
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);

      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
      step++;
    }, 140);
  }

  stopAnticipationLoop() {
    if (this.anticipationInterval) {
      clearInterval(this.anticipationInterval);
      this.anticipationInterval = null;
    }
  }

  // Atmosferična Synthwave Outrun pozadinska muzička petlja (generisana u Web Audio API)
  startAmbientMusic() {
    if (!this.enabled || this.musicPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.musicPlaying = true;

    const chords = [
      [65.41, 130.81, 196.00], // C2, C3, G3
      [58.27, 116.54, 174.61], // Bb1, Bb2, F3
      [43.65, 87.31, 130.81],  // F1, F2, C3
      [49.00, 98.00, 146.83]   // G1, G2, D3
    ];
    let chordIdx = 0;

    this.musicInterval = setInterval(() => {
      if (!this.enabled || !this.ctx || !this.musicPlaying) return;
      const t = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];

      // Duboki synth bas puls
      currentChord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = i === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        const vol = i === 0 ? 0.04 : 0.02;
        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.48);
      });

      chordIdx++;
    }, 480);
  }

  stopAmbientMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // --- CYBER ARCADE SHOOTER AUDIO ---
  // Laserski hitac (Pew-pew blasters)
  playLaserShot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);

    if ('vibrate' in navigator) {
      navigator.vibrate(12);
    }
  }

  // Masivna eksplozija bombe (Sub-bass drop & crunch)
  playBombExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.45);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);

    if ('vibrate' in navigator) {
      navigator.vibrate([40, 30, 80]);
    }
  }

  // Combo rastući ton (Povećava visinu sa svakim uzastopnim combo udarcem)
  playComboSound(comboLevel = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 440 * Math.pow(1.15, Math.min(comboLevel, 6));
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.14);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }
}

const Sound = new SoundController();

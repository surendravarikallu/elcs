"use client";

class TactileAudioHelper {
  private enabled: boolean = false;
  private ctx: AudioContext | null = null;

  enable(on: boolean) {
    this.enabled = on;
    if (on && !this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      // High pitch diagnostic clock click
      osc.frequency.setValueAtTime(1600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("AudioContext error playing click:", e);
    }
  }

  playHover() {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.018, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {
      console.warn("AudioContext hover:", e);
    }
  }

  playOpen() {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    try {
      const playNote = (freq: number, t: number, dur: number, vol: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + t);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + t + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + dur + 0.01);
      };
      playNote(880, 0, 0.12, 0.04);
      playNote(1320, 0.1, 0.18, 0.035);
    } catch (e) {
      console.warn("AudioContext open:", e);
    }
  }

  playWarning() {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    try {
      const playBeep = (timeOffset: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, this.ctx.currentTime + timeOffset);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + timeOffset + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + timeOffset);
        osc.stop(this.ctx.currentTime + timeOffset + 0.09);
      };

      playBeep(0);
      playBeep(0.12);
    } catch (e) {
      console.warn("AudioContext error playing warning:", e);
    }
  }
}

export const TactileAudio = new TactileAudioHelper();

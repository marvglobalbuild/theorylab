/**
 * Web Audio Rhythm Sequencer, Metronome Scheduler & Microphone Transient Detector.
 * Provides sample-accurate timing independent of UI render frames.
 */

export interface MetronomeTickEvent {
  beatIndex: number;
  macroBeat: number;
  isDownbeat: boolean;
  isSecondary: boolean;
  isSubdivision: boolean;
  time: number;
}

export type ClickSoundType = "classic" | "woodblock" | "digital" | "piano";

let sharedAudioCtx: AudioContext | null = null;

export function getRhythmAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) {
      sharedAudioCtx = new Ctor({ latencyHint: "interactive" });
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    void sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Plays a synthesis click tone at precise AudioContext time
 */
export function scheduleClickTone(
  ctx: AudioContext,
  time: number,
  type: "downbeat" | "secondary" | "unaccented" | "subdivision",
  soundType: ClickSoundType = "classic",
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  let freq = 800;
  let decay = 0.035;
  let peakGain = 0.7;

  if (soundType === "woodblock") {
    osc.type = "sine";
    if (type === "downbeat") freq = 900;
    else if (type === "secondary") freq = 750;
    else if (type === "subdivision") freq = 550;
    else freq = 650;
    decay = 0.05;
  } else if (soundType === "digital") {
    osc.type = "square";
    if (type === "downbeat") freq = 1600;
    else if (type === "secondary") freq = 1200;
    else if (type === "subdivision") freq = 700;
    else freq = 900;
    peakGain = 0.35;
    decay = 0.025;
  } else if (soundType === "piano") {
    osc.type = "triangle";
    if (type === "downbeat") freq = 523.25; // C5
    else if (type === "secondary") freq = 392.0; // G4
    else if (type === "subdivision") freq = 261.63; // C4
    else freq = 329.63; // E4
    decay = 0.12;
  } else {
    // "classic"
    osc.type = "triangle";
    if (type === "downbeat") {
      freq = 1250;
      peakGain = 0.85;
      decay = 0.045;
    } else if (type === "secondary") {
      freq = 950;
      peakGain = 0.65;
      decay = 0.035;
    } else if (type === "subdivision") {
      freq = 550;
      peakGain = 0.35;
      decay = 0.02;
    } else {
      freq = 800;
      peakGain = 0.55;
      decay = 0.03;
    }
  }

  osc.frequency.setValueAtTime(freq, time);
  // Quick exponential pitch drop for percussive crack
  osc.frequency.exponentialRampToValueAtTime(Math.max(100, freq * 0.4), time + decay);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peakGain, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

  osc.start(time);
  osc.stop(time + decay + 0.01);
}

/**
 * Plays a musical pitched tone for rhythm notes and patterns
 */
export function scheduleRhythmTone(
  ctx: AudioContext,
  time: number,
  durationSec: number,
  frequency = 440,
  isAccented = false,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, time);

  osc.connect(gain);
  gain.connect(ctx.destination);

  const peak = isAccented ? 0.75 : 0.5;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.005);
  gain.gain.setValueAtTime(peak * 0.85, time + Math.max(0.02, durationSec * 0.75));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + durationSec);

  osc.start(time);
  osc.stop(time + durationSec + 0.02);
}

/**
 * Microphone Transient Peak Detector for Clapping Exercises
 */
export class MicClapDetector {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private onClapCallback: (() => void) | null = null;
  private lastClapTime = 0;
  private isListening = false;

  public async start(onClap: () => void): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      this.audioCtx = getRhythmAudioContext();
      if (!this.audioCtx) return false;

      const source = this.audioCtx.createMediaStreamSource(this.stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.2;
      source.connect(this.analyser);

      this.onClapCallback = onClap;
      this.isListening = true;
      this.detectLoop();
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  private detectLoop = () => {
    if (!this.isListening || !this.analyser) return;

    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(buffer);

    // Calculate peak amplitude
    let maxDelta = 0;
    for (let i = 0; i < buffer.length; i++) {
      const delta = Math.abs(buffer[i]! - 128);
      if (delta > maxDelta) maxDelta = delta;
    }

    const now = Date.now();
    // Threshold ~55 (out of 128) and debounce 160ms between claps
    if (maxDelta > 55 && now - this.lastClapTime > 160) {
      this.lastClapTime = now;
      this.onClapCallback?.();
    }

    this.animFrameId = requestAnimationFrame(this.detectLoop);
  };

  public stop() {
    this.isListening = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.onClapCallback = null;
  }
}

/**
 * Piano audio engine (browser only).
 *
 * Tone.js is imported lazily on the first key press. Browsers (iOS Safari especially) only
 * allow sound after a user gesture, so `unlockAudio()` runs synchronously inside that gesture:
 * it creates and resumes the AudioContext and switches iOS to "playback" so sound is heard
 * even when the phone's silent switch is on. Tone then adopts that already-running context.
 */
import type * as ToneNS from "tone";

export type AudioStatus = "idle" | "loading" | "ready" | "fallback";

export interface LoopEvent {
  time: number;
  note: string;
  duration: number;
  velocity: number;
}

interface Engine {
  now(): number;
  attack(note: string): void;
  release(note: string): void;
  play(notes: string | string[], duration: number, time?: number, velocity?: number): void;
  /** Loop a sequence until stopLoop(); onEvent fires in sync with the sound. */
  startLoop(events: LoopEvent[], length: number, onEvent: (e: LoopEvent) => void): void;
  stopLoop(): void;
}

const SAMPLE_BASE = "https://tonejs.github.io/audio/salamander/";
const SAMPLE_URLS: Record<string, string> = {
  A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", A2: "A2.mp3",
  C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3",
  C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3",
  C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", A5: "A5.mp3",
  C6: "C6.mp3",
};

let status: AudioStatus = "idle";
let engine: Engine | null = null;
let enginePromise: Promise<Engine> | null = null;
let rawContext: AudioContext | null = null;
let silentAudio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

function setStatus(next: AudioStatus) {
  status = next;
  listeners.forEach((l) => l());
}

export function subscribeAudioStatus(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAudioStatus(): AudioStatus {
  return status;
}

export function getReadyEngine(): Engine | null {
  return engine;
}

/** A tiny silent WAV, looped through an <audio> element, moves older iOS into playback mode. */
function silentWavUrl() {
  const samples = 800;
  const buffer = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buffer);
  const write = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  write(0, "RIFF");
  v.setUint32(4, 36 + samples * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true);
  v.setUint32(28, 16000, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, "data");
  v.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

/** Must run synchronously inside a user gesture (no await before it). */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  try {
    if (nav.audioSession) nav.audioSession.type = "playback";
  } catch {
    /* unsupported */
  }
  if (!silentAudio) {
    try {
      silentAudio = new Audio(silentWavUrl());
      silentAudio.loop = true;
      silentAudio.setAttribute("playsinline", "");
      void silentAudio.play().catch(() => undefined);
    } catch {
      silentAudio = null;
    }
  }
  if (!rawContext) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    rawContext = new Ctor({ latencyHint: "interactive" });
  }
  if (rawContext.state !== "running") void rawContext.resume();
  // Play one silent sample: required by some iOS versions to fully unlock
  const src = rawContext.createBufferSource();
  src.buffer = rawContext.createBuffer(1, 1, 22050);
  src.connect(rawContext.destination);
  src.start(0);
}

async function createEngine(): Promise<Engine> {
  const Tone: typeof ToneNS = await import("tone");
  if (rawContext) Tone.setContext(rawContext);
  await Tone.start();
  setStatus("loading");

  const output = new Tone.Volume(-4).toDestination();
  const reverb = new Tone.Reverb({ decay: 2.4, wet: 0.18 }).connect(output);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.004, decay: 0.5, sustain: 0.2, release: 1.4 },
  }).connect(reverb);
  synth.volume.value = -10;

  let sampler: ToneNS.Sampler | null = null;
  const pending = new Tone.Sampler({
    urls: SAMPLE_URLS,
    baseUrl: SAMPLE_BASE,
    release: 1.4,
    onload: () => {
      sampler = pending;
      setStatus("ready");
    },
    onerror: () => setStatus("fallback"),
  }).connect(reverb);

  window.setTimeout(() => {
    if (!sampler) setStatus("fallback");
  }, 8000);

  const voice = () => sampler ?? synth;
  const transport = Tone.getTransport();
  let part: ToneNS.Part<LoopEvent> | null = null;

  return {
    now: () => Tone.now(),
    attack: (note) => voice().triggerAttack(note, Tone.now(), 0.8),
    release: (note) => {
      sampler?.triggerRelease(note, Tone.now());
      synth.triggerRelease(note, Tone.now());
    },
    play: (notes, duration, time, velocity = 0.8) =>
      voice().triggerAttackRelease(notes, duration, time ?? Tone.now(), velocity),
    startLoop: (events, length, onEvent) => {
      part?.dispose();
      transport.stop();
      transport.position = 0;
      part = new Tone.Part<LoopEvent>((time, e) => {
        voice().triggerAttackRelease(e.note, e.duration, time, e.velocity);
        Tone.getDraw().schedule(() => onEvent(e), time);
      }, events.map((e) => ({ ...e })));
      part.loop = true;
      part.loopEnd = length;
      part.start(0);
      transport.start("+0.1");
    },
    stopLoop: () => {
      transport.stop();
      part?.dispose();
      part = null;
      sampler?.releaseAll();
      synth.releaseAll();
    },
  };
}

/** Must be called from a user gesture (pointer or key event). */
export function getEngine(): Promise<Engine> {
  unlockAudio();
  if (!enginePromise) {
    enginePromise = createEngine().then((e) => {
      engine = e;
      return e;
    });
    enginePromise.catch(() => {
      enginePromise = null;
    });
  }
  return enginePromise;
}

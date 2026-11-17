/**
 * Piano audio engine (browser only).
 *
 * Tone.js is imported lazily on the first key press: browsers only allow audio to start
 * after a user gesture, and keeping Tone out of the initial bundle keeps the page fast.
 * A soft synth voice is available instantly; real piano samples replace it once loaded.
 */
import type * as ToneNS from "tone";

export type AudioStatus = "idle" | "loading" | "ready" | "fallback";

interface Engine {
  now(): number;
  attack(note: string): void;
  release(note: string): void;
  play(notes: string | string[], duration: number, time?: number): void;
}

const SAMPLE_BASE = "https://tonejs.github.io/audio/salamander/";
const SAMPLE_URLS: Record<string, string> = {
  C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", A3: "A3.mp3",
  C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", A4: "A4.mp3",
  C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", A5: "A5.mp3",
  C6: "C6.mp3",
};

let status: AudioStatus = "idle";
let engine: Engine | null = null;
let enginePromise: Promise<Engine> | null = null;
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

async function createEngine(): Promise<Engine> {
  const Tone: typeof ToneNS = await import("tone");
  await Tone.start();
  setStatus("loading");

  const output = new Tone.Volume(-4).toDestination();
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.004, decay: 0.5, sustain: 0.2, release: 1.4 },
  }).connect(output);
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
  }).connect(output);

  window.setTimeout(() => {
    if (!sampler) setStatus("fallback");
  }, 8000);

  const voice = () => sampler ?? synth;

  return {
    now: () => Tone.now(),
    attack: (note) => voice().triggerAttack(note, Tone.now(), 0.8),
    release: (note) => {
      sampler?.triggerRelease(note, Tone.now());
      synth.triggerRelease(note, Tone.now());
    },
    play: (notes, duration, time) => voice().triggerAttackRelease(notes, duration, time ?? Tone.now(), 0.8),
  };
}

/** Must be called from a user gesture (pointer or key event). */
export function getEngine(): Promise<Engine> {
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

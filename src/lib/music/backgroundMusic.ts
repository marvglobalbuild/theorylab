/**
 * Background music: a looping performance of Bach's Prelude in C on the site's piano.
 * Starts only when the visitor presses play. Exposes a tiny store so any component
 * (the player, the keyboard) can follow along.
 */
import { getEngine, type LoopEvent } from "./audio";
import { BACH_PRELUDE_C, buildPreludeEvents, type PreludeEvent } from "./repertoire";

export interface MusicState {
  playing: boolean;
  bar: number;
  /** Notes sounding right now, for lighting up keys */
  notes: ReadonlySet<string>;
}

const SEMIQUAVER = 0.2; // ♩ = 75
const { events, length } = buildPreludeEvents(BACH_PRELUDE_C, SEMIQUAVER);

let state: MusicState = { playing: false, bar: 0, notes: new Set() };
const listeners = new Set<() => void>();
const timers = new Set<number>();

function set(next: Partial<MusicState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const musicStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => state,
  server: () => state,
};

function onEvent(e: LoopEvent) {
  const ev = e as PreludeEvent;
  const notes = new Set(state.notes).add(ev.note);
  set({ bar: ev.bar, notes });
  const t = window.setTimeout(() => {
    timers.delete(t);
    const next = new Set(state.notes);
    next.delete(ev.note);
    set({ notes: next });
  }, Math.min(ev.duration, 0.35) * 1000);
  timers.add(t);
}

/** Call from a click/tap handler. */
export function playBackgroundMusic() {
  set({ playing: true, bar: 0 });
  getEngine()
    .then((e) => {
      if (state.playing) e.startLoop(events, length, onEvent);
    })
    .catch(() => set({ playing: false }));
}

export function stopBackgroundMusic() {
  set({ playing: false, notes: new Set() });
  timers.forEach((t) => window.clearTimeout(t));
  timers.clear();
  getEngine()
    .then((e) => e.stopLoop())
    .catch(() => undefined);
}

export function toggleBackgroundMusic() {
  if (state.playing) stopBackgroundMusic();
  else playBackgroundMusic();
}

export const PIECE = {
  composer: "J. S. Bach",
  title: "Prelude in C major, BWV 846",
  bars: BACH_PRELUDE_C,
};


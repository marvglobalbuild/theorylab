import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { getAudioStatus, getEngine, getReadyEngine, subscribeAudioStatus } from "./audio";

export interface PhraseStep {
  notes: string[];
  /** Seconds from the start of the phrase */
  at: number;
  duration: number;
}

/**
 * React access to the shared piano. Tracks held notes so a key released before the
 * engine finishes starting still sounds briefly instead of hanging.
 */
export function usePiano() {
  const status = useSyncExternalStore(subscribeAudioStatus, getAudioStatus, () => "idle" as const);
  const held = useRef(new Set<string>());
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const noteOn = useCallback((note: string) => {
    held.current.add(note);
    const ready = getReadyEngine();
    if (ready) {
      ready.attack(note);
      return;
    }
    getEngine()
      .then((e) => (held.current.has(note) ? e.attack(note) : e.play(note, 0.8)))
      .catch(() => undefined);
  }, []);

  const noteOff = useCallback((note: string) => {
    held.current.delete(note);
    getReadyEngine()?.release(note);
  }, []);

  /** Plays a sequence and calls onStep as each step sounds (for visual highlighting). */
  const playPhrase = useCallback(
    (steps: PhraseStep[], onStep?: (step: PhraseStep | null) => void) => {
      clearTimers();
      getEngine()
        .then((e) => {
          const start = e.now() + 0.05;
          steps.forEach((step) => {
            e.play(step.notes, step.duration, start + step.at);
            timers.current.push(window.setTimeout(() => onStep?.(step), step.at * 1000 + 50));
          });
          const last = steps.at(-1);
          if (last) {
            timers.current.push(
              window.setTimeout(() => onStep?.(null), (last.at + last.duration) * 1000 + 50),
            );
          }
        })
        .catch(() => undefined);
    },
    [clearTimers],
  );

  return { status, noteOn, noteOff, playPhrase };
}

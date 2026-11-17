/**
 * J. S. Bach — Prelude in C major, BWV 846 (The Well-Tempered Clavier, Book I), bars 1–19.
 * Each bar is one five-note chord shape; Bach arpeggiates it as
 * n1 n2 n3 n4 n5 n3 n4 n5, twice per bar, in semiquavers. Bar 19 returns to C major,
 * so the excerpt loops seamlessly back to bar 1.
 */
import type { LoopEvent } from "./audio";

export interface PreludeBar {
  chord: string;
  notes: [string, string, string, string, string];
}

export const BACH_PRELUDE_C: PreludeBar[] = [
  { chord: "C", notes: ["C4", "E4", "G4", "C5", "E5"] },
  { chord: "Dm⁷/C", notes: ["C4", "D4", "A4", "D5", "F5"] },
  { chord: "G⁷/B", notes: ["B3", "D4", "G4", "D5", "F5"] },
  { chord: "C", notes: ["C4", "E4", "G4", "C5", "E5"] },
  { chord: "Am/C", notes: ["C4", "E4", "A4", "E5", "A5"] },
  { chord: "D⁷/C", notes: ["C4", "D4", "F#4", "A4", "D5"] },
  { chord: "G/B", notes: ["B3", "D4", "G4", "D5", "G5"] },
  { chord: "Cmaj⁷/B", notes: ["B3", "C4", "E4", "G4", "C5"] },
  { chord: "Am⁷", notes: ["A3", "C4", "E4", "G4", "C5"] },
  { chord: "D⁷", notes: ["D3", "A3", "D4", "F#4", "C5"] },
  { chord: "G", notes: ["G3", "B3", "D4", "G4", "B4"] },
  { chord: "C♯°⁷/G", notes: ["G3", "Bb3", "E4", "G4", "C#5"] },
  { chord: "Dm/F", notes: ["F3", "A3", "D4", "A4", "D5"] },
  { chord: "B°⁷/F", notes: ["F3", "Ab3", "D4", "F4", "B4"] },
  { chord: "C/E", notes: ["E3", "G3", "C4", "G4", "C5"] },
  { chord: "Fmaj⁷/E", notes: ["E3", "F3", "A3", "C4", "F4"] },
  { chord: "Dm⁷", notes: ["D3", "F3", "A3", "C4", "F4"] },
  { chord: "G⁷", notes: ["G2", "D3", "G3", "B3", "F4"] },
  { chord: "C", notes: ["C3", "E3", "G3", "C4", "E4"] },
];

/** Order of the five chord tones within each half bar. */
export const HALF_BAR_PATTERN = [0, 1, 2, 3, 4, 2, 3, 4] as const;

export interface PreludeEvent extends LoopEvent {
  bar: number;
}

/** Expand the bars into timed note events. `semiquaver` is in seconds. */
export function buildPreludeEvents(bars: PreludeBar[], semiquaver: number): { events: PreludeEvent[]; length: number } {
  const events: PreludeEvent[] = [];
  bars.forEach((bar, b) => {
    for (let half = 0; half < 2; half++) {
      HALF_BAR_PATTERN.forEach((toneIndex, step) => {
        const slot = b * 16 + half * 8 + step;
        // Bass and tenor are held through the half bar, as in Bach's notation
        const held = step === 0 ? 8 : step === 1 ? 7 : 2;
        events.push({
          time: slot * semiquaver,
          note: bar.notes[toneIndex]!,
          duration: held * semiquaver,
          velocity: step === 0 ? 0.62 : step === 1 ? 0.5 : 0.44,
          bar: b,
        });
      });
    }
  });
  return { events, length: bars.length * 16 * semiquaver };
}

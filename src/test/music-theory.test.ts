import { describe, expect, it } from "vitest";

import {
  INTERVALS,
  KEYBOARD_KEYS,
  TREBLE_READING,
  displayNote,
  enharmonic,
  genericInterval,
  noteFrequency,
  noteToMidi,
  semitonesBetween,
  toVexKey,
} from "@/lib/music/theory";

describe("pitch", () => {
  it("places middle C at MIDI 60 and A4 at 440 Hz", () => {
    expect(noteToMidi("C4")).toBe(60);
    expect(noteFrequency("A4")).toBeCloseTo(440, 6);
  });

  it("tunes middle C to 261.63 Hz in equal temperament", () => {
    expect(noteFrequency("C4")).toBeCloseTo(261.63, 2);
  });

  it("treats C sharp and D flat as the same key", () => {
    expect(noteToMidi("C#4")).toBe(noteToMidi("Db4"));
    expect(enharmonic("C#4")).toBe("Db4");
    expect(enharmonic("E4")).toBeNull();
  });

  it("formats names for display and for the notation renderer", () => {
    expect(displayNote("F#4")).toBe("F♯4");
    expect(displayNote("Bb4")).toBe("B♭4");
    expect(toVexKey("Eb4")).toBe("eb/4");
  });
});

describe("keyboard", () => {
  it("spans C4 to C6 with 15 white and 10 black keys", () => {
    expect(KEYBOARD_KEYS[0]?.note).toBe("C4");
    expect(KEYBOARD_KEYS.at(-1)?.note).toBe("C6");
    expect(KEYBOARD_KEYS.filter((k) => !k.isBlack)).toHaveLength(15);
    expect(KEYBOARD_KEYS.filter((k) => k.isBlack)).toHaveLength(10);
  });
});

describe("intervals", () => {
  it.each(INTERVALS)("$name spans $semitones semitones", (interval) => {
    expect(semitonesBetween(interval.lower, interval.upper)).toBe(interval.semitones);
  });

  it.each(INTERVALS)("$name is spelled as the correct generic interval", (interval) => {
    expect(genericInterval(interval.lower, interval.upper)).toBe(interval.number);
  });

  it("spells the minor third above C as E flat, not D sharp", () => {
    expect(INTERVALS.find((i) => i.id === "m3")?.upper).toBe("Eb4");
  });
});

describe("staff reading", () => {
  it("walks the C major scale from middle C to C5", () => {
    expect(TREBLE_READING.map((n) => n.note)).toEqual(["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]);
  });
});

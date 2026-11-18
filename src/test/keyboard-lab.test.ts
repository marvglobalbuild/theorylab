import { describe, expect, it } from "vitest";

import {
  DEFAULT_KEYBOARD_SHORTCUTS,
  ENHARMONIC_PAIRS,
  generateKeyboardKeys,
  generateKeyboardQuestion,
  getKeyboardNoteAnalysis,
  type VirtualKeyDefinition,
} from "@/lib/music/keyboard-lab";
import { displayNote, midiToFrequency, noteToMidi, parseNote } from "@/lib/music/theory";

describe("Virtual Piano Keyboard Lab — Pitch & Geometry Architecture", () => {
  it("verifies A4 = 440 Hz and Middle C (C4) = MIDI 60 = 261.6 Hz", () => {
    // Tuning reference A4
    expect(noteToMidi("A4")).toBe(69);
    expect(midiToFrequency(69)).toBeCloseTo(440.0, 1);

    // Middle C anchor
    expect(noteToMidi("C4")).toBe(60);
    expect(midiToFrequency(60)).toBeCloseTo(261.6, 1);
  });

  it("supports at least 4 playable octaves (C2 to C6 = 49 keys)", () => {
    // Generate 4 octaves starting at Octave 2
    const keys = generateKeyboardKeys(2, 4);

    // 4 octaves = 4 * 12 + 1 = 49 keys (from C2 to C6 inclusive)
    expect(keys.length).toBe(49);
    expect(keys[0]?.note).toBe("C2");
    expect(keys.at(-1)?.note).toBe("C6");

    // Count white and black keys
    const whiteKeys = keys.filter((k) => !k.isBlack);
    const blackKeys = keys.filter((k) => k.isBlack);

    // 4 octaves: 4 * 7 + 1 = 29 white keys; 4 * 5 = 20 black keys
    expect(whiteKeys.length).toBe(29);
    expect(blackKeys.length).toBe(20);
  });

  it("accurately identifies Middle C (C4) and marks isMiddleC exclusively on C4", () => {
    const keys = generateKeyboardKeys(2, 4);
    const middleCKeys = keys.filter((k) => k.isMiddleC);

    expect(middleCKeys.length).toBe(1);
    expect(middleCKeys[0]?.note).toBe("C4");
    expect(middleCKeys[0]?.midiNumber).toBe(60);
    expect(middleCKeys[0]?.isBlack).toBe(false);
  });

  it("calculates accurate semitone and whole tone relationships across natural boundaries", () => {
    const keys = generateKeyboardKeys(3, 2); // C3 to C5
    const keyMap = new Map(keys.map((k) => [k.note, k]));

    // Natural half step: E4 to F4 (no black key between them)
    const e4 = keyMap.get("E4");
    expect(e4).toBeDefined();
    expect(e4?.semitoneAbove).toBe("F4");
    expect(e4?.wholeToneAbove).toBe("F#4");

    // Natural half step: B3 to C4 (Middle C)
    const b3 = keyMap.get("B3");
    expect(b3).toBeDefined();
    expect(b3?.semitoneAbove).toBe("C4");

    // Whole step from C4 is D4
    const c4 = keyMap.get("C4");
    expect(c4?.wholeToneAbove).toBe("D4");
    expect(c4?.semitoneAbove).toBe("C#4");
    expect(c4?.semitoneBelow).toBe("B3");
    expect(c4?.wholeToneBelow).toBe("A#3");
  });

  it("resolves enharmonic equivalents for all black keys", () => {
    expect(ENHARMONIC_PAIRS["C#"]).toBe("Db");
    expect(ENHARMONIC_PAIRS["Db"]).toBe("C#");
    expect(ENHARMONIC_PAIRS["D#"]).toBe("Eb");
    expect(ENHARMONIC_PAIRS["Eb"]).toBe("D#");
    expect(ENHARMONIC_PAIRS["F#"]).toBe("Gb");
    expect(ENHARMONIC_PAIRS["Gb"]).toBe("F#");
    expect(ENHARMONIC_PAIRS["G#"]).toBe("Ab");
    expect(ENHARMONIC_PAIRS["Ab"]).toBe("G#");
    expect(ENHARMONIC_PAIRS["A#"]).toBe("Bb");
    expect(ENHARMONIC_PAIRS["Bb"]).toBe("A#");

    // Verify key definition has matching enharmonic pitch
    const keys = generateKeyboardKeys(4, 1); // C4 to C5
    const fSharp = keys.find((k) => k.note === "F#4");
    expect(fSharp?.enharmonic).toBe("Gb4");

    const aSharp = keys.find((k) => k.note === "A#4");
    expect(aSharp?.enharmonic).toBe("Bb4");
  });

  it("maps computer keyboard shortcuts cleanly to notes", () => {
    // Key "a" maps to Middle C (C4, offset 0)
    expect(DEFAULT_KEYBOARD_SHORTCUTS["a"]?.noteOffset).toBe(0);
    expect(DEFAULT_KEYBOARD_SHORTCUTS["a"]?.isBlack).toBe(false);

    // Key "w" maps to C#4 (offset 1)
    expect(DEFAULT_KEYBOARD_SHORTCUTS["w"]?.noteOffset).toBe(1);
    expect(DEFAULT_KEYBOARD_SHORTCUTS["w"]?.isBlack).toBe(true);

    // Key "s" maps to D4 (offset 2)
    expect(DEFAULT_KEYBOARD_SHORTCUTS["s"]?.noteOffset).toBe(2);

    // Key "k" maps to C5 (offset 12)
    expect(DEFAULT_KEYBOARD_SHORTCUTS["k"]?.noteOffset).toBe(12);
  });

  it("generates detailed note analysis with cluster topology and Middle C distance", () => {
    const analysisC4 = getKeyboardNoteAnalysis("C4");
    expect(analysisC4.midi).toBe(60);
    expect(analysisC4.isBlack).toBe(false);
    expect(analysisC4.middleCRelation).toContain("This IS Middle C");

    const analysisD4 = getKeyboardNoteAnalysis("D4");
    expect(analysisD4.groupPattern).toContain("between the group of two black keys");

    const analysisFSharp = getKeyboardNoteAnalysis("F#4");
    expect(analysisFSharp.isBlack).toBe(true);
    expect(analysisFSharp.groupPattern).toContain("3-black-key cluster");
    expect(analysisFSharp.enharmonicText).toContain("G♭4");
  });

  it("generates randomized practice questions across all practice modes", () => {
    const modes = [
      "locate-middle-c",
      "locate-note",
      "semitone-step",
      "whole-tone-step",
      "octave-jump",
      "enharmonic",
    ] as const;

    for (const mode of modes) {
      const q = generateKeyboardQuestion(mode, "Beginner");
      expect(q.id).toBeTruthy();
      expect(q.prompt).toBeTruthy();
      expect(q.targetNotes.length).toBeGreaterThan(0);
      expect(q.hint).toBeTruthy();
      expect(q.explanation).toBeTruthy();
    }
  });
});

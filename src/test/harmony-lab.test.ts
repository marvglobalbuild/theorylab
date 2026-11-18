import { describe, expect, it } from "vitest";

import {
  buildChord,
  checkVoiceLeading,
  CHORD_TYPES_CATALOG,
  generateHarmonyQuestion,
  getDiatonicChords,
  PROGRESSION_PRESETS,
  realizeProgression,
  type ChordInversion,
  type ChordQuality,
  type SATBChord,
} from "@/lib/music/harmony-lab";
import { noteToMidi } from "@/lib/music/theory";

describe("Harmony Lab — Tertian Chord Construction", () => {
  it("includes all 9 required chord types in CHORD_TYPES_CATALOG", () => {
    expect(CHORD_TYPES_CATALOG).toHaveLength(9);
    const ids = CHORD_TYPES_CATALOG.map((c) => c.id);
    expect(ids).toEqual([
      "major",
      "minor",
      "diminished",
      "augmented",
      "dominant-7",
      "major-7",
      "minor-7",
      "half-diminished-7",
      "diminished-7",
    ]);
  });

  it("builds a C Major triad correctly (root, 3rd, 5th)", () => {
    const chord = buildChord("C", "major", 4);
    expect(chord.root).toBe("C");
    expect(chord.quality).toBe("major");
    expect(chord.inversion).toBe("root");
    expect(chord.symbol).toBe("C");
    expect(chord.notes).toEqual(["C4", "E4", "G4"]);
    expect(chord.figuredBass).toBe("5/3");
    expect(chord.formula).toBe("1 - 3 - 5");
  });

  it("builds a C Minor triad correctly (1, b3, 5)", () => {
    const chord = buildChord("C", "minor", 4);
    expect(chord.symbol).toBe("Cm");
    expect(chord.notes).toEqual(["C4", "D#4", "G4"]); // enharmonic D#4 / Eb4 = 3 semitones above C4
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(3);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(7);
  });

  it("builds a B Diminished triad (1, b3, b5)", () => {
    const chord = buildChord("B", "diminished", 3);
    expect(chord.symbol).toBe("B°");
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(3);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(6);
  });

  it("builds an Augmented triad (1, 3, #5)", () => {
    const chord = buildChord("C", "augmented", 4);
    expect(chord.symbol).toBe("C+");
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(4);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(8);
  });

  it("builds a G Dominant 7th chord (1, 3, 5, b7)", () => {
    const chord = buildChord("G", "dominant-7", 4);
    expect(chord.symbol).toBe("G7");
    expect(chord.notes).toHaveLength(4);
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(4);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(7);
    expect(noteToMidi(chord.notes[3]!) - noteToMidi(chord.notes[0]!)).toBe(10);
  });

  it("builds a C Major 7th chord (1, 3, 5, 7)", () => {
    const chord = buildChord("C", "major-7", 4);
    expect(chord.symbol).toBe("Cmaj7");
    expect(chord.notes).toHaveLength(4);
    expect(noteToMidi(chord.notes[3]!) - noteToMidi(chord.notes[0]!)).toBe(11);
  });

  it("builds an A Minor 7th chord (1, b3, 5, b7)", () => {
    const chord = buildChord("A", "minor-7", 3);
    expect(chord.symbol).toBe("Am7");
    expect(chord.notes).toHaveLength(4);
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(3);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(7);
    expect(noteToMidi(chord.notes[3]!) - noteToMidi(chord.notes[0]!)).toBe(10);
  });

  it("builds a B Half-Diminished 7th chord (1, b3, b5, b7)", () => {
    const chord = buildChord("B", "half-diminished-7", 3);
    expect(chord.symbol).toBe("Bø7");
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(3);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(6);
    expect(noteToMidi(chord.notes[3]!) - noteToMidi(chord.notes[0]!)).toBe(10);
  });

  it("builds a Fully Diminished 7th chord (1, b3, b5, bb7)", () => {
    const chord = buildChord("B", "diminished-7", 3);
    expect(chord.symbol).toBe("B°7");
    expect(noteToMidi(chord.notes[1]!) - noteToMidi(chord.notes[0]!)).toBe(3);
    expect(noteToMidi(chord.notes[2]!) - noteToMidi(chord.notes[0]!)).toBe(6);
    expect(noteToMidi(chord.notes[3]!) - noteToMidi(chord.notes[0]!)).toBe(9);
  });
});

describe("Harmony Lab — Inversions and Figured Bass", () => {
  it("inverts a triad to 1st inversion (6/3 represented as 6) with 3rd in bass", () => {
    const rootChord = buildChord("C", "major", 4, "root");
    const firstInv = buildChord("C", "major", 4, "first");

    expect(firstInv.figuredBass).toBe("6");
    expect(firstInv.bassNote).toBe(rootChord.notes[1]);
    expect(noteToMidi(firstInv.notes[0]!)).toBe(noteToMidi(rootChord.notes[1]!));
    expect(noteToMidi(firstInv.notes[2]!)).toBe(noteToMidi(rootChord.notes[0]!) + 12);
  });

  it("inverts a triad to 2nd inversion (6/4) with 5th in bass", () => {
    const rootChord = buildChord("C", "major", 4, "root");
    const secondInv = buildChord("C", "major", 4, "second");

    expect(secondInv.figuredBass).toBe("6/4");
    expect(secondInv.bassNote).toBe(rootChord.notes[2]);
    expect(noteToMidi(secondInv.notes[0]!)).toBe(noteToMidi(rootChord.notes[2]!));
  });

  it("inverts a 7th chord through all three inversions (6/5, 4/3, 4/2)", () => {
    const rootChord = buildChord("G", "dominant-7", 4, "root");
    const inv1 = buildChord("G", "dominant-7", 4, "first");
    const inv2 = buildChord("G", "dominant-7", 4, "second");
    const inv3 = buildChord("G", "dominant-7", 4, "third");

    expect(rootChord.figuredBass).toBe("7");
    expect(inv1.figuredBass).toBe("6/5");
    expect(inv2.figuredBass).toBe("4/3");
    expect(inv3.figuredBass).toBe("4/2");

    expect(inv1.bassNote).toBe(rootChord.notes[1]);
    expect(inv2.bassNote).toBe(rootChord.notes[2]);
    expect(inv3.bassNote).toBe(rootChord.notes[3]);
  });
});

describe("Harmony Lab — Diatonic Roman Numeral Analysis", () => {
  it("generates correct diatonic triads for C Major with proper case conventions", () => {
    const chords = getDiatonicChords("C", "major", 4);
    expect(chords).toHaveLength(7);

    // I, ii, iii, IV, V, vi, vii°
    expect(chords[0]?.roman).toBe("I");
    expect(chords[0]?.quality).toBe("major");
    expect(chords[0]?.functionType).toBe("tonic");

    expect(chords[1]?.roman).toBe("ii");
    expect(chords[1]?.quality).toBe("minor");
    expect(chords[1]?.functionType).toBe("predominant");

    expect(chords[2]?.roman).toBe("iii");
    expect(chords[2]?.quality).toBe("minor");

    expect(chords[3]?.roman).toBe("IV");
    expect(chords[3]?.quality).toBe("major");
    expect(chords[3]?.functionType).toBe("predominant");

    expect(chords[4]?.roman).toBe("V");
    expect(chords[4]?.quality).toBe("major");
    expect(chords[4]?.functionType).toBe("dominant");

    expect(chords[5]?.roman).toBe("vi");
    expect(chords[5]?.quality).toBe("minor");

    expect(chords[6]?.roman).toBe("vii°");
    expect(chords[6]?.quality).toBe("diminished");
    expect(chords[6]?.functionType).toBe("dominant");
  });

  it("generates correct diatonic triads for A Harmonic Minor with raised 7th", () => {
    const chords = getDiatonicChords("A", "minor", 4);
    expect(chords).toHaveLength(7);

    // i, ii°, III, iv, V, VI, vii°
    expect(chords[0]?.roman).toBe("i");
    expect(chords[0]?.quality).toBe("minor");

    expect(chords[1]?.roman).toBe("ii°");
    expect(chords[1]?.quality).toBe("diminished");

    expect(chords[3]?.roman).toBe("iv");
    expect(chords[3]?.quality).toBe("minor");

    expect(chords[4]?.roman).toBe("V");
    expect(chords[4]?.quality).toBe("major"); // Raised 7th gives major dominant
    expect(chords[4]?.functionType).toBe("dominant");

    expect(chords[6]?.roman).toBe("vii°");
    expect(chords[6]?.quality).toBe("diminished");
  });
});

describe("Harmony Lab — Chord Progressions and Realization", () => {
  it("realizes an authentic cadence in G Major", () => {
    const preset = PROGRESSION_PRESETS.find((p) => p.id === "authentic-cadence-major")!;
    const realized = realizeProgression(preset, "G", 4);

    expect(realized.key).toBe("G major");
    expect(realized.chords).toHaveLength(4);
    expect(realized.chords.map((c) => c.roman)).toEqual(["I", "IV", "V", "I"]);
    expect(realized.chords[0]?.symbol).toBe("G");
    expect(realized.chords[1]?.symbol).toBe("C");
    expect(realized.chords[2]?.symbol).toBe("D");
    expect(realized.chords[3]?.symbol).toBe("G");
  });

  it("realizes a ii-V-I progression", () => {
    const preset = PROGRESSION_PRESETS.find((p) => p.id === "ii-v-i-jazz-classical")!;
    const realized = realizeProgression(preset, "C", 4);

    expect(realized.chords.map((c) => c.roman)).toEqual(["I", "ii", "V", "I"]);
    expect(realized.chords[1]?.symbol).toBe("Dm");
    expect(realized.chords[2]?.symbol).toBe("G");
  });

  it("realizes a minor key cadence in D Minor", () => {
    const preset = PROGRESSION_PRESETS.find((p) => p.id === "minor-authentic-cadence")!;
    const realized = realizeProgression(preset, "D", 4);

    expect(realized.key).toBe("D minor");
    expect(realized.chords.map((c) => c.roman)).toEqual(["i", "iv", "V", "i"]);
    expect(realized.chords[0]?.symbol).toBe("Dm");
    expect(realized.chords[2]?.symbol).toBe("A"); // Major dominant in D minor
  });
});

describe("Harmony Lab — SATB Voice Leading Engine", () => {
  it("flags parallel fifths between Bass and Tenor", () => {
    const chord1: SATBChord = { soprano: "C5", alto: "G4", tenor: "G3", bass: "C3" };
    const chord2: SATBChord = { soprano: "D5", alto: "A4", tenor: "A3", bass: "D3" };

    const violations = checkVoiceLeading(chord1, chord2);
    const fifthViolations = violations.filter((v) => v.type === "parallel-fifths");

    expect(fifthViolations.length).toBeGreaterThanOrEqual(1);
    expect(fifthViolations.some((v) => v.voices.includes("Bass") && v.voices.includes("Tenor"))).toBe(true);
  });

  it("flags parallel octaves between Bass and Soprano", () => {
    const chord1: SATBChord = { soprano: "C5", alto: "E4", tenor: "G3", bass: "C3" };
    const chord2: SATBChord = { soprano: "D5", alto: "F4", tenor: "A3", bass: "D3" };

    const violations = checkVoiceLeading(chord1, chord2);
    const octaveViolations = violations.filter((v) => v.type === "parallel-octaves");

    expect(octaveViolations.length).toBeGreaterThanOrEqual(1);
    expect(octaveViolations.some((v) => v.voices.includes("Bass") && v.voices.includes("Soprano"))).toBe(true);
  });

  it("flags voice crossing when Soprano dips beneath Alto", () => {
    const chord1: SATBChord = { soprano: "G4", alto: "E4", tenor: "C4", bass: "C3" };
    const chord2: SATBChord = { soprano: "D4", alto: "F4", tenor: "C4", bass: "F3" }; // D4 is lower than F4!

    const violations = checkVoiceLeading(chord1, chord2);
    const crossing = violations.filter((v) => v.type === "voice-crossing");

    expect(crossing.length).toBeGreaterThanOrEqual(1);
    expect(crossing[0]?.description).toContain("Soprano");
  });

  it("flags excessive spacing when distance between Soprano and Alto exceeds 12 semitones", () => {
    const chord1: SATBChord = { soprano: "G4", alto: "E4", tenor: "C4", bass: "C3" };
    const chord2: SATBChord = { soprano: "G5", alto: "E4", tenor: "C4", bass: "C3" }; // G5 - E4 = 15 semitones > 12

    const violations = checkVoiceLeading(chord1, chord2);
    const spacing = violations.filter((v) => v.type === "excessive-spacing");

    expect(spacing.length).toBeGreaterThanOrEqual(1);
    expect(spacing[0]?.severity).toBe("warning");
  });

  it("passes smooth contrary motion voice leading without false errors", () => {
    // I (C E G C) to IV (F F A C)
    const chord1: SATBChord = { soprano: "E4", alto: "C4", tenor: "G3", bass: "C3" };
    const chord2: SATBChord = { soprano: "F4", alto: "C4", tenor: "A3", bass: "F2" };

    const violations = checkVoiceLeading(chord1, chord2);
    expect(violations.filter((v) => v.severity === "error")).toHaveLength(0);
  });
});

describe("Harmony Lab — Question Generator", () => {
  it("generates valid chord quality questions", () => {
    const q = generateHarmonyQuestion("chord-quality", "Beginner");
    expect(q.type).toBe("chord-quality");
    expect(q.options.length).toBeGreaterThanOrEqual(4);
    expect(q.options).toContain(q.correctAnswer);
    expect(q.notesToPlay).toBeDefined();
  });

  it("generates valid chord inversion questions", () => {
    const q = generateHarmonyQuestion("chord-inversion", "Intermediate");
    expect(q.type).toBe("chord-inversion");
    expect(q.options).toContain(q.correctAnswer);
  });

  it("generates valid Roman numeral questions", () => {
    const q = generateHarmonyQuestion("roman-numeral", "Beginner");
    expect(q.type).toBe("roman-numeral");
    expect(q.prompt).toContain("Roman numeral");
    expect(q.options).toContain(q.correctAnswer);
  });

  it("generates valid cadence questions", () => {
    const q = generateHarmonyQuestion("cadence-id", "Beginner");
    expect(q.type).toBe("cadence-id");
    expect(q.options).toContain(q.correctAnswer);
  });

  it("generates valid voice leading check questions", () => {
    const q = generateHarmonyQuestion("voice-leading-check", "Intermediate");
    expect(q.type).toBe("voice-leading-check");
    expect(q.options).toContain(q.correctAnswer);
    expect(q.chordsToInspect).toBeDefined();
  });
});

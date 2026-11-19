import { describe, expect, it } from "vitest";

import {
  calculateIntervalPitch,
  generateIntervalQuestion,
  generateScaleChallenge,
  INTERVALS_CATALOG,
  realizeScale,
  SCALES_CATALOG,
  validateScaleBuildStep,
} from "@/lib/music/scales-intervals-lab";
import { noteToMidi } from "@/lib/music/theory";

describe("Scales and Intervals Lab — Theoretical Foundations", () => {
  describe("Interval Catalog & Frequency Physics", () => {
    it("contains all 17 simple and compound intervals", () => {
      expect(INTERVALS_CATALOG).toHaveLength(17);
      const simple = INTERVALS_CATALOG.filter((i) => !i.isCompound);
      const compound = INTERVALS_CATALOG.filter((i) => i.isCompound);

      expect(simple).toHaveLength(13); // P1 to P8
      expect(compound).toHaveLength(4); // m9, M9, M10, P11
    });

    it("verifies accurate semitone spans and frequency ratios", () => {
      const p1 = INTERVALS_CATALOG.find((i) => i.id === "P1")!;
      const m2 = INTERVALS_CATALOG.find((i) => i.id === "m2")!;
      const m3 = INTERVALS_CATALOG.find((i) => i.id === "m3")!;
      const m9 = INTERVALS_CATALOG.find((i) => i.id === "m9")!;

      expect(p1.semitones).toBe(0);
      expect(p1.frequencyRatio).toBe("1:1");

      expect(m2.semitones).toBe(1);
      expect(m2.frequencyRatio).toBe("16:15");

      expect(m3.semitones).toBe(3);
      expect(m3.frequencyRatio).toBe("6:5");

      expect(m9.semitones).toBe(13);
      expect(m9.isCompound).toBe(true);
    });

    it("validates interval inversion rules (sum of sizes = 9, sum of semitones = 12)", () => {
      const simpleInvertibles = INTERVALS_CATALOG.filter(
        (i) => !i.isCompound && i.inversionSemitones !== undefined,
      );

      simpleInvertibles.forEach((interval) => {
        expect(interval.semitones + interval.inversionSemitones!).toBe(12);
      });
    });
  });

  describe("calculateIntervalPitch", () => {
    it("correctly computes theoretical pitch spelling for ascending intervals", () => {
      const m3Def = INTERVALS_CATALOG.find((i) => i.id === "m3")!;
      const res = calculateIntervalPitch("C4", m3Def, "ascending");

      expect(res.baseNote).toBe("C4");
      expect(res.targetNote).toBe("Eb4"); // Must be Eb, not D#
      expect(res.semitones).toBe(3);
    });

    it("correctly computes theoretical pitch spelling for descending intervals", () => {
      const p5Def = INTERVALS_CATALOG.find((i) => i.id === "P5")!;
      const res = calculateIntervalPitch("C4", p5Def, "descending");

      expect(res.baseNote).toBe("C4");
      expect(res.targetNote).toBe("F3");
      expect(noteToMidi("C4") - noteToMidi(res.targetNote)).toBe(7);
    });
  });

  describe("Scales Catalog & Enharmonic Realization", () => {
    it("contains scales across major, minor, modes, and other categories", () => {
      expect(SCALES_CATALOG.length).toBeGreaterThanOrEqual(15);
      const major = SCALES_CATALOG.filter((s) => s.category === "major");
      const minor = SCALES_CATALOG.filter((s) => s.category === "minor");
      const modes = SCALES_CATALOG.filter((s) => s.category === "modes");
      const other = SCALES_CATALOG.filter((s) => s.category === "other");

      expect(major.length).toBeGreaterThanOrEqual(1);
      expect(minor.length).toBeGreaterThanOrEqual(3); // natural, harmonic, melodic
      expect(modes.length).toBe(7); // Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
      expect(other.length).toBeGreaterThanOrEqual(4); // pentatonics, blues, chromatic
    });

    it("realizes D major with accurate F# and C# spellings", () => {
      const dMajor = realizeScale("D", "major", 4);
      expect(dMajor.notes).toEqual(["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"]);
    });

    it("realizes F major with accurate Bb spelling", () => {
      const fMajor = realizeScale("F", "major", 4);
      expect(fMajor.notes).toEqual(["F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5"]);
    });

    it("realizes Melodic Minor with distinct descending notes", () => {
      const cMelodic = realizeScale("C", "melodic-minor", 4);
      expect(cMelodic.notes).toBeDefined();
      expect(cMelodic.descendingNotes).toBeDefined();
      expect(cMelodic.descendingNotes?.length).toBe(8);
    });
  });

  describe("validateScaleBuildStep", () => {
    it("validates correct pitch placement", () => {
      const target = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
      const user = ["C4", "D4"];
      const val = validateScaleBuildStep(target, user);

      expect(val.isCorrect).toBe(true);
      expect(val.stepIndex).toBe(1);
    });

    it("rejects incorrect pitch placement and reports semitone discrepancy", () => {
      const target = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
      const user = ["C4", "D#4"];
      const val = validateScaleBuildStep(target, user);

      expect(val.isCorrect).toBe(false);
      expect(val.message).toContain("1 semitone(s) too higher");
    });
  });

  describe("Question Generators", () => {
    it("generates valid interval trainer questions", () => {
      const q = generateIntervalQuestion("identify-by-ear", "Beginner");
      expect(q.prompt).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options).toContain(q.correctAnswer);
      expect(q.notesToPlay.length).toBeGreaterThanOrEqual(1);
    });

    it("generates valid scale challenge questions", () => {
      const q = generateScaleChallenge("Beginner");
      expect(q.prompt).toBeTruthy();
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options).toContain(q.correctAnswer);
      expect(q.notes.length).toBeGreaterThanOrEqual(5);
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  buildInterval,
  compareMelody,
  generateEarTrainingQuiz,
  generateHarmonicExercise,
  generatePitchExercise,
  INTERVALS_CATALOG,
  MELODIC_DICTATION_PRESETS,
} from "@/lib/music/ear-training-lab";
import { noteToMidi } from "@/lib/music/theory";

describe("Ear Training Lab — Theoretical Models and Computations", () => {
  describe("Interval Catalog & Frequency Ratios", () => {
    it("contains all 13 standard intervals from P1 to P8", () => {
      expect(INTERVALS_CATALOG).toHaveLength(13);
      const semitones = INTERVALS_CATALOG.map((i) => i.semitones);
      expect(semitones).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    });

    it("verifies accurate academic consonance classifications", () => {
      const p1 = INTERVALS_CATALOG.find((i) => i.shortName === "P1")!;
      const p5 = INTERVALS_CATALOG.find((i) => i.shortName === "P5")!;
      const p8 = INTERVALS_CATALOG.find((i) => i.shortName === "P8")!;
      expect(p1.consonanceType).toBe("perfect-consonance");
      expect(p5.consonanceType).toBe("perfect-consonance");
      expect(p8.consonanceType).toBe("perfect-consonance");

      const m3 = INTERVALS_CATALOG.find((i) => i.shortName === "m3")!;
      const m6 = INTERVALS_CATALOG.find((i) => i.shortName === "m6")!;
      expect(m3.consonanceType).toBe("imperfect-consonance");
      expect(m6.consonanceType).toBe("imperfect-consonance");

      const tt = INTERVALS_CATALOG.find((i) => i.shortName === "TT")!;
      const m2 = INTERVALS_CATALOG.find((i) => i.shortName === "m2")!;
      const m7 = INTERVALS_CATALOG.find((i) => i.shortName === "m7")!;
      expect(tt.consonanceType).toBe("dissonance");
      expect(m2.consonanceType).toBe("dissonance");
      expect(m7.consonanceType).toBe("dissonance");
    });

    it("ensures every interval possesses an acoustic ratio and song mnemonic", () => {
      INTERVALS_CATALOG.forEach((interval) => {
        expect(interval.ratioName).toBeTruthy();
        expect(interval.mnemonicSong).toBeTruthy();
        expect(interval.description).toBeTruthy();
      });
    });
  });

  describe("buildInterval computation", () => {
    it("correctly constructs ascending intervals", () => {
      const p5 = buildInterval("C4", 7, "ascending");
      expect(p5.rootNote).toBe("C4");
      expect(p5.targetNote).toBe("G4");
      expect(p5.direction).toBe("ascending");
      expect(p5.notesToPlay).toEqual(["C4", "G4"]);
    });

    it("correctly constructs descending intervals", () => {
      const p5Desc = buildInterval("C4", 7, "descending");
      expect(p5Desc.rootNote).toBe("C4");
      expect(p5Desc.targetNote).toBe("F3");
      expect(p5Desc.direction).toBe("descending");
      expect(noteToMidi("C4") - noteToMidi(p5Desc.targetNote)).toBe(7);
    });

    it("correctly handles harmonic (simultaneous) interval specifications", () => {
      const octave = buildInterval("A3", 12, "harmonic");
      expect(octave.rootNote).toBe("A3");
      expect(octave.targetNote).toBe("A4");
      expect(octave.direction).toBe("harmonic");
    });
  });

  describe("Pitch Exercise Generator", () => {
    it("generates single-pitch identification exercises with 4 options", () => {
      const ex = generatePitchExercise("single-pitch-id", "Beginner");
      expect(ex.type).toBe("single-pitch-id");
      expect(ex.options).toHaveLength(4);
      expect(ex.options).toContain(ex.correctAnswer);
      expect(ex.targetPitches).toHaveLength(1);
    });

    it("generates higher vs lower pitch comparison exercises", () => {
      const ex = generatePitchExercise("pitch-compare-high-low", "Intermediate");
      expect(ex.type).toBe("pitch-compare-high-low");
      expect(ex.targetPitches).toHaveLength(2);
      expect(ex.options).toEqual([
        "Note B is Higher than Note A",
        "Note B is Lower than Note A",
      ]);
      const p1Midi = noteToMidi(ex.targetPitches[0]!);
      const p2Midi = noteToMidi(ex.targetPitches[1]!);
      if (p2Midi > p1Midi) {
        expect(ex.correctAnswer).toBe("Note B is Higher than Note A");
      } else {
        expect(ex.correctAnswer).toBe("Note B is Lower than Note A");
      }
    });

    it("generates octave register discrimination exercises", () => {
      const ex = generatePitchExercise("octave-discrimination", "Advanced");
      expect(ex.type).toBe("octave-discrimination");
      expect(ex.options).toHaveLength(4);
      expect(ex.options).toContain(ex.correctAnswer);
    });

    it("generates pitch matching (same/different) exercises", () => {
      const ex = generatePitchExercise("pitch-matching", "Beginner");
      expect(ex.type).toBe("pitch-matching");
      expect(ex.targetPitches).toHaveLength(2);
      expect(ex.options).toContain(ex.correctAnswer);
    });
  });

  describe("Melodic Dictation Engine & Evaluation", () => {
    it("contains presets across Beginner, Intermediate, and Advanced tiers", () => {
      const beg = MELODIC_DICTATION_PRESETS.filter((p) => p.difficulty === "Beginner");
      const inter = MELODIC_DICTATION_PRESETS.filter((p) => p.difficulty === "Intermediate");
      const adv = MELODIC_DICTATION_PRESETS.filter((p) => p.difficulty === "Advanced");

      expect(beg.length).toBeGreaterThan(0);
      expect(inter.length).toBeGreaterThan(0);
      expect(adv.length).toBeGreaterThan(0);
    });

    it("evaluates a 100% matching transcription accurately", () => {
      const target = ["C4", "D4", "E4", "C4"];
      const user = ["C4", "D4", "E4", "C4"];
      const res = compareMelody(target, user);

      expect(res.isFullyCorrect).toBe(true);
      expect(res.accuracyPercent).toBe(100);
      expect(res.matchingCount).toBe(4);
      expect(res.noteDiscrepancies.every((d) => d.isMatch)).toBe(true);
    });

    it("evaluates transcription errors with precise semitone discrepancies", () => {
      const target = ["C4", "D4", "E4", "C4"];
      const user = ["C4", "D#4", "E4", "B3"]; // note 2 is +1 semitone off, note 4 is -1 semitone off
      const res = compareMelody(target, user);

      expect(res.isFullyCorrect).toBe(false);
      expect(res.matchingCount).toBe(2);
      expect(res.accuracyPercent).toBe(50);
      expect(res.noteDiscrepancies[1]?.offsetSemitones).toBe(1); // D4 (62) to D#4 (63)
      expect(res.noteDiscrepancies[3]?.offsetSemitones).toBe(-1); // C4 (60) to B3 (59)
    });
  });

  describe("Harmonic Exercise Generator", () => {
    it("generates Major vs Minor quality exercises with audible chord steps", () => {
      const ex = generateHarmonicExercise("major-vs-minor-quality", "Beginner");
      expect(ex.type).toBe("major-vs-minor-quality");
      expect(ex.options).toHaveLength(2);
      expect(ex.options).toContain(ex.correctAnswer);
      expect(ex.notesToPlay).toBeDefined();
      expect(ex.notesToPlay![0]!.length).toBe(3); // Triad
    });

    it("generates Stability vs Tension exercises (Tonic vs Dominant 7th)", () => {
      const ex = generateHarmonicExercise("harmonic-stability-tension", "Intermediate");
      expect(ex.type).toBe("harmonic-stability-tension");
      expect(ex.options).toContain(ex.correctAnswer);
      expect(ex.notesToPlay).toBeDefined();
    });

    it("generates Cadence recognition exercises with multi-chord realizations", () => {
      const ex = generateHarmonicExercise("cadence-recognition", "Intermediate");
      expect(ex.type).toBe("cadence-recognition");
      expect(ex.options).toHaveLength(4);
      expect(ex.options).toContain(ex.correctAnswer);
      expect(ex.notesToPlay!.length).toBeGreaterThanOrEqual(2);
    });

    it("generates Chord Progression identification exercises", () => {
      const ex = generateHarmonicExercise("progression-identification", "Advanced");
      expect(ex.type).toBe("progression-identification");
      expect(ex.options.length).toBeGreaterThan(1);
      expect(ex.options).toContain(ex.correctAnswer);
    });
  });

  describe("Universal Ear Training Practice Quiz", () => {
    it("generates comprehensive quiz questions across topic categories", () => {
      const topics = [
        "all",
        "pitch-recognition",
        "interval-recognition",
        "chord-recognition",
        "harmonic-listening",
      ] as const;

      topics.forEach((t) => {
        const q = generateEarTrainingQuiz(t, "Beginner");
        expect(q.prompt).toBeTruthy();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.options).toContain(q.correctAnswer);
        expect(q.explanation).toBeTruthy();
        expect(q.notesToAudition.length).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

import { describe, expect, it } from "vitest";

import {
  evaluateRhythmPerformance,
  generateRhythmQuestion,
  RHYTHM_DURATIONS_CATALOG,
  RHYTHM_PATTERN_PRESETS,
  TIME_SIGNATURES_CATALOG,
  validateMeasure,
} from "@/lib/music/rhythm-lab";

describe("Rhythm Lab — Durations Catalog and Beat Calculations", () => {
  it("includes all primary note and rest values", () => {
    const ids = RHYTHM_DURATIONS_CATALOG.map((d) => d.id);
    expect(ids).toContain("w"); // Whole note
    expect(ids).toContain("wr"); // Whole rest
    expect(ids).toContain("h"); // Half note
    expect(ids).toContain("hr"); // Half rest
    expect(ids).toContain("q"); // Quarter note
    expect(ids).toContain("qr"); // Quarter rest
    expect(ids).toContain("8"); // Eighth note
    expect(ids).toContain("8r"); // Eighth rest
    expect(ids).toContain("16"); // Sixteenth note
    expect(ids).toContain("16r"); // Sixteenth rest
  });

  it("calculates exact quarter-beat proportions for standard values", () => {
    const whole = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "w")!;
    const half = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "h")!;
    const quarter = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "q")!;
    const eighth = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "8")!;
    const sixteenth = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "16")!;

    expect(whole.quarterBeats).toBe(4);
    expect(half.quarterBeats).toBe(2);
    expect(quarter.quarterBeats).toBe(1);
    expect(eighth.quarterBeats).toBe(0.5);
    expect(sixteenth.quarterBeats).toBe(0.25);
  });

  it("calculates exact dotted values (+50% augmentation)", () => {
    const dottedHalf = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "hd")!;
    const dottedQuarter = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "qd")!;
    const dottedEighth = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === "8d")!;

    expect(dottedHalf.quarterBeats).toBe(3); // 2 + 1
    expect(dottedQuarter.quarterBeats).toBe(1.5); // 1 + 0.5
    expect(dottedEighth.quarterBeats).toBe(0.75); // 0.5 + 0.25
  });
});

describe("Rhythm Lab — Time Signatures & Metric Taxonomy", () => {
  it("includes all 8 required time signatures", () => {
    const signatures = TIME_SIGNATURES_CATALOG.map((t) => t.signature);
    expect(signatures).toEqual(["2/4", "3/4", "4/4", "2/2", "3/8", "6/8", "9/8", "12/8"]);
  });

  it("classifies simple vs compound meters accurately", () => {
    const twoFour = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "2/4")!;
    const threeFour = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "3/4")!;
    const fourFour = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "4/4")!;
    const sixEight = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "6/8")!;
    const nineEight = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "9/8")!;
    const twelveEight = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "12/8")!;

    expect(twoFour.meterType).toBe("simple");
    expect(twoFour.subdivisionCountPerBeat).toBe(2);

    expect(threeFour.meterType).toBe("simple");
    expect(threeFour.grouping).toBe("triple");

    expect(fourFour.meterType).toBe("simple");
    expect(fourFour.grouping).toBe("quadruple");
    expect(fourFour.macroBeatsPerMeasure).toBe(4);

    expect(sixEight.meterType).toBe("compound");
    expect(sixEight.grouping).toBe("duple");
    expect(sixEight.macroBeatsPerMeasure).toBe(2);
    expect(sixEight.subdivisionCountPerBeat).toBe(3);

    expect(nineEight.meterType).toBe("compound");
    expect(nineEight.grouping).toBe("triple");
    expect(nineEight.macroBeatsPerMeasure).toBe(3);

    expect(twelveEight.meterType).toBe("compound");
    expect(twelveEight.grouping).toBe("quadruple");
    expect(twelveEight.macroBeatsPerMeasure).toBe(4);
  });

  it("defines correct metric accent hierarchies", () => {
    const fourFour = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "4/4")!;
    expect(fourFour.accents[0]).toBe("strong"); // Beat 1
    expect(fourFour.accents[1]).toBe("weak"); // Beat 2
    expect(fourFour.accents[2]).toBe("medium"); // Beat 3
    expect(fourFour.accents[3]).toBe("weak"); // Beat 4

    const threeFour = TIME_SIGNATURES_CATALOG.find((t) => t.signature === "3/4")!;
    expect(threeFour.accents).toEqual(["strong", "weak", "weak"]);
  });
});

describe("Rhythm Lab — Measure Capacity Validation", () => {
  it("validates a complete 4/4 measure (4 quarters)", () => {
    const res = validateMeasure(["q", "q", "q", "q"], "4/4");
    expect(res.isComplete).toBe(true);
    expect(res.isOverfilled).toBe(false);
    expect(res.isUnderfilled).toBe(false);
    expect(res.totalQuarterBeats).toBe(4);
    expect(res.remainingQuarterBeats).toBe(0);
    expect(res.percentFilled).toBe(100);
  });

  it("detects an incomplete 3/4 measure (1 half note = 2 beats)", () => {
    const res = validateMeasure(["h"], "3/4");
    expect(res.isComplete).toBe(false);
    expect(res.isUnderfilled).toBe(true);
    expect(res.totalQuarterBeats).toBe(2);
    expect(res.expectedQuarterBeats).toBe(3);
    expect(res.remainingQuarterBeats).toBe(1);
    expect(res.statusMessage).toContain("incomplete");
  });

  it("detects an overfilled 2/4 measure (3 quarter notes = 3 beats)", () => {
    const res = validateMeasure(["q", "q", "q"], "2/4");
    expect(res.isComplete).toBe(false);
    expect(res.isOverfilled).toBe(true);
    expect(res.totalQuarterBeats).toBe(3);
    expect(res.expectedQuarterBeats).toBe(2);
    expect(res.statusMessage).toContain("overfilled");
  });

  it("validates a complete 6/8 compound measure (2 dotted quarters = 3 quarter beats)", () => {
    const res = validateMeasure(["qd", "qd"], "6/8");
    expect(res.isComplete).toBe(true);
    expect(res.totalQuarterBeats).toBe(3);
  });
});

describe("Rhythm Lab — Tap Performance Timing Evaluator", () => {
  it("evaluates a precise tap performance with an Exemplary score", () => {
    // 4 quarter beats at 1000ms intervals (1000, 2000, 3000, 4000)
    const expected = [1000, 2000, 3000, 4000];
    const userTaps = [1010, 1995, 3005, 4015]; // Tightly aligned (±15ms)

    const result = evaluateRhythmPerformance(expected, userTaps);
    expect(result.grade).toBe("Exemplary");
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.perfectHits).toBe(4);
    expect(result.missedNotes).toBe(0);
  });

  it("detects missed notes and penalizes score accordingly", () => {
    const expected = [1000, 2000, 3000, 4000];
    const userTaps = [1000, 2000]; // Only tapped first two beats

    const result = evaluateRhythmPerformance(expected, userTaps);
    expect(result.missedNotes).toBe(2);
    expect(result.score).toBeLessThan(70);
  });

  it("identifies rushing / early tendency when taps are consistently ahead", () => {
    const expected = [1000, 2000, 3000, 4000];
    const userTaps = [930, 1920, 2925, 3930]; // 70-80ms early

    const result = evaluateRhythmPerformance(expected, userTaps);
    expect(result.earlyHits).toBeGreaterThan(0);
    expect(result.feedbackDetails.some((f) => f.includes("Rushing"))).toBe(true);
  });

  it("handles empty user taps cleanly without crashing", () => {
    const expected = [1000, 2000];
    const result = evaluateRhythmPerformance(expected, []);
    expect(result.grade).toBe("Incomplete");
    expect(result.score).toBe(0);
    expect(result.tapsRecorded).toBe(0);
  });
});

describe("Rhythm Lab — Practice Question Generator", () => {
  it("generates duration identification questions", () => {
    const q = generateRhythmQuestion("duration-id", "Beginner");
    expect(q.category).toBe("duration-id");
    expect(q.options.length).toBeGreaterThanOrEqual(4);
    expect(q.options).toContain(q.correctAnswer);
  });

  it("generates incomplete measure questions with valid math", () => {
    const q = generateRhythmQuestion("incomplete-measure", "Beginner");
    expect(q.category).toBe("incomplete-measure");
    expect(q.prompt).toContain("What single note value is needed");
    expect(q.options).toContain(q.correctAnswer);
  });

  it("generates time signature identification questions", () => {
    const q = generateRhythmQuestion("time-signature-id", "Beginner");
    expect(q.category).toBe("time-signature-id");
    expect(q.options).toContain(q.correctAnswer);
  });

  it("generates simple vs compound meter questions", () => {
    const q = generateRhythmQuestion("simple-vs-compound", "Intermediate");
    expect(q.category).toBe("simple-vs-compound");
    expect(q.options).toContain(q.correctAnswer);
  });
});

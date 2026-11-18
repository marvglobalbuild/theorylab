/**
 * Rhythm Laboratory — Academic Rhythm Calculations, Time Signatures,
 * Meter Taxonomies, Subdivision Mathematics, Sequencer Scheduling,
 * Tap Timing Evaluation, and Dictation Engines for THEORYLAB.
 */

import type { StaffDuration } from "@/components/music/Staff";

export type MeterType = "simple" | "compound";
export type MeterGrouping = "duple" | "triple" | "quadruple";

export interface NoteDurationSpec {
  id: StaffDuration;
  nameUk: string;
  nameUs: string;
  quarterBeats: number; // Duration in quarter note beats (1 = quarter, 2 = half, 4 = whole, 0.5 = eighth, 0.25 = sixteenth)
  isRest: boolean;
  isDotted: boolean;
  symbolGlyph: string;
  subdivisionsSixteenths: number; // Value in sixteenths (1 = 16th, 2 = 8th, 4 = quarter, etc.)
  description: string;
}

export const RHYTHM_DURATIONS_CATALOG: NoteDurationSpec[] = [
  {
    id: "w",
    nameUk: "Semibreve",
    nameUs: "Whole Note",
    quarterBeats: 4,
    isRest: false,
    isDotted: false,
    symbolGlyph: "𝅝",
    subdivisionsSixteenths: 16,
    description: "An open circular notehead with no stem. In 4/4 time, it spans 4 full quarter-note beats.",
  },
  {
    id: "wr",
    nameUk: "Semibreve Rest",
    nameUs: "Whole Rest",
    quarterBeats: 4,
    isRest: true,
    isDotted: false,
    symbolGlyph: "𝄻",
    subdivisionsSixteenths: 16,
    description: "A small filled rectangle hanging beneath the fourth staff line. Represents a whole measure of silence.",
  },
  {
    id: "hd",
    nameUk: "Dotted Minim",
    nameUs: "Dotted Half Note",
    quarterBeats: 3,
    isRest: false,
    isDotted: true,
    symbolGlyph: "𝅗𝅥.",
    subdivisionsSixteenths: 12,
    description: "Half note extended by half its original value (2 + 1 = 3 quarter beats). Fills a complete measure of 3/4.",
  },
  {
    id: "h",
    nameUk: "Minim",
    nameUs: "Half Note",
    quarterBeats: 2,
    isRest: false,
    isDotted: false,
    symbolGlyph: "𝅗𝅥",
    subdivisionsSixteenths: 8,
    description: "An open notehead with a vertical stem. Spans two quarter beats (half of a 4/4 measure).",
  },
  {
    id: "hr",
    nameUk: "Minim Rest",
    nameUs: "Half Rest",
    quarterBeats: 2,
    isRest: true,
    isDotted: false,
    symbolGlyph: "𝄼",
    subdivisionsSixteenths: 8,
    description: "A small filled rectangle sitting atop the third staff line. Represents two quarter beats of silence.",
  },
  {
    id: "qd",
    nameUk: "Dotted Crotchet",
    nameUs: "Dotted Quarter Note",
    quarterBeats: 1.5,
    isRest: false,
    isDotted: true,
    symbolGlyph: "𝅘𝅥.",
    subdivisionsSixteenths: 6,
    description: "Quarter note extended by half its value (1 + 0.5 = 1.5 beats). Serves as the primary pulse unit in 6/8 and 9/8 compound meter.",
  },
  {
    id: "q",
    nameUk: "Crotchet",
    nameUs: "Quarter Note",
    quarterBeats: 1,
    isRest: false,
    isDotted: false,
    symbolGlyph: "𝅘𝅥",
    subdivisionsSixteenths: 4,
    description: "A solid black oval notehead with a vertical stem. The foundational pulse unit of common time.",
  },
  {
    id: "qr",
    nameUk: "Crotchet Rest",
    nameUs: "Quarter Rest",
    quarterBeats: 1,
    isRest: true,
    isDotted: false,
    symbolGlyph: "𝄽",
    subdivisionsSixteenths: 4,
    description: "A squiggly lightning-like glyph indicating exactly one quarter-note beat of silence.",
  },
  {
    id: "8d",
    nameUk: "Dotted Quaver",
    nameUs: "Dotted Eighth Note",
    quarterBeats: 0.75,
    isRest: false,
    isDotted: true,
    symbolGlyph: "𝅘𝅥𝅮.",
    subdivisionsSixteenths: 3,
    description: "Eighth note with dot (0.5 + 0.25 = 0.75 beats). Commonly paired with a sixteenth note in lilting dotted rhythms.",
  },
  {
    id: "8",
    nameUk: "Quaver",
    nameUs: "Eighth Note",
    quarterBeats: 0.5,
    isRest: false,
    isDotted: false,
    symbolGlyph: "𝅘𝅥𝅮",
    subdivisionsSixteenths: 2,
    description: "A solid notehead with a single flag or beam. Subdivides a quarter beat into two equal halves.",
  },
  {
    id: "8r",
    nameUk: "Quaver Rest",
    nameUs: "Eighth Rest",
    quarterBeats: 0.5,
    isRest: true,
    isDotted: false,
    symbolGlyph: "𝄾",
    subdivisionsSixteenths: 2,
    description: "A diagonal slash with a single hooked head, indicating half a beat of silence.",
  },
  {
    id: "16",
    nameUk: "Semiquaver",
    nameUs: "Sixteenth Note",
    quarterBeats: 0.25,
    isRest: false,
    isDotted: false,
    symbolGlyph: "𝅘𝅥𝅯",
    subdivisionsSixteenths: 1,
    description: "A solid notehead with two flags or beams. Subdivides a quarter beat into four rapid subdivisions.",
  },
  {
    id: "16r",
    nameUk: "Semiquaver Rest",
    nameUs: "Sixteenth Rest",
    quarterBeats: 0.25,
    isRest: true,
    isDotted: false,
    symbolGlyph: "𝄿",
    subdivisionsSixteenths: 1,
    description: "A diagonal slash with two hooked heads representing a one-quarter beat (1/16th) silence.",
  },
];

/**
 * Time Signature Definitions & Metric Classifications
 */
export interface TimeSignatureInfo {
  signature: string; // e.g. "4/4", "3/4", "6/8"
  numerator: number; // Top number: number of beats or counts per measure
  denominator: number; // Bottom number: note value representing each count
  meterType: MeterType; // "simple" (divides by 2) or "compound" (divides by 3)
  grouping: MeterGrouping; // "duple", "triple", or "quadruple"
  beatUnitName: string; // e.g. "Quarter note (𝅘𝅥)", "Dotted quarter (𝅘𝅥.)"
  beatUnitQuarterBeats: number; // Duration of one macro-beat in quarter-note beats
  macroBeatsPerMeasure: number; // Number of felt macro-pulses per measure (e.g. 2 in 6/8, 4 in 4/4)
  measureCapacityQuarterBeats: number; // Total measure duration in quarter-note beats
  accents: ("strong" | "medium" | "weak")[]; // Stress pattern per macro-beat or sub-beat
  subdivisionCountPerBeat: number; // 2 for simple, 3 for compound
  countingSyllables: string[]; // e.g. ["1", "&", "2", "&"] or ["1", "la", "li", "2", "la", "li"]
  description: string;
}

export const TIME_SIGNATURES_CATALOG: TimeSignatureInfo[] = [
  {
    signature: "2/4",
    numerator: 2,
    denominator: 4,
    meterType: "simple",
    grouping: "duple",
    beatUnitName: "Quarter note (𝅘𝅥)",
    beatUnitQuarterBeats: 1.0,
    macroBeatsPerMeasure: 2,
    measureCapacityQuarterBeats: 2.0,
    accents: ["strong", "weak"],
    subdivisionCountPerBeat: 2,
    countingSyllables: ["1", "&", "2", "&"],
    description: "Simple Duple meter. Two quarter-note beats per measure, each dividing into two eighth notes. Characteristic of marches and polkas.",
  },
  {
    signature: "3/4",
    numerator: 3,
    denominator: 4,
    meterType: "simple",
    grouping: "triple",
    beatUnitName: "Quarter note (𝅘𝅥)",
    beatUnitQuarterBeats: 1.0,
    macroBeatsPerMeasure: 3,
    measureCapacityQuarterBeats: 3.0,
    accents: ["strong", "weak", "weak"],
    subdivisionCountPerBeat: 2,
    countingSyllables: ["1", "&", "2", "&", "3", "&"],
    description: "Simple Triple meter. Three quarter-note beats per measure. Characteristic of waltzes, minuets, and scherzos.",
  },
  {
    signature: "4/4",
    numerator: 4,
    denominator: 4,
    meterType: "simple",
    grouping: "quadruple",
    beatUnitName: "Quarter note (𝅘𝅥)",
    beatUnitQuarterBeats: 1.0,
    macroBeatsPerMeasure: 4,
    measureCapacityQuarterBeats: 4.0,
    accents: ["strong", "weak", "medium", "weak"],
    subdivisionCountPerBeat: 2,
    countingSyllables: ["1", "&", "2", "&", "3", "&", "4", "&"],
    description: "Simple Quadruple meter (Common Time, C). Four quarter-note beats per measure with primary accent on 1 and secondary accent on 3.",
  },
  {
    signature: "2/2",
    numerator: 2,
    denominator: 2,
    meterType: "simple",
    grouping: "duple",
    beatUnitName: "Half note (𝅗𝅥)",
    beatUnitQuarterBeats: 2.0,
    macroBeatsPerMeasure: 2,
    measureCapacityQuarterBeats: 4.0,
    accents: ["strong", "weak"],
    subdivisionCountPerBeat: 2,
    countingSyllables: ["1", "&", "2", "&"],
    description: "Simple Duple meter (Alla Breve / Cut Time, 𝄵). Two half-note pulses per measure. Often used for brisk allegro movements and quick marches.",
  },
  {
    signature: "3/8",
    numerator: 3,
    denominator: 8,
    meterType: "simple",
    grouping: "triple",
    beatUnitName: "Eighth note (𝅘𝅥𝅮)",
    beatUnitQuarterBeats: 0.5,
    macroBeatsPerMeasure: 3,
    measureCapacityQuarterBeats: 1.5,
    accents: ["strong", "weak", "weak"],
    subdivisionCountPerBeat: 2,
    countingSyllables: ["1", "2", "3"],
    description: "Simple Triple meter with eighth-note pulse unit. Creates a brisk, buoyant three-pulse rhythm common in classical dances and divertimenti.",
  },
  {
    signature: "6/8",
    numerator: 6,
    denominator: 8,
    meterType: "compound",
    grouping: "duple",
    beatUnitName: "Dotted Quarter note (𝅘𝅥.)",
    beatUnitQuarterBeats: 1.5,
    macroBeatsPerMeasure: 2,
    measureCapacityQuarterBeats: 3.0,
    accents: ["strong", "weak", "weak", "medium", "weak", "weak"],
    subdivisionCountPerBeat: 3,
    countingSyllables: ["1", "la", "li", "2", "la", "li"],
    description: "Compound Duple meter. Two macro-beats per measure, each dividing into three eighth notes. Characteristic of barcarolles, jigs, and pastorals.",
  },
  {
    signature: "9/8",
    numerator: 9,
    denominator: 8,
    meterType: "compound",
    grouping: "triple",
    beatUnitName: "Dotted Quarter note (𝅘𝅥.)",
    beatUnitQuarterBeats: 1.5,
    macroBeatsPerMeasure: 3,
    measureCapacityQuarterBeats: 4.5,
    accents: ["strong", "weak", "weak", "medium", "weak", "weak", "medium", "weak", "weak"],
    subdivisionCountPerBeat: 3,
    countingSyllables: ["1", "la", "li", "2", "la", "li", "3", "la", "li"],
    description: "Compound Triple meter. Three macro-beats per measure, each dividing into three eighth notes (9 eighth notes total). Example: Bach's Jesu, Joy of Man's Desiring.",
  },
  {
    signature: "12/8",
    numerator: 12,
    denominator: 8,
    meterType: "compound",
    grouping: "quadruple",
    beatUnitName: "Dotted Quarter note (𝅘𝅥.)",
    beatUnitQuarterBeats: 1.5,
    macroBeatsPerMeasure: 4,
    measureCapacityQuarterBeats: 6.0,
    accents: [
      "strong", "weak", "weak",
      "medium", "weak", "weak",
      "medium", "weak", "weak",
      "medium", "weak", "weak",
    ],
    subdivisionCountPerBeat: 3,
    countingSyllables: ["1", "la", "li", "2", "la", "li", "3", "la", "li", "4", "la", "li"],
    description: "Compound Quadruple meter. Four macro-beats per measure, each dividing into three eighth notes (12 eighth notes total). Creates a lush, flowing quad-pulse backdrop.",
  },
];

/**
 * Calculation: Compute measure capacity and validate rhythmic completeness
 */
export function validateMeasure(
  durations: StaffDuration[],
  timeSignature: string,
): {
  timeSignature: string;
  totalQuarterBeats: number;
  expectedQuarterBeats: number;
  remainingQuarterBeats: number;
  isComplete: boolean;
  isOverfilled: boolean;
  isUnderfilled: boolean;
  percentFilled: number;
  statusMessage: string;
} {
  const tsInfo =
    TIME_SIGNATURES_CATALOG.find((t) => t.signature === timeSignature) ??
    TIME_SIGNATURES_CATALOG[2]!;

  const expected = tsInfo.measureCapacityQuarterBeats;
  let total = 0;

  for (const id of durations) {
    const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === id);
    if (spec) {
      total += spec.quarterBeats;
    }
  }

  // Floating point rounding tolerance for 1/16 and 1/8 triplets
  const roundedTotal = Math.round(total * 1000) / 1000;
  const roundedExpected = Math.round(expected * 1000) / 1000;
  const remaining = Math.round((roundedExpected - roundedTotal) * 1000) / 1000;

  const isComplete = roundedTotal === roundedExpected;
  const isOverfilled = roundedTotal > roundedExpected;
  const isUnderfilled = roundedTotal < roundedExpected;
  const percentFilled = Math.min(100, Math.round((roundedTotal / roundedExpected) * 100));

  let statusMessage = "Measure is complete and rhythmically balanced.";
  if (isOverfilled) {
    statusMessage = `Measure is overfilled by ${(roundedTotal - roundedExpected).toFixed(2)} beats. Remove some notes or rests.`;
  } else if (isUnderfilled) {
    statusMessage = `Measure is incomplete. Needs ${remaining.toFixed(2)} more beat(s) of notes or rests.`;
  }

  return {
    timeSignature,
    totalQuarterBeats: roundedTotal,
    expectedQuarterBeats: roundedExpected,
    remainingQuarterBeats: Math.max(0, remaining),
    isComplete,
    isOverfilled,
    isUnderfilled,
    percentFilled,
    statusMessage,
  };
}

/**
 * Pre-authored Classical Rhythmic Pattern Presets
 */
export interface RhythmicPatternPreset {
  id: string;
  title: string;
  timeSignature: string;
  tempoBpm: number;
  genreCategory: "classical" | "dance" | "march" | "syncopated";
  description: string;
  elements: {
    duration: StaffDuration;
    pitch?: string; // e.g. "C4" or undefined for rests
    isAccented?: boolean;
    description?: string;
  }[];
}

export const RHYTHM_PATTERN_PRESETS: RhythmicPatternPreset[] = [
  {
    id: "common-basic-quarter",
    title: "Straight Quarter Pulse (4/4)",
    timeSignature: "4/4",
    tempoBpm: 100,
    genreCategory: "classical",
    description: "Four steady quarter-note pulses showing standard downbeat emphasis on 1 and secondary on 3.",
    elements: [
      { duration: "q", pitch: "C4", isAccented: true, description: "Beat 1 (Strong)" },
      { duration: "q", pitch: "C4", isAccented: false, description: "Beat 2 (Weak)" },
      { duration: "q", pitch: "C4", isAccented: true, description: "Beat 3 (Medium)" },
      { duration: "q", pitch: "C4", isAccented: false, description: "Beat 4 (Weak)" },
    ],
  },
  {
    id: "waltz-triple-pulse",
    title: "Viennese Waltz Rhythm (3/4)",
    timeSignature: "3/4",
    tempoBpm: 120,
    genreCategory: "dance",
    description: "Boom-chick-chick dance accompaniment: heavy accented downbeat followed by two buoyant lift pulses.",
    elements: [
      { duration: "q", pitch: "C4", isAccented: true, description: "Beat 1 (Bass accent)" },
      { duration: "q", pitch: "E4", isAccented: false, description: "Beat 2 (Chord)" },
      { duration: "q", pitch: "E4", isAccented: false, description: "Beat 3 (Chord)" },
    ],
  },
  {
    id: "dotted-heroic-march",
    title: "Classical Dotted March (4/4)",
    timeSignature: "4/4",
    tempoBpm: 92,
    genreCategory: "march",
    description: "Noble dotted eighth and sixteenth motif creating the triumphant forward drive of military marches.",
    elements: [
      { duration: "8d", pitch: "C4", isAccented: true, description: "Dotted 8th" },
      { duration: "16", pitch: "C4", isAccented: false, description: "16th pickup" },
      { duration: "q", pitch: "C4", isAccented: false, description: "Quarter resolution" },
      { duration: "8d", pitch: "C4", isAccented: true, description: "Dotted 8th" },
      { duration: "16", pitch: "C4", isAccented: false, description: "16th pickup" },
      { duration: "q", pitch: "C4", isAccented: false, description: "Quarter resolution" },
    ],
  },
  {
    id: "syncopated-charleston",
    title: "Syncopated Offbeat Accent (4/4)",
    timeSignature: "4/4",
    tempoBpm: 108,
    genreCategory: "syncopated",
    description: "Quarter rest on the downbeat shifts the primary accent unexpectedly onto the weak second beat.",
    elements: [
      { duration: "qr", isAccented: false, description: "Beat 1 (Silent downbeat)" },
      { duration: "q", pitch: "C4", isAccented: true, description: "Beat 2 (Syncopated accent)" },
      { duration: "8", pitch: "C4", isAccented: false, description: "Beat 3" },
      { duration: "8", pitch: "C4", isAccented: false, description: "Beat 3 offbeat" },
      { duration: "q", pitch: "C4", isAccented: false, description: "Beat 4" },
    ],
  },
  {
    id: "pastoral-compound-6-8",
    title: "Pastoral Compound Pulse (6/8)",
    timeSignature: "6/8",
    tempoBpm: 66,
    genreCategory: "classical",
    description: "Flowing lilting motion grouping six eighth notes into two major dotted-quarter macro pulses.",
    elements: [
      { duration: "q", pitch: "C4", isAccented: true, description: "Pulse 1 main" },
      { duration: "8", pitch: "C4", isAccented: false, description: "Pulse 1 release" },
      { duration: "8", pitch: "C4", isAccented: true, description: "Pulse 2 sub 1" },
      { duration: "8", pitch: "C4", isAccented: false, description: "Pulse 2 sub 2" },
      { duration: "8", pitch: "C4", isAccented: false, description: "Pulse 2 sub 3" },
    ],
  },
];

/**
 * Tap Timing Evaluation Engine:
 * Compares user taps against calculated expected note onset times.
 */
export interface TapEvaluationResult {
  score: number; // 0 to 100%
  grade: "Exemplary" | "Good" | "Needs Practice" | "Incomplete";
  totalExpectedNotes: number;
  tapsRecorded: number;
  perfectHits: number; // Within +/- 45ms
  goodHits: number; // Within +/- 95ms
  earlyHits: number;
  lateHits: number;
  missedNotes: number;
  extraTaps: number;
  averageOffsetMs: number;
  feedbackDetails: string[];
}

export function evaluateRhythmPerformance(
  expectedOnsetTimesMs: number[],
  userTapTimesMs: number[],
  toleranceMs = 120,
): TapEvaluationResult {
  const totalExpected = expectedOnsetTimesMs.length;
  if (totalExpected === 0) {
    return {
      score: 0,
      grade: "Incomplete",
      totalExpectedNotes: 0,
      tapsRecorded: 0,
      perfectHits: 0,
      goodHits: 0,
      earlyHits: 0,
      lateHits: 0,
      missedNotes: 0,
      extraTaps: 0,
      averageOffsetMs: 0,
      feedbackDetails: ["No expected notes provided for performance analysis."],
    };
  }

  let perfectHits = 0;
  let goodHits = 0;
  let earlyHits = 0;
  let lateHits = 0;
  let missedNotes = 0;
  const offsets: number[] = [];

  const matchedTapIndices = new Set<number>();

  expectedOnsetTimesMs.forEach((expectedTime, noteIdx) => {
    let closestTapIdx = -1;
    let minDiff = Infinity;
    let signedDiff = 0;

    userTapTimesMs.forEach((tapTime, tapIdx) => {
      if (matchedTapIndices.has(tapIdx)) return;
      const diff = Math.abs(tapTime - expectedTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestTapIdx = tapIdx;
        signedDiff = tapTime - expectedTime;
      }
    });

    if (closestTapIdx !== -1 && minDiff <= toleranceMs) {
      matchedTapIndices.add(closestTapIdx);
      offsets.push(signedDiff);

      if (minDiff <= 45) {
        perfectHits++;
      } else if (minDiff <= 85) {
        goodHits++;
      }

      if (signedDiff < -45) {
        earlyHits++;
      } else if (signedDiff > 45) {
        lateHits++;
      }
    } else {
      missedNotes++;
    }
  });

  const extraTaps = Math.max(0, userTapTimesMs.length - matchedTapIndices.size);
  const avgOffsetMs =
    offsets.length > 0 ? Math.round(offsets.reduce((a, b) => a + b, 0) / offsets.length) : 0;

  // Calculate composite score (100 max)
  const accuracyPoints = perfectHits * 1.0 + goodHits * 0.75;
  const rawScore = (accuracyPoints / totalExpected) * 100;
  const penalties = (missedNotes * 15 + extraTaps * 8);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - penalties)));

  let grade: "Exemplary" | "Good" | "Needs Practice" | "Incomplete" = "Needs Practice";
  if (finalScore >= 88) grade = "Exemplary";
  else if (finalScore >= 70) grade = "Good";
  else if (userTapTimesMs.length === 0) grade = "Incomplete";

  const feedbackDetails: string[] = [];
  if (grade === "Exemplary") {
    feedbackDetails.push("Superb rhythmic precision! Your timing aligns tightly with the metronomic pulse.");
  } else if (grade === "Good") {
    feedbackDetails.push("Solid rhythm control with consistent pulse awareness. Polish minor micro-delays.");
  } else if (userTapTimesMs.length === 0) {
    feedbackDetails.push("No taps registered. Tap along with the rhythm using Spacebar or the Tap button.");
  } else {
    feedbackDetails.push("Timing drifted outside tolerance. Try counting aloud with the subdivisions before tapping.");
  }

  if (earlyHits > lateHits && earlyHits > 1) {
    feedbackDetails.push("Tendency detected: Rushing ahead of the beat. Let the beat land fully before tapping.");
  } else if (lateHits > earlyHits && lateHits > 1) {
    feedbackDetails.push("Tendency detected: Dragging behind the beat. Anticipate the subdivision clicks.");
  }

  return {
    score: finalScore,
    grade,
    totalExpectedNotes: totalExpected,
    tapsRecorded: userTapTimesMs.length,
    perfectHits,
    goodHits,
    earlyHits,
    lateHits,
    missedNotes,
    extraTaps,
    averageOffsetMs: avgOffsetMs,
    feedbackDetails,
  };
}

/**
 * Practice & Dictation Quiz Generation Engine
 */
export type RhythmPracticeCategory =
  | "duration-id"
  | "incomplete-measure"
  | "time-signature-id"
  | "simple-vs-compound"
  | "accent-hierarchy"
  | "pattern-completion"
  | "dotted-values"
  | "syncopation-id"
  | "rhythm-dictation"
  | "playback-id";

export interface RhythmQuestion {
  id: string;
  category: RhythmPracticeCategory;
  level: "Beginner" | "Intermediate";
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  previewDurations?: StaffDuration[];
  timeSignature?: string;
  tempoBpm?: number;
}

export function generateRhythmQuestion(
  category: RhythmPracticeCategory,
  level: "Beginner" | "Intermediate" = "Beginner",
): RhythmQuestion {
  const id = `rq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (category === "duration-id") {
    const list =
      level === "Beginner"
        ? RHYTHM_DURATIONS_CATALOG.filter((d) => ["w", "h", "q", "8", "qr", "hr"].includes(d.id))
        : RHYTHM_DURATIONS_CATALOG;

    const chosen = list[Math.floor(Math.random() * list.length)]!;
    const distractors = list
      .filter((d) => d.id !== chosen.id)
      .slice(0, 3)
      .map((d) => `${d.nameUs} (${d.nameUk}) - ${d.quarterBeats} beat(s)`);

    const correct = `${chosen.nameUs} (${chosen.nameUk}) - ${chosen.quarterBeats} beat(s)`;
    const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

    return {
      id,
      category,
      level,
      prompt: `Identify the duration and name of this rhythmic symbol: "${chosen.symbolGlyph}" (${chosen.isRest ? "Rest" : "Note"}).`,
      options,
      correctAnswer: correct,
      hint: chosen.isRest
        ? "Look at whether it rests on, hangs from, or crosses the staff lines."
        : "Check whether the notehead is open or filled, and count any flags or dots.",
      explanation: `${chosen.nameUs} (${chosen.nameUk}) receives exactly ${chosen.quarterBeats} quarter-note beat(s). ${chosen.description}`,
      previewDurations: [chosen.id],
    };
  }

  if (category === "incomplete-measure") {
    const signatures = level === "Beginner" ? ["4/4", "3/4", "2/4"] : ["4/4", "3/4", "6/8", "2/2"];
    const ts = signatures[Math.floor(Math.random() * signatures.length)]!;
    const tsInfo = TIME_SIGNATURES_CATALOG.find((t) => t.signature === ts)!;

    // Create an underfilled measure
    let currentDurations: StaffDuration[] = [];
    let currentBeats = 0;

    if (ts === "4/4") {
      currentDurations = ["h", "q"]; // 3 beats
      currentBeats = 3;
    } else if (ts === "3/4") {
      currentDurations = ["h"]; // 2 beats
      currentBeats = 2;
    } else if (ts === "2/4") {
      currentDurations = ["8", "8"]; // 1 beat
      currentBeats = 1;
    } else {
      currentDurations = ["qd"]; // 1.5 beats (half of 6/8)
      currentBeats = 1.5;
    }

    const missingBeats = tsInfo.measureCapacityQuarterBeats - currentBeats;
    const correctCandidate = RHYTHM_DURATIONS_CATALOG.find(
      (d) => Math.abs(d.quarterBeats - missingBeats) < 0.01 && !d.isRest,
    );
    const correct = correctCandidate
      ? `${correctCandidate.nameUs} (${correctCandidate.quarterBeats} beat)`
      : `${missingBeats} quarter beat(s)`;

    const options = [
      correct,
      "Half Note (2 beats)",
      "Quarter Note (1 beat)",
      "Eighth Note (0.5 beat)",
      "Whole Note (4 beats)",
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);

    if (!options.includes(correct)) options[0] = correct;
    options.sort(() => 0.5 - Math.random());

    return {
      id,
      category,
      level,
      prompt: `In ${ts} time, a measure contains [${currentDurations.join(" + ")}], totaling ${currentBeats} beats. What single note value is needed to complete the measure?`,
      options,
      correctAnswer: correct,
      hint: `A full measure of ${ts} holds exactly ${tsInfo.measureCapacityQuarterBeats} quarter-note beats. Subtract ${currentBeats} from ${tsInfo.measureCapacityQuarterBeats}.`,
      explanation: `In ${ts} time, the measure capacity is ${tsInfo.measureCapacityQuarterBeats} beats. Adding ${correct} completes the measure.`,
      previewDurations: currentDurations,
      timeSignature: ts,
    };
  }

  if (category === "time-signature-id") {
    const list = TIME_SIGNATURES_CATALOG;
    const chosen = list[Math.floor(Math.random() * list.length)]!;
    const otherSigs = list.filter((t) => t.signature !== chosen.signature).map((t) => t.signature);
    const options = [chosen.signature, ...otherSigs.slice(0, 3)].sort(() => 0.5 - Math.random());

    return {
      id,
      category,
      level,
      prompt: `Which time signature features ${chosen.numerator} counts per measure, where the number ${chosen.denominator} indicates the pulse unit (${chosen.meterType} ${chosen.grouping} meter)?`,
      options,
      correctAnswer: chosen.signature,
      hint: `Numerator = ${chosen.numerator}, Denominator = ${chosen.denominator}.`,
      explanation: `${chosen.signature} is a ${chosen.meterType} ${chosen.grouping} meter where each measure has ${chosen.numerator} beats of note-value 1/${chosen.denominator}. ${chosen.description}`,
      timeSignature: chosen.signature,
    };
  }

  if (category === "simple-vs-compound") {
    const list = TIME_SIGNATURES_CATALOG;
    const chosen = list[Math.floor(Math.random() * list.length)]!;
    const isSimple = chosen.meterType === "simple";
    const correctAnswer = isSimple
      ? "Simple Meter (beats subdivide naturally into 2 equal parts)"
      : "Compound Meter (beats subdivide naturally into 3 equal parts)";

    const options = [
      "Simple Meter (beats subdivide naturally into 2 equal parts)",
      "Compound Meter (beats subdivide naturally into 3 equal parts)",
      "Asymmetrical Meter (irregular 5 or 7 beat groupings)",
      "Unmetered (Free recitative pulse)",
    ];

    return {
      id,
      category,
      level,
      prompt: `Classify the metric structure of the time signature ${chosen.signature}. Does its main pulse divide into 2 or 3 equal parts?`,
      options,
      correctAnswer,
      hint: chosen.numerator % 3 === 0 && chosen.numerator > 3
        ? "Meters with top numbers 6, 9, 12 divide each beat into groups of 3 eighths."
        : "Meters with top numbers 2, 3, 4 divide beats in pairs.",
      explanation: `${chosen.signature} is classified as ${chosen.meterType} time because its pulse divides into ${chosen.subdivisionCountPerBeat} subdivisions.`,
      timeSignature: chosen.signature,
    };
  }

  if (category === "accent-hierarchy") {
    const options = [
      "Beat 1 (Strongest / Downbeat)",
      "Beat 2 (Weak beat)",
      "Beat 3 (Secondary medium accent)",
      "Beat 4 (Weak upbeat)",
    ];

    return {
      id,
      category,
      level,
      prompt: `In standard 4/4 Common Time, which beat carries the primary (strongest) metric accent in the measure?`,
      options,
      correctAnswer: options[0]!,
      hint: "The downbeat immediately following the bar line always establishes the metric foundation.",
      explanation: "Beat 1 is the downbeat and bears the primary metric accent. Beat 3 carries a secondary accent, while beats 2 and 4 are weak.",
      timeSignature: "4/4",
    };
  }

  if (category === "dotted-values") {
    const options = [
      "Adds exactly half of the original note's duration",
      "Doubles the length of the note",
      "Shortens the note by half its duration",
      "Triples the total beat value",
    ];

    return {
      id,
      category,
      level,
      prompt: "In classical music theory, what is the exact function of an augmentative dot placed directly to the right of a notehead?",
      options,
      correctAnswer: options[0]!,
      hint: "For example, a half note (2 beats) with a dot becomes 2 + 1 = 3 beats.",
      explanation: "A dot adds exactly 50% (half) of the preceding note's duration. E.g. a dotted quarter note equals 1 + 0.5 = 1.5 beats.",
      previewDurations: ["qd"],
    };
  }

  if (category === "syncopation-id") {
    const options = [
      "Displacing the expected metric accent onto a weak beat or offbeat",
      "Accelerating the tempo smoothly over several measures",
      "Playing all four notes with equal volume without dynamic contrast",
      "Holding a note beyond the barline with a tie",
    ];

    return {
      id,
      category,
      level,
      prompt: "What is the defining characteristic of musical syncopation?",
      options,
      correctAnswer: options[0]!,
      hint: "Think about stressing the '&' count or an offbeat where the listener expects rest.",
      explanation: "Syncopation occurs when an accent deliberately falls on an unaccented beat or offbeat, contradicting the established metric pulse.",
    };
  }

  // Fallback: Dictation / Playback recognition
  const preset = RHYTHM_PATTERN_PRESETS[Math.floor(Math.random() * RHYTHM_PATTERN_PRESETS.length)]!;
  const options = RHYTHM_PATTERN_PRESETS.map((p) => p.title);

  return {
    id,
    category: "playback-id",
    level,
    prompt: `Audition this rhythmic pattern in ${preset.timeSignature} time (${preset.tempoBpm} BPM). Which classical pattern is being articulated?`,
    options,
    correctAnswer: preset.title,
    hint: `Notice the time signature (${preset.timeSignature}) and whether the pulses are straight or dotted.`,
    explanation: `${preset.title}: ${preset.description}`,
    previewDurations: preset.elements.map((e) => e.duration),
    timeSignature: preset.timeSignature,
    tempoBpm: preset.tempoBpm,
  };
}

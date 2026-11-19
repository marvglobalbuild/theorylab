/**
 * Ear Training Studio — Core academic music theory calculations,
 * interval catalogs, pitch comparison algorithms, chord voicings,
 * melodic dictation verification, and practice question generators for THEORYLAB.
 */

import {
  displayNote,
  midiToNote,
  noteToMidi,
  parseNote,
} from "./theory";
import {
  buildChord,
  CHORD_TYPES_CATALOG,
  ChordQuality,
  PROGRESSION_PRESETS,
  ProgressionPreset,
  realizeProgression,
} from "./harmony-lab";

export type IntervalDirection = "ascending" | "descending" | "harmonic";

export interface IntervalDefinition {
  semitones: number;
  name: string;
  shortName: string;
  ratioName: string;
  consonanceType: "perfect-consonance" | "imperfect-consonance" | "dissonance";
  mnemonicSong: string;
  description: string;
}

export const INTERVALS_CATALOG: IntervalDefinition[] = [
  {
    semitones: 0,
    name: "Perfect Unison",
    shortName: "P1",
    ratioName: "1:1",
    consonanceType: "perfect-consonance",
    mnemonicSong: "Same pitch",
    description: "Two identical pitches vibrating at the exact same frequency. Complete acoustic stability.",
  },
  {
    semitones: 1,
    name: "Minor Second",
    shortName: "m2",
    ratioName: "16:15",
    consonanceType: "dissonance",
    mnemonicSong: "Jaws Theme / Für Elise",
    description: "Half step / semitone. Highly tense, close dissonance with a strong urge to resolve.",
  },
  {
    semitones: 2,
    name: "Major Second",
    shortName: "M2",
    ratioName: "9:8",
    consonanceType: "dissonance",
    mnemonicSong: "Happy Birthday / Frère Jacques",
    description: "Whole step (2 semitones). The foundational scalar step of major and minor scales.",
  },
  {
    semitones: 3,
    name: "Minor Third",
    shortName: "m3",
    ratioName: "6:5",
    consonanceType: "imperfect-consonance",
    mnemonicSong: "Brahms' Lullaby / Greensleeves",
    description: "Three semitones. Warm, somber imperfect consonance defining the minor triad.",
  },
  {
    semitones: 4,
    name: "Major Third",
    shortName: "M3",
    ratioName: "5:4",
    consonanceType: "imperfect-consonance",
    mnemonicSong: "When the Saints Go Marching In / Kumbaya",
    description: "Four semitones. Bright, triumphant imperfect consonance defining the major triad.",
  },
  {
    semitones: 5,
    name: "Perfect Fourth",
    shortName: "P4",
    ratioName: "4:3",
    consonanceType: "perfect-consonance",
    mnemonicSong: "Here Comes the Bride / Amazing Grace",
    description: "Five semitones. Open, resonant interval historically treated as dissonant in two-part counterpoint when sounding against the bass.",
  },
  {
    semitones: 6,
    name: "Tritone",
    shortName: "TT",
    ratioName: "45:32 (Aug 4th / Dim 5th)",
    consonanceType: "dissonance",
    mnemonicSong: "The Simpsons / Maria (West Side Story)",
    description: "Six semitones. Exactly half an octave. Highly unstable and historically termed 'diabolus in musica'; essential for dominant resolution.",
  },
  {
    semitones: 7,
    name: "Perfect Fifth",
    shortName: "P5",
    ratioName: "3:2",
    consonanceType: "perfect-consonance",
    mnemonicSong: "Twinkle Twinkle Little Star / Star Wars",
    description: "Seven semitones. The most consonant interval next to the octave. Defines root-fifth stability in tertian harmony.",
  },
  {
    semitones: 8,
    name: "Minor Sixth",
    shortName: "m6",
    ratioName: "8:5",
    consonanceType: "imperfect-consonance",
    mnemonicSong: "The Entertainer / Conquest of Paradise",
    description: "Eight semitones (inversion of Major 3rd). Introspective and melancholy imperfect consonance.",
  },
  {
    semitones: 9,
    name: "Major Sixth",
    shortName: "M6",
    ratioName: "5:3",
    consonanceType: "imperfect-consonance",
    mnemonicSong: "My Bonnie Lies Over the Ocean / NBC Chimes",
    description: "Nine semitones (inversion of Minor 3rd). Rich, expansive and consonant.",
  },
  {
    semitones: 10,
    name: "Minor Seventh",
    shortName: "m7",
    ratioName: "16:9",
    consonanceType: "dissonance",
    mnemonicSong: "Somewhere (West Side Story) / Star Trek Theme",
    description: "Ten semitones. Mild dissonance defining dominant 7th and minor 7th chords.",
  },
  {
    semitones: 11,
    name: "Major Seventh",
    shortName: "M7",
    ratioName: "15:8",
    consonanceType: "dissonance",
    mnemonicSong: "Take On Me / Superman Theme",
    description: "Eleven semitones. Sharp, piercing dissonance sitting one semitone below the octave, with strong leading-tone pull.",
  },
  {
    semitones: 12,
    name: "Perfect Octave",
    shortName: "P8",
    ratioName: "2:1",
    consonanceType: "perfect-consonance",
    mnemonicSong: "Somewhere Over the Rainbow",
    description: "Twelve semitones. Exact doubling of frequency (2:1 ratio). Total acoustic equivalence in different registers.",
  },
];

/**
 * Builds an interval from a given root pitch
 */
export function buildInterval(
  rootNote: string, // e.g. "C4"
  semitones: number,
  direction: IntervalDirection = "ascending",
): {
  rootNote: string;
  targetNote: string;
  semitones: number;
  direction: IntervalDirection;
  definition: IntervalDefinition;
  notesToPlay: string[];
} {
  const rootMidi = noteToMidi(rootNote);
  const targetMidi = direction === "descending" ? rootMidi - semitones : rootMidi + semitones;
  const targetNote = midiToNote(targetMidi);
  const def =
    INTERVALS_CATALOG.find((i) => i.semitones === Math.abs(semitones)) ??
    INTERVALS_CATALOG[0]!;

  const notesToPlay =
    direction === "descending"
      ? [rootNote, targetNote]
      : [rootNote, targetNote];

  return {
    rootNote,
    targetNote,
    semitones,
    direction,
    definition: def,
    notesToPlay,
  };
}

/**
 * Pitch Recognition Models
 */
export type PitchExerciseType =
  | "single-pitch-id"
  | "pitch-compare-high-low"
  | "octave-discrimination"
  | "pitch-matching";

export interface PitchExercise {
  id: string;
  type: PitchExerciseType;
  prompt: string;
  referencePitch?: string;
  targetPitches: string[];
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function generatePitchExercise(
  type: PitchExerciseType,
  level: "Beginner" | "Intermediate" | "Advanced" = "Beginner",
): PitchExercise {
  const id = `pitch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const rootNotes =
    level === "Beginner"
      ? ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
      : level === "Intermediate"
        ? ["C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "Ab4", "A4", "Bb4", "B4"]
        : ["C3", "F#3", "Bb3", "D4", "G#4", "C5", "Eb5", "A5"];

  const randomPitch = rootNotes[Math.floor(Math.random() * rootNotes.length)]!;

  if (type === "pitch-compare-high-low") {
    const p1 = rootNotes[Math.floor(Math.random() * rootNotes.length)]!;
    let p2 = rootNotes[Math.floor(Math.random() * rootNotes.length)]!;
    while (p1 === p2) {
      p2 = rootNotes[Math.floor(Math.random() * rootNotes.length)]!;
    }

    const midi1 = noteToMidi(p1);
    const midi2 = noteToMidi(p2);
    const isHigher = midi2 > midi1;

    const options = ["Note B is Higher than Note A", "Note B is Lower than Note A"];
    const correctAnswer = isHigher ? options[0]! : options[1]!;

    return {
      id,
      type,
      prompt: "Listen to Note A followed by Note B. Is the second note higher or lower in pitch than the first?",
      referencePitch: p1,
      targetPitches: [p1, p2],
      options,
      correctAnswer,
      explanation: `Note A was ${displayNote(p1)} (${midi1}) and Note B was ${displayNote(p2)} (${midi2}). Note B was ${
        isHigher ? "higher" : "lower"
      } by ${Math.abs(midi2 - midi1)} semitone(s).`,
    };
  }

  if (type === "octave-discrimination") {
    const letters = ["C", "D", "E", "F", "G", "A"];
    const letter = letters[Math.floor(Math.random() * letters.length)]!;
    const octaves = [2, 3, 4, 5];
    const chosenOct = octaves[Math.floor(Math.random() * octaves.length)]!;
    const note = `${letter}${chosenOct}`;

    const octaveLabels: Record<number, string> = {
      2: "Bass Register (Octave 2 - Deep Bass)",
      3: "Baritone / Low Register (Octave 3 - Tenor/Bass)",
      4: "Middle Register (Octave 4 - Middle C Region)",
      5: "Treble Register (Octave 5 - High Soprano)",
    };

    const options = octaves.map((o) => octaveLabels[o]!);
    const correctAnswer = octaveLabels[chosenOct]!;

    return {
      id,
      type,
      prompt: `Listen to this pitch (${letter}). Which octave register is this note sounding in?`,
      targetPitches: [note],
      options,
      correctAnswer,
      explanation: `The sounded pitch was ${displayNote(note)}. It belongs to ${octaveLabels[chosenOct]}.`,
    };
  }

  if (type === "pitch-matching") {
    const p1 = randomPitch;
    const isSame = Math.random() > 0.5;
    let p2 = p1;
    if (!isSame) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (level === "Beginner" ? 2 : 1);
      p2 = midiToNote(noteToMidi(p1) + offset);
    }

    const options = [
      "Both pitches are IDENTICAL in frequency",
      "The second pitch is DIFFERENT in frequency",
    ];
    const correctAnswer = isSame ? options[0]! : options[1]!;

    return {
      id,
      type,
      prompt: "Listen to the reference tone, followed by the test tone. Are the two pitches identical or different?",
      referencePitch: p1,
      targetPitches: [p1, p2],
      options,
      correctAnswer,
      explanation: isSame
        ? `Both tones were identical at ${displayNote(p1)}.`
        : `Tone 1 was ${displayNote(p1)} and Tone 2 was ${displayNote(p2)} (difference of ${Math.abs(
            noteToMidi(p2) - noteToMidi(p1),
          )} semitone).`,
    };
  }

  // Fallback: single-pitch-id
  const distractors = rootNotes
    .filter((n) => n !== randomPitch)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((n) => displayNote(n));

  const options = [displayNote(randomPitch), ...distractors].sort(() => 0.5 - Math.random());

  return {
    id,
    type: "single-pitch-id",
    prompt: "Listen to the sounded tone. What is the musical pitch?",
    targetPitches: [randomPitch],
    options,
    correctAnswer: displayNote(randomPitch),
    explanation: `The pitch was ${displayNote(randomPitch)} (${Math.round(
      noteToMidi(randomPitch),
    )} MIDI note).`,
  };
}

/**
 * Melodic Dictation Verification Engine
 */
export interface MelodicDictationTemplate {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  key: string;
  pitches: string[];
  description: string;
}

export const MELODIC_DICTATION_PRESETS: MelodicDictationTemplate[] = [
  {
    id: "dict-stepwise-c",
    title: "Stepwise Diatonic Motion (4 notes)",
    difficulty: "Beginner",
    key: "C Major",
    pitches: ["C4", "D4", "E4", "C4"],
    description: "Begins on tonic, steps up to mediant, and returns to tonic.",
  },
  {
    id: "dict-arpeggiated-c",
    title: "Tonic Triad Arpeggio (4 notes)",
    difficulty: "Beginner",
    key: "C Major",
    pitches: ["C4", "E4", "G4", "C4"],
    description: "Outlines the C major tonic triad: root, 3rd, 5th, resolving to root.",
  },
  {
    id: "dict-inter-scale-skip",
    title: "Skips & Stepwise Resolution (6 notes)",
    difficulty: "Intermediate",
    key: "C Major",
    pitches: ["C4", "E4", "F4", "G4", "E4", "C4"],
    description: "Third leap from C4 to E4, stepwise motion through F and G, resolving home to C4.",
  },
  {
    id: "dict-inter-dominant-pull",
    title: "Dominant Seventh Resolution (6 notes)",
    difficulty: "Intermediate",
    key: "C Major",
    pitches: ["G4", "F4", "D4", "B3", "C4", "C4"],
    description: "Melodic dominant tension with leading-tone resolution (B3 -> C4).",
  },
  {
    id: "dict-adv-chromatic-chaconne",
    title: "Chroma & Octave Leap (8 notes)",
    difficulty: "Advanced",
    key: "C Major",
    pitches: ["C4", "E4", "F#4", "G4", "B4", "C5", "G4", "C4"],
    description: "Raised 4th scale degree (F#) acting as secondary leading tone, leaping up to high C5.",
  },
];

export interface MelodicComparisonResult {
  isFullyCorrect: boolean;
  accuracyPercent: number;
  totalNotes: number;
  matchingCount: number;
  noteDiscrepancies: {
    index: number;
    expectedNote: string;
    submittedNote: string | null;
    isMatch: boolean;
    offsetSemitones: number;
  }[];
  explanation: string;
}

export function compareMelody(
  expectedPitches: string[],
  submittedPitches: string[],
): MelodicComparisonResult {
  const totalNotes = expectedPitches.length;
  let matchingCount = 0;
  const discrepancies: MelodicComparisonResult["noteDiscrepancies"] = [];

  for (let i = 0; i < totalNotes; i++) {
    const expected = expectedPitches[i]!;
    const submitted = submittedPitches[i] ?? null;

    if (submitted && submitted === expected) {
      matchingCount++;
      discrepancies.push({
        index: i,
        expectedNote: expected,
        submittedNote: submitted,
        isMatch: true,
        offsetSemitones: 0,
      });
    } else {
      const offset = submitted ? noteToMidi(submitted) - noteToMidi(expected) : 0;
      discrepancies.push({
        index: i,
        expectedNote: expected,
        submittedNote: submitted,
        isMatch: false,
        offsetSemitones: offset,
      });
    }
  }

  const accuracyPercent = Math.round((matchingCount / totalNotes) * 100);
  const isFullyCorrect = matchingCount === totalNotes;

  let explanation = "Melodic transcription matches the target melody with complete accuracy!";
  if (!isFullyCorrect) {
    const errors = discrepancies.filter((d) => !d.isMatch);
    explanation = `${matchingCount} of ${totalNotes} notes matched correctly (${accuracyPercent}% accuracy). Review note ${
      errors[0] ? errors[0].index + 1 : 1
    } which differed by ${errors[0]?.offsetSemitones ?? 0} semitone(s).`;
  }

  return {
    isFullyCorrect,
    accuracyPercent,
    totalNotes,
    matchingCount,
    noteDiscrepancies: discrepancies,
    explanation,
  };
}

/**
 * Harmonic Listening Models (Cadences & Progressions)
 */
export type HarmonicExerciseType =
  | "major-vs-minor-quality"
  | "harmonic-stability-tension"
  | "cadence-recognition"
  | "progression-identification";

export interface HarmonicExercise {
  id: string;
  type: HarmonicExerciseType;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  notesToPlay?: string[][]; // Array of chords (each chord is an array of note strings)
  tempo?: number;
}

export function generateHarmonicExercise(
  type: HarmonicExerciseType,
  level: "Beginner" | "Intermediate" | "Advanced" = "Beginner",
): HarmonicExercise {
  const id = `harm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const roots = ["C", "G", "F", "D", "A", "Eb"];
  const root = roots[Math.floor(Math.random() * roots.length)]!;

  if (type === "major-vs-minor-quality") {
    const isMajor = Math.random() > 0.5;
    const quality: ChordQuality = isMajor ? "major" : "minor";
    const chord = buildChord(root, quality, 4);

    const options = [
      "Major Triad (Bright, consonant, major 3rd foundation)",
      "Minor Triad (Subdued, introspective, minor 3rd foundation)",
    ];
    const correctAnswer = isMajor ? options[0]! : options[1]!;

    return {
      id,
      type,
      prompt: `Audition this chord built on root ${displayNote(root)}. Does it have a Major or Minor quality?`,
      options,
      correctAnswer,
      explanation: `${displayNote(root)} ${quality} consists of notes [${chord.notes.map((n) => displayNote(n)).join(", ")}]. ${
        isMajor
          ? "The major third (4 semitones) gives it a bright, consonant character."
          : "The minor third (3 semitones) gives it an introspective, darker character."
      }`,
      notesToPlay: [chord.notes],
    };
  }

  if (type === "harmonic-stability-tension") {
    const isStable = Math.random() > 0.5;
    const quality: ChordQuality = isStable ? "major" : "dominant-7";
    const chord = buildChord(root, quality, 4);

    const options = [
      "Harmonically Stable & Grounded (Tonic Rest)",
      "Harmonically Tense & Active (Demands Resolution)",
    ];
    const correctAnswer = isStable ? options[0]! : options[1]!;

    return {
      id,
      type,
      prompt: "Listen to this harmonic voicing. Does it communicate restful acoustic stability or forward-pulling tension?",
      options,
      correctAnswer,
      explanation: isStable
        ? `A pure major triad (${displayNote(root)}) has no internal tritones, providing grounded harmonic rest.`
        : `A dominant seventh chord (${displayNote(root)}7) contains a tritone between its 3rd and 7th, creating acoustic instability that urgently pulls toward tonic resolution.`,
      notesToPlay: [chord.notes],
    };
  }

  if (type === "cadence-recognition") {
    const cadences = [
      {
        name: "Authentic Cadence (V → I)",
        type: "authentic-cadence-major",
        desc: "Dominant resolves decisively to the Tonic (PAC).",
      },
      {
        name: "Plagal Cadence (IV → I)",
        type: "plagal-cadence",
        desc: "Subdominant resolves directly to the Tonic ('Amen' cadence).",
      },
      {
        name: "Half Cadence (Ending on V)",
        type: "half-cadence",
        desc: "Phrase pauses on the Dominant with an open question.",
      },
      {
        name: "Deceptive Cadence (V → vi)",
        type: "deceptive-cadence",
        desc: "Dominant leads toward resolution but lands unexpectedly on the submediant.",
      },
    ];

    const chosen = cadences[Math.floor(Math.random() * cadences.length)]!;
    const preset = PROGRESSION_PRESETS.find((p) => p.id === chosen.type)!;
    const realized = realizeProgression(preset, root, 4);

    const options = cadences.map((c) => c.name);

    return {
      id,
      type,
      prompt: `Listen to this two-to-four chord cadence in the key of ${displayNote(root)} Major. Identify the cadential resolution.`,
      options,
      correctAnswer: chosen.name,
      explanation: `${chosen.name}: ${chosen.desc} (Chords realized: ${realized.chords.map((c) => c.roman).join(" → ")}).`,
      notesToPlay: realized.chords.map((c) => c.notes),
      tempo: 90,
    };
  }

  // Fallback: Progression Identification
  const preset = PROGRESSION_PRESETS[Math.floor(Math.random() * PROGRESSION_PRESETS.length)]!;
  const realized = realizeProgression(preset, root, 4);
  const options = PROGRESSION_PRESETS.map((p) => `${p.name} (${p.steps.map((s) => s.roman).join(" - ")})`);
  const correctName = `${preset.name} (${preset.steps.map((s) => s.roman).join(" - ")})`;

  return {
    id,
    type: "progression-identification",
    prompt: `Audition this chord progression in ${displayNote(root)} ${preset.mode}. Which harmonic sequence is articulated?`,
    options,
    correctAnswer: correctName,
    explanation: `${preset.name}: ${preset.description}`,
    notesToPlay: realized.chords.map((c) => c.notes),
    tempo: 96,
  };
}

/**
 * Universal Practice Question Generator
 */
export type EarTrainingTopic =
  | "all"
  | "pitch-recognition"
  | "interval-recognition"
  | "chord-recognition"
  | "harmonic-listening";

export interface EarTrainingQuizQuestion {
  id: string;
  topic: EarTrainingTopic;
  level: "Beginner" | "Intermediate" | "Advanced";
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  notesToAudition: string[][]; // Steps of notes (each step is array of pitches)
  intervalDirection?: IntervalDirection;
}

export function generateEarTrainingQuiz(
  topic: EarTrainingTopic,
  level: "Beginner" | "Intermediate" | "Advanced" = "Beginner",
): EarTrainingQuizQuestion {
  const id = `eq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (topic === "interval-recognition") {
    const intervals =
      level === "Beginner"
        ? [0, 2, 4, 5, 7, 12] // P1, M2, M3, P4, P5, P8
        : level === "Intermediate"
          ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 12]
          : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const chosenSemitones = intervals[Math.floor(Math.random() * intervals.length)]!;
    const direction: IntervalDirection =
      level === "Beginner"
        ? "ascending"
        : Math.random() > 0.6
          ? "harmonic"
          : Math.random() > 0.5
            ? "descending"
            : "ascending";

    const roots = ["C4", "D4", "E4", "F4", "G4", "A4"];
    const root = roots[Math.floor(Math.random() * roots.length)]!;
    const intervalData = buildInterval(root, chosenSemitones, direction);

    const distractors = INTERVALS_CATALOG.filter((i) => i.semitones !== chosenSemitones)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((i) => `${i.name} (${i.shortName})`);

    const correct = `${intervalData.definition.name} (${intervalData.definition.shortName})`;
    const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

    const notesToAudition =
      direction === "harmonic"
        ? [[intervalData.rootNote, intervalData.targetNote]]
        : [[intervalData.rootNote], [intervalData.targetNote]];

    return {
      id,
      topic,
      level,
      prompt: `Identify the interval sounded ${direction} from base pitch ${displayNote(intervalData.rootNote)}.`,
      options,
      correctAnswer: correct,
      hint: `Song association: "${intervalData.definition.mnemonicSong}" (${intervalData.semitones} semitone(s)).`,
      explanation: `${intervalData.definition.name} spans ${intervalData.semitones} semitone(s) (${displayNote(intervalData.rootNote)} to ${displayNote(intervalData.targetNote)}). ${intervalData.definition.description}`,
      notesToAudition,
      intervalDirection: direction,
    };
  }

  if (topic === "chord-recognition") {
    const qualities: ChordQuality[] =
      level === "Beginner"
        ? ["major", "minor", "diminished", "augmented"]
        : ["major", "minor", "diminished", "augmented", "major-7", "dominant-7", "minor-7", "half-diminished-7"];

    const chosenQuality = qualities[Math.floor(Math.random() * qualities.length)]!;
    const roots = ["C", "G", "F", "D", "A", "Eb", "Bb"];
    const root = roots[Math.floor(Math.random() * roots.length)]!;
    const chord = buildChord(root, chosenQuality, 4);
    const def = CHORD_TYPES_CATALOG.find((q) => q.id === chosenQuality)!;

    const distractors = qualities
      .filter((q) => q !== chosenQuality)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((q) => CHORD_TYPES_CATALOG.find((c) => c.id === q)!.name);

    const options = [def.name, ...distractors].sort(() => 0.5 - Math.random());

    return {
      id,
      topic,
      level,
      prompt: `Identify the chord quality sounded in this harmonic voicing on root ${displayNote(root)}.`,
      options,
      correctAnswer: def.name,
      hint: `Formula: ${def.formula} (${def.intervalNames[1] ?? "3rd"} + ${def.intervalNames[2] ?? "5th"}).`,
      explanation: `${chord.symbol} is a ${def.name}. Composed of [${chord.notes.map((n) => displayNote(n)).join(", ")}]. ${def.description}`,
      notesToAudition: [chord.notes],
    };
  }

  if (topic === "harmonic-listening") {
    const ex = generateHarmonicExercise("cadence-recognition", level);
    return {
      id,
      topic,
      level,
      prompt: ex.prompt,
      options: ex.options,
      correctAnswer: ex.correctAnswer,
      hint: "Focus on the final resolution chord: does it feel like complete rest on the tonic?",
      explanation: ex.explanation,
      notesToAudition: ex.notesToPlay ?? [["C4", "E4", "G4"]],
    };
  }

  // Pitch Recognition fallback
  const ex = generatePitchExercise("pitch-compare-high-low", level);
  return {
    id,
    topic: "pitch-recognition",
    level,
    prompt: ex.prompt,
    options: ex.options,
    correctAnswer: ex.correctAnswer,
    hint: "Listen to the frequency difference: does the second tone climb upward or step downward?",
    explanation: ex.explanation,
    notesToAudition: ex.targetPitches.map((p) => [p]),
  };
}

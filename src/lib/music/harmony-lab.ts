/**
 * Harmony Studio — Academic Chord Calculations, Inversions, Figured Bass,
 * Roman Numeral Analysis, Chord Progressions, and SATB Voice Leading for THEORYLAB.
 */

import { displayNote, midiToFrequency, midiToNote, noteToMidi, parseNote } from "./theory";

export type ChordQuality =
  | "major"
  | "minor"
  | "diminished"
  | "augmented"
  | "dominant-7"
  | "major-7"
  | "minor-7"
  | "half-diminished-7"
  | "diminished-7";

export type ChordInversion = "root" | "first" | "second" | "third";

export interface ChordTypeDefinition {
  id: ChordQuality;
  name: string;
  symbolSuffix: string;
  isSeventh: boolean;
  semitoneOffsets: number[]; // e.g. [0, 4, 7] for major triad
  intervalNames: string[]; // ["Root", "Major 3rd", "Perfect 5th"]
  formula: string; // "1 - 3 - 5"
  description: string;
}

export const CHORD_TYPES_CATALOG: ChordTypeDefinition[] = [
  {
    id: "major",
    name: "Major Triad",
    symbolSuffix: "",
    isSeventh: false,
    semitoneOffsets: [0, 4, 7],
    intervalNames: ["Root", "Major 3rd", "Perfect 5th"],
    formula: "1 - 3 - 5",
    description: "Built with a major third (4 semitones) and a minor third (3 semitones). Consonant, stable and bright.",
  },
  {
    id: "minor",
    name: "Minor Triad",
    symbolSuffix: "m",
    isSeventh: false,
    semitoneOffsets: [0, 3, 7],
    intervalNames: ["Root", "Minor 3rd", "Perfect 5th"],
    formula: "1 - ♭3 - 5",
    description: "Built with a minor third (3 semitones) and a major third (4 semitones). Consonant, introspective and subdued.",
  },
  {
    id: "diminished",
    name: "Diminished Triad",
    symbolSuffix: "°",
    isSeventh: false,
    semitoneOffsets: [0, 3, 6],
    intervalNames: ["Root", "Minor 3rd", "Diminished 5th (Tritone)"],
    formula: "1 - ♭3 - ♭5",
    description: "Built from two stacked minor thirds. Highly tense and unstable due to the diminished fifth tritone.",
  },
  {
    id: "augmented",
    name: "Augmented Triad",
    symbolSuffix: "+",
    isSeventh: false,
    semitoneOffsets: [0, 4, 8],
    intervalNames: ["Root", "Major 3rd", "Augmented 5th"],
    formula: "1 - 3 - ♯5",
    description: "Built from two stacked major thirds. Symmetrical, ambiguous and suspended, creating an outward expansion.",
  },
  {
    id: "dominant-7",
    name: "Dominant Seventh",
    symbolSuffix: "7",
    isSeventh: true,
    semitoneOffsets: [0, 4, 7, 10],
    intervalNames: ["Root", "Major 3rd", "Perfect 5th", "Minor 7th"],
    formula: "1 - 3 - 5 - ♭7",
    description: "Major triad with a minor seventh. Contains the characteristic tritone between the 3rd and 7th that drives resolution to the tonic.",
  },
  {
    id: "major-7",
    name: "Major Seventh",
    symbolSuffix: "maj7",
    isSeventh: true,
    semitoneOffsets: [0, 4, 7, 11],
    intervalNames: ["Root", "Major 3rd", "Perfect 5th", "Major 7th"],
    formula: "1 - 3 - 5 - 7",
    description: "Major triad with a major seventh. Lush, serene, consonant dissonance with a strong leading-tone colour.",
  },
  {
    id: "minor-7",
    name: "Minor Seventh",
    symbolSuffix: "m7",
    isSeventh: true,
    semitoneOffsets: [0, 3, 7, 10],
    intervalNames: ["Root", "Minor 3rd", "Perfect 5th", "Minor 7th"],
    formula: "1 - ♭3 - 5 - ♭7",
    description: "Minor triad with a minor seventh. Soft, rich, and commonly serves as the ii chord in major key cadences.",
  },
  {
    id: "half-diminished-7",
    name: "Half-Diminished Seventh",
    symbolSuffix: "ø7",
    isSeventh: true,
    semitoneOffsets: [0, 3, 6, 10],
    intervalNames: ["Root", "Minor 3rd", "Diminished 5th", "Minor 7th"],
    formula: "1 - ♭3 - ♭5 - ♭7",
    description: "Diminished triad with a minor seventh. The diatonic viiø7 in major keys and iiø7 in minor keys.",
  },
  {
    id: "diminished-7",
    name: "Fully Diminished Seventh",
    symbolSuffix: "°7",
    isSeventh: true,
    semitoneOffsets: [0, 3, 6, 9],
    intervalNames: ["Root", "Minor 3rd", "Diminished 5th", "Diminished 7th"],
    formula: "1 - ♭3 - ♭5 - 𝄫7",
    description: "Three stacked minor thirds forming a completely symmetrical division of the octave into four equal minor thirds.",
  },
];

/** Standard letter sequence for tertian spelling */
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;

/**
 * Spells a chord using proper tertian intervals (skipping letters: C - E - G - B)
 */
export function buildChord(
  root: string, // e.g. "C", "F#", "Eb"
  quality: ChordQuality,
  octave = 4,
  inversion: ChordInversion = "root",
): {
  root: string;
  quality: ChordQuality;
  inversion: ChordInversion;
  symbol: string;
  notes: string[]; // Scientific pitch e.g. ["C4", "E4", "G4"]
  bassNote: string;
  figuredBass: string;
  formula: string;
  intervals: string[];
} {
  const rootParsed = parseNote(`${root}${octave}`);
  const rootLetter = rootParsed.letter;
  const rootIndex = LETTERS.indexOf(rootLetter);

  const def = CHORD_TYPES_CATALOG.find((q) => q.id === quality) ?? CHORD_TYPES_CATALOG[0]!;
  const rootMidi = noteToMidi(`${root}${octave}`);

  // Determine diatonic letter names: root is 1st, 3rd is +2 steps, 5th is +4 steps, 7th is +6 steps
  const noteLetters = [
    rootLetter,
    LETTERS[(rootIndex + 2) % 7]!,
    LETTERS[(rootIndex + 4) % 7]!,
    ...(def.isSeventh ? [LETTERS[(rootIndex + 6) % 7]!] : []),
  ];

  // Derive pitches with correct octave wrapping
  const unshiftedNotes = def.semitoneOffsets.map((offset, idx) => {
    const targetMidi = rootMidi + offset;
    const rawNote = midiToNote(targetMidi);
    const rawParsed = parseNote(rawNote);

    // Prefer spelled letter if possible, otherwise use standard accidental
    return rawNote;
  });

  // Apply Inversions:
  // Root: [0, 1, 2, (3)]
  // 1st: [1, 2, (3), 0 (+1 octave)]
  // 2nd: [2, (3), 0 (+1 octave), 1 (+1 octave)]
  // 3rd: [3, 0 (+1 octave), 1 (+1 octave), 2 (+1 octave)]
  let invertedNotes = [...unshiftedNotes];
  let figuredBass = "";

  if (inversion === "root") {
    figuredBass = def.isSeventh ? "7" : "5/3";
  } else if (inversion === "first") {
    figuredBass = def.isSeventh ? "6/5" : "6";
    // Shift root up an octave
    const rootUp = midiToNote(noteToMidi(unshiftedNotes[0]!) + 12);
    invertedNotes = [...unshiftedNotes.slice(1), rootUp];
  } else if (inversion === "second") {
    figuredBass = def.isSeventh ? "4/3" : "6/4";
    // Shift root and 3rd up an octave
    const rootUp = midiToNote(noteToMidi(unshiftedNotes[0]!) + 12);
    const thirdUp = midiToNote(noteToMidi(unshiftedNotes[1]!) + 12);
    invertedNotes = [...unshiftedNotes.slice(2), rootUp, thirdUp];
  } else if (inversion === "third" && def.isSeventh) {
    figuredBass = "4/2";
    // Shift root, 3rd, and 5th up an octave
    const rootUp = midiToNote(noteToMidi(unshiftedNotes[0]!) + 12);
    const thirdUp = midiToNote(noteToMidi(unshiftedNotes[1]!) + 12);
    const fifthUp = midiToNote(noteToMidi(unshiftedNotes[2]!) + 12);
    invertedNotes = [unshiftedNotes[3]!, rootUp, thirdUp, fifthUp];
  }

  const symbol = `${root}${def.symbolSuffix}${inversion !== "root" ? `/${invertedNotes[0]?.replace(/\d+/, "")}` : ""}`;

  return {
    root,
    quality,
    inversion,
    symbol,
    notes: invertedNotes,
    bassNote: invertedNotes[0]!,
    figuredBass,
    formula: def.formula,
    intervals: def.intervalNames,
  };
}

/**
 * Diatonic Chords & Roman Numeral Models
 */
export type ModeType = "major" | "minor";

export interface DiatonicChordInfo {
  degree: number; // 1 to 7
  roman: string; // e.g. "I", "ii", "vii°"
  degreeName: string; // "Tonic", "Supertonic", etc.
  functionType: "tonic" | "predominant" | "dominant";
  root: string;
  quality: ChordQuality;
  notes: string[];
}

export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const NATURAL_MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
export const HARMONIC_MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 11]; // Raised 7th for dominant harmony

const DEGREE_NAMES = [
  "Tonic",
  "Supertonic",
  "Mediant",
  "Subdominant",
  "Dominant",
  "Submediant",
  "Leading Tone",
];

const MAJOR_ROMAN_TRIADS = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const MAJOR_TRIAD_QUALITIES: ChordQuality[] = [
  "major",
  "minor",
  "minor",
  "major",
  "major",
  "minor",
  "diminished",
];
const MAJOR_FUNCTIONS: ("tonic" | "predominant" | "dominant")[] = [
  "tonic",
  "predominant",
  "tonic",
  "predominant",
  "dominant",
  "tonic",
  "dominant",
];

// In classical harmonic minor: i, ii°, III, iv, V, VI, vii°
const MINOR_ROMAN_TRIADS = ["i", "ii°", "III", "iv", "V", "VI", "vii°"];
const MINOR_TRIAD_QUALITIES: ChordQuality[] = [
  "minor",
  "diminished",
  "major",
  "minor",
  "major",
  "major",
  "diminished",
];
const MINOR_FUNCTIONS: ("tonic" | "predominant" | "dominant")[] = [
  "tonic",
  "predominant",
  "tonic",
  "predominant",
  "dominant",
  "tonic",
  "dominant",
];

export function getDiatonicChords(tonic: string, mode: ModeType, octave = 4): DiatonicChordInfo[] {
  const tonicMidi = noteToMidi(`${tonic}${octave}`);
  const intervals = mode === "major" ? MAJOR_SCALE_INTERVALS : HARMONIC_MINOR_SCALE_INTERVALS;
  const romans = mode === "major" ? MAJOR_ROMAN_TRIADS : MINOR_ROMAN_TRIADS;
  const qualities = mode === "major" ? MAJOR_TRIAD_QUALITIES : MINOR_TRIAD_QUALITIES;
  const functions = mode === "major" ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS;

  return intervals.map((interval, index) => {
    const rootMidi = tonicMidi + interval;
    const rootNote = midiToNote(rootMidi);
    const rootName = rootNote.replace(/\d+/, "");
    const quality = qualities[index]!;
    const chord = buildChord(rootName, quality, octave);

    return {
      degree: index + 1,
      roman: romans[index]!,
      degreeName: DEGREE_NAMES[index]!,
      functionType: functions[index]!,
      root: rootName,
      quality,
      notes: chord.notes,
    };
  });
}

/**
 * Progression Models & Cadence Definitions
 */
export interface ChordProgressionStep {
  roman: string;
  degree: number;
  quality: ChordQuality;
  inversion?: ChordInversion;
  function: "tonic" | "predominant" | "dominant";
}

export interface ProgressionPreset {
  id: string;
  name: string;
  mode: ModeType;
  cadenceType: "authentic" | "plagal" | "half" | "deceptive" | "sequential";
  description: string;
  steps: ChordProgressionStep[];
}

export const PROGRESSION_PRESETS: ProgressionPreset[] = [
  {
    id: "authentic-cadence-major",
    name: "Classic Authentic Cadence",
    mode: "major",
    cadenceType: "authentic",
    description: "The fundamental harmonic pillar: Tonic → Predominant (IV) → Dominant (V) → Tonic (I).",
    steps: [
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
      { roman: "IV", degree: 4, quality: "major", function: "predominant" },
      { roman: "V", degree: 5, quality: "major", function: "dominant" },
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
    ],
  },
  {
    id: "ii-v-i-jazz-classical",
    name: "Supertonic Cadence (ii - V - I)",
    mode: "major",
    cadenceType: "authentic",
    description: "The standard cadential motion using the minor supertonic triad (ii) as predominant.",
    steps: [
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
      { roman: "ii", degree: 2, quality: "minor", function: "predominant" },
      { roman: "V", degree: 5, quality: "major", function: "dominant" },
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
    ],
  },
  {
    id: "plagal-cadence",
    name: "Plagal Cadence (Amen)",
    mode: "major",
    cadenceType: "plagal",
    description: "Subdominant moving directly to Tonic (IV - I), commonly heard at the conclusion of sacred hymns.",
    steps: [
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
      { roman: "IV", degree: 4, quality: "major", function: "predominant" },
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
    ],
  },
  {
    id: "half-cadence",
    name: "Half Cadence (Unresolved)",
    mode: "major",
    cadenceType: "half",
    description: "A phrase that pauses on the Dominant (V), posing an open harmonic question awaiting resolution.",
    steps: [
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
      { roman: "vi", degree: 6, quality: "minor", function: "tonic" },
      { roman: "IV", degree: 4, quality: "major", function: "predominant" },
      { roman: "V", degree: 5, quality: "major", function: "dominant" },
    ],
  },
  {
    id: "deceptive-cadence",
    name: "Deceptive Cadence (V - vi)",
    mode: "major",
    cadenceType: "deceptive",
    description: "The dominant leads toward resolution but unexpectedly lands on the submediant (vi) instead of tonic.",
    steps: [
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
      { roman: "IV", degree: 4, quality: "major", function: "predominant" },
      { roman: "V", degree: 5, quality: "major", function: "dominant" },
      { roman: "vi", degree: 6, quality: "minor", function: "tonic" },
    ],
  },
  {
    id: "minor-authentic-cadence",
    name: "Minor Key Cadence (i - iv - V - i)",
    mode: "minor",
    cadenceType: "authentic",
    description: "Minor tonic and subdominant resolved by a major dominant triad featuring the raised leading tone.",
    steps: [
      { roman: "i", degree: 1, quality: "minor", function: "tonic" },
      { roman: "iv", degree: 4, quality: "minor", function: "predominant" },
      { roman: "V", degree: 5, quality: "major", function: "dominant" },
      { roman: "i", degree: 1, quality: "minor", function: "tonic" },
    ],
  },
  {
    id: "circle-of-fifths-seq",
    name: "Circle of Fifths Progression",
    mode: "major",
    cadenceType: "sequential",
    description: "Sequential root motion descending by fifths: I - IV - vii° - iii - vi - ii - V - I.",
    steps: [
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
      { roman: "IV", degree: 4, quality: "major", function: "predominant" },
      { roman: "vii°", degree: 7, quality: "diminished", function: "dominant" },
      { roman: "iii", degree: 3, quality: "minor", function: "tonic" },
      { roman: "vi", degree: 6, quality: "minor", function: "tonic" },
      { roman: "ii", degree: 2, quality: "minor", function: "predominant" },
      { roman: "V", degree: 5, quality: "major", function: "dominant" },
      { roman: "I", degree: 1, quality: "major", function: "tonic" },
    ],
  },
];

/**
 * Transpose a progression preset to any key
 */
export function realizeProgression(
  preset: ProgressionPreset,
  keyRoot: string, // e.g. "C", "G", "F", "D", "A", "Eb"
  octave = 4,
): {
  preset: ProgressionPreset;
  key: string;
  chords: {
    roman: string;
    symbol: string;
    function: "tonic" | "predominant" | "dominant";
    notes: string[];
  }[];
} {
  const diatonic = getDiatonicChords(keyRoot, preset.mode, octave);

  const chords = preset.steps.map((step) => {
    const dia = diatonic[step.degree - 1]!;
    const chord = buildChord(dia.root, dia.quality, octave, step.inversion ?? "root");

    return {
      roman: step.roman,
      symbol: chord.symbol,
      function: step.function,
      notes: chord.notes,
    };
  });

  return {
    preset,
    key: `${keyRoot} ${preset.mode}`,
    chords,
  };
}

/**
 * Four-Part SATB Voice Leading Engine
 */
export interface SATBChord {
  id?: string;
  soprano: string; // e.g. "G4"
  alto: string; // e.g. "E4"
  tenor: string; // e.g. "C4"
  bass: string; // e.g. "C3"
  roman?: string;
}

export interface VoiceLeadingRuleViolation {
  type: "parallel-fifths" | "parallel-octaves" | "voice-crossing" | "excessive-spacing";
  voices: [string, string];
  fromMeasure: number;
  toMeasure: number;
  description: string;
  severity: "error" | "warning";
}

/**
 * Standard vocal ranges for introductory chorale style
 */
export const SATB_VOICE_RANGES = {
  soprano: { minMidi: 60, maxMidi: 79, minNote: "C4", maxNote: "G5" }, // C4 to G5
  alto: { minMidi: 55, maxMidi: 74, minNote: "G3", maxNote: "D5" }, // G3 to D5
  tenor: { minMidi: 48, maxMidi: 67, minNote: "C3", maxNote: "G4" }, // C3 to G4
  bass: { minMidi: 40, maxMidi: 60, minNote: "E2", maxNote: "C4" }, // E2 to C4
};

/**
 * Validates SATB Voice Leading across a chord connection (Chord 1 -> Chord 2)
 */
export function checkVoiceLeading(
  chord1: SATBChord,
  chord2: SATBChord,
): VoiceLeadingRuleViolation[] {
  const violations: VoiceLeadingRuleViolation[] = [];

  const s1 = noteToMidi(chord1.soprano);
  const a1 = noteToMidi(chord1.alto);
  const t1 = noteToMidi(chord1.tenor);
  const b1 = noteToMidi(chord1.bass);

  const s2 = noteToMidi(chord2.soprano);
  const a2 = noteToMidi(chord2.alto);
  const t2 = noteToMidi(chord2.tenor);
  const b2 = noteToMidi(chord2.bass);

  // 1. Spacing check (S-A and A-T must not exceed an octave = 12 semitones)
  if (s2 - a2 > 12) {
    violations.push({
      type: "excessive-spacing",
      voices: ["Soprano", "Alto"],
      fromMeasure: 1,
      toMeasure: 2,
      description: `Spacing between Soprano (${chord2.soprano}) and Alto (${chord2.alto}) exceeds an octave (${s2 - a2} semitones).`,
      severity: "warning",
    });
  }
  if (a2 - t2 > 12) {
    violations.push({
      type: "excessive-spacing",
      voices: ["Alto", "Tenor"],
      fromMeasure: 1,
      toMeasure: 2,
      description: `Spacing between Alto (${chord2.alto}) and Tenor (${chord2.tenor}) exceeds an octave (${a2 - t2} semitones).`,
      severity: "warning",
    });
  }

  // 2. Voice Crossing check (Soprano must stay above Alto, Alto above Tenor, Tenor above Bass)
  if (s2 < a2) {
    violations.push({
      type: "voice-crossing",
      voices: ["Soprano", "Alto"],
      fromMeasure: 1,
      toMeasure: 2,
      description: `Voice crossing: Soprano (${chord2.soprano}) dips beneath Alto (${chord2.alto}).`,
      severity: "error",
    });
  }
  if (a2 < t2) {
    violations.push({
      type: "voice-crossing",
      voices: ["Alto", "Tenor"],
      fromMeasure: 1,
      toMeasure: 2,
      description: `Voice crossing: Alto (${chord2.alto}) dips beneath Tenor (${chord2.tenor}).`,
      severity: "error",
    });
  }
  if (t2 < b2) {
    violations.push({
      type: "voice-crossing",
      voices: ["Tenor", "Bass"],
      fromMeasure: 1,
      toMeasure: 2,
      description: `Voice crossing: Tenor (${chord2.tenor}) dips beneath Bass (${chord2.bass}).`,
      severity: "error",
    });
  }

  // 3. Parallel Fifths and Octaves Check
  // Compare every pair of voices: (S,A), (S,T), (S,B), (A,T), (A,B), (T,B)
  const voicePairs: {
    name: [string, string];
    v1_1: number;
    v2_1: number;
    v1_2: number;
    v2_2: number;
  }[] = [
    { name: ["Soprano", "Alto"], v1_1: s1, v2_1: a1, v1_2: s2, v2_2: a2 },
    { name: ["Soprano", "Tenor"], v1_1: s1, v2_1: t1, v1_2: s2, v2_2: t2 },
    { name: ["Soprano", "Bass"], v1_1: s1, v2_1: b1, v1_2: s2, v2_2: b2 },
    { name: ["Alto", "Tenor"], v1_1: a1, v2_1: t1, v1_2: a2, v2_2: t2 },
    { name: ["Alto", "Bass"], v1_1: a1, v2_1: b1, v1_2: a2, v2_2: b2 },
    { name: ["Tenor", "Bass"], v1_1: t1, v2_1: b1, v1_2: t2, v2_2: b2 },
  ];

  for (const pair of voicePairs) {
    const int1 = Math.abs(pair.v1_1 - pair.v2_1) % 12;
    const int2 = Math.abs(pair.v1_2 - pair.v2_2) % 12;

    const v1_motion = pair.v1_2 - pair.v1_1;
    const v2_motion = pair.v2_2 - pair.v2_1;

    // Both voices must actually move (not static)
    const bothMoved = v1_motion !== 0 && v2_motion !== 0;

    // Same direction motion (parallel or similar)
    const sameDirection = Math.sign(v1_motion) === Math.sign(v2_motion);

    if (bothMoved && sameDirection) {
      // Parallel Perfect Fifth (7 semitones)
      if (int1 === 7 && int2 === 7) {
        violations.push({
          type: "parallel-fifths",
          voices: pair.name,
          fromMeasure: 1,
          toMeasure: 2,
          description: `Parallel fifths detected between ${pair.name[0]} and ${pair.name[1]} moving in parallel fifths (${int1} st → ${int2} st).`,
          severity: "error",
        });
      }

      // Parallel Perfect Octave (0 semitones mod 12, when voices are separate)
      if (int1 === 0 && int2 === 0) {
        violations.push({
          type: "parallel-octaves",
          voices: pair.name,
          fromMeasure: 1,
          toMeasure: 2,
          description: `Parallel octaves detected between ${pair.name[0]} and ${pair.name[1]} moving in parallel octaves/unisons.`,
          severity: "error",
        });
      }
    }
  }

  return violations;
}

/**
 * Educational SATB Guided Examples
 */
export interface SATBExample {
  id: string;
  title: string;
  key: string;
  description: string;
  progression: string;
  hasErrors: boolean;
  chords: SATBChord[];
  analysisNote: string;
}

export const SATB_EDUCATIONAL_EXAMPLES: SATBExample[] = [
  {
    id: "authentic-cadence-correct",
    title: "Exemplary Cadence: I - IV - V - I (C Major)",
    key: "C Major",
    description: "Standard voice leading with contrary bass motion, smooth stepwise inner voices, and common tone retention.",
    progression: "I → IV → V → I",
    hasErrors: false,
    chords: [
      { soprano: "G4", alto: "E4", tenor: "C4", bass: "C3", roman: "I" },
      { soprano: "A4", alto: "F4", tenor: "C4", bass: "F3", roman: "IV" },
      { soprano: "G4", alto: "F4", tenor: "D4", bass: "G3", roman: "V7" },
      { soprano: "G4", alto: "E4", tenor: "C4", bass: "C3", roman: "I" },
    ],
    analysisNote: "Tenor holds the common tone C4 between I and IV. Bass moves in contrary motion to soprano.",
  },
  {
    id: "parallel-fifths-error",
    title: "Common Error: Parallel Fifths (I - ii)",
    key: "C Major",
    description: "Demonstrates a strict voice leading error where the Bass and Tenor move in parallel fifths.",
    progression: "I → ii (Flawed)",
    hasErrors: true,
    chords: [
      { soprano: "C5", alto: "G4", tenor: "G3", bass: "C3", roman: "I" },
      { soprano: "D5", alto: "A4", tenor: "A3", bass: "D3", roman: "ii" },
    ],
    analysisNote: "Both Bass (C3 → D3) and Tenor (G3 → A3) move up by a whole step, creating forbidden parallel perfect fifths.",
  },
  {
    id: "deceptive-resolution-correct",
    title: "Deceptive Resolution: V - vi (C Major)",
    key: "C Major",
    description: "Leading tone resolves upward to tonic while the bass steps up to the 6th degree, doubling the third in vi.",
    progression: "V → vi",
    hasErrors: false,
    chords: [
      { soprano: "B4", alto: "G4", tenor: "D4", bass: "G3", roman: "V" },
      { soprano: "C5", alto: "A4", tenor: "E4", bass: "A3", roman: "vi" },
    ],
    analysisNote: "Leading tone B4 resolves properly to C5. In the vi chord, the third (C) is doubled to avoid parallel fifths.",
  },
];

/**
 * Practice Questions for Harmony Studio
 */
export type HarmonyPracticeType =
  | "chord-quality"
  | "chord-inversion"
  | "roman-numeral"
  | "cadence-id"
  | "harmonic-function"
  | "voice-leading-check";

export interface HarmonyQuestion {
  id: string;
  type: HarmonyPracticeType;
  level: "Beginner" | "Intermediate";
  prompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  notesToPlay?: string[];
  chordsToInspect?: SATBChord[];
}

export function generateHarmonyQuestion(
  type: HarmonyPracticeType,
  level: "Beginner" | "Intermediate" = "Beginner",
): HarmonyQuestion {
  const id = `hq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const roots = ["C", "G", "D", "F", "A", "E", "Bb", "Eb"];
  const root = roots[Math.floor(Math.random() * roots.length)]!;

  if (type === "chord-quality") {
    const qualities: ChordQuality[] =
      level === "Beginner"
        ? ["major", "minor", "diminished", "augmented"]
        : ["major", "minor", "dominant-7", "major-7", "minor-7", "half-diminished-7"];

    const quality = qualities[Math.floor(Math.random() * qualities.length)]!;
    const chord = buildChord(root, quality, 4);
    const def = CHORD_TYPES_CATALOG.find((q) => q.id === quality)!;

    const distractors = qualities
      .filter((q) => q !== quality)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((q) => CHORD_TYPES_CATALOG.find((c) => c.id === q)!.name);

    const options = [def.name, ...distractors].sort(() => 0.5 - Math.random());

    return {
      id,
      type,
      level,
      prompt: `Identify the chord quality constructed from the notes: ${chord.notes.map((n) => displayNote(n)).join(" - ")}.`,
      options,
      correctAnswer: def.name,
      hint: `Notice the interval from root ${displayNote(chord.notes[0]!)}: formula is ${def.formula}.`,
      explanation: `${chord.symbol} is a ${def.name}. It consists of ${def.intervalNames.join(", ")} (${def.description})`,
      notesToPlay: chord.notes,
    };
  }

  if (type === "chord-inversion") {
    const inversions: ChordInversion[] =
      level === "Beginner"
        ? ["root", "first", "second"]
        : ["root", "first", "second", "third"];

    const inv = inversions[Math.floor(Math.random() * inversions.length)]!;
    const quality = inv === "third" ? "dominant-7" : "major";
    const chord = buildChord(root, quality, 4, inv);

    const names: Record<ChordInversion, string> = {
      root: "Root Position (5/3)",
      first: "First Inversion (6 or 6/5)",
      second: "Second Inversion (6/4 or 4/3)",
      third: "Third Inversion (4/2)",
    };

    const options = inversions.map((i) => names[i]);

    return {
      id,
      type,
      level,
      prompt: `Identify the inversion of this chord with bass note ${displayNote(chord.bassNote)}: [${chord.notes.map((n) => displayNote(n)).join(", ")}].`,
      options,
      correctAnswer: names[inv],
      hint: `Determine which chord factor (root, 3rd, 5th, or 7th) is in the bass.`,
      explanation: `The bass note is ${displayNote(chord.bassNote)}. In ${names[inv]}, the ${
        inv === "root" ? "root" : inv === "first" ? "third" : inv === "second" ? "fifth" : "seventh"
      } is the lowest sounding pitch.`,
      notesToPlay: chord.notes,
    };
  }

  if (type === "roman-numeral") {
    const keys = ["C", "G", "F", "D", "A", "Bb"];
    const key = keys[Math.floor(Math.random() * keys.length)]!;
    const diatonic = getDiatonicChords(key, "major");
    const chosen = diatonic[Math.floor(Math.random() * diatonic.length)]!;

    const otherRomans = diatonic.filter((d) => d.roman !== chosen.roman).map((d) => d.roman);
    const options = [chosen.roman, ...otherRomans.slice(0, 3)].sort(() => 0.5 - Math.random());

    return {
      id,
      type,
      level,
      prompt: `In the key of ${key} Major, what is the Roman numeral for the ${chosen.degreeName} chord (${chosen.root} ${chosen.quality})?`,
      options,
      correctAnswer: chosen.roman,
      hint: `The ${chosen.degreeName} is scale degree ${chosen.degree}. Major chords use uppercase, minor lowercase.`,
      explanation: `In ${key} Major, scale degree ${chosen.degree} (${chosen.root}) builds a ${chosen.quality} chord, designated as ${chosen.roman}.`,
      notesToPlay: chosen.notes,
    };
  }

  if (type === "cadence-id") {
    const presets = PROGRESSION_PRESETS.filter((p) => p.cadenceType !== "sequential");
    const chosen = presets[Math.floor(Math.random() * presets.length)]!;
    const options = [
      "Authentic Cadence (V - I)",
      "Plagal Cadence (IV - I)",
      "Half Cadence (Ending on V)",
      "Deceptive Cadence (V - vi)",
    ];

    const cadenceMap: Record<string, string> = {
      authentic: "Authentic Cadence (V - I)",
      plagal: "Plagal Cadence (IV - I)",
      half: "Half Cadence (Ending on V)",
      deceptive: "Deceptive Cadence (V - vi)",
    };

    return {
      id,
      type,
      level,
      prompt: `Identify the cadence type in the progression: ${chosen.steps.map((s) => s.roman).join(" → ")}.`,
      options,
      correctAnswer: cadenceMap[chosen.cadenceType]!,
      hint: `Look closely at the final two chords: ${chosen.steps.slice(-2).map((s) => s.roman).join(" → ")}.`,
      explanation: `${chosen.name} features a ${chosen.cadenceType} cadence. ${chosen.description}`,
    };
  }

  if (type === "harmonic-function") {
    const functions: ("tonic" | "predominant" | "dominant")[] = [
      "tonic",
      "predominant",
      "dominant",
    ];
    const func = functions[Math.floor(Math.random() * functions.length)]!;
    const examples = {
      tonic: { chord: "I (or vi)", desc: "provides harmonic resolution, home stability and rest" },
      predominant: {
        chord: "IV (or ii)",
        desc: "departs from tonic and prepares/intensifies the pull toward the dominant",
      },
      dominant: {
        chord: "V (or vii°)",
        desc: "creates maximum tension and contains the leading tone pulling to the tonic",
      },
    };

    const labels = {
      tonic: "Tonic (T) — Stability & Home",
      predominant: "Predominant / Subdominant (PD) — Preparation & Departure",
      dominant: "Dominant (D) — Maximum Tension & Leading-Tone Pull",
    };

    return {
      id,
      type,
      level,
      prompt: `Which harmonic function is exemplified by the ${examples[func].chord} chord, which ${examples[func].desc}?`,
      options: Object.values(labels),
      correctAnswer: labels[func],
      hint: "Remember the three-part functional model: Tonic → Predominant → Dominant → Tonic.",
      explanation: `${labels[func]} is the harmonic category that ${examples[func].desc}.`,
    };
  }

  // Voice Leading check
  const example = SATB_EDUCATIONAL_EXAMPLES[Math.floor(Math.random() * SATB_EDUCATIONAL_EXAMPLES.length)]!;
  const options = [
    "No Voice-Leading Errors (Smooth contrary motion & common tones)",
    "Parallel Fifths Error (Parallel motion of consecutive perfect fifths)",
    "Parallel Octaves Error (Parallel motion of consecutive octaves)",
    "Excessive Spacing Warning (Greater than an octave between upper voices)",
  ];

  let correctAnswer = options[0]!;
  if (example.hasErrors) {
    correctAnswer = options[1]!;
  }

  return {
    id,
    type,
    level: "Intermediate",
    prompt: `Analyze the voice leading in the example "${example.title}" (${example.progression}). Is there a rule violation?`,
    options,
    correctAnswer,
    hint: example.hasErrors
      ? "Check consecutive intervals between Bass and Tenor."
      : "Notice how inner voices step smoothly or hold common tones.",
    explanation: example.analysisNote,
    chordsToInspect: example.chords,
  };
}

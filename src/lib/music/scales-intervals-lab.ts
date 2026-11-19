/**
 * Scales and Intervals Studio — Academic Music Theory Calculations,
 * Enharmonic Spelling, Scale Formulas, Interval Physics, and Challenge Engines for THEORYLAB.
 */

import { displayNote, midiToNote, noteToMidi, parseNote } from "./theory";

/* =========================================================================
 * 1. INTERVAL DEFINITIONS & ACADEMIC INVERSIONS
 * ========================================================================= */

export type IntervalQuality = "perfect" | "major" | "minor" | "diminished" | "augmented";
export type IntervalDirection = "ascending" | "descending" | "harmonic";

export interface IntervalModel {
  id: string;
  name: string;
  shortName: string;
  semitones: number;
  genericNumber: number; // 1 for unison, 2 for second, ... 8 for octave, 9 for ninth, etc.
  isCompound: boolean;
  quality: IntervalQuality;
  frequencyRatio: string;
  consonanceType: "perfect-consonance" | "imperfect-consonance" | "dissonance";
  inversionName?: string;
  inversionShortName?: string;
  inversionSemitones?: number;
  description: string;
}

export const INTERVALS_CATALOG: IntervalModel[] = [
  {
    id: "P1",
    name: "Perfect Unison",
    shortName: "P1",
    semitones: 0,
    genericNumber: 1,
    isCompound: false,
    quality: "perfect",
    frequencyRatio: "1:1",
    consonanceType: "perfect-consonance",
    inversionName: "Perfect Octave",
    inversionShortName: "P8",
    inversionSemitones: 12,
    description: "Zero semitones. Two voices sounding the exact same pitch simultaneously. Total acoustic stability.",
  },
  {
    id: "m2",
    name: "Minor Second",
    shortName: "m2",
    semitones: 1,
    genericNumber: 2,
    isCompound: false,
    quality: "minor",
    frequencyRatio: "16:15",
    consonanceType: "dissonance",
    inversionName: "Major Seventh",
    inversionShortName: "M7",
    inversionSemitones: 11,
    description: "One semitone (half step). Highly tense, close dissonance. Found between leading tone and tonic, and scale degrees 3–4 / 7–8 in major scales.",
  },
  {
    id: "M2",
    name: "Major Second",
    shortName: "M2",
    semitones: 2,
    genericNumber: 2,
    isCompound: false,
    quality: "major",
    frequencyRatio: "9:8",
    consonanceType: "dissonance",
    inversionName: "Minor Seventh",
    inversionShortName: "m7",
    inversionSemitones: 10,
    description: "Two semitones (whole step). The standard step in diatonic scales. Mild melodic dissonance that provides melodic forward motion.",
  },
  {
    id: "m3",
    name: "Minor Third",
    shortName: "m3",
    semitones: 3,
    genericNumber: 3,
    isCompound: false,
    quality: "minor",
    frequencyRatio: "6:5",
    consonanceType: "imperfect-consonance",
    inversionName: "Major Sixth",
    inversionShortName: "M6",
    inversionSemitones: 9,
    description: "Three semitones. Warm, somber imperfect consonance. Fundamental defining interval of minor triads and minor keys.",
  },
  {
    id: "M3",
    name: "Major Third",
    shortName: "M3",
    semitones: 4,
    genericNumber: 3,
    isCompound: false,
    quality: "major",
    frequencyRatio: "5:4",
    consonanceType: "imperfect-consonance",
    inversionName: "Minor Sixth",
    inversionShortName: "m6",
    inversionSemitones: 8,
    description: "Four semitones. Bright, triumphant imperfect consonance. Essential acoustic foundation of the major triad.",
  },
  {
    id: "P4",
    name: "Perfect Fourth",
    shortName: "P4",
    semitones: 5,
    genericNumber: 4,
    isCompound: false,
    quality: "perfect",
    frequencyRatio: "4:3",
    consonanceType: "perfect-consonance",
    inversionName: "Perfect Fifth",
    inversionShortName: "P5",
    inversionSemitones: 7,
    description: "Five semitones. Highly resonant interval; historically treated as a harmonic dissonance when sounding against the bass in counterpoint.",
  },
  {
    id: "TT",
    name: "Tritone",
    shortName: "TT",
    semitones: 6,
    genericNumber: 4,
    isCompound: false,
    quality: "augmented",
    frequencyRatio: "45:32 (Aug 4th) / 64:45 (Dim 5th)",
    consonanceType: "dissonance",
    inversionName: "Tritone",
    inversionShortName: "TT",
    inversionSemitones: 6,
    description: "Six semitones (three whole tones). Divides the octave exactly in half. Inverts into itself. Drives the resolution of dominant seventh chords.",
  },
  {
    id: "P5",
    name: "Perfect Fifth",
    shortName: "P5",
    semitones: 7,
    genericNumber: 5,
    isCompound: false,
    quality: "perfect",
    frequencyRatio: "3:2",
    consonanceType: "perfect-consonance",
    inversionName: "Perfect Fourth",
    inversionShortName: "P4",
    inversionSemitones: 5,
    description: "Seven semitones. The most consonant interval after the octave. The backbone of tertian harmony and the circle of fifths.",
  },
  {
    id: "m6",
    name: "Minor Sixth",
    shortName: "m6",
    semitones: 8,
    genericNumber: 6,
    isCompound: false,
    quality: "minor",
    frequencyRatio: "8:5",
    consonanceType: "imperfect-consonance",
    inversionName: "Major Third",
    inversionShortName: "M3",
    inversionSemitones: 4,
    description: "Eight semitones. Inversion of the major third. Lyrical, melancholic imperfect consonance common in romantic vocal writing.",
  },
  {
    id: "M6",
    name: "Major Sixth",
    shortName: "M6",
    semitones: 9,
    genericNumber: 6,
    isCompound: false,
    quality: "major",
    frequencyRatio: "5:3",
    consonanceType: "imperfect-consonance",
    inversionName: "Minor Third",
    inversionShortName: "m3",
    inversionSemitones: 3,
    description: "Nine semitones. Inversion of the minor third. Consonant, sweet, and expansive.",
  },
  {
    id: "m7",
    name: "Minor Seventh",
    shortName: "m7",
    semitones: 10,
    genericNumber: 7,
    isCompound: false,
    quality: "minor",
    frequencyRatio: "16:9",
    consonanceType: "dissonance",
    inversionName: "Major Second",
    inversionShortName: "M2",
    inversionSemitones: 2,
    description: "Ten semitones. Mild dissonance. Essential component of dominant seventh and minor seventh chords, resolving downwards by step.",
  },
  {
    id: "M7",
    name: "Major Seventh",
    shortName: "M7",
    semitones: 11,
    genericNumber: 7,
    isCompound: false,
    quality: "major",
    frequencyRatio: "15:8",
    consonanceType: "dissonance",
    inversionName: "Minor Second",
    inversionShortName: "m2",
    inversionSemitones: 1,
    description: "Eleven semitones. Sharp dissonance sitting one half-step below the octave, imparting shimmering richness to major 7th chords.",
  },
  {
    id: "P8",
    name: "Perfect Octave",
    shortName: "P8",
    semitones: 12,
    genericNumber: 8,
    isCompound: false,
    quality: "perfect",
    frequencyRatio: "2:1",
    consonanceType: "perfect-consonance",
    inversionName: "Perfect Unison",
    inversionShortName: "P1",
    inversionSemitones: 0,
    description: "Twelve semitones. Doubling of frequency. Complete acoustic equivalence and unison blend across different vocal registers.",
  },
  /* Compound intervals */
  {
    id: "m9",
    name: "Minor Ninth",
    shortName: "m9",
    semitones: 13,
    genericNumber: 9,
    isCompound: true,
    quality: "minor",
    frequencyRatio: "32:15",
    consonanceType: "dissonance",
    description: "Thirteen semitones (Octave + Minor 2nd). Stark, haunting dissonance used in dominant minor ninth chords.",
  },
  {
    id: "M9",
    name: "Major Ninth",
    shortName: "M9",
    semitones: 14,
    genericNumber: 9,
    isCompound: true,
    quality: "major",
    frequencyRatio: "9:4",
    consonanceType: "dissonance",
    description: "Fourteen semitones (Octave + Major 2nd). Luminous, expressive compound interval prevalent in Impressionism and jazz harmony.",
  },
  {
    id: "M10",
    name: "Major Tenth",
    shortName: "M10",
    semitones: 16,
    genericNumber: 10,
    isCompound: true,
    quality: "major",
    frequencyRatio: "5:2",
    consonanceType: "imperfect-consonance",
    description: "Sixteen semitones (Octave + Major 3rd). Expansive, deeply resonant compound consonance beloved in romantic piano stride and orchestral voicing.",
  },
  {
    id: "P11",
    name: "Perfect Eleventh",
    shortName: "P11",
    semitones: 17,
    genericNumber: 11,
    isCompound: true,
    quality: "perfect",
    frequencyRatio: "8:3",
    consonanceType: "perfect-consonance",
    description: "Seventeen semitones (Octave + Perfect 4th). Open, airy compound interval used in suspended eleventh chords.",
  },
];

/* Helper to calculate theoretical pitch spelling for any interval */
export function calculateIntervalPitch(
  baseNote: string, // e.g. "C4", "Eb3"
  interval: IntervalModel,
  direction: IntervalDirection = "ascending",
): {
  baseNote: string;
  targetNote: string;
  semitones: number;
  direction: IntervalDirection;
  interval: IntervalModel;
  spellingExplanation: string;
} {
  const baseMidi = noteToMidi(baseNote);
  const targetMidi =
    direction === "descending"
      ? baseMidi - interval.semitones
      : baseMidi + interval.semitones;

  // Generic diatonic letters: C, D, E, F, G, A, B
  const letters = ["C", "D", "E", "F", "G", "A", "B"];
  const parsed = parseNote(baseNote);
  const baseLetterIdx = letters.indexOf(parsed.letter);

  const stepShift = (interval.genericNumber - 1) % 7;
  const targetLetterIdx =
    direction === "descending"
      ? (baseLetterIdx - stepShift + 7) % 7
      : (baseLetterIdx + stepShift) % 7;

  const targetLetter = letters[targetLetterIdx]!;

  // Determine octave
  const rawTargetNote = midiToNote(targetMidi);
  const parsedRaw = parseNote(rawTargetNote);
  const targetOctave = parsedRaw.octave;

  // Calculate accidental required for targetLetter to match targetMidi
  const baseLetterSemitones: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };
  const nominalMidiWithoutAcc = (targetOctave + 1) * 12 + baseLetterSemitones[targetLetter]!;
  const diff = targetMidi - nominalMidiWithoutAcc;

  let accidentalStr = "";
  if (diff === 1) accidentalStr = "#";
  else if (diff === 2) accidentalStr = "##";
  else if (diff === -1) accidentalStr = "b";
  else if (diff === -2) accidentalStr = "bb";
  else if (diff === 0) accidentalStr = "";
  else {
    // If double accidental exceeds typical bounds, fallback to clean midiToNote
    accidentalStr = parsedRaw.accidental;
  }

  const theoreticalTargetNote = `${targetLetter}${accidentalStr}${targetOctave}`;

  const spellingExplanation =
    direction === "descending"
      ? `${interval.name} descending from ${displayNote(baseNote)} steps down to ${displayNote(
          theoreticalTargetNote,
        )} (${interval.semitones} semitone span).`
      : `${interval.name} ascending from ${displayNote(baseNote)} steps up to ${displayNote(
          theoreticalTargetNote,
        )} (${interval.semitones} semitone span).`;

  return {
    baseNote,
    targetNote: theoreticalTargetNote,
    semitones: interval.semitones,
    direction,
    interval,
    spellingExplanation,
  };
}

/* =========================================================================
 * 2. SCALE CATEGORIES, FORMULAS & ENHARMONIC SPELLING ENGINE
 * ========================================================================= */

export type ScaleCategory = "major" | "minor" | "modes" | "other";

export interface ScaleDefinition {
  id: string;
  name: string;
  category: ScaleCategory;
  stepFormula: string; // e.g. "W - W - H - W - W - W - H"
  semitoneOffsets: number[]; // e.g. [0, 2, 4, 5, 7, 9, 11, 12]
  intervalDegreeNames: string[]; // ["1", "2", "3", "4", "5", "6", "7", "8"]
  characterAndUsage: string;
  hasDifferentDescending?: boolean;
  descendingSemitoneOffsets?: number[];
  descendingFormula?: string;
}

export const SCALES_CATALOG: ScaleDefinition[] = [
  /* Major Scales */
  {
    id: "major",
    name: "Major Scale",
    category: "major",
    stepFormula: "W - W - H - W - W - W - H",
    semitoneOffsets: [0, 2, 4, 5, 7, 9, 11, 12],
    intervalDegreeNames: ["1", "2", "3", "4", "5", "6", "7", "8"],
    characterAndUsage:
      "Bright, triumphant, and acoustically centered. The foundational diatonic system of Western tonal art music from the Renaissance to the modern era.",
  },

  /* Minor Scales */
  {
    id: "natural-minor",
    name: "Natural Minor (Aeolian)",
    category: "minor",
    stepFormula: "W - H - W - W - H - W - W",
    semitoneOffsets: [0, 2, 3, 5, 7, 8, 10, 12],
    intervalDegreeNames: ["1", "2", "♭3", "4", "5", "♭6", "♭7", "8"],
    characterAndUsage:
      "Dark, somber, and introspective. Features minor 3rd, minor 6th, and subtonic (whole step below tonic), lacking a leading tone.",
  },
  {
    id: "harmonic-minor",
    name: "Harmonic Minor",
    category: "minor",
    stepFormula: "W - H - W - W - H - 1½ - H",
    semitoneOffsets: [0, 2, 3, 5, 7, 8, 11, 12],
    intervalDegreeNames: ["1", "2", "♭3", "4", "5", "♭6", "7", "8"],
    characterAndUsage:
      "Characterized by the raised 7th scale degree creating an augmented 2nd leap (3 semitones) between degrees 6 and 7, providing a dominant leading tone for classical cadence resolution.",
  },
  {
    id: "melodic-minor",
    name: "Melodic Minor",
    category: "minor",
    stepFormula: "Asc: W - H - W - W - W - W - H | Desc: W - W - H - W - W - H - W",
    semitoneOffsets: [0, 2, 3, 5, 7, 9, 11, 12],
    intervalDegreeNames: ["1", "2", "♭3", "4", "5", "6", "7", "8"],
    characterAndUsage:
      "Classical convention raises both 6th and 7th degrees ascending to smooth the melodic approach to the tonic, and restores natural minor descending.",
    hasDifferentDescending: true,
    descendingSemitoneOffsets: [12, 10, 8, 7, 5, 3, 2, 0],
    descendingFormula: "W - W - H - W - W - H - W",
  },

  /* Musical Modes */
  {
    id: "mode-ionian",
    name: "Ionian Mode",
    category: "modes",
    stepFormula: "W - W - H - W - W - W - H",
    semitoneOffsets: [0, 2, 4, 5, 7, 9, 11, 12],
    intervalDegreeNames: ["1", "2", "3", "4", "5", "6", "7", "8"],
    characterAndUsage:
      "Mode 1. Acoustically identical to the major scale. Stable, luminous, and clear.",
  },
  {
    id: "mode-dorian",
    name: "Dorian Mode",
    category: "modes",
    stepFormula: "W - H - W - W - W - H - W",
    semitoneOffsets: [0, 2, 3, 5, 7, 9, 10, 12],
    intervalDegreeNames: ["1", "2", "♭3", "4", "5", "6", "♭7", "8"],
    characterAndUsage:
      "Mode 2. Minor quality with a distinctive natural 6th degree. Medieval, noble, and less somber than natural minor; heavily featured in folk and modal jazz.",
  },
  {
    id: "mode-phrygian",
    name: "Phrygian Mode",
    category: "modes",
    stepFormula: "H - W - W - W - H - W - W",
    semitoneOffsets: [0, 1, 3, 5, 7, 8, 10, 12],
    intervalDegreeNames: ["1", "♭2", "♭3", "4", "5", "♭6", "♭7", "8"],
    characterAndUsage:
      "Mode 3. Dark and exotic with an immediate half-step motion above the tonic (flat 2nd). Widely used in Spanish flamenco and heavy metal riffs.",
  },
  {
    id: "mode-lydian",
    name: "Lydian Mode",
    category: "modes",
    stepFormula: "W - W - W - H - W - W - H",
    semitoneOffsets: [0, 2, 4, 6, 7, 9, 11, 12],
    intervalDegreeNames: ["1", "2", "3", "♯4", "5", "6", "7", "8"],
    characterAndUsage:
      "Mode 4. Major quality featuring a raised 4th (tritone above tonic). Creates an ethereal, mystical, cinematic sound favored by film composers.",
  },
  {
    id: "mode-mixolydian",
    name: "Mixolydian Mode",
    category: "modes",
    stepFormula: "W - W - H - W - W - H - W",
    semitoneOffsets: [0, 2, 4, 5, 7, 9, 10, 12],
    intervalDegreeNames: ["1", "2", "3", "4", "5", "6", "♭7", "8"],
    characterAndUsage:
      "Mode 5. Major quality with a lowered flat 7th. The quintessential sound of blues, rock, Celtic tunes, and dominant chord improvisation.",
  },
  {
    id: "mode-aeolian",
    name: "Aeolian Mode",
    category: "modes",
    stepFormula: "W - H - W - W - H - W - W",
    semitoneOffsets: [0, 2, 3, 5, 7, 8, 10, 12],
    intervalDegreeNames: ["1", "2", "♭3", "4", "5", "♭6", "♭7", "8"],
    characterAndUsage:
      "Mode 6. Identical to natural minor. Somber, reflective, and plaintive.",
  },
  {
    id: "mode-locrian",
    name: "Locrian Mode",
    category: "modes",
    stepFormula: "H - W - W - H - W - W - W",
    semitoneOffsets: [0, 1, 3, 5, 6, 8, 10, 12],
    intervalDegreeNames: ["1", "♭2", "♭3", "4", "♭5", "♭6", "♭7", "8"],
    characterAndUsage:
      "Mode 7. Extremely unstable due to its diminished fifth (flat 5) and flat 2nd. Lacks a consonant tonic fifth.",
  },

  /* Other Scales */
  {
    id: "pentatonic-major",
    name: "Pentatonic Major",
    category: "other",
    stepFormula: "W - W - 1½ - W - 1½",
    semitoneOffsets: [0, 2, 4, 7, 9, 12],
    intervalDegreeNames: ["1", "2", "3", "5", "6", "8"],
    characterAndUsage:
      "Universal 5-note scale without semitones or tritones. Completely consonant, universally found in folk traditions worldwide from Asia to the Americas.",
  },
  {
    id: "pentatonic-minor",
    name: "Pentatonic Minor",
    category: "other",
    stepFormula: "1½ - W - W - 1½ - W",
    semitoneOffsets: [0, 3, 5, 7, 10, 12],
    intervalDegreeNames: ["1", "♭3", "4", "5", "♭7", "8"],
    characterAndUsage:
      "The cornerstone of blues, rock, and modern pop guitar soloing. Direct, soulful, and evocative.",
  },
  {
    id: "blues-scale",
    name: "Blues Scale",
    category: "other",
    stepFormula: "1½ - W - H - H - 1½ - W",
    semitoneOffsets: [0, 3, 5, 6, 7, 10, 12],
    intervalDegreeNames: ["1", "♭3", "4", "♭5", "5", "♭7", "8"],
    characterAndUsage:
      "Pentatonic minor augmented with the expressive chromatic 'blue note' (diminished 5th / tritone), providing iconic blues grit and swagger.",
  },
  {
    id: "chromatic",
    name: "Chromatic Scale",
    category: "other",
    stepFormula: "H - H - H - H - H - H - H - H - H - H - H - H",
    semitoneOffsets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    intervalDegreeNames: ["1", "♯1", "2", "♯2", "3", "4", "♯4", "5", "♯5", "6", "♯6", "7", "8"],
    characterAndUsage:
      "Contains all twelve pitches within an octave spaced by semitones. Spans total pitch space, used for virtuosic scalar embellishment and modern 12-tone serialism.",
  },
];

/* =========================================================================
 * 3. ACADEMIC ENHARMONIC SCALE REALIZATION
 * ========================================================================= */

const DIATONIC_SCALE_SPELLINGS: Record<string, string[]> = {
  // Major
  "C-major": ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  "G-major": ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  "D-major": ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
  "A-major": ["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5", "A5"],
  "E-major": ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
  "B-major": ["B3", "C#4", "D#4", "E4", "F#4", "G#4", "A#4", "B4"],
  "F#-major": ["F#4", "G#4", "A#4", "B4", "C#5", "D#5", "E#5", "F#5"],
  "F-major": ["F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5"],
  "Bb-major": ["Bb3", "C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"],
  "Eb-major": ["Eb4", "F4", "G4", "Ab4", "Bb4", "C5", "D5", "Eb5"],
  "Ab-major": ["Ab4", "Bb4", "C5", "Db5", "Eb5", "F5", "G5", "Ab5"],
  "Db-major": ["Db4", "Eb4", "F4", "Gb4", "Ab4", "Bb4", "C5", "Db5"],

  // Natural Minor
  "A-natural-minor": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
  "E-natural-minor": ["E4", "F#4", "G4", "A4", "B4", "C5", "D5", "E5"],
  "B-natural-minor": ["B3", "C#4", "D4", "E4", "F#4", "G4", "A4", "B4"],
  "D-natural-minor": ["D4", "E4", "F4", "G4", "A4", "Bb4", "C5", "D5"],
  "G-natural-minor": ["G4", "A4", "Bb4", "C5", "D5", "Eb5", "F5", "G5"],
  "C-natural-minor": ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4", "C5"],
  "F-natural-minor": ["F4", "G4", "Ab4", "Bb4", "C5", "Db5", "Eb5", "F5"],
};

export interface RealizedScale {
  tonic: string; // e.g. "C", "F#", "Eb"
  scale: ScaleDefinition;
  notes: string[]; // e.g. ["C4", "D4", "E4", ...]
  descendingNotes?: string[] | undefined;
  formula: string;
  intervalNames: string[];
  explanation: string;
}

export function realizeScale(
  tonic: string, // e.g. "C", "D", "Eb", "F#"
  scaleId: string,
  startOctave = 4,
): RealizedScale {
  const scale = SCALES_CATALOG.find((s) => s.id === scaleId) ?? SCALES_CATALOG[0]!;
  const lookupKey = `${tonic}-${scaleId}`;

  // Check preset dictionary
  if (DIATONIC_SCALE_SPELLINGS[lookupKey]) {
    const presetNotes = DIATONIC_SCALE_SPELLINGS[lookupKey]!;
    return {
      tonic,
      scale,
      notes: presetNotes,
      formula: scale.stepFormula,
      intervalNames: scale.intervalDegreeNames,
      explanation: `${tonic} ${scale.name}: ${scale.characterAndUsage}`,
    };
  }

  // Algorithmic calculation with academic spelling
  const letters = ["C", "D", "E", "F", "G", "A", "B"];
  const parsedTonic = parseNote(`${tonic}${startOctave}`);
  const baseLetterIdx = letters.indexOf(parsedTonic.letter);
  const tonicMidi = noteToMidi(`${tonic}${startOctave}`);

  const isDiatonic7Note = scale.semitoneOffsets.length === 8;

  const notes: string[] = [];

  scale.semitoneOffsets.forEach((offset, idx) => {
    const pitchMidi = tonicMidi + offset;

    if (isDiatonic7Note && idx < 7) {
      // Must use unique consecutive letter name
      const expectedLetter = letters[(baseLetterIdx + idx) % 7]!;
      const rawNote = midiToNote(pitchMidi);
      const parsedRaw = parseNote(rawNote);

      const baseLetterSemitones: Record<string, number> = {
        C: 0,
        D: 2,
        E: 4,
        F: 5,
        G: 7,
        A: 9,
        B: 11,
      };
      const nominalMidi = (parsedRaw.octave + 1) * 12 + baseLetterSemitones[expectedLetter]!;
      const diff = pitchMidi - nominalMidi;

      let acc = "";
      if (diff === 1) acc = "#";
      else if (diff === 2) acc = "##";
      else if (diff === -1) acc = "b";
      else if (diff === -2) acc = "bb";
      else acc = "";

      notes.push(`${expectedLetter}${acc}${parsedRaw.octave}`);
    } else if (idx === 7 && isDiatonic7Note) {
      // Final octave pitch
      notes.push(`${parsedTonic.letter}${parsedTonic.accidental}${startOctave + 1}`);
    } else {
      // Non-7-note scales (pentatonic, chromatic, blues)
      const spellingPreference = tonic.includes("b") || tonic === "F" ? "flat" : "sharp";
      notes.push(midiToNote(pitchMidi, spellingPreference));
    }
  });

  let descendingNotes: string[] | undefined;
  if (scale.hasDifferentDescending && scale.descendingSemitoneOffsets) {
    descendingNotes = scale.descendingSemitoneOffsets.map((offset) => {
      const pitchMidi = tonicMidi + offset;
      const spellingPreference = tonic.includes("b") || tonic === "F" ? "flat" : "sharp";
      return midiToNote(pitchMidi, spellingPreference);
    });
  }

  return {
    tonic,
    scale,
    notes,
    descendingNotes,
    formula: scale.stepFormula,
    intervalNames: scale.intervalDegreeNames,
    explanation: `${tonic} ${scale.name}: ${scale.characterAndUsage}`,
  };
}

/* =========================================================================
 * 4. SCALE BUILDER VALIDATION
 * ========================================================================= */

export interface ScaleBuildStepValidation {
  isCorrect: boolean;
  expectedNote: string;
  enteredNote: string;
  stepIndex: number;
  message: string;
}

export function validateScaleBuildStep(
  targetNotes: string[],
  enteredNotes: string[],
): ScaleBuildStepValidation {
  const currentIdx = enteredNotes.length - 1;
  const entered = enteredNotes[currentIdx]!;
  const expected = targetNotes[currentIdx]!;

  const enteredMidi = noteToMidi(entered);
  const expectedMidi = noteToMidi(expected);
  const isCorrect = enteredMidi === expectedMidi;

  let message = "";
  if (isCorrect) {
    message = `Correct! ${displayNote(entered)} accurately satisfies step #${currentIdx + 1}.`;
  } else {
    const diff = enteredMidi - expectedMidi;
    const direction = diff > 0 ? "higher" : "lower";
    message = `Incorrect pitch. You selected ${displayNote(entered)}, which is ${Math.abs(
      diff,
    )} semitone(s) too ${direction}. Expected ${displayNote(expected)}.`;
  }

  return {
    isCorrect,
    expectedNote: expected,
    enteredNote: entered,
    stepIndex: currentIdx,
    message,
  };
}

/* =========================================================================
 * 5. INTERVAL TRAINER & CHALLENGE QUESTION GENERATORS
 * ========================================================================= */

export type IntervalExerciseType =
  | "identify-by-ear"
  | "name-from-semitones"
  | "construct-interval"
  | "melodic-vs-harmonic"
  | "ascending-vs-descending";

export interface IntervalQuestion {
  id: string;
  type: IntervalExerciseType;
  level: "Beginner" | "Intermediate" | "Advanced";
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  notesToPlay: string[][];
  direction?: IntervalDirection;
}

export function generateIntervalQuestion(
  type: IntervalExerciseType,
  level: "Beginner" | "Intermediate" | "Advanced" = "Beginner",
): IntervalQuestion {
  const id = `iq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const pool =
    level === "Beginner"
      ? INTERVALS_CATALOG.filter((i) => [0, 2, 4, 5, 7, 12].includes(i.semitones))
      : level === "Intermediate"
        ? INTERVALS_CATALOG.filter((i) => !i.isCompound)
        : INTERVALS_CATALOG; // Advanced includes compound

  const roots = ["C4", "D4", "Eb4", "F4", "G4", "A4", "Bb3"];
  const root = roots[Math.floor(Math.random() * roots.length)]!;
  const interval = pool[Math.floor(Math.random() * pool.length)]!;
  const calc = calculateIntervalPitch(root, interval, "ascending");

  if (type === "name-from-semitones") {
    const options = pool
      .map((i) => `${i.name} (${i.shortName})`)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    const correct = `${interval.name} (${interval.shortName})`;
    if (!options.includes(correct)) options[0] = correct;
    options.sort(() => 0.5 - Math.random());

    return {
      id,
      type,
      level,
      prompt: `Which musical interval spans exactly ${interval.semitones} semitone(s)?`,
      options,
      correctAnswer: correct,
      explanation: `${interval.name} (${interval.shortName}) comprises ${interval.semitones} semitone(s). ${interval.description}`,
      notesToPlay: [[calc.baseNote], [calc.targetNote]],
    };
  }

  if (type === "construct-interval") {
    const distractors = [
      midiToNote(noteToMidi(calc.targetNote) + 1),
      midiToNote(noteToMidi(calc.targetNote) - 1),
      midiToNote(noteToMidi(calc.targetNote) + 2),
    ].map((n) => displayNote(n));

    const correct = displayNote(calc.targetNote);
    const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

    return {
      id,
      type,
      level,
      prompt: `What is the resulting pitch when sounding a ${interval.name} ascending from ${displayNote(
        calc.baseNote,
      )}?`,
      options,
      correctAnswer: correct,
      explanation: `${interval.name} above ${displayNote(calc.baseNote)} is ${displayNote(
        calc.targetNote,
      )} (+${interval.semitones} semitones).`,
      notesToPlay: [[calc.baseNote], [calc.targetNote]],
    };
  }

  if (type === "melodic-vs-harmonic") {
    const isHarmonic = Math.random() > 0.5;
    const notesToPlay = isHarmonic
      ? [[calc.baseNote, calc.targetNote]]
      : [[calc.baseNote], [calc.targetNote]];

    return {
      id,
      type,
      level,
      prompt: "Listen to the sounded interval. Was it performed melodically (in succession) or harmonically (together)?",
      options: [
        "Melodically (Notes played in succession)",
        "Harmonically (Notes sounded simultaneously)",
      ],
      correctAnswer: isHarmonic
        ? "Harmonically (Notes sounded simultaneously)"
        : "Melodically (Notes played in succession)",
      explanation: isHarmonic
        ? "The notes were sounded simultaneously as a harmonic interval."
        : "The notes were sounded consecutively as a melodic interval.",
      notesToPlay,
    };
  }

  if (type === "ascending-vs-descending") {
    const isAscending = Math.random() > 0.5;
    const direction: IntervalDirection = isAscending ? "ascending" : "descending";
    const dirCalc = calculateIntervalPitch(root, interval, direction);
    const notesToPlay = [[dirCalc.baseNote], [dirCalc.targetNote]];

    return {
      id,
      type,
      level,
      prompt: "Listen to the melodic interval. Is the second note ascending (higher) or descending (lower) from the first?",
      options: [
        "Ascending (Second pitch steps up)",
        "Descending (Second pitch steps down)",
      ],
      correctAnswer: isAscending
        ? "Ascending (Second pitch steps up)"
        : "Descending (Second pitch steps down)",
      explanation: isAscending
        ? `The pitch moved upward by ${interval.semitones} semitone(s) to ${displayNote(
            dirCalc.targetNote,
          )}.`
        : `The pitch moved downward by ${interval.semitones} semitone(s) to ${displayNote(
            dirCalc.targetNote,
          )}.`,
      notesToPlay,
      direction,
    };
  }

  // Fallback: identify-by-ear
  const distractors = pool
    .filter((i) => i.id !== interval.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((i) => `${i.name} (${i.shortName})`);

  const correct = `${interval.name} (${interval.shortName})`;
  const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

  return {
    id,
    type: "identify-by-ear",
    level,
    prompt: `Listen to this interval sounded from ${displayNote(calc.baseNote)}. Identify the interval:`,
    options,
    correctAnswer: correct,
    explanation: `${interval.name} (${interval.shortName}) spans ${interval.semitones} semitone(s). ${interval.description}`,
    notesToPlay: [[calc.baseNote], [calc.targetNote]],
  };
}

/* =========================================================================
 * 6. SCALE IDENTIFICATION CHALLENGES
 * ========================================================================= */

export interface ScaleChallengeQuestion {
  id: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  prompt: string;
  notes: string[];
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function generateScaleChallenge(
  level: "Beginner" | "Intermediate" | "Advanced" = "Beginner",
): ScaleChallengeQuestion {
  const id = `sc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const tonics = ["C", "G", "D", "F", "Bb", "A", "E"];
  const tonic = tonics[Math.floor(Math.random() * tonics.length)]!;

  const pool =
    level === "Beginner"
      ? SCALES_CATALOG.filter((s) => ["major", "natural-minor"].includes(s.id))
      : level === "Intermediate"
        ? SCALES_CATALOG.filter((s) => s.category === "major" || s.category === "minor")
        : SCALES_CATALOG;

  const targetScale = pool[Math.floor(Math.random() * pool.length)]!;
  const realized = realizeScale(tonic, targetScale.id, 4);

  const correct = `${tonic} ${targetScale.name}`;
  const distractors = pool
    .filter((s) => s.id !== targetScale.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((s) => `${tonic} ${s.name}`);

  const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

  return {
    id,
    level,
    prompt: `Identify the scale formed by the following pitches: [${realized.notes
      .map((n) => displayNote(n))
      .join(", ")}]`,
    notes: realized.notes,
    options,
    correctAnswer: correct,
    explanation: `${tonic} ${targetScale.name} follows the step formula ${targetScale.stepFormula}. ${targetScale.characterAndUsage}`,
  };
}

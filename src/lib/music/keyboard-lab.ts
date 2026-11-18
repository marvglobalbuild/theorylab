/**
 * Virtual Piano Keyboard Lab — Core data models, pitch calculations,
 * keyboard layout generation, enharmonics, and practice generators for THEORYLAB.
 */

import { displayNote, midiToFrequency, midiToNote, noteToMidi, parseNote } from "./theory";

export interface VirtualKeyDefinition {
  note: string; // Scientific pitch e.g. "C4", "C#4", "Bb3"
  letter: string; // "C", "D", etc.
  octave: number;
  isBlack: boolean;
  midiNumber: number;
  frequencyHz: number;
  isMiddleC: boolean;
  enharmonic: string | null; // e.g. "Db4" for "C#4"
  shortcut?: string | undefined; // Physical computer keyboard shortcut
  semitoneAbove: string;
  semitoneBelow: string;
  wholeToneAbove: string;
  wholeToneBelow: string;
}

export type KeyboardOctaveRange = "2-octaves" | "3-octaves" | "4-octaves";

export interface KeyboardRangeConfig {
  startOctave: number; // e.g. 2, 3, 4
  numOctaves: number; // e.g. 2, 3, 4
}

/**
 * Standard computer keyboard shortcuts mapped to a 2-octave playable range centered at active octave.
 */
export const DEFAULT_KEYBOARD_SHORTCUTS: Record<string, { noteOffset: number; isBlack: boolean }> = {
  // Lower octave (White keys)
  a: { noteOffset: 0, isBlack: false }, // C
  s: { noteOffset: 2, isBlack: false }, // D
  d: { noteOffset: 4, isBlack: false }, // E
  f: { noteOffset: 5, isBlack: false }, // F
  g: { noteOffset: 7, isBlack: false }, // G
  h: { noteOffset: 9, isBlack: false }, // A
  j: { noteOffset: 11, isBlack: false }, // B
  // Upper octave (White keys)
  k: { noteOffset: 12, isBlack: false }, // C+1
  l: { noteOffset: 14, isBlack: false }, // D+1
  ";": { noteOffset: 16, isBlack: false }, // E+1
  "'": { noteOffset: 17, isBlack: false }, // F+1

  // Lower octave (Black keys)
  w: { noteOffset: 1, isBlack: true }, // C#
  e: { noteOffset: 3, isBlack: true }, // D#
  t: { noteOffset: 6, isBlack: true }, // F#
  y: { noteOffset: 8, isBlack: true }, // G#
  u: { noteOffset: 10, isBlack: true }, // A#
  // Upper octave (Black keys)
  o: { noteOffset: 13, isBlack: true }, // C#+1
  p: { noteOffset: 15, isBlack: true }, // D#+1
};

export const ENHARMONIC_PAIRS: Record<string, string> = {
  "C#": "Db",
  Db: "C#",
  "D#": "Eb",
  Eb: "D#",
  "F#": "Gb",
  Gb: "F#",
  "G#": "Ab",
  Ab: "G#",
  "A#": "Bb",
  Bb: "A#",
};

/**
 * Generates an array of keys spanning from startOctave to endOctave (inclusive of top C).
 * Supports ranges like C2 to C6 (4 full octaves + top C = 49 keys).
 */
export function generateKeyboardKeys(startOctave = 3, numOctaves = 3): VirtualKeyDefinition[] {
  const startMidi = (startOctave + 1) * 12; // C3 = 48, C4 = 60, etc.
  const totalNotes = numOctaves * 12 + 1; // e.g. 3 octaves + 1 = 37 keys (C3 to C6)

  const keys: VirtualKeyDefinition[] = [];

  for (let i = 0; i < totalNotes; i++) {
    const midi = startMidi + i;
    const note = midiToNote(midi);
    const parsed = parseNote(note);
    const isBlack = note.includes("#");

    const baseName = `${parsed.letter}${parsed.accidental}`;
    const enharmonicBase = ENHARMONIC_PAIRS[baseName];
    const enharmonic = enharmonicBase ? `${enharmonicBase}${parsed.octave}` : null;

    const frequencyHz = Math.round(midiToFrequency(midi) * 10) / 10;
    const isMiddleC = midi === 60; // C4

    // Semitones & Whole tones
    const semitoneAbove = midiToNote(midi + 1);
    const semitoneBelow = midiToNote(midi - 1);
    const wholeToneAbove = midiToNote(midi + 2);
    const wholeToneBelow = midiToNote(midi - 2);

    // Computer shortcut if within the primary 2 octaves
    const offsetFromBase = midi - (4 * 12 + 12); // relative to C4
    let shortcut: string | undefined;

    for (const [char, mapping] of Object.entries(DEFAULT_KEYBOARD_SHORTCUTS)) {
      if (mapping.noteOffset === offsetFromBase) {
        shortcut = char;
        break;
      }
    }

    keys.push({
      note,
      letter: parsed.letter,
      octave: parsed.octave,
      isBlack,
      midiNumber: midi,
      frequencyHz,
      isMiddleC,
      enharmonic,
      shortcut,
      semitoneAbove,
      semitoneBelow,
      wholeToneAbove,
      wholeToneBelow,
    });
  }

  return keys;
}

/**
 * Detailed description of a note's position and theoretical significance.
 */
export function getKeyboardNoteAnalysis(note: string): {
  note: string;
  formatted: string;
  octave: number;
  midi: number;
  frequency: number;
  isBlack: boolean;
  enharmonicText: string;
  groupPattern: string;
  middleCRelation: string;
} {
  const parsed = parseNote(note);
  const midi = noteToMidi(note);
  const freq = Math.round(midiToFrequency(midi) * 10) / 10;
  const isBlack = note.includes("#") || note.includes("b");

  const baseName = `${parsed.letter}${parsed.accidental}`;
  const enharmonic = ENHARMONIC_PAIRS[baseName];
  const enharmonicText = enharmonic
    ? `${displayNote(note)} is enharmonically equivalent to ${displayNote(`${enharmonic}${parsed.octave}`)}.`
    : `${displayNote(note)} is a natural white key with no simple single-accidental black key equivalent.`;

  let groupPattern = "";
  if (isBlack) {
    if (parsed.letter === "C" || parsed.letter === "D") {
      groupPattern = "Part of the 2-black-key cluster (C♯/D♭ and D♯/E♭).";
    } else {
      groupPattern = "Part of the 3-black-key cluster (F♯/G♭, G♯/A♭, A♯/B♭).";
    }
  } else {
    if (parsed.letter === "C") {
      groupPattern = "Located immediately to the left of the group of two black keys.";
    } else if (parsed.letter === "D") {
      groupPattern = "Centered right between the group of two black keys.";
    } else if (parsed.letter === "E") {
      groupPattern = "Located immediately to the right of the group of two black keys.";
    } else if (parsed.letter === "F") {
      groupPattern = "Located immediately to the left of the group of three black keys.";
    } else if (parsed.letter === "B") {
      groupPattern = "Located immediately to the right of the group of three black keys.";
    } else {
      groupPattern = "Enclosed within the group of three black keys.";
    }
  }

  let middleCRelation = "";
  if (midi === 60) {
    middleCRelation = "This IS Middle C (C4), the central landmark of the keyboard (MIDI 60, 261.6 Hz).";
  } else if (midi < 60) {
    const semitonesBelow = 60 - midi;
    middleCRelation = `${semitonesBelow} semitone${semitonesBelow === 1 ? "" : "s"} below Middle C (C4).`;
  } else {
    const semitonesAbove = midi - 60;
    middleCRelation = `${semitonesAbove} semitone${semitonesAbove === 1 ? "" : "s"} above Middle C (C4).`;
  }

  return {
    note,
    formatted: displayNote(note),
    octave: parsed.octave,
    midi,
    frequency: freq,
    isBlack,
    enharmonicText,
    groupPattern,
    middleCRelation,
  };
}

/**
 * Practice Questions for Keyboard Lab
 */
export type KeyboardPracticeType =
  | "locate-note"
  | "locate-middle-c"
  | "semitone-step"
  | "whole-tone-step"
  | "octave-jump"
  | "enharmonic";

export interface KeyboardQuestion {
  id: string;
  type: KeyboardPracticeType;
  prompt: string;
  targetNotes: string[]; // Valid target notes (e.g. ["C4"] or enharmonic ["C#4", "Db4"])
  hint: string;
  explanation: string;
  level: "Beginner" | "Intermediate";
}

export function generateKeyboardQuestion(
  type: KeyboardPracticeType,
  level: "Beginner" | "Intermediate" = "Beginner",
): KeyboardQuestion {
  const id = `kq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const octaves = level === "Beginner" ? [4] : [3, 4, 5];
  const octave = octaves[Math.floor(Math.random() * octaves.length)]!;

  if (type === "locate-middle-c") {
    return {
      id,
      type,
      prompt: "Locate and play Middle C (C4) on the piano keyboard.",
      targetNotes: ["C4"],
      hint: "Middle C is the white key situated to the left of the two black keys in the center of the keyboard (Octave 4).",
      explanation: "Middle C is C4 (MIDI note 60, 261.6 Hz), the universal bridge between the treble and bass clefs.",
      level: "Beginner",
    };
  }

  if (type === "locate-note") {
    const whiteLetters = ["C", "D", "E", "F", "G", "A", "B"];
    const blackNotes = ["C#", "Eb", "F#", "Ab", "Bb"];
    const pool = level === "Beginner" ? whiteLetters : [...whiteLetters, ...blackNotes];
    const letter = pool[Math.floor(Math.random() * pool.length)]!;
    const target = `${letter}${octave}`;

    let targetNotes = [target];
    const baseAcc = letter.replace(/\d/, "");
    if (ENHARMONIC_PAIRS[baseAcc]) {
      targetNotes.push(`${ENHARMONIC_PAIRS[baseAcc]}${octave}`);
    }

    return {
      id,
      type,
      prompt: `Find and press the key for ${displayNote(target)} on the piano.`,
      targetNotes,
      hint: target.includes("#") || target.includes("b")
        ? "Look at the clusters of 2 and 3 black keys."
        : `Locate the letter ${letter} in Octave ${octave}.`,
      explanation: `${displayNote(target)} is located in Octave ${octave}. ${getKeyboardNoteAnalysis(target).groupPattern}`,
      level,
    };
  }

  if (type === "semitone-step") {
    const startMidi = (octave + 1) * 12 + Math.floor(Math.random() * 10);
    const startNote = midiToNote(startMidi);
    const direction = Math.random() > 0.5 ? "above" : "below";
    const targetMidi = direction === "above" ? startMidi + 1 : startMidi - 1;
    const targetNote = midiToNote(targetMidi);

    return {
      id,
      type,
      prompt: `Find the note that is exactly one semitone (half step) ${direction} ${displayNote(startNote)}.`,
      targetNotes: [targetNote],
      hint: "A semitone is the closest possible distance on the keyboard — the immediately adjacent key (white or black).",
      explanation: `One semitone ${direction} ${displayNote(startNote)} is ${displayNote(targetNote)} (MIDI ${targetMidi}).`,
      level,
    };
  }

  if (type === "whole-tone-step") {
    const startMidi = (octave + 1) * 12 + Math.floor(Math.random() * 8) + 2;
    const startNote = midiToNote(startMidi);
    const direction = Math.random() > 0.5 ? "above" : "below";
    const targetMidi = direction === "above" ? startMidi + 2 : startMidi - 2;
    const targetNote = midiToNote(targetMidi);

    return {
      id,
      type,
      prompt: `Find the note that is one whole tone (whole step = 2 semitones) ${direction} ${displayNote(startNote)}.`,
      targetNotes: [targetNote],
      hint: "A whole tone equals two half steps: skip exactly one key (black or white) and play the next one.",
      explanation: `One whole tone ${direction} ${displayNote(startNote)} is ${displayNote(targetNote)}.`,
      level,
    };
  }

  if (type === "octave-jump") {
    const letters = ["C", "D", "E", "F", "G", "A", "B"];
    const letter = letters[Math.floor(Math.random() * letters.length)]!;
    const fromOctave = 3;
    const toOctave = 4;
    const fromNote = `${letter}${fromOctave}`;
    const toNote = `${letter}${toOctave}`;

    return {
      id,
      type,
      prompt: `You hear ${displayNote(fromNote)}. Play the exact same pitch class one octave higher (${displayNote(toNote)}).`,
      targetNotes: [toNote],
      hint: "An octave jump has the exact same letter name and position relative to the black keys, 12 semitones higher.",
      explanation: `${displayNote(toNote)} vibrates at exactly twice the frequency of ${displayNote(fromNote)} (2:1 frequency ratio).`,
      level,
    };
  }

  // Enharmonic challenge
  const blackKeys = ["C#4", "Eb4", "F#4", "Ab4", "Bb4"];
  const chosen = blackKeys[Math.floor(Math.random() * blackKeys.length)]!;
  const parsed = parseNote(chosen);
  const base = `${parsed.letter}${parsed.accidental}`;
  const enharmonicBase = ENHARMONIC_PAIRS[base]!;
  const enharmonicTarget = `${enharmonicBase}${parsed.octave}`;

  return {
    id,
    type: "enharmonic",
    prompt: `Play the black key that represents ${displayNote(chosen)}. (Also known as ${displayNote(enharmonicTarget)}).`,
    targetNotes: [chosen, enharmonicTarget],
    hint: "Black keys have two names: one raised (sharp ♯) and one lowered (flat ♭).",
    explanation: `${displayNote(chosen)} and ${displayNote(enharmonicTarget)} share the exact same physical key and acoustic frequency.`,
    level: "Intermediate",
  };
}

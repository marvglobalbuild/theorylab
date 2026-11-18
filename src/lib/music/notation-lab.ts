/**
 * Music Notation Lab — Core types, pitch data, note duration catalog,
 * and exercise generation algorithms for THEORYLAB.
 */

import { displayNote, parseNote, toVexKey } from "./theory";
export { displayNote, parseNote, toVexKey };
import type { StaffClef, StaffDuration } from "@/components/music/Staff";

export type NotationDifficulty = "beginner" | "intermediate";

export interface StaffNoteDefinition {
  note: string; // Scientific pitch e.g. "C4", "F#4", "Bb3"
  clef: StaffClef;
  name: string; // e.g. "C", "F#", "Bb"
  octave: number;
  accidental?: "natural" | "sharp" | "flat";
  positionType: "line" | "space" | "ledger_below" | "ledger_above";
  positionDescription: string; // e.g. "Line 1 (E)", "Space 2 (A)", "1st ledger line below"
  mnemonic?: string; // e.g. "Every", "FACE", "Good", etc.
  frequencyHz: number;
  midiNumber: number;
  difficulty: NotationDifficulty;
}

export interface NoteDurationInfo {
  id: StaffDuration;
  nameUk: string;
  nameUs: string;
  beats: number;
  relativeValue: string; // e.g. "4 beats", "1 beat", "1/2 beat"
  isRest: boolean;
  description: string;
}

export const NOTE_DURATIONS_CATALOG: NoteDurationInfo[] = [
  {
    id: "w",
    nameUk: "Semibreve",
    nameUs: "Whole Note",
    beats: 4,
    relativeValue: "4 beats",
    isRest: false,
    description: "An open notehead with no stem. In common 4/4 time, it receives 4 full beats.",
  },
  {
    id: "wr",
    nameUk: "Semibreve Rest",
    nameUs: "Whole Rest",
    beats: 4,
    relativeValue: "4 beats of silence",
    isRest: true,
    description: "Hangs downward from the 4th line of the staff. Represents 4 beats of silence or an entire measure of rest.",
  },
  {
    id: "h",
    nameUk: "Minim",
    nameUs: "Half Note",
    beats: 2,
    relativeValue: "2 beats",
    isRest: false,
    description: "An open notehead with a vertical stem. Worth two quarter beats (half of a whole note).",
  },
  {
    id: "hr",
    nameUk: "Minim Rest",
    nameUs: "Half Rest",
    beats: 2,
    relativeValue: "2 beats of silence",
    isRest: true,
    description: "Sits upright on top of the 3rd line of the staff. Represents 2 beats of silence.",
  },
  {
    id: "q",
    nameUk: "Crotchet",
    nameUs: "Quarter Note",
    beats: 1,
    relativeValue: "1 beat",
    isRest: false,
    description: "A filled black oval with a vertical stem. The fundamental unit of pulse in simple meters (e.g. 4/4, 3/4).",
  },
  {
    id: "qr",
    nameUk: "Crotchet Rest",
    nameUs: "Quarter Rest",
    beats: 1,
    relativeValue: "1 beat of silence",
    isRest: true,
    description: "A squiggly lightning-like symbol centered on the staff. Denotes 1 beat of silence.",
  },
  {
    id: "8",
    nameUk: "Quaver",
    nameUs: "Eighth Note",
    beats: 0.5,
    relativeValue: "1/2 beat",
    isRest: false,
    description: "A filled notehead with a stem and one flag (or beam when grouped). Lasts half a beat.",
  },
  {
    id: "8r",
    nameUk: "Quaver Rest",
    nameUs: "Eighth Rest",
    beats: 0.5,
    relativeValue: "1/2 beat of silence",
    isRest: true,
    description: "Resembles a small numeral 7 with a hook. Denotes one half beat of silence.",
  },
  {
    id: "16",
    nameUk: "Semiquaver",
    nameUs: "Sixteenth Note",
    beats: 0.25,
    relativeValue: "1/4 beat",
    isRest: false,
    description: "A filled notehead with a stem and two flags (or two beams). Four sixteenths equal one quarter beat.",
  },
  {
    id: "16r",
    nameUk: "Semiquaver Rest",
    nameUs: "Sixteenth Rest",
    beats: 0.25,
    relativeValue: "1/4 beat of silence",
    isRest: true,
    description: "Features two diagonal hooks on the stem. Denotes one quarter beat of silence.",
  },
];

// Helper to compute frequency and MIDI
export function noteToMidi(note: string): number {
  const parsed = parseNote(note);
  if (!parsed) return 60;
  const semitones: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };
  let base = (parsed.octave + 1) * 12 + (semitones[parsed.letter] ?? 0);
  if (parsed.accidental === "#") base += 1;
  else if (parsed.accidental === "b") base -= 1;
  return base;
}

export function midiToFrequency(midi: number): number {
  return Math.round(440 * Math.pow(2, (midi - 69) / 12) * 10) / 10;
}

/**
 * Verified pitch catalogue for the Treble Clef
 */
export const TREBLE_STAFF_NOTES: StaffNoteDefinition[] = [
  // Below staff / Ledger lines
  {
    note: "A3",
    clef: "treble",
    name: "A",
    octave: 3,
    positionType: "ledger_below",
    positionDescription: "2nd ledger line below staff",
    frequencyHz: 220.0,
    midiNumber: 57,
    difficulty: "intermediate",
  },
  {
    note: "B3",
    clef: "treble",
    name: "B",
    octave: 3,
    positionType: "ledger_below",
    positionDescription: "Space sitting just below 1st ledger line",
    frequencyHz: 246.9,
    midiNumber: 59,
    difficulty: "intermediate",
  },
  {
    note: "C4",
    clef: "treble",
    name: "C",
    octave: 4,
    positionType: "ledger_below",
    positionDescription: "Middle C · 1st ledger line below staff",
    mnemonic: "Middle C bridge",
    frequencyHz: 261.6,
    midiNumber: 60,
    difficulty: "beginner",
  },
  {
    note: "D4",
    clef: "treble",
    name: "D",
    octave: 4,
    positionType: "space",
    positionDescription: "Space hanging directly below Line 1",
    mnemonic: "D hangs below the staff",
    frequencyHz: 293.7,
    midiNumber: 62,
    difficulty: "beginner",
  },
  // Main Staff Lines
  {
    note: "E4",
    clef: "treble",
    name: "E",
    octave: 4,
    positionType: "line",
    positionDescription: "Line 1 (bottom line)",
    mnemonic: "Every (E)",
    frequencyHz: 329.6,
    midiNumber: 64,
    difficulty: "beginner",
  },
  {
    note: "F4",
    clef: "treble",
    name: "F",
    octave: 4,
    positionType: "space",
    positionDescription: "Space 1 (first space)",
    mnemonic: "F in F-A-C-E",
    frequencyHz: 349.2,
    midiNumber: 65,
    difficulty: "beginner",
  },
  {
    note: "G4",
    clef: "treble",
    name: "G",
    octave: 4,
    positionType: "line",
    positionDescription: "Line 2 (Treble clef anchor line)",
    mnemonic: "Good (G) · G-Clef origin curl",
    frequencyHz: 392.0,
    midiNumber: 67,
    difficulty: "beginner",
  },
  {
    note: "A4",
    clef: "treble",
    name: "A",
    octave: 4,
    positionType: "space",
    positionDescription: "Space 2 (second space)",
    mnemonic: "A in F-A-C-E · 440 Hz Concert Pitch",
    frequencyHz: 440.0,
    midiNumber: 69,
    difficulty: "beginner",
  },
  {
    note: "B4",
    clef: "treble",
    name: "B",
    octave: 4,
    positionType: "line",
    positionDescription: "Line 3 (middle line)",
    mnemonic: "Boy (B)",
    frequencyHz: 493.9,
    midiNumber: 71,
    difficulty: "beginner",
  },
  {
    note: "C5",
    clef: "treble",
    name: "C",
    octave: 5,
    positionType: "space",
    positionDescription: "Space 3 (third space)",
    mnemonic: "C in F-A-C-E",
    frequencyHz: 523.3,
    midiNumber: 72,
    difficulty: "beginner",
  },
  {
    note: "D5",
    clef: "treble",
    name: "D",
    octave: 5,
    positionType: "line",
    positionDescription: "Line 4 (fourth line)",
    mnemonic: "Does (D)",
    frequencyHz: 587.3,
    midiNumber: 74,
    difficulty: "beginner",
  },
  {
    note: "E5",
    clef: "treble",
    name: "E",
    octave: 5,
    positionType: "space",
    positionDescription: "Space 4 (top space)",
    mnemonic: "E in F-A-C-E",
    frequencyHz: 659.3,
    midiNumber: 76,
    difficulty: "beginner",
  },
  {
    note: "F5",
    clef: "treble",
    name: "F",
    octave: 5,
    positionType: "line",
    positionDescription: "Line 5 (top line)",
    mnemonic: "Fine (F)",
    frequencyHz: 698.5,
    midiNumber: 77,
    difficulty: "beginner",
  },
  // Above staff / Ledger lines
  {
    note: "G5",
    clef: "treble",
    name: "G",
    octave: 5,
    positionType: "space",
    positionDescription: "Space sitting directly above Line 5",
    frequencyHz: 784.0,
    midiNumber: 79,
    difficulty: "beginner",
  },
  {
    note: "A5",
    clef: "treble",
    name: "A",
    octave: 5,
    positionType: "ledger_above",
    positionDescription: "1st ledger line above staff",
    frequencyHz: 880.0,
    midiNumber: 81,
    difficulty: "intermediate",
  },
  {
    note: "B5",
    clef: "treble",
    name: "B",
    octave: 5,
    positionType: "ledger_above",
    positionDescription: "Space sitting just above 1st ledger line",
    frequencyHz: 987.8,
    midiNumber: 83,
    difficulty: "intermediate",
  },
  {
    note: "C6",
    clef: "treble",
    name: "C",
    octave: 6,
    positionType: "ledger_above",
    positionDescription: "2nd ledger line above staff",
    frequencyHz: 1046.5,
    midiNumber: 84,
    difficulty: "intermediate",
  },
  // Accidentals (Intermediate)
  {
    note: "C#4",
    clef: "treble",
    name: "C#",
    octave: 4,
    accidental: "sharp",
    positionType: "ledger_below",
    positionDescription: "1st ledger line below staff with sharp (♯)",
    frequencyHz: 277.2,
    midiNumber: 61,
    difficulty: "intermediate",
  },
  {
    note: "Eb4",
    clef: "treble",
    name: "Eb",
    octave: 4,
    accidental: "flat",
    positionType: "line",
    positionDescription: "Line 1 with flat (♭)",
    frequencyHz: 311.1,
    midiNumber: 63,
    difficulty: "intermediate",
  },
  {
    note: "F#4",
    clef: "treble",
    name: "F#",
    octave: 4,
    accidental: "sharp",
    positionType: "space",
    positionDescription: "Space 1 with sharp (♯)",
    frequencyHz: 370.0,
    midiNumber: 66,
    difficulty: "intermediate",
  },
  {
    note: "Ab4",
    clef: "treble",
    name: "Ab",
    octave: 4,
    accidental: "flat",
    positionType: "space",
    positionDescription: "Space 2 with flat (♭)",
    frequencyHz: 415.3,
    midiNumber: 68,
    difficulty: "intermediate",
  },
  {
    note: "Bb4",
    clef: "treble",
    name: "Bb",
    octave: 4,
    accidental: "flat",
    positionType: "line",
    positionDescription: "Line 3 with flat (♭)",
    frequencyHz: 466.2,
    midiNumber: 70,
    difficulty: "intermediate",
  },
  {
    note: "C#5",
    clef: "treble",
    name: "C#",
    octave: 5,
    accidental: "sharp",
    positionType: "space",
    positionDescription: "Space 3 with sharp (♯)",
    frequencyHz: 554.4,
    midiNumber: 73,
    difficulty: "intermediate",
  },
  {
    note: "F#5",
    clef: "treble",
    name: "F#",
    octave: 5,
    accidental: "sharp",
    positionType: "line",
    positionDescription: "Line 5 with sharp (♯)",
    frequencyHz: 740.0,
    midiNumber: 78,
    difficulty: "intermediate",
  },
];

/**
 * Verified pitch catalogue for the Bass Clef
 */
export const BASS_STAFF_NOTES: StaffNoteDefinition[] = [
  // Below staff / Ledger lines
  {
    note: "C2",
    clef: "bass",
    name: "C",
    octave: 2,
    positionType: "ledger_below",
    positionDescription: "2nd ledger line below staff",
    frequencyHz: 65.4,
    midiNumber: 36,
    difficulty: "intermediate",
  },
  {
    note: "D2",
    clef: "bass",
    name: "D",
    octave: 2,
    positionType: "ledger_below",
    positionDescription: "Space sitting below 1st ledger line",
    frequencyHz: 73.4,
    midiNumber: 38,
    difficulty: "intermediate",
  },
  {
    note: "E2",
    clef: "bass",
    name: "E",
    octave: 2,
    positionType: "ledger_below",
    positionDescription: "1st ledger line below staff",
    frequencyHz: 82.4,
    midiNumber: 40,
    difficulty: "intermediate",
  },
  {
    note: "F2",
    clef: "bass",
    name: "F",
    octave: 2,
    positionType: "space",
    positionDescription: "Space hanging directly below Line 1",
    frequencyHz: 87.3,
    midiNumber: 41,
    difficulty: "beginner",
  },
  // Main Staff Lines
  {
    note: "G2",
    clef: "bass",
    name: "G",
    octave: 2,
    positionType: "line",
    positionDescription: "Line 1 (bottom line)",
    mnemonic: "Good (G)",
    frequencyHz: 98.0,
    midiNumber: 43,
    difficulty: "beginner",
  },
  {
    note: "A2",
    clef: "bass",
    name: "A",
    octave: 2,
    positionType: "space",
    positionDescription: "Space 1 (first space)",
    mnemonic: "All (A) in All Cows Eat Grass",
    frequencyHz: 110.0,
    midiNumber: 45,
    difficulty: "beginner",
  },
  {
    note: "B2",
    clef: "bass",
    name: "B",
    octave: 2,
    positionType: "line",
    positionDescription: "Line 2 (second line)",
    mnemonic: "Boys (B)",
    frequencyHz: 123.5,
    midiNumber: 47,
    difficulty: "beginner",
  },
  {
    note: "C3",
    clef: "bass",
    name: "C",
    octave: 3,
    positionType: "space",
    positionDescription: "Space 2 (second space)",
    mnemonic: "Cows (C)",
    frequencyHz: 130.8,
    midiNumber: 48,
    difficulty: "beginner",
  },
  {
    note: "D3",
    clef: "bass",
    name: "D",
    octave: 3,
    positionType: "line",
    positionDescription: "Line 3 (middle line)",
    mnemonic: "Do (D)",
    frequencyHz: 146.8,
    midiNumber: 50,
    difficulty: "beginner",
  },
  {
    note: "E3",
    clef: "bass",
    name: "E",
    octave: 3,
    positionType: "space",
    positionDescription: "Space 3 (third space)",
    mnemonic: "Eat (E)",
    frequencyHz: 164.8,
    midiNumber: 52,
    difficulty: "beginner",
  },
  {
    note: "F3",
    clef: "bass",
    name: "F",
    octave: 3,
    positionType: "line",
    positionDescription: "Line 4 (F-clef anchor between two dots)",
    mnemonic: "Fine (F) · Bass clef anchor",
    frequencyHz: 174.6,
    midiNumber: 53,
    difficulty: "beginner",
  },
  {
    note: "G3",
    clef: "bass",
    name: "G",
    octave: 3,
    positionType: "space",
    positionDescription: "Space 4 (top space)",
    mnemonic: "Grass (G)",
    frequencyHz: 196.0,
    midiNumber: 55,
    difficulty: "beginner",
  },
  {
    note: "A3",
    clef: "bass",
    name: "A",
    octave: 3,
    positionType: "line",
    positionDescription: "Line 5 (top line)",
    mnemonic: "Always (A)",
    frequencyHz: 220.0,
    midiNumber: 57,
    difficulty: "beginner",
  },
  // Above staff / Ledger lines
  {
    note: "B3",
    clef: "bass",
    name: "B",
    octave: 3,
    positionType: "space",
    positionDescription: "Space sitting directly above Line 5",
    frequencyHz: 246.9,
    midiNumber: 59,
    difficulty: "beginner",
  },
  {
    note: "C4",
    clef: "bass",
    name: "C",
    octave: 4,
    positionType: "ledger_above",
    positionDescription: "Middle C · 1st ledger line above bass staff",
    mnemonic: "Middle C bridge",
    frequencyHz: 261.6,
    midiNumber: 60,
    difficulty: "beginner",
  },
  {
    note: "D4",
    clef: "bass",
    name: "D",
    octave: 4,
    positionType: "ledger_above",
    positionDescription: "Space sitting above 1st ledger line",
    frequencyHz: 293.7,
    midiNumber: 62,
    difficulty: "intermediate",
  },
  {
    note: "E4",
    clef: "bass",
    name: "E",
    octave: 4,
    positionType: "ledger_above",
    positionDescription: "2nd ledger line above bass staff",
    frequencyHz: 329.6,
    midiNumber: 64,
    difficulty: "intermediate",
  },
  // Accidentals (Intermediate)
  {
    note: "Eb3",
    clef: "bass",
    name: "Eb",
    octave: 3,
    accidental: "flat",
    positionType: "space",
    positionDescription: "Space 3 with flat (♭)",
    frequencyHz: 155.6,
    midiNumber: 51,
    difficulty: "intermediate",
  },
  {
    note: "F#3",
    clef: "bass",
    name: "F#",
    octave: 3,
    accidental: "sharp",
    positionType: "line",
    positionDescription: "Line 4 with sharp (♯)",
    frequencyHz: 185.0,
    midiNumber: 54,
    difficulty: "intermediate",
  },
  {
    note: "Ab3",
    clef: "bass",
    name: "Ab",
    octave: 3,
    accidental: "flat",
    positionType: "line",
    positionDescription: "Line 5 with flat (♭)",
    frequencyHz: 207.7,
    midiNumber: 56,
    difficulty: "intermediate",
  },
  {
    note: "Bb3",
    clef: "bass",
    name: "Bb",
    octave: 3,
    accidental: "flat",
    positionType: "space",
    positionDescription: "Space sitting above Line 5 with flat (♭)",
    frequencyHz: 233.1,
    midiNumber: 58,
    difficulty: "intermediate",
  },
];

export function getStaffNotes(clef: StaffClef, difficulty?: NotationDifficulty): StaffNoteDefinition[] {
  const all = clef === "bass" ? BASS_STAFF_NOTES : TREBLE_STAFF_NOTES;
  if (!difficulty) return all;
  return all.filter((n) => difficulty === "intermediate" || n.difficulty === "beginner");
}

export function findNoteDefinition(note: string, clef: StaffClef): StaffNoteDefinition | undefined {
  const catalog = clef === "bass" ? BASS_STAFF_NOTES : TREBLE_STAFF_NOTES;
  return catalog.find((item) => item.note === note);
}

/**
 * Question generator for Note Identification Practice
 */
export interface NoteIdentificationQuestion {
  id: string;
  clef: StaffClef;
  targetNote: StaffNoteDefinition;
  options: string[]; // e.g. ["C4", "E4", "G4", "B4"]
  explanation: string;
}

export function generateRandomNoteQuestion(
  clefOption: "treble" | "bass" | "mixed",
  difficulty: NotationDifficulty,
  previousNote?: string,
): NoteIdentificationQuestion {
  const clef: StaffClef =
    clefOption === "mixed"
      ? Math.random() > 0.5
        ? "treble"
        : "bass"
      : clefOption;

  const pool = getStaffNotes(clef, difficulty);
  const eligible = pool.filter((n) => n.note !== previousNote);
  const target = eligible[Math.floor(Math.random() * eligible.length)] ?? pool[0]!;

  // Generate 3 plausible distractors
  const distractors: string[] = [];
  const otherNotes = pool.filter((n) => n.note !== target.note);

  // Shuffle other notes
  const shuffledOthers = [...otherNotes].sort(() => Math.random() - 0.5);

  for (const candidate of shuffledOthers) {
    if (distractors.length >= 3) break;
    // Prefer distinct pitch letter names if possible for beginner
    if (!distractors.includes(candidate.note)) {
      distractors.push(candidate.note);
    }
  }

  // Combine and shuffle options
  const options = [target.note, ...distractors].sort(() => Math.random() - 0.5);

  const clefName = clef === "treble" ? "Treble (G-clef)" : "Bass (F-clef)";
  const explanation = `${displayNote(target.note)} is located on ${target.positionDescription} in the ${clefName}.${
    target.mnemonic ? ` Remember: "${target.mnemonic}".` : ""
  }`;

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    clef,
    targetNote: target,
    options,
    explanation,
  };
}

/**
 * Preset sequences for the Notation Constructor
 */
export interface NotationPreset {
  id: string;
  name: string;
  clef: StaffClef;
  description: string;
  chords: { keys: string[]; duration: StaffDuration }[];
}

export const NOTATION_PRESETS: NotationPreset[] = [
  {
    id: "c-major-scale-treble",
    name: "C Major Scale (Treble)",
    clef: "treble",
    description: "The diatonic C Major scale ascending from Middle C4 to C5.",
    chords: [
      { keys: ["C4"], duration: "q" },
      { keys: ["D4"], duration: "q" },
      { keys: ["E4"], duration: "q" },
      { keys: ["F4"], duration: "q" },
      { keys: ["G4"], duration: "q" },
      { keys: ["A4"], duration: "q" },
      { keys: ["B4"], duration: "q" },
      { keys: ["C5"], duration: "h" },
    ],
  },
  {
    id: "g-major-arpeggio-treble",
    name: "G Major Arpeggio (Treble)",
    clef: "treble",
    description: "Tonic triad arpeggio (G-B-D-G) testing lines 2, 3, and 4.",
    chords: [
      { keys: ["G4"], duration: "q" },
      { keys: ["B4"], duration: "q" },
      { keys: ["D5"], duration: "q" },
      { keys: ["G5"], duration: "h" },
    ],
  },
  {
    id: "bass-foundation-scale",
    name: "C Major Scale (Bass)",
    clef: "bass",
    description: "Ascending scale from Space 2 (C3) up to Middle C4.",
    chords: [
      { keys: ["C3"], duration: "q" },
      { keys: ["D3"], duration: "q" },
      { keys: ["E3"], duration: "q" },
      { keys: ["F3"], duration: "q" },
      { keys: ["G3"], duration: "q" },
      { keys: ["A3"], duration: "q" },
      { keys: ["B3"], duration: "q" },
      { keys: ["C4"], duration: "h" },
    ],
  },
  {
    id: "rhythm-values-demonstration",
    name: "Rhythm & Rests Demo",
    clef: "treble",
    description: "Demonstration of note values: whole, half, quarter, eighth and quarter rest.",
    chords: [
      { keys: ["C4"], duration: "w" },
      { keys: ["E4"], duration: "h" },
      { keys: ["G4"], duration: "h" },
      { keys: ["C5"], duration: "q" },
      { keys: [], duration: "qr" },
      { keys: ["B4"], duration: "8" },
      { keys: ["A4"], duration: "8" },
      { keys: ["G4"], duration: "q" },
    ],
  },
];

/**
 * Guided Practice Curriculum Exercises
 */
export interface GuidedExerciseStep {
  prompt: string;
  targetNote: string;
  clef: StaffClef;
  duration?: StaffDuration;
  hint: string;
}

export interface GuidedExercise {
  id: string;
  title: string;
  clef: StaffClef;
  level: "Beginner" | "Intermediate";
  description: string;
  objective: string;
  steps: GuidedExerciseStep[];
}

export const GUIDED_EXERCISES: GuidedExercise[] = [
  {
    id: "ex-treble-lines",
    title: "Exercise 1: Treble Lines Mastery",
    clef: "treble",
    level: "Beginner",
    description:
      'Learn and identify the 5 lines of the treble staff from bottom to top using the classic mnemonic "Every Good Boy Does Fine".',
    objective: "Accurately name notes located on lines 1, 2, 3, 4, and 5.",
    steps: [
      {
        prompt: "Identify the note resting on Line 1 (the bottom-most line).",
        targetNote: "E4",
        clef: "treble",
        hint: '"Every" corresponds to the note E on the bottom line.',
      },
      {
        prompt: "Identify the note on Line 2, where the Treble Clef curl wraps.",
        targetNote: "G4",
        clef: "treble",
        hint: 'The treble clef is also called the G-clef because it circles Line 2 ("Good").',
      },
      {
        prompt: "Identify the note sitting on Line 3 (the middle line).",
        targetNote: "B4",
        clef: "treble",
        hint: '"Boy" marks the exact centre line of the treble staff (B4).',
      },
      {
        prompt: "Identify the note on Line 4.",
        targetNote: "D5",
        clef: "treble",
        hint: '"Does" gives us D5 on the fourth line.',
      },
      {
        prompt: "Identify the note on Line 5 (the top line).",
        targetNote: "F5",
        clef: "treble",
        hint: '"Fine" represents F5 on the topmost line of the treble staff.',
      },
    ],
  },
  {
    id: "ex-treble-spaces",
    title: "Exercise 2: Treble Spaces (F-A-C-E)",
    clef: "treble",
    level: "Beginner",
    description:
      'Master the four interior spaces of the treble staff, which spell the word "FACE" upward.',
    objective: "Instantly recognize the four interior space pitches F4, A4, C5, and E5.",
    steps: [
      {
        prompt: "Identify the pitch occupying Space 1 (the first space from the bottom).",
        targetNote: "F4",
        clef: "treble",
        hint: 'The first space begins the word "FACE" with F.',
      },
      {
        prompt: "Identify the pitch in Space 2 (the standard 440 Hz tuning note).",
        targetNote: "A4",
        clef: "treble",
        hint: 'The second letter in "FACE" is A (Concert A4).',
      },
      {
        prompt: "Identify the pitch in Space 3.",
        targetNote: "C5",
        clef: "treble",
        hint: 'Space 3 is C5 (one octave higher than Middle C).',
      },
      {
        prompt: "Identify the pitch occupying Space 4 (the top interior space).",
        targetNote: "E5",
        clef: "treble",
        hint: 'The final letter in "FACE" completes the spaces with E5.',
      },
    ],
  },
  {
    id: "ex-bass-lines",
    title: "Exercise 3: Bass Lines Mastery",
    clef: "bass",
    level: "Beginner",
    description:
      'Identify the five lines of the bass staff using "Good Boys Do Fine Always" (G, B, D, F, A).',
    objective: "Correctly locate and identify bass notes on lines 1 through 5.",
    steps: [
      {
        prompt: "Identify the note on Line 1 of the bass staff.",
        targetNote: "G2",
        clef: "bass",
        hint: '"Good" starts the bass staff on Line 1 with G2.',
      },
      {
        prompt: "Identify the note on Line 2 of the bass staff.",
        targetNote: "B2",
        clef: "bass",
        hint: '"Boys" gives us B2 on the second line.',
      },
      {
        prompt: "Identify the note on Line 3 (the middle line) of the bass staff.",
        targetNote: "D3",
        clef: "bass",
        hint: '"Do" occupies the middle line of the bass staff (D3).',
      },
      {
        prompt: "Identify the note on Line 4 (between the two dots of the F-clef).",
        targetNote: "F3",
        clef: "bass",
        hint: "The bass clef is the F-clef; its two dots enclose Line 4 (F3).",
      },
      {
        prompt: "Identify the note on Line 5 (the top line) of the bass staff.",
        targetNote: "A3",
        clef: "bass",
        hint: '"Always" completes the top line with A3.',
      },
    ],
  },
  {
    id: "ex-bass-spaces",
    title: "Exercise 4: Bass Spaces (All Cows Eat Grass)",
    clef: "bass",
    level: "Beginner",
    description:
      'Master the four spaces of the bass staff using "All Cows Eat Grass" (A, C, E, G).',
    objective: "Quickly read pitches located in the 4 spaces of the bass clef.",
    steps: [
      {
        prompt: "Identify the note in Space 1 of the bass staff.",
        targetNote: "A2",
        clef: "bass",
        hint: '"All" provides note A in Space 1.',
      },
      {
        prompt: "Identify the note in Space 2 of the bass staff.",
        targetNote: "C3",
        clef: "bass",
        hint: '"Cows" gives C3 in Space 2 (one octave below Middle C).',
      },
      {
        prompt: "Identify the note in Space 3 of the bass staff.",
        targetNote: "E3",
        clef: "bass",
        hint: '"Eat" provides E3 in Space 3.',
      },
      {
        prompt: "Identify the note in Space 4 (the top space) of the bass staff.",
        targetNote: "G3",
        clef: "bass",
        hint: '"Grass" gives G3 in Space 4.',
      },
    ],
  },
  {
    id: "ex-middle-c-ledgers",
    title: "Exercise 5: Middle C & Ledger Lines",
    clef: "treble",
    level: "Intermediate",
    description:
      "Explore how Middle C (C4) connects both clefs and practice reading notes beyond the five main lines.",
    objective: "Recognize Middle C on both clefs and ledger line notes A3, C4, A5, and C6.",
    steps: [
      {
        prompt: "Identify Middle C on the 1st ledger line below the treble staff.",
        targetNote: "C4",
        clef: "treble",
        hint: "One short line drawn below the treble staff anchors Middle C (C4).",
      },
      {
        prompt: "Identify Middle C on the 1st ledger line above the bass staff.",
        targetNote: "C4",
        clef: "bass",
        hint: "In bass clef, Middle C (C4) sits on the first ledger line above the staff.",
      },
      {
        prompt: "Identify the note sitting on the 1st ledger line above the treble staff.",
        targetNote: "A5",
        clef: "treble",
        hint: "The first line above the treble staff is A5 (880 Hz).",
      },
      {
        prompt: "Identify the note on the 1st ledger line below the bass staff.",
        targetNote: "E2",
        clef: "bass",
        hint: "The ledger line below Line 1 in bass clef is E2.",
      },
    ],
  },
  {
    id: "ex-accidentals",
    title: "Exercise 6: Sharps & Flats on the Staff",
    clef: "treble",
    level: "Intermediate",
    description:
      "Understand how accidentals (♯ and ♭) alter the pitch of a note by one half step (semitone).",
    objective: "Identify pitches modified by sharp and flat accidentals.",
    steps: [
      {
        prompt: "Identify this note: Space 1 on the treble staff raised by a sharp.",
        targetNote: "F#4",
        clef: "treble",
        hint: "Space 1 is F; with a sharp sign, it becomes F♯4.",
      },
      {
        prompt: "Identify this note: Line 3 on the treble staff lowered by a flat.",
        targetNote: "Bb4",
        clef: "treble",
        hint: "Line 3 is B; with a flat sign, it becomes B♭4.",
      },
      {
        prompt: "Identify this note: Line 4 on the bass staff raised by a sharp.",
        targetNote: "F#3",
        clef: "bass",
        hint: "Line 4 in bass clef is F; the sharp raises it to F♯3.",
      },
      {
        prompt: "Identify this note: Space 3 in bass clef lowered by a flat.",
        targetNote: "Eb3",
        clef: "bass",
        hint: "Space 3 in bass clef is E; the flat lowers it to E♭3.",
      },
    ],
  },
];


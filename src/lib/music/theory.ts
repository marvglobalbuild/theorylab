/**
 * Music theory primitives used by every demonstration on the site.
 * Pure functions only — no audio or DOM — so they can be unit tested.
 * Notes use scientific pitch notation: "C4" is middle C, "A4" is 440 Hz.
 */

export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type Accidental = "" | "#" | "b";

export interface ParsedNote {
  letter: Letter;
  accidental: Accidental;
  octave: number;
}

const LETTERS: Letter[] = ["C", "D", "E", "F", "G", "A", "B"];
const LETTER_SEMITONES: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function parseNote(name: string): ParsedNote {
  const trimmed = name.trim();
  const match = /^([A-G])\s*(#|b|♯|♭|n|♮|natural)?\s*(-?\d+)?$/i.exec(trimmed);
  if (!match) throw new Error(`Invalid note name: ${name}`);
  const letter = match[1]!.toUpperCase() as Letter;
  const rawAcc = (match[2] ?? "").toLowerCase();
  let accidental: Accidental = "";
  if (rawAcc === "#" || rawAcc === "♯") accidental = "#";
  else if (rawAcc === "b" || rawAcc === "♭") accidental = "b";
  const octave = match[3] !== undefined ? Number(match[3]) : 4;
  return {
    letter,
    accidental,
    octave,
  };
}

/** MIDI number: C4 = 60, A4 = 69. */
export function noteToMidi(name: string): number {
  const { letter, accidental, octave } = parseNote(name);
  const offset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;
  return (octave + 1) * 12 + LETTER_SEMITONES[letter] + offset;
}

export function midiToNote(midi: number, spelling: "sharp" | "flat" = "sharp"): string {
  const names = spelling === "sharp" ? SHARP_NAMES : FLAT_NAMES;
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Equal temperament, A4 = 440 Hz. */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteFrequency(name: string): number {
  return midiToFrequency(noteToMidi(name));
}

/** "C#4" -> "C♯4", "Bb3" -> "B♭3", "A natural 4" -> "A♮4" */
export function displayNote(name: string, withOctave = true): string {
  const trimmed = name.trim();
  const match = /^([A-G])\s*(#|b|♯|♭|n|♮|natural)?\s*(-?\d+)?$/i.exec(trimmed);
  if (!match) {
    return name;
  }
  const letter = match[1]!.toUpperCase();
  const rawAcc = (match[2] ?? "").toLowerCase();
  let symbol = "";
  if (rawAcc === "#" || rawAcc === "♯") symbol = "♯";
  else if (rawAcc === "b" || rawAcc === "♭") symbol = "♭";
  else if (rawAcc === "n" || rawAcc === "♮" || rawAcc === "natural") symbol = "♮";

  const octStr = withOctave && match[3] !== undefined ? match[3] : "";
  return `${letter}${symbol}${octStr}`;
}

/** The other common spelling of a black-key note, or null for natural notes. */
export function enharmonic(name: string): string | null {
  const { accidental } = parseNote(name);
  if (!accidental) return null;
  const midi = noteToMidi(name);
  return midiToNote(midi, accidental === "#" ? "flat" : "sharp");
}

/** VexFlow key format: "C#4" -> "c#/4" */
export function toVexKey(name: string): string {
  const { letter, accidental, octave } = parseNote(name);
  return `${letter.toLowerCase()}${accidental}/${octave}`;
}

export function isSameKey(a: string, b: string): boolean {
  return noteToMidi(a) === noteToMidi(b);
}

/** Generic interval number from letter names (C→E = 3, C→C an octave up = 8). */
export function genericInterval(lower: string, upper: string): number {
  const a = parseNote(lower);
  const b = parseNote(upper);
  const steps = LETTERS.indexOf(b.letter) - LETTERS.indexOf(a.letter) + (b.octave - a.octave) * 7;
  return steps + 1;
}

export function semitonesBetween(lower: string, upper: string): number {
  return noteToMidi(upper) - noteToMidi(lower);
}

/* ---------- Keyboard ---------- */

export interface KeyboardKey {
  note: string;
  isBlack: boolean;
  /** Computer-keyboard shortcut, when one exists. */
  shortcut?: string;
}

const SHORTCUTS: Record<string, string> = {
  C4: "a", "C#4": "w", D4: "s", "D#4": "e", E4: "d", F4: "f", "F#4": "t", G4: "g",
  "G#4": "y", A4: "h", "A#4": "u", B4: "j", C5: "k", "C#5": "o", D5: "l", "D#5": "p", E5: ";",
};

/** Two octaves plus the top C: C4–C6. */
export const KEYBOARD_KEYS: KeyboardKey[] = Array.from({ length: 25 }, (_, i) => {
  const note = midiToNote(60 + i);
  const shortcut = SHORTCUTS[note];
  return shortcut ? { note, isBlack: note.includes("#"), shortcut } : { note, isBlack: note.includes("#") };
});

export const SHORTCUT_TO_NOTE: Record<string, string> = Object.fromEntries(
  Object.entries(SHORTCUTS).map(([note, key]) => [key, note]),
);

/* ---------- Reading the staff ---------- */

export interface StaffReadingNote {
  note: string;
  position: string;
}

/** C major scale on the treble staff, with where each note sits. */
export const TREBLE_READING: StaffReadingNote[] = [
  { note: "C4", position: "Middle C, written on its own ledger line just below the staff." },
  { note: "D4", position: "Sits in the space just beneath the bottom line." },
  { note: "E4", position: "The bottom line of the treble staff." },
  { note: "F4", position: "The first space, between the bottom two lines." },
  { note: "G4", position: "The second line — the line the treble (G) clef curls around." },
  { note: "A4", position: "The second space. Orchestras tune to this pitch: 440 Hz." },
  { note: "B4", position: "The middle line of the staff." },
  { note: "C5", position: "The third space — one octave above middle C." },
];

/* ---------- Intervals ---------- */

export interface Interval {
  id: string;
  short: string;
  name: string;
  semitones: number;
  /** Generic size: 2 = second, 3 = third … 8 = octave */
  number: number;
  lower: string;
  upper: string;
  description: string;
}

export const INTERVALS: Interval[] = [
  { id: "m2", short: "m2", name: "Minor second", semitones: 1, number: 2, lower: "C4", upper: "Db4",
    description: "The smallest step in the major and minor scales. Sharply dissonant — the leading note rises to the tonic by this interval." },
  { id: "M2", short: "M2", name: "Major second", semitones: 2, number: 2, lower: "C4", upper: "D4",
    description: "A whole tone. The ordinary stepwise motion of most melodies, and the first step of the major scale." },
  { id: "m3", short: "m3", name: "Minor third", semitones: 3, number: 3, lower: "C4", upper: "Eb4",
    description: "The lower third of a minor triad. Much of the character of a minor key comes from this interval." },
  { id: "M3", short: "M3", name: "Major third", semitones: 4, number: 3, lower: "C4", upper: "E4",
    description: "The lower third of a major triad. Bright and consonant — the defining sound of a major chord." },
  { id: "P4", short: "P4", name: "Perfect fourth", semitones: 5, number: 4, lower: "C4", upper: "F4",
    description: "Consonant in melody, but treated as a dissonance above the bass in common-practice harmony." },
  { id: "A4", short: "A4", name: "Augmented fourth", semitones: 6, number: 4, lower: "C4", upper: "F#4",
    description: "The tritone: three whole tones. Spelled C–G♭ it becomes a diminished fifth. It sits between the third and seventh of every dominant seventh chord." },
  { id: "P5", short: "P5", name: "Perfect fifth", semitones: 7, number: 5, lower: "C4", upper: "G4",
    description: "Open and stable. The distance from the root to the fifth of every major and minor triad." },
  { id: "m6", short: "m6", name: "Minor sixth", semitones: 8, number: 6, lower: "C4", upper: "Ab4",
    description: "The inversion of a major third. Consonant, with a darker colour than its major counterpart." },
  { id: "M6", short: "M6", name: "Major sixth", semitones: 9, number: 6, lower: "C4", upper: "A4",
    description: "The inversion of a minor third. Warm and consonant, common in lyrical melodic leaps." },
  { id: "m7", short: "m7", name: "Minor seventh", semitones: 10, number: 7, lower: "C4", upper: "Bb4",
    description: "The seventh of a dominant seventh chord. Dissonant, and usually resolves downward by step." },
  { id: "M7", short: "M7", name: "Major seventh", semitones: 11, number: 7, lower: "C4", upper: "B4",
    description: "One semitone short of an octave. The seventh of a major seventh chord; strongly pulls upward." },
  { id: "P8", short: "P8", name: "Perfect octave", semitones: 12, number: 8, lower: "C4", upper: "C5",
    description: "The same letter name at double the frequency. The two notes blend so closely they can sound like one." },
];

export const ORDINALS: Record<number, string> = {
  1: "unison", 2: "second", 3: "third", 4: "fourth", 5: "fifth", 6: "sixth", 7: "seventh", 8: "octave",
};

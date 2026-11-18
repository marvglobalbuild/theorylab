import { describe, expect, it } from "vitest";

import {
  BASS_STAFF_NOTES,
  GUIDED_EXERCISES,
  NOTE_DURATIONS_CATALOG,
  NOTATION_PRESETS,
  TREBLE_STAFF_NOTES,
  displayNote,
  findNoteDefinition,
  generateRandomNoteQuestion,
  getStaffNotes,
  midiToFrequency,
  noteToMidi,
  parseNote,
} from "@/lib/music/notation-lab";

describe("Music Notation Lab Data Model & Pitch Mapping", () => {
  it("contains complete and verified note definitions for Treble Clef", () => {
    expect(TREBLE_STAFF_NOTES.length).toBeGreaterThanOrEqual(15);

    // Verify Middle C4
    const middleC = TREBLE_STAFF_NOTES.find((n) => n.note === "C4");
    expect(middleC).toBeDefined();
    expect(middleC?.clef).toBe("treble");
    expect(middleC?.midiNumber).toBe(60);
    expect(middleC?.positionDescription).toContain("ledger line");

    // Verify Treble clef landmark Line 2 (G4)
    const g4 = TREBLE_STAFF_NOTES.find((n) => n.note === "G4");
    expect(g4).toBeDefined();
    expect(g4?.positionDescription).toContain("Line 2");
    expect(g4?.mnemonic).toContain("G-Clef");

    // Verify Concert Pitch Space 2 (A4)
    const a4 = TREBLE_STAFF_NOTES.find((n) => n.note === "A4");
    expect(a4).toBeDefined();
    expect(a4?.positionDescription).toContain("Space 2");
    expect(a4?.frequencyHz).toBe(440);
  });

  it("contains complete and verified note definitions for Bass Clef", () => {
    expect(BASS_STAFF_NOTES.length).toBeGreaterThanOrEqual(15);

    // Verify Bass clef landmark Line 4 (F3)
    const f3 = BASS_STAFF_NOTES.find((n) => n.note === "F3");
    expect(f3).toBeDefined();
    expect(f3?.clef).toBe("bass");
    expect(f3?.positionDescription).toContain("Line 4");
    expect(f3?.mnemonic).toContain("Bass clef anchor");

    // Verify Middle C4 on Bass clef (ledger line above)
    const middleCInBass = BASS_STAFF_NOTES.find((n) => n.note === "C4");
    expect(middleCInBass).toBeDefined();
    expect(middleCInBass?.positionDescription).toContain("ledger line above");
  });

  it("accurately calculates MIDI numbers and acoustic frequencies", () => {
    // Concert A4
    expect(noteToMidi("A4")).toBe(69);
    expect(midiToFrequency(69)).toBe(440.0);

    // Middle C (C4)
    expect(noteToMidi("C4")).toBe(60);
    expect(midiToFrequency(60)).toBe(261.6);

    // A3
    expect(noteToMidi("A3")).toBe(57);
    expect(midiToFrequency(57)).toBe(220.0);

    // Accidentals: C#4 and Bb4
    expect(noteToMidi("C#4")).toBe(61);
    expect(noteToMidi("Bb4")).toBe(70);
  });

  it("defines comprehensive note durations and rests", () => {
    const ids = NOTE_DURATIONS_CATALOG.map((d) => d.id);

    // Must support whole, half, quarter, eighth, sixteenth notes
    expect(ids).toContain("w");
    expect(ids).toContain("h");
    expect(ids).toContain("q");
    expect(ids).toContain("8");
    expect(ids).toContain("16");

    // Must support corresponding rests
    expect(ids).toContain("wr");
    expect(ids).toContain("hr");
    expect(ids).toContain("qr");
    expect(ids).toContain("8r");
    expect(ids).toContain("16r");

    const quarter = NOTE_DURATIONS_CATALOG.find((d) => d.id === "q");
    expect(quarter?.beats).toBe(1);
    expect(quarter?.nameUk).toBe("Crotchet");

    const wholeRest = NOTE_DURATIONS_CATALOG.find((d) => d.id === "wr");
    expect(wholeRest?.beats).toBe(4);
    expect(wholeRest?.isRest).toBe(true);
  });

  it("filters notes accurately by clef and difficulty", () => {
    const beginnerTreble = getStaffNotes("treble", "beginner");
    expect(beginnerTreble.every((n) => n.difficulty === "beginner")).toBe(true);
    expect(beginnerTreble.some((n) => n.note.includes("#"))).toBe(false);

    const intermediateTreble = getStaffNotes("treble", "intermediate");
    expect(intermediateTreble.length).toBeGreaterThan(beginnerTreble.length);
    expect(intermediateTreble.some((n) => n.accidental === "sharp" || n.accidental === "flat")).toBe(true);
  });

  it("generates valid randomized note identification questions", () => {
    const q1 = generateRandomNoteQuestion("treble", "beginner");
    expect(q1.clef).toBe("treble");
    expect(q1.options).toContain(q1.targetNote.note);
    expect(q1.options.length).toBe(4);
    expect(q1.explanation).toContain(q1.targetNote.positionDescription);

    const q2 = generateRandomNoteQuestion("bass", "beginner");
    expect(q2.clef).toBe("bass");
    expect(q2.options).toContain(q2.targetNote.note);

    const q3 = generateRandomNoteQuestion("mixed", "intermediate");
    expect(["treble", "bass"]).toContain(q3.clef);
    expect(q3.options).toContain(q3.targetNote.note);
  });

  it("provides complete and educational guided practice exercises", () => {
    expect(GUIDED_EXERCISES.length).toBeGreaterThanOrEqual(6);

    for (const ex of GUIDED_EXERCISES) {
      expect(ex.id).toBeTruthy();
      expect(ex.title).toBeTruthy();
      expect(ex.steps.length).toBeGreaterThan(0);

      for (const step of ex.steps) {
        expect(step.prompt).toBeTruthy();
        expect(step.targetNote).toBeTruthy();
        expect(step.hint).toBeTruthy();
        expect(["treble", "bass"]).toContain(step.clef);
      }
    }
  });

  it("validates notation constructor presets", () => {
    expect(NOTATION_PRESETS.length).toBeGreaterThanOrEqual(4);

    for (const preset of NOTATION_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(["treble", "bass"]).toContain(preset.clef);
      expect(preset.chords.length).toBeGreaterThan(0);
      for (const chord of preset.chords) {
        expect(chord.duration).toBeTruthy();
      }
    }
  });

  it("findNoteDefinition returns the expected staff note", () => {
    const found = findNoteDefinition("G4", "treble");
    expect(found).toBeDefined();
    expect(found?.name).toBe("G");
    expect(found?.octave).toBe(4);

    const notFound = findNoteDefinition("Z9", "treble");
    expect(notFound).toBeUndefined();
  });

  it("formats notes and accidentals accurately across multiple octaves preserving original pitch and register", () => {
    // Regression check: Bb3 MUST render as B♭3, strictly preserving octave 3 (never B♭4)
    expect(displayNote("Bb3")).toBe("B♭3");
    expect(displayNote("Bb3", false)).toBe("B♭");

    // Regression check: C#4, F#5, Eb2
    expect(displayNote("C#4")).toBe("C♯4");
    expect(displayNote("F#5")).toBe("F♯5");
    expect(displayNote("Eb2")).toBe("E♭2");

    // Regression check: Natural notes and explicit natural format
    expect(displayNote("A natural 4")).toBe("A♮4");
    expect(displayNote("An4")).toBe("A♮4");
    expect(displayNote("A4")).toBe("A4");
    expect(displayNote("C natural 5")).toBe("C♮5");

    // Multiple octaves formatting check
    expect(displayNote("C1")).toBe("C1");
    expect(displayNote("F#2")).toBe("F♯2");
    expect(displayNote("Ab3")).toBe("A♭3");
    expect(displayNote("G#4")).toBe("G♯4");
    expect(displayNote("Db5")).toBe("D♭5");
    expect(displayNote("Bb6")).toBe("B♭6");
    expect(displayNote("D#7")).toBe("D♯7");

    // Verify MIDI and acoustic frequency accuracy
    expect(noteToMidi("Bb3")).toBe(58);
    expect(midiToFrequency(58)).toBe(233.1);

    expect(noteToMidi("C#4")).toBe(61);
    expect(midiToFrequency(61)).toBe(277.2);

    expect(noteToMidi("F#5")).toBe(78);
    expect(midiToFrequency(78)).toBe(740.0);

    expect(noteToMidi("Eb2")).toBe(39);
    expect(midiToFrequency(39)).toBe(77.8);

    expect(noteToMidi("A natural 4")).toBe(69);
    expect(midiToFrequency(69)).toBe(440.0);

    // Verify staff note positioning integrity in catalog
    const bb3Def = BASS_STAFF_NOTES.find((n) => n.note === "Bb3");
    expect(bb3Def).toBeDefined();
    expect(bb3Def?.octave).toBe(3);
    expect(bb3Def?.positionDescription).toContain("Line 5 with flat");
    expect(bb3Def?.midiNumber).toBe(58);
  });
});


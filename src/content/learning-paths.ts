export type LevelId = "beginner" | "elementary" | "intermediate" | "advanced";

export interface Topic {
  title: string;
  detail: string;
}

export interface LearningLevel {
  id: LevelId;
  numeral: string;
  name: string;
  summary: string;
  topics: Topic[];
}

export const LEVEL_IDS: LevelId[] = ["beginner", "elementary", "intermediate", "advanced"];

export const LEARNING_LEVELS: LearningLevel[] = [
  {
    id: "beginner",
    numeral: "I",
    name: "Beginner",
    summary: "Musical alphabet, staff, clefs, note values and basic rhythm.",
    topics: [
      { title: "The musical alphabet", detail: "Seven letter names, A to G, repeating in every octave." },
      { title: "The staff", detail: "Five lines and four spaces, read from the bottom upward." },
      { title: "Clefs", detail: "How the treble and bass clefs fix pitch on the staff." },
      { title: "Note values", detail: "Semibreve to semiquaver (whole to sixteenth note), and how durations relate." },
      { title: "Basic rhythm", detail: "Pulse, beat and counting in simple time." },
    ],
  },
  {
    id: "elementary",
    numeral: "II",
    name: "Elementary",
    summary: "Major and minor scales, intervals, key signatures and simple meters.",
    topics: [
      { title: "Major and minor scales", detail: "Tone and semitone patterns; natural, harmonic and melodic minor." },
      { title: "Intervals", detail: "Measuring the distance between two notes by number and quality." },
      { title: "Key signatures", detail: "The order of sharps and flats, and the circle of fifths." },
      { title: "Simple meters", detail: "2/4, 3/4 and 4/4 — how beats are grouped and accented." },
    ],
  },
  {
    id: "intermediate",
    numeral: "III",
    name: "Intermediate",
    summary: "Triads, inversions, seventh chords, harmony and chord progressions.",
    topics: [
      { title: "Triads", detail: "Major, minor, diminished and augmented, built in stacked thirds." },
      { title: "Inversions", detail: "Root position, first and second inversion, and figured-bass labels." },
      { title: "Seventh chords", detail: "Dominant, major, minor and half-diminished sevenths." },
      { title: "Harmony", detail: "Chord function — tonic, subdominant and dominant." },
      { title: "Chord progressions", detail: "Common patterns and how they give music a sense of direction." },
    ],
  },
  {
    id: "advanced",
    numeral: "IV",
    name: "Advanced",
    summary: "Advanced harmony, modulation, cadences, counterpoint and musical analysis.",
    topics: [
      { title: "Advanced harmony", detail: "Secondary dominants, the Neapolitan sixth and augmented sixth chords." },
      { title: "Modulation", detail: "Moving between keys through pivot chords and other techniques." },
      { title: "Cadences", detail: "Perfect, imperfect, plagal and interrupted cadences in context." },
      { title: "Counterpoint", detail: "Species counterpoint and writing independent melodic lines." },
      { title: "Musical analysis", detail: "Form, harmony and structure in real repertoire." },
    ],
  },
];

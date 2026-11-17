import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_2_SCALES: AcademyPathDefinition = {
  slug: "scales-and-tonality",
  numeral: "II",
  title: "Scales and Tonality",
  summary:
    "Construct major, natural, harmonic, and melodic minor scales, trace the circle of fifths, pair relative keys, and understand church modes.",
  level: "elementary",
  sortOrder: 2,
};

export const PATH_2_COURSES: AcademyCourseDefinition[] = [
  {
    slug: "major-and-minor-scale-construction",
    learningPathSlug: "scales-and-tonality",
    title: "Major & Minor Scale Systems",
    description:
      "Build major and all three forms of the minor scale cleanly by semitone–tone formulas, and hear their distinct leading-tone pull.",
    level: "elementary",
    sortOrder: 1,
    estimatedMinutes: 50,
  },
  {
    slug: "key-signatures-and-modality",
    learningPathSlug: "scales-and-tonality",
    title: "Key Signatures, Circle of Fifths & Modes",
    description:
      "Read any sharp or flat key signature in seconds, navigate relative major/minor keys, and explore diatonic modes.",
    level: "elementary",
    sortOrder: 2,
    estimatedMinutes: 45,
  },
];

export const PATH_2_MODULES: AcademyModuleDefinition[] = [
  {
    slug: "diatonic-scales-and-major",
    courseSlug: "major-and-minor-scale-construction",
    learningPathSlug: "scales-and-tonality",
    title: "Module 1 · Scale Degree Architecture & Major Scales",
    summary: "How step patterns establish tonal centres.",
    sortOrder: 1,
  },
  {
    slug: "three-forms-of-minor",
    courseSlug: "major-and-minor-scale-construction",
    learningPathSlug: "scales-and-tonality",
    title: "Module 2 · Natural, Harmonic & Melodic Minor",
    summary: "Compare all three classic minor colorations in theory and sound.",
    sortOrder: 2,
  },
  {
    slug: "keys-circle-and-modes",
    courseSlug: "key-signatures-and-modality",
    learningPathSlug: "scales-and-tonality",
    title: "Module 3 · Key Signatures, Relative Keys & Modes",
    summary: "Map every key around the circle of fifths and derive the seven modes.",
    sortOrder: 3,
  },
];

export const PATH_2_LESSONS: AcademyLessonContent[] = [
  {
    slug: "understanding-scales",
    title: "Understanding scales",
    summary:
      "Discover what turns a sequence of pitches into a tonal scale: tonic gravity, scale-degree names, and diatonic spelling.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "major-and-minor-scale-construction",
    moduleSlug: "diatonic-scales-and-major",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 1,
    objectives: [
      "Define a diatonic scale as a seven-note stepwise ladder spanning one octave.",
      "Learn classical scale-degree labels: Tonic, Supertonic, Mediant, Subdominant, Dominant, Submediant, Leading Tone.",
      "Spell scales alphabetically using each letter A–G once.",
    ],
    sections: [
      {
        id: "tonic-and-degrees",
        heading: "1. Tonal gravity and the seven scale degrees",
        body: [
          "The word scale comes from the Latin scala ('ladder'). Rather than random pitches, a diatonic scale organizes seven consecutive letter names around a central home note called the tonic (scale degree 1).",
          "In classical theory every degree plays an active tonal role: Dominant (5) projects outward stability; Leading Tone (7) leans strongly up into the Tonic (8/1); Subdominant (4) mirrors the fifth below the tonic.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4"], duration: "q" },
            { keys: ["D4"], duration: "q" },
            { keys: ["E4"], duration: "q" },
            { keys: ["F4"], duration: "q" },
            { keys: ["G4"], duration: "q" },
            { keys: ["A4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["C5"], duration: "q" },
          ],
          label: "C major diatonic scale rising across all seven unique letters to C5",
          caption: "Scale degrees 1–8: Tonic (C) up through Leading Tone (B) and octave Tonic (C).",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.35 },
          { notes: ["D4"], at: 0.38, duration: 0.35 },
          { notes: ["E4"], at: 0.76, duration: 0.35 },
          { notes: ["F4"], at: 1.14, duration: 0.35 },
          { notes: ["G4"], at: 1.52, duration: 0.35 },
          { notes: ["A4"], at: 1.9, duration: 0.35 },
          { notes: ["B4"], at: 2.28, duration: 0.45 },
          { notes: ["C5"], at: 2.75, duration: 0.85 },
        ],
        audioLabel: "Hear diatonic tension resolve on upper Tonic C5",
      },
    ],
    repertoireExample: {
      composer: "Wolfgang Amadeus Mozart",
      work: "Clarinet Concerto in A major, K. 622",
      barReference: "I. Allegro, opening scale figures",
      insight:
        "Mozart frequently sweeps cleanly across a full diatonic scale from dominant up to tonic so listeners immediately sense the home key.",
      audioSteps: [
        { notes: ["A4"], at: 0, duration: 0.35 },
        { notes: ["B4"], at: 0.38, duration: 0.35 },
        { notes: ["C#5"], at: 0.76, duration: 0.35 },
        { notes: ["D5"], at: 1.14, duration: 0.35 },
        { notes: ["E5"], at: 1.52, duration: 0.75 },
      ],
      audioLabel: "Hear rising A major diatonic pentachord",
    },
    workedExample: {
      title: "The golden spelling rule of diatonic scales",
      scenario: "Spell a seven-note scale starting on D without repeating any letter name.",
      steps: [
        "Write the seven distinct letters first: D – E – F – G – A – B – C – D.",
        "Never skip a letter or write two forms of the same letter (like F and F♯ in a single major scale).",
        "Adjust tones and semitones next using accidentals.",
      ],
      conclusion:
        "Every major and minor scale uses all seven letter names once before repeating the tonic.",
    },
    practiceActivities: [
      {
        id: "scales-q1",
        prompt: "What is the classical name for scale degree 5?",
        options: [
          { id: "mediant", label: "Mediant" },
          { id: "subdominant", label: "Subdominant" },
          { id: "dominant", label: "Dominant" },
          { id: "supertonic", label: "Supertonic" },
        ],
        correctOptionId: "dominant",
        explanation: "Degree 5 is the Dominant—second only to the Tonic (1) in harmonic pull.",
      },
    ],
    summaryText:
      "Diatonic scales arrange all seven unique letters into an asymmetric ladder of tones and semitones orbiting a central tonic.",
    keyTakeaways: [
      "Degree 1 = Tonic; Degree 4 = Subdominant; Degree 5 = Dominant; Degree 7 = Leading Tone.",
      "Always write one note per letter line/space before adjusting accidentals.",
    ],
  },
  {
    slug: "major-scales",
    title: "Major scales",
    summary:
      "Construct any major scale from the Whole–Whole–Half–Whole–Whole–Whole–Half (T–T–S–T–T–T–S) step formula.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "major-and-minor-scale-construction",
    moduleSlug: "diatonic-scales-and-major",
    level: "elementary",
    estimatedMinutes: 10,
    sortOrder: 2,
    objectives: [
      "Apply the major scale formula T–T–S–T–T–T–S starting from any pitch.",
      "Understand the two identical four-note tetrachords (T–T–S) joined by a tone.",
      "Build sharp major scales (G, D, A) and flat major scales (F, B♭).",
    ],
    sections: [
      {
        id: "major-formula",
        heading: "1. The T–T–S–T–T–T–S blueprint",
        body: [
          "The C major scale occurs naturally on white keys because its natural semitones E–F (degrees 3–4) and B–C (degrees 7–8) match the exact major pattern: Tone – Tone – Semitone – Tone – Tone – Tone – Semitone.",
          "Notice its symmetry: C–D–E–F (T–T–S) and G–A–B–C (T–T–S) are two identical four-note tetrachords connected by a central whole tone (F–G).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["G4"], duration: "q" },
            { keys: ["A4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["C5"], duration: "q" },
            { keys: ["D5"], duration: "q" },
            { keys: ["E5"], duration: "q" },
            { keys: ["F#5"], duration: "q" },
            { keys: ["G5"], duration: "q" },
          ],
          label: "G major scale rising G4 to G5 requiring F-sharp on degree 7",
          caption:
            "G Major requires F♯ on degree 7 so E–F♯ (tone) and F♯–G (semitone) preserve T–T–S–T–T–T–S.",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 0.35 },
          { notes: ["A4"], at: 0.36, duration: 0.35 },
          { notes: ["B4"], at: 0.72, duration: 0.35 },
          { notes: ["C5"], at: 1.08, duration: 0.35 },
          { notes: ["D5"], at: 1.44, duration: 0.35 },
          { notes: ["E5"], at: 1.8, duration: 0.35 },
          { notes: ["F#5"], at: 2.16, duration: 0.42 },
          { notes: ["G5"], at: 2.6, duration: 0.8 },
        ],
        audioLabel: "Hear G Major scale (with F♯ leading tone)",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Symphony No. 9, IV ('Ode to Joy' theme)",
      barReference: "Bars 92–99",
      insight:
        "The 'Ode to Joy' theme stays exclusively inside the first five notes of D major (F♯4–G4–A4–D4), demonstrating the luminous stability of the major tetrachord.",
      audioSteps: [
        { notes: ["F#4"], at: 0, duration: 0.35 },
        { notes: ["F#4"], at: 0.38, duration: 0.35 },
        { notes: ["G4"], at: 0.76, duration: 0.35 },
        { notes: ["A4"], at: 1.14, duration: 0.35 },
        { notes: ["A4"], at: 1.52, duration: 0.35 },
        { notes: ["G4"], at: 1.9, duration: 0.35 },
        { notes: ["F#4"], at: 2.28, duration: 0.35 },
        { notes: ["E4"], at: 2.66, duration: 0.35 },
        { notes: ["D4"], at: 3.04, duration: 0.75 },
      ],
      audioLabel: "Hear D major pentachord in 'Ode to Joy'",
    },
    workedExample: {
      title: "Building F Major from the formula",
      scenario: "Apply T–T–S–T–T–T–S starting from F4.",
      steps: [
        "1 to 2 (T): F → G.",
        "2 to 3 (T): G → A.",
        "3 to 4 (S): A → B♭ (must be B♭ rather than A♯ so every letter F–G–A–B appears once!).",
        "4 to 5 (T): B♭ → C; 5 to 6 (T): C → D; 6 to 7 (T): D → E; 7 to 8 (S): E → F.",
      ],
      conclusion: "F Major contains one flat: B♭ (F–G–A–B♭–C–D–E–F).",
    },
    practiceActivities: [
      {
        id: "major-q1",
        prompt: "Which two sharps are required to build a D Major scale?",
        options: [
          { id: "fc", label: "F♯ and C♯" },
          { id: "fg", label: "F♯ and G♯" },
          { id: "bc", label: "B♯ and C♯" },
          { id: "cf", label: "F♯ and D♯" },
        ],
        correctOptionId: "fc",
        explanation:
          "Starting on D: D–E(T)–F♯(T)–G(S)–A(T)–B(T)–C♯(T)–D(S). F♯ maintains the 3rd and C♯ creates the leading-tone semitone to D.",
      },
    ],
    summaryText:
      "All twelve major scales share one invariant interval spacing: Tone–Tone–Semitone–Tone–Tone–Tone–Semitone.",
    keyTakeaways: [
      "Semitones in every major scale fall between degrees 3–4 and 7–8.",
      "Always preserve sequential letters—thus F major uses B♭, never A♯.",
    ],
  },
  {
    slug: "natural-minor-scales",
    title: "Natural minor scales",
    summary:
      "Hear how lowering degrees 3, 6, and 7 transforms major warmth into the aeolian color of natural minor (T–S–T–T–S–T–T).",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "major-and-minor-scale-construction",
    moduleSlug: "diatonic-scales-and-major",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 3,
    objectives: [
      "Derive A natural minor cleanly on white keys: A–B–C–D–E–F–G–A.",
      "Construct natural minor scales using Tone–Semitone–Tone–Tone–Semitone–Tone–Tone.",
      "Compare parallel major vs. parallel minor (e.g., C major vs. C natural minor: ♭3, ♭6, ♭7).",
    ],
    sections: [
      {
        id: "aeolian-pattern",
        heading: "1. Lowered 3rd, 6th, and 7th degrees",
        body: [
          "The natural minor scale follows the pattern T–S–T–T–S–T–T, placing its semitones between degrees 2–3 and 5–6. A natural minor uses only the piano white keys from A to A.",
          "Compared against a parallel major scale sharing the same tonic, natural minor flattens degrees 3, 6, and 7—producing a darker minor third at the bottom and a gentler whole-step subtonic (7 to 8) at the top.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["A4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["C5"], duration: "q" },
            { keys: ["D5"], duration: "q" },
            { keys: ["E5"], duration: "q" },
            { keys: ["F5"], duration: "q" },
            { keys: ["G5"], duration: "q" },
            { keys: ["A5"], duration: "q" },
          ],
          label: "A natural minor scale rising across white keys A4 to A5",
          caption: "A Natural Minor: semitones sit cleanly between B–C (2–3) and E–F (5–6).",
        },
        audioSteps: [
          { notes: ["A4"], at: 0, duration: 0.35 },
          { notes: ["B4"], at: 0.36, duration: 0.35 },
          { notes: ["C5"], at: 0.72, duration: 0.35 },
          { notes: ["D5"], at: 1.08, duration: 0.35 },
          { notes: ["E5"], at: 1.44, duration: 0.35 },
          { notes: ["F5"], at: 1.8, duration: 0.35 },
          { notes: ["G5"], at: 2.16, duration: 0.42 },
          { notes: ["A5"], at: 2.6, duration: 0.8 },
        ],
        audioLabel: "Hear A natural minor scale",
      },
    ],
    repertoireExample: {
      composer: "Ralph Vaughan Williams / English folk tradition",
      work: "Fantasia on 'Greensleeves'",
      barReference: "Opening theme",
      insight:
        "Natural minor melodies frequently savor the unraised subtonic (♭7) descending from A to G without the sharp classical leading tone.",
      audioSteps: [
        { notes: ["A4"], at: 0, duration: 0.35 },
        { notes: ["C5"], at: 0.38, duration: 0.65 },
        { notes: ["D5"], at: 1.05, duration: 0.35 },
        { notes: ["E5"], at: 1.42, duration: 0.55 },
        { notes: ["F5"], at: 1.98, duration: 0.25 },
        { notes: ["E5"], at: 2.25, duration: 0.35 },
        { notes: ["D5"], at: 2.62, duration: 0.65 },
        { notes: ["B4"], at: 3.28, duration: 0.35 },
        { notes: ["G4"], at: 3.65, duration: 0.65 },
      ],
      audioLabel: "Hear natural minor subtonic color (G4 beneath A)",
    },
    workedExample: {
      title: "Transforming C Major into C Natural Minor",
      scenario: "Lower degrees 3, 6, and 7 of C major by one semitone.",
      steps: [
        "C major = C – D – E – F – G – A – B – C.",
        "Lower degree 3 (E → E♭), degree 6 (A → A♭), and degree 7 (B → B♭).",
      ],
      conclusion:
        "C natural minor = C – D – E♭ – F – G – A♭ – B♭ – C (matching E♭ major's three flats).",
    },
    practiceActivities: [
      {
        id: "natminor-q1",
        prompt: "Between which scale degrees do the semitones fall in every natural minor scale?",
        options: [
          { id: "34-78", label: "3–4 and 7–8" },
          { id: "23-56", label: "2–3 and 5–6" },
          { id: "23-78", label: "2–3 and 7–8" },
          { id: "12-45", label: "1–2 and 4–5" },
        ],
        correctOptionId: "23-56",
        explanation: "The natural minor pattern T–S–T–T–S–T–T puts semitones at 2–3 and 5–6.",
      },
    ],
    summaryText:
      "Natural minor lowers degrees 3, 6, and 7 relative to major, creating semitones at 2–3 and 5–6 and a whole-tone subtonic at 7–8.",
    keyTakeaways: [
      "Natural minor formula = T–S–T–T–S–T–T.",
      "Subtonic 7 lies a whole tone below the tonic, yielding a modal/folk character.",
    ],
  },
  {
    slug: "harmonic-minor-scales",
    title: "Harmonic minor scales",
    summary:
      "Raise the seventh degree by a semitone to restore the leading-tone pull toward the tonic and create a major dominant V chord.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "major-and-minor-scale-construction",
    moduleSlug: "three-forms-of-minor",
    level: "elementary",
    estimatedMinutes: 9,
    sortOrder: 4,
    objectives: [
      "Raise scale degree 7 of a natural minor scale to create harmonic minor.",
      "Identify the distinctive 3-semitone (augmented 2nd) leap between degrees 6 and ♯7.",
      "Understand why classical composers alter degree 7 for dominant harmony.",
    ],
    sections: [
      {
        id: "raised-seventh",
        heading: "1. Restoring the leading tone for V → i cadences",
        body: [
          "In natural minor, the seventh degree sits a whole tone below the tonic, making the fifth chord minor (v) and softening cadential pull. Classical harmony therefore raises degree 7 by a semitone, producing the Harmonic Minor scale: A–B–C–D–E–F–G♯–A.",
          "That raised G♯ turns E–G–B into a bright E major triad (V) that drives resolutely into A minor (i), while simultaneously opening an exotic three-semitone gap—an augmented second—between F (6) and G♯ (♯7).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["A4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["C5"], duration: "q" },
            { keys: ["D5"], duration: "q" },
            { keys: ["E5"], duration: "q" },
            { keys: ["F5"], duration: "q" },
            { keys: ["G#5"], duration: "q" },
            { keys: ["A5"], duration: "q" },
          ],
          label: "A harmonic minor scale highlighting raised G-sharp 5 before A5",
          caption: "A Harmonic Minor: notice the augmented second jump from F5 to G♯5.",
        },
        audioSteps: [
          { notes: ["A4"], at: 0, duration: 0.35 },
          { notes: ["B4"], at: 0.36, duration: 0.35 },
          { notes: ["C5"], at: 0.72, duration: 0.35 },
          { notes: ["D5"], at: 1.08, duration: 0.35 },
          { notes: ["E5"], at: 1.44, duration: 0.35 },
          { notes: ["F5"], at: 1.8, duration: 0.45 },
          { notes: ["G#5"], at: 2.28, duration: 0.55 },
          { notes: ["A5"], at: 2.86, duration: 0.85 },
        ],
        audioLabel: "Hear A harmonic minor scale with F–G♯ interval",
      },
    ],
    repertoireExample: {
      composer: "Wolfgang Amadeus Mozart",
      work: "Symphony No. 40 in G minor, K. 550",
      barReference: "I. Molto allegro, cadential bars",
      insight:
        "While Mozart's key signature carries only two flats (B♭, E♭), cadences throughout the opening movement shine with accidental F♯s—the hallmark of G harmonic minor.",
      audioSteps: [
        { notes: ["D4", "F#4", "A4", "C5"], at: 0, duration: 0.9 },
        { notes: ["G4", "Bb4", "D5"], at: 0.95, duration: 1.1 },
      ],
      audioLabel: "Hear G harmonic minor V7 (D–F♯–A–C) resolving to G minor",
    },
    workedExample: {
      title: "Raising a flat seventh in D Minor",
      scenario: "Construct D harmonic minor starting from D natural minor (one flat: B♭).",
      steps: [
        "D natural minor: D – E – F – G – A – B♭ – C – D.",
        "Raise degree 7 (C) by one semitone using a sharp: C♯.",
      ],
      conclusion:
        "D harmonic minor = D – E – F – G – A – B♭ – C♯ – D (leaving key signature 1♭, adding C♯ as an accidental).",
    },
    practiceActivities: [
      {
        id: "harminor-q1",
        prompt: "What interval separates scale degrees 6 and 7 in a harmonic minor scale?",
        options: [
          { id: "m2", label: "Minor second (1 semitone)" },
          { id: "M2", label: "Major second (2 semitones)" },
          { id: "A2", label: "Augmented second (3 semitones)" },
          { id: "P4", label: "Perfect fourth (5 semitones)" },
        ],
        correctOptionId: "A2",
        explanation:
          "Because degree 6 remains natural minor while degree 7 is raised a semitone (e.g. F to G♯), the span widens to 3 semitones (an augmented 2nd).",
      },
    ],
    summaryText:
      "Harmonic minor raises degree 7 of natural minor to generate a true leading tone and major V chord, creating a 3-semitone leap between 6 and ♯7.",
    keyTakeaways: [
      "Harmonic minor = natural minor with raised ♯7.",
      "Produces a strong leading-tone semitone (♯7 → 8) and major dominant triad (V).",
      "Contains an augmented 2nd between degrees 6 and ♯7.",
    ],
  },
  {
    slug: "melodic-minor-scales",
    title: "Melodic minor scales",
    summary:
      "Smooth the awkward augmented-second gap when ascending by raising both degrees 6 and 7, then return naturally on the descent.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "major-and-minor-scale-construction",
    moduleSlug: "three-forms-of-minor",
    level: "elementary",
    estimatedMinutes: 9,
    sortOrder: 5,
    objectives: [
      "Construct ascending melodic minor by raising both degree 6 and degree 7.",
      "Construct classical descending melodic minor by lowering 6 and 7 back to the key signature.",
      "Hear how ascending melodic minor pairs a minor lower half with a major upper half.",
    ],
    sections: [
      {
        id: "melodic-ascent-descent",
        heading: "1. Smoothing melodic lines upward and downward",
        body: [
          "To keep vocal and instrumental melodies flowing smoothly toward the tonic without the wide augmented-second leap of harmonic minor, classical composers raise degree 6 alongside degree 7 on the way UP (A–B–C–D–E–F♯–G♯–A).",
          "Once past the tonic and descending downward, the pull of the leading tone fades; therefore classical melodic minor cancels both alterations on the way DOWN (A–G♮–F♮–E–D–C–B–A), identical to natural minor.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["E5"], duration: "q" },
            { keys: ["F#5"], duration: "q" },
            { keys: ["G#5"], duration: "q" },
            { keys: ["A5"], duration: "h" },
            { keys: ["G5"], duration: "q" },
            { keys: ["F5"], duration: "q" },
            { keys: ["E5"], duration: "q" },
          ],
          label:
            "Upper tetrachord of A melodic minor ascending F-sharp G-sharp A and descending G-natural F-natural E",
          caption:
            "Upper half of A Melodic Minor: raised ♯6–♯7 ascending (F♯–G♯–A), natural ♮7–♮6 descending (G♮–F♮–E).",
        },
        audioSteps: [
          { notes: ["E5"], at: 0, duration: 0.35 },
          { notes: ["F#5"], at: 0.36, duration: 0.35 },
          { notes: ["G#5"], at: 0.72, duration: 0.35 },
          { notes: ["A5"], at: 1.08, duration: 0.65 },
          { notes: ["G5"], at: 1.8, duration: 0.35 },
          { notes: ["F5"], at: 2.16, duration: 0.35 },
          { notes: ["E5"], at: 2.52, duration: 0.75 },
        ],
        audioLabel: "Hear melodic minor upper tetrachord up & down",
      },
    ],
    repertoireExample: {
      composer: "Johann Sebastian Bach",
      work: "Bourrée in E minor, BWV 996",
      barReference: "Pickup & bar 1–2",
      insight:
        "Bach uses C♯ and D♯ smoothly pushing up to E in rising lines, yet writes D♮ and C♮ immediately when melodies sweep downward.",
      audioSteps: [
        { notes: ["B4"], at: 0, duration: 0.3 },
        { notes: ["C#5"], at: 0.32, duration: 0.3 },
        { notes: ["D#5"], at: 0.64, duration: 0.3 },
        { notes: ["E5"], at: 0.96, duration: 0.55 },
        { notes: ["D5"], at: 1.55, duration: 0.3 },
        { notes: ["C5"], at: 1.87, duration: 0.3 },
        { notes: ["B4"], at: 2.19, duration: 0.65 },
      ],
      audioLabel: "Hear E melodic minor rising then falling",
    },
    workedExample: {
      title: "Applying natural signs to C Melodic Minor",
      scenario: "Spell C melodic minor ascending (starting from C natural minor: E♭, A♭, B♭).",
      steps: [
        "Recall C natural minor has 3 flats: E♭, A♭, B♭.",
        "To raise A♭ and B♭ by one semitone ascending, you do NOT add sharps—you write naturals (A♮, B♮)!",
        "Ascending: C–D–E♭–F–G–A♮–B♮–C. Descending: C–B♭–A♭–G–F–E♭–D–C.",
      ],
      conclusion: "Raising a flatted scale degree requires a natural (♮), not a sharp!",
    },
    practiceActivities: [
      {
        id: "melminor-q1",
        prompt:
          "Which pitches alter the natural minor scale ascending in G melodic minor (key signature B♭, E♭)?",
        options: [
          { id: "ef", label: "E♮ and F♯" },
          { id: "eb", label: "E♭ and F♯" },
          { id: "esfs", label: "E♯ and F♯" },
          { id: "enfn", label: "E♮ and F♮" },
        ],
        correctOptionId: "ef",
        explanation:
          "Degree 6 is E♭ (raised to E♮) and degree 7 is F♮ (raised to F♯). Descending reverts to F♮ and E♭.",
      },
    ],
    summaryText:
      "Melodic minor raises degrees 6 and 7 on the ascent for smooth scalar motion and reverts to natural minor on the descent.",
    keyTakeaways: [
      "Ascending melodic minor differs from Major only on its minor 3rd (♭3).",
      "Classical descending melodic minor equals natural minor.",
      "Always raise flats using naturals (♮), never double-spelling letters.",
    ],
  },
  {
    slug: "key-signatures",
    title: "Key signatures",
    summary:
      "Memorize the exact order of sharps and flats and read any major key signature in under two seconds.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "key-signatures-and-modality",
    moduleSlug: "keys-circle-and-modes",
    level: "elementary",
    estimatedMinutes: 9,
    sortOrder: 6,
    objectives: [
      "Recite the exact sharp order (F–C–G–D–A–E–B) and reversed flat order (B–E–A–D–G–C–F).",
      "Identify any sharp major key from its rightmost sharp (up 1 semitone).",
      "Identify any flat major key from its second-to-last flat.",
    ],
    sections: [
      {
        id: "order-of-sharps-flats",
        heading: "1. Fixed order & fast key decoding",
        body: [
          "Rather than printing sharps and flats repeatedly before individual notes, notation collects all standard scale accidentals at the start of every line into a Key Signature. They ALWAYS appear in a single strict order:",
          "Order of Sharps: F♯ – C♯ – G♯ – D♯ – A♯ – E♯ – B♯. Order of Flats (exact mirror reversal): B♭ – E♭ – A♭ – D♭ – G♭ – C♭ – F♭.",
          "Two shortcuts read any major signature immediately: for SHARP keys, go one semitone (one letter step) ABOVE the LAST sharp (e.g., F♯, C♯ → D Major). For FLAT keys with 2+ flats, read the PENULTIMATE (second-to-last) flat (e.g., B♭, E♭, A♭ → E♭ Major; remember F Major has 1 flat, B♭).",
        ],
        notation: {
          clef: "treble",
          keySignature: "D",
          chords: [
            { keys: ["D4"], duration: "q" },
            { keys: ["F#4"], duration: "q" },
            { keys: ["A4"], duration: "q" },
            { keys: ["D5"], duration: "q" },
          ],
          label: "D major key signature (F-sharp and C-sharp) with D major tonic arpeggio",
          caption:
            "Two sharps (F♯, C♯): the last sharp C♯ points straight up one semitone to D Major.",
        },
        audioSteps: [
          { notes: ["D4"], at: 0, duration: 0.35 },
          { notes: ["F#4"], at: 0.38, duration: 0.35 },
          { notes: ["A4"], at: 0.76, duration: 0.35 },
          { notes: ["D5"], at: 1.14, duration: 0.8 },
        ],
        audioLabel: "Hear D major arpeggio",
      },
    ],
    repertoireExample: {
      composer: "Frédéric Chopin",
      work: "Ballade No. 1 in G minor, Op. 23",
      barReference: "Key signature across score",
      insight:
        "Even when melodies travel through dramatic accidentals, the two-flat key signature silently reminds every reader throughout the page that B and E default to B♭ and E♭.",
      audioSteps: [
        { notes: ["Bb3"], at: 0, duration: 0.4 },
        { notes: ["D4"], at: 0.42, duration: 0.4 },
        { notes: ["Eb4"], at: 0.84, duration: 0.4 },
        { notes: ["F4"], at: 1.26, duration: 0.75 },
      ],
      audioLabel: "Hear two-flat diatonic tone color",
    },
    workedExample: {
      title: "Decoding four sharps vs. four flats",
      scenario: "Identify the major key containing (a) 4 sharps and (b) 4 flats.",
      steps: [
        "(a) Four sharps = F♯, C♯, G♯, D♯. Last sharp = D♯. One semitone higher = E Major.",
        "(b) Four flats = B♭, E♭, A♭, D♭. Second-to-last flat = A♭. Key = A♭ Major.",
      ],
      conclusion: "4 sharps = E Major; 4 flats = A♭ Major.",
    },
    practiceActivities: [
      {
        id: "keysig-q1",
        prompt: "Which Major key carries the three flats B♭, E♭, and A♭?",
        options: [
          { id: "ab", label: "A♭ Major" },
          { id: "eb", label: "E♭ Major" },
          { id: "bb", label: "B♭ Major" },
          { id: "f", label: "F Major" },
        ],
        correctOptionId: "eb",
        explanation:
          "Using the penultimate-flat rule for B♭, E♭, A♭, the second-to-last flat is E♭ → E♭ Major.",
      },
    ],
    summaryText:
      "Key signatures place sharps (FCGDAEB) or flats (BEADGCF) at the clef to govern all octaves automatically.",
    keyTakeaways: [
      "Sharp keys: semitone above final sharp = Major tonic.",
      "Flat keys (2+): second-to-last flat = Major tonic (1 flat = F Major).",
    ],
  },
  {
    slug: "circle-of-fifths",
    title: "Circle of fifths",
    summary:
      "See all twelve major and minor keys arranged on a harmonic compass where every step adds one sharp clockwise or one flat counterclockwise.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "key-signatures-and-modality",
    moduleSlug: "keys-circle-and-modes",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 7,
    objectives: [
      "Step clockwise in ascending perfect fifths (C → G → D → A → E → B → F♯) adding one sharp each step.",
      "Step counterclockwise in descending fifths / ascending fourths (C → F → B♭ → E♭ → A♭ → D♭ → G♭) adding one flat.",
      "Recognize enharmonic keys overlapping at the bottom (B/C♭, F♯/G♭, C♯/D♭).",
    ],
    sections: [
      {
        id: "clock-of-keys",
        heading: "1. The 12-hour compass of closely related keys",
        body: [
          "Starting at 12 o'clock with C major / A minor (0 sharps, 0 flats), moving clockwise by a perfect fifth each hour introduces exactly one new sharp: G (1♯), D (2♯), A (3♯), E (4♯), B (5♯), F♯ (6♯).",
          "Moving counterclockwise from C by a perfect fourth (down a fifth) adds one flat each step: F (1♭), B♭ (2♭), E♭ (3♭), A♭ (4♭), D♭ (5♭), G♭ (6♭). Neighbours on the circle share six of their seven scale tones—explaining why classical sonatas modulate first to the Dominant (one hour clockwise) or Subdominant (one hour counterclockwise)!",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4"], duration: "q" },
            { keys: ["G4"], duration: "q" },
            { keys: ["D5"], duration: "q" },
            { keys: ["A4"], duration: "q" },
          ],
          label: "Chain of fifths: C4 up to G4, D5, and A4",
          caption: "Stepping clockwise around the Circle: C (0♯) → G (1♯) → D (2♯) → A (3♯).",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.45 },
          { notes: ["G4"], at: 0.48, duration: 0.45 },
          { notes: ["D5"], at: 0.96, duration: 0.45 },
          { notes: ["A4"], at: 1.44, duration: 0.75 },
        ],
        audioLabel: "Hear fifths C → G → D → A",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Piano Sonata No. 21 in C major ('Waldstein'), Op. 53",
      barReference: "Second-theme harmonic transitions & circle sequences",
      insight:
        "Baroque and Classical sequences walk chord roots counterclockwise around fifths (E → A → D → G → C), producing effortless forward harmonic momentum.",
      audioSteps: [
        { notes: ["E4", "G4", "B4"], at: 0, duration: 0.45 },
        { notes: ["A3", "E4", "A4"], at: 0.48, duration: 0.45 },
        { notes: ["D4", "F4", "A4"], at: 0.96, duration: 0.45 },
        { notes: ["G3", "D4", "G4"], at: 1.44, duration: 0.45 },
        { notes: ["C4", "E4", "G4"], at: 1.92, duration: 0.9 },
      ],
      audioLabel: "Hear circle-of-fifths sequence back to C",
    },
    workedExample: {
      title: "Finding how many sharps belong to E Major via fifths",
      scenario: "Count clockwise steps from C Major to E Major.",
      steps: [
        "C = 0 sharps.",
        "G = 1, D = 2, A = 3, E = 4.",
        "The first four sharps in F–C–G–D–A–E–B order are F♯, C♯, G♯, D♯.",
      ],
      conclusion: "E Major sits at 4 o'clock with four sharps (F♯, C♯, G♯, D♯).",
    },
    practiceActivities: [
      {
        id: "circle-q1",
        prompt: "Moving clockwise one step from D Major (2 sharps) reaches which key signature?",
        options: [
          { id: "g", label: "G Major (1 sharp)" },
          { id: "a", label: "A Major (3 sharps)" },
          { id: "e", label: "E Major (4 sharps)" },
          { id: "f", label: "F Major (1 flat)" },
        ],
        correctOptionId: "a",
        explanation: "A perfect fifth above D is A, adding C♯→G♯ for 3 sharps (A Major).",
      },
    ],
    summaryText:
      "The circle of fifths maps tonal proximity cleanly: adjacent keys differ by a single accidental, making it essential for modulation and key recall.",
    keyTakeaways: [
      "Clockwise (+P5) adds sharps; counterclockwise (−P5 / +P4) adds flats.",
      "6 o'clock overlaps enharmonically at F♯ Major (6♯) and G♭ Major (6♭).",
    ],
  },
  {
    slug: "relative-major-and-minor-keys",
    title: "Relative major and minor keys",
    summary:
      "Pair every major key with its relative minor sharing the exact same key signature, spaced three semitones (a minor third) apart.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "key-signatures-and-modality",
    moduleSlug: "keys-circle-and-modes",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 8,
    objectives: [
      "Find the relative minor three semitones (minor third / degree 6) below any major tonic.",
      "Distinguish RELATIVE keys (same key signature, different tonic) from PARALLEL keys (same tonic, different signature).",
      "Inspect melody and bass harmony to tell whether a piece uses a major key or its relative minor.",
    ],
    sections: [
      {
        id: "relative-vs-parallel",
        heading: "1. Shared signature, different tonal home",
        body: [
          "C major and A natural minor share the exact same collection of seven pitches (no sharps, no flats), making them Relative Keys. From any Major tonic, step down a minor third (3 semitones / to scale degree 6) to find its relative minor.",
          "Don't confuse Relative with Parallel: C Major and C Minor share the tonic C (parallel), whereas C Major and A Minor share the key signature (relative). When reading music, always check the closing bass note and final chord—and watch for a raised leading tone like G♯ confirming A minor!",
        ],
        notation: {
          clef: "treble",
          keySignature: "F",
          chords: [
            { keys: ["F4", "A4", "C5"], duration: "h" },
            { keys: ["D4", "F4", "A4"], duration: "h" },
          ],
          label: "F major triad alongside its relative D minor triad under one-flat signature",
          caption: "F Major (F–A–C) and D Minor (D–F–A) share the one-flat signature (B♭).",
        },
        audioSteps: [
          { notes: ["F4", "A4", "C5"], at: 0, duration: 0.9 },
          { notes: ["D4", "F4", "A4"], at: 1.0, duration: 1.0 },
        ],
        audioLabel: "Compare F Major and relative D Minor tonics",
      },
    ],
    repertoireExample: {
      composer: "Franz Schubert",
      work: "Moment Musical No. 3 in F minor, D. 780",
      barReference: "Bars 1–16 vs. contrasting passage in A♭ major",
      insight:
        "Pieces in a minor key routinely brighten mid-phrase by touching their relative major (here A♭ major beneath 4 flats) without changing key signature.",
      audioSteps: [
        { notes: ["F4", "Ab4", "C5"], at: 0, duration: 0.75 },
        { notes: ["Eb4", "G4", "Bb4"], at: 0.8, duration: 0.55 },
        { notes: ["Ab4", "C5", "Eb5"], at: 1.4, duration: 1.0 },
      ],
      audioLabel: "Hear F minor brightening to relative A♭ major",
    },
    workedExample: {
      title: "Finding the relative minor of E♭ Major (3 flats)",
      scenario: "Determine which minor key shares the B♭–E♭–A♭ key signature.",
      steps: [
        "Method A (down a minor third): E♭ → D (1) → C♯/D♭ (2) → C (3). Correct letter name two steps down from E is C.",
        "Method B (scale degree 6): Count E♭(1)–F(2)–G(3)–A♭(4)–B♭(5)–C(6).",
      ],
      conclusion: "The relative minor of E♭ Major is C Minor.",
    },
    practiceActivities: [
      {
        id: "relkeys-q1",
        prompt:
          "A piece has a one-sharp (F♯) key signature and repeatedly lands on E–G–B chords with occasional D♯ leading tones. What key is it in?",
        options: [
          { id: "gmaj", label: "G Major" },
          { id: "emin", label: "E Minor" },
          { id: "dmin", label: "D Minor" },
          { id: "bmaj", label: "B Major" },
        ],
        correctOptionId: "emin",
        explanation:
          "One sharp belongs to G Major and its relative minor, E Minor. Ending on E–G–B with raised D♯ leading tones proves E Minor.",
      },
    ],
    summaryText:
      "Every key signature belongs jointly to a Major key and its Relative Minor perched a minor third (degree 6) below.",
    keyTakeaways: [
      "Major down 3 semitones (a minor 3rd) = Relative Minor.",
      "Check final bass note and presence of raised ♯7 accidentals to confirm minor vs. major.",
    ],
  },
  {
    slug: "modes-and-tonal-relationships",
    title: "Modes and tonal relationships",
    summary:
      "Explore the seven diatonic church modes—Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian—and their signature inflections.",
    learningPathSlug: "scales-and-tonality",
    courseSlug: "key-signatures-and-modality",
    moduleSlug: "keys-circle-and-modes",
    level: "elementary",
    estimatedMinutes: 10,
    sortOrder: 9,
    objectives: [
      "Derive all seven diatonic modes by starting a C-major white-key scale on each letter D through B.",
      "Identify the signature note characterizing Dorian (♯6), Phrygian (♭2), Lydian (♯4), and Mixolydian (♭7).",
      "Recognize how parallel modal thinking explains film, folk, and Impressionist colors.",
    ],
    sections: [
      {
        id: "seven-diatonic-modes",
        heading: "1. Seven rotational tonalities of the diatonic collection",
        body: [
          "Starting on each white key from C to B while staying on natural notes produces seven distinct modal scales, each with its own signature degree relative to major or natural minor:",
          "1. Ionian (from C) = Major. 2. Dorian (from D) = natural minor with raised ♮6 (e.g. D–E–F–G–A–B–C–D). 3. Phrygian (from E) = natural minor with lowered ♭2. 4. Lydian (from F) = major with raised ♯4 (F–G–A–B–C–D–E–F). 5. Mixolydian (from G) = major with lowered ♭7. 6. Aeolian (from A) = Natural Minor. 7. Locrian (from B) = diminished ♭5 tonic triad.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["D4"], duration: "q" },
            { keys: ["E4"], duration: "q" },
            { keys: ["F4"], duration: "q" },
            { keys: ["G4"], duration: "q" },
            { keys: ["A4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["C5"], duration: "q" },
            { keys: ["D5"], duration: "q" },
          ],
          label: "D Dorian mode ascending on white keys D4 to D5 featuring B4 natural 6th",
          caption:
            "D Dorian: minor lower tetrachord (D–E–F–G) plus signature bright raised 6th (B♮).",
        },
        audioSteps: [
          { notes: ["D4"], at: 0, duration: 0.35 },
          { notes: ["E4"], at: 0.36, duration: 0.35 },
          { notes: ["F4"], at: 0.72, duration: 0.35 },
          { notes: ["G4"], at: 1.08, duration: 0.35 },
          { notes: ["A4"], at: 1.44, duration: 0.35 },
          { notes: ["B4"], at: 1.8, duration: 0.5 },
          { notes: ["C5"], at: 2.32, duration: 0.35 },
          { notes: ["D5"], at: 2.7, duration: 0.8 },
        ],
        audioLabel: "Hear D Dorian scale with characteristic B♮",
      },
    ],
    repertoireExample: {
      composer: "Claude Debussy / Folk tradition ('Scarborough Fair')",
      work: "Prelude Book I No. 10, 'La cathédrale engloutie'",
      barReference: "Opening modal bell sonorities",
      insight:
        "Debussy leaves aside major/minor leading-tone pull and builds spacious modal landscapes in Dorian, Lydian, and Mixolydian white-key shapes.",
      audioSteps: [
        { notes: ["G4", "D5"], at: 0, duration: 0.6 },
        { notes: ["E4", "B4"], at: 0.65, duration: 0.6 },
        { notes: ["D4", "A4"], at: 1.3, duration: 0.9 },
      ],
      audioLabel: "Hear open modal parallel fifths",
    },
    workedExample: {
      title: "Building C Lydian cleanly",
      scenario: "Spell C Lydian starting on tonic C.",
      steps: [
        "Start with C Major: C – D – E – F – G – A – B – C.",
        "Lydian's defining modal alteration is a raised 4th degree (♯4).",
        "Raise F to F♯: C – D – E – F♯ – G – A – B – C (the exact pitches of G major centered on C).",
      ],
      conclusion: "C Lydian raises degree 4 to F♯ for a luminous floating color.",
    },
    practiceActivities: [
      {
        id: "modes-q1",
        prompt:
          "Which single altered degree distinguishes a Mixolydian scale from a parallel Major scale?",
        options: [
          { id: "sharp4", label: "Raised 4th (♯4)" },
          { id: "flat2", label: "Lowered 2nd (♭2)" },
          { id: "flat7", label: "Lowered 7th (♭7)" },
          { id: "flat3", label: "Lowered 3rd (♭3)" },
        ],
        correctOptionId: "flat7",
        explanation:
          "Mixolydian (G to G on white keys) keeps Major's bright major 3rd and 6th while flattening degree 7 (♭7).",
      },
    ],
    summaryText:
      "The seven diatonic modes share the same interval repertoire rotated onto different tonics, unlocking distinct melodic inflections.",
    keyTakeaways: [
      "Ionian = Major; Aeolian = Natural Minor.",
      "Dorian = minor + ♮6; Phrygian = minor + ♭2; Lydian = major + ♯4; Mixolydian = major + ♭7.",
    ],
  },
];

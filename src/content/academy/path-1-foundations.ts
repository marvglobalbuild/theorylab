import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_1_FOUNDATIONS: AcademyPathDefinition = {
  slug: "foundations-of-music",
  numeral: "I",
  title: "Foundations of Music",
  summary:
    "Sound properties, pitch orientation, the musical alphabet, staves, clefs, ledger lines, and fundamental rhythmic meter.",
  level: "beginner",
  sortOrder: 1,
};

export const PATH_1_COURSES: AcademyCourseDefinition[] = [
  {
    slug: "foundations-pitch-and-literacy",
    learningPathSlug: "foundations-of-music",
    title: "Sound, Pitch & Staff Literacy",
    description:
      "Connect physical acoustic vibration to the musical alphabet, tones and semitones, treble and bass staves, and ledger lines.",
    level: "beginner",
    sortOrder: 1,
    estimatedMinutes: 85,
  },
  {
    slug: "foundations-notation-and-meter",
    learningPathSlug: "foundations-of-music",
    title: "Reading Pitch & Basic Meter",
    description:
      "Read treble and bass lines and spaces fluently, control note and rest durations, and organize measures with simple time signatures.",
    level: "beginner",
    sortOrder: 2,
    estimatedMinutes: 45,
  },
];

export const PATH_1_MODULES: AcademyModuleDefinition[] = [
  {
    slug: "sound-pitch-and-alphabet",
    courseSlug: "foundations-pitch-and-literacy",
    learningPathSlug: "foundations-of-music",
    title: "Module 1 · Sound, Pitch & the Musical Alphabet",
    summary: "How acoustic vibrations become named pitches and stepwise distances.",
    sortOrder: 1,
  },
  {
    slug: "staves-clefs-and-ledgers",
    courseSlug: "foundations-pitch-and-literacy",
    learningPathSlug: "foundations-of-music",
    title: "Module 2 · The Musical Staff & Clefs",
    summary: "Positioning pitch accurately across treble, bass, alto, and tenor staves.",
    sortOrder: 2,
  },
  {
    slug: "basic-note-reading-and-meter",
    courseSlug: "foundations-notation-and-meter",
    learningPathSlug: "foundations-of-music",
    title: "Module 3 · Note Values, Rests & Basic Time",
    summary: "Translating written shapes into measured time inside bars.",
    sortOrder: 3,
  },
];

export const PATH_1_LESSONS: AcademyLessonContent[] = [
  {
    slug: "understanding-music-and-sound",
    title: "Understanding music and sound",
    summary:
      "Explore the four physical dimensions of musical sound—pitch, duration, dynamics, and timbre—that notation captures.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "sound-pitch-and-alphabet",
    level: "beginner",
    estimatedMinutes: 8,
    sortOrder: 1,
    objectives: [
      "Distinguish musical tone from unpitched noise using periodic acoustic vibration.",
      "Identify the four properties of every tone: pitch, duration, dynamics, and timbre.",
      "Hear how register and articulation alter musical expression without changing pitch names.",
    ],
    sections: [
      {
        id: "vibration-and-tone",
        heading: "1. Periodic vibration vs. unpitched sound",
        body: [
          "Every sound begins with mechanical vibration travelling as pressure waves through air. When vibrations occur in steady, repeating cycles—such as a bowed violin string or plucked piano wire—the human ear hears a clear pitch.",
          "Music shapes these tones alongside silence across time. Rather than leaving sound unstructured, classical notation organizes four dimensions simultaneously: how high or low a tone sounds (pitch), how long it lasts (duration), how loudly it speaks (dynamics), and what instrumental colour produces it (timbre).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4"], duration: "h" },
            { keys: ["G4"], duration: "h" },
            { keys: ["C5"], duration: "w" },
          ],
          label: "Three open sustained tones on middle C, G4, and treble C5",
          caption: "Listen to steady pitched tones rising from middle C4 to C5.",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.9 },
          { notes: ["G4"], at: 1.0, duration: 0.9 },
          { notes: ["C5"], at: 2.0, duration: 1.4 },
        ],
        audioLabel: "Hear rising open tones (C4 – G4 – C5)",
      },
      {
        id: "four-properties",
        heading: "2. The four dimensions of a musical event",
        body: [
          "Pitch positions a sound vertically from low to high. Duration governs whether the sound is brief, sustained, or followed by measured silence (a rest). Dynamics trace contrast from piano (soft) to forte (loud).",
          "Timbre allows the same note A4 (440 Hz) played by a flute, oboe, or cello to remain unmistakably distinct because each instrument produces a unique recipe of upper overtones.",
        ],
      },
    ],
    repertoireExample: {
      composer: "Johann Sebastian Bach",
      work: "Cello Suite No. 1 in G major, BWV 1007",
      barReference: "Prelude, bars 1–2",
      insight:
        "Bach opens with an unadorned arpeggiated figure where low bass resonance (pitch and timbre), even sixteenth-note flow (duration), and natural warmth establish the harmonic space from a single melodic instrument.",
      audioSteps: [
        { notes: ["G3"], at: 0, duration: 0.3 },
        { notes: ["D4"], at: 0.28, duration: 0.3 },
        { notes: ["B4"], at: 0.56, duration: 0.45 },
        { notes: ["A4"], at: 1.0, duration: 0.3 },
        { notes: ["B4"], at: 1.28, duration: 0.6 },
      ],
      audioLabel: "Hear Bach BWV 1007 rising arpeggio contour",
    },
    workedExample: {
      title: "Separating pitch from timbre and duration",
      scenario: "Compare middle C held for two beats on piano with high C5 tapped briefly.",
      steps: [
        "Note 1 has lower frequency (261.6 Hz) and longer duration (half note, 2 beats).",
        "Note 2 doubles the vibration speed (523.3 Hz) for half the duration (quarter note, 1 beat).",
        "Though both belong to pitch class C, they occupy different vertical staff positions and rhythmic lengths.",
      ],
      conclusion: "Pitch, duration, and timbre vary independently inside every bar of music.",
      notation: {
        clef: "treble",
        chords: [
          { keys: ["C4"], duration: "h" },
          { keys: ["C5"], duration: "q" },
        ],
        label: "Middle C half note followed by treble C quarter note",
        caption: "Lower C4 (half note) compared with higher C5 (quarter note).",
      },
      audioSteps: [
        { notes: ["C4"], at: 0, duration: 1.0 },
        { notes: ["C5"], at: 1.1, duration: 0.5 },
      ],
      audioLabel: "Play C4 long vs. C5 short",
    },
    practiceActivities: [
      {
        id: "sound-q1",
        prompt:
          "Which property explains why a trumpet and a clarinet sound different even when both sustain A4 for four beats at forte?",
        options: [
          { id: "pitch", label: "Pitch" },
          { id: "timbre", label: "Timbre" },
          { id: "meter", label: "Meter" },
          { id: "rest", label: "Duration" },
        ],
        correctOptionId: "timbre",
        explanation:
          "Timbre (tone colour) arises from an instrument's harmonic overtone spectrum while pitch (A4), duration (4 beats), and dynamics (forte) stay constant.",
      },
    ],
    summaryText:
      "Musical tones arise from steady periodic vibration organized across pitch, duration, dynamics, and timbre.",
    keyTakeaways: [
      "Regular acoustic waves produce determinate pitch; irregular impulses produce unpitched noise.",
      "Pitch, duration, dynamics, and timbre operate together in every written phrase.",
      "Notation represents time horizontally and pitch height vertically.",
    ],
  },
  {
    slug: "pitch-and-frequency",
    title: "Pitch and frequency",
    summary:
      "Discover how frequency in Hertz determines pitch height and why doubling frequency produces an octave.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "sound-pitch-and-alphabet",
    level: "beginner",
    estimatedMinutes: 9,
    sortOrder: 2,
    objectives: [
      "Relate high and low pitch sensation to acoustic frequency measured in Hertz (Hz).",
      "Recognize A4 = 440 Hz as the international concert tuning reference.",
      "Understand why a 2:1 frequency ratio sounds like the 'same' note one octave higher.",
    ],
    sections: [
      {
        id: "hertz-scale",
        heading: "1. Frequency in Hertz",
        body: [
          "Frequency measures how many complete vibration cycles occur each second, expressed in Hertz (Hz). Faster vibration means higher pitch; slower vibration means lower pitch.",
          "Modern ensembles tune to A above middle C at 440 Hz (written A4). One octave lower, A3 vibrates at exactly half the rate: 220 Hz. One octave higher, A5 vibrates twice as fast: 880 Hz.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["A4"], duration: "h" },
            { keys: ["A5"], duration: "h" },
          ],
          label: "A4 (440 Hz) and A5 (880 Hz) an octave apart on treble staff",
          caption: "A4 (second space, 440 Hz) rising to A5 (ledger line above staff, 880 Hz).",
        },
        audioSteps: [
          { notes: ["A4"], at: 0, duration: 0.9 },
          { notes: ["A5"], at: 1.0, duration: 1.1 },
          { notes: ["A4", "A5"], at: 2.2, duration: 1.3 },
        ],
        audioLabel: "Hear A4 (440 Hz), A5 (880 Hz), and both together",
      },
      {
        id: "octave-equivalence",
        heading: "2. Octave equivalence",
        body: [
          "When a higher wave completes exactly two cycles for every single cycle of a lower wave (a 2:1 ratio), their crests align continuously. Our ears perceive the two tones as belonging to the same pitch family—octave equivalence.",
          "Middle C sits near 261.63 Hz; one octave higher (C5) vibrates near 523.25 Hz.",
        ],
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Symphony No. 9 in D minor, Op. 125",
      barReference: "Orchestral tuning & opening fifths (bars 1–16)",
      insight:
        "Before every performance of the Ninth Symphony, the orchestra aligns around the oboe's 440 Hz concert A before plunging into open octaves and fifths.",
      audioSteps: [
        { notes: ["A3", "A4"], at: 0, duration: 1.0 },
        { notes: ["A4", "E5"], at: 1.1, duration: 1.2 },
      ],
      audioLabel: "Hear concert A octave resonance",
    },
    workedExample: {
      title: "Computing octave frequencies from A4 = 440 Hz",
      scenario: "Find the frequencies of A3 and A2 descending from concert A4.",
      steps: [
        "Start at A4 = 440 Hz.",
        "Divide by 2 for one octave lower: A3 = 440 / 2 = 220 Hz.",
        "Divide by 2 again for two octaves lower: A2 = 220 / 2 = 110 Hz.",
      ],
      conclusion: "Every octave shift multiplies or divides frequency by 2.",
    },
    practiceActivities: [
      {
        id: "freq-q1",
        prompt:
          "If E4 vibrates at approximately 330 Hz, what is the approximate frequency of E5 one octave above?",
        options: [
          { id: "165", label: "165 Hz" },
          { id: "440", label: "440 Hz" },
          { id: "660", label: "660 Hz" },
          { id: "990", label: "990 Hz" },
        ],
        correctOptionId: "660",
        explanation: "Moving up one octave doubles the frequency: 330 Hz × 2 = 660 Hz.",
      },
    ],
    summaryText:
      "Frequency (Hz) determines acoustic pitch height, with every doubling producing an octave.",
    keyTakeaways: [
      "Higher frequency equals faster vibration and higher perceived pitch.",
      "A4 = 440 Hz is the standard modern tuning anchor.",
      "A 2:1 frequency ratio defines an octave across all registers.",
    ],
  },
  {
    slug: "musical-alphabet",
    title: "Musical alphabet",
    summary:
      "Master the seven rotating letter names A–G, octave register numbers, and Middle C as the central keyboard landmark.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "sound-pitch-and-alphabet",
    level: "beginner",
    estimatedMinutes: 8,
    sortOrder: 3,
    objectives: [
      "Recite the seven-letter musical alphabet forward and backward without hesitation.",
      "Locate white keys on the keyboard using groups of two and three black keys.",
      "Understand scientific pitch notation (C4 for middle C, G4, C5).",
    ],
    sections: [
      {
        id: "seven-letters",
        heading: "1. Seven repeating letters: A through G",
        body: [
          "Western music uses only the first seven letters of the alphabet: A, B, C, D, E, F, G. Stepping upward past G cycles straight back to A; stepping downward below A cycles back to G.",
          "Because black keys on a piano appear in repeating groups of two and three, visual navigation is immediate: C always sits just to the left of any group of two black keys, while F sits just to the left of any group of three black keys.",
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
          label: "Natural letters from C4 through C5 ascending on treble staff",
          caption: "Seven distinct letter names completing their cycle back at C5.",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.35 },
          { notes: ["D4"], at: 0.38, duration: 0.35 },
          { notes: ["E4"], at: 0.76, duration: 0.35 },
          { notes: ["F4"], at: 1.14, duration: 0.35 },
          { notes: ["G4"], at: 1.52, duration: 0.35 },
          { notes: ["A4"], at: 1.9, duration: 0.35 },
          { notes: ["B4"], at: 2.28, duration: 0.35 },
          { notes: ["C5"], at: 2.66, duration: 0.75 },
        ],
        audioLabel: "Play alphabet cycle C4 to C5",
      },
      {
        id: "octave-numbers",
        heading: "2. Octave register numbers & Middle C",
        body: [
          "To distinguish every C on an 88-key piano, musicians attach an octave number that increments on every C: middle C is C4, followed upward by D4, E4, F4, G4, A4, B4, and then C5.",
          "Directly below C4 sits B3, then A3, G3, down into the bass register.",
        ],
      },
    ],
    repertoireExample: {
      composer: "Wolfgang Amadeus Mozart",
      work: "Piano Sonata No. 16 in C major, K. 545",
      barReference: "Allegro, bar 1–4",
      insight:
        "Mozart builds his luminous opening melody directly across adjacent alphabet letters C5–E5–G5–B4–C5–D5–C5 with transparent clarity.",
      audioSteps: [
        { notes: ["C5"], at: 0, duration: 0.6 },
        { notes: ["E5"], at: 0.62, duration: 0.32 },
        { notes: ["G5"], at: 0.96, duration: 0.32 },
        { notes: ["B4"], at: 1.3, duration: 0.45 },
        { notes: ["C5"], at: 1.78, duration: 0.28 },
        { notes: ["D5"], at: 2.08, duration: 0.28 },
        { notes: ["C5"], at: 2.38, duration: 0.65 },
      ],
      audioLabel: "Hear Mozart K. 545 opening melody",
    },
    workedExample: {
      title: "Counting backward across the G/A boundary",
      scenario: "Find the pitch three natural steps below B4.",
      steps: [
        "Start at B4.",
        "Step 1 down: A4. Step 2 down: G4 (crossing down from A4 to G4).",
        "Step 3 down: F4.",
      ],
      conclusion: "Three letter steps below B4 lands on F4.",
    },
    practiceActivities: [
      {
        id: "alphabet-q1",
        prompt: "What note lies immediately below middle C (C4)?",
        options: [
          { id: "b3", label: "B3" },
          { id: "b4", label: "B4" },
          { id: "d4", label: "D4" },
          { id: "a3", label: "A3" },
        ],
        correctOptionId: "b3",
        explanation:
          "Because octave numbers change at C, the letter step just beneath C4 wraps back to G–A–B in octave 3: B3.",
      },
    ],
    summaryText:
      "All pitched Western music cycles infinitely across seven letters (A–G), indexed by register numbers starting on C.",
    keyTakeaways: [
      "After G comes A; before A comes G.",
      "C sits directly left of any two-black-key group.",
      "Octave register numbers increment each time C is reached ascending.",
    ],
  },
  {
    slug: "tones-and-semitones",
    title: "Tones and semitones",
    summary:
      "Learn how semitones (half steps) and whole tones combine with sharps, flats, and naturals to span all twelve chromatic pitches.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "sound-pitch-and-alphabet",
    level: "beginner",
    estimatedMinutes: 10,
    sortOrder: 4,
    objectives: [
      "Identify natural semitones (E–F and B–C) without black keys between them.",
      "Distinguish semitones (1 key step) from whole tones (2 semitones).",
      "Apply sharps (#), flats (b), and naturals to name altered keyboard pitches.",
    ],
    sections: [
      {
        id: "semitone-and-tone",
        heading: "1. The semitone and the whole tone",
        body: [
          "A semitone (or half step) is the closest pitch distance on the standard piano keyboard—moving from any key directly to its nearest neighbour, whether white or black. A whole tone equals two semitones combined.",
          "Notice carefully that white keys do NOT all lie a whole tone apart: between E and F, and between B and C, there is no black key in between, forming two natural semitone pairs.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4"], duration: "q" },
            { keys: ["C#4"], duration: "q" },
            { keys: ["D4"], duration: "q" },
            { keys: ["E4"], duration: "q" },
            { keys: ["F4"], duration: "q" },
          ],
          label: "Semitone C to C-sharp, whole tone C to D, natural semitone E to F",
          caption: "C–C♯ (semitone), C–D (tone), and E–F (natural semitone with no black key).",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.5 },
          { notes: ["C#4"], at: 0.55, duration: 0.65 },
          { notes: ["E4"], at: 1.4, duration: 0.5 },
          { notes: ["F4"], at: 1.95, duration: 0.8 },
        ],
        audioLabel: "Compare chromatic C–C♯ and natural E–F semitones",
      },
      {
        id: "accidentals-and-enharmonics",
        heading: "2. Accidentals and enharmonic equivalents",
        body: [
          "A sharp (♯) raises a pitch by one semitone; a flat (♭) lowers a pitch by one semitone; a natural (♮) cancels a prior accidental.",
          "Because the black key above F sits one semitone below G, it can be spelled either F♯ or G♭—two spellings sharing the same piano key, known as enharmonic equivalents.",
        ],
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Bagatelle No. 25 in A minor ('Für Elise')",
      barReference: "Bars 1–2",
      insight:
        "The signature opening alternates E5 and D♯5 across a single razor-sharp semitone, creating immediate expressive yearning before resolving into A minor.",
      audioSteps: [
        { notes: ["E5"], at: 0, duration: 0.25 },
        { notes: ["D#5"], at: 0.25, duration: 0.25 },
        { notes: ["E5"], at: 0.5, duration: 0.25 },
        { notes: ["D#5"], at: 0.75, duration: 0.25 },
        { notes: ["E5"], at: 1.0, duration: 0.25 },
        { notes: ["B4"], at: 1.25, duration: 0.25 },
        { notes: ["D5"], at: 1.5, duration: 0.25 },
        { notes: ["C5"], at: 1.75, duration: 0.25 },
        { notes: ["A4"], at: 2.0, duration: 0.7 },
      ],
      audioLabel: "Hear E5–D♯5 semitone oscillation in Für Elise",
    },
    workedExample: {
      title: "Building whole tones across black and white keys",
      scenario: "Find the pitch one whole tone above E4.",
      steps: [
        "Start on E4.",
        "Move up 1 semitone (first step): land on F4 (natural semitone, no black key).",
        "Move up 1 more semitone (second step): land on F♯4.",
      ],
      conclusion: "One whole tone above E4 is F♯4 (enharmonic with G♭4).",
    },
    practiceActivities: [
      {
        id: "tones-q1",
        prompt: "Which pair of natural white keys spans only one semitone?",
        options: [
          { id: "cd", label: "C to D" },
          { id: "fg", label: "F to G" },
          { id: "bc", label: "B to C" },
          { id: "ab", label: "A to B" },
        ],
        correctOptionId: "bc",
        explanation: "Only E–F and B–C have no black key between them, so B to C is 1 semitone.",
      },
    ],
    summaryText:
      "Semitones and whole tones measure exact keyboard steps, while sharps and flats name the black keys and altered degrees.",
    keyTakeaways: [
      "E–F and B–C are natural semitones.",
      "One whole tone equals two semitones.",
      "Enharmonic notes (such as F♯ and G♭) share the same sounding pitch under different spellings.",
    ],
  },
  {
    slug: "the-musical-staff",
    title: "The musical staff",
    summary:
      "Understand the five-line, four-space grid that turns vertical motion into visual pitch Contour.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "staves-clefs-and-ledgers",
    level: "beginner",
    estimatedMinutes: 7,
    sortOrder: 5,
    objectives: [
      "Count the five lines and four spaces consistently from bottom to top.",
      "Read alternating line–space–line–space stepwise motion directly as musical alphabet steps.",
      "Distinguish steps from skips on the stave without hesitation.",
    ],
    sections: [
      {
        id: "five-lines-four-spaces",
        heading: "1. Bottom-to-top numbering",
        body: [
          "The modern musical staff contains five parallel horizontal lines with four spaces enclosed between them. Musicians always count both lines and spaces from the bottom upward: bottom line = Line 1; top line = Line 5.",
          "Moving from any line up into the space just above raises pitch by one alphabetical letter step (e.g., G to A). Skipping from one line directly to the next line jumps over the intervening space—producing a melodic third.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["E4"], duration: "q" },
            { keys: ["F4"], duration: "q" },
            { keys: ["G4"], duration: "q" },
            { keys: ["A4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
          ],
          label: "Alternating line and space notes moving upward on the treble staff",
          caption: "Line 1 (E4) → Space 1 (F4) → Line 2 (G4) → Space 2 (A4) → Line 3 (B4).",
        },
        audioSteps: [
          { notes: ["E4"], at: 0, duration: 0.4 },
          { notes: ["F4"], at: 0.45, duration: 0.4 },
          { notes: ["G4"], at: 0.9, duration: 0.4 },
          { notes: ["A4"], at: 1.35, duration: 0.4 },
          { notes: ["B4"], at: 1.8, duration: 0.7 },
        ],
        audioLabel: "Hear stepwise motion across alternating lines and spaces",
      },
    ],
    repertoireExample: {
      composer: "Guido d'Arezzo (tradition) / J. S. Bach",
      work: "Two-Part Invention No. 1 in C major, BWV 772",
      barReference: "Opening motif, bar 1",
      insight:
        "Notice how visually transparent the opening stepwise turn C–D–E–F–D–E–C–G looks on the five-line grid: your eye immediately tracks contour even before reading a letter name.",
      audioSteps: [
        { notes: ["C4"], at: 0, duration: 0.25 },
        { notes: ["D4"], at: 0.25, duration: 0.25 },
        { notes: ["E4"], at: 0.5, duration: 0.25 },
        { notes: ["F4"], at: 0.75, duration: 0.25 },
        { notes: ["D4"], at: 1.0, duration: 0.25 },
        { notes: ["E4"], at: 1.25, duration: 0.25 },
        { notes: ["C4"], at: 1.5, duration: 0.6 },
      ],
      audioLabel: "Hear Bach Invention No. 1 contour",
    },
    workedExample: {
      title: "Reading visual interval motion",
      scenario: "Compare moving from Line 1 to Space 1 versus Line 1 to Line 2.",
      steps: [
        "Line 1 to Space 1 moves one single vertical position: one letter step (e.g. E4 → F4).",
        "Line 1 to Line 2 crosses Space 1: a skip of a third (e.g. E4 → G4).",
      ],
      conclusion:
        "Alternating line–space equals a step; line–line or space–space equals a skip (odd-numbered interval).",
    },
    practiceActivities: [
      {
        id: "staff-q1",
        prompt:
          "If a note head sits directly on Line 2 and moves upward to Line 3 without stopping in the space between, how many letter names did it span?",
        options: [
          { id: "step", label: "A step (2nd)" },
          { id: "skip3", label: "A skip of a 3rd" },
          { id: "fifth", label: "A fifth" },
          { id: "unison", label: "Unison" },
        ],
        correctOptionId: "skip3",
        explanation:
          "Moving from line to adjacent line passes over the space between them, spanning two letter steps (e.g., G to B = a 3rd).",
      },
    ],
    summaryText:
      "The five-line, four-space staff converts vertical spacing directly into stepwise pitch contour from bottom to top.",
    keyTakeaways: [
      "Lines 1–5 and spaces 1–4 are always numbered from bottom to top.",
      "Line-to-adjacent-space is a step; line-to-adjacent-line is a third.",
      "A staff cannot assign specific letter names until a clef is placed at its left edge.",
    ],
  },
  {
    slug: "treble-bass-and-other-clefs",
    title: "Treble, bass and other clefs",
    summary:
      "Master how the G clef (treble), F clef (bass), and C clefs (alto/tenor) anchor exact pitches to specific staff lines.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "staves-clefs-and-ledgers",
    level: "beginner",
    estimatedMinutes: 10,
    sortOrder: 6,
    objectives: [
      "Identify the treble clef as a G clef locking Line 2 to G4.",
      "Identify the bass clef as an F clef locking Line 4 to F3.",
      "Understand C clefs (alto on Line 3, tenor on Line 4) and the grand staff.",
    ],
    sections: [
      {
        id: "g-and-f-clefs",
        heading: "1. Treble (G) clef and Bass (F) clef",
        body: [
          "The treble clef grew historically out of an ornamental letter G whose inner spiral curls directly around Line 2—fixing that line forever as G4 above middle C.",
          "The bass clef evolved from an F whose two dots straddle Line 4—fixing Line 4 as F3 below middle C. Piano music links one treble staff above one bass staff with a curly brace to form the Grand Staff, with middle C hovering centrally between them.",
        ],
        notation: {
          clef: "bass",
          chords: [
            { keys: ["F3"], duration: "h" },
            { keys: ["A3"], duration: "q" },
            { keys: ["C4"], duration: "h" },
          ],
          label: "Bass clef showing Line 4 (F3), Top line (A3), and Middle C above",
          caption:
            "Bass (F) clef fixing Line 4 at F3, rising to top line A3 and ledger-line Middle C.",
        },
        audioSteps: [
          { notes: ["F3"], at: 0, duration: 0.7 },
          { notes: ["A3"], at: 0.75, duration: 0.5 },
          { notes: ["C4"], at: 1.3, duration: 1.0 },
        ],
        audioLabel: "Hear bass clef F3, A3, and Middle C",
      },
      {
        id: "alto-and-tenor-clefs",
        heading: "2. Alto and Tenor C clefs",
        body: [
          "The movable C clef centres on whichever line falls squarely inside its double curve, anchoring that line to Middle C (C4).",
          "In Alto clef (standard for viola), Middle C sits on Line 3. In Tenor clef (used for upper cello, bassoon, and trombone registers), Middle C sits on Line 4.",
        ],
        notation: {
          clef: "alto",
          chords: [
            { keys: ["C4"], duration: "h" },
            { keys: ["D4"], duration: "q" },
            { keys: ["E4"], duration: "q" },
          ],
          label: "Alto clef placing Middle C directly on Line 3",
          caption: "Alto C clef: Middle C sits cleanly in the middle line (Line 3).",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.75 },
          { notes: ["D4"], at: 0.8, duration: 0.45 },
          { notes: ["E4"], at: 1.3, duration: 0.65 },
        ],
        audioLabel: "Hear C4–D4–E4 displayed in Alto clef",
      },
    ],
    repertoireExample: {
      composer: "Hector Berlioz / J. S. Bach",
      work: "Brandenburg Concerto No. 6 in B♭ major, BWV 1051",
      barReference: "Opening duet for two violas, bars 1–4",
      insight:
        "Violas read Alto clef precisely because their compass straddles Middle C: using Alto clef minimizes awkward ledger lines above bass clef or below treble clef.",
      audioSteps: [
        { notes: ["Bb3"], at: 0, duration: 0.45 },
        { notes: ["D4"], at: 0.45, duration: 0.45 },
        { notes: ["F4"], at: 0.9, duration: 0.6 },
      ],
      audioLabel: "Hear middle-register viola compass in B♭",
    },
    workedExample: {
      title: "Locating F3 in Bass Clef and C4 in Alto Clef",
      scenario: "Determine the line pitches without relying on rote mnemonics alone.",
      steps: [
        "In Bass clef, look at the two dots around Line 4: Line 4 is F3.",
        "Walk upward from Line 4 (F3): Space 4 is G3, Line 5 is A3, space above is B3, first ledger line is Middle C (C4).",
        "In Alto clef, Line 3—where the clef pinch points—is already C4.",
      ],
      conclusion:
        "Every clef defines a single immovable reference pitch from which all other notes derive alphabetically.",
    },
    practiceActivities: [
      {
        id: "clefs-q1",
        prompt: "Which clef fixes Line 4 of the staff to the pitch F3 (below middle C)?",
        options: [
          { id: "treble", label: "Treble clef" },
          { id: "bass", label: "Bass clef" },
          { id: "alto", label: "Alto clef" },
          { id: "tenor", label: "Tenor clef" },
        ],
        correctOptionId: "bass",
        explanation:
          "The bass (F) clef places its two dots on either side of Line 4, anchoring F3 to that line.",
      },
    ],
    summaryText:
      "Clefs lock a reference pitch—G4 (Treble), F3 (Bass), or C4 (Alto/Tenor)—so instrumentalists read within their comfortable range.",
    keyTakeaways: [
      "Treble = G4 on Line 2; Bass = F3 on Line 4.",
      "Alto clef puts C4 on Line 3; Tenor clef puts C4 on Line 4.",
      "The Grand Staff unites Treble and Bass around Middle C.",
    ],
  },
  {
    slug: "ledger-lines",
    title: "Ledger lines",
    summary:
      "Read notes extended above or below any staff cleanly using temporary ledger lines without losing alphabetical orientation.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "staves-clefs-and-ledgers",
    level: "beginner",
    estimatedMinutes: 8,
    sortOrder: 7,
    objectives: [
      "Understand ledger lines as brief horizontal extensions strictly for notes outside the five staff lines.",
      "Read Middle C (C4) and A5 immediately on treble ledger lines.",
      "Count outward alphabetically from the top (F5/A3) or bottom (E4/G2) line without guessing.",
    ],
    sections: [
      {
        id: "how-ledgers-work",
        heading: "1. Temporary extensions beyond Line 1 and Line 5",
        body: [
          "Melodies frequently rise above F5 or dip below E4 in treble clef. Rather than adding permanent lines that would blur the eye, notation draws short horizontal ledger lines strictly beneath or through each out-of-range notehead.",
          "Middle C (C4) on the treble staff is the most famous ledger line note: D4 hangs immediately below Line 1 (E4), and C4 sits squarely on the first lower ledger line.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["A3"], duration: "q" },
            { keys: ["B3"], duration: "q" },
            { keys: ["C4"], duration: "h" },
            { keys: ["G5"], duration: "q" },
            { keys: ["A5"], duration: "h" },
          ],
          label: "Lower ledger notes A3, B3, C4 and upper ledger notes G5, A5 on treble staff",
          caption:
            "Lower ledgers below treble staff (A3, B3, C4) and upper space/ledger above F5 (G5, A5).",
        },
        audioSteps: [
          { notes: ["A3"], at: 0, duration: 0.4 },
          { notes: ["C4"], at: 0.45, duration: 0.6 },
          { notes: ["G5"], at: 1.15, duration: 0.4 },
          { notes: ["A5"], at: 1.6, duration: 0.75 },
        ],
        audioLabel: "Hear lower (A3–C4) and upper (G5–A5) ledger pitches",
      },
    ],
    repertoireExample: {
      composer: "Frédéric Chopin",
      work: "Nocturne in E♭ major, Op. 9 No. 2",
      barReference: "Decorated cadenza flourishes",
      insight:
        "Romantic piano melodies sweep from the middle treble lines high into the second and third upper ledger lines (A5, C6, E♭6), rewarding instant ledger-line landmarks like A5 and C6.",
      audioSteps: [
        { notes: ["G5"], at: 0, duration: 0.35 },
        { notes: ["A5"], at: 0.38, duration: 0.35 },
        { notes: ["C6"], at: 0.76, duration: 0.8 },
      ],
      audioLabel: "Hear upper register A5–C6",
    },
    workedExample: {
      title: "Identifying two ledger lines below treble clef",
      scenario:
        "Name the note sitting directly on the second ledger line below treble Line 1 (E4).",
      steps: [
        "Line 1 = E4.",
        "Space below Line 1 = D4.",
        "1st ledger line = C4 (Middle C).",
        "Space below 1st ledger line = B3.",
        "2nd ledger line = A3.",
      ],
      conclusion: "The second ledger line below treble clef is A3.",
    },
    practiceActivities: [
      {
        id: "ledger-q1",
        prompt: "What pitch sits on the first ledger line directly above treble Line 5 (F5)?",
        options: [
          { id: "g5", label: "G5" },
          { id: "a5", label: "A5" },
          { id: "b5", label: "B5" },
          { id: "c6", label: "C6" },
        ],
        correctOptionId: "a5",
        explanation:
          "Treble Line 5 is F5; the space sitting atop Line 5 is G5, placing the first ledger line at A5.",
      },
    ],
    summaryText:
      "Ledger lines preserve alphabetical line-space alternation above Line 5 and below Line 1 using C4 and A5 as quick anchors.",
    keyTakeaways: [
      "Middle C sits on 1st ledger line below treble and 1st ledger line above bass.",
      "Above treble Line 5 (F5): space = G5, 1st ledger line = A5, 2nd ledger line = C6.",
      "Every ledger line continues alternating step-by-step with the intervening spaces.",
    ],
  },
  {
    slug: "note-names-and-positions",
    title: "Note names and positions",
    summary:
      "Build rapid sight-reading landmarks across every line and space of treble and bass staves without slow mnemonic counting.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-pitch-and-literacy",
    moduleSlug: "staves-clefs-and-ledgers",
    level: "beginner",
    estimatedMinutes: 9,
    sortOrder: 8,
    objectives: [
      "Name all five lines (E–G–B–D–F) and four spaces (F–A–C–E) on the treble staff rapidly.",
      "Name all five lines (G–B–D–F–A) and four spaces (A–C–E–G) on the bass staff.",
      "Apply symmetric landmark pairs (C3, Middle C, C5; Bass F3, Treble G4) to speed up reading.",
    ],
    sections: [
      {
        id: "treble-landmarks",
        heading: "1. Treble spaces and lines",
        body: [
          "On the treble staff, the four spaces from bottom to top spell F–A–C–E (F4, A4, C5, E5), while the five lines read E–G–B–D–F (E4, G4, B4, D5, F5).",
          "Notice the open symmetry: G4 (treble Line 2) and C5 (treble Space 3) together with Middle C4 and top F5 form fast visual guideposts so you rarely have to count from bottom Line 1.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["F4"], duration: "q" },
            { keys: ["A4"], duration: "q" },
            { keys: ["C5"], duration: "q" },
            { keys: ["E5"], duration: "q" },
          ],
          label: "Four spaces of the treble staff spelling F4 A4 C5 E5",
          caption: "Treble spaces bottom-to-top: F4 – A4 – C5 – E5.",
        },
        audioSteps: [
          { notes: ["F4"], at: 0, duration: 0.4 },
          { notes: ["A4"], at: 0.45, duration: 0.4 },
          { notes: ["C5"], at: 0.9, duration: 0.4 },
          { notes: ["E5"], at: 1.35, duration: 0.7 },
        ],
        audioLabel: "Hear treble spaces chord tones F4–A4–C5–E5",
      },
      {
        id: "bass-landmarks",
        heading: "2. Bass spaces and lines",
        body: [
          "On the bass staff, the five lines from bottom to top are G2–B2–D3–F3–A3, and the four spaces are A2–C3–E3–G3.",
          "Think symmetrically with C as your anchor: Bass Space 2 is Bass C (C3), one octave below Middle C4; Treble Space 3 is Treble C (C5), one octave above Middle C4!",
        ],
        notation: {
          clef: "bass",
          chords: [
            { keys: ["A2"], duration: "q" },
            { keys: ["C3"], duration: "q" },
            { keys: ["E3"], duration: "q" },
            { keys: ["G3"], duration: "q" },
          ],
          label: "Four spaces of the bass staff spelling A2 C3 E3 G3",
          caption: "Bass spaces bottom-to-top: A2 – C3 – E3 – G3.",
        },
        audioSteps: [
          { notes: ["A2"], at: 0, duration: 0.4 },
          { notes: ["C3"], at: 0.45, duration: 0.4 },
          { notes: ["E3"], at: 0.9, duration: 0.4 },
          { notes: ["G3"], at: 1.35, duration: 0.7 },
        ],
        audioLabel: "Hear bass spaces A2–C3–E3–G3",
      },
    ],
    repertoireExample: {
      composer: "Johann Sebastian Bach",
      work: "Prelude in C major, WTC I, BWV 846",
      barReference: "Measure 1, Grand Staff arpeggio",
      insight:
        "Measure 1 pairs C4–E4 across bass/middle register with G4–C5–E5 rising directly through treble Line 2 (G4), Space 3 (C5), and Space 4 (E5).",
      audioSteps: [
        { notes: ["C4"], at: 0, duration: 0.25 },
        { notes: ["E4"], at: 0.22, duration: 0.25 },
        { notes: ["G4"], at: 0.44, duration: 0.25 },
        { notes: ["C5"], at: 0.66, duration: 0.25 },
        { notes: ["E5"], at: 0.88, duration: 0.7 },
      ],
      audioLabel: "Hear Bach WTC I C-major Prelude bar 1",
    },
    workedExample: {
      title: "Recognizing symmetric C landmarks on the Grand Staff",
      scenario: "Locate C3, C4, and C5 instantly without counting lines.",
      steps: [
        "C3 (Bass C): Space 2 in Bass clef.",
        "C4 (Middle C): Ledger line strictly between Bass and Treble staves.",
        "C5 (Treble C): Space 3 in Treble clef.",
      ],
      conclusion: "All surrounding notes lie within one step or skip of these fixed C anchors.",
    },
    practiceActivities: [
      {
        id: "positions-q1",
        prompt: "Which pitch sits on Space 2 of the bass staff?",
        options: [
          { id: "c3", label: "C3" },
          { id: "e3", label: "E3" },
          { id: "a4", label: "A4" },
          { id: "g3", label: "G3" },
        ],
        correctOptionId: "c3",
        explanation:
          "Bass spaces bottom-to-top are A2 (Space 1), C3 (Space 2), E3 (Space 3), and G3 (Space 4).",
      },
    ],
    summaryText:
      "Pairing landmark C's (C3, C4, C5) with clef lines (F3, G4) unlocks instantaneous fluent reading across both staves.",
    keyTakeaways: [
      "Treble lines = E4–G4–B4–D5–F5; spaces = F4–A4–C5–E5.",
      "Bass lines = G2–B2–D3–F3–A3; spaces = A2–C3–E3–G3.",
      "Symmetry around Middle C connects bass Space 2 (C3) and treble Space 3 (C5).",
    ],
  },
  {
    slug: "note-values-and-rests",
    title: "Note values and rests",
    summary:
      "Learn the proportional subdivision tree of whole, half, quarter, eighth, and sixteenth notes paired with their equivalent rests.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-notation-and-meter",
    moduleSlug: "basic-note-reading-and-meter",
    level: "beginner",
    estimatedMinutes: 9,
    sortOrder: 9,
    objectives: [
      "Identify whole, half, quarter, eighth, and sixteenth note shapes.",
      "Match every sounding note duration with its corresponding silent rest symbol.",
      "Calculate simple rhythmic equivalences (e.g., two quarters = one half; four sixteenths = one quarter).",
    ],
    sections: [
      {
        id: "note-value-tree",
        heading: "1. Proportional halving: the rhythmic tree",
        body: [
          "Musical note values operate on exact 2:1 proportions rather than fixed clock seconds. A whole note (semibreve, hollow oval without stem) divides into two half notes (minims, hollow oval with stem). Each half note divides into two quarter notes (crotchets, solid notehead with stem).",
          "Subdividing a quarter note yields two eighth notes (quavers, single flag or beam), and subdividing an eighth note yields two sixteenth notes (semiquavers, two flags or two beams).",
        ],
        notation: {
          clef: "treble",
          timeSignature: "4/4",
          chords: [
            { keys: ["G4"], duration: "w" },
            { keys: ["G4"], duration: "h" },
            { keys: ["G4"], duration: "q" },
            { keys: ["G4"], duration: "8" },
          ],
          label: "Whole note, half note, quarter note, and eighth note on G4",
          caption:
            "Relative shapes: whole (4 beats), half (2 beats), quarter (1 beat), eighth (½ beat).",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 1.5 },
          { notes: ["G4"], at: 1.65, duration: 0.75 },
          { notes: ["G4"], at: 2.5, duration: 0.38 },
          { notes: ["G4"], at: 3.0, duration: 0.2 },
        ],
        audioLabel: "Compare whole, half, quarter, and eighth lengths",
      },
      {
        id: "matching-rests",
        heading: "2. Symbols of measured silence (rests)",
        body: [
          "Silence carries equal architectural weight. Whole rests hang down from Line 4 (like an inverted hat); half rests sit atop Line 3 (like an upright hat). Quarter rests form a vertical zig-zag stroke, while eighth and sixteenth rests mirror the one- and two-flag design of their noteheads.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["G4"], duration: "q" },
            { keys: [], duration: "qr" },
            { keys: ["A4"], duration: "h" },
            { keys: [], duration: "hr" },
          ],
          label: "Quarter note, quarter rest, half note, and half rest",
          caption:
            "Quarter note + quarter rest (1 beat each), followed by half note + half rest (2 beats each).",
        },
      },
    ],
    repertoireExample: {
      composer: "Joseph Haydn",
      work: "Symphony No. 94 in G major ('Surprise'), II. Andante",
      barReference: "Opening theme, bars 1–8",
      insight:
        "Haydn alternates crisp eighth and quarter pulses with deliberate quarter rests so the soft chordal texture breaks out on a sudden fortissimo accent.",
      audioSteps: [
        { notes: ["C4", "E4"], at: 0, duration: 0.3 },
        { notes: ["C4", "E4"], at: 0.45, duration: 0.3 },
        { notes: ["E4", "G4"], at: 0.9, duration: 0.3 },
        { notes: ["E4", "G4"], at: 1.35, duration: 0.3 },
        { notes: ["G4", "C5"], at: 1.8, duration: 0.75 },
      ],
      audioLabel: "Hear Haydn's measured quarter pulse motif",
    },
    workedExample: {
      title: "Balancing a bar totaling four quarter beats",
      scenario:
        "Find the missing rest needed in a measure containing one half note and one quarter note in 4/4.",
      steps: [
        "1 half note = 2 quarter beats.",
        "1 quarter note = 1 quarter beat.",
        "Combined value so far = 2 + 1 = 3 quarter beats.",
        "Total bar capacity in 4/4 is 4 quarter beats: 4 − 3 = 1 beat remaining.",
      ],
      conclusion: "Add one quarter rest to complete the four-beat measure.",
    },
    practiceActivities: [
      {
        id: "values-q1",
        prompt: "How many eighth notes together equal the duration of a single half note?",
        options: [
          { id: "two", label: "2 eighth notes" },
          { id: "four", label: "4 eighth notes" },
          { id: "six", label: "6 eighth notes" },
          { id: "eight", label: "8 eighth notes" },
        ],
        correctOptionId: "four",
        explanation:
          "1 half note = 2 quarter notes, and each quarter note holds 2 eighth notes (2 × 2 = 4).",
      },
    ],
    summaryText:
      "Each step down the note-value hierarchy halves duration, and every sounding value pairs with an identical rest symbol.",
    keyTakeaways: [
      "Whole = 2 halves = 4 quarters = 8 eighths = 16 sixteenths.",
      "Whole rest hangs from Line 4; half rest sits on Line 3.",
      "Rests require strict beat counting identical to sounding notes.",
    ],
  },
  {
    slug: "basic-time-signatures",
    title: "Basic time signatures",
    summary:
      "Read top and bottom numbers in 4/4, 3/4, and 2/4 meters and feel how barlines group beats into strong and weak accents.",
    learningPathSlug: "foundations-of-music",
    courseSlug: "foundations-notation-and-meter",
    moduleSlug: "basic-note-reading-and-meter",
    level: "beginner",
    estimatedMinutes: 9,
    sortOrder: 10,
    objectives: [
      "Decode what the top and bottom numerals represent in a time signature.",
      "Contrast duple (2/4), triple (3/4), and quadruple (4/4) bar groupings.",
      "Group notes into complete measures bounded by barlines.",
    ],
    sections: [
      {
        id: "top-bottom-numbers",
        heading: "1. Top numeral vs. bottom numeral",
        body: [
          "A time signature stacks two numbers immediately after the key signature. The TOP number tells you how many beats fit inside each measure. The BOTTOM number identifies which note value equals one beat (4 = quarter note, 2 = half note, 8 = eighth note).",
          "Thus 3/4 means 3 quarter-note beats per measure (ONE-two-three, waltz feel); 4/4 means 4 quarter-note beats per measure (common time, written C); 2/4 means 2 quarter-note beats per measure (march feel).",
        ],
        notation: {
          clef: "treble",
          timeSignature: "3/4",
          chords: [
            { keys: ["G4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["D5"], duration: "q" },
          ],
          label: "Three quarter notes inside one measure of 3/4 meter",
          caption: "3/4 meter: three quarter-note beats per measure.",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 0.45 },
          { notes: ["B4"], at: 0.5, duration: 0.4 },
          { notes: ["D5"], at: 1.0, duration: 0.4 },
        ],
        audioLabel: "Hear three quarter-note beats in 3/4 time",
      },
    ],
    repertoireExample: {
      composer: "Johann Strauss II",
      work: "On the Beautiful Blue Danube, Op. 314",
      barReference: "Waltz No. 1, bars 1–8",
      insight:
        "Triple meter (3/4) creates the characteristic Viennese lift: beat 1 grounds the bass chord while beats 2 and 3 spring lightly upward.",
      audioSteps: [
        { notes: ["D3"], at: 0, duration: 0.42 },
        { notes: ["F#4", "A4"], at: 0.45, duration: 0.25 },
        { notes: ["F#4", "A4"], at: 0.9, duration: 0.25 },
        { notes: ["A3"], at: 1.35, duration: 0.42 },
        { notes: ["F#4", "A4"], at: 1.8, duration: 0.25 },
        { notes: ["F#4", "A4"], at: 2.25, duration: 0.25 },
      ],
      audioLabel: "Hear 3/4 waltz pulse: strong–weak–weak",
    },
    workedExample: {
      title: "Interpreting 4/4 ('Common Time') vs. 3/4",
      scenario: "You see one half note followed by two eighth notes in a measure.",
      steps: [
        "Half note = 2 quarter beats.",
        "Two eighth notes = 1 quarter beat combined.",
        "Total duration present = 2 + 1 = 3 quarter beats.",
      ],
      conclusion:
        "Those notes fill a complete measure of 3/4 time, but leave 1 beat short in 4/4 time.",
    },
    practiceActivities: [
      {
        id: "timesig-q1",
        prompt: "In the time signature 3/4, what does the bottom number 4 signify?",
        options: [
          { id: "four-measures", label: "There are four measures per phrase" },
          { id: "quarter-beat", label: "The quarter note receives one beat" },
          { id: "four-beats", label: "There are four beats in each measure" },
          { id: "tempo", label: "The tempo is 40 beats per minute" },
        ],
        correctOptionId: "quarter-beat",
        explanation:
          "The bottom numeral identifies the unit of beat: 4 stands for a quarter note (1/4 of a whole note).",
      },
    ],
    summaryText:
      "Simple time signatures count top = beats per measure and bottom = beat unit (4 = quarter note), structuring accents inside barlines.",
    keyTakeaways: [
      "Top number = number of beats per measure; bottom number = beat note value.",
      "4/4 (common time) groups 4 quarter beats; 3/4 groups 3; 2/4 groups 2.",
      "Beat 1 of every bar carries the primary metrical stress.",
    ],
  },
];

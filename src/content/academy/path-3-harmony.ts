import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_3_HARMONY: AcademyPathDefinition = {
  slug: "intervals-and-harmony",
  numeral: "III",
  title: "Intervals and Harmony",
  summary:
    "Measure and qualify intervals, hear consonance and dissonance, spell major/minor/diminished/augmented triads, invert chords, build seventh chords, and read Roman numeral progressions.",
  level: "intermediate",
  sortOrder: 3,
};

export const PATH_3_COURSES: AcademyCourseDefinition[] = [
  {
    slug: "intervals-and-triads",
    learningPathSlug: "intervals-and-harmony",
    title: "Intervals, Consonance & Triads",
    description:
      "Calculate generic and specific interval quality, classify consonance versus dissonance, and build all four root-position triad qualities.",
    level: "intermediate",
    sortOrder: 1,
    estimatedMinutes: 60,
  },
  {
    slug: "inversions-sevenths-and-progressions",
    learningPathSlug: "intervals-and-harmony",
    title: "Inversions, Seventh Chords & Functional Harmony",
    description:
      "Voice triad inversions smoothly with figured bass symbols, spell seventh chords, analyze progressions with Roman numerals, and resolve cadences.",
    level: "intermediate",
    sortOrder: 2,
    estimatedMinutes: 55,
  },
];

export const PATH_3_MODULES: AcademyModuleDefinition[] = [
  {
    slug: "intervals-and-acoustics",
    courseSlug: "intervals-and-triads",
    learningPathSlug: "intervals-and-harmony",
    title: "Module 1 · Intervals & Acoustic Stability",
    summary: "Generic size, semitone quality, inversion rules, and consonance.",
    sortOrder: 1,
  },
  {
    slug: "triads-and-voicing",
    courseSlug: "intervals-and-triads",
    learningPathSlug: "intervals-and-harmony",
    title: "Module 2 · Four Triad Types & Inversions",
    summary: "Major, minor, diminished, augmented triads and bass-line inversions.",
    sortOrder: 2,
  },
  {
    slug: "sevenths-and-tonal-syntax",
    courseSlug: "inversions-sevenths-and-progressions",
    learningPathSlug: "intervals-and-harmony",
    title: "Module 3 · Seventh Chords & Roman Numeral Analysis",
    summary: "From V7 resolutions and diatonic Roman numerals to common progressions.",
    sortOrder: 3,
  },
];

export const PATH_3_LESSONS: AcademyLessonContent[] = [
  {
    slug: "understanding-intervals",
    title: "Understanding intervals",
    summary:
      "Distinguish melodic vs. harmonic intervals and calculate generic interval numbers cleanly by counting alphabetical letter names.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "intervals-and-acoustics",
    level: "intermediate",
    estimatedMinutes: 8,
    sortOrder: 1,
    objectives: [
      "Differentiate melodic intervals (sounded sequentially) from harmonic intervals (sounded simultaneously).",
      "Count inclusive alphabet letter steps—lines and spaces—to establish generic interval size (1st through 8th).",
      "Separate letter quantity (4th vs. 3rd) from semitone spacing.",
    ],
    sections: [
      {
        id: "generic-size",
        heading: "1. Melodic vs. harmonic & inclusive letter counting",
        body: [
          "An interval measures the pitch distance between two notes. Played one after another, they form a melodic interval; played together, they form a harmonic interval.",
          "Before naming an interval's quality (major, minor, perfect), always count the inclusive generic letter span from lower note to upper note—counting both boundary letters as 1. From C to G covers C(1)–D(2)–E(3)–F(4)–G(5) = a 5th.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4"], duration: "q" },
            { keys: ["G4"], duration: "q" },
            { keys: ["C4", "G4"], duration: "h" },
          ],
          label: "Melodic fifth C4 to G4 followed by harmonic fifth C4 and G4 together",
          caption:
            "Melodic fifth (C4 then G4) followed by a harmonic fifth (C4 + G4 sounded simultaneously).",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.45 },
          { notes: ["G4"], at: 0.5, duration: 0.45 },
          { notes: ["C4", "G4"], at: 1.05, duration: 1.1 },
        ],
        audioLabel: "Hear melodic vs. harmonic fifth (C4–G4)",
      },
    ],
    repertoireExample: {
      composer: "Richard Strauss",
      work: "Also sprach Zarathustra, Op. 30",
      barReference: "Sunrise fanfare, bars 1–9",
      insight:
        "Strauss opens with rising open fifths and octaves (C–G–C), giving listeners pure generic clarity before any major or minor triad third enters.",
      audioSteps: [
        { notes: ["C3"], at: 0, duration: 0.55 },
        { notes: ["G3"], at: 0.58, duration: 0.55 },
        { notes: ["C4"], at: 1.16, duration: 1.0 },
      ],
      audioLabel: "Hear rising C–G–C fifth/octave fanfare",
    },
    workedExample: {
      title: "Why C–F♯ is a 4th while C–G♭ is a 5th",
      scenario: "Compare two intervals spanning identical 6-semitone keyboard width.",
      steps: [
        "C to F♯ counts C(1)–D(2)–E(3)–F(4): generic size = 4th.",
        "C to G♭ counts C(1)–D(2)–E(3)–F(4)–G(5): generic size = 5th.",
      ],
      conclusion:
        "Letter spelling alone determines the generic number; accidentals qualify how wide that letter span stretches.",
    },
    practiceActivities: [
      {
        id: "intervals-q1",
        prompt: "What is the generic interval size from E4 up to C5 (ignoring accidentals)?",
        options: [
          { id: "5th", label: "5th" },
          { id: "6th", label: "6th" },
          { id: "7th", label: "7th" },
          { id: "4th", label: "4th" },
        ],
        correctOptionId: "6th",
        explanation: "Count inclusively: E(1)–F(2)–G(3)–A(4)–B(5)–C(6) = a 6th.",
      },
    ],
    summaryText:
      "Every interval combines an inclusive letter count (generic number) with a precise semitone quality.",
    keyTakeaways: [
      "Melodic = sequential notes; harmonic = simultaneous notes.",
      "Count bottom letter as 1 up to top letter to lock in the generic interval size.",
    ],
  },
  {
    slug: "interval-classification",
    title: "Interval classification",
    summary:
      "Assign exact classical qualities—Perfect, Major, Minor, Augmented, and Diminished—and master the Rule of Nine for interval inversion.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "intervals-and-acoustics",
    level: "intermediate",
    estimatedMinutes: 11,
    sortOrder: 2,
    objectives: [
      "Separate Perfect intervals (1, 4, 5, 8) from Major/Minor intervals (2, 3, 6, 7).",
      "Contract or expand semitones accurately using Diminished and Augmented labels.",
      "Invert intervals quickly using the Rule of Nine (numbers sum to 9; P↔P, M↔m, A↔d).",
    ],
    sections: [
      {
        id: "quality-groups",
        heading: "1. Two families of quality & inversion",
        body: [
          "Classical theory sorts generic intervals into two quality families based on the Major scale built from the lower note: Unison (0 semitones), 4th (5), 5th (7), and Octave (12) are PERFECT. Expanding a Perfect interval by 1 semitone makes it AUGMENTED; shrinking it by 1 semitone makes it DIMINISHED.",
          "Meanwhile 2nds (2 semitones), 3rds (4), 6ths (9), and 7ths (11) are MAJOR in the major scale. Lowering a Major interval by 1 semitone produces MINOR (1, 3, 8, 10 semitones); lowering minor by another semitone produces DIMINISHED; raising Major by 1 semitone produces AUGMENTED.",
          "Inverting an interval swaps bottom and top notes within one octave: new number = 9 − original number, and qualities flip mirror-fashion (Perfect ↔ Perfect, Major ↔ Minor, Augmented ↔ Diminished).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4", "E4"], duration: "h" },
            { keys: ["C4", "Eb4"], duration: "h" },
            { keys: ["C4", "F#4"], duration: "h" },
            { keys: ["C4", "G4"], duration: "h" },
          ],
          label: "Major 3rd C-E, Minor 3rd C-Eb, Augmented 4th C-F#, and Perfect 5th C-G",
          caption:
            "Major 3rd (4 st), Minor 3rd (3 st), Augmented 4th tritone (6 st), and Perfect 5th (7 st).",
        },
        audioSteps: [
          { notes: ["C4", "E4"], at: 0, duration: 0.7 },
          { notes: ["C4", "Eb4"], at: 0.78, duration: 0.7 },
          { notes: ["C4", "F#4"], at: 1.56, duration: 0.7 },
          { notes: ["C4", "G4"], at: 2.34, duration: 0.9 },
        ],
        audioLabel: "Compare M3, m3, A4 tritone, and P5",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Piano Sonata No. 8 in C minor ('Pathétique'), Op. 13",
      barReference: "Opening Grave chord & diminished leap",
      insight:
        "Beethoven punctuates tragic urgency with diminished seventh leaps and minor thirds before balancing them with singing major sixths (inversions of minor thirds).",
      audioSteps: [
        { notes: ["C4", "G4"], at: 0, duration: 0.3 },
        { notes: ["G4"], at: 0.32, duration: 0.6 },
        { notes: ["Ab4"], at: 0.94, duration: 0.35 },
        { notes: ["B4"], at: 1.32, duration: 0.65 },
      ],
      audioLabel: "Hear Pathétique diminished-7th tension",
    },
    workedExample: {
      title: "Naming D up to B♭ in two steps",
      scenario: "Identify both number and quality for D4 → B♭4.",
      steps: [
        "1. Letter count: D(1)–E(2)–F(3)–G(4)–A(5)–B(6) = 6th.",
        "2. Check D Major scale: D Major has F♯ and C♯ (natural B♮ is Major 6th above D, 9 semitones).",
        "3. B♭4 lowers that Major 6th by 1 semitone (8 semitones) → Minor 6th.",
        "Bonus inversion check: B♭4 up to D5 = Major 3rd (6 + 3 = 9, Minor ↔ Major).",
      ],
      conclusion: "D4 to B♭4 is a Minor 6th (8 semitones).",
    },
    practiceActivities: [
      {
        id: "class-q1",
        prompt: "When you invert a Major 6th (e.g., C4–A4 becomes A4–C5), what interval results?",
        options: [
          { id: "m3", label: "Minor 3rd" },
          { id: "M3", label: "Major 3rd" },
          { id: "P4", label: "Perfect 4th" },
          { id: "d3", label: "Diminished 3rd" },
        ],
        correctOptionId: "m3",
        explanation: "By the Rule of Nine: 9 − 6 = 3, and Major inverts to Minor → Minor 3rd.",
      },
    ],
    summaryText:
      "Qualify intervals precisely using the lower note's major scale and flip any interval's number (9 − n) and quality via inversion.",
    keyTakeaways: [
      "1, 4, 5, 8 = Perfect family (dim ↔ Perf ↔ Aug).",
      "2, 3, 6, 7 = Major/Minor family (dim ↔ min ↔ Maj ↔ Aug).",
      "Inversions sum to 9 and flip Major ↔ Minor, Augmented ↔ Diminished, while Perfect remains Perfect.",
    ],
  },
  {
    slug: "consonance-and-dissonance",
    title: "Consonance and dissonance",
    summary:
      "Understand how simple overtone ratios produce stable consonances versus restless dissonances that drive melodic resolution.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "intervals-and-acoustics",
    level: "intermediate",
    estimatedMinutes: 8,
    sortOrder: 3,
    objectives: [
      "Distinguish perfect consonances (P1, P5, P8), imperfect consonances (m3, M3, m6, M6), and dissonances (2nds, 7ths, tritones).",
      "Explain why small integer frequency ratios (2:1, 3:2, 5:4) fuse smoothly in hearing.",
      "Understand the classical treatment of the Perfect 4th against the bass.",
    ],
    sections: [
      {
        id: "stability-hierarchy",
        heading: "1. Acoustic stability vs. harmonic drive",
        body: [
          "Consonance and dissonance describe how settled or restless two sounding tones feel. Open Perfect Consonances—Octave (2:1) and Perfect Fifth (3:2)—lock cleanly into acoustic stability. Imperfect Consonances—Major/Minor Thirds and Sixths—bring warm harmonic color without destabilizing repose.",
          "Dissonances—Seconds, Sevenths, and all Augmented/Diminished intervals including the Tritone (A4/d5)—rub adjacent frequencies together, creating rhythmic acoustic shimmer that classical syntax resolves by step into nearby consonances.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["F4", "B4"], duration: "h" },
            { keys: ["E4", "C5"], duration: "h" },
          ],
          label: "Dissonant tritone F4–B4 resolving contrapuntally outward to Minor 6th E4–C5",
          caption:
            "Contrary motion resolution: tritone (F–B) expands cleanly into consonant sixth (E–C).",
        },
        audioSteps: [
          { notes: ["F4", "B4"], at: 0, duration: 0.9 },
          { notes: ["E4", "C5"], at: 0.95, duration: 1.2 },
        ],
        audioLabel: "Hear tritone dissonance (F–B) resolve to consonance (E–C)",
      },
    ],
    repertoireExample: {
      composer: "Giovanni Pierluigi da Palestrina",
      work: "Missa Papae Marcelli, Kyrie",
      barReference: "Cadential suspensions",
      insight:
        "Renaissance counterpoint treats consonance as structural rest and uses held dissonances strictly as prepared suspensions that melt stepwise downward into major/minor thirds or sixths.",
      audioSteps: [
        { notes: ["C4", "D5"], at: 0, duration: 0.55 },
        { notes: ["C4", "C5"], at: 0.58, duration: 0.55 },
        { notes: ["B3", "B4"], at: 1.16, duration: 0.55 },
        { notes: ["C4", "C5"], at: 1.75, duration: 0.9 },
      ],
      audioLabel: "Hear classical 9–8 suspension resolving into consonance",
    },
    workedExample: {
      title: "Resolving a harmonic Major 7th",
      scenario: "Resolve C4–B4 harmonically by moving a single voice.",
      steps: [
        "C4–B4 forms a tense Major 7th (B4 wants to pull upward by semitone as leading tone).",
        "Raise B4 cleanly by 1 semitone to C5 while holding C4.",
        "Result: C4–C5 (Perfect Octave—complete acoustic repose).",
      ],
      conclusion:
        "Dissonance creates linear longing; stepwise movement into consonance relieves it.",
    },
    practiceActivities: [
      {
        id: "cons-q1",
        prompt: "Which pair belongs strictly to the category of IMPERFECT consonances?",
        options: [
          { id: "p5-p8", label: "Perfect 5th and Perfect Octave" },
          { id: "m3-M6", label: "Minor 3rd and Major 6th" },
          { id: "m2-M7", label: "Minor 2nd and Major 7th" },
          { id: "A4-d5", label: "Augmented 4th and Diminished 5th" },
        ],
        correctOptionId: "m3-M6",
        explanation:
          "3rds and 6ths (both major and minor) are warm imperfect consonances; 5ths/8ves are perfect consonances.",
      },
    ],
    summaryText:
      "Consonances anchor tonal repose while dissonances supply essential tension propelling melody and harmony forward.",
    keyTakeaways: [
      "Perfect consonances = P1, P5, P8; Imperfect consonances = m3, M3, m6, M6.",
      "Dissonances (2nds, 7ths, tritones) crave stepwise resolution into consonances.",
    ],
  },
  {
    slug: "triads",
    title: "Triads",
    summary:
      "Understand tertian triad stacking—root, third, and fifth—to build the structural foundation of Western tonal harmony.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "triads-and-voicing",
    level: "intermediate",
    estimatedMinutes: 8,
    sortOrder: 4,
    objectives: [
      "Construct a root-position triad by stacking alternate scale steps (root, 3rd, 5th).",
      "Read root-position triads visually on the staff as three stacked lines or three stacked spaces.",
      "Distinguish the seven diatonic triads naturally arising in a major key.",
    ],
    sections: [
      {
        id: "tertian-stacking",
        heading: "1. Three stacked lines or three stacked spaces",
        body: [
          "Tonal harmony is built primarily in stacked thirds (tertian harmony). Pick any pitch as your Root, skip a letter to add its Third, and skip another letter to add its Fifth.",
          "In close root position on any staff, a triad forms an unmistakable snowman silhouette: either three consecutive lines (e.g., E4–G4–B4) or three consecutive spaces (F4–A4–C5).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4", "E4", "G4"], duration: "h" },
            { keys: ["F4", "A4", "C5"], duration: "h" },
            { keys: ["G4", "B4", "D5"], duration: "h" },
          ],
          label: "Three root-position diatonic triads C major, F major, and G major",
          caption:
            "Root-position triads C–E–G (lines/ledger), F–A–C (three stacked spaces), and G–B–D (three stacked lines).",
        },
        audioSteps: [
          { notes: ["C4", "E4", "G4"], at: 0, duration: 0.75 },
          { notes: ["F4", "A4", "C5"], at: 0.8, duration: 0.75 },
          { notes: ["G4", "B4", "D5"], at: 1.6, duration: 0.75 },
          { notes: ["C4", "E4", "G4"], at: 2.4, duration: 1.0 },
        ],
        audioLabel: "Hear I–IV–V–I root-position triads",
      },
    ],
    repertoireExample: {
      composer: "Franz Schubert",
      work: "Moment Musical No. 6 in A♭ major",
      barReference: "Hymn-like opening bars 1–8",
      insight:
        "Clear root-position triads give homophonic chorale melodies an effortless pillar-like stillness before passing tones gently ripple between chords.",
      audioSteps: [
        { notes: ["Ab4", "C5", "Eb5"], at: 0, duration: 0.85 },
        { notes: ["Db4", "F4", "Ab4"], at: 0.9, duration: 0.85 },
        { notes: ["Eb4", "G4", "Bb4"], at: 1.8, duration: 0.85 },
        { notes: ["Ab4", "C5", "Eb5"], at: 2.7, duration: 1.1 },
      ],
      audioLabel: "Hear A♭ major choral triadic progression",
    },
    workedExample: {
      title: "Building a root-position triad on B",
      scenario: "Find the three letter names belonging to a root-position B triad.",
      steps: ["Root = B.", "Skip C → 3rd = D.", "Skip E → 5th = F."],
      conclusion:
        "Every B triad uses letters B–D–F regardless of accidentals (B–D–F = diminished, B–D–F♯ = minor, B–D♯–F♯ = major).",
    },
    practiceActivities: [
      {
        id: "triads-q1",
        prompt: "Which three letter names form a root-position triad rooted on D?",
        options: [
          { id: "dfg", label: "D – F – G" },
          { id: "dfa", label: "D – F – A" },
          { id: "dea", label: "D – E – A" },
          { id: "dab", label: "D – A – B" },
        ],
        correctOptionId: "dfa",
        explanation: "Stacking thirds upward from D gives Root (D), 3rd (F), and 5th (A).",
      },
    ],
    summaryText:
      "Triads pair a root, third, and fifth into music's basic three-note chord unit, stacking uniformly on lines or spaces in close root position.",
    keyTakeaways: [
      "Triad = Root + 3rd + 5th above root.",
      "Close root-position triads always align symmetrically: line–line–line or space–space–space.",
    ],
  },
  {
    slug: "major-and-minor-chords",
    title: "Major and minor chords",
    summary: "Spell and recognize Major (M3 + m3) and Minor (m3 + M3) triads quickly in any key.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "triads-and-voicing",
    level: "intermediate",
    estimatedMinutes: 9,
    sortOrder: 5,
    objectives: [
      "Spell Major triads with a Major 3rd on the bottom (4 semitones) and a Minor 3rd on top (3 semitones), framing a Perfect 5th.",
      "Spell Minor triads by reversing the stack: Minor 3rd on the bottom (3 st) + Major 3rd on top (4 st).",
      "Convert any Major triad into its parallel Minor triad by lowering the 3rd by one semitone.",
    ],
    sections: [
      {
        id: "major-vs-minor-structure",
        heading: "1. Symmetric third pairs sharing a Perfect Fifth",
        body: [
          "Both Major and Minor triads rest upon a stable Perfect Fifth (7 semitones) between root and fifth. What defines their contrasting mood sits in the middle voice—the chordal third.",
          "A MAJOR triad places a Major 3rd (4 semitones) beneath a Minor 3rd (3 semitones), as in C–E–G or A–C♯–E. A MINOR triad flips them—Minor 3rd (3 semitones) beneath a Major 3rd (4 semitones), as in C–E♭–G or A–C–E.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4", "E4", "G4"], duration: "h" },
            { keys: ["C4", "Eb4", "G4"], duration: "h" },
            { keys: ["A4", "C#5", "E5"], duration: "h" },
            { keys: ["A4", "C5", "E5"], duration: "h" },
          ],
          label: "C major vs C minor, and A major vs A minor triads",
          caption:
            "Lowering the chordal 3rd one semitone turns Major (C–E–G, A–C♯–E) directly into Minor (C–E♭–G, A–C–E).",
        },
        audioSteps: [
          { notes: ["C4", "E4", "G4"], at: 0, duration: 0.7 },
          { notes: ["C4", "Eb4", "G4"], at: 0.78, duration: 0.7 },
          { notes: ["A4", "C#5", "E5"], at: 1.56, duration: 0.7 },
          { notes: ["A4", "C5", "E5"], at: 2.34, duration: 0.9 },
        ],
        audioLabel: "Compare Major and Minor parallel pairs",
      },
    ],
    repertoireExample: {
      composer: "Franz Schubert",
      work: "Gute Nacht (Winterreise, D. 911 No. 1)",
      barReference: "Stanza 4 modal shift into D major",
      insight:
        "Schubert famously melts hearts across songs simply by brightening the minor third into a major third (e.g. D–F–A becoming D–F♯–A) as tender memory surfaces.",
      audioSteps: [
        { notes: ["D4", "F4", "A4"], at: 0, duration: 0.85 },
        { notes: ["D4", "F#4", "A4"], at: 0.92, duration: 1.1 },
      ],
      audioLabel: "Hear D minor opening out into D major",
    },
    workedExample: {
      title: "Spelling E Major and F Minor triads",
      scenario: "Spell root-position triads from first principles.",
      steps: [
        "E triad letters = E–G–B. From E up 4 semitones = G♯; up 3 more = B (P5 above E). → E–G♯–B = E Major.",
        "F triad letters = F–A–C. F Major is F–A–C; lower the 3rd by 1 semitone → F–A♭–C = F Minor.",
      ],
      conclusion: "E Major = E–G♯–B; F Minor = F–A♭–C.",
    },
    practiceActivities: [
      {
        id: "majmin-q1",
        prompt: "Which pitches form a root-position B minor triad?",
        options: [
          { id: "bdf", label: "B – D – F" },
          { id: "bdfs", label: "B – D – F♯" },
          { id: "bdsfs", label: "B – D♯ – F♯" },
          { id: "bdbf", label: "B – D♭ – F" },
        ],
        correctOptionId: "bdfs",
        explanation: "B to D = 3 semitones (m3) and D to F♯ = 4 semitones (M3), framing B–F♯ (P5).",
      },
    ],
    summaryText:
      "Major triads stack M3 + m3 while Minor triads stack m3 + M3; lowering the third by a single semitone switches Major to Minor.",
    keyTakeaways: [
      "Major = M3 (4 st) + m3 (3 st).",
      "Minor = m3 (3 st) + M3 (4 st).",
      "Outer frame of both Major and Minor root-position triads is a Perfect 5th (7 st).",
    ],
  },
  {
    slug: "diminished-and-augmented-chords",
    title: "Diminished and augmented chords",
    summary:
      "Construct symmetric diminished (m3 + m3) and augmented (M3 + M3) triads and understand why both destabilize tonal focus.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "triads-and-voicing",
    level: "intermediate",
    estimatedMinutes: 8,
    sortOrder: 6,
    objectives: [
      "Spell Diminished triads from two stacked minor thirds (3 + 3 = 6 semitones, Diminished 5th).",
      "Spell Augmented triads from two stacked major thirds (4 + 4 = 8 semitones, Augmented 5th).",
      "Explain why both altered-fifth chords demand resolution toward major or minor triads.",
    ],
    sections: [
      {
        id: "symmetric-triads",
        heading: "1. Compressing or expanding the outer fifth",
        body: [
          "Unlike Major and Minor triads with their stable Perfect 5th, Diminished and Augmented triads alter the fifth into acoustic restlessness. Lower the 5th of a minor triad by a semitone to get a DIMINISHED triad (two stacked minor thirds: e.g., B–D–F or C–E♭–G♭, spanning a tense tritone).",
          "Raise the 5th of a major triad by a semitone to get an AUGMENTED triad (two stacked major thirds: e.g., C–E–G♯, spanning 8 semitones). Every major key naturally contains one diminished triad built on the leading tone (vii° = B–D–F in C major).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["B4", "D5", "F5"], duration: "h" },
            { keys: ["C4", "E4", "G#4"], duration: "h" },
          ],
          label: "Diminished triad B-D-F followed by Augmented triad C-E-G#",
          caption:
            "B Diminished (m3 + m3, B–F tritone) contrasted with C Augmented (M3 + M3, C–G♯).",
        },
        audioSteps: [
          { notes: ["B4", "D5", "F5"], at: 0, duration: 0.9 },
          { notes: ["C4", "E4", "G4"], at: 0.95, duration: 0.7 },
          { notes: ["C4", "E4", "G#4"], at: 1.75, duration: 1.0 },
        ],
        audioLabel: "Hear B Diminished and C Augmented triads",
      },
    ],
    repertoireExample: {
      composer: "Franz Liszt",
      work: "Nuages gris, S. 199 / Faust Symphony opening",
      barReference: "Unresolved augmented chains",
      insight:
        "Because an augmented triad divides the octave symmetrically into three equal major thirds (4 + 4 + 4 = 12 semitones), composers use augmented chords to suspend gravitational certainty.",
      audioSteps: [
        { notes: ["C4", "E4", "G#4"], at: 0, duration: 0.85 },
        { notes: ["F4", "A4", "C5"], at: 0.95, duration: 1.0 },
      ],
      audioLabel: "Hear C+ augmented voice-leading into A minor/F major",
    },
    workedExample: {
      title: "Transforming D Major into D Diminished and D Augmented",
      scenario: "Adjust the fifth (and third) starting from D–F♯–A.",
      steps: [
        "D Major = D–F♯–A.",
        "To make D Augmented (D+): keep F♯ and raise the 5th A → A♯ (D–F♯–A♯).",
        "To make D Diminished (d°): lower both 3rd (F♯ → F♮) and 5th (A → A♭) → D–F–A♭.",
      ],
      conclusion: "D+ = D–F♯–A♯; d° = D–F–A♭.",
    },
    practiceActivities: [
      {
        id: "dimaug-q1",
        prompt: "Which set of pitches creates a C♯ Diminished triad?",
        options: [
          { id: "cseg", label: "C♯ – E – G" },
          { id: "csegs", label: "C♯ – E – G♯" },
          { id: "csesgs", label: "C♯ – E♯ – G♯" },
          { id: "csesg", label: "C♯ – E♯ – G" },
        ],
        correctOptionId: "cseg",
        explanation: "C♯ to E = m3 (3 st) and E to G = m3 (3 st), spanning a diminished 5th C♯–G.",
      },
    ],
    summaryText:
      "Diminished (m3 + m3) and Augmented (M3 + M3) triads alter the stable outer fifth, injecting urgent dissonance and color.",
    keyTakeaways: [
      "Diminished = Root + m3 + d5 (3 + 3 semitones); naturally built on scale degree 7 (vii°).",
      "Augmented = Root + M3 + A5 (4 + 4 semitones); symmetric 1/3-octave division.",
    ],
  },
  {
    slug: "chord-inversions",
    title: "Chord inversions",
    summary:
      "Move the bass voice cleanly between root position, first inversion (6), and second inversion (6/4) to create smooth melodic basslines.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "intervals-and-triads",
    moduleSlug: "triads-and-voicing",
    level: "intermediate",
    estimatedMinutes: 10,
    sortOrder: 7,
    objectives: [
      "Identify triad inversions solely by which chord member (Root, 3rd, or 5th) sits in the lowest bass voice.",
      "Apply standard figured bass / Roman inversion numerals: root position (5/3), first inversion (6), second inversion (6/4).",
      "Read slash chord notation cleanly (e.g., C/E = C major triad with E in the bass).",
    ],
    sections: [
      {
        id: "bass-determines-inversion",
        heading: "1. Only the lowest sounding note decides inversion",
        body: [
          "Reordering upper notes does NOT change chord inversion: only which chord member sits in the BASS (the lowest sounding note) determines the inversion. When the Root sits in the bass, the triad is in ROOT POSITION (5/3).",
          "When the 3rd sits in the bass, the chord is in FIRST INVERSION (figured 6 or 6/3, slash e.g. C/E)—lightweight and flowing, ideal for stepwise basslines. When the 5th sits in the bass, the chord is in SECOND INVERSION (figured 6/4, slash e.g. C/G)—unstable because of the fourth above the bass, reserved classically for cadential, passing, or pedal effects.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4", "E4", "G4"], duration: "h" },
            { keys: ["E4", "G4", "C5"], duration: "h" },
            { keys: ["G4", "C5", "E5"], duration: "h" },
          ],
          label:
            "C major triad in root position (C-E-G), first inversion (E-G-C), and second inversion (G-C-E)",
          caption:
            "Root position (C bass), 1st inversion I6 (E bass), and 2nd inversion I6/4 (G bass).",
        },
        audioSteps: [
          { notes: ["C4", "E4", "G4"], at: 0, duration: 0.75 },
          { notes: ["E4", "G4", "C5"], at: 0.85, duration: 0.75 },
          { notes: ["G4", "C5", "E5"], at: 1.7, duration: 1.0 },
        ],
        audioLabel: "Hear root position → 1st inversion → 2nd inversion of C major",
      },
    ],
    repertoireExample: {
      composer: "Johann Sebastian Bach",
      work: "Air on the G String (Orchestral Suite No. 3 in D major, BWV 1068)",
      barReference: "Bars 1–4, descending walking bass",
      insight:
        "Bach avoids choppy root jumps in the cello bass by threading chords through first inversions (C♯ under A–C♯–E, F♯ under D–F♯–A), yielding a singing bass melody D–C♯–B–A–G♯.",
      audioSteps: [
        { notes: ["D3", "F#4", "A4"], at: 0, duration: 0.6 },
        { notes: ["C#3", "E4", "A4"], at: 0.62, duration: 0.6 },
        { notes: ["B2", "D4", "G4"], at: 1.24, duration: 0.6 },
        { notes: ["A2", "C#4", "E4"], at: 1.86, duration: 0.9 },
      ],
      audioLabel: "Hear first inversion creating a smooth stepwise bass",
    },
    workedExample: {
      title: "Identifying an F–A–D sonority",
      scenario: "Analyze the bass pitch D3? No—suppose the lowest bass note is F3 under A4 and D5.",
      steps: [
        "Arrange the pitches into stacked thirds to locate the Root: D–F–A (D minor triad).",
        "Check which member sits in the lowest bass voice: F3, which is the chordal 3rd of D–F–A.",
        "3rd in the bass = First Inversion.",
      ],
      conclusion: "F3–A4–D5 is D minor in First Inversion (Dm/F or i6 in D minor).",
    },
    practiceActivities: [
      {
        id: "inv-q1",
        prompt:
          "If a G Major triad (G–B–D) has D as its lowest bass pitch, what inversion is it in?",
        options: [
          { id: "root", label: "Root position (5/3)" },
          { id: "first", label: "First inversion (6)" },
          { id: "second", label: "Second inversion (6/4)" },
          { id: "third", label: "Third inversion (4/2)" },
        ],
        correctOptionId: "second",
        explanation:
          "D is the 5th of the G–B–D triad; putting the 5th in the bass creates Second Inversion (6/4).",
      },
    ],
    summaryText:
      "Inversions place the 3rd (6) or 5th (6/4) into the bass, enabling linear stepwise basslines while retaining harmonic identity.",
    keyTakeaways: [
      "Root in bass = Root position; 3rd in bass = 1st Inversion (6); 5th in bass = 2nd Inversion (6/4).",
      "Upper voicings can spread widely across staves without altering the inversion.",
    ],
  },
  {
    slug: "seventh-chords",
    title: "Seventh chords",
    summary:
      "Extend triads with a fourth stacked third to form Dominant 7th, Major 7th, Minor 7th, and Diminished 7th chords.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "inversions-sevenths-and-progressions",
    moduleSlug: "sevenths-and-tonal-syntax",
    level: "intermediate",
    estimatedMinutes: 10,
    sortOrder: 8,
    objectives: [
      "Add a 7th above a triad's root (Root–3rd–5th–7th) to build four-note seventh chords.",
      "Distinguish Major 7th (Maj triad + M7), Dominant 7th (Maj triad + m7), and Minor 7th (min triad + m7).",
      "Hear the tritone inside Dominant 7th (V7, e.g. B–F inside G–B–D–F) pulling cleanly inward to tonic.",
    ],
    sections: [
      {
        id: "five-common-sevenths",
        heading: "1. Dominant 7th, Major 7th, and Minor 7th",
        body: [
          "Stacking one more third atop a triad yields a four-note SEVENTH CHORD. Two ingredients name every seventh chord: [Triad quality] + [7th interval above the root].",
          "1. Dominant Seventh (G7 = G–B–D–F): Major triad + minor 7th. Contains the potent B–F tritone between 3rd and 7th—giving V7 its irresistible harmonic drive into C major. 2. Major Seventh (Cmaj7 = C–E–G–B): Major triad + Major 7th. 3. Minor Seventh (Dm7 = D–F–A–C): Minor triad + minor 7th. 4. Half-diminished 7th (Bm7♭5 = B–D–F–A): Diminished triad + minor 7th. 5. Fully diminished 7th (B°7 = B–D–F–A♭): Diminished triad + diminished 7th.",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["G4", "B4", "D5", "F5"], duration: "h" },
            { keys: ["C4", "E4", "G4", "C5"], duration: "h" },
          ],
          label: "G dominant seventh chord (G-B-D-F) resolving to C major (C-E-G-C)",
          caption: "V7 (G–B–D–F): B4 pushes up to C5 while chordal 7th F5 steps down to E4.",
        },
        audioSteps: [
          { notes: ["G4", "B4", "D5", "F5"], at: 0, duration: 0.9 },
          { notes: ["C4", "E4", "G4", "C5"], at: 0.95, duration: 1.2 },
        ],
        audioLabel: "Hear G7 dominant seventh resolve to C major",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Symphony No. 1 in C major, Op. 21",
      barReference: "Introduction, measure 1",
      insight:
        "Famously, Beethoven refused to begin his C major symphony with a C major chord—opening bar 1 directly with an off-tonic C7 dominant chord pointing toward F major!",
      audioSteps: [
        { notes: ["C4", "E4", "G4", "Bb4"], at: 0, duration: 0.95 },
        { notes: ["F4", "A4", "C5"], at: 1.0, duration: 1.1 },
      ],
      audioLabel: "Hear opening C7 dominant push into F major",
    },
    workedExample: {
      title: "Building D7 vs. Dmaj7 vs. Dm7",
      scenario: "Spell all three seventh types rooted on D.",
      steps: [
        "D triad letters = D–F–A–C.",
        "Dmaj7 (Major triad + Major 7th): D – F♯ – A – C♯.",
        "D7 (Dominant = Major triad + minor 7th): D – F♯ – A – C♮.",
        "Dm7 (Minor triad + minor 7th): D – F♮ – A – C♮.",
      ],
      conclusion: "Changing just two half steps spans Dmaj7 → D7 → Dm7 cleanly.",
    },
    practiceActivities: [
      {
        id: "seventh-q1",
        prompt:
          "Which chord combines a Major triad with a minor 7th above the root (e.g. G–B–D–F)?",
        options: [
          { id: "maj7", label: "Major seventh (Maj7)" },
          { id: "dom7", label: "Dominant seventh (7)" },
          { id: "min7", label: "Minor seventh (m7)" },
          { id: "hdim7", label: "Half-diminished seventh (ø7)" },
        ],
        correctOptionId: "dom7",
        explanation:
          "A Major triad + minor 7th defines the Dominant seventh chord (built naturally on scale degree 5).",
      },
    ],
    summaryText:
      "Seventh chords layer a fourth note onto a triad, with Dominant V7 supplying classical harmony's strongest cadential pull via its resolving chordal 7th.",
    keyTakeaways: [
      "Always evaluate [Triad quality] + [7th size above root].",
      "The chordal 7th is an active dissonance that classically resolves downward by step (e.g., F → E in G7 → C).",
    ],
  },
  {
    slug: "roman-numeral-analysis",
    title: "Roman numeral analysis",
    summary:
      "Label diatonic chords independently of specific key names using uppercase/lowercase Roman numerals (I, ii, iii, IV, V, vi, vii°).",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "inversions-sevenths-and-progressions",
    moduleSlug: "sevenths-and-tonal-syntax",
    level: "intermediate",
    estimatedMinutes: 9,
    sortOrder: 9,
    objectives: [
      "Memorize the diatonic triad qualities of EVERY Major key: I, ii, iii, IV, V, vi, vii°.",
      "Recognize natural/harmonic minor chord qualities: i, ii°, III, iv, V (or v), VI, vii°.",
      "Read key-independent harmonic function across transposed keys.",
    ],
    sections: [
      {
        id: "diatonic-roman-system",
        heading: "1. Key-independent harmonic grammar",
        body: [
          "Roman numeral analysis strips away pitch-specific labels like 'G major vs F♯ major' to expose pure harmonic syntax. Case encodes chord quality: UPPERCASE (I, IV, V) = Major; lowercase (ii, iii, vi) = minor; lowercase with circle (vii°, ii°) = diminished.",
          "Across EVERY major key, stacking only scale notes on degrees 1–7 builds an unvarying pattern: I (Maj) – ii (min) – iii (min) – IV (Maj) – V (Maj) – vi (min) – vii° (dim).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4", "E4", "G4"], duration: "q" },
            { keys: ["D4", "F4", "A4"], duration: "q" },
            { keys: ["E4", "G4", "B4"], duration: "q" },
            { keys: ["F4", "A4", "C5"], duration: "q" },
            { keys: ["G4", "B4", "D5"], duration: "q" },
            { keys: ["A4", "C5", "E5"], duration: "q" },
            { keys: ["B4", "D5", "F5"], duration: "q" },
          ],
          label: "Seven diatonic triads of C major: I, ii, iii, IV, V, vi, vii°",
          caption:
            "Diatonic triads of C Major: I (C), ii (Dm), iii (Em), IV (F), V (G), vi (Am), vii° (B°).",
        },
        audioSteps: [
          { notes: ["C4", "E4", "G4"], at: 0, duration: 0.45 },
          { notes: ["D4", "F4", "A4"], at: 0.48, duration: 0.45 },
          { notes: ["E4", "G4", "B4"], at: 0.96, duration: 0.45 },
          { notes: ["F4", "A4", "C5"], at: 1.44, duration: 0.45 },
          { notes: ["G4", "B4", "D5"], at: 1.92, duration: 0.45 },
          { notes: ["A4", "C5", "E5"], at: 2.4, duration: 0.45 },
          { notes: ["B4", "D5", "F5"], at: 2.88, duration: 0.45 },
          { notes: ["C5", "E5", "G5"], at: 3.36, duration: 0.85 },
        ],
        audioLabel: "Hear diatonic triad sequence I–ii–iii–IV–V–vi–vii°–I",
      },
    ],
    repertoireExample: {
      composer: "Johann Pachelbel",
      work: "Canon in D major",
      barReference: "Ground bass ostinato (bars 1–2)",
      insight:
        "Pachelbel's perpetual 8-chord progression reads cleanly as I – V – vi – iii – IV – I – IV – V regardless of which key a string ensemble chooses.",
      audioSteps: [
        { notes: ["D4", "F#4", "A4"], at: 0, duration: 0.5 },
        { notes: ["A3", "E4", "A4"], at: 0.52, duration: 0.5 },
        { notes: ["B3", "D4", "F#4"], at: 1.04, duration: 0.5 },
        { notes: ["F#3", "C#4", "F#4"], at: 1.56, duration: 0.5 },
      ],
      audioLabel: "Hear opening of Pachelbel's I–V–vi–iii sequence",
    },
    workedExample: {
      title: "Labeling E minor and A7 inside the key of D Major",
      scenario: "Identify the Roman numerals when key = D Major.",
      steps: [
        "Scale of D Major: D(1) – E(2) – F♯(3) – G(4) – A(5) – B(6) – C♯(7).",
        "E–G–B builds a minor triad on scale degree 2 → ii.",
        "A–C♯–E–G builds a dominant seventh on scale degree 5 → V7.",
      ],
      conclusion: "In D Major, Em → A7 → D reads cleanly as ii → V7 → I.",
    },
    practiceActivities: [
      {
        id: "roman-q1",
        prompt: "In the key of G Major, what Roman numeral describes an E minor chord (E–G–B)?",
        options: [
          { id: "ii", label: "ii" },
          { id: "iii", label: "iii" },
          { id: "iv", label: "iv" },
          { id: "vi", label: "vi" },
        ],
        correctOptionId: "vi",
        explanation:
          "Count scale degrees in G major: G(1)–A(2)–B(3)–C(4)–D(5)–E(6). Degree 6 produces a minor triad: vi.",
      },
    ],
    summaryText:
      "Roman numerals turn key-specific chord letters into reusable functional patterns transferable across all twelve keys.",
    keyTakeaways: [
      "Major key triad pattern: I – ii – iii – IV – V – vi – vii°.",
      "Uppercase = Major, lowercase = minor, ° = diminished, + = augmented.",
    ],
  },
  {
    slug: "basic-harmonic-progressions",
    title: "Basic harmonic progressions",
    summary:
      "Understand Tonic, Predominant, and Dominant functions, identify Authentic, Half, Plagal, and Deceptive cadences, and build balanced progressions.",
    learningPathSlug: "intervals-and-harmony",
    courseSlug: "inversions-sevenths-and-progressions",
    moduleSlug: "sevenths-and-tonal-syntax",
    level: "intermediate",
    estimatedMinutes: 11,
    sortOrder: 10,
    objectives: [
      "Group chords into three functional roles: Tonic (I, vi), Predominant (ii, IV), Dominant (V, V7, vii°).",
      "Recognize standard functional cycle motion: T → PD → D → T (e.g., I – ii6 – V – I or I – IV – V – I).",
      "Distinguish Authentic (V–I), Half (ending on V), Plagal (IV–I), and Deceptive (V–vi) cadences.",
    ],
    sections: [
      {
        id: "phrase-functions-and-cadences",
        heading: "1. T → PD → D → T & the four classical cadences",
        body: [
          "Common-practice harmony thrives on forward harmonic drive rather than random chord changes. Chords serve three functional roles: TONIC (stability/home: I, vi), PREDOMINANT (departure preparing dominant tension: IV, ii), and DOMINANT (urgent tension pulling home: V, V7, vii°).",
          "Phrases close with CADENCES—musical punctuation marks: 1. Authentic Cadence (V → I, conclusive full stop). 2. Half Cadence (ending unresolved on V, comma/question). 3. Plagal Cadence (IV → I, gentle 'Amen' repose). 4. Deceptive Cadence (V → vi, dramatic surprise postponing arrival).",
        ],
        notation: {
          clef: "treble",
          chords: [
            { keys: ["C4", "E4", "G4"], duration: "q" },
            { keys: ["D4", "F4", "A4"], duration: "q" },
            { keys: ["G4", "B4", "D5"], duration: "q" },
            { keys: ["C4", "E4", "G4"], duration: "q" },
          ],
          label: "Complete I - ii - V - I authentic cadence phrase in C major",
          caption: "Classic tonal arc: Tonic (I) → Predominant (ii) → Dominant (V) → Tonic (I).",
        },
        audioSteps: [
          { notes: ["C4", "E4", "G4"], at: 0, duration: 0.65 },
          { notes: ["D4", "F4", "A4"], at: 0.68, duration: 0.65 },
          { notes: ["G4", "B4", "D5"], at: 1.36, duration: 0.65 },
          { notes: ["C4", "E4", "G4"], at: 2.04, duration: 1.1 },
        ],
        audioLabel: "Hear complete T → PD → D → T (I–ii–V–I) progression",
      },
    ],
    repertoireExample: {
      composer: "Wolfgang Amadeus Mozart",
      work: "Piano Sonata No. 16 in C major, K. 545",
      barReference: "Bars 1–4",
      insight:
        "Notice Mozart's textbook opening phrase: I (bar 1) → V4/3 (bar 2) → I (bar 3) → IV–I6/4–V (bar 4 Half Cadence), answering smoothly to a full Authentic Cadence by bar 8.",
      audioSteps: [
        { notes: ["C4", "E4", "G4"], at: 0, duration: 0.6 },
        { notes: ["F4", "A4", "C5"], at: 0.62, duration: 0.6 },
        { notes: ["G4", "B4", "D5"], at: 1.24, duration: 0.6 },
        { notes: ["A4", "C5", "E5"], at: 1.86, duration: 1.0 },
      ],
      audioLabel: "Hear V → vi Deceptive Cadence surprise after IV",
    },
    workedExample: {
      title: "Spotting a Deceptive Cadence in F Major",
      scenario: "A phrase in F Major lands on C7 and resolves unexpectedly to Dm.",
      steps: [
        "In F Major, C7 = V7 (Dominant seventh).",
        "Standard Authentic Cadence expects F (I).",
        "Instead it steps into Dm (D–F–A) = scale degree 6 minor triad (vi).",
      ],
      conclusion: "V7 → vi is a Deceptive Cadence.",
    },
    practiceActivities: [
      {
        id: "prog-q1",
        prompt:
          "Which sequence follows the standard classical functional flow Tonic → Predominant → Dominant → Tonic?",
        options: [
          { id: "i-iv-v-i", label: "I → IV → V → I" },
          { id: "v-iv-i-v", label: "V → IV → I → V" },
          { id: "i-v-iv-vi", label: "I → V → IV → vi" },
          { id: "iv-i-iii-ii", label: "IV → I → iii → ii" },
        ],
        correctOptionId: "i-iv-v-i",
        explanation:
          "I (Tonic) departs to IV (Predominant), builds tension on V (Dominant), and resolves cleanly home to I.",
      },
    ],
    summaryText:
      "Tonal harmony organizes motion cleanly across Tonic, Predominant, and Dominant roles, punctuated by Authentic, Half, Plagal, and Deceptive cadences.",
    keyTakeaways: [
      "Tonic (I, vi) = home; Predominant (ii, IV) = transition; Dominant (V, V7, vii°) = arrival tension.",
      "Cadences: V–I (Authentic), ?–V (Half), IV–I (Plagal), V–vi (Deceptive).",
    ],
  },
];

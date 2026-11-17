import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_4_RHYTHM: AcademyPathDefinition = {
  slug: "rhythm-and-musical-reading",
  numeral: "IV",
  title: "Rhythm and Musical Reading",
  summary:
    "Internalize beat and pulse, compare simple vs. compound meter, decode dotted notes, ties, rests, syncopation, and triplets, and read complete musical passages fluently.",
  level: "elementary",
  sortOrder: 4,
};

export const PATH_4_COURSES: AcademyCourseDefinition[] = [
  {
    slug: "pulse-simple-and-compound-meter",
    learningPathSlug: "rhythm-and-musical-reading",
    title: "Pulse, Simple & Compound Time",
    description:
      "Feel primary metric pulse and distinguish binary simple subdivisions (2/4, 3/4, 4/4) from dotted ternary compound subdivisions (6/8, 9/8, 12/8).",
    level: "elementary",
    sortOrder: 1,
    estimatedMinutes: 35,
  },
  {
    slug: "rhythmic-nuance-and-passage-reading",
    learningPathSlug: "rhythm-and-musical-reading",
    title: "Dotted Values, Syncopation, Triplets & Sight-Reading",
    description:
      "Master rhythmic nuance—dots, ties, syncopations, tuplets, and beaming patterns—and synthesize pitch and rhythm in complete musical passages.",
    level: "elementary",
    sortOrder: 2,
    estimatedMinutes: 55,
  },
];

export const PATH_4_MODULES: AcademyModuleDefinition[] = [
  {
    slug: "beat-and-metrical-division",
    courseSlug: "pulse-simple-and-compound-meter",
    learningPathSlug: "rhythm-and-musical-reading",
    title: "Module 1 · Pulse & Metric Classification",
    summary: "Compare regular vs. triple beat subdivisions.",
    sortOrder: 1,
  },
  {
    slug: "dots-ties-and-cross-rhythm",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    learningPathSlug: "rhythm-and-musical-reading",
    title: "Module 2 · Dots, Ties, Syncopation & Triplets",
    summary: "Modify note durations across beats and barlines.",
    sortOrder: 2,
  },
  {
    slug: "rhythmic-patterns-and-sightreading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    learningPathSlug: "rhythm-and-musical-reading",
    title: "Module 3 · Beaming & Reading Complete Passages",
    summary: "Scan rhythm, key signature, clef, and phrase structure together.",
    sortOrder: 3,
  },
];

export const PATH_4_LESSONS: AcademyLessonContent[] = [
  {
    slug: "understanding-rhythm",
    title: "Understanding rhythm",
    summary:
      "Separate steady background pulse and meter from changing foreground rhythmic surface patterns.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "pulse-simple-and-compound-meter",
    moduleSlug: "beat-and-metrical-division",
    level: "elementary",
    estimatedMinutes: 7,
    sortOrder: 1,
    objectives: [
      "Distinguish Beat (underlying steady pulse), Meter (accent grouping), Tempo (speed), and Rhythm (pattern of note lengths).",
      "Hear how varied surface rhythms lock onto an unchanging beat grid.",
    ],
    sections: [
      {
        id: "rhythm-vs-beat",
        heading: "1. Surface rhythm riding an invisible steady pulse",
        body: [
          "Rhythm is not the same thing as Beat. The beat (like a calm clock) ticks evenly underneath music, while RHYTHM layers contrasting long and short durations across that steady grid.",
          "Meanwhile TEMPO dictates the speed of the beat (e.g., Allegro = fast, Adagio = slow), and METER groups beats into strong–weak cycles inside barlines.",
        ],
        notation: {
          clef: "treble",
          timeSignature: "4/4",
          chords: [
            { keys: ["C4"], duration: "h" },
            { keys: ["D4"], duration: "q" },
            { keys: ["E4"], duration: "q" },
          ],
          label: "Half note followed by two quarter notes in 4/4",
          caption:
            "Foreground rhythm changes (long–short–short: 2 + 1 + 1 beats) while four steady beats tick underneath.",
        },
        audioSteps: [
          { notes: ["C4"], at: 0, duration: 0.9 },
          { notes: ["D4"], at: 0.95, duration: 0.45 },
          { notes: ["E4"], at: 1.42, duration: 0.45 },
        ],
        audioLabel: "Hear long–short–short rhythm against steady pulse",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Symphony No. 7 in A major, Op. 92, II. Allegretto",
      barReference: "Persistent ostinato rhythm",
      insight:
        "Beethoven mesmerizes listeners with a single repeating rhythmic cell (dactyl–spondee: long–short–short–long–long) anchored over an immovable quarter pulse.",
      audioSteps: [
        { notes: ["A4"], at: 0, duration: 0.42 },
        { notes: ["A4"], at: 0.45, duration: 0.2 },
        { notes: ["A4"], at: 0.68, duration: 0.2 },
        { notes: ["A4"], at: 0.9, duration: 0.42 },
        { notes: ["A4"], at: 1.35, duration: 0.42 },
      ],
      audioLabel: "Hear Beethoven 7th Allegretto rhythmic ostinato",
    },
    workedExample: {
      title: "Separating Tempo from Rhythmic Density",
      scenario: "Does playing fast sixteenth notes always mean the Tempo increased?",
      steps: [
        "No: Beat speed (Tempo, say MM = 72 bpm) remains unchanged.",
        "Instead the musician simply placed 4 sixteenth notes inside each steady quarter beat.",
      ],
      conclusion:
        "Subdivision increases rhythmic density without speeding up the underlying tempo.",
    },
    practiceActivities: [
      {
        id: "rhythm-q1",
        prompt:
          "Which term describes the repeating foreground arrangement of long and short sounds and silences over the beat?",
        options: [
          { id: "tempo", label: "Tempo" },
          { id: "rhythm", label: "Rhythm" },
          { id: "clef", label: "Clef" },
          { id: "pitch", label: "Frequency" },
        ],
        correctOptionId: "rhythm",
        explanation:
          "Beat is the steady pulse, Tempo is the speed of that pulse, and Rhythm is the specific pattern of durations over it.",
      },
    ],
    summaryText:
      "Music coordinates steady beat, recurring metrical accents, overall tempo speed, and varied rhythmic surface patterns simultaneously.",
    keyTakeaways: [
      "Beat = regular pulse; Rhythm = varied durations aligned to that pulse.",
      "Tempo controls pulse rate independently of note subdivision density.",
    ],
  },
  {
    slug: "beat-and-pulse",
    title: "Beat and pulse",
    summary:
      "Recognize downbeats, weak beats, anacruses (pickup measures), and binary vs. ternary beat emphasis.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "pulse-simple-and-compound-meter",
    moduleSlug: "beat-and-metrical-division",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 2,
    objectives: [
      "Contrast strong downbeats (Beat 1) against secondary and weak beats.",
      "Count incomplete opening bars (anacrusis / pickup beat) paired cleanly with shortened final bars.",
    ],
    sections: [
      {
        id: "downbeat-and-anacrusis",
        heading: "1. Downbeats and the pickup bar (anacrusis)",
        body: [
          "The first beat immediately following any barline is the DOWNBEAT (strongest metric accent). In 4/4 time, beats follow Strong–Weak–Medium–Weak (1–2–3–4); in 3/4, Strong–Weak–Weak (1–2–3).",
          "Many melodies launch slightly BEFORE Beat 1 with an incomplete opening measure called an ANACRUSIS (or pickup note). By classical rule, the beats borrowed by an opening pickup are subtracted cleanly from the piece's very final measure.",
        ],
        notation: {
          clef: "treble",
          timeSignature: "3/4",
          chords: [
            { keys: ["G4"], duration: "q" },
            { keys: ["C5"], duration: "h" },
            { keys: ["E5"], duration: "q" },
          ],
          label: "Pickup quarter note G4 rising to half note C5 and quarter E5",
          caption:
            "Upward-leaning pickup motion (G4 → downbeat C5) creates buoyant forward momentum.",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 0.38 },
          { notes: ["C5"], at: 0.42, duration: 0.85 },
          { notes: ["E5"], at: 1.3, duration: 0.45 },
        ],
        audioLabel: "Hear weak pickup G4 leaning onto strong downbeat C5",
      },
    ],
    repertoireExample: {
      composer: "Frédéric Chopin",
      work: "Prelude in A major, Op. 28 No. 7",
      barReference: "Bar 0 pickup & Bar 1",
      insight:
        "Notice how Chopin opens gently on Beat 3 (E4 anacrusis) so the melodic sigh lands cleanly onto the downbeat of bar 1 (C♯5).",
      audioSteps: [
        { notes: ["E4"], at: 0, duration: 0.4 },
        { notes: ["C#5"], at: 0.45, duration: 0.7 },
        { notes: ["A4"], at: 1.18, duration: 0.4 },
      ],
      audioLabel: "Hear Chopin Op. 28 No. 7 pickup rise",
    },
    workedExample: {
      title: "Balancing an incomplete final measure",
      scenario: "A piece in 4/4 opens with a 1-beat quarter-note pickup bar.",
      steps: [
        "Opening anacrusis uses 1 beat out of 4.",
        "To keep the whole piece rhythmically balanced around complete 4-beat cycles, the ending bar omits 1 beat.",
      ],
      conclusion: "The final measure should hold 3 beats (1 + 3 = 4 total beats).",
    },
    practiceActivities: [
      {
        id: "pulse-q1",
        prompt:
          "In a 4/4 piece starting with a 2-beat half-note pickup (anacrusis), how many beats will the final bar traditionally contain?",
        options: [
          { id: "1", label: "1 beat" },
          { id: "2", label: "2 beats" },
          { id: "3", label: "3 beats" },
          { id: "4", label: "4 beats" },
        ],
        correctOptionId: "2",
        explanation:
          "Opening anacrusis (2 beats) + final bar (2 beats) together equal one complete 4/4 bar.",
      },
    ],
    summaryText:
      "Beat hierarchy organizes pulse into accented downbeats and unaccented upbeats, launching melodies smoothly via pickup bars.",
    keyTakeaways: [
      "Downbeat = Beat 1 right after every barline.",
      "Anacrusis = incomplete opening measure whose beats are subtracted from the last measure.",
    ],
  },
  {
    slug: "simple-time-signatures",
    title: "Simple time signatures",
    summary:
      "Recognize duple, triple, and quadruple simple meters (2/4, 3/4, 4/4, 2/2, 3/8) where every beat naturally divides into TWO equal halves.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "pulse-simple-and-compound-meter",
    moduleSlug: "beat-and-metrical-division",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 3,
    objectives: [
      "Define SIMPLE METER as any meter whose beat unit is undotted and splits naturally in half (into 2 parts).",
      "Classify 2/4, 2/2 (cut time / alla breve), 3/4, 3/8, and 4/4 by duple/triple/quadruple beat count.",
    ],
    sections: [
      {
        id: "binary-division",
        heading: "1. Every beat splits neatly into two",
        body: [
          "In SIMPLE TIME SIGNATURES (top numeral 2, 3, or 4), the beat note is an ordinary undotted value that divides effortlessly in two: e.g., in 2/4 or 4/4, each quarter beat splits into 2 eighth notes ('1-and, 2-and').",
          "Watch out for 2/2 (Cut Time / Alla Breve, symbol ₵) vs. 4/4: even though both contain four quarter notes' worth of notation per bar, 2/2 moves with TWO brisk half-note beats per measure rather than four quarter beats!",
        ],
        notation: {
          clef: "treble",
          timeSignature: "2/4",
          beamNotes: true,
          chords: [
            { keys: ["G4"], duration: "8" },
            { keys: ["A4"], duration: "8" },
            { keys: ["B4"], duration: "8" },
            { keys: ["G4"], duration: "8" },
          ],
          label: "Four eighth notes beamed in two pairs inside 2/4 simple duple meter",
          caption:
            "Simple duple (2/4): beaming makes both two-part beat divisions ('1-and 2-and') visually clear.",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 0.25 },
          { notes: ["A4"], at: 0.26, duration: 0.25 },
          { notes: ["B4"], at: 0.52, duration: 0.25 },
          { notes: ["G4"], at: 0.78, duration: 0.45 },
        ],
        audioLabel: "Hear simple duple division (1-and 2-and)",
      },
    ],
    repertoireExample: {
      composer: "Wolfgang Amadeus Mozart",
      work: "Rondo Alla Turca (Piano Sonata K. 331, III)",
      barReference: "2/4 opening march",
      insight:
        "2/4 gives the 'Turkish March' its snappy two-beat Left–Right military bounce cleanly sub-divided in pairs of eighth and sixteenth notes.",
      audioSteps: [
        { notes: ["B4"], at: 0, duration: 0.16 },
        { notes: ["A4"], at: 0.16, duration: 0.16 },
        { notes: ["G#4"], at: 0.32, duration: 0.16 },
        { notes: ["A4"], at: 0.48, duration: 0.16 },
        { notes: ["C5"], at: 0.64, duration: 0.45 },
      ],
      audioLabel: "Hear 2/4 duple march turn B–A–G♯–A–C",
    },
    workedExample: {
      title: "Classifying 3/8 vs. 3/4",
      scenario: "Compare 3/8 (3 eighth-note beats) against 3/4 (3 quarter-note beats).",
      steps: [
        "Top number in both is 3 → both are SIMPLE TRIPLE meters!",
        "In 3/8, the bottom 8 sets the eighth note as one full beat (each splitting into two sixteenths).",
        "In 3/4, the bottom 4 sets the quarter note as one beat.",
      ],
      conclusion:
        "Both have 3 simple beats per bar; only the visual note value assigned to the beat shifts.",
    },
    practiceActivities: [
      {
        id: "simple-q1",
        prompt: "Which term accurately classifies the time signature 4/4?",
        options: [
          { id: "sd", label: "Simple duple" },
          { id: "sq", label: "Simple quadruple" },
          { id: "cd", label: "Compound duple" },
          { id: "ct", label: "Compound triple" },
        ],
        correctOptionId: "sq",
        explanation:
          "Top numeral 4 means four beats per measure, each dividing simply in two → Simple quadruple.",
      },
    ],
    summaryText:
      "Simple time signatures feature top numbers 2, 3, or 4 and always subdivide every beat evenly into two parts.",
    keyTakeaways: [
      "Top = 2 (duple), 3 (triple), 4 (quadruple) beats per measure.",
      "2/2 = 2 half-note beats; 3/8 = 3 eighth-note beats.",
    ],
  },
  {
    slug: "compound-time-signatures",
    title: "Compound time signatures",
    summary:
      "Master 6/8, 9/8, and 12/8 meters where each dotted main beat swings naturally into THREE sub-pulses.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "pulse-simple-and-compound-meter",
    moduleSlug: "beat-and-metrical-division",
    level: "elementary",
    estimatedMinutes: 10,
    sortOrder: 4,
    objectives: [
      "Decode top numerals 6, 9, and 12 cleanly: divide the top number by 3 to find main dotted beats per bar.",
      "Contrast 6/8 (2 dotted-quarter beats per bar: ONE-2-3 TWO-2-3) from 3/4 (3 quarter beats: ONE-& TWO-& THREE-&).",
      "Beam notes strictly in groups of three eighths to mirror compound beats.",
    ],
    sections: [
      {
        id: "ternary-subdivision",
        heading: "1. Dotted beats swinging in threes (6/8, 9/8, 12/8)",
        body: [
          "In COMPOUND TIME SIGNATURES (top numerals 6, 9, or 12), the main felt beat is a DOTTED NOTE divided into THREE equal parts. Do NOT conduct 6/8 as six separate slow beats: divide the top number by 3 to find how many main beats drive the bar!",
          "6/8 = 6 ÷ 3 = 2 dotted-quarter beats (Compound Duple: ONE-la-li, TWO-la-li). 9/8 = 3 dotted-quarter beats (Compound Triple). 12/8 = 4 dotted-quarter beats (Compound Quadruple).",
        ],
        notation: {
          clef: "treble",
          timeSignature: "6/8",
          beamNotes: true,
          chords: [
            { keys: ["E4"], duration: "8" },
            { keys: ["G4"], duration: "8" },
            { keys: ["C5"], duration: "8" },
            { keys: ["B4"], duration: "qd" },
          ],
          label: "Three beamed eighth notes followed by a dotted quarter note in 6/8",
          caption:
            "6/8 bar: Beat 1 holds three eighth notes ('1-la-li'); Beat 2 holds one dotted quarter note ('2---').",
        },
        audioSteps: [
          { notes: ["E4"], at: 0, duration: 0.25 },
          { notes: ["G4"], at: 0.25, duration: 0.25 },
          { notes: ["C5"], at: 0.5, duration: 0.25 },
          { notes: ["B4"], at: 0.75, duration: 0.75 },
        ],
        audioLabel: "Hear 6/8 compound duple lilt (1-2-3 | 4--)",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven",
      work: "Piano Sonata No. 14 in C♯ minor ('Moonlight'), I & J. S. Bach Brandenburg Concerto No. 3",
      barReference: "Siciliano & Pastoral compound grooves",
      insight:
        "12/8 gives Baroque pastorales and Beethoven's 'Pastoral' Symphony slow flowing river-like triplets inside four calm main beats per bar.",
      audioSteps: [
        { notes: ["G4"], at: 0, duration: 0.22 },
        { notes: ["C5"], at: 0.22, duration: 0.22 },
        { notes: ["E5"], at: 0.44, duration: 0.22 },
        { notes: ["G4"], at: 0.66, duration: 0.22 },
        { notes: ["D5"], at: 0.88, duration: 0.22 },
        { notes: ["F5"], at: 1.1, duration: 0.5 },
      ],
      audioLabel: "Hear gentle compound 6/8 triplets",
    },
    workedExample: {
      title: "Distinguishing 3/4 from 6/8 mathematically and musically",
      scenario:
        "Why aren't 3/4 and 6/8 interchangeable when both equal 6 eighth notes per measure?",
      steps: [
        "In 3/4 (simple triple), six eighths beam in THREE pairs of two: [♪♪] [♪♪] [♪♪] → ONE-and TWO-and THREE-and.",
        "In 6/8 (compound duple), six eighths beam in TWO groups of three: [♪♪♪] [♪♪♪] → ONE-two-three TWO-two-three.",
      ],
      conclusion:
        "Grouping by 2s (3 beats) vs. grouping by 3s (2 beats) produces completely different musical pulses.",
    },
    practiceActivities: [
      {
        id: "comp-q1",
        prompt: "How many main dotted-quarter beats fill each measure of 9/8?",
        options: [
          { id: "two", label: "2 dotted-quarter beats" },
          { id: "three", label: "3 dotted-quarter beats" },
          { id: "four", label: "4 dotted-quarter beats" },
          { id: "nine", label: "9 dotted-quarter beats" },
        ],
        correctOptionId: "three",
        explanation:
          "In compound time, divide the top numeral by 3: 9 ÷ 3 = 3 dotted-quarter beats (Compound Triple).",
      },
    ],
    summaryText:
      "Compound meters (6, 9, 12 on top) divide every dotted main beat into three equal sub-pulses.",
    keyTakeaways: [
      "Top ÷ 3 gives the number of dotted main beats: 6/8 = 2, 9/8 = 3, 12/8 = 4.",
      "Always beam eighths in 3-note clusters inside compound bars.",
    ],
  },
  {
    slug: "dotted-notes",
    title: "Dotted notes",
    summary:
      "Calculate exact augmentation dots (+50% value) and double dots (+75% value) across all rhythmic durations.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    moduleSlug: "dots-ties-and-cross-rhythm",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 5,
    objectives: [
      "Apply the augmentation dot rule: a single dot adds HALF of the note's original duration (1.5×).",
      "Count dotted half (3 quarter beats), dotted quarter (1.5 beats), and dotted eighth (0.75 beat) patterns accurately.",
      "Understand dotted quarter + eighth phrasing in common 4/4 melodies.",
    ],
    sections: [
      {
        id: "augmentation-dot",
        heading: "1. Original value plus half again (× 1.5)",
        body: [
          "Placing a small dot immediately to the RIGHT of a notehead (never confusing it with a staccato dot above or below!) extends that note by half its own value. Thus a dotted note naturally divides into THREE of the next smaller note value:",
          "• Dotted half note = 2 + 1 = 3 quarter notes.\n• Dotted quarter note = 1 + ½ = 1½ beats (3 eighth notes).\n• Dotted eighth note = ½ + ¼ = ¾ beat (3 sixteenth notes).",
        ],
        notation: {
          clef: "treble",
          timeSignature: "4/4",
          chords: [
            { keys: ["G4"], duration: "qd" },
            { keys: ["A4"], duration: "8" },
            { keys: ["B4"], duration: "h" },
          ],
          label: "Dotted quarter note G4, eighth note A4, and half note B4 in 4/4",
          caption:
            "Classic lyric figure in 4/4: dotted quarter (1½ beats) + eighth (½ beat) + half note (2 beats).",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 0.68 },
          { notes: ["A4"], at: 0.72, duration: 0.22 },
          { notes: ["B4"], at: 0.96, duration: 0.9 },
        ],
        audioLabel: "Hear dotted quarter + eighth + half phrasing",
      },
    ],
    repertoireExample: {
      composer: "George Frideric Handel",
      work: "Water Music Suite, Hornpipe & Overture rhythms",
      barReference: "French Overture dotted figures",
      insight:
        "Baroque overtures harness crisp dotted-eighth + sixteenth snaps to project stately royal grandeur before launching into lively contrapuntal allegros.",
      audioSteps: [
        { notes: ["D5"], at: 0, duration: 0.55 },
        { notes: ["C#5"], at: 0.58, duration: 0.16 },
        { notes: ["D5"], at: 0.76, duration: 0.7 },
      ],
      audioLabel: "Hear ceremonial dotted snap D5–C♯5–D5",
    },
    workedExample: {
      title: "Counting beats across a dotted half + two eighths in 4/4",
      scenario: "Verify the beat total of [dotted half] + [eighth] + [eighth].",
      steps: [
        "Dotted half = 2 (half) + 1 (half of half) = 3 quarter beats.",
        "Two eighth notes = ½ + ½ = 1 quarter beat.",
        "Total = 3 + 1 = 4 complete quarter beats.",
      ],
      conclusion: "The rhythm fills an exact 4/4 bar cleanly.",
    },
    practiceActivities: [
      {
        id: "dots-q1",
        prompt: "In 4/4 time, how many quarter beats long is a single dotted quarter note?",
        options: [
          { id: "1", label: "1 beat" },
          { id: "1.5", label: "1.5 beats (3 eighth notes)" },
          { id: "2", label: "2 beats" },
          { id: "3", label: "3 beats" },
        ],
        correctOptionId: "1.5",
        explanation:
          "A quarter note (1 beat) plus half of itself (0.5 beat) = 1.5 beats = 3 eighth notes.",
      },
    ],
    summaryText:
      "An augmentation dot extends any note or rest by 50% of its value, bridging cleanly across binary and ternary subdivisions.",
    keyTakeaways: [
      "Dot = +50% of the immediately preceding notehead (so dotted note = 3 parts of next subdivision).",
      "Placement matters: dot to the RIGHT changes length; dot ABOVE/BELOW marks staccato articulation.",
    ],
  },
  {
    slug: "ties-and-rests",
    title: "Ties and rests",
    summary:
      "Extend durations invisibly across barlines with ties while never chaining rests, and recognize slur vs. tie notation cleanly.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    moduleSlug: "dots-ties-and-cross-rhythm",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 6,
    objectives: [
      "Combine note values with curved TIES—strictly between identical pitches—to sum into a single unbroken sound.",
      "Distinguish a TIE (same pitch, rhythmic addition) from a SLUR (different pitches, legato connection).",
      "Respect the whole-bar rest convention and understand why rests are never tied.",
    ],
    sections: [
      {
        id: "ties-vs-slurs-and-rests",
        heading: "1. Tied additions vs. slurs & full-measure rests",
        body: [
          "A TIE is a curved arc joining two adjacent noteheads of the EXACT SAME PITCH: strike only the first note and hold cleanly through the combined sum of both durations. Ties solve rhythms impossible with a single notehead (like a 5-beat note or holding across a barline).",
          "In contrast, a SLUR connects two or more DIFFERENT pitches smoothly (legato) without adding rhythmic length. Also remember: rests are NEVER tied—combine consecutive silences cleanly with larger rest symbols respecting the middle of the bar.",
        ],
        notation: {
          clef: "treble",
          timeSignature: "4/4",
          chords: [
            { keys: ["E4"], duration: "h" },
            { keys: [], duration: "qr" },
            { keys: ["G4"], duration: "q" },
          ],
          label: "Half note E4, quarter rest, and quarter note G4 balancing 4/4",
          caption: "Silence fills exactly Beat 3 (quarter rest) before sounding Beat 4 cleanly.",
        },
        audioSteps: [
          { notes: ["E4"], at: 0, duration: 0.9 },
          { notes: ["G4"], at: 1.45, duration: 0.45 },
        ],
        audioLabel: "Hear E4 held 2 beats, Beat 3 silence, G4 on Beat 4",
      },
    ],
    repertoireExample: {
      composer: "Claude Debussy",
      work: "Clair de lune (Suite bergamasque)",
      barReference: "9/8 tied downbeats across bars",
      insight:
        "Debussy floats melodies gently across barlines using silent tied downbeats so phrases breathe weightlessly past rigid metric edges.",
      audioSteps: [
        { notes: ["F5"], at: 0, duration: 0.6 },
        { notes: ["Db5"], at: 0.62, duration: 1.3 },
        { notes: ["Bb4"], at: 1.95, duration: 0.55 },
      ],
      audioLabel: "Hear floating tied melodic sustain across barline",
    },
    workedExample: {
      title: "Calculating a tied barline cross-hold",
      scenario:
        "A quarter note on Beat 4 of Measure 1 is tied across the barline to a half note in Measure 2 (in 4/4).",
      steps: [
        "Both noteheads share the same pitch (e.g., A4), so you strike A4 ONCE on Beat 4.",
        "Hold 1 beat (Beat 4 of Measure 1) + 2 beats (Beats 1–2 of Measure 2).",
      ],
      conclusion:
        "Hold A4 seamlessly for 3 full beats, releasing right before Beat 3 of Measure 2.",
    },
    practiceActivities: [
      {
        id: "ties-q1",
        prompt:
          "What happens visually when a curved arc joins an F4 quarter note to an E4 quarter note?",
        options: [
          { id: "tie", label: "It is a tie adding both beats into one note" },
          { id: "slur", label: "It is a slur instructing you to play F4 smoothly into E4" },
          { id: "rest", label: "It silences the E4 like a rest" },
          { id: "accent", label: "It doubles the dynamic volume" },
        ],
        correctOptionId: "slur",
        explanation:
          "Ties only link identical pitches. A curve spanning different pitches (F4 → E4) is a SLUR marking smooth legato articulation.",
      },
    ],
    summaryText:
      "Ties unite identical pitches across beat boundaries and barlines into a single sustained duration, whereas rests never tie and whole-measure rests adapt automatically to any time signature.",
    keyTakeaways: [
      "Tie = same pitch, strike once and sum durations; Slur = different pitches, play smoothly.",
      "A single whole rest hangs centered inside any empty bar regardless of meter.",
    ],
  },
  {
    slug: "syncopation",
    title: "Syncopation",
    summary:
      "Feel how stressing off-beats or holding notes across strong metric beats produces rhythmic drive and forward vitality.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    moduleSlug: "dots-ties-and-cross-rhythm",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 7,
    objectives: [
      "Define syncopation as intentional metric displacement of accent onto weak beats or weak subdivisions ('ands').",
      "Recognize the classic short–long–short eighth–quarter–eighth syncopated figure cleanly across beats 1–2.",
      "Perform tied syncopation without rushing the held beat.",
    ],
    sections: [
      {
        id: "offbeat-accent",
        heading: "1. Displacing emphasis off the expected grid",
        body: [
          "Music breathes through tension between expectation and surprise. When a melody places a long note, dynamic accent, or sharp entry on a weak beat or off-beat subdivision ('and') and holds straight through the next strong beat without restatement, SYNCOPATION occurs.",
          "The most essential syncopation pattern in 4/4 is eighth–quarter–eighth ([♪] [♩] [♪]): you strike '1', strike early on 'and', and hold through Beat 2 before striking 'and' of 2!",
        ],
        notation: {
          clef: "treble",
          timeSignature: "4/4",
          chords: [
            { keys: ["C5"], duration: "8" },
            { keys: ["E5"], duration: "q" },
            { keys: ["D5"], duration: "8" },
            { keys: ["C5"], duration: "h" },
          ],
          label: "Syncopated eighth C5, quarter E5 spanning beat 2, eighth D5, and half note C5",
          caption:
            "Eighth – Quarter – Eighth syncopation: E5 enters early on '1-and' and holds straight across Beat 2.",
        },
        audioSteps: [
          { notes: ["C5"], at: 0, duration: 0.22 },
          { notes: ["E5"], at: 0.24, duration: 0.48 },
          { notes: ["D5"], at: 0.74, duration: 0.22 },
          { notes: ["C5"], at: 0.98, duration: 0.9 },
        ],
        audioLabel: "Hear classic eighth–quarter–eighth syncopation",
      },
    ],
    repertoireExample: {
      composer: "Ludwig van Beethoven / Scott Joplin",
      work: "String Quartet Op. 59 No. 3 & Classic Piano Rags",
      barReference: "Off-beat sforzando displacements",
      insight:
        "From Beethoven's urgent off-beat Beethovenian sforzandos to Romantic scherzos and early twentieth-century piano rags, syncopation charges steady pulse with electric lift.",
      audioSteps: [
        { notes: ["G4"], at: 0, duration: 0.2 },
        { notes: ["C5"], at: 0.22, duration: 0.45 },
        { notes: ["A4"], at: 0.7, duration: 0.2 },
        { notes: ["G4"], at: 0.92, duration: 0.6 },
      ],
      audioLabel: "Hear snappy off-beat ragtime accent",
    },
    workedExample: {
      title: "Clapping eighth–quarter–eighth accurately in 2/4",
      scenario: "Internalize Beats 1 and 2 subdivided as '1-and-2-and'.",
      steps: [
        "Beat '1': clap eighth note.",
        "Beat '1-and': clap quarter note and HOLD silently past Beat 2.",
        "Beat '2-and': clap final eighth note.",
      ],
      conclusion: "The skipped clap on Beat 2 lets the '1-and' entry pop rhythmically.",
    },
    practiceActivities: [
      {
        id: "sync-q1",
        prompt:
          "Which rhythmic figure exemplifies basic off-beat syncopation spanning two quarter beats?",
        options: [
          { id: "qq", label: "Quarter + Quarter" },
          { id: "eqe", label: "Eighth + Quarter + Eighth" },
          { id: "h", label: "One Half Note" },
          { id: "eeee", label: "Four Equal Eighths" },
        ],
        correctOptionId: "eqe",
        explanation:
          "Eighth + Quarter + Eighth shifts the longer note onto the 'and' of Beat 1, sustaining directly over Beat 2.",
      },
    ],
    summaryText:
      "Syncopation energizes meter by accenting off-beats and holding across strong beats rather than restating them.",
    keyTakeaways: [
      "Common mechanisms: off-beat longer notes (♪ ♩ ♪), ties across strong beats, or rests placed on strong beats.",
      "Keep subdividing '1-and 2-and' mentally so off-beat holds never rush.",
    ],
  },
  {
    slug: "triplets",
    title: "Triplets",
    summary:
      "Subdivide a simple binary beat temporarily into THREE equal notes ('tri-pl-et') without changing the time signature.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    moduleSlug: "dots-ties-and-cross-rhythm",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 8,
    objectives: [
      "Play three equal eighth-note triplets cleanly inside the time normally occupied by two eighth notes (one quarter beat).",
      "Recognize quarter-note triplets spanning two full quarter beats.",
      "Maintain smooth tempo transitions moving directly between straight eighths (duplets) and eighth triplets.",
    ],
    sections: [
      {
        id: "three-in-time-of-two",
        heading: "1. Fitting three into the space of two",
        body: [
          "Sometimes a composer writing in simple time (like 4/4) wants a brief three-part lilt without changing the meter to 12/8. A TRIPLET inserts three equal notes—bracketed with a small numeral '3'—into the exact rhythmic slot normally held by TWO notes of that same written value.",
          "Thus 3 eighth-note triplets equal 2 ordinary eighth notes (1 quarter beat); 3 quarter-note triplets equal 2 ordinary quarter notes (1 half note); and 3 sixteenth-note triplets fill 1 single eighth beat.",
        ],
        notation: {
          clef: "treble",
          timeSignature: "2/4",
          beamNotes: true,
          tuplet: { start: 0, end: 2, numNotes: 3 },
          chords: [
            { keys: ["E4"], duration: "8" },
            { keys: ["G4"], duration: "8" },
            { keys: ["B4"], duration: "8" },
            { keys: ["C5"], duration: "q" },
          ],
          label: "Eighth-note triplet E4-G4-B4 followed by quarter note C5 in 2/4",
          caption:
            "Beat 1 divides cleanly into a triplet (E–G–B in the time of two eighths) arriving on Beat 2 (C5).",
        },
        audioSteps: [
          { notes: ["E4"], at: 0, duration: 0.2 },
          { notes: ["G4"], at: 0.19, duration: 0.2 },
          { notes: ["B4"], at: 0.38, duration: 0.2 },
          { notes: ["C5"], at: 0.57, duration: 0.65 },
        ],
        audioLabel: "Hear eighth-note triplet (E–G–B) arriving smoothly on Beat 2",
      },
    ],
    repertoireExample: {
      composer: "Frédéric Chopin",
      work: "Prelude in E minor, Op. 28 No. 4 / Nocturnes",
      barReference: "3-against-2 polyrhythm moments",
      insight:
        "Chopin frequently sets a flowing left-hand triplet or right-hand ornamental triplet against straight eighths, demanding rock-solid pulse alignment on every main beat.",
      audioSteps: [
        { notes: ["G4", "C4"], at: 0, duration: 0.25 },
        { notes: ["A4"], at: 0.22, duration: 0.22 },
        { notes: ["G4", "E4"], at: 0.33, duration: 0.25 },
        { notes: ["B4"], at: 0.44, duration: 0.22 },
        { notes: ["C5", "G4"], at: 0.66, duration: 0.65 },
      ],
      audioLabel: "Hear triplet melody floating smoothly over a steady pulse",
    },
    workedExample: {
      title: "Checking quarter-note triplets in 4/4",
      scenario: "How many beats does a quarter-note triplet occupy?",
      steps: [
        "Standard triplet rule: 3 notes in the time of 2 of the SAME written value.",
        "Written value = quarter note.",
        "2 normal quarter notes = 2 beats.",
      ],
      conclusion: "A quarter-note triplet distributes 3 equal attacks across 2 quarter beats.",
    },
    practiceActivities: [
      {
        id: "trip-q1",
        prompt:
          "What single note equals the combined duration of one eighth-note triplet (3 beamed eighths under a '3')?",
        options: [
          { id: "eighth", label: "One eighth note" },
          { id: "quarter", label: "One quarter note" },
          { id: "dotted-q", label: "One dotted quarter note" },
          { id: "half", label: "One half note" },
        ],
        correctOptionId: "quarter",
        explanation:
          "An eighth-note triplet compresses 3 eighths into the duration of 2 ordinary eighths = 1 quarter note.",
      },
    ],
    summaryText:
      "Triplets divide any simple binary duration cleanly into three equal parts without changing the surrounding time signature.",
    keyTakeaways: [
      "3 triplet notes always take the duration of 2 standard notes of that written size.",
      "Align every downbeat (or beat onset) cleanly before accelerating into triple subdivision.",
    ],
  },
  {
    slug: "rhythmic-patterns",
    title: "Rhythmic patterns",
    summary:
      "Recognize common recurring beat-level cells (dotted-eighth + sixteenth, two sixteenths + eighth, ostinatos) at sight via clean beaming.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    moduleSlug: "rhythmic-patterns-and-sightreading",
    level: "elementary",
    estimatedMinutes: 8,
    sortOrder: 9,
    objectives: [
      "Read complete one-beat rhythmic cells visually as unified shapes rather than counting note-by-note.",
      "Compare two 16ths + 8th ('ti-ka-ti') vs. 8th + two 16ths ('ti-ti-ka') vs. dotted-8th + 16th.",
      "Follow clean metrical beaming showing where Beat 1, 2, 3, and 4 start.",
    ],
    sections: [
      {
        id: "beat-cell-chunking",
        heading: "1. Chunking one-beat rhythmic vocabulary",
        body: [
          "Fluent score readers recognize rhythms in single-beat 'words'—much like reading whole English words instead of spelling each letter. Correct instrumental beaming binds each beat's eighth and sixteenth subdivisions neatly together so every beat boundary shines cleanly on the page.",
          "Memorize the core 1-beat family in 4/4: four sixteenths (1-e-and-a), eighth + two sixteenths (1 & a), two sixteenths + eighth (1 e &), and dotted eighth + sixteenth (1---a).",
        ],
        notation: {
          clef: "treble",
          timeSignature: "2/4",
          beamNotes: true,
          chords: [
            { keys: ["C5"], duration: "8" },
            { keys: ["D5"], duration: "16" },
            { keys: ["E5"], duration: "16" },
            { keys: ["F5"], duration: "16" },
            { keys: ["E5"], duration: "16" },
            { keys: ["D5"], duration: "8" },
          ],
          label: "Beat 1 eighth plus two sixteenths, followed by Beat 2 two sixteenths plus eighth",
          caption:
            "Two mirror 1-beat patterns: [8th + two 16ths] followed cleanly by [two 16ths + 8th].",
        },
        audioSteps: [
          { notes: ["C5"], at: 0, duration: 0.25 },
          { notes: ["D5"], at: 0.26, duration: 0.12 },
          { notes: ["E5"], at: 0.39, duration: 0.12 },
          { notes: ["F5"], at: 0.52, duration: 0.12 },
          { notes: ["E5"], at: 0.65, duration: 0.12 },
          { notes: ["D5"], at: 0.78, duration: 0.4 },
        ],
        audioLabel: "Hear contrasting 1-beat sixteenth cells",
      },
    ],
    repertoireExample: {
      composer: "Johann Sebastian Bach",
      work: "Brandenburg Concerto No. 2 in F major, BWV 1047",
      barReference: "I. Allegro, opening ritornello",
      insight:
        "Baroque concertos turn just two one-beat rhythmic patterns—four sixteenths and an eighth plus two sixteenths—into an entire shimmering orchestral architecture.",
      audioSteps: [
        { notes: ["F4"], at: 0, duration: 0.24 },
        { notes: ["G4"], at: 0.24, duration: 0.12 },
        { notes: ["A4"], at: 0.36, duration: 0.12 },
        { notes: ["Bb4"], at: 0.48, duration: 0.12 },
        { notes: ["A4"], at: 0.6, duration: 0.12 },
        { notes: ["G4"], at: 0.72, duration: 0.12 },
        { notes: ["F4"], at: 0.84, duration: 0.12 },
        { notes: ["C5"], at: 0.96, duration: 0.48 },
      ],
      audioLabel: "Hear Baroque ritornello rhythmic cell drive",
    },
    workedExample: {
      title: "Verifying beat capacity of a 16th-note mix",
      scenario: "Does [16th + 8th + 16th] fill one full quarter beat?",
      steps: [
        "1st sixteenth = ¼ beat.",
        "Middle eighth = ½ beat (⅔ of remainder, two quarters).",
        "Final sixteenth = ¼ beat.",
        "Sum = ¼ + ½ + ¼ = 1 full quarter beat (the crisp 'syncopated' 1-beat cell!).",
      ],
      conclusion: "Yes: 16th–8th–16th spans 1 quarter beat.",
    },
    practiceActivities: [
      {
        id: "rpat-q1",
        prompt: "Which combination correctly sums to ONE single quarter beat in 4/4?",
        options: [
          { id: "a", label: "Two eighth notes + one sixteenth note" },
          { id: "b", label: "One dotted eighth note + one sixteenth note" },
          { id: "c", label: "One eighth note + three sixteenth notes" },
          { id: "d", label: "One quarter note + one sixteenth note" },
        ],
        correctOptionId: "b",
        explanation: "A dotted eighth (¾ beat) + a sixteenth (¼ beat) = 1.00 beat.",
      },
    ],
    summaryText:
      "Recognizing standard one-beat rhythmic cells visually makes complex passages as easy to scan as familiar spoken words.",
    keyTakeaways: [
      "Read beamed beat groups as whole units rather than isolated stems.",
      "Common 1-beat totals: 4 sixteenths, 8th+2×16th, 2×16th+8th, dotted-8th+16th, 16th+8th+16th.",
    ],
  },
  {
    slug: "reading-musical-passages",
    title: "Reading musical passages",
    summary:
      "Synthesize clef, key signature, time signature, tonal contour, harmony, and rhythmic patterns in complete real-world musical sight-reading.",
    learningPathSlug: "rhythm-and-musical-reading",
    courseSlug: "rhythmic-nuance-and-passage-reading",
    moduleSlug: "rhythmic-patterns-and-sightreading",
    level: "elementary",
    estimatedMinutes: 12,
    sortOrder: 10,
    objectives: [
      "Execute a disciplined four-point pre-scan (Clef → Key Signature → Time Signature → Starting/Ending Tonic).",
      "Spot embedded scales, arpeggios, and recurring motifs rather than reading isolated noteheads.",
      "Read ahead by half a bar while keeping a forgiving, unbroken tempo pulse.",
    ],
    sections: [
      {
        id: "four-point-scan",
        heading: "1. The pre-reading scan & pattern grouping",
        body: [
          "True musical literacy unites everything studied across all four Theory Academy paths. Before sounding a single note, train the discipline of a 5-second scan: check CLEF, identify KEY SIGNATURE tonic (major or relative minor), lock in TIME SIGNATURE pulse (simple or compound), and scan the widest skips plus lowest/highest points.",
          "As you read, group notes into familiar theoretical blocks: 'Here sits a G major arpeggio ascending to B, followed by a stepwise diatonic descent over a dotted-quarter motif.' Reading intervals and chord outlines rather than spelling single letters one by one multiplies fluency tenfold!",
        ],
        notation: {
          clef: "treble",
          keySignature: "G",
          timeSignature: "4/4",
          chords: [
            { keys: ["G4"], duration: "q" },
            { keys: ["B4"], duration: "q" },
            { keys: ["D5"], duration: "qd" },
            { keys: ["C5"], duration: "8" },
            { keys: ["B4"], duration: "h" },
          ],
          label:
            "Musical passage in G major, 4/4 time: rising G-B-D tonic triad then stepwise C5-B4 descent",
          caption:
            "Complete passage check: Treble clef · 1 sharp (G major) · 4/4 meter · Tonic triad outline (G–B–D) into dotted lyrical resolution.",
        },
        audioSteps: [
          { notes: ["G4"], at: 0, duration: 0.4 },
          { notes: ["B4"], at: 0.42, duration: 0.4 },
          { notes: ["D5"], at: 0.84, duration: 0.65 },
          { notes: ["C5"], at: 1.52, duration: 0.22 },
          { notes: ["B4"], at: 1.76, duration: 0.9 },
        ],
        audioLabel: "Hear full passage synthesis in G major (4/4)",
      },
    ],
    repertoireExample: {
      composer: "Johann Sebastian Bach / Christian Petzold",
      work: "Minuet in G major, BWV Anh. 114",
      barReference: "Measures 1–8",
      insight:
        "Every hallmark of complete reading appears in the opening four bars: Treble & Bass clefs, 1-sharp G major key signature, 3/4 triple lilt, opening 5th leap (D5 down to G4), and running stepwise eighths answering cleanly.",
      audioSteps: [
        { notes: ["D5"], at: 0, duration: 0.42 },
        { notes: ["G4"], at: 0.44, duration: 0.22 },
        { notes: ["A4"], at: 0.66, duration: 0.22 },
        { notes: ["B4"], at: 0.88, duration: 0.22 },
        { notes: ["C5"], at: 1.1, duration: 0.22 },
        { notes: ["D5"], at: 1.32, duration: 0.42 },
        { notes: ["G4"], at: 1.76, duration: 0.42 },
        { notes: ["G4"], at: 2.2, duration: 0.42 },
      ],
      audioLabel: "Hear Minuet in G major opening phrase",
    },
    workedExample: {
      title: "Pre-scanning an unfamiliar D major 6/8 passage",
      scenario: "Walk systematically through the opening line of an unseen score before playing.",
      steps: [
        "Clef: Treble clef → Line 2 is G4.",
        "Key Signature: Two sharps (F♯, C♯) → D Major (or B minor). Opening chord D–F♯–A confirms D Major.",
        "Time Signature: 6/8 → Two dotted-quarter beats per bar swinging in 3s.",
        "Pattern inspection: Bars 1–2 outline a rising D–F♯–A triad then step gently F♯–E–D.",
      ],
      conclusion:
        "By decoding theory patterns ahead of Beat 1, you read melodies cleanly on the very first pass.",
    },
    practiceActivities: [
      {
        id: "readpass-q1",
        prompt:
          "You open a score displaying Bass Clef, three flats (B♭, E♭, A♭), time signature 6/8, and an opening bass arpeggio E♭3–G3–B♭3. Which analytical reading summary is accurate?",
        options: [
          { id: "a", label: "Key of A♭ major in 6 slow beats per measure" },
          { id: "b", label: "Key of E♭ major felt in 2 dotted-quarter beats per measure" },
          { id: "c", label: "Key of C minor felt in 3 simple quarter beats" },
          { id: "d", label: "Treble clef in E♭ major" },
        ],
        correctOptionId: "b",
        explanation:
          "Three flats (B♭, E♭, A♭) anchored by E♭–G–B♭ confirms E♭ major; 6/8 moves in 2 compound dotted-quarter beats per bar.",
      },
    ],
    summaryText:
      "Fluent passage reading combines instant pre-scanning (clef, key, meter) with pattern-level recognition of scales, intervals, chords, and beat cells.",
    keyTakeaways: [
      "Always scan Clef → Key Signature → Time Signature → Tonal Landmarks before starting.",
      "Look for scales, triad outlines, and recurring 1-beat rhythmic cells rather than decoding isolated noteheads.",
    ],
  },
];

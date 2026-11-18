import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_3_HARMONY: AcademyPathDefinition = {
  "slug": "intervals-and-harmony",
  "numeral": "III",
  "title": "Intervals and Harmony",
  "summary": "Measure and qualify intervals, hear consonance and dissonance, spell major/minor/diminished/augmented triads, invert chords, build seventh chords, and read Roman numeral progressions.",
  "level": "intermediate",
  "sortOrder": 3
};

export const PATH_3_COURSES: AcademyCourseDefinition[] = [
  {
    "slug": "intervals-and-triads",
    "learningPathSlug": "intervals-and-harmony",
    "title": "Intervals, Consonance & Triads",
    "description": "Calculate generic and specific interval quality, classify consonance versus dissonance, and build all four root-position triad qualities.",
    "level": "intermediate",
    "sortOrder": 1,
    "estimatedMinutes": 60
  },
  {
    "slug": "inversions-sevenths-and-progressions",
    "learningPathSlug": "intervals-and-harmony",
    "title": "Inversions, Seventh Chords & Functional Harmony",
    "description": "Voice triad inversions smoothly with figured bass symbols, spell seventh chords, analyze progressions with Roman numerals, and resolve cadences.",
    "level": "intermediate",
    "sortOrder": 2,
    "estimatedMinutes": 55
  }
];

export const PATH_3_MODULES: AcademyModuleDefinition[] = [
  {
    "slug": "intervals-and-acoustics",
    "courseSlug": "intervals-and-triads",
    "learningPathSlug": "intervals-and-harmony",
    "title": "Module 1 · Intervals & Acoustic Stability",
    "summary": "Generic size, semitone quality, inversion rules, and consonance.",
    "sortOrder": 1
  },
  {
    "slug": "triads-and-voicing",
    "courseSlug": "intervals-and-triads",
    "learningPathSlug": "intervals-and-harmony",
    "title": "Module 2 · Four Triad Types & Inversions",
    "summary": "Major, minor, diminished, augmented triads and bass-line inversions.",
    "sortOrder": 2
  },
  {
    "slug": "sevenths-and-tonal-syntax",
    "courseSlug": "inversions-sevenths-and-progressions",
    "learningPathSlug": "intervals-and-harmony",
    "title": "Module 3 · Seventh Chords & Roman Numeral Analysis",
    "summary": "From V7 resolutions and diatonic Roman numerals to common progressions.",
    "sortOrder": 3
  }
];

export const PATH_3_LESSONS: AcademyLessonContent[] = [
  {
    "slug": "understanding-intervals",
    "title": "Understanding intervals",
    "summary": "Distinguish melodic vs. harmonic intervals and calculate generic interval numbers cleanly by counting alphabetical letter names.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "intervals-and-acoustics",
    "level": "intermediate",
    "estimatedMinutes": 8,
    "sortOrder": 1,
    "objectives": [
      "Differentiate melodic intervals (sounded sequentially) from harmonic intervals (sounded simultaneously).",
      "Count inclusive alphabet letter steps—lines and spaces—to establish generic interval size (1st through 8th).",
      "Separate letter quantity (4th vs. 3rd) from semitone spacing."
    ],
    "sections": [
      {
        "id": "generic-size",
        "heading": "1. Melodic vs. harmonic & inclusive letter counting",
        "body": [
          "An interval measures the pitch distance between two notes. Played one after another, they form a melodic interval; played together, they form a harmonic interval.",
          "Before naming an interval's quality (major, minor, perfect), always count the inclusive generic letter span from lower note to upper note—counting both boundary letters as 1. From C to G covers C(1)–D(2)–E(3)–F(4)–G(5) = a 5th."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C4",
                "G4"
              ],
              "duration": "h"
            }
          ],
          "label": "Melodic fifth C4 to G4 followed by harmonic fifth C4 and G4 together",
          "caption": "Melodic fifth (C4 then G4) followed by a harmonic fifth (C4 + G4 sounded simultaneously)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4"
            ],
            "at": 0,
            "duration": 0.45
          },
          {
            "notes": [
              "G4"
            ],
            "at": 0.5,
            "duration": 0.45
          },
          {
            "notes": [
              "C4",
              "G4"
            ],
            "at": 1.05,
            "duration": 1.1
          }
        ],
        "audioLabel": "Hear melodic vs. harmonic fifth (C4–G4)"
      }
    ],
    "repertoireExample": {
      "composer": "Richard Strauss",
      "work": "Also sprach Zarathustra, Op. 30",
      "barReference": "Sunrise fanfare, bars 1–9",
      "insight": "Strauss opens with rising open fifths and octaves (C–G–C), giving listeners pure generic clarity before any major or minor triad third enters.",
      "audioSteps": [
        {
          "notes": [
            "C3"
          ],
          "at": 0,
          "duration": 0.55
        },
        {
          "notes": [
            "G3"
          ],
          "at": 0.58,
          "duration": 0.55
        },
        {
          "notes": [
            "C4"
          ],
          "at": 1.16,
          "duration": 1
        }
      ],
      "audioLabel": "Hear rising C–G–C fifth/octave fanfare"
    },
    "workedExample": {
      "title": "Why C–F♯ is a 4th while C–G♭ is a 5th",
      "scenario": "Compare two intervals spanning identical 6-semitone keyboard width.",
      "steps": [
        "C to F♯ counts C(1)–D(2)–E(3)–F(4): generic size = 4th.",
        "C to G♭ counts C(1)–D(2)–E(3)–F(4)–G(5): generic size = 5th."
      ],
      "conclusion": "Letter spelling alone determines the generic number; accidentals qualify how wide that letter span stretches."
    },
    "practiceActivities": [
      {
        "id": "intervals-q1",
        "prompt": "What is the generic interval size from E4 up to C5 (ignoring accidentals)?",
        "options": [
          {
            "id": "5th",
            "label": "5th"
          },
          {
            "id": "6th",
            "label": "6th"
          },
          {
            "id": "7th",
            "label": "7th"
          },
          {
            "id": "4th",
            "label": "4th"
          }
        ],
        "correctOptionId": "6th",
        "explanation": "Count inclusively: E(1)–F(2)–G(3)–A(4)–B(5)–C(6) = a 6th."
      }
    ],
    "summaryText": "Every interval combines an inclusive letter count (generic number) with a precise semitone quality.",
    "keyTakeaways": [
      "Melodic = sequential notes; harmonic = simultaneous notes.",
      "Count bottom letter as 1 up to top letter to lock in the generic interval size."
    ],
    "terminology": [
      {
        "term": "Interval",
        "definition": "The measurement of distance in pitch between two musical sounds."
      },
      {
        "term": "Harmonic Interval",
        "definition": "Two pitches sounded simultaneously as a chord or dyad."
      },
      {
        "term": "Melodic Interval",
        "definition": "Two pitches sounded sequentially in time as part of a melody."
      },
      {
        "term": "Generic Interval",
        "definition": "The raw numerical distance between staff lines and spaces (e.g. 2nd, 3rd, 4th, 5th)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "G4"
      ],
      "showLabels": true,
      "label": "Perfect Fifth interval (C4 to G4)",
      "caption": "C4 to G4 spans seven semitones and five letter names (C-D-E-F-G), forming a fundamental acoustic fifth."
    },
    "practicalApplication": "When sight-singing or score-reading, identify intervals by their visual shape on the staff: lines to adjacent lines (or spaces to spaces) are always odd intervals (3rds, 5ths, 7ths); lines to spaces are always even intervals (2nds, 4ths, 6ths, octaves).",
    "videoResource": {
      "title": "Open Yale Courses: Intervals and the Foundations of Harmony",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "MUSI 112 Lecture 6 examines harmonic and melodic intervals and their acoustic frequency ratios."
    },
    "references": [
      {
        "title": "Open Music Theory: Introduction to Intervals",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Harmonic vs. melodic intervals and generic staff counting rules."
      },
      {
        "title": "Fundamentals of Music Theory: Intervals and Pitch Distance",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Acoustic interval ratios and harmonic overtone relationships."
      }
    ]
  },
  {
    "slug": "interval-classification",
    "title": "Interval classification",
    "summary": "Assign exact classical qualities—Perfect, Major, Minor, Augmented, and Diminished—and master the Rule of Nine for interval inversion.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "intervals-and-acoustics",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 2,
    "objectives": [
      "Separate Perfect intervals (1, 4, 5, 8) from Major/Minor intervals (2, 3, 6, 7).",
      "Contract or expand semitones accurately using Diminished and Augmented labels.",
      "Invert intervals quickly using the Rule of Nine (numbers sum to 9; P↔P, M↔m, A↔d)."
    ],
    "sections": [
      {
        "id": "quality-groups",
        "heading": "1. Two families of quality & inversion",
        "body": [
          "Classical theory sorts generic intervals into two quality families based on the Major scale built from the lower note: Unison (0 semitones), 4th (5), 5th (7), and Octave (12) are PERFECT. Expanding a Perfect interval by 1 semitone makes it AUGMENTED; shrinking it by 1 semitone makes it DIMINISHED.",
          "Meanwhile 2nds (2 semitones), 3rds (4), 6ths (9), and 7ths (11) are MAJOR in the major scale. Lowering a Major interval by 1 semitone produces MINOR (1, 3, 8, 10 semitones); lowering minor by another semitone produces DIMINISHED; raising Major by 1 semitone produces AUGMENTED.",
          "Inverting an interval swaps bottom and top notes within one octave: new number = 9 − original number, and qualities flip mirror-fashion (Perfect ↔ Perfect, Major ↔ Minor, Augmented ↔ Diminished)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "Eb4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "F#4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "G4"
              ],
              "duration": "h"
            }
          ],
          "label": "Major 3rd C-E, Minor 3rd C-Eb, Augmented 4th C-F#, and Perfect 5th C-G",
          "caption": "Major 3rd (4 st), Minor 3rd (3 st), Augmented 4th tritone (6 st), and Perfect 5th (7 st)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4"
            ],
            "at": 0,
            "duration": 0.7
          },
          {
            "notes": [
              "C4",
              "Eb4"
            ],
            "at": 0.78,
            "duration": 0.7
          },
          {
            "notes": [
              "C4",
              "F#4"
            ],
            "at": 1.56,
            "duration": 0.7
          },
          {
            "notes": [
              "C4",
              "G4"
            ],
            "at": 2.34,
            "duration": 0.9
          }
        ],
        "audioLabel": "Compare M3, m3, A4 tritone, and P5"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven",
      "work": "Piano Sonata No. 8 in C minor ('Pathétique'), Op. 13",
      "barReference": "Opening Grave chord & diminished leap",
      "insight": "Beethoven punctuates tragic urgency with diminished seventh leaps and minor thirds before balancing them with singing major sixths (inversions of minor thirds).",
      "audioSteps": [
        {
          "notes": [
            "C4",
            "G4"
          ],
          "at": 0,
          "duration": 0.3
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.32,
          "duration": 0.6
        },
        {
          "notes": [
            "Ab4"
          ],
          "at": 0.94,
          "duration": 0.35
        },
        {
          "notes": [
            "B4"
          ],
          "at": 1.32,
          "duration": 0.65
        }
      ],
      "audioLabel": "Hear Pathétique diminished-7th tension"
    },
    "workedExample": {
      "title": "Naming D up to B♭ in two steps",
      "scenario": "Identify both number and quality for D4 → B♭4.",
      "steps": [
        "1. Letter count: D(1)–E(2)–F(3)–G(4)–A(5)–B(6) = 6th.",
        "2. Check D Major scale: D Major has F♯ and C♯ (natural B♮ is Major 6th above D, 9 semitones).",
        "3. B♭4 lowers that Major 6th by 1 semitone (8 semitones) → Minor 6th.",
        "Bonus inversion check: B♭4 up to D5 = Major 3rd (6 + 3 = 9, Minor ↔ Major)."
      ],
      "conclusion": "D4 to B♭4 is a Minor 6th (8 semitones)."
    },
    "practiceActivities": [
      {
        "id": "class-q1",
        "prompt": "When you invert a Major 6th (e.g., C4–A4 becomes A4–C5), what interval results?",
        "options": [
          {
            "id": "m3",
            "label": "Minor 3rd"
          },
          {
            "id": "M3",
            "label": "Major 3rd"
          },
          {
            "id": "P4",
            "label": "Perfect 4th"
          },
          {
            "id": "d3",
            "label": "Diminished 3rd"
          }
        ],
        "correctOptionId": "m3",
        "explanation": "By the Rule of Nine: 9 − 6 = 3, and Major inverts to Minor → Minor 3rd."
      }
    ],
    "summaryText": "Qualify intervals precisely using the lower note's major scale and flip any interval's number (9 − n) and quality via inversion.",
    "keyTakeaways": [
      "1, 4, 5, 8 = Perfect family (dim ↔ Perf ↔ Aug).",
      "2, 3, 6, 7 = Major/Minor family (dim ↔ min ↔ Maj ↔ Aug).",
      "Inversions sum to 9 and flip Major ↔ Minor, Augmented ↔ Diminished, while Perfect remains Perfect."
    ],
    "terminology": [
      {
        "term": "Specific Interval",
        "definition": "The complete classification combining numerical size with quality (e.g. Major 3rd, Perfect 5th)."
      },
      {
        "term": "Major / Minor Qualities",
        "definition": "Applies to 2nds, 3rds, 6ths, and 7ths; minor is one semitone smaller than major."
      },
      {
        "term": "Perfect Quality",
        "definition": "Applies to unison, 4ths, 5ths, and octaves; acoustically pure frequency ratios (1:1, 4:3, 3:2, 2:1)."
      },
      {
        "term": "Augmented / Diminished",
        "definition": "Augmented is one semitone larger than major or perfect; diminished is one semitone smaller than minor or perfect."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "Eb4",
        "E4"
      ],
      "showLabels": true,
      "label": "Minor Third (C4–Eb4) vs. Major Third (C4–E4)",
      "caption": "Minor third spans 3 semitones; Major third spans 4 semitones."
    },
    "practicalApplication": "To quickly calculate any interval, measure it against the major scale of the lower note. If the upper note is in the lower note's major scale, it is either Major (2, 3, 6, 7) or Perfect (1, 4, 5, 8). If it is one semitone lower, it is Minor (or Diminished).",
    "videoResource": {
      "title": "BerkleeX: Classifying and Calculating Intervals",
      "publisher": "Berklee College of Music",
      "url": "https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory",
      "embedPermitted": false,
      "notes": "Prof. George W. Russell Jr. provides infallible mental shortcuts for classifying any interval instantly."
    },
    "references": [
      {
        "title": "Open Music Theory: Interval Size and Quality",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Rigorous classification algorithm for all 12 chromatic interval qualities."
      },
      {
        "title": "Musictheory.net: Generic and Specific Intervals",
        "authorOrInstitution": "Ricci Adams",
        "url": "https://www.musictheory.net/lessons/30",
        "licence": "Free Web Educational Access",
        "relevance": "Interactive interval training and visual staff demonstrations."
      }
    ]
  },
  {
    "slug": "consonance-and-dissonance",
    "title": "Consonance and dissonance",
    "summary": "Understand how simple overtone ratios produce stable consonances versus restless dissonances that drive melodic resolution.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "intervals-and-acoustics",
    "level": "intermediate",
    "estimatedMinutes": 8,
    "sortOrder": 3,
    "objectives": [
      "Distinguish perfect consonances (P1, P5, P8), imperfect consonances (m3, M3, m6, M6), and dissonances (2nds, 7ths, tritones).",
      "Explain why small integer frequency ratios (2:1, 3:2, 5:4) fuse smoothly in hearing.",
      "Understand the classical treatment of the Perfect 4th against the bass."
    ],
    "sections": [
      {
        "id": "stability-hierarchy",
        "heading": "1. Acoustic stability vs. harmonic drive",
        "body": [
          "Consonance and dissonance describe how settled or restless two sounding tones feel. Open Perfect Consonances—Octave (2:1) and Perfect Fifth (3:2)—lock cleanly into acoustic stability. Imperfect Consonances—Major/Minor Thirds and Sixths—bring warm harmonic color without destabilizing repose.",
          "Dissonances—Seconds, Sevenths, and all Augmented/Diminished intervals including the Tritone (A4/d5)—rub adjacent frequencies together, creating rhythmic acoustic shimmer that classical syntax resolves by step into nearby consonances."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "F4",
                "B4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "E4",
                "C5"
              ],
              "duration": "h"
            }
          ],
          "label": "Dissonant tritone F4–B4 resolving contrapuntally outward to Minor 6th E4–C5",
          "caption": "Contrary motion resolution: tritone (F–B) expands cleanly into consonant sixth (E–C)."
        },
        "audioSteps": [
          {
            "notes": [
              "F4",
              "B4"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "E4",
              "C5"
            ],
            "at": 0.95,
            "duration": 1.2
          }
        ],
        "audioLabel": "Hear tritone dissonance (F–B) resolve to consonance (E–C)"
      }
    ],
    "repertoireExample": {
      "composer": "Giovanni Pierluigi da Palestrina",
      "work": "Missa Papae Marcelli, Kyrie",
      "barReference": "Cadential suspensions",
      "insight": "Renaissance counterpoint treats consonance as structural rest and uses held dissonances strictly as prepared suspensions that melt stepwise downward into major/minor thirds or sixths.",
      "audioSteps": [
        {
          "notes": [
            "C4",
            "D5"
          ],
          "at": 0,
          "duration": 0.55
        },
        {
          "notes": [
            "C4",
            "C5"
          ],
          "at": 0.58,
          "duration": 0.55
        },
        {
          "notes": [
            "B3",
            "B4"
          ],
          "at": 1.16,
          "duration": 0.55
        },
        {
          "notes": [
            "C4",
            "C5"
          ],
          "at": 1.75,
          "duration": 0.9
        }
      ],
      "audioLabel": "Hear classical 9–8 suspension resolving into consonance"
    },
    "workedExample": {
      "title": "Resolving a harmonic Major 7th",
      "scenario": "Resolve C4–B4 harmonically by moving a single voice.",
      "steps": [
        "C4–B4 forms a tense Major 7th (B4 wants to pull upward by semitone as leading tone).",
        "Raise B4 cleanly by 1 semitone to C5 while holding C4.",
        "Result: C4–C5 (Perfect Octave—complete acoustic repose)."
      ],
      "conclusion": "Dissonance creates linear longing; stepwise movement into consonance relieves it."
    },
    "practiceActivities": [
      {
        "id": "cons-q1",
        "prompt": "Which pair belongs strictly to the category of IMPERFECT consonances?",
        "options": [
          {
            "id": "p5-p8",
            "label": "Perfect 5th and Perfect Octave"
          },
          {
            "id": "m3-M6",
            "label": "Minor 3rd and Major 6th"
          },
          {
            "id": "m2-M7",
            "label": "Minor 2nd and Major 7th"
          },
          {
            "id": "A4-d5",
            "label": "Augmented 4th and Diminished 5th"
          }
        ],
        "correctOptionId": "m3-M6",
        "explanation": "3rds and 6ths (both major and minor) are warm imperfect consonances; 5ths/8ves are perfect consonances."
      }
    ],
    "summaryText": "Consonances anchor tonal repose while dissonances supply essential tension propelling melody and harmony forward.",
    "keyTakeaways": [
      "Perfect consonances = P1, P5, P8; Imperfect consonances = m3, M3, m6, M6.",
      "Dissonances (2nds, 7ths, tritones) crave stepwise resolution into consonances."
    ],
    "terminology": [
      {
        "term": "Consonance",
        "definition": "An interval perceived as stable, acoustically harmonious, and requiring no immediate resolution."
      },
      {
        "term": "Dissonance",
        "definition": "An interval characterized by acoustic friction or tension that demands resolution to a consonance."
      },
      {
        "term": "Perfect Consonances",
        "definition": "Unison, octave, and perfect fifth (plus perfect fourth in non-bass contexts)."
      },
      {
        "term": "Imperfect Consonances",
        "definition": "Major and minor thirds and sixths; pleasant, colorful, and musically stable."
      },
      {
        "term": "Tritone",
        "definition": "The interval of three whole tones (augmented 4th / diminished 5th); the primary harmonic engine of tonal tension."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "B3",
        "F4",
        "C4",
        "E4"
      ],
      "showLabels": true,
      "label": "Tritone tension (B–F) resolving outward to third (C–E)",
      "caption": "The sharp dissonance of the tritone (B3–F4) resolves smoothly outward to the stable consonance of C4–E4."
    },
    "practicalApplication": "Music is fundamentally a cycle of tension and release. Learn to hear how dissonances (such as the tritone in a V7 chord) create the physical impulse that makes the subsequent consonant chord sound satisfying.",
    "videoResource": {
      "title": "Open Yale Courses: Consonance, Dissonance and Voice Leading",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Acoustic examination of roughness and harmonic overtone alignment in consonant vs. dissonant intervals."
    },
    "references": [
      {
        "title": "Open Music Theory: Consonance and Dissonance",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Acoustic and historical perspectives on interval stability from medieval organum to classical counterpoint."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Harmonic Tension",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Vocal tuning and resolution drills for dissonant intervals."
      }
    ]
  },
  {
    "slug": "triads",
    "title": "Triads",
    "summary": "Understand tertian triad stacking—root, third, and fifth—to build the structural foundation of Western tonal harmony.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "triads-and-voicing",
    "level": "intermediate",
    "estimatedMinutes": 8,
    "sortOrder": 4,
    "objectives": [
      "Construct a root-position triad by stacking alternate scale steps (root, 3rd, 5th).",
      "Read root-position triads visually on the staff as three stacked lines or three stacked spaces.",
      "Distinguish the seven diatonic triads naturally arising in a major key."
    ],
    "sections": [
      {
        "id": "tertian-stacking",
        "heading": "1. Three stacked lines or three stacked spaces",
        "body": [
          "Tonal harmony is built primarily in stacked thirds (tertian harmony). Pick any pitch as your Root, skip a letter to add its Third, and skip another letter to add its Fifth.",
          "In close root position on any staff, a triad forms an unmistakable snowman silhouette: either three consecutive lines (e.g., E4–G4–B4) or three consecutive spaces (F4–A4–C5)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4",
                "G4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "F4",
                "A4",
                "C5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "G4",
                "B4",
                "D5"
              ],
              "duration": "h"
            }
          ],
          "label": "Three root-position diatonic triads C major, F major, and G major",
          "caption": "Root-position triads C–E–G (lines/ledger), F–A–C (three stacked spaces), and G–B–D (three stacked lines)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 0.75
          },
          {
            "notes": [
              "F4",
              "A4",
              "C5"
            ],
            "at": 0.8,
            "duration": 0.75
          },
          {
            "notes": [
              "G4",
              "B4",
              "D5"
            ],
            "at": 1.6,
            "duration": 0.75
          },
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 2.4,
            "duration": 1
          }
        ],
        "audioLabel": "Hear I–IV–V–I root-position triads"
      }
    ],
    "repertoireExample": {
      "composer": "Franz Schubert",
      "work": "Moment Musical No. 6 in A♭ major",
      "barReference": "Hymn-like opening bars 1–8",
      "insight": "Clear root-position triads give homophonic chorale melodies an effortless pillar-like stillness before passing tones gently ripple between chords.",
      "audioSteps": [
        {
          "notes": [
            "Ab4",
            "C5",
            "Eb5"
          ],
          "at": 0,
          "duration": 0.85
        },
        {
          "notes": [
            "Db4",
            "F4",
            "Ab4"
          ],
          "at": 0.9,
          "duration": 0.85
        },
        {
          "notes": [
            "Eb4",
            "G4",
            "Bb4"
          ],
          "at": 1.8,
          "duration": 0.85
        },
        {
          "notes": [
            "Ab4",
            "C5",
            "Eb5"
          ],
          "at": 2.7,
          "duration": 1.1
        }
      ],
      "audioLabel": "Hear A♭ major choral triadic progression"
    },
    "workedExample": {
      "title": "Building a root-position triad on B",
      "scenario": "Find the three letter names belonging to a root-position B triad.",
      "steps": [
        "Root = B.",
        "Skip C → 3rd = D.",
        "Skip E → 5th = F."
      ],
      "conclusion": "Every B triad uses letters B–D–F regardless of accidentals (B–D–F = diminished, B–D–F♯ = minor, B–D♯–F♯ = major)."
    },
    "practiceActivities": [
      {
        "id": "triads-q1",
        "prompt": "Which three letter names form a root-position triad rooted on D?",
        "options": [
          {
            "id": "dfg",
            "label": "D – F – G"
          },
          {
            "id": "dfa",
            "label": "D – F – A"
          },
          {
            "id": "dea",
            "label": "D – E – A"
          },
          {
            "id": "dab",
            "label": "D – A – B"
          }
        ],
        "correctOptionId": "dfa",
        "explanation": "Stacking thirds upward from D gives Root (D), 3rd (F), and 5th (A)."
      }
    ],
    "summaryText": "Triads pair a root, third, and fifth into music's basic three-note chord unit, stacking uniformly on lines or spaces in close root position.",
    "keyTakeaways": [
      "Triad = Root + 3rd + 5th above root.",
      "Close root-position triads always align symmetrically: line–line–line or space–space–space."
    ],
    "terminology": [
      {
        "term": "Triad",
        "definition": "A three-note chord constructed by stacking two thirds on top of a foundational root."
      },
      {
        "term": "Root",
        "definition": "The foundational pitch upon which a triad or chord is generated."
      },
      {
        "term": "Third",
        "definition": "The middle pitch of a triad, situated a generic third above the root."
      },
      {
        "term": "Fifth",
        "definition": "The top pitch of a root-position triad, situated a generic fifth above the root."
      },
      {
        "term": "Tertian Harmony",
        "definition": "The harmonic system based entirely upon building chords in stacked thirds."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4"
      ],
      "showLabels": true,
      "label": "Root, Third, and Fifth of C Major Triad",
      "caption": "C4 (Root) + E4 (Third) + G4 (Fifth) stacked on alternating white keys."
    },
    "practicalApplication": "On the staff and keyboard, notice that any root-position triad consists either entirely of lines (Line-Line-Line) or entirely of spaces (Space-Space-Space). This visual symmetry enables instant recognition.",
    "videoResource": {
      "title": "BerkleeX: Triad Construction and Voicing",
      "publisher": "Berklee College of Music",
      "url": "https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory",
      "embedPermitted": false,
      "notes": "Prof. George W. Russell Jr. builds triads across all 12 chromatic roots using keyboard geometry."
    },
    "references": [
      {
        "title": "Open Music Theory: Triads",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Tertian stacking, root identification, and chord spelling conventions."
      },
      {
        "title": "Integrated Musicianship: Triads and Aural Skills",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "Singing and aurally identifying triad roots and chord qualities."
      }
    ]
  },
  {
    "slug": "major-and-minor-chords",
    "title": "Major and minor chords",
    "summary": "Spell and recognize Major (M3 + m3) and Minor (m3 + M3) triads quickly in any key.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "triads-and-voicing",
    "level": "intermediate",
    "estimatedMinutes": 9,
    "sortOrder": 5,
    "objectives": [
      "Spell Major triads with a Major 3rd on the bottom (4 semitones) and a Minor 3rd on top (3 semitones), framing a Perfect 5th.",
      "Spell Minor triads by reversing the stack: Minor 3rd on the bottom (3 st) + Major 3rd on top (4 st).",
      "Convert any Major triad into its parallel Minor triad by lowering the 3rd by one semitone."
    ],
    "sections": [
      {
        "id": "major-vs-minor-structure",
        "heading": "1. Symmetric third pairs sharing a Perfect Fifth",
        "body": [
          "Both Major and Minor triads rest upon a stable Perfect Fifth (7 semitones) between root and fifth. What defines their contrasting mood sits in the middle voice—the chordal third.",
          "A MAJOR triad places a Major 3rd (4 semitones) beneath a Minor 3rd (3 semitones), as in C–E–G or A–C♯–E. A MINOR triad flips them—Minor 3rd (3 semitones) beneath a Major 3rd (4 semitones), as in C–E♭–G or A–C–E."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4",
                "G4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "Eb4",
                "G4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "A4",
                "C#5",
                "E5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "A4",
                "C5",
                "E5"
              ],
              "duration": "h"
            }
          ],
          "label": "C major vs C minor, and A major vs A minor triads",
          "caption": "Lowering the chordal 3rd one semitone turns Major (C–E–G, A–C♯–E) directly into Minor (C–E♭–G, A–C–E)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 0.7
          },
          {
            "notes": [
              "C4",
              "Eb4",
              "G4"
            ],
            "at": 0.78,
            "duration": 0.7
          },
          {
            "notes": [
              "A4",
              "C#5",
              "E5"
            ],
            "at": 1.56,
            "duration": 0.7
          },
          {
            "notes": [
              "A4",
              "C5",
              "E5"
            ],
            "at": 2.34,
            "duration": 0.9
          }
        ],
        "audioLabel": "Compare Major and Minor parallel pairs"
      }
    ],
    "repertoireExample": {
      "composer": "Franz Schubert",
      "work": "Gute Nacht (Winterreise, D. 911 No. 1)",
      "barReference": "Stanza 4 modal shift into D major",
      "insight": "Schubert famously melts hearts across songs simply by brightening the minor third into a major third (e.g. D–F–A becoming D–F♯–A) as tender memory surfaces.",
      "audioSteps": [
        {
          "notes": [
            "D4",
            "F4",
            "A4"
          ],
          "at": 0,
          "duration": 0.85
        },
        {
          "notes": [
            "D4",
            "F#4",
            "A4"
          ],
          "at": 0.92,
          "duration": 1.1
        }
      ],
      "audioLabel": "Hear D minor opening out into D major"
    },
    "workedExample": {
      "title": "Spelling E Major and F Minor triads",
      "scenario": "Spell root-position triads from first principles.",
      "steps": [
        "E triad letters = E–G–B. From E up 4 semitones = G♯; up 3 more = B (P5 above E). → E–G♯–B = E Major.",
        "F triad letters = F–A–C. F Major is F–A–C; lower the 3rd by 1 semitone → F–A♭–C = F Minor."
      ],
      "conclusion": "E Major = E–G♯–B; F Minor = F–A♭–C."
    },
    "practiceActivities": [
      {
        "id": "majmin-q1",
        "prompt": "Which pitches form a root-position B minor triad?",
        "options": [
          {
            "id": "bdf",
            "label": "B – D – F"
          },
          {
            "id": "bdfs",
            "label": "B – D – F♯"
          },
          {
            "id": "bdsfs",
            "label": "B – D♯ – F♯"
          },
          {
            "id": "bdbf",
            "label": "B – D♭ – F"
          }
        ],
        "correctOptionId": "bdfs",
        "explanation": "B to D = 3 semitones (m3) and D to F♯ = 4 semitones (M3), framing B–F♯ (P5)."
      }
    ],
    "summaryText": "Major triads stack M3 + m3 while Minor triads stack m3 + M3; lowering the third by a single semitone switches Major to Minor.",
    "keyTakeaways": [
      "Major = M3 (4 st) + m3 (3 st).",
      "Minor = m3 (3 st) + M3 (4 st).",
      "Outer frame of both Major and Minor root-position triads is a Perfect 5th (7 st)."
    ],
    "terminology": [
      {
        "term": "Major Triad",
        "definition": "A triad consisting of a Major 3rd (4 semitones) plus a Minor 3rd (3 semitones), with a Perfect 5th between root and fifth."
      },
      {
        "term": "Minor Triad",
        "definition": "A triad consisting of a Minor 3rd (3 semitones) plus a Major 3rd (4 semitones), with a Perfect 5th between root and fifth."
      },
      {
        "term": "Chord Quality",
        "definition": "The inherent sonority (major, minor, diminished, augmented) determined by its internal interval configuration."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "Eb4",
        "G4"
      ],
      "showLabels": true,
      "label": "C Major (C-E-G) vs. C Minor (C-Eb-G)",
      "caption": "The root (C4) and fifth (G4) remain identical; changing E4 to Eb4 transforms major to minor."
    },
    "practicalApplication": "To hear the difference clearly, arpeggiate both chords slowly from the root up. The major third in a major triad aligns with the natural acoustic 5th harmonic of the overtone series, producing its radiant clarity.",
    "videoResource": {
      "title": "Open Yale Courses: Major and Minor Triad Sonorities",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Psychological and physical acoustic examination of major vs. minor chords."
    },
    "references": [
      {
        "title": "Open Music Theory: Triad Qualities",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Internal interval recipes for major and minor triads."
      },
      {
        "title": "Musictheory.net: Introduction to Chords",
        "authorOrInstitution": "Ricci Adams",
        "url": "https://www.musictheory.net/lessons/40",
        "licence": "Free Web Educational Access",
        "relevance": "Visual guide to triad qualities on the staff."
      }
    ]
  },
  {
    "slug": "diminished-and-augmented-chords",
    "title": "Diminished and augmented chords",
    "summary": "Construct symmetric diminished (m3 + m3) and augmented (M3 + M3) triads and understand why both destabilize tonal focus.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "triads-and-voicing",
    "level": "intermediate",
    "estimatedMinutes": 8,
    "sortOrder": 6,
    "objectives": [
      "Spell Diminished triads from two stacked minor thirds (3 + 3 = 6 semitones, Diminished 5th).",
      "Spell Augmented triads from two stacked major thirds (4 + 4 = 8 semitones, Augmented 5th).",
      "Explain why both altered-fifth chords demand resolution toward major or minor triads."
    ],
    "sections": [
      {
        "id": "symmetric-triads",
        "heading": "1. Compressing or expanding the outer fifth",
        "body": [
          "Unlike Major and Minor triads with their stable Perfect 5th, Diminished and Augmented triads alter the fifth into acoustic restlessness. Lower the 5th of a minor triad by a semitone to get a DIMINISHED triad (two stacked minor thirds: e.g., B–D–F or C–E♭–G♭, spanning a tense tritone).",
          "Raise the 5th of a major triad by a semitone to get an AUGMENTED triad (two stacked major thirds: e.g., C–E–G♯, spanning 8 semitones). Every major key naturally contains one diminished triad built on the leading tone (vii° = B–D–F in C major)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "B4",
                "D5",
                "F5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "E4",
                "G#4"
              ],
              "duration": "h"
            }
          ],
          "label": "Diminished triad B-D-F followed by Augmented triad C-E-G#",
          "caption": "B Diminished (m3 + m3, B–F tritone) contrasted with C Augmented (M3 + M3, C–G♯)."
        },
        "audioSteps": [
          {
            "notes": [
              "B4",
              "D5",
              "F5"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0.95,
            "duration": 0.7
          },
          {
            "notes": [
              "C4",
              "E4",
              "G#4"
            ],
            "at": 1.75,
            "duration": 1
          }
        ],
        "audioLabel": "Hear B Diminished and C Augmented triads"
      }
    ],
    "repertoireExample": {
      "composer": "Franz Liszt",
      "work": "Nuages gris, S. 199 / Faust Symphony opening",
      "barReference": "Unresolved augmented chains",
      "insight": "Because an augmented triad divides the octave symmetrically into three equal major thirds (4 + 4 + 4 = 12 semitones), composers use augmented chords to suspend gravitational certainty.",
      "audioSteps": [
        {
          "notes": [
            "C4",
            "E4",
            "G#4"
          ],
          "at": 0,
          "duration": 0.85
        },
        {
          "notes": [
            "F4",
            "A4",
            "C5"
          ],
          "at": 0.95,
          "duration": 1
        }
      ],
      "audioLabel": "Hear C+ augmented voice-leading into A minor/F major"
    },
    "workedExample": {
      "title": "Transforming D Major into D Diminished and D Augmented",
      "scenario": "Adjust the fifth (and third) starting from D–F♯–A.",
      "steps": [
        "D Major = D–F♯–A.",
        "To make D Augmented (D+): keep F♯ and raise the 5th A → A♯ (D–F♯–A♯).",
        "To make D Diminished (d°): lower both 3rd (F♯ → F♮) and 5th (A → A♭) → D–F–A♭."
      ],
      "conclusion": "D+ = D–F♯–A♯; d° = D–F–A♭."
    },
    "practiceActivities": [
      {
        "id": "dimaug-q1",
        "prompt": "Which set of pitches creates a C♯ Diminished triad?",
        "options": [
          {
            "id": "cseg",
            "label": "C♯ – E – G"
          },
          {
            "id": "csegs",
            "label": "C♯ – E – G♯"
          },
          {
            "id": "csesgs",
            "label": "C♯ – E♯ – G♯"
          },
          {
            "id": "csesg",
            "label": "C♯ – E♯ – G"
          }
        ],
        "correctOptionId": "cseg",
        "explanation": "C♯ to E = m3 (3 st) and E to G = m3 (3 st), spanning a diminished 5th C♯–G."
      }
    ],
    "summaryText": "Diminished (m3 + m3) and Augmented (M3 + M3) triads alter the stable outer fifth, injecting urgent dissonance and color.",
    "keyTakeaways": [
      "Diminished = Root + m3 + d5 (3 + 3 semitones); naturally built on scale degree 7 (vii°).",
      "Augmented = Root + M3 + A5 (4 + 4 semitones); symmetric 1/3-octave division."
    ],
    "terminology": [
      {
        "term": "Diminished Triad",
        "definition": "A triad consisting of two stacked Minor 3rds (3 semitones + 3 semitones), with a Diminished 5th (tritone) between root and fifth."
      },
      {
        "term": "Augmented Triad",
        "definition": "A triad consisting of two stacked Major 3rds (4 semitones + 4 semitones), with an Augmented 5th (8 semitones) between root and fifth."
      },
      {
        "term": "Symmetrical Harmony",
        "definition": "Chords that divide the octave into equal interval segments, creating ambiguous tonal pull."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "B3",
        "D4",
        "F4",
        "C4",
        "E4",
        "G#4"
      ],
      "showLabels": true,
      "label": "Diminished (B-D-F) and Augmented (C-E-G#) triads",
      "caption": "B diminished contains two minor 3rds; C augmented contains two major 3rds."
    },
    "practicalApplication": "Diminished triads naturally occur on scale degree 7 in major keys (vii°) and function as dominant tension chords. Augmented triads do not occur diatonic in major, but appear on degree 3 of harmonic minor (III+).",
    "videoResource": {
      "title": "Berklee Online: Diminished and Augmented Chords in Context",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee clinic on chromatic triad qualities, leading-tone resolution, and symmetrical division."
    },
    "references": [
      {
        "title": "Open Music Theory: Triad Qualities and Inversions",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Diminished and augmented triad construction and voice leading."
      },
      {
        "title": "Fundamentals of Music Theory: Chords and Harmonisation",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Triad quality comparisons and functional roles."
      }
    ]
  },
  {
    "slug": "chord-inversions",
    "title": "Chord inversions",
    "summary": "Move the bass voice cleanly between root position, first inversion (6), and second inversion (6/4) to create smooth melodic basslines.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "intervals-and-triads",
    "moduleSlug": "triads-and-voicing",
    "level": "intermediate",
    "estimatedMinutes": 10,
    "sortOrder": 7,
    "objectives": [
      "Identify triad inversions solely by which chord member (Root, 3rd, or 5th) sits in the lowest bass voice.",
      "Apply standard figured bass / Roman inversion numerals: root position (5/3), first inversion (6), second inversion (6/4).",
      "Read slash chord notation cleanly (e.g., C/E = C major triad with E in the bass)."
    ],
    "sections": [
      {
        "id": "bass-determines-inversion",
        "heading": "1. Only the lowest sounding note decides inversion",
        "body": [
          "Reordering upper notes does NOT change chord inversion: only which chord member sits in the BASS (the lowest sounding note) determines the inversion. When the Root sits in the bass, the triad is in ROOT POSITION (5/3).",
          "When the 3rd sits in the bass, the chord is in FIRST INVERSION (figured 6 or 6/3, slash e.g. C/E)—lightweight and flowing, ideal for stepwise basslines. When the 5th sits in the bass, the chord is in SECOND INVERSION (figured 6/4, slash e.g. C/G)—unstable because of the fourth above the bass, reserved classically for cadential, passing, or pedal effects."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4",
                "G4"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "E4",
                "G4",
                "C5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "G4",
                "C5",
                "E5"
              ],
              "duration": "h"
            }
          ],
          "label": "C major triad in root position (C-E-G), first inversion (E-G-C), and second inversion (G-C-E)",
          "caption": "Root position (C bass), 1st inversion I6 (E bass), and 2nd inversion I6/4 (G bass)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 0.75
          },
          {
            "notes": [
              "E4",
              "G4",
              "C5"
            ],
            "at": 0.85,
            "duration": 0.75
          },
          {
            "notes": [
              "G4",
              "C5",
              "E5"
            ],
            "at": 1.7,
            "duration": 1
          }
        ],
        "audioLabel": "Hear root position → 1st inversion → 2nd inversion of C major"
      }
    ],
    "repertoireExample": {
      "composer": "Johann Sebastian Bach",
      "work": "Air on the G String (Orchestral Suite No. 3 in D major, BWV 1068)",
      "barReference": "Bars 1–4, descending walking bass",
      "insight": "Bach avoids choppy root jumps in the cello bass by threading chords through first inversions (C♯ under A–C♯–E, F♯ under D–F♯–A), yielding a singing bass melody D–C♯–B–A–G♯.",
      "audioSteps": [
        {
          "notes": [
            "D3",
            "F#4",
            "A4"
          ],
          "at": 0,
          "duration": 0.6
        },
        {
          "notes": [
            "C#3",
            "E4",
            "A4"
          ],
          "at": 0.62,
          "duration": 0.6
        },
        {
          "notes": [
            "B2",
            "D4",
            "G4"
          ],
          "at": 1.24,
          "duration": 0.6
        },
        {
          "notes": [
            "A2",
            "C#4",
            "E4"
          ],
          "at": 1.86,
          "duration": 0.9
        }
      ],
      "audioLabel": "Hear first inversion creating a smooth stepwise bass"
    },
    "workedExample": {
      "title": "Identifying an F–A–D sonority",
      "scenario": "Analyze the bass pitch D3? No—suppose the lowest bass note is F3 under A4 and D5.",
      "steps": [
        "Arrange the pitches into stacked thirds to locate the Root: D–F–A (D minor triad).",
        "Check which member sits in the lowest bass voice: F3, which is the chordal 3rd of D–F–A.",
        "3rd in the bass = First Inversion."
      ],
      "conclusion": "F3–A4–D5 is D minor in First Inversion (Dm/F or i6 in D minor)."
    },
    "practiceActivities": [
      {
        "id": "inv-q1",
        "prompt": "If a G Major triad (G–B–D) has D as its lowest bass pitch, what inversion is it in?",
        "options": [
          {
            "id": "root",
            "label": "Root position (5/3)"
          },
          {
            "id": "first",
            "label": "First inversion (6)"
          },
          {
            "id": "second",
            "label": "Second inversion (6/4)"
          },
          {
            "id": "third",
            "label": "Third inversion (4/2)"
          }
        ],
        "correctOptionId": "second",
        "explanation": "D is the 5th of the G–B–D triad; putting the 5th in the bass creates Second Inversion (6/4)."
      }
    ],
    "summaryText": "Inversions place the 3rd (6) or 5th (6/4) into the bass, enabling linear stepwise basslines while retaining harmonic identity.",
    "keyTakeaways": [
      "Root in bass = Root position; 3rd in bass = 1st Inversion (6); 5th in bass = 2nd Inversion (6/4).",
      "Upper voicings can spread widely across staves without altering the inversion."
    ],
    "terminology": [
      {
        "term": "Inversion",
        "definition": "Rearranging the notes of a chord so that a pitch other than the root sounds in the lowest voice (bass)."
      },
      {
        "term": "Root Position (5/3)",
        "definition": "The root is in the lowest voice (bass); thirds and fifths sound above it."
      },
      {
        "term": "First Inversion (6/3 or 6)",
        "definition": "The third of the chord is in the bass; intervals of a 6th and 3rd sound above it."
      },
      {
        "term": "Second Inversion (6/4)",
        "definition": "The fifth of the chord is in the bass; intervals of a 6th and 4th sound above it (unstable, requiring resolution)."
      },
      {
        "term": "Figured Bass",
        "definition": "A baroque system of numbers written below the bass line indicating intervals to be realized above the bass."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "E4",
        "G4",
        "C5",
        "G3",
        "C4",
        "E4"
      ],
      "showLabels": true,
      "label": "First inversion (E in bass) vs. Second inversion (G in bass)",
      "caption": "First inversion (E4-G4-C5, 'C/E') provides smooth bass lines; second inversion ('C/G') functions as a cadential suspension."
    },
    "practicalApplication": "Inversions create beautiful melodic bass lines. Instead of the bass leaping by fourths and fifths between roots, using first-inversion chords (such as I - V6 - I) allows the bass to move smoothly by step.",
    "videoResource": {
      "title": "Open Yale Courses: Chord Inversions and the Bass Line",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Analysis of classical bass line counterpoint using root position and first inversion triads."
    },
    "references": [
      {
        "title": "Open Music Theory: Inversion and Figured Bass",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Historical realization of figured bass notation (5/3, 6/3, 6/4)."
      },
      {
        "title": "Juilliard Extension: Harmony and Analysis Sequence",
        "authorOrInstitution": "The Juilliard School",
        "url": "https://www.juilliard.edu/stage-beyond/juilliard-extension",
        "licence": "Proprietary Institutional Curriculum",
        "relevance": "Conservatory voice-leading guidelines for first and second inversion triads."
      }
    ]
  },
  {
    "slug": "seventh-chords",
    "title": "Seventh chords",
    "summary": "Extend triads with a fourth stacked third to form Dominant 7th, Major 7th, Minor 7th, and Diminished 7th chords.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "inversions-sevenths-and-progressions",
    "moduleSlug": "sevenths-and-tonal-syntax",
    "level": "intermediate",
    "estimatedMinutes": 10,
    "sortOrder": 8,
    "objectives": [
      "Add a 7th above a triad's root (Root–3rd–5th–7th) to build four-note seventh chords.",
      "Distinguish Major 7th (Maj triad + M7), Dominant 7th (Maj triad + m7), and Minor 7th (min triad + m7).",
      "Hear the tritone inside Dominant 7th (V7, e.g. B–F inside G–B–D–F) pulling cleanly inward to tonic."
    ],
    "sections": [
      {
        "id": "five-common-sevenths",
        "heading": "1. Dominant 7th, Major 7th, and Minor 7th",
        "body": [
          "Stacking one more third atop a triad yields a four-note SEVENTH CHORD. Two ingredients name every seventh chord: [Triad quality] + [7th interval above the root].",
          "1. Dominant Seventh (G7 = G–B–D–F): Major triad + minor 7th. Contains the potent B–F tritone between 3rd and 7th—giving V7 its irresistible harmonic drive into C major. 2. Major Seventh (Cmaj7 = C–E–G–B): Major triad + Major 7th. 3. Minor Seventh (Dm7 = D–F–A–C): Minor triad + minor 7th. 4. Half-diminished 7th (Bm7♭5 = B–D–F–A): Diminished triad + minor 7th. 5. Fully diminished 7th (B°7 = B–D–F–A♭): Diminished triad + diminished 7th."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "G4",
                "B4",
                "D5",
                "F5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "E4",
                "G4",
                "C5"
              ],
              "duration": "h"
            }
          ],
          "label": "G dominant seventh chord (G-B-D-F) resolving to C major (C-E-G-C)",
          "caption": "V7 (G–B–D–F): B4 pushes up to C5 while chordal 7th F5 steps down to E4."
        },
        "audioSteps": [
          {
            "notes": [
              "G4",
              "B4",
              "D5",
              "F5"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "C4",
              "E4",
              "G4",
              "C5"
            ],
            "at": 0.95,
            "duration": 1.2
          }
        ],
        "audioLabel": "Hear G7 dominant seventh resolve to C major"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven",
      "work": "Symphony No. 1 in C major, Op. 21",
      "barReference": "Introduction, measure 1",
      "insight": "Famously, Beethoven refused to begin his C major symphony with a C major chord—opening bar 1 directly with an off-tonic C7 dominant chord pointing toward F major!",
      "audioSteps": [
        {
          "notes": [
            "C4",
            "E4",
            "G4",
            "Bb4"
          ],
          "at": 0,
          "duration": 0.95
        },
        {
          "notes": [
            "F4",
            "A4",
            "C5"
          ],
          "at": 1,
          "duration": 1.1
        }
      ],
      "audioLabel": "Hear opening C7 dominant push into F major"
    },
    "workedExample": {
      "title": "Building D7 vs. Dmaj7 vs. Dm7",
      "scenario": "Spell all three seventh types rooted on D.",
      "steps": [
        "D triad letters = D–F–A–C.",
        "Dmaj7 (Major triad + Major 7th): D – F♯ – A – C♯.",
        "D7 (Dominant = Major triad + minor 7th): D – F♯ – A – C♮.",
        "Dm7 (Minor triad + minor 7th): D – F♮ – A – C♮."
      ],
      "conclusion": "Changing just two half steps spans Dmaj7 → D7 → Dm7 cleanly."
    },
    "practiceActivities": [
      {
        "id": "seventh-q1",
        "prompt": "Which chord combines a Major triad with a minor 7th above the root (e.g. G–B–D–F)?",
        "options": [
          {
            "id": "maj7",
            "label": "Major seventh (Maj7)"
          },
          {
            "id": "dom7",
            "label": "Dominant seventh (7)"
          },
          {
            "id": "min7",
            "label": "Minor seventh (m7)"
          },
          {
            "id": "hdim7",
            "label": "Half-diminished seventh (ø7)"
          }
        ],
        "correctOptionId": "dom7",
        "explanation": "A Major triad + minor 7th defines the Dominant seventh chord (built naturally on scale degree 5)."
      }
    ],
    "summaryText": "Seventh chords layer a fourth note onto a triad, with Dominant V7 supplying classical harmony's strongest cadential pull via its resolving chordal 7th.",
    "keyTakeaways": [
      "Always evaluate [Triad quality] + [7th size above root].",
      "The chordal 7th is an active dissonance that classically resolves downward by step (e.g., F → E in G7 → C)."
    ],
    "terminology": [
      {
        "term": "Seventh Chord",
        "definition": "A four-note tertian chord formed by adding an interval of a seventh above the root."
      },
      {
        "term": "Dominant Seventh (V7)",
        "definition": "A major triad with a minor seventh (Major-Minor 7th); the primary engine of tonal resolution."
      },
      {
        "term": "Major Seventh (M7)",
        "definition": "A major triad with a major seventh; warm, lush, and stable in jazz and impressionist music."
      },
      {
        "term": "Minor Seventh (m7)",
        "definition": "A minor triad with a minor seventh; common on scale degrees ii, iii, and vi."
      },
      {
        "term": "Half-Diminished (ø7)",
        "definition": "A diminished triad with a minor seventh; occurs naturally on degree vii° in major and ii° in minor."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "G3",
        "B3",
        "D4",
        "F4"
      ],
      "showLabels": true,
      "label": "Dominant 7th chord in C Major (G-B-D-F)",
      "caption": "Contains the B-F tritone between third and seventh, which drives compellingly to C and E in the tonic chord."
    },
    "practicalApplication": "In any dominant seventh chord (V7), trace the two active tendency tones: the 3rd (leading tone) resolves UP by half step to the tonic; the 7th resolves DOWN by step to the 3rd of the tonic chord.",
    "videoResource": {
      "title": "Berklee Online: Seventh Chords and Harmonic Tension",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Prof. George W. Russell Jr. analyzes the sonic qualities and inversions of the five principal seventh chords."
    },
    "references": [
      {
        "title": "Open Music Theory: Seventh Chords",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Construction, qualities, and figured bass symbols for all seventh chords."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Seventh Chords",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Voice leading and resolution tendencies of diatonic seventh chords."
      }
    ]
  },
  {
    "slug": "roman-numeral-analysis",
    "title": "Roman numeral analysis",
    "summary": "Label diatonic chords independently of specific key names using uppercase/lowercase Roman numerals (I, ii, iii, IV, V, vi, vii°).",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "inversions-sevenths-and-progressions",
    "moduleSlug": "sevenths-and-tonal-syntax",
    "level": "intermediate",
    "estimatedMinutes": 9,
    "sortOrder": 9,
    "objectives": [
      "Memorize the diatonic triad qualities of EVERY Major key: I, ii, iii, IV, V, vi, vii°.",
      "Recognize natural/harmonic minor chord qualities: i, ii°, III, iv, V (or v), VI, vii°.",
      "Read key-independent harmonic function across transposed keys."
    ],
    "sections": [
      {
        "id": "diatonic-roman-system",
        "heading": "1. Key-independent harmonic grammar",
        "body": [
          "Roman numeral analysis strips away pitch-specific labels like 'G major vs F♯ major' to expose pure harmonic syntax. Case encodes chord quality: UPPERCASE (I, IV, V) = Major; lowercase (ii, iii, vi) = minor; lowercase with circle (vii°, ii°) = diminished.",
          "Across EVERY major key, stacking only scale notes on degrees 1–7 builds an unvarying pattern: I (Maj) – ii (min) – iii (min) – IV (Maj) – V (Maj) – vi (min) – vii° (dim)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4",
                "G4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D4",
                "F4",
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E4",
                "G4",
                "B4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F4",
                "A4",
                "C5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G4",
                "B4",
                "D5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A4",
                "C5",
                "E5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "B4",
                "D5",
                "F5"
              ],
              "duration": "q"
            }
          ],
          "label": "Seven diatonic triads of C major: I, ii, iii, IV, V, vi, vii°",
          "caption": "Diatonic triads of C Major: I (C), ii (Dm), iii (Em), IV (F), V (G), vi (Am), vii° (B°)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 0.45
          },
          {
            "notes": [
              "D4",
              "F4",
              "A4"
            ],
            "at": 0.48,
            "duration": 0.45
          },
          {
            "notes": [
              "E4",
              "G4",
              "B4"
            ],
            "at": 0.96,
            "duration": 0.45
          },
          {
            "notes": [
              "F4",
              "A4",
              "C5"
            ],
            "at": 1.44,
            "duration": 0.45
          },
          {
            "notes": [
              "G4",
              "B4",
              "D5"
            ],
            "at": 1.92,
            "duration": 0.45
          },
          {
            "notes": [
              "A4",
              "C5",
              "E5"
            ],
            "at": 2.4,
            "duration": 0.45
          },
          {
            "notes": [
              "B4",
              "D5",
              "F5"
            ],
            "at": 2.88,
            "duration": 0.45
          },
          {
            "notes": [
              "C5",
              "E5",
              "G5"
            ],
            "at": 3.36,
            "duration": 0.85
          }
        ],
        "audioLabel": "Hear diatonic triad sequence I–ii–iii–IV–V–vi–vii°–I"
      }
    ],
    "repertoireExample": {
      "composer": "Johann Pachelbel",
      "work": "Canon in D major",
      "barReference": "Ground bass ostinato (bars 1–2)",
      "insight": "Pachelbel's perpetual 8-chord progression reads cleanly as I – V – vi – iii – IV – I – IV – V regardless of which key a string ensemble chooses.",
      "audioSteps": [
        {
          "notes": [
            "D4",
            "F#4",
            "A4"
          ],
          "at": 0,
          "duration": 0.5
        },
        {
          "notes": [
            "A3",
            "E4",
            "A4"
          ],
          "at": 0.52,
          "duration": 0.5
        },
        {
          "notes": [
            "B3",
            "D4",
            "F#4"
          ],
          "at": 1.04,
          "duration": 0.5
        },
        {
          "notes": [
            "F#3",
            "C#4",
            "F#4"
          ],
          "at": 1.56,
          "duration": 0.5
        }
      ],
      "audioLabel": "Hear opening of Pachelbel's I–V–vi–iii sequence"
    },
    "workedExample": {
      "title": "Labeling E minor and A7 inside the key of D Major",
      "scenario": "Identify the Roman numerals when key = D Major.",
      "steps": [
        "Scale of D Major: D(1) – E(2) – F♯(3) – G(4) – A(5) – B(6) – C♯(7).",
        "E–G–B builds a minor triad on scale degree 2 → ii.",
        "A–C♯–E–G builds a dominant seventh on scale degree 5 → V7."
      ],
      "conclusion": "In D Major, Em → A7 → D reads cleanly as ii → V7 → I."
    },
    "practiceActivities": [
      {
        "id": "roman-q1",
        "prompt": "In the key of G Major, what Roman numeral describes an E minor chord (E–G–B)?",
        "options": [
          {
            "id": "ii",
            "label": "ii"
          },
          {
            "id": "iii",
            "label": "iii"
          },
          {
            "id": "iv",
            "label": "iv"
          },
          {
            "id": "vi",
            "label": "vi"
          }
        ],
        "correctOptionId": "vi",
        "explanation": "Count scale degrees in G major: G(1)–A(2)–B(3)–C(4)–D(5)–E(6). Degree 6 produces a minor triad: vi."
      }
    ],
    "summaryText": "Roman numerals turn key-specific chord letters into reusable functional patterns transferable across all twelve keys.",
    "keyTakeaways": [
      "Major key triad pattern: I – ii – iii – IV – V – vi – vii°.",
      "Uppercase = Major, lowercase = minor, ° = diminished, + = augmented."
    ],
    "terminology": [
      {
        "term": "Roman Numeral Analysis",
        "definition": "A system of naming chords using Roman numerals to indicate scale degree root and chord quality."
      },
      {
        "term": "Uppercase Numerals",
        "definition": "Signify Major chords (e.g. I, IV, V)."
      },
      {
        "term": "Lowercase Numerals",
        "definition": "Signify Minor chords (e.g. ii, iii, vi) and Diminished chords with a degree symbol (e.g. vii°)."
      },
      {
        "term": "Harmonic Function",
        "definition": "The role a chord plays in establishing or destabilizing the tonal center (Tonic, Predominant, Dominant)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4",
        "F4",
        "A4",
        "C5",
        "G4",
        "B4",
        "D5"
      ],
      "showLabels": true,
      "label": "I (C Major), IV (F Major), V (G Major) Primary Triads",
      "caption": "The three primary major triads in C Major define the harmonic pillars of tonal music."
    },
    "practicalApplication": "Roman numerals free you from fixed key spellings. A I - IV - V - I progression functions identically whether played in C Major, F# Major, or Db Major, making transposing effortless.",
    "videoResource": {
      "title": "Open Yale Courses: Harmonic Syntax and Roman Numerals",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Lecture 6 covers Roman numeral notation, chord function, and classical harmonic syntax."
    },
    "references": [
      {
        "title": "Open Music Theory: Roman Numerals",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Standardized North American conventions for Roman numeral chord labeling."
      },
      {
        "title": "Musictheory.net: Roman Numeral Analysis",
        "authorOrInstitution": "Ricci Adams",
        "url": "https://www.musictheory.net/lessons/44",
        "licence": "Free Web Educational Access",
        "relevance": "Interactive drills analyzing diatonic chord progressions."
      }
    ]
  },
  {
    "slug": "basic-harmonic-progressions",
    "title": "Basic harmonic progressions",
    "summary": "Understand Tonic, Predominant, and Dominant functions, identify Authentic, Half, Plagal, and Deceptive cadences, and build balanced progressions.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "inversions-sevenths-and-progressions",
    "moduleSlug": "sevenths-and-tonal-syntax",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 10,
    "objectives": [
      "Group chords into three functional roles: Tonic (I, vi), Predominant (ii, IV), Dominant (V, V7, vii°).",
      "Recognize standard functional cycle motion: T → PD → D → T (e.g., I – ii6 – V – I or I – IV – V – I).",
      "Distinguish Authentic (V–I), Half (ending on V), Plagal (IV–I), and Deceptive (V–vi) cadences."
    ],
    "sections": [
      {
        "id": "phrase-functions-and-cadences",
        "heading": "1. T → PD → D → T & the four classical cadences",
        "body": [
          "Common-practice harmony thrives on forward harmonic drive rather than random chord changes. Chords serve three functional roles: TONIC (stability/home: I, vi), PREDOMINANT (departure preparing dominant tension: IV, ii), and DOMINANT (urgent tension pulling home: V, V7, vii°).",
          "Phrases close with CADENCES—musical punctuation marks: 1. Authentic Cadence (V → I, conclusive full stop). 2. Half Cadence (ending unresolved on V, comma/question). 3. Plagal Cadence (IV → I, gentle 'Amen' repose). 4. Deceptive Cadence (V → vi, dramatic surprise postponing arrival)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4",
                "G4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D4",
                "F4",
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G4",
                "B4",
                "D5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C4",
                "E4",
                "G4"
              ],
              "duration": "q"
            }
          ],
          "label": "Complete I - ii - V - I authentic cadence phrase in C major",
          "caption": "Classic tonal arc: Tonic (I) → Predominant (ii) → Dominant (V) → Tonic (I)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 0.65
          },
          {
            "notes": [
              "D4",
              "F4",
              "A4"
            ],
            "at": 0.68,
            "duration": 0.65
          },
          {
            "notes": [
              "G4",
              "B4",
              "D5"
            ],
            "at": 1.36,
            "duration": 0.65
          },
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 2.04,
            "duration": 1.1
          }
        ],
        "audioLabel": "Hear complete T → PD → D → T (I–ii–V–I) progression"
      }
    ],
    "repertoireExample": {
      "composer": "Wolfgang Amadeus Mozart",
      "work": "Piano Sonata No. 16 in C major, K. 545",
      "barReference": "Bars 1–4",
      "insight": "Notice Mozart's textbook opening phrase: I (bar 1) → V4/3 (bar 2) → I (bar 3) → IV–I6/4–V (bar 4 Half Cadence), answering smoothly to a full Authentic Cadence by bar 8.",
      "audioSteps": [
        {
          "notes": [
            "C4",
            "E4",
            "G4"
          ],
          "at": 0,
          "duration": 0.6
        },
        {
          "notes": [
            "F4",
            "A4",
            "C5"
          ],
          "at": 0.62,
          "duration": 0.6
        },
        {
          "notes": [
            "G4",
            "B4",
            "D5"
          ],
          "at": 1.24,
          "duration": 0.6
        },
        {
          "notes": [
            "A4",
            "C5",
            "E5"
          ],
          "at": 1.86,
          "duration": 1
        }
      ],
      "audioLabel": "Hear V → vi Deceptive Cadence surprise after IV"
    },
    "workedExample": {
      "title": "Spotting a Deceptive Cadence in F Major",
      "scenario": "A phrase in F Major lands on C7 and resolves unexpectedly to Dm.",
      "steps": [
        "In F Major, C7 = V7 (Dominant seventh).",
        "Standard Authentic Cadence expects F (I).",
        "Instead it steps into Dm (D–F–A) = scale degree 6 minor triad (vi)."
      ],
      "conclusion": "V7 → vi is a Deceptive Cadence."
    },
    "practiceActivities": [
      {
        "id": "prog-q1",
        "prompt": "Which sequence follows the standard classical functional flow Tonic → Predominant → Dominant → Tonic?",
        "options": [
          {
            "id": "i-iv-v-i",
            "label": "I → IV → V → I"
          },
          {
            "id": "v-iv-i-v",
            "label": "V → IV → I → V"
          },
          {
            "id": "i-v-iv-vi",
            "label": "I → V → IV → vi"
          },
          {
            "id": "iv-i-iii-ii",
            "label": "IV → I → iii → ii"
          }
        ],
        "correctOptionId": "i-iv-v-i",
        "explanation": "I (Tonic) departs to IV (Predominant), builds tension on V (Dominant), and resolves cleanly home to I."
      }
    ],
    "summaryText": "Tonal harmony organizes motion cleanly across Tonic, Predominant, and Dominant roles, punctuated by Authentic, Half, Plagal, and Deceptive cadences.",
    "keyTakeaways": [
      "Tonic (I, vi) = home; Predominant (ii, IV) = transition; Dominant (V, V7, vii°) = arrival tension.",
      "Cadences: V–I (Authentic), ?–V (Half), IV–I (Plagal), V–vi (Deceptive)."
    ],
    "terminology": [
      {
        "term": "Harmonic Progression",
        "definition": "A succession of musical chords that moves forward with direction toward a cadence."
      },
      {
        "term": "Tonic Function (T)",
        "definition": "Chords of rest and resolution (I and vi)."
      },
      {
        "term": "Predominant Function (PD)",
        "definition": "Chords that lead toward the dominant (IV and ii)."
      },
      {
        "term": "Dominant Function (D)",
        "definition": "Chords of maximum tension driving to the tonic (V and vii°)."
      },
      {
        "term": "Circle-of-Fifths Progression",
        "definition": "A progression moving root motion by descending fifths (e.g. vi - ii - V - I)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4",
        "D4",
        "F4",
        "A4",
        "G4",
        "B4",
        "D5"
      ],
      "showLabels": true,
      "label": "Tonic to Predominant to Dominant (I - ii - V - I)",
      "caption": "The fundamental syntax of classical harmony: Home (I) -> Bridge (ii) -> Tension (V) -> Home (I)."
    },
    "practicalApplication": "Always organize progressions in your mind by functional categories: Tonic -> Predominant -> Dominant -> Tonic (T -> PD -> D -> T). Never move from Dominant backwards to Predominant in classical style (e.g. avoid V -> IV).",
    "videoResource": {
      "title": "Berklee Online: The Circle of Fifths and Chord Progressions",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee masterclass on chord motion, circle-of-fifths voice leading, and cadence arrivals."
    },
    "references": [
      {
        "title": "Open Music Theory: Harmonic Syntax — A Primer",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "The T-PD-D-T functional paradigm governing common practice harmony."
      },
      {
        "title": "Fundamentals of Music Theory: Functional Harmony",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Voice leading in functional harmonic sequences."
      }
    ]
  },
  {
    "slug": "cadences",
    "title": "Musical cadences and structural punctuation",
    "summary": "Master the four core harmonic cadences—Authentic, Half, Plagal, and Deceptive—and their role in musical punctuation and phrase closure.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "inversions-sevenths-and-progressions",
    "moduleSlug": "sevenths-and-tonal-syntax",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 11,
    "objectives": [
      "Identify and construct Perfect Authentic (PAC), Imperfect Authentic (IAC), Half (HC), Plagal (PC), and Deceptive (DC) cadences.",
      "Correlate musical cadences to linguistic punctuation (period, comma, exclamation mark).",
      "Analyze cadence points in classical phrases and determine strong vs. weak phrase endings."
    ],
    "terminology": [
      {
        "term": "Cadence",
        "definition": "A two-chord formula that concludes a musical phrase, section, or piece."
      },
      {
        "term": "Perfect Authentic Cadence (PAC)",
        "definition": "A V to I cadence where both chords are in root position and the highest soprano voice resolves to scale degree 1."
      },
      {
        "term": "Imperfect Authentic Cadence (IAC)",
        "definition": "A V to I cadence where one or both chords are inverted, or where the soprano ends on degree 3 or 5."
      },
      {
        "term": "Half Cadence (HC)",
        "definition": "A cadence that pauses on the dominant (V) chord, sounding incomplete like a comma or question mark."
      },
      {
        "term": "Plagal Cadence (PC)",
        "definition": "A IV to I cadence ('Amen' cadence) often following an authentic cadence."
      },
      {
        "term": "Deceptive Cadence (DC)",
        "definition": "A V to vi cadence where the dominant resolves unexpectedly to submediant instead of tonic."
      }
    ],
    "sections": [
      {
        "id": "cadence-types-overview",
        "heading": "1. The Grammar of Musical Closure",
        "body": [
          "Just as sentences in literature end with periods, commas, or question marks, musical phrases conclude with cadences. Cadences establish the hierarchy of musical form: without them, music would feel like an endless, unpunctuated run-on sentence.",
          "The strongest closure is the Perfect Authentic Cadence (PAC), requiring root-position V to I with the tonic in the highest voice. A Half Cadence (HC) ends on V, creating an open question that demands an answering phrase."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "G4",
                "B4",
                "D5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "E4",
                "G4",
                "C5"
              ],
              "duration": "h"
            }
          ],
          "label": "Perfect Authentic Cadence (V to I)",
          "caption": "V (G major) resolves to I (C major) with tonic C5 in soprano."
        },
        "audioSteps": [
          {
            "notes": [
              "G4",
              "B4",
              "D5"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "C4",
              "E4",
              "G4",
              "C5"
            ],
            "at": 1,
            "duration": 1.3
          }
        ],
        "audioLabel": "Hear Perfect Authentic Cadence (V - I)"
      }
    ],
    "repertoireExample": {
      "composer": "Joseph Haydn",
      "work": "String Quartet in C major, Op. 76 No. 3 ('Emperor')",
      "barReference": "Movement II, Poco adagio cantabile",
      "insight": "Haydn's famous hymn theme presents a classic antecedent-consequent periodic structure: phrase 1 ends with an open Half Cadence (on V), while phrase 2 answers with a resolute Perfect Authentic Cadence (V-I).",
      "audioSteps": [
        {
          "notes": [
            "D4",
            "F#4",
            "A4"
          ],
          "at": 0,
          "duration": 0.8
        },
        {
          "notes": [
            "G4",
            "B4",
            "D5"
          ],
          "at": 0.9,
          "duration": 1
        },
        {
          "notes": [
            "G4",
            "B4",
            "D5"
          ],
          "at": 2,
          "duration": 0.8
        },
        {
          "notes": [
            "C4",
            "E4",
            "G4",
            "C5"
          ],
          "at": 2.9,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear Haydn Emperor Quartet HC and PAC endings"
    },
    "workedExample": {
      "title": "Classifying a Phrase Ending as PAC vs. IAC",
      "scenario": "In C Major, a phrase ends with a root position G major chord moving to a root position C major chord, with E5 sounding in the soprano voice.",
      "steps": [
        "Both chords are in root position: V to I.",
        "Inspect the highest voice (soprano) of the arrival chord: E5 is scale degree 3, not scale degree 1 (C).",
        "Because scale degree 1 is not in the soprano, the cadence cannot be a PAC."
      ],
      "conclusion": "The phrase concludes with an Imperfect Authentic Cadence (IAC) because the soprano ends on scale degree 3.",
      "notation": {
        "clef": "treble",
        "chords": [
          {
            "keys": [
              "G4",
              "B4",
              "D5"
            ],
            "duration": "h"
          },
          {
            "keys": [
              "C4",
              "G4",
              "E5"
            ],
            "duration": "h"
          }
        ],
        "label": "Imperfect Authentic Cadence (Soprano on 3)",
        "caption": "V to I with soprano ending on E5 (scale degree 3)."
      },
      "audioSteps": [
        {
          "notes": [
            "G4",
            "B4",
            "D5"
          ],
          "at": 0,
          "duration": 0.9
        },
        {
          "notes": [
            "C4",
            "G4",
            "E5"
          ],
          "at": 1,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear Imperfect Authentic Cadence (IAC)"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "G3",
        "B3",
        "D4",
        "C4",
        "E4",
        "G4",
        "C5"
      ],
      "showLabels": true,
      "label": "Authentic Cadence voice leading on keyboard",
      "caption": "Leading tone B3 steps up to C4; fifth D4 steps down to C4; root G3 jumps to C4 in bass."
    },
    "practicalApplication": "When practicing any piece, first identify the cadence points at the ends of phrases. Pausing slightly at Half Cadences and breathing before the answering phrase gives your performance natural rhetorical shape.",
    "videoResource": {
      "title": "Open Yale Courses: Cadences and Musical Punctuation",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Prof. Wright explains the rhetorical function of PAC, IAC, Half, and Deceptive cadences in classical forms."
    },
    "references": [
      {
        "title": "Open Music Theory: Cadences",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Complete taxonomy of authentic, half, plagal, and deceptive cadences."
      },
      {
        "title": "Fundamentals of Music Theory: Cadences and Phrases",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Cadential analysis in baroque chorales and classical themes."
      }
    ],
    "practiceActivities": [
      {
        "id": "cadence-q1",
        "prompt": "A phrase in G major ends with a D major chord (V) moving unexpectedly to an E minor chord (vi). What type of cadence is this?",
        "options": [
          {
            "id": "deceptive",
            "label": "Deceptive Cadence (DC)"
          },
          {
            "id": "plagal",
            "label": "Plagal Cadence (PC)"
          },
          {
            "id": "half",
            "label": "Half Cadence (HC)"
          },
          {
            "id": "pac",
            "label": "Perfect Authentic Cadence (PAC)"
          }
        ],
        "correctOptionId": "deceptive",
        "explanation": "A cadence where the dominant (V) resolves unexpectedly to the submediant (vi) instead of tonic is a Deceptive Cadence."
      }
    ],
    "summaryText": "Cadences are the structural punctuation marks of music, organizing continuous melody into balanced phrases through varying degrees of harmonic tension and finality.",
    "keyTakeaways": [
      "PAC offers maximum finality (root position V-I with tonic in soprano).",
      "Half Cadence acts as a comma, pausing on V to invite an answering consequent phrase.",
      "Deceptive Cadence (V-vi) extends musical time by postponing expected tonic resolution."
    ]
  },
  {
    "slug": "basic-voice-leading",
    "title": "Basic voice leading and part writing",
    "summary": "Master the core rules of 4-part SATB voice leading, including independent voice motion, doubling rules, and avoiding parallel fifths and octaves.",
    "learningPathSlug": "intervals-and-harmony",
    "courseSlug": "inversions-sevenths-and-progressions",
    "moduleSlug": "sevenths-and-tonal-syntax",
    "level": "intermediate",
    "estimatedMinutes": 12,
    "sortOrder": 12,
    "objectives": [
      "Apply 4-part SATB (Soprano, Alto, Tenor, Bass) vocal ranges and spacing limits.",
      "Execute contrary, parallel, similar, and oblique voice motion.",
      "Avoid parallel fifths and octaves to preserve voice independence.",
      "Follow standard doubling guidelines (double the root in root-position major and minor triads)."
    ],
    "terminology": [
      {
        "term": "Voice Leading (Part Writing)",
        "definition": "The principles governing how individual melodic lines (voices) move from chord to chord."
      },
      {
        "term": "SATB",
        "definition": "The standard four-voice choir framework: Soprano, Alto, Tenor, and Bass."
      },
      {
        "term": "Parallel Fifths / Octaves",
        "definition": "Two voices moving in the same direction separated by a fifth or octave; strictly avoided in classical counterpoint because it destroys voice independence."
      },
      {
        "term": "Contrary Motion",
        "definition": "Two voices moving in opposite directions (one up, one down); the strongest tool for maintaining independent lines."
      },
      {
        "term": "Tendency Tones",
        "definition": "Pitches with a strong directional drive (e.g. leading tone resolving up to tonic, chordal 7th resolving down)."
      }
    ],
    "sections": [
      {
        "id": "voice-leading-principles",
        "heading": "1. The Golden Rule: Move each voice by the shortest path",
        "body": [
          "In choral and classical music, chords are not struck as rigid blocks. Instead, they are formed by the confluence of four independent horizontal melodies: Soprano, Alto, Tenor, and Bass (SATB).",
          "The foundational law of good voice leading is melodic economy: whenever possible, retain common tones in the same voice and move other voices by step to the nearest chord tone. This creates fluid, singable lines and avoids awkward leaps."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "C4",
                "E4",
                "G4",
                "C5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "C4",
                "F4",
                "A4",
                "C5"
              ],
              "duration": "h"
            }
          ],
          "label": "I to IV voice leading with retained common tone (C)",
          "caption": "Soprano and bass hold C; alto moves E to F; tenor moves G to A."
        },
        "audioSteps": [
          {
            "notes": [
              "C3",
              "G3",
              "E4",
              "C5"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "F3",
              "A3",
              "F4",
              "C5"
            ],
            "at": 1,
            "duration": 1.2
          }
        ],
        "audioLabel": "Hear smooth 4-part voice leading from I to IV"
      }
    ],
    "repertoireExample": {
      "composer": "Johann Sebastian Bach",
      "work": "Chorale 'O Haupt voll Blut und Wunden' (St. Matthew Passion)",
      "barReference": "BWV 244, bars 1–4",
      "insight": "Bach's four-part chorales represent the pinnacle of tonal voice leading: every single voice—including the inner alto and tenor lines—possesses its own rich, expressive melodic contour.",
      "audioSteps": [
        {
          "notes": [
            "F3",
            "A3",
            "C4",
            "F4"
          ],
          "at": 0,
          "duration": 0.6
        },
        {
          "notes": [
            "D3",
            "F3",
            "D4",
            "F4"
          ],
          "at": 0.6,
          "duration": 0.6
        },
        {
          "notes": [
            "G3",
            "B3",
            "D4",
            "G4"
          ],
          "at": 1.2,
          "duration": 0.6
        },
        {
          "notes": [
            "C3",
            "G3",
            "E4",
            "C5"
          ],
          "at": 1.8,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear Bach chorale 4-part SATB voice leading excerpt"
    },
    "workedExample": {
      "title": "Avoiding Parallel Fifths Between I and V",
      "scenario": "Voice a progression from C Major (I) to G Major (V) in 4-part SATB.",
      "steps": [
        "In the bass, move C3 up to G3 (or down to G2).",
        "Do NOT move the upper voices in parallel fifths with the bass.",
        "Instead, use CONTRARY MOTION: while the bass leaps, have the upper voices move downward to the nearest chord tones.",
        "Soprano moves C5 down to B4; Alto moves G4 down to D4; Tenor moves E4 down to D4 or holds G."
      ],
      "conclusion": "Contrary motion between bass and soprano prevents parallel fifths and preserves voice independence.",
      "notation": {
        "clef": "treble",
        "chords": [
          {
            "keys": [
              "C4",
              "G4",
              "C5"
            ],
            "duration": "h"
          },
          {
            "keys": [
              "B3",
              "G4",
              "D5"
            ],
            "duration": "h"
          }
        ],
        "label": "Contrary motion voice leading",
        "caption": "Upper voices step downward as bass moves upward."
      },
      "audioSteps": [
        {
          "notes": [
            "C3",
            "G3",
            "E4",
            "C5"
          ],
          "at": 0,
          "duration": 0.9
        },
        {
          "notes": [
            "G2",
            "G3",
            "D4",
            "B4"
          ],
          "at": 1,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear I to V contrary motion voice leading"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "C3",
        "G2",
        "G3",
        "D4",
        "B4",
        "C5"
      ],
      "showLabels": true,
      "label": "SATB spread across bass and treble registers",
      "caption": "Keep adjacent upper voices (Soprano-Alto, Alto-Tenor) within an octave of each other; the bass may sit further below."
    },
    "practicalApplication": "When writing four-part harmony, play each voice separately (Soprano alone, Alto alone, Tenor alone, Bass alone). If any inner voice feels unmusical or awkward to sing, adjust your voicing.",
    "videoResource": {
      "title": "Open Yale Courses: Voice Leading and Bach Chorales",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Prof. Wright breaks down 4-part SATB part writing and the acoustic reason why parallel fifths and octaves are avoided."
    },
    "references": [
      {
        "title": "Open Music Theory: Voice Leading and Part Writing",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Comprehensive rules for SATB ranges, spacing, doubling, and motion types."
      },
      {
        "title": "Juilliard Extension: Four-Part Harmony and Counterpoint",
        "authorOrInstitution": "The Juilliard School",
        "url": "https://www.juilliard.edu/stage-beyond/juilliard-extension",
        "licence": "Proprietary Institutional Curriculum",
        "relevance": "Traditional conservatory part-writing and Bach chorale analysis standards."
      }
    ],
    "practiceActivities": [
      {
        "id": "voice-leading-q1",
        "prompt": "Why are parallel fifths and octaves forbidden in standard Classical voice leading?",
        "options": [
          {
            "id": "destroy-independence",
            "label": "They destroy the perceived independence of the two voice lines"
          },
          {
            "id": "dissonant",
            "label": "They sound too dissonant to the ear"
          },
          {
            "id": "too-quiet",
            "label": "They make the music sound too quiet"
          },
          {
            "id": "cant-sing",
            "label": "They are physically impossible for singers to perform"
          }
        ],
        "correctOptionId": "destroy-independence",
        "explanation": "Parallel fifths and octaves cause two independent melodic lines to fuse acoustically into one, undermining the polyphonic texture."
      }
    ],
    "summaryText": "Voice leading organizes chords as living, moving contrapuntal melodies; observing smooth stepwise motion and contrary direction maintains clean voice independence.",
    "keyTakeaways": [
      "Always move voices by the smallest possible step; keep common tones in the same voice.",
      "Use contrary motion between outer voices to avoid parallel fifths and octaves.",
      "In root-position triads, double the root for balanced acoustic weight."
    ]
  }
];

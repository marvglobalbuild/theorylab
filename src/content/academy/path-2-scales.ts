import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_2_SCALES: AcademyPathDefinition = {
  "slug": "scales-and-tonality",
  "numeral": "II",
  "title": "Scales and Tonality",
  "summary": "Construct major, natural, harmonic, and melodic minor scales, trace the circle of fifths, pair relative keys, and understand church modes.",
  "level": "elementary",
  "sortOrder": 2
};

export const PATH_2_COURSES: AcademyCourseDefinition[] = [
  {
    "slug": "major-and-minor-scale-construction",
    "learningPathSlug": "scales-and-tonality",
    "title": "Major & Minor Scale Systems",
    "description": "Build major and all three forms of the minor scale cleanly by semitone–tone formulas, and hear their distinct leading-tone pull.",
    "level": "elementary",
    "sortOrder": 1,
    "estimatedMinutes": 50
  },
  {
    "slug": "key-signatures-and-modality",
    "learningPathSlug": "scales-and-tonality",
    "title": "Key Signatures, Circle of Fifths & Modes",
    "description": "Read any sharp or flat key signature in seconds, navigate relative major/minor keys, and explore diatonic modes.",
    "level": "elementary",
    "sortOrder": 2,
    "estimatedMinutes": 45
  }
];

export const PATH_2_MODULES: AcademyModuleDefinition[] = [
  {
    "slug": "diatonic-scales-and-major",
    "courseSlug": "major-and-minor-scale-construction",
    "learningPathSlug": "scales-and-tonality",
    "title": "Module 1 · Scale Degree Architecture & Major Scales",
    "summary": "How step patterns establish tonal centres.",
    "sortOrder": 1
  },
  {
    "slug": "three-forms-of-minor",
    "courseSlug": "major-and-minor-scale-construction",
    "learningPathSlug": "scales-and-tonality",
    "title": "Module 2 · Natural, Harmonic & Melodic Minor",
    "summary": "Compare all three classic minor colorations in theory and sound.",
    "sortOrder": 2
  },
  {
    "slug": "keys-circle-and-modes",
    "courseSlug": "key-signatures-and-modality",
    "learningPathSlug": "scales-and-tonality",
    "title": "Module 3 · Key Signatures, Relative Keys & Modes",
    "summary": "Map every key around the circle of fifths and derive the seven modes.",
    "sortOrder": 3
  }
];

export const PATH_2_LESSONS: AcademyLessonContent[] = [
  {
    "slug": "understanding-scales",
    "title": "Understanding scales",
    "summary": "Discover what turns a sequence of pitches into a tonal scale: tonic gravity, scale-degree names, and diatonic spelling.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "major-and-minor-scale-construction",
    "moduleSlug": "diatonic-scales-and-major",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 1,
    "objectives": [
      "Define a diatonic scale as a seven-note stepwise ladder spanning one octave.",
      "Learn classical scale-degree labels: Tonic, Supertonic, Mediant, Subdominant, Dominant, Submediant, Leading Tone.",
      "Spell scales alphabetically using each letter A–G once."
    ],
    "sections": [
      {
        "id": "tonic-and-degrees",
        "heading": "1. Tonal gravity and the seven scale degrees",
        "body": [
          "The word scale comes from the Latin scala ('ladder'). Rather than random pitches, a diatonic scale organizes seven consecutive letter names around a central home note called the tonic (scale degree 1).",
          "In classical theory every degree plays an active tonal role: Dominant (5) projects outward stability; Leading Tone (7) leans strongly up into the Tonic (8/1); Subdominant (4) mirrors the fifth below the tonic."
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
                "D4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F4"
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
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "q"
            }
          ],
          "label": "C major diatonic scale rising across all seven unique letters to C5",
          "caption": "Scale degrees 1–8: Tonic (C) up through Leading Tone (B) and octave Tonic (C)."
        },
        "audioSteps": [
          {
            "notes": [
              "C4"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "D4"
            ],
            "at": 0.38,
            "duration": 0.35
          },
          {
            "notes": [
              "E4"
            ],
            "at": 0.76,
            "duration": 0.35
          },
          {
            "notes": [
              "F4"
            ],
            "at": 1.14,
            "duration": 0.35
          },
          {
            "notes": [
              "G4"
            ],
            "at": 1.52,
            "duration": 0.35
          },
          {
            "notes": [
              "A4"
            ],
            "at": 1.9,
            "duration": 0.35
          },
          {
            "notes": [
              "B4"
            ],
            "at": 2.28,
            "duration": 0.45
          },
          {
            "notes": [
              "C5"
            ],
            "at": 2.75,
            "duration": 0.85
          }
        ],
        "audioLabel": "Hear diatonic tension resolve on upper Tonic C5"
      }
    ],
    "repertoireExample": {
      "composer": "Wolfgang Amadeus Mozart",
      "work": "Clarinet Concerto in A major, K. 622",
      "barReference": "I. Allegro, opening scale figures",
      "insight": "Mozart frequently sweeps cleanly across a full diatonic scale from dominant up to tonic so listeners immediately sense the home key.",
      "audioSteps": [
        {
          "notes": [
            "A4"
          ],
          "at": 0,
          "duration": 0.35
        },
        {
          "notes": [
            "B4"
          ],
          "at": 0.38,
          "duration": 0.35
        },
        {
          "notes": [
            "C#5"
          ],
          "at": 0.76,
          "duration": 0.35
        },
        {
          "notes": [
            "D5"
          ],
          "at": 1.14,
          "duration": 0.35
        },
        {
          "notes": [
            "E5"
          ],
          "at": 1.52,
          "duration": 0.75
        }
      ],
      "audioLabel": "Hear rising A major diatonic pentachord"
    },
    "workedExample": {
      "title": "The golden spelling rule of diatonic scales",
      "scenario": "Spell a seven-note scale starting on D without repeating any letter name.",
      "steps": [
        "Write the seven distinct letters first: D – E – F – G – A – B – C – D.",
        "Never skip a letter or write two forms of the same letter (like F and F♯ in a single major scale).",
        "Adjust tones and semitones next using accidentals."
      ],
      "conclusion": "Every major and minor scale uses all seven letter names once before repeating the tonic."
    },
    "practiceActivities": [
      {
        "id": "scales-q1",
        "prompt": "What is the classical name for scale degree 5?",
        "options": [
          {
            "id": "mediant",
            "label": "Mediant"
          },
          {
            "id": "subdominant",
            "label": "Subdominant"
          },
          {
            "id": "dominant",
            "label": "Dominant"
          },
          {
            "id": "supertonic",
            "label": "Supertonic"
          }
        ],
        "correctOptionId": "dominant",
        "explanation": "Degree 5 is the Dominant—second only to the Tonic (1) in harmonic pull."
      }
    ],
    "summaryText": "Diatonic scales arrange all seven unique letters into an asymmetric ladder of tones and semitones orbiting a central tonic.",
    "keyTakeaways": [
      "Degree 1 = Tonic; Degree 4 = Subdominant; Degree 5 = Dominant; Degree 7 = Leading Tone.",
      "Always write one note per letter line/space before adjusting accidentals."
    ],
    "terminology": [
      {
        "term": "Scale",
        "definition": "An ordered collection of pitches arranged in ascending or descending order of pitch height."
      },
      {
        "term": "Scale Degree",
        "definition": "The specific position of a note within a scale, designated by numbers 1 through 8 with carets (e.g. 1 to 8)."
      },
      {
        "term": "Tonic",
        "definition": "The first scale degree (1); the tonal home center and point of ultimate harmonic resolution."
      },
      {
        "term": "Octave Equivalence",
        "definition": "The principle that pitches an octave apart share the same harmonic identity and pitch class."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",
        "C5"
      ],
      "showLabels": true,
      "label": "Diatonic scale collection (C4 to C5)",
      "caption": "An eight-note diatonic octave collection moving in stepwise motion from tonic to tonic."
    },
    "practicalApplication": "When learning any new piece, immediately identify its scale collection. Scales are the tonal vocabulary from which melodies and harmonies are constructed.",
    "videoResource": {
      "title": "Open Yale Courses: Melody, Scale and Tonality",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-5",
      "embedPermitted": false,
      "notes": "MUSI 112 Lecture 5 examines how scales form the acoustic and psychological foundation of Western tonality."
    },
    "references": [
      {
        "title": "Open Music Theory: Introduction to Diatonic Modes and Scales",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Defines scale degrees, tonic gravity, and stepwise linear motion."
      },
      {
        "title": "Fundamentals of Music Theory: Scales and Pitch Collections",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Acoustic origins and step-pattern formulas of diatonic scales."
      }
    ]
  },
  {
    "slug": "major-scales",
    "title": "Major scales",
    "summary": "Construct any major scale from the Whole–Whole–Half–Whole–Whole–Whole–Half (T–T–S–T–T–T–S) step formula.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "major-and-minor-scale-construction",
    "moduleSlug": "diatonic-scales-and-major",
    "level": "elementary",
    "estimatedMinutes": 10,
    "sortOrder": 2,
    "objectives": [
      "Apply the major scale formula T–T–S–T–T–T–S starting from any pitch.",
      "Understand the two identical four-note tetrachords (T–T–S) joined by a tone.",
      "Build sharp major scales (G, D, A) and flat major scales (F, B♭)."
    ],
    "sections": [
      {
        "id": "major-formula",
        "heading": "1. The T–T–S–T–T–T–S blueprint",
        "body": [
          "The C major scale occurs naturally on white keys because its natural semitones E–F (degrees 3–4) and B–C (degrees 7–8) match the exact major pattern: Tone – Tone – Semitone – Tone – Tone – Tone – Semitone.",
          "Notice its symmetry: C–D–E–F (T–T–S) and G–A–B–C (T–T–S) are two identical four-note tetrachords connected by a central whole tone (F–G)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "G4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F#5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G5"
              ],
              "duration": "q"
            }
          ],
          "label": "G major scale rising G4 to G5 requiring F-sharp on degree 7",
          "caption": "G Major requires F♯ on degree 7 so E–F♯ (tone) and F♯–G (semitone) preserve T–T–S–T–T–T–S."
        },
        "audioSteps": [
          {
            "notes": [
              "G4"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "A4"
            ],
            "at": 0.36,
            "duration": 0.35
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.72,
            "duration": 0.35
          },
          {
            "notes": [
              "C5"
            ],
            "at": 1.08,
            "duration": 0.35
          },
          {
            "notes": [
              "D5"
            ],
            "at": 1.44,
            "duration": 0.35
          },
          {
            "notes": [
              "E5"
            ],
            "at": 1.8,
            "duration": 0.35
          },
          {
            "notes": [
              "F#5"
            ],
            "at": 2.16,
            "duration": 0.42
          },
          {
            "notes": [
              "G5"
            ],
            "at": 2.6,
            "duration": 0.8
          }
        ],
        "audioLabel": "Hear G Major scale (with F♯ leading tone)"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven",
      "work": "Symphony No. 9, IV ('Ode to Joy' theme)",
      "barReference": "Bars 92–99",
      "insight": "The 'Ode to Joy' theme stays exclusively inside the first five notes of D major (F♯4–G4–A4–D4), demonstrating the luminous stability of the major tetrachord.",
      "audioSteps": [
        {
          "notes": [
            "F#4"
          ],
          "at": 0,
          "duration": 0.35
        },
        {
          "notes": [
            "F#4"
          ],
          "at": 0.38,
          "duration": 0.35
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.76,
          "duration": 0.35
        },
        {
          "notes": [
            "A4"
          ],
          "at": 1.14,
          "duration": 0.35
        },
        {
          "notes": [
            "A4"
          ],
          "at": 1.52,
          "duration": 0.35
        },
        {
          "notes": [
            "G4"
          ],
          "at": 1.9,
          "duration": 0.35
        },
        {
          "notes": [
            "F#4"
          ],
          "at": 2.28,
          "duration": 0.35
        },
        {
          "notes": [
            "E4"
          ],
          "at": 2.66,
          "duration": 0.35
        },
        {
          "notes": [
            "D4"
          ],
          "at": 3.04,
          "duration": 0.75
        }
      ],
      "audioLabel": "Hear D major pentachord in 'Ode to Joy'"
    },
    "workedExample": {
      "title": "Building F Major from the formula",
      "scenario": "Apply T–T–S–T–T–T–S starting from F4.",
      "steps": [
        "1 to 2 (T): F → G.",
        "2 to 3 (T): G → A.",
        "3 to 4 (S): A → B♭ (must be B♭ rather than A♯ so every letter F–G–A–B appears once!).",
        "4 to 5 (T): B♭ → C; 5 to 6 (T): C → D; 6 to 7 (T): D → E; 7 to 8 (S): E → F."
      ],
      "conclusion": "F Major contains one flat: B♭ (F–G–A–B♭–C–D–E–F)."
    },
    "practiceActivities": [
      {
        "id": "major-q1",
        "prompt": "Which two sharps are required to build a D Major scale?",
        "options": [
          {
            "id": "fc",
            "label": "F♯ and C♯"
          },
          {
            "id": "fg",
            "label": "F♯ and G♯"
          },
          {
            "id": "bc",
            "label": "B♯ and C♯"
          },
          {
            "id": "cf",
            "label": "F♯ and D♯"
          }
        ],
        "correctOptionId": "fc",
        "explanation": "Starting on D: D–E(T)–F♯(T)–G(S)–A(T)–B(T)–C♯(T)–D(S). F♯ maintains the 3rd and C♯ creates the leading-tone semitone to D."
      }
    ],
    "summaryText": "All twelve major scales share one invariant interval spacing: Tone–Tone–Semitone–Tone–Tone–Tone–Semitone.",
    "keyTakeaways": [
      "Semitones in every major scale fall between degrees 3–4 and 7–8.",
      "Always preserve sequential letters—thus F major uses B♭, never A♯."
    ],
    "terminology": [
      {
        "term": "Major Scale",
        "definition": "A seven-note diatonic scale defined by the step pattern Whole-Whole-Half-Whole-Whole-Whole-Half."
      },
      {
        "term": "Tetrachord",
        "definition": "A series of four notes spanning a perfect fourth with the interval pattern Whole-Whole-Half."
      },
      {
        "term": "Leading Tone",
        "definition": "Scale degree 7; located a half step below the tonic, possessing strong melodic pull toward 1."
      },
      {
        "term": "Mediant",
        "definition": "Scale degree 3; located midway between the tonic and dominant, defining major vs. minor quality."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",
        "C5"
      ],
      "showLabels": true,
      "label": "C Major scale (all natural white keys)",
      "caption": "Observe the semitones between scale degrees 3–4 (E–F) and 7–8 (B–C)."
    },
    "practicalApplication": "Sing the leading tone (7) and resolve it up by half step to tonic (1). Feeling this physical vocal tension and resolution trains your ear to instinctively recognize tonal gravity in any key.",
    "videoResource": {
      "title": "BerkleeX: Constructing Major Scales",
      "publisher": "Berklee College of Music",
      "url": "https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory",
      "embedPermitted": false,
      "notes": "Prof. George W. Russell Jr. constructs major scales across the circle of keys using whole and half step formulas."
    },
    "references": [
      {
        "title": "Open Music Theory: Major Scales",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Tetrachordal construction, step patterns, and chromatic transpositions."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Major Scales",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Solfege syllables (Do-Re-Mi-Fa-Sol-La-Ti-Do) applied to all 12 major scales."
      }
    ]
  },
  {
    "slug": "natural-minor-scales",
    "title": "Natural minor scales",
    "summary": "Hear how lowering degrees 3, 6, and 7 transforms major warmth into the aeolian color of natural minor (T–S–T–T–S–T–T).",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "major-and-minor-scale-construction",
    "moduleSlug": "diatonic-scales-and-major",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 3,
    "objectives": [
      "Derive A natural minor cleanly on white keys: A–B–C–D–E–F–G–A.",
      "Construct natural minor scales using Tone–Semitone–Tone–Tone–Semitone–Tone–Tone.",
      "Compare parallel major vs. parallel minor (e.g., C major vs. C natural minor: ♭3, ♭6, ♭7)."
    ],
    "sections": [
      {
        "id": "aeolian-pattern",
        "heading": "1. Lowered 3rd, 6th, and 7th degrees",
        "body": [
          "The natural minor scale follows the pattern T–S–T–T–S–T–T, placing its semitones between degrees 2–3 and 5–6. A natural minor uses only the piano white keys from A to A.",
          "Compared against a parallel major scale sharing the same tonic, natural minor flattens degrees 3, 6, and 7—producing a darker minor third at the bottom and a gentler whole-step subtonic (7 to 8) at the top."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A5"
              ],
              "duration": "q"
            }
          ],
          "label": "A natural minor scale rising across white keys A4 to A5",
          "caption": "A Natural Minor: semitones sit cleanly between B–C (2–3) and E–F (5–6)."
        },
        "audioSteps": [
          {
            "notes": [
              "A4"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.36,
            "duration": 0.35
          },
          {
            "notes": [
              "C5"
            ],
            "at": 0.72,
            "duration": 0.35
          },
          {
            "notes": [
              "D5"
            ],
            "at": 1.08,
            "duration": 0.35
          },
          {
            "notes": [
              "E5"
            ],
            "at": 1.44,
            "duration": 0.35
          },
          {
            "notes": [
              "F5"
            ],
            "at": 1.8,
            "duration": 0.35
          },
          {
            "notes": [
              "G5"
            ],
            "at": 2.16,
            "duration": 0.42
          },
          {
            "notes": [
              "A5"
            ],
            "at": 2.6,
            "duration": 0.8
          }
        ],
        "audioLabel": "Hear A natural minor scale"
      }
    ],
    "repertoireExample": {
      "composer": "Ralph Vaughan Williams / English folk tradition",
      "work": "Fantasia on 'Greensleeves'",
      "barReference": "Opening theme",
      "insight": "Natural minor melodies frequently savor the unraised subtonic (♭7) descending from A to G without the sharp classical leading tone.",
      "audioSteps": [
        {
          "notes": [
            "A4"
          ],
          "at": 0,
          "duration": 0.35
        },
        {
          "notes": [
            "C5"
          ],
          "at": 0.38,
          "duration": 0.65
        },
        {
          "notes": [
            "D5"
          ],
          "at": 1.05,
          "duration": 0.35
        },
        {
          "notes": [
            "E5"
          ],
          "at": 1.42,
          "duration": 0.55
        },
        {
          "notes": [
            "F5"
          ],
          "at": 1.98,
          "duration": 0.25
        },
        {
          "notes": [
            "E5"
          ],
          "at": 2.25,
          "duration": 0.35
        },
        {
          "notes": [
            "D5"
          ],
          "at": 2.62,
          "duration": 0.65
        },
        {
          "notes": [
            "B4"
          ],
          "at": 3.28,
          "duration": 0.35
        },
        {
          "notes": [
            "G4"
          ],
          "at": 3.65,
          "duration": 0.65
        }
      ],
      "audioLabel": "Hear natural minor subtonic color (G4 beneath A)"
    },
    "workedExample": {
      "title": "Transforming C Major into C Natural Minor",
      "scenario": "Lower degrees 3, 6, and 7 of C major by one semitone.",
      "steps": [
        "C major = C – D – E – F – G – A – B – C.",
        "Lower degree 3 (E → E♭), degree 6 (A → A♭), and degree 7 (B → B♭)."
      ],
      "conclusion": "C natural minor = C – D – E♭ – F – G – A♭ – B♭ – C (matching E♭ major's three flats)."
    },
    "practiceActivities": [
      {
        "id": "natminor-q1",
        "prompt": "Between which scale degrees do the semitones fall in every natural minor scale?",
        "options": [
          {
            "id": "34-78",
            "label": "3–4 and 7–8"
          },
          {
            "id": "23-56",
            "label": "2–3 and 5–6"
          },
          {
            "id": "23-78",
            "label": "2–3 and 7–8"
          },
          {
            "id": "12-45",
            "label": "1–2 and 4–5"
          }
        ],
        "correctOptionId": "23-56",
        "explanation": "The natural minor pattern T–S–T–T–S–T–T puts semitones at 2–3 and 5–6."
      }
    ],
    "summaryText": "Natural minor lowers degrees 3, 6, and 7 relative to major, creating semitones at 2–3 and 5–6 and a whole-tone subtonic at 7–8.",
    "keyTakeaways": [
      "Natural minor formula = T–S–T–T–S–T–T.",
      "Subtonic 7 lies a whole tone below the tonic, yielding a modal/folk character."
    ],
    "terminology": [
      {
        "term": "Natural Minor Scale",
        "definition": "A diatonic minor scale defined by the step formula Whole-Half-Whole-Whole-Half-Whole-Whole."
      },
      {
        "term": "Subtonic",
        "definition": "Scale degree 7 in natural minor, positioned a whole step below the tonic (lacking a leading-tone half-step pull)."
      },
      {
        "term": "Minor Third",
        "definition": "An interval of 3 semitones between tonic and scale degree 3, giving the minor scale its characteristic melancholic color."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "A3",
        "B3",
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "A4"
      ],
      "showLabels": true,
      "label": "A Natural Minor scale (relative minor to C Major)",
      "caption": "Natural minor features half steps between 2–3 (B–C) and 5–6 (E–F), with a subtonic at 7 (G)."
    },
    "practicalApplication": "Compare C major (C-D-E-F-G-A-B-C) with A natural minor (A-B-C-D-E-F-G-A). While both use identical white keys, their tonal centers and interval step orders create completely distinct emotional spaces.",
    "videoResource": {
      "title": "Fundamentals of Music Theory: Minor Scales",
      "publisher": "University of Edinburgh (Reid School of Music)",
      "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
      "embedPermitted": false,
      "notes": "Instructional module on natural minor step structure and its modal heritage (Aeolian mode)."
    },
    "references": [
      {
        "title": "Open Music Theory: Minor Scales",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Diatonic step patterns and historical derivation of natural minor."
      },
      {
        "title": "Integrated Musicianship: Minor Scales and Solfège",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "La-based and Do-based minor solfege methods."
      }
    ]
  },
  {
    "slug": "harmonic-minor-scales",
    "title": "Harmonic minor scales",
    "summary": "Raise the seventh degree by a semitone to restore the leading-tone pull toward the tonic and create a major dominant V chord.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "major-and-minor-scale-construction",
    "moduleSlug": "three-forms-of-minor",
    "level": "elementary",
    "estimatedMinutes": 9,
    "sortOrder": 4,
    "objectives": [
      "Raise scale degree 7 of a natural minor scale to create harmonic minor.",
      "Identify the distinctive 3-semitone (augmented 2nd) leap between degrees 6 and ♯7.",
      "Understand why classical composers alter degree 7 for dominant harmony."
    ],
    "sections": [
      {
        "id": "raised-seventh",
        "heading": "1. Restoring the leading tone for V → i cadences",
        "body": [
          "In natural minor, the seventh degree sits a whole tone below the tonic, making the fifth chord minor (v) and softening cadential pull. Classical harmony therefore raises degree 7 by a semitone, producing the Harmonic Minor scale: A–B–C–D–E–F–G♯–A.",
          "That raised G♯ turns E–G–B into a bright E major triad (V) that drives resolutely into A minor (i), while simultaneously opening an exotic three-semitone gap—an augmented second—between F (6) and G♯ (♯7)."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G#5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A5"
              ],
              "duration": "q"
            }
          ],
          "label": "A harmonic minor scale highlighting raised G-sharp 5 before A5",
          "caption": "A Harmonic Minor: notice the augmented second jump from F5 to G♯5."
        },
        "audioSteps": [
          {
            "notes": [
              "A4"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.36,
            "duration": 0.35
          },
          {
            "notes": [
              "C5"
            ],
            "at": 0.72,
            "duration": 0.35
          },
          {
            "notes": [
              "D5"
            ],
            "at": 1.08,
            "duration": 0.35
          },
          {
            "notes": [
              "E5"
            ],
            "at": 1.44,
            "duration": 0.35
          },
          {
            "notes": [
              "F5"
            ],
            "at": 1.8,
            "duration": 0.45
          },
          {
            "notes": [
              "G#5"
            ],
            "at": 2.28,
            "duration": 0.55
          },
          {
            "notes": [
              "A5"
            ],
            "at": 2.86,
            "duration": 0.85
          }
        ],
        "audioLabel": "Hear A harmonic minor scale with F–G♯ interval"
      }
    ],
    "repertoireExample": {
      "composer": "Wolfgang Amadeus Mozart",
      "work": "Symphony No. 40 in G minor, K. 550",
      "barReference": "I. Molto allegro, cadential bars",
      "insight": "While Mozart's key signature carries only two flats (B♭, E♭), cadences throughout the opening movement shine with accidental F♯s—the hallmark of G harmonic minor.",
      "audioSteps": [
        {
          "notes": [
            "D4",
            "F#4",
            "A4",
            "C5"
          ],
          "at": 0,
          "duration": 0.9
        },
        {
          "notes": [
            "G4",
            "Bb4",
            "D5"
          ],
          "at": 0.95,
          "duration": 1.1
        }
      ],
      "audioLabel": "Hear G harmonic minor V7 (D–F♯–A–C) resolving to G minor"
    },
    "workedExample": {
      "title": "Raising a flat seventh in D Minor",
      "scenario": "Construct D harmonic minor starting from D natural minor (one flat: B♭).",
      "steps": [
        "D natural minor: D – E – F – G – A – B♭ – C – D.",
        "Raise degree 7 (C) by one semitone using a sharp: C♯."
      ],
      "conclusion": "D harmonic minor = D – E – F – G – A – B♭ – C♯ – D (leaving key signature 1♭, adding C♯ as an accidental)."
    },
    "practiceActivities": [
      {
        "id": "harminor-q1",
        "prompt": "What interval separates scale degrees 6 and 7 in a harmonic minor scale?",
        "options": [
          {
            "id": "m2",
            "label": "Minor second (1 semitone)"
          },
          {
            "id": "M2",
            "label": "Major second (2 semitones)"
          },
          {
            "id": "A2",
            "label": "Augmented second (3 semitones)"
          },
          {
            "id": "P4",
            "label": "Perfect fourth (5 semitones)"
          }
        ],
        "correctOptionId": "A2",
        "explanation": "Because degree 6 remains natural minor while degree 7 is raised a semitone (e.g. F to G♯), the span widens to 3 semitones (an augmented 2nd)."
      }
    ],
    "summaryText": "Harmonic minor raises degree 7 of natural minor to generate a true leading tone and major V chord, creating a 3-semitone leap between 6 and ♯7.",
    "keyTakeaways": [
      "Harmonic minor = natural minor with raised ♯7.",
      "Produces a strong leading-tone semitone (♯7 → 8) and major dominant triad (V).",
      "Contains an augmented 2nd between degrees 6 and ♯7."
    ],
    "terminology": [
      {
        "term": "Harmonic Minor Scale",
        "definition": "A minor scale featuring a raised 7th scale degree, creating a leading tone a half step below the tonic."
      },
      {
        "term": "Augmented Second",
        "definition": "An interval of three semitones occurring between scale degrees 6 and raised 7 in harmonic minor."
      },
      {
        "term": "Dominant Pull",
        "definition": "The strong harmonic drive created by the leading tone resolving upward to the tonic."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "A3",
        "B3",
        "C4",
        "D4",
        "E4",
        "F4",
        "G#4",
        "A4"
      ],
      "showLabels": true,
      "label": "A Harmonic Minor scale (G raised to G#)",
      "caption": "Raising G to G# creates the leading tone and produces the characteristic augmented second interval between F and G#."
    },
    "practicalApplication": "In classical and film music, the exotic, dramatic quality of harmonic minor arises from the augmented second interval (F to G#). Listen for this gap when identifying minor keys by ear.",
    "videoResource": {
      "title": "Open Yale Courses: Minor Scales and Harmonic Function",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Prof. Wright explains why Western composers raised scale degree 7 to create a major V chord in minor keys."
    },
    "references": [
      {
        "title": "Open Music Theory: Harmonic Minor",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Harmonic necessity of the leading tone for authentic cadence closure."
      },
      {
        "title": "Teoria.com: Harmonic Minor Scale Structure",
        "authorOrInstitution": "José Rodríguez Alvira",
        "url": "https://www.teoria.com/",
        "licence": "Free Educational Web Resource",
        "relevance": "Interactive interval drills for the augmented second in harmonic minor."
      }
    ]
  },
  {
    "slug": "melodic-minor-scales",
    "title": "Melodic minor scales",
    "summary": "Smooth the awkward augmented-second gap when ascending by raising both degrees 6 and 7, then return naturally on the descent.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "major-and-minor-scale-construction",
    "moduleSlug": "three-forms-of-minor",
    "level": "elementary",
    "estimatedMinutes": 9,
    "sortOrder": 5,
    "objectives": [
      "Construct ascending melodic minor by raising both degree 6 and degree 7.",
      "Construct classical descending melodic minor by lowering 6 and 7 back to the key signature.",
      "Hear how ascending melodic minor pairs a minor lower half with a major upper half."
    ],
    "sections": [
      {
        "id": "melodic-ascent-descent",
        "heading": "1. Smoothing melodic lines upward and downward",
        "body": [
          "To keep vocal and instrumental melodies flowing smoothly toward the tonic without the wide augmented-second leap of harmonic minor, classical composers raise degree 6 alongside degree 7 on the way UP (A–B–C–D–E–F♯–G♯–A).",
          "Once past the tonic and descending downward, the pull of the leading tone fades; therefore classical melodic minor cancels both alterations on the way DOWN (A–G♮–F♮–E–D–C–B–A), identical to natural minor."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F#5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "G#5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "G5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            }
          ],
          "label": "Upper tetrachord of A melodic minor ascending F-sharp G-sharp A and descending G-natural F-natural E",
          "caption": "Upper half of A Melodic Minor: raised ♯6–♯7 ascending (F♯–G♯–A), natural ♮7–♮6 descending (G♮–F♮–E)."
        },
        "audioSteps": [
          {
            "notes": [
              "E5"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "F#5"
            ],
            "at": 0.36,
            "duration": 0.35
          },
          {
            "notes": [
              "G#5"
            ],
            "at": 0.72,
            "duration": 0.35
          },
          {
            "notes": [
              "A5"
            ],
            "at": 1.08,
            "duration": 0.65
          },
          {
            "notes": [
              "G5"
            ],
            "at": 1.8,
            "duration": 0.35
          },
          {
            "notes": [
              "F5"
            ],
            "at": 2.16,
            "duration": 0.35
          },
          {
            "notes": [
              "E5"
            ],
            "at": 2.52,
            "duration": 0.75
          }
        ],
        "audioLabel": "Hear melodic minor upper tetrachord up & down"
      }
    ],
    "repertoireExample": {
      "composer": "Johann Sebastian Bach",
      "work": "Bourrée in E minor, BWV 996",
      "barReference": "Pickup & bar 1–2",
      "insight": "Bach uses C♯ and D♯ smoothly pushing up to E in rising lines, yet writes D♮ and C♮ immediately when melodies sweep downward.",
      "audioSteps": [
        {
          "notes": [
            "B4"
          ],
          "at": 0,
          "duration": 0.3
        },
        {
          "notes": [
            "C#5"
          ],
          "at": 0.32,
          "duration": 0.3
        },
        {
          "notes": [
            "D#5"
          ],
          "at": 0.64,
          "duration": 0.3
        },
        {
          "notes": [
            "E5"
          ],
          "at": 0.96,
          "duration": 0.55
        },
        {
          "notes": [
            "D5"
          ],
          "at": 1.55,
          "duration": 0.3
        },
        {
          "notes": [
            "C5"
          ],
          "at": 1.87,
          "duration": 0.3
        },
        {
          "notes": [
            "B4"
          ],
          "at": 2.19,
          "duration": 0.65
        }
      ],
      "audioLabel": "Hear E melodic minor rising then falling"
    },
    "workedExample": {
      "title": "Applying natural signs to C Melodic Minor",
      "scenario": "Spell C melodic minor ascending (starting from C natural minor: E♭, A♭, B♭).",
      "steps": [
        "Recall C natural minor has 3 flats: E♭, A♭, B♭.",
        "To raise A♭ and B♭ by one semitone ascending, you do NOT add sharps—you write naturals (A♮, B♮)!",
        "Ascending: C–D–E♭–F–G–A♮–B♮–C. Descending: C–B♭–A♭–G–F–E♭–D–C."
      ],
      "conclusion": "Raising a flatted scale degree requires a natural (♮), not a sharp!"
    },
    "practiceActivities": [
      {
        "id": "melminor-q1",
        "prompt": "Which pitches alter the natural minor scale ascending in G melodic minor (key signature B♭, E♭)?",
        "options": [
          {
            "id": "ef",
            "label": "E♮ and F♯"
          },
          {
            "id": "eb",
            "label": "E♭ and F♯"
          },
          {
            "id": "esfs",
            "label": "E♯ and F♯"
          },
          {
            "id": "enfn",
            "label": "E♮ and F♮"
          }
        ],
        "correctOptionId": "ef",
        "explanation": "Degree 6 is E♭ (raised to E♮) and degree 7 is F♮ (raised to F♯). Descending reverts to F♮ and E♭."
      }
    ],
    "summaryText": "Melodic minor raises degrees 6 and 7 on the ascent for smooth scalar motion and reverts to natural minor on the descent.",
    "keyTakeaways": [
      "Ascending melodic minor differs from Major only on its minor 3rd (♭3).",
      "Classical descending melodic minor equals natural minor.",
      "Always raise flats using naturals (♮), never double-spelling letters."
    ],
    "terminology": [
      {
        "term": "Melodic Minor Scale",
        "definition": "A scale with raised 6th and 7th degrees ascending, which revert to natural minor descending."
      },
      {
        "term": "Vocal Smoothness",
        "definition": "Eliminating the awkward augmented second step in vocal and instrumental lines by raising scale degree 6."
      },
      {
        "term": "Jazz Minor",
        "definition": "The ascending form of melodic minor used both ascending and descending in jazz harmony."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "A3",
        "B3",
        "C4",
        "D4",
        "E4",
        "F#4",
        "G#4",
        "A4"
      ],
      "showLabels": true,
      "label": "A Melodic Minor scale ascending (F# and G#)",
      "caption": "Ascending: F and G are both raised (F# and G#); descending: they revert to natural (G natural and F natural)."
    },
    "practicalApplication": "When playing melodic minor passages, remember: sharp the 6th and 7th when driving up toward the tonic; cancel the accidentals to natural minor when cascading downwards.",
    "videoResource": {
      "title": "Berklee Online: Melodic Minor and Jazz Applications",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee clinic on the melodic minor scale, voice leading, and modern chord-scale theory."
    },
    "references": [
      {
        "title": "Open Music Theory: Melodic Minor Scales",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Historical part-writing conventions for ascending vs. descending minor contours."
      },
      {
        "title": "Juilliard Extension: Core Theory Foundations",
        "authorOrInstitution": "The Juilliard School",
        "url": "https://www.juilliard.edu/stage-beyond/juilliard-extension",
        "licence": "Proprietary Institutional Curriculum",
        "relevance": "Bach chorale analysis and melodic minor voice-leading exercises."
      }
    ]
  },
  {
    "slug": "key-signatures",
    "title": "Key signatures",
    "summary": "Memorize the exact order of sharps and flats and read any major key signature in under two seconds.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "key-signatures-and-modality",
    "moduleSlug": "keys-circle-and-modes",
    "level": "elementary",
    "estimatedMinutes": 9,
    "sortOrder": 6,
    "objectives": [
      "Recite the exact sharp order (F–C–G–D–A–E–B) and reversed flat order (B–E–A–D–G–C–F).",
      "Identify any sharp major key from its rightmost sharp (up 1 semitone).",
      "Identify any flat major key from its second-to-last flat."
    ],
    "sections": [
      {
        "id": "order-of-sharps-flats",
        "heading": "1. Fixed order & fast key decoding",
        "body": [
          "Rather than printing sharps and flats repeatedly before individual notes, notation collects all standard scale accidentals at the start of every line into a Key Signature. They ALWAYS appear in a single strict order:",
          "Order of Sharps: F♯ – C♯ – G♯ – D♯ – A♯ – E♯ – B♯. Order of Flats (exact mirror reversal): B♭ – E♭ – A♭ – D♭ – G♭ – C♭ – F♭.",
          "Two shortcuts read any major signature immediately: for SHARP keys, go one semitone (one letter step) ABOVE the LAST sharp (e.g., F♯, C♯ → D Major). For FLAT keys with 2+ flats, read the PENULTIMATE (second-to-last) flat (e.g., B♭, E♭, A♭ → E♭ Major; remember F Major has 1 flat, B♭)."
        ],
        "notation": {
          "clef": "treble",
          "keySignature": "D",
          "chords": [
            {
              "keys": [
                "D4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F#4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "q"
            }
          ],
          "label": "D major key signature (F-sharp and C-sharp) with D major tonic arpeggio",
          "caption": "Two sharps (F♯, C♯): the last sharp C♯ points straight up one semitone to D Major."
        },
        "audioSteps": [
          {
            "notes": [
              "D4"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "F#4"
            ],
            "at": 0.38,
            "duration": 0.35
          },
          {
            "notes": [
              "A4"
            ],
            "at": 0.76,
            "duration": 0.35
          },
          {
            "notes": [
              "D5"
            ],
            "at": 1.14,
            "duration": 0.8
          }
        ],
        "audioLabel": "Hear D major arpeggio"
      }
    ],
    "repertoireExample": {
      "composer": "Frédéric Chopin",
      "work": "Ballade No. 1 in G minor, Op. 23",
      "barReference": "Key signature across score",
      "insight": "Even when melodies travel through dramatic accidentals, the two-flat key signature silently reminds every reader throughout the page that B and E default to B♭ and E♭.",
      "audioSteps": [
        {
          "notes": [
            "Bb3"
          ],
          "at": 0,
          "duration": 0.4
        },
        {
          "notes": [
            "D4"
          ],
          "at": 0.42,
          "duration": 0.4
        },
        {
          "notes": [
            "Eb4"
          ],
          "at": 0.84,
          "duration": 0.4
        },
        {
          "notes": [
            "F4"
          ],
          "at": 1.26,
          "duration": 0.75
        }
      ],
      "audioLabel": "Hear two-flat diatonic tone color"
    },
    "workedExample": {
      "title": "Decoding four sharps vs. four flats",
      "scenario": "Identify the major key containing (a) 4 sharps and (b) 4 flats.",
      "steps": [
        "(a) Four sharps = F♯, C♯, G♯, D♯. Last sharp = D♯. One semitone higher = E Major.",
        "(b) Four flats = B♭, E♭, A♭, D♭. Second-to-last flat = A♭. Key = A♭ Major."
      ],
      "conclusion": "4 sharps = E Major; 4 flats = A♭ Major."
    },
    "practiceActivities": [
      {
        "id": "keysig-q1",
        "prompt": "Which Major key carries the three flats B♭, E♭, and A♭?",
        "options": [
          {
            "id": "ab",
            "label": "A♭ Major"
          },
          {
            "id": "eb",
            "label": "E♭ Major"
          },
          {
            "id": "bb",
            "label": "B♭ Major"
          },
          {
            "id": "f",
            "label": "F Major"
          }
        ],
        "correctOptionId": "eb",
        "explanation": "Using the penultimate-flat rule for B♭, E♭, A♭, the second-to-last flat is E♭ → E♭ Major."
      }
    ],
    "summaryText": "Key signatures place sharps (FCGDAEB) or flats (BEADGCF) at the clef to govern all octaves automatically.",
    "keyTakeaways": [
      "Sharp keys: semitone above final sharp = Major tonic.",
      "Flat keys (2+): second-to-last flat = Major tonic (1 flat = F Major)."
    ],
    "terminology": [
      {
        "term": "Key Signature",
        "definition": "A collection of sharps or flats printed at the beginning of each staff establishing the prevailing key."
      },
      {
        "term": "Order of Sharps",
        "definition": "Father Charles Goes Down And Ends Battle (F#, C#, G#, D#, A#, E#, B#)."
      },
      {
        "term": "Order of Flats",
        "definition": "Battle Ends And Down Goes Charles' Father (Bb, Eb, Ab, Db, Gb, Cb, Fb)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "D4",
        "E4",
        "F#4",
        "G4",
        "A4",
        "B4",
        "C#4",
        "D5"
      ],
      "showLabels": true,
      "label": "D Major key signature pitches (F# and C#)",
      "caption": "Two sharps (F# and C#) automatically transform the natural staff into D Major / B Minor."
    },
    "practicalApplication": "Quick identification trick: For sharp keys, the last sharp to the right is scale degree 7 (leading tone)—go up half a step to find the major tonic! For flat keys, the second-to-last flat is the major tonic name!",
    "videoResource": {
      "title": "Open Yale Courses: Key Signatures and Tonal Architecture",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-5",
      "embedPermitted": false,
      "notes": "Prof. Wright explains how key signatures standardize notation across all orchestral instruments."
    },
    "references": [
      {
        "title": "Open Music Theory: Key Signatures",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Standard clef placement, accidental ordering, and transposition rules."
      },
      {
        "title": "Musictheory.net: Key Signatures",
        "authorOrInstitution": "Ricci Adams",
        "url": "https://www.musictheory.net/lessons/24",
        "licence": "Free Web Educational Access",
        "relevance": "Interactive drills for rapid identification of major and minor key signatures."
      }
    ]
  },
  {
    "slug": "circle-of-fifths",
    "title": "Circle of fifths",
    "summary": "See all twelve major and minor keys arranged on a harmonic compass where every step adds one sharp clockwise or one flat counterclockwise.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "key-signatures-and-modality",
    "moduleSlug": "keys-circle-and-modes",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 7,
    "objectives": [
      "Step clockwise in ascending perfect fifths (C → G → D → A → E → B → F♯) adding one sharp each step.",
      "Step counterclockwise in descending fifths / ascending fourths (C → F → B♭ → E♭ → A♭ → D♭ → G♭) adding one flat.",
      "Recognize enharmonic keys overlapping at the bottom (B/C♭, F♯/G♭, C♯/D♭)."
    ],
    "sections": [
      {
        "id": "clock-of-keys",
        "heading": "1. The 12-hour compass of closely related keys",
        "body": [
          "Starting at 12 o'clock with C major / A minor (0 sharps, 0 flats), moving clockwise by a perfect fifth each hour introduces exactly one new sharp: G (1♯), D (2♯), A (3♯), E (4♯), B (5♯), F♯ (6♯).",
          "Moving counterclockwise from C by a perfect fourth (down a fifth) adds one flat each step: F (1♭), B♭ (2♭), E♭ (3♭), A♭ (4♭), D♭ (5♭), G♭ (6♭). Neighbours on the circle share six of their seven scale tones—explaining why classical sonatas modulate first to the Dominant (one hour clockwise) or Subdominant (one hour counterclockwise)!"
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
                "D5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "A4"
              ],
              "duration": "q"
            }
          ],
          "label": "Chain of fifths: C4 up to G4, D5, and A4",
          "caption": "Stepping clockwise around the Circle: C (0♯) → G (1♯) → D (2♯) → A (3♯)."
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
            "at": 0.48,
            "duration": 0.45
          },
          {
            "notes": [
              "D5"
            ],
            "at": 0.96,
            "duration": 0.45
          },
          {
            "notes": [
              "A4"
            ],
            "at": 1.44,
            "duration": 0.75
          }
        ],
        "audioLabel": "Hear fifths C → G → D → A"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven",
      "work": "Piano Sonata No. 21 in C major ('Waldstein'), Op. 53",
      "barReference": "Second-theme harmonic transitions & circle sequences",
      "insight": "Baroque and Classical sequences walk chord roots counterclockwise around fifths (E → A → D → G → C), producing effortless forward harmonic momentum.",
      "audioSteps": [
        {
          "notes": [
            "E4",
            "G4",
            "B4"
          ],
          "at": 0,
          "duration": 0.45
        },
        {
          "notes": [
            "A3",
            "E4",
            "A4"
          ],
          "at": 0.48,
          "duration": 0.45
        },
        {
          "notes": [
            "D4",
            "F4",
            "A4"
          ],
          "at": 0.96,
          "duration": 0.45
        },
        {
          "notes": [
            "G3",
            "D4",
            "G4"
          ],
          "at": 1.44,
          "duration": 0.45
        },
        {
          "notes": [
            "C4",
            "E4",
            "G4"
          ],
          "at": 1.92,
          "duration": 0.9
        }
      ],
      "audioLabel": "Hear circle-of-fifths sequence back to C"
    },
    "workedExample": {
      "title": "Finding how many sharps belong to E Major via fifths",
      "scenario": "Count clockwise steps from C Major to E Major.",
      "steps": [
        "C = 0 sharps.",
        "G = 1, D = 2, A = 3, E = 4.",
        "The first four sharps in F–C–G–D–A–E–B order are F♯, C♯, G♯, D♯."
      ],
      "conclusion": "E Major sits at 4 o'clock with four sharps (F♯, C♯, G♯, D♯)."
    },
    "practiceActivities": [
      {
        "id": "circle-q1",
        "prompt": "Moving clockwise one step from D Major (2 sharps) reaches which key signature?",
        "options": [
          {
            "id": "g",
            "label": "G Major (1 sharp)"
          },
          {
            "id": "a",
            "label": "A Major (3 sharps)"
          },
          {
            "id": "e",
            "label": "E Major (4 sharps)"
          },
          {
            "id": "f",
            "label": "F Major (1 flat)"
          }
        ],
        "correctOptionId": "a",
        "explanation": "A perfect fifth above D is A, adding C♯→G♯ for 3 sharps (A Major)."
      }
    ],
    "summaryText": "The circle of fifths maps tonal proximity cleanly: adjacent keys differ by a single accidental, making it essential for modulation and key recall.",
    "keyTakeaways": [
      "Clockwise (+P5) adds sharps; counterclockwise (−P5 / +P4) adds flats.",
      "6 o'clock overlaps enharmonically at F♯ Major (6♯) and G♭ Major (6♭)."
    ],
    "terminology": [
      {
        "term": "Circle of Fifths",
        "definition": "A circular geometric diagram depicting the relationships among the 12 chromatic keys in fifth intervals."
      },
      {
        "term": "Clockwise Direction",
        "definition": "Moving clockwise adds sharps by ascending fifths (C -> G -> D -> A -> E -> B -> F#)."
      },
      {
        "term": "Counter-Clockwise Direction",
        "definition": "Moving counter-clockwise adds flats by descending fifths / ascending fourths (C -> F -> Bb -> Eb -> Ab -> Db -> Gb)."
      },
      {
        "term": "Enharmonic Keys",
        "definition": "Keys with different spellings but identical pitches (e.g. F# Major with 6 sharps = Gb Major with 6 flats)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "G4",
        "D5",
        "A5"
      ],
      "showLabels": true,
      "label": "Ascending fifths cycle (C4 -> G4 -> D5 -> A5)",
      "caption": "Each step of 7 semitones (perfect fifth) advances one position clockwise on the Circle of Fifths."
    },
    "practicalApplication": "Keep the Circle of Fifths memorized like a clock face. Keys adjacent on the circle (e.g. C major and G major) share 6 out of 7 notes, making modulation between them seamless.",
    "videoResource": {
      "title": "Berklee Online: The Circle of Fifths Demystified",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee faculty lecture on using the Circle of Fifths for songwriting, modulation, and chord progression design."
    },
    "references": [
      {
        "title": "Open Music Theory: The Circle of Fifths",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Geometric representation of pitch class space and closely related key networks."
      },
      {
        "title": "Fundamentals of Music Theory: Circle of Fifths and Keys",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Cyclic key relations and enharmonic convergence."
      }
    ]
  },
  {
    "slug": "relative-major-and-minor-keys",
    "title": "Relative major and minor keys",
    "summary": "Pair every major key with its relative minor sharing the exact same key signature, spaced three semitones (a minor third) apart.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "key-signatures-and-modality",
    "moduleSlug": "keys-circle-and-modes",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 8,
    "objectives": [
      "Find the relative minor three semitones (minor third / degree 6) below any major tonic.",
      "Distinguish RELATIVE keys (same key signature, different tonic) from PARALLEL keys (same tonic, different signature).",
      "Inspect melody and bass harmony to tell whether a piece uses a major key or its relative minor."
    ],
    "sections": [
      {
        "id": "relative-vs-parallel",
        "heading": "1. Shared signature, different tonal home",
        "body": [
          "C major and A natural minor share the exact same collection of seven pitches (no sharps, no flats), making them Relative Keys. From any Major tonic, step down a minor third (3 semitones / to scale degree 6) to find its relative minor.",
          "Don't confuse Relative with Parallel: C Major and C Minor share the tonic C (parallel), whereas C Major and A Minor share the key signature (relative). When reading music, always check the closing bass note and final chord—and watch for a raised leading tone like G♯ confirming A minor!"
        ],
        "notation": {
          "clef": "treble",
          "keySignature": "F",
          "chords": [
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
                "D4",
                "F4",
                "A4"
              ],
              "duration": "h"
            }
          ],
          "label": "F major triad alongside its relative D minor triad under one-flat signature",
          "caption": "F Major (F–A–C) and D Minor (D–F–A) share the one-flat signature (B♭)."
        },
        "audioSteps": [
          {
            "notes": [
              "F4",
              "A4",
              "C5"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "D4",
              "F4",
              "A4"
            ],
            "at": 1,
            "duration": 1
          }
        ],
        "audioLabel": "Compare F Major and relative D Minor tonics"
      }
    ],
    "repertoireExample": {
      "composer": "Franz Schubert",
      "work": "Moment Musical No. 3 in F minor, D. 780",
      "barReference": "Bars 1–16 vs. contrasting passage in A♭ major",
      "insight": "Pieces in a minor key routinely brighten mid-phrase by touching their relative major (here A♭ major beneath 4 flats) without changing key signature.",
      "audioSteps": [
        {
          "notes": [
            "F4",
            "Ab4",
            "C5"
          ],
          "at": 0,
          "duration": 0.75
        },
        {
          "notes": [
            "Eb4",
            "G4",
            "Bb4"
          ],
          "at": 0.8,
          "duration": 0.55
        },
        {
          "notes": [
            "Ab4",
            "C5",
            "Eb5"
          ],
          "at": 1.4,
          "duration": 1
        }
      ],
      "audioLabel": "Hear F minor brightening to relative A♭ major"
    },
    "workedExample": {
      "title": "Finding the relative minor of E♭ Major (3 flats)",
      "scenario": "Determine which minor key shares the B♭–E♭–A♭ key signature.",
      "steps": [
        "Method A (down a minor third): E♭ → D (1) → C♯/D♭ (2) → C (3). Correct letter name two steps down from E is C.",
        "Method B (scale degree 6): Count E♭(1)–F(2)–G(3)–A♭(4)–B♭(5)–C(6)."
      ],
      "conclusion": "The relative minor of E♭ Major is C Minor."
    },
    "practiceActivities": [
      {
        "id": "relkeys-q1",
        "prompt": "A piece has a one-sharp (F♯) key signature and repeatedly lands on E–G–B chords with occasional D♯ leading tones. What key is it in?",
        "options": [
          {
            "id": "gmaj",
            "label": "G Major"
          },
          {
            "id": "emin",
            "label": "E Minor"
          },
          {
            "id": "dmin",
            "label": "D Minor"
          },
          {
            "id": "bmaj",
            "label": "B Major"
          }
        ],
        "correctOptionId": "emin",
        "explanation": "One sharp belongs to G Major and its relative minor, E Minor. Ending on E–G–B with raised D♯ leading tones proves E Minor."
      }
    ],
    "summaryText": "Every key signature belongs jointly to a Major key and its Relative Minor perched a minor third (degree 6) below.",
    "keyTakeaways": [
      "Major down 3 semitones (a minor 3rd) = Relative Minor.",
      "Check final bass note and presence of raised ♯7 accidentals to confirm minor vs. major."
    ],
    "terminology": [
      {
        "term": "Relative Keys",
        "definition": "A major key and minor key that share the exact same key signature and pitch collection."
      },
      {
        "term": "Relative Minor Tonic",
        "definition": "The 6th scale degree of any major scale (e.g. A in C Major; E in G Major)."
      },
      {
        "term": "Relative Major Tonic",
        "definition": "The 3rd scale degree of any natural minor scale (e.g. C in A Minor; G in E Minor)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4",
        "A4",
        "C5",
        "E5"
      ],
      "showLabels": true,
      "label": "C Major triad (C-E-G) vs. A Minor triad (A-C-E)",
      "caption": "Relative keys share two common tones between their tonic triads, creating smooth harmonic exchange."
    },
    "practicalApplication": "To find the relative minor of any major key quickly, count down 3 semitones (or down a minor third). For example: Eb major minus 3 semitones = C minor.",
    "videoResource": {
      "title": "Open Yale Courses: Relative Major and Minor Modulation",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Analysis of classical sonata and dance movements alternating between relative major and minor realms."
    },
    "references": [
      {
        "title": "Open Music Theory: Relative and Parallel Keys",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Theoretical distinction between relative (shared pitches) and parallel (shared tonic) systems."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Relative Keys",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Comparative analysis of relative key pairs across classical literature."
      }
    ]
  },
  {
    "slug": "parallel-keys",
    "title": "Parallel keys and modal contrast",
    "summary": "Master parallel major and minor keys sharing the same tonic, comparing altered scale degrees 3, 6, and 7 and modal borrowing.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "key-signatures-and-modality",
    "moduleSlug": "keys-circle-and-modes",
    "level": "intermediate",
    "estimatedMinutes": 10,
    "sortOrder": 9,
    "objectives": [
      "Differentiate parallel keys (shared tonic, different key signature) from relative keys (shared key signature, different tonic).",
      "Identify the three altered scale degrees (flat 3, flat 6, flat 7) between parallel major and minor.",
      "Recognize modal mixture (borrowing chords from parallel minor into a major key)."
    ],
    "terminology": [
      {
        "term": "Parallel Keys",
        "definition": "A major key and minor key that share the same tonic pitch (e.g. C major and C minor)."
      },
      {
        "term": "Modal Mixture (Borrowing)",
        "definition": "Importing chords from the parallel minor key into a major key progression (e.g. iv or bVI in major)."
      },
      {
        "term": "Picardy Third",
        "definition": "Ending a piece in a minor key with a triumphant parallel major tonic triad (raising scale degree 3)."
      }
    ],
    "sections": [
      {
        "id": "parallel-vs-relative",
        "heading": "1. The Parallel Relationship: Same home, different landscape",
        "body": [
          "While relative keys share a key signature but start on different tonics (e.g. C major and A minor), parallel keys share the exact same tonic note but have different key signatures (e.g. C major and C minor).",
          "Because parallel keys share the identical acoustic center, switching between them produces an immediate, dramatic change of color without any disorientation. The difference lies entirely in three scale degrees: in minor, degrees 3, 6, and 7 are lowered by one semitone."
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
            }
          ],
          "label": "C Major triad followed directly by C Minor triad",
          "caption": "Lowering scale degree 3 from E natural to E flat instantly transforms major into parallel minor."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 1
          },
          {
            "notes": [
              "C4",
              "Eb4",
              "G4"
            ],
            "at": 1.2,
            "duration": 1.2
          }
        ],
        "audioLabel": "Hear C Major chord transitioning to parallel C Minor"
      }
    ],
    "repertoireExample": {
      "composer": "Franz Schubert",
      "work": "String Quartet No. 14 in D minor ('Death and the Maiden')",
      "barReference": "Theme and Variations",
      "insight": "Schubert was the supreme master of the parallel major/minor shift, using sudden shifts from D minor to D major to evoke radiant sunlight amidst tragic shadows.",
      "audioSteps": [
        {
          "notes": [
            "D4",
            "F4",
            "A4"
          ],
          "at": 0,
          "duration": 0.8
        },
        {
          "notes": [
            "D4",
            "F#4",
            "A4"
          ],
          "at": 0.9,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear Schubert's D minor to parallel D major shift"
    },
    "workedExample": {
      "title": "Comparing Key Signatures of Parallel Pairs",
      "scenario": "Determine the key signature difference between G major and parallel G minor.",
      "steps": [
        "G Major has 1 sharp (F#).",
        "G Minor is relative to Bb Major, which has 2 flats (Bb, Eb).",
        "To convert G major into parallel G minor, cancel the F# and add Bb and Eb.",
        "The result lowers scale degrees 3 (B to Bb) and 6 (E to Eb)."
      ],
      "conclusion": "Every parallel minor key signature has three more flats (or three fewer sharps) than its parallel major.",
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
              "G4",
              "Bb4",
              "D5"
            ],
            "duration": "h"
          }
        ],
        "label": "G Major to G Minor",
        "caption": "G major (B natural) shifts to G minor (B flat)."
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
            "G4",
            "Bb4",
            "D5"
          ],
          "at": 1,
          "duration": 1
        }
      ],
      "audioLabel": "Hear G Major to G Minor"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "Eb4",
        "G4"
      ],
      "showLabels": true,
      "label": "Parallel inflection on the third (E4 natural vs. Eb4 flat)",
      "caption": "The single half-step shift between E4 and Eb4 determines whether the harmony is major or minor."
    },
    "practicalApplication": "When improvising or composing, introduce a chord borrowed from the parallel minor (such as a minor iv chord or flat-VI major chord in a major key). This 'modal mixture' adds deep cinematic pathos to any progression.",
    "videoResource": {
      "title": "Open Yale Courses: Schubert and the Major/Minor Shift",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-6",
      "embedPermitted": false,
      "notes": "Prof. Wright explores the expressive power of the parallel minor shift in 19th-century Romanticism."
    },
    "references": [
      {
        "title": "Open Music Theory: Modal Mixture",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Theoretical analysis of parallel key borrowed chords and harmonic syntax."
      },
      {
        "title": "Integrated Musicianship: Parallel Keys",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "Aural distinction drills between relative and parallel key changes."
      }
    ],
    "practiceActivities": [
      {
        "id": "parallel-q1",
        "prompt": "What is the key signature of E minor compared to its parallel key E major?",
        "options": [
          {
            "id": "e-maj-4s-min-1s",
            "label": "E major has 4 sharps; E minor has 1 sharp"
          },
          {
            "id": "e-maj-3s-min-0",
            "label": "E major has 3 sharps; E minor has 0 sharps"
          },
          {
            "id": "e-maj-1s-min-4s",
            "label": "E major has 1 sharp; E minor has 4 sharps"
          },
          {
            "id": "both-equal",
            "label": "Both share the same key signature"
          }
        ],
        "correctOptionId": "e-maj-4s-min-1s",
        "explanation": "E major has 4 sharps (F#, C#, G#, D#); parallel E minor (relative to G major) has only 1 sharp (F#), reflecting the 3-accidental difference."
      }
    ],
    "summaryText": "Parallel keys share the same tonic pitch while altering scale degrees 3, 6, and 7, enabling instant modal contrast and rich harmonic borrowing within a single tonal center.",
    "keyTakeaways": [
      "Parallel keys share tonic note name (e.g. C major and C minor); relative keys share key signatures.",
      "Parallel minor always has three more flats (or three fewer sharps) than parallel major.",
      "Modal borrowing injects parallel minor emotional darkness directly into major key phrases."
    ]
  },
  {
    "slug": "modes",
    "title": "The church modes and diatonic rotation",
    "summary": "Explore the seven diatonic modes—Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian—and their characteristic scale degrees.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "key-signatures-and-modality",
    "moduleSlug": "keys-circle-and-modes",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 10,
    "objectives": [
      "Construct all seven diatonic modes using white-key rotations of the major scale.",
      "Identify the characteristic color tone for each mode (e.g. raised 4 in Lydian, flat 7 in Mixolydian, raised 6 in Dorian).",
      "Classify modes into major-family (Ionian, Lydian, Mixolydian) and minor-family (Dorian, Phrygian, Aeolian, Locrian)."
    ],
    "terminology": [
      {
        "term": "Diatonic Mode",
        "definition": "A seven-pitch scale derived by rotating the standard major scale step pattern to start on different scale degrees."
      },
      {
        "term": "Dorian Mode",
        "definition": "A minor-family mode starting on degree 2 with a characteristic raised 6th degree (natural 6)."
      },
      {
        "term": "Mixolydian Mode",
        "definition": "A major-family mode starting on degree 5 with a characteristic lowered 7th degree (flat 7)."
      },
      {
        "term": "Lydian Mode",
        "definition": "A major-family mode starting on degree 4 with a characteristic raised 4th degree (sharp 4)."
      },
      {
        "term": "Phrygian Mode",
        "definition": "A minor-family mode starting on degree 3 with a characteristic lowered 2nd degree (flat 2)."
      }
    ],
    "sections": [
      {
        "id": "seven-modes-rotation",
        "heading": "1. The seven modes as white-key rotations",
        "body": [
          "Centuries before modern major and minor keys solidified, Western music operated under the church modes. The seven diatonic modes are formed by playing the natural white keys of the piano starting on each of the seven letter names:",
          "C to C = Ionian (standard Major); D to D = Dorian; E to E = Phrygian; F to F = Lydian; G to G = Mixolydian; A to A = Aeolian (Natural Minor); B to B = Locrian."
        ],
        "notation": {
          "clef": "treble",
          "chords": [
            {
              "keys": [
                "D4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "E4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "F4"
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
                "A4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "q"
            }
          ],
          "label": "D Dorian mode (white keys from D to D)",
          "caption": "D Dorian: minor third (F natural) and characteristic major sixth (B natural)."
        },
        "audioSteps": [
          {
            "notes": [
              "D4"
            ],
            "at": 0,
            "duration": 0.35
          },
          {
            "notes": [
              "E4"
            ],
            "at": 0.35,
            "duration": 0.35
          },
          {
            "notes": [
              "F4"
            ],
            "at": 0.7,
            "duration": 0.35
          },
          {
            "notes": [
              "G4"
            ],
            "at": 1.05,
            "duration": 0.35
          },
          {
            "notes": [
              "A4"
            ],
            "at": 1.4,
            "duration": 0.35
          },
          {
            "notes": [
              "B4"
            ],
            "at": 1.75,
            "duration": 0.35
          },
          {
            "notes": [
              "C5"
            ],
            "at": 2.1,
            "duration": 0.35
          },
          {
            "notes": [
              "D5"
            ],
            "at": 2.45,
            "duration": 0.7
          }
        ],
        "audioLabel": "Hear D Dorian scale ascending"
      }
    ],
    "repertoireExample": {
      "composer": "Traditional / Ralph Vaughan Williams",
      "work": "Greensleeves (Fantasia on Greensleeves)",
      "barReference": "Traditional modal folk melody",
      "insight": "The enduring haunting beauty of Greensleeves comes from its Dorian tonality: the raised 6th degree creates a bright, noble lift in the midst of a minor key.",
      "audioSteps": [
        {
          "notes": [
            "D4"
          ],
          "at": 0,
          "duration": 0.4
        },
        {
          "notes": [
            "F4"
          ],
          "at": 0.4,
          "duration": 0.6
        },
        {
          "notes": [
            "G4"
          ],
          "at": 1,
          "duration": 0.3
        },
        {
          "notes": [
            "A4"
          ],
          "at": 1.3,
          "duration": 0.6
        },
        {
          "notes": [
            "B4"
          ],
          "at": 1.9,
          "duration": 0.4
        },
        {
          "notes": [
            "A4"
          ],
          "at": 2.3,
          "duration": 0.6
        }
      ],
      "audioLabel": "Hear Greensleeves Dorian melody excerpt"
    },
    "workedExample": {
      "title": "Identifying the Characteristic Color Tone",
      "scenario": "Compare G Mixolydian with G Major.",
      "steps": [
        "G Major scale notes: G, A, B, C, D, E, F# (sharp 7 leading tone).",
        "G Mixolydian notes: G, A, B, C, D, E, F natural (flat 7 subtonic).",
        "The distinguishing note is scale degree 7: F natural rather than F#."
      ],
      "conclusion": "Mixolydian sounds like major with a relaxed, bluesy, or folk-like lowered 7th degree.",
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
              "F4",
              "A4",
              "C5"
            ],
            "duration": "h"
          }
        ],
        "label": "G Mixolydian tonic (G) moving to subtonic triad (F major)",
        "caption": "The bVII chord (F major) defines Mixolydian harmonic progression."
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
            "F4",
            "A4",
            "C5"
          ],
          "at": 1,
          "duration": 1
        }
      ],
      "audioLabel": "Hear Mixolydian I to bVII progression"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "D4",
        "E4",
        "F4",
        "G4",
        "A4",
        "B4",
        "C5",
        "D5"
      ],
      "showLabels": true,
      "label": "Dorian mode on keyboard white keys",
      "caption": "Playing all white keys from D to D produces the Dorian mode."
    },
    "practicalApplication": "To quickly play any mode from any root: start with the parallel major or minor scale and adjust its single signature degree: Dorian = Minor + raised 6; Mixolydian = Major + flat 7; Lydian = Major + raised 4; Phrygian = Minor + flat 2.",
    "videoResource": {
      "title": "Berklee Online: Understanding Modes and Modal Harmony",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee masterclass on modal scales, characteristic notes, and modal improvisation."
    },
    "references": [
      {
        "title": "Open Music Theory: Diatonic Modes",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Historical medieval church modes and modern scalar classifications."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Modal Systems",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Modal singing, solfege syllables, and modal melodic analysis."
      }
    ],
    "practiceActivities": [
      {
        "id": "modes-q1",
        "prompt": "Which mode has a major third but a lowered (flat) seventh degree?",
        "options": [
          {
            "id": "lydian",
            "label": "Lydian"
          },
          {
            "id": "dorian",
            "label": "Dorian"
          },
          {
            "id": "mixolydian",
            "label": "Mixolydian"
          },
          {
            "id": "phrygian",
            "label": "Phrygian"
          }
        ],
        "correctOptionId": "mixolydian",
        "explanation": "Mixolydian has a major third (1-3 = major triad) paired with a lowered flat-7 scale degree."
      }
    ],
    "summaryText": "The seven church modes offer distinctive tonal flavors beyond standard major and minor by shifting the placement of half steps across the diatonic scale framework.",
    "keyTakeaways": [
      "Major modes: Ionian (Major), Lydian (raised 4), Mixolydian (flat 7).",
      "Minor modes: Aeolian (Natural Minor), Dorian (raised 6), Phrygian (flat 2), Locrian (diminished 5).",
      "Each mode is instantly recognizable by its single signature altered scale degree."
    ]
  },
  {
    "slug": "tonal-relationships",
    "title": "Tonal relationships and key distance",
    "summary": "Understand closely related keys, modulation pathways, and the gravitational network connecting the 24 major and minor keys.",
    "learningPathSlug": "scales-and-tonality",
    "courseSlug": "key-signatures-and-modality",
    "moduleSlug": "keys-circle-and-modes",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 11,
    "objectives": [
      "Define closely related keys as those whose key signatures differ by no more than one accidental.",
      "List the five closely related keys for any given major or minor home key.",
      "Understand the principle of tonal hierarchy and modulation routes in Classical forms."
    ],
    "terminology": [
      {
        "term": "Closely Related Keys",
        "definition": "Keys that differ by at most one accidental (sharp or flat) from the home key, including relative keys."
      },
      {
        "term": "Distant (Foreign) Keys",
        "definition": "Keys that differ by two or more accidentals on the Circle of Fifths."
      },
      {
        "term": "Modulation",
        "definition": "The process of transitioning smoothly from one key center to another within a musical composition."
      },
      {
        "term": "Pivot Chord",
        "definition": "A chord common to both the original key and the destination key used to make modulation imperceptible."
      }
    ],
    "sections": [
      {
        "id": "closely-related-five-keys",
        "heading": "1. The Five Closely Related Keys",
        "body": [
          "In tonal music, keys are not isolated islands; they form a rich solar system of harmonic relationships. The closer two keys are on the Circle of Fifths, the more pitches and chords they share, and the more natural it feels to move between them.",
          "For any major key, there are exactly FIVE closely related keys: its relative minor (vi), the dominant key (V) and its relative minor (iii), and the subdominant key (IV) and its relative minor (ii). Notice that these five keys correspond to the diatonic triads built on scale degrees ii, iii, IV, V, and vi!"
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
              "duration": "w"
            },
            {
              "keys": [
                "G4",
                "B4",
                "D5"
              ],
              "duration": "w"
            },
            {
              "keys": [
                "F4",
                "A4",
                "C5"
              ],
              "duration": "w"
            },
            {
              "keys": [
                "A3",
                "C4",
                "E4"
              ],
              "duration": "w"
            }
          ],
          "label": "C Major closely related centers: C (I), G (V), F (IV), A minor (vi)",
          "caption": "Primary closely related key destinations for C major."
        },
        "audioSteps": [
          {
            "notes": [
              "C4",
              "E4",
              "G4"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "G4",
              "B4",
              "D5"
            ],
            "at": 1,
            "duration": 0.9
          },
          {
            "notes": [
              "F4",
              "A4",
              "C5"
            ],
            "at": 2,
            "duration": 0.9
          },
          {
            "notes": [
              "A3",
              "C4",
              "E4"
            ],
            "at": 3,
            "duration": 1.2
          }
        ],
        "audioLabel": "Hear C major moving through closely related tonal centers"
      }
    ],
    "repertoireExample": {
      "composer": "Wolfgang Amadeus Mozart",
      "work": "Eine kleine Nachtmusik, K. 525",
      "barReference": "Movement I, Allegro (Sonata Form)",
      "insight": "Mozart establishes G major firmly in the first theme, then modulates seamlessly to its dominant, D major (a closely related key differing by only one sharp), for the lyrical second theme.",
      "audioSteps": [
        {
          "notes": [
            "G4",
            "B4",
            "D5"
          ],
          "at": 0,
          "duration": 0.5
        },
        {
          "notes": [
            "A4",
            "C#5",
            "E5"
          ],
          "at": 0.6,
          "duration": 0.5
        },
        {
          "notes": [
            "D4",
            "F#4",
            "A4"
          ],
          "at": 1.2,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear Mozart K. 525 transition to dominant key D major"
    },
    "workedExample": {
      "title": "Finding the 5 Closely Related Keys for F Major",
      "scenario": "Identify all five closely related keys for F Major (1 flat: Bb).",
      "steps": [
        "Same key signature: Relative minor is D Minor (1 flat).",
        "One more flat: Subdominant key is Bb Major (2 flats); its relative minor is G Minor (2 flats).",
        "One fewer flat: Dominant key is C Major (0 flats); its relative minor is A Minor (0 flats)."
      ],
      "conclusion": "The five closely related keys to F Major are D minor, Bb major, G minor, C major, and A minor.",
      "notation": {
        "clef": "treble",
        "keySignature": "F",
        "chords": [
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
              "D4",
              "F4",
              "A4"
            ],
            "duration": "h"
          }
        ],
        "label": "F Major to D Minor",
        "caption": "F Major and D Minor share the 1-flat key signature."
      },
      "audioSteps": [
        {
          "notes": [
            "F4",
            "A4",
            "C5"
          ],
          "at": 0,
          "duration": 0.8
        },
        {
          "notes": [
            "D4",
            "F4",
            "A4"
          ],
          "at": 0.9,
          "duration": 1
        }
      ],
      "audioLabel": "Hear F Major to D Minor"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "F4",
        "G4",
        "A4"
      ],
      "showLabels": true,
      "label": "Tonal anchors around C Major",
      "caption": "C Major (tonic) surrounded by F (subdominant, 4th), G (dominant, 5th), and A (relative minor, 6th)."
    },
    "practicalApplication": "When analyzing any classical or baroque movement, look for the first accidental outside the key signature. An accidental typically signals that the music is modulating toward a closely related key.",
    "videoResource": {
      "title": "Open Yale Courses: Modulation and Musical Architecture",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-5",
      "embedPermitted": false,
      "notes": "Prof. Wright illustrates how key relationships create the psychological narrative of departure and return."
    },
    "references": [
      {
        "title": "Open Music Theory: Closely Related Keys",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Mathematical and syntactic definition of key distances on the circle of fifths."
      },
      {
        "title": "Fundamentals of Music Theory: Modulation and Key Relationships",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Pivot chord identification and tonal destination maps."
      }
    ],
    "practiceActivities": [
      {
        "id": "tonal-rel-q1",
        "prompt": "How many accidentals can two keys differ by on the Circle of Fifths to still be considered 'closely related'?",
        "options": [
          {
            "id": "zero-or-one",
            "label": "At most one accidental (0 or 1)"
          },
          {
            "id": "two",
            "label": "At most two accidentals"
          },
          {
            "id": "three",
            "label": "At most three accidentals"
          },
          {
            "id": "any",
            "label": "Any keys sharing a triad"
          }
        ],
        "correctOptionId": "zero-or-one",
        "explanation": "Closely related keys differ by no more than one accidental from the primary key signature (same, +1 sharp, or +1 flat)."
      }
    ],
    "summaryText": "Tonal relationships govern musical departure and homecoming; closely related keys share maximum harmonic vocabulary, providing seamless pathways for modulation in classical forms.",
    "keyTakeaways": [
      "Every major key has five closely related keys: ii, iii, IV, V, and vi.",
      "Closely related keys differ by at most one sharp or flat from the home key signature.",
      "Modulation to closely related keys forms the structural basis of Baroque and Classical music."
    ]
  }
];

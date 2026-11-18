import type {
  AcademyCourseDefinition,
  AcademyLessonContent,
  AcademyModuleDefinition,
  AcademyPathDefinition,
} from "./types";

export const PATH_4_RHYTHM: AcademyPathDefinition = {
  "slug": "rhythm-and-musical-reading",
  "numeral": "IV",
  "title": "Rhythm and Musical Reading",
  "summary": "Internalize beat and pulse, compare simple vs. compound meter, decode dotted notes, ties, rests, syncopation, and triplets, and read complete musical passages fluently.",
  "level": "elementary",
  "sortOrder": 4
};

export const PATH_4_COURSES: AcademyCourseDefinition[] = [
  {
    "slug": "pulse-simple-and-compound-meter",
    "learningPathSlug": "rhythm-and-musical-reading",
    "title": "Pulse, Simple & Compound Time",
    "description": "Feel primary metric pulse and distinguish binary simple subdivisions (2/4, 3/4, 4/4) from dotted ternary compound subdivisions (6/8, 9/8, 12/8).",
    "level": "elementary",
    "sortOrder": 1,
    "estimatedMinutes": 35
  },
  {
    "slug": "rhythmic-nuance-and-passage-reading",
    "learningPathSlug": "rhythm-and-musical-reading",
    "title": "Dotted Values, Syncopation, Triplets & Sight-Reading",
    "description": "Master rhythmic nuance—dots, ties, syncopations, tuplets, and beaming patterns—and synthesize pitch and rhythm in complete musical passages.",
    "level": "elementary",
    "sortOrder": 2,
    "estimatedMinutes": 55
  }
];

export const PATH_4_MODULES: AcademyModuleDefinition[] = [
  {
    "slug": "beat-and-metrical-division",
    "courseSlug": "pulse-simple-and-compound-meter",
    "learningPathSlug": "rhythm-and-musical-reading",
    "title": "Module 1 · Pulse & Metric Classification",
    "summary": "Compare regular vs. triple beat subdivisions.",
    "sortOrder": 1
  },
  {
    "slug": "dots-ties-and-cross-rhythm",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "learningPathSlug": "rhythm-and-musical-reading",
    "title": "Module 2 · Dots, Ties, Syncopation & Triplets",
    "summary": "Modify note durations across beats and barlines.",
    "sortOrder": 2
  },
  {
    "slug": "rhythmic-patterns-and-sightreading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "learningPathSlug": "rhythm-and-musical-reading",
    "title": "Module 3 · Beaming & Reading Complete Passages",
    "summary": "Scan rhythm, key signature, clef, and phrase structure together.",
    "sortOrder": 3
  }
];

export const PATH_4_LESSONS: AcademyLessonContent[] = [
  {
    "slug": "understanding-rhythm",
    "title": "Understanding rhythm",
    "summary": "Separate steady background pulse and meter from changing foreground rhythmic surface patterns.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "pulse-simple-and-compound-meter",
    "moduleSlug": "beat-and-metrical-division",
    "level": "elementary",
    "estimatedMinutes": 7,
    "sortOrder": 1,
    "objectives": [
      "Distinguish Beat (underlying steady pulse), Meter (accent grouping), Tempo (speed), and Rhythm (pattern of note lengths).",
      "Hear how varied surface rhythms lock onto an unchanging beat grid."
    ],
    "sections": [
      {
        "id": "rhythm-vs-beat",
        "heading": "1. Surface rhythm riding an invisible steady pulse",
        "body": [
          "Rhythm is not the same thing as Beat. The beat (like a calm clock) ticks evenly underneath music, while RHYTHM layers contrasting long and short durations across that steady grid.",
          "Meanwhile TEMPO dictates the speed of the beat (e.g., Allegro = fast, Adagio = slow), and METER groups beats into strong–weak cycles inside barlines."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "4/4",
          "chords": [
            {
              "keys": [
                "C4"
              ],
              "duration": "h"
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
            }
          ],
          "label": "Half note followed by two quarter notes in 4/4",
          "caption": "Foreground rhythm changes (long–short–short: 2 + 1 + 1 beats) while four steady beats tick underneath."
        },
        "audioSteps": [
          {
            "notes": [
              "C4"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "D4"
            ],
            "at": 0.95,
            "duration": 0.45
          },
          {
            "notes": [
              "E4"
            ],
            "at": 1.42,
            "duration": 0.45
          }
        ],
        "audioLabel": "Hear long–short–short rhythm against steady pulse"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven",
      "work": "Symphony No. 7 in A major, Op. 92, II. Allegretto",
      "barReference": "Persistent ostinato rhythm",
      "insight": "Beethoven mesmerizes listeners with a single repeating rhythmic cell (dactyl–spondee: long–short–short–long–long) anchored over an immovable quarter pulse.",
      "audioSteps": [
        {
          "notes": [
            "A4"
          ],
          "at": 0,
          "duration": 0.42
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.45,
          "duration": 0.2
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.68,
          "duration": 0.2
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.9,
          "duration": 0.42
        },
        {
          "notes": [
            "A4"
          ],
          "at": 1.35,
          "duration": 0.42
        }
      ],
      "audioLabel": "Hear Beethoven 7th Allegretto rhythmic ostinato"
    },
    "workedExample": {
      "title": "Separating Tempo from Rhythmic Density",
      "scenario": "Does playing fast sixteenth notes always mean the Tempo increased?",
      "steps": [
        "No: Beat speed (Tempo, say MM = 72 bpm) remains unchanged.",
        "Instead the musician simply placed 4 sixteenth notes inside each steady quarter beat."
      ],
      "conclusion": "Subdivision increases rhythmic density without speeding up the underlying tempo."
    },
    "practiceActivities": [
      {
        "id": "rhythm-q1",
        "prompt": "Which term describes the repeating foreground arrangement of long and short sounds and silences over the beat?",
        "options": [
          {
            "id": "tempo",
            "label": "Tempo"
          },
          {
            "id": "rhythm",
            "label": "Rhythm"
          },
          {
            "id": "clef",
            "label": "Clef"
          },
          {
            "id": "pitch",
            "label": "Frequency"
          }
        ],
        "correctOptionId": "rhythm",
        "explanation": "Beat is the steady pulse, Tempo is the speed of that pulse, and Rhythm is the specific pattern of durations over it."
      }
    ],
    "summaryText": "Music coordinates steady beat, recurring metrical accents, overall tempo speed, and varied rhythmic surface patterns simultaneously.",
    "keyTakeaways": [
      "Beat = regular pulse; Rhythm = varied durations aligned to that pulse.",
      "Tempo controls pulse rate independently of note subdivision density."
    ],
    "terminology": [
      {
        "term": "Rhythm",
        "definition": "The organization of musical sound and silence through time."
      },
      {
        "term": "Duration",
        "definition": "The length of time a sound or silence is sustained."
      },
      {
        "term": "Metrical Grid",
        "definition": "The underlying regular lattice of beats upon which varied rhythms are placed."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4"
      ],
      "showLabels": true,
      "label": "Rhythmic pulse against fixed pitch",
      "caption": "A single pitch articulated with different durations creates rhythmic interest without melodic movement."
    },
    "practicalApplication": "Before you learn the notes of any passage, practice clapping its rhythm while tapping your foot to the pulse. Isolating rhythm from pitch cuts practice time in half.",
    "videoResource": {
      "title": "Open Yale Courses: Rhythm Fundamentals",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-3",
      "embedPermitted": false,
      "notes": "Lecture 3 introduces the universal bodily experience of musical rhythm, heartbeat pulse, and metrical grouping."
    },
    "references": [
      {
        "title": "Open Music Theory: Fundamentals of Rhythm",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Metrical frameworks, beat subdivisions, and rhythmic notation."
      },
      {
        "title": "Fundamentals of Music Theory: Rhythm and Metre",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Physical and psychological perception of musical time."
      }
    ]
  },
  {
    "slug": "beat-and-pulse",
    "title": "Beat and pulse",
    "summary": "Recognize downbeats, weak beats, anacruses (pickup measures), and binary vs. ternary beat emphasis.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "pulse-simple-and-compound-meter",
    "moduleSlug": "beat-and-metrical-division",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 2,
    "objectives": [
      "Contrast strong downbeats (Beat 1) against secondary and weak beats.",
      "Count incomplete opening bars (anacrusis / pickup beat) paired cleanly with shortened final bars."
    ],
    "sections": [
      {
        "id": "downbeat-and-anacrusis",
        "heading": "1. Downbeats and the pickup bar (anacrusis)",
        "body": [
          "The first beat immediately following any barline is the DOWNBEAT (strongest metric accent). In 4/4 time, beats follow Strong–Weak–Medium–Weak (1–2–3–4); in 3/4, Strong–Weak–Weak (1–2–3).",
          "Many melodies launch slightly BEFORE Beat 1 with an incomplete opening measure called an ANACRUSIS (or pickup note). By classical rule, the beats borrowed by an opening pickup are subtracted cleanly from the piece's very final measure."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "3/4",
          "chords": [
            {
              "keys": [
                "G4"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "h"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            }
          ],
          "label": "Pickup quarter note G4 rising to half note C5 and quarter E5",
          "caption": "Upward-leaning pickup motion (G4 → downbeat C5) creates buoyant forward momentum."
        },
        "audioSteps": [
          {
            "notes": [
              "G4"
            ],
            "at": 0,
            "duration": 0.38
          },
          {
            "notes": [
              "C5"
            ],
            "at": 0.42,
            "duration": 0.85
          },
          {
            "notes": [
              "E5"
            ],
            "at": 1.3,
            "duration": 0.45
          }
        ],
        "audioLabel": "Hear weak pickup G4 leaning onto strong downbeat C5"
      }
    ],
    "repertoireExample": {
      "composer": "Frédéric Chopin",
      "work": "Prelude in A major, Op. 28 No. 7",
      "barReference": "Bar 0 pickup & Bar 1",
      "insight": "Notice how Chopin opens gently on Beat 3 (E4 anacrusis) so the melodic sigh lands cleanly onto the downbeat of bar 1 (C♯5).",
      "audioSteps": [
        {
          "notes": [
            "E4"
          ],
          "at": 0,
          "duration": 0.4
        },
        {
          "notes": [
            "C#5"
          ],
          "at": 0.45,
          "duration": 0.7
        },
        {
          "notes": [
            "A4"
          ],
          "at": 1.18,
          "duration": 0.4
        }
      ],
      "audioLabel": "Hear Chopin Op. 28 No. 7 pickup rise"
    },
    "workedExample": {
      "title": "Balancing an incomplete final measure",
      "scenario": "A piece in 4/4 opens with a 1-beat quarter-note pickup bar.",
      "steps": [
        "Opening anacrusis uses 1 beat out of 4.",
        "To keep the whole piece rhythmically balanced around complete 4-beat cycles, the ending bar omits 1 beat."
      ],
      "conclusion": "The final measure should hold 3 beats (1 + 3 = 4 total beats)."
    },
    "practiceActivities": [
      {
        "id": "pulse-q1",
        "prompt": "In a 4/4 piece starting with a 2-beat half-note pickup (anacrusis), how many beats will the final bar traditionally contain?",
        "options": [
          {
            "id": "1",
            "label": "1 beat"
          },
          {
            "id": "2",
            "label": "2 beats"
          },
          {
            "id": "3",
            "label": "3 beats"
          },
          {
            "id": "4",
            "label": "4 beats"
          }
        ],
        "correctOptionId": "2",
        "explanation": "Opening anacrusis (2 beats) + final bar (2 beats) together equal one complete 4/4 bar."
      }
    ],
    "summaryText": "Beat hierarchy organizes pulse into accented downbeats and unaccented upbeats, launching melodies smoothly via pickup bars.",
    "keyTakeaways": [
      "Downbeat = Beat 1 right after every barline.",
      "Anacrusis = incomplete opening measure whose beats are subtracted from the last measure."
    ],
    "terminology": [
      {
        "term": "Pulse (Beat)",
        "definition": "The steady, regular tick of musical time; the unit listeners tap their feet to."
      },
      {
        "term": "Tempo",
        "definition": "The speed of the underlying beat, measured in Beats Per Minute (BPM)."
      },
      {
        "term": "Metronome",
        "definition": "A mechanical or digital device that emits regular acoustic clicks at adjustable BPM."
      },
      {
        "term": "Rubato",
        "definition": "Expressive, flexible stretching and compressing of tempo without altering the fundamental musical architecture."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "G4"
      ],
      "showLabels": true,
      "label": "Metrical downbeat pulse",
      "caption": "Downbeat (C4) on beat 1 carries primary metric stress; G4 sounds on weak beats."
    },
    "practicalApplication": "Always practice with a metronome at slow tempos first. A metronome does not restrict your musicality; it builds the rock-solid internal clock that makes expressive rubato possible.",
    "videoResource": {
      "title": "Berklee Online: Developing an Internal Metronome",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee faculty demonstrate body percussion, sub-pulse feeling, and pocket groove stability."
    },
    "references": [
      {
        "title": "Open Music Theory: Pulse, Beat, and Tempo",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Hierarchical beat levels and tempo markings."
      },
      {
        "title": "Integrated Musicianship: Beat and Pulse",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "Aural training exercises for tempo consistency and pulse identification."
      }
    ]
  },
  {
    "slug": "simple-time-signatures",
    "title": "Simple time signatures",
    "summary": "Recognize duple, triple, and quadruple simple meters (2/4, 3/4, 4/4, 2/2, 3/8) where every beat naturally divides into TWO equal halves.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "pulse-simple-and-compound-meter",
    "moduleSlug": "beat-and-metrical-division",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 3,
    "objectives": [
      "Define SIMPLE METER as any meter whose beat unit is undotted and splits naturally in half (into 2 parts).",
      "Classify 2/4, 2/2 (cut time / alla breve), 3/4, 3/8, and 4/4 by duple/triple/quadruple beat count."
    ],
    "sections": [
      {
        "id": "binary-division",
        "heading": "1. Every beat splits neatly into two",
        "body": [
          "In SIMPLE TIME SIGNATURES (top numeral 2, 3, or 4), the beat note is an ordinary undotted value that divides effortlessly in two: e.g., in 2/4 or 4/4, each quarter beat splits into 2 eighth notes ('1-and, 2-and').",
          "Watch out for 2/2 (Cut Time / Alla Breve, symbol ₵) vs. 4/4: even though both contain four quarter notes' worth of notation per bar, 2/2 moves with TWO brisk half-note beats per measure rather than four quarter beats!"
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "2/4",
          "beamNotes": true,
          "chords": [
            {
              "keys": [
                "G4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "A4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "G4"
              ],
              "duration": "8"
            }
          ],
          "label": "Four eighth notes beamed in two pairs inside 2/4 simple duple meter",
          "caption": "Simple duple (2/4): beaming makes both two-part beat divisions ('1-and 2-and') visually clear."
        },
        "audioSteps": [
          {
            "notes": [
              "G4"
            ],
            "at": 0,
            "duration": 0.25
          },
          {
            "notes": [
              "A4"
            ],
            "at": 0.26,
            "duration": 0.25
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.52,
            "duration": 0.25
          },
          {
            "notes": [
              "G4"
            ],
            "at": 0.78,
            "duration": 0.45
          }
        ],
        "audioLabel": "Hear simple duple division (1-and 2-and)"
      }
    ],
    "repertoireExample": {
      "composer": "Wolfgang Amadeus Mozart",
      "work": "Rondo Alla Turca (Piano Sonata K. 331, III)",
      "barReference": "2/4 opening march",
      "insight": "2/4 gives the 'Turkish March' its snappy two-beat Left–Right military bounce cleanly sub-divided in pairs of eighth and sixteenth notes.",
      "audioSteps": [
        {
          "notes": [
            "B4"
          ],
          "at": 0,
          "duration": 0.16
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.16,
          "duration": 0.16
        },
        {
          "notes": [
            "G#4"
          ],
          "at": 0.32,
          "duration": 0.16
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.48,
          "duration": 0.16
        },
        {
          "notes": [
            "C5"
          ],
          "at": 0.64,
          "duration": 0.45
        }
      ],
      "audioLabel": "Hear 2/4 duple march turn B–A–G♯–A–C"
    },
    "workedExample": {
      "title": "Classifying 3/8 vs. 3/4",
      "scenario": "Compare 3/8 (3 eighth-note beats) against 3/4 (3 quarter-note beats).",
      "steps": [
        "Top number in both is 3 → both are SIMPLE TRIPLE meters!",
        "In 3/8, the bottom 8 sets the eighth note as one full beat (each splitting into two sixteenths).",
        "In 3/4, the bottom 4 sets the quarter note as one beat."
      ],
      "conclusion": "Both have 3 simple beats per bar; only the visual note value assigned to the beat shifts."
    },
    "practiceActivities": [
      {
        "id": "simple-q1",
        "prompt": "Which term accurately classifies the time signature 4/4?",
        "options": [
          {
            "id": "sd",
            "label": "Simple duple"
          },
          {
            "id": "sq",
            "label": "Simple quadruple"
          },
          {
            "id": "cd",
            "label": "Compound duple"
          },
          {
            "id": "ct",
            "label": "Compound triple"
          }
        ],
        "correctOptionId": "sq",
        "explanation": "Top numeral 4 means four beats per measure, each dividing simply in two → Simple quadruple."
      }
    ],
    "summaryText": "Simple time signatures feature top numbers 2, 3, or 4 and always subdivide every beat evenly into two parts.",
    "keyTakeaways": [
      "Top = 2 (duple), 3 (triple), 4 (quadruple) beats per measure.",
      "2/2 = 2 half-note beats; 3/8 = 3 eighth-note beats."
    ],
    "terminology": [
      {
        "term": "Simple Meter",
        "definition": "A meter where each primary beat divides naturally into TWO equal parts (binary division)."
      },
      {
        "term": "Simple Duple (2/4)",
        "definition": "Two beats per measure, each dividing into two eighth notes (ONE-and, TWO-and)."
      },
      {
        "term": "Simple Triple (3/4)",
        "definition": "Three beats per measure, each dividing into two eighth notes (waltz meter)."
      },
      {
        "term": "Simple Quadruple (4/4)",
        "definition": "Four beats per measure, each dividing into two eighth notes (common time)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4"
      ],
      "showLabels": true,
      "label": "Simple meter pulse hierarchy",
      "caption": "Beat 1 = strong (C4); Beat 2 = weak (E4); Beat 3 = medium (G4); Beat 4 = weak."
    },
    "practicalApplication": "In simple meters, keep your internal counting syllables consistent: '1-and, 2-and, 3-and, 4-and' for eighths; '1-e-and-a, 2-e-and-a' for sixteenths.",
    "videoResource": {
      "title": "Open Yale Courses: Rhythm — Jazz, Pop and Classical",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-4",
      "embedPermitted": false,
      "notes": "MUSI 112 Lecture 4 analyzes simple meter accent patterns across classical symphonies and dance music."
    },
    "references": [
      {
        "title": "Open Music Theory: Simple Meters",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Metric hierarchy and beaming rules in simple time signatures."
      },
      {
        "title": "Musictheory.net: Simple and Compound Meter",
        "authorOrInstitution": "Ricci Adams",
        "url": "https://www.musictheory.net/lessons/15",
        "licence": "Free Web Educational Access",
        "relevance": "Interactive breakdown of beat division."
      }
    ]
  },
  {
    "slug": "compound-time-signatures",
    "title": "Compound time signatures",
    "summary": "Master 6/8, 9/8, and 12/8 meters where each dotted main beat swings naturally into THREE sub-pulses.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "pulse-simple-and-compound-meter",
    "moduleSlug": "beat-and-metrical-division",
    "level": "elementary",
    "estimatedMinutes": 10,
    "sortOrder": 4,
    "objectives": [
      "Decode top numerals 6, 9, and 12 cleanly: divide the top number by 3 to find main dotted beats per bar.",
      "Contrast 6/8 (2 dotted-quarter beats per bar: ONE-2-3 TWO-2-3) from 3/4 (3 quarter beats: ONE-& TWO-& THREE-&).",
      "Beam notes strictly in groups of three eighths to mirror compound beats."
    ],
    "sections": [
      {
        "id": "ternary-subdivision",
        "heading": "1. Dotted beats swinging in threes (6/8, 9/8, 12/8)",
        "body": [
          "In COMPOUND TIME SIGNATURES (top numerals 6, 9, or 12), the main felt beat is a DOTTED NOTE divided into THREE equal parts. Do NOT conduct 6/8 as six separate slow beats: divide the top number by 3 to find how many main beats drive the bar!",
          "6/8 = 6 ÷ 3 = 2 dotted-quarter beats (Compound Duple: ONE-la-li, TWO-la-li). 9/8 = 3 dotted-quarter beats (Compound Triple). 12/8 = 4 dotted-quarter beats (Compound Quadruple)."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "6/8",
          "beamNotes": true,
          "chords": [
            {
              "keys": [
                "E4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "G4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "qd"
            }
          ],
          "label": "Three beamed eighth notes followed by a dotted quarter note in 6/8",
          "caption": "6/8 bar: Beat 1 holds three eighth notes ('1-la-li'); Beat 2 holds one dotted quarter note ('2---')."
        },
        "audioSteps": [
          {
            "notes": [
              "E4"
            ],
            "at": 0,
            "duration": 0.25
          },
          {
            "notes": [
              "G4"
            ],
            "at": 0.25,
            "duration": 0.25
          },
          {
            "notes": [
              "C5"
            ],
            "at": 0.5,
            "duration": 0.25
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.75,
            "duration": 0.75
          }
        ],
        "audioLabel": "Hear 6/8 compound duple lilt (1-2-3 | 4--)"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven",
      "work": "Piano Sonata No. 14 in C♯ minor ('Moonlight'), I & J. S. Bach Brandenburg Concerto No. 3",
      "barReference": "Siciliano & Pastoral compound grooves",
      "insight": "12/8 gives Baroque pastorales and Beethoven's 'Pastoral' Symphony slow flowing river-like triplets inside four calm main beats per bar.",
      "audioSteps": [
        {
          "notes": [
            "G4"
          ],
          "at": 0,
          "duration": 0.22
        },
        {
          "notes": [
            "C5"
          ],
          "at": 0.22,
          "duration": 0.22
        },
        {
          "notes": [
            "E5"
          ],
          "at": 0.44,
          "duration": 0.22
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.66,
          "duration": 0.22
        },
        {
          "notes": [
            "D5"
          ],
          "at": 0.88,
          "duration": 0.22
        },
        {
          "notes": [
            "F5"
          ],
          "at": 1.1,
          "duration": 0.5
        }
      ],
      "audioLabel": "Hear gentle compound 6/8 triplets"
    },
    "workedExample": {
      "title": "Distinguishing 3/4 from 6/8 mathematically and musically",
      "scenario": "Why aren't 3/4 and 6/8 interchangeable when both equal 6 eighth notes per measure?",
      "steps": [
        "In 3/4 (simple triple), six eighths beam in THREE pairs of two: [♪♪] [♪♪] [♪♪] → ONE-and TWO-and THREE-and.",
        "In 6/8 (compound duple), six eighths beam in TWO groups of three: [♪♪♪] [♪♪♪] → ONE-two-three TWO-two-three."
      ],
      "conclusion": "Grouping by 2s (3 beats) vs. grouping by 3s (2 beats) produces completely different musical pulses."
    },
    "practiceActivities": [
      {
        "id": "comp-q1",
        "prompt": "How many main dotted-quarter beats fill each measure of 9/8?",
        "options": [
          {
            "id": "two",
            "label": "2 dotted-quarter beats"
          },
          {
            "id": "three",
            "label": "3 dotted-quarter beats"
          },
          {
            "id": "four",
            "label": "4 dotted-quarter beats"
          },
          {
            "id": "nine",
            "label": "9 dotted-quarter beats"
          }
        ],
        "correctOptionId": "three",
        "explanation": "In compound time, divide the top numeral by 3: 9 ÷ 3 = 3 dotted-quarter beats (Compound Triple)."
      }
    ],
    "summaryText": "Compound meters (6, 9, 12 on top) divide every dotted main beat into three equal sub-pulses.",
    "keyTakeaways": [
      "Top ÷ 3 gives the number of dotted main beats: 6/8 = 2, 9/8 = 3, 12/8 = 4.",
      "Always beam eighths in 3-note clusters inside compound bars."
    ],
    "terminology": [
      {
        "term": "Compound Meter",
        "definition": "A meter where each primary beat divides naturally into THREE equal parts (ternary division)."
      },
      {
        "term": "Dotted Quarter Beat",
        "definition": "The standard pulse unit in compound meters (such as 6/8, 9/8, 12/8), equal to three eighth notes."
      },
      {
        "term": "Compound Duple (6/8)",
        "definition": "Two dotted-quarter beats per measure (total 6 eighth notes grouped 3 + 3)."
      },
      {
        "term": "Compound Triple (9/8)",
        "definition": "Three dotted-quarter beats per measure (grouped 3 + 3 + 3)."
      },
      {
        "term": "Compound Quadruple (12/8)",
        "definition": "Four dotted-quarter beats per measure (grouped 3 + 3 + 3 + 3)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "G4"
      ],
      "showLabels": true,
      "label": "6/8 Two-beat macro pulse (Beats 1 and 4)",
      "caption": "In 6/8 time, feel TWO big swinging pulses per bar: count 'ONE-two-three, FOUR-five-six'."
    },
    "practicalApplication": "Never count 6/8 as six slow, stiff beats! Conduct or tap it in TWO large swinging beats (ONE-two-three, TWO-two-three), exactly like a barcarolle, gigue, or Irish jig.",
    "videoResource": {
      "title": "Fundamentals of Music Theory: Compound Time Signatures",
      "publisher": "University of Edinburgh (Reid School of Music)",
      "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
      "embedPermitted": false,
      "notes": "Reid School of Music video lecture explaining compound division and dotted-beat notation."
    },
    "references": [
      {
        "title": "Open Music Theory: Compound Meters",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Mathematical derivation of dotted-quarter beats and beam grouping in 6/8, 9/8, and 12/8."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Compound Metre",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Sight-singing drills in compound duple and triple meters."
      }
    ]
  },
  {
    "slug": "dotted-notes",
    "title": "Dotted notes",
    "summary": "Calculate exact augmentation dots (+50% value) and double dots (+75% value) across all rhythmic durations.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "dots-ties-and-cross-rhythm",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 5,
    "objectives": [
      "Apply the augmentation dot rule: a single dot adds HALF of the note's original duration (1.5×).",
      "Count dotted half (3 quarter beats), dotted quarter (1.5 beats), and dotted eighth (0.75 beat) patterns accurately.",
      "Understand dotted quarter + eighth phrasing in common 4/4 melodies."
    ],
    "sections": [
      {
        "id": "augmentation-dot",
        "heading": "1. Original value plus half again (× 1.5)",
        "body": [
          "Placing a small dot immediately to the RIGHT of a notehead (never confusing it with a staccato dot above or below!) extends that note by half its own value. Thus a dotted note naturally divides into THREE of the next smaller note value:",
          "• Dotted half note = 2 + 1 = 3 quarter notes.\n• Dotted quarter note = 1 + ½ = 1½ beats (3 eighth notes).\n• Dotted eighth note = ½ + ¼ = ¾ beat (3 sixteenth notes)."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "4/4",
          "chords": [
            {
              "keys": [
                "G4"
              ],
              "duration": "qd"
            },
            {
              "keys": [
                "A4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "h"
            }
          ],
          "label": "Dotted quarter note G4, eighth note A4, and half note B4 in 4/4",
          "caption": "Classic lyric figure in 4/4: dotted quarter (1½ beats) + eighth (½ beat) + half note (2 beats)."
        },
        "audioSteps": [
          {
            "notes": [
              "G4"
            ],
            "at": 0,
            "duration": 0.68
          },
          {
            "notes": [
              "A4"
            ],
            "at": 0.72,
            "duration": 0.22
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.96,
            "duration": 0.9
          }
        ],
        "audioLabel": "Hear dotted quarter + eighth + half phrasing"
      }
    ],
    "repertoireExample": {
      "composer": "George Frideric Handel",
      "work": "Water Music Suite, Hornpipe & Overture rhythms",
      "barReference": "French Overture dotted figures",
      "insight": "Baroque overtures harness crisp dotted-eighth + sixteenth snaps to project stately royal grandeur before launching into lively contrapuntal allegros.",
      "audioSteps": [
        {
          "notes": [
            "D5"
          ],
          "at": 0,
          "duration": 0.55
        },
        {
          "notes": [
            "C#5"
          ],
          "at": 0.58,
          "duration": 0.16
        },
        {
          "notes": [
            "D5"
          ],
          "at": 0.76,
          "duration": 0.7
        }
      ],
      "audioLabel": "Hear ceremonial dotted snap D5–C♯5–D5"
    },
    "workedExample": {
      "title": "Counting beats across a dotted half + two eighths in 4/4",
      "scenario": "Verify the beat total of [dotted half] + [eighth] + [eighth].",
      "steps": [
        "Dotted half = 2 (half) + 1 (half of half) = 3 quarter beats.",
        "Two eighth notes = ½ + ½ = 1 quarter beat.",
        "Total = 3 + 1 = 4 complete quarter beats."
      ],
      "conclusion": "The rhythm fills an exact 4/4 bar cleanly."
    },
    "practiceActivities": [
      {
        "id": "dots-q1",
        "prompt": "In 4/4 time, how many quarter beats long is a single dotted quarter note?",
        "options": [
          {
            "id": "1",
            "label": "1 beat"
          },
          {
            "id": "1.5",
            "label": "1.5 beats (3 eighth notes)"
          },
          {
            "id": "2",
            "label": "2 beats"
          },
          {
            "id": "3",
            "label": "3 beats"
          }
        ],
        "correctOptionId": "1.5",
        "explanation": "A quarter note (1 beat) plus half of itself (0.5 beat) = 1.5 beats = 3 eighth notes."
      }
    ],
    "summaryText": "An augmentation dot extends any note or rest by 50% of its value, bridging cleanly across binary and ternary subdivisions.",
    "keyTakeaways": [
      "Dot = +50% of the immediately preceding notehead (so dotted note = 3 parts of next subdivision).",
      "Placement matters: dot to the RIGHT changes length; dot ABOVE/BELOW marks staccato articulation."
    ],
    "terminology": [
      {
        "term": "Augmentation Dot",
        "definition": "A dot placed immediately to the right of a notehead that adds half of the note's original value to its duration."
      },
      {
        "term": "Double Dot",
        "definition": "A second dot that adds one-quarter of the original value (for a total of 175% duration)."
      },
      {
        "term": "Dotted Quarter Note",
        "definition": "Equal to 1 quarter note + 1 eighth note (1.5 beats in simple time, or 1 full beat in compound time)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "G4"
      ],
      "showLabels": true,
      "label": "Dotted rhythm pairing: Dotted quarter + eighth note",
      "caption": "The dotted note sustains across the beat, while the subsequent eighth note leaps into the next downbeat."
    },
    "practicalApplication": "In classical and baroque marches, do not rush the short note following a dotted note! Ensure the dotted note sustains its full duration before crisp articulation of the short note.",
    "videoResource": {
      "title": "Open Yale Courses: Dotted Rhythms in the French Overture",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-3",
      "embedPermitted": false,
      "notes": "Prof. Wright illustrates the majestic, regal character of dotted rhythms in Baroque French overtures."
    },
    "references": [
      {
        "title": "Open Music Theory: Dotted Notes",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Mathematical proportion and engraving rules for single and double dotted values."
      },
      {
        "title": "Musictheory.net: Dots and Ties",
        "authorOrInstitution": "Ricci Adams",
        "url": "https://www.musictheory.net/lessons/14",
        "licence": "Free Web Educational Access",
        "relevance": "Interactive drills for calculating dotted durations."
      }
    ]
  },
  {
    "slug": "ties-and-rests",
    "title": "Ties and rests",
    "summary": "Extend durations invisibly across barlines with ties while never chaining rests, and recognize slur vs. tie notation cleanly.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "dots-ties-and-cross-rhythm",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 6,
    "objectives": [
      "Combine note values with curved TIES—strictly between identical pitches—to sum into a single unbroken sound.",
      "Distinguish a TIE (same pitch, rhythmic addition) from a SLUR (different pitches, legato connection).",
      "Respect the whole-bar rest convention and understand why rests are never tied."
    ],
    "sections": [
      {
        "id": "ties-vs-slurs-and-rests",
        "heading": "1. Tied additions vs. slurs & full-measure rests",
        "body": [
          "A TIE is a curved arc joining two adjacent noteheads of the EXACT SAME PITCH: strike only the first note and hold cleanly through the combined sum of both durations. Ties solve rhythms impossible with a single notehead (like a 5-beat note or holding across a barline).",
          "In contrast, a SLUR connects two or more DIFFERENT pitches smoothly (legato) without adding rhythmic length. Also remember: rests are NEVER tied—combine consecutive silences cleanly with larger rest symbols respecting the middle of the bar."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "4/4",
          "chords": [
            {
              "keys": [
                "E4"
              ],
              "duration": "h"
            },
            {
              "keys": [],
              "duration": "qr"
            },
            {
              "keys": [
                "G4"
              ],
              "duration": "q"
            }
          ],
          "label": "Half note E4, quarter rest, and quarter note G4 balancing 4/4",
          "caption": "Silence fills exactly Beat 3 (quarter rest) before sounding Beat 4 cleanly."
        },
        "audioSteps": [
          {
            "notes": [
              "E4"
            ],
            "at": 0,
            "duration": 0.9
          },
          {
            "notes": [
              "G4"
            ],
            "at": 1.45,
            "duration": 0.45
          }
        ],
        "audioLabel": "Hear E4 held 2 beats, Beat 3 silence, G4 on Beat 4"
      }
    ],
    "repertoireExample": {
      "composer": "Claude Debussy",
      "work": "Clair de lune (Suite bergamasque)",
      "barReference": "9/8 tied downbeats across bars",
      "insight": "Debussy floats melodies gently across barlines using silent tied downbeats so phrases breathe weightlessly past rigid metric edges.",
      "audioSteps": [
        {
          "notes": [
            "F5"
          ],
          "at": 0,
          "duration": 0.6
        },
        {
          "notes": [
            "Db5"
          ],
          "at": 0.62,
          "duration": 1.3
        },
        {
          "notes": [
            "Bb4"
          ],
          "at": 1.95,
          "duration": 0.55
        }
      ],
      "audioLabel": "Hear floating tied melodic sustain across barline"
    },
    "workedExample": {
      "title": "Calculating a tied barline cross-hold",
      "scenario": "A quarter note on Beat 4 of Measure 1 is tied across the barline to a half note in Measure 2 (in 4/4).",
      "steps": [
        "Both noteheads share the same pitch (e.g., A4), so you strike A4 ONCE on Beat 4.",
        "Hold 1 beat (Beat 4 of Measure 1) + 2 beats (Beats 1–2 of Measure 2)."
      ],
      "conclusion": "Hold A4 seamlessly for 3 full beats, releasing right before Beat 3 of Measure 2."
    },
    "practiceActivities": [
      {
        "id": "ties-q1",
        "prompt": "What happens visually when a curved arc joins an F4 quarter note to an E4 quarter note?",
        "options": [
          {
            "id": "tie",
            "label": "It is a tie adding both beats into one note"
          },
          {
            "id": "slur",
            "label": "It is a slur instructing you to play F4 smoothly into E4"
          },
          {
            "id": "rest",
            "label": "It silences the E4 like a rest"
          },
          {
            "id": "accent",
            "label": "It doubles the dynamic volume"
          }
        ],
        "correctOptionId": "slur",
        "explanation": "Ties only link identical pitches. A curve spanning different pitches (F4 → E4) is a SLUR marking smooth legato articulation."
      }
    ],
    "summaryText": "Ties unite identical pitches across beat boundaries and barlines into a single sustained duration, whereas rests never tie and whole-measure rests adapt automatically to any time signature.",
    "keyTakeaways": [
      "Tie = same pitch, strike once and sum durations; Slur = different pitches, play smoothly.",
      "A single whole rest hangs centered inside any empty bar regardless of meter."
    ],
    "terminology": [
      {
        "term": "Tie",
        "definition": "A curved line connecting two notes of identical pitch, combining them into one continuous sounding duration."
      },
      {
        "term": "Slur",
        "definition": "A curved line connecting notes of DIFFERENT pitches, indicating smooth legato phrasing (not to be confused with a tie)."
      },
      {
        "term": "Barline Crossing",
        "definition": "Ties are the ONLY legal method to sustain a single continuous note across a barline."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4"
      ],
      "showLabels": true,
      "label": "Sustaining tied pitch across barline",
      "caption": "A tie connects two notes of the same pitch into one unbroken sustain."
    },
    "practicalApplication": "Distinguish ties from slurs immediately: ties connect identical pitch heads to prolong duration; slurs arch over different notes to dictate smooth articulation.",
    "videoResource": {
      "title": "Berklee Online: Notation Rules — Ties, Slurs and Beaming",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee masterclass on score layout, tie engraving, and metric clarity."
    },
    "references": [
      {
        "title": "Open Music Theory: Ties and Slurs",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Engraving conventions for ties across beats and measures."
      },
      {
        "title": "Integrated Musicianship: Ties and Rests",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "Aural dictation exercises containing tied syncopations."
      }
    ]
  },
  {
    "slug": "syncopation",
    "title": "Syncopation",
    "summary": "Feel how stressing off-beats or holding notes across strong metric beats produces rhythmic drive and forward vitality.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "dots-ties-and-cross-rhythm",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 7,
    "objectives": [
      "Define syncopation as intentional metric displacement of accent onto weak beats or weak subdivisions ('ands').",
      "Recognize the classic short–long–short eighth–quarter–eighth syncopated figure cleanly across beats 1–2.",
      "Perform tied syncopation without rushing the held beat."
    ],
    "sections": [
      {
        "id": "offbeat-accent",
        "heading": "1. Displacing emphasis off the expected grid",
        "body": [
          "Music breathes through tension between expectation and surprise. When a melody places a long note, dynamic accent, or sharp entry on a weak beat or off-beat subdivision ('and') and holds straight through the next strong beat without restatement, SYNCOPATION occurs.",
          "The most essential syncopation pattern in 4/4 is eighth–quarter–eighth ([♪] [♩] [♪]): you strike '1', strike early on 'and', and hold through Beat 2 before striking 'and' of 2!"
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "4/4",
          "chords": [
            {
              "keys": [
                "C5"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "q"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "h"
            }
          ],
          "label": "Syncopated eighth C5, quarter E5 spanning beat 2, eighth D5, and half note C5",
          "caption": "Eighth – Quarter – Eighth syncopation: E5 enters early on '1-and' and holds straight across Beat 2."
        },
        "audioSteps": [
          {
            "notes": [
              "C5"
            ],
            "at": 0,
            "duration": 0.22
          },
          {
            "notes": [
              "E5"
            ],
            "at": 0.24,
            "duration": 0.48
          },
          {
            "notes": [
              "D5"
            ],
            "at": 0.74,
            "duration": 0.22
          },
          {
            "notes": [
              "C5"
            ],
            "at": 0.98,
            "duration": 0.9
          }
        ],
        "audioLabel": "Hear classic eighth–quarter–eighth syncopation"
      }
    ],
    "repertoireExample": {
      "composer": "Ludwig van Beethoven / Scott Joplin",
      "work": "String Quartet Op. 59 No. 3 & Classic Piano Rags",
      "barReference": "Off-beat sforzando displacements",
      "insight": "From Beethoven's urgent off-beat Beethovenian sforzandos to Romantic scherzos and early twentieth-century piano rags, syncopation charges steady pulse with electric lift.",
      "audioSteps": [
        {
          "notes": [
            "G4"
          ],
          "at": 0,
          "duration": 0.2
        },
        {
          "notes": [
            "C5"
          ],
          "at": 0.22,
          "duration": 0.45
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.7,
          "duration": 0.2
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.92,
          "duration": 0.6
        }
      ],
      "audioLabel": "Hear snappy off-beat ragtime accent"
    },
    "workedExample": {
      "title": "Clapping eighth–quarter–eighth accurately in 2/4",
      "scenario": "Internalize Beats 1 and 2 subdivided as '1-and-2-and'.",
      "steps": [
        "Beat '1': clap eighth note.",
        "Beat '1-and': clap quarter note and HOLD silently past Beat 2.",
        "Beat '2-and': clap final eighth note."
      ],
      "conclusion": "The skipped clap on Beat 2 lets the '1-and' entry pop rhythmically."
    },
    "practiceActivities": [
      {
        "id": "sync-q1",
        "prompt": "Which rhythmic figure exemplifies basic off-beat syncopation spanning two quarter beats?",
        "options": [
          {
            "id": "qq",
            "label": "Quarter + Quarter"
          },
          {
            "id": "eqe",
            "label": "Eighth + Quarter + Eighth"
          },
          {
            "id": "h",
            "label": "One Half Note"
          },
          {
            "id": "eeee",
            "label": "Four Equal Eighths"
          }
        ],
        "correctOptionId": "eqe",
        "explanation": "Eighth + Quarter + Eighth shifts the longer note onto the 'and' of Beat 1, sustaining directly over Beat 2."
      }
    ],
    "summaryText": "Syncopation energizes meter by accenting off-beats and holding across strong beats rather than restating them.",
    "keyTakeaways": [
      "Common mechanisms: off-beat longer notes (♪ ♩ ♪), ties across strong beats, or rests placed on strong beats.",
      "Keep subdividing '1-and 2-and' mentally so off-beat holds never rush."
    ],
    "terminology": [
      {
        "term": "Syncopation",
        "definition": "The deliberate accenting of a normally weak beat or off-beat fraction of a pulse."
      },
      {
        "term": "Off-Beat",
        "definition": "The weak subdivision of a beat (the 'and' of the beat in simple meter)."
      },
      {
        "term": "Metric Tension",
        "definition": "The physical excitement created when rhythmic accents clash against the underlying pulse."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4"
      ],
      "showLabels": true,
      "label": "Syncopated off-beat chord stabs",
      "caption": "Striking chords on off-beats ('and' of 1, 'and' of 2) generates propelling syncopated energy."
    },
    "practicalApplication": "To master syncopation, tap the steady downbeat pulse firmly with your foot while speaking the syncopated rhythm. Never move your foot with the syncopation; your foot represents the unwavering law of gravity.",
    "videoResource": {
      "title": "Open Yale Courses: Syncopation in Ragtime, Jazz and Beethoven",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-4",
      "embedPermitted": false,
      "notes": "Lecture 4 examines syncopation in Scott Joplin ragtime and Beethoven symphonies."
    },
    "references": [
      {
        "title": "Open Music Theory: Syncopation",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Metrical analysis of displacement, ties, and accentuation."
      },
      {
        "title": "Berklee Online: Groove and Syncopation",
        "authorOrInstitution": "Berklee College of Music",
        "url": "https://online.berklee.edu/free-music-course-handbooks",
        "licence": "Educational Handbook",
        "relevance": "Syncopated phrasing across modern and contemporary genres."
      }
    ]
  },
  {
    "slug": "triplets",
    "title": "Triplets",
    "summary": "Subdivide a simple binary beat temporarily into THREE equal notes ('tri-pl-et') without changing the time signature.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "dots-ties-and-cross-rhythm",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 8,
    "objectives": [
      "Play three equal eighth-note triplets cleanly inside the time normally occupied by two eighth notes (one quarter beat).",
      "Recognize quarter-note triplets spanning two full quarter beats.",
      "Maintain smooth tempo transitions moving directly between straight eighths (duplets) and eighth triplets."
    ],
    "sections": [
      {
        "id": "three-in-time-of-two",
        "heading": "1. Fitting three into the space of two",
        "body": [
          "Sometimes a composer writing in simple time (like 4/4) wants a brief three-part lilt without changing the meter to 12/8. A TRIPLET inserts three equal notes—bracketed with a small numeral '3'—into the exact rhythmic slot normally held by TWO notes of that same written value.",
          "Thus 3 eighth-note triplets equal 2 ordinary eighth notes (1 quarter beat); 3 quarter-note triplets equal 2 ordinary quarter notes (1 half note); and 3 sixteenth-note triplets fill 1 single eighth beat."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "2/4",
          "beamNotes": true,
          "tuplet": {
            "start": 0,
            "end": 2,
            "numNotes": 3
          },
          "chords": [
            {
              "keys": [
                "E4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "G4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "q"
            }
          ],
          "label": "Eighth-note triplet E4-G4-B4 followed by quarter note C5 in 2/4",
          "caption": "Beat 1 divides cleanly into a triplet (E–G–B in the time of two eighths) arriving on Beat 2 (C5)."
        },
        "audioSteps": [
          {
            "notes": [
              "E4"
            ],
            "at": 0,
            "duration": 0.2
          },
          {
            "notes": [
              "G4"
            ],
            "at": 0.19,
            "duration": 0.2
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.38,
            "duration": 0.2
          },
          {
            "notes": [
              "C5"
            ],
            "at": 0.57,
            "duration": 0.65
          }
        ],
        "audioLabel": "Hear eighth-note triplet (E–G–B) arriving smoothly on Beat 2"
      }
    ],
    "repertoireExample": {
      "composer": "Frédéric Chopin",
      "work": "Prelude in E minor, Op. 28 No. 4 / Nocturnes",
      "barReference": "3-against-2 polyrhythm moments",
      "insight": "Chopin frequently sets a flowing left-hand triplet or right-hand ornamental triplet against straight eighths, demanding rock-solid pulse alignment on every main beat.",
      "audioSteps": [
        {
          "notes": [
            "G4",
            "C4"
          ],
          "at": 0,
          "duration": 0.25
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.22,
          "duration": 0.22
        },
        {
          "notes": [
            "G4",
            "E4"
          ],
          "at": 0.33,
          "duration": 0.25
        },
        {
          "notes": [
            "B4"
          ],
          "at": 0.44,
          "duration": 0.22
        },
        {
          "notes": [
            "C5",
            "G4"
          ],
          "at": 0.66,
          "duration": 0.65
        }
      ],
      "audioLabel": "Hear triplet melody floating smoothly over a steady pulse"
    },
    "workedExample": {
      "title": "Checking quarter-note triplets in 4/4",
      "scenario": "How many beats does a quarter-note triplet occupy?",
      "steps": [
        "Standard triplet rule: 3 notes in the time of 2 of the SAME written value.",
        "Written value = quarter note.",
        "2 normal quarter notes = 2 beats."
      ],
      "conclusion": "A quarter-note triplet distributes 3 equal attacks across 2 quarter beats."
    },
    "practiceActivities": [
      {
        "id": "trip-q1",
        "prompt": "What single note equals the combined duration of one eighth-note triplet (3 beamed eighths under a '3')?",
        "options": [
          {
            "id": "eighth",
            "label": "One eighth note"
          },
          {
            "id": "quarter",
            "label": "One quarter note"
          },
          {
            "id": "dotted-q",
            "label": "One dotted quarter note"
          },
          {
            "id": "half",
            "label": "One half note"
          }
        ],
        "correctOptionId": "quarter",
        "explanation": "An eighth-note triplet compresses 3 eighths into the duration of 2 ordinary eighths = 1 quarter note."
      }
    ],
    "summaryText": "Triplets divide any simple binary duration cleanly into three equal parts without changing the surrounding time signature.",
    "keyTakeaways": [
      "3 triplet notes always take the duration of 2 standard notes of that written size.",
      "Align every downbeat (or beat onset) cleanly before accelerating into triple subdivision."
    ],
    "terminology": [
      {
        "term": "Tuplet",
        "definition": "Any rhythm that borrows an irregular number of subdivisions against the established meter."
      },
      {
        "term": "Triplet",
        "definition": "Playing THREE equal notes in the normal time span of TWO notes of the same value."
      },
      {
        "term": "Quarter-Note Triplet",
        "definition": "Three quarter notes played in the time of two quarter notes (spanning two beats in 4/4)."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4"
      ],
      "showLabels": true,
      "label": "Eighth-note triplet (3 notes in 1 beat)",
      "caption": "In simple meter, triplets inject a momentary rolling, lyrical feel."
    },
    "practicalApplication": "Count eighth-note triplets with three-syllable words: 'trip-o-let, trip-o-let' or 'straw-ber-ry, straw-ber-ry'. Ensure all three syllables have identical duration.",
    "videoResource": {
      "title": "Berklee Online: Triplets and Compound Tuplets",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee rhythm clinic on tuplet subdivisions, swing feel, and triplet accuracy."
    },
    "references": [
      {
        "title": "Open Music Theory: Triplets and Tuplets",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Notation, beaming, and mathematical ratios for tuplets."
      },
      {
        "title": "Fundamentals of Music Theory: Tuplets and Metric Modulation",
        "authorOrInstitution": "University of Edinburgh (Reid School of Music)",
        "url": "https://www.ed.ac.uk/information-services/learning-technology/open-ed/",
        "licence": "CC BY 4.0",
        "relevance": "Tuplets in romantic and contemporary concert repertoire."
      }
    ]
  },
  {
    "slug": "polyrhythms",
    "title": "Polyrhythms, cross-rhythms, and hemiola",
    "summary": "Master simultaneous conflicting meters, including two against three, three against four, and the Baroque hemiola cadence.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "dots-ties-and-cross-rhythm",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 9,
    "objectives": [
      "Execute two-against-three (2:3) and three-against-four (3:4) polyrhythms with steady bodily coordination.",
      "Identify the Baroque and Classical hemiola (re-grouping two bars of triple meter into three bars of duple meter).",
      "Calculate the smallest common denominator subdivision for cross-rhythmic performance."
    ],
    "terminology": [
      {
        "term": "Polyrhythm (Cross-Rhythm)",
        "definition": "The simultaneous sounding of two or more independent, conflicting rhythmic meters."
      },
      {
        "term": "Two Against Three (2:3)",
        "definition": "Playing two equal notes in one hand while playing three equal notes in the other over the same timespan."
      },
      {
        "term": "Hemiola",
        "definition": "A rhythmic device where two bars of 3/4 are re-articulated as three bars of 2/4, often signaling an impending cadence."
      }
    ],
    "sections": [
      {
        "id": "two-against-three",
        "heading": "1. Two Against Three: 'Not Very Dif-fi-cult'",
        "body": [
          "A polyrhythm occurs when two different divisions of the same time span sound at once. The most famous and essential polyrhythm is two against three (2:3), found throughout the music of Chopin, Brahms, and Debussy.",
          "To master 2:3, use the common subdivision of six (2 × 3 = 6). The two hands hit together on 1; the triplet hits on 3; the duplet hits on 4; the final triplet hits on 5. Speak the mnemonic phrase: 'NOT dif-fi-CULT' (Together - Right - Left - Right)."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "3/4",
          "tuplet": {
            "start": 0,
            "end": 2,
            "numNotes": 3
          },
          "chords": [
            {
              "keys": [
                "C4",
                "C5"
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
                "G4",
                "C5"
              ],
              "duration": "q"
            }
          ],
          "label": "Two against three cross-rhythm notation",
          "caption": "Cross-rhythmic layering across two independent voices."
        },
        "audioSteps": [
          {
            "notes": [
              "C3",
              "C5"
            ],
            "at": 0,
            "duration": 0.4
          },
          {
            "notes": [
              "E4"
            ],
            "at": 0.33,
            "duration": 0.3
          },
          {
            "notes": [
              "G3"
            ],
            "at": 0.5,
            "duration": 0.4
          },
          {
            "notes": [
              "G4"
            ],
            "at": 0.66,
            "duration": 0.3
          }
        ],
        "audioLabel": "Hear 2 against 3 polyrhythm composite"
      }
    ],
    "repertoireExample": {
      "composer": "Frédéric Chopin",
      "work": "Fantaisie-Impromptu in C-sharp minor, Op. 66",
      "barReference": "Bars 1–8",
      "insight": "Chopin's masterpiece is the ultimate study in polyrhythm: the right hand spins continuous sixteenth-note triplets (semiquavers) while the left hand pulses in even eighth notes, creating a shimmering, fluid texture.",
      "audioSteps": [
        {
          "notes": [
            "C#3",
            "G#4"
          ],
          "at": 0,
          "duration": 0.2
        },
        {
          "notes": [
            "C#5"
          ],
          "at": 0.16,
          "duration": 0.15
        },
        {
          "notes": [
            "E5"
          ],
          "at": 0.33,
          "duration": 0.15
        },
        {
          "notes": [
            "G#3",
            "G#5"
          ],
          "at": 0.5,
          "duration": 0.2
        },
        {
          "notes": [
            "E5"
          ],
          "at": 0.66,
          "duration": 0.15
        },
        {
          "notes": [
            "C#5"
          ],
          "at": 0.83,
          "duration": 0.15
        }
      ],
      "audioLabel": "Hear Chopin Fantaisie-Impromptu cross-rhythm"
    },
    "workedExample": {
      "title": "Mapping a Hemiola in 3/4 Time",
      "scenario": "Analyze two measures of 3/4 time moving toward a final cadence in Handel's Water Music.",
      "steps": [
        "Normally, two bars of 3/4 contain 6 quarter notes grouped: | 1-2-3 | 1-2-3 |.",
        "In a hemiola, the composer ties notes across the barline to regroup the 6 quarters into three groups of two: | 1-2 | 3-1 | 2-3 |.",
        "The perceived meter shifts temporarily from triple time to a grand, broadening duple feel."
      ],
      "conclusion": "The hemiola signals a major cadence arrival by temporarily expanding the metrical pulse.",
      "notation": {
        "clef": "treble",
        "timeSignature": "3/4",
        "chords": [
          {
            "keys": [
              "C4"
            ],
            "duration": "h"
          },
          {
            "keys": [
              "E4"
            ],
            "duration": "h"
          },
          {
            "keys": [
              "G4"
            ],
            "duration": "h"
          }
        ],
        "label": "Hemiola metric expansion",
        "caption": "Three half notes spanning two measures of 3/4."
      },
      "audioSteps": [
        {
          "notes": [
            "C4"
          ],
          "at": 0,
          "duration": 0.9
        },
        {
          "notes": [
            "E4"
          ],
          "at": 1,
          "duration": 0.9
        },
        {
          "notes": [
            "G4"
          ],
          "at": 2,
          "duration": 1.2
        }
      ],
      "audioLabel": "Hear Baroque Hemiola cadence effect"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "C3",
        "G3",
        "C4",
        "E4",
        "G4"
      ],
      "showLabels": true,
      "label": "Left hand vs. Right hand polyrhythmic independence",
      "caption": "Keep the left hand pulse steady while floating triplets across the right hand register."
    },
    "practicalApplication": "To practice polyrhythms away from your instrument, tap your left hand on your left knee and your right hand on your right knee. Repeat the speech phrase 'NOT dif-fi-CULT' until both hands move automatically.",
    "videoResource": {
      "title": "Open Yale Courses: Cross-Rhythms and African Roots",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-4",
      "embedPermitted": false,
      "notes": "Prof. Wright demonstrates polyrhythms in African drumming and Western classical counterpoint."
    },
    "references": [
      {
        "title": "Open Music Theory: Cross-Rhythm and Metric Dissonance",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Mathematical analysis of metric conflict, grouping dissonances, and hemiolas."
      },
      {
        "title": "Berklee Online: Advanced Rhythm and Polyrhythms",
        "authorOrInstitution": "Berklee College of Music",
        "url": "https://online.berklee.edu/free-music-course-handbooks",
        "licence": "Educational Handbook",
        "relevance": "Rhythmic independence and 3:4 coordination drills."
      }
    ],
    "practiceActivities": [
      {
        "id": "poly-q1",
        "prompt": "What is a hemiola?",
        "options": [
          {
            "id": "hemiola-def",
            "label": "A temporary metric re-grouping of two bars of triple time into three bars of duple time"
          },
          {
            "id": "wrong-1",
            "label": "A type of half cadence in minor keys"
          },
          {
            "id": "wrong-2",
            "label": "Playing four notes in the time of five"
          },
          {
            "id": "wrong-3",
            "label": "A Greek ancient scale mode"
          }
        ],
        "correctOptionId": "hemiola-def",
        "explanation": "A hemiola re-groups six beats across two bars of triple meter into three larger two-beat pulses, creating a powerful feeling of metric expansion before a cadence."
      }
    ],
    "summaryText": "Polyrhythms and cross-rhythms layer conflicting subdivisions across a single timeframe, generating unmatched rhythmic sophistication in classical masterworks and global music traditions.",
    "keyTakeaways": [
      "Two against three (2:3) subdivides into a 6-part grid: Together - Right - Left - Right.",
      "A hemiola re-articulates two bars of triple meter as three bars of duple meter.",
      "Master cross-rhythms through physical clapping and speech mnemonics before taking them to the instrument."
    ]
  },
  {
    "slug": "rhythmic-patterns",
    "title": "Rhythmic patterns",
    "summary": "Recognize common recurring beat-level cells (dotted-eighth + sixteenth, two sixteenths + eighth, ostinatos) at sight via clean beaming.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "rhythmic-patterns-and-sightreading",
    "level": "elementary",
    "estimatedMinutes": 8,
    "sortOrder": 10,
    "objectives": [
      "Read complete one-beat rhythmic cells visually as unified shapes rather than counting note-by-note.",
      "Compare two 16ths + 8th ('ti-ka-ti') vs. 8th + two 16ths ('ti-ti-ka') vs. dotted-8th + 16th.",
      "Follow clean metrical beaming showing where Beat 1, 2, 3, and 4 start."
    ],
    "sections": [
      {
        "id": "beat-cell-chunking",
        "heading": "1. Chunking one-beat rhythmic vocabulary",
        "body": [
          "Fluent score readers recognize rhythms in single-beat 'words'—much like reading whole English words instead of spelling each letter. Correct instrumental beaming binds each beat's eighth and sixteenth subdivisions neatly together so every beat boundary shines cleanly on the page.",
          "Memorize the core 1-beat family in 4/4: four sixteenths (1-e-and-a), eighth + two sixteenths (1 & a), two sixteenths + eighth (1 e &), and dotted eighth + sixteenth (1---a)."
        ],
        "notation": {
          "clef": "treble",
          "timeSignature": "2/4",
          "beamNotes": true,
          "chords": [
            {
              "keys": [
                "C5"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "16"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "16"
            },
            {
              "keys": [
                "F5"
              ],
              "duration": "16"
            },
            {
              "keys": [
                "E5"
              ],
              "duration": "16"
            },
            {
              "keys": [
                "D5"
              ],
              "duration": "8"
            }
          ],
          "label": "Beat 1 eighth plus two sixteenths, followed by Beat 2 two sixteenths plus eighth",
          "caption": "Two mirror 1-beat patterns: [8th + two 16ths] followed cleanly by [two 16ths + 8th]."
        },
        "audioSteps": [
          {
            "notes": [
              "C5"
            ],
            "at": 0,
            "duration": 0.25
          },
          {
            "notes": [
              "D5"
            ],
            "at": 0.26,
            "duration": 0.12
          },
          {
            "notes": [
              "E5"
            ],
            "at": 0.39,
            "duration": 0.12
          },
          {
            "notes": [
              "F5"
            ],
            "at": 0.52,
            "duration": 0.12
          },
          {
            "notes": [
              "E5"
            ],
            "at": 0.65,
            "duration": 0.12
          },
          {
            "notes": [
              "D5"
            ],
            "at": 0.78,
            "duration": 0.4
          }
        ],
        "audioLabel": "Hear contrasting 1-beat sixteenth cells"
      }
    ],
    "repertoireExample": {
      "composer": "Johann Sebastian Bach",
      "work": "Brandenburg Concerto No. 2 in F major, BWV 1047",
      "barReference": "I. Allegro, opening ritornello",
      "insight": "Baroque concertos turn just two one-beat rhythmic patterns—four sixteenths and an eighth plus two sixteenths—into an entire shimmering orchestral architecture.",
      "audioSteps": [
        {
          "notes": [
            "F4"
          ],
          "at": 0,
          "duration": 0.24
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.24,
          "duration": 0.12
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.36,
          "duration": 0.12
        },
        {
          "notes": [
            "Bb4"
          ],
          "at": 0.48,
          "duration": 0.12
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.6,
          "duration": 0.12
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.72,
          "duration": 0.12
        },
        {
          "notes": [
            "F4"
          ],
          "at": 0.84,
          "duration": 0.12
        },
        {
          "notes": [
            "C5"
          ],
          "at": 0.96,
          "duration": 0.48
        }
      ],
      "audioLabel": "Hear Baroque ritornello rhythmic cell drive"
    },
    "workedExample": {
      "title": "Verifying beat capacity of a 16th-note mix",
      "scenario": "Does [16th + 8th + 16th] fill one full quarter beat?",
      "steps": [
        "1st sixteenth = ¼ beat.",
        "Middle eighth = ½ beat (⅔ of remainder, two quarters).",
        "Final sixteenth = ¼ beat.",
        "Sum = ¼ + ½ + ¼ = 1 full quarter beat (the crisp 'syncopated' 1-beat cell!)."
      ],
      "conclusion": "Yes: 16th–8th–16th spans 1 quarter beat."
    },
    "practiceActivities": [
      {
        "id": "rpat-q1",
        "prompt": "Which combination correctly sums to ONE single quarter beat in 4/4?",
        "options": [
          {
            "id": "a",
            "label": "Two eighth notes + one sixteenth note"
          },
          {
            "id": "b",
            "label": "One dotted eighth note + one sixteenth note"
          },
          {
            "id": "c",
            "label": "One eighth note + three sixteenth notes"
          },
          {
            "id": "d",
            "label": "One quarter note + one sixteenth note"
          }
        ],
        "correctOptionId": "b",
        "explanation": "A dotted eighth (¾ beat) + a sixteenth (¼ beat) = 1.00 beat."
      }
    ],
    "summaryText": "Recognizing standard one-beat rhythmic cells visually makes complex passages as easy to scan as familiar spoken words.",
    "keyTakeaways": [
      "Read beamed beat groups as whole units rather than isolated stems.",
      "Common 1-beat totals: 4 sixteenths, 8th+2×16th, 2×16th+8th, dotted-8th+16th, 16th+8th+16th."
    ],
    "terminology": [
      {
        "term": "Rhythmic Pattern",
        "definition": "A characteristic recurring motif of durations that gives a musical style its unique signature."
      },
      {
        "term": "Habanera",
        "definition": "Dotted eighth + sixteenth + two eighth notes (popularized by Bizet's Carmen)."
      },
      {
        "term": "Waltz",
        "definition": "Strong downbeat quarter followed by two lighter buoyant quarters in 3/4 time."
      },
      {
        "term": "March",
        "definition": "Crisp, dotted rhythms and heavy duple beat accents."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "D3",
        "F4",
        "A4"
      ],
      "showLabels": true,
      "label": "Characteristic Habanera rhythm pattern (D-F-A)",
      "caption": "Syncopated Latin dance groove (dotted eighth - sixteenth - eighth - eighth)."
    },
    "practicalApplication": "Learn to recognize characteristic dance rhythms on sight. When you see a 3/4 bar with an accented beat 2, you are reading a Polish Mazurka; when you see a dotted bass rhythm in 2/4, you are reading a Habanera.",
    "videoResource": {
      "title": "Open Yale Courses: Dance Rhythms in Classical Masterworks",
      "publisher": "Yale University Department of Music (Prof. Craig Wright)",
      "url": "https://oyc.yale.edu/music/musi-112/lecture-4",
      "embedPermitted": false,
      "notes": "Prof. Wright traces Baroque dance suites, minuets, and 19th-century waltzes."
    },
    "references": [
      {
        "title": "Open Music Theory: Meter in Performance and Dance",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Historical dance meters and metric gesture."
      },
      {
        "title": "Harmony and Musicianship with Solfège: Rhythmic Idioms",
        "authorOrInstitution": "Los Angeles City College (Profs. Cser & Wanner)",
        "url": "https://www.lacc.edu/academics/programs/music/oer-textbook",
        "licence": "OER",
        "relevance": "Performance and dictation of characteristic rhythmic patterns."
      }
    ]
  },
  {
    "slug": "sight-reading",
    "title": "Sight reading methodology and visual chunking",
    "summary": "Develop professional sight-reading fluency through pre-scan protocols, interval pattern recognition, and forward visual tracking.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "rhythmic-patterns-and-sightreading",
    "level": "intermediate",
    "estimatedMinutes": 11,
    "sortOrder": 11,
    "objectives": [
      "Execute the 5-point Pre-Scan Protocol (Clef, Key, Meter, Tempo, Roadblocks) before touching an instrument.",
      "Recognize pitch and chord shapes through visual chunking rather than note-by-note decoding.",
      "Maintain steady forward tempo without stopping or correcting errors during sight-reading."
    ],
    "terminology": [
      {
        "term": "Sight Reading",
        "definition": "The ability to read and perform a musical score at first sight without prior rehearsal."
      },
      {
        "term": "Visual Chunking",
        "definition": "Recognizing groups of notes as single unified musical units (e.g. scales, triads, arpeggios) rather than isolated symbols."
      },
      {
        "term": "Eye-Hand Span",
        "definition": "The distance your eyes read ahead of the notes your hands are currently playing."
      },
      {
        "term": "Pre-Scan Protocol",
        "definition": "A disciplined 30-second silent mental audit of a piece prior to performance."
      }
    ],
    "sections": [
      {
        "id": "pre-scan-protocol",
        "heading": "1. The 30-Second Pre-Scan Protocol",
        "body": [
          "Sight-reading is 80% mental preparation and 20% execution. Amateur musicians make the mistake of playing immediately upon seeing new sheet music. Professional musicians never touch a key until they have completed a 30-second silent audit:",
          "1. Check the CLEF and KEY SIGNATURE (which notes are sharp or flat throughout?). 2. Check the TIME SIGNATURE and primary beat unit. 3. Scan for ROADBLOCKS (accidentals, ledger lines, rhythmic shifts). 4. Establish a conservative, steady tempo in your head."
        ],
        "notation": {
          "clef": "treble",
          "keySignature": "G",
          "timeSignature": "3/4",
          "chords": [
            {
              "keys": [
                "G4"
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
                "D5"
              ],
              "duration": "q"
            }
          ],
          "label": "Visual chunk: G Major triad in 3/4 meter",
          "caption": "Recognize this instantly as a single G-major harmonic unit rather than three disconnected notes."
        },
        "audioSteps": [
          {
            "notes": [
              "G4"
            ],
            "at": 0,
            "duration": 0.4
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.5,
            "duration": 0.4
          },
          {
            "notes": [
              "D5"
            ],
            "at": 1,
            "duration": 0.7
          }
        ],
        "audioLabel": "Hear G Major arpeggio visual chunk"
      }
    ],
    "repertoireExample": {
      "composer": "Muzio Clementi",
      "work": "Sonatina in C major, Op. 36 No. 1",
      "barReference": "Movement I, Spiritoso, bars 1–8",
      "insight": "Clementi's Sonatinas are ideal sight-reading material: the right hand outlines clear scalic and arpeggiated chunks while the left hand maintains a predictable Alberti bass pattern.",
      "audioSteps": [
        {
          "notes": [
            "C4",
            "C5"
          ],
          "at": 0,
          "duration": 0.4
        },
        {
          "notes": [
            "E4",
            "G4"
          ],
          "at": 0.25,
          "duration": 0.2
        },
        {
          "notes": [
            "G4",
            "C5"
          ],
          "at": 0.5,
          "duration": 0.4
        },
        {
          "notes": [
            "C4",
            "E5"
          ],
          "at": 0.75,
          "duration": 0.4
        }
      ],
      "audioLabel": "Hear Clementi Sonatina sight-reading passage"
    },
    "workedExample": {
      "title": "Applying Visual Chunking to an Unfamiliar Score",
      "scenario": "You encounter a measure containing four ascending notes: C4, E4, G4, C5.",
      "steps": [
        "Note-by-note approach: 'There is a C... then an E... then a G... then a high C.' (Slow and disjointed).",
        "Visual chunking approach: 'That is a root-position C Major arpeggio.' (Instant recognition as a single shape).",
        "Your hand immediately prepares the C-major finger shape, freeing your eyes to look ahead into the next measure."
      ],
      "conclusion": "Chunking transforms reading from decoding individual letters into reading whole words and sentences.",
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
              "E4"
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
              "C5"
            ],
            "duration": "q"
          }
        ],
        "label": "C Major arpeggiated chunk",
        "caption": "Read this as a single unified gesture."
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
            "E4"
          ],
          "at": 0.35,
          "duration": 0.35
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.7,
          "duration": 0.35
        },
        {
          "notes": [
            "C5"
          ],
          "at": 1.05,
          "duration": 0.7
        }
      ],
      "audioLabel": "Hear C Major arpeggiated chunk"
    },
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4",
        "C5"
      ],
      "showLabels": true,
      "label": "C Major hand shape",
      "caption": "Forming the physical chord shape in advance allows fluent sight reading without looking down at your hands."
    },
    "practicalApplication": "The Golden Rule of Sight Reading: NEVER STOP! When you play a wrong note, do not stop, gasp, or correct it. In real performance, time marches relentlessly forward. Keep playing the rhythm even if you drop a note.",
    "videoResource": {
      "title": "Berklee Online: Sight-Reading Strategies and Eye Movement",
      "publisher": "Berklee College of Music",
      "url": "https://online.berklee.edu/free-music-course-handbooks",
      "embedPermitted": false,
      "notes": "Berklee faculty lecture on visual chunking, peripheral vision, and sight-reading speed."
    },
    "references": [
      {
        "title": "Open Music Theory: Sight Reading and Musicianship",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Cognitive chunking, eye tracking, and pattern identification."
      },
      {
        "title": "Integrated Musicianship: Sight-Reading Protocol",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "Systematic sight-singing and sight-reading progressive exercises."
      }
    ],
    "practiceActivities": [
      {
        "id": "sight-reading-q1",
        "prompt": "What is the single most important rule when sight-reading in front of an ensemble?",
        "options": [
          {
            "id": "never-stop",
            "label": "Never stop or restart when you make a mistake; keep the rhythm moving forward"
          },
          {
            "id": "play-fast",
            "label": "Play as fast as possible to impress the listeners"
          },
          {
            "id": "correct-every-note",
            "label": "Stop immediately and replay every wrong note until it is perfect"
          },
          {
            "id": "memorize-first",
            "label": "Memorize the entire piece before playing measure 1"
          }
        ],
        "correctOptionId": "never-stop",
        "explanation": "Maintaining steady metric time is paramount in sight reading; stopping destroys the ensemble pulse, whereas an isolated wrong note in steady time is quickly forgotten."
      }
    ],
    "summaryText": "Sight-reading fluency is achieved through disciplined pre-scanning, visual chunking of scales and chords, and maintaining relentless forward motion without stopping for mistakes.",
    "keyTakeaways": [
      "Always take 30 seconds to silently pre-scan clef, key, time signature, and roadblocks.",
      "Chunk notes into recognized chord shapes and scales rather than reading individual symbols.",
      "Keep moving forward no matter what: rhythm and pulse always take precedence over error correction."
    ]
  },
  {
    "slug": "reading-musical-passages",
    "title": "Reading musical passages",
    "summary": "Synthesize clef, key signature, time signature, tonal contour, harmony, and rhythmic patterns in complete real-world musical sight-reading.",
    "learningPathSlug": "rhythm-and-musical-reading",
    "courseSlug": "rhythmic-nuance-and-passage-reading",
    "moduleSlug": "rhythmic-patterns-and-sightreading",
    "level": "elementary",
    "estimatedMinutes": 12,
    "sortOrder": 12,
    "objectives": [
      "Execute a disciplined four-point pre-scan (Clef → Key Signature → Time Signature → Starting/Ending Tonic).",
      "Spot embedded scales, arpeggios, and recurring motifs rather than reading isolated noteheads.",
      "Read ahead by half a bar while keeping a forgiving, unbroken tempo pulse."
    ],
    "sections": [
      {
        "id": "four-point-scan",
        "heading": "1. The pre-reading scan & pattern grouping",
        "body": [
          "True musical literacy unites everything studied across all four Theory Academy paths. Before sounding a single note, train the discipline of a 5-second scan: check CLEF, identify KEY SIGNATURE tonic (major or relative minor), lock in TIME SIGNATURE pulse (simple or compound), and scan the widest skips plus lowest/highest points.",
          "As you read, group notes into familiar theoretical blocks: 'Here sits a G major arpeggio ascending to B, followed by a stepwise diatonic descent over a dotted-quarter motif.' Reading intervals and chord outlines rather than spelling single letters one by one multiplies fluency tenfold!"
        ],
        "notation": {
          "clef": "treble",
          "keySignature": "G",
          "timeSignature": "4/4",
          "chords": [
            {
              "keys": [
                "G4"
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
                "D5"
              ],
              "duration": "qd"
            },
            {
              "keys": [
                "C5"
              ],
              "duration": "8"
            },
            {
              "keys": [
                "B4"
              ],
              "duration": "h"
            }
          ],
          "label": "Musical passage in G major, 4/4 time: rising G-B-D tonic triad then stepwise C5-B4 descent",
          "caption": "Complete passage check: Treble clef · 1 sharp (G major) · 4/4 meter · Tonic triad outline (G–B–D) into dotted lyrical resolution."
        },
        "audioSteps": [
          {
            "notes": [
              "G4"
            ],
            "at": 0,
            "duration": 0.4
          },
          {
            "notes": [
              "B4"
            ],
            "at": 0.42,
            "duration": 0.4
          },
          {
            "notes": [
              "D5"
            ],
            "at": 0.84,
            "duration": 0.65
          },
          {
            "notes": [
              "C5"
            ],
            "at": 1.52,
            "duration": 0.22
          },
          {
            "notes": [
              "B4"
            ],
            "at": 1.76,
            "duration": 0.9
          }
        ],
        "audioLabel": "Hear full passage synthesis in G major (4/4)"
      }
    ],
    "repertoireExample": {
      "composer": "Johann Sebastian Bach / Christian Petzold",
      "work": "Minuet in G major, BWV Anh. 114",
      "barReference": "Measures 1–8",
      "insight": "Every hallmark of complete reading appears in the opening four bars: Treble & Bass clefs, 1-sharp G major key signature, 3/4 triple lilt, opening 5th leap (D5 down to G4), and running stepwise eighths answering cleanly.",
      "audioSteps": [
        {
          "notes": [
            "D5"
          ],
          "at": 0,
          "duration": 0.42
        },
        {
          "notes": [
            "G4"
          ],
          "at": 0.44,
          "duration": 0.22
        },
        {
          "notes": [
            "A4"
          ],
          "at": 0.66,
          "duration": 0.22
        },
        {
          "notes": [
            "B4"
          ],
          "at": 0.88,
          "duration": 0.22
        },
        {
          "notes": [
            "C5"
          ],
          "at": 1.1,
          "duration": 0.22
        },
        {
          "notes": [
            "D5"
          ],
          "at": 1.32,
          "duration": 0.42
        },
        {
          "notes": [
            "G4"
          ],
          "at": 1.76,
          "duration": 0.42
        },
        {
          "notes": [
            "G4"
          ],
          "at": 2.2,
          "duration": 0.42
        }
      ],
      "audioLabel": "Hear Minuet in G major opening phrase"
    },
    "workedExample": {
      "title": "Pre-scanning an unfamiliar D major 6/8 passage",
      "scenario": "Walk systematically through the opening line of an unseen score before playing.",
      "steps": [
        "Clef: Treble clef → Line 2 is G4.",
        "Key Signature: Two sharps (F♯, C♯) → D Major (or B minor). Opening chord D–F♯–A confirms D Major.",
        "Time Signature: 6/8 → Two dotted-quarter beats per bar swinging in 3s.",
        "Pattern inspection: Bars 1–2 outline a rising D–F♯–A triad then step gently F♯–E–D."
      ],
      "conclusion": "By decoding theory patterns ahead of Beat 1, you read melodies cleanly on the very first pass."
    },
    "practiceActivities": [
      {
        "id": "readpass-q1",
        "prompt": "You open a score displaying Bass Clef, three flats (B♭, E♭, A♭), time signature 6/8, and an opening bass arpeggio E♭3–G3–B♭3. Which analytical reading summary is accurate?",
        "options": [
          {
            "id": "a",
            "label": "Key of A♭ major in 6 slow beats per measure"
          },
          {
            "id": "b",
            "label": "Key of E♭ major felt in 2 dotted-quarter beats per measure"
          },
          {
            "id": "c",
            "label": "Key of C minor felt in 3 simple quarter beats"
          },
          {
            "id": "d",
            "label": "Treble clef in E♭ major"
          }
        ],
        "correctOptionId": "b",
        "explanation": "Three flats (B♭, E♭, A♭) anchored by E♭–G–B♭ confirms E♭ major; 6/8 moves in 2 compound dotted-quarter beats per bar."
      }
    ],
    "summaryText": "Fluent passage reading combines instant pre-scanning (clef, key, meter) with pattern-level recognition of scales, intervals, chords, and beat cells.",
    "keyTakeaways": [
      "Always scan Clef → Key Signature → Time Signature → Tonal Landmarks before starting.",
      "Look for scales, triad outlines, and recurring 1-beat rhythmic cells rather than decoding isolated noteheads."
    ],
    "terminology": [
      {
        "term": "Score Reading",
        "definition": "The multi-layered cognitive skill of decoding pitch, meter, dynamics, and expression simultaneously in real time."
      },
      {
        "term": "Macro-Reading",
        "definition": "Reading full measure blocks and harmonic gestures rather than isolated individual notes."
      },
      {
        "term": "Expressive Inflection",
        "definition": "Applying phrasing, dynamics (piano to forte), and articulation (staccato, legato) to written notation."
      }
    ],
    "keyboardIllustration": {
      "highlightNotes": [
        "C4",
        "E4",
        "G4",
        "C5"
      ],
      "showLabels": true,
      "label": "Full score reading integration (C Major)",
      "caption": "Synthesizing pitch height, rhythmic values, and harmonic context into expressive performance."
    },
    "practicalApplication": "Keep your eyes moving one beat ahead of your hands. Reading music is like reading aloud from a book: you cannot read word-by-word; you must process entire grammatical phrases ahead of time.",
    "videoResource": {
      "title": "Juilliard Extension: Score Reading Masterclass",
      "publisher": "The Juilliard School",
      "url": "https://www.juilliard.edu/stage-beyond/juilliard-extension",
      "embedPermitted": false,
      "notes": "Conservatory lecture on real-time score reading and polyphonic music analysis."
    },
    "references": [
      {
        "title": "Open Music Theory: Score Analysis",
        "authorOrInstitution": "Open Music Theory (Version 2)",
        "url": "https://viva.pressbooks.pub/openmusictheory/",
        "licence": "CC BY-SA 4.0",
        "relevance": "Complete score navigation, system barlines, and rehearsal marks."
      },
      {
        "title": "Integrated Musicianship: Score Fluency",
        "authorOrInstitution": "University of Idaho (Dr. Sean Butterfield)",
        "url": "https://seanbutterfield.github.io/integratedmusicianship/",
        "licence": "OER",
        "relevance": "Advanced sight-reading and score-reading practice drills."
      }
    ]
  }
];

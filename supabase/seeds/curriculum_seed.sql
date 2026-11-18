-- ============================================================================
-- THEORYLAB Official Music Theory Curriculum Seed
-- Repeatable, duplicate-safe (idempotent) database seed script.
-- Generated: November 2026
-- Preserves all existing user records and student progress.
-- Sets all published units to status = 'published'.
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Seeding THEORYLAB Official Curriculum...';
END $$;

-- 1. Learning Paths (4 core paths)

INSERT INTO public.learning_paths (slug, numeral, title, summary, level, sort_order, status)
VALUES (
  'foundations-of-music',
  'I',
  'Foundations of Music',
  'Sound properties, pitch orientation, the musical alphabet, staves, clefs, ledger lines, and fundamental rhythmic meter.',
  'beginner'::public.theory_level,
  1,
  'published'::public.content_status
)
ON CONFLICT (slug) DO UPDATE SET
  numeral = EXCLUDED.numeral,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.learning_paths (slug, numeral, title, summary, level, sort_order, status)
VALUES (
  'scales-and-tonality',
  'II',
  'Scales and Tonality',
  'Construct major, natural, harmonic, and melodic minor scales, trace the circle of fifths, pair relative keys, and understand church modes.',
  'elementary'::public.theory_level,
  2,
  'published'::public.content_status
)
ON CONFLICT (slug) DO UPDATE SET
  numeral = EXCLUDED.numeral,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.learning_paths (slug, numeral, title, summary, level, sort_order, status)
VALUES (
  'intervals-and-harmony',
  'III',
  'Intervals and Harmony',
  'Measure and qualify intervals, hear consonance and dissonance, spell major/minor/diminished/augmented triads, invert chords, build seventh chords, and read Roman numeral progressions.',
  'intermediate'::public.theory_level,
  3,
  'published'::public.content_status
)
ON CONFLICT (slug) DO UPDATE SET
  numeral = EXCLUDED.numeral,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.learning_paths (slug, numeral, title, summary, level, sort_order, status)
VALUES (
  'rhythm-and-musical-reading',
  'IV',
  'Rhythm and Musical Reading',
  'Internalize beat and pulse, compare simple vs. compound meter, decode dotted notes, ties, rests, syncopation, and triplets, and read complete musical passages fluently.',
  'elementary'::public.theory_level,
  4,
  'published'::public.content_status
)
ON CONFLICT (slug) DO UPDATE SET
  numeral = EXCLUDED.numeral,
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

-- 2. Courses

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'foundations-pitch-and-literacy',
  'Sound, Pitch & Staff Literacy',
  'Connect physical acoustic vibration to the musical alphabet, tones and semitones, treble and bass staves, and ledger lines.',
  'beginner'::public.theory_level,
  1,
  85,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'foundations-of-music'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'foundations-notation-and-meter',
  'Reading Pitch & Basic Meter',
  'Read treble and bass lines and spaces fluently, control note and rest durations, and organize measures with simple time signatures.',
  'beginner'::public.theory_level,
  2,
  45,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'foundations-of-music'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'major-and-minor-scale-construction',
  'Major & Minor Scale Systems',
  'Build major and all three forms of the minor scale cleanly by semitone–tone formulas, and hear their distinct leading-tone pull.',
  'elementary'::public.theory_level,
  1,
  50,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'scales-and-tonality'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'key-signatures-and-modality',
  'Key Signatures, Circle of Fifths & Modes',
  'Read any sharp or flat key signature in seconds, navigate relative major/minor keys, and explore diatonic modes.',
  'elementary'::public.theory_level,
  2,
  45,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'scales-and-tonality'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'intervals-and-triads',
  'Intervals, Consonance & Triads',
  'Calculate generic and specific interval quality, classify consonance versus dissonance, and build all four root-position triad qualities.',
  'intermediate'::public.theory_level,
  1,
  60,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'intervals-and-harmony'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'inversions-sevenths-and-progressions',
  'Inversions, Seventh Chords & Functional Harmony',
  'Voice triad inversions smoothly with figured bass symbols, spell seventh chords, analyze progressions with Roman numerals, and resolve cadences.',
  'intermediate'::public.theory_level,
  2,
  55,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'intervals-and-harmony'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'pulse-simple-and-compound-meter',
  'Pulse, Simple & Compound Time',
  'Feel primary metric pulse and distinguish binary simple subdivisions (2/4, 3/4, 4/4) from dotted ternary compound subdivisions (6/8, 9/8, 12/8).',
  'elementary'::public.theory_level,
  1,
  35,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'rhythm-and-musical-reading'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.courses (learning_path_id, slug, title, description, level, sort_order, estimated_minutes, status)
SELECT
  p.id,
  'rhythmic-nuance-and-passage-reading',
  'Dotted Values, Syncopation, Triplets & Sight-Reading',
  'Master rhythmic nuance—dots, ties, syncopations, tuplets, and beaming patterns—and synthesize pitch and rhythm in complete musical passages.',
  'elementary'::public.theory_level,
  2,
  55,
  'published'::public.content_status
FROM public.learning_paths p
WHERE p.slug = 'rhythm-and-musical-reading'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  sort_order = EXCLUDED.sort_order,
  estimated_minutes = EXCLUDED.estimated_minutes,
  status = 'published'::public.content_status,
  updated_at = now();

-- 3. Course Modules

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'sound-pitch-and-alphabet',
  'Module 1 · Sound, Pitch & the Musical Alphabet',
  'How acoustic vibrations become named pitches and stepwise distances.',
  1,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'staves-clefs-and-ledgers',
  'Module 2 · The Musical Staff & Clefs',
  'Positioning pitch accurately across treble, bass, alto, and tenor staves.',
  2,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'basic-note-reading-and-meter',
  'Module 3 · Note Values, Rests & Basic Time',
  'Translating written shapes into measured time inside bars.',
  3,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'foundations-notation-and-meter'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'diatonic-scales-and-major',
  'Module 1 · Scale Degree Architecture & Major Scales',
  'How step patterns establish tonal centres.',
  1,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'three-forms-of-minor',
  'Module 2 · Natural, Harmonic & Melodic Minor',
  'Compare all three classic minor colorations in theory and sound.',
  2,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'keys-circle-and-modes',
  'Module 3 · Key Signatures, Relative Keys & Modes',
  'Map every key around the circle of fifths and derive the seven modes.',
  3,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'key-signatures-and-modality'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'intervals-and-acoustics',
  'Module 1 · Intervals & Acoustic Stability',
  'Generic size, semitone quality, inversion rules, and consonance.',
  1,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'intervals-and-triads'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'triads-and-voicing',
  'Module 2 · Four Triad Types & Inversions',
  'Major, minor, diminished, augmented triads and bass-line inversions.',
  2,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'intervals-and-triads'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'sevenths-and-tonal-syntax',
  'Module 3 · Seventh Chords & Roman Numeral Analysis',
  'From V7 resolutions and diatonic Roman numerals to common progressions.',
  3,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'inversions-sevenths-and-progressions'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'beat-and-metrical-division',
  'Module 1 · Pulse & Metric Classification',
  'Compare regular vs. triple beat subdivisions.',
  1,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'pulse-simple-and-compound-meter'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'dots-ties-and-cross-rhythm',
  'Module 2 · Dots, Ties, Syncopation & Triplets',
  'Modify note durations across beats and barlines.',
  2,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.course_modules (course_id, slug, title, summary, sort_order, status)
SELECT
  c.id,
  'rhythmic-patterns-and-sightreading',
  'Module 3 · Beaming & Reading Complete Passages',
  'Scan rhythm, key signature, clef, and phrase structure together.',
  3,
  'published'::public.content_status
FROM public.courses c
WHERE c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (course_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

-- 4. Lessons (46 certified units)

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'understanding-music-and-sound',
  'Understanding music and sound',
  'Explore the four physical dimensions of musical sound—pitch, duration, dynamics, and timbre—that notation captures.',
  '# Understanding music and sound

Explore the four physical dimensions of musical sound—pitch, duration, dynamics, and timbre—that notation captures.

## Learning Objectives

- Distinguish musical tone from unpitched noise using periodic acoustic vibration.
- Identify the four properties of every tone: pitch, duration, dynamics, and timbre.
- Hear how register and articulation alter musical expression without changing pitch names.

## Musical Terminology

- **Pitch**: The perceived highness or lowness of a sound determined by the frequency of acoustic vibration.
- **Duration**: The span of time across which a musical sound or silence is sustained.
- **Dynamics**: The loudness or softness of a sound, governed by physical vibration amplitude.
- **Timbre**: The distinct acoustic tone colour of an instrument or voice determined by its overtone spectrum.
- **Periodic Vibration**: Regular, repeating acoustic wave cycles that produce a focused, determinate pitch.

## 1. Periodic vibration vs. unpitched sound

Every sound begins with mechanical vibration travelling as pressure waves through air. When vibrations occur in steady, repeating cycles—such as a bowed violin string or plucked piano wire—the human ear hears a clear pitch.

Music shapes these tones alongside silence across time. Rather than leaving sound unstructured, classical notation organizes four dimensions simultaneously: how high or low a tone sounds (pitch), how long it lasts (duration), how loudly it speaks (dynamics), and what instrumental colour produces it (timbre).

## 2. The four dimensions of a musical event

Pitch positions a sound vertically from low to high. Duration governs whether the sound is brief, sustained, or followed by measured silence (a rest). Dynamics trace contrast from piano (soft) to forte (loud).

Timbre allows the same note A4 (440 Hz) played by a flute, oboe, or cello to remain unmistakably distinct because each instrument produces a unique recipe of upper overtones.

## Worked Example: Separating pitch from timbre and duration

Compare middle C held for two beats on piano with high C5 tapped briefly.
1. Note 1 has lower frequency (261.6 Hz) and longer duration (half note, 2 beats).
2. Note 2 doubles the vibration speed (523.3 Hz) for half the duration (quarter note, 1 beat).
3. Though both belong to pitch class C, they occupy different vertical staff positions and rhythmic lengths.
Pitch, duration, and timbre vary independently inside every bar of music.

## Practical Application

When warming up your voice or tuning an acoustic instrument, focus on the steady periodic core of the pitch before adjusting volume. Clean tone production requires acoustic stability.

## Summary

Musical tones arise from steady periodic vibration organized across pitch, duration, dynamics, and timbre.
',
  '{"sections":[{"id":"vibration-and-tone","notation":{"clef":"treble","chords":[{"keys":["C4"],"duration":"h"},{"keys":["G4"],"duration":"h"},{"keys":["C5"],"duration":"w"}],"label":"Three open sustained tones on middle C, G4, and treble C5","caption":"Listen to steady pitched tones rising from middle C4 to C5."}},{"id":"four-properties"}],"workedExample":{"clef":"treble","chords":[{"keys":["C4"],"duration":"h"},{"keys":["C5"],"duration":"q"}],"label":"Middle C half note followed by treble C quarter note","caption":"Lower C4 (half note) compared with higher C5 (quarter note)."},"practiceActivities":[{"id":"sound-q1","prompt":"Which property explains why a trumpet and a clarinet sound different even when both sustain A4 for four beats at forte?","options":[{"id":"pitch","label":"Pitch"},{"id":"timbre","label":"Timbre"},{"id":"meter","label":"Meter"},{"id":"rest","label":"Duration"}],"correctOptionId":"timbre","explanation":"Timbre (tone colour) arises from an instrument''s harmonic overtone spectrum while pitch (A4), duration (4 beats), and dynamics (forte) stay constant."}],"terminology":[{"term":"Pitch","definition":"The perceived highness or lowness of a sound determined by the frequency of acoustic vibration."},{"term":"Duration","definition":"The span of time across which a musical sound or silence is sustained."},{"term":"Dynamics","definition":"The loudness or softness of a sound, governed by physical vibration amplitude."},{"term":"Timbre","definition":"The distinct acoustic tone colour of an instrument or voice determined by its overtone spectrum."},{"term":"Periodic Vibration","definition":"Regular, repeating acoustic wave cycles that produce a focused, determinate pitch."}],"keyboardIllustration":{"highlightNotes":["C4","G4","C5"],"showLabels":true,"label":"Acoustic register illustration (C4 to C5)","caption":"Middle C (261.6 Hz) rising to G4 and C5 (523.3 Hz) spans the central vocal and instrumental range."},"practicalApplication":"When warming up your voice or tuning an acoustic instrument, focus on the steady periodic core of the pitch before adjusting volume. Clean tone production requires acoustic stability.","videoResource":{"title":"Open Yale Courses: Introduction to Instruments and Musical Tone","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-2","embedPermitted":false,"notes":"Prof. Craig Wright introduces the physics of acoustic sound, the overtone series, and orchestral timbre in MUSI 112 Lecture 2."},"references":[{"title":"Open Music Theory: Pitch and Sound Fundamentals","authorOrInstitution":"Dr. Mark Gotham et al., Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Defines the physical properties of musical tone and equal temperament pitch classes."},{"title":"Fundamentals of Music Theory: Sounds and Signals","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Acoustic vibration, frequency spectrum, and notation foundations."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["C4"],"at":0,"duration":1},{"notes":["C5"],"at":1.1,"duration":0.5}],"repertoireSteps":[{"notes":["G3"],"at":0,"duration":0.3},{"notes":["D4"],"at":0.28,"duration":0.3},{"notes":["B4"],"at":0.56,"duration":0.45},{"notes":["A4"],"at":1,"duration":0.3},{"notes":["B4"],"at":1.28,"duration":0.6}]}'::jsonb,
  8,
  1,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sound-pitch-and-alphabet' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'pitch-and-frequency',
  'Pitch and frequency',
  'Discover how frequency in Hertz determines pitch height and why doubling frequency produces an octave.',
  '# Pitch and frequency

Discover how frequency in Hertz determines pitch height and why doubling frequency produces an octave.

## Learning Objectives

- Relate high and low pitch sensation to acoustic frequency measured in Hertz (Hz).
- Recognize A4 = 440 Hz as the international concert tuning reference.
- Understand why a 2:1 frequency ratio sounds like the ''same'' note one octave higher.

## Musical Terminology

- **Frequency**: The number of complete acoustic vibration cycles per second, measured in Hertz (Hz).
- **Hertz (Hz)**: The standard international unit of frequency (1 Hz = 1 cycle per second).
- **Octave**: The acoustic interval between two pitches where the higher frequency is exactly double the lower.
- **Concert Pitch**: The universal reference tuning standard where A4 vibrates at exactly 440 Hz.

## 1. Frequency in Hertz

Frequency measures how many complete vibration cycles occur each second, expressed in Hertz (Hz). Faster vibration means higher pitch; slower vibration means lower pitch.

Modern ensembles tune to A above middle C at 440 Hz (written A4). One octave lower, A3 vibrates at exactly half the rate: 220 Hz. One octave higher, A5 vibrates twice as fast: 880 Hz.

## 2. Octave equivalence

When a higher wave completes exactly two cycles for every single cycle of a lower wave (a 2:1 ratio), their crests align continuously. Our ears perceive the two tones as belonging to the same pitch family—octave equivalence.

Middle C sits near 261.63 Hz; one octave higher (C5) vibrates near 523.25 Hz.

## Worked Example: Computing octave frequencies from A4 = 440 Hz

Find the frequencies of A3 and A2 descending from concert A4.
1. Start at A4 = 440 Hz.
2. Divide by 2 for one octave lower: A3 = 440 / 2 = 220 Hz.
3. Divide by 2 again for two octaves lower: A2 = 220 / 2 = 110 Hz.
Every octave shift multiplies or divides frequency by 2.

## Practical Application

When tuning strings or woodwinds to A4 = 440 Hz, listen for acoustic ''beating'' (interference pulses). As your instrument comes into exact tune, the beating slows down and completely disappears.

## Summary

Frequency (Hz) determines acoustic pitch height, with every doubling producing an octave.
',
  '{"sections":[{"id":"hertz-scale","notation":{"clef":"treble","chords":[{"keys":["A4"],"duration":"h"},{"keys":["A5"],"duration":"h"}],"label":"A4 (440 Hz) and A5 (880 Hz) an octave apart on treble staff","caption":"A4 (second space, 440 Hz) rising to A5 (ledger line above staff, 880 Hz)."}},{"id":"octave-equivalence"}],"practiceActivities":[{"id":"freq-q1","prompt":"If E4 vibrates at approximately 330 Hz, what is the approximate frequency of E5 one octave above?","options":[{"id":"165","label":"165 Hz"},{"id":"440","label":"440 Hz"},{"id":"660","label":"660 Hz"},{"id":"990","label":"990 Hz"}],"correctOptionId":"660","explanation":"Moving up one octave doubles the frequency: 330 Hz × 2 = 660 Hz."}],"terminology":[{"term":"Frequency","definition":"The number of complete acoustic vibration cycles per second, measured in Hertz (Hz)."},{"term":"Hertz (Hz)","definition":"The standard international unit of frequency (1 Hz = 1 cycle per second)."},{"term":"Octave","definition":"The acoustic interval between two pitches where the higher frequency is exactly double the lower."},{"term":"Concert Pitch","definition":"The universal reference tuning standard where A4 vibrates at exactly 440 Hz."}],"keyboardIllustration":{"highlightNotes":["A3","A4","A5"],"showLabels":true,"label":"Concert A octave series (220 Hz, 440 Hz, 880 Hz)","caption":"Each ascending octave doubles the acoustic frequency: A3 (220 Hz) to A4 (440 Hz) to A5 (880 Hz)."},"practicalApplication":"When tuning strings or woodwinds to A4 = 440 Hz, listen for acoustic ''beating'' (interference pulses). As your instrument comes into exact tune, the beating slows down and completely disappears.","videoResource":{"title":"Open Yale Courses: Melody and Pitch Registers","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-5","embedPermitted":false,"notes":"MUSI 112 Lecture 5 explores pitch frequency, register contours, and vocal ranges."},"references":[{"title":"Open Music Theory: Pitch Class and Octave Equivalence","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Examines mathematical frequency ratios and 12-tone equal temperament."},{"title":"Integrated Musicianship: Pitch Perception","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Vocal and instrumental frequency matching and ear training exercises."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["A3","A4"],"at":0,"duration":1},{"notes":["A4","E5"],"at":1.1,"duration":1.2}]}'::jsonb,
  9,
  2,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sound-pitch-and-alphabet' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'musical-alphabet',
  'Musical alphabet',
  'Master the seven rotating letter names A–G, octave register numbers, and Middle C as the central keyboard landmark.',
  '# Musical alphabet

Master the seven rotating letter names A–G, octave register numbers, and Middle C as the central keyboard landmark.

## Learning Objectives

- Recite the seven-letter musical alphabet forward and backward without hesitation.
- Locate white keys on the keyboard using groups of two and three black keys.
- Understand scientific pitch notation (C4 for middle C, G4, C5).

## Musical Terminology

- **Musical Alphabet**: The seven letter names (A, B, C, D, E, F, G) used to name natural pitch classes.
- **Pitch Class**: All notes sharing the same letter name across all octaves (e.g. all Cs across the piano).
- **Diatonic Step**: Motion from one letter name directly to the adjacent letter in the musical alphabet.

## 1. Seven repeating letters: A through G

Western music uses only the first seven letters of the alphabet: A, B, C, D, E, F, G. Stepping upward past G cycles straight back to A; stepping downward below A cycles back to G.

Because black keys on a piano appear in repeating groups of two and three, visual navigation is immediate: C always sits just to the left of any group of two black keys, while F sits just to the left of any group of three black keys.

## 2. Octave register numbers & Middle C

To distinguish every C on an 88-key piano, musicians attach an octave number that increments on every C: middle C is C4, followed upward by D4, E4, F4, G4, A4, B4, and then C5.

Directly below C4 sits B3, then A3, G3, down into the bass register.

## Worked Example: Counting backward across the G/A boundary

Find the pitch three natural steps below B4.
1. Start at B4.
2. Step 1 down: A4. Step 2 down: G4 (crossing down from A4 to G4).
3. Step 3 down: F4.
Three letter steps below B4 lands on F4.

## Practical Application

Practice reciting the alphabet backwards (G–F–E–D–C–B–A) with the same effortless speed as forwards. Fluid downward reading on the staff depends entirely on rapid backward letter navigation.

## Summary

All pitched Western music cycles infinitely across seven letters (A–G), indexed by register numbers starting on C.
',
  '{"sections":[{"id":"seven-letters","notation":{"clef":"treble","chords":[{"keys":["C4"],"duration":"q"},{"keys":["D4"],"duration":"q"},{"keys":["E4"],"duration":"q"},{"keys":["F4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["C5"],"duration":"q"}],"label":"Natural letters from C4 through C5 ascending on treble staff","caption":"Seven distinct letter names completing their cycle back at C5."}},{"id":"octave-numbers"}],"practiceActivities":[{"id":"alphabet-q1","prompt":"What note lies immediately below middle C (C4)?","options":[{"id":"b3","label":"B3"},{"id":"b4","label":"B4"},{"id":"d4","label":"D4"},{"id":"a3","label":"A3"}],"correctOptionId":"b3","explanation":"Because octave numbers change at C, the letter step just beneath C4 wraps back to G–A–B in octave 3: B3."}],"terminology":[{"term":"Musical Alphabet","definition":"The seven letter names (A, B, C, D, E, F, G) used to name natural pitch classes."},{"term":"Pitch Class","definition":"All notes sharing the same letter name across all octaves (e.g. all Cs across the piano)."},{"term":"Diatonic Step","definition":"Motion from one letter name directly to the adjacent letter in the musical alphabet."}],"keyboardIllustration":{"highlightNotes":["C4","D4","E4","F4","G4","A4","B4"],"showLabels":true,"label":"The seven white-key pitch classes (C to B)","caption":"The white keys of the piano map directly to the seven letters of the musical alphabet."},"practicalApplication":"Practice reciting the alphabet backwards (G–F–E–D–C–B–A) with the same effortless speed as forwards. Fluid downward reading on the staff depends entirely on rapid backward letter navigation.","videoResource":{"title":"Fundamentals of Music Theory: Note Names and Alphabet","publisher":"University of Edinburgh (Coursera MOOC)","url":"https://www.coursera.org/learn/edinburgh-music-theory","embedPermitted":false,"notes":"Introductory module covering letter names, keyboard topography, and cyclic note ordering."},"references":[{"title":"Open Music Theory: The Keyboard and Pitch","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Keyboard spatial layout and natural pitch alphabet correlation."},{"title":"Harmony and Musicianship with Solfège","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Alphabet letter names paired with fixed and movable solfege syllables."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C5"],"at":0,"duration":0.6},{"notes":["E5"],"at":0.62,"duration":0.32},{"notes":["G5"],"at":0.96,"duration":0.32},{"notes":["B4"],"at":1.3,"duration":0.45},{"notes":["C5"],"at":1.78,"duration":0.28},{"notes":["D5"],"at":2.08,"duration":0.28},{"notes":["C5"],"at":2.38,"duration":0.65}]}'::jsonb,
  8,
  3,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sound-pitch-and-alphabet' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'tones-and-semitones',
  'Tones and semitones',
  'Learn how semitones (half steps) and whole tones combine with sharps, flats, and naturals to span all twelve chromatic pitches.',
  '# Tones and semitones

Learn how semitones (half steps) and whole tones combine with sharps, flats, and naturals to span all twelve chromatic pitches.

## Learning Objectives

- Identify natural semitones (E–F and B–C) without black keys between them.
- Distinguish semitones (1 key step) from whole tones (2 semitones).
- Apply sharps (#), flats (b), and naturals to name altered keyboard pitches.

## Musical Terminology

- **Semitone (Half Step)**: The smallest interval in standard Western music; the distance between any key and its immediate neighbor.
- **Whole Tone (Whole Step)**: An interval equal to two semitones (e.g., C to D or E to F#).
- **Accidental**: A symbol (sharp, flat, natural) modifying a pitch by a semitone.
- **Enharmonic Equivalence**: Two distinct note spellings that sound identical in equal temperament (e.g., C# and Db).

## 1. The semitone and the whole tone

A semitone (or half step) is the closest pitch distance on the standard piano keyboard—moving from any key directly to its nearest neighbour, whether white or black. A whole tone equals two semitones combined.

Notice carefully that white keys do NOT all lie a whole tone apart: between E and F, and between B and C, there is no black key in between, forming two natural semitone pairs.

## 2. Accidentals and enharmonic equivalents

A sharp (♯) raises a pitch by one semitone; a flat (♭) lowers a pitch by one semitone; a natural (♮) cancels a prior accidental.

Because the black key above F sits one semitone below G, it can be spelled either F♯ or G♭—two spellings sharing the same piano key, known as enharmonic equivalents.

## Worked Example: Building whole tones across black and white keys

Find the pitch one whole tone above E4.
1. Start on E4.
2. Move up 1 semitone (first step): land on F4 (natural semitone, no black key).
3. Move up 1 more semitone (second step): land on F♯4.
One whole tone above E4 is F♯4 (enharmonic with G♭4).

## Practical Application

Memorize the two natural semitone pairs: E–F and B–C. Every other adjacent white-key pair (C–D, D–E, F–G, G–A, A–B) is separated by a black key and forms a whole tone.

## Summary

Semitones and whole tones measure exact keyboard steps, while sharps and flats name the black keys and altered degrees.
',
  '{"sections":[{"id":"semitone-and-tone","notation":{"clef":"treble","chords":[{"keys":["C4"],"duration":"q"},{"keys":["C#4"],"duration":"q"},{"keys":["D4"],"duration":"q"},{"keys":["E4"],"duration":"q"},{"keys":["F4"],"duration":"q"}],"label":"Semitone C to C-sharp, whole tone C to D, natural semitone E to F","caption":"C–C♯ (semitone), C–D (tone), and E–F (natural semitone with no black key)."}},{"id":"accidentals-and-enharmonics"}],"practiceActivities":[{"id":"tones-q1","prompt":"Which pair of natural white keys spans only one semitone?","options":[{"id":"cd","label":"C to D"},{"id":"fg","label":"F to G"},{"id":"bc","label":"B to C"},{"id":"ab","label":"A to B"}],"correctOptionId":"bc","explanation":"Only E–F and B–C have no black key between them, so B to C is 1 semitone."}],"terminology":[{"term":"Semitone (Half Step)","definition":"The smallest interval in standard Western music; the distance between any key and its immediate neighbor."},{"term":"Whole Tone (Whole Step)","definition":"An interval equal to two semitones (e.g., C to D or E to F#)."},{"term":"Accidental","definition":"A symbol (sharp, flat, natural) modifying a pitch by a semitone."},{"term":"Enharmonic Equivalence","definition":"Two distinct note spellings that sound identical in equal temperament (e.g., C# and Db)."}],"keyboardIllustration":{"highlightNotes":["E4","F4","B4","C5"],"showLabels":true,"label":"Natural semitone pairs (E–F and B–C)","caption":"Observe that E–F and B–C have no black keys between them; they form natural semitones."},"practicalApplication":"Memorize the two natural semitone pairs: E–F and B–C. Every other adjacent white-key pair (C–D, D–E, F–G, G–A, A–B) is separated by a black key and forms a whole tone.","videoResource":{"title":"Introduction to Music Theory: Whole and Half Steps","publisher":"Berklee College of Music (BerkleeX)","url":"https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory","embedPermitted":false,"notes":"Prof. George W. Russell Jr. explains whole steps, half steps, and keyboard accidentals."},"references":[{"title":"Open Music Theory: Half Steps, Whole Steps, and Accidentals","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Chromatic alterations, enharmonic spellings, and interval step sizes."},{"title":"Musictheory.net: Steps and Accidentals","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/20","licence":"Free Web Educational Access","relevance":"Interactive keyboard visualization of chromatic alterations."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["E5"],"at":0,"duration":0.25},{"notes":["D#5"],"at":0.25,"duration":0.25},{"notes":["E5"],"at":0.5,"duration":0.25},{"notes":["D#5"],"at":0.75,"duration":0.25},{"notes":["E5"],"at":1,"duration":0.25},{"notes":["B4"],"at":1.25,"duration":0.25},{"notes":["D5"],"at":1.5,"duration":0.25},{"notes":["C5"],"at":1.75,"duration":0.25},{"notes":["A4"],"at":2,"duration":0.7}]}'::jsonb,
  10,
  4,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sound-pitch-and-alphabet' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'the-musical-staff',
  'The musical staff',
  'Understand the five-line, four-space grid that turns vertical motion into visual pitch Contour.',
  '# The musical staff

Understand the five-line, four-space grid that turns vertical motion into visual pitch Contour.

## Learning Objectives

- Count the five lines and four spaces consistently from bottom to top.
- Read alternating line–space–line–space stepwise motion directly as musical alphabet steps.
- Distinguish steps from skips on the stave without hesitation.

## Musical Terminology

- **Staff (Stave)**: A framework of five horizontal lines and four intervening spaces upon which musical notes are written.
- **Measure (Bar)**: A metrical unit of time bounded by vertical barlines.
- **Barline**: A vertical line drawn across the staff dividing music into measures.
- **Double Barline**: Two adjacent vertical lines indicating the end of a musical section or piece.

## 1. Bottom-to-top numbering

The modern musical staff contains five parallel horizontal lines with four spaces enclosed between them. Musicians always count both lines and spaces from the bottom upward: bottom line = Line 1; top line = Line 5.

Moving from any line up into the space just above raises pitch by one alphabetical letter step (e.g., G to A). Skipping from one line directly to the next line jumps over the intervening space—producing a melodic third.

## Worked Example: Reading visual interval motion

Compare moving from Line 1 to Space 1 versus Line 1 to Line 2.
1. Line 1 to Space 1 moves one single vertical position: one letter step (e.g. E4 → F4).
2. Line 1 to Line 2 crosses Space 1: a skip of a third (e.g. E4 → G4).
Alternating line–space equals a step; line–line or space–space equals a skip (odd-numbered interval).

## Practical Application

Treat the staff as a continuous height map: higher positions always sound higher in pitch. Always check the clef before reading note positions.

## Summary

The five-line, four-space staff converts vertical spacing directly into stepwise pitch contour from bottom to top.
',
  '{"sections":[{"id":"five-lines-four-spaces","notation":{"clef":"treble","chords":[{"keys":["E4"],"duration":"q"},{"keys":["F4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"}],"label":"Alternating line and space notes moving upward on the treble staff","caption":"Line 1 (E4) → Space 1 (F4) → Line 2 (G4) → Space 2 (A4) → Line 3 (B4)."}}],"practiceActivities":[{"id":"staff-q1","prompt":"If a note head sits directly on Line 2 and moves upward to Line 3 without stopping in the space between, how many letter names did it span?","options":[{"id":"step","label":"A step (2nd)"},{"id":"skip3","label":"A skip of a 3rd"},{"id":"fifth","label":"A fifth"},{"id":"unison","label":"Unison"}],"correctOptionId":"skip3","explanation":"Moving from line to adjacent line passes over the space between them, spanning two letter steps (e.g., G to B = a 3rd)."}],"terminology":[{"term":"Staff (Stave)","definition":"A framework of five horizontal lines and four intervening spaces upon which musical notes are written."},{"term":"Measure (Bar)","definition":"A metrical unit of time bounded by vertical barlines."},{"term":"Barline","definition":"A vertical line drawn across the staff dividing music into measures."},{"term":"Double Barline","definition":"Two adjacent vertical lines indicating the end of a musical section or piece."}],"keyboardIllustration":{"highlightNotes":["E4","G4","B4","D5","F5"],"showLabels":true,"label":"Treble staff line pitches (E4–G4–B4–D5–F5)","caption":"The five lines of the treble staff correspond to alternating white keys rising from E4 to F5."},"practicalApplication":"Treat the staff as a continuous height map: higher positions always sound higher in pitch. Always check the clef before reading note positions.","videoResource":{"title":"Fundamentals of Music Theory: The Musical Stave","publisher":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","embedPermitted":false,"notes":"University of Edinburgh open e-textbook video module on staff structure and barline notation."},"references":[{"title":"Open Music Theory: The Staff, Clefs, and Ledger Lines","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Standard five-line staff structure and notation conventions."},{"title":"Teoria.com: Reading Staff Lines and Spaces","authorOrInstitution":"José Rodríguez Alvira","url":"https://www.teoria.com/","licence":"Free Educational Web Resource","relevance":"Interactive drills for staff lines and spaces."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4"],"at":0,"duration":0.25},{"notes":["D4"],"at":0.25,"duration":0.25},{"notes":["E4"],"at":0.5,"duration":0.25},{"notes":["F4"],"at":0.75,"duration":0.25},{"notes":["D4"],"at":1,"duration":0.25},{"notes":["E4"],"at":1.25,"duration":0.25},{"notes":["C4"],"at":1.5,"duration":0.6}]}'::jsonb,
  7,
  5,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'staves-clefs-and-ledgers' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'treble-bass-and-other-clefs',
  'Treble, bass and other clefs',
  'Master how the G clef (treble), F clef (bass), and C clefs (alto/tenor) anchor exact pitches to specific staff lines.',
  '# Treble, bass and other clefs

Master how the G clef (treble), F clef (bass), and C clefs (alto/tenor) anchor exact pitches to specific staff lines.

## Learning Objectives

- Identify the treble clef as a G clef locking Line 2 to G4.
- Identify the bass clef as an F clef locking Line 4 to F3.
- Understand C clefs (alto on Line 3, tenor on Line 4) and the grand staff.

## Musical Terminology

- **Treble Clef (G-Clef)**: A clef whose spiral curls around the second line of the staff, fixing it as G4.
- **Bass Clef (F-Clef)**: A clef whose two dots flank the fourth line of the staff, fixing it as F3.
- **C-Clef (Alto/Tenor)**: A movable clef whose indentation marks Middle C (C4), used by viola, cello, and bassoon.
- **Grand Staff**: A combination of treble and bass staves braced together and linked by Middle C.

## 1. Treble (G) clef and Bass (F) clef

The treble clef grew historically out of an ornamental letter G whose inner spiral curls directly around Line 2—fixing that line forever as G4 above middle C.

The bass clef evolved from an F whose two dots straddle Line 4—fixing Line 4 as F3 below middle C. Piano music links one treble staff above one bass staff with a curly brace to form the Grand Staff, with middle C hovering centrally between them.

## 2. Alto and Tenor C clefs

The movable C clef centres on whichever line falls squarely inside its double curve, anchoring that line to Middle C (C4).

In Alto clef (standard for viola), Middle C sits on Line 3. In Tenor clef (used for upper cello, bassoon, and trombone registers), Middle C sits on Line 4.

## Worked Example: Locating F3 in Bass Clef and C4 in Alto Clef

Determine the line pitches without relying on rote mnemonics alone.
1. In Bass clef, look at the two dots around Line 4: Line 4 is F3.
2. Walk upward from Line 4 (F3): Space 4 is G3, Line 5 is A3, space above is B3, first ledger line is Middle C (C4).
3. In Alto clef, Line 3—where the clef pinch points—is already C4.
Every clef defines a single immovable reference pitch from which all other notes derive alphabetically.

## Practical Application

Anchor your reading to three reference notes: G4 (treble line 2), F3 (bass line 4), and C4 (middle ledger line). This triangle of landmarks eliminates confusion when switching clefs.

## Summary

Clefs lock a reference pitch—G4 (Treble), F3 (Bass), or C4 (Alto/Tenor)—so instrumentalists read within their comfortable range.
',
  '{"sections":[{"id":"g-and-f-clefs","notation":{"clef":"bass","chords":[{"keys":["F3"],"duration":"h"},{"keys":["A3"],"duration":"q"},{"keys":["C4"],"duration":"h"}],"label":"Bass clef showing Line 4 (F3), Top line (A3), and Middle C above","caption":"Bass (F) clef fixing Line 4 at F3, rising to top line A3 and ledger-line Middle C."}},{"id":"alto-and-tenor-clefs","notation":{"clef":"alto","chords":[{"keys":["C4"],"duration":"h"},{"keys":["D4"],"duration":"q"},{"keys":["E4"],"duration":"q"}],"label":"Alto clef placing Middle C directly on Line 3","caption":"Alto C clef: Middle C sits cleanly in the middle line (Line 3)."}}],"practiceActivities":[{"id":"clefs-q1","prompt":"Which clef fixes Line 4 of the staff to the pitch F3 (below middle C)?","options":[{"id":"treble","label":"Treble clef"},{"id":"bass","label":"Bass clef"},{"id":"alto","label":"Alto clef"},{"id":"tenor","label":"Tenor clef"}],"correctOptionId":"bass","explanation":"The bass (F) clef places its two dots on either side of Line 4, anchoring F3 to that line."}],"terminology":[{"term":"Treble Clef (G-Clef)","definition":"A clef whose spiral curls around the second line of the staff, fixing it as G4."},{"term":"Bass Clef (F-Clef)","definition":"A clef whose two dots flank the fourth line of the staff, fixing it as F3."},{"term":"C-Clef (Alto/Tenor)","definition":"A movable clef whose indentation marks Middle C (C4), used by viola, cello, and bassoon."},{"term":"Grand Staff","definition":"A combination of treble and bass staves braced together and linked by Middle C."}],"keyboardIllustration":{"highlightNotes":["C4"],"showLabels":true,"label":"Middle C (C4) as Grand Staff nexus","caption":"Middle C connects the bass and treble staves, sitting on one ledger line between them."},"practicalApplication":"Anchor your reading to three reference notes: G4 (treble line 2), F3 (bass line 4), and C4 (middle ledger line). This triangle of landmarks eliminates confusion when switching clefs.","videoResource":{"title":"Open Yale Courses: Clefs and the Grand Staff","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-5","embedPermitted":false,"notes":"Prof. Wright explains the historical origin of clefs from Gothic letters G and F."},"references":[{"title":"Open Music Theory: Clefs","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Full historical and functional taxonomy of treble, bass, alto, and tenor clefs."},{"title":"Juilliard Extension: Elements of Music Theory","authorOrInstitution":"The Juilliard School","url":"https://www.juilliard.edu/stage-beyond/juilliard-extension","licence":"Proprietary Institutional Curriculum","relevance":"Conservatory syllabus for grand staff fluency and orchestral score reading."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["Bb3"],"at":0,"duration":0.45},{"notes":["D4"],"at":0.45,"duration":0.45},{"notes":["F4"],"at":0.9,"duration":0.6}]}'::jsonb,
  10,
  6,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'staves-clefs-and-ledgers' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'ledger-lines',
  'Ledger lines',
  'Read notes extended above or below any staff cleanly using temporary ledger lines without losing alphabetical orientation.',
  '# Ledger lines

Read notes extended above or below any staff cleanly using temporary ledger lines without losing alphabetical orientation.

## Learning Objectives

- Understand ledger lines as brief horizontal extensions strictly for notes outside the five staff lines.
- Read Middle C (C4) and A5 immediately on treble ledger lines.
- Count outward alphabetically from the top (F5/A3) or bottom (E4/G2) line without guessing.

## Musical Terminology

- **Ledger Line**: A short horizontal line drawn above or below the staff to extend its pitch range.
- **Register Extension**: Notating notes beyond the five lines of the staff without changing clefs.
- **Middle C Ledger Line**: The central ledger line shared between treble (one line below) and bass (one line above).

## 1. Temporary extensions beyond Line 1 and Line 5

Melodies frequently rise above F5 or dip below E4 in treble clef. Rather than adding permanent lines that would blur the eye, notation draws short horizontal ledger lines strictly beneath or through each out-of-range notehead.

Middle C (C4) on the treble staff is the most famous ledger line note: D4 hangs immediately below Line 1 (E4), and C4 sits squarely on the first lower ledger line.

## Worked Example: Identifying two ledger lines below treble clef

Name the note sitting directly on the second ledger line below treble Line 1 (E4).
1. Line 1 = E4.
2. Space below Line 1 = D4.
3. 1st ledger line = C4 (Middle C).
4. Space below 1st ledger line = B3.
5. 2nd ledger line = A3.
The second ledger line below treble clef is A3.

## Practical Application

When reading ledger lines, count by alternating lines and spaces just like on the main staff: from Line 5 (F5), the space above is G5, the first ledger line is A5, space above is B5, and second ledger line is C6.

## Summary

Ledger lines preserve alphabetical line-space alternation above Line 5 and below Line 1 using C4 and A5 as quick anchors.
',
  '{"sections":[{"id":"how-ledgers-work","notation":{"clef":"treble","chords":[{"keys":["A3"],"duration":"q"},{"keys":["B3"],"duration":"q"},{"keys":["C4"],"duration":"h"},{"keys":["G5"],"duration":"q"},{"keys":["A5"],"duration":"h"}],"label":"Lower ledger notes A3, B3, C4 and upper ledger notes G5, A5 on treble staff","caption":"Lower ledgers below treble staff (A3, B3, C4) and upper space/ledger above F5 (G5, A5)."}}],"practiceActivities":[{"id":"ledger-q1","prompt":"What pitch sits on the first ledger line directly above treble Line 5 (F5)?","options":[{"id":"g5","label":"G5"},{"id":"a5","label":"A5"},{"id":"b5","label":"B5"},{"id":"c6","label":"C6"}],"correctOptionId":"a5","explanation":"Treble Line 5 is F5; the space sitting atop Line 5 is G5, placing the first ledger line at A5."}],"terminology":[{"term":"Ledger Line","definition":"A short horizontal line drawn above or below the staff to extend its pitch range."},{"term":"Register Extension","definition":"Notating notes beyond the five lines of the staff without changing clefs."},{"term":"Middle C Ledger Line","definition":"The central ledger line shared between treble (one line below) and bass (one line above)."}],"keyboardIllustration":{"highlightNotes":["C4","A5","C6"],"showLabels":true,"label":"Treble high register extension notes","caption":"Ledger lines extend the staff smoothly into the high register (A5 on line 1 above, C6 on line 2 above)."},"practicalApplication":"When reading ledger lines, count by alternating lines and spaces just like on the main staff: from Line 5 (F5), the space above is G5, the first ledger line is A5, space above is B5, and second ledger line is C6.","videoResource":{"title":"Fundamentals of Music Theory: Ledger Lines and Registers","publisher":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","embedPermitted":false,"notes":"Instructional video on ledger line reading and register continuity across instruments."},"references":[{"title":"Open Music Theory: The Staff, Clefs, and Ledger Lines","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Systematic rules for engraving and reading notes on ledger lines."},{"title":"Musictheory.net: Ledger Lines","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/11","licence":"Free Web Educational Access","relevance":"Interactive drills for rapid identification of ledger line notes."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["G5"],"at":0,"duration":0.35},{"notes":["A5"],"at":0.38,"duration":0.35},{"notes":["C6"],"at":0.76,"duration":0.8}]}'::jsonb,
  8,
  7,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'staves-clefs-and-ledgers' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'note-names-and-positions',
  'Note names and positions',
  'Build rapid sight-reading landmarks across every line and space of treble and bass staves without slow mnemonic counting.',
  '# Note names and positions

Build rapid sight-reading landmarks across every line and space of treble and bass staves without slow mnemonic counting.

## Learning Objectives

- Name all five lines (E–G–B–D–F) and four spaces (F–A–C–E) on the treble staff rapidly.
- Name all five lines (G–B–D–F–A) and four spaces (A–C–E–G) on the bass staff.
- Apply symmetric landmark pairs (C3, Middle C, C5; Bass F3, Treble G4) to speed up reading.

## Musical Terminology

- **Guide Notes (Landmarks)**: Easily memorized anchor notes (e.g. C4, G4, F3) used to quickly calculate nearby pitches.
- **Space Notes**: Notes positioned between two staff lines (Treble: F-A-C-E; Bass: A-C-E-G).
- **Line Notes**: Notes through which a staff line passes (Treble: E-G-B-D-F; Bass: G-B-D-F-A).

## 1. Treble spaces and lines

On the treble staff, the four spaces from bottom to top spell F–A–C–E (F4, A4, C5, E5), while the five lines read E–G–B–D–F (E4, G4, B4, D5, F5).

Notice the open symmetry: G4 (treble Line 2) and C5 (treble Space 3) together with Middle C4 and top F5 form fast visual guideposts so you rarely have to count from bottom Line 1.

## 2. Bass spaces and lines

On the bass staff, the five lines from bottom to top are G2–B2–D3–F3–A3, and the four spaces are A2–C3–E3–G3.

Think symmetrically with C as your anchor: Bass Space 2 is Bass C (C3), one octave below Middle C4; Treble Space 3 is Treble C (C5), one octave above Middle C4!

## Worked Example: Recognizing symmetric C landmarks on the Grand Staff

Locate C3, C4, and C5 instantly without counting lines.
1. C3 (Bass C): Space 2 in Bass clef.
2. C4 (Middle C): Ledger line strictly between Bass and Treble staves.
3. C5 (Treble C): Space 3 in Treble clef.
All surrounding notes lie within one step or skip of these fixed C anchors.

## Practical Application

Ditch mnemonic phrases like ''Every Good Boy Does Fine'' as soon as possible. Professional musicians read by intervals (distance between notes) anchored by landmark guide notes.

## Summary

Pairing landmark C''s (C3, C4, C5) with clef lines (F3, G4) unlocks instantaneous fluent reading across both staves.
',
  '{"sections":[{"id":"treble-landmarks","notation":{"clef":"treble","chords":[{"keys":["F4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["C5"],"duration":"q"},{"keys":["E5"],"duration":"q"}],"label":"Four spaces of the treble staff spelling F4 A4 C5 E5","caption":"Treble spaces bottom-to-top: F4 – A4 – C5 – E5."}},{"id":"bass-landmarks","notation":{"clef":"bass","chords":[{"keys":["A2"],"duration":"q"},{"keys":["C3"],"duration":"q"},{"keys":["E3"],"duration":"q"},{"keys":["G3"],"duration":"q"}],"label":"Four spaces of the bass staff spelling A2 C3 E3 G3","caption":"Bass spaces bottom-to-top: A2 – C3 – E3 – G3."}}],"practiceActivities":[{"id":"positions-q1","prompt":"Which pitch sits on Space 2 of the bass staff?","options":[{"id":"c3","label":"C3"},{"id":"e3","label":"E3"},{"id":"a4","label":"A4"},{"id":"g3","label":"G3"}],"correctOptionId":"c3","explanation":"Bass spaces bottom-to-top are A2 (Space 1), C3 (Space 2), E3 (Space 3), and G3 (Space 4)."}],"terminology":[{"term":"Guide Notes (Landmarks)","definition":"Easily memorized anchor notes (e.g. C4, G4, F3) used to quickly calculate nearby pitches."},{"term":"Space Notes","definition":"Notes positioned between two staff lines (Treble: F-A-C-E; Bass: A-C-E-G)."},{"term":"Line Notes","definition":"Notes through which a staff line passes (Treble: E-G-B-D-F; Bass: G-B-D-F-A)."}],"keyboardIllustration":{"highlightNotes":["C3","G3","C4","G4","C5"],"showLabels":true,"label":"Landmark notes across the Great Stave","caption":"Using Cs and Gs as landmarks allows instant spatial recognition without counting from the bottom line."},"practicalApplication":"Ditch mnemonic phrases like ''Every Good Boy Does Fine'' as soon as possible. Professional musicians read by intervals (distance between notes) anchored by landmark guide notes.","videoResource":{"title":"BerkleeX: Reading the Staff and Note Recognition","publisher":"Berklee College of Music","url":"https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory","embedPermitted":false,"notes":"Prof. George W. Russell Jr. demonstrates rapid note identification techniques on the staff."},"references":[{"title":"Open Music Theory: Reading Pitch on the Staff","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Cognitive strategies for fluent note reading."},{"title":"Integrated Musicianship: Note Identification","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Sight-singing exercises and note-naming competency drills."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4"],"at":0,"duration":0.25},{"notes":["E4"],"at":0.22,"duration":0.25},{"notes":["G4"],"at":0.44,"duration":0.25},{"notes":["C5"],"at":0.66,"duration":0.25},{"notes":["E5"],"at":0.88,"duration":0.7}]}'::jsonb,
  9,
  8,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'staves-clefs-and-ledgers' AND c.slug = 'foundations-pitch-and-literacy'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'note-values-and-rests',
  'Note values and rests',
  'Learn the proportional subdivision tree of whole, half, quarter, eighth, and sixteenth notes paired with their equivalent rests.',
  '# Note values and rests

Learn the proportional subdivision tree of whole, half, quarter, eighth, and sixteenth notes paired with their equivalent rests.

## Learning Objectives

- Identify whole, half, quarter, eighth, and sixteenth note shapes.
- Match every sounding note duration with its corresponding silent rest symbol.
- Calculate simple rhythmic equivalences (e.g., two quarters = one half; four sixteenths = one quarter).

## Musical Terminology

- **Whole Note (Semibreve)**: A note lasting four quarter-note beats in 4/4 time; depicted as an open oval notehead without a stem.
- **Half Note (Minim)**: A note lasting two quarter-note beats; depicted as an open oval notehead with a stem.
- **Quarter Note (Crotchet)**: The standard single-beat unit in simple quadruple time; a filled oval notehead with a stem.
- **Eighth Note (Quaver)**: A note lasting half of a quarter-note beat; depicted with a flag or beam.
- **Sixteenth Note (Semiquaver)**: A note lasting one-fourth of a quarter-note beat; depicted with two flags or beams.
- **Rest**: A measured symbol of silence corresponding in duration to its matching note value.

## 1. Proportional halving: the rhythmic tree

Musical note values operate on exact 2:1 proportions rather than fixed clock seconds. A whole note (semibreve, hollow oval without stem) divides into two half notes (minims, hollow oval with stem). Each half note divides into two quarter notes (crotchets, solid notehead with stem).

Subdividing a quarter note yields two eighth notes (quavers, single flag or beam), and subdividing an eighth note yields two sixteenth notes (semiquavers, two flags or two beams).

## 2. Symbols of measured silence (rests)

Silence carries equal architectural weight. Whole rests hang down from Line 4 (like an inverted hat); half rests sit atop Line 3 (like an upright hat). Quarter rests form a vertical zig-zag stroke, while eighth and sixteenth rests mirror the one- and two-flag design of their noteheads.

## Worked Example: Balancing a bar totaling four quarter beats

Find the missing rest needed in a measure containing one half note and one quarter note in 4/4.
1. 1 half note = 2 quarter beats.
2. 1 quarter note = 1 quarter beat.
3. Combined value so far = 2 + 1 = 3 quarter beats.
4. Total bar capacity in 4/4 is 4 quarter beats: 4 − 3 = 1 beat remaining.
Add one quarter rest to complete the four-beat measure.

## Practical Application

Always count rests with active mental focus. In ensemble playing, professional musicians count rests with internal sub-pulses to ensure clean, precise entrances.

## Summary

Each step down the note-value hierarchy halves duration, and every sounding value pairs with an identical rest symbol.
',
  '{"sections":[{"id":"note-value-tree","notation":{"clef":"treble","timeSignature":"4/4","chords":[{"keys":["G4"],"duration":"w"},{"keys":["G4"],"duration":"h"},{"keys":["G4"],"duration":"q"},{"keys":["G4"],"duration":"8"}],"label":"Whole note, half note, quarter note, and eighth note on G4","caption":"Relative shapes: whole (4 beats), half (2 beats), quarter (1 beat), eighth (½ beat)."}},{"id":"matching-rests","notation":{"clef":"treble","chords":[{"keys":["G4"],"duration":"q"},{"keys":[],"duration":"qr"},{"keys":["A4"],"duration":"h"},{"keys":[],"duration":"hr"}],"label":"Quarter note, quarter rest, half note, and half rest","caption":"Quarter note + quarter rest (1 beat each), followed by half note + half rest (2 beats each)."}}],"practiceActivities":[{"id":"values-q1","prompt":"How many eighth notes together equal the duration of a single half note?","options":[{"id":"two","label":"2 eighth notes"},{"id":"four","label":"4 eighth notes"},{"id":"six","label":"6 eighth notes"},{"id":"eight","label":"8 eighth notes"}],"correctOptionId":"four","explanation":"1 half note = 2 quarter notes, and each quarter note holds 2 eighth notes (2 × 2 = 4)."}],"terminology":[{"term":"Whole Note (Semibreve)","definition":"A note lasting four quarter-note beats in 4/4 time; depicted as an open oval notehead without a stem."},{"term":"Half Note (Minim)","definition":"A note lasting two quarter-note beats; depicted as an open oval notehead with a stem."},{"term":"Quarter Note (Crotchet)","definition":"The standard single-beat unit in simple quadruple time; a filled oval notehead with a stem."},{"term":"Eighth Note (Quaver)","definition":"A note lasting half of a quarter-note beat; depicted with a flag or beam."},{"term":"Sixteenth Note (Semiquaver)","definition":"A note lasting one-fourth of a quarter-note beat; depicted with two flags or beams."},{"term":"Rest","definition":"A measured symbol of silence corresponding in duration to its matching note value."}],"keyboardIllustration":{"highlightNotes":["C4"],"showLabels":true,"label":"Sustaining durations against pulse","caption":"Note values determine how many pulses or fractions of a pulse a tone or rest sustains."},"practicalApplication":"Always count rests with active mental focus. In ensemble playing, professional musicians count rests with internal sub-pulses to ensure clean, precise entrances.","videoResource":{"title":"Open Yale Courses: Rhythm Fundamentals and Note Values","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-3","embedPermitted":false,"notes":"MUSI 112 Lecture 3 explains rhythmic proportional division from whole notes to sixteenth notes."},"references":[{"title":"Open Music Theory: Basic Rhythmic Values","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Mathematical hierarchy of binary rhythmic subdivisions and rest symbols."},{"title":"Fundamentals of Music Theory: Rhythm and Note Lengths","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Durations, beams, and metrical grouping principles."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4","E4"],"at":0,"duration":0.3},{"notes":["C4","E4"],"at":0.45,"duration":0.3},{"notes":["E4","G4"],"at":0.9,"duration":0.3},{"notes":["E4","G4"],"at":1.35,"duration":0.3},{"notes":["G4","C5"],"at":1.8,"duration":0.75}]}'::jsonb,
  9,
  9,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'basic-note-reading-and-meter' AND c.slug = 'foundations-notation-and-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'basic-time-signatures',
  'Basic time signatures',
  'Read top and bottom numbers in 4/4, 3/4, and 2/4 meters and feel how barlines group beats into strong and weak accents.',
  '# Basic time signatures

Read top and bottom numbers in 4/4, 3/4, and 2/4 meters and feel how barlines group beats into strong and weak accents.

## Learning Objectives

- Decode what the top and bottom numerals represent in a time signature.
- Contrast duple (2/4), triple (3/4), and quadruple (4/4) bar groupings.
- Group notes into complete measures bounded by barlines.

## Musical Terminology

- **Time Signature**: A fractional notation indicating beats per measure (top) and the beat unit note value (bottom).
- **Duple Meter**: A meter with two primary beats per measure (e.g. 2/4), with strong-weak stress.
- **Triple Meter**: A meter with three beats per measure (e.g. 3/4), with strong-weak-weak stress (waltz feel).
- **Quadruple Meter**: A meter with four beats per measure (e.g. 4/4), with strong-weak-medium-weak stress.
- **Common Time**: The time signature 4/4, frequently written with the symbol ''C''.

## 1. Top numeral vs. bottom numeral

A time signature stacks two numbers immediately after the key signature. The TOP number tells you how many beats fit inside each measure. The BOTTOM number identifies which note value equals one beat (4 = quarter note, 2 = half note, 8 = eighth note).

Thus 3/4 means 3 quarter-note beats per measure (ONE-two-three, waltz feel); 4/4 means 4 quarter-note beats per measure (common time, written C); 2/4 means 2 quarter-note beats per measure (march feel).

## Worked Example: Interpreting 4/4 (''Common Time'') vs. 3/4

You see one half note followed by two eighth notes in a measure.
1. Half note = 2 quarter beats.
2. Two eighth notes = 1 quarter beat combined.
3. Total duration present = 2 + 1 = 3 quarter beats.
Those notes fill a complete measure of 3/4 time, but leave 1 beat short in 4/4 time.

## Practical Application

Learn the standard conductor gestures for 2/4 (down-up), 3/4 (down-out-up), and 4/4 (down-in-out-up). Moving your arm with these gestures while sight-reading locks in your internal metronome.

## Summary

Simple time signatures count top = beats per measure and bottom = beat unit (4 = quarter note), structuring accents inside barlines.
',
  '{"sections":[{"id":"top-bottom-numbers","notation":{"clef":"treble","timeSignature":"3/4","chords":[{"keys":["G4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["D5"],"duration":"q"}],"label":"Three quarter notes inside one measure of 3/4 meter","caption":"3/4 meter: three quarter-note beats per measure."}}],"practiceActivities":[{"id":"timesig-q1","prompt":"In the time signature 3/4, what does the bottom number 4 signify?","options":[{"id":"four-measures","label":"There are four measures per phrase"},{"id":"quarter-beat","label":"The quarter note receives one beat"},{"id":"four-beats","label":"There are four beats in each measure"},{"id":"tempo","label":"The tempo is 40 beats per minute"}],"correctOptionId":"quarter-beat","explanation":"The bottom numeral identifies the unit of beat: 4 stands for a quarter note (1/4 of a whole note)."}],"terminology":[{"term":"Time Signature","definition":"A fractional notation indicating beats per measure (top) and the beat unit note value (bottom)."},{"term":"Duple Meter","definition":"A meter with two primary beats per measure (e.g. 2/4), with strong-weak stress."},{"term":"Triple Meter","definition":"A meter with three beats per measure (e.g. 3/4), with strong-weak-weak stress (waltz feel)."},{"term":"Quadruple Meter","definition":"A meter with four beats per measure (e.g. 4/4), with strong-weak-medium-weak stress."},{"term":"Common Time","definition":"The time signature 4/4, frequently written with the symbol ''C''."}],"keyboardIllustration":{"highlightNotes":["C4","G4"],"showLabels":true,"label":"Metrical downbeat tonic grounding","caption":"In simple time signatures, beat 1 carries the primary harmonic and metrical weight."},"practicalApplication":"Learn the standard conductor gestures for 2/4 (down-up), 3/4 (down-out-up), and 4/4 (down-in-out-up). Moving your arm with these gestures while sight-reading locks in your internal metronome.","videoResource":{"title":"Open Yale Courses: Rhythm, Meter and Accent","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-4","embedPermitted":false,"notes":"Lecture 4 examines meter grouping, downbeat emphasis, and syncopation across classical and popular music."},"references":[{"title":"Open Music Theory: Simple Time Signatures","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Detailed explanation of numerator and denominator functions in simple meters."},{"title":"Berklee Online: Time Signatures and Pulse","authorOrInstitution":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","licence":"Educational Handbook","relevance":"Groove, metric accentuation, and barline discipline."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D3"],"at":0,"duration":0.42},{"notes":["F#4","A4"],"at":0.45,"duration":0.25},{"notes":["F#4","A4"],"at":0.9,"duration":0.25},{"notes":["A3"],"at":1.35,"duration":0.42},{"notes":["F#4","A4"],"at":1.8,"duration":0.25},{"notes":["F#4","A4"],"at":2.25,"duration":0.25}]}'::jsonb,
  9,
  10,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'basic-note-reading-and-meter' AND c.slug = 'foundations-notation-and-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'basic-rhythmic-reading',
  'Basic rhythmic reading',
  'Combine pitch and rhythm into coordinated musical reading, mastering steady beat subdivision and rhythmic clapping.',
  '# Basic rhythmic reading

Combine pitch and rhythm into coordinated musical reading, mastering steady beat subdivision and rhythmic clapping.

## Learning Objectives

- Subdivide simple beats into steady eighth-note and sixteenth-note pulses.
- Perform rhythmic clapping and vocal counting (''1-and-2-and'') while tracking a musical score.
- Distinguish anacrusis (upbeat / pickup measure) from full downbeat measure entrances.

## Musical Terminology

- **Subdivision**: Dividing the main beat into equal smaller units (e.g. eighths or sixteenths) to maintain rhythmic precision.
- **Anacrusis (Pickup / Upbeat)**: One or more preparatory notes appearing before the first complete measure of a piece.
- **Metric Pulse**: The regular, repeating heartbeat against which varied note durations are measured.
- **Beam**: A thick horizontal line replacing flags to visually group eighth and sixteenth notes into single beats.

## 1. Internal subdivision: The engine of accuracy

Reading rhythm is not merely recognizing symbols—it is coordinating time and movement. The single most common cause of rhythmic error is rushing or dragging long notes (such as half notes) while speeding through short notes (such as eighths).

Professional musicians prevent this by maintaining continuous internal subdivision. In 4/4 time, count every beat with an internal ''and'' (''1-and, 2-and, 3-and, 4-and''). When you hold a half note, you mentally feel four eighth-note pulses, keeping tempo rock-solid.

## 2. The Anacrusis: Beginning before the downbeat

Many of the world''s most famous melodies do not begin on Beat 1. Instead, they open with an anacrusis (or pickup note)—an incomplete measure that leads forward into the first full measure.

In a pickup measure, the remaining beats are accounted for in the final measure of the piece, ensuring the total mathematical duration across the work remains intact.

## Worked Example: Calculating a Pickup Measure and Counting Aloud

A piece in 4/4 begins with a single quarter note in the opening pickup measure.
1. Because the measure contains only 1 quarter note in a 4/4 meter, it is an anacrusis on Beat 4.
2. Count aloud: ''1, 2, 3'' internally, and enter playing on ''4''.
3. Beat 4 leads directly into Beat 1 of Measure 1, where the main harmonic downbeat arrives.
Pickup notes always propel musical energy forward into the subsequent downbeat.

## Practical Application

Before you play any score, tap the pulse on your knee with your left hand while clapping the rhythm with your right hand and vocalizing the beat numbers. Physicalizing meter prevents rhythmic hesitation.

## Summary

Fluent rhythmic reading combines internal subdivision with metric accentuation, allowing musicians to coordinate varied durations and pickup bars with rock-solid tempo stability.
',
  '{"sections":[{"id":"subdivision-and-counting","notation":{"clef":"treble","timeSignature":"4/4","beamNotes":true,"chords":[{"keys":["C4"],"duration":"q"},{"keys":["D4"],"duration":"8"},{"keys":["E4"],"duration":"8"},{"keys":["F4"],"duration":"q"},{"keys":["G4"],"duration":"q"}],"label":"Subdivided rhythm: Quarter note, beamed eighth notes, two quarter notes","caption":"Measure of 4/4 counting ''1, 2-and, 3, 4''."}},{"id":"anacrusis-and-pickup"}],"workedExample":{"clef":"treble","timeSignature":"4/4","chords":[{"keys":["G4"],"duration":"q"},{"keys":["C5"],"duration":"h"},{"keys":["E5"],"duration":"q"},{"keys":["G5"],"duration":"q"}],"label":"Pickup quarter note leading to first complete measure","caption":"Anacrusis on beat 4 resolving to middle C5 on beat 1."},"practiceActivities":[{"id":"rhythm-reading-q1","prompt":"If a piece in 4/4 meter begins with two quarter notes in a pickup bar, on which beat does the music start?","options":[{"id":"beat-1","label":"Beat 1"},{"id":"beat-2","label":"Beat 2"},{"id":"beat-3","label":"Beat 3"},{"id":"beat-4","label":"Beat 4"}],"correctOptionId":"beat-3","explanation":"In 4/4 meter with 2 quarter notes in a pickup bar, the music occupies the final two beats of the measure: Beats 3 and 4."}],"terminology":[{"term":"Subdivision","definition":"Dividing the main beat into equal smaller units (e.g. eighths or sixteenths) to maintain rhythmic precision."},{"term":"Anacrusis (Pickup / Upbeat)","definition":"One or more preparatory notes appearing before the first complete measure of a piece."},{"term":"Metric Pulse","definition":"The regular, repeating heartbeat against which varied note durations are measured."},{"term":"Beam","definition":"A thick horizontal line replacing flags to visually group eighth and sixteenth notes into single beats."}],"keyboardIllustration":{"highlightNotes":["C4","D4","E4","F4","G4"],"showLabels":true,"label":"Stepwise melodic passage for rhythmic coordination","caption":"Coordinate steady beat subdivision across five natural finger positions (C4 to G4)."},"practicalApplication":"Before you play any score, tap the pulse on your knee with your left hand while clapping the rhythm with your right hand and vocalizing the beat numbers. Physicalizing meter prevents rhythmic hesitation.","videoResource":{"title":"Berklee Online: Rhythmic Reading and Subdivision Masterclass","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Practical musicianship masterclass on internal clock development, metronome usage, and rhythmic sight-reading."},"references":[{"title":"Open Music Theory: Rhythmic Reading and Beams","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Metrical beam grouping and rhythmic performance."},{"title":"Integrated Musicianship: Rhythmic Performance","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Rhythmic clapping exercises, aural dictation, and subdivision drills."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["G4"],"at":0,"duration":0.45},{"notes":["C5"],"at":0.5,"duration":0.9},{"notes":["E5"],"at":1.5,"duration":0.45},{"notes":["G5"],"at":2,"duration":0.45}],"repertoireSteps":[{"notes":["G4"],"at":0.25,"duration":0.22},{"notes":["G4"],"at":0.5,"duration":0.22},{"notes":["G4"],"at":0.75,"duration":0.22},{"notes":["Eb4"],"at":1,"duration":1}]}'::jsonb,
  10,
  11,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'basic-note-reading-and-meter' AND c.slug = 'foundations-notation-and-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'understanding-scales',
  'Understanding scales',
  'Discover what turns a sequence of pitches into a tonal scale: tonic gravity, scale-degree names, and diatonic spelling.',
  '# Understanding scales

Discover what turns a sequence of pitches into a tonal scale: tonic gravity, scale-degree names, and diatonic spelling.

## Learning Objectives

- Define a diatonic scale as a seven-note stepwise ladder spanning one octave.
- Learn classical scale-degree labels: Tonic, Supertonic, Mediant, Subdominant, Dominant, Submediant, Leading Tone.
- Spell scales alphabetically using each letter A–G once.

## Musical Terminology

- **Scale**: An ordered collection of pitches arranged in ascending or descending order of pitch height.
- **Scale Degree**: The specific position of a note within a scale, designated by numbers 1 through 8 with carets (e.g. 1 to 8).
- **Tonic**: The first scale degree (1); the tonal home center and point of ultimate harmonic resolution.
- **Octave Equivalence**: The principle that pitches an octave apart share the same harmonic identity and pitch class.

## 1. Tonal gravity and the seven scale degrees

The word scale comes from the Latin scala (''ladder''). Rather than random pitches, a diatonic scale organizes seven consecutive letter names around a central home note called the tonic (scale degree 1).

In classical theory every degree plays an active tonal role: Dominant (5) projects outward stability; Leading Tone (7) leans strongly up into the Tonic (8/1); Subdominant (4) mirrors the fifth below the tonic.

## Worked Example: The golden spelling rule of diatonic scales

Spell a seven-note scale starting on D without repeating any letter name.
1. Write the seven distinct letters first: D – E – F – G – A – B – C – D.
2. Never skip a letter or write two forms of the same letter (like F and F♯ in a single major scale).
3. Adjust tones and semitones next using accidentals.
Every major and minor scale uses all seven letter names once before repeating the tonic.

## Practical Application

When learning any new piece, immediately identify its scale collection. Scales are the tonal vocabulary from which melodies and harmonies are constructed.

## Summary

Diatonic scales arrange all seven unique letters into an asymmetric ladder of tones and semitones orbiting a central tonic.
',
  '{"sections":[{"id":"tonic-and-degrees","notation":{"clef":"treble","chords":[{"keys":["C4"],"duration":"q"},{"keys":["D4"],"duration":"q"},{"keys":["E4"],"duration":"q"},{"keys":["F4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["C5"],"duration":"q"}],"label":"C major diatonic scale rising across all seven unique letters to C5","caption":"Scale degrees 1–8: Tonic (C) up through Leading Tone (B) and octave Tonic (C)."}}],"practiceActivities":[{"id":"scales-q1","prompt":"What is the classical name for scale degree 5?","options":[{"id":"mediant","label":"Mediant"},{"id":"subdominant","label":"Subdominant"},{"id":"dominant","label":"Dominant"},{"id":"supertonic","label":"Supertonic"}],"correctOptionId":"dominant","explanation":"Degree 5 is the Dominant—second only to the Tonic (1) in harmonic pull."}],"terminology":[{"term":"Scale","definition":"An ordered collection of pitches arranged in ascending or descending order of pitch height."},{"term":"Scale Degree","definition":"The specific position of a note within a scale, designated by numbers 1 through 8 with carets (e.g. 1 to 8)."},{"term":"Tonic","definition":"The first scale degree (1); the tonal home center and point of ultimate harmonic resolution."},{"term":"Octave Equivalence","definition":"The principle that pitches an octave apart share the same harmonic identity and pitch class."}],"keyboardIllustration":{"highlightNotes":["C4","D4","E4","F4","G4","A4","B4","C5"],"showLabels":true,"label":"Diatonic scale collection (C4 to C5)","caption":"An eight-note diatonic octave collection moving in stepwise motion from tonic to tonic."},"practicalApplication":"When learning any new piece, immediately identify its scale collection. Scales are the tonal vocabulary from which melodies and harmonies are constructed.","videoResource":{"title":"Open Yale Courses: Melody, Scale and Tonality","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-5","embedPermitted":false,"notes":"MUSI 112 Lecture 5 examines how scales form the acoustic and psychological foundation of Western tonality."},"references":[{"title":"Open Music Theory: Introduction to Diatonic Modes and Scales","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Defines scale degrees, tonic gravity, and stepwise linear motion."},{"title":"Fundamentals of Music Theory: Scales and Pitch Collections","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Acoustic origins and step-pattern formulas of diatonic scales."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["A4"],"at":0,"duration":0.35},{"notes":["B4"],"at":0.38,"duration":0.35},{"notes":["C#5"],"at":0.76,"duration":0.35},{"notes":["D5"],"at":1.14,"duration":0.35},{"notes":["E5"],"at":1.52,"duration":0.75}]}'::jsonb,
  8,
  1,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'diatonic-scales-and-major' AND c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'major-scales',
  'Major scales',
  'Construct any major scale from the Whole–Whole–Half–Whole–Whole–Whole–Half (T–T–S–T–T–T–S) step formula.',
  '# Major scales

Construct any major scale from the Whole–Whole–Half–Whole–Whole–Whole–Half (T–T–S–T–T–T–S) step formula.

## Learning Objectives

- Apply the major scale formula T–T–S–T–T–T–S starting from any pitch.
- Understand the two identical four-note tetrachords (T–T–S) joined by a tone.
- Build sharp major scales (G, D, A) and flat major scales (F, B♭).

## Musical Terminology

- **Major Scale**: A seven-note diatonic scale defined by the step pattern Whole-Whole-Half-Whole-Whole-Whole-Half.
- **Tetrachord**: A series of four notes spanning a perfect fourth with the interval pattern Whole-Whole-Half.
- **Leading Tone**: Scale degree 7; located a half step below the tonic, possessing strong melodic pull toward 1.
- **Mediant**: Scale degree 3; located midway between the tonic and dominant, defining major vs. minor quality.

## 1. The T–T–S–T–T–T–S blueprint

The C major scale occurs naturally on white keys because its natural semitones E–F (degrees 3–4) and B–C (degrees 7–8) match the exact major pattern: Tone – Tone – Semitone – Tone – Tone – Tone – Semitone.

Notice its symmetry: C–D–E–F (T–T–S) and G–A–B–C (T–T–S) are two identical four-note tetrachords connected by a central whole tone (F–G).

## Worked Example: Building F Major from the formula

Apply T–T–S–T–T–T–S starting from F4.
1. 1 to 2 (T): F → G.
2. 2 to 3 (T): G → A.
3. 3 to 4 (S): A → B♭ (must be B♭ rather than A♯ so every letter F–G–A–B appears once!).
4. 4 to 5 (T): B♭ → C; 5 to 6 (T): C → D; 6 to 7 (T): D → E; 7 to 8 (S): E → F.
F Major contains one flat: B♭ (F–G–A–B♭–C–D–E–F).

## Practical Application

Sing the leading tone (7) and resolve it up by half step to tonic (1). Feeling this physical vocal tension and resolution trains your ear to instinctively recognize tonal gravity in any key.

## Summary

All twelve major scales share one invariant interval spacing: Tone–Tone–Semitone–Tone–Tone–Tone–Semitone.
',
  '{"sections":[{"id":"major-formula","notation":{"clef":"treble","chords":[{"keys":["G4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["C5"],"duration":"q"},{"keys":["D5"],"duration":"q"},{"keys":["E5"],"duration":"q"},{"keys":["F#5"],"duration":"q"},{"keys":["G5"],"duration":"q"}],"label":"G major scale rising G4 to G5 requiring F-sharp on degree 7","caption":"G Major requires F♯ on degree 7 so E–F♯ (tone) and F♯–G (semitone) preserve T–T–S–T–T–T–S."}}],"practiceActivities":[{"id":"major-q1","prompt":"Which two sharps are required to build a D Major scale?","options":[{"id":"fc","label":"F♯ and C♯"},{"id":"fg","label":"F♯ and G♯"},{"id":"bc","label":"B♯ and C♯"},{"id":"cf","label":"F♯ and D♯"}],"correctOptionId":"fc","explanation":"Starting on D: D–E(T)–F♯(T)–G(S)–A(T)–B(T)–C♯(T)–D(S). F♯ maintains the 3rd and C♯ creates the leading-tone semitone to D."}],"terminology":[{"term":"Major Scale","definition":"A seven-note diatonic scale defined by the step pattern Whole-Whole-Half-Whole-Whole-Whole-Half."},{"term":"Tetrachord","definition":"A series of four notes spanning a perfect fourth with the interval pattern Whole-Whole-Half."},{"term":"Leading Tone","definition":"Scale degree 7; located a half step below the tonic, possessing strong melodic pull toward 1."},{"term":"Mediant","definition":"Scale degree 3; located midway between the tonic and dominant, defining major vs. minor quality."}],"keyboardIllustration":{"highlightNotes":["C4","D4","E4","F4","G4","A4","B4","C5"],"showLabels":true,"label":"C Major scale (all natural white keys)","caption":"Observe the semitones between scale degrees 3–4 (E–F) and 7–8 (B–C)."},"practicalApplication":"Sing the leading tone (7) and resolve it up by half step to tonic (1). Feeling this physical vocal tension and resolution trains your ear to instinctively recognize tonal gravity in any key.","videoResource":{"title":"BerkleeX: Constructing Major Scales","publisher":"Berklee College of Music","url":"https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory","embedPermitted":false,"notes":"Prof. George W. Russell Jr. constructs major scales across the circle of keys using whole and half step formulas."},"references":[{"title":"Open Music Theory: Major Scales","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Tetrachordal construction, step patterns, and chromatic transpositions."},{"title":"Harmony and Musicianship with Solfège: Major Scales","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Solfege syllables (Do-Re-Mi-Fa-Sol-La-Ti-Do) applied to all 12 major scales."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["F#4"],"at":0,"duration":0.35},{"notes":["F#4"],"at":0.38,"duration":0.35},{"notes":["G4"],"at":0.76,"duration":0.35},{"notes":["A4"],"at":1.14,"duration":0.35},{"notes":["A4"],"at":1.52,"duration":0.35},{"notes":["G4"],"at":1.9,"duration":0.35},{"notes":["F#4"],"at":2.28,"duration":0.35},{"notes":["E4"],"at":2.66,"duration":0.35},{"notes":["D4"],"at":3.04,"duration":0.75}]}'::jsonb,
  10,
  2,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'diatonic-scales-and-major' AND c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'natural-minor-scales',
  'Natural minor scales',
  'Hear how lowering degrees 3, 6, and 7 transforms major warmth into the aeolian color of natural minor (T–S–T–T–S–T–T).',
  '# Natural minor scales

Hear how lowering degrees 3, 6, and 7 transforms major warmth into the aeolian color of natural minor (T–S–T–T–S–T–T).

## Learning Objectives

- Derive A natural minor cleanly on white keys: A–B–C–D–E–F–G–A.
- Construct natural minor scales using Tone–Semitone–Tone–Tone–Semitone–Tone–Tone.
- Compare parallel major vs. parallel minor (e.g., C major vs. C natural minor: ♭3, ♭6, ♭7).

## Musical Terminology

- **Natural Minor Scale**: A diatonic minor scale defined by the step formula Whole-Half-Whole-Whole-Half-Whole-Whole.
- **Subtonic**: Scale degree 7 in natural minor, positioned a whole step below the tonic (lacking a leading-tone half-step pull).
- **Minor Third**: An interval of 3 semitones between tonic and scale degree 3, giving the minor scale its characteristic melancholic color.

## 1. Lowered 3rd, 6th, and 7th degrees

The natural minor scale follows the pattern T–S–T–T–S–T–T, placing its semitones between degrees 2–3 and 5–6. A natural minor uses only the piano white keys from A to A.

Compared against a parallel major scale sharing the same tonic, natural minor flattens degrees 3, 6, and 7—producing a darker minor third at the bottom and a gentler whole-step subtonic (7 to 8) at the top.

## Worked Example: Transforming C Major into C Natural Minor

Lower degrees 3, 6, and 7 of C major by one semitone.
1. C major = C – D – E – F – G – A – B – C.
2. Lower degree 3 (E → E♭), degree 6 (A → A♭), and degree 7 (B → B♭).
C natural minor = C – D – E♭ – F – G – A♭ – B♭ – C (matching E♭ major''s three flats).

## Practical Application

Compare C major (C-D-E-F-G-A-B-C) with A natural minor (A-B-C-D-E-F-G-A). While both use identical white keys, their tonal centers and interval step orders create completely distinct emotional spaces.

## Summary

Natural minor lowers degrees 3, 6, and 7 relative to major, creating semitones at 2–3 and 5–6 and a whole-tone subtonic at 7–8.
',
  '{"sections":[{"id":"aeolian-pattern","notation":{"clef":"treble","chords":[{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["C5"],"duration":"q"},{"keys":["D5"],"duration":"q"},{"keys":["E5"],"duration":"q"},{"keys":["F5"],"duration":"q"},{"keys":["G5"],"duration":"q"},{"keys":["A5"],"duration":"q"}],"label":"A natural minor scale rising across white keys A4 to A5","caption":"A Natural Minor: semitones sit cleanly between B–C (2–3) and E–F (5–6)."}}],"practiceActivities":[{"id":"natminor-q1","prompt":"Between which scale degrees do the semitones fall in every natural minor scale?","options":[{"id":"34-78","label":"3–4 and 7–8"},{"id":"23-56","label":"2–3 and 5–6"},{"id":"23-78","label":"2–3 and 7–8"},{"id":"12-45","label":"1–2 and 4–5"}],"correctOptionId":"23-56","explanation":"The natural minor pattern T–S–T–T–S–T–T puts semitones at 2–3 and 5–6."}],"terminology":[{"term":"Natural Minor Scale","definition":"A diatonic minor scale defined by the step formula Whole-Half-Whole-Whole-Half-Whole-Whole."},{"term":"Subtonic","definition":"Scale degree 7 in natural minor, positioned a whole step below the tonic (lacking a leading-tone half-step pull)."},{"term":"Minor Third","definition":"An interval of 3 semitones between tonic and scale degree 3, giving the minor scale its characteristic melancholic color."}],"keyboardIllustration":{"highlightNotes":["A3","B3","C4","D4","E4","F4","G4","A4"],"showLabels":true,"label":"A Natural Minor scale (relative minor to C Major)","caption":"Natural minor features half steps between 2–3 (B–C) and 5–6 (E–F), with a subtonic at 7 (G)."},"practicalApplication":"Compare C major (C-D-E-F-G-A-B-C) with A natural minor (A-B-C-D-E-F-G-A). While both use identical white keys, their tonal centers and interval step orders create completely distinct emotional spaces.","videoResource":{"title":"Fundamentals of Music Theory: Minor Scales","publisher":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","embedPermitted":false,"notes":"Instructional module on natural minor step structure and its modal heritage (Aeolian mode)."},"references":[{"title":"Open Music Theory: Minor Scales","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Diatonic step patterns and historical derivation of natural minor."},{"title":"Integrated Musicianship: Minor Scales and Solfège","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"La-based and Do-based minor solfege methods."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["A4"],"at":0,"duration":0.35},{"notes":["C5"],"at":0.38,"duration":0.65},{"notes":["D5"],"at":1.05,"duration":0.35},{"notes":["E5"],"at":1.42,"duration":0.55},{"notes":["F5"],"at":1.98,"duration":0.25},{"notes":["E5"],"at":2.25,"duration":0.35},{"notes":["D5"],"at":2.62,"duration":0.65},{"notes":["B4"],"at":3.28,"duration":0.35},{"notes":["G4"],"at":3.65,"duration":0.65}]}'::jsonb,
  8,
  3,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'diatonic-scales-and-major' AND c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'harmonic-minor-scales',
  'Harmonic minor scales',
  'Raise the seventh degree by a semitone to restore the leading-tone pull toward the tonic and create a major dominant V chord.',
  '# Harmonic minor scales

Raise the seventh degree by a semitone to restore the leading-tone pull toward the tonic and create a major dominant V chord.

## Learning Objectives

- Raise scale degree 7 of a natural minor scale to create harmonic minor.
- Identify the distinctive 3-semitone (augmented 2nd) leap between degrees 6 and ♯7.
- Understand why classical composers alter degree 7 for dominant harmony.

## Musical Terminology

- **Harmonic Minor Scale**: A minor scale featuring a raised 7th scale degree, creating a leading tone a half step below the tonic.
- **Augmented Second**: An interval of three semitones occurring between scale degrees 6 and raised 7 in harmonic minor.
- **Dominant Pull**: The strong harmonic drive created by the leading tone resolving upward to the tonic.

## 1. Restoring the leading tone for V → i cadences

In natural minor, the seventh degree sits a whole tone below the tonic, making the fifth chord minor (v) and softening cadential pull. Classical harmony therefore raises degree 7 by a semitone, producing the Harmonic Minor scale: A–B–C–D–E–F–G♯–A.

That raised G♯ turns E–G–B into a bright E major triad (V) that drives resolutely into A minor (i), while simultaneously opening an exotic three-semitone gap—an augmented second—between F (6) and G♯ (♯7).

## Worked Example: Raising a flat seventh in D Minor

Construct D harmonic minor starting from D natural minor (one flat: B♭).
1. D natural minor: D – E – F – G – A – B♭ – C – D.
2. Raise degree 7 (C) by one semitone using a sharp: C♯.
D harmonic minor = D – E – F – G – A – B♭ – C♯ – D (leaving key signature 1♭, adding C♯ as an accidental).

## Practical Application

In classical and film music, the exotic, dramatic quality of harmonic minor arises from the augmented second interval (F to G#). Listen for this gap when identifying minor keys by ear.

## Summary

Harmonic minor raises degree 7 of natural minor to generate a true leading tone and major V chord, creating a 3-semitone leap between 6 and ♯7.
',
  '{"sections":[{"id":"raised-seventh","notation":{"clef":"treble","chords":[{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["C5"],"duration":"q"},{"keys":["D5"],"duration":"q"},{"keys":["E5"],"duration":"q"},{"keys":["F5"],"duration":"q"},{"keys":["G#5"],"duration":"q"},{"keys":["A5"],"duration":"q"}],"label":"A harmonic minor scale highlighting raised G-sharp 5 before A5","caption":"A Harmonic Minor: notice the augmented second jump from F5 to G♯5."}}],"practiceActivities":[{"id":"harminor-q1","prompt":"What interval separates scale degrees 6 and 7 in a harmonic minor scale?","options":[{"id":"m2","label":"Minor second (1 semitone)"},{"id":"M2","label":"Major second (2 semitones)"},{"id":"A2","label":"Augmented second (3 semitones)"},{"id":"P4","label":"Perfect fourth (5 semitones)"}],"correctOptionId":"A2","explanation":"Because degree 6 remains natural minor while degree 7 is raised a semitone (e.g. F to G♯), the span widens to 3 semitones (an augmented 2nd)."}],"terminology":[{"term":"Harmonic Minor Scale","definition":"A minor scale featuring a raised 7th scale degree, creating a leading tone a half step below the tonic."},{"term":"Augmented Second","definition":"An interval of three semitones occurring between scale degrees 6 and raised 7 in harmonic minor."},{"term":"Dominant Pull","definition":"The strong harmonic drive created by the leading tone resolving upward to the tonic."}],"keyboardIllustration":{"highlightNotes":["A3","B3","C4","D4","E4","F4","G#4","A4"],"showLabels":true,"label":"A Harmonic Minor scale (G raised to G#)","caption":"Raising G to G# creates the leading tone and produces the characteristic augmented second interval between F and G#."},"practicalApplication":"In classical and film music, the exotic, dramatic quality of harmonic minor arises from the augmented second interval (F to G#). Listen for this gap when identifying minor keys by ear.","videoResource":{"title":"Open Yale Courses: Minor Scales and Harmonic Function","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Prof. Wright explains why Western composers raised scale degree 7 to create a major V chord in minor keys."},"references":[{"title":"Open Music Theory: Harmonic Minor","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Harmonic necessity of the leading tone for authentic cadence closure."},{"title":"Teoria.com: Harmonic Minor Scale Structure","authorOrInstitution":"José Rodríguez Alvira","url":"https://www.teoria.com/","licence":"Free Educational Web Resource","relevance":"Interactive interval drills for the augmented second in harmonic minor."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D4","F#4","A4","C5"],"at":0,"duration":0.9},{"notes":["G4","Bb4","D5"],"at":0.95,"duration":1.1}]}'::jsonb,
  9,
  4,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'three-forms-of-minor' AND c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'melodic-minor-scales',
  'Melodic minor scales',
  'Smooth the awkward augmented-second gap when ascending by raising both degrees 6 and 7, then return naturally on the descent.',
  '# Melodic minor scales

Smooth the awkward augmented-second gap when ascending by raising both degrees 6 and 7, then return naturally on the descent.

## Learning Objectives

- Construct ascending melodic minor by raising both degree 6 and degree 7.
- Construct classical descending melodic minor by lowering 6 and 7 back to the key signature.
- Hear how ascending melodic minor pairs a minor lower half with a major upper half.

## Musical Terminology

- **Melodic Minor Scale**: A scale with raised 6th and 7th degrees ascending, which revert to natural minor descending.
- **Vocal Smoothness**: Eliminating the awkward augmented second step in vocal and instrumental lines by raising scale degree 6.
- **Jazz Minor**: The ascending form of melodic minor used both ascending and descending in jazz harmony.

## 1. Smoothing melodic lines upward and downward

To keep vocal and instrumental melodies flowing smoothly toward the tonic without the wide augmented-second leap of harmonic minor, classical composers raise degree 6 alongside degree 7 on the way UP (A–B–C–D–E–F♯–G♯–A).

Once past the tonic and descending downward, the pull of the leading tone fades; therefore classical melodic minor cancels both alterations on the way DOWN (A–G♮–F♮–E–D–C–B–A), identical to natural minor.

## Worked Example: Applying natural signs to C Melodic Minor

Spell C melodic minor ascending (starting from C natural minor: E♭, A♭, B♭).
1. Recall C natural minor has 3 flats: E♭, A♭, B♭.
2. To raise A♭ and B♭ by one semitone ascending, you do NOT add sharps—you write naturals (A♮, B♮)!
3. Ascending: C–D–E♭–F–G–A♮–B♮–C. Descending: C–B♭–A♭–G–F–E♭–D–C.
Raising a flatted scale degree requires a natural (♮), not a sharp!

## Practical Application

When playing melodic minor passages, remember: sharp the 6th and 7th when driving up toward the tonic; cancel the accidentals to natural minor when cascading downwards.

## Summary

Melodic minor raises degrees 6 and 7 on the ascent for smooth scalar motion and reverts to natural minor on the descent.
',
  '{"sections":[{"id":"melodic-ascent-descent","notation":{"clef":"treble","chords":[{"keys":["E5"],"duration":"q"},{"keys":["F#5"],"duration":"q"},{"keys":["G#5"],"duration":"q"},{"keys":["A5"],"duration":"h"},{"keys":["G5"],"duration":"q"},{"keys":["F5"],"duration":"q"},{"keys":["E5"],"duration":"q"}],"label":"Upper tetrachord of A melodic minor ascending F-sharp G-sharp A and descending G-natural F-natural E","caption":"Upper half of A Melodic Minor: raised ♯6–♯7 ascending (F♯–G♯–A), natural ♮7–♮6 descending (G♮–F♮–E)."}}],"practiceActivities":[{"id":"melminor-q1","prompt":"Which pitches alter the natural minor scale ascending in G melodic minor (key signature B♭, E♭)?","options":[{"id":"ef","label":"E♮ and F♯"},{"id":"eb","label":"E♭ and F♯"},{"id":"esfs","label":"E♯ and F♯"},{"id":"enfn","label":"E♮ and F♮"}],"correctOptionId":"ef","explanation":"Degree 6 is E♭ (raised to E♮) and degree 7 is F♮ (raised to F♯). Descending reverts to F♮ and E♭."}],"terminology":[{"term":"Melodic Minor Scale","definition":"A scale with raised 6th and 7th degrees ascending, which revert to natural minor descending."},{"term":"Vocal Smoothness","definition":"Eliminating the awkward augmented second step in vocal and instrumental lines by raising scale degree 6."},{"term":"Jazz Minor","definition":"The ascending form of melodic minor used both ascending and descending in jazz harmony."}],"keyboardIllustration":{"highlightNotes":["A3","B3","C4","D4","E4","F#4","G#4","A4"],"showLabels":true,"label":"A Melodic Minor scale ascending (F# and G#)","caption":"Ascending: F and G are both raised (F# and G#); descending: they revert to natural (G natural and F natural)."},"practicalApplication":"When playing melodic minor passages, remember: sharp the 6th and 7th when driving up toward the tonic; cancel the accidentals to natural minor when cascading downwards.","videoResource":{"title":"Berklee Online: Melodic Minor and Jazz Applications","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee clinic on the melodic minor scale, voice leading, and modern chord-scale theory."},"references":[{"title":"Open Music Theory: Melodic Minor Scales","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Historical part-writing conventions for ascending vs. descending minor contours."},{"title":"Juilliard Extension: Core Theory Foundations","authorOrInstitution":"The Juilliard School","url":"https://www.juilliard.edu/stage-beyond/juilliard-extension","licence":"Proprietary Institutional Curriculum","relevance":"Bach chorale analysis and melodic minor voice-leading exercises."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["B4"],"at":0,"duration":0.3},{"notes":["C#5"],"at":0.32,"duration":0.3},{"notes":["D#5"],"at":0.64,"duration":0.3},{"notes":["E5"],"at":0.96,"duration":0.55},{"notes":["D5"],"at":1.55,"duration":0.3},{"notes":["C5"],"at":1.87,"duration":0.3},{"notes":["B4"],"at":2.19,"duration":0.65}]}'::jsonb,
  9,
  5,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'three-forms-of-minor' AND c.slug = 'major-and-minor-scale-construction'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'key-signatures',
  'Key signatures',
  'Memorize the exact order of sharps and flats and read any major key signature in under two seconds.',
  '# Key signatures

Memorize the exact order of sharps and flats and read any major key signature in under two seconds.

## Learning Objectives

- Recite the exact sharp order (F–C–G–D–A–E–B) and reversed flat order (B–E–A–D–G–C–F).
- Identify any sharp major key from its rightmost sharp (up 1 semitone).
- Identify any flat major key from its second-to-last flat.

## Musical Terminology

- **Key Signature**: A collection of sharps or flats printed at the beginning of each staff establishing the prevailing key.
- **Order of Sharps**: Father Charles Goes Down And Ends Battle (F#, C#, G#, D#, A#, E#, B#).
- **Order of Flats**: Battle Ends And Down Goes Charles'' Father (Bb, Eb, Ab, Db, Gb, Cb, Fb).

## 1. Fixed order & fast key decoding

Rather than printing sharps and flats repeatedly before individual notes, notation collects all standard scale accidentals at the start of every line into a Key Signature. They ALWAYS appear in a single strict order:

Order of Sharps: F♯ – C♯ – G♯ – D♯ – A♯ – E♯ – B♯. Order of Flats (exact mirror reversal): B♭ – E♭ – A♭ – D♭ – G♭ – C♭ – F♭.

Two shortcuts read any major signature immediately: for SHARP keys, go one semitone (one letter step) ABOVE the LAST sharp (e.g., F♯, C♯ → D Major). For FLAT keys with 2+ flats, read the PENULTIMATE (second-to-last) flat (e.g., B♭, E♭, A♭ → E♭ Major; remember F Major has 1 flat, B♭).

## Worked Example: Decoding four sharps vs. four flats

Identify the major key containing (a) 4 sharps and (b) 4 flats.
1. (a) Four sharps = F♯, C♯, G♯, D♯. Last sharp = D♯. One semitone higher = E Major.
2. (b) Four flats = B♭, E♭, A♭, D♭. Second-to-last flat = A♭. Key = A♭ Major.
4 sharps = E Major; 4 flats = A♭ Major.

## Practical Application

Quick identification trick: For sharp keys, the last sharp to the right is scale degree 7 (leading tone)—go up half a step to find the major tonic! For flat keys, the second-to-last flat is the major tonic name!

## Summary

Key signatures place sharps (FCGDAEB) or flats (BEADGCF) at the clef to govern all octaves automatically.
',
  '{"sections":[{"id":"order-of-sharps-flats","notation":{"clef":"treble","keySignature":"D","chords":[{"keys":["D4"],"duration":"q"},{"keys":["F#4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["D5"],"duration":"q"}],"label":"D major key signature (F-sharp and C-sharp) with D major tonic arpeggio","caption":"Two sharps (F♯, C♯): the last sharp C♯ points straight up one semitone to D Major."}}],"practiceActivities":[{"id":"keysig-q1","prompt":"Which Major key carries the three flats B♭, E♭, and A♭?","options":[{"id":"ab","label":"A♭ Major"},{"id":"eb","label":"E♭ Major"},{"id":"bb","label":"B♭ Major"},{"id":"f","label":"F Major"}],"correctOptionId":"eb","explanation":"Using the penultimate-flat rule for B♭, E♭, A♭, the second-to-last flat is E♭ → E♭ Major."}],"terminology":[{"term":"Key Signature","definition":"A collection of sharps or flats printed at the beginning of each staff establishing the prevailing key."},{"term":"Order of Sharps","definition":"Father Charles Goes Down And Ends Battle (F#, C#, G#, D#, A#, E#, B#)."},{"term":"Order of Flats","definition":"Battle Ends And Down Goes Charles'' Father (Bb, Eb, Ab, Db, Gb, Cb, Fb)."}],"keyboardIllustration":{"highlightNotes":["D4","E4","F#4","G4","A4","B4","C#4","D5"],"showLabels":true,"label":"D Major key signature pitches (F# and C#)","caption":"Two sharps (F# and C#) automatically transform the natural staff into D Major / B Minor."},"practicalApplication":"Quick identification trick: For sharp keys, the last sharp to the right is scale degree 7 (leading tone)—go up half a step to find the major tonic! For flat keys, the second-to-last flat is the major tonic name!","videoResource":{"title":"Open Yale Courses: Key Signatures and Tonal Architecture","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-5","embedPermitted":false,"notes":"Prof. Wright explains how key signatures standardize notation across all orchestral instruments."},"references":[{"title":"Open Music Theory: Key Signatures","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Standard clef placement, accidental ordering, and transposition rules."},{"title":"Musictheory.net: Key Signatures","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/24","licence":"Free Web Educational Access","relevance":"Interactive drills for rapid identification of major and minor key signatures."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["Bb3"],"at":0,"duration":0.4},{"notes":["D4"],"at":0.42,"duration":0.4},{"notes":["Eb4"],"at":0.84,"duration":0.4},{"notes":["F4"],"at":1.26,"duration":0.75}]}'::jsonb,
  9,
  6,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'keys-circle-and-modes' AND c.slug = 'key-signatures-and-modality'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'circle-of-fifths',
  'Circle of fifths',
  'See all twelve major and minor keys arranged on a harmonic compass where every step adds one sharp clockwise or one flat counterclockwise.',
  '# Circle of fifths

See all twelve major and minor keys arranged on a harmonic compass where every step adds one sharp clockwise or one flat counterclockwise.

## Learning Objectives

- Step clockwise in ascending perfect fifths (C → G → D → A → E → B → F♯) adding one sharp each step.
- Step counterclockwise in descending fifths / ascending fourths (C → F → B♭ → E♭ → A♭ → D♭ → G♭) adding one flat.
- Recognize enharmonic keys overlapping at the bottom (B/C♭, F♯/G♭, C♯/D♭).

## Musical Terminology

- **Circle of Fifths**: A circular geometric diagram depicting the relationships among the 12 chromatic keys in fifth intervals.
- **Clockwise Direction**: Moving clockwise adds sharps by ascending fifths (C -> G -> D -> A -> E -> B -> F#).
- **Counter-Clockwise Direction**: Moving counter-clockwise adds flats by descending fifths / ascending fourths (C -> F -> Bb -> Eb -> Ab -> Db -> Gb).
- **Enharmonic Keys**: Keys with different spellings but identical pitches (e.g. F# Major with 6 sharps = Gb Major with 6 flats).

## 1. The 12-hour compass of closely related keys

Starting at 12 o''clock with C major / A minor (0 sharps, 0 flats), moving clockwise by a perfect fifth each hour introduces exactly one new sharp: G (1♯), D (2♯), A (3♯), E (4♯), B (5♯), F♯ (6♯).

Moving counterclockwise from C by a perfect fourth (down a fifth) adds one flat each step: F (1♭), B♭ (2♭), E♭ (3♭), A♭ (4♭), D♭ (5♭), G♭ (6♭). Neighbours on the circle share six of their seven scale tones—explaining why classical sonatas modulate first to the Dominant (one hour clockwise) or Subdominant (one hour counterclockwise)!

## Worked Example: Finding how many sharps belong to E Major via fifths

Count clockwise steps from C Major to E Major.
1. C = 0 sharps.
2. G = 1, D = 2, A = 3, E = 4.
3. The first four sharps in F–C–G–D–A–E–B order are F♯, C♯, G♯, D♯.
E Major sits at 4 o''clock with four sharps (F♯, C♯, G♯, D♯).

## Practical Application

Keep the Circle of Fifths memorized like a clock face. Keys adjacent on the circle (e.g. C major and G major) share 6 out of 7 notes, making modulation between them seamless.

## Summary

The circle of fifths maps tonal proximity cleanly: adjacent keys differ by a single accidental, making it essential for modulation and key recall.
',
  '{"sections":[{"id":"clock-of-keys","notation":{"clef":"treble","chords":[{"keys":["C4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["D5"],"duration":"q"},{"keys":["A4"],"duration":"q"}],"label":"Chain of fifths: C4 up to G4, D5, and A4","caption":"Stepping clockwise around the Circle: C (0♯) → G (1♯) → D (2♯) → A (3♯)."}}],"practiceActivities":[{"id":"circle-q1","prompt":"Moving clockwise one step from D Major (2 sharps) reaches which key signature?","options":[{"id":"g","label":"G Major (1 sharp)"},{"id":"a","label":"A Major (3 sharps)"},{"id":"e","label":"E Major (4 sharps)"},{"id":"f","label":"F Major (1 flat)"}],"correctOptionId":"a","explanation":"A perfect fifth above D is A, adding C♯→G♯ for 3 sharps (A Major)."}],"terminology":[{"term":"Circle of Fifths","definition":"A circular geometric diagram depicting the relationships among the 12 chromatic keys in fifth intervals."},{"term":"Clockwise Direction","definition":"Moving clockwise adds sharps by ascending fifths (C -> G -> D -> A -> E -> B -> F#)."},{"term":"Counter-Clockwise Direction","definition":"Moving counter-clockwise adds flats by descending fifths / ascending fourths (C -> F -> Bb -> Eb -> Ab -> Db -> Gb)."},{"term":"Enharmonic Keys","definition":"Keys with different spellings but identical pitches (e.g. F# Major with 6 sharps = Gb Major with 6 flats)."}],"keyboardIllustration":{"highlightNotes":["C4","G4","D5","A5"],"showLabels":true,"label":"Ascending fifths cycle (C4 -> G4 -> D5 -> A5)","caption":"Each step of 7 semitones (perfect fifth) advances one position clockwise on the Circle of Fifths."},"practicalApplication":"Keep the Circle of Fifths memorized like a clock face. Keys adjacent on the circle (e.g. C major and G major) share 6 out of 7 notes, making modulation between them seamless.","videoResource":{"title":"Berklee Online: The Circle of Fifths Demystified","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee faculty lecture on using the Circle of Fifths for songwriting, modulation, and chord progression design."},"references":[{"title":"Open Music Theory: The Circle of Fifths","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Geometric representation of pitch class space and closely related key networks."},{"title":"Fundamentals of Music Theory: Circle of Fifths and Keys","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Cyclic key relations and enharmonic convergence."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["E4","G4","B4"],"at":0,"duration":0.45},{"notes":["A3","E4","A4"],"at":0.48,"duration":0.45},{"notes":["D4","F4","A4"],"at":0.96,"duration":0.45},{"notes":["G3","D4","G4"],"at":1.44,"duration":0.45},{"notes":["C4","E4","G4"],"at":1.92,"duration":0.9}]}'::jsonb,
  8,
  7,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'keys-circle-and-modes' AND c.slug = 'key-signatures-and-modality'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'relative-major-and-minor-keys',
  'Relative major and minor keys',
  'Pair every major key with its relative minor sharing the exact same key signature, spaced three semitones (a minor third) apart.',
  '# Relative major and minor keys

Pair every major key with its relative minor sharing the exact same key signature, spaced three semitones (a minor third) apart.

## Learning Objectives

- Find the relative minor three semitones (minor third / degree 6) below any major tonic.
- Distinguish RELATIVE keys (same key signature, different tonic) from PARALLEL keys (same tonic, different signature).
- Inspect melody and bass harmony to tell whether a piece uses a major key or its relative minor.

## Musical Terminology

- **Relative Keys**: A major key and minor key that share the exact same key signature and pitch collection.
- **Relative Minor Tonic**: The 6th scale degree of any major scale (e.g. A in C Major; E in G Major).
- **Relative Major Tonic**: The 3rd scale degree of any natural minor scale (e.g. C in A Minor; G in E Minor).

## 1. Shared signature, different tonal home

C major and A natural minor share the exact same collection of seven pitches (no sharps, no flats), making them Relative Keys. From any Major tonic, step down a minor third (3 semitones / to scale degree 6) to find its relative minor.

Don''t confuse Relative with Parallel: C Major and C Minor share the tonic C (parallel), whereas C Major and A Minor share the key signature (relative). When reading music, always check the closing bass note and final chord—and watch for a raised leading tone like G♯ confirming A minor!

## Worked Example: Finding the relative minor of E♭ Major (3 flats)

Determine which minor key shares the B♭–E♭–A♭ key signature.
1. Method A (down a minor third): E♭ → D (1) → C♯/D♭ (2) → C (3). Correct letter name two steps down from E is C.
2. Method B (scale degree 6): Count E♭(1)–F(2)–G(3)–A♭(4)–B♭(5)–C(6).
The relative minor of E♭ Major is C Minor.

## Practical Application

To find the relative minor of any major key quickly, count down 3 semitones (or down a minor third). For example: Eb major minus 3 semitones = C minor.

## Summary

Every key signature belongs jointly to a Major key and its Relative Minor perched a minor third (degree 6) below.
',
  '{"sections":[{"id":"relative-vs-parallel","notation":{"clef":"treble","keySignature":"F","chords":[{"keys":["F4","A4","C5"],"duration":"h"},{"keys":["D4","F4","A4"],"duration":"h"}],"label":"F major triad alongside its relative D minor triad under one-flat signature","caption":"F Major (F–A–C) and D Minor (D–F–A) share the one-flat signature (B♭)."}}],"practiceActivities":[{"id":"relkeys-q1","prompt":"A piece has a one-sharp (F♯) key signature and repeatedly lands on E–G–B chords with occasional D♯ leading tones. What key is it in?","options":[{"id":"gmaj","label":"G Major"},{"id":"emin","label":"E Minor"},{"id":"dmin","label":"D Minor"},{"id":"bmaj","label":"B Major"}],"correctOptionId":"emin","explanation":"One sharp belongs to G Major and its relative minor, E Minor. Ending on E–G–B with raised D♯ leading tones proves E Minor."}],"terminology":[{"term":"Relative Keys","definition":"A major key and minor key that share the exact same key signature and pitch collection."},{"term":"Relative Minor Tonic","definition":"The 6th scale degree of any major scale (e.g. A in C Major; E in G Major)."},{"term":"Relative Major Tonic","definition":"The 3rd scale degree of any natural minor scale (e.g. C in A Minor; G in E Minor)."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4","A4","C5","E5"],"showLabels":true,"label":"C Major triad (C-E-G) vs. A Minor triad (A-C-E)","caption":"Relative keys share two common tones between their tonic triads, creating smooth harmonic exchange."},"practicalApplication":"To find the relative minor of any major key quickly, count down 3 semitones (or down a minor third). For example: Eb major minus 3 semitones = C minor.","videoResource":{"title":"Open Yale Courses: Relative Major and Minor Modulation","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Analysis of classical sonata and dance movements alternating between relative major and minor realms."},"references":[{"title":"Open Music Theory: Relative and Parallel Keys","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Theoretical distinction between relative (shared pitches) and parallel (shared tonic) systems."},{"title":"Harmony and Musicianship with Solfège: Relative Keys","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Comparative analysis of relative key pairs across classical literature."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["F4","Ab4","C5"],"at":0,"duration":0.75},{"notes":["Eb4","G4","Bb4"],"at":0.8,"duration":0.55},{"notes":["Ab4","C5","Eb5"],"at":1.4,"duration":1}]}'::jsonb,
  8,
  8,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'keys-circle-and-modes' AND c.slug = 'key-signatures-and-modality'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'parallel-keys',
  'Parallel keys and modal contrast',
  'Master parallel major and minor keys sharing the same tonic, comparing altered scale degrees 3, 6, and 7 and modal borrowing.',
  '# Parallel keys and modal contrast

Master parallel major and minor keys sharing the same tonic, comparing altered scale degrees 3, 6, and 7 and modal borrowing.

## Learning Objectives

- Differentiate parallel keys (shared tonic, different key signature) from relative keys (shared key signature, different tonic).
- Identify the three altered scale degrees (flat 3, flat 6, flat 7) between parallel major and minor.
- Recognize modal mixture (borrowing chords from parallel minor into a major key).

## Musical Terminology

- **Parallel Keys**: A major key and minor key that share the same tonic pitch (e.g. C major and C minor).
- **Modal Mixture (Borrowing)**: Importing chords from the parallel minor key into a major key progression (e.g. iv or bVI in major).
- **Picardy Third**: Ending a piece in a minor key with a triumphant parallel major tonic triad (raising scale degree 3).

## 1. The Parallel Relationship: Same home, different landscape

While relative keys share a key signature but start on different tonics (e.g. C major and A minor), parallel keys share the exact same tonic note but have different key signatures (e.g. C major and C minor).

Because parallel keys share the identical acoustic center, switching between them produces an immediate, dramatic change of color without any disorientation. The difference lies entirely in three scale degrees: in minor, degrees 3, 6, and 7 are lowered by one semitone.

## Worked Example: Comparing Key Signatures of Parallel Pairs

Determine the key signature difference between G major and parallel G minor.
1. G Major has 1 sharp (F#).
2. G Minor is relative to Bb Major, which has 2 flats (Bb, Eb).
3. To convert G major into parallel G minor, cancel the F# and add Bb and Eb.
4. The result lowers scale degrees 3 (B to Bb) and 6 (E to Eb).
Every parallel minor key signature has three more flats (or three fewer sharps) than its parallel major.

## Practical Application

When improvising or composing, introduce a chord borrowed from the parallel minor (such as a minor iv chord or flat-VI major chord in a major key). This ''modal mixture'' adds deep cinematic pathos to any progression.

## Summary

Parallel keys share the same tonic pitch while altering scale degrees 3, 6, and 7, enabling instant modal contrast and rich harmonic borrowing within a single tonal center.
',
  '{"sections":[{"id":"parallel-vs-relative","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"h"},{"keys":["C4","Eb4","G4"],"duration":"h"}],"label":"C Major triad followed directly by C Minor triad","caption":"Lowering scale degree 3 from E natural to E flat instantly transforms major into parallel minor."}}],"workedExample":{"clef":"treble","chords":[{"keys":["G4","B4","D5"],"duration":"h"},{"keys":["G4","Bb4","D5"],"duration":"h"}],"label":"G Major to G Minor","caption":"G major (B natural) shifts to G minor (B flat)."},"practiceActivities":[{"id":"parallel-q1","prompt":"What is the key signature of E minor compared to its parallel key E major?","options":[{"id":"e-maj-4s-min-1s","label":"E major has 4 sharps; E minor has 1 sharp"},{"id":"e-maj-3s-min-0","label":"E major has 3 sharps; E minor has 0 sharps"},{"id":"e-maj-1s-min-4s","label":"E major has 1 sharp; E minor has 4 sharps"},{"id":"both-equal","label":"Both share the same key signature"}],"correctOptionId":"e-maj-4s-min-1s","explanation":"E major has 4 sharps (F#, C#, G#, D#); parallel E minor (relative to G major) has only 1 sharp (F#), reflecting the 3-accidental difference."}],"terminology":[{"term":"Parallel Keys","definition":"A major key and minor key that share the same tonic pitch (e.g. C major and C minor)."},{"term":"Modal Mixture (Borrowing)","definition":"Importing chords from the parallel minor key into a major key progression (e.g. iv or bVI in major)."},{"term":"Picardy Third","definition":"Ending a piece in a minor key with a triumphant parallel major tonic triad (raising scale degree 3)."}],"keyboardIllustration":{"highlightNotes":["C4","E4","Eb4","G4"],"showLabels":true,"label":"Parallel inflection on the third (E4 natural vs. Eb4 flat)","caption":"The single half-step shift between E4 and Eb4 determines whether the harmony is major or minor."},"practicalApplication":"When improvising or composing, introduce a chord borrowed from the parallel minor (such as a minor iv chord or flat-VI major chord in a major key). This ''modal mixture'' adds deep cinematic pathos to any progression.","videoResource":{"title":"Open Yale Courses: Schubert and the Major/Minor Shift","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Prof. Wright explores the expressive power of the parallel minor shift in 19th-century Romanticism."},"references":[{"title":"Open Music Theory: Modal Mixture","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Theoretical analysis of parallel key borrowed chords and harmonic syntax."},{"title":"Integrated Musicianship: Parallel Keys","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Aural distinction drills between relative and parallel key changes."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["G4","B4","D5"],"at":0,"duration":0.9},{"notes":["G4","Bb4","D5"],"at":1,"duration":1}],"repertoireSteps":[{"notes":["D4","F4","A4"],"at":0,"duration":0.8},{"notes":["D4","F#4","A4"],"at":0.9,"duration":1.2}]}'::jsonb,
  10,
  9,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'keys-circle-and-modes' AND c.slug = 'key-signatures-and-modality'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'modes',
  'The church modes and diatonic rotation',
  'Explore the seven diatonic modes—Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian—and their characteristic scale degrees.',
  '# The church modes and diatonic rotation

Explore the seven diatonic modes—Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian—and their characteristic scale degrees.

## Learning Objectives

- Construct all seven diatonic modes using white-key rotations of the major scale.
- Identify the characteristic color tone for each mode (e.g. raised 4 in Lydian, flat 7 in Mixolydian, raised 6 in Dorian).
- Classify modes into major-family (Ionian, Lydian, Mixolydian) and minor-family (Dorian, Phrygian, Aeolian, Locrian).

## Musical Terminology

- **Diatonic Mode**: A seven-pitch scale derived by rotating the standard major scale step pattern to start on different scale degrees.
- **Dorian Mode**: A minor-family mode starting on degree 2 with a characteristic raised 6th degree (natural 6).
- **Mixolydian Mode**: A major-family mode starting on degree 5 with a characteristic lowered 7th degree (flat 7).
- **Lydian Mode**: A major-family mode starting on degree 4 with a characteristic raised 4th degree (sharp 4).
- **Phrygian Mode**: A minor-family mode starting on degree 3 with a characteristic lowered 2nd degree (flat 2).

## 1. The seven modes as white-key rotations

Centuries before modern major and minor keys solidified, Western music operated under the church modes. The seven diatonic modes are formed by playing the natural white keys of the piano starting on each of the seven letter names:

C to C = Ionian (standard Major); D to D = Dorian; E to E = Phrygian; F to F = Lydian; G to G = Mixolydian; A to A = Aeolian (Natural Minor); B to B = Locrian.

## Worked Example: Identifying the Characteristic Color Tone

Compare G Mixolydian with G Major.
1. G Major scale notes: G, A, B, C, D, E, F# (sharp 7 leading tone).
2. G Mixolydian notes: G, A, B, C, D, E, F natural (flat 7 subtonic).
3. The distinguishing note is scale degree 7: F natural rather than F#.
Mixolydian sounds like major with a relaxed, bluesy, or folk-like lowered 7th degree.

## Practical Application

To quickly play any mode from any root: start with the parallel major or minor scale and adjust its single signature degree: Dorian = Minor + raised 6; Mixolydian = Major + flat 7; Lydian = Major + raised 4; Phrygian = Minor + flat 2.

## Summary

The seven church modes offer distinctive tonal flavors beyond standard major and minor by shifting the placement of half steps across the diatonic scale framework.
',
  '{"sections":[{"id":"seven-modes-rotation","notation":{"clef":"treble","chords":[{"keys":["D4"],"duration":"q"},{"keys":["E4"],"duration":"q"},{"keys":["F4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["A4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["C5"],"duration":"q"},{"keys":["D5"],"duration":"q"}],"label":"D Dorian mode (white keys from D to D)","caption":"D Dorian: minor third (F natural) and characteristic major sixth (B natural)."}}],"workedExample":{"clef":"treble","chords":[{"keys":["G4","B4","D5"],"duration":"h"},{"keys":["F4","A4","C5"],"duration":"h"}],"label":"G Mixolydian tonic (G) moving to subtonic triad (F major)","caption":"The bVII chord (F major) defines Mixolydian harmonic progression."},"practiceActivities":[{"id":"modes-q1","prompt":"Which mode has a major third but a lowered (flat) seventh degree?","options":[{"id":"lydian","label":"Lydian"},{"id":"dorian","label":"Dorian"},{"id":"mixolydian","label":"Mixolydian"},{"id":"phrygian","label":"Phrygian"}],"correctOptionId":"mixolydian","explanation":"Mixolydian has a major third (1-3 = major triad) paired with a lowered flat-7 scale degree."}],"terminology":[{"term":"Diatonic Mode","definition":"A seven-pitch scale derived by rotating the standard major scale step pattern to start on different scale degrees."},{"term":"Dorian Mode","definition":"A minor-family mode starting on degree 2 with a characteristic raised 6th degree (natural 6)."},{"term":"Mixolydian Mode","definition":"A major-family mode starting on degree 5 with a characteristic lowered 7th degree (flat 7)."},{"term":"Lydian Mode","definition":"A major-family mode starting on degree 4 with a characteristic raised 4th degree (sharp 4)."},{"term":"Phrygian Mode","definition":"A minor-family mode starting on degree 3 with a characteristic lowered 2nd degree (flat 2)."}],"keyboardIllustration":{"highlightNotes":["D4","E4","F4","G4","A4","B4","C5","D5"],"showLabels":true,"label":"Dorian mode on keyboard white keys","caption":"Playing all white keys from D to D produces the Dorian mode."},"practicalApplication":"To quickly play any mode from any root: start with the parallel major or minor scale and adjust its single signature degree: Dorian = Minor + raised 6; Mixolydian = Major + flat 7; Lydian = Major + raised 4; Phrygian = Minor + flat 2.","videoResource":{"title":"Berklee Online: Understanding Modes and Modal Harmony","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee masterclass on modal scales, characteristic notes, and modal improvisation."},"references":[{"title":"Open Music Theory: Diatonic Modes","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Historical medieval church modes and modern scalar classifications."},{"title":"Harmony and Musicianship with Solfège: Modal Systems","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Modal singing, solfege syllables, and modal melodic analysis."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["G4","B4","D5"],"at":0,"duration":0.9},{"notes":["F4","A4","C5"],"at":1,"duration":1}],"repertoireSteps":[{"notes":["D4"],"at":0,"duration":0.4},{"notes":["F4"],"at":0.4,"duration":0.6},{"notes":["G4"],"at":1,"duration":0.3},{"notes":["A4"],"at":1.3,"duration":0.6},{"notes":["B4"],"at":1.9,"duration":0.4},{"notes":["A4"],"at":2.3,"duration":0.6}]}'::jsonb,
  11,
  10,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'keys-circle-and-modes' AND c.slug = 'key-signatures-and-modality'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'tonal-relationships',
  'Tonal relationships and key distance',
  'Understand closely related keys, modulation pathways, and the gravitational network connecting the 24 major and minor keys.',
  '# Tonal relationships and key distance

Understand closely related keys, modulation pathways, and the gravitational network connecting the 24 major and minor keys.

## Learning Objectives

- Define closely related keys as those whose key signatures differ by no more than one accidental.
- List the five closely related keys for any given major or minor home key.
- Understand the principle of tonal hierarchy and modulation routes in Classical forms.

## Musical Terminology

- **Closely Related Keys**: Keys that differ by at most one accidental (sharp or flat) from the home key, including relative keys.
- **Distant (Foreign) Keys**: Keys that differ by two or more accidentals on the Circle of Fifths.
- **Modulation**: The process of transitioning smoothly from one key center to another within a musical composition.
- **Pivot Chord**: A chord common to both the original key and the destination key used to make modulation imperceptible.

## 1. The Five Closely Related Keys

In tonal music, keys are not isolated islands; they form a rich solar system of harmonic relationships. The closer two keys are on the Circle of Fifths, the more pitches and chords they share, and the more natural it feels to move between them.

For any major key, there are exactly FIVE closely related keys: its relative minor (vi), the dominant key (V) and its relative minor (iii), and the subdominant key (IV) and its relative minor (ii). Notice that these five keys correspond to the diatonic triads built on scale degrees ii, iii, IV, V, and vi!

## Worked Example: Finding the 5 Closely Related Keys for F Major

Identify all five closely related keys for F Major (1 flat: Bb).
1. Same key signature: Relative minor is D Minor (1 flat).
2. One more flat: Subdominant key is Bb Major (2 flats); its relative minor is G Minor (2 flats).
3. One fewer flat: Dominant key is C Major (0 flats); its relative minor is A Minor (0 flats).
The five closely related keys to F Major are D minor, Bb major, G minor, C major, and A minor.

## Practical Application

When analyzing any classical or baroque movement, look for the first accidental outside the key signature. An accidental typically signals that the music is modulating toward a closely related key.

## Summary

Tonal relationships govern musical departure and homecoming; closely related keys share maximum harmonic vocabulary, providing seamless pathways for modulation in classical forms.
',
  '{"sections":[{"id":"closely-related-five-keys","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"w"},{"keys":["G4","B4","D5"],"duration":"w"},{"keys":["F4","A4","C5"],"duration":"w"},{"keys":["A3","C4","E4"],"duration":"w"}],"label":"C Major closely related centers: C (I), G (V), F (IV), A minor (vi)","caption":"Primary closely related key destinations for C major."}}],"workedExample":{"clef":"treble","keySignature":"F","chords":[{"keys":["F4","A4","C5"],"duration":"h"},{"keys":["D4","F4","A4"],"duration":"h"}],"label":"F Major to D Minor","caption":"F Major and D Minor share the 1-flat key signature."},"practiceActivities":[{"id":"tonal-rel-q1","prompt":"How many accidentals can two keys differ by on the Circle of Fifths to still be considered ''closely related''?","options":[{"id":"zero-or-one","label":"At most one accidental (0 or 1)"},{"id":"two","label":"At most two accidentals"},{"id":"three","label":"At most three accidentals"},{"id":"any","label":"Any keys sharing a triad"}],"correctOptionId":"zero-or-one","explanation":"Closely related keys differ by no more than one accidental from the primary key signature (same, +1 sharp, or +1 flat)."}],"terminology":[{"term":"Closely Related Keys","definition":"Keys that differ by at most one accidental (sharp or flat) from the home key, including relative keys."},{"term":"Distant (Foreign) Keys","definition":"Keys that differ by two or more accidentals on the Circle of Fifths."},{"term":"Modulation","definition":"The process of transitioning smoothly from one key center to another within a musical composition."},{"term":"Pivot Chord","definition":"A chord common to both the original key and the destination key used to make modulation imperceptible."}],"keyboardIllustration":{"highlightNotes":["C4","F4","G4","A4"],"showLabels":true,"label":"Tonal anchors around C Major","caption":"C Major (tonic) surrounded by F (subdominant, 4th), G (dominant, 5th), and A (relative minor, 6th)."},"practicalApplication":"When analyzing any classical or baroque movement, look for the first accidental outside the key signature. An accidental typically signals that the music is modulating toward a closely related key.","videoResource":{"title":"Open Yale Courses: Modulation and Musical Architecture","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-5","embedPermitted":false,"notes":"Prof. Wright illustrates how key relationships create the psychological narrative of departure and return."},"references":[{"title":"Open Music Theory: Closely Related Keys","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Mathematical and syntactic definition of key distances on the circle of fifths."},{"title":"Fundamentals of Music Theory: Modulation and Key Relationships","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Pivot chord identification and tonal destination maps."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["F4","A4","C5"],"at":0,"duration":0.8},{"notes":["D4","F4","A4"],"at":0.9,"duration":1}],"repertoireSteps":[{"notes":["G4","B4","D5"],"at":0,"duration":0.5},{"notes":["A4","C#5","E5"],"at":0.6,"duration":0.5},{"notes":["D4","F#4","A4"],"at":1.2,"duration":1.2}]}'::jsonb,
  11,
  11,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'keys-circle-and-modes' AND c.slug = 'key-signatures-and-modality'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'understanding-intervals',
  'Understanding intervals',
  'Distinguish melodic vs. harmonic intervals and calculate generic interval numbers cleanly by counting alphabetical letter names.',
  '# Understanding intervals

Distinguish melodic vs. harmonic intervals and calculate generic interval numbers cleanly by counting alphabetical letter names.

## Learning Objectives

- Differentiate melodic intervals (sounded sequentially) from harmonic intervals (sounded simultaneously).
- Count inclusive alphabet letter steps—lines and spaces—to establish generic interval size (1st through 8th).
- Separate letter quantity (4th vs. 3rd) from semitone spacing.

## Musical Terminology

- **Interval**: The measurement of distance in pitch between two musical sounds.
- **Harmonic Interval**: Two pitches sounded simultaneously as a chord or dyad.
- **Melodic Interval**: Two pitches sounded sequentially in time as part of a melody.
- **Generic Interval**: The raw numerical distance between staff lines and spaces (e.g. 2nd, 3rd, 4th, 5th).

## 1. Melodic vs. harmonic & inclusive letter counting

An interval measures the pitch distance between two notes. Played one after another, they form a melodic interval; played together, they form a harmonic interval.

Before naming an interval''s quality (major, minor, perfect), always count the inclusive generic letter span from lower note to upper note—counting both boundary letters as 1. From C to G covers C(1)–D(2)–E(3)–F(4)–G(5) = a 5th.

## Worked Example: Why C–F♯ is a 4th while C–G♭ is a 5th

Compare two intervals spanning identical 6-semitone keyboard width.
1. C to F♯ counts C(1)–D(2)–E(3)–F(4): generic size = 4th.
2. C to G♭ counts C(1)–D(2)–E(3)–F(4)–G(5): generic size = 5th.
Letter spelling alone determines the generic number; accidentals qualify how wide that letter span stretches.

## Practical Application

When sight-singing or score-reading, identify intervals by their visual shape on the staff: lines to adjacent lines (or spaces to spaces) are always odd intervals (3rds, 5ths, 7ths); lines to spaces are always even intervals (2nds, 4ths, 6ths, octaves).

## Summary

Every interval combines an inclusive letter count (generic number) with a precise semitone quality.
',
  '{"sections":[{"id":"generic-size","notation":{"clef":"treble","chords":[{"keys":["C4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["C4","G4"],"duration":"h"}],"label":"Melodic fifth C4 to G4 followed by harmonic fifth C4 and G4 together","caption":"Melodic fifth (C4 then G4) followed by a harmonic fifth (C4 + G4 sounded simultaneously)."}}],"practiceActivities":[{"id":"intervals-q1","prompt":"What is the generic interval size from E4 up to C5 (ignoring accidentals)?","options":[{"id":"5th","label":"5th"},{"id":"6th","label":"6th"},{"id":"7th","label":"7th"},{"id":"4th","label":"4th"}],"correctOptionId":"6th","explanation":"Count inclusively: E(1)–F(2)–G(3)–A(4)–B(5)–C(6) = a 6th."}],"terminology":[{"term":"Interval","definition":"The measurement of distance in pitch between two musical sounds."},{"term":"Harmonic Interval","definition":"Two pitches sounded simultaneously as a chord or dyad."},{"term":"Melodic Interval","definition":"Two pitches sounded sequentially in time as part of a melody."},{"term":"Generic Interval","definition":"The raw numerical distance between staff lines and spaces (e.g. 2nd, 3rd, 4th, 5th)."}],"keyboardIllustration":{"highlightNotes":["C4","G4"],"showLabels":true,"label":"Perfect Fifth interval (C4 to G4)","caption":"C4 to G4 spans seven semitones and five letter names (C-D-E-F-G), forming a fundamental acoustic fifth."},"practicalApplication":"When sight-singing or score-reading, identify intervals by their visual shape on the staff: lines to adjacent lines (or spaces to spaces) are always odd intervals (3rds, 5ths, 7ths); lines to spaces are always even intervals (2nds, 4ths, 6ths, octaves).","videoResource":{"title":"Open Yale Courses: Intervals and the Foundations of Harmony","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"MUSI 112 Lecture 6 examines harmonic and melodic intervals and their acoustic frequency ratios."},"references":[{"title":"Open Music Theory: Introduction to Intervals","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Harmonic vs. melodic intervals and generic staff counting rules."},{"title":"Fundamentals of Music Theory: Intervals and Pitch Distance","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Acoustic interval ratios and harmonic overtone relationships."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C3"],"at":0,"duration":0.55},{"notes":["G3"],"at":0.58,"duration":0.55},{"notes":["C4"],"at":1.16,"duration":1}]}'::jsonb,
  8,
  1,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'intervals-and-acoustics' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'interval-classification',
  'Interval classification',
  'Assign exact classical qualities—Perfect, Major, Minor, Augmented, and Diminished—and master the Rule of Nine for interval inversion.',
  '# Interval classification

Assign exact classical qualities—Perfect, Major, Minor, Augmented, and Diminished—and master the Rule of Nine for interval inversion.

## Learning Objectives

- Separate Perfect intervals (1, 4, 5, 8) from Major/Minor intervals (2, 3, 6, 7).
- Contract or expand semitones accurately using Diminished and Augmented labels.
- Invert intervals quickly using the Rule of Nine (numbers sum to 9; P↔P, M↔m, A↔d).

## Musical Terminology

- **Specific Interval**: The complete classification combining numerical size with quality (e.g. Major 3rd, Perfect 5th).
- **Major / Minor Qualities**: Applies to 2nds, 3rds, 6ths, and 7ths; minor is one semitone smaller than major.
- **Perfect Quality**: Applies to unison, 4ths, 5ths, and octaves; acoustically pure frequency ratios (1:1, 4:3, 3:2, 2:1).
- **Augmented / Diminished**: Augmented is one semitone larger than major or perfect; diminished is one semitone smaller than minor or perfect.

## 1. Two families of quality & inversion

Classical theory sorts generic intervals into two quality families based on the Major scale built from the lower note: Unison (0 semitones), 4th (5), 5th (7), and Octave (12) are PERFECT. Expanding a Perfect interval by 1 semitone makes it AUGMENTED; shrinking it by 1 semitone makes it DIMINISHED.

Meanwhile 2nds (2 semitones), 3rds (4), 6ths (9), and 7ths (11) are MAJOR in the major scale. Lowering a Major interval by 1 semitone produces MINOR (1, 3, 8, 10 semitones); lowering minor by another semitone produces DIMINISHED; raising Major by 1 semitone produces AUGMENTED.

Inverting an interval swaps bottom and top notes within one octave: new number = 9 − original number, and qualities flip mirror-fashion (Perfect ↔ Perfect, Major ↔ Minor, Augmented ↔ Diminished).

## Worked Example: Naming D up to B♭ in two steps

Identify both number and quality for D4 → B♭4.
1. 1. Letter count: D(1)–E(2)–F(3)–G(4)–A(5)–B(6) = 6th.
2. 2. Check D Major scale: D Major has F♯ and C♯ (natural B♮ is Major 6th above D, 9 semitones).
3. 3. B♭4 lowers that Major 6th by 1 semitone (8 semitones) → Minor 6th.
4. Bonus inversion check: B♭4 up to D5 = Major 3rd (6 + 3 = 9, Minor ↔ Major).
D4 to B♭4 is a Minor 6th (8 semitones).

## Practical Application

To quickly calculate any interval, measure it against the major scale of the lower note. If the upper note is in the lower note''s major scale, it is either Major (2, 3, 6, 7) or Perfect (1, 4, 5, 8). If it is one semitone lower, it is Minor (or Diminished).

## Summary

Qualify intervals precisely using the lower note''s major scale and flip any interval''s number (9 − n) and quality via inversion.
',
  '{"sections":[{"id":"quality-groups","notation":{"clef":"treble","chords":[{"keys":["C4","E4"],"duration":"h"},{"keys":["C4","Eb4"],"duration":"h"},{"keys":["C4","F#4"],"duration":"h"},{"keys":["C4","G4"],"duration":"h"}],"label":"Major 3rd C-E, Minor 3rd C-Eb, Augmented 4th C-F#, and Perfect 5th C-G","caption":"Major 3rd (4 st), Minor 3rd (3 st), Augmented 4th tritone (6 st), and Perfect 5th (7 st)."}}],"practiceActivities":[{"id":"class-q1","prompt":"When you invert a Major 6th (e.g., C4–A4 becomes A4–C5), what interval results?","options":[{"id":"m3","label":"Minor 3rd"},{"id":"M3","label":"Major 3rd"},{"id":"P4","label":"Perfect 4th"},{"id":"d3","label":"Diminished 3rd"}],"correctOptionId":"m3","explanation":"By the Rule of Nine: 9 − 6 = 3, and Major inverts to Minor → Minor 3rd."}],"terminology":[{"term":"Specific Interval","definition":"The complete classification combining numerical size with quality (e.g. Major 3rd, Perfect 5th)."},{"term":"Major / Minor Qualities","definition":"Applies to 2nds, 3rds, 6ths, and 7ths; minor is one semitone smaller than major."},{"term":"Perfect Quality","definition":"Applies to unison, 4ths, 5ths, and octaves; acoustically pure frequency ratios (1:1, 4:3, 3:2, 2:1)."},{"term":"Augmented / Diminished","definition":"Augmented is one semitone larger than major or perfect; diminished is one semitone smaller than minor or perfect."}],"keyboardIllustration":{"highlightNotes":["C4","Eb4","E4"],"showLabels":true,"label":"Minor Third (C4–Eb4) vs. Major Third (C4–E4)","caption":"Minor third spans 3 semitones; Major third spans 4 semitones."},"practicalApplication":"To quickly calculate any interval, measure it against the major scale of the lower note. If the upper note is in the lower note''s major scale, it is either Major (2, 3, 6, 7) or Perfect (1, 4, 5, 8). If it is one semitone lower, it is Minor (or Diminished).","videoResource":{"title":"BerkleeX: Classifying and Calculating Intervals","publisher":"Berklee College of Music","url":"https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory","embedPermitted":false,"notes":"Prof. George W. Russell Jr. provides infallible mental shortcuts for classifying any interval instantly."},"references":[{"title":"Open Music Theory: Interval Size and Quality","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Rigorous classification algorithm for all 12 chromatic interval qualities."},{"title":"Musictheory.net: Generic and Specific Intervals","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/30","licence":"Free Web Educational Access","relevance":"Interactive interval training and visual staff demonstrations."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4","G4"],"at":0,"duration":0.3},{"notes":["G4"],"at":0.32,"duration":0.6},{"notes":["Ab4"],"at":0.94,"duration":0.35},{"notes":["B4"],"at":1.32,"duration":0.65}]}'::jsonb,
  11,
  2,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'intervals-and-acoustics' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'consonance-and-dissonance',
  'Consonance and dissonance',
  'Understand how simple overtone ratios produce stable consonances versus restless dissonances that drive melodic resolution.',
  '# Consonance and dissonance

Understand how simple overtone ratios produce stable consonances versus restless dissonances that drive melodic resolution.

## Learning Objectives

- Distinguish perfect consonances (P1, P5, P8), imperfect consonances (m3, M3, m6, M6), and dissonances (2nds, 7ths, tritones).
- Explain why small integer frequency ratios (2:1, 3:2, 5:4) fuse smoothly in hearing.
- Understand the classical treatment of the Perfect 4th against the bass.

## Musical Terminology

- **Consonance**: An interval perceived as stable, acoustically harmonious, and requiring no immediate resolution.
- **Dissonance**: An interval characterized by acoustic friction or tension that demands resolution to a consonance.
- **Perfect Consonances**: Unison, octave, and perfect fifth (plus perfect fourth in non-bass contexts).
- **Imperfect Consonances**: Major and minor thirds and sixths; pleasant, colorful, and musically stable.
- **Tritone**: The interval of three whole tones (augmented 4th / diminished 5th); the primary harmonic engine of tonal tension.

## 1. Acoustic stability vs. harmonic drive

Consonance and dissonance describe how settled or restless two sounding tones feel. Open Perfect Consonances—Octave (2:1) and Perfect Fifth (3:2)—lock cleanly into acoustic stability. Imperfect Consonances—Major/Minor Thirds and Sixths—bring warm harmonic color without destabilizing repose.

Dissonances—Seconds, Sevenths, and all Augmented/Diminished intervals including the Tritone (A4/d5)—rub adjacent frequencies together, creating rhythmic acoustic shimmer that classical syntax resolves by step into nearby consonances.

## Worked Example: Resolving a harmonic Major 7th

Resolve C4–B4 harmonically by moving a single voice.
1. C4–B4 forms a tense Major 7th (B4 wants to pull upward by semitone as leading tone).
2. Raise B4 cleanly by 1 semitone to C5 while holding C4.
3. Result: C4–C5 (Perfect Octave—complete acoustic repose).
Dissonance creates linear longing; stepwise movement into consonance relieves it.

## Practical Application

Music is fundamentally a cycle of tension and release. Learn to hear how dissonances (such as the tritone in a V7 chord) create the physical impulse that makes the subsequent consonant chord sound satisfying.

## Summary

Consonances anchor tonal repose while dissonances supply essential tension propelling melody and harmony forward.
',
  '{"sections":[{"id":"stability-hierarchy","notation":{"clef":"treble","chords":[{"keys":["F4","B4"],"duration":"h"},{"keys":["E4","C5"],"duration":"h"}],"label":"Dissonant tritone F4–B4 resolving contrapuntally outward to Minor 6th E4–C5","caption":"Contrary motion resolution: tritone (F–B) expands cleanly into consonant sixth (E–C)."}}],"practiceActivities":[{"id":"cons-q1","prompt":"Which pair belongs strictly to the category of IMPERFECT consonances?","options":[{"id":"p5-p8","label":"Perfect 5th and Perfect Octave"},{"id":"m3-M6","label":"Minor 3rd and Major 6th"},{"id":"m2-M7","label":"Minor 2nd and Major 7th"},{"id":"A4-d5","label":"Augmented 4th and Diminished 5th"}],"correctOptionId":"m3-M6","explanation":"3rds and 6ths (both major and minor) are warm imperfect consonances; 5ths/8ves are perfect consonances."}],"terminology":[{"term":"Consonance","definition":"An interval perceived as stable, acoustically harmonious, and requiring no immediate resolution."},{"term":"Dissonance","definition":"An interval characterized by acoustic friction or tension that demands resolution to a consonance."},{"term":"Perfect Consonances","definition":"Unison, octave, and perfect fifth (plus perfect fourth in non-bass contexts)."},{"term":"Imperfect Consonances","definition":"Major and minor thirds and sixths; pleasant, colorful, and musically stable."},{"term":"Tritone","definition":"The interval of three whole tones (augmented 4th / diminished 5th); the primary harmonic engine of tonal tension."}],"keyboardIllustration":{"highlightNotes":["B3","F4","C4","E4"],"showLabels":true,"label":"Tritone tension (B–F) resolving outward to third (C–E)","caption":"The sharp dissonance of the tritone (B3–F4) resolves smoothly outward to the stable consonance of C4–E4."},"practicalApplication":"Music is fundamentally a cycle of tension and release. Learn to hear how dissonances (such as the tritone in a V7 chord) create the physical impulse that makes the subsequent consonant chord sound satisfying.","videoResource":{"title":"Open Yale Courses: Consonance, Dissonance and Voice Leading","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Acoustic examination of roughness and harmonic overtone alignment in consonant vs. dissonant intervals."},"references":[{"title":"Open Music Theory: Consonance and Dissonance","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Acoustic and historical perspectives on interval stability from medieval organum to classical counterpoint."},{"title":"Harmony and Musicianship with Solfège: Harmonic Tension","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Vocal tuning and resolution drills for dissonant intervals."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4","D5"],"at":0,"duration":0.55},{"notes":["C4","C5"],"at":0.58,"duration":0.55},{"notes":["B3","B4"],"at":1.16,"duration":0.55},{"notes":["C4","C5"],"at":1.75,"duration":0.9}]}'::jsonb,
  8,
  3,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'intervals-and-acoustics' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'triads',
  'Triads',
  'Understand tertian triad stacking—root, third, and fifth—to build the structural foundation of Western tonal harmony.',
  '# Triads

Understand tertian triad stacking—root, third, and fifth—to build the structural foundation of Western tonal harmony.

## Learning Objectives

- Construct a root-position triad by stacking alternate scale steps (root, 3rd, 5th).
- Read root-position triads visually on the staff as three stacked lines or three stacked spaces.
- Distinguish the seven diatonic triads naturally arising in a major key.

## Musical Terminology

- **Triad**: A three-note chord constructed by stacking two thirds on top of a foundational root.
- **Root**: The foundational pitch upon which a triad or chord is generated.
- **Third**: The middle pitch of a triad, situated a generic third above the root.
- **Fifth**: The top pitch of a root-position triad, situated a generic fifth above the root.
- **Tertian Harmony**: The harmonic system based entirely upon building chords in stacked thirds.

## 1. Three stacked lines or three stacked spaces

Tonal harmony is built primarily in stacked thirds (tertian harmony). Pick any pitch as your Root, skip a letter to add its Third, and skip another letter to add its Fifth.

In close root position on any staff, a triad forms an unmistakable snowman silhouette: either three consecutive lines (e.g., E4–G4–B4) or three consecutive spaces (F4–A4–C5).

## Worked Example: Building a root-position triad on B

Find the three letter names belonging to a root-position B triad.
1. Root = B.
2. Skip C → 3rd = D.
3. Skip E → 5th = F.
Every B triad uses letters B–D–F regardless of accidentals (B–D–F = diminished, B–D–F♯ = minor, B–D♯–F♯ = major).

## Practical Application

On the staff and keyboard, notice that any root-position triad consists either entirely of lines (Line-Line-Line) or entirely of spaces (Space-Space-Space). This visual symmetry enables instant recognition.

## Summary

Triads pair a root, third, and fifth into music''s basic three-note chord unit, stacking uniformly on lines or spaces in close root position.
',
  '{"sections":[{"id":"tertian-stacking","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"h"},{"keys":["F4","A4","C5"],"duration":"h"},{"keys":["G4","B4","D5"],"duration":"h"}],"label":"Three root-position diatonic triads C major, F major, and G major","caption":"Root-position triads C–E–G (lines/ledger), F–A–C (three stacked spaces), and G–B–D (three stacked lines)."}}],"practiceActivities":[{"id":"triads-q1","prompt":"Which three letter names form a root-position triad rooted on D?","options":[{"id":"dfg","label":"D – F – G"},{"id":"dfa","label":"D – F – A"},{"id":"dea","label":"D – E – A"},{"id":"dab","label":"D – A – B"}],"correctOptionId":"dfa","explanation":"Stacking thirds upward from D gives Root (D), 3rd (F), and 5th (A)."}],"terminology":[{"term":"Triad","definition":"A three-note chord constructed by stacking two thirds on top of a foundational root."},{"term":"Root","definition":"The foundational pitch upon which a triad or chord is generated."},{"term":"Third","definition":"The middle pitch of a triad, situated a generic third above the root."},{"term":"Fifth","definition":"The top pitch of a root-position triad, situated a generic fifth above the root."},{"term":"Tertian Harmony","definition":"The harmonic system based entirely upon building chords in stacked thirds."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4"],"showLabels":true,"label":"Root, Third, and Fifth of C Major Triad","caption":"C4 (Root) + E4 (Third) + G4 (Fifth) stacked on alternating white keys."},"practicalApplication":"On the staff and keyboard, notice that any root-position triad consists either entirely of lines (Line-Line-Line) or entirely of spaces (Space-Space-Space). This visual symmetry enables instant recognition.","videoResource":{"title":"BerkleeX: Triad Construction and Voicing","publisher":"Berklee College of Music","url":"https://www.edx.org/learn/music-theory/berklee-college-of-music-introduction-to-music-theory","embedPermitted":false,"notes":"Prof. George W. Russell Jr. builds triads across all 12 chromatic roots using keyboard geometry."},"references":[{"title":"Open Music Theory: Triads","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Tertian stacking, root identification, and chord spelling conventions."},{"title":"Integrated Musicianship: Triads and Aural Skills","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Singing and aurally identifying triad roots and chord qualities."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["Ab4","C5","Eb5"],"at":0,"duration":0.85},{"notes":["Db4","F4","Ab4"],"at":0.9,"duration":0.85},{"notes":["Eb4","G4","Bb4"],"at":1.8,"duration":0.85},{"notes":["Ab4","C5","Eb5"],"at":2.7,"duration":1.1}]}'::jsonb,
  8,
  4,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'triads-and-voicing' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'major-and-minor-chords',
  'Major and minor chords',
  'Spell and recognize Major (M3 + m3) and Minor (m3 + M3) triads quickly in any key.',
  '# Major and minor chords

Spell and recognize Major (M3 + m3) and Minor (m3 + M3) triads quickly in any key.

## Learning Objectives

- Spell Major triads with a Major 3rd on the bottom (4 semitones) and a Minor 3rd on top (3 semitones), framing a Perfect 5th.
- Spell Minor triads by reversing the stack: Minor 3rd on the bottom (3 st) + Major 3rd on top (4 st).
- Convert any Major triad into its parallel Minor triad by lowering the 3rd by one semitone.

## Musical Terminology

- **Major Triad**: A triad consisting of a Major 3rd (4 semitones) plus a Minor 3rd (3 semitones), with a Perfect 5th between root and fifth.
- **Minor Triad**: A triad consisting of a Minor 3rd (3 semitones) plus a Major 3rd (4 semitones), with a Perfect 5th between root and fifth.
- **Chord Quality**: The inherent sonority (major, minor, diminished, augmented) determined by its internal interval configuration.

## 1. Symmetric third pairs sharing a Perfect Fifth

Both Major and Minor triads rest upon a stable Perfect Fifth (7 semitones) between root and fifth. What defines their contrasting mood sits in the middle voice—the chordal third.

A MAJOR triad places a Major 3rd (4 semitones) beneath a Minor 3rd (3 semitones), as in C–E–G or A–C♯–E. A MINOR triad flips them—Minor 3rd (3 semitones) beneath a Major 3rd (4 semitones), as in C–E♭–G or A–C–E.

## Worked Example: Spelling E Major and F Minor triads

Spell root-position triads from first principles.
1. E triad letters = E–G–B. From E up 4 semitones = G♯; up 3 more = B (P5 above E). → E–G♯–B = E Major.
2. F triad letters = F–A–C. F Major is F–A–C; lower the 3rd by 1 semitone → F–A♭–C = F Minor.
E Major = E–G♯–B; F Minor = F–A♭–C.

## Practical Application

To hear the difference clearly, arpeggiate both chords slowly from the root up. The major third in a major triad aligns with the natural acoustic 5th harmonic of the overtone series, producing its radiant clarity.

## Summary

Major triads stack M3 + m3 while Minor triads stack m3 + M3; lowering the third by a single semitone switches Major to Minor.
',
  '{"sections":[{"id":"major-vs-minor-structure","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"h"},{"keys":["C4","Eb4","G4"],"duration":"h"},{"keys":["A4","C#5","E5"],"duration":"h"},{"keys":["A4","C5","E5"],"duration":"h"}],"label":"C major vs C minor, and A major vs A minor triads","caption":"Lowering the chordal 3rd one semitone turns Major (C–E–G, A–C♯–E) directly into Minor (C–E♭–G, A–C–E)."}}],"practiceActivities":[{"id":"majmin-q1","prompt":"Which pitches form a root-position B minor triad?","options":[{"id":"bdf","label":"B – D – F"},{"id":"bdfs","label":"B – D – F♯"},{"id":"bdsfs","label":"B – D♯ – F♯"},{"id":"bdbf","label":"B – D♭ – F"}],"correctOptionId":"bdfs","explanation":"B to D = 3 semitones (m3) and D to F♯ = 4 semitones (M3), framing B–F♯ (P5)."}],"terminology":[{"term":"Major Triad","definition":"A triad consisting of a Major 3rd (4 semitones) plus a Minor 3rd (3 semitones), with a Perfect 5th between root and fifth."},{"term":"Minor Triad","definition":"A triad consisting of a Minor 3rd (3 semitones) plus a Major 3rd (4 semitones), with a Perfect 5th between root and fifth."},{"term":"Chord Quality","definition":"The inherent sonority (major, minor, diminished, augmented) determined by its internal interval configuration."}],"keyboardIllustration":{"highlightNotes":["C4","E4","Eb4","G4"],"showLabels":true,"label":"C Major (C-E-G) vs. C Minor (C-Eb-G)","caption":"The root (C4) and fifth (G4) remain identical; changing E4 to Eb4 transforms major to minor."},"practicalApplication":"To hear the difference clearly, arpeggiate both chords slowly from the root up. The major third in a major triad aligns with the natural acoustic 5th harmonic of the overtone series, producing its radiant clarity.","videoResource":{"title":"Open Yale Courses: Major and Minor Triad Sonorities","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Psychological and physical acoustic examination of major vs. minor chords."},"references":[{"title":"Open Music Theory: Triad Qualities","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Internal interval recipes for major and minor triads."},{"title":"Musictheory.net: Introduction to Chords","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/40","licence":"Free Web Educational Access","relevance":"Visual guide to triad qualities on the staff."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D4","F4","A4"],"at":0,"duration":0.85},{"notes":["D4","F#4","A4"],"at":0.92,"duration":1.1}]}'::jsonb,
  9,
  5,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'triads-and-voicing' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'diminished-and-augmented-chords',
  'Diminished and augmented chords',
  'Construct symmetric diminished (m3 + m3) and augmented (M3 + M3) triads and understand why both destabilize tonal focus.',
  '# Diminished and augmented chords

Construct symmetric diminished (m3 + m3) and augmented (M3 + M3) triads and understand why both destabilize tonal focus.

## Learning Objectives

- Spell Diminished triads from two stacked minor thirds (3 + 3 = 6 semitones, Diminished 5th).
- Spell Augmented triads from two stacked major thirds (4 + 4 = 8 semitones, Augmented 5th).
- Explain why both altered-fifth chords demand resolution toward major or minor triads.

## Musical Terminology

- **Diminished Triad**: A triad consisting of two stacked Minor 3rds (3 semitones + 3 semitones), with a Diminished 5th (tritone) between root and fifth.
- **Augmented Triad**: A triad consisting of two stacked Major 3rds (4 semitones + 4 semitones), with an Augmented 5th (8 semitones) between root and fifth.
- **Symmetrical Harmony**: Chords that divide the octave into equal interval segments, creating ambiguous tonal pull.

## 1. Compressing or expanding the outer fifth

Unlike Major and Minor triads with their stable Perfect 5th, Diminished and Augmented triads alter the fifth into acoustic restlessness. Lower the 5th of a minor triad by a semitone to get a DIMINISHED triad (two stacked minor thirds: e.g., B–D–F or C–E♭–G♭, spanning a tense tritone).

Raise the 5th of a major triad by a semitone to get an AUGMENTED triad (two stacked major thirds: e.g., C–E–G♯, spanning 8 semitones). Every major key naturally contains one diminished triad built on the leading tone (vii° = B–D–F in C major).

## Worked Example: Transforming D Major into D Diminished and D Augmented

Adjust the fifth (and third) starting from D–F♯–A.
1. D Major = D–F♯–A.
2. To make D Augmented (D+): keep F♯ and raise the 5th A → A♯ (D–F♯–A♯).
3. To make D Diminished (d°): lower both 3rd (F♯ → F♮) and 5th (A → A♭) → D–F–A♭.
D+ = D–F♯–A♯; d° = D–F–A♭.

## Practical Application

Diminished triads naturally occur on scale degree 7 in major keys (vii°) and function as dominant tension chords. Augmented triads do not occur diatonic in major, but appear on degree 3 of harmonic minor (III+).

## Summary

Diminished (m3 + m3) and Augmented (M3 + M3) triads alter the stable outer fifth, injecting urgent dissonance and color.
',
  '{"sections":[{"id":"symmetric-triads","notation":{"clef":"treble","chords":[{"keys":["B4","D5","F5"],"duration":"h"},{"keys":["C4","E4","G#4"],"duration":"h"}],"label":"Diminished triad B-D-F followed by Augmented triad C-E-G#","caption":"B Diminished (m3 + m3, B–F tritone) contrasted with C Augmented (M3 + M3, C–G♯)."}}],"practiceActivities":[{"id":"dimaug-q1","prompt":"Which set of pitches creates a C♯ Diminished triad?","options":[{"id":"cseg","label":"C♯ – E – G"},{"id":"csegs","label":"C♯ – E – G♯"},{"id":"csesgs","label":"C♯ – E♯ – G♯"},{"id":"csesg","label":"C♯ – E♯ – G"}],"correctOptionId":"cseg","explanation":"C♯ to E = m3 (3 st) and E to G = m3 (3 st), spanning a diminished 5th C♯–G."}],"terminology":[{"term":"Diminished Triad","definition":"A triad consisting of two stacked Minor 3rds (3 semitones + 3 semitones), with a Diminished 5th (tritone) between root and fifth."},{"term":"Augmented Triad","definition":"A triad consisting of two stacked Major 3rds (4 semitones + 4 semitones), with an Augmented 5th (8 semitones) between root and fifth."},{"term":"Symmetrical Harmony","definition":"Chords that divide the octave into equal interval segments, creating ambiguous tonal pull."}],"keyboardIllustration":{"highlightNotes":["B3","D4","F4","C4","E4","G#4"],"showLabels":true,"label":"Diminished (B-D-F) and Augmented (C-E-G#) triads","caption":"B diminished contains two minor 3rds; C augmented contains two major 3rds."},"practicalApplication":"Diminished triads naturally occur on scale degree 7 in major keys (vii°) and function as dominant tension chords. Augmented triads do not occur diatonic in major, but appear on degree 3 of harmonic minor (III+).","videoResource":{"title":"Berklee Online: Diminished and Augmented Chords in Context","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee clinic on chromatic triad qualities, leading-tone resolution, and symmetrical division."},"references":[{"title":"Open Music Theory: Triad Qualities and Inversions","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Diminished and augmented triad construction and voice leading."},{"title":"Fundamentals of Music Theory: Chords and Harmonisation","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Triad quality comparisons and functional roles."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4","E4","G#4"],"at":0,"duration":0.85},{"notes":["F4","A4","C5"],"at":0.95,"duration":1}]}'::jsonb,
  8,
  6,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'triads-and-voicing' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'chord-inversions',
  'Chord inversions',
  'Move the bass voice cleanly between root position, first inversion (6), and second inversion (6/4) to create smooth melodic basslines.',
  '# Chord inversions

Move the bass voice cleanly between root position, first inversion (6), and second inversion (6/4) to create smooth melodic basslines.

## Learning Objectives

- Identify triad inversions solely by which chord member (Root, 3rd, or 5th) sits in the lowest bass voice.
- Apply standard figured bass / Roman inversion numerals: root position (5/3), first inversion (6), second inversion (6/4).
- Read slash chord notation cleanly (e.g., C/E = C major triad with E in the bass).

## Musical Terminology

- **Inversion**: Rearranging the notes of a chord so that a pitch other than the root sounds in the lowest voice (bass).
- **Root Position (5/3)**: The root is in the lowest voice (bass); thirds and fifths sound above it.
- **First Inversion (6/3 or 6)**: The third of the chord is in the bass; intervals of a 6th and 3rd sound above it.
- **Second Inversion (6/4)**: The fifth of the chord is in the bass; intervals of a 6th and 4th sound above it (unstable, requiring resolution).
- **Figured Bass**: A baroque system of numbers written below the bass line indicating intervals to be realized above the bass.

## 1. Only the lowest sounding note decides inversion

Reordering upper notes does NOT change chord inversion: only which chord member sits in the BASS (the lowest sounding note) determines the inversion. When the Root sits in the bass, the triad is in ROOT POSITION (5/3).

When the 3rd sits in the bass, the chord is in FIRST INVERSION (figured 6 or 6/3, slash e.g. C/E)—lightweight and flowing, ideal for stepwise basslines. When the 5th sits in the bass, the chord is in SECOND INVERSION (figured 6/4, slash e.g. C/G)—unstable because of the fourth above the bass, reserved classically for cadential, passing, or pedal effects.

## Worked Example: Identifying an F–A–D sonority

Analyze the bass pitch D3? No—suppose the lowest bass note is F3 under A4 and D5.
1. Arrange the pitches into stacked thirds to locate the Root: D–F–A (D minor triad).
2. Check which member sits in the lowest bass voice: F3, which is the chordal 3rd of D–F–A.
3. 3rd in the bass = First Inversion.
F3–A4–D5 is D minor in First Inversion (Dm/F or i6 in D minor).

## Practical Application

Inversions create beautiful melodic bass lines. Instead of the bass leaping by fourths and fifths between roots, using first-inversion chords (such as I - V6 - I) allows the bass to move smoothly by step.

## Summary

Inversions place the 3rd (6) or 5th (6/4) into the bass, enabling linear stepwise basslines while retaining harmonic identity.
',
  '{"sections":[{"id":"bass-determines-inversion","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"h"},{"keys":["E4","G4","C5"],"duration":"h"},{"keys":["G4","C5","E5"],"duration":"h"}],"label":"C major triad in root position (C-E-G), first inversion (E-G-C), and second inversion (G-C-E)","caption":"Root position (C bass), 1st inversion I6 (E bass), and 2nd inversion I6/4 (G bass)."}}],"practiceActivities":[{"id":"inv-q1","prompt":"If a G Major triad (G–B–D) has D as its lowest bass pitch, what inversion is it in?","options":[{"id":"root","label":"Root position (5/3)"},{"id":"first","label":"First inversion (6)"},{"id":"second","label":"Second inversion (6/4)"},{"id":"third","label":"Third inversion (4/2)"}],"correctOptionId":"second","explanation":"D is the 5th of the G–B–D triad; putting the 5th in the bass creates Second Inversion (6/4)."}],"terminology":[{"term":"Inversion","definition":"Rearranging the notes of a chord so that a pitch other than the root sounds in the lowest voice (bass)."},{"term":"Root Position (5/3)","definition":"The root is in the lowest voice (bass); thirds and fifths sound above it."},{"term":"First Inversion (6/3 or 6)","definition":"The third of the chord is in the bass; intervals of a 6th and 3rd sound above it."},{"term":"Second Inversion (6/4)","definition":"The fifth of the chord is in the bass; intervals of a 6th and 4th sound above it (unstable, requiring resolution)."},{"term":"Figured Bass","definition":"A baroque system of numbers written below the bass line indicating intervals to be realized above the bass."}],"keyboardIllustration":{"highlightNotes":["E4","G4","C5","G3","C4","E4"],"showLabels":true,"label":"First inversion (E in bass) vs. Second inversion (G in bass)","caption":"First inversion (E4-G4-C5, ''C/E'') provides smooth bass lines; second inversion (''C/G'') functions as a cadential suspension."},"practicalApplication":"Inversions create beautiful melodic bass lines. Instead of the bass leaping by fourths and fifths between roots, using first-inversion chords (such as I - V6 - I) allows the bass to move smoothly by step.","videoResource":{"title":"Open Yale Courses: Chord Inversions and the Bass Line","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Analysis of classical bass line counterpoint using root position and first inversion triads."},"references":[{"title":"Open Music Theory: Inversion and Figured Bass","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Historical realization of figured bass notation (5/3, 6/3, 6/4)."},{"title":"Juilliard Extension: Harmony and Analysis Sequence","authorOrInstitution":"The Juilliard School","url":"https://www.juilliard.edu/stage-beyond/juilliard-extension","licence":"Proprietary Institutional Curriculum","relevance":"Conservatory voice-leading guidelines for first and second inversion triads."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D3","F#4","A4"],"at":0,"duration":0.6},{"notes":["C#3","E4","A4"],"at":0.62,"duration":0.6},{"notes":["B2","D4","G4"],"at":1.24,"duration":0.6},{"notes":["A2","C#4","E4"],"at":1.86,"duration":0.9}]}'::jsonb,
  10,
  7,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'triads-and-voicing' AND c.slug = 'intervals-and-triads'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'seventh-chords',
  'Seventh chords',
  'Extend triads with a fourth stacked third to form Dominant 7th, Major 7th, Minor 7th, and Diminished 7th chords.',
  '# Seventh chords

Extend triads with a fourth stacked third to form Dominant 7th, Major 7th, Minor 7th, and Diminished 7th chords.

## Learning Objectives

- Add a 7th above a triad''s root (Root–3rd–5th–7th) to build four-note seventh chords.
- Distinguish Major 7th (Maj triad + M7), Dominant 7th (Maj triad + m7), and Minor 7th (min triad + m7).
- Hear the tritone inside Dominant 7th (V7, e.g. B–F inside G–B–D–F) pulling cleanly inward to tonic.

## Musical Terminology

- **Seventh Chord**: A four-note tertian chord formed by adding an interval of a seventh above the root.
- **Dominant Seventh (V7)**: A major triad with a minor seventh (Major-Minor 7th); the primary engine of tonal resolution.
- **Major Seventh (M7)**: A major triad with a major seventh; warm, lush, and stable in jazz and impressionist music.
- **Minor Seventh (m7)**: A minor triad with a minor seventh; common on scale degrees ii, iii, and vi.
- **Half-Diminished (ø7)**: A diminished triad with a minor seventh; occurs naturally on degree vii° in major and ii° in minor.

## 1. Dominant 7th, Major 7th, and Minor 7th

Stacking one more third atop a triad yields a four-note SEVENTH CHORD. Two ingredients name every seventh chord: [Triad quality] + [7th interval above the root].

1. Dominant Seventh (G7 = G–B–D–F): Major triad + minor 7th. Contains the potent B–F tritone between 3rd and 7th—giving V7 its irresistible harmonic drive into C major. 2. Major Seventh (Cmaj7 = C–E–G–B): Major triad + Major 7th. 3. Minor Seventh (Dm7 = D–F–A–C): Minor triad + minor 7th. 4. Half-diminished 7th (Bm7♭5 = B–D–F–A): Diminished triad + minor 7th. 5. Fully diminished 7th (B°7 = B–D–F–A♭): Diminished triad + diminished 7th.

## Worked Example: Building D7 vs. Dmaj7 vs. Dm7

Spell all three seventh types rooted on D.
1. D triad letters = D–F–A–C.
2. Dmaj7 (Major triad + Major 7th): D – F♯ – A – C♯.
3. D7 (Dominant = Major triad + minor 7th): D – F♯ – A – C♮.
4. Dm7 (Minor triad + minor 7th): D – F♮ – A – C♮.
Changing just two half steps spans Dmaj7 → D7 → Dm7 cleanly.

## Practical Application

In any dominant seventh chord (V7), trace the two active tendency tones: the 3rd (leading tone) resolves UP by half step to the tonic; the 7th resolves DOWN by step to the 3rd of the tonic chord.

## Summary

Seventh chords layer a fourth note onto a triad, with Dominant V7 supplying classical harmony''s strongest cadential pull via its resolving chordal 7th.
',
  '{"sections":[{"id":"five-common-sevenths","notation":{"clef":"treble","chords":[{"keys":["G4","B4","D5","F5"],"duration":"h"},{"keys":["C4","E4","G4","C5"],"duration":"h"}],"label":"G dominant seventh chord (G-B-D-F) resolving to C major (C-E-G-C)","caption":"V7 (G–B–D–F): B4 pushes up to C5 while chordal 7th F5 steps down to E4."}}],"practiceActivities":[{"id":"seventh-q1","prompt":"Which chord combines a Major triad with a minor 7th above the root (e.g. G–B–D–F)?","options":[{"id":"maj7","label":"Major seventh (Maj7)"},{"id":"dom7","label":"Dominant seventh (7)"},{"id":"min7","label":"Minor seventh (m7)"},{"id":"hdim7","label":"Half-diminished seventh (ø7)"}],"correctOptionId":"dom7","explanation":"A Major triad + minor 7th defines the Dominant seventh chord (built naturally on scale degree 5)."}],"terminology":[{"term":"Seventh Chord","definition":"A four-note tertian chord formed by adding an interval of a seventh above the root."},{"term":"Dominant Seventh (V7)","definition":"A major triad with a minor seventh (Major-Minor 7th); the primary engine of tonal resolution."},{"term":"Major Seventh (M7)","definition":"A major triad with a major seventh; warm, lush, and stable in jazz and impressionist music."},{"term":"Minor Seventh (m7)","definition":"A minor triad with a minor seventh; common on scale degrees ii, iii, and vi."},{"term":"Half-Diminished (ø7)","definition":"A diminished triad with a minor seventh; occurs naturally on degree vii° in major and ii° in minor."}],"keyboardIllustration":{"highlightNotes":["G3","B3","D4","F4"],"showLabels":true,"label":"Dominant 7th chord in C Major (G-B-D-F)","caption":"Contains the B-F tritone between third and seventh, which drives compellingly to C and E in the tonic chord."},"practicalApplication":"In any dominant seventh chord (V7), trace the two active tendency tones: the 3rd (leading tone) resolves UP by half step to the tonic; the 7th resolves DOWN by step to the 3rd of the tonic chord.","videoResource":{"title":"Berklee Online: Seventh Chords and Harmonic Tension","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Prof. George W. Russell Jr. analyzes the sonic qualities and inversions of the five principal seventh chords."},"references":[{"title":"Open Music Theory: Seventh Chords","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Construction, qualities, and figured bass symbols for all seventh chords."},{"title":"Harmony and Musicianship with Solfège: Seventh Chords","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Voice leading and resolution tendencies of diatonic seventh chords."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4","E4","G4","Bb4"],"at":0,"duration":0.95},{"notes":["F4","A4","C5"],"at":1,"duration":1.1}]}'::jsonb,
  10,
  8,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sevenths-and-tonal-syntax' AND c.slug = 'inversions-sevenths-and-progressions'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'roman-numeral-analysis',
  'Roman numeral analysis',
  'Label diatonic chords independently of specific key names using uppercase/lowercase Roman numerals (I, ii, iii, IV, V, vi, vii°).',
  '# Roman numeral analysis

Label diatonic chords independently of specific key names using uppercase/lowercase Roman numerals (I, ii, iii, IV, V, vi, vii°).

## Learning Objectives

- Memorize the diatonic triad qualities of EVERY Major key: I, ii, iii, IV, V, vi, vii°.
- Recognize natural/harmonic minor chord qualities: i, ii°, III, iv, V (or v), VI, vii°.
- Read key-independent harmonic function across transposed keys.

## Musical Terminology

- **Roman Numeral Analysis**: A system of naming chords using Roman numerals to indicate scale degree root and chord quality.
- **Uppercase Numerals**: Signify Major chords (e.g. I, IV, V).
- **Lowercase Numerals**: Signify Minor chords (e.g. ii, iii, vi) and Diminished chords with a degree symbol (e.g. vii°).
- **Harmonic Function**: The role a chord plays in establishing or destabilizing the tonal center (Tonic, Predominant, Dominant).

## 1. Key-independent harmonic grammar

Roman numeral analysis strips away pitch-specific labels like ''G major vs F♯ major'' to expose pure harmonic syntax. Case encodes chord quality: UPPERCASE (I, IV, V) = Major; lowercase (ii, iii, vi) = minor; lowercase with circle (vii°, ii°) = diminished.

Across EVERY major key, stacking only scale notes on degrees 1–7 builds an unvarying pattern: I (Maj) – ii (min) – iii (min) – IV (Maj) – V (Maj) – vi (min) – vii° (dim).

## Worked Example: Labeling E minor and A7 inside the key of D Major

Identify the Roman numerals when key = D Major.
1. Scale of D Major: D(1) – E(2) – F♯(3) – G(4) – A(5) – B(6) – C♯(7).
2. E–G–B builds a minor triad on scale degree 2 → ii.
3. A–C♯–E–G builds a dominant seventh on scale degree 5 → V7.
In D Major, Em → A7 → D reads cleanly as ii → V7 → I.

## Practical Application

Roman numerals free you from fixed key spellings. A I - IV - V - I progression functions identically whether played in C Major, F# Major, or Db Major, making transposing effortless.

## Summary

Roman numerals turn key-specific chord letters into reusable functional patterns transferable across all twelve keys.
',
  '{"sections":[{"id":"diatonic-roman-system","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"q"},{"keys":["D4","F4","A4"],"duration":"q"},{"keys":["E4","G4","B4"],"duration":"q"},{"keys":["F4","A4","C5"],"duration":"q"},{"keys":["G4","B4","D5"],"duration":"q"},{"keys":["A4","C5","E5"],"duration":"q"},{"keys":["B4","D5","F5"],"duration":"q"}],"label":"Seven diatonic triads of C major: I, ii, iii, IV, V, vi, vii°","caption":"Diatonic triads of C Major: I (C), ii (Dm), iii (Em), IV (F), V (G), vi (Am), vii° (B°)."}}],"practiceActivities":[{"id":"roman-q1","prompt":"In the key of G Major, what Roman numeral describes an E minor chord (E–G–B)?","options":[{"id":"ii","label":"ii"},{"id":"iii","label":"iii"},{"id":"iv","label":"iv"},{"id":"vi","label":"vi"}],"correctOptionId":"vi","explanation":"Count scale degrees in G major: G(1)–A(2)–B(3)–C(4)–D(5)–E(6). Degree 6 produces a minor triad: vi."}],"terminology":[{"term":"Roman Numeral Analysis","definition":"A system of naming chords using Roman numerals to indicate scale degree root and chord quality."},{"term":"Uppercase Numerals","definition":"Signify Major chords (e.g. I, IV, V)."},{"term":"Lowercase Numerals","definition":"Signify Minor chords (e.g. ii, iii, vi) and Diminished chords with a degree symbol (e.g. vii°)."},{"term":"Harmonic Function","definition":"The role a chord plays in establishing or destabilizing the tonal center (Tonic, Predominant, Dominant)."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4","F4","A4","C5","G4","B4","D5"],"showLabels":true,"label":"I (C Major), IV (F Major), V (G Major) Primary Triads","caption":"The three primary major triads in C Major define the harmonic pillars of tonal music."},"practicalApplication":"Roman numerals free you from fixed key spellings. A I - IV - V - I progression functions identically whether played in C Major, F# Major, or Db Major, making transposing effortless.","videoResource":{"title":"Open Yale Courses: Harmonic Syntax and Roman Numerals","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Lecture 6 covers Roman numeral notation, chord function, and classical harmonic syntax."},"references":[{"title":"Open Music Theory: Roman Numerals","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Standardized North American conventions for Roman numeral chord labeling."},{"title":"Musictheory.net: Roman Numeral Analysis","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/44","licence":"Free Web Educational Access","relevance":"Interactive drills analyzing diatonic chord progressions."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D4","F#4","A4"],"at":0,"duration":0.5},{"notes":["A3","E4","A4"],"at":0.52,"duration":0.5},{"notes":["B3","D4","F#4"],"at":1.04,"duration":0.5},{"notes":["F#3","C#4","F#4"],"at":1.56,"duration":0.5}]}'::jsonb,
  9,
  9,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sevenths-and-tonal-syntax' AND c.slug = 'inversions-sevenths-and-progressions'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'basic-harmonic-progressions',
  'Basic harmonic progressions',
  'Understand Tonic, Predominant, and Dominant functions, identify Authentic, Half, Plagal, and Deceptive cadences, and build balanced progressions.',
  '# Basic harmonic progressions

Understand Tonic, Predominant, and Dominant functions, identify Authentic, Half, Plagal, and Deceptive cadences, and build balanced progressions.

## Learning Objectives

- Group chords into three functional roles: Tonic (I, vi), Predominant (ii, IV), Dominant (V, V7, vii°).
- Recognize standard functional cycle motion: T → PD → D → T (e.g., I – ii6 – V – I or I – IV – V – I).
- Distinguish Authentic (V–I), Half (ending on V), Plagal (IV–I), and Deceptive (V–vi) cadences.

## Musical Terminology

- **Harmonic Progression**: A succession of musical chords that moves forward with direction toward a cadence.
- **Tonic Function (T)**: Chords of rest and resolution (I and vi).
- **Predominant Function (PD)**: Chords that lead toward the dominant (IV and ii).
- **Dominant Function (D)**: Chords of maximum tension driving to the tonic (V and vii°).
- **Circle-of-Fifths Progression**: A progression moving root motion by descending fifths (e.g. vi - ii - V - I).

## 1. T → PD → D → T & the four classical cadences

Common-practice harmony thrives on forward harmonic drive rather than random chord changes. Chords serve three functional roles: TONIC (stability/home: I, vi), PREDOMINANT (departure preparing dominant tension: IV, ii), and DOMINANT (urgent tension pulling home: V, V7, vii°).

Phrases close with CADENCES—musical punctuation marks: 1. Authentic Cadence (V → I, conclusive full stop). 2. Half Cadence (ending unresolved on V, comma/question). 3. Plagal Cadence (IV → I, gentle ''Amen'' repose). 4. Deceptive Cadence (V → vi, dramatic surprise postponing arrival).

## Worked Example: Spotting a Deceptive Cadence in F Major

A phrase in F Major lands on C7 and resolves unexpectedly to Dm.
1. In F Major, C7 = V7 (Dominant seventh).
2. Standard Authentic Cadence expects F (I).
3. Instead it steps into Dm (D–F–A) = scale degree 6 minor triad (vi).
V7 → vi is a Deceptive Cadence.

## Practical Application

Always organize progressions in your mind by functional categories: Tonic -> Predominant -> Dominant -> Tonic (T -> PD -> D -> T). Never move from Dominant backwards to Predominant in classical style (e.g. avoid V -> IV).

## Summary

Tonal harmony organizes motion cleanly across Tonic, Predominant, and Dominant roles, punctuated by Authentic, Half, Plagal, and Deceptive cadences.
',
  '{"sections":[{"id":"phrase-functions-and-cadences","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4"],"duration":"q"},{"keys":["D4","F4","A4"],"duration":"q"},{"keys":["G4","B4","D5"],"duration":"q"},{"keys":["C4","E4","G4"],"duration":"q"}],"label":"Complete I - ii - V - I authentic cadence phrase in C major","caption":"Classic tonal arc: Tonic (I) → Predominant (ii) → Dominant (V) → Tonic (I)."}}],"practiceActivities":[{"id":"prog-q1","prompt":"Which sequence follows the standard classical functional flow Tonic → Predominant → Dominant → Tonic?","options":[{"id":"i-iv-v-i","label":"I → IV → V → I"},{"id":"v-iv-i-v","label":"V → IV → I → V"},{"id":"i-v-iv-vi","label":"I → V → IV → vi"},{"id":"iv-i-iii-ii","label":"IV → I → iii → ii"}],"correctOptionId":"i-iv-v-i","explanation":"I (Tonic) departs to IV (Predominant), builds tension on V (Dominant), and resolves cleanly home to I."}],"terminology":[{"term":"Harmonic Progression","definition":"A succession of musical chords that moves forward with direction toward a cadence."},{"term":"Tonic Function (T)","definition":"Chords of rest and resolution (I and vi)."},{"term":"Predominant Function (PD)","definition":"Chords that lead toward the dominant (IV and ii)."},{"term":"Dominant Function (D)","definition":"Chords of maximum tension driving to the tonic (V and vii°)."},{"term":"Circle-of-Fifths Progression","definition":"A progression moving root motion by descending fifths (e.g. vi - ii - V - I)."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4","D4","F4","A4","G4","B4","D5"],"showLabels":true,"label":"Tonic to Predominant to Dominant (I - ii - V - I)","caption":"The fundamental syntax of classical harmony: Home (I) -> Bridge (ii) -> Tension (V) -> Home (I)."},"practicalApplication":"Always organize progressions in your mind by functional categories: Tonic -> Predominant -> Dominant -> Tonic (T -> PD -> D -> T). Never move from Dominant backwards to Predominant in classical style (e.g. avoid V -> IV).","videoResource":{"title":"Berklee Online: The Circle of Fifths and Chord Progressions","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee masterclass on chord motion, circle-of-fifths voice leading, and cadence arrivals."},"references":[{"title":"Open Music Theory: Harmonic Syntax — A Primer","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"The T-PD-D-T functional paradigm governing common practice harmony."},{"title":"Fundamentals of Music Theory: Functional Harmony","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Voice leading in functional harmonic sequences."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["C4","E4","G4"],"at":0,"duration":0.6},{"notes":["F4","A4","C5"],"at":0.62,"duration":0.6},{"notes":["G4","B4","D5"],"at":1.24,"duration":0.6},{"notes":["A4","C5","E5"],"at":1.86,"duration":1}]}'::jsonb,
  11,
  10,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sevenths-and-tonal-syntax' AND c.slug = 'inversions-sevenths-and-progressions'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'cadences',
  'Musical cadences and structural punctuation',
  'Master the four core harmonic cadences—Authentic, Half, Plagal, and Deceptive—and their role in musical punctuation and phrase closure.',
  '# Musical cadences and structural punctuation

Master the four core harmonic cadences—Authentic, Half, Plagal, and Deceptive—and their role in musical punctuation and phrase closure.

## Learning Objectives

- Identify and construct Perfect Authentic (PAC), Imperfect Authentic (IAC), Half (HC), Plagal (PC), and Deceptive (DC) cadences.
- Correlate musical cadences to linguistic punctuation (period, comma, exclamation mark).
- Analyze cadence points in classical phrases and determine strong vs. weak phrase endings.

## Musical Terminology

- **Cadence**: A two-chord formula that concludes a musical phrase, section, or piece.
- **Perfect Authentic Cadence (PAC)**: A V to I cadence where both chords are in root position and the highest soprano voice resolves to scale degree 1.
- **Imperfect Authentic Cadence (IAC)**: A V to I cadence where one or both chords are inverted, or where the soprano ends on degree 3 or 5.
- **Half Cadence (HC)**: A cadence that pauses on the dominant (V) chord, sounding incomplete like a comma or question mark.
- **Plagal Cadence (PC)**: A IV to I cadence (''Amen'' cadence) often following an authentic cadence.
- **Deceptive Cadence (DC)**: A V to vi cadence where the dominant resolves unexpectedly to submediant instead of tonic.

## 1. The Grammar of Musical Closure

Just as sentences in literature end with periods, commas, or question marks, musical phrases conclude with cadences. Cadences establish the hierarchy of musical form: without them, music would feel like an endless, unpunctuated run-on sentence.

The strongest closure is the Perfect Authentic Cadence (PAC), requiring root-position V to I with the tonic in the highest voice. A Half Cadence (HC) ends on V, creating an open question that demands an answering phrase.

## Worked Example: Classifying a Phrase Ending as PAC vs. IAC

In C Major, a phrase ends with a root position G major chord moving to a root position C major chord, with E5 sounding in the soprano voice.
1. Both chords are in root position: V to I.
2. Inspect the highest voice (soprano) of the arrival chord: E5 is scale degree 3, not scale degree 1 (C).
3. Because scale degree 1 is not in the soprano, the cadence cannot be a PAC.
The phrase concludes with an Imperfect Authentic Cadence (IAC) because the soprano ends on scale degree 3.

## Practical Application

When practicing any piece, first identify the cadence points at the ends of phrases. Pausing slightly at Half Cadences and breathing before the answering phrase gives your performance natural rhetorical shape.

## Summary

Cadences are the structural punctuation marks of music, organizing continuous melody into balanced phrases through varying degrees of harmonic tension and finality.
',
  '{"sections":[{"id":"cadence-types-overview","notation":{"clef":"treble","chords":[{"keys":["G4","B4","D5"],"duration":"h"},{"keys":["C4","E4","G4","C5"],"duration":"h"}],"label":"Perfect Authentic Cadence (V to I)","caption":"V (G major) resolves to I (C major) with tonic C5 in soprano."}}],"workedExample":{"clef":"treble","chords":[{"keys":["G4","B4","D5"],"duration":"h"},{"keys":["C4","G4","E5"],"duration":"h"}],"label":"Imperfect Authentic Cadence (Soprano on 3)","caption":"V to I with soprano ending on E5 (scale degree 3)."},"practiceActivities":[{"id":"cadence-q1","prompt":"A phrase in G major ends with a D major chord (V) moving unexpectedly to an E minor chord (vi). What type of cadence is this?","options":[{"id":"deceptive","label":"Deceptive Cadence (DC)"},{"id":"plagal","label":"Plagal Cadence (PC)"},{"id":"half","label":"Half Cadence (HC)"},{"id":"pac","label":"Perfect Authentic Cadence (PAC)"}],"correctOptionId":"deceptive","explanation":"A cadence where the dominant (V) resolves unexpectedly to the submediant (vi) instead of tonic is a Deceptive Cadence."}],"terminology":[{"term":"Cadence","definition":"A two-chord formula that concludes a musical phrase, section, or piece."},{"term":"Perfect Authentic Cadence (PAC)","definition":"A V to I cadence where both chords are in root position and the highest soprano voice resolves to scale degree 1."},{"term":"Imperfect Authentic Cadence (IAC)","definition":"A V to I cadence where one or both chords are inverted, or where the soprano ends on degree 3 or 5."},{"term":"Half Cadence (HC)","definition":"A cadence that pauses on the dominant (V) chord, sounding incomplete like a comma or question mark."},{"term":"Plagal Cadence (PC)","definition":"A IV to I cadence (''Amen'' cadence) often following an authentic cadence."},{"term":"Deceptive Cadence (DC)","definition":"A V to vi cadence where the dominant resolves unexpectedly to submediant instead of tonic."}],"keyboardIllustration":{"highlightNotes":["G3","B3","D4","C4","E4","G4","C5"],"showLabels":true,"label":"Authentic Cadence voice leading on keyboard","caption":"Leading tone B3 steps up to C4; fifth D4 steps down to C4; root G3 jumps to C4 in bass."},"practicalApplication":"When practicing any piece, first identify the cadence points at the ends of phrases. Pausing slightly at Half Cadences and breathing before the answering phrase gives your performance natural rhetorical shape.","videoResource":{"title":"Open Yale Courses: Cadences and Musical Punctuation","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Prof. Wright explains the rhetorical function of PAC, IAC, Half, and Deceptive cadences in classical forms."},"references":[{"title":"Open Music Theory: Cadences","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Complete taxonomy of authentic, half, plagal, and deceptive cadences."},{"title":"Fundamentals of Music Theory: Cadences and Phrases","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Cadential analysis in baroque chorales and classical themes."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["G4","B4","D5"],"at":0,"duration":0.9},{"notes":["C4","G4","E5"],"at":1,"duration":1.2}],"repertoireSteps":[{"notes":["D4","F#4","A4"],"at":0,"duration":0.8},{"notes":["G4","B4","D5"],"at":0.9,"duration":1},{"notes":["G4","B4","D5"],"at":2,"duration":0.8},{"notes":["C4","E4","G4","C5"],"at":2.9,"duration":1.2}]}'::jsonb,
  11,
  11,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sevenths-and-tonal-syntax' AND c.slug = 'inversions-sevenths-and-progressions'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'basic-voice-leading',
  'Basic voice leading and part writing',
  'Master the core rules of 4-part SATB voice leading, including independent voice motion, doubling rules, and avoiding parallel fifths and octaves.',
  '# Basic voice leading and part writing

Master the core rules of 4-part SATB voice leading, including independent voice motion, doubling rules, and avoiding parallel fifths and octaves.

## Learning Objectives

- Apply 4-part SATB (Soprano, Alto, Tenor, Bass) vocal ranges and spacing limits.
- Execute contrary, parallel, similar, and oblique voice motion.
- Avoid parallel fifths and octaves to preserve voice independence.
- Follow standard doubling guidelines (double the root in root-position major and minor triads).

## Musical Terminology

- **Voice Leading (Part Writing)**: The principles governing how individual melodic lines (voices) move from chord to chord.
- **SATB**: The standard four-voice choir framework: Soprano, Alto, Tenor, and Bass.
- **Parallel Fifths / Octaves**: Two voices moving in the same direction separated by a fifth or octave; strictly avoided in classical counterpoint because it destroys voice independence.
- **Contrary Motion**: Two voices moving in opposite directions (one up, one down); the strongest tool for maintaining independent lines.
- **Tendency Tones**: Pitches with a strong directional drive (e.g. leading tone resolving up to tonic, chordal 7th resolving down).

## 1. The Golden Rule: Move each voice by the shortest path

In choral and classical music, chords are not struck as rigid blocks. Instead, they are formed by the confluence of four independent horizontal melodies: Soprano, Alto, Tenor, and Bass (SATB).

The foundational law of good voice leading is melodic economy: whenever possible, retain common tones in the same voice and move other voices by step to the nearest chord tone. This creates fluid, singable lines and avoids awkward leaps.

## Worked Example: Avoiding Parallel Fifths Between I and V

Voice a progression from C Major (I) to G Major (V) in 4-part SATB.
1. In the bass, move C3 up to G3 (or down to G2).
2. Do NOT move the upper voices in parallel fifths with the bass.
3. Instead, use CONTRARY MOTION: while the bass leaps, have the upper voices move downward to the nearest chord tones.
4. Soprano moves C5 down to B4; Alto moves G4 down to D4; Tenor moves E4 down to D4 or holds G.
Contrary motion between bass and soprano prevents parallel fifths and preserves voice independence.

## Practical Application

When writing four-part harmony, play each voice separately (Soprano alone, Alto alone, Tenor alone, Bass alone). If any inner voice feels unmusical or awkward to sing, adjust your voicing.

## Summary

Voice leading organizes chords as living, moving contrapuntal melodies; observing smooth stepwise motion and contrary direction maintains clean voice independence.
',
  '{"sections":[{"id":"voice-leading-principles","notation":{"clef":"treble","chords":[{"keys":["C4","E4","G4","C5"],"duration":"h"},{"keys":["C4","F4","A4","C5"],"duration":"h"}],"label":"I to IV voice leading with retained common tone (C)","caption":"Soprano and bass hold C; alto moves E to F; tenor moves G to A."}}],"workedExample":{"clef":"treble","chords":[{"keys":["C4","G4","C5"],"duration":"h"},{"keys":["B3","G4","D5"],"duration":"h"}],"label":"Contrary motion voice leading","caption":"Upper voices step downward as bass moves upward."},"practiceActivities":[{"id":"voice-leading-q1","prompt":"Why are parallel fifths and octaves forbidden in standard Classical voice leading?","options":[{"id":"destroy-independence","label":"They destroy the perceived independence of the two voice lines"},{"id":"dissonant","label":"They sound too dissonant to the ear"},{"id":"too-quiet","label":"They make the music sound too quiet"},{"id":"cant-sing","label":"They are physically impossible for singers to perform"}],"correctOptionId":"destroy-independence","explanation":"Parallel fifths and octaves cause two independent melodic lines to fuse acoustically into one, undermining the polyphonic texture."}],"terminology":[{"term":"Voice Leading (Part Writing)","definition":"The principles governing how individual melodic lines (voices) move from chord to chord."},{"term":"SATB","definition":"The standard four-voice choir framework: Soprano, Alto, Tenor, and Bass."},{"term":"Parallel Fifths / Octaves","definition":"Two voices moving in the same direction separated by a fifth or octave; strictly avoided in classical counterpoint because it destroys voice independence."},{"term":"Contrary Motion","definition":"Two voices moving in opposite directions (one up, one down); the strongest tool for maintaining independent lines."},{"term":"Tendency Tones","definition":"Pitches with a strong directional drive (e.g. leading tone resolving up to tonic, chordal 7th resolving down)."}],"keyboardIllustration":{"highlightNotes":["C3","G2","G3","D4","B4","C5"],"showLabels":true,"label":"SATB spread across bass and treble registers","caption":"Keep adjacent upper voices (Soprano-Alto, Alto-Tenor) within an octave of each other; the bass may sit further below."},"practicalApplication":"When writing four-part harmony, play each voice separately (Soprano alone, Alto alone, Tenor alone, Bass alone). If any inner voice feels unmusical or awkward to sing, adjust your voicing.","videoResource":{"title":"Open Yale Courses: Voice Leading and Bach Chorales","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-6","embedPermitted":false,"notes":"Prof. Wright breaks down 4-part SATB part writing and the acoustic reason why parallel fifths and octaves are avoided."},"references":[{"title":"Open Music Theory: Voice Leading and Part Writing","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Comprehensive rules for SATB ranges, spacing, doubling, and motion types."},{"title":"Juilliard Extension: Four-Part Harmony and Counterpoint","authorOrInstitution":"The Juilliard School","url":"https://www.juilliard.edu/stage-beyond/juilliard-extension","licence":"Proprietary Institutional Curriculum","relevance":"Traditional conservatory part-writing and Bach chorale analysis standards."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["C3","G3","E4","C5"],"at":0,"duration":0.9},{"notes":["G2","G3","D4","B4"],"at":1,"duration":1.2}],"repertoireSteps":[{"notes":["F3","A3","C4","F4"],"at":0,"duration":0.6},{"notes":["D3","F3","D4","F4"],"at":0.6,"duration":0.6},{"notes":["G3","B3","D4","G4"],"at":1.2,"duration":0.6},{"notes":["C3","G3","E4","C5"],"at":1.8,"duration":1.2}]}'::jsonb,
  12,
  12,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'sevenths-and-tonal-syntax' AND c.slug = 'inversions-sevenths-and-progressions'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'understanding-rhythm',
  'Understanding rhythm',
  'Separate steady background pulse and meter from changing foreground rhythmic surface patterns.',
  '# Understanding rhythm

Separate steady background pulse and meter from changing foreground rhythmic surface patterns.

## Learning Objectives

- Distinguish Beat (underlying steady pulse), Meter (accent grouping), Tempo (speed), and Rhythm (pattern of note lengths).
- Hear how varied surface rhythms lock onto an unchanging beat grid.

## Musical Terminology

- **Rhythm**: The organization of musical sound and silence through time.
- **Duration**: The length of time a sound or silence is sustained.
- **Metrical Grid**: The underlying regular lattice of beats upon which varied rhythms are placed.

## 1. Surface rhythm riding an invisible steady pulse

Rhythm is not the same thing as Beat. The beat (like a calm clock) ticks evenly underneath music, while RHYTHM layers contrasting long and short durations across that steady grid.

Meanwhile TEMPO dictates the speed of the beat (e.g., Allegro = fast, Adagio = slow), and METER groups beats into strong–weak cycles inside barlines.

## Worked Example: Separating Tempo from Rhythmic Density

Does playing fast sixteenth notes always mean the Tempo increased?
1. No: Beat speed (Tempo, say MM = 72 bpm) remains unchanged.
2. Instead the musician simply placed 4 sixteenth notes inside each steady quarter beat.
Subdivision increases rhythmic density without speeding up the underlying tempo.

## Practical Application

Before you learn the notes of any passage, practice clapping its rhythm while tapping your foot to the pulse. Isolating rhythm from pitch cuts practice time in half.

## Summary

Music coordinates steady beat, recurring metrical accents, overall tempo speed, and varied rhythmic surface patterns simultaneously.
',
  '{"sections":[{"id":"rhythm-vs-beat","notation":{"clef":"treble","timeSignature":"4/4","chords":[{"keys":["C4"],"duration":"h"},{"keys":["D4"],"duration":"q"},{"keys":["E4"],"duration":"q"}],"label":"Half note followed by two quarter notes in 4/4","caption":"Foreground rhythm changes (long–short–short: 2 + 1 + 1 beats) while four steady beats tick underneath."}}],"practiceActivities":[{"id":"rhythm-q1","prompt":"Which term describes the repeating foreground arrangement of long and short sounds and silences over the beat?","options":[{"id":"tempo","label":"Tempo"},{"id":"rhythm","label":"Rhythm"},{"id":"clef","label":"Clef"},{"id":"pitch","label":"Frequency"}],"correctOptionId":"rhythm","explanation":"Beat is the steady pulse, Tempo is the speed of that pulse, and Rhythm is the specific pattern of durations over it."}],"terminology":[{"term":"Rhythm","definition":"The organization of musical sound and silence through time."},{"term":"Duration","definition":"The length of time a sound or silence is sustained."},{"term":"Metrical Grid","definition":"The underlying regular lattice of beats upon which varied rhythms are placed."}],"keyboardIllustration":{"highlightNotes":["C4"],"showLabels":true,"label":"Rhythmic pulse against fixed pitch","caption":"A single pitch articulated with different durations creates rhythmic interest without melodic movement."},"practicalApplication":"Before you learn the notes of any passage, practice clapping its rhythm while tapping your foot to the pulse. Isolating rhythm from pitch cuts practice time in half.","videoResource":{"title":"Open Yale Courses: Rhythm Fundamentals","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-3","embedPermitted":false,"notes":"Lecture 3 introduces the universal bodily experience of musical rhythm, heartbeat pulse, and metrical grouping."},"references":[{"title":"Open Music Theory: Fundamentals of Rhythm","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Metrical frameworks, beat subdivisions, and rhythmic notation."},{"title":"Fundamentals of Music Theory: Rhythm and Metre","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Physical and psychological perception of musical time."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["A4"],"at":0,"duration":0.42},{"notes":["A4"],"at":0.45,"duration":0.2},{"notes":["A4"],"at":0.68,"duration":0.2},{"notes":["A4"],"at":0.9,"duration":0.42},{"notes":["A4"],"at":1.35,"duration":0.42}]}'::jsonb,
  7,
  1,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'beat-and-metrical-division' AND c.slug = 'pulse-simple-and-compound-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'beat-and-pulse',
  'Beat and pulse',
  'Recognize downbeats, weak beats, anacruses (pickup measures), and binary vs. ternary beat emphasis.',
  '# Beat and pulse

Recognize downbeats, weak beats, anacruses (pickup measures), and binary vs. ternary beat emphasis.

## Learning Objectives

- Contrast strong downbeats (Beat 1) against secondary and weak beats.
- Count incomplete opening bars (anacrusis / pickup beat) paired cleanly with shortened final bars.

## Musical Terminology

- **Pulse (Beat)**: The steady, regular tick of musical time; the unit listeners tap their feet to.
- **Tempo**: The speed of the underlying beat, measured in Beats Per Minute (BPM).
- **Metronome**: A mechanical or digital device that emits regular acoustic clicks at adjustable BPM.
- **Rubato**: Expressive, flexible stretching and compressing of tempo without altering the fundamental musical architecture.

## 1. Downbeats and the pickup bar (anacrusis)

The first beat immediately following any barline is the DOWNBEAT (strongest metric accent). In 4/4 time, beats follow Strong–Weak–Medium–Weak (1–2–3–4); in 3/4, Strong–Weak–Weak (1–2–3).

Many melodies launch slightly BEFORE Beat 1 with an incomplete opening measure called an ANACRUSIS (or pickup note). By classical rule, the beats borrowed by an opening pickup are subtracted cleanly from the piece''s very final measure.

## Worked Example: Balancing an incomplete final measure

A piece in 4/4 opens with a 1-beat quarter-note pickup bar.
1. Opening anacrusis uses 1 beat out of 4.
2. To keep the whole piece rhythmically balanced around complete 4-beat cycles, the ending bar omits 1 beat.
The final measure should hold 3 beats (1 + 3 = 4 total beats).

## Practical Application

Always practice with a metronome at slow tempos first. A metronome does not restrict your musicality; it builds the rock-solid internal clock that makes expressive rubato possible.

## Summary

Beat hierarchy organizes pulse into accented downbeats and unaccented upbeats, launching melodies smoothly via pickup bars.
',
  '{"sections":[{"id":"downbeat-and-anacrusis","notation":{"clef":"treble","timeSignature":"3/4","chords":[{"keys":["G4"],"duration":"q"},{"keys":["C5"],"duration":"h"},{"keys":["E5"],"duration":"q"}],"label":"Pickup quarter note G4 rising to half note C5 and quarter E5","caption":"Upward-leaning pickup motion (G4 → downbeat C5) creates buoyant forward momentum."}}],"practiceActivities":[{"id":"pulse-q1","prompt":"In a 4/4 piece starting with a 2-beat half-note pickup (anacrusis), how many beats will the final bar traditionally contain?","options":[{"id":"1","label":"1 beat"},{"id":"2","label":"2 beats"},{"id":"3","label":"3 beats"},{"id":"4","label":"4 beats"}],"correctOptionId":"2","explanation":"Opening anacrusis (2 beats) + final bar (2 beats) together equal one complete 4/4 bar."}],"terminology":[{"term":"Pulse (Beat)","definition":"The steady, regular tick of musical time; the unit listeners tap their feet to."},{"term":"Tempo","definition":"The speed of the underlying beat, measured in Beats Per Minute (BPM)."},{"term":"Metronome","definition":"A mechanical or digital device that emits regular acoustic clicks at adjustable BPM."},{"term":"Rubato","definition":"Expressive, flexible stretching and compressing of tempo without altering the fundamental musical architecture."}],"keyboardIllustration":{"highlightNotes":["C4","G4"],"showLabels":true,"label":"Metrical downbeat pulse","caption":"Downbeat (C4) on beat 1 carries primary metric stress; G4 sounds on weak beats."},"practicalApplication":"Always practice with a metronome at slow tempos first. A metronome does not restrict your musicality; it builds the rock-solid internal clock that makes expressive rubato possible.","videoResource":{"title":"Berklee Online: Developing an Internal Metronome","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee faculty demonstrate body percussion, sub-pulse feeling, and pocket groove stability."},"references":[{"title":"Open Music Theory: Pulse, Beat, and Tempo","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Hierarchical beat levels and tempo markings."},{"title":"Integrated Musicianship: Beat and Pulse","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Aural training exercises for tempo consistency and pulse identification."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["E4"],"at":0,"duration":0.4},{"notes":["C#5"],"at":0.45,"duration":0.7},{"notes":["A4"],"at":1.18,"duration":0.4}]}'::jsonb,
  8,
  2,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'beat-and-metrical-division' AND c.slug = 'pulse-simple-and-compound-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'simple-time-signatures',
  'Simple time signatures',
  'Recognize duple, triple, and quadruple simple meters (2/4, 3/4, 4/4, 2/2, 3/8) where every beat naturally divides into TWO equal halves.',
  '# Simple time signatures

Recognize duple, triple, and quadruple simple meters (2/4, 3/4, 4/4, 2/2, 3/8) where every beat naturally divides into TWO equal halves.

## Learning Objectives

- Define SIMPLE METER as any meter whose beat unit is undotted and splits naturally in half (into 2 parts).
- Classify 2/4, 2/2 (cut time / alla breve), 3/4, 3/8, and 4/4 by duple/triple/quadruple beat count.

## Musical Terminology

- **Simple Meter**: A meter where each primary beat divides naturally into TWO equal parts (binary division).
- **Simple Duple (2/4)**: Two beats per measure, each dividing into two eighth notes (ONE-and, TWO-and).
- **Simple Triple (3/4)**: Three beats per measure, each dividing into two eighth notes (waltz meter).
- **Simple Quadruple (4/4)**: Four beats per measure, each dividing into two eighth notes (common time).

## 1. Every beat splits neatly into two

In SIMPLE TIME SIGNATURES (top numeral 2, 3, or 4), the beat note is an ordinary undotted value that divides effortlessly in two: e.g., in 2/4 or 4/4, each quarter beat splits into 2 eighth notes (''1-and, 2-and'').

Watch out for 2/2 (Cut Time / Alla Breve, symbol ₵) vs. 4/4: even though both contain four quarter notes'' worth of notation per bar, 2/2 moves with TWO brisk half-note beats per measure rather than four quarter beats!

## Worked Example: Classifying 3/8 vs. 3/4

Compare 3/8 (3 eighth-note beats) against 3/4 (3 quarter-note beats).
1. Top number in both is 3 → both are SIMPLE TRIPLE meters!
2. In 3/8, the bottom 8 sets the eighth note as one full beat (each splitting into two sixteenths).
3. In 3/4, the bottom 4 sets the quarter note as one beat.
Both have 3 simple beats per bar; only the visual note value assigned to the beat shifts.

## Practical Application

In simple meters, keep your internal counting syllables consistent: ''1-and, 2-and, 3-and, 4-and'' for eighths; ''1-e-and-a, 2-e-and-a'' for sixteenths.

## Summary

Simple time signatures feature top numbers 2, 3, or 4 and always subdivide every beat evenly into two parts.
',
  '{"sections":[{"id":"binary-division","notation":{"clef":"treble","timeSignature":"2/4","beamNotes":true,"chords":[{"keys":["G4"],"duration":"8"},{"keys":["A4"],"duration":"8"},{"keys":["B4"],"duration":"8"},{"keys":["G4"],"duration":"8"}],"label":"Four eighth notes beamed in two pairs inside 2/4 simple duple meter","caption":"Simple duple (2/4): beaming makes both two-part beat divisions (''1-and 2-and'') visually clear."}}],"practiceActivities":[{"id":"simple-q1","prompt":"Which term accurately classifies the time signature 4/4?","options":[{"id":"sd","label":"Simple duple"},{"id":"sq","label":"Simple quadruple"},{"id":"cd","label":"Compound duple"},{"id":"ct","label":"Compound triple"}],"correctOptionId":"sq","explanation":"Top numeral 4 means four beats per measure, each dividing simply in two → Simple quadruple."}],"terminology":[{"term":"Simple Meter","definition":"A meter where each primary beat divides naturally into TWO equal parts (binary division)."},{"term":"Simple Duple (2/4)","definition":"Two beats per measure, each dividing into two eighth notes (ONE-and, TWO-and)."},{"term":"Simple Triple (3/4)","definition":"Three beats per measure, each dividing into two eighth notes (waltz meter)."},{"term":"Simple Quadruple (4/4)","definition":"Four beats per measure, each dividing into two eighth notes (common time)."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4"],"showLabels":true,"label":"Simple meter pulse hierarchy","caption":"Beat 1 = strong (C4); Beat 2 = weak (E4); Beat 3 = medium (G4); Beat 4 = weak."},"practicalApplication":"In simple meters, keep your internal counting syllables consistent: ''1-and, 2-and, 3-and, 4-and'' for eighths; ''1-e-and-a, 2-e-and-a'' for sixteenths.","videoResource":{"title":"Open Yale Courses: Rhythm — Jazz, Pop and Classical","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-4","embedPermitted":false,"notes":"MUSI 112 Lecture 4 analyzes simple meter accent patterns across classical symphonies and dance music."},"references":[{"title":"Open Music Theory: Simple Meters","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Metric hierarchy and beaming rules in simple time signatures."},{"title":"Musictheory.net: Simple and Compound Meter","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/15","licence":"Free Web Educational Access","relevance":"Interactive breakdown of beat division."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["B4"],"at":0,"duration":0.16},{"notes":["A4"],"at":0.16,"duration":0.16},{"notes":["G#4"],"at":0.32,"duration":0.16},{"notes":["A4"],"at":0.48,"duration":0.16},{"notes":["C5"],"at":0.64,"duration":0.45}]}'::jsonb,
  8,
  3,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'beat-and-metrical-division' AND c.slug = 'pulse-simple-and-compound-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'compound-time-signatures',
  'Compound time signatures',
  'Master 6/8, 9/8, and 12/8 meters where each dotted main beat swings naturally into THREE sub-pulses.',
  '# Compound time signatures

Master 6/8, 9/8, and 12/8 meters where each dotted main beat swings naturally into THREE sub-pulses.

## Learning Objectives

- Decode top numerals 6, 9, and 12 cleanly: divide the top number by 3 to find main dotted beats per bar.
- Contrast 6/8 (2 dotted-quarter beats per bar: ONE-2-3 TWO-2-3) from 3/4 (3 quarter beats: ONE-& TWO-& THREE-&).
- Beam notes strictly in groups of three eighths to mirror compound beats.

## Musical Terminology

- **Compound Meter**: A meter where each primary beat divides naturally into THREE equal parts (ternary division).
- **Dotted Quarter Beat**: The standard pulse unit in compound meters (such as 6/8, 9/8, 12/8), equal to three eighth notes.
- **Compound Duple (6/8)**: Two dotted-quarter beats per measure (total 6 eighth notes grouped 3 + 3).
- **Compound Triple (9/8)**: Three dotted-quarter beats per measure (grouped 3 + 3 + 3).
- **Compound Quadruple (12/8)**: Four dotted-quarter beats per measure (grouped 3 + 3 + 3 + 3).

## 1. Dotted beats swinging in threes (6/8, 9/8, 12/8)

In COMPOUND TIME SIGNATURES (top numerals 6, 9, or 12), the main felt beat is a DOTTED NOTE divided into THREE equal parts. Do NOT conduct 6/8 as six separate slow beats: divide the top number by 3 to find how many main beats drive the bar!

6/8 = 6 ÷ 3 = 2 dotted-quarter beats (Compound Duple: ONE-la-li, TWO-la-li). 9/8 = 3 dotted-quarter beats (Compound Triple). 12/8 = 4 dotted-quarter beats (Compound Quadruple).

## Worked Example: Distinguishing 3/4 from 6/8 mathematically and musically

Why aren''t 3/4 and 6/8 interchangeable when both equal 6 eighth notes per measure?
1. In 3/4 (simple triple), six eighths beam in THREE pairs of two: [♪♪] [♪♪] [♪♪] → ONE-and TWO-and THREE-and.
2. In 6/8 (compound duple), six eighths beam in TWO groups of three: [♪♪♪] [♪♪♪] → ONE-two-three TWO-two-three.
Grouping by 2s (3 beats) vs. grouping by 3s (2 beats) produces completely different musical pulses.

## Practical Application

Never count 6/8 as six slow, stiff beats! Conduct or tap it in TWO large swinging beats (ONE-two-three, TWO-two-three), exactly like a barcarolle, gigue, or Irish jig.

## Summary

Compound meters (6, 9, 12 on top) divide every dotted main beat into three equal sub-pulses.
',
  '{"sections":[{"id":"ternary-subdivision","notation":{"clef":"treble","timeSignature":"6/8","beamNotes":true,"chords":[{"keys":["E4"],"duration":"8"},{"keys":["G4"],"duration":"8"},{"keys":["C5"],"duration":"8"},{"keys":["B4"],"duration":"qd"}],"label":"Three beamed eighth notes followed by a dotted quarter note in 6/8","caption":"6/8 bar: Beat 1 holds three eighth notes (''1-la-li''); Beat 2 holds one dotted quarter note (''2---'')."}}],"practiceActivities":[{"id":"comp-q1","prompt":"How many main dotted-quarter beats fill each measure of 9/8?","options":[{"id":"two","label":"2 dotted-quarter beats"},{"id":"three","label":"3 dotted-quarter beats"},{"id":"four","label":"4 dotted-quarter beats"},{"id":"nine","label":"9 dotted-quarter beats"}],"correctOptionId":"three","explanation":"In compound time, divide the top numeral by 3: 9 ÷ 3 = 3 dotted-quarter beats (Compound Triple)."}],"terminology":[{"term":"Compound Meter","definition":"A meter where each primary beat divides naturally into THREE equal parts (ternary division)."},{"term":"Dotted Quarter Beat","definition":"The standard pulse unit in compound meters (such as 6/8, 9/8, 12/8), equal to three eighth notes."},{"term":"Compound Duple (6/8)","definition":"Two dotted-quarter beats per measure (total 6 eighth notes grouped 3 + 3)."},{"term":"Compound Triple (9/8)","definition":"Three dotted-quarter beats per measure (grouped 3 + 3 + 3)."},{"term":"Compound Quadruple (12/8)","definition":"Four dotted-quarter beats per measure (grouped 3 + 3 + 3 + 3)."}],"keyboardIllustration":{"highlightNotes":["C4","G4"],"showLabels":true,"label":"6/8 Two-beat macro pulse (Beats 1 and 4)","caption":"In 6/8 time, feel TWO big swinging pulses per bar: count ''ONE-two-three, FOUR-five-six''."},"practicalApplication":"Never count 6/8 as six slow, stiff beats! Conduct or tap it in TWO large swinging beats (ONE-two-three, TWO-two-three), exactly like a barcarolle, gigue, or Irish jig.","videoResource":{"title":"Fundamentals of Music Theory: Compound Time Signatures","publisher":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","embedPermitted":false,"notes":"Reid School of Music video lecture explaining compound division and dotted-beat notation."},"references":[{"title":"Open Music Theory: Compound Meters","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Mathematical derivation of dotted-quarter beats and beam grouping in 6/8, 9/8, and 12/8."},{"title":"Harmony and Musicianship with Solfège: Compound Metre","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Sight-singing drills in compound duple and triple meters."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["G4"],"at":0,"duration":0.22},{"notes":["C5"],"at":0.22,"duration":0.22},{"notes":["E5"],"at":0.44,"duration":0.22},{"notes":["G4"],"at":0.66,"duration":0.22},{"notes":["D5"],"at":0.88,"duration":0.22},{"notes":["F5"],"at":1.1,"duration":0.5}]}'::jsonb,
  10,
  4,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'beat-and-metrical-division' AND c.slug = 'pulse-simple-and-compound-meter'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'dotted-notes',
  'Dotted notes',
  'Calculate exact augmentation dots (+50% value) and double dots (+75% value) across all rhythmic durations.',
  '# Dotted notes

Calculate exact augmentation dots (+50% value) and double dots (+75% value) across all rhythmic durations.

## Learning Objectives

- Apply the augmentation dot rule: a single dot adds HALF of the note''s original duration (1.5×).
- Count dotted half (3 quarter beats), dotted quarter (1.5 beats), and dotted eighth (0.75 beat) patterns accurately.
- Understand dotted quarter + eighth phrasing in common 4/4 melodies.

## Musical Terminology

- **Augmentation Dot**: A dot placed immediately to the right of a notehead that adds half of the note''s original value to its duration.
- **Double Dot**: A second dot that adds one-quarter of the original value (for a total of 175% duration).
- **Dotted Quarter Note**: Equal to 1 quarter note + 1 eighth note (1.5 beats in simple time, or 1 full beat in compound time).

## 1. Original value plus half again (× 1.5)

Placing a small dot immediately to the RIGHT of a notehead (never confusing it with a staccato dot above or below!) extends that note by half its own value. Thus a dotted note naturally divides into THREE of the next smaller note value:

• Dotted half note = 2 + 1 = 3 quarter notes.
• Dotted quarter note = 1 + ½ = 1½ beats (3 eighth notes).
• Dotted eighth note = ½ + ¼ = ¾ beat (3 sixteenth notes).

## Worked Example: Counting beats across a dotted half + two eighths in 4/4

Verify the beat total of [dotted half] + [eighth] + [eighth].
1. Dotted half = 2 (half) + 1 (half of half) = 3 quarter beats.
2. Two eighth notes = ½ + ½ = 1 quarter beat.
3. Total = 3 + 1 = 4 complete quarter beats.
The rhythm fills an exact 4/4 bar cleanly.

## Practical Application

In classical and baroque marches, do not rush the short note following a dotted note! Ensure the dotted note sustains its full duration before crisp articulation of the short note.

## Summary

An augmentation dot extends any note or rest by 50% of its value, bridging cleanly across binary and ternary subdivisions.
',
  '{"sections":[{"id":"augmentation-dot","notation":{"clef":"treble","timeSignature":"4/4","chords":[{"keys":["G4"],"duration":"qd"},{"keys":["A4"],"duration":"8"},{"keys":["B4"],"duration":"h"}],"label":"Dotted quarter note G4, eighth note A4, and half note B4 in 4/4","caption":"Classic lyric figure in 4/4: dotted quarter (1½ beats) + eighth (½ beat) + half note (2 beats)."}}],"practiceActivities":[{"id":"dots-q1","prompt":"In 4/4 time, how many quarter beats long is a single dotted quarter note?","options":[{"id":"1","label":"1 beat"},{"id":"1.5","label":"1.5 beats (3 eighth notes)"},{"id":"2","label":"2 beats"},{"id":"3","label":"3 beats"}],"correctOptionId":"1.5","explanation":"A quarter note (1 beat) plus half of itself (0.5 beat) = 1.5 beats = 3 eighth notes."}],"terminology":[{"term":"Augmentation Dot","definition":"A dot placed immediately to the right of a notehead that adds half of the note''s original value to its duration."},{"term":"Double Dot","definition":"A second dot that adds one-quarter of the original value (for a total of 175% duration)."},{"term":"Dotted Quarter Note","definition":"Equal to 1 quarter note + 1 eighth note (1.5 beats in simple time, or 1 full beat in compound time)."}],"keyboardIllustration":{"highlightNotes":["C4","G4"],"showLabels":true,"label":"Dotted rhythm pairing: Dotted quarter + eighth note","caption":"The dotted note sustains across the beat, while the subsequent eighth note leaps into the next downbeat."},"practicalApplication":"In classical and baroque marches, do not rush the short note following a dotted note! Ensure the dotted note sustains its full duration before crisp articulation of the short note.","videoResource":{"title":"Open Yale Courses: Dotted Rhythms in the French Overture","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-3","embedPermitted":false,"notes":"Prof. Wright illustrates the majestic, regal character of dotted rhythms in Baroque French overtures."},"references":[{"title":"Open Music Theory: Dotted Notes","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Mathematical proportion and engraving rules for single and double dotted values."},{"title":"Musictheory.net: Dots and Ties","authorOrInstitution":"Ricci Adams","url":"https://www.musictheory.net/lessons/14","licence":"Free Web Educational Access","relevance":"Interactive drills for calculating dotted durations."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D5"],"at":0,"duration":0.55},{"notes":["C#5"],"at":0.58,"duration":0.16},{"notes":["D5"],"at":0.76,"duration":0.7}]}'::jsonb,
  8,
  5,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'dots-ties-and-cross-rhythm' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'ties-and-rests',
  'Ties and rests',
  'Extend durations invisibly across barlines with ties while never chaining rests, and recognize slur vs. tie notation cleanly.',
  '# Ties and rests

Extend durations invisibly across barlines with ties while never chaining rests, and recognize slur vs. tie notation cleanly.

## Learning Objectives

- Combine note values with curved TIES—strictly between identical pitches—to sum into a single unbroken sound.
- Distinguish a TIE (same pitch, rhythmic addition) from a SLUR (different pitches, legato connection).
- Respect the whole-bar rest convention and understand why rests are never tied.

## Musical Terminology

- **Tie**: A curved line connecting two notes of identical pitch, combining them into one continuous sounding duration.
- **Slur**: A curved line connecting notes of DIFFERENT pitches, indicating smooth legato phrasing (not to be confused with a tie).
- **Barline Crossing**: Ties are the ONLY legal method to sustain a single continuous note across a barline.

## 1. Tied additions vs. slurs & full-measure rests

A TIE is a curved arc joining two adjacent noteheads of the EXACT SAME PITCH: strike only the first note and hold cleanly through the combined sum of both durations. Ties solve rhythms impossible with a single notehead (like a 5-beat note or holding across a barline).

In contrast, a SLUR connects two or more DIFFERENT pitches smoothly (legato) without adding rhythmic length. Also remember: rests are NEVER tied—combine consecutive silences cleanly with larger rest symbols respecting the middle of the bar.

## Worked Example: Calculating a tied barline cross-hold

A quarter note on Beat 4 of Measure 1 is tied across the barline to a half note in Measure 2 (in 4/4).
1. Both noteheads share the same pitch (e.g., A4), so you strike A4 ONCE on Beat 4.
2. Hold 1 beat (Beat 4 of Measure 1) + 2 beats (Beats 1–2 of Measure 2).
Hold A4 seamlessly for 3 full beats, releasing right before Beat 3 of Measure 2.

## Practical Application

Distinguish ties from slurs immediately: ties connect identical pitch heads to prolong duration; slurs arch over different notes to dictate smooth articulation.

## Summary

Ties unite identical pitches across beat boundaries and barlines into a single sustained duration, whereas rests never tie and whole-measure rests adapt automatically to any time signature.
',
  '{"sections":[{"id":"ties-vs-slurs-and-rests","notation":{"clef":"treble","timeSignature":"4/4","chords":[{"keys":["E4"],"duration":"h"},{"keys":[],"duration":"qr"},{"keys":["G4"],"duration":"q"}],"label":"Half note E4, quarter rest, and quarter note G4 balancing 4/4","caption":"Silence fills exactly Beat 3 (quarter rest) before sounding Beat 4 cleanly."}}],"practiceActivities":[{"id":"ties-q1","prompt":"What happens visually when a curved arc joins an F4 quarter note to an E4 quarter note?","options":[{"id":"tie","label":"It is a tie adding both beats into one note"},{"id":"slur","label":"It is a slur instructing you to play F4 smoothly into E4"},{"id":"rest","label":"It silences the E4 like a rest"},{"id":"accent","label":"It doubles the dynamic volume"}],"correctOptionId":"slur","explanation":"Ties only link identical pitches. A curve spanning different pitches (F4 → E4) is a SLUR marking smooth legato articulation."}],"terminology":[{"term":"Tie","definition":"A curved line connecting two notes of identical pitch, combining them into one continuous sounding duration."},{"term":"Slur","definition":"A curved line connecting notes of DIFFERENT pitches, indicating smooth legato phrasing (not to be confused with a tie)."},{"term":"Barline Crossing","definition":"Ties are the ONLY legal method to sustain a single continuous note across a barline."}],"keyboardIllustration":{"highlightNotes":["C4"],"showLabels":true,"label":"Sustaining tied pitch across barline","caption":"A tie connects two notes of the same pitch into one unbroken sustain."},"practicalApplication":"Distinguish ties from slurs immediately: ties connect identical pitch heads to prolong duration; slurs arch over different notes to dictate smooth articulation.","videoResource":{"title":"Berklee Online: Notation Rules — Ties, Slurs and Beaming","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee masterclass on score layout, tie engraving, and metric clarity."},"references":[{"title":"Open Music Theory: Ties and Slurs","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Engraving conventions for ties across beats and measures."},{"title":"Integrated Musicianship: Ties and Rests","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Aural dictation exercises containing tied syncopations."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["F5"],"at":0,"duration":0.6},{"notes":["Db5"],"at":0.62,"duration":1.3},{"notes":["Bb4"],"at":1.95,"duration":0.55}]}'::jsonb,
  8,
  6,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'dots-ties-and-cross-rhythm' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'syncopation',
  'Syncopation',
  'Feel how stressing off-beats or holding notes across strong metric beats produces rhythmic drive and forward vitality.',
  '# Syncopation

Feel how stressing off-beats or holding notes across strong metric beats produces rhythmic drive and forward vitality.

## Learning Objectives

- Define syncopation as intentional metric displacement of accent onto weak beats or weak subdivisions (''ands'').
- Recognize the classic short–long–short eighth–quarter–eighth syncopated figure cleanly across beats 1–2.
- Perform tied syncopation without rushing the held beat.

## Musical Terminology

- **Syncopation**: The deliberate accenting of a normally weak beat or off-beat fraction of a pulse.
- **Off-Beat**: The weak subdivision of a beat (the ''and'' of the beat in simple meter).
- **Metric Tension**: The physical excitement created when rhythmic accents clash against the underlying pulse.

## 1. Displacing emphasis off the expected grid

Music breathes through tension between expectation and surprise. When a melody places a long note, dynamic accent, or sharp entry on a weak beat or off-beat subdivision (''and'') and holds straight through the next strong beat without restatement, SYNCOPATION occurs.

The most essential syncopation pattern in 4/4 is eighth–quarter–eighth ([♪] [♩] [♪]): you strike ''1'', strike early on ''and'', and hold through Beat 2 before striking ''and'' of 2!

## Worked Example: Clapping eighth–quarter–eighth accurately in 2/4

Internalize Beats 1 and 2 subdivided as ''1-and-2-and''.
1. Beat ''1'': clap eighth note.
2. Beat ''1-and'': clap quarter note and HOLD silently past Beat 2.
3. Beat ''2-and'': clap final eighth note.
The skipped clap on Beat 2 lets the ''1-and'' entry pop rhythmically.

## Practical Application

To master syncopation, tap the steady downbeat pulse firmly with your foot while speaking the syncopated rhythm. Never move your foot with the syncopation; your foot represents the unwavering law of gravity.

## Summary

Syncopation energizes meter by accenting off-beats and holding across strong beats rather than restating them.
',
  '{"sections":[{"id":"offbeat-accent","notation":{"clef":"treble","timeSignature":"4/4","chords":[{"keys":["C5"],"duration":"8"},{"keys":["E5"],"duration":"q"},{"keys":["D5"],"duration":"8"},{"keys":["C5"],"duration":"h"}],"label":"Syncopated eighth C5, quarter E5 spanning beat 2, eighth D5, and half note C5","caption":"Eighth – Quarter – Eighth syncopation: E5 enters early on ''1-and'' and holds straight across Beat 2."}}],"practiceActivities":[{"id":"sync-q1","prompt":"Which rhythmic figure exemplifies basic off-beat syncopation spanning two quarter beats?","options":[{"id":"qq","label":"Quarter + Quarter"},{"id":"eqe","label":"Eighth + Quarter + Eighth"},{"id":"h","label":"One Half Note"},{"id":"eeee","label":"Four Equal Eighths"}],"correctOptionId":"eqe","explanation":"Eighth + Quarter + Eighth shifts the longer note onto the ''and'' of Beat 1, sustaining directly over Beat 2."}],"terminology":[{"term":"Syncopation","definition":"The deliberate accenting of a normally weak beat or off-beat fraction of a pulse."},{"term":"Off-Beat","definition":"The weak subdivision of a beat (the ''and'' of the beat in simple meter)."},{"term":"Metric Tension","definition":"The physical excitement created when rhythmic accents clash against the underlying pulse."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4"],"showLabels":true,"label":"Syncopated off-beat chord stabs","caption":"Striking chords on off-beats (''and'' of 1, ''and'' of 2) generates propelling syncopated energy."},"practicalApplication":"To master syncopation, tap the steady downbeat pulse firmly with your foot while speaking the syncopated rhythm. Never move your foot with the syncopation; your foot represents the unwavering law of gravity.","videoResource":{"title":"Open Yale Courses: Syncopation in Ragtime, Jazz and Beethoven","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-4","embedPermitted":false,"notes":"Lecture 4 examines syncopation in Scott Joplin ragtime and Beethoven symphonies."},"references":[{"title":"Open Music Theory: Syncopation","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Metrical analysis of displacement, ties, and accentuation."},{"title":"Berklee Online: Groove and Syncopation","authorOrInstitution":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","licence":"Educational Handbook","relevance":"Syncopated phrasing across modern and contemporary genres."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["G4"],"at":0,"duration":0.2},{"notes":["C5"],"at":0.22,"duration":0.45},{"notes":["A4"],"at":0.7,"duration":0.2},{"notes":["G4"],"at":0.92,"duration":0.6}]}'::jsonb,
  8,
  7,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'dots-ties-and-cross-rhythm' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'triplets',
  'Triplets',
  'Subdivide a simple binary beat temporarily into THREE equal notes (''tri-pl-et'') without changing the time signature.',
  '# Triplets

Subdivide a simple binary beat temporarily into THREE equal notes (''tri-pl-et'') without changing the time signature.

## Learning Objectives

- Play three equal eighth-note triplets cleanly inside the time normally occupied by two eighth notes (one quarter beat).
- Recognize quarter-note triplets spanning two full quarter beats.
- Maintain smooth tempo transitions moving directly between straight eighths (duplets) and eighth triplets.

## Musical Terminology

- **Tuplet**: Any rhythm that borrows an irregular number of subdivisions against the established meter.
- **Triplet**: Playing THREE equal notes in the normal time span of TWO notes of the same value.
- **Quarter-Note Triplet**: Three quarter notes played in the time of two quarter notes (spanning two beats in 4/4).

## 1. Fitting three into the space of two

Sometimes a composer writing in simple time (like 4/4) wants a brief three-part lilt without changing the meter to 12/8. A TRIPLET inserts three equal notes—bracketed with a small numeral ''3''—into the exact rhythmic slot normally held by TWO notes of that same written value.

Thus 3 eighth-note triplets equal 2 ordinary eighth notes (1 quarter beat); 3 quarter-note triplets equal 2 ordinary quarter notes (1 half note); and 3 sixteenth-note triplets fill 1 single eighth beat.

## Worked Example: Checking quarter-note triplets in 4/4

How many beats does a quarter-note triplet occupy?
1. Standard triplet rule: 3 notes in the time of 2 of the SAME written value.
2. Written value = quarter note.
3. 2 normal quarter notes = 2 beats.
A quarter-note triplet distributes 3 equal attacks across 2 quarter beats.

## Practical Application

Count eighth-note triplets with three-syllable words: ''trip-o-let, trip-o-let'' or ''straw-ber-ry, straw-ber-ry''. Ensure all three syllables have identical duration.

## Summary

Triplets divide any simple binary duration cleanly into three equal parts without changing the surrounding time signature.
',
  '{"sections":[{"id":"three-in-time-of-two","notation":{"clef":"treble","timeSignature":"2/4","beamNotes":true,"tuplet":{"start":0,"end":2,"numNotes":3},"chords":[{"keys":["E4"],"duration":"8"},{"keys":["G4"],"duration":"8"},{"keys":["B4"],"duration":"8"},{"keys":["C5"],"duration":"q"}],"label":"Eighth-note triplet E4-G4-B4 followed by quarter note C5 in 2/4","caption":"Beat 1 divides cleanly into a triplet (E–G–B in the time of two eighths) arriving on Beat 2 (C5)."}}],"practiceActivities":[{"id":"trip-q1","prompt":"What single note equals the combined duration of one eighth-note triplet (3 beamed eighths under a ''3'')?","options":[{"id":"eighth","label":"One eighth note"},{"id":"quarter","label":"One quarter note"},{"id":"dotted-q","label":"One dotted quarter note"},{"id":"half","label":"One half note"}],"correctOptionId":"quarter","explanation":"An eighth-note triplet compresses 3 eighths into the duration of 2 ordinary eighths = 1 quarter note."}],"terminology":[{"term":"Tuplet","definition":"Any rhythm that borrows an irregular number of subdivisions against the established meter."},{"term":"Triplet","definition":"Playing THREE equal notes in the normal time span of TWO notes of the same value."},{"term":"Quarter-Note Triplet","definition":"Three quarter notes played in the time of two quarter notes (spanning two beats in 4/4)."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4"],"showLabels":true,"label":"Eighth-note triplet (3 notes in 1 beat)","caption":"In simple meter, triplets inject a momentary rolling, lyrical feel."},"practicalApplication":"Count eighth-note triplets with three-syllable words: ''trip-o-let, trip-o-let'' or ''straw-ber-ry, straw-ber-ry''. Ensure all three syllables have identical duration.","videoResource":{"title":"Berklee Online: Triplets and Compound Tuplets","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee rhythm clinic on tuplet subdivisions, swing feel, and triplet accuracy."},"references":[{"title":"Open Music Theory: Triplets and Tuplets","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Notation, beaming, and mathematical ratios for tuplets."},{"title":"Fundamentals of Music Theory: Tuplets and Metric Modulation","authorOrInstitution":"University of Edinburgh (Reid School of Music)","url":"https://www.ed.ac.uk/information-services/learning-technology/open-ed/","licence":"CC BY 4.0","relevance":"Tuplets in romantic and contemporary concert repertoire."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["G4","C4"],"at":0,"duration":0.25},{"notes":["A4"],"at":0.22,"duration":0.22},{"notes":["G4","E4"],"at":0.33,"duration":0.25},{"notes":["B4"],"at":0.44,"duration":0.22},{"notes":["C5","G4"],"at":0.66,"duration":0.65}]}'::jsonb,
  8,
  8,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'dots-ties-and-cross-rhythm' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'polyrhythms',
  'Polyrhythms, cross-rhythms, and hemiola',
  'Master simultaneous conflicting meters, including two against three, three against four, and the Baroque hemiola cadence.',
  '# Polyrhythms, cross-rhythms, and hemiola

Master simultaneous conflicting meters, including two against three, three against four, and the Baroque hemiola cadence.

## Learning Objectives

- Execute two-against-three (2:3) and three-against-four (3:4) polyrhythms with steady bodily coordination.
- Identify the Baroque and Classical hemiola (re-grouping two bars of triple meter into three bars of duple meter).
- Calculate the smallest common denominator subdivision for cross-rhythmic performance.

## Musical Terminology

- **Polyrhythm (Cross-Rhythm)**: The simultaneous sounding of two or more independent, conflicting rhythmic meters.
- **Two Against Three (2:3)**: Playing two equal notes in one hand while playing three equal notes in the other over the same timespan.
- **Hemiola**: A rhythmic device where two bars of 3/4 are re-articulated as three bars of 2/4, often signaling an impending cadence.

## 1. Two Against Three: ''Not Very Dif-fi-cult''

A polyrhythm occurs when two different divisions of the same time span sound at once. The most famous and essential polyrhythm is two against three (2:3), found throughout the music of Chopin, Brahms, and Debussy.

To master 2:3, use the common subdivision of six (2 × 3 = 6). The two hands hit together on 1; the triplet hits on 3; the duplet hits on 4; the final triplet hits on 5. Speak the mnemonic phrase: ''NOT dif-fi-CULT'' (Together - Right - Left - Right).

## Worked Example: Mapping a Hemiola in 3/4 Time

Analyze two measures of 3/4 time moving toward a final cadence in Handel''s Water Music.
1. Normally, two bars of 3/4 contain 6 quarter notes grouped: | 1-2-3 | 1-2-3 |.
2. In a hemiola, the composer ties notes across the barline to regroup the 6 quarters into three groups of two: | 1-2 | 3-1 | 2-3 |.
3. The perceived meter shifts temporarily from triple time to a grand, broadening duple feel.
The hemiola signals a major cadence arrival by temporarily expanding the metrical pulse.

## Practical Application

To practice polyrhythms away from your instrument, tap your left hand on your left knee and your right hand on your right knee. Repeat the speech phrase ''NOT dif-fi-CULT'' until both hands move automatically.

## Summary

Polyrhythms and cross-rhythms layer conflicting subdivisions across a single timeframe, generating unmatched rhythmic sophistication in classical masterworks and global music traditions.
',
  '{"sections":[{"id":"two-against-three","notation":{"clef":"treble","timeSignature":"3/4","tuplet":{"start":0,"end":2,"numNotes":3},"chords":[{"keys":["C4","C5"],"duration":"q"},{"keys":["E4"],"duration":"q"},{"keys":["G4","C5"],"duration":"q"}],"label":"Two against three cross-rhythm notation","caption":"Cross-rhythmic layering across two independent voices."}}],"workedExample":{"clef":"treble","timeSignature":"3/4","chords":[{"keys":["C4"],"duration":"h"},{"keys":["E4"],"duration":"h"},{"keys":["G4"],"duration":"h"}],"label":"Hemiola metric expansion","caption":"Three half notes spanning two measures of 3/4."},"practiceActivities":[{"id":"poly-q1","prompt":"What is a hemiola?","options":[{"id":"hemiola-def","label":"A temporary metric re-grouping of two bars of triple time into three bars of duple time"},{"id":"wrong-1","label":"A type of half cadence in minor keys"},{"id":"wrong-2","label":"Playing four notes in the time of five"},{"id":"wrong-3","label":"A Greek ancient scale mode"}],"correctOptionId":"hemiola-def","explanation":"A hemiola re-groups six beats across two bars of triple meter into three larger two-beat pulses, creating a powerful feeling of metric expansion before a cadence."}],"terminology":[{"term":"Polyrhythm (Cross-Rhythm)","definition":"The simultaneous sounding of two or more independent, conflicting rhythmic meters."},{"term":"Two Against Three (2:3)","definition":"Playing two equal notes in one hand while playing three equal notes in the other over the same timespan."},{"term":"Hemiola","definition":"A rhythmic device where two bars of 3/4 are re-articulated as three bars of 2/4, often signaling an impending cadence."}],"keyboardIllustration":{"highlightNotes":["C3","G3","C4","E4","G4"],"showLabels":true,"label":"Left hand vs. Right hand polyrhythmic independence","caption":"Keep the left hand pulse steady while floating triplets across the right hand register."},"practicalApplication":"To practice polyrhythms away from your instrument, tap your left hand on your left knee and your right hand on your right knee. Repeat the speech phrase ''NOT dif-fi-CULT'' until both hands move automatically.","videoResource":{"title":"Open Yale Courses: Cross-Rhythms and African Roots","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-4","embedPermitted":false,"notes":"Prof. Wright demonstrates polyrhythms in African drumming and Western classical counterpoint."},"references":[{"title":"Open Music Theory: Cross-Rhythm and Metric Dissonance","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Mathematical analysis of metric conflict, grouping dissonances, and hemiolas."},{"title":"Berklee Online: Advanced Rhythm and Polyrhythms","authorOrInstitution":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","licence":"Educational Handbook","relevance":"Rhythmic independence and 3:4 coordination drills."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["C4"],"at":0,"duration":0.9},{"notes":["E4"],"at":1,"duration":0.9},{"notes":["G4"],"at":2,"duration":1.2}],"repertoireSteps":[{"notes":["C#3","G#4"],"at":0,"duration":0.2},{"notes":["C#5"],"at":0.16,"duration":0.15},{"notes":["E5"],"at":0.33,"duration":0.15},{"notes":["G#3","G#5"],"at":0.5,"duration":0.2},{"notes":["E5"],"at":0.66,"duration":0.15},{"notes":["C#5"],"at":0.83,"duration":0.15}]}'::jsonb,
  11,
  9,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'dots-ties-and-cross-rhythm' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'rhythmic-patterns',
  'Rhythmic patterns',
  'Recognize common recurring beat-level cells (dotted-eighth + sixteenth, two sixteenths + eighth, ostinatos) at sight via clean beaming.',
  '# Rhythmic patterns

Recognize common recurring beat-level cells (dotted-eighth + sixteenth, two sixteenths + eighth, ostinatos) at sight via clean beaming.

## Learning Objectives

- Read complete one-beat rhythmic cells visually as unified shapes rather than counting note-by-note.
- Compare two 16ths + 8th (''ti-ka-ti'') vs. 8th + two 16ths (''ti-ti-ka'') vs. dotted-8th + 16th.
- Follow clean metrical beaming showing where Beat 1, 2, 3, and 4 start.

## Musical Terminology

- **Rhythmic Pattern**: A characteristic recurring motif of durations that gives a musical style its unique signature.
- **Habanera**: Dotted eighth + sixteenth + two eighth notes (popularized by Bizet''s Carmen).
- **Waltz**: Strong downbeat quarter followed by two lighter buoyant quarters in 3/4 time.
- **March**: Crisp, dotted rhythms and heavy duple beat accents.

## 1. Chunking one-beat rhythmic vocabulary

Fluent score readers recognize rhythms in single-beat ''words''—much like reading whole English words instead of spelling each letter. Correct instrumental beaming binds each beat''s eighth and sixteenth subdivisions neatly together so every beat boundary shines cleanly on the page.

Memorize the core 1-beat family in 4/4: four sixteenths (1-e-and-a), eighth + two sixteenths (1 & a), two sixteenths + eighth (1 e &), and dotted eighth + sixteenth (1---a).

## Worked Example: Verifying beat capacity of a 16th-note mix

Does [16th + 8th + 16th] fill one full quarter beat?
1. 1st sixteenth = ¼ beat.
2. Middle eighth = ½ beat (⅔ of remainder, two quarters).
3. Final sixteenth = ¼ beat.
4. Sum = ¼ + ½ + ¼ = 1 full quarter beat (the crisp ''syncopated'' 1-beat cell!).
Yes: 16th–8th–16th spans 1 quarter beat.

## Practical Application

Learn to recognize characteristic dance rhythms on sight. When you see a 3/4 bar with an accented beat 2, you are reading a Polish Mazurka; when you see a dotted bass rhythm in 2/4, you are reading a Habanera.

## Summary

Recognizing standard one-beat rhythmic cells visually makes complex passages as easy to scan as familiar spoken words.
',
  '{"sections":[{"id":"beat-cell-chunking","notation":{"clef":"treble","timeSignature":"2/4","beamNotes":true,"chords":[{"keys":["C5"],"duration":"8"},{"keys":["D5"],"duration":"16"},{"keys":["E5"],"duration":"16"},{"keys":["F5"],"duration":"16"},{"keys":["E5"],"duration":"16"},{"keys":["D5"],"duration":"8"}],"label":"Beat 1 eighth plus two sixteenths, followed by Beat 2 two sixteenths plus eighth","caption":"Two mirror 1-beat patterns: [8th + two 16ths] followed cleanly by [two 16ths + 8th]."}}],"practiceActivities":[{"id":"rpat-q1","prompt":"Which combination correctly sums to ONE single quarter beat in 4/4?","options":[{"id":"a","label":"Two eighth notes + one sixteenth note"},{"id":"b","label":"One dotted eighth note + one sixteenth note"},{"id":"c","label":"One eighth note + three sixteenth notes"},{"id":"d","label":"One quarter note + one sixteenth note"}],"correctOptionId":"b","explanation":"A dotted eighth (¾ beat) + a sixteenth (¼ beat) = 1.00 beat."}],"terminology":[{"term":"Rhythmic Pattern","definition":"A characteristic recurring motif of durations that gives a musical style its unique signature."},{"term":"Habanera","definition":"Dotted eighth + sixteenth + two eighth notes (popularized by Bizet''s Carmen)."},{"term":"Waltz","definition":"Strong downbeat quarter followed by two lighter buoyant quarters in 3/4 time."},{"term":"March","definition":"Crisp, dotted rhythms and heavy duple beat accents."}],"keyboardIllustration":{"highlightNotes":["D3","F4","A4"],"showLabels":true,"label":"Characteristic Habanera rhythm pattern (D-F-A)","caption":"Syncopated Latin dance groove (dotted eighth - sixteenth - eighth - eighth)."},"practicalApplication":"Learn to recognize characteristic dance rhythms on sight. When you see a 3/4 bar with an accented beat 2, you are reading a Polish Mazurka; when you see a dotted bass rhythm in 2/4, you are reading a Habanera.","videoResource":{"title":"Open Yale Courses: Dance Rhythms in Classical Masterworks","publisher":"Yale University Department of Music (Prof. Craig Wright)","url":"https://oyc.yale.edu/music/musi-112/lecture-4","embedPermitted":false,"notes":"Prof. Wright traces Baroque dance suites, minuets, and 19th-century waltzes."},"references":[{"title":"Open Music Theory: Meter in Performance and Dance","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Historical dance meters and metric gesture."},{"title":"Harmony and Musicianship with Solfège: Rhythmic Idioms","authorOrInstitution":"Los Angeles City College (Profs. Cser & Wanner)","url":"https://www.lacc.edu/academics/programs/music/oer-textbook","licence":"OER","relevance":"Performance and dictation of characteristic rhythmic patterns."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["F4"],"at":0,"duration":0.24},{"notes":["G4"],"at":0.24,"duration":0.12},{"notes":["A4"],"at":0.36,"duration":0.12},{"notes":["Bb4"],"at":0.48,"duration":0.12},{"notes":["A4"],"at":0.6,"duration":0.12},{"notes":["G4"],"at":0.72,"duration":0.12},{"notes":["F4"],"at":0.84,"duration":0.12},{"notes":["C5"],"at":0.96,"duration":0.48}]}'::jsonb,
  8,
  10,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'rhythmic-patterns-and-sightreading' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'sight-reading',
  'Sight reading methodology and visual chunking',
  'Develop professional sight-reading fluency through pre-scan protocols, interval pattern recognition, and forward visual tracking.',
  '# Sight reading methodology and visual chunking

Develop professional sight-reading fluency through pre-scan protocols, interval pattern recognition, and forward visual tracking.

## Learning Objectives

- Execute the 5-point Pre-Scan Protocol (Clef, Key, Meter, Tempo, Roadblocks) before touching an instrument.
- Recognize pitch and chord shapes through visual chunking rather than note-by-note decoding.
- Maintain steady forward tempo without stopping or correcting errors during sight-reading.

## Musical Terminology

- **Sight Reading**: The ability to read and perform a musical score at first sight without prior rehearsal.
- **Visual Chunking**: Recognizing groups of notes as single unified musical units (e.g. scales, triads, arpeggios) rather than isolated symbols.
- **Eye-Hand Span**: The distance your eyes read ahead of the notes your hands are currently playing.
- **Pre-Scan Protocol**: A disciplined 30-second silent mental audit of a piece prior to performance.

## 1. The 30-Second Pre-Scan Protocol

Sight-reading is 80% mental preparation and 20% execution. Amateur musicians make the mistake of playing immediately upon seeing new sheet music. Professional musicians never touch a key until they have completed a 30-second silent audit:

1. Check the CLEF and KEY SIGNATURE (which notes are sharp or flat throughout?). 2. Check the TIME SIGNATURE and primary beat unit. 3. Scan for ROADBLOCKS (accidentals, ledger lines, rhythmic shifts). 4. Establish a conservative, steady tempo in your head.

## Worked Example: Applying Visual Chunking to an Unfamiliar Score

You encounter a measure containing four ascending notes: C4, E4, G4, C5.
1. Note-by-note approach: ''There is a C... then an E... then a G... then a high C.'' (Slow and disjointed).
2. Visual chunking approach: ''That is a root-position C Major arpeggio.'' (Instant recognition as a single shape).
3. Your hand immediately prepares the C-major finger shape, freeing your eyes to look ahead into the next measure.
Chunking transforms reading from decoding individual letters into reading whole words and sentences.

## Practical Application

The Golden Rule of Sight Reading: NEVER STOP! When you play a wrong note, do not stop, gasp, or correct it. In real performance, time marches relentlessly forward. Keep playing the rhythm even if you drop a note.

## Summary

Sight-reading fluency is achieved through disciplined pre-scanning, visual chunking of scales and chords, and maintaining relentless forward motion without stopping for mistakes.
',
  '{"sections":[{"id":"pre-scan-protocol","notation":{"clef":"treble","keySignature":"G","timeSignature":"3/4","chords":[{"keys":["G4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["D5"],"duration":"q"}],"label":"Visual chunk: G Major triad in 3/4 meter","caption":"Recognize this instantly as a single G-major harmonic unit rather than three disconnected notes."}}],"workedExample":{"clef":"treble","chords":[{"keys":["C4"],"duration":"q"},{"keys":["E4"],"duration":"q"},{"keys":["G4"],"duration":"q"},{"keys":["C5"],"duration":"q"}],"label":"C Major arpeggiated chunk","caption":"Read this as a single unified gesture."},"practiceActivities":[{"id":"sight-reading-q1","prompt":"What is the single most important rule when sight-reading in front of an ensemble?","options":[{"id":"never-stop","label":"Never stop or restart when you make a mistake; keep the rhythm moving forward"},{"id":"play-fast","label":"Play as fast as possible to impress the listeners"},{"id":"correct-every-note","label":"Stop immediately and replay every wrong note until it is perfect"},{"id":"memorize-first","label":"Memorize the entire piece before playing measure 1"}],"correctOptionId":"never-stop","explanation":"Maintaining steady metric time is paramount in sight reading; stopping destroys the ensemble pulse, whereas an isolated wrong note in steady time is quickly forgotten."}],"terminology":[{"term":"Sight Reading","definition":"The ability to read and perform a musical score at first sight without prior rehearsal."},{"term":"Visual Chunking","definition":"Recognizing groups of notes as single unified musical units (e.g. scales, triads, arpeggios) rather than isolated symbols."},{"term":"Eye-Hand Span","definition":"The distance your eyes read ahead of the notes your hands are currently playing."},{"term":"Pre-Scan Protocol","definition":"A disciplined 30-second silent mental audit of a piece prior to performance."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4","C5"],"showLabels":true,"label":"C Major hand shape","caption":"Forming the physical chord shape in advance allows fluent sight reading without looking down at your hands."},"practicalApplication":"The Golden Rule of Sight Reading: NEVER STOP! When you play a wrong note, do not stop, gasp, or correct it. In real performance, time marches relentlessly forward. Keep playing the rhythm even if you drop a note.","videoResource":{"title":"Berklee Online: Sight-Reading Strategies and Eye Movement","publisher":"Berklee College of Music","url":"https://online.berklee.edu/free-music-course-handbooks","embedPermitted":false,"notes":"Berklee faculty lecture on visual chunking, peripheral vision, and sight-reading speed."},"references":[{"title":"Open Music Theory: Sight Reading and Musicianship","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Cognitive chunking, eye tracking, and pattern identification."},{"title":"Integrated Musicianship: Sight-Reading Protocol","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Systematic sight-singing and sight-reading progressive exercises."}]}'::jsonb,
  '{"workedExampleSteps":[{"notes":["C4"],"at":0,"duration":0.35},{"notes":["E4"],"at":0.35,"duration":0.35},{"notes":["G4"],"at":0.7,"duration":0.35},{"notes":["C5"],"at":1.05,"duration":0.7}],"repertoireSteps":[{"notes":["C4","C5"],"at":0,"duration":0.4},{"notes":["E4","G4"],"at":0.25,"duration":0.2},{"notes":["G4","C5"],"at":0.5,"duration":0.4},{"notes":["C4","E5"],"at":0.75,"duration":0.4}]}'::jsonb,
  11,
  11,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'rhythmic-patterns-and-sightreading' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

INSERT INTO public.lessons (
  module_id, slug, title, summary, content_markdown, notation_payload, audio_config, estimated_minutes, sort_order, status
)
SELECT
  m.id,
  'reading-musical-passages',
  'Reading musical passages',
  'Synthesize clef, key signature, time signature, tonal contour, harmony, and rhythmic patterns in complete real-world musical sight-reading.',
  '# Reading musical passages

Synthesize clef, key signature, time signature, tonal contour, harmony, and rhythmic patterns in complete real-world musical sight-reading.

## Learning Objectives

- Execute a disciplined four-point pre-scan (Clef → Key Signature → Time Signature → Starting/Ending Tonic).
- Spot embedded scales, arpeggios, and recurring motifs rather than reading isolated noteheads.
- Read ahead by half a bar while keeping a forgiving, unbroken tempo pulse.

## Musical Terminology

- **Score Reading**: The multi-layered cognitive skill of decoding pitch, meter, dynamics, and expression simultaneously in real time.
- **Macro-Reading**: Reading full measure blocks and harmonic gestures rather than isolated individual notes.
- **Expressive Inflection**: Applying phrasing, dynamics (piano to forte), and articulation (staccato, legato) to written notation.

## 1. The pre-reading scan & pattern grouping

True musical literacy unites everything studied across all four Theory Academy paths. Before sounding a single note, train the discipline of a 5-second scan: check CLEF, identify KEY SIGNATURE tonic (major or relative minor), lock in TIME SIGNATURE pulse (simple or compound), and scan the widest skips plus lowest/highest points.

As you read, group notes into familiar theoretical blocks: ''Here sits a G major arpeggio ascending to B, followed by a stepwise diatonic descent over a dotted-quarter motif.'' Reading intervals and chord outlines rather than spelling single letters one by one multiplies fluency tenfold!

## Worked Example: Pre-scanning an unfamiliar D major 6/8 passage

Walk systematically through the opening line of an unseen score before playing.
1. Clef: Treble clef → Line 2 is G4.
2. Key Signature: Two sharps (F♯, C♯) → D Major (or B minor). Opening chord D–F♯–A confirms D Major.
3. Time Signature: 6/8 → Two dotted-quarter beats per bar swinging in 3s.
4. Pattern inspection: Bars 1–2 outline a rising D–F♯–A triad then step gently F♯–E–D.
By decoding theory patterns ahead of Beat 1, you read melodies cleanly on the very first pass.

## Practical Application

Keep your eyes moving one beat ahead of your hands. Reading music is like reading aloud from a book: you cannot read word-by-word; you must process entire grammatical phrases ahead of time.

## Summary

Fluent passage reading combines instant pre-scanning (clef, key, meter) with pattern-level recognition of scales, intervals, chords, and beat cells.
',
  '{"sections":[{"id":"four-point-scan","notation":{"clef":"treble","keySignature":"G","timeSignature":"4/4","chords":[{"keys":["G4"],"duration":"q"},{"keys":["B4"],"duration":"q"},{"keys":["D5"],"duration":"qd"},{"keys":["C5"],"duration":"8"},{"keys":["B4"],"duration":"h"}],"label":"Musical passage in G major, 4/4 time: rising G-B-D tonic triad then stepwise C5-B4 descent","caption":"Complete passage check: Treble clef · 1 sharp (G major) · 4/4 meter · Tonic triad outline (G–B–D) into dotted lyrical resolution."}}],"practiceActivities":[{"id":"readpass-q1","prompt":"You open a score displaying Bass Clef, three flats (B♭, E♭, A♭), time signature 6/8, and an opening bass arpeggio E♭3–G3–B♭3. Which analytical reading summary is accurate?","options":[{"id":"a","label":"Key of A♭ major in 6 slow beats per measure"},{"id":"b","label":"Key of E♭ major felt in 2 dotted-quarter beats per measure"},{"id":"c","label":"Key of C minor felt in 3 simple quarter beats"},{"id":"d","label":"Treble clef in E♭ major"}],"correctOptionId":"b","explanation":"Three flats (B♭, E♭, A♭) anchored by E♭–G–B♭ confirms E♭ major; 6/8 moves in 2 compound dotted-quarter beats per bar."}],"terminology":[{"term":"Score Reading","definition":"The multi-layered cognitive skill of decoding pitch, meter, dynamics, and expression simultaneously in real time."},{"term":"Macro-Reading","definition":"Reading full measure blocks and harmonic gestures rather than isolated individual notes."},{"term":"Expressive Inflection","definition":"Applying phrasing, dynamics (piano to forte), and articulation (staccato, legato) to written notation."}],"keyboardIllustration":{"highlightNotes":["C4","E4","G4","C5"],"showLabels":true,"label":"Full score reading integration (C Major)","caption":"Synthesizing pitch height, rhythmic values, and harmonic context into expressive performance."},"practicalApplication":"Keep your eyes moving one beat ahead of your hands. Reading music is like reading aloud from a book: you cannot read word-by-word; you must process entire grammatical phrases ahead of time.","videoResource":{"title":"Juilliard Extension: Score Reading Masterclass","publisher":"The Juilliard School","url":"https://www.juilliard.edu/stage-beyond/juilliard-extension","embedPermitted":false,"notes":"Conservatory lecture on real-time score reading and polyphonic music analysis."},"references":[{"title":"Open Music Theory: Score Analysis","authorOrInstitution":"Open Music Theory (Version 2)","url":"https://viva.pressbooks.pub/openmusictheory/","licence":"CC BY-SA 4.0","relevance":"Complete score navigation, system barlines, and rehearsal marks."},{"title":"Integrated Musicianship: Score Fluency","authorOrInstitution":"University of Idaho (Dr. Sean Butterfield)","url":"https://seanbutterfield.github.io/integratedmusicianship/","licence":"OER","relevance":"Advanced sight-reading and score-reading practice drills."}]}'::jsonb,
  '{"repertoireSteps":[{"notes":["D5"],"at":0,"duration":0.42},{"notes":["G4"],"at":0.44,"duration":0.22},{"notes":["A4"],"at":0.66,"duration":0.22},{"notes":["B4"],"at":0.88,"duration":0.22},{"notes":["C5"],"at":1.1,"duration":0.22},{"notes":["D5"],"at":1.32,"duration":0.42},{"notes":["G4"],"at":1.76,"duration":0.42},{"notes":["G4"],"at":2.2,"duration":0.42}]}'::jsonb,
  12,
  12,
  'published'::public.content_status
FROM public.course_modules m
JOIN public.courses c ON m.course_id = c.id
WHERE m.slug = 'rhythmic-patterns-and-sightreading' AND c.slug = 'rhythmic-nuance-and-passage-reading'
ON CONFLICT (module_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  content_markdown = EXCLUDED.content_markdown,
  notation_payload = EXCLUDED.notation_payload,
  audio_config = EXCLUDED.audio_config,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  status = 'published'::public.content_status,
  updated_at = now();

DO $$
BEGIN
  RAISE NOTICE 'THEORYLAB Official Curriculum Seed completed successfully: 4 learning paths, 8 courses, 12 modules, 46 published lessons.';
END $$;

# THEORYLAB — Master Product Requirements Document (PRD)

**Status:** Approved Baseline + Future Music Intelligence Studio Expansion  
**Product Name:** THEORYLAB  
**Tagline:** *Understand Music. Read Music. Hear Music. Create Music.*

---

## 1. Product Vision & Core Positioning

THEORYLAB is an interactive classical music theory education platform built for independent learners, enrolled students, institutional lecturers, and platform administrators. It combines an editorial aesthetic with browser-based music engraving, audio playback, structured curriculum stages, and educator workflows.

### Foundational Positioning Principle
> **THEORYLAB remains primarily a music education platform, not merely an AI music generator.**

Every existing and future capability—including all features inside the future **Music Intelligence Studio**—must contribute directly to **musical understanding, harmonic/melodic analysis, practical skill reinforcement, or creative learning**. Automated analysis, transcription, stem separation, or accompaniment generation serve as pedagogical lenses into pitch, rhythm, harmony, orchestration, and ear training rather than one-click entertainment tools.

---

## 2. Preserved Brand & Design Decisions

- **Aesthetic Direction:** Classical editorial music aesthetic paired with focused educational software clarity.
- **Color Tokens:** Ivory (`#F7F4ED`), Paper (`#FFFEFA`), Charcoal (`#20201E`), Burgundy (`#702F3C`), Antique Gold (`#AD9563`), Warm Grey (`#DAD6CD`), Soft Grey (`#85827B`).
- **Typography:** Display serif (*Bodoni Moda* / classical editorial display) and clean sans body (*Manrope* / structured UI typography) using `type-*` utilities.
- **Preserved Public Landing Experience (`/`):** The scrolling editorial landing page, existing interactive Harmony demonstration, playable score previews, and curriculum overview remain intact and must not be disrupted by internal workspace development.

---

## 3. User Roles & Permissions Summary

1. **Independent Learner (`independent_learner`)**
   - Default role granted securely on self-registration.
   - Accesses Learner Studio (`/learn`), curriculum paths, practice tools, assessments, and future self-directed Music Intelligence Studio tools.
2. **Student (`student`)**
   - Enrolled learner linked to one or more lecturer-managed classes (`class_memberships`).
   - Accesses Student Dashboard (`/learn`), assigned coursework, assessments, progress tracking, and guided audio analysis exercises.
3. **Lecturer (`lecturer`)**
   - Authorized educator role provisioned via administrator approval (never self-granted directly by unverified signup metadata).
   - Accesses Lecturer Workspace (`/teach`) to manage classes, student rosters, assignments, assessments, teaching resources, and cohort performance.
4. **Administrator (`administrator`)**
   - Protected governance role assigned strictly via server/admin tooling.
   - Accesses Administrator Dashboard (`/admin`) to govern user directory, lecturer approvals, curriculum/lessons, assessment governance, analytics, and system settings.

---

## 4. Core Educational Platform Modules (Preserved)

### 4.1 Theory Academy & Structured Curriculum
Four progressive classical theory stages (`learning_paths`, `courses`, `course_modules`, `lessons`):
- **Stage I — Beginner:** Musical alphabet, staff, treble & bass clefs, note values, basic rhythm.
- **Stage II — Elementary:** Major & minor scales, intervals, key signatures, circle of fifths, simple meters.
- **Stage III — Intermediate:** Triads, inversions, diatonic harmony, figured bass, seventh chords.
- **Stage IV — Advanced:** Cadences, modulation, secondary dominants, voice leading, counterpoint.

### 4.2 Interactive Music Laboratories
- **Playable Keyboard & Staff:** Real-time Tone.js audio playback paired with VexFlow engraved notation.
- **Treble & Bass Notation Lab:** Pitch placement, scale stepping, clef reading drills.
- **Ear Training Drills:** Interval recognition, chord quality discrimination, rhythmic/melodic dictation.
- **Harmony Demonstration:** Existing interactive harmony tools preserved on `/` and within study labs.

### 4.3 Assessments, Progress & Notifications
- Diagnostic & module assessments with immutable attempt/question snapshots and strict grading state transitions.
- Lesson completion, practice activity tracking, and educational notifications.

### 4.4 Lecturer Workspace (`/teach`) — Preserved Capabilities
1. **Overview** — Cohort metrics, recent assignments, educator capability index.
2. **My Classes** — Class creation, join codes, schedules, level alignment.
3. **Students** — Roster inspection, accuracy metrics, targeted support indicators.
4. **Assignments** — Setting keyboard, notation, harmony, and aural coursework.
5. **Assessments** — Class-level diagnostic quizzes and grading review.
6. **Resources** — Seminar decks, interactive score examples, curriculum packs.
7. **Performance** — Cohort completion and concept-mastery monitoring.

### 4.5 Administrator Dashboard (`/admin`) — Preserved Capabilities
1. **Overview** — Platform governance metrics and configuration overview.
2. **Users** — Account directory, role inspection, account status (`active`, `suspended`, `archived`).
3. **Lecturers** — Faculty review, verification, and lecturer role provisioning.
4. **Curriculum** — Governing the four curriculum stages and syllabus sequence.
5. **Lessons** — Managing published theory lessons, notation payloads, and audio configs.
6. **Assessments** — Question bank governance and grading rubric oversight.
7. **Analytics** — Cross-cohort completion and learning telemetry.
8. **Settings** — Platform policies, provider governance, and Supabase integration checks.

---

## 5. Future Product Module: Music Intelligence Studio

**Overview:** An AI-powered music analysis, transcription, instrument separation, and musical arrangement environment designed to help students understand, analyse, and create music using real audio recordings. Music Intelligence Studio integrates directly into THEORYLAB's curriculum, interactive notation/playback engine, and student progress systems.

> **Implementation Boundary:** Music Intelligence Studio is officially specified as future roadmap Phases 8–10. It must **not** be implemented during the current authentication and core academy phases.

### 5.1 Workspace A — Song Analysis Studio (Phase 8)
**Purpose:** Allow students to upload music and transform it into an interactive music theory learning experience.

**Functional Requirements:**
1. **Audio Upload:** Upload supported audio formats (e.g., WAV, MP3, FLAC, M4A/AAC, OGG) with client & server validation.
2. **Core Musical Analysis:** Analyse melody, pitch contour, key/tonality, tempo (BPM), time signature/meter, and rhythm.
3. **Note & Pattern Detection:** Detect individual pitched notes, onset/offset timings, and recurring melodic motifs/patterns.
4. **MIDI Export & Processing:** Convert detected musical information into structured MIDI data.
5. **Standard Staff Notation:** Generate standard music notation (e.g., via MusicXML + VexFlow) and place notes accurately on clefs, staves, and measures with key signatures and rhythmic quantization.
6. **Solfa Notation:** Generate tonic solfa notation (`d r m f s l t d'`) with **movable-Do** support aligned accurately to the detected or user-confirmed key relationship.
7. **Harmonic & Theoretical Detection:** Identify intervals, scales, chords, and harmonic progressions/patterns where supported by the audio complexity.
8. **Interactive Notation Display:** Render generated notation in an interactive notation interface linked with keyboard/visualizers.
9. **Targeted Playback:** Allow students to play individual notes, selected phrases/measures, and complete transcriptions.
10. **Pedagogical Explanations:** Provide clear, learner-friendly theory explanations for detected keys, intervals, scales, chords, and rhythmic figures, linking back to THEORYLAB lessons.
11. **Section & Tempo Study:** Allow students to slow down playback (without pitch distortion where supported), loop regions, and isolate specific sections for study.
12. **Human-in-the-Loop Correction:** Allow students (and lecturers) to review, edit, and correct inaccurate transcription notes, rhythms, or key/enharmonic interpretations.

### 5.2 Workspace B — Instrument Analysis Studio (Phase 9)
**Purpose:** Allow students to separate and study the musical components of uploaded recordings.

**Functional Requirements:**
1. **Recording Upload:** Upload supported multi-instrument music recordings.
2. **Stem Separation:** Separate supported audio sources into individual stems via dedicated backend processing.
3. **Core Stems:** Support **vocals, drums, bass, and other accompaniment** where available.
4. **Extended Instrument Stems:** Support **guitar and piano** separation where the selected separation model/technology permits.
5. **Mixer Controls:** Provide independent per-stem playback, solo, mute, and level controls.
6. **A/B Comparison:** Allow students to switch seamlessly between isolated stems and the original mixed recording.
7. **Per-Stem Musical Analysis:** Analyse rhythm, pitch contour, and recurring musical patterns within available separated stems.
8. **Instrument Role Education:** Explain the musical, rhythmic, and harmonic role each instrument plays within classical, ensemble, or contemporary texture.
9. **Future Orchestral Section Analysis:** Support future architecture hooks for orchestral family/section analysis (strings, woodwinds, brass, percussion) as model fidelity matures.
10. **Exploratory Stem Transcription:** Explore automatic transcription of isolated monophonic/polyphonic stems (e.g., vocal melody, bass line, piano part) where technically feasible.

**Explicit Scope Limitations & User Transparency:**
- **Never promise perfect separation** of every instrument across arbitrary recordings.
- **Orchestral Solo Isolation Notice:** Individual violin, viola, cello, flute, trumpet, and other specific orchestral instrument isolation must be treated strictly as an **advanced research and development (R&D) capability**, not a guaranteed production promise.
- **Uncertainty Communication:** UI must communicate separation confidence, spectral bleed/artifacts, overlapping-frequency constraints, and processing limitations transparently to users.

### 5.3 Workspace C — AI Accompaniment and Arrangement Studio (Phase 10)
**Purpose:** Allow students to transform an acapella vocal recording into an accompanied musical arrangement that deepens understanding of harmony, texture, and stylistic orchestration.

**Functional Requirements:**
1. **Acapella Upload:** Allow students to upload an existing acapella vocal recording.
2. **Direct Browser Vocal Recording:** Allow students to record their singing directly in the browser (using Web Audio / MediaRecorder with permission checks, level metering, and pre-upload review).
3. **Vocal Musical Analysis:** Analyse vocal melody, pitch, inferred key/mode, tempo, beat grid, rhythm, and musical phrasing.
4. **Arrangement Style Selection:** Allow selection of desired musical arrangement styles.
5. **Piano Accompaniment:** Support dedicated classical/contemporary piano accompaniment styles.
6. **Strings & Orchestral Arrangements:** Support string ensemble and orchestral-inspired accompaniment styles.
7. **Guitar & Acoustic Arrangements:** Support fingerstyle/strummed guitar and acoustic ensemble styles.
8. **Worship-Style Arrangements:** Support warm harmonic worship-style piano/pad/band arrangements.
9. **Custom Instrument Combinations:** Allow combining specific instruments (e.g., Piano + Cello, Acoustic Guitar + Strings) where supported by the chosen generation engine.
10. **Vocal-Following Generation:** Generate musical accompaniment whose chord progressions, harmonic rhythm, and dynamics follow the student's original vocal melody and phrasing.
11. **Temporal & Pitch Alignment:** Align generated accompaniment tightly in timing (beat/rubato tracking) and tuning with the original vocal recording.
12. **Audition Alternatives:** Allow students to generate and audition multiple alternative harmonic/stylistic arrangements for the same vocal take.
13. **Independent Mixing Controls:** Allow independent adjustment of original vocal volume and generated instrumental volume (and stem levels where available).
14. **Vocal Preservation:** Preserve the student's original vocal recording unaltered alongside non-destructive arrangement renders.
15. **Backing Track Export:** Allow exporting the instrumental backing track separately.
16. **Final Mix Export:** Allow exporting the aligned final mixed recording (vocal + accompaniment).

---

## 6. Learning Integration Requirements

To ensure Music Intelligence Studio strengthens THEORYLAB's educational core:
- **Curriculum Linking:** Map detected concepts (intervals, triads, chord progressions, meters, keys) directly to relevant lessons in **Theory Academy** Stages I–IV.
- **Interactive Concept Study:** Allow learners to click any detected chord, interval, note, or rhythmic figure in a transcription or stem to inspect an explanation and hear it isolated on the THEORYLAB keyboard/staff.
- **Extracted Practice Examples:** Turn passages from uploaded recordings into playable sight-reading, ear-training, or slowdown practice drills.
- **Progress Integration:** Record completed analysis reflections, transcription correction exercises, or studio study milestones into `lesson_progress` / student activity feeds where educationally appropriate.

---

## 7. Dependencies & Non-Functional Requirements

- **Backend Processing Dependency:** Audio transcription, stem separation, beat/pitch tracking, and accompaniment generation are computationally intensive and depend on a dedicated backend audio-processing worker/service and evaluated AI/DSP providers.
- **Licensing & Commercial Rights:** Any third-party AI model or API selected before Phases 8–10 must pass commercial usage, copyright/royalty, privacy, and data-retention review.
- **Security & Privacy:** All audio uploads and outputs must be validated (MIME type, magic bytes, file duration/size), stored in private Supabase Storage buckets scoped by user/class ownership, accessed via short-lived signed URLs, and processed using authorized backend requests without exposing third-party secrets in browser bundles.

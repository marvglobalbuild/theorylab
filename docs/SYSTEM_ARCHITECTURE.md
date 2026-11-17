# THEORYLAB — System & Technical Architecture

This document describes THEORYLAB's current production architecture (Frontend, Supabase Backend, Music Engine) alongside the planned **Dedicated Audio & Music Intelligence Architecture** for future Phases 8–10.

---

## 1. Current Platform Architecture (Preserved)

### 1.1 Frontend Application
- **Framework & Build:** React 19 + TypeScript + Vite + TanStack Start / TanStack Router (`src/routes/`) + Tailwind CSS v4 (`@theme inline` design tokens).
- **UI & Motion:** Radix UI primitives, Lucide icons, Motion (`motion/react`) for subtle editorial transitions, React Query for async state.
- **Music Logic & Browser Synthesis:**
  - Pure music theory engine in `src/lib/music/theory.ts` (unit-tested in `src/test/music-theory.test.ts`).
  - Dynamic browser-only **Tone.js** synthesis (`src/lib/music/usePiano.ts`, `src/lib/music/backgroundMusic.ts`) activated on user gesture.
  - Dynamic browser-only **VexFlow** score engraving (`src/components/music/Staff.tsx`).
- **Service Contract Boundary (`src/services/`):**
  - UI components consume interfaces defined in `src/services/contracts.ts` and exported from `src/services/index.ts`.
  - Auth and profile/role services connect to Supabase (`src/services/supabase-auth.ts`); curriculum, progress, assessments, and future studio pipelines will swap in cleanly behind contracts as subsequent phases are built.

### 1.2 Backend, Authentication & Data Layer (Supabase)
THEORYLAB uses **one unified Supabase project** (never replaced or supplemented with Firebase):
- **Client Integration (`src/lib/supabase.ts`):** Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` only (no secret keys or `service_role` tokens in browser code).
- **Authentication:** Supabase Auth (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`, `verifyOtp`, `onAuthStateChange`).
- **Database (`supabase/migrations/0001_initial_schema.sql`):**
  - Identity & RBAC: `profiles`, `user_roles` (`independent_learner`, `student`, `lecturer`, `administrator`).
  - Lecturer Management: `classes`, `class_memberships`, `class_assignments`.
  - Curriculum: `learning_paths`, `courses`, `course_modules`, `lessons`, `course_enrolments`.
  - Practice & Assessments: `exercises`, `questions`, `question_options`, `question_answer_keys`, `assessments`, `assessment_questions`, `assessment_attempts`, `assessment_responses`.
  - Progress & Notifications: `lesson_progress`, `notifications`.
- **Security:** Strict PostgreSQL Row-Level Security (RLS) on all tables, `SECURITY DEFINER` non-recursive role checks, immutable assessment snapshots, and trigger-enforced `independent_learner` default role assignment.

---

## 2. Future Music Intelligence Studio System Architecture (Phases 8–10)

### 2.1 High-Level Topology

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ THEORYLAB Frontend (React + TypeScript + Tailwind + Tone.js + VexFlow)      │
│  • Audio Upload / Mic Capture / Waveform Trimming                           │
│  • Interactive Staff, Movable-Do Solfa, Piano Roll & Stem Mixer             │
│  • Job Status Subscriptions & Theory Lesson Cross-Links                     │
└───────────────┬─────────────────────────────────────────┬───────────────────┘
                │ Auth JWT + Signed Storage URLs          │ Realtime / Polling
                ▼                                         │
┌───────────────────────────────────────┐                 │
│ Supabase Platform                     │◄────────────────┘
│  • Auth & RLS Access Control          │
│  • Postgres: Audio Assets, Processing │
│    Jobs, Transcriptions, Stems, Mixes │
│  • Private Storage Buckets            │
└───────────────┬───────────────────────┘
                │ Signed Job Dispatch (Server-to-Server / Webhook / Queue)
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Dedicated Backend Audio Processing Service (Python / Node Worker / GPU)     │
│  • Validation, Transcoding, Trimming, Normalization                         │
│  • Pitch/Beat/Key/Chord Analysis & MIDI/MusicXML/Solfa Generation           │
│  • Source Separation Workers & AI Accompaniment / Vocal Alignment Engine    │
│  • Provider Adapters (Third-Party APIs and/or Self-Hosted Models)           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Why a Dedicated Backend Processing Service is Required
- Browser runtime and lightweight Edge Functions cannot reliably execute multi-minute DSP, polyphonic pitch detection, deep-learning source separation, or audio-conditioned accompaniment synthesis within memory/timeout limits.
- A dedicated backend processing service isolates heavy compute, executes asynchronous job queues with retries/timeouts, protects all commercial AI/model API keys strictly server-side, and writes verified artifacts back to private Supabase Storage + PostgreSQL tables.

---

## 3. Shared Infrastructure Specifications

### 3.1 Audio Management Infrastructure
1. **Upload & Validation:**
   - Enforce allow-listed formats (WAV, MP3, FLAC, M4A/AAC, OGG, WebM audio capture), maximum file size, maximum audio duration per tier, and server-side file-header (magic byte) + FFmpeg/probe verification.
2. **Secure Audio Storage:**
   - Store raw uploads, trimmed segments, separated stems, MIDI/MusicXML artifacts, and rendered accompaniment mixes in **private Supabase Storage buckets** partitioned by `{user_id}/{project_id}/...`.
   - Never expose raw storage paths publicly; issue short-lived signed URLs after verifying RLS ownership.
3. **Playback, Preview & Trimming:**
   - Client-side waveform rendering, regional trim markers (`start_ms`, `end_ms`) prior to heavy job submission, and sample-accurate multi-track Web Audio / Tone.js synchronization for solo/mute stem playback and slowdown study.
4. **Processing Job Management & Status Handling:**
   - Asynchronous job table tracking `job_type` (`song_analysis`, `stem_separation`, `accompaniment_generation`, `mix_export`), `status` (`queued`, `validating`, `processing`, `completed`, `failed`, `cancelled`), progress percentage, stage label, error codes, and retry metadata.
   - Surface actionable, non-technical error messages on corrupt audio, silence, excessive duration, or provider outage, plus clean cancellation/cleanup.
5. **Result Storage & Export Management:**
   - Persist structured analysis JSON, MIDI (`.mid`), MusicXML (`.musicxml`/`.mxl`), edited user revisions, and exported audio renders (`.wav`/`.mp3`) with retention policies and user delete controls.

### 3.2 Music Intelligence Services
1. **Audio Analysis Services:** Tempo/beat tracking, time-signature inference, onset detection, chroma/key estimation, harmonic chord recognition, and dynamic phrasing cues.
2. **Pitch & Melody Detection:** Monophonic vocal F0 pitch tracking (for Acapella & Song Analysis) and polyphonic multi-pitch transcription models.
3. **MIDI & MusicXML Processing:** Beat-aligned quantization, voice separation (treble/bass clef assignment), tempo map embedding, and clean MusicXML serialization.
4. **Music Notation Rendering & Solfa Conversion:**
   - Render MusicXML / structured note events onto **VexFlow** interactive staves inside THEORYLAB.
   - Compute **movable-Do solfa** (`d r m f s l t`, plus chromatic inflections like `di`, `ra`, `fi`, `ta` where needed) dynamically from the confirmed key center, updating cleanly if a student transposes or corrects the key.
5. **Audio Stem Separation:** Multi-stem demixing pipeline (`vocals`, `drums`, `bass`, `other`, plus `piano` and `guitar` where supported by the chosen model), accompanied by per-stem energy/clarity diagnostics.
6. **AI Accompaniment, Alignment & Mixing:**
   - Condition harmonic/instrumental generation on extracted vocal melody, key, chord plan, beat grid, and user-chosen style.
   - Perform beat-grid warping / micro-timing alignment, loudness matching, non-destructive mixing with the untouched original vocal, and separate backing-track + mixed exports.

### 3.3 Learning Integration Layer
- Map detected keys, intervals, scales, chords, and meters to existing `public.learning_paths`, `public.courses`, and `public.lessons` identifiers.
- Reuse pure music theory logic (`src/lib/music/theory.ts`) for interval naming, scale spelling, triad/seventh chord verification, and contextual theory explanations.
- Export detected excerpts into THEORYLAB practice drills and optional `lesson_progress` milestones.

---

## 4. Security, Privacy & Data Governance Requirements

1. **Private User Media Isolation:** Uploaded recordings and generated arrangements are private user assets by default; row-level ownership in Postgres and Storage policies prevents cross-user access.
2. **Zero Frontend Secrets:** Third-party AI audio API keys, worker credentials, and storage signing keys live exclusively in the backend processing service / server environment—never in `VITE_*` variables.
3. **Authorized Job Dispatch:** Processing endpoints verify the user's Supabase JWT, confirm quota/file ownership, validate inputs before queuing GPU/API work, and prevent SSRF or arbitrary URL fetching.
4. **Abuse & Cost Controls:** Enforce rate limits, max concurrent jobs per user, file size/duration caps, and automatic cleanup of expired intermediate artifacts.
5. **User Recording Rights & Deletion:** Deleting a studio project removes database records and purges all associated raw audio, stems, and generated exports from Storage.

---

## 5. Technical Limitations & Engineering Boundaries

- **Polyphonic Transcription Accuracy:** Dense polyphonic mixes (heavy reverb, percussion masking, complex counterpoint) produce inevitable octave, rhythmic-quantization, or spelling errors; **manual review and editing UI is mandatory**, not optional.
- **Stem Separation Artifacts & Bleed:** Acoustic bleed, phase artifacts, and overlapping frequency bands (e.g., guitar vs. piano vs. synth/strings) limit separation purity; THEORYLAB must never claim zero-bleed isolation.
- **Orchestral Instrument Isolation (R&D Only):** Isolating individual orchestral instruments (solo violin vs. viola vs. cello, flute vs. clarinet, trumpet vs. horn) remains an advanced research & development frontier and must be flagged as experimental/unavailable unless validated by specialized models.
- **Vocal-to-Accompaniment Alignment:** Expressive rubato, vibrato, and pitch drift in raw acapella recordings require explicit beat/key confirmation UI and non-destructive mixing so the original vocal is never degraded.
- **Latency & Offline Playback:** Multi-minute audio jobs require asynchronous processing (seconds to minutes depending on duration and model); browser Tone.js/VexFlow playback operates client-side immediately once notation/stems arrive.

---

## 6. Third-Party Provider & Self-Hosted Model Evaluation Criteria

Before selecting any audio analysis, stem separation, or accompaniment generation provider in Phases 8–10, candidates must be formally scored against these **10 mandatory evaluation criteria**:

| # | Criterion | Key Questions to Verify |
| --- | --- | --- |
| 1 | **Processing Accuracy** | Pitch F0 precision, polyphonic transcription F-measure, key/chord accuracy, stem SDR (Signal-to-Distortion Ratio). |
| 2 | **Audio Quality** | Sample rate support (44.1/48 kHz), absence of metallic/chirping artifacts, studio readiness of rendered stems & instruments. |
| 3 | **Vocal Alignment** | Tightness of beat, phrasing, chord changes, and tuning lock against expressive human vocals. |
| 4 | **Instrument Control** | Ability to request specific instruments/ensembles (piano, strings, guitar, worship, custom combos) rather than opaque prompts only. |
| 5 | **Processing Speed** | P50 and P95 job completion latency for 1–5 minute recordings; streaming or progressive progress support. |
| 6 | **Operating Costs** | Predictable per-minute or GPU-hour unit economics sustainable for independent learners and institutional cohorts. |
| 7 | **Commercial Usage Rights** | Permission to deploy in a commercial educational SaaS platform and allow students/lecturers to export their works. |
| 8 | **Licensing Terms** | Open-weights license compatibility (Apache-2.0/MIT vs. non-commercial CC-BY-NC restrictions) or clear SaaS API SLA terms. |
| 9 | **Privacy & Data Retention** | Zero training on private user vocal recordings by default; clear zero-retention or region-pinned processing agreements. |
| 10 | **Scalability** | Concurrency limits, batching/queue resilience, autoscaling GPU/API throughput during conservatory/semester peaks. |

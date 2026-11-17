# THEORYLAB — Official Development Roadmap

This roadmap governs the sequential delivery of THEORYLAB. Phases are engineered iteratively so each foundational layer is verified and secure before later phases build upon it.

---

## Roadmap Sequence

| Phase | Milestone | Scope & Key Deliverables |
| --- | --- | --- |
| **1** | **Application foundation** | Editorial visual system, preserved scrolling landing page (`/`), interactive Harmony preview, Vite/React/TanStack Start setup, service contract boundaries, initial workspace shells, and Supabase PostgreSQL schema design (`0001_initial_schema.sql`). |
| **2** | **Authentication and user management** *(Active / Current Phase)* | Supabase Auth integration (`src/lib/supabase.ts`), Student/Lecturer registration entry flow backed by trigger-enforced default roles, sign-in, session restoration, password reset, email verification, role-based dashboard redirects (`/learn`, `/teach`, `/admin`), and route protection. |
| **3** | **Theory Academy and structured curriculum** | Live PostgreSQL-backed curriculum delivery (`learning_paths`, `courses`, `course_modules`, `lessons`), structured Stage I–IV reading & notation lessons, enrolment flows, and prerequisite sequencing. |
| **4** | **Interactive Music Laboratories** | Expanded playable keyboard, clef/staff Notation Lab, Rhythm Laboratory, Harmony Studio, and progressive Ear Training exercises connected to pure theory validation (`src/lib/music/theory.ts`), Tone.js audio, and VexFlow engraving. |
| **5** | **Assessments and student progress** | Live diagnostic & module assessments (`assessments`, `assessment_attempts`, `assessment_responses`) with immutable question snapshots, server-side/Edge Function grading transitions, mastery tracking (`lesson_progress`), and notifications. |
| **6** | **Lecturer Workspace** | Live educator workflows under `/teach/*`: class creation with join codes, roster management (`class_memberships`), assignment publishing (`class_assignments`), resource libraries, assessment oversight, and cohort performance analytics. |
| **7** | **Administrator Dashboard** | Live governance tooling under `/admin/*`: user directory & account status moderation, verified lecturer role provisioning (`user_roles`), curriculum/lesson publishing workflows, assessment bank oversight, analytics, and platform settings. |
| **8** | **Song Analysis Studio** *(Future — Music Intelligence Studio)* | Provision shared audio storage, async job queue, and dedicated audio processing worker. Launch Song Analysis Studio: audio upload, pitch/melody/key/tempo/rhythm detection, MIDI & MusicXML export, VexFlow staff + movable-Do solfa rendering, chord/interval explanations, slowdown study, and transcription editing. |
| **9** | **Instrument Analysis Studio** *(Future — Music Intelligence Studio)* | Multi-stem source separation (`vocals`, `drums`, `bass`, `other`, plus `guitar`/`piano` where supported), independent solo/mute/compare playback, per-stem rhythmic & pitch analysis, instrument role explanations, uncertainty communication, exploratory stem transcription, and R&D foundation for orchestral sections. |
| **10** | **AI Accompaniment and Arrangement Studio** *(Future — Music Intelligence Studio)* | Acapella upload & direct browser vocal capture, vocal melody/key/tempo/phrasing analysis, multi-style accompaniment generation (Piano, Strings/Orchestral, Guitar/Acoustic, Worship, Custom), tight vocal alignment, alternative arrangement auditioning, independent vocal/instrumental mixing, and backing/final-mix exports. |
| **11** | **Integration testing and deployment** | End-to-end verification across all user roles, security & RLS penetration/audit checks, audio-worker load & cost validation, CI/CD pipelines, monitoring, and production deployment. |

---

## Future Backend & Infrastructure Dependencies (Before Phase 8)

Before beginning **Phase 8 (Song Analysis Studio)**:
1. **Dedicated Audio Processing Service:** Deploy a separate backend worker/service capable of FFmpeg validation/transcoding, async job execution, and secure server-to-server status callbacks to Supabase.
2. **Supabase Storage & Schema Extension (Future Migration):** Add private audio buckets and dedicated schema tables (`audio_assets`, `processing_jobs`, `analysis_results`, `audio_stems`, `arrangements`) governed by strict user/class RLS policies—strictly deferred until Phase 8.
3. **Provider & Model Selection Audit:** Complete a formal benchmark across accuracy, audio quality, vocal alignment, instrument control, latency, cost, commercial licensing, privacy/retention, and scalability before integrating any third-party API or self-hosted model.
4. **Live Testing Prerequisites for Current Phase 2 Auth:** Before advancing past Phase 2, verify `.env.local` / environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`), apply `0001_initial_schema.sql` to the live Supabase project, configure Supabase Auth redirect URLs, and test end-to-end authentication flows cleanly.

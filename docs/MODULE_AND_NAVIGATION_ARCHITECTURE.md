# THEORYLAB — Module & Navigation Architecture

This document defines the complete application module tree, route conventions (TanStack Start file-based routing under `src/routes/`), role access boundaries, and planned integration points for future phases including **Music Intelligence Studio**.

---

## 1. High-Level Platform Map

```text
THEORYLAB Platform
├── Public & Marketing Site (Preserved)
│   ├── /                         Scrolling landing page (Hero, Interactive Harmony, Learning Paths, Lecturers, About)
│   ├── /start                    Interactive level-finder preview
│   ├── /contact, /privacy, /terms
│
├── Authentication & Account Recovery (Supabase Auth)
│   ├── /sign-in                  Role-aware login & redirect
│   ├── /register                 Student / Lecturer sign-up (trigger enforces safe default role)
│   ├── /verify-email             Email confirmation & token verification
│   ├── /forgot-password          Recovery email request
│   ├── /reset-password           Password recovery completion
│
├── Learner & Student Studio (/learn/*)  [Authenticated: any active user]
│   ├── /learn                    Personalized Learner / Student Dashboard
│   ├── /learn/paths              Four progressive theory stages
│   ├── /learn/courses            Enrolled & structured courses
│   ├── /learn/practice           Interactive keyboard, staff & ear training studio
│   ├── /learn/notation           Engraved notation laboratory
│   ├── /learn/assessments        Module quizzes & diagnostics
│   ├── /learn/progress           Mastery & study activity history
│   │
│   └── [Future Phases 8–10] Music Intelligence Studio (/learn/studio/*)
│       ├── /learn/studio                 Music Intelligence Studio hub & job history
│       ├── /learn/studio/song-analysis   Phase 8: Song Analysis Studio
│       ├── /learn/studio/instruments     Phase 9: Instrument Analysis Studio
│       └── /learn/studio/arrangement     Phase 10: AI Accompaniment & Arrangement Studio
│
├── Lecturer Workspace (/teach/*)  [Protected: lecturer role]
│   ├── /teach                    Educator overview
│   ├── /teach/classes            Class management & join codes
│   ├── /teach/students           Enrolled student roster & progress
│   ├── /teach/assignments        Coursework & theory exercises
│   ├── /teach/assessments        Class assessments & grading status
│   ├── /teach/resources          Teaching resources & score packs
│   └── /teach/performance        Cohort concept mastery analytics
│
└── Administrator Dashboard (/admin/*)  [Protected: administrator role]
    ├── /admin                    System governance overview
    ├── /admin/users              User directory & account status
    ├── /admin/lecturers          Lecturer application verification & role grants
    ├── /admin/curriculum         Curriculum stage & course governance
    ├── /admin/lessons            Lesson content & notation/audio review
    ├── /admin/assessments        Assessment bank governance
    ├── /admin/analytics          Platform-wide learning & usage analytics
    └── /admin/settings           Policies, provider controls & Supabase diagnostics
```

---

## 2. Public & Authentication Navigation Rules (Preserved)

- **Landing Page (`/`):** Reaches in-page sections (`#about`, `#experience`, `#learning-paths`, `#features`, `#lecturers`) via `SectionLink` hash navigation. Remains unauthenticated and fast-loading.
- **Primary Call-to-Action Buttons ("Start learning"):** Navigate to `/register` where prospective users choose **Student** or **Lecturer**.
- **Sign In (`/sign-in`):** Authenticates via Supabase Auth and resolves the user's primary role from `public.user_roles`:
  - `administrator` → `/admin`
  - `lecturer` → `/teach`
  - `student` → `/learn`
  - `independent_learner` → `/learn`
- **Route Protection (`ProtectedRoute` & `AdminAccessGate`):**
  - Unauthenticated requests to `/learn/*`, `/teach/*`, or `/admin/*` redirect to `/sign-in?redirect=<path>`.
  - Suspended or archived accounts (`profiles.account_status !== 'active'`) are blocked from workspaces and signed out.
  - Role mismatches render an authorization notice with safe navigation back to the user's permitted dashboard (backed server-side by PostgreSQL RLS).

---

## 3. Workspace Sidebar Navigation Structure

### 3.1 Learner & Student Studio (`WorkspaceShell` under `/learn`)
Current approved navigation items:
1. Dashboard (`/learn`)
2. Learning Paths (`/learn/paths`)
3. My Courses (`/learn/courses`)
4. Quick Practice (`/learn/practice`)
5. Notation Lab (`/learn/notation`)
6. Assessments (`/learn/assessments`)
7. Progress (`/learn/progress`)

**Future Phase 8–10 Addition — Music Intelligence Studio Group:**
When Phases 8–10 arrive, a clearly separated secondary navigation group (`Music Intelligence Studio`) will be added inside the `WorkspaceShell` sidebar without altering or crowding core theory modules:
- **Song Analysis Studio** (`/learn/studio/song-analysis`) — Audio → Melody/Key/Tempo/Rhythm → MIDI / Staff / Movable-Do Solfa & Interactive Study
- **Instrument Analysis Studio** (`/learn/studio/instruments`) — Source Separation, Solo/Mute Comparison, Per-Stem Analysis & Instrument Roles
- **Accompaniment & Arrangement** (`/learn/studio/arrangement`) — Acapella Upload/Mic Capture → Aligned Multi-Style Backing Track & Mix Export

### 3.2 Lecturer Workspace (`WorkspaceShell` under `/teach`)
Preserved 7-module sidebar:
1. Overview (`/teach`)
2. My Classes (`/teach/classes`)
3. Students (`/teach/students`)
4. Assignments (`/teach/assignments`)
5. Assessments (`/teach/assessments`)
6. Resources (`/teach/resources`)
7. Performance (`/teach/performance`)

**Future Cross-Module Integration (Non-breaking):**
- Lecturers will optionally be able to attach analysed recordings or extracted notation examples from Music Intelligence Studio into **Teaching Resources** or **Student Assignments** once Phases 6 and 8+ are complete.

### 3.3 Administrator Dashboard (`WorkspaceShell` under `/admin`)
Preserved 8-module sidebar:
1. Overview (`/admin`)
2. Users (`/admin/users`)
3. Lecturers (`/admin/lecturers`)
4. Curriculum (`/admin/curriculum`)
5. Lessons (`/admin/lessons`)
6. Assessments (`/admin/assessments`)
7. Analytics (`/admin/analytics`)
8. Settings (`/admin/settings`)

**Future Governance Extensions (Non-breaking):**
- **Analytics & Settings (`/admin/analytics`, `/admin/settings`):** Will gain readouts for audio-processing job quotas, provider health/cost limits, and feature flags for Song Analysis, Instrument Analysis, and AI Arrangement modules.

---

## 4. Internal Workspace Tab & View Flows (Music Intelligence Studio)

### 4.1 Song Analysis Studio Flow
1. **Source Panel:** Upload audio file (or load previously processed track), validate format/size, trim/select target excerpt if desired.
2. **Processing Status View:** Real-time job progress via Supabase Realtime / polling (`queued` → `analysing` → `transcribing` → `completed` / `failed`).
3. **Interactive Theory Score Workspace:**
   - Synchronized audio waveform + slowdown playback bar (0.5x–1.0x speed, loop A–B region).
   - Toggleable notation views: Standard Staff (VexFlow), Movable-Do Solfa ribbon, Piano Roll / MIDI view, Chord & Interval annotations.
   - Contextual **Theory Insight Drawer** linking detected concepts (e.g., detected key signature, intervals, harmonic cadence) directly to `/learn/paths` and `/learn/courses` lessons.
   - **Review & Edit Mode** allowing manual correction of misdetected pitches, note durations, key center, or harmonic labels, saved as a student-edited version.

### 4.2 Instrument Analysis Studio Flow
1. **Source Panel:** Upload recording and inspect supported stem capabilities & explicit limitation disclaimer.
2. **Stem Mixer View:** Master track + isolated stem lanes (`Vocals`, `Drums`, `Bass`, `Piano`, `Guitar`, `Other` where available) with Solo (`S`), Mute (`M`), Gain sliders, and A/B Original Mix toggle.
3. **Stem Insight & Pattern View:** Inspect per-stem rhythmic grid, pitch/melodic contour, instrument role explanation, and exploratory stem transcription (where supported), with clear visual confidence/bleed indicators.

### 4.3 AI Accompaniment & Arrangement Studio Flow
1. **Vocal Input Stage:** Upload clean acapella track or capture live singing in-browser via microphone recorder with metronome/count-in and take preview.
2. **Vocal Analysis Summary:** Detected key, vocal range, tempo curve, phrasing boundaries, and user-adjustable key/feel confirmations.
3. **Style & Instrumentation Builder:** Select arrangement style (`Piano`, `Strings & Orchestral`, `Guitar & Acoustic`, `Worship`, or `Custom Combination` where supported) + accompaniment density/voicing cues.
4. **Arrangement Audition & Mixer:** Audition generated takes synced to the untouched original vocal, balance Vocal vs. Instrumental sliders, inspect chord progression used for pedagogical learning, and export either **Instrumental Backing Only** or **Final Mixed Recording**.

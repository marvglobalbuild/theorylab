# SONORA Music Intelligence Engine

Separate Python FastAPI microservice and dedicated ARQ durable worker providing shared audio ingestion, format/integrity validation, non-destructive FFmpeg decoding, durable asynchronous job orchestration, CPU-only musical analysis (`librosa`), monophonic vocal pitch extraction (`librosa.pyin`), theory-driven accompaniment arrangement, Standard MIDI generation (`mido`), multi-sampled SoundFont rendering (`FluidSynth`), non-destructive vocal mixing, ITU-R BS.1770-4 loudness normalization (`pyloudnorm`), 4x oversampled true-peak protection, and FFprobe-validated WAV/FLAC/MP3 export.

## Phase 5.2 Run 1, Run 2 & Run 3 Capabilities

### Run 1 — Durable Worker, Musical Analysis & Vocal Pitch Extraction
1. **Durable Worker Infrastructure (`app/jobs/queue.py`, `app/worker.py`)**
   - FastAPI HTTP intake (`app/main.py`) validates Supabase JWTs, object ownership, and audio bounds, persists authoritative state in Supabase `public.processing_jobs`, and enqueues job IDs to Valkey/Redis via ARQ.
   - Dedicated worker process (`app/worker.py`) runs audio workloads outside HTTP handlers with controlled retries + exponential backoff, per-job timeouts, cross-process cooperative cancellation, `X-Request-ID` correlation logging, temp workspace cleanup, and startup recovery for orphaned `processing` jobs.
   - Compatible with `supabase/migrations/0002_music_intelligence_storage_and_jobs.sql` (`trg_processing_jobs_protect_integrity` monotonic state guard).
   - Retains `in_process` queue mode for lightweight local development and unit tests.
2. **Musical Analysis (`app/processing/analysis.py`)**
   - Implements `AudioAnalysisInterface` via `LibrosaMusicalAnalyzer` (`librosa`, `numpy`, `scipy`, `soundfile`).
   - Extracts tempo, beat grid, Krumhansl-Schmuckler key & scale, 12-bin chroma summary, tuning offset (`librosa.estimate_tuning`), and basic triad chord estimates with explicit confidence/reliability scores and warnings.
3. **Monophonic Vocal Pitch Extraction (`app/processing/pitch.py`)**
   - Implements `PitchExtractionInterface` via `LibrosaPyinPitchExtractor` (`librosa.pyin`).
   - Extracts frame-level F0 (`Hz`), continuous MIDI pitch, voiced probability/confidence, voiced/unvoiced regions, and vibrato-tolerant `note_events`. Requests with `mode="polyphonic"` honestly return `MODEL_NOT_INTEGRATED`.

### Run 2 — MIDI Generation, Intelligent Accompaniment Arrangement & FluidSynth Synthesis
4. **MIDI Generation (`app/processing/midi.py`)**
   - Implements `MIDIProcessingInterface` via `MidoMIDIBuilder` (`mido`).
   - Generates spec-compliant Standard MIDI Files (Format 1) with conductor track metadata (tempo, time signature, key signature), named instrument tracks, GM program changes, CC7/CC10 volume/pan, exact delta times, channel 9 percussion routing, and post-write reopen verification.
5. **Theory-Driven Accompaniment Arranger (`app/processing/arranger.py`)**
   - Deterministic, melody-preserving multi-instrument arranger (`SonoraAccompanimentArranger`) supporting 6 instrument families (`piano`, `strings`, `bass`, `brass`, `woodwinds`, `drums`) and 5 distinct musical styles (`ballad`, `pop`, `gospel`, `classical`, `cinematic`).
6. **FluidSynth Renderer & Sound Library Management (`app/processing/synthesis.py`, `app/processing/instruments.py`)**
   - Implements `InstrumentPlaybackInterface` via `FluidSynthRenderer` invoking `fluidsynth` strictly via subprocess argument arrays, outputting verified stereo `44,100 Hz` non-silent WAV audio with timeout and cancellation cleanup.
   - `InstrumentResourceManager` manages GM program mappings and read-only SoundFont discovery outside user upload/temp paths (`MuseScore_General.sf3` / `.sf2`, MIT License).

### Run 3 — Non-Destructive Vocal Mixing, Loudness Mastering & Final Audio Export
7. **Non-Destructive Vocal & Accompaniment Mixing (`app/processing/mixing.py`)**
   - Implements `MixingAndRenderingInterface` via `SonoraAudioMixerAndMaster`.
   - Mixes the original vocal working copy (leaving original uploaded bytes untouched and preserving vocal timing/pitch) with synthesized accompaniment or per-instrument stems, supporting vocal/accompaniment/stem gains, constant-power stereo panning, sample-rate resampling, adaptive vocal-to-accompaniment balance, intro alignment, and non-truncating duration handling.
8. **Loudness Normalization & True-Peak Protection (`app/processing/mastering.py`)**
   - Measures ITU-R BS.1770-4 integrated loudness via `pyloudnorm` and inter-sample true peak via **4x oversampled polyphase FIR interpolation** (`scipy.signal.resample_poly`, strictly distinct from sample peak).
   - Targets `-14.0 LUFS` integrated loudness and `-1.0 dBTP` true-peak ceiling by default while refusing excessive limiting (`max_limiting_db=3.5 dB`) to preserve vocal and ensemble dynamics, honestly reporting achieved loudness and warnings whenever target LUFS cannot safely be reached.
9. **Multi-Format Export & Validation (`app/processing/exporter.py`, `app/processing/accompaniment.py`)**
   - Exports stereo **WAV (16-bit & 24-bit)**, **FLAC (lossless)**, and **MP3 (default 320 kbps)** via safe FFmpeg subprocess argument arrays with optional metadata tags, validating every exported file via FFprobe (and `soundfile` for WAV/FLAC).
   - Wired into `JobType.AUDIO_RENDERING` (full Run 1 + Run 2 + Run 3 pipeline), persisting final masters, MIDI, accompaniment WAV, optional stems, and optional `original_vocal_copy.wav` strictly under `{user_id}/jobs/{job_id}/...`.

## Endpoints

- `GET /health` — Service readiness, FFmpeg/FFprobe/FluidSynth/SoundFont availability, Supabase config, active queue backend, and Valkey/Redis broker reachability.
- `GET /api/v1/capabilities` — Supported audio formats, limits, job types (`audio_analysis`, `pitch_extraction`, `accompaniment_generation`, and `audio_rendering` ready; `source_separation`, `music_transcription`, and `instrument_detection` honestly `awaiting_model_integration`), and all 10 processing interfaces.
- `GET /api/v1/instruments` — Supported GM instrument families, program mappings, FluidSynth executable check, and verified SoundFont status.
- `POST /api/v1/jobs` — Authenticated job submission (`queued` -> `processing` -> `completed` | `failed` | `cancelled`).
- `GET /api/v1/jobs` & `GET /api/v1/jobs/{job_id}` — Strictly owner-scoped job listing and inspection.
- `POST /api/v1/jobs/{job_id}/cancel` — Cross-process cooperative cancellation (strictly owner-scoped).
- `POST /api/v1/audio/validate` — Multipart audio validation (magic bytes, size limits, FFprobe integrity, SHA-256).

## System Dependencies

- **Python**: `>=3.11`
- **FFmpeg & FFprobe**: required on `PATH` (or set `FFMPEG_BIN` / `FFPROBE_BIN`)
- **FluidSynth**: required on `PATH` (or set `FLUIDSYNTH_BIN`), e.g. `apt-get install fluidsynth`
- **Verified SoundFont (stored read-only outside repo and outside user uploads)**: e.g. `apt-get install musescore-general-soundfont` (`/usr/share/sounds/sf3/MuseScore_General.sf3`, MIT License); configure `MUSIC_ENGINE_SOUNDFONT_DIR` or `MUSIC_ENGINE_SOUNDFONT_PATH`
- **libsndfile**: bundled in `soundfile` manylinux wheels; install OS `libsndfile1` on non-bundled platforms
- **Valkey or Redis**: required external broker when `MUSIC_ENGINE_QUEUE_BACKEND=arq`

## Running Locally

```bash
cd services/music-engine
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env

# Single-process dev mode (MUSIC_ENGINE_QUEUE_BACKEND=in_process)
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Durable multi-process mode (MUSIC_ENGINE_QUEUE_BACKEND=arq, MUSIC_ENGINE_REDIS_URL=redis://localhost:6379/0)
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
.venv/bin/arq app.worker.WorkerSettings
# or: .venv/bin/python -m app.worker
```

## Running Tests

```bash
cd services/music-engine
.venv/bin/pytest -v
```

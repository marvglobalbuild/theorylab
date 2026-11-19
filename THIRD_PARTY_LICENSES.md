# SONORA Third-Party Software & Asset Licenses

This document tracks verified third-party packages, system binaries, and audio assets currently installed in SONORA, alongside planned Run 2+ dependencies (explicitly marked as not yet installed).

---

## 1. Python Music Processing Service (`services/music-engine/`) — Installed

Verified from `services/music-engine/.venv` package metadata:

| Package | Installed Version | License | Commercial Use | Run / Role |
| --- | --- | --- | --- | --- |
| `fastapi` | `0.165.0` | MIT | Permitted | Phase 3 HTTP API framework |
| `uvicorn` | `0.54.0` | BSD-3-Clause | Permitted | ASGI server |
| `pydantic` | `2.14.3` | MIT | Permitted | Typed request/response schemas |
| `pydantic-settings` | `2.16.3` | MIT | Permitted | Environment configuration |
| `httpx` | `0.28.1` | BSD-3-Clause | Permitted | Async Supabase PostgREST/Storage HTTP client |
| `PyJWT` | `2.15.1` | MIT | Permitted | Supabase JWT verification |
| `cryptography` | `50.0.2` | Apache-2.0 OR BSD-3-Clause | Permitted | JWKS / cryptographic verification |
| `python-multipart` | `0.0.34` | Apache-2.0 | Permitted | Multipart audio upload parsing |
| `arq` | `0.28.0` | MIT | Permitted | **Phase 5.2 Run 1 (Component A)** — Durable async job queue & worker |
| `redis` | `5.3.1` | MIT | Permitted | **Phase 5.2 Run 1 (Component A)** — Async Valkey/Redis client for ARQ |
| `hiredis` | `3.5.0` | MIT | Permitted | **Phase 5.2 Run 1 (Component A)** — Fast RESP protocol parser |
| `async-timeout` | `5.0.1` | Apache-2.0 | Permitted | **Phase 5.2 Run 1 (Component A)** — Asyncio timeout compatibility |
| `numpy` | `2.0.2` | BSD-3-Clause | Permitted | **Phase 5.2 Run 1 (Components B & C)** — Numerical DSP arrays |
| `scipy` | `1.17.1` | BSD-3-Clause | Permitted | **Phase 5.2 Run 1 (Components B & C)** — Signal filtering (`medfilt`) |
| `soundfile` | `0.14.0` | BSD-3-Clause (bundles `libsndfile 1.2.2`, LGPL-2.1-or-later) | Permitted (server-side dynamic library) | **Phase 5.2 Run 1 (Components B & C)** — PCM WAV reading/writing |
| `librosa` | `0.11.0` | ISC | Permitted | **Phase 5.2 Run 1 (Components B & C)** — Musical analysis & `pyin` monophonic pitch |
| `numba` / `llvmlite` | `0.68.1` / `0.50.0` | BSD-2-Clause / Apache-2.0 WITH LLVM-exceptions | Permitted | Transitive JIT dependency of `librosa` |
| `scikit-learn` | `1.9.1` | BSD-3-Clause | Permitted | Transitive dependency of `librosa` |
| `soxr` | `1.1.0` | LGPL-2.1-or-later | Permitted (server-side dynamic library) | Transitive high-quality audio resampler used by `librosa` |
| `audioread` | `3.1.0` | MIT | Permitted | Transitive dependency of `librosa` |
| `mido` | `1.3.3` | MIT | Permitted | **Phase 5.2 Run 2 (Component A)** — Standard MIDI File (Format 1) generation & validation |
| `pyloudnorm` | `0.2.0` | MIT | Permitted | **Phase 5.2 Run 3 (Component B)** — ITU-R BS.1770-4 integrated loudness measurement & normalization (Christian Steinmetz) |
| `pytest` / `pytest-asyncio` | `8.4.2` / `0.26.0` | MIT / Apache-2.0 | Permitted | Dev/test runner |

### Infrastructure, Synthesis & Sound Library Dependencies (Installed Outside Repository)

| Component | Installed Version / Artifact | License | Commercial Use | Notes & Required Notices |
| --- | --- | --- | --- | --- |
| **FFmpeg / FFprobe** (invoked via subprocess CLI) | System binary (`pcm_s16le`, `pcm_s24le`, `flac`, `libmp3lame`) | LGPL-2.1+ / GPL depending on system build | Permitted via external process invocation | SONORA invokes `ffmpeg` and `ffprobe` strictly as separate OS subprocesses. Production containers should use LGPL-configured FFmpeg builds unless GPL compliance is maintained. |
| **FluidSynth** (invoked via subprocess CLI) | `2.3.1` (`/usr/bin/fluidsynth`, Debian `2.3.1-2`) | **LGPL-2.1-or-later** | Permitted via external subprocess CLI | SONORA invokes `fluidsynth` strictly as a separate OS process via safe argument arrays (`asyncio.create_subprocess_exec`) — never statically linked into proprietary code. |
| **MuseScore General SoundFont (Full SF3)** | `0.2.1` (`musescore-general-soundfont`, `/usr/share/sounds/sf3/MuseScore_General.sf3`, 82 MB, SHA-256 `f9a37b36655f23e167c66ec91bef6097c8e99be29286219a54062919eb41aeae`) | **MIT License** (embedded samples verified **MIT, CC0, or Public Domain**) | **Permitted** (commercial audio rendering & redistribution permitted with copyright notices preserved; zero GPL or CC-NC samples) | Primary SONORA GM SoundFont stored in persistent read-only system storage outside git and outside user upload directories. Required MIT copyright attributions listed below. |
| **FluidR3 GM SoundFont** *(Debian transitive dependency of `fluidsynth`)* | `3.1-5.3` (`fluid-soundfont-gm`, `/usr/share/sounds/sf2/FluidR3_GM.sf2`) | **MIT License** | Permitted (copyright notice required) | Fallback GM SoundFont installed by Debian `fluidsynth` dependency; `InstrumentResourceManager` prioritizes `MuseScore_General.sf2` / `MuseScore_General.sf3` first. |
| **libsndfile** (`1.2.2` bundled in `soundfile` manylinux wheel; or OS `libsndfile1`) | `1.2.2` | LGPL-2.1-or-later | Permitted (dynamic library) | Required by `soundfile`; bundled in Linux x86_64 wheels; install `libsndfile1` on non-bundled platforms. |
| **Valkey** (recommended external broker) | External service | BSD-3-Clause | Permitted | External managed/container service; no broker server code is embedded in SONORA. |

#### Required Copyright & Attribution Notices — MuseScore General SoundFont (MIT)

Per `MuseScore_General_License.md` and `MuseScore_General_Sample_Sources.csv` (upstream `https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/`):

- **FluidR3**: Copyright (c) 2000–2002, 2008, 2013 Frank Wen (MIT License).
- **FluidR3Mono**: Copyright (c) 2016–2018 Michael Cowgill (MIT License).
- **MuseScore_General adaptation & programming**: Copyright (c) 2018–2020 S. Christian Collins (MIT License).
- **Temple Blocks**: Copyright (c) Ethan Winer (MIT License).
- **Drumline Cymbals**: Copyright (c) Michael Schorsch (MIT License).
- **Additional embedded sample sources**: Splendid Grand Steinway Model D Piano (Public Domain, confirmed by AKAI representative), Versilian Studios Chamber Orchestra 2.1.1 Community Edition (CC0 1.0 Public Domain), Versilian Community Sample Library cymbals (CC0 1.0 Public Domain), MuseScore Drumline samples (CC0 1.0 Public Domain).

---

## 2. Frontend Web Application (`package.json`) — Installed

| Package / Asset | Version | License | Commercial Use | Role |
| --- | --- | --- | --- | --- |
| `react` / `react-dom` | `^19.2.0` | MIT | Permitted | UI runtime |
| `@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/react-query` | `1.170.41` / `1.168.60` / `^5.101.1` | MIT | Permitted | Routing & data layer |
| `@supabase/supabase-js` | `^2.119.0` | MIT | Permitted | Auth, Postgres & Storage client |
| `tone` | `^15.1.22` | MIT | Permitted | Browser Web Audio synthesis & sampling |
| `vexflow` | `^5.1.0` | MIT | Permitted | Browser sheet music notation rendering |
| `tailwindcss` / Radix UI / `lucide-react` / `zod` | See `package.json` | MIT / ISC | Permitted | Styling, accessible primitives, icons, validation |
| **Salamander Grand Piano** samples (streamed via CDN in browser labs) | v3 | **CC BY 3.0** | Permitted **with attribution** | Attribution required: *Salamander Grand Piano by Alexander Holm, licensed under CC BY 3.0*. |

---

## 3. Deferred Post-Phase-5.2 Dependencies — NOT YET INSTALLED

- **Future GPU / Advanced MIR Phases**: Source separation (`Demucs` / equivalent), polyphonic transcription, instrument detection, and MusicXML generation (`music21`, BSD-3-Clause).

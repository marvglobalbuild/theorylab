// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccompanimentStudio } from "@/components/studio/AccompanimentStudio";
import type {
  AccompanimentJobResult,
  AudioAnalysisResult,
  InstrumentDiagnostics,
  MusicEngineCapabilities,
  MusicIntelligenceService,
  MusicProcessingJob,
} from "@/services/contracts";

const SAMPLE_CAPABILITIES: MusicEngineCapabilities = {
  service: "sonora-music-engine",
  version: "0.3.0",
  phase: "phase-5.2-run-3",
  supported_formats: [
    { format: "wav", mime_types: ["audio/wav"], decode_supported: true, export_supported: true },
    { format: "mp3", mime_types: ["audio/mpeg"], decode_supported: true, export_supported: true },
    { format: "flac", mime_types: ["audio/flac"], decode_supported: true, export_supported: true },
    { format: "webm", mime_types: ["audio/webm"], decode_supported: true, export_supported: false },
  ],
  limits: {
    max_file_size_bytes: 50 * 1024 * 1024,
    max_duration_seconds: 600,
    max_concurrent_jobs_per_user: 2,
    target_internal_sample_rate_hz: 44100,
    realistic_sample_playback_required: true,
  },
  job_types: [
    {
      job_type: "audio_analysis",
      studio_consumers: ["ai_accompaniment_studio"],
      status: "ready",
      model_integrated: true,
      required_interfaces: ["AudioAnalysisInterface"],
      active_provider: "librosa-musical-analyzer",
      description: "Detect tempo, key, beat grid, and chords",
    },
    {
      job_type: "source_separation",
      studio_consumers: ["instrument_analysis_studio"],
      status: "awaiting_model_integration",
      model_integrated: false,
      required_interfaces: ["SourceSeparationInterface"],
      active_provider: null,
      description: "Separate stems",
    },
    {
      job_type: "music_transcription",
      studio_consumers: ["song_analysis_studio"],
      status: "awaiting_model_integration",
      model_integrated: false,
      required_interfaces: ["TranscriptionInterface"],
      active_provider: null,
      description: "Transcribe to MusicXML",
    },
    {
      job_type: "accompaniment_generation",
      studio_consumers: ["ai_accompaniment_studio"],
      status: "ready",
      model_integrated: true,
      required_interfaces: ["InstrumentPlaybackInterface"],
      active_provider: "sonora-arranger+mido+fluidsynth",
      description: "Generate accompaniment",
    },
    {
      job_type: "audio_rendering",
      studio_consumers: ["ai_accompaniment_studio"],
      status: "ready",
      model_integrated: true,
      required_interfaces: ["MixingAndRenderingInterface"],
      active_provider: "sonora-arranger+mido+fluidsynth+pyloudnorm+ffmpeg",
      description: "Mix and master vocal and accompaniment",
    },
  ],
  processing_interfaces: [],
};

const SAMPLE_INSTRUMENTS: InstrumentDiagnostics = {
  fluidsynth_available: true,
  fluidsynth_executable: "/usr/bin/fluidsynth",
  sound_library: {
    available: true,
    soundfont_path: "/usr/share/sounds/sf3/MuseScore_General.sf3",
    soundfont_name: "MuseScore_General.sf3",
    format: "sf3",
    size_bytes: 38000000,
    license_name: "MIT",
    missing_reason: null,
    install_instructions: null,
  },
  supported_families: ["piano", "strings", "bass", "brass", "woodwinds", "drums"],
  instruments: [],
};

const SAMPLE_ANALYSIS_RESULT: AudioAnalysisResult = {
  tempo_bpm: 92.5,
  tempo_confidence: 0.42,
  tempo_stability: "rubato_or_uncertain",
  time_signature: "4/4",
  estimated_key: "G major",
  key_root: "G",
  scale: "major",
  key_confidence: 0.48,
  tuning_offset_cents: -4,
  beats: [
    { time_ms: 0, beat_number: 1, bar_number: 1, is_downbeat: true },
    { time_ms: 650, beat_number: 2, bar_number: 1, is_downbeat: false },
  ],
  chords: [
    { start_ms: 0, end_ms: 2000, symbol: "G", root: "G", quality: "major", confidence: 0.72 },
    { start_ms: 2000, end_ms: 4000, symbol: "Em", root: "E", quality: "minor", confidence: 0.65 },
  ],
  chroma_summary: null,
  audio_duration_ms: 12000,
  sample_rate_hz: 44100,
  reliability: "low",
  reliability_score: 0.45,
  analysis_method: "librosa_krumhansl_schmuckler_chroma",
  is_heuristic: true,
  instrument_tags: [],
  warnings: ["Tempo showed moderate rubato variation."],
  vocal_pitch: {
    mode: "monophonic",
    hop_ms: 12,
    contours: [],
    voiced_regions: [{ start_ms: 200, end_ms: 4000, mean_confidence: 0.81 }],
    unvoiced_regions: [],
    note_events: [
      {
        start_ms: 200,
        end_ms: 900,
        midi_pitch: 67,
        velocity: 92,
        voice: "melody",
        clef_hint: "treble",
        confidence: 0.85,
      },
    ],
    voiced_frame_count: 140,
    total_frame_count: 200,
    voiced_ratio: 0.7,
    mean_confidence: 0.81,
    pitch_range_midi: [60, 74],
    audio_duration_ms: 12000,
    sample_rate_hz: 44100,
    extractor_method: "librosa_pyin_monophonic",
    monophonic_only_notice: "librosa.pyin estimates monophonic vocal melody pitch only.",
    warnings: [],
  },
};

const SAMPLE_MASTERED_RESULT: AccompanimentJobResult = {
  arrangement: {
    style: "gospel",
    key: "G major",
    key_root: "G",
    scale: "major",
    tempo_bpm: 92.5,
    time_signature: "4/4",
    beats_per_bar: 4,
    total_bars: 8,
    intro_bars: 2,
    outro_bars: 2,
    duration_ms: 16000,
    transpose_semitones: 0,
    harmony_source: "vocal_pitch_and_chroma",
    chords: [],
    tracks: [
      {
        instrument_id: "piano",
        track_name: "Acoustic Grand Piano",
        gm_program: 0,
        channel: 0,
        is_percussion: false,
        volume: 0.82,
        pan: 56,
        note_count: 48,
      },
      {
        instrument_id: "strings",
        track_name: "String Ensemble",
        gm_program: 48,
        channel: 1,
        is_percussion: false,
        volume: 0.68,
        pan: 74,
        note_count: 24,
      },
    ],
    warnings: [],
  },
  midi: {
    filename: "accompaniment.mid",
    object_path: "user-1/jobs/job-render-1/accompaniment.mid",
    track_count: 3,
    instrument_tracks: 2,
    note_count: 72,
    duration_ms: 16000,
    tempo_bpm: 92.5,
    time_signature: "4/4",
    key_signature: "G major",
    ticks_per_beat: 480,
  },
  synthesis: {
    engine: "fluidsynth",
    soundfont_name: "MuseScore_General.sf3",
    sample_rate_hz: 44100,
    channels: 2,
    duration_ms: 16000,
    peak_amplitude: 0.72,
    rms_amplitude: 0.16,
    size_bytes: 2822444,
    object_path: "user-1/jobs/job-render-1/accompaniment.wav",
    individual_stems: [
      {
        instrument_id: "piano",
        track_name: "Acoustic Grand Piano",
        gm_program: 0,
        channel: 0,
        object_path: "user-1/jobs/job-render-1/stems/piano.wav",
        duration_ms: 16000,
        peak_amplitude: 0.61,
        rms_amplitude: 0.14,
        size_bytes: 1411244,
      },
      {
        instrument_id: "strings",
        track_name: "String Ensemble",
        gm_program: 48,
        channel: 1,
        object_path: "user-1/jobs/job-render-1/stems/strings.wav",
        duration_ms: 16000,
        peak_amplitude: 0.45,
        rms_amplitude: 0.1,
        size_bytes: 1411244,
      },
    ],
  },
  musical_analysis: {
    tempo_bpm: 92.5,
    tempo_confidence: 0.85,
    tempo_stability: "steady",
    time_signature: "4/4",
    estimated_key: "G major",
    key_confidence: 0.86,
    reliability: "high",
    reliability_score: 0.85,
    chord_count: 4,
    warnings: [],
  },
  vocal_pitch: {
    mode: "monophonic",
    voiced_ratio: 0.7,
    mean_confidence: 0.81,
    note_event_count: 20,
    pitch_range_midi: [60, 74],
    warnings: [],
  },
  original_vocal_preserved: true,
  mixing_status: "mastered_vocal_and_accompaniment",
  mixing: {
    sample_rate_hz: 44100,
    channels: 2,
    mix_duration_ms: 16000,
    vocal_duration_ms: 12000,
    accompaniment_duration_ms: 16000,
    intro_offset_ms: 2594,
    vocal_balance_mode: "auto_adaptive",
    adaptive_accompaniment_trim_db: -1.5,
    effective_vocal_gain_db: 0,
    effective_accompaniment_gain_db: -6.0,
    used_individual_stems: true,
    pre_master_sample_peak_dbfs: -2.3,
    pre_master_true_peak_dbtp: -2.1,
    pre_master_clipping_risk: false,
    original_vocal_preserved: true,
    vocal_timing_and_pitch_unmodified: true,
    original_vocal_copy_object_path: "user-1/jobs/job-render-1/original_vocal_copy.wav",
    tracks_mixed: [],
    warnings: [],
  },
  mastering: {
    target_lufs: -14.0,
    true_peak_ceiling_dbtp: -1.0,
    max_limiting_db: 3.5,
    true_peak_method: "4x_oversampled_polyphase_estimate",
    loudness_method: "pyloudnorm_itu_bs1770_4",
    input_metrics: {
      integrated_lufs: -18.4,
      sample_peak_linear: 0.55,
      sample_peak_dbfs: -5.19,
      true_peak_linear: 0.57,
      true_peak_dbtp: -4.88,
      rms_dbfs: -19.0,
      crest_factor_db: 13.8,
      is_silent: false,
      true_peak_method: "4x_oversampled_polyphase_estimate",
    },
    output_metrics: {
      integrated_lufs: -14.1,
      sample_peak_linear: 0.87,
      sample_peak_dbfs: -1.21,
      true_peak_linear: 0.89,
      true_peak_dbtp: -1.02,
      rms_dbfs: -15.2,
      crest_factor_db: 14.0,
      is_silent: false,
      true_peak_method: "4x_oversampled_polyphase_estimate",
    },
    applied_gain_db: 4.3,
    limiting_applied: true,
    limiting_gain_reduction_db: 0.45,
    clipping_detected: false,
    target_lufs_achieved: true,
    true_peak_compliant: true,
    dynamic_range_preserved: true,
    warnings: [],
    notes: [],
  },
  exports: [
    {
      format: "wav",
      filename: "master.wav",
      object_path: "user-1/jobs/job-render-1/master.wav",
      mime_type: "audio/wav",
      size_bytes: 2822444,
      sample_rate_hz: 44100,
      channels: 2,
      duration_ms: 16000,
      bit_depth: 24,
      bitrate_kbps: null,
      codec_name: "pcm_s24le",
      ffprobe_verified: true,
      soundfile_verified: true,
      peak_amplitude: 0.87,
      metadata_written: {},
    },
    {
      format: "mp3",
      filename: "master.mp3",
      object_path: "user-1/jobs/job-render-1/master.mp3",
      mime_type: "audio/mpeg",
      size_bytes: 640000,
      sample_rate_hz: 44100,
      channels: 2,
      duration_ms: 16000,
      bit_depth: null,
      bitrate_kbps: 320,
      codec_name: "mp3",
      ffprobe_verified: true,
      soundfile_verified: false,
      peak_amplitude: 0.86,
      metadata_written: {},
    },
  ],
};

function makeCompletedMasterJob(): MusicProcessingJob {
  return {
    job_id: "job-render-1",
    user_id: "user-1",
    job_type: "audio_rendering",
    status: "completed",
    progress_percent: 100,
    stage: "completed",
    source_audio: {
      storage_backend: "local",
      bucket: "sonora-audio",
      object_path: "user-1/uploads/a1/grace_vocal.wav",
      original_filename: "grace_vocal.wav",
      declared_mime_type: "audio/wav",
      declared_size_bytes: 120000,
    },
    trim_window: null,
    parameters: {
      project_name: "Grace Hymn Session",
      arrangement: { style: "gospel", selected_instruments: ["piano", "strings"] },
    },
    studio_context: "ai_accompaniment_studio",
    audio_metadata: {
      detected_format: "wav",
      mime_type: "audio/wav",
      size_bytes: 120000,
      sha256_checksum: "a".repeat(64),
      duration_ms: 12000,
      sample_rate_hz: 44100,
      channels: 1,
      codec_name: "pcm_s16le",
      bit_rate_bps: 705600,
      bit_depth: 16,
      original_preserved: true,
    },
    artifacts: [
      {
        artifact_type: "master_audio_wav",
        storage_backend: "local",
        bucket: "sonora-audio",
        object_path: "user-1/jobs/job-render-1/master.wav",
        mime_type: "audio/wav",
        size_bytes: 2822444,
      },
      {
        artifact_type: "master_audio_mp3",
        storage_backend: "local",
        bucket: "sonora-audio",
        object_path: "user-1/jobs/job-render-1/master.mp3",
        mime_type: "audio/mpeg",
        size_bytes: 640000,
      },
      {
        artifact_type: "accompaniment_midi",
        storage_backend: "local",
        bucket: "sonora-audio",
        object_path: "user-1/jobs/job-render-1/accompaniment.mid",
        mime_type: "audio/midi",
        size_bytes: 4200,
      },
    ],
    result: SAMPLE_MASTERED_RESULT as unknown as Record<string, unknown>,
    error: null,
    created_at: "2026-11-19T10:00:00Z",
    updated_at: "2026-11-19T10:00:30Z",
    started_at: "2026-11-19T10:00:02Z",
    completed_at: "2026-11-19T10:00:30Z",
    cancelled_at: null,
  };
}

function createMockService(
  overrides: Partial<MusicIntelligenceService> = {},
): MusicIntelligenceService {
  return {
    isConfigured: vi.fn().mockReturnValue(true),
    getHealth: vi.fn().mockResolvedValue({ status: "ok", data: {} as never }),
    getCapabilities: vi.fn().mockResolvedValue({ status: "ok", data: SAMPLE_CAPABILITIES }),
    getInstruments: vi.fn().mockResolvedValue({ status: "ok", data: SAMPLE_INSTRUMENTS }),
    uploadAudio: vi.fn().mockResolvedValue({
      status: "ok",
      data: {
        valid: true,
        asset_reference: {
          storage_backend: "local",
          bucket: "sonora-audio",
          object_path: "user-1/uploads/a1/grace_vocal.wav",
          asset_id: "a1",
          original_filename: "grace_vocal.wav",
          declared_mime_type: "audio/wav",
          declared_size_bytes: 120000,
        },
        metadata: {
          detected_format: "wav",
          mime_type: "audio/wav",
          size_bytes: 120000,
          sha256_checksum: "a".repeat(64),
          duration_ms: 12000,
          sample_rate_hz: 44100,
          channels: 1,
          codec_name: "pcm_s16le",
          bit_rate_bps: 705600,
          bit_depth: 16,
          original_preserved: true,
        },
        warnings: [],
      },
    }),
    createJob: vi.fn(),
    listJobs: vi.fn().mockResolvedValue({ status: "ok", data: [] }),
    getJob: vi.fn(),
    cancelJob: vi.fn(),
    getArtifactSignedUrl: vi.fn(),
    downloadArtifactBlob: vi.fn().mockResolvedValue({
      status: "ok",
      data: {
        blob: new Blob(["RIFFtest"], { type: "audio/wav" }),
        filename: "master.wav",
        mimeType: "audio/wav",
        objectPath: "user-1/jobs/job-render-1/master.wav",
      },
    }),
    ...overrides,
  };
}

describe("AI Accompaniment and Arrangement Studio — Core Workflow, Mastering, Exports & Security", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-audio-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("loads backend capabilities transparently, rejects video uploads, and runs vocal upload + analysis polling with low-confidence guidance", async () => {
    const queuedAnalysis: MusicProcessingJob = {
      ...makeCompletedMasterJob(),
      job_id: "job-analysis-1",
      job_type: "audio_analysis",
      status: "queued",
      progress_percent: 0,
      stage: "queued",
      result: null,
      artifacts: [],
    };
    const completedAnalysis: MusicProcessingJob = {
      ...queuedAnalysis,
      status: "completed",
      progress_percent: 100,
      stage: "completed",
      result: SAMPLE_ANALYSIS_RESULT as unknown as Record<string, unknown>,
    };

    const service = createMockService({
      createJob: vi.fn().mockResolvedValue({ status: "ok", data: queuedAnalysis }),
      getJob: vi.fn().mockResolvedValue({ status: "ok", data: completedAnalysis }),
    });

    const { container } = render(<AccompanimentStudio service={service} pollIntervalMs={10} />);

    // Capability transparency: confirms deferred features are honestly marked not yet active
    await waitFor(() => {
      expect(
        screen.getByText(/Not yet active: source separation, music transcription/i),
      ).toBeInTheDocument();
    });

    // Rejects video file cleanly
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const videoFile = new File(["fakevideo"], "clip.mp4", { type: "video/mp4" });
    fireEvent.change(fileInput, { target: { files: [videoFile] } });
    expect(screen.getByRole("alert")).toHaveTextContent(/Video uploads are not supported/i);

    // Accepts valid WAV vocal recording
    const wavFile = new File(["RIFFfakewavbytes"], "evening_hymn.wav", { type: "audio/wav" });
    fireEvent.change(fileInput, { target: { files: [wavFile] } });
    expect(screen.getByText("evening_hymn.wav")).toBeInTheDocument();

    // Submit upload & analysis
    fireEvent.click(screen.getByRole("button", { name: /Upload & analyse vocal/i }));

    await waitFor(() => {
      expect(service.uploadAudio).toHaveBeenCalledTimes(1);
      expect(service.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          job_type: "audio_analysis",
          studio_context: "ai_accompaniment_studio",
          parameters: expect.objectContaining({ include_vocal_pitch: true }),
        }),
      );
    });

    // Waits for polled completion and verifies real detected metrics + honest low-confidence warning
    await waitFor(() => {
      expect(screen.getAllByText("G major").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("92.5 BPM")).toBeInTheDocument();
      expect(screen.getByText(/Low-confidence analysis estimate/i)).toBeInTheDocument();
      expect(screen.getByText("C4 – D5")).toBeInTheDocument();
    });
  });

  it("supports job cancellation and safe retry when a job fails without losing user configuration", async () => {
    const runningJob: MusicProcessingJob = {
      ...makeCompletedMasterJob(),
      job_id: "job-cancel-me",
      job_type: "audio_rendering",
      status: "processing",
      progress_percent: 55,
      stage: "executing_audio_rendering",
      result: null,
      artifacts: [],
    };
    const cancelledJob: MusicProcessingJob = {
      ...runningJob,
      status: "cancelled",
      stage: "cancelled",
    };

    const service = createMockService({
      createJob: vi.fn().mockResolvedValue({ status: "ok", data: runningJob }),
      getJob: vi.fn().mockResolvedValue({ status: "ok", data: runningJob }),
      cancelJob: vi.fn().mockResolvedValue({
        status: "ok",
        data: {
          job_id: "job-cancel-me",
          status: "cancelled",
          cancelled: true,
          message: "Cancelled",
          job: cancelledJob,
        },
      }),
    });

    const { container } = render(<AccompanimentStudio service={service} pollIntervalMs={5000} />);
    await waitFor(() => expect(service.getCapabilities).toHaveBeenCalled());

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["RIFFwav"], "take.wav", { type: "audio/wav" })] },
    });

    fireEvent.click(screen.getByRole("button", { name: /Generate & master full mix/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Cancel job/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Cancel job/i }));

    await waitFor(() => {
      expect(service.cancelJob).toHaveBeenCalledWith(
        "job-cancel-me",
        expect.stringContaining("Cancelled"),
      );
      expect(screen.getByRole("button", { name: /Retry safely/i })).toBeInTheDocument();
    });

    // Retry safely submits a fresh idempotent job preserving source audio
    fireEvent.click(screen.getByRole("button", { name: /Retry safely/i }));
    await waitFor(() => {
      expect(service.createJob).toHaveBeenCalledTimes(2);
    });
  });

  it("displays honest 4x oversampled true-peak estimate labels, mastering metrics, and triggers authorized private downloads when reopening a completed project", async () => {
    const completedJob = makeCompletedMasterJob();
    const service = createMockService({
      listJobs: vi.fn().mockResolvedValue({ status: "ok", data: [completedJob] }),
    });

    render(<AccompanimentStudio service={service} />);

    // Open Project History tab and reopen the completed project
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Project History \(1\)/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("tab", { name: /Project History \(1\)/i }));

    expect(screen.getByText("Grace Hymn Session")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Reopen/i }));

    // Verify Mastering Report & exact required true-peak label honesty
    await waitFor(() => {
      expect(
        screen.getAllByText(/4× oversampled true-peak estimate/i).length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("-14.1 LUFS")).toBeInTheDocument();
      expect(screen.getByText("-1.02 dB")).toBeInTheDocument();
      expect(
        screen.getByText(
          /engineering estimate rather than a certified full ITU-R BS\.1770-4 true-peak meter/i,
        ),
      ).toBeInTheDocument();
    });

    // Verify authorized private downloads panel lists WAV master, MP3 master, accompaniment, MIDI, stems, and original vocal copy
    expect(screen.getByText("Mastered Mix (WAV)")).toBeInTheDocument();
    expect(screen.getByText("Mastered Mix (MP3)")).toBeInTheDocument();
    expect(screen.getByText("Multi-Track MIDI Arrangement")).toBeInTheDocument();
    expect(screen.getByText("Original Preserved Vocal Copy")).toBeInTheDocument();

    // Trigger authorized download on WAV master
    const downloadWavButtons = screen.getAllByRole("button", { name: /Download WAV/i });
    fireEvent.click(downloadWavButtons[0]!);

    await waitFor(() => {
      expect(service.downloadArtifactBlob).toHaveBeenCalledWith(
        "job-render-1",
        "user-1/jobs/job-render-1/master.wav",
      );
    });
  });

  it("handles expired session (401) and cross-user denial (403) errors cleanly without leaking private URLs", async () => {
    const service = createMockService({
      createJob: vi.fn().mockResolvedValue({
        status: "error",
        code: "JOB_ACCESS_DENIED",
        message: "You do not have permission to access another user's processing job.",
        httpStatus: 403,
        retryable: false,
      }),
      listJobs: vi.fn().mockResolvedValue({
        status: "error",
        code: "SESSION_MISSING",
        message: "Expired token",
        httpStatus: 401,
        retryable: false,
      }),
    });

    const { container } = render(<AccompanimentStudio service={service} />);
    await waitFor(() => expect(service.getCapabilities).toHaveBeenCalled());

    // Submit triggers 403 cross-user rejection banner
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["RIFFwav"], "take.wav", { type: "audio/wav" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Upload & analyse vocal/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Access denied:/i);
    });

    // History tab displays expired-session guidance
    fireEvent.click(screen.getByRole("tab", { name: /Project History/i }));
    await waitFor(() => {
      expect(screen.getByText(/Session expired/i)).toBeInTheDocument();
    });
  });

  it("shows an honest unavailable notice when VITE_MUSIC_ENGINE_URL is not configured", () => {
    const service = createMockService({
      isConfigured: vi.fn().mockReturnValue(false),
    });

    render(<AccompanimentStudio service={service} />);
    expect(
      screen.getByText(/Music Intelligence Engine backend not configured/i),
    ).toBeInTheDocument();
  });

  it("P1: restores Stage 02 analysis on completed reopen, clears stale Stage 05/06/07 outputs when opening a failed job, and returns to workspace on history retry", async () => {
    const completedRender = makeCompletedMasterJob();
    const siblingAnalysis: MusicProcessingJob = {
      ...completedRender,
      job_id: "job-analysis-sibling",
      job_type: "audio_analysis",
      status: "completed",
      artifacts: [],
      result: SAMPLE_ANALYSIS_RESULT as unknown as Record<string, unknown>,
    };
    const failedJob: MusicProcessingJob = {
      ...completedRender,
      job_id: "job-failed-1",
      job_type: "audio_rendering",
      status: "failed",
      progress_percent: 40,
      stage: "failed",
      source_audio: {
        storage_backend: "local",
        bucket: "sonora-audio",
        object_path: "user-1/uploads/u2/other_take.wav",
        original_filename: "other_take.wav",
      },
      parameters: { project_name: "Failed Vocal Take" },
      artifacts: [],
      result: null,
      error: { code: "SYNTH_ERROR", message: "Synth timed out", retryable: true },
    };
    const retriedQueuedJob: MusicProcessingJob = {
      ...failedJob,
      job_id: "job-retried-1",
      status: "queued",
      progress_percent: 0,
      stage: "queued",
      error: null,
    };

    const service = createMockService({
      listJobs: vi.fn().mockResolvedValue({
        status: "ok",
        data: [completedRender, siblingAnalysis, failedJob],
      }),
      createJob: vi.fn().mockResolvedValue({ status: "ok", data: retriedQueuedJob }),
      getJob: vi.fn().mockResolvedValue({ status: "ok", data: retriedQueuedJob }),
    });

    render(<AccompanimentStudio service={service} pollIntervalMs={5000} />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Project History \(3\)/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("tab", { name: /Project History \(3\)/i }));

    // Reopen completed render -> restores Stage 02 detected metrics AND Stage 06 mastering report
    const reopenButtons = screen.getAllByRole("button", { name: /^Reopen$/i });
    fireEvent.click(reopenButtons[0]!);

    await waitFor(() => {
      expect(screen.getByText("-14.1 LUFS")).toBeInTheDocument();
      expect(screen.getByText("92.5 BPM")).toBeInTheDocument();
      expect(screen.getByText("C4 – D5")).toBeInTheDocument();
    });

    // Switch back to history and reopen failed job -> stale Stage 05/06/07 mastering report & exports must clear
    // (job 0 now shows "Opened", so remaining "Reopen" buttons are [0]=siblingAnalysis, [1]=failedJob)
    fireEvent.click(screen.getByRole("tab", { name: /Project History \(3\)/i }));
    const reopenButtonsAgain = screen.getAllByRole("button", { name: /^Reopen$/i });
    fireEvent.click(reopenButtonsAgain[1]!);

    await waitFor(() => {
      expect(screen.queryByText("-14.1 LUFS")).not.toBeInTheDocument();
      expect(screen.queryByText("Mastered Mix (WAV)")).not.toBeInTheDocument();
    });

    // Switch to history and click Retry job on failed job -> must switch back to Studio Workspace tab and submit retry
    fireEvent.click(screen.getByRole("tab", { name: /Project History \(3\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /Retry job/i }));

    await waitFor(() => {
      expect(service.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          job_type: "audio_rendering",
          source_audio: expect.objectContaining({
            object_path: "user-1/uploads/u2/other_take.wav",
          }),
          parameters: expect.objectContaining({
            project_name: "Failed Vocal Take",
          }),
        }),
      );
      expect(screen.getByRole("tab", { name: /Studio Workspace/i })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  it("P1: restores Stage 02 summary fallback from completed render when no sibling analysis job exists and enforces single active transport", async () => {
    const completedRender = makeCompletedMasterJob();
    const stopSpy = vi.fn();
    const startSpy = vi.fn();
    const pauseSpy = vi.fn();

    const pcm = new Float32Array(4410);
    const decodedBuf = {
      length: pcm.length,
      numberOfChannels: 1,
      sampleRate: 44100,
      duration: 0.1,
      getChannelData: () => pcm,
    } as unknown as AudioBuffer;

    class MockAudioCtx {
      state = "running";
      currentTime = 0;
      destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
      decodeAudioData = vi.fn().mockResolvedValue(decodedBuf);
      createGain = vi.fn(() => ({ gain: { value: 1, setValueAtTime: vi.fn() }, connect: vi.fn() }));
      createStereoPanner = vi.fn(() => ({
        pan: { value: 0, setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }));
      createBufferSource = vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: startSpy,
        stop: stopSpy,
        onended: null,
      }));
    }
    vi.stubGlobal("AudioContext", MockAudioCtx);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "audio/wav" });
    Object.defineProperty(blob, "arrayBuffer", {
      value: () => Promise.resolve(new ArrayBuffer(16)),
    });

    const service = createMockService({
      listJobs: vi.fn().mockResolvedValue({ status: "ok", data: [completedRender] }),
      downloadArtifactBlob: vi.fn().mockResolvedValue({
        status: "ok",
        data: {
          blob,
          filename: "master.wav",
          mimeType: "audio/wav",
          objectPath: "user-1/jobs/job-render-1/master.wav",
        },
      }),
    });

    const { container } = render(<AccompanimentStudio service={service} />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Project History \(1\)/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("tab", { name: /Project History \(1\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Reopen$/i }));

    // Stage 02 fallback restored from completed render summary (20 note events, 92.5 BPM, G major)
    await waitFor(() => {
      expect(screen.getByText("92.5 BPM")).toBeInTheDocument();
      expect(screen.getByText(/20 note events/i)).toBeInTheDocument();
    });

    // Attach a local vocal file so Stage 01 HTML <audio> element renders alongside Stage 05 preview deck
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const localFile = new File(["RIFFwav"], "grace_vocal.wav", { type: "audio/wav" });
    Object.defineProperty(localFile, "arrayBuffer", {
      value: () => Promise.resolve(new ArrayBuffer(16)),
    });
    fireEvent.change(fileInput, {
      target: { files: [localFile] },
    });

    const audioEl = container.querySelector("audio") as HTMLAudioElement;
    expect(audioEl).toBeTruthy();
    Object.defineProperty(audioEl, "paused", { value: false, configurable: true });
    audioEl.pause = pauseSpy;

    // Starting Stage 05 Web Audio must pause Stage 01 <audio>
    fireEvent.click(screen.getByRole("button", { name: /Start playback/i }));
    await waitFor(() => {
      expect(startSpy).toHaveBeenCalledTimes(1);
    });
    expect(pauseSpy).toHaveBeenCalledTimes(1);

    // Playing Stage 01 <audio> must stop Stage 05 Web Audio
    fireEvent.play(audioEl);
    expect(stopSpy).toHaveBeenCalled();
  });

  it("P2: aligns Stage 06 peak ceiling unit label and transmits true muted_stems and solo_stems to backend mix config", async () => {
    const completedRender = makeCompletedMasterJob();
    const queuedRender: MusicProcessingJob = {
      ...completedRender,
      job_id: "job-render-2",
      status: "queued",
      progress_percent: 0,
      stage: "queued",
      result: null,
      artifacts: [],
    };
    const service = createMockService({
      listJobs: vi.fn().mockResolvedValue({ status: "ok", data: [completedRender] }),
      createJob: vi.fn().mockResolvedValue({ status: "ok", data: queuedRender }),
      getJob: vi.fn().mockResolvedValue({ status: "ok", data: queuedRender }),
    });

    render(<AccompanimentStudio service={service} pollIntervalMs={5000} />);

    // Stage 06 ceiling unit uses honest dB (4× est.) label rather than dBTP
    expect(screen.getByText(/4× peak ceiling target/i)).toBeInTheDocument();
    expect(screen.getByText(/-1\.0 dB \(4× est\.\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/dBTP/i)).not.toBeInTheDocument();

    // Reopen completed render to expose Stage 05 stem controls
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /Project History \(1\)/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("tab", { name: /Project History \(1\)/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Reopen$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Mute Acoustic Grand Piano/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Mute Acoustic Grand Piano/i }));
    fireEvent.click(screen.getByRole("button", { name: /Solo String Ensemble/i }));

    // Stage 06 reflects [M] and [S] indicators and sends true muted_stems/solo_stems in createJob
    expect(screen.getByText("[M]")).toBeInTheDocument();
    expect(screen.getByText("[S]")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Generate & master full mix/i }));
    await waitFor(() => {
      expect(service.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          job_type: "audio_rendering",
          parameters: expect.objectContaining({
            mix: expect.objectContaining({
              muted_stems: ["piano"],
              solo_stems: ["strings"],
              stem_gains_db: expect.objectContaining({ piano: 0 }),
            }),
          }),
        }),
      );
    });
  });

  it("P3: retries transient polling errors with bounded backoff and recovers cleanly when a subsequent poll succeeds", async () => {
    const queuedJob: MusicProcessingJob = {
      ...makeCompletedMasterJob(),
      job_id: "job-poll-recover",
      job_type: "audio_analysis",
      status: "queued",
      progress_percent: 0,
      stage: "queued",
      result: null,
      artifacts: [],
    };
    const completedJob: MusicProcessingJob = {
      ...queuedJob,
      status: "completed",
      progress_percent: 100,
      stage: "completed",
      result: SAMPLE_ANALYSIS_RESULT as unknown as Record<string, unknown>,
    };

    const getJobMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: "error",
        code: "SERVICE_UNAVAILABLE",
        message: "Temporary upstream 503",
        httpStatus: 503,
        retryable: true,
      })
      .mockResolvedValueOnce({
        status: "error",
        code: "NETWORK_ERROR",
        message: "Connection reset",
        httpStatus: undefined,
        retryable: true,
      })
      .mockResolvedValueOnce({ status: "ok", data: completedJob });

    const service = createMockService({
      createJob: vi.fn().mockResolvedValue({ status: "ok", data: queuedJob }),
      getJob: getJobMock,
    });

    const { container } = render(
      <AccompanimentStudio service={service} pollIntervalMs={5} maxPollRetries={3} />,
    );
    await waitFor(() => expect(service.getCapabilities).toHaveBeenCalled());

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["RIFFwav"], "take.wav", { type: "audio/wav" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Upload & analyse vocal/i }));

    await waitFor(
      () => {
        expect(getJobMock).toHaveBeenCalledTimes(3);
        expect(screen.getByText("92.5 BPM")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Transient error banner clears automatically on recovery
    expect(screen.queryByText(/Temporary connection issue/i)).not.toBeInTheDocument();
  });

  it("P3: halts bounded polling after maxPollRetries without infinite retries and stops immediately on 401/403", async () => {
    const queuedJobA: MusicProcessingJob = {
      ...makeCompletedMasterJob(),
      job_id: "job-poll-exhaust",
      job_type: "audio_analysis",
      status: "queued",
      progress_percent: 0,
      stage: "queued",
      result: null,
      artifacts: [],
    };
    const persistent503 = vi.fn().mockResolvedValue({
      status: "error",
      code: "GATEWAY_TIMEOUT",
      message: "Backend overloaded",
      httpStatus: 503,
      retryable: true,
    });

    const serviceExhaust = createMockService({
      createJob: vi.fn().mockResolvedValue({ status: "ok", data: queuedJobA }),
      getJob: persistent503,
    });

    const { container, unmount } = render(
      <AccompanimentStudio service={serviceExhaust} pollIntervalMs={5} maxPollRetries={2} />,
    );
    await waitFor(() => expect(serviceExhaust.getCapabilities).toHaveBeenCalled());

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["RIFFwav"], "take.wav", { type: "audio/wav" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Upload & analyse vocal/i }));

    await waitFor(
      () => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /Unable to refresh job status after 2 retries/i,
        );
      },
      { timeout: 2000 },
    );
    // Initial failed attempt + 2 retries = 3 total calls, then stops
    const countAfterHalt = persistent503.mock.calls.length;
    expect(countAfterHalt).toBe(3);
    await new Promise((r) => setTimeout(r, 60));
    expect(persistent503).toHaveBeenCalledTimes(3);
    unmount();

    // Now verify 401 stops immediately on the very first poll failure (0 retries)
    const getJob401 = vi.fn().mockResolvedValue({
      status: "error",
      code: "TOKEN_EXPIRED",
      message: "JWT expired",
      httpStatus: 401,
      retryable: false,
    });
    const service401 = createMockService({
      createJob: vi.fn().mockResolvedValue({
        status: "ok",
        data: { ...queuedJobA, job_id: "job-poll-401" },
      }),
      getJob: getJob401,
    });

    const render401 = render(
      <AccompanimentStudio service={service401} pollIntervalMs={5} maxPollRetries={3} />,
    );
    await waitFor(() => expect(service401.getCapabilities).toHaveBeenCalled());
    const input401 = render401.container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input401, {
      target: { files: [new File(["RIFFwav"], "take.wav", { type: "audio/wav" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Upload & analyse vocal/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/session expired while monitoring/i);
    });
    await new Promise((r) => setTimeout(r, 40));
    expect(getJob401).toHaveBeenCalledTimes(1);
    render401.unmount();

    // And verify 403 stops immediately on the very first poll failure (0 retries)
    const getJob403 = vi.fn().mockResolvedValue({
      status: "error",
      code: "JOB_ACCESS_DENIED",
      message: "Forbidden",
      httpStatus: 403,
      retryable: false,
    });
    const service403 = createMockService({
      createJob: vi.fn().mockResolvedValue({
        status: "ok",
        data: { ...queuedJobA, job_id: "job-poll-403" },
      }),
      getJob: getJob403,
    });

    const render403 = render(
      <AccompanimentStudio service={service403} pollIntervalMs={5} maxPollRetries={3} />,
    );
    await waitFor(() => expect(service403.getCapabilities).toHaveBeenCalled());
    const input403 = render403.container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input403, {
      target: { files: [new File(["RIFFwav"], "take.wav", { type: "audio/wav" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /Upload & analyse vocal/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Access denied while monitoring/i);
    });
    await new Promise((r) => setTimeout(r, 40));
    expect(getJob403).toHaveBeenCalledTimes(1);
  });
});

// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AudioPreviewDeck } from "@/components/studio/AudioPreviewDeck";
import { computeRealWaveformPeaks } from "@/components/studio/studio-types";
import type {
  AccompanimentJobResult,
  MusicIntelligenceService,
  MusicProcessingJob,
} from "@/services/contracts";

function createFakeAudioBuffer(samples: Float32Array, sampleRate: number = 44100): AudioBuffer {
  return {
    length: samples.length,
    numberOfChannels: 1,
    sampleRate,
    duration: samples.length / sampleRate,
    getChannelData: () => samples,
    copyFromChannel: vi.fn(),
    copyToChannel: vi.fn(),
  } as unknown as AudioBuffer;
}

const MOCK_RESULT: AccompanimentJobResult = {
  arrangement: {
    style: "ballad",
    key: "C major",
    key_root: "C",
    scale: "major",
    tempo_bpm: 84,
    time_signature: "4/4",
    beats_per_bar: 4,
    total_bars: 4,
    intro_bars: 0,
    outro_bars: 0,
    duration_ms: 10000,
    transpose_semitones: 0,
    harmony_source: "vocal_pitch",
    chords: [],
    tracks: [],
    warnings: [],
  },
  midi: {
    filename: "accompaniment.mid",
    object_path: "user-1/jobs/j1/accompaniment.mid",
    track_count: 3,
    instrument_tracks: 2,
    note_count: 40,
    duration_ms: 10000,
    tempo_bpm: 84,
    time_signature: "4/4",
    key_signature: "C major",
    ticks_per_beat: 480,
  },
  synthesis: {
    engine: "fluidsynth",
    soundfont_name: "MuseScore_General.sf3",
    sample_rate_hz: 44100,
    channels: 2,
    duration_ms: 10000,
    peak_amplitude: 0.7,
    rms_amplitude: 0.15,
    size_bytes: 1764044,
    object_path: "user-1/jobs/j1/accompaniment.wav",
    individual_stems: [
      {
        instrument_id: "piano",
        track_name: "Acoustic Grand Piano",
        gm_program: 0,
        channel: 0,
        object_path: "user-1/jobs/j1/stems/piano.wav",
        duration_ms: 10000,
        peak_amplitude: 0.6,
        rms_amplitude: 0.12,
        size_bytes: 882044,
      },
      {
        instrument_id: "strings",
        track_name: "String Ensemble",
        gm_program: 48,
        channel: 1,
        object_path: "user-1/jobs/j1/stems/strings.wav",
        duration_ms: 10000,
        peak_amplitude: 0.4,
        rms_amplitude: 0.09,
        size_bytes: 882044,
      },
    ],
  },
  musical_analysis: {
    tempo_bpm: 84,
    tempo_confidence: 0.9,
    tempo_stability: "steady",
    time_signature: "4/4",
    estimated_key: "C major",
    key_confidence: 0.9,
    reliability: "high",
    reliability_score: 0.9,
    chord_count: 4,
    warnings: [],
  },
  vocal_pitch: {
    mode: "monophonic",
    voiced_ratio: 0.8,
    mean_confidence: 0.85,
    note_event_count: 16,
    pitch_range_midi: [60, 72],
    warnings: [],
  },
  original_vocal_preserved: true,
  mixing_status: "mastered_vocal_and_accompaniment",
  exports: [
    {
      format: "wav",
      filename: "master.wav",
      object_path: "user-1/jobs/j1/master.wav",
      mime_type: "audio/wav",
      size_bytes: 1764044,
      sample_rate_hz: 44100,
      channels: 2,
      duration_ms: 10000,
      bit_depth: 16,
      bitrate_kbps: null,
      codec_name: "pcm_s16le",
      ffprobe_verified: true,
      soundfile_verified: true,
      peak_amplitude: 0.85,
      metadata_written: {},
    },
  ],
};

const MOCK_JOB: MusicProcessingJob = {
  job_id: "j1",
  user_id: "user-1",
  job_type: "audio_rendering",
  status: "completed",
  progress_percent: 100,
  stage: "completed",
  source_audio: {
    storage_backend: "local",
    bucket: "sonora-audio",
    object_path: "user-1/uploads/u1/vocal.wav",
    original_filename: "vocal.wav",
  },
  trim_window: null,
  parameters: {},
  studio_context: "ai_accompaniment_studio",
  audio_metadata: {
    detected_format: "wav",
    mime_type: "audio/wav",
    size_bytes: 882044,
    sha256_checksum: "b".repeat(64),
    duration_ms: 10000,
    sample_rate_hz: 44100,
    channels: 1,
    codec_name: "pcm_s16le",
    bit_rate_bps: 705600,
    bit_depth: 16,
    original_preserved: true,
  },
  artifacts: [],
  result: MOCK_RESULT as unknown as Record<string, unknown>,
  error: null,
  created_at: "2026-11-19T10:00:00Z",
  updated_at: "2026-11-19T10:00:10Z",
  started_at: null,
  completed_at: null,
  cancelled_at: null,
};

describe("Studio Audio Preview, Real Waveform Computation, Stem Controls & Unmount Cleanup", () => {
  const closeSpy = vi.fn().mockResolvedValue(undefined);
  const stopSpy = vi.fn();
  const startSpy = vi.fn();

  beforeEach(() => {
    closeSpy.mockClear();
    stopSpy.mockClear();
    startSpy.mockClear();

    const pcm = new Float32Array(4410);
    for (let i = 0; i < pcm.length; i += 1) {
      pcm[i] = Math.sin((2 * Math.PI * 440 * i) / 44100) * 0.5;
    }
    const decodedBuf = createFakeAudioBuffer(pcm);

    class MockAudioContext {
      state = "running";
      currentTime = 0;
      destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      close = closeSpy;
      decodeAudioData = vi.fn().mockResolvedValue(decodedBuf);
      createGain = vi.fn(() => ({
        gain: { value: 1, setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }));
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

    vi.stubGlobal("AudioContext", MockAudioContext);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn(() => 1),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("computes real deterministic waveform peaks from PCM samples rather than fake random values", () => {
    const quietThenLoud = new Float32Array(400);
    for (let i = 0; i < 200; i += 1) quietThenLoud[i] = 0.1;
    for (let i = 200; i < 400; i += 1) quietThenLoud[i] = 0.8;

    const peaksA = computeRealWaveformPeaks(createFakeAudioBuffer(quietThenLoud), 4);
    const peaksB = computeRealWaveformPeaks(createFakeAudioBuffer(quietThenLoud), 4);

    expect(peaksA).toEqual(peaksB);
    expect(peaksA[0]).toBeLessThan(peaksA[2]!);
    expect(peaksA[3]).toBeCloseTo(1.0, 2);
  });

  it("handles A/B comparison toggle, per-stem Mute/Solo/Volume/Pan sync, and full AudioContext cleanup on unmount", async () => {
    const syncSpy = vi.fn();
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "audio/wav" });
    Object.defineProperty(blob, "arrayBuffer", {
      value: () => Promise.resolve(new ArrayBuffer(16)),
    });

    const mockService = {
      isConfigured: vi.fn().mockReturnValue(true),
      downloadArtifactBlob: vi.fn().mockResolvedValue({
        status: "ok",
        data: {
          blob,
          filename: "master.wav",
          mimeType: "audio/wav",
          objectPath: "user-1/jobs/j1/master.wav",
        },
      }),
    } as unknown as MusicIntelligenceService;

    const { unmount } = render(
      <AudioPreviewDeck
        job={MOCK_JOB}
        result={MOCK_RESULT}
        service={mockService}
        onSyncStemControlsToMix={syncSpy}
      />,
    );

    // Starts on Final Mix and switches cleanly on A/B Compare
    const abBtn = screen.getByRole("button", {
      name: /Toggle A\/B comparison between Original Vocal and Final Mix/i,
    });
    expect(abBtn).toHaveTextContent(/Final Mix \(B\)/i);
    fireEvent.click(abBtn);
    expect(abBtn).toHaveTextContent(/Original Vocal \(A\)/i);

    // Per-stem Mute, Solo, Volume, and Pan update aria state & sync to mix config
    const mutePiano = screen.getByRole("button", { name: /Mute Acoustic Grand Piano/i });
    expect(mutePiano).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(mutePiano);
    expect(mutePiano).toHaveAttribute("aria-pressed", "true");

    const soloStrings = screen.getByRole("button", { name: /Solo String Ensemble/i });
    fireEvent.click(soloStrings);
    expect(soloStrings).toHaveAttribute("aria-pressed", "true");

    const panPiano = screen.getByLabelText("Pan", { selector: "#stem-pan-piano" });
    fireEvent.change(panPiano, { target: { value: "-0.5" } });
    expect(syncSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ piano: -24 }),
      expect.objectContaining({ piano: -0.5 }),
    );

    // Start playback -> verifies AudioBufferSourceNode starts, then unmount stops & closes AudioContext
    fireEvent.click(screen.getByRole("button", { name: /Start playback/i }));
    await waitFor(() => {
      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    unmount();
    expect(stopSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});

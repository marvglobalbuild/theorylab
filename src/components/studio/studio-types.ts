import type {
  AccompanimentJobResult,
  ArrangementConfig,
  ArrangementStyle,
  AudioAnalysisResult,
  ExportFormat,
  InstrumentFamily,
  MixAndExportConfig,
  MusicProcessingJob,
} from "@/services/contracts";

export const STUDIO_CONTEXT_ID = "ai_accompaniment_studio";

export const ARRANGEMENT_STYLES: Array<{
  id: ArrangementStyle;
  label: string;
  description: string;
  defaultInstruments: InstrumentFamily[];
}> = [
  {
    id: "ballad",
    label: "Ballad",
    description:
      "Warm sustained piano, orchestral strings, acoustic bass, woodwind counterlines, and gentle percussion.",
    defaultInstruments: ["piano", "strings", "bass", "woodwinds", "drums"],
  },
  {
    id: "pop",
    label: "Pop",
    description:
      "Rhythmic chordal piano, grounded bass, lush string lift, bright brass accents, and steady drum groove.",
    defaultInstruments: ["piano", "bass", "strings", "brass", "drums"],
  },
  {
    id: "gospel",
    label: "Gospel",
    description:
      "Rich full-voiced piano, driving bass, expressive strings, punchy brass swells, and dynamic kit.",
    defaultInstruments: ["piano", "bass", "strings", "brass", "drums"],
  },
  {
    id: "classical",
    label: "Classical",
    description:
      "Chamber-balanced piano, string ensemble, acoustic bass, and lyrical woodwinds without drum kit.",
    defaultInstruments: ["piano", "strings", "bass", "woodwinds"],
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description:
      "Full ensemble orchestration across piano, strings, bass, brass, woodwinds, and dramatic percussion.",
    defaultInstruments: ["piano", "strings", "bass", "brass", "woodwinds", "drums"],
  },
];

export const INSTRUMENT_FAMILIES: Array<{
  id: InstrumentFamily;
  label: string;
  subtitle: string;
  defaultVolume: number;
}> = [
  { id: "piano", label: "Piano", subtitle: "Acoustic Grand Piano", defaultVolume: 0.82 },
  { id: "strings", label: "Strings", subtitle: "String Ensemble", defaultVolume: 0.68 },
  { id: "bass", label: "Bass", subtitle: "Acoustic / Finger Bass", defaultVolume: 0.84 },
  { id: "brass", label: "Brass", subtitle: "Brass Section", defaultVolume: 0.66 },
  { id: "woodwinds", label: "Woodwinds", subtitle: "Flute / Woodwind Lead", defaultVolume: 0.64 },
  { id: "drums", label: "Drums", subtitle: "Standard Kit & Percussion", defaultVolume: 0.78 },
];

export const KEY_SIGNATURE_OPTIONS: string[] = [
  "C major",
  "G major",
  "D major",
  "A major",
  "E major",
  "B major",
  "F major",
  "Bb major",
  "Eb major",
  "Ab major",
  "Db major",
  "Gb major",
  "A minor",
  "E minor",
  "B minor",
  "F# minor",
  "C# minor",
  "G# minor",
  "D minor",
  "G minor",
  "C minor",
  "F minor",
  "Bb minor",
  "Eb minor",
];

export const DEFAULT_ARRANGEMENT_CONFIG: ArrangementConfig = {
  style: "ballad",
  selected_instruments: ["piano", "strings", "bass", "woodwinds", "drums"],
  energy: 0.55,
  density: 0.55,
  key_override: null,
  tempo_override_bpm: null,
  transpose_semitones: 0,
  intro_bars: 0,
  outro_bars: 0,
  instrument_volumes: {
    piano: 0.82,
    strings: 0.68,
    bass: 0.84,
    brass: 0.66,
    woodwinds: 0.64,
    drums: 0.78,
  },
  render_individual_stems: true,
};

export const DEFAULT_MIX_CONFIG: MixAndExportConfig = {
  output_formats: ["wav", "mp3"],
  sample_rate_hz: 44100,
  wav_bit_depth: 16,
  mp3_bitrate_kbps: 320,
  target_lufs: -14.0,
  true_peak_ceiling_dbtp: -1.0,
  max_limiting_db: 3.5,
  vocal_gain_db: 0.0,
  accompaniment_gain_db: -4.5,
  vocal_balance_mode: "auto_adaptive",
  stem_gains_db: {},
  stem_pans: {},
  vocal_pan: 0.0,
  accompaniment_pan: 0.0,
  preserve_outro: true,
  include_original_vocal_copy: false,
  metadata: null,
};

export const EXPORT_FORMAT_OPTIONS: Array<{
  id: ExportFormat;
  label: string;
  description: string;
}> = [
  { id: "wav", label: "WAV", description: "Uncompressed studio PCM (16-bit or 24-bit)" },
  { id: "flac", label: "FLAC", description: "Lossless archival compression" },
  { id: "mp3", label: "MP3", description: "Portable delivery (128–320 kbps)" },
];

export function formatDurationMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatSecondsClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const MIDI_NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as const;

export function midiToNoteName(midi: number | null | undefined): string {
  if (midi == null || !Number.isFinite(midi)) return "—";
  const rounded = Math.round(midi);
  const name = MIDI_NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${name}${octave}`;
}

export function formatDb(value: number | null | undefined, unit: string = "dB"): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} ${unit}`;
}

export function formatPanLabel(pan: number): string {
  if (Math.abs(pan) < 0.04) return "Center";
  const pct = Math.round(Math.abs(pan) * 100);
  return pan < 0 ? `${pct}% L` : `${pct}% R`;
}

export function generateIdempotencyKey(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`.slice(0, 120);
}

export function isAnalysisJobResult(value: unknown): value is AudioAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return "reliability" in obj && "beats" in obj && "chords" in obj;
}

export function isAccompanimentJobResult(value: unknown): value is AccompanimentJobResult {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return "arrangement" in obj && "midi" in obj && "synthesis" in obj;
}

export function extractProjectName(job: MusicProcessingJob): string {
  const raw = job.parameters?.["project_name"];
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  const filename = job.source_audio?.original_filename;
  if (filename) return filename.replace(/\.[^.]+$/, "");
  return `Studio Session ${job.job_id.slice(0, 8)}`;
}

export function humanizeJobStage(stage: string): string {
  if (!stage) return "Waiting";
  if (stage === "queued") return "Queued for worker";
  if (stage.startsWith("ingesting_audio")) return "Verifying & staging original vocal";
  if (stage === "decoding_audio") return "Decoding canonical 44.1 kHz PCM";
  if (stage === "executing_audio_analysis") return "Analysing key, tempo, chords & vocal pitch";
  if (stage === "executing_accompaniment_generation")
    return "Arranging harmony, generating MIDI & synthesizing instruments";
  if (stage === "executing_audio_rendering")
    return "Arranging, synthesizing, mixing & mastering final audio";
  if (stage.startsWith("retrying_attempt_")) return "Retrying after transient worker interruption";
  if (stage === "completed") return "Completed";
  if (stage === "cancelled") return "Cancelled";
  if (stage === "failed") return "Failed";
  return stage.replace(/_/g, " ");
}

export function computeRealWaveformPeaks(buffer: AudioBuffer, barCount: number = 128): number[] {
  const channels = buffer.numberOfChannels;
  const totalSamples = buffer.length;
  if (channels === 0 || totalSamples === 0 || barCount <= 0) return [];

  const blockSize = Math.max(1, Math.floor(totalSamples / barCount));
  const peaks = new Array<number>(barCount).fill(0);

  for (let ch = 0; ch < channels; ch += 1) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < barCount; i += 1) {
      const start = i * blockSize;
      const end = Math.min(totalSamples, start + blockSize);
      let maxVal = 0;
      const step = Math.max(1, Math.floor((end - start) / 64));
      for (let idx = start; idx < end; idx += step) {
        const abs = Math.abs(data[idx] ?? 0);
        if (abs > maxVal) maxVal = abs;
      }
      if (maxVal > peaks[i]!) {
        peaks[i] = maxVal;
      }
    }
  }

  const globalMax = Math.max(...peaks, 0.001);
  return peaks.map((p) => Math.max(0.03, Math.min(1, p / globalMax)));
}

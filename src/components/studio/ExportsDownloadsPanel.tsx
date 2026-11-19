import { AlertCircle, Download, FileAudio, FileMusic, Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type {
  AccompanimentJobResult,
  MusicIntelligenceService,
  MusicProcessingJob,
} from "@/services/contracts";
import { formatBytes, formatDurationMs } from "./studio-types";

export interface ExportsDownloadsPanelProps {
  job: MusicProcessingJob | null;
  result: AccompanimentJobResult | null;
  service: MusicIntelligenceService;
}

interface DownloadableItem {
  id: string;
  category: "Master" | "Accompaniment" | "Stem" | "MIDI" | "Original Vocal";
  label: string;
  filename: string;
  objectPath: string;
  formatLabel: string;
  sizeBytes: number | null;
  durationMs: number | null;
  technicalDetail: string;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportsDownloadsPanel({ job, result, service }: ExportsDownloadsPanelProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!job || !result) {
    return (
      <section
        aria-labelledby="stage-g-heading"
        className="rounded-[2px] border border-border bg-paper p-5 md:p-6"
      >
        <p className="eyebrow text-crimson-deep">Stage 07 · Private Exports &amp; Downloads</p>
        <h2 id="stage-g-heading" className="type-display-md mt-1 text-foreground">
          Export &amp; download
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Completed master audio files (WAV, FLAC, MP3), individual instrument stems, accompaniment
          audio, MIDI arrangements, and optional original vocal copies will appear here for
          authorized private download.
        </p>
      </section>
    );
  }

  const items: DownloadableItem[] = [];

  for (const exp of result.exports ?? []) {
    const depthOrRate = exp.bit_depth
      ? `${exp.bit_depth}-bit`
      : exp.bitrate_kbps
        ? `${exp.bitrate_kbps} kbps`
        : exp.codec_name;
    items.push({
      id: `master-${exp.format}-${exp.object_path}`,
      category: "Master",
      label: `Mastered Mix (${exp.format.toUpperCase()})`,
      filename: exp.filename,
      objectPath: exp.object_path,
      formatLabel: exp.format.toUpperCase(),
      sizeBytes: exp.size_bytes,
      durationMs: exp.duration_ms,
      technicalDetail: `${(exp.sample_rate_hz / 1000).toFixed(1)} kHz · ${exp.channels === 2 ? "Stereo" : `${exp.channels} ch`} · ${depthOrRate}`,
    });
  }

  if (result.synthesis?.object_path) {
    items.push({
      id: `accompaniment-${result.synthesis.object_path}`,
      category: "Accompaniment",
      label: "Synthesized Accompaniment (Instrumental)",
      filename: "accompaniment.wav",
      objectPath: result.synthesis.object_path,
      formatLabel: "WAV",
      sizeBytes: result.synthesis.size_bytes,
      durationMs: result.synthesis.duration_ms,
      technicalDetail: `${(result.synthesis.sample_rate_hz / 1000).toFixed(1)} kHz · Stereo · ${result.synthesis.soundfont_name ?? "FluidSynth"}`,
    });
  }

  if (result.midi?.object_path) {
    items.push({
      id: `midi-${result.midi.object_path}`,
      category: "MIDI",
      label: "Multi-Track MIDI Arrangement",
      filename: result.midi.filename || "accompaniment.mid",
      objectPath: result.midi.object_path,
      formatLabel: "MIDI",
      sizeBytes:
        job.artifacts.find((a) => a.object_path === result.midi.object_path)?.size_bytes ?? null,
      durationMs: result.midi.duration_ms,
      technicalDetail: `${result.midi.instrument_tracks} tracks · ${result.midi.note_count} notes · ${result.midi.tempo_bpm.toFixed(1)} BPM`,
    });
  }

  for (const stem of result.synthesis?.individual_stems ?? []) {
    items.push({
      id: `stem-${stem.instrument_id}-${stem.object_path}`,
      category: "Stem",
      label: `Stem: ${stem.track_name}`,
      filename: `${stem.instrument_id}.wav`,
      objectPath: stem.object_path,
      formatLabel: "WAV",
      sizeBytes: stem.size_bytes,
      durationMs: stem.duration_ms,
      technicalDetail: `Channel ${stem.channel + 1} · GM Program #${stem.gm_program}`,
    });
  }

  if (result.mixing?.original_vocal_copy_object_path) {
    const vocalArt = job.artifacts.find(
      (a) => a.object_path === result.mixing?.original_vocal_copy_object_path,
    );
    items.push({
      id: `vocal-copy-${result.mixing.original_vocal_copy_object_path}`,
      category: "Original Vocal",
      label: "Original Preserved Vocal Copy",
      filename: "original_vocal_copy.wav",
      objectPath: result.mixing.original_vocal_copy_object_path,
      formatLabel: "WAV",
      sizeBytes: vocalArt?.size_bytes ?? null,
      durationMs: result.mixing.vocal_duration_ms,
      technicalDetail: `${(result.mixing.sample_rate_hz / 1000).toFixed(1)} kHz · Unmodified original vocal`,
    });
  }

  const handleDownload = async (item: DownloadableItem) => {
    setDownloadingId(item.id);
    setDownloadError(null);
    try {
      const res = await service.downloadArtifactBlob(job.job_id, item.objectPath);
      if (res.status === "ok") {
        triggerBrowserDownload(res.data.blob, item.filename || res.data.filename);
      } else if (res.status === "error") {
        if (res.httpStatus === 401) {
          setDownloadError(
            "Your authentication session expired. Refresh or sign in again to re-authorize this private download.",
          );
        } else if (res.httpStatus === 403) {
          setDownloadError("Access denied: this private artifact does not belong to your account.");
        } else {
          setDownloadError(res.message);
        }
      } else {
        setDownloadError(res.message);
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section
      aria-labelledby="stage-g-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Stage 07 · Private Exports &amp; Downloads</p>
          <h2 id="stage-g-heading" className="type-display-md mt-1 text-foreground">
            Authorized studio artifacts ({items.length})
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 text-primary" aria-hidden />
          Private account-scoped downloads only
        </span>
      </div>

      {downloadError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{downloadError}</span>
        </div>
      )}

      <div className="divide-y divide-border rounded-[2px] border border-border bg-background">
        {items.map((item) => {
          const busy = downloadingId === item.id;
          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3 min-w-0">
                {item.category === "MIDI" ? (
                  <FileMusic className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                ) : (
                  <FileAudio className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    <span className="font-mono text-foreground/80">{item.filename}</span> ·{" "}
                    {item.formatLabel} · {formatBytes(item.sizeBytes)}
                    {item.durationMs != null ? ` · ${formatDurationMs(item.durationMs)}` : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.technicalDetail}</p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                variant={item.category === "Master" ? "default" : "outline"}
                disabled={busy}
                onClick={() => void handleDownload(item)}
                className="shrink-0"
              >
                {busy ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Download className="size-3.5" aria-hidden />
                )}
                {busy ? "Authorizing…" : `Download ${item.formatLabel}`}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { AlertTriangle, CheckCircle2, Info, Music2 } from "lucide-react";

import type { AudioAnalysisResult } from "@/services/contracts";
import { formatDurationMs, midiToNoteName } from "./studio-types";

export interface AnalysisReviewStageProps {
  analysis: AudioAnalysisResult | null;
  analyzing: boolean;
}

export function AnalysisReviewStage({ analysis, analyzing }: AnalysisReviewStageProps) {
  if (!analysis && !analyzing) {
    return (
      <section
        aria-labelledby="stage-b-heading"
        className="rounded-[2px] border border-border bg-paper p-5 md:p-6"
      >
        <p className="eyebrow text-crimson-deep">Stage 02 · Musical Analysis</p>
        <h2 id="stage-b-heading" className="type-display-md mt-1 text-foreground">
          Analyse the recording
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload or record a vocal track in Stage 01 to inspect detected key, mode, tempo, meter,
          beat grid, chord estimates, and monophonic vocal pitch contours.
        </p>
      </section>
    );
  }

  if (analyzing && !analysis) {
    return (
      <section
        aria-labelledby="stage-b-heading"
        className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-4"
        role="status"
      >
        <p className="eyebrow text-crimson-deep">Stage 02 · Musical Analysis</p>
        <h2 id="stage-b-heading" className="type-display-md text-foreground">
          Analysing vocal recording…
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Key & Mode", "Tempo", "Meter & Beats", "Vocal Pitch"].map((label) => (
            <div
              key={label}
              className="h-20 animate-pulse rounded-[2px] border border-border bg-background"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!analysis) return null;

  const isLowConfidence =
    analysis.reliability === "low" ||
    analysis.reliability === "unreliable" ||
    analysis.key_confidence < 0.55 ||
    analysis.tempo_confidence < 0.55;

  const downbeatCount = analysis.beats.filter((b) => b.is_downbeat).length;
  const vocalPitch = analysis.vocal_pitch ?? null;
  const allWarnings = [...(analysis.warnings ?? []), ...(vocalPitch?.warnings ?? [])];

  return (
    <section
      aria-labelledby="stage-b-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Stage 02 · Musical Analysis</p>
          <h2 id="stage-b-heading" className="type-display-md mt-1 text-foreground">
            Detected musical profile
          </h2>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          Reliability:{" "}
          <span className="font-medium text-foreground capitalize">{analysis.reliability}</span> (
          {Math.round(analysis.reliability_score * 100)}%) ·{" "}
          {formatDurationMs(analysis.audio_duration_ms)}
        </p>
      </div>

      {/* Honest low-confidence / heuristic notice */}
      {isLowConfidence ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs leading-relaxed text-crimson-deep"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">
              Low-confidence analysis estimate ({analysis.reliability}) — review before arranging
            </p>
            <p className="mt-1 text-foreground/80">
              Unaccompanied vocals or expressive rubato singing can produce ambiguous automatic key
              or tempo detection. Confirm or override the Key and Tempo in Stage 03 below before
              generating your accompaniment.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-[2px] border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Heuristic audio analysis completed ({analysis.analysis_method}). You can keep these
            detected values or override Key, Tempo, and Transposition in Stage 03.
          </span>
        </div>
      )}

      {/* Core musical metrics grid */}
      <dl className="grid border-y border-border bg-background sm:grid-cols-2 lg:grid-cols-4">
        <div className="px-4 py-4">
          <dt className="text-xs text-muted-foreground">Estimated Key &amp; Mode</dt>
          <dd className="mt-1.5 font-display text-2xl text-foreground">
            {analysis.estimated_key ?? "Undetermined"}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground tabular-nums">
            Confidence: {Math.round(analysis.key_confidence * 100)}%
            {analysis.tuning_offset_cents != null
              ? ` · Tuning ${analysis.tuning_offset_cents >= 0 ? "+" : ""}${analysis.tuning_offset_cents.toFixed(0)}¢`
              : ""}
          </dd>
        </div>

        <div className="border-t border-border px-4 py-4 sm:border-t-0 sm:border-l">
          <dt className="text-xs text-muted-foreground">Tempo</dt>
          <dd className="mt-1.5 font-display text-2xl tabular-nums text-foreground">
            {analysis.tempo_bpm != null ? `${analysis.tempo_bpm.toFixed(1)} BPM` : "Undetermined"}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground tabular-nums">
            Confidence: {Math.round(analysis.tempo_confidence * 100)}% ·{" "}
            {analysis.tempo_stability.replace(/_/g, " ")}
          </dd>
        </div>

        <div className="border-t border-border px-4 py-4 lg:border-t-0 lg:border-l">
          <dt className="text-xs text-muted-foreground">Meter &amp; Beat Grid</dt>
          <dd className="mt-1.5 font-display text-2xl tabular-nums text-foreground">
            {analysis.time_signature ?? "4/4"}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground tabular-nums">
            {analysis.beats.length} beats · {downbeatCount} downbeats
          </dd>
        </div>

        <div className="border-t border-border px-4 py-4 sm:border-l lg:border-t-0">
          <dt className="text-xs text-muted-foreground">Vocal Pitch (Monophonic)</dt>
          <dd className="mt-1.5 font-display text-2xl tabular-nums text-foreground">
            {vocalPitch?.pitch_range_midi
              ? `${midiToNoteName(vocalPitch.pitch_range_midi[0])} – ${midiToNoteName(vocalPitch.pitch_range_midi[1])}`
              : "Not extracted"}
          </dd>
          <dd className="mt-1 text-xs text-muted-foreground tabular-nums">
            {vocalPitch
              ? `${vocalPitch.note_events.length} note events · ${Math.round(vocalPitch.voiced_ratio * 100)}% voiced`
              : "Monophonic vocal contour pending"}
          </dd>
        </div>
      </dl>

      {/* Chord progression estimates */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Chord timeline estimates ({analysis.chords.length})
          </h3>
          {analysis.chords.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Time-aligned triad estimates from chroma profile
            </span>
          )}
        </div>

        {analysis.chords.length > 0 ? (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-4 md:grid-cols-6">
            {analysis.chords.slice(0, 18).map((chord, idx) => (
              <div key={`${chord.start_ms}-${idx}`} className="bg-background px-3 py-2.5">
                <p className="font-display text-lg leading-tight text-foreground">{chord.symbol}</p>
                <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {formatDurationMs(chord.start_ms)} · {Math.round(chord.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-[2px] border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            No distinct harmonic chord regions were detected from this solo vocal recording. The
            arranger will harmonize directly from your vocal pitch contour and confirmed key.
          </p>
        )}
      </div>

      {/* Monophonic vocal pitch details */}
      {vocalPitch && (
        <div className="rounded-[2px] border border-border bg-background p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <Music2 className="size-3.5 text-primary" aria-hidden />
              <span>Monophonic vocal melody tracking ({vocalPitch.extractor_method})</span>
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              Mean pitch confidence: {Math.round(vocalPitch.mean_confidence * 100)}% ·{" "}
              {vocalPitch.voiced_regions.length} voiced phrases
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{vocalPitch.monophonic_only_notice}</p>
        </div>
      )}

      {/* Backend warnings */}
      {allWarnings.length > 0 && (
        <div className="rounded-[2px] border border-border bg-background p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Info className="size-3.5 text-crimson-deep" aria-hidden />
            <span>Analysis notes &amp; warnings</span>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {allWarnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

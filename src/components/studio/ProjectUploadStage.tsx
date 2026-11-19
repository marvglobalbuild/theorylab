import { AlertCircle, CheckCircle2, Pause, Play, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ProgressRule } from "@/components/workspace/WorkspacePrimitives";
import { cn } from "@/lib/utils";
import type {
  AudioSourceRef,
  MusicEngineCapabilities,
  VerifiedAudioMetadata,
} from "@/services/contracts";
import {
  DEFAULT_MAX_AUDIO_FILE_SIZE_BYTES,
  validateAudioFileForUpload,
} from "@/services/music-intelligence";
import { RealAudioWaveform } from "./RealAudioWaveform";
import { VocalRecorder } from "./VocalRecorder";
import { formatBytes, formatDurationMs, formatSecondsClock } from "./studio-types";

export interface ProjectUploadStageProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  capabilities: MusicEngineCapabilities | null;
  selectedFile: File | null;
  uploadedSource: AudioSourceRef | null;
  verifiedMetadata: VerifiedAudioMetadata | null;
  uploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  locked: boolean;
  onSelectFile: (file: File | null, validationError?: string | null) => void;
  onUploadAndAnalyse: () => void;
}

export function ProjectUploadStage({
  projectName,
  onProjectNameChange,
  capabilities,
  selectedFile,
  uploadedSource,
  verifiedMetadata,
  uploading,
  uploadProgress,
  uploadError,
  locked,
  onSelectFile,
  onUploadAndAnalyse,
}: ProjectUploadStageProps) {
  const fileInputId = useId();
  const projectInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  const allowedFormats = capabilities?.supported_formats
    .filter((f) => f.decode_supported)
    .map((f) => f.format) ?? ["wav", "mp3", "flac", "m4a", "aac", "ogg", "webm"];

  const maxBytes = capabilities?.limits.max_file_size_bytes ?? DEFAULT_MAX_AUDIO_FILE_SIZE_BYTES;
  const maxDurationSeconds = capabilities?.limits.max_duration_seconds ?? 900;
  const acceptAttr = allowedFormats.map((f) => `.${f}`).join(",") + ",audio/*";

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setIsPlaying(false);
      setCurrentSec(0);
      setDurationSec(0);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
        audioEl.src = "";
      }
    };
  }, []);

  const handleCandidateFile = (file: File | null) => {
    if (!file) return;
    const check = validateAudioFileForUpload(file, maxBytes, allowedFormats);
    if (!check.valid) {
      setLocalError(check.message ?? "Invalid audio file.");
      onSelectFile(null, check.message ?? "Invalid audio file.");
      return;
    }
    setLocalError(null);
    if (!projectName.trim()) {
      onProjectNameChange(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
    }
    onSelectFile(file, null);
  };

  const handleDrop = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();
    setDragActive(false);
    if (locked || uploading) return;
    const file = evt.dataTransfer.files?.[0] ?? null;
    handleCandidateFile(file);
  };

  const toggleLocalPreview = async () => {
    const audio = audioRef.current;
    if (!audio || !previewUrl) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setLocalError("Browser playback could not start for this audio file.");
      }
    }
  };

  const seekLocalPreview = (nextTime: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = nextTime;
    setCurrentSec(nextTime);
  };

  const activeError = localError || uploadError;

  return (
    <section
      aria-labelledby="stage-a-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Stage 01 · Vocal Input</p>
          <h2 id="stage-a-heading" className="type-display-md mt-1 text-foreground">
            Start a project
          </h2>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          Audio only: {allowedFormats.map((f) => f.toUpperCase()).join(", ")} · Max{" "}
          {Math.round(maxBytes / (1024 * 1024))} MB · Up to {Math.floor(maxDurationSeconds / 60)}{" "}
          min
        </p>
      </div>

      {/* Project name */}
      <div className="max-w-lg space-y-1.5">
        <label htmlFor={projectInputId} className="block text-xs font-medium text-foreground">
          Project name
        </label>
        <input
          id={projectInputId}
          type="text"
          value={projectName}
          disabled={locked || uploading}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="e.g. Evening Hymn Vocal Take 1"
          maxLength={120}
          className="h-10 w-full rounded-[2px] border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
        />
      </div>

      {/* Dropzone & file selector */}
      {!selectedFile && !uploadedSource && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!locked && !uploading) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center rounded-[2px] border border-dashed px-6 py-9 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-foreground/40",
            )}
          >
            <Upload className="size-6 text-primary" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">
              Drop a vocal audio recording here, or browse your device
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your original recording is stored privately under your account and never overwritten.
            </p>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept={acceptAttr}
              disabled={locked || uploading}
              onChange={(e) => {
                handleCandidateFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
              className="sr-only"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={locked || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
            >
              Choose audio file
            </Button>
          </div>

          <VocalRecorder
            disabled={locked || uploading}
            maxDurationSeconds={maxDurationSeconds}
            onRecordingComplete={(file) => handleCandidateFile(file)}
          />
        </div>
      )}

      {/* Selected local file preview OR already-uploaded reference */}
      {(selectedFile || uploadedSource) && (
        <div className="space-y-4 rounded-[2px] border border-border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {selectedFile?.name ??
                  uploadedSource?.original_filename ??
                  "Uploaded vocal recording"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {verifiedMetadata ? (
                  <>
                    {verifiedMetadata.detected_format.toUpperCase()} ·{" "}
                    {formatDurationMs(verifiedMetadata.duration_ms)} ·{" "}
                    {(verifiedMetadata.sample_rate_hz / 1000).toFixed(1)} kHz ·{" "}
                    {verifiedMetadata.channels === 1 ? "Mono" : `${verifiedMetadata.channels} ch`} ·{" "}
                    {formatBytes(verifiedMetadata.size_bytes)}
                  </>
                ) : selectedFile ? (
                  <>
                    {formatBytes(selectedFile.size)}
                    {durationSec > 0 ? ` · ${formatSecondsClock(durationSec)}` : ""} · Ready to
                    upload
                  </>
                ) : (
                  "Stored in private user vault"
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!locked && !uploading && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptAttr}
                    onChange={(e) => {
                      handleCandidateFile(e.target.files?.[0] ?? null);
                      e.target.value = "";
                    }}
                    className="sr-only"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <RefreshCw className="size-3.5" aria-hidden /> Replace
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLocalError(null);
                      onSelectFile(null, null);
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden /> Remove
                  </Button>
                </>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2.5">
              <audio
                ref={audioRef}
                src={previewUrl}
                preload="metadata"
                onLoadedMetadata={(e) => setDurationSec(e.currentTarget.duration || 0)}
                onTimeUpdate={(e) => setCurrentSec(e.currentTarget.currentTime)}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void toggleLocalPreview()}
                  aria-label={isPlaying ? "Pause vocal preview" : "Play vocal preview"}
                >
                  {isPlaying ? (
                    <Pause className="size-3.5" aria-hidden />
                  ) : (
                    <Play className="size-3.5" aria-hidden />
                  )}
                  {isPlaying ? "Pause" : "Preview vocal"}
                </Button>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatSecondsClock(currentSec)} / {formatSecondsClock(durationSec)}
                </span>
              </div>
              <RealAudioWaveform
                audioBlob={selectedFile}
                currentTimeSec={currentSec}
                durationSec={durationSec}
                onSeek={seekLocalPreview}
                label="Original vocal preview waveform"
                accentColor="primary"
              />
            </div>
          )}

          {uploading && (
            <ProgressRule
              percent={uploadProgress}
              label="Uploading & validating original vocal in private storage"
            />
          )}

          {uploadedSource && verifiedMetadata && !uploading && (
            <div className="flex items-center gap-2 text-xs text-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
              <span>
                Original vocal verified (SHA-256{" "}
                <span className="font-mono">{verifiedMetadata.sha256_checksum.slice(0, 12)}…</span>)
                and preserved untouched in private storage.
              </span>
            </div>
          )}
        </div>
      )}

      {activeError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{activeError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted-foreground">
          {uploadedSource
            ? "Ready to run or re-run musical analysis on your private vocal recording."
            : "Upload verifies format, headers, duration, and stream integrity before analysis."}
        </p>
        <Button
          type="button"
          disabled={(!selectedFile && !uploadedSource) || uploading || locked}
          onClick={onUploadAndAnalyse}
        >
          {uploading
            ? "Uploading vocal…"
            : uploadedSource
              ? "Analyse vocal recording"
              : "Upload & analyse vocal"}
        </Button>
      </div>
    </section>
  );
}

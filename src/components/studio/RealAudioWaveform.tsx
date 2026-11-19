import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { computeRealWaveformPeaks } from "./studio-types";

export interface RealAudioWaveformProps {
  /** Real audio Blob or already-decoded AudioBuffer; waveform is computed strictly from real PCM samples. */
  audioBlob?: Blob | null;
  audioBuffer?: AudioBuffer | null;
  currentTimeSec: number;
  durationSec: number;
  onSeek?: (nextTimeSec: number) => void;
  label: string;
  accentColor?: "primary" | "crimson" | "ink";
  height?: number;
  className?: string;
}

const PEAK_BAR_COUNT = 128;

export function RealAudioWaveform({
  audioBlob,
  audioBuffer,
  currentTimeSec,
  durationSec,
  onSeek,
  label,
  accentColor = "primary",
  height = 68,
  className,
}: RealAudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [decodeState, setDecodeState] = useState<"idle" | "decoding" | "ready" | "unavailable">(
    "idle",
  );

  useEffect(() => {
    let cancelled = false;

    if (audioBuffer) {
      const computed = computeRealWaveformPeaks(audioBuffer, PEAK_BAR_COUNT);
      setPeaks(computed);
      setDecodeState(computed.length > 0 ? "ready" : "unavailable");
      return;
    }

    if (!audioBlob) {
      setPeaks(null);
      setDecodeState("idle");
      return;
    }

    const AudioCtx =
      typeof window !== "undefined"
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;

    if (!AudioCtx) {
      setPeaks(null);
      setDecodeState("unavailable");
      return;
    }

    setDecodeState("decoding");
    const ctx = new AudioCtx();

    void audioBlob
      .arrayBuffer()
      .then((arr) => ctx.decodeAudioData(arr.slice(0)))
      .then((decoded) => {
        if (cancelled) return;
        const computed = computeRealWaveformPeaks(decoded, PEAK_BAR_COUNT);
        setPeaks(computed);
        setDecodeState(computed.length > 0 ? "ready" : "unavailable");
      })
      .catch(() => {
        if (cancelled) return;
        setPeaks(null);
        setDecodeState("unavailable");
      })
      .finally(() => {
        void ctx.close().catch(() => {});
      });

    return () => {
      cancelled = true;
    };
  }, [audioBlob, audioBuffer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || peaks.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, width, h);

    const progressRatio =
      durationSec > 0 ? Math.max(0, Math.min(1, currentTimeSec / durationSec)) : 0;
    const playedColor =
      accentColor === "crimson" ? "#b91c1c" : accentColor === "ink" ? "#1e293b" : "#1d4ed8";
    const unplayedColor = "#cbd5e1";

    const barWidth = width / peaks.length;
    const gap = Math.max(1, Math.floor(barWidth * 0.28));
    const drawWidth = Math.max(1.5, barWidth - gap);
    const midY = h / 2;

    peaks.forEach((amp, idx) => {
      const barRatio = idx / peaks.length;
      const barH = Math.max(4, amp * (h - 10));
      ctx.fillStyle = barRatio <= progressRatio ? playedColor : unplayedColor;
      ctx.fillRect(idx * barWidth, midY - barH / 2, drawWidth, barH);
    });

    if (durationSec > 0) {
      const headX = Math.round(progressRatio * width);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(headX, 0, 1.5, h);
    }
  }, [peaks, currentTimeSec, durationSec, accentColor]);

  const handlePointerSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || durationSec <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    onSeek(ratio * durationSec);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onSeek || durationSec <= 0) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      onSeek(Math.min(durationSec, currentTimeSec + 5));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSeek(Math.max(0, currentTimeSec - 5));
    } else if (event.key === "Home") {
      event.preventDefault();
      onSeek(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onSeek(durationSec);
    }
  };

  const progressPct =
    durationSec > 0 ? Math.max(0, Math.min(100, (currentTimeSec / durationSec) * 100)) : 0;

  return (
    <div
      role="slider"
      tabIndex={onSeek && durationSec > 0 ? 0 : -1}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(durationSec)}
      aria-valuenow={Math.round(currentTimeSec)}
      onClick={handlePointerSeek}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative w-full overflow-hidden rounded-[2px] border border-border bg-background px-2 py-1.5 select-none",
        onSeek && durationSec > 0 && "cursor-pointer",
        className,
      )}
    >
      {decodeState === "ready" && peaks ? (
        <canvas
          ref={canvasRef}
          width={768}
          height={height}
          className="block w-full"
          style={{ height: `${height}px` }}
          aria-hidden="true"
        />
      ) : (
        <div className="flex flex-col justify-center gap-2 px-2" style={{ height: `${height}px` }}>
          <div className="h-1.5 w-full overflow-hidden bg-border">
            <div
              className={cn(
                "h-full transition-[width] duration-150",
                accentColor === "crimson" ? "bg-crimson" : "bg-primary",
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {decodeState === "decoding"
              ? "Decoding real audio waveform samples…"
              : decodeState === "unavailable"
                ? "Browser waveform decode unavailable for this audio; playback scrubbing remains active."
                : "Load an audio track to inspect its real decoded waveform."}
          </p>
        </div>
      )}
    </div>
  );
}

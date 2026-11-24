import { Mic, Pause, Play, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatSecondsClock } from "./studio-types";

export interface VocalRecorderProps {
  disabled?: boolean;
  maxDurationSeconds: number;
  onRecordingComplete: (file: File) => void;
}

const RECORDER_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/wav",
] as const;

function chooseSupportedRecorderMime(): string | undefined {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return undefined;
  }
  for (const mime of RECORDER_MIME_CANDIDATES) {
    if (
      typeof window.MediaRecorder.isTypeSupported === "function" &&
      window.MediaRecorder.isTypeSupported(mime)
    ) {
      return mime;
    }
  }
  return undefined;
}

function resolveExtensionFromMime(mimeType: string): string {
  const base = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (base.includes("mp4") || base.includes("m4a")) return "m4a";
  if (base.includes("aac")) return "aac";
  if (base.includes("ogg")) return "ogg";
  if (base.includes("wav")) return "wav";
  return "webm";
}

export function VocalRecorder({
  disabled = false,
  maxDurationSeconds,
  onRecordingComplete,
}: VocalRecorderProps) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const discardOnStopRef = useRef(false);
  const accumulatedMsRef = useRef(0);
  const lastResumeTimeRef = useRef(0);

  const stopResources = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    const canRecord =
      typeof window !== "undefined" &&
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia) &&
      typeof window.MediaRecorder !== "undefined";
    setSupported(canRecord);

    return () => {
      discardOnStopRef.current = true;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore teardown errors
        }
      }
      stopResources();
    };
  }, [stopResources]);

  const stopRecording = useCallback(
    (discard: boolean = false) => {
      discardOnStopRef.current = discard;
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") {
        try {
          if (rec.state === "recording" && typeof rec.requestData === "function") {
            rec.requestData();
          }
          rec.stop();
        } catch {
          stopResources();
          setRecording(false);
          setIsPaused(false);
        }
      } else {
        stopResources();
        setRecording(false);
        setIsPaused(false);
      }
    },
    [stopResources],
  );

  const pauseRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === "recording" && typeof rec.pause === "function") {
      try {
        rec.pause();
        accumulatedMsRef.current += Date.now() - lastResumeTimeRef.current;
        setIsPaused(true);
      } catch {
        // Fallback if pause is unsupported
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state === "paused" && typeof rec.resume === "function") {
      try {
        rec.resume();
        lastResumeTimeRef.current = Date.now();
        setIsPaused(false);
      } catch {
        // Fallback if resume is unsupported
      }
    }
  }, []);

  const startRecording = async () => {
    if (disabled || !supported) return;
    setErrorMessage(null);
    discardOnStopRef.current = false;
    chunksRef.current = [];
    accumulatedMsRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      const mimeType = chooseSupportedRecorderMime();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };

      recorder.onerror = () => {
        setErrorMessage("Recording stopped unexpectedly due to a browser audio capture error.");
        stopResources();
        setRecording(false);
        setIsPaused(false);
      };

      recorder.onstop = () => {
        const shouldDiscard = discardOnStopRef.current;
        const actualMime = recorder.mimeType || mimeType || "audio/webm";
        const baseMime = actualMime.split(";")[0]?.trim() || "audio/webm";
        const ext = resolveExtensionFromMime(actualMime);
        const chunks = [...chunksRef.current];
        chunksRef.current = [];
        stopResources();
        setRecording(false);
        setIsPaused(false);

        if (shouldDiscard || chunks.length === 0) return;

        const blob = new Blob(chunks, { type: baseMime });
        if (blob.size <= 0) {
          setErrorMessage("No audio data was captured from the microphone.");
          return;
        }
        const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const file = new File([blob], `vocal-take-${stamp}.${ext}`, { type: baseMime });
        onRecordingComplete(file);
      };

      recorder.start(250);
      setElapsedSec(0);
      setRecording(true);
      setIsPaused(false);
      lastResumeTimeRef.current = Date.now();

      timerRef.current = window.setInterval(() => {
        const rec = mediaRecorderRef.current;
        if (!rec || rec.state === "inactive") return;
        if (rec.state === "recording") {
          const totalMs = accumulatedMsRef.current + (Date.now() - lastResumeTimeRef.current);
          const nextSec = Math.floor(totalMs / 1000);
          setElapsedSec(nextSec);
          if (nextSec >= maxDurationSeconds) {
            stopRecording(false);
          }
        }
      }, 250);
    } catch (err) {
      stopResources();
      setRecording(false);
      setIsPaused(false);
      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      ) {
        setErrorMessage(
          "Microphone permission was denied. Allow microphone access or upload an audio/video/MIDI file instead.",
        );
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setErrorMessage("No microphone input device was found on this device.");
      } else {
        setErrorMessage("Could not start microphone recording in this browser.");
      }
    }
  };

  if (!supported) {
    return (
      <div className="rounded-[2px] border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
        Direct browser vocal recording is unavailable in this browser environment. Upload an audio,
        video, or MIDI recording above instead.
      </div>
    );
  }

  return (
    <div className="rounded-[2px] border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-foreground">Record vocal in browser</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Captures raw vocal audio with dynamic browser format negotiation (up to{" "}
            {Math.floor(maxDurationSeconds / 60)} min).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recording ? (
            <>
              <span
                className={`font-mono text-xs font-medium tabular-nums ${isPaused ? "text-amber-500" : "text-crimson-deep"}`}
                aria-live="polite"
              >
                {isPaused ? "PAUSED" : "REC"} {formatSecondsClock(elapsedSec)}
              </span>

              {isPaused ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={resumeRecording}
                  aria-label="Resume recording"
                >
                  <Play className="size-3.5" aria-hidden /> Resume
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={pauseRecording}
                  aria-label="Pause recording"
                >
                  <Pause className="size-3.5" aria-hidden /> Pause
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => stopRecording(false)}
              >
                <Square className="size-3.5" aria-hidden /> Stop &amp; use take
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => stopRecording(true)}
                aria-label="Discard recording"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => void startRecording()}
            >
              <Mic className="size-3.5" aria-hidden /> Record vocal
            </Button>
          )}
        </div>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-3 text-xs text-crimson-deep">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

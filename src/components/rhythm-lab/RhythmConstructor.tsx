import {
  AlertCircle,
  CheckCircle2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Staff, type StaffChord, type StaffDuration } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  scheduleClickTone,
  scheduleRhythmTone,
} from "@/lib/music/rhythm-audio";
import {
  NoteDurationSpec,
  RHYTHM_DURATIONS_CATALOG,
  TIME_SIGNATURES_CATALOG,
  validateMeasure,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

export function RhythmConstructor() {
  const [selectedSignature, setSelectedSignature] = useState<string>("4/4");
  const [placedDurations, setPlacedDurations] = useState<StaffDuration[]>([
    "q",
    "q",
    "8",
    "8",
  ]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const stepTimers = useRef<number[]>([]);

  const validation = useMemo(() => {
    return validateMeasure(placedDurations, selectedSignature);
  }, [placedDurations, selectedSignature]);

  const clearTimers = () => {
    stepTimers.current.forEach((t) => window.clearTimeout(t));
    stepTimers.current = [];
  };

  const stopPlayback = () => {
    clearTimers();
    setIsPlaying(false);
    setActiveStepIndex(null);
  };

  useEffect(() => {
    return stopPlayback;
  }, [placedDurations, selectedSignature]);

  const handleAddDuration = (id: StaffDuration) => {
    stopPlayback();
    setPlacedDurations((prev) => [...prev, id]);
  };

  const handleRemoveLast = () => {
    stopPlayback();
    setPlacedDurations((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    stopPlayback();
    setPlacedDurations([]);
  };

  // Play constructed rhythm
  const playConstructedRhythm = () => {
    stopPlayback();
    if (placedDurations.length === 0) return;

    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setIsPlaying(true);
    const bpm = 100;
    const secondsPerQuarter = 60 / bpm;
    let cumulativeTime = 0;

    placedDurations.forEach((id, idx) => {
      const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === id);
      const durationSec = (spec?.quarterBeats ?? 1) * secondsPerQuarter;

      const timer = window.setTimeout(() => {
        setActiveStepIndex(idx);
      }, cumulativeTime * 1000);
      stepTimers.current.push(timer);

      const now = ctx.currentTime;
      const soundTime = now + cumulativeTime;

      // Play click & tone
      scheduleClickTone(ctx, soundTime, idx === 0 ? "downbeat" : "unaccented", "classic");
      if (!spec?.isRest) {
        scheduleRhythmTone(ctx, soundTime, durationSec * 0.9, 440, idx === 0);
      }

      cumulativeTime += durationSec;
    });

    const endTimer = window.setTimeout(() => {
      setIsPlaying(false);
      setActiveStepIndex(null);
    }, cumulativeTime * 1000 + 60);
    stepTimers.current.push(endTimer);
  };

  const staffChords: StaffChord[] = useMemo(() => {
    return placedDurations.map((id) => {
      const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === id);
      return {
        keys: spec?.isRest ? [] : ["C4"],
        duration: id,
      };
    });
  }, [placedDurations]);

  return (
    <div className="space-y-6">
      {/* Time Signature Toolbar */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Target Time Signature:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TIME_SIGNATURES_CATALOG.map((ts) => (
              <Button
                key={ts.signature}
                type="button"
                variant={selectedSignature === ts.signature ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedSignature(ts.signature);
                  stopPlayback();
                }}
                className={cn(
                  "h-8 text-xs font-mono font-bold px-2.5",
                  selectedSignature === ts.signature &&
                    "bg-crimson text-white hover:bg-crimson/90 border-crimson",
                )}
              >
                {ts.signature}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLast}
            disabled={placedDurations.length === 0}
            className="h-8 text-xs gap-1"
          >
            <Minus className="size-3" />
            <span>Remove Last</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={placedDurations.length === 0}
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            <span>Clear</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={isPlaying ? stopPlayback : playConstructedRhythm}
            disabled={placedDurations.length === 0}
            className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white font-medium px-4 gap-1.5"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5" /> Stop
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Play Measure
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Measure Canvas & Validation Feedback */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <span className="eyebrow text-crimson-deep">Measure Constructor</span>
            <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
              Construct a Measure in {selectedSignature}
            </h3>
          </div>

          {/* Measure Capacity Meter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-foreground">
                {validation.totalQuarterBeats} / {validation.expectedQuarterBeats} Beats
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">
                {validation.percentFilled}% Capacity
              </div>
            </div>
            <div className="w-24 sm:w-32 h-2.5 rounded-full bg-muted overflow-hidden border border-border">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  validation.isComplete
                    ? "bg-emerald-500"
                    : validation.isOverfilled
                      ? "bg-destructive"
                      : "bg-crimson",
                )}
                style={{ width: `${Math.min(100, validation.percentFilled)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Validation Alert */}
        <div
          className={cn(
            "rounded-[2px] border p-3.5 text-xs flex items-center justify-between gap-3",
            validation.isComplete
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
              : validation.isOverfilled
                ? "border-destructive/40 bg-destructive/10 text-destructive-foreground dark:text-red-200"
                : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
          )}
        >
          <div className="flex items-center gap-2">
            {validation.isComplete ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-crimson shrink-0" />
            )}
            <span className="font-medium">{validation.statusMessage}</span>
          </div>
          {validation.isUnderfilled && (
            <span className="font-mono text-[11px] font-bold">
              Remaining: {validation.remainingQuarterBeats} beat(s)
            </span>
          )}
        </div>

        {/* VexFlow Staff Rendering */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded border border-border flex flex-col items-center justify-center min-h-[160px]">
          {placedDurations.length > 0 ? (
            <Staff
              chords={staffChords}
              timeSignature={selectedSignature}
              clef="treble"
              selectedIndex={activeStepIndex}
              height={140}
              label={`Constructed measure in ${selectedSignature}`}
            />
          ) : (
            <div className="text-muted-foreground text-xs italic">
              Measure is currently empty. Click on the note or rest palettes below to insert rhythmic values.
            </div>
          )}
        </div>

        {/* Placed Elements Sequence */}
        {placedDurations.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {placedDurations.map((id, i) => {
              const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === id);
              const isCurrent = activeStepIndex === i;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2 rounded border px-2.5 py-1 text-xs font-mono transition-all",
                    isCurrent
                      ? "border-crimson bg-crimson/15 text-foreground ring-2 ring-crimson font-bold"
                      : "border-border bg-muted/20 text-muted-foreground",
                  )}
                >
                  <span className="text-sm">{spec?.symbolGlyph}</span>
                  <span>{spec?.nameUs}</span>
                  <span className="opacity-60">({spec?.quarterBeats}b)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note & Rest Palettes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Note Palette */}
        <div className="rounded-[2px] border border-border bg-paper p-5 space-y-3">
          <span className="eyebrow text-foreground block">Note Palette (Pitched Sounds):</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RHYTHM_DURATIONS_CATALOG.filter((d) => !d.isRest).map((note) => (
              <Button
                key={note.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddDuration(note.id)}
                className="h-14 flex flex-col items-center justify-center p-1 hover:border-crimson hover:bg-crimson/5"
              >
                <span className="text-xl font-bold font-mono">{note.symbolGlyph}</span>
                <span className="text-[10px] text-muted-foreground">{note.nameUs}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Rest Palette */}
        <div className="rounded-[2px] border border-border bg-paper p-5 space-y-3">
          <span className="eyebrow text-foreground block">Rest Palette (Silences):</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RHYTHM_DURATIONS_CATALOG.filter((d) => d.isRest).map((rest) => (
              <Button
                key={rest.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddDuration(rest.id)}
                className="h-14 flex flex-col items-center justify-center p-1 hover:border-crimson hover:bg-crimson/5"
              >
                <span className="text-xl font-bold font-mono">{rest.symbolGlyph}</span>
                <span className="text-[10px] text-muted-foreground">{rest.nameUs}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

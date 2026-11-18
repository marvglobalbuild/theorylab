import {
  Activity,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  scheduleClickTone,
} from "@/lib/music/rhythm-audio";
import {
  TIME_SIGNATURES_CATALOG,
  type TimeSignatureInfo,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

export function BeatVisualizer() {
  const [selectedSignature, setSelectedSignature] = useState<string>("4/4");
  const [tempoBpm, setTempoBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [enableSubdivisions, setEnableSubdivisions] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);

  const tsInfo: TimeSignatureInfo = useMemo(() => {
    return (
      TIME_SIGNATURES_CATALOG.find((t) => t.signature === selectedSignature) ??
      TIME_SIGNATURES_CATALOG[2]!
    );
  }, [selectedSignature]);

  const stopVisualizer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    return stopVisualizer;
  }, [selectedSignature, tempoBpm]);

  const startVisualizer = () => {
    stopVisualizer();
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setIsPlaying(true);
    let step = 0;
    const totalSteps = tsInfo.countingSyllables.length;

    // Time per subdivision step
    const secondsPerQuarter = 60 / tempoBpm;
    const stepDuration =
      tsInfo.meterType === "compound"
        ? secondsPerQuarter / 2
        : secondsPerQuarter / (tsInfo.denominator / 4);

    const tick = () => {
      const now = ctx.currentTime;
      setCurrentStepIndex(step);

      const accent = tsInfo.accents[step] ?? "weak";
      if (accent === "strong") {
        scheduleClickTone(ctx, now, "downbeat");
      } else if (accent === "medium") {
        scheduleClickTone(ctx, now, "secondary");
      } else if (enableSubdivisions) {
        scheduleClickTone(ctx, now, "subdivision");
      }

      step = (step + 1) % totalSteps;
      timerRef.current = window.setTimeout(tick, stepDuration * 1000);
    };

    tick();
  };

  const changeTempo = (delta: number) => {
    setTempoBpm((prev) => Math.min(240, Math.max(40, prev + delta)));
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar: Time Signature & Tempo */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        {/* Time Signature Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Meter:
          </span>
          {TIME_SIGNATURES_CATALOG.map((ts) => (
            <Button
              key={ts.signature}
              type="button"
              variant={ts.signature === selectedSignature ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedSignature(ts.signature);
                stopVisualizer();
              }}
              className="h-8 font-mono text-xs px-2.5 font-semibold"
            >
              {ts.signature}
            </Button>
          ))}
        </div>

        {/* Tempo Adjuster */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => changeTempo(-5)}
              className="size-7"
              aria-label="Decrease tempo"
            >
              <Minus className="size-3" />
            </Button>
            <div className="min-w-20 text-center font-mono">
              <span className="text-sm font-bold text-foreground">{tempoBpm}</span>
              <span className="text-[10px] text-muted-foreground ml-1">BPM</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => changeTempo(+5)}
              className="size-7"
              aria-label="Increase tempo"
            >
              <Plus className="size-3" />
            </Button>
          </div>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={isPlaying ? stopVisualizer : startVisualizer}
            className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white gap-1.5 font-medium px-4"
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5" /> Pause Pulse
              </>
            ) : (
              <>
                <Play className="size-3.5" /> Start Visualizer
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Animated Beat Visualizer Stage */}
      <div className="rounded-[2px] border border-border bg-paper p-8 space-y-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center space-y-1">
          <span className="eyebrow text-crimson-deep">
            {tsInfo.meterType} {tsInfo.grouping} Metric Canvas
          </span>
          <h3 className="font-display text-3xl font-bold text-foreground">
            {selectedSignature} Time · {tempoBpm} BPM
          </h3>
          <p className="text-xs text-muted-foreground">
            {tsInfo.macroBeatsPerMeasure} macro-pulses · Subdivided in {tsInfo.subdivisionCountPerBeat}s ({tsInfo.beatUnitName})
          </p>
        </div>

        {/* Pulsing Dynamic Beat Nodes */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl w-full">
          {tsInfo.countingSyllables.map((syl, i) => {
            const isCurrent = isPlaying && currentStepIndex === i;
            const accent = tsInfo.accents[i] ?? "weak";

            let nodeClass = "border-border bg-muted/20 text-muted-foreground";
            let scaleClass = "scale-95 opacity-70";

            if (accent === "strong") {
              nodeClass = "border-crimson/50 bg-crimson/10 text-crimson";
              scaleClass = "scale-100 opacity-90";
            } else if (accent === "medium") {
              nodeClass = "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400";
              scaleClass = "scale-98 opacity-85";
            }

            if (isCurrent) {
              if (accent === "strong") {
                nodeClass = "border-crimson bg-crimson text-white ring-4 ring-crimson/30 shadow-lg";
                scaleClass = "scale-115 opacity-100 z-10";
              } else if (accent === "medium") {
                nodeClass = "border-amber-500 bg-amber-500 text-white ring-4 ring-amber-500/30 shadow-md";
                scaleClass = "scale-110 opacity-100 z-10";
              } else {
                nodeClass = "border-foreground bg-foreground text-background ring-2 ring-foreground/20";
                scaleClass = "scale-105 opacity-100 z-10";
              }
            }

            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center justify-center rounded-[4px] border transition-all duration-100",
                  "size-16 sm:size-20 select-none",
                  nodeClass,
                  scaleClass,
                )}
              >
                <span className="font-display text-2xl font-bold font-mono">{syl}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider mt-0.5">
                  {accent}
                </span>
              </div>
            );
          })}
        </div>

        {/* Subdivisions & Metronome Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Subdivision clicks:</span>
            <Button
              type="button"
              variant={enableSubdivisions ? "default" : "outline"}
              size="sm"
              onClick={() => setEnableSubdivisions(!enableSubdivisions)}
              className="h-7 text-xs"
            >
              {enableSubdivisions ? "Enabled" : "Muted (Beats Only)"}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-crimson"></span> Downbeat (Strong)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500"></span> Secondary (Medium)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground"></span> Sub-pulse (Weak)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

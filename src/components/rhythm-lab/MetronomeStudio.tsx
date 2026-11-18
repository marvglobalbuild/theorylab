import {
  Bell,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sliders,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ClickSoundType,
  getRhythmAudioContext,
  scheduleClickTone,
} from "@/lib/music/rhythm-audio";
import {
  TIME_SIGNATURES_CATALOG,
  type TimeSignatureInfo,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

const TEMPO_PRESETS = [
  { name: "Largo", bpm: 50 },
  { name: "Adagio", bpm: 66 },
  { name: "Andante", bpm: 76 },
  { name: "Moderato", bpm: 108 },
  { name: "Allegro", bpm: 132 },
  { name: "Presto", bpm: 168 },
];

export function MetronomeStudio() {
  const [tempoBpm, setTempoBpm] = useState<number>(100);
  const [selectedSignature, setSelectedSignature] = useState<string>("4/4");
  const [subdivisionMode, setSubdivisionMode] = useState<"none" | "eighths" | "triplets" | "sixteenths">("none");
  const [soundType, setSoundType] = useState<ClickSoundType>("classic");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);

  const tapTimesRef = useRef<number[]>([]);
  const timerRef = useRef<number | null>(null);

  const tsInfo: TimeSignatureInfo = useMemo(() => {
    return (
      TIME_SIGNATURES_CATALOG.find((t) => t.signature === selectedSignature) ??
      TIME_SIGNATURES_CATALOG[2]!
    );
  }, [selectedSignature]);

  const stopMetronome = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeatIndex(0);
  };

  useEffect(() => {
    return stopMetronome;
  }, [selectedSignature, tempoBpm, subdivisionMode, soundType]);

  const startMetronome = () => {
    stopMetronome();
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setIsPlaying(true);
    let beatStep = 0;
    const macroBeats = tsInfo.macroBeatsPerMeasure;
    const subCount =
      subdivisionMode === "sixteenths"
        ? 4
        : subdivisionMode === "triplets"
          ? 3
          : subdivisionMode === "eighths"
            ? 2
            : 1;

    const totalSteps = macroBeats * subCount;
    const secondsPerMacro = 60 / tempoBpm;
    const stepDuration = secondsPerMacro / subCount;

    const tick = () => {
      const now = ctx.currentTime;
      const currentMacro = Math.floor(beatStep / subCount);
      const isSubTick = beatStep % subCount !== 0;

      setCurrentBeatIndex(beatStep);

      if (isSubTick) {
        scheduleClickTone(ctx, now, "subdivision", soundType);
      } else {
        const isDownbeat = currentMacro === 0;
        const isSecondary = currentMacro === 2 && macroBeats === 4;

        if (isDownbeat) {
          scheduleClickTone(ctx, now, "downbeat", soundType);
        } else if (isSecondary) {
          scheduleClickTone(ctx, now, "secondary", soundType);
        } else {
          scheduleClickTone(ctx, now, "unaccented", soundType);
        }
      }

      beatStep = (beatStep + 1) % totalSteps;
      timerRef.current = window.setTimeout(tick, stepDuration * 1000);
    };

    tick();
  };

  // Tap Tempo calculation
  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was more than 2 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1]! > 2000) {
      tapTimesRef.current = [];
    }

    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift();
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i]! - tapTimesRef.current[i - 1]!);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setTempoBpm(calculatedBpm);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Controls */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <span className="eyebrow text-crimson-deep">Audio Metronome</span>
            <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
              Precision Acoustic & Digital Metronome
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTapTempo}
              className="h-8 text-xs font-semibold px-3 border-foreground/30 hover:bg-muted"
            >
              Tap Tempo
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={isPlaying ? stopMetronome : startMetronome}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white font-medium px-5 gap-1.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="size-3.5" /> Stop Metronome
                </>
              ) : (
                <>
                  <Play className="size-3.5" /> Start Metronome
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Big Tempo Display & Slider */}
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="text-center">
            <span className="font-display text-6xl font-extrabold text-foreground font-mono">
              {tempoBpm}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider block font-semibold">
              Beats Per Minute (BPM)
            </span>
          </div>

          {/* Slider and - / + */}
          <div className="flex items-center gap-4 max-w-md w-full">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setTempoBpm((b) => Math.max(40, b - 1))}
              className="size-8"
              aria-label="Decrease tempo"
            >
              <Minus className="size-3.5" />
            </Button>

            <input
              type="range"
              min={40}
              max={240}
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              className="flex-1 accent-crimson cursor-pointer"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setTempoBpm((b) => Math.min(240, b + 1))}
              className="size-8"
              aria-label="Increase tempo"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          {/* Classical Tempo Presets */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {TEMPO_PRESETS.map((p) => (
              <Button
                key={p.name}
                type="button"
                variant={tempoBpm === p.bpm ? "default" : "outline"}
                size="sm"
                onClick={() => setTempoBpm(p.bpm)}
                className="h-7 text-xs font-mono"
              >
                {p.name} ({p.bpm})
              </Button>
            ))}
          </div>
        </div>

        {/* Visual Flashing Beat Indicator */}
        <div className="flex items-center justify-center gap-4 py-4 border-t border-b border-border/60">
          {Array.from({ length: tsInfo.macroBeatsPerMeasure }).map((_, mIdx) => {
            const subCount =
              subdivisionMode === "sixteenths"
                ? 4
                : subdivisionMode === "triplets"
                  ? 3
                  : subdivisionMode === "eighths"
                    ? 2
                    : 1;

            const isCurrentMacro =
              isPlaying && Math.floor(currentBeatIndex / subCount) === mIdx;

            const isDownbeat = mIdx === 0;

            return (
              <div
                key={mIdx}
                className={cn(
                  "size-12 sm:size-14 rounded-full border-2 flex items-center justify-center font-mono font-bold text-lg transition-all duration-75",
                  isCurrentMacro
                    ? isDownbeat
                      ? "bg-crimson border-crimson text-white scale-110 shadow-lg ring-4 ring-crimson/30"
                      : "bg-amber-500 border-amber-500 text-white scale-105 shadow-md"
                    : isDownbeat
                      ? "border-crimson/60 bg-crimson/10 text-crimson"
                      : "border-border bg-muted/20 text-muted-foreground",
                )}
              >
                {mIdx + 1}
              </div>
            );
          })}
        </div>

        {/* Customization Options Grid: Meter, Subdivisions, Sound */}
        <div className="grid gap-4 sm:grid-cols-3 text-xs">
          {/* Meter Selection */}
          <div className="rounded border border-border bg-muted/20 p-3.5 space-y-2">
            <span className="font-semibold text-foreground block">Time Signature:</span>
            <div className="grid grid-cols-4 gap-1">
              {["2/4", "3/4", "4/4", "6/8"].map((sig) => (
                <Button
                  key={sig}
                  type="button"
                  variant={selectedSignature === sig ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSignature(sig)}
                  className="h-7 text-xs font-mono font-bold"
                >
                  {sig}
                </Button>
              ))}
            </div>
          </div>

          {/* Subdivisions */}
          <div className="rounded border border-border bg-muted/20 p-3.5 space-y-2">
            <span className="font-semibold text-foreground block">Subdivisions:</span>
            <div className="grid grid-cols-2 gap-1">
              <Button
                type="button"
                variant={subdivisionMode === "none" ? "default" : "outline"}
                size="sm"
                onClick={() => setSubdivisionMode("none")}
                className="h-7 text-xs"
              >
                None
              </Button>
              <Button
                type="button"
                variant={subdivisionMode === "eighths" ? "default" : "outline"}
                size="sm"
                onClick={() => setSubdivisionMode("eighths")}
                className="h-7 text-xs"
              >
                Eighths
              </Button>
              <Button
                type="button"
                variant={subdivisionMode === "triplets" ? "default" : "outline"}
                size="sm"
                onClick={() => setSubdivisionMode("triplets")}
                className="h-7 text-xs"
              >
                Triplets
              </Button>
              <Button
                type="button"
                variant={subdivisionMode === "sixteenths" ? "default" : "outline"}
                size="sm"
                onClick={() => setSubdivisionMode("sixteenths")}
                className="h-7 text-xs"
              >
                Sixteenths
              </Button>
            </div>
          </div>

          {/* Sound Choice */}
          <div className="rounded border border-border bg-muted/20 p-3.5 space-y-2">
            <span className="font-semibold text-foreground block">Audible Tone:</span>
            <div className="grid grid-cols-2 gap-1">
              <Button
                type="button"
                variant={soundType === "classic" ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundType("classic")}
                className="h-7 text-xs"
              >
                Classic Click
              </Button>
              <Button
                type="button"
                variant={soundType === "woodblock" ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundType("woodblock")}
                className="h-7 text-xs"
              >
                Woodblock
              </Button>
              <Button
                type="button"
                variant={soundType === "digital" ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundType("digital")}
                className="h-7 text-xs"
              >
                Digital Beep
              </Button>
              <Button
                type="button"
                variant={soundType === "piano" ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundType("piano")}
                className="h-7 text-xs"
              >
                Piano Pitch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

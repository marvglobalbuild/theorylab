import {
  Clock,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  scheduleClickTone,
  scheduleRhythmTone,
} from "@/lib/music/rhythm-audio";
import {
  RHYTHM_DURATIONS_CATALOG,
  RHYTHM_PATTERN_PRESETS,
  type RhythmicPatternPreset,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

export function RhythmPlaybackView() {
  const [activePresetId, setActivePresetId] = useState<string>("common-basic-quarter");
  const [tempoBpm, setTempoBpm] = useState<number>(100);
  const [isCountInEnabled, setIsCountInEnabled] = useState<boolean>(true);
  const [isMetronomeEnabled, setIsMetronomeEnabled] = useState<boolean>(true);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [countInBeat, setCountInBeat] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const stepTimeouts = useRef<number[]>([]);

  const preset: RhythmicPatternPreset = useMemo(() => {
    return (
      RHYTHM_PATTERN_PRESETS.find((p) => p.id === activePresetId) ??
      RHYTHM_PATTERN_PRESETS[0]!
    );
  }, [activePresetId]);

  // Sync preset tempo when selecting a new preset
  useEffect(() => {
    setTempoBpm(preset.tempoBpm);
    stopPlayback();
  }, [preset]);

  const clearAllTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    stepTimeouts.current.forEach((t) => window.clearTimeout(t));
    stepTimeouts.current = [];
  };

  const stopPlayback = () => {
    clearAllTimers();
    setIsPlaying(false);
    setActiveElementIndex(null);
    setCountInBeat(null);
  };

  useEffect(() => {
    return stopPlayback;
  }, []);

  const startPlayback = () => {
    stopPlayback();
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setIsPlaying(true);
    const secondsPerQuarter = 60 / tempoBpm;

    // Determine count-in steps (4 beats for 4/4, 3 for 3/4, 2 for 2/4 or 6/8)
    const countInBeats = preset.timeSignature.startsWith("3") ? 3 : preset.timeSignature.startsWith("2") ? 2 : 4;
    let countStep = 0;

    const runPattern = () => {
      setCountInBeat(null);
      let cumulativeTime = 0;

      preset.elements.forEach((el, idx) => {
        const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === el.duration);
        const durationSec = (spec?.quarterBeats ?? 1) * secondsPerQuarter;

        // Schedule visual highlight
        const highlightTimer = window.setTimeout(() => {
          setActiveElementIndex(idx);
        }, cumulativeTime * 1000);
        stepTimeouts.current.push(highlightTimer);

        // Schedule audio
        const now = ctx.currentTime;
        const soundTime = now + cumulativeTime;

        if (isMetronomeEnabled) {
          scheduleClickTone(ctx, soundTime, el.isAccented ? "downbeat" : "unaccented", "classic");
        }

        if (!spec?.isRest && el.pitch) {
          scheduleRhythmTone(ctx, soundTime, durationSec * 0.9, 440, el.isAccented);
        }

        cumulativeTime += durationSec;
      });

      // End of playback
      const finishTimer = window.setTimeout(() => {
        setIsPlaying(false);
        setActiveElementIndex(null);
      }, cumulativeTime * 1000 + 50);
      stepTimeouts.current.push(finishTimer);
    };

    if (isCountInEnabled) {
      const runCountIn = () => {
        if (countStep >= countInBeats) {
          runPattern();
          return;
        }

        setCountInBeat(countStep + 1);
        const now = ctx.currentTime;
        scheduleClickTone(ctx, now, countStep === 0 ? "downbeat" : "unaccented", "woodblock");

        countStep++;
        timerRef.current = window.setTimeout(runCountIn, secondsPerQuarter * 1000);
      };
      runCountIn();
    } else {
      runPattern();
    }
  };

  const staffChords: StaffChord[] = useMemo(() => {
    return preset.elements.map((el) => ({
      keys: el.pitch ? [el.pitch] : [],
      duration: el.duration,
    }));
  }, [preset]);

  return (
    <div className="space-y-6">
      {/* Preset Selector Ribbon */}
      <div className="rounded-[2px] border border-border bg-paper p-5 space-y-3">
        <span className="eyebrow text-muted-foreground block mb-2">
          Select Classical Rhythmic Pattern:
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {RHYTHM_PATTERN_PRESETS.map((p) => {
            const isSelected = p.id === activePresetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePresetId(p.id)}
                className={cn(
                  "flex flex-col text-left rounded-[2px] border p-3 transition-colors cursor-pointer",
                  isSelected
                    ? "border-crimson bg-crimson/5 text-foreground shadow-sm ring-1 ring-crimson"
                    : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-crimson-deep">
                    {p.timeSignature}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">
                    {p.genreCategory}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                  {p.title}
                </h4>
                <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                  {p.tempoBpm} BPM
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Pattern Playback Canvas */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-crimson-deep">{preset.title}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">
                {preset.timeSignature} Meter · {preset.elements.length} Elements
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">{preset.description}</p>
          </div>

          {/* Playback Controls & Tempo */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Tempo Dial */}
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setTempoBpm((b) => Math.max(40, b - 4))}
                className="size-7"
                aria-label="Decrease tempo"
              >
                <Minus className="size-3" />
              </Button>
              <div className="min-w-16 text-center font-mono text-xs font-bold">
                {tempoBpm} BPM
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setTempoBpm((b) => Math.min(240, b + 4))}
                className="size-7"
                aria-label="Increase tempo"
              >
                <Plus className="size-3" />
              </Button>
            </div>

            {/* Play Button */}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={isPlaying ? stopPlayback : startPlayback}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white font-medium px-4 gap-1.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="size-3.5" /> Stop Pattern
                </>
              ) : (
                <>
                  <Play className="size-3.5" /> Play Written Pattern
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Count-In Banner if counting down */}
        {countInBeat !== null && (
          <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 flex items-center justify-center gap-2 font-mono text-amber-700 dark:text-amber-400 font-bold text-sm animate-pulse">
            <Clock className="size-4" />
            <span>Count-In: Beat {countInBeat} ...</span>
          </div>
        )}

        {/* VexFlow Engraving */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded border border-border flex flex-col items-center justify-center">
          <Staff
            chords={staffChords}
            clef="treble"
            timeSignature={preset.timeSignature}
            selectedIndex={activeElementIndex}
            height={150}
            label={`Musical staff displaying ${preset.title}`}
          />
        </div>

        {/* Step Timeline Cards with Synchronized Playhead */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
          {preset.elements.map((el, i) => {
            const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === el.duration);
            const isCurrent = activeElementIndex === i;

            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col justify-between rounded-[2px] border p-3 transition-all duration-150",
                  isCurrent
                    ? "border-crimson bg-crimson/15 shadow-md scale-102 ring-2 ring-crimson"
                    : "border-border/80 bg-card",
                )}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Step {i + 1}</span>
                  {el.isAccented && (
                    <span className="text-crimson font-bold uppercase text-[9px]">Accent</span>
                  )}
                </div>

                <div className="text-center my-2 font-mono text-2xl font-bold text-foreground">
                  {spec?.symbolGlyph}
                </div>

                <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground flex justify-between">
                  <span>{spec?.nameUs}</span>
                  <span className="font-bold text-foreground">{spec?.quarterBeats}b</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Playback Settings Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCountInEnabled}
                onChange={(e) => setIsCountInEnabled(e.target.checked)}
                className="rounded border-border text-crimson focus:ring-crimson"
              />
              <span className="text-foreground">1-Measure Count-In</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isMetronomeEnabled}
                onChange={(e) => setIsMetronomeEnabled(e.target.checked)}
                className="rounded border-border text-crimson focus:ring-crimson"
              />
              <span className="text-foreground">Audible Metronome Click</span>
            </label>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Sample-accurate Web Audio synchronization active.
          </div>
        </div>
      </div>
    </div>
  );
}

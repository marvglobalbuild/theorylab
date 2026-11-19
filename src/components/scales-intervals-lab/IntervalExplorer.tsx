import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Layers,
  Music,
  RotateCcw,
  Sparkles,
  Volume2,
  Waves,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import { Button } from "@/components/ui/button";
import {
  calculateIntervalPitch,
  INTERVALS_CATALOG,
  IntervalDirection,
  IntervalModel,
} from "@/lib/music/scales-intervals-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const ROOT_OPTIONS = ["C4", "D4", "Eb4", "F4", "G4", "A4", "Bb3"];

export function IntervalExplorer() {
  const piano = usePiano();

  const [selectedRoot, setSelectedRoot] = useState<string>("C4");
  const [selectedIntervalId, setSelectedIntervalId] = useState<string>("P5");
  const [direction, setDirection] = useState<IntervalDirection>("ascending");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentInterval = useMemo(() => {
    return (
      INTERVALS_CATALOG.find((i) => i.id === selectedIntervalId) ?? INTERVALS_CATALOG[7]!
    );
  }, [selectedIntervalId]);

  const calculated = useMemo(() => {
    return calculateIntervalPitch(selectedRoot, currentInterval, direction);
  }, [selectedRoot, currentInterval, direction]);

  const highlightedNotes = useMemo(() => {
    return new Set([calculated.baseNote, calculated.targetNote]);
  }, [calculated.baseNote, calculated.targetNote]);

  // Audio Playback
  const playIntervalAudio = useCallback(
    (style: "melodic" | "harmonic") => {
      setIsPlaying(true);

      if (style === "harmonic") {
        piano.playPhrase(
          [
            {
              notes: [calculated.baseNote, calculated.targetNote],
              at: 0,
              duration: 1.6,
            },
          ],
          () => setIsPlaying(false),
        );
      } else {
        // Melodic playback respecting direction
        const first = calculated.baseNote;
        const second = calculated.targetNote;
        piano.playPhrase(
          [
            { notes: [first], at: 0, duration: 0.8 },
            { notes: [second], at: 0.85, duration: 1.1 },
          ],
          () => setIsPlaying(false),
        );
      }
    },
    [calculated, piano],
  );

  return (
    <div className="space-y-6">
      {/* Top Controls: Root & Direction */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Starting Pitch:
            </span>
            <div className="flex flex-wrap gap-1">
              {ROOT_OPTIONS.map((root) => (
                <button
                  key={root}
                  onClick={() => setSelectedRoot(root)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded border transition-colors font-mono font-semibold",
                    selectedRoot === root
                      ? "bg-crimson-deep text-white border-crimson-deep shadow-sm"
                      : "border-border/60 hover:bg-paper text-foreground",
                  )}
                >
                  {displayNote(root)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Playback Direction:
            </span>
            <div className="flex gap-1">
              <Button
                variant={direction === "ascending" ? "default" : "outline"}
                size="sm"
                onClick={() => setDirection("ascending")}
                className="h-7 text-xs"
              >
                <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                Ascending
              </Button>
              <Button
                variant={direction === "descending" ? "default" : "outline"}
                size="sm"
                onClick={() => setDirection("descending")}
                className="h-7 text-xs"
              >
                <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
                Descending
              </Button>
            </div>
          </div>
        </div>

        {/* Audio Audition Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => playIntervalAudio("melodic")}
            disabled={isPlaying}
            className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[130px]"
          >
            <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
            Play Melodic
          </Button>
          <Button
            variant="outline"
            onClick={() => playIntervalAudio("harmonic")}
            disabled={isPlaying}
            className="text-xs"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Play Harmonic
          </Button>
        </div>
      </div>

      {/* 17 Intervals Catalog Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Select an Interval:</span>
          <span>13 Simple Intervals (0–12 st) + 4 Compound Intervals (&gt;12 st)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {INTERVALS_CATALOG.map((item) => {
            const isSelected = selectedIntervalId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedIntervalId(item.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all space-y-1 shadow-sm",
                  isSelected
                    ? "border-crimson-deep bg-crimson-deep/10 shadow ring-1 ring-crimson-deep font-semibold"
                    : "border-border/60 bg-card hover:border-crimson-deep/40 hover:bg-paper/60",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                  <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-paper rounded border border-border/50 text-crimson-deep">
                    {item.shortName}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                  <span>{item.semitones} st</span>
                  <span>{item.isCompound ? "Compound" : item.quality}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interval Profile and Theoretical Analysis */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
              Acoustic Profile & Inversion
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
              {currentInterval.name} ({currentInterval.shortName})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono px-2.5 py-1 rounded bg-paper border border-border/60">
              Span: {currentInterval.semitones} semitone{currentInterval.semitones !== 1 ? "s" : ""}
            </span>
            <span className="font-mono px-2.5 py-1 rounded bg-paper border border-border/60">
              Ratio: {currentInterval.frequencyRatio}
            </span>
            <span
              className={cn(
                "px-2.5 py-1 rounded capitalize font-medium",
                currentInterval.consonanceType === "perfect-consonance"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : currentInterval.consonanceType === "imperfect-consonance"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
              )}
            >
              {currentInterval.consonanceType.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Realization & Spelling Explanation */}
        <div className="p-4 bg-paper/60 rounded-xl border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="text-crimson-deep">Base Pitch:</span>
              <span className="font-mono">{displayNote(calculated.baseNote)}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-crimson-deep">Theoretical Target:</span>
              <span className="font-mono font-bold text-base">
                {displayNote(calculated.targetNote)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{calculated.spellingExplanation}</p>
          </div>

          {/* Inversion rule if simple interval */}
          {currentInterval.inversionName && (
            <div className="p-3 bg-card rounded-lg border border-border/60 text-xs shrink-0 max-w-sm space-y-1">
              <div className="font-semibold text-foreground flex items-center justify-between">
                <span>Inversion: {currentInterval.inversionName}</span>
                <span className="font-mono text-crimson-deep">
                  {currentInterval.inversionShortName}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                When inverted, the intervals sum to 9 ($
                {currentInterval.genericNumber} +{" "}
                {9 - currentInterval.genericNumber} = 9$), and their semitones sum to 12 ($
                {currentInterval.semitones} + {currentInterval.inversionSemitones} = 12$).
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {currentInterval.description}
        </p>

        {/* Interactive Piano Visualization */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Interval Visualized on Keyboard:
            </span>
            <span>
              Pitches: {displayNote(calculated.baseNote)} and {displayNote(calculated.targetNote)}
            </span>
          </div>

          <div className="rounded-lg border border-border/70 p-3 bg-card/70 overflow-x-auto">
            <VirtualPiano
              startOctave={3}
              numOctaves={3}
              highlightNotes={highlightedNotes}
              showLabels="all"
              showShortcuts={false}
              onNotePlay={(note) => {
                piano.playPhrase([{ notes: [note], at: 0, duration: 0.8 }]);
              }}
              className="max-w-3xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

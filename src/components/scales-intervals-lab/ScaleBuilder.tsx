import {
  CheckCircle2,
  Delete,
  HelpCircle,
  Lightbulb,
  Piano as PianoIcon,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import { Button } from "@/components/ui/button";
import {
  realizeScale,
  SCALES_CATALOG,
  ScaleDefinition,
  validateScaleBuildStep,
} from "@/lib/music/scales-intervals-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const TONIC_OPTIONS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb"];

export function ScaleBuilder() {
  const piano = usePiano();

  const [selectedTonic, setSelectedTonic] = useState<string>("C");
  const [selectedScaleId, setSelectedScaleId] = useState<string>("major");

  // User entered notes
  const [enteredNotes, setEnteredNotes] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  const [isPlayingFullScale, setIsPlayingFullScale] = useState<boolean>(false);

  const realizedTarget = useMemo(() => {
    return realizeScale(selectedTonic, selectedScaleId, 4);
  }, [selectedTonic, selectedScaleId]);

  const targetNotes = realizedTarget.notes;
  const isComplete = enteredNotes.length === targetNotes.length;

  // Highlights on virtual keyboard
  const highlightedNotes = useMemo(() => {
    return new Set(enteredNotes);
  }, [enteredNotes]);

  // Handle note entry from piano or button
  const handleNoteEnter = useCallback(
    (note: string) => {
      if (isComplete) return;

      const nextExpectedIdx = enteredNotes.length;
      const expectedNote = targetNotes[nextExpectedIdx]!;

      // Validate note
      const validation = validateScaleBuildStep(targetNotes, [...enteredNotes, note]);

      if (validation.isCorrect) {
        // Play note briefly
        piano.playPhrase([{ notes: [note], at: 0, duration: 0.6 }]);
        setEnteredNotes((prev) => [...prev, note]);
        setFeedback({
          isCorrect: true,
          message: validation.message,
        });

        // If completed by this note, play full celebratory scale after brief pause
        if (nextExpectedIdx + 1 === targetNotes.length) {
          setTimeout(() => {
            const steps = targetNotes.map((n, idx) => ({
              notes: [n],
              at: idx * 0.35,
              duration: 0.32,
            }));
            piano.playPhrase(steps);
          }, 600);
        }
      } else {
        // Sound incorrect buzz / warning pitch
        piano.playPhrase([{ notes: [note], at: 0, duration: 0.4 }]);
        setFeedback({
          isCorrect: false,
          message: validation.message,
        });
      }
    },
    [isComplete, enteredNotes, targetNotes, piano],
  );

  // Reset
  const handleReset = () => {
    setEnteredNotes([]);
    setFeedback(null);
  };

  // Backspace last note
  const handleBackspace = () => {
    if (enteredNotes.length === 0) return;
    setEnteredNotes((prev) => prev.slice(0, -1));
    setFeedback(null);
  };

  // Play entire built scale
  const playBuiltScale = () => {
    if (enteredNotes.length === 0) return;
    setIsPlayingFullScale(true);
    const steps = enteredNotes.map((note, idx) => ({
      notes: [note],
      at: idx * 0.4,
      duration: 0.38,
    }));
    piano.playPhrase(steps, () => setIsPlayingFullScale(false));
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Tonic & Scale Type */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Select Tonic:
            </span>
            <div className="flex flex-wrap gap-1">
              {TONIC_OPTIONS.map((tonic) => (
                <button
                  key={tonic}
                  onClick={() => {
                    setSelectedTonic(tonic);
                    handleReset();
                  }}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded border transition-colors font-mono font-semibold",
                    selectedTonic === tonic
                      ? "bg-crimson-deep text-white border-crimson-deep shadow-sm"
                      : "border-border/60 hover:bg-paper text-foreground",
                  )}
                >
                  {displayNote(tonic)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">
              Select Scale Type:
            </span>
            <select
              value={selectedScaleId}
              onChange={(e) => {
                setSelectedScaleId(e.target.value);
                handleReset();
              }}
              className="text-xs bg-paper border border-border/70 rounded-md px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-crimson-deep"
            >
              {SCALES_CATALOG.map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.name} ({scale.stepFormula})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enteredNotes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={playBuiltScale}
              disabled={isPlayingFullScale}
              className="text-xs"
            >
              <Volume2 className={cn("mr-1.5 h-3.5 w-3.5", isPlayingFullScale && "animate-pulse")} />
              Audition Scale
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Construction
          </Button>
        </div>
      </div>

      {/* Main Builder Board */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                Active Construction Task
              </span>
              <h3 className="font-display text-xl font-bold text-foreground mt-0.5">
                Construct {displayNote(selectedTonic)} {realizedTarget.scale.name}
              </h3>
            </div>

            <span className="text-xs font-mono px-3 py-1 bg-paper rounded border border-border/60">
              Formula: {realizedTarget.formula}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Build the scale degree-by-degree by clicking keys on the virtual keyboard below. Observe
            the step intervals (+W = whole step, +H = half step).
          </p>
        </div>

        {/* Step Slots Grid */}
        <div className="p-4 bg-paper/60 rounded-xl border border-border/60 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Progress:{" "}
              <strong>
                {enteredNotes.length} / {targetNotes.length} Notes Placed
              </strong>
            </span>
            {enteredNotes.length > 0 && !isComplete && (
              <button
                onClick={handleBackspace}
                className="text-xs text-muted-foreground hover:text-crimson-deep flex items-center gap-1"
              >
                <Delete className="h-3 w-3" /> Backspace
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {targetNotes.map((target, idx) => {
              const entered = enteredNotes[idx];
              const isCurrent = idx === enteredNotes.length;
              const degreeName = realizedTarget.intervalNames[idx] ?? `${idx + 1}`;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-16 rounded-lg border text-sm transition-all shadow-sm",
                    entered
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold"
                      : isCurrent
                        ? "border-crimson-deep border-dashed bg-crimson-deep/5 text-crimson-deep ring-2 ring-crimson-deep/30 font-semibold"
                        : "border-border/70 border-dashed bg-card/40 text-muted-foreground/60",
                  )}
                >
                  <span className="text-[10px] text-muted-foreground font-mono">deg {degreeName}</span>
                  <span className="font-bold text-base">{entered ? displayNote(entered) : "?"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Feedback & Diagnostics */}
        {feedback && (
          <div
            className={cn(
              "p-4 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200",
              feedback.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-900 dark:text-rose-200",
            )}
          >
            <div className="flex items-center gap-2">
              {feedback.isCorrect ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>

            {isComplete && (
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider shrink-0">
                Scale Complete!
              </span>
            )}
          </div>
        )}

        {/* Interactive Virtual Keyboard for Note Entry */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <PianoIcon className="h-3.5 w-3.5" />
              Interactive Piano Input:
            </span>
            <span>Click any key to place the next scale degree</span>
          </div>

          <div className="rounded-lg border border-border/70 p-3 bg-card/70 overflow-x-auto">
            <VirtualPiano
              startOctave={3}
              numOctaves={3}
              highlightNotes={highlightedNotes}
              showLabels="all"
              showShortcuts={false}
              onNotePlay={handleNoteEnter}
              className="max-w-3xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

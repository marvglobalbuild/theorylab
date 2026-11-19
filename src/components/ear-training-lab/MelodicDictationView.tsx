import {
  CheckCircle2,
  Delete,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
  Piano as PianoIcon,
  ChevronRight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import { Button } from "@/components/ui/button";
import {
  compareMelody,
  MELODIC_DICTATION_PRESETS,
  MelodicComparisonResult,
  MelodicDictationTemplate,
} from "@/lib/music/ear-training-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface MelodicDictationViewProps {
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export function MelodicDictationView({
  difficulty = "Beginner",
}: MelodicDictationViewProps) {
  const piano = usePiano();

  // Active template
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >(difficulty);
  const [activeTemplate, setActiveTemplate] = useState<MelodicDictationTemplate>(
    () =>
      MELODIC_DICTATION_PRESETS.find((p) => p.difficulty === difficulty) ??
      MELODIC_DICTATION_PRESETS[0]!,
  );

  // User input transcription notes
  const [enteredNotes, setEnteredNotes] = useState<string[]>([]);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);
  const [isPlayingUserMelody, setIsPlayingUserMelody] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  // Submission & evaluation result
  const [evaluation, setEvaluation] = useState<MelodicComparisonResult | null>(null);

  // Play target melody
  const playTargetMelody = useCallback(() => {
    setIsPlayingTarget(true);
    setReplayCount((c) => c + 1);

    const steps = activeTemplate.pitches.map((p, idx) => ({
      notes: [p],
      at: idx * 0.6,
      duration: 0.55,
    }));

    piano.playPhrase(steps, () => setIsPlayingTarget(false));
  }, [activeTemplate, piano]);

  // Play user's entered transcription
  const playUserTranscription = useCallback(() => {
    if (enteredNotes.length === 0) return;
    setIsPlayingUserMelody(true);

    const steps = enteredNotes.map((p, idx) => ({
      notes: [p],
      at: idx * 0.6,
      duration: 0.55,
    }));

    piano.playPhrase(steps, () => setIsPlayingUserMelody(false));
  }, [enteredNotes, piano]);

  // Switch template
  const handleSelectTemplate = (tmpl: MelodicDictationTemplate) => {
    setActiveTemplate(tmpl);
    setEnteredNotes([]);
    setEvaluation(null);
    setReplayCount(0);
  };

  // Add note from piano keyboard
  const handleAddNote = (note: string) => {
    if (evaluation) return; // locked after submission until reset
    if (enteredNotes.length < activeTemplate.pitches.length) {
      setEnteredNotes((prev) => [...prev, note]);
    }
  };

  // Delete last note
  const handleDeleteLastNote = () => {
    if (evaluation) return;
    setEnteredNotes((prev) => prev.slice(0, -1));
  };

  // Reset transcription
  const handleClear = () => {
    setEnteredNotes([]);
    setEvaluation(null);
  };

  // Evaluate transcription
  const handleEvaluate = () => {
    const res = compareMelody(activeTemplate.pitches, enteredNotes);
    setEvaluation(res);
  };

  // On difficulty filter change
  const filteredTemplates = MELODIC_DICTATION_PRESETS.filter(
    (p) => p.difficulty === selectedDifficulty,
  );

  // Initial playback
  useEffect(() => {
    const timer = setTimeout(() => {
      playTargetMelody();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTemplate.id]);

  return (
    <div className="space-y-6">
      {/* Exercise Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Level:</span>
          {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
            <Button
              key={lvl}
              variant={selectedDifficulty === lvl ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedDifficulty(lvl);
                const firstMatch = MELODIC_DICTATION_PRESETS.find((p) => p.difficulty === lvl);
                if (firstMatch) handleSelectTemplate(firstMatch);
              }}
              className="text-xs"
            >
              {lvl}
            </Button>
          ))}
        </div>

        {/* Templates within level */}
        <div className="flex flex-wrap items-center gap-2">
          {filteredTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className={cn(
                "px-2.5 py-1 text-xs rounded border transition-colors",
                activeTemplate.id === t.id
                  ? "bg-crimson-deep text-white border-crimson-deep font-semibold"
                  : "border-border/60 hover:bg-paper",
              )}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dictation Studio Workspace */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        {/* Header & Audio Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                Melodic Dictation • {activeTemplate.key}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-paper border border-border/60 text-muted-foreground">
                Target: {activeTemplate.pitches.length} Notes
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mt-1">
              {activeTemplate.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activeTemplate.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={playTargetMelody}
              disabled={isPlayingTarget}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[130px]"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlayingTarget && "animate-pulse")} />
              {isPlayingTarget ? "Playing..." : `Listen Target (${replayCount})`}
            </Button>

            {enteredNotes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={playUserTranscription}
                disabled={isPlayingUserMelody}
                className="text-xs"
              >
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Audition Yours
              </Button>
            )}
          </div>
        </div>

        {/* Note Entry Display Box */}
        <div className="p-4 rounded-xl border border-border/70 bg-paper/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Your Transcription ({enteredNotes.length} / {activeTemplate.pitches.length} notes
              entered):
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteLastNote}
                disabled={enteredNotes.length === 0 || !!evaluation}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <Delete className="mr-1 h-3.5 w-3.5" />
                Backspace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={enteredNotes.length === 0}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>

          {/* Slot Badges */}
          <div className="flex flex-wrap items-center gap-2 min-h-[48px]">
            {activeTemplate.pitches.map((_, idx) => {
              const entered = enteredNotes[idx];
              const discrepancy = evaluation?.noteDiscrepancies[idx];

              let badgeStyle = "border-dashed border-border/80 bg-card text-muted-foreground/60";

              if (entered && !evaluation) {
                badgeStyle =
                  "border-solid border-crimson-deep/60 bg-crimson-deep/10 text-crimson-deep font-bold";
              } else if (evaluation && discrepancy) {
                if (discrepancy.isMatch) {
                  badgeStyle =
                    "border-solid border-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold";
                } else {
                  badgeStyle =
                    "border-solid border-rose-600 bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold";
                }
              }

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-lg border text-sm transition-all shadow-sm",
                    badgeStyle,
                  )}
                >
                  <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                  <span className="font-semibold text-base">
                    {entered ? displayNote(entered) : "—"}
                  </span>
                  {evaluation && discrepancy && !discrepancy.isMatch && (
                    <span className="text-[9px] font-mono leading-none text-rose-600 dark:text-rose-300">
                      {discrepancy.offsetSemitones > 0 ? `+${discrepancy.offsetSemitones}` : discrepancy.offsetSemitones}st
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Play keys on the virtual piano below to transcribe each note of the melody.
            </span>

            {!evaluation ? (
              <Button
                size="sm"
                onClick={handleEvaluate}
                disabled={enteredNotes.length === 0}
                className="bg-charcoal text-paper hover:bg-charcoal/90 text-xs px-4"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Evaluate Transcription
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEnteredNotes([]);
                  setEvaluation(null);
                }}
                className="text-xs"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>

        {/* Evaluation Feedback Report */}
        {evaluation && (
          <div
            className={cn(
              "p-4 rounded-xl border animate-in fade-in duration-200 space-y-3",
              evaluation.isFullyCorrect
                ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40"
                : "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/40",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {evaluation.isFullyCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-display font-bold text-base text-foreground">
                  {evaluation.isFullyCorrect
                    ? "Perfect Melodic Transcription!"
                    : `Dictation Accuracy: ${evaluation.accuracyPercent}%`}
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-muted-foreground">
                {evaluation.matchingCount} / {evaluation.totalNotes} Pitches Matched
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{evaluation.explanation}</p>

            {/* Target vs Submitted Comparison Table */}
            <div className="text-xs bg-card p-3 rounded-lg border border-border/50 space-y-1 font-mono">
              <div className="flex items-center justify-between font-bold text-foreground pb-1 border-b border-border/40">
                <span>Target Pitches:</span>
                <span>{activeTemplate.pitches.map((p) => displayNote(p)).join(" → ")}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground pt-1">
                <span>Transcribed:</span>
                <span>
                  {enteredNotes.length > 0
                    ? enteredNotes.map((p) => displayNote(p)).join(" → ")
                    : "(none)"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Virtual Keyboard for Note Entry */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <PianoIcon className="h-3.5 w-3.5" />
              Interactive Piano Input
            </span>
            <span>Click any key to append to your transcription</span>
          </div>

          <div className="rounded-lg border border-border/70 p-3 bg-card/70 overflow-x-auto">
            <VirtualPiano
              startOctave={3}
              numOctaves={3}
              showLabels="all"
              showShortcuts={false}
              onNotePlay={handleAddNote}
              className="max-w-3xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { CheckCircle2, ChevronRight, HelpCircle, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  GUIDED_EXERCISES,
  getStaffNotes,
  type GuidedExercise,
  type GuidedExerciseStep,
} from "@/lib/music/notation-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

export function NotationGuidedExercises() {
  const piano = usePiano();

  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [stepScores, setStepScores] = useState<boolean[]>([]);
  const [completedExercises, setCompletedExercises] = useState<Record<string, number>>({});

  const exercise: GuidedExercise = GUIDED_EXERCISES[activeExerciseIndex] ?? GUIDED_EXERCISES[0]!;
  const currentStep: GuidedExerciseStep | undefined = exercise.steps[currentStepIndex];

  // Derive multiple choice options for current step
  const options = (() => {
    if (!currentStep) return [];
    const pool = getStaffNotes(currentStep.clef, "intermediate").map((n) => n.note);
    const target = currentStep.targetNote;
    const others = pool.filter((n) => n !== target);
    // Shuffle and pick 3
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    return [target, ...shuffledOthers].sort(() => 0.5 - Math.random());
  })();

  const handleSelectExercise = (idx: number) => {
    setActiveExerciseIndex(idx);
    setCurrentStepIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setStepScores([]);
  };

  const playPitch = (pitch: string) => {
    piano.playPhrase([{ notes: [pitch], at: 0, duration: 0.85 }]);
  };

  const handleAnswer = (choice: string) => {
    if (isAnswered || !currentStep) return;

    const correct = choice === currentStep.targetNote;
    setSelectedAnswer(choice);
    setIsAnswered(true);
    setIsCorrect(correct);
    playPitch(choice);

    setStepScores((prev) => [...prev, correct]);
  };

  const handleNextStep = () => {
    if (!exercise) return;

    if (currentStepIndex + 1 < exercise.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      // Completed exercise
      const correctCount = stepScores.filter(Boolean).length;
      const scorePct = Math.round((correctCount / exercise.steps.length) * 100);
      setCompletedExercises((prev) => ({
        ...prev,
        [exercise.id]: scorePct,
      }));
    }
  };

  const handleRestartExercise = () => {
    setCurrentStepIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setStepScores([]);
  };

  const isExerciseFinished = currentStepIndex >= exercise.steps.length || (isAnswered && currentStepIndex === exercise.steps.length - 1 && stepScores.length === exercise.steps.length);

  return (
    <div className="space-y-6">
      {/* Exercise Selection Sidebar / Pills */}
      <div className="rounded-[2px] border border-border bg-paper p-4">
        <span className="eyebrow text-muted-foreground block mb-2.5">
          Curriculum Guided Practice Modules ({GUIDED_EXERCISES.length} modules)
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDED_EXERCISES.map((ex, idx) => {
            const isCurrent = idx === activeExerciseIndex;
            const completion = completedExercises[ex.id];
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(idx)}
                className={cn(
                  "flex flex-col text-left rounded-[2px] border p-3 transition-colors",
                  isCurrent
                    ? "border-crimson bg-crimson/5 text-foreground shadow-sm"
                    : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-crimson-deep">
                    {ex.level} · {ex.clef}
                  </span>
                  {completion !== undefined && (
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-800 dark:text-emerald-300">
                      Score: {completion}%
                    </span>
                  )}
                </div>
                <h4 className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                  {ex.title}
                </h4>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                  {ex.steps.length} guided steps
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guided Practice Stage */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="eyebrow text-crimson-deep">Active Curriculum Module</span>
              <h3 className="font-display text-2xl font-semibold text-foreground mt-0.5">
                {exercise.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{exercise.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                Step {Math.min(currentStepIndex + 1, exercise.steps.length)} of {exercise.steps.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRestartExercise}
                className="h-7 text-xs"
              >
                <RotateCcw className="mr-1 size-3" aria-hidden /> Reset drill
              </Button>
            </div>
          </div>
        </div>

        {/* Finished State Summary */}
        {isExerciseFinished && isAnswered && currentStepIndex === exercise.steps.length - 1 ? (
          <div className="rounded-[2px] border border-emerald-300 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30 p-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto size-12 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h4 className="font-display text-2xl font-bold text-foreground">
                Exercise Completed!
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                You correctly answered {stepScores.filter(Boolean).length} of {exercise.steps.length}{" "}
                questions ({Math.round((stepScores.filter(Boolean).length / exercise.steps.length) * 100)}%).
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRestartExercise}
              >
                Retry this exercise
              </Button>
              {activeExerciseIndex + 1 < GUIDED_EXERCISES.length && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => handleSelectExercise(activeExerciseIndex + 1)}
                  className="bg-crimson hover:bg-crimson/90 text-white"
                >
                  Next exercise <ChevronRight className="ml-1 size-3.5" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        ) : currentStep ? (
          <div className="space-y-6">
            {/* Step Prompt */}
            <div className="rounded border border-border/80 bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="eyebrow text-muted-foreground">Instruction</span>
                  <p className="mt-1 text-sm font-medium text-foreground">{currentStep.prompt}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  <HelpCircle className="mr-1 size-3.5" aria-hidden />
                  {showHint ? "Hide hint" : "Show hint"}
                </Button>
              </div>

              {showHint && (
                <div className="mt-3 rounded border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <strong className="font-semibold">Hint: </strong>
                  {currentStep.hint}
                </div>
              )}
            </div>

            {/* Engraved Staff */}
            <div className="py-2">
              <Staff
                chords={[{ keys: [currentStep.targetNote], duration: "w" }]}
                clef={currentStep.clef}
                height={180}
                label={`Guided practice step note on ${currentStep.clef} clef`}
              />
            </div>

            {/* Multiple Choice Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow text-muted-foreground">Choose the correct note:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => playPitch(currentStep.targetNote)}
                  className="h-7 text-xs"
                >
                  <Volume2 className="mr-1 size-3" aria-hidden /> Hear note
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isTarget = option === currentStep.targetNote;

                  let style = "bg-paper hover:bg-muted text-foreground border-border";
                  if (isAnswered) {
                    if (isTarget) {
                      style = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                    } else if (isSelected && !isTarget) {
                      style = "bg-destructive text-destructive-foreground border-destructive";
                    } else {
                      style = "opacity-50 border-border bg-muted/20 text-muted-foreground";
                    }
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "rounded-[2px] border p-3.5 text-center font-display text-xl font-bold transition-all",
                        style,
                      )}
                    >
                      {displayNote(option)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Immediate Feedback */}
            {isAnswered && (
              <div
                className={cn(
                  "rounded-[2px] border p-4 transition-all",
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : "border-destructive/30 bg-destructive/10 text-destructive-foreground dark:text-red-200",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="size-5 text-destructive shrink-0" />
                    )}
                    <span className="text-xs font-medium">
                      {isCorrect
                        ? `Correct! ${displayNote(currentStep.targetNote)} is the exact pitch.`
                        : `Not quite. The correct pitch is ${displayNote(currentStep.targetNote)}.`}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleNextStep}
                    className="shrink-0 bg-crimson hover:bg-crimson/90 text-white text-xs h-8"
                  >
                    Continue <ChevronRight className="ml-1 size-3.5" aria-hidden />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}


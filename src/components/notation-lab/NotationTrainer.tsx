import { CheckCircle2, ChevronRight, HelpCircle, RotateCcw, Volume2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  generateRandomNoteQuestion,
  type NotationDifficulty,
  type NoteIdentificationQuestion,
} from "@/lib/music/notation-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

export function NotationTrainer() {
  const piano = usePiano();

  const [clefChoice, setClefChoice] = useState<"treble" | "bass" | "mixed">("treble");
  const [difficulty, setDifficulty] = useState<NotationDifficulty>("beginner");

  // Question state
  const [question, setQuestion] = useState<NoteIdentificationQuestion>(() =>
    generateRandomNoteQuestion("treble", "beginner"),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Stats tracking
  const [stats, setStats] = useState({
    attempts: 0,
    correct: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  // Sound playback on question load or button click
  const playTargetSound = (pitch?: string) => {
    const note = pitch ?? question.targetNote.note;
    piano.playPhrase([{ notes: [note], at: 0, duration: 0.9 }]);
  };

  const loadNewQuestion = () => {
    const nextQ = generateRandomNoteQuestion(clefChoice, difficulty, question.targetNote.note);
    setQuestion(nextQ);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  // When clef or difficulty changes, generate fresh question
  useEffect(() => {
    const fresh = generateRandomNoteQuestion(clefChoice, difficulty);
    setQuestion(fresh);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [clefChoice, difficulty]);

  const handleSelectOption = (chosen: string) => {
    if (isAnswered) return;

    const correct = chosen === question.targetNote.note;
    setSelectedAnswer(chosen);
    setIsAnswered(true);
    setIsCorrect(correct);

    // Audio feedback: play the selected note
    playTargetSound(chosen);

    // Update stats
    setStats((prev) => {
      const newAttempts = prev.attempts + 1;
      const newCorrect = correct ? prev.correct + 1 : prev.correct;
      const newStreak = correct ? prev.currentStreak + 1 : 0;
      const newBest = Math.max(prev.bestStreak, newStreak);
      return {
        attempts: newAttempts,
        correct: newCorrect,
        currentStreak: newStreak,
        bestStreak: newBest,
      };
    });
  };

  const handleResetStats = () => {
    setStats({
      attempts: 0,
      correct: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
    loadNewQuestion();
  };

  const chords: StaffChord[] = [
    {
      keys: [question.targetNote.note],
      duration: "w",
    },
  ];

  const accuracyRate =
    stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Configuration Strip: Clef, Difficulty, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-border bg-paper p-4">
        {/* Clef Selection */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Staff:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={clefChoice === "treble" ? "default" : "ghost"}
              size="sm"
              onClick={() => setClefChoice("treble")}
              className="h-7 text-xs font-medium"
            >
              𝄞 Treble
            </Button>
            <Button
              type="button"
              variant={clefChoice === "bass" ? "default" : "ghost"}
              size="sm"
              onClick={() => setClefChoice("bass")}
              className="h-7 text-xs font-medium"
            >
              𝄢 Bass
            </Button>
            <Button
              type="button"
              variant={clefChoice === "mixed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setClefChoice("mixed")}
              className="h-7 text-xs font-medium"
            >
              Mixed Clefs
            </Button>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Difficulty:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={difficulty === "beginner" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDifficulty("beginner")}
              className="h-7 text-xs font-medium"
            >
              Beginner (Lines & Spaces)
            </Button>
            <Button
              type="button"
              variant={difficulty === "intermediate" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDifficulty("intermediate")}
              className="h-7 text-xs font-medium"
            >
              Intermediate (+ Ledgers & Accidentals)
            </Button>
          </div>
        </div>
      </div>

      {/* Score and Progress Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[2px] border border-border bg-paper p-3 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Total Questions
          </span>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            {stats.attempts}
          </p>
        </div>
        <div className="rounded-[2px] border border-border bg-paper p-3 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</span>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            {accuracyRate}%
          </p>
        </div>
        <div className="rounded-[2px] border border-border bg-paper p-3 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Current Streak</span>
          <p className="mt-1 font-display text-2xl font-semibold text-crimson-deep">
            {stats.currentStreak} 🔥
          </p>
        </div>
        <div className="rounded-[2px] border border-border bg-paper p-3 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Best Streak</span>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            {stats.bestStreak}
          </p>
        </div>
      </div>

      {/* Main Flashcard / Identification Area */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <span className="eyebrow text-crimson-deep">Note Identification Challenge</span>
            <p className="text-sm font-medium text-foreground mt-0.5">
              Identify the note engraved on the {question.clef} staff below:
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => playTargetSound()}
              className="h-8 text-xs"
            >
              <Volume2 className="mr-1.5 size-3.5" aria-hidden /> Hear note sound
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetStats}
              className="h-8 text-xs text-muted-foreground"
            >
              <RotateCcw className="mr-1 size-3.5" aria-hidden /> Reset Stats
            </Button>
          </div>
        </div>

        {/* Staff Display */}
        <div className="py-2">
          <Staff
            chords={chords}
            clef={question.clef}
            height={190}
            label={`Flashcard question note on ${question.clef} clef`}
          />
        </div>

        {/* Answer Options Grid */}
        <div className="mt-6">
          <span className="eyebrow text-muted-foreground block mb-3">
            Select the matching note name:
          </span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isTarget = option === question.targetNote.note;

              let buttonStyle = "bg-paper hover:bg-muted text-foreground border-border";

              if (isAnswered) {
                if (isTarget) {
                  buttonStyle = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
                } else if (isSelected && !isTarget) {
                  buttonStyle = "bg-destructive text-destructive-foreground border-destructive";
                } else {
                  buttonStyle = "opacity-50 border-border bg-muted/20 text-muted-foreground";
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-[2px] border p-4 text-center transition-all",
                    buttonStyle,
                  )}
                >
                  <span className="font-display text-2xl font-bold">{displayNote(option)}</span>
                  <span className="text-xs font-mono opacity-80 mt-1">({option})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Banner */}
        {isAnswered && (
          <div
            className={cn(
              "mt-6 rounded-[2px] border p-4 transition-all animate-in fade-in-50",
              isCorrect
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-destructive/30 bg-destructive/10 text-destructive-foreground dark:text-red-200",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 size-5 text-destructive shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {isCorrect
                      ? "Correct! Excellent pitch identification."
                      : `Incorrect. You selected ${selectedAnswer ? displayNote(selectedAnswer) : "none"}.`}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    {question.explanation}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={loadNewQuestion}
                className="shrink-0 bg-crimson hover:bg-crimson/90 text-white text-xs h-8"
              >
                Next note <ChevronRight className="ml-1 size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


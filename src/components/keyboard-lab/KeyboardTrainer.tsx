import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  generateKeyboardQuestion,
  type KeyboardPracticeType,
  type KeyboardQuestion,
} from "@/lib/music/keyboard-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";
import { VirtualPiano } from "./VirtualPiano";

export function KeyboardTrainer() {
  const piano = usePiano();

  const [practiceType, setPracticeType] = useState<KeyboardPracticeType | "all">("all");
  const [level, setLevel] = useState<"Beginner" | "Intermediate">("Beginner");

  // Question state
  const [question, setQuestion] = useState<KeyboardQuestion>(() =>
    generateKeyboardQuestion("locate-middle-c", "Beginner"),
  );
  const [playedNote, setPlayedNote] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Performance stats
  const [stats, setStats] = useState({
    attempts: 0,
    correct: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const nextQuestionType = (): KeyboardPracticeType => {
    if (practiceType !== "all") return practiceType;
    const types: KeyboardPracticeType[] =
      level === "Beginner"
        ? ["locate-middle-c", "locate-note", "semitone-step", "whole-tone-step"]
        : ["locate-note", "semitone-step", "whole-tone-step", "octave-jump", "enharmonic"];
    return types[Math.floor(Math.random() * types.length)]!;
  };

  const loadNewQuestion = () => {
    const nextType = nextQuestionType();
    const q = generateKeyboardQuestion(nextType, level);
    setQuestion(q);
    setPlayedNote(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  useEffect(() => {
    loadNewQuestion();
  }, [practiceType, level]);

  const handleKeyPlay = (note: string) => {
    if (isAnswered) return;

    setPlayedNote(note);
    setIsAnswered(true);

    // Verify if played note matches any valid target note or MIDI
    const targetMidis = question.targetNotes.map((n) => noteToMidi(n));
    const playedMidi = noteToMidi(note);

    const correct = targetMidis.includes(playedMidi);
    setIsCorrect(correct);

    // Update stats
    setStats((prev) => {
      const attempts = prev.attempts + 1;
      const newCorrect = correct ? prev.correct + 1 : prev.correct;
      const currentStreak = correct ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);
      return { attempts, correct: newCorrect, currentStreak, bestStreak };
    });
  };

  const handleResetStats = () => {
    setStats({ attempts: 0, correct: 0, currentStreak: 0, bestStreak: 0 });
    loadNewQuestion();
  };

  const accuracyRate =
    stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

  // Active target set for highlighting after question is answered
  const targetHighlightSet = new Set(question.targetNotes);
  const playedSet = playedNote ? new Set([playedNote]) : new Set<string>();

  return (
    <div className="space-y-6">
      {/* Configuration Strip: Drill Mode, Difficulty, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-border bg-paper p-4">
        {/* Drill Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Drill Mode:
          </span>
          <select
            value={practiceType}
            onChange={(e) => setPracticeType(e.target.value as KeyboardPracticeType | "all")}
            className="h-8 rounded border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="all">All Practice Modes</option>
            <option value="locate-middle-c">Locate Middle C (C4)</option>
            <option value="locate-note">Note Identification</option>
            <option value="semitone-step">Semitone (Half Step) Steps</option>
            <option value="whole-tone-step">Whole Tone (Whole Step) Steps</option>
            <option value="octave-jump">Octave Jumps</option>
            <option value="enharmonic">Enharmonic Equivalents</option>
          </select>
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Difficulty:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={level === "Beginner" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLevel("Beginner")}
              className="h-7 text-xs font-medium"
            >
              Beginner (C4 Range)
            </Button>
            <Button
              type="button"
              variant={level === "Intermediate" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLevel("Intermediate")}
              className="h-7 text-xs font-medium"
            >
              Intermediate (Extended + Accidentals)
            </Button>
          </div>
        </div>
      </div>

      {/* Progress & Streak Stats Bar */}
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

      {/* Active Challenge Card */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <span className="eyebrow text-crimson-deep">Interactive Keyboard Challenge</span>
            <h3 className="font-display text-2xl font-semibold text-foreground mt-0.5">
              {question.prompt}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="size-3.5 mr-1" />
              {showHint ? "Hide hint" : "Show hint"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetStats}
              className="h-8 text-xs"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset stats
            </Button>
          </div>
        </div>

        {showHint && (
          <div className="rounded border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            <strong className="font-semibold">Instructor Hint: </strong>
            {question.hint}
          </div>
        )}

        {/* Embedded Interactive Virtual Piano */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">
            Click, tap, or type on the keyboard below to answer:
          </p>
          <VirtualPiano
            startOctave={3}
            numOctaves={3}
            activeNotes={playedSet}
            targetNotes={isAnswered && isCorrect ? targetHighlightSet : undefined}
            highlightNotes={isAnswered && !isCorrect ? targetHighlightSet : undefined}
            showLabels="all"
            showShortcuts={true}
            onNotePlay={handleKeyPlay}
            allowKeyboardShortcuts={true}
          />
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div
            className={cn(
              "rounded-[2px] border p-4 transition-all animate-in fade-in-50",
              isCorrect
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200"
                : "border-destructive/30 bg-destructive/10 text-destructive-foreground dark:text-red-200",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 size-5 text-destructive shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-sm">
                    {isCorrect
                      ? "Correct! You found the exact pitch."
                      : `Incorrect. You played ${playedNote ? displayNote(playedNote) : "none"}.`}
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
                Next challenge <ChevronRight className="ml-1 size-3.5" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

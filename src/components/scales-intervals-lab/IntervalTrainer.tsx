import {
  CheckCircle2,
  HelpCircle,
  History,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  generateIntervalQuestion,
  IntervalExerciseType,
  IntervalQuestion,
} from "@/lib/music/scales-intervals-lab";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface IntervalTrainerProps {
  initialDifficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export function IntervalTrainer({
  initialDifficulty = "Beginner",
}: IntervalTrainerProps) {
  const piano = usePiano();

  const [selectedType, setSelectedType] = useState<IntervalExerciseType | "all">("all");
  const [selectedLevel, setSelectedLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    initialDifficulty,
  );

  const [question, setQuestion] = useState<IntervalQuestion>(() =>
    generateIntervalQuestion("identify-by-ear", selectedLevel),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Scorecard
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Practice History log
  const [history, setHistory] = useState<
    {
      id: string;
      prompt: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[]
  >([]);

  // Sound playback for current interval question
  const playQuestionAudio = useCallback(() => {
    if (!question.notesToPlay || question.notesToPlay.length === 0) return;
    setIsPlaying(true);
    setReplayCount((c) => c + 1);

    const steps = question.notesToPlay;
    if (steps.length === 1) {
      // Harmonic (both notes together)
      piano.playPhrase(
        [
          {
            notes: steps[0]!,
            at: 0,
            duration: 1.5,
          },
        ],
        () => setIsPlaying(false),
      );
    } else {
      // Melodic
      piano.playPhrase(
        [
          { notes: steps[0]!, at: 0, duration: 0.8 },
          { notes: steps[1]!, at: 0.85, duration: 1.1 },
        ],
        () => setIsPlaying(false),
      );
    }
  }, [question, piano]);

  // Next question
  const handleNextQuestion = useCallback(
    (type = selectedType, level = selectedLevel) => {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setReplayCount(0);

      const actualType: IntervalExerciseType =
        type === "all"
          ? ([
              "identify-by-ear",
              "name-from-semitones",
              "construct-interval",
              "melodic-vs-harmonic",
              "ascending-vs-descending",
            ] as const)[Math.floor(Math.random() * 5)]!
          : type;

      const newQ = generateIntervalQuestion(actualType, level);
      setQuestion(newQ);
    },
    [selectedLevel, selectedType],
  );

  const handleTypeChange = (newType: IntervalExerciseType | "all") => {
    setSelectedType(newType);
    handleNextQuestion(newType, selectedLevel);
  };

  const handleLevelChange = (newLevel: "Beginner" | "Intermediate" | "Advanced") => {
    setSelectedLevel(newLevel);
    handleNextQuestion(selectedType, newLevel);
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === question.correctAnswer;
    setStats((prev) => {
      const nextStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });

    // Append to session history
    setHistory((prev) => [
      {
        id: question.id,
        prompt: question.prompt,
        userAnswer: option,
        correctAnswer: question.correctAnswer,
        isCorrect,
      },
      ...prev.slice(0, 9), // keep last 10
    ]);
  };

  const handleResetSession = () => {
    setStats({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
    setHistory([]);
    handleNextQuestion();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playQuestionAudio();
    }, 300);
    return () => clearTimeout(timer);
  }, [question.id]);

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Filter and Score Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
        {/* Exercise Types & Difficulty */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Drill:</span>
            <select
              value={selectedType}
              onChange={(e) =>
                handleTypeChange(e.target.value as IntervalExerciseType | "all")
              }
              className="text-xs bg-paper border border-border/70 rounded-md px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-crimson-deep"
            >
              <option value="all">All Drills (Comprehensive)</option>
              <option value="identify-by-ear">Identify by Ear</option>
              <option value="name-from-semitones">Interval from Semitones</option>
              <option value="construct-interval">Resulting Note Calculation</option>
              <option value="melodic-vs-harmonic">Melodic vs Harmonic</option>
              <option value="ascending-vs-descending">Ascending vs Descending</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
              <Button
                key={lvl}
                variant={selectedLevel === lvl ? "default" : "outline"}
                size="sm"
                onClick={() => handleLevelChange(lvl)}
                className="h-7 text-xs"
              >
                {lvl}
              </Button>
            ))}
          </div>
        </div>

        {/* Live Scorecard */}
        <div className="flex items-center gap-4 text-xs bg-paper/60 px-4 py-2 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span>
              Score:{" "}
              <strong className="text-foreground">
                {stats.correct}/{stats.total}
              </strong>
            </span>
          </div>
          <span>•</span>
          <span>
            Streak: <strong className="text-crimson-deep">{stats.streak}</strong> (Best:{" "}
            {stats.bestStreak})
          </span>
          <span>•</span>
          <span>
            Accuracy: <strong className="text-foreground">{accuracy}%</strong>
          </span>

          {stats.total > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetSession}
              className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground ml-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                {question.type.replace(/-/g, " ")} • {question.level}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mt-1">
              {question.prompt}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={playQuestionAudio}
              disabled={isPlaying}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[130px]"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
              {isPlaying ? "Auditioning..." : `Replay (${replayCount})`}
            </Button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {question.options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === question.correctAnswer;
            let btnStyle = "border-border/70 hover:border-crimson-deep/50 hover:bg-paper/80";

            if (isAnswered) {
              if (isCorrect) {
                btnStyle =
                  "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold";
              } else if (isSelected) {
                btnStyle =
                  "border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200";
              } else {
                btnStyle = "opacity-50 border-border/40";
              }
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswerSelect(opt)}
                disabled={isAnswered}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border text-left text-sm transition-all shadow-sm",
                  btnStyle,
                )}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Card */}
        {isAnswered && (
          <div
            className={cn(
              "p-4 rounded-lg border animate-in fade-in duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
              selectedAnswer === question.correctAnswer
                ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {selectedAnswer === question.correctAnswer ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-semibold text-sm">
                  {selectedAnswer === question.correctAnswer
                    ? "Correct! Accurate Interval Recognition."
                    : `Correct Answer: ${question.correctAnswer}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {question.explanation}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => handleNextQuestion()}
              className="shrink-0 bg-charcoal text-paper hover:bg-charcoal/90"
            >
              Next Interval Question
            </Button>
          </div>
        )}
      </div>

      {/* Practice Session History Drawer */}
      {history.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <History className="h-4 w-4" />
            <span>Current Session Practice Log (Last {history.length} Questions)</span>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            {history.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="py-2.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2 truncate">
                  {item.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span className="truncate text-foreground font-medium">{item.prompt}</span>
                </div>

                <div className="shrink-0 text-muted-foreground flex items-center gap-3">
                  <span>
                    Your Answer:{" "}
                    <strong
                      className={item.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}
                    >
                      {item.userAnswer}
                    </strong>
                  </span>
                  {!item.isCorrect && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      (Target: {item.correctAnswer})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

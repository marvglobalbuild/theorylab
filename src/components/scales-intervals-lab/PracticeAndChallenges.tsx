import {
  AlarmClock,
  Award,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  generateIntervalQuestion,
  generateScaleChallenge,
  IntervalQuestion,
  ScaleChallengeQuestion,
} from "@/lib/music/scales-intervals-lab";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface PracticeAndChallengesProps {
  initialDifficulty?: "Beginner" | "Intermediate" | "Advanced";
}

type ChallengeType = "scale-id" | "interval-id";

export function PracticeAndChallenges({
  initialDifficulty = "Beginner",
}: PracticeAndChallengesProps) {
  const piano = usePiano();

  const [challengeType, setChallengeType] = useState<ChallengeType>("scale-id");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    initialDifficulty,
  );

  const [scaleQuestion, setScaleQuestion] = useState<ScaleChallengeQuestion>(() =>
    generateScaleChallenge(level),
  );
  const [intervalQuestion, setIntervalQuestion] = useState<IntervalQuestion>(() =>
    generateIntervalQuestion("identify-by-ear", level),
  );

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Timed challenge state
  const [isTimedMode, setIsTimedMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

  // Score stats
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Incorrect questions list for replay
  const [missedQuestions, setMissedQuestions] = useState<
    {
      prompt: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }[]
  >([]);

  // Load next question
  const handleNextQuestion = useCallback(
    (type = challengeType, lvl = level) => {
      setSelectedAnswer(null);
      setIsAnswered(false);

      if (type === "scale-id") {
        setScaleQuestion(generateScaleChallenge(lvl));
      } else {
        setIntervalQuestion(generateIntervalQuestion("identify-by-ear", lvl));
      }
    },
    [challengeType, level],
  );

  // Switch challenge mode
  const handleTypeChange = (newType: ChallengeType) => {
    setChallengeType(newType);
    handleNextQuestion(newType, level);
  };

  const handleLevelChange = (newLvl: "Beginner" | "Intermediate" | "Advanced") => {
    setLevel(newLvl);
    handleNextQuestion(challengeType, newLvl);
  };

  // Submit Answer
  const handleAnswerSelect = (option: string) => {
    if (isAnswered || isTimeUp) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isScale = challengeType === "scale-id";
    const correctAnswer = isScale
      ? scaleQuestion.correctAnswer
      : intervalQuestion.correctAnswer;

    const isCorrect = option === correctAnswer;
    setStats((prev) => {
      const nextStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
      };
    });

    if (!isCorrect) {
      setMissedQuestions((prev) => [
        {
          prompt: isScale ? scaleQuestion.prompt : intervalQuestion.prompt,
          options: isScale ? scaleQuestion.options : intervalQuestion.options,
          correctAnswer,
          explanation: isScale
            ? scaleQuestion.explanation
            : intervalQuestion.explanation,
        },
        ...prev,
      ]);
    }
  };

  // Reset challenge
  const handleResetChallenge = () => {
    setStats({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
    setMissedQuestions([]);
    setTimeLeft(60);
    setIsTimeUp(false);
    handleNextQuestion();
  };

  // Play audio for interval challenge
  const playIntervalAudio = () => {
    if (challengeType !== "interval-id") return;
    const steps = intervalQuestion.notesToPlay;
    if (steps && steps.length >= 2) {
      piano.playPhrase([
        { notes: steps[0]!, at: 0, duration: 0.8 },
        { notes: steps[1]!, at: 0.85, duration: 1.1 },
      ]);
    }
  };

  // Timer countdown if timed mode active
  useEffect(() => {
    if (!isTimedMode || isTimeUp) return;
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedMode, timeLeft, isTimeUp]);

  const activePrompt =
    challengeType === "scale-id" ? scaleQuestion.prompt : intervalQuestion.prompt;
  const activeOptions =
    challengeType === "scale-id" ? scaleQuestion.options : intervalQuestion.options;
  const activeCorrect =
    challengeType === "scale-id"
      ? scaleQuestion.correctAnswer
      : intervalQuestion.correctAnswer;
  const activeExplanation =
    challengeType === "scale-id"
      ? scaleQuestion.explanation
      : intervalQuestion.explanation;

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Filter and Score Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            <Button
              variant={challengeType === "scale-id" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange("scale-id")}
              className="text-xs"
            >
              Scale Challenges
            </Button>
            <Button
              variant={challengeType === "interval-id" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange("interval-id")}
              className="text-xs"
            >
              Interval Challenges
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
              <Button
                key={lvl}
                variant={level === lvl ? "default" : "outline"}
                size="sm"
                onClick={() => handleLevelChange(lvl)}
                className="h-7 text-xs"
              >
                {lvl}
              </Button>
            ))}
          </div>

          {/* Timed Mode Toggle */}
          <Button
            variant={isTimedMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsTimedMode(!isTimedMode);
              setTimeLeft(60);
              setIsTimeUp(false);
            }}
            className={cn("h-7 text-xs", isTimedMode && "bg-amber-600 hover:bg-amber-700")}
          >
            <Timer className="mr-1.5 h-3.5 w-3.5" />
            {isTimedMode ? `Timed (${timeLeft}s)` : "Timed Mode (60s)"}
          </Button>
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
              onClick={handleResetChallenge}
              className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground ml-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Challenge Card */}
      {!isTimeUp ? (
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                {challengeType === "scale-id" ? "Scale Identification" : "Aural Interval Drill"} •{" "}
                {level}
              </span>
              <h3 className="font-display text-xl font-bold text-foreground mt-1">
                {activePrompt}
              </h3>
            </div>

            {challengeType === "interval-id" && (
              <Button
                size="sm"
                onClick={playIntervalAudio}
                className="bg-crimson-deep hover:bg-crimson-deep/90 text-white shrink-0"
              >
                <Volume2 className="mr-1.5 h-4 w-4" />
                Listen Interval
              </Button>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeOptions.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === activeCorrect;
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
                selectedAnswer === activeCorrect
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {selectedAnswer === activeCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-semibold text-sm">
                    {selectedAnswer === activeCorrect
                      ? "Masterful Identification!"
                      : `Target Answer: ${activeCorrect}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  {activeExplanation}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => handleNextQuestion()}
                className="shrink-0 bg-charcoal text-paper hover:bg-charcoal/90"
              >
                Next Challenge
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Time's Up Screen */
        <div className="rounded-xl border border-amber-300 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/20 p-8 text-center space-y-4">
          <AlarmClock className="h-10 w-10 text-amber-600 mx-auto animate-bounce" />
          <h3 className="font-display text-2xl font-bold text-foreground">Time’s Up!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You completed <strong>{stats.total}</strong> challenges in 60 seconds with an accuracy of{" "}
            <strong>{accuracy}%</strong> and a best streak of <strong>{stats.bestStreak}</strong>!
          </p>

          <Button onClick={handleResetChallenge} className="bg-crimson-deep text-white">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </div>
      )}

      {/* Replay Missed Questions Drawer */}
      {missedQuestions.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground">
              Review Missed Questions ({missedQuestions.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMissedQuestions([])}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Review
            </Button>
          </div>

          <div className="divide-y divide-border/40 text-xs">
            {missedQuestions.map((q, idx) => (
              <div key={idx} className="py-2.5 space-y-1">
                <div className="font-medium text-foreground">{q.prompt}</div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>
                    Correct Answer: <strong className="text-emerald-600">{q.correctAnswer}</strong>
                  </span>
                  <span className="text-[11px] max-w-sm truncate">{q.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import {
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  EarTrainingQuizQuestion,
  EarTrainingTopic,
  generateEarTrainingQuiz,
} from "@/lib/music/ear-training-lab";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface EarTrainingPracticeCenterProps {
  initialDifficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export function EarTrainingPracticeCenter({
  initialDifficulty = "Beginner",
}: EarTrainingPracticeCenterProps) {
  const piano = usePiano();
  const [selectedTopic, setSelectedTopic] = useState<EarTrainingTopic>("all");
  const [selectedLevel, setSelectedLevel] = useState<"Beginner" | "Intermediate" | "Advanced">(
    initialDifficulty,
  );

  const [question, setQuestion] = useState<EarTrainingQuizQuestion>(() =>
    generateEarTrainingQuiz(selectedTopic, selectedLevel),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Scorecard
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Play audio sequence for the current quiz question
  const playQuestionAudio = useCallback(() => {
    if (!question.notesToAudition || question.notesToAudition.length === 0) return;
    setIsPlaying(true);
    setReplayCount((c) => c + 1);

    const steps = question.notesToAudition;
    const stepDuration = steps.length > 2 ? 0.9 : 1.1;

    const phraseSteps = steps.map((chord, idx) => ({
      notes: chord,
      at: idx * stepDuration,
      duration: stepDuration - 0.05,
    }));

    piano.playPhrase(phraseSteps, () => setIsPlaying(false));
  }, [piano, question]);

  // Next question
  const handleNextQuestion = useCallback(
    (topic = selectedTopic, level = selectedLevel) => {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
      setReplayCount(0);
      const newQ = generateEarTrainingQuiz(topic, level);
      setQuestion(newQ);
    },
    [selectedLevel, selectedTopic],
  );

  const handleTopicChange = (newTopic: EarTrainingTopic) => {
    setSelectedTopic(newTopic);
    handleNextQuestion(newTopic, selectedLevel);
  };

  const handleLevelChange = (newLevel: "Beginner" | "Intermediate" | "Advanced") => {
    setSelectedLevel(newLevel);
    handleNextQuestion(selectedTopic, newLevel);
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
  };

  const handleResetSession = () => {
    setStats({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
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
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicChange(e.target.value as EarTrainingTopic)}
              className="text-xs bg-paper border border-border/70 rounded-md px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-crimson-deep"
            >
              <option value="all">All Topics (Comprehensive)</option>
              <option value="pitch-recognition">Pitch Discrimination</option>
              <option value="interval-recognition">Interval Recognition</option>
              <option value="chord-recognition">Chord Qualities</option>
              <option value="harmonic-listening">Cadences & Harmony</option>
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

      {/* Main Practice Question Card */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                {question.topic.replace(/-/g, " ")} • {question.level}
              </span>
              {question.intervalDirection && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-paper border border-border/60 capitalize">
                  {question.intervalDirection}
                </span>
              )}
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

            {!isAnswered && !showHint && question.hint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(true)}
                className="text-xs"
              >
                <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Hint
              </Button>
            )}
          </div>
        </div>

        {/* Optional Hint */}
        {showHint && !isAnswered && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              <strong>Aural Hint:</strong> {question.hint}
            </span>
          </div>
        )}

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

        {/* Immediate Feedback Card */}
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
                    ? "Correct! Excellent Aural Recognition."
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
              Next Practice Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

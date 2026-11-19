import {
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  XCircle,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  generateHarmonicExercise,
  HarmonicExercise,
  HarmonicExerciseType,
} from "@/lib/music/ear-training-lab";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface HarmonicListeningViewProps {
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export function HarmonicListeningView({
  difficulty = "Beginner",
}: HarmonicListeningViewProps) {
  const piano = usePiano();
  const [exerciseType, setExerciseType] = useState<HarmonicExerciseType>(
    "major-vs-minor-quality",
  );
  const [exercise, setExercise] = useState<HarmonicExercise>(() =>
    generateHarmonicExercise("major-vs-minor-quality", difficulty),
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
  });

  // Play harmonic audio (single chord or chord progression)
  const playHarmonicAudio = useCallback(() => {
    if (!exercise.notesToPlay || exercise.notesToPlay.length === 0) return;
    setIsPlaying(true);
    setReplayCount((c) => c + 1);

    const chords = exercise.notesToPlay;
    const chordDuration = chords.length > 2 ? 0.9 : 1.3;
    const steps = chords.map((chordNotes, idx) => ({
      notes: chordNotes,
      at: idx * chordDuration,
      duration: chordDuration - 0.05,
    }));

    piano.playPhrase(steps, () => setIsPlaying(false));
  }, [exercise, piano]);

  // Next exercise
  const handleNextExercise = useCallback(
    (type = exerciseType) => {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setReplayCount(0);
      const newEx = generateHarmonicExercise(type, difficulty);
      setExercise(newEx);
    },
    [difficulty, exerciseType],
  );

  const handleModeChange = (newMode: HarmonicExerciseType) => {
    setExerciseType(newMode);
    handleNextExercise(newMode);
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option === exercise.correctAnswer;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playHarmonicAudio();
    }, 300);
    return () => clearTimeout(timer);
  }, [exercise.id]);

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={exerciseType === "major-vs-minor-quality" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("major-vs-minor-quality")}
            className="text-xs"
          >
            Major vs Minor Quality
          </Button>
          <Button
            variant={exerciseType === "harmonic-stability-tension" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("harmonic-stability-tension")}
            className="text-xs"
          >
            Stability vs Tension
          </Button>
          <Button
            variant={exerciseType === "cadence-recognition" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("cadence-recognition")}
            className="text-xs"
          >
            Cadence Recognition
          </Button>
          <Button
            variant={exerciseType === "progression-identification" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("progression-identification")}
            className="text-xs"
          >
            Chord Progressions
          </Button>
        </div>

        {/* Live Scorecard */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground bg-paper/60 px-3 py-1.5 rounded-md border border-border/40">
          <span>
            Score:{" "}
            <strong className="text-foreground">
              {stats.correct}/{stats.total}
            </strong>
          </span>
          <span>•</span>
          <span>
            Streak: <strong className="text-crimson-deep">{stats.streak}</strong>
          </span>
          <span>•</span>
          <span>
            Accuracy:{" "}
            <strong className="text-foreground">
              {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
            </strong>
          </span>
        </div>
      </div>

      {/* Main Board */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
              Harmonic Ear Training • {exercise.type.replace(/-/g, " ")}
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-1">
              {exercise.prompt}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={playHarmonicAudio}
              disabled={isPlaying}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[130px]"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
              {isPlaying ? "Voicing..." : `Replay (${replayCount})`}
            </Button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {exercise.options.map((opt) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === exercise.correctAnswer;
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

        {/* Immediate Feedback */}
        {isAnswered && (
          <div
            className={cn(
              "p-4 rounded-lg border animate-in fade-in duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
              selectedAnswer === exercise.correctAnswer
                ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {selectedAnswer === exercise.correctAnswer ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                )}
                <span className="font-semibold text-sm">
                  {selectedAnswer === exercise.correctAnswer
                    ? "Harmonically Perceptive!"
                    : "Harmonic Theory Insight"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {exercise.explanation}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => handleNextExercise()}
              className="shrink-0 bg-charcoal text-paper hover:bg-charcoal/90"
            >
              Next Harmonic Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

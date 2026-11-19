import {
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Volume2,
  XCircle,
  ArrowUpDown,
  Music,
  Piano as PianoIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import { Button } from "@/components/ui/button";
import {
  generatePitchExercise,
  PitchExercise,
  PitchExerciseType,
} from "@/lib/music/ear-training-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface PitchRecognitionViewProps {
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

export function PitchRecognitionView({
  difficulty = "Beginner",
}: PitchRecognitionViewProps) {
  const piano = usePiano();
  const [exerciseType, setExerciseType] = useState<PitchExerciseType | "keyboard-match">(
    "single-pitch-id",
  );
  const [exercise, setExercise] = useState<PitchExercise>(() =>
    generatePitchExercise("single-pitch-id", difficulty),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Keyboard match specific state
  const [keyboardTargetNote, setKeyboardTargetNote] = useState<string>("C4");
  const [keyboardGuessedNote, setKeyboardGuessedNote] = useState<string | null>(null);
  const [keyboardFeedback, setKeyboardFeedback] = useState<{
    correct: boolean;
    message: string;
  } | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
  });

  // Sound playback for the current exercise
  const playAudio = useCallback(() => {
    if (exerciseType === "keyboard-match") {
      setIsPlaying(true);
      piano.playPhrase([{ notes: [keyboardTargetNote], at: 0, duration: 1.2 }], () => {
        setIsPlaying(false);
      });
      setReplayCount((c) => c + 1);
      return;
    }

    setIsPlaying(true);
    setReplayCount((c) => c + 1);

    if (exercise.type === "pitch-compare-high-low" || exercise.type === "pitch-matching") {
      const p1 = exercise.targetPitches[0]!;
      const p2 = exercise.targetPitches[1]!;
      piano.playPhrase(
        [
          { notes: [p1], at: 0, duration: 0.9 },
          { notes: [p2], at: 1.1, duration: 0.9 },
        ],
        () => setIsPlaying(false),
      );
    } else {
      const pitch = exercise.targetPitches[0]!;
      piano.playPhrase([{ notes: [pitch], at: 0, duration: 1.2 }], () => setIsPlaying(false));
    }
  }, [exercise, exerciseType, keyboardTargetNote, piano]);

  // Load new exercise
  const handleNextExercise = useCallback(
    (type = exerciseType) => {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setReplayCount(0);
      setKeyboardGuessedNote(null);
      setKeyboardFeedback(null);

      if (type === "keyboard-match") {
        const pool =
          difficulty === "Beginner"
            ? ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
            : ["C3", "E3", "G3", "C4", "Eb4", "F#4", "G4", "Bb4", "C5"];
        const rand = pool[Math.floor(Math.random() * pool.length)]!;
        setKeyboardTargetNote(rand);
      } else {
        const newEx = generatePitchExercise(type, difficulty);
        setExercise(newEx);
      }
    },
    [difficulty, exerciseType],
  );

  // Switch mode
  const handleModeChange = (newMode: PitchExerciseType | "keyboard-match") => {
    setExerciseType(newMode);
    handleNextExercise(newMode);
  };

  // Submit answer for standard multiple choice
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

  // Handle keyboard key click in keyboard-match mode
  const handleKeyPlayed = (note: string) => {
    if (exerciseType !== "keyboard-match") return;
    setKeyboardGuessedNote(note);

    const isCorrect = note === keyboardTargetNote;
    const diff = noteToMidi(note) - noteToMidi(keyboardTargetNote);

    let message = "";
    if (isCorrect) {
      message = `Brilliant! You correctly matched ${displayNote(note)}.`;
    } else {
      const direction = diff > 0 ? "higher" : "lower";
      message = `Close! You played ${displayNote(note)}, which is ${Math.abs(diff)} semitone(s) too ${direction}. Target was ${displayNote(keyboardTargetNote)}.`;
    }

    setKeyboardFeedback({ correct: isCorrect, message });
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  // Play audio on initial question load
  useEffect(() => {
    const timer = setTimeout(() => {
      playAudio();
    }, 350);
    return () => clearTimeout(timer);
  }, [exercise.id, keyboardTargetNote]);

  return (
    <div className="space-y-6">
      {/* Exercise Sub-Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={exerciseType === "single-pitch-id" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("single-pitch-id")}
            className="text-xs"
          >
            <Music className="mr-1.5 h-3.5 w-3.5" />
            Identify Pitch
          </Button>
          <Button
            variant={exerciseType === "pitch-compare-high-low" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("pitch-compare-high-low")}
            className="text-xs"
          >
            <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
            Higher vs Lower
          </Button>
          <Button
            variant={exerciseType === "octave-discrimination" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("octave-discrimination")}
            className="text-xs"
          >
            Octave Registers
          </Button>
          <Button
            variant={exerciseType === "pitch-matching" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("pitch-matching")}
            className="text-xs"
          >
            Same or Different
          </Button>
          <Button
            variant={exerciseType === "keyboard-match" ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange("keyboard-match")}
            className="text-xs"
          >
            <PianoIcon className="mr-1.5 h-3.5 w-3.5" />
            Keyboard Match
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

      {/* Main Training Board */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        {/* Prompt Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
              {exerciseType === "keyboard-match"
                ? "Interactive Piano Match"
                : exercise.type.replace(/-/g, " ")}
            </span>
            <h3 className="font-display text-xl font-bold text-foreground mt-1">
              {exerciseType === "keyboard-match"
                ? "Listen to the mystery tone, then find and play the exact note on the keyboard below."
                : exercise.prompt}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={playAudio}
              disabled={isPlaying}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[130px]"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
              {isPlaying ? "Playing..." : replayCount === 0 ? "Listen Tone" : `Replay (${replayCount})`}
            </Button>
          </div>
        </div>

        {/* Standard Multiple-Choice View */}
        {exerciseType !== "keyboard-match" ? (
          <div className="space-y-4">
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
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Academic Explanation */}
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
                        ? "Accurate Identification!"
                        : "Ear Training Observation"}
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
                  Next Exercise
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Interactive Keyboard Match Mode */
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-paper/60 rounded-lg border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                Audition the reference tone with the <strong>Listen Tone</strong> button, then click
                the corresponding key on the keyboard below.
              </span>
              {keyboardFeedback && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleNextExercise("keyboard-match")}
                  className="h-7 text-xs ml-2"
                >
                  Next Note
                </Button>
              )}
            </div>

            {keyboardFeedback && (
              <div
                className={cn(
                  "p-3 rounded-lg border text-xs flex items-center justify-between gap-3 animate-in fade-in",
                  keyboardFeedback.correct
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                    : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-800 dark:text-rose-200",
                )}
              >
                <span>{keyboardFeedback.message}</span>
                <Button
                  size="sm"
                  onClick={() => handleNextExercise("keyboard-match")}
                  className="h-7 text-xs shrink-0 bg-charcoal text-white"
                >
                  Try Another Note
                </Button>
              </div>
            )}

            <div className="rounded-lg border border-border/70 p-3 bg-card/70 overflow-x-auto">
              <VirtualPiano
                startOctave={3}
                numOctaves={3}
                showLabels="all"
                showShortcuts={false}
                onNotePlay={handleKeyPlayed}
                className="max-w-3xl mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

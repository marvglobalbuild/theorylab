import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  HelpCircle,
  Minus,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Staff, type StaffChord, type StaffDuration } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  scheduleClickTone,
  scheduleRhythmTone,
} from "@/lib/music/rhythm-audio";
import {
  NoteDurationSpec,
  RHYTHM_DURATIONS_CATALOG,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

interface DictationExercise {
  id: string;
  level: "Beginner" | "Intermediate";
  timeSignature: string;
  tempoBpm: number;
  durations: StaffDuration[];
  description: string;
}

const DICTATION_LIBRARY: DictationExercise[] = [
  {
    id: "dict-beg-1",
    level: "Beginner",
    timeSignature: "4/4",
    tempoBpm: 90,
    durations: ["q", "q", "h"],
    description: "Two steady quarter notes followed by a sustaining half note.",
  },
  {
    id: "dict-beg-2",
    level: "Beginner",
    timeSignature: "3/4",
    tempoBpm: 96,
    durations: ["q", "8", "8", "q"],
    description: "Quarter note, paired eighth notes on beat 2, resolved by a quarter on beat 3.",
  },
  {
    id: "dict-int-1",
    level: "Intermediate",
    timeSignature: "4/4",
    tempoBpm: 92,
    durations: ["8d", "16", "q", "h"],
    description: "Classical dotted eighth-sixteenth motive resolving to a half note.",
  },
  {
    id: "dict-int-2",
    level: "Intermediate",
    timeSignature: "4/4",
    tempoBpm: 96,
    durations: ["q", "qr", "8", "8", "q"],
    description: "Syncopated silence: Quarter note, quarter rest on beat 2, paired eighths on beat 3.",
  },
];

export function RhythmDictationStudio() {
  const [level, setLevel] = useState<"Beginner" | "Intermediate">("Beginner");
  const [exerciseIndex, setExerciseIndex] = useState<number>(0);
  const [userDurations, setUserDurations] = useState<StaffDuration[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState<boolean>(false);
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);

  const timerRef = useRef<number[]>([]);

  const availableExercises = useMemo(() => {
    return DICTATION_LIBRARY.filter((e) => e.level === level);
  }, [level]);

  const exercise = useMemo(() => {
    return availableExercises[exerciseIndex % availableExercises.length] ?? availableExercises[0]!;
  }, [availableExercises, exerciseIndex]);

  const clearTimers = () => {
    timerRef.current.forEach((t) => window.clearTimeout(t));
    timerRef.current = [];
  };

  const stopAudio = () => {
    clearTimers();
    setIsPlayingTarget(false);
  };

  useEffect(() => {
    return stopAudio;
  }, []);

  const loadExercise = (idx: number) => {
    stopAudio();
    setExerciseIndex(idx);
    setUserDurations([]);
    setIsAnswerRevealed(false);
    setIsEvaluated(false);
  };

  const playTargetRhythm = () => {
    stopAudio();
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setIsPlayingTarget(true);
    const secondsPerQuarter = 60 / exercise.tempoBpm;
    let cumulativeTime = 0;

    exercise.durations.forEach((d, i) => {
      const spec = RHYTHM_DURATIONS_CATALOG.find((item) => item.id === d);
      const durSec = (spec?.quarterBeats ?? 1) * secondsPerQuarter;
      const soundTime = ctx.currentTime + cumulativeTime;

      // Play metronome cue
      scheduleClickTone(ctx, soundTime, i === 0 ? "downbeat" : "unaccented", "classic");

      // Play tone if not a rest
      if (!spec?.isRest) {
        scheduleRhythmTone(ctx, soundTime, durSec * 0.9, 440, i === 0);
      }

      cumulativeTime += durSec;
    });

    const endTimer = window.setTimeout(() => {
      setIsPlayingTarget(false);
    }, cumulativeTime * 1000 + 60);
    timerRef.current.push(endTimer);
  };

  // Add/remove notes from user reconstruction
  const handleAddUserDuration = (d: StaffDuration) => {
    if (isAnswerRevealed) return;
    setUserDurations((prev) => [...prev, d]);
    setIsEvaluated(false);
  };

  const handleRemoveLast = () => {
    if (isAnswerRevealed) return;
    setUserDurations((prev) => prev.slice(0, -1));
    setIsEvaluated(false);
  };

  const handleClear = () => {
    if (isAnswerRevealed) return;
    setUserDurations([]);
    setIsEvaluated(false);
  };

  const checkAnswer = () => {
    setIsEvaluated(true);
    setIsAnswerRevealed(true);
  };

  // Compare user durations with target
  const isCorrect = useMemo(() => {
    if (userDurations.length !== exercise.durations.length) return false;
    return userDurations.every((d, i) => d === exercise.durations[i]);
  }, [userDurations, exercise]);

  const userStaffChords: StaffChord[] = useMemo(() => {
    return userDurations.map((d) => {
      const spec = RHYTHM_DURATIONS_CATALOG.find((s) => s.id === d);
      return {
        keys: spec?.isRest ? [] : ["C4"],
        duration: d,
      };
    });
  }, [userDurations]);

  const targetStaffChords: StaffChord[] = useMemo(() => {
    return exercise.durations.map((d) => {
      const spec = RHYTHM_DURATIONS_CATALOG.find((s) => s.id === d);
      return {
        keys: spec?.isRest ? [] : ["C4"],
        duration: d,
      };
    });
  }, [exercise]);

  return (
    <div className="space-y-6">
      {/* Exercise Selection Toolbar */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow text-muted-foreground block mb-1">
            Ear Training Studio
          </span>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Aural Rhythm Dictation
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={level === "Beginner" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setLevel("Beginner");
                loadExercise(0);
              }}
              className="h-7 text-xs font-medium"
            >
              Beginner
            </Button>
            <Button
              type="button"
              variant={level === "Intermediate" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setLevel("Intermediate");
                loadExercise(0);
              }}
              className="h-7 text-xs font-medium"
            >
              Intermediate
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadExercise(exerciseIndex + 1)}
            className="h-8 text-xs font-medium"
          >
            Next Exercise
          </Button>
        </div>
      </div>

      {/* Main Dictation Workspace */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-crimson-deep">Dictation Challenge</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">
                {exercise.timeSignature} Meter · {exercise.tempoBpm} BPM
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Listen to the rhythm carefully, then reconstruct the exact sequence of notes and rests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={playTargetRhythm}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white gap-1.5 font-medium px-4"
            >
              <Volume2 className="size-3.5" />
              <span>{isPlayingTarget ? "Playing Rhythm..." : "Audition Hidden Rhythm"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={checkAnswer}
              disabled={userDurations.length === 0 || isAnswerRevealed}
              className="h-8 text-xs font-semibold"
            >
              Check Dictation
            </Button>
          </div>
        </div>

        {/* User Reconstruction Staff */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Your Rhythmic Reconstruction:</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLast}
                disabled={userDurations.length === 0 || isAnswerRevealed}
                className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
              >
                <Minus className="size-3 mr-1" /> Remove Last
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={userDurations.length === 0 || isAnswerRevealed}
                className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3 mr-1" /> Clear
              </Button>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-950 rounded border border-border flex flex-col items-center justify-center min-h-[140px]">
            {userDurations.length > 0 ? (
              <Staff
                chords={userStaffChords}
                timeSignature={exercise.timeSignature}
                clef="treble"
                height={130}
                label="Staff showing user rhythmic reconstruction"
              />
            ) : (
              <div className="text-muted-foreground text-xs italic">
                No rhythmic values placed yet. Audition the rhythm and click below to input notes or rests.
              </div>
            )}
          </div>
        </div>

        {/* Answer Reveal & Feedback */}
        {isEvaluated && (
          <div
            className={cn(
              "rounded-[2px] border p-4 space-y-3 animate-in fade-in duration-200",
              isCorrect
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                : "border-crimson/40 bg-crimson/10 text-crimson-deep dark:text-rose-200",
            )}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Aural Dictation Perfect! Your notation matches the audio.</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4 text-crimson" />
                  <span>Dictation discrepancy detected. Inspect the correct notation below.</span>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {exercise.description}
            </p>

            {/* Target Solution Staff */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-foreground block mb-1">
                Official Target Notation:
              </span>
              <div className="p-3 bg-white dark:bg-zinc-950 rounded border border-border flex flex-col items-center justify-center">
                <Staff
                  chords={targetStaffChords}
                  timeSignature={exercise.timeSignature}
                  clef="treble"
                  height={130}
                  label="Staff showing official dictation target notation"
                />
              </div>
            </div>
          </div>
        )}

        {/* Note / Rest Input Palette */}
        <div className="space-y-3 pt-2 border-t border-border/60">
          <span className="eyebrow text-muted-foreground block">
            Select Rhythmic Values to Place:
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {["w", "h", "hd", "q", "qd", "8", "8d", "16", "qr", "hr", "8r"].map((dId) => {
              const spec = RHYTHM_DURATIONS_CATALOG.find((s) => s.id === dId)!;
              return (
                <Button
                  key={dId}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAnswerRevealed}
                  onClick={() => handleAddUserDuration(spec.id)}
                  className="h-12 flex flex-col items-center justify-center p-1 hover:border-crimson hover:bg-crimson/5"
                >
                  <span className="text-lg font-bold font-mono">{spec.symbolGlyph}</span>
                  <span className="text-[9px] text-muted-foreground">{spec.nameUs}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

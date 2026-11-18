import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  generateHarmonyQuestion,
  type HarmonyPracticeType,
  type HarmonyQuestion,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const PRACTICE_TOPICS: { id: HarmonyPracticeType | "all"; label: string }[] = [
  { id: "all", label: "All Harmony Topics" },
  { id: "chord-quality", label: "Chord Qualities" },
  { id: "chord-inversion", label: "Inversions & Figured Bass" },
  { id: "roman-numeral", label: "Roman Numerals" },
  { id: "cadence-id", label: "Cadences" },
  { id: "harmonic-function", label: "Harmonic Functions" },
  { id: "voice-leading-check", label: "Voice Leading Rules" },
];

export function HarmonyPracticeCenter() {
  const piano = usePiano();

  const [topic, setTopic] = useState<HarmonyPracticeType | "all">("all");
  const [level, setLevel] = useState<"Beginner" | "Intermediate">("Beginner");

  const [question, setQuestion] = useState<HarmonyQuestion>(() =>
    generateHarmonyQuestion("chord-quality", "Beginner"),
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Statistics
  const [stats, setStats] = useState({
    attempts: 0,
    correct: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const nextTopicType = (): HarmonyPracticeType => {
    if (topic !== "all") return topic;
    const types: HarmonyPracticeType[] =
      level === "Beginner"
        ? ["chord-quality", "chord-inversion", "roman-numeral", "cadence-id", "harmonic-function"]
        : [
            "chord-quality",
            "chord-inversion",
            "roman-numeral",
            "cadence-id",
            "harmonic-function",
            "voice-leading-check",
          ];
    return types[Math.floor(Math.random() * types.length)]!;
  };

  const loadNewQuestion = () => {
    const qType = nextTopicType();
    const q = generateHarmonyQuestion(qType, level);
    setQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  useEffect(() => {
    loadNewQuestion();
  }, [topic, level]);

  const playChordAudio = () => {
    if (question.notesToPlay && question.notesToPlay.length > 0) {
      question.notesToPlay.forEach((n) => piano.noteOn(n));
      setTimeout(() => {
        question.notesToPlay?.forEach((n) => piano.noteOff(n));
      }, 1200);
    } else if (question.chordsToInspect && question.chordsToInspect.length > 0) {
      // Play sequential SATB chords
      question.chordsToInspect.forEach((c, idx) => {
        setTimeout(() => {
          piano.noteOn(c.soprano);
          piano.noteOn(c.alto);
          piano.noteOn(c.tenor);
          piano.noteOn(c.bass);
          setTimeout(() => {
            piano.noteOff(c.soprano);
            piano.noteOff(c.alto);
            piano.noteOff(c.tenor);
            piano.noteOff(c.bass);
          }, 800);
        }, idx * 950);
      });
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === question.correctAnswer;
    setIsCorrect(correct);

    // Play audio reinforcement
    playChordAudio();

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

  // Staff chords for display
  const staffChords: StaffChord[] = useMemo(() => {
    if (question.notesToPlay && question.notesToPlay.length > 0) {
      return [
        {
          keys: question.notesToPlay,
          duration: "w" as const,
        },
      ];
    }
    return [];
  }, [question.notesToPlay]);

  return (
    <div className="space-y-6">
      {/* Configuration & Performance Header */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Topic & Level Controls */}
        <div className="md:col-span-2 rounded-[2px] border border-border bg-paper p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Practice Area
            </span>
            <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
              <Button
                type="button"
                variant={level === "Beginner" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLevel("Beginner")}
                className="h-7 text-xs font-medium"
              >
                Beginner
              </Button>
              <Button
                type="button"
                variant={level === "Intermediate" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLevel("Intermediate")}
                className="h-7 text-xs font-medium"
              >
                Intermediate
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRACTICE_TOPICS.map((t) => (
              <Button
                key={t.id}
                type="button"
                variant={topic === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTopic(t.id)}
                className="h-8 text-xs font-medium px-3"
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Live Performance Stats */}
        <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Trophy className="size-3.5 text-crimson" />
              <span>Session Score</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetStats}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-2 my-2 text-center">
            <div className="rounded bg-muted/30 p-2">
              <div className="text-xl font-bold font-mono text-foreground">{stats.attempts}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Tries</div>
            </div>
            <div className="rounded bg-muted/30 p-2">
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {stats.correct}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Correct</div>
            </div>
            <div className="rounded bg-muted/30 p-2">
              <div className="text-xl font-bold font-mono text-crimson">
                {stats.currentStreak}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Streak</div>
            </div>
            <div className="rounded bg-muted/30 p-2">
              <div className="text-xl font-bold font-mono text-foreground">{accuracyRate}%</div>
              <div className="text-[10px] text-muted-foreground uppercase">Acc.</div>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground text-center">
            Best streak: <span className="font-semibold text-foreground">{stats.bestStreak}</span>
          </div>
        </div>
      </div>

      {/* Main Question Panel */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-crimson/10 px-2 py-0.5 text-xs font-bold font-mono uppercase tracking-wider text-crimson">
              {question.level} Level
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {question.type.replace(/-/g, " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(question.notesToPlay || question.chordsToInspect) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playChordAudio}
                className="h-8 text-xs font-medium gap-1.5"
              >
                <Volume2 className="size-3.5 text-crimson" />
                <span>Hear Chord / Progression</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="h-8 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="size-3.5" />
              <span>{showHint ? "Hide Hint" : "Hint"}</span>
            </Button>
          </div>
        </div>

        {/* Prompt */}
        <div>
          <h3 className="text-lg font-semibold text-foreground leading-snug">
            {question.prompt}
          </h3>
          {showHint && (
            <div className="mt-3 rounded border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              <strong className="font-semibold">Hint: </strong>
              {question.hint}
            </div>
          )}
        </div>

        {/* Optional Visual Staff or Voice Leading Breakdown */}
        {staffChords.length > 0 && (
          <div className="rounded border border-border bg-white dark:bg-zinc-950 p-4 overflow-x-auto flex flex-col items-center justify-center">
            <Staff
              clef="treble"
              chords={staffChords}
              height={140}
              label="Musical staff showing practice chord"
            />
            <div className="text-[11px] font-mono text-muted-foreground mt-2">
              Engraved pitches:{" "}
              {question.notesToPlay?.map((n) => displayNote(n)).join(", ")}
            </div>
          </div>
        )}

        {question.chordsToInspect && (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {question.chordsToInspect.map((c, i) => (
              <div
                key={i}
                className="rounded border border-border bg-muted/20 p-3 space-y-1 text-center font-mono text-xs"
              >
                <div className="font-bold text-sm text-crimson">
                  Chord {i + 1} {c.roman ? `(${c.roman})` : ""}
                </div>
                <div className="text-muted-foreground">S: {displayNote(c.soprano)}</div>
                <div className="text-muted-foreground">A: {displayNote(c.alto)}</div>
                <div className="text-muted-foreground">T: {displayNote(c.tenor)}</div>
                <div className="text-muted-foreground">B: {displayNote(c.bass)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="grid gap-3 sm:grid-cols-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isTargetCorrect = option === question.correctAnswer;

            let buttonStyle = "border-border hover:border-foreground/40 bg-paper";
            if (isAnswered) {
              if (isTargetCorrect) {
                buttonStyle =
                  "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold";
              } else if (isSelected) {
                buttonStyle =
                  "border-crimson bg-crimson/10 text-crimson-deep dark:text-crimson font-semibold";
              } else {
                buttonStyle = "border-border/60 bg-muted/20 text-muted-foreground opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                data-testid="harmony-practice-option"
                disabled={isAnswered}
                onClick={() => handleSelectAnswer(option)}
                className={cn(
                  "flex items-center justify-between rounded-[2px] border p-4 text-left text-sm transition-all focus:outline-none focus:ring-1 focus:ring-crimson",
                  buttonStyle,
                )}
              >
                <span className="flex-1 font-medium">{option}</span>
                {isAnswered && isTargetCorrect && (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                )}
                {isAnswered && isSelected && !isTargetCorrect && (
                  <XCircle className="size-4 text-crimson shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next Button */}
        {isAnswered && (
          <div
            className={cn(
              "rounded-[2px] border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-200",
              isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200"
                : "border-crimson/30 bg-crimson/10 text-crimson-deep dark:text-rose-200",
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Academic Analysis Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-crimson" />
                    <span>Incorrect. Correct answer: {question.correctAnswer}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>

            <Button
              type="button"
              onClick={loadNewQuestion}
              className="shrink-0 gap-1.5 font-semibold text-xs h-9 px-4"
            >
              <span>Next Exercise</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

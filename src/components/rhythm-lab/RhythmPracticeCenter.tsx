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
  getRhythmAudioContext,
  scheduleClickTone,
  scheduleRhythmTone,
} from "@/lib/music/rhythm-audio";
import {
  generateRhythmQuestion,
  NoteDurationSpec,
  RHYTHM_DURATIONS_CATALOG,
  RhythmPracticeCategory,
  RhythmQuestion,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

const PRACTICE_TOPICS: { id: RhythmPracticeCategory | "all"; label: string }[] = [
  { id: "all", label: "All Topics" },
  { id: "duration-id", label: "Note & Rest Durations" },
  { id: "incomplete-measure", label: "Incomplete Measures" },
  { id: "time-signature-id", label: "Time Signatures" },
  { id: "simple-vs-compound", label: "Simple vs. Compound" },
  { id: "accent-hierarchy", label: "Accent Hierarchy" },
  { id: "dotted-values", label: "Dotted Values & Ties" },
  { id: "syncopation-id", label: "Syncopation" },
];

export function RhythmPracticeCenter() {
  const [topic, setTopic] = useState<RhythmPracticeCategory | "all">("all");
  const [level, setLevel] = useState<"Beginner" | "Intermediate">("Beginner");

  const [question, setQuestion] = useState<RhythmQuestion>(() =>
    generateRhythmQuestion("duration-id", "Beginner"),
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Stats tracking
  const [stats, setStats] = useState({
    attempts: 0,
    correct: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  const nextTopicType = (): RhythmPracticeCategory => {
    if (topic !== "all") return topic;
    const types: RhythmPracticeCategory[] =
      level === "Beginner"
        ? ["duration-id", "incomplete-measure", "time-signature-id", "simple-vs-compound", "accent-hierarchy"]
        : [
            "duration-id",
            "incomplete-measure",
            "time-signature-id",
            "simple-vs-compound",
            "accent-hierarchy",
            "dotted-values",
            "syncopation-id",
          ];
    return types[Math.floor(Math.random() * types.length)]!;
  };

  const loadNewQuestion = () => {
    const qType = nextTopicType();
    const q = generateRhythmQuestion(qType, level);
    setQuestion(q);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  useEffect(() => {
    loadNewQuestion();
  }, [topic, level]);

  const playQuestionAudio = () => {
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    if (question.previewDurations && question.previewDurations.length > 0) {
      const bpm = question.tempoBpm ?? 90;
      const secondsPerQuarter = 60 / bpm;
      let cumulativeTime = 0;

      question.previewDurations.forEach((d, idx) => {
        const spec = RHYTHM_DURATIONS_CATALOG.find((s) => s.id === d);
        const durSec = (spec?.quarterBeats ?? 1) * secondsPerQuarter;
        const soundTime = ctx.currentTime + cumulativeTime;

        scheduleClickTone(ctx, soundTime, idx === 0 ? "downbeat" : "unaccented");
        if (!spec?.isRest) {
          scheduleRhythmTone(ctx, soundTime, durSec * 0.9, 440, idx === 0);
        }
        cumulativeTime += durSec;
      });
    } else {
      // Metronome cue
      scheduleClickTone(ctx, ctx.currentTime, "downbeat");
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === question.correctAnswer;
    setIsCorrect(correct);

    playQuestionAudio();

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

  const staffChords: StaffChord[] = useMemo(() => {
    if (question.previewDurations && question.previewDurations.length > 0) {
      return question.previewDurations.map((d) => {
        const spec = RHYTHM_DURATIONS_CATALOG.find((s) => s.id === d);
        return {
          keys: spec?.isRest ? [] : ["C4"],
          duration: d,
        };
      });
    }
    return [];
  }, [question.previewDurations]);

  return (
    <div className="space-y-6">
      {/* Category & Performance Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Practice Topics */}
        <div className="md:col-span-2 rounded-[2px] border border-border bg-paper p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Practice Category
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

        {/* Performance Scorecard */}
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-crimson/10 px-2 py-0.5 text-xs font-bold font-mono uppercase tracking-wider text-crimson">
              {question.level} Level
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {question.category.replace(/-/g, " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {question.previewDurations && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playQuestionAudio}
                className="h-8 text-xs font-medium gap-1.5"
              >
                <Volume2 className="size-3.5 text-crimson" />
                <span>Hear Rhythm Example</span>
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

        {/* Staff Visualizer if previewDurations exist */}
        {staffChords.length > 0 && (
          <div className="rounded border border-border bg-white dark:bg-zinc-950 p-4 flex flex-col items-center justify-center">
            <Staff
              clef="treble"
              chords={staffChords}
              timeSignature={question.timeSignature ?? "4/4"}
              height={140}
              label="Musical staff for practice question"
            />
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
                data-testid="rhythm-practice-option"
                disabled={isAnswered}
                onClick={() => handleSelectAnswer(option)}
                className={cn(
                  "flex items-center justify-between rounded-[2px] border p-4 text-left text-sm transition-all focus:outline-none focus:ring-1 focus:ring-crimson cursor-pointer",
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

        {/* Answer Feedback & Next Button */}
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
                    <span>Rhythmic Calculation Correct!</span>
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

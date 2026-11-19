import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Headphones,
  Info,
  Layers,
  Music2,
  Piano,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface EarTrainingOverviewProps {
  onSelectSection: (section: string) => void;
  level: "Beginner" | "Intermediate" | "Advanced";
  onChangeLevel: (level: "Beginner" | "Intermediate" | "Advanced") => void;
  sessionStats: {
    attempts: number;
    correct: number;
    currentStreak: number;
    bestStreak: number;
  };
  onResetStats: () => void;
}

export function EarTrainingOverview({
  onSelectSection,
  level,
  onChangeLevel,
  sessionStats,
  onResetStats,
}: EarTrainingOverviewProps) {
  const accuracyRate =
    sessionStats.attempts > 0
      ? Math.round((sessionStats.correct / sessionStats.attempts) * 100)
      : 0;

  const MODULE_CARDS = [
    {
      id: "pitch",
      title: "Pitch Recognition",
      icon: Volume2,
      tag: "Foundational",
      description: "Develop acute pitch discrimination, register awareness, and high-versus-low contour identification.",
    },
    {
      id: "intervals",
      title: "Interval Recognition",
      icon: Music2,
      tag: "13 Intervals",
      description: "Master all 13 diatonic and chromatic intervals ascending, descending, and simultaneously (harmonic).",
    },
    {
      id: "chords",
      title: "Chord Quality Recognition",
      icon: Layers,
      tag: "8 Voicings",
      description: "Identify Major, Minor, Diminished, Augmented triads and 7th chords by acoustic colour and tension.",
    },
    {
      id: "dictation",
      title: "Melodic Dictation",
      icon: Piano,
      tag: "Aural Transcription",
      description: "Listen to short classical melodic phrases and reconstruct their exact pitch structure on the virtual keyboard and staff.",
    },
    {
      id: "harmonic",
      title: "Harmonic Listening",
      icon: Compass,
      tag: "Cadences & Movement",
      description: "Recognize tonic stability, dominant tension, authentic and plagal cadences, and harmonic progressions by ear.",
    },
    {
      id: "practice",
      title: "Comprehensive Practice Centre",
      icon: Trophy,
      tag: "Drills & Streaks",
      description: "Unified multi-topic listening quizzes with progressive scoring, hints, and immediate academic feedback.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Banner */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded bg-crimson/10 p-2.5 text-crimson-deep dark:bg-crimson/20 shrink-0">
              <Headphones className="size-6" />
            </div>
            <div>
              <span className="eyebrow text-crimson-deep">Aural Pedagogy</span>
              <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
                The Science & Art of Relative Pitch Training
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
                Ear training develops <strong>relative pitch</strong>: the cognitive ability to recognize, understand, remember, and transcribe musical sounds through their relationships to one another and to a tonal center. Contrary to popular misconception, musical fluency does not require innate &apos;perfect pitch&apos;; great composers and conductors rely on disciplined relative pitch.
              </p>
            </div>
          </div>

          {/* Difficulty Level Toggle */}
          <div className="shrink-0 rounded border border-border p-1 bg-muted/20 flex flex-col items-start gap-1">
            <span className="text-[10px] uppercase font-mono font-semibold text-muted-foreground px-2 pt-1">
              Curriculum Level:
            </span>
            <div className="flex gap-1">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                <Button
                  key={lvl}
                  type="button"
                  variant={level === lvl ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onChangeLevel(lvl)}
                  className="h-7 text-xs font-medium"
                >
                  {lvl}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Session Performance Scorecard */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-crimson" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Current Session Performance:
          </span>
        </div>

        <div className="flex items-center gap-4 text-center font-mono">
          <div className="px-3 py-1 rounded bg-muted/30">
            <span className="text-xs text-muted-foreground block text-[10px] uppercase">Attempts</span>
            <strong className="text-base text-foreground">{sessionStats.attempts}</strong>
          </div>
          <div className="px-3 py-1 rounded bg-muted/30">
            <span className="text-xs text-muted-foreground block text-[10px] uppercase">Correct</span>
            <strong className="text-base text-emerald-600 dark:text-emerald-400">{sessionStats.correct}</strong>
          </div>
          <div className="px-3 py-1 rounded bg-muted/30">
            <span className="text-xs text-muted-foreground block text-[10px] uppercase">Streak</span>
            <strong className="text-base text-crimson">{sessionStats.currentStreak}</strong>
          </div>
          <div className="px-3 py-1 rounded bg-muted/30">
            <span className="text-xs text-muted-foreground block text-[10px] uppercase">Accuracy</span>
            <strong className="text-base text-foreground">{accuracyRate}%</strong>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetStats}
          className="h-7 text-xs gap-1.5"
        >
          <RotateCcw className="size-3" />
          <span>Reset Session</span>
        </Button>
      </div>

      {/* Category Selection Cards */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <h4 className="font-display text-lg font-bold text-foreground">
            Available Ear Training Disciplines
          </h4>
          <span className="text-xs text-muted-foreground">6 Interactive Studios</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_CARDS.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onSelectSection(mod.id)}
                className="group rounded-[2px] border border-border bg-paper p-5 flex flex-col justify-between hover:border-crimson/80 hover:shadow-sm transition-all duration-150 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="rounded bg-muted/40 p-2 text-foreground group-hover:bg-crimson group-hover:text-white transition-colors">
                      <Icon className="size-4" />
                    </div>
                    <span className="rounded bg-muted/40 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                      {mod.tag}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-display text-base font-bold text-foreground group-hover:text-crimson transition-colors">
                      {mod.title}
                    </h5>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between text-xs text-crimson font-medium">
                  <span>Enter Studio</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

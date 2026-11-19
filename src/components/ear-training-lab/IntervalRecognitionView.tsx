import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Music2,
  RotateCcw,
  Volume2,
  XCircle,
  Layers,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildInterval,
  INTERVALS_CATALOG,
  IntervalDefinition,
  IntervalDirection,
} from "@/lib/music/ear-training-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface IntervalRecognitionViewProps {
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

const ROOT_OPTIONS = ["C4", "D4", "Eb4", "F4", "G4", "A4", "Bb3"];

export function IntervalRecognitionView({
  difficulty = "Beginner",
}: IntervalRecognitionViewProps) {
  const piano = usePiano();

  // Exploration state
  const [activeTab, setActiveTab] = useState<"explore" | "test">("explore");
  const [selectedRoot, setSelectedRoot] = useState<string>("C4");
  const [direction, setDirection] = useState<IntervalDirection>("ascending");
  const [selectedInterval, setSelectedInterval] = useState<IntervalDefinition>(
    INTERVALS_CATALOG[7]!, // Default: Perfect Fifth
  );

  // Drill / Test State
  const [testRoot, setTestRoot] = useState<string>("C4");
  const [testInterval, setTestInterval] = useState<IntervalDefinition>(
    INTERVALS_CATALOG[7]!,
  );
  const [testDirection, setTestDirection] = useState<IntervalDirection>("ascending");
  const [testOptions, setTestOptions] = useState<IntervalDefinition[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<IntervalDefinition | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Scorecard
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
  });

  // Play an interval (Ascending, Descending, or Harmonic)
  const playIntervalAudio = useCallback(
    (root: string, intervalDef: IntervalDefinition, dir: IntervalDirection) => {
      setIsPlaying(true);
      const built = buildInterval(root, intervalDef.semitones, dir);

      if (dir === "harmonic") {
        // Both simultaneously
        piano.playPhrase(
          [
            {
              notes: [built.rootNote, built.targetNote],
              at: 0,
              duration: 1.5,
            },
          ],
          () => setIsPlaying(false),
        );
      } else {
        // Linear: root then target
        piano.playPhrase(
          [
            { notes: [built.rootNote], at: 0, duration: 0.8 },
            { notes: [built.targetNote], at: 0.9, duration: 1.0 },
          ],
          () => setIsPlaying(false),
        );
      }
    },
    [piano],
  );

  // Filter available intervals based on difficulty level for testing
  const getIntervalPool = useCallback(() => {
    if (difficulty === "Beginner") {
      // P1, M2, M3, P4, P5, P8
      return INTERVALS_CATALOG.filter((i) => [0, 2, 4, 5, 7, 12].includes(i.semitones));
    }
    if (difficulty === "Intermediate") {
      // Add m2, m3, m6, M6
      return INTERVALS_CATALOG.filter((i) => [1, 2, 3, 4, 5, 7, 8, 9, 12].includes(i.semitones));
    }
    // Advanced: all 13 intervals including Tritone, m7, M7
    return INTERVALS_CATALOG;
  }, [difficulty]);

  // Generate a new interval test question
  const generateNewTest = useCallback(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setReplayCount(0);

    const pool = getIntervalPool();
    const correct = pool[Math.floor(Math.random() * pool.length)]!;
    const root = ROOT_OPTIONS[Math.floor(Math.random() * ROOT_OPTIONS.length)]!;
    const dirs: IntervalDirection[] =
      difficulty === "Advanced"
        ? ["ascending", "descending", "harmonic"]
        : difficulty === "Intermediate"
          ? ["ascending", "descending"]
          : ["ascending"];
    const chosenDir = dirs[Math.floor(Math.random() * dirs.length)]!;

    // Distractors
    const otherPool = pool.filter((i) => i.semitones !== correct.semitones);
    const shuffledOthers = [...otherPool].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correct, ...shuffledOthers].sort((a, b) => a.semitones - b.semitones);

    setTestRoot(root);
    setTestInterval(correct);
    setTestDirection(chosenDir);
    setTestOptions(options);

    // Play sound after small delay
    setTimeout(() => {
      playIntervalAudio(root, correct, chosenDir);
      setReplayCount(1);
    }, 250);
  }, [difficulty, getIntervalPool, playIntervalAudio]);

  // Answer handler
  const handleAnswerSelect = (option: IntervalDefinition) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const isCorrect = option.semitones === testInterval.semitones;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  // Switch to test tab and initialize
  const handleStartTest = () => {
    setActiveTab("test");
    generateNewTest();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Score */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "explore" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("explore")}
            className="text-xs"
          >
            <Music2 className="mr-1.5 h-3.5 w-3.5" />
            Explore Intervals
          </Button>
          <Button
            variant={activeTab === "test" ? "default" : "outline"}
            size="sm"
            onClick={handleStartTest}
            className="text-xs"
          >
            Interval Ear Drill
          </Button>
        </div>

        {activeTab === "test" && (
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
        )}
      </div>

      {/* TAB 1: EXPLORE INTERVALS */}
      {activeTab === "explore" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Root Pitch
                </label>
                <div className="flex flex-wrap gap-1">
                  {ROOT_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoot(r)}
                      className={cn(
                        "px-2.5 py-1 text-xs rounded border transition-colors",
                        selectedRoot === r
                          ? "bg-crimson-deep text-white border-crimson-deep font-semibold"
                          : "border-border/60 hover:bg-paper",
                      )}
                    >
                      {displayNote(r)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Direction & Voicing
                </label>
                <div className="flex gap-1">
                  <Button
                    variant={direction === "ascending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDirection("ascending")}
                    className="h-7 text-xs"
                  >
                    <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                    Ascending
                  </Button>
                  <Button
                    variant={direction === "descending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDirection("descending")}
                    className="h-7 text-xs"
                  >
                    <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
                    Descending
                  </Button>
                  <Button
                    variant={direction === "harmonic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDirection("harmonic")}
                    className="h-7 text-xs"
                  >
                    <Layers className="mr-1 h-3.5 w-3.5" />
                    Harmonic
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => playIntervalAudio(selectedRoot, selectedInterval, direction)}
              disabled={isPlaying}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
              Audition {selectedInterval.shortName}
            </Button>
          </div>

          {/* 13 Intervals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {INTERVALS_CATALOG.map((item) => {
              const isSelected = selectedInterval.semitones === item.semitones;
              const built = buildInterval(selectedRoot, item.semitones, direction);

              return (
                <div
                  key={item.semitones}
                  onClick={() => {
                    setSelectedInterval(item);
                    playIntervalAudio(selectedRoot, item, direction);
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border p-4 transition-all text-left space-y-2",
                    isSelected
                      ? "border-crimson-deep bg-crimson-deep/5 shadow-md ring-1 ring-crimson-deep"
                      : "border-border/60 bg-card hover:border-crimson-deep/40 hover:bg-paper/60",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-foreground">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-paper border border-border/60">
                      {item.shortName}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      {item.semitones} semitone{item.semitones !== 1 ? "s" : ""}
                    </span>
                    <span className="font-mono text-[11px]">{item.ratioName}</span>
                  </div>

                  <div className="pt-1 border-t border-border/40 text-xs">
                    <span className="text-crimson-deep font-medium block truncate">
                      ♫ {item.mnemonicSong}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                      Target: {displayNote(built.targetNote)} ({built.direction})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector Card */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-foreground">
                {selectedInterval.name} ({selectedInterval.shortName}) Acoustic Profile
              </h4>
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium capitalize",
                  selectedInterval.consonanceType === "perfect-consonance"
                    ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200"
                    : selectedInterval.consonanceType === "imperfect-consonance"
                      ? "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200"
                      : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200",
                )}
              >
                {selectedInterval.consonanceType.replace("-", " ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedInterval.description}
            </p>
            <div className="text-xs text-foreground bg-paper/60 p-3 rounded-lg border border-border/40 flex flex-wrap gap-4">
              <span>
                <strong>Acoustic Ratio:</strong> {selectedInterval.ratioName}
              </span>
              <span>
                <strong>Popular Song Mnemonic:</strong> {selectedInterval.mnemonicSong}
              </span>
              <span>
                <strong>Semitone Span:</strong> {selectedInterval.semitones} Half-Steps
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERVAL EAR DRILL */}
      {activeTab === "test" && (
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                Interval Identification ({testDirection} Voicing)
              </span>
              <h3 className="font-display text-xl font-bold text-foreground mt-1">
                Listen to the interval sounded from {displayNote(testRoot)}. What is the interval?
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  playIntervalAudio(testRoot, testInterval, testDirection);
                  setReplayCount((c) => c + 1);
                }}
                disabled={isPlaying}
                className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[130px]"
              >
                <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
                {isPlaying ? "Playing..." : `Replay (${replayCount})`}
              </Button>

              {!isAnswered && !showHint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-xs"
                >
                  <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  Mnemonic Hint
                </Button>
              )}
            </div>
          </div>

          {/* Optional Mnemonic Hint */}
          {showHint && !isAnswered && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <strong>Song Mnemonic Hint:</strong> Think of the opening interval in: "
                <em>{testInterval.mnemonicSong}</em>".
              </span>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {testOptions.map((opt) => {
              const isSelected = selectedAnswer?.semitones === opt.semitones;
              const isCorrect = opt.semitones === testInterval.semitones;
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
                  key={opt.semitones}
                  onClick={() => handleAnswerSelect(opt)}
                  disabled={isAnswered}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border text-left transition-all shadow-sm",
                    btnStyle,
                  )}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {opt.name} ({opt.shortName})
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {opt.semitones} semitone{opt.semitones !== 1 ? "s" : ""} • {opt.ratioName}
                    </div>
                  </div>
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
                selectedAnswer?.semitones === testInterval.semitones
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {selectedAnswer?.semitones === testInterval.semitones ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-semibold text-sm">
                    {selectedAnswer?.semitones === testInterval.semitones
                      ? "Splendid Hearing!"
                      : `Target was ${testInterval.name} (${testInterval.shortName})`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  {testInterval.name} ({testInterval.semitones} semitones). Popular mnemonic: "
                  {testInterval.mnemonicSong}". {testInterval.description}
                </p>
              </div>

              <Button
                size="sm"
                onClick={generateNewTest}
                className="shrink-0 bg-charcoal text-paper hover:bg-charcoal/90"
              >
                Next Interval
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

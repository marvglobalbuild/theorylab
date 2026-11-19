import {
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Music2,
  Volume2,
  XCircle,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildChord,
  CHORD_TYPES_CATALOG,
  ChordQuality,
  ChordTypeDefinition,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface ChordRecognitionViewProps {
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}

const ROOT_OPTIONS = ["C", "G", "F", "D", "A", "Eb", "Bb"];

// 8 Core qualities for ear training
const EAR_TRAINING_CHORD_QUALITIES: ChordQuality[] = [
  "major",
  "minor",
  "diminished",
  "augmented",
  "dominant-7",
  "major-7",
  "minor-7",
  "half-diminished-7",
];

export function ChordRecognitionView({
  difficulty = "Beginner",
}: ChordRecognitionViewProps) {
  const piano = usePiano();

  // Exploration state
  const [activeTab, setActiveTab] = useState<"explore" | "test">("explore");
  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>("major");
  const [voicingStyle, setVoicingStyle] = useState<"block" | "arpeggio">("block");

  // Test / Drill state
  const [testRoot, setTestRoot] = useState<string>("C");
  const [testQuality, setTestQuality] = useState<ChordQuality>("major");
  const [testVoicingStyle, setTestVoicingStyle] = useState<"block" | "arpeggio">("block");
  const [testOptions, setTestOptions] = useState<ChordTypeDefinition[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<ChordQuality | null>(null);
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

  // Play chord audio (block or arpeggiated)
  const playChordAudio = useCallback(
    (root: string, quality: ChordQuality, style: "block" | "arpeggio") => {
      setIsPlaying(true);
      const chord = buildChord(root, quality, 4);

      if (style === "block") {
        piano.playPhrase(
          [
            {
              notes: chord.notes,
              at: 0,
              duration: 1.8,
            },
          ],
          () => setIsPlaying(false),
        );
      } else {
        // Arpeggiate notes ascending with 0.28s spacing, followed by sustained block chord
        const steps = chord.notes.map((n, idx) => ({
          notes: [n],
          at: idx * 0.28,
          duration: 0.6,
        }));
        // Final chord restrike
        steps.push({
          notes: chord.notes,
          at: chord.notes.length * 0.28 + 0.15,
          duration: 1.2,
        });

        piano.playPhrase(steps, () => setIsPlaying(false));
      }
    },
    [piano],
  );

  // Filter chord qualities based on level
  const getQualityPool = useCallback((): ChordTypeDefinition[] => {
    const catalog = CHORD_TYPES_CATALOG.filter((c) =>
      EAR_TRAINING_CHORD_QUALITIES.includes(c.id),
    );
    if (difficulty === "Beginner") {
      // Major & Minor triads
      return catalog.filter((c) => ["major", "minor"].includes(c.id));
    }
    if (difficulty === "Intermediate") {
      // All 4 triads: major, minor, diminished, augmented
      return catalog.filter((c) =>
        ["major", "minor", "diminished", "augmented"].includes(c.id),
      );
    }
    // Advanced: all 8 chords including 7ths
    return catalog;
  }, [difficulty]);

  // Generate new test
  const generateNewTest = useCallback(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
    setReplayCount(0);

    const pool = getQualityPool();
    const correct = pool[Math.floor(Math.random() * pool.length)]!;
    const root = ROOT_OPTIONS[Math.floor(Math.random() * ROOT_OPTIONS.length)]!;
    const style: "block" | "arpeggio" = Math.random() > 0.4 ? "block" : "arpeggio";

    const others = pool.filter((c) => c.id !== correct.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [correct, ...shuffledOthers].sort(() => 0.5 - Math.random());

    setTestRoot(root);
    setTestQuality(correct.id);
    setTestVoicingStyle(style);
    setTestOptions(options);

    setTimeout(() => {
      playChordAudio(root, correct.id, style);
      setReplayCount(1);
    }, 250);
  }, [getQualityPool, playChordAudio]);

  const handleAnswerSelect = (quality: ChordQuality) => {
    if (isAnswered) return;
    setSelectedAnswer(quality);
    setIsAnswered(true);

    const isCorrect = quality === testQuality;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  const handleStartTest = () => {
    setActiveTab("test");
    generateNewTest();
  };

  const currentChordDef =
    CHORD_TYPES_CATALOG.find((c) => c.id === selectedQuality) ?? CHORD_TYPES_CATALOG[0]!;
  const currentBuiltChord = buildChord(selectedRoot, selectedQuality, 4);

  const testChordDef =
    CHORD_TYPES_CATALOG.find((c) => c.id === testQuality) ?? CHORD_TYPES_CATALOG[0]!;

  return (
    <div className="space-y-6">
      {/* Header Tabs & Score */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "explore" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("explore")}
            className="text-xs"
          >
            <Music2 className="mr-1.5 h-3.5 w-3.5" />
            Chord Library & Voicings
          </Button>
          <Button
            variant={activeTab === "test" ? "default" : "outline"}
            size="sm"
            onClick={handleStartTest}
            className="text-xs"
          >
            Chord Ear Drill
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

      {/* TAB 1: EXPLORE CHORDS */}
      {activeTab === "explore" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Root Key
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
                  Audition Style
                </label>
                <div className="flex gap-1">
                  <Button
                    variant={voicingStyle === "block" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoicingStyle("block")}
                    className="h-7 text-xs"
                  >
                    <Layers className="mr-1 h-3.5 w-3.5" />
                    Block Chord
                  </Button>
                  <Button
                    variant={voicingStyle === "arpeggio" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVoicingStyle("arpeggio")}
                    className="h-7 text-xs"
                  >
                    <ArrowRight className="mr-1 h-3.5 w-3.5" />
                    Arpeggio
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => playChordAudio(selectedRoot, selectedQuality, voicingStyle)}
              disabled={isPlaying}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
              Audition {selectedRoot} {currentChordDef.symbolSuffix || "maj"}
            </Button>
          </div>

          {/* 8 Chord Qualities Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {EAR_TRAINING_CHORD_QUALITIES.map((q) => {
              const def = CHORD_TYPES_CATALOG.find((c) => c.id === q)!;
              const isSelected = selectedQuality === q;
              const chord = buildChord(selectedRoot, q, 4);

              return (
                <div
                  key={q}
                  onClick={() => {
                    setSelectedQuality(q);
                    playChordAudio(selectedRoot, q, voicingStyle);
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
                      {def.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-paper border border-border/60">
                      {def.symbolSuffix || "maj"}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center justify-between font-mono">
                    <span>{def.intervalNames.join(" - ")}</span>
                    <span>{chord.notes.map((n) => displayNote(n)).join(" ")}</span>
                  </div>

                  <div className="pt-1 border-t border-border/40 text-xs text-muted-foreground line-clamp-2">
                    {def.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector Card */}
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-lg font-bold text-foreground">
                {displayNote(selectedRoot)} {currentChordDef.name} Acoustic Profile
              </h4>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-paper border border-border/60">
                Pitches: {currentBuiltChord.notes.map((n) => displayNote(n)).join(", ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentChordDef.description}
            </p>
            <div className="text-xs text-foreground bg-paper/60 p-3 rounded-lg border border-border/40 flex flex-wrap gap-4">
              <span>
                <strong>Interval Formula:</strong> {defIntervalFormula(currentChordDef)}
              </span>
              <span>
                <strong>Semitone Offsets:</strong> [{currentChordDef.semitoneOffsets.join(", ")}]
              </span>
              <span>
                <strong>Category:</strong>{" "}
                {currentChordDef.isSeventh ? "4-Note Seventh Chord" : "3-Note Triad"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHORD EAR DRILL */}
      {activeTab === "test" && (
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                Chord Quality Recognition ({testVoicingStyle} Playback)
              </span>
              <h3 className="font-display text-xl font-bold text-foreground mt-1">
                Listen to the chord sounding in the key of {displayNote(testRoot)}. Identify its quality.
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  playChordAudio(testRoot, testQuality, testVoicingStyle);
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
                  Acoustic Hint
                </Button>
              )}
            </div>
          </div>

          {/* Optional Acoustic Hint */}
          {showHint && !isAnswered && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                <strong>Acoustic Hint:</strong> Notice the internal quality —{" "}
                {testQuality.includes("minor") || testQuality.includes("diminished")
                  ? "is the third minor (darker, introspective)?"
                  : "is the third major (bright, open)?"}{" "}
                {testQuality.includes("diminished") || testQuality.includes("7")
                  ? "Listen for the tension of a tritone or seventh."
                  : "Listen for the stability of a perfect fifth."}
              </span>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {testOptions.map((opt) => {
              const isSelected = selectedAnswer === opt.id;
              const isCorrect = opt.id === testQuality;
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
                  key={opt.id}
                  onClick={() => handleAnswerSelect(opt.id)}
                  disabled={isAnswered}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border text-left transition-all shadow-sm",
                    btnStyle,
                  )}
                >
                  <div>
                    <div className="font-semibold text-sm">
                      {opt.name} ({opt.symbolSuffix || "maj"})
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Formula: {defIntervalFormula(opt)}
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
                selectedAnswer === testQuality
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {selectedAnswer === testQuality ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="font-semibold text-sm">
                    {selectedAnswer === testQuality
                      ? "Accurate Chord Quality!"
                      : `Sounded Chord was ${testChordDef.name}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  {displayNote(testRoot)} {testChordDef.name} ({defIntervalFormula(testChordDef)}
                  ). {testChordDef.description}
                </p>
              </div>

              <Button
                size="sm"
                onClick={generateNewTest}
                className="shrink-0 bg-charcoal text-paper hover:bg-charcoal/90"
              >
                Next Chord
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function defIntervalFormula(def: ChordTypeDefinition): string {
  return def.formula || def.intervalNames.join(" - ");
}

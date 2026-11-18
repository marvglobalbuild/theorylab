import {
  Activity,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  MicClapDetector,
  scheduleClickTone,
  scheduleRhythmTone,
} from "@/lib/music/rhythm-audio";
import {
  evaluateRhythmPerformance,
  RHYTHM_DURATIONS_CATALOG,
  RHYTHM_PATTERN_PRESETS,
  type RhythmicPatternPreset,
  type TapEvaluationResult,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

export function RhythmPerformanceStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("common-basic-quarter");
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);

  // Performance state: "idle" | "countdown" | "performing" | "completed"
  const [stage, setStage] = useState<"idle" | "countdown" | "performing" | "completed">("idle");
  const [countdownNum, setCountdownNum] = useState<number>(4);
  const [recordedTapTimes, setRecordedTapTimes] = useState<number[]>([]);
  const [result, setResult] = useState<TapEvaluationResult | null>(null);

  const performanceStartTimeRef = useRef<number>(0);
  const expectedTimingsRef = useRef<number[]>([]);
  const micDetectorRef = useRef<MicClapDetector | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const exerciseTimerRef = useRef<number | null>(null);

  const preset: RhythmicPatternPreset = useMemo(() => {
    return (
      RHYTHM_PATTERN_PRESETS.find((p) => p.id === selectedPresetId) ??
      RHYTHM_PATTERN_PRESETS[0]!
    );
  }, [selectedPresetId]);

  // Clean up timers and mic on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
      if (exerciseTimerRef.current) window.clearTimeout(exerciseTimerRef.current);
      micDetectorRef.current?.stop();
    };
  }, []);

  // Register tap from user (keyboard space, tap button, or mic)
  const registerTap = () => {
    if (stage !== "performing") return;
    const now = performance.now();
    const relativeTapMs = now - performanceStartTimeRef.current;
    setRecordedTapTimes((prev) => [...prev, relativeTapMs]);

    // Give subtle audio feedback click for tactile sensation
    const ctx = getRhythmAudioContext();
    if (ctx) {
      scheduleClickTone(ctx, ctx.currentTime, "subdivision", "woodblock");
    }
  };

  // Keyboard Spacebar tap handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && stage === "performing") {
        e.preventDefault();
        registerTap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage]);

  // Start Mic if requested
  const toggleMicrophone = async () => {
    if (useMicrophone) {
      micDetectorRef.current?.stop();
      setMicActive(false);
      setUseMicrophone(false);
    } else {
      micDetectorRef.current = new MicClapDetector();
      const success = await micDetectorRef.current.start(() => {
        registerTap();
      });
      if (success) {
        setMicActive(true);
        setUseMicrophone(true);
      } else {
        alert("Microphone permission denied or unsupported. Please use the Spacebar or on-screen Tap button.");
        setUseMicrophone(false);
      }
    }
  };

  // Launch Exercise
  const startExercise = () => {
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setStage("countdown");
    setCountdownNum(4);
    setRecordedTapTimes([]);
    setResult(null);

    const tempo = preset.tempoBpm;
    const secondsPerQuarter = 60 / tempo;

    // Calculate expected onset times in milliseconds relative to performance start
    let cumulativeSec = 0;
    const expectedOnsets: number[] = [];

    preset.elements.forEach((el) => {
      const spec = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === el.duration);
      if (!spec?.isRest) {
        expectedOnsets.push(Math.round(cumulativeSec * 1000));
      }
      cumulativeSec += (spec?.quarterBeats ?? 1) * secondsPerQuarter;
    });

    expectedTimingsRef.current = expectedOnsets;
    const totalExerciseMs = cumulativeSec * 1000 + 400;

    let c = 4;
    const countStep = () => {
      const now = ctx.currentTime;
      scheduleClickTone(ctx, now, c === 4 ? "downbeat" : "unaccented", "classic");

      c--;
      if (c >= 1) {
        setCountdownNum(c);
        countdownTimerRef.current = window.setTimeout(countStep, secondsPerQuarter * 1000);
      } else {
        // Switch to performing
        setStage("performing");
        performanceStartTimeRef.current = performance.now();

        // Optional metronome clicks during pattern to guide the user
        for (let i = 0; i < 4; i++) {
          scheduleClickTone(ctx, now + secondsPerQuarter * (i + 1), i === 0 ? "downbeat" : "unaccented", "classic");
        }

        // Schedule completion
        exerciseTimerRef.current = window.setTimeout(() => {
          setStage("completed");
        }, totalExerciseMs);
      }
    };

    countStep();
  };

  // When stage reaches "completed", evaluate performance
  useEffect(() => {
    if (stage === "completed") {
      const evalResult = evaluateRhythmPerformance(
        expectedTimingsRef.current,
        recordedTapTimes,
        140,
      );
      setResult(evalResult);
    }
  }, [stage, recordedTapTimes]);

  const staffChords: StaffChord[] = useMemo(() => {
    return preset.elements.map((el) => ({
      keys: el.pitch ? [el.pitch] : [],
      duration: el.duration,
    }));
  }, [preset]);

  return (
    <div className="space-y-6">
      {/* Pattern Selector & Mic Toolbar */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pattern Exercise:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RHYTHM_PATTERN_PRESETS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={selectedPresetId === p.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPresetId(p.id);
                  setStage("idle");
                  setResult(null);
                }}
                disabled={stage === "performing" || stage === "countdown"}
                className={cn(
                  "h-8 text-xs font-mono font-bold px-2.5",
                  selectedPresetId === p.id && "bg-crimson text-white hover:bg-crimson/90 border-crimson",
                )}
              >
                {p.title}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={useMicrophone ? "default" : "outline"}
            size="sm"
            onClick={toggleMicrophone}
            className="h-8 text-xs gap-1.5"
          >
            {useMicrophone ? (
              <>
                <Mic className="size-3.5 text-emerald-400" />
                <span>Microphone Input (Clap)</span>
              </>
            ) : (
              <>
                <MicOff className="size-3.5 text-muted-foreground" />
                <span>Spacebar / Touch Input</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Performance Stage */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <span className="eyebrow text-crimson-deep">Practical Tap / Clap Trainer</span>
            <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
              Perform: {preset.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tempo: {preset.tempoBpm} BPM · {preset.timeSignature} Meter · {expectedTimingsRef.current.length || preset.elements.filter(e => !e.duration.endsWith("r")).length} expected taps
            </p>
          </div>

          <div>
            {stage === "idle" && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={startExercise}
                className="h-9 text-xs bg-crimson hover:bg-crimson/90 text-white font-semibold px-5 gap-1.5"
              >
                <Play className="size-3.5" /> Start Exercise
              </Button>
            )}

            {stage === "completed" && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={startExercise}
                className="h-9 text-xs bg-crimson hover:bg-crimson/90 text-white font-semibold px-5 gap-1.5"
              >
                <RotateCcw className="size-3.5" /> Repeat Exercise
              </Button>
            )}
          </div>
        </div>

        {/* Staff Preview */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded border border-border flex flex-col items-center justify-center">
          <Staff
            chords={staffChords}
            clef="treble"
            timeSignature={preset.timeSignature}
            height={140}
            label={`Musical staff for ${preset.title}`}
          />
        </div>

        {/* Live Interaction Zone */}
        {stage === "countdown" && (
          <div className="rounded border border-amber-500/40 bg-amber-500/10 p-8 flex flex-col items-center justify-center space-y-2 animate-pulse">
            <span className="text-xs uppercase font-mono font-bold text-amber-700 dark:text-amber-400">
              Get Ready to Tap!
            </span>
            <span className="font-display text-7xl font-extrabold text-foreground font-mono">
              {countdownNum}
            </span>
          </div>
        )}

        {stage === "performing" && (
          <div className="rounded border border-crimson/40 bg-crimson/5 p-8 flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-2 text-crimson font-mono font-bold text-sm animate-pulse">
              <span className="size-3 rounded-full bg-crimson animate-ping" />
              <span>RECORDING RHYTHM... TAP IN TIME!</span>
            </div>

            {/* Big Interactive Tap Button */}
            <button
              type="button"
              onPointerDown={registerTap}
              className="size-36 sm:size-44 rounded-full border-4 border-crimson bg-crimson text-white font-display text-2xl font-bold shadow-xl active:scale-95 transition-transform flex flex-col items-center justify-center cursor-pointer select-none"
            >
              <span>TAP!</span>
              <span className="text-[11px] font-mono opacity-80 mt-1">or press Spacebar</span>
            </button>

            <div className="font-mono text-xs text-muted-foreground">
              Taps registered: <strong className="text-foreground">{recordedTapTimes.length}</strong>
            </div>
          </div>
        )}

        {/* Result & Evaluation Summary */}
        {stage === "completed" && result && (
          <div className="rounded-[2px] border border-border bg-muted/20 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <span className="eyebrow text-muted-foreground">Performance Evaluation</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h4 className="font-display text-2xl font-bold text-foreground">
                    Performance Accuracy: {result.score}%
                  </h4>
                  <span
                    className={cn(
                      "rounded px-2.5 py-0.5 text-xs font-mono font-bold",
                      result.grade === "Exemplary"
                        ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40"
                        : result.grade === "Good"
                          ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40"
                          : "bg-destructive/15 text-destructive border border-destructive/30",
                    )}
                  >
                    Grade: {result.grade}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs font-mono">
              <div className="rounded border border-border/60 bg-paper p-2.5">
                <div className="text-muted-foreground text-[10px] uppercase">Expected Notes</div>
                <div className="text-lg font-bold text-foreground mt-0.5">{result.totalExpectedNotes}</div>
              </div>
              <div className="rounded border border-border/60 bg-paper p-2.5">
                <div className="text-muted-foreground text-[10px] uppercase">Taps Recorded</div>
                <div className="text-lg font-bold text-foreground mt-0.5">{result.tapsRecorded}</div>
              </div>
              <div className="rounded border border-border/60 bg-paper p-2.5">
                <div className="text-muted-foreground text-[10px] uppercase">Perfect (±45ms)</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{result.perfectHits}</div>
              </div>
              <div className="rounded border border-border/60 bg-paper p-2.5">
                <div className="text-muted-foreground text-[10px] uppercase">Good (±85ms)</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{result.goodHits}</div>
              </div>
              <div className="rounded border border-border/60 bg-paper p-2.5">
                <div className="text-muted-foreground text-[10px] uppercase">Missed Notes</div>
                <div className="text-lg font-bold text-crimson mt-0.5">{result.missedNotes}</div>
              </div>
              <div className="rounded border border-border/60 bg-paper p-2.5">
                <div className="text-muted-foreground text-[10px] uppercase">Avg Offset</div>
                <div className="text-lg font-bold text-foreground mt-0.5">{result.averageOffsetMs} ms</div>
              </div>
            </div>

            {/* Diagnostic Feedback */}
            <div className="rounded border border-border/60 bg-paper p-4 space-y-2 text-xs">
              <span className="font-bold text-foreground block">Academic Diagnostic Analysis:</span>
              <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                {result.feedbackDetails.map((fb, idx) => (
                  <li key={idx}>{fb}</li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-muted-foreground italic">
              Note: This tool offers educational training and timing guidance. Professional music examination boards utilize specialized hardware sensors for certification.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

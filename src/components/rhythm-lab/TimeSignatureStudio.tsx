import {
  Activity,
  ArrowRight,
  BookOpen,
  Info,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  scheduleClickTone,
} from "@/lib/music/rhythm-audio";
import {
  TIME_SIGNATURES_CATALOG,
  type TimeSignatureInfo,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

export function TimeSignatureStudio() {
  const [selectedSignature, setSelectedSignature] = useState<string>("4/4");
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);

  const currentInfo: TimeSignatureInfo = useMemo(() => {
    return (
      TIME_SIGNATURES_CATALOG.find((t) => t.signature === selectedSignature) ??
      TIME_SIGNATURES_CATALOG[2]!
    );
  }, [selectedSignature]);

  const stopAudioDemo = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlayingDemo(false);
    setActiveBeatIndex(null);
  };

  useEffect(() => {
    return stopAudioDemo;
  }, [selectedSignature]);

  // Plays one measure of the time signature with authentic downbeats, secondary accents, and subdivisions
  const playMeterDemo = () => {
    stopAudioDemo();
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    setIsPlayingDemo(true);
    const bpm = 100;
    const secondsPerQuarter = 60 / bpm;
    // In compound meters, the counting syllables correspond to eighth notes
    const stepDuration =
      currentInfo.meterType === "compound"
        ? (secondsPerQuarter / 2) // eighth note duration
        : (secondsPerQuarter / (currentInfo.denominator / 4));

    const totalSteps = currentInfo.countingSyllables.length;
    let step = 0;

    const runStep = () => {
      if (step >= totalSteps) {
        setIsPlayingDemo(false);
        setActiveBeatIndex(null);
        return;
      }

      setActiveBeatIndex(step);

      // Determine accent level: step 0 is downbeat; others depend on meter accents
      const accentType = currentInfo.accents[step] ?? "weak";
      const now = ctx.currentTime;

      if (accentType === "strong") {
        scheduleClickTone(ctx, now, "downbeat", "classic");
      } else if (accentType === "medium") {
        scheduleClickTone(ctx, now, "secondary", "classic");
      } else {
        scheduleClickTone(ctx, now, "subdivision", "classic");
      }

      step++;
      timerRef.current = window.setTimeout(runStep, stepDuration * 1000);
    };

    runStep();
  };

  // Staff chords showing one complete measure in the selected time signature
  const sampleStaffChords: StaffChord[] = useMemo(() => {
    if (currentInfo.signature === "4/4") {
      return [{ keys: ["C4"], duration: "q" }, { keys: ["C4"], duration: "q" }, { keys: ["C4"], duration: "q" }, { keys: ["C4"], duration: "q" }];
    }
    if (currentInfo.signature === "3/4") {
      return [{ keys: ["C4"], duration: "q" }, { keys: ["C4"], duration: "q" }, { keys: ["C4"], duration: "q" }];
    }
    if (currentInfo.signature === "2/4") {
      return [{ keys: ["C4"], duration: "q" }, { keys: ["C4"], duration: "q" }];
    }
    if (currentInfo.signature === "2/2") {
      return [{ keys: ["C4"], duration: "h" }, { keys: ["C4"], duration: "h" }];
    }
    if (currentInfo.signature === "6/8") {
      return [{ keys: ["C4"], duration: "qd" }, { keys: ["C4"], duration: "qd" }];
    }
    if (currentInfo.signature === "9/8") {
      return [{ keys: ["C4"], duration: "qd" }, { keys: ["C4"], duration: "qd" }, { keys: ["C4"], duration: "qd" }];
    }
    if (currentInfo.signature === "12/8") {
      return [{ keys: ["C4"], duration: "qd" }, { keys: ["C4"], duration: "qd" }, { keys: ["C4"], duration: "qd" }, { keys: ["C4"], duration: "qd" }];
    }
    return [{ keys: ["C4"], duration: "8" }, { keys: ["C4"], duration: "8" }, { keys: ["C4"], duration: "8" }];
  }, [currentInfo]);

  return (
    <div className="space-y-6">
      {/* Time Signature Selection Ribbon */}
      <div className="rounded-[2px] border border-border bg-paper p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow text-muted-foreground block mb-1">
              Metric Taxonomy Studio
            </span>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Select Time Signature
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TIME_SIGNATURES_CATALOG.map((ts) => {
              const isSelected = ts.signature === selectedSignature;
              return (
                <Button
                  key={ts.signature}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSignature(ts.signature)}
                  className={cn(
                    "h-9 font-mono text-sm px-3",
                    isSelected && "bg-crimson text-white hover:bg-crimson/90 border-crimson",
                  )}
                >
                  <span className="font-bold">{ts.signature}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Metric Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Time Signature Anatomy & Audio */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center rounded border border-crimson/40 bg-crimson/10 px-3 py-1 font-mono text-2xl font-bold text-crimson-deep leading-none">
                <span>{currentInfo.numerator}</span>
                <span className="w-full border-t border-crimson/40 my-0.5"></span>
                <span>{currentInfo.denominator}</span>
              </div>
              <div>
                <span className="eyebrow text-crimson-deep">
                  {currentInfo.meterType} {currentInfo.grouping} meter
                </span>
                <h4 className="font-display text-xl font-bold text-foreground">
                  Time Signature {currentInfo.signature}
                </h4>
              </div>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={isPlayingDemo ? stopAudioDemo : playMeterDemo}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white gap-1.5 font-medium"
            >
              {isPlayingDemo ? (
                <>
                  <RotateCcw className="size-3.5" /> Stop Pulse
                </>
              ) : (
                <>
                  <Volume2 className="size-3.5" /> Audition Metric Pulse
                </>
              )}
            </Button>
          </div>

          {/* VexFlow Notation */}
          <div className="p-3 bg-white dark:bg-zinc-950 rounded border border-border flex flex-col items-center justify-center">
            <Staff
              chords={sampleStaffChords}
              timeSignature={currentInfo.signature}
              clef="treble"
              height={140}
              label={`Staff displaying ${currentInfo.signature} time signature`}
            />
          </div>

          {/* Real-time Accent Sequence Indicator */}
          <div className="space-y-2 pt-2">
            <span className="eyebrow text-muted-foreground block">
              Measure Beat & Accent Hierarchy:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {currentInfo.countingSyllables.map((syl, i) => {
                const accent = currentInfo.accents[i] ?? "weak";
                const isActive = activeBeatIndex === i;

                let accentBadgeClass = "border-border/60 bg-muted/20 text-muted-foreground";
                if (accent === "strong") {
                  accentBadgeClass = "border-crimson bg-crimson/15 text-crimson font-bold";
                } else if (accent === "medium") {
                  accentBadgeClass = "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold";
                }

                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center rounded border p-2 text-center transition-all duration-100",
                      accentBadgeClass,
                      isActive && "scale-105 ring-2 ring-crimson shadow-md",
                    )}
                  >
                    <span className="font-mono text-sm font-bold">{syl}</span>
                    <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">
                      {accent}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Numerator / Denominator Analysis & Academic Rules */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <span className="eyebrow text-muted-foreground">Mathematical Anatomy</span>
              <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
                Numerator vs. Denominator
              </h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-border bg-muted/20 p-3.5 space-y-1">
                <div className="font-mono text-xs font-bold text-crimson-deep">
                  Top Number: {currentInfo.numerator}
                </div>
                <div className="font-bold text-xs text-foreground">
                  {currentInfo.meterType === "compound"
                    ? "Subdivision Count"
                    : "Number of Beats"}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentInfo.meterType === "compound"
                    ? `Indicates ${currentInfo.numerator} eighth-note divisions grouped into ${currentInfo.macroBeatsPerMeasure} dotted macro-pulses.`
                    : `Indicates exactly ${currentInfo.numerator} beats contained in every complete measure.`}
                </p>
              </div>

              <div className="rounded border border-border bg-muted/20 p-3.5 space-y-1">
                <div className="font-mono text-xs font-bold text-crimson-deep">
                  Bottom Number: {currentInfo.denominator}
                </div>
                <div className="font-bold text-xs text-foreground">Pulse Unit Value</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Refers to note value 1/{currentInfo.denominator} ({currentInfo.beatUnitName}).
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-foreground">Metric Characteristics:</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentInfo.description}
              </p>
            </div>
          </div>

          <div className="rounded border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="size-4 shrink-0 text-crimson mt-0.5" />
            <div>
              <strong className="text-foreground block">Simple vs. Compound Rule:</strong>
              Simple meters (top 2, 3, 4) subdivide beats naturally into two parts (&apos;1-and, 2-and&apos;). Compound meters (top 6, 9, 12) group eighth notes into threes (&apos;1-la-li, 2-la-li&apos;) giving each beat a natural triplet lilt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

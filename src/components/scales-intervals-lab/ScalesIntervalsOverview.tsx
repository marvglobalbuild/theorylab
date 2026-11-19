import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FileMusic,
  Headphones,
  Layers,
  Music,
  Piano,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  Waves,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

interface ScalesIntervalsOverviewProps {
  onSelectStudioTab: (tab: string) => void;
}

export function ScalesIntervalsOverview({
  onSelectStudioTab,
}: ScalesIntervalsOverviewProps) {
  const piano = usePiano();
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState<number | null>(null);

  const DEMO_PITCHES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
  const DEMO_INTERVAL_LABELS = [
    "Root (Unison)",
    "Major 2nd (+W)",
    "Major 3rd (+W)",
    "Perfect 4th (+H)",
    "Perfect 5th (+W)",
    "Major 6th (+W)",
    "Major 7th (+W)",
    "Perfect 8ve (+H)",
  ];

  // Play introductory demonstration
  const playIntroDemo = useCallback(() => {
    setIsPlayingDemo(true);
    setDemoStep(0);

    const steps = DEMO_PITCHES.map((note, idx) => ({
      notes: [note],
      at: idx * 0.45,
      duration: 0.4,
    }));

    // Add a final harmonic chord restrike (C major triad + octave)
    steps.push({
      notes: ["C4", "E4", "G4", "C5"],
      at: DEMO_PITCHES.length * 0.45 + 0.2,
      duration: 1.4,
    });

    piano.playPhrase(steps, (step) => {
      if (!step) {
        setIsPlayingDemo(false);
        setDemoStep(null);
        return;
      }
      const note = step.notes[0];
      const idx = DEMO_PITCHES.indexOf(note ?? "");
      setDemoStep(idx !== -1 ? idx : 8);
    });
  }, [piano]);

  const MODULE_CARDS = [
    {
      id: "scale-explorer",
      title: "Scale Explorer",
      icon: Compass,
      tag: "16 Scale Types",
      description:
        "Audition and analyze major, minor, modal, pentatonic, and blues scales across all 12 keys with whole-and-half tone formulas and piano visualizations.",
    },
    {
      id: "interval-explorer",
      title: "Interval Explorer",
      icon: Waves,
      tag: "17 Intervals",
      description:
        "Understand simple and compound intervals, frequency ratios, inversions, and harmonic vs melodic audio playback.",
    },
    {
      id: "scale-builder",
      title: "Scale Builder",
      icon: Piano,
      tag: "Interactive Construction",
      description:
        "Construct scales note-by-note on the keyboard with real-time whole-tone/semitone movement diagnostics and feedback.",
    },
    {
      id: "interval-trainer",
      title: "Interval Trainer",
      icon: Headphones,
      tag: "Aural Recognition",
      description:
        "Train your ear to recognize intervals by sound, distinguish ascending vs descending lines, and identify semitone spans.",
    },
    {
      id: "practice",
      title: "Practice and Challenges",
      icon: Trophy,
      tag: "Scored Challenges",
      description:
        "Structured challenges testing scale identification, construction, interval distances, and timed quizzes across 3 difficulty tiers.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Banner */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="rounded bg-crimson/10 p-2.5 text-crimson-deep dark:bg-crimson/20 shrink-0">
              <Sparkles className="size-6" />
            </div>
            <div>
              <span className="eyebrow text-crimson-deep">Theoretical Foundations</span>
              <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
                The Architecture of Scales and Intervals
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
                Every melody, harmony, and chord in Western art music is forged from the interplay
                of <strong>scales</strong> and <strong>intervals</strong>. While an interval is the
                fundamental distance between two isolated pitches, a scale is an organized
                ladder of intervals radiating from a tonal center (tonic).
              </p>
            </div>
          </div>

          <Button
            onClick={playIntroDemo}
            disabled={isPlayingDemo}
            className="shrink-0 bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[150px]"
          >
            <Volume2 className={cn("mr-2 h-4 w-4", isPlayingDemo && "animate-pulse")} />
            {isPlayingDemo ? "Auditioning..." : "Play Scale & Chords"}
          </Button>
        </div>

        {/* Live Audio Step Visualization Bar */}
        <div className="pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Introductory C Major Demonstration: Scale degrees & stacked intervals</span>
            <span className="font-mono text-[11px]">
              {demoStep !== null && demoStep < 8
                ? `Degree #${demoStep + 1}: ${DEMO_PITCHES[demoStep]} (${DEMO_INTERVAL_LABELS[demoStep]})`
                : demoStep === 8
                  ? "Tonic Major Triad + Octave Harmonic Resolution"
                  : "Click 'Play Scale & Chords' to hear"}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1.5">
            {DEMO_PITCHES.map((pitch, idx) => {
              const isActive = demoStep === idx;
              return (
                <div
                  key={pitch}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 rounded border text-xs transition-all",
                    isActive
                      ? "bg-crimson-deep text-white border-crimson-deep font-bold shadow-md scale-105"
                      : "bg-card border-border/70 text-foreground",
                  )}
                >
                  <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                  <span className="font-semibold text-sm">{displayNote(pitch)}</span>
                  <span className="text-[9px] truncate max-w-full opacity-80">
                    {idx === 0 ? "Root" : idx === 3 || idx === 7 ? "+H" : "+W"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 Core Conceptual Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-crimson-deep">
            <Piano className="h-5 w-5" />
            <h4 className="font-display text-base font-bold text-foreground">
              What is a Musical Scale?
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A scale (from the Latin <em>scala</em>, meaning "ladder" or "staircase") is an ordered
            succession of pitches spanning an octave. Scales provide the tonal vocabulary, pitch
            hierarchy, and gravitational pull that define keys, melodies, and harmonic structures.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-crimson-deep">
            <Waves className="h-5 w-5" />
            <h4 className="font-display text-base font-bold text-foreground">
              What is a Musical Interval?
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An interval is the acoustic measurement of distance between two musical frequencies.
            Intervals can be performed <strong>melodically</strong> (one note after another) or{" "}
            <strong>harmonically</strong> (both notes sounding together), and are classified as
            consonant or dissonant.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-crimson-deep">
            <Layers className="h-5 w-5" />
            <h4 className="font-display text-base font-bold text-foreground">
              The Living Relationship
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Scales are constructed from consecutive whole tones and semitones. When two scale
            degrees are sounded together, they form harmonic intervals that generate chords,
            tensions, and cadences. Mastering intervals is the key to mastering all scales.
          </p>
        </div>
      </div>

      {/* Category Selection Cards */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <h4 className="font-display text-lg font-bold text-foreground">
            Available Scales and Intervals Studios
          </h4>
          <span className="text-xs text-muted-foreground">5 Interactive Laboratories</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_CARDS.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => onSelectStudioTab(mod.id)}
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

                <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-crimson-deep">
                  <span>Enter Studio</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

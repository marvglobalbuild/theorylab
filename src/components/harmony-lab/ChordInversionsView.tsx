import { Info, Play, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import {
  CHORD_TYPES_CATALOG,
  buildChord,
  type ChordInversion,
  type ChordQuality,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const ROOT_OPTIONS = ["C", "G", "D", "F", "Bb", "Eb", "A", "E"] as const;

export function ChordInversionsView() {
  const piano = usePiano();

  const [root, setRoot] = useState<string>("C");
  const [quality, setQuality] = useState<ChordQuality>("major");
  const [activeInversion, setActiveInversion] = useState<ChordInversion>("root");

  const isSeventh = useMemo(() => {
    return CHORD_TYPES_CATALOG.find((q) => q.id === quality)?.isSeventh ?? false;
  }, [quality]);

  const availableInversions: ChordInversion[] = useMemo(() => {
    return isSeventh ? ["root", "first", "second", "third"] : ["root", "first", "second"];
  }, [isSeventh]);

  const currentChord = useMemo(() => {
    return buildChord(root, quality, 4, activeInversion);
  }, [root, quality, activeInversion]);

  // All inversions array for comparative study
  const allInversions = useMemo(() => {
    return availableInversions.map((inv) => buildChord(root, quality, 4, inv));
  }, [root, quality, availableInversions]);

  const playChord = (notes: string[]) => {
    notes.forEach((n) => piano.noteOn(n));
    setTimeout(() => {
      notes.forEach((n) => piano.noteOff(n));
    }, 1100);
  };

  const playArpeggio = (notes: string[]) => {
    const steps: PhraseStep[] = notes.map((n, i) => ({
      notes: [n],
      at: i * 0.35,
      duration: 0.6,
    }));
    steps.push({
      notes,
      at: notes.length * 0.35 + 0.1,
      duration: 1.0,
    });
    piano.playPhrase(steps);
  };

  const inversionLabels: Record<ChordInversion, { title: string; figuredBass: string; bassFactor: string; role: string }> = {
    root: {
      title: "Root Position",
      figuredBass: isSeventh ? "7" : "5/3",
      bassFactor: "Root in Bass",
      role: "Most stable and grounding position.",
    },
    first: {
      title: "First Inversion",
      figuredBass: isSeventh ? "6/5" : "6 (or 6/3)",
      bassFactor: "Third in Bass",
      role: "Light, buoyant, highly melodic bass line.",
    },
    second: {
      title: "Second Inversion",
      figuredBass: isSeventh ? "4/3" : "6/4",
      bassFactor: "Fifth in Bass",
      role: "Unstable, cadential or passing harmony.",
    },
    third: {
      title: "Third Inversion",
      figuredBass: "4/2 (or 2)",
      bassFactor: "Seventh in Bass",
      role: "Strong forward pull requiring downward step resolution.",
    },
  };

  return (
    <div className="space-y-6">
      {/* Root & Quality Selectors */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Root:
          </span>
          <div className="flex flex-wrap gap-1">
            {ROOT_OPTIONS.map((r) => (
              <Button
                key={r}
                type="button"
                variant={root === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRoot(r)}
                className="h-8 text-xs font-mono font-semibold"
              >
                {displayNote(r)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Type:
          </span>
          <select
            value={quality}
            onChange={(e) => {
              setQuality(e.target.value as ChordQuality);
              if (activeInversion === "third" && !CHORD_TYPES_CATALOG.find((q) => q.id === e.target.value)?.isSeventh) {
                setActiveInversion("root");
              }
            }}
            className="h-8 rounded border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none"
          >
            {CHORD_TYPES_CATALOG.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inversion Selector Cards */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {availableInversions.map((inv) => {
          const isSelected = activeInversion === inv;
          const info = inversionLabels[inv];
          const ch = allInversions.find((i) => i.inversion === inv)!;

          return (
            <button
              key={inv}
              type="button"
              onClick={() => setActiveInversion(inv)}
              className={cn(
                "flex flex-col text-left rounded-[2px] border p-4 transition-all duration-150",
                isSelected
                  ? "border-crimson bg-crimson/5 shadow-sm text-foreground ring-1 ring-crimson"
                  : "border-border bg-card hover:bg-muted/40 text-muted-foreground",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-crimson-deep font-mono">
                  Figured: {info.figuredBass}
                </span>
                <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono">
                  Bass: {displayNote(ch.bassNote)}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-display font-bold text-foreground">
                {info.title}
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">{info.bassFactor}</p>
            </button>
          );
        })}
      </div>

      {/* Main Active Inversion Viewer */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Staff Notation */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="eyebrow text-crimson-deep">
                {inversionLabels[activeInversion].title}
              </span>
              <h3 className="font-display text-3xl font-bold text-foreground mt-0.5">
                {currentChord.symbol}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => playChord(currentChord.notes)}
                className="h-8 text-xs"
              >
                <Volume2 className="size-3.5 mr-1" /> Play Chord
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => playArpeggio(currentChord.notes)}
                className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white"
              >
                <Play className="size-3.5 mr-1" /> Arpeggiate
              </Button>
            </div>
          </div>

          <div className="py-2">
            <Staff
              chords={[{ keys: currentChord.notes, duration: "w" }]}
              clef="treble"
              height={170}
              label={`${currentChord.symbol} in ${inversionLabels[activeInversion].title}`}
            />
          </div>

          <div className="rounded border border-border/70 bg-muted/20 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notes (Lowest to Highest):</span>
              <span className="font-mono font-bold text-foreground">
                {currentChord.notes.map((n) => displayNote(n)).join(" – ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Figured Bass Shorthand:</span>
              <span className="font-mono font-bold text-crimson-deep">
                {inversionLabels[activeInversion].figuredBass}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Figured Bass Explanation */}
        <div className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6 lg:col-span-6">
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <span className="eyebrow text-muted-foreground">Classical Practice</span>
              <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
                Understanding Figured Bass
              </h4>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Figured bass (basso continuo) indicates intervals above the bass note rather than the root note:
              </p>

              <div className="rounded border border-border/80 bg-muted/20 p-3.5 space-y-2">
                <p>
                  <strong>{inversionLabels[activeInversion].title} ({inversionLabels[activeInversion].figuredBass}):</strong>
                </p>
                <p>{inversionLabels[activeInversion].role}</p>
                {activeInversion === "root" && (
                  <p>In root position, the intervals above the bass are a 3rd and a 5th (5/3).</p>
                )}
                {activeInversion === "first" && (
                  <p>In first inversion, the third is in the bass; the intervals above the bass are a 3rd and a 6th (6/3, abbreviated as 6).</p>
                )}
                {activeInversion === "second" && (
                  <p>In second inversion, the fifth is in the bass; the intervals above the bass are a 4th and a 6th (6/4).</p>
                )}
                {activeInversion === "third" && (
                  <p>In third inversion (seventh chords only), the seventh is in the bass; the intervals above the bass are a 2nd and a 4th (4/2, or 2).</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            Bass note is always the determining factor for harmonic inversion.
          </div>
        </div>
      </div>

      {/* Keyboard Voicing Visualizer */}
      <div className="rounded-[2px] border border-border bg-paper p-5 space-y-3">
        <span className="eyebrow text-foreground block">Voicing on the Keyboard</span>
        <VirtualPiano
          startOctave={3}
          numOctaves={3}
          targetNotes={new Set(currentChord.notes)}
          showLabels="all"
          showShortcuts={false}
          allowKeyboardShortcuts={false}
        />
      </div>
    </div>
  );
}

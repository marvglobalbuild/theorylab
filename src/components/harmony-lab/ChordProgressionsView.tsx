import { Info, Play, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  PROGRESSION_PRESETS,
  realizeProgression,
  type ProgressionPreset,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const KEYS_MAJOR = ["C", "G", "D", "A", "F", "Bb", "Eb", "Ab"] as const;
const KEYS_MINOR = ["A", "E", "B", "D", "G", "C", "F"] as const;

export function ChordProgressionsView() {
  const piano = usePiano();

  const [activePresetId, setActivePresetId] = useState<string>("authentic-cadence-major");
  const [selectedKey, setSelectedKey] = useState<string>("C");
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);

  const preset = useMemo(() => {
    return PROGRESSION_PRESETS.find((p) => p.id === activePresetId) ?? PROGRESSION_PRESETS[0]!;
  }, [activePresetId]);

  // When preset mode changes, adjust default key
  useEffect(() => {
    if (preset.mode === "minor" && !KEYS_MINOR.includes(selectedKey as (typeof KEYS_MINOR)[number])) {
      setSelectedKey("A");
    } else if (preset.mode === "major" && !KEYS_MAJOR.includes(selectedKey as (typeof KEYS_MAJOR)[number])) {
      setSelectedKey("C");
    }
  }, [preset.mode, selectedKey]);

  const realized = useMemo(() => {
    return realizeProgression(preset, selectedKey, 4);
  }, [preset, selectedKey]);

  // Convert realized chords into StaffChords
  const staffChords: StaffChord[] = useMemo(() => {
    return realized.chords.map((c) => ({
      keys: c.notes,
      duration: "h" as const,
    }));
  }, [realized.chords]);

  const handlePlayProgression = () => {
    const tempo = 0.9; // seconds per chord
    const steps: PhraseStep[] = realized.chords.map((c, i) => ({
      notes: c.notes,
      at: i * tempo,
      duration: tempo * 0.9,
    }));

    piano.playPhrase(steps, (step) => {
      if (!step) {
        setActiveChordIndex(null);
        return;
      }
      const idx = steps.indexOf(step);
      if (idx >= 0) setActiveChordIndex(idx);
    });
  };

  const handlePlaySingleChord = (idx: number) => {
    setActiveChordIndex(idx);
    const chord = realized.chords[idx];
    if (!chord) return;
    chord.notes.forEach((n) => piano.noteOn(n));
    setTimeout(() => {
      chord.notes.forEach((n) => piano.noteOff(n));
    }, 900);
  };

  const functionBadge = (fn: "tonic" | "predominant" | "dominant") => {
    if (fn === "tonic") {
      return (
        <span className="rounded bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800 px-1.5 py-0.5 text-[10px] font-semibold text-blue-900 dark:text-blue-200">
          Tonic (T)
        </span>
      );
    }
    if (fn === "predominant") {
      return (
        <span className="rounded bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:text-amber-200">
          Predominant (PD)
        </span>
      );
    }
    return (
      <span className="rounded bg-crimson/15 border border-crimson/30 px-1.5 py-0.5 text-[10px] font-semibold text-crimson-deep">
        Dominant (D)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector Ribbon */}
      <div className="rounded-[2px] border border-border bg-paper p-4">
        <span className="eyebrow text-muted-foreground block mb-2.5">
          Select Classical Progression Preset:
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRESSION_PRESETS.map((p) => {
            const isSelected = p.id === activePresetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePresetId(p.id);
                  setActiveChordIndex(null);
                }}
                className={cn(
                  "flex flex-col text-left rounded-[2px] border p-3 transition-colors",
                  isSelected
                    ? "border-crimson bg-crimson/5 text-foreground shadow-sm ring-1 ring-crimson"
                    : "border-border/70 bg-card hover:bg-muted/40 text-muted-foreground",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-crimson-deep font-mono">
                    {p.mode} · {p.cadenceType}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                  {p.name}
                </h4>
                <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                  {p.steps.map((s) => s.roman).join(" – ")}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Progression Realization Canvas */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-crimson-deep">{preset.name}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">
                Key of {selectedKey} {preset.mode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">{preset.description}</p>
          </div>

          {/* Key Transposition & Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Transpose Key:</span>
            <div className="flex gap-1">
              {(preset.mode === "major" ? KEYS_MAJOR : KEYS_MINOR).map((k) => (
                <Button
                  key={k}
                  type="button"
                  variant={selectedKey === k ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedKey(k)}
                  className="h-7 text-xs font-mono font-semibold px-2"
                >
                  {displayNote(k)}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePlayProgression}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white ml-2 font-medium"
            >
              <Play className="size-3.5 mr-1" /> Play Full Progression
            </Button>
          </div>
        </div>

        {/* Sequential Step Timeline with Functional Analysis */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {realized.chords.map((chord, idx) => {
            const isPlaying = activeChordIndex === idx;
            return (
              <div
                key={`${chord.symbol}-${idx}`}
                onClick={() => handlePlaySingleChord(idx)}
                className={cn(
                  "cursor-pointer rounded-[2px] border p-3 text-center transition-all duration-150 flex flex-col justify-between",
                  isPlaying
                    ? "border-crimson bg-crimson/15 shadow-md scale-102 ring-2 ring-crimson"
                    : "border-border/80 bg-card hover:bg-muted/40",
                )}
              >
                <div>
                  <span className="text-[10px] text-muted-foreground font-mono block mb-1">
                    Chord {idx + 1}
                  </span>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {chord.roman}
                  </p>
                  <p className="font-mono text-xs font-semibold text-crimson-deep mt-0.5">
                    {chord.symbol}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 space-y-1.5">
                  <div>{functionBadge(chord.function)}</div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {chord.notes.map((n) => displayNote(n, false)).join("-")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff Representation */}
        <div className="pt-2 border-t border-border/60">
          <span className="eyebrow text-muted-foreground block mb-2">Staff Engraving (Treble Clef):</span>
          <Staff
            chords={staffChords}
            clef="treble"
            selectedIndex={activeChordIndex}
            onSelect={handlePlaySingleChord}
            height={180}
            label={`Musical staff showing ${preset.name} progression`}
          />
        </div>
      </div>
    </div>
  );
}

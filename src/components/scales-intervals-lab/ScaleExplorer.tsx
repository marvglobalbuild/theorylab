import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Compass,
  Layers,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import { Button } from "@/components/ui/button";
import {
  realizeScale,
  ScaleCategory,
  SCALES_CATALOG,
} from "@/lib/music/scales-intervals-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const TONIC_ROOTS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
];

const CATEGORIES: { id: ScaleCategory; label: string }[] = [
  { id: "major", label: "Major Scales" },
  { id: "minor", label: "Minor Scales" },
  { id: "modes", label: "Musical Modes" },
  { id: "other", label: "Pentatonic & Other" },
];

export function ScaleExplorer() {
  const piano = usePiano();

  const [selectedCategory, setSelectedCategory] = useState<ScaleCategory>("major");
  const [selectedTonic, setSelectedTonic] = useState<string>("C");
  const [selectedScaleId, setSelectedScaleId] = useState<string>("major");
  const [playbackDirection, setPlaybackDirection] = useState<"ascending" | "descending" | "both">(
    "ascending",
  );
  const [tempoBpm, setTempoBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePlaybackNote, setActivePlaybackNote] = useState<string | null>(null);

  // Available scales in active category
  const categoryScales = useMemo(() => {
    return SCALES_CATALOG.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  // Ensure selected scale belongs to category
  useEffect(() => {
    const exists = categoryScales.some((s) => s.id === selectedScaleId);
    if (!exists && categoryScales.length > 0) {
      setSelectedScaleId(categoryScales[0]!.id);
    }
  }, [categoryScales, selectedScaleId]);

  // Realized scale data with academic enharmonic spelling
  const realized = useMemo(() => {
    return realizeScale(selectedTonic, selectedScaleId, 4);
  }, [selectedTonic, selectedScaleId]);

  // Set of notes to highlight on the virtual keyboard
  const highlightedNotesSet = useMemo(() => {
    return new Set(realized.notes);
  }, [realized.notes]);

  // Play complete scale
  const playScaleAudio = useCallback(() => {
    setIsPlaying(true);
    const noteDuration = 60 / tempoBpm;

    let sequenceNotes: string[] = [];
    if (playbackDirection === "ascending") {
      sequenceNotes = [...realized.notes];
    } else if (playbackDirection === "descending") {
      sequenceNotes = realized.descendingNotes ?? [...realized.notes].reverse();
    } else {
      // Both: ascending then descending
      const asc = [...realized.notes];
      const desc = realized.descendingNotes ?? [...realized.notes].slice(0, -1).reverse();
      sequenceNotes = [...asc, ...desc];
    }

    const steps = sequenceNotes.map((note, idx) => ({
      notes: [note],
      at: idx * noteDuration,
      duration: noteDuration * 0.9,
    }));

    piano.playPhrase(steps, (step) => {
      if (!step) {
        setIsPlaying(false);
        setActivePlaybackNote(null);
        return;
      }
      setActivePlaybackNote(step.notes[0] ?? null);
    });
  }, [tempoBpm, playbackDirection, realized, piano]);

  // Audition an individual note
  const playSingleNote = (note: string) => {
    piano.playPhrase([{ notes: [note], at: 0, duration: 0.8 }]);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="text-xs"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Playback Tempo & Direction Controls */}
        <div className="flex items-center gap-3 text-xs bg-paper/60 px-3 py-1.5 rounded-md border border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Tempo:</span>
            <input
              type="range"
              min="60"
              max="180"
              step="10"
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              className="w-20 accent-crimson-deep h-1.5 bg-muted rounded cursor-pointer"
            />
            <span className="font-mono font-bold text-foreground w-12">{tempoBpm} BPM</span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPlaybackDirection("ascending")}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium border transition-colors",
                playbackDirection === "ascending"
                  ? "bg-crimson-deep text-white border-crimson-deep"
                  : "border-border/60 hover:bg-paper",
              )}
            >
              Ascending
            </button>
            <button
              onClick={() => setPlaybackDirection("descending")}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium border transition-colors",
                playbackDirection === "descending"
                  ? "bg-crimson-deep text-white border-crimson-deep"
                  : "border-border/60 hover:bg-paper",
              )}
            >
              Descending
            </button>
            <button
              onClick={() => setPlaybackDirection("both")}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium border transition-colors",
                playbackDirection === "both"
                  ? "bg-crimson-deep text-white border-crimson-deep"
                  : "border-border/60 hover:bg-paper",
              )}
            >
              Asc & Desc
            </button>
          </div>
        </div>
      </div>

      {/* Main Exploration Workspace */}
      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        {/* Top Selection: Root & Scale Type */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-border/50">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground block mb-1.5">
                1. Select Tonic / Root Pitch:
              </span>
              <div className="flex flex-wrap gap-1">
                {TONIC_ROOTS.map((root) => (
                  <button
                    key={root}
                    onClick={() => setSelectedTonic(root)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded border transition-colors font-mono font-semibold",
                      selectedTonic === root
                        ? "bg-crimson-deep text-white border-crimson-deep shadow-sm"
                        : "border-border/70 hover:bg-paper text-foreground",
                    )}
                  >
                    {displayNote(root)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-muted-foreground block mb-1.5">
                2. Select Scale Type:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categoryScales.map((scale) => (
                  <button
                    key={scale.id}
                    onClick={() => setSelectedScaleId(scale.id)}
                    className={cn(
                      "px-3 py-1 text-xs rounded border transition-colors font-medium",
                      selectedScaleId === scale.id
                        ? "bg-crimson-deep text-white border-crimson-deep shadow-sm font-semibold"
                        : "border-border/70 hover:bg-paper text-foreground",
                    )}
                  >
                    {scale.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
            <Button
              onClick={playScaleAudio}
              disabled={isPlaying}
              className="bg-crimson-deep hover:bg-crimson-deep/90 text-white min-w-[170px]"
            >
              <Volume2 className={cn("mr-2 h-4 w-4", isPlaying && "animate-pulse")} />
              {isPlaying ? "Auditioning..." : `Play ${displayNote(selectedTonic)} ${realized.scale.name}`}
            </Button>
            <span className="text-[11px] text-muted-foreground">
              Direction: <strong className="capitalize">{playbackDirection}</strong> at {tempoBpm} BPM
            </span>
          </div>
        </div>

        {/* Scale Details Card */}
        <div className="p-4 rounded-xl border border-border/70 bg-paper/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
                Scale Profile
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">
                {displayNote(selectedTonic)} {realized.scale.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono px-2 py-0.5 rounded bg-card border border-border/60">
                Formula: {realized.formula}
              </span>
            </div>
          </div>

          {/* Interactive Scale Degrees Badges */}
          <div>
            <div className="text-xs text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>Scale Pitches (Click any pitch to audition):</span>
              <span className="text-[11px]">Interval Degrees: {realized.intervalNames.join(" - ")}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {realized.notes.map((pitch, idx) => {
                const isActive = activePlaybackNote === pitch;
                const isRoot = idx === 0 || idx === realized.notes.length - 1;
                const degreeName = realized.intervalNames[idx] ?? `${idx + 1}`;

                return (
                  <button
                    key={`${pitch}-${idx}`}
                    onClick={() => playSingleNote(pitch)}
                    className={cn(
                      "flex flex-col items-center justify-center w-14 h-16 rounded-lg border text-sm transition-all shadow-sm group",
                      isActive
                        ? "bg-crimson-deep text-white border-crimson-deep scale-105 shadow-md font-bold"
                        : isRoot
                          ? "border-crimson-deep/60 bg-crimson-deep/10 text-crimson-deep font-bold hover:bg-crimson-deep/20"
                          : "border-border/70 bg-card hover:border-crimson-deep/50 hover:bg-paper/80 text-foreground",
                    )}
                  >
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-mono">
                      deg {degreeName}
                    </span>
                    <span className="font-semibold text-base">{displayNote(pitch)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Melodic minor descending note callout if present */}
          {realized.descendingNotes && (
            <div className="p-3 bg-card rounded-lg border border-border/60 text-xs space-y-1">
              <span className="font-semibold text-foreground">
                Classical Descending Melodic Minor Realization:
              </span>
              <div className="font-mono text-muted-foreground">
                {realized.descendingNotes.map((p) => displayNote(p)).join(" → ")} (restores natural
                minor degrees ♭7 and ♭6)
              </div>
            </div>
          )}

          {/* Pedagogical Commentary */}
          <div className="text-xs text-muted-foreground leading-relaxed pt-1">
            <strong className="text-foreground">Aesthetic & Musical Usage: </strong>
            {realized.scale.characterAndUsage}
          </div>
        </div>

        {/* Interactive Piano Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Keyboard Visualization for {displayNote(selectedTonic)} {realized.scale.name}:
            </span>
            <span>Highlighted keys indicate scale pitches</span>
          </div>

          <div className="rounded-lg border border-border/70 p-3 bg-card/70 overflow-x-auto">
            <VirtualPiano
              startOctave={3}
              numOctaves={3}
              highlightNotes={highlightedNotesSet}
              showLabels="all"
              showShortcuts={false}
              onNotePlay={(note) => playSingleNote(note)}
              className="max-w-3xl mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

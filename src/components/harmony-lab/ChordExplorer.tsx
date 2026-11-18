import { Play, Sparkles, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import { VirtualPiano } from "@/components/keyboard-lab/VirtualPiano";
import {
  CHORD_TYPES_CATALOG,
  buildChord,
  type ChordQuality,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const ROOT_OPTIONS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"] as const;

export function ChordExplorer() {
  const piano = usePiano();

  const [selectedRoot, setSelectedRoot] = useState<string>("C");
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>("major");
  const [octave, setOctave] = useState<number>(4);

  const chord = useMemo(() => {
    return buildChord(selectedRoot, selectedQuality, octave);
  }, [selectedRoot, selectedQuality, octave]);

  const chordType = useMemo(() => {
    return CHORD_TYPES_CATALOG.find((q) => q.id === selectedQuality) ?? CHORD_TYPES_CATALOG[0]!;
  }, [selectedQuality]);

  // Highlight notes on piano
  const highlightedNotes = useMemo(() => {
    return new Set(chord.notes);
  }, [chord.notes]);

  // Play block chord (simultaneous notes)
  const handlePlayBlockChord = () => {
    chord.notes.forEach((n) => piano.noteOn(n));
    setTimeout(() => {
      chord.notes.forEach((n) => piano.noteOff(n));
    }, 1200);
  };

  // Play arpeggio
  const handlePlayArpeggio = () => {
    const steps: PhraseStep[] = chord.notes.map((n, idx) => ({
      notes: [n],
      at: idx * 0.35,
      duration: 0.6,
    }));
    // Follow with final chord sound
    steps.push({
      notes: chord.notes,
      at: chord.notes.length * 0.35 + 0.1,
      duration: 1.1,
    });

    piano.playPhrase(steps);
  };

  const staffChords: StaffChord[] = [
    {
      keys: chord.notes,
      duration: "w",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Root & Quality Selection Toolbar */}
      <div className="rounded-[2px] border border-border bg-paper p-5 space-y-4">
        {/* Root Selector */}
        <div>
          <span className="eyebrow text-muted-foreground block mb-2">Select Chord Root:</span>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {ROOT_OPTIONS.map((r) => (
              <Button
                key={r}
                type="button"
                variant={selectedRoot === r ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRoot(r)}
                className="h-8 text-xs font-mono font-semibold"
              >
                {displayNote(r)}
              </Button>
            ))}
          </div>
        </div>

        {/* Quality Selector */}
        <div>
          <span className="eyebrow text-muted-foreground block mb-2">Select Chord Quality:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CHORD_TYPES_CATALOG.map((cat) => (
              <Button
                key={cat.id}
                type="button"
                variant={selectedQuality === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedQuality(cat.id)}
                className={cn(
                  "h-9 text-xs justify-start px-2.5",
                  selectedQuality === cat.id && "bg-crimson text-white hover:bg-crimson/90 border-crimson",
                )}
              >
                <span className="font-semibold">{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chord Card: Staff, Audio Actions, Formula */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Musical Staff Notation */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="eyebrow text-crimson-deep">Staff Notation</span>
              <h3 className="font-display text-3xl font-bold text-foreground mt-0.5">
                {chord.symbol} ({chordType.name})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePlayBlockChord}
                className="h-8 text-xs"
              >
                <Volume2 className="size-3.5 mr-1" /> Block Chord
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handlePlayArpeggio}
                className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white"
              >
                <Play className="size-3.5 mr-1" /> Arpeggiate
              </Button>
            </div>
          </div>

          {/* VexFlow Staff Rendering */}
          <div className="py-2">
            <Staff
              chords={staffChords}
              clef={octave <= 3 ? "bass" : "treble"}
              height={170}
              label={`${chord.symbol} engraved on the staff`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
            <span className="text-muted-foreground">
              Constituent Notes:{" "}
              <strong className="text-foreground font-mono">
                {chord.notes.map((n) => displayNote(n)).join(" – ")}
              </strong>
            </span>
            <span className="text-muted-foreground font-mono">
              Bass Note: <strong className="text-crimson-deep">{displayNote(chord.bassNote)}</strong>
            </span>
          </div>
        </div>

        {/* Right: Theoretical Formula & Construction */}
        <div className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6 lg:col-span-6">
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <span className="eyebrow text-muted-foreground">Tertian Architecture</span>
              <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
                Chord Construction & Formula
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Interval formula: <span className="font-mono font-bold text-crimson-deep text-sm">{chord.formula}</span>
              </p>
            </div>

            {/* Intervals Table */}
            <div className="space-y-1.5 text-xs">
              {chord.notes.map((note, idx) => (
                <div
                  key={note}
                  className="flex items-center justify-between rounded bg-muted/20 border border-border/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground w-10">
                      {displayNote(note)}
                    </span>
                    <span className="text-muted-foreground">
                      {chord.intervals[idx] ?? "Chord factor"}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    +{chordType.semitoneOffsets[idx] ?? 0} st from root
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {chordType.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            Spelled in stacked thirds according to classical harmonic conventions.
          </div>
        </div>
      </div>

      {/* Piano Keyboard Visualizer */}
      <div className="rounded-[2px] border border-border bg-paper p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-crimson-deep" />
            <span className="eyebrow text-foreground">Interactive Keyboard Fingerprint</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Highlighted keys indicate all pitch classes in {chord.symbol}
          </span>
        </div>

        <VirtualPiano
          startOctave={3}
          numOctaves={3}
          targetNotes={highlightedNotes}
          showLabels="all"
          showShortcuts={false}
          allowKeyboardShortcuts={false}
        />
      </div>
    </div>
  );
}

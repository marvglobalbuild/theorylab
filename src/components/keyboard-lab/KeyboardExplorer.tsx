import {
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Music,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getKeyboardNoteAnalysis,
  type VirtualKeyDefinition,
} from "@/lib/music/keyboard-lab";
import { displayNote, noteToMidi } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";
import { VirtualPiano } from "./VirtualPiano";

export function KeyboardExplorer() {
  const piano = usePiano();

  // Keyboard navigation state
  const [startOctave, setStartOctave] = useState<number>(3); // Defaults to C3
  const [numOctaves, setNumOctaves] = useState<number>(3); // 3 octaves (C3 to C6)
  const [showLabels, setShowLabels] = useState<"all" | "c-only" | "none">("all");
  const [showShortcuts, setShowShortcuts] = useState<boolean>(true);
  const [sustainEnabled, setSustainEnabled] = useState<boolean>(false);

  // Active / selected notes state
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<string>("C4"); // Default inspector to Middle C

  const noteAnalysis = useMemo(() => {
    return getKeyboardNoteAnalysis(selectedNote);
  }, [selectedNote]);

  const handleNotePlay = (note: string) => {
    setActiveNotes((prev) => new Set(prev).add(note));
    setSelectedNote(note);
  };

  const handleNoteRelease = (note: string) => {
    if (!sustainEnabled) {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  const handleClearActive = () => {
    setActiveNotes(new Set());
  };

  const playPitch = (note: string) => {
    piano.noteOn(note);
    setTimeout(() => {
      piano.noteOff(note);
    }, 600);
    setSelectedNote(note);
  };

  // Octave navigation bounds
  const canShiftDown = startOctave > 1;
  const canShiftUp = startOctave + numOctaves < 8;

  const handleShiftOctaveDown = () => {
    if (canShiftDown) setStartOctave((prev) => prev - 1);
  };

  const handleShiftOctaveUp = () => {
    if (canShiftUp) setStartOctave((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Octave range, Octave navigation, Labels, Sustain */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-border bg-paper p-4">
        {/* Octave Range Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Octave Span:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={numOctaves === 2 ? "default" : "ghost"}
              size="sm"
              onClick={() => setNumOctaves(2)}
              className="h-7 text-xs font-medium"
            >
              2 Octaves
            </Button>
            <Button
              type="button"
              variant={numOctaves === 3 ? "default" : "ghost"}
              size="sm"
              onClick={() => setNumOctaves(3)}
              className="h-7 text-xs font-medium"
            >
              3 Octaves
            </Button>
            <Button
              type="button"
              variant={numOctaves === 4 ? "default" : "ghost"}
              size="sm"
              onClick={() => setNumOctaves(4)}
              className="h-7 text-xs font-medium"
            >
              4 Octaves (Full Range)
            </Button>
          </div>

          {/* Octave shift steppers */}
          <div className="flex items-center gap-1.5 ml-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canShiftDown}
              onClick={handleShiftOctaveDown}
              className="h-7 text-xs"
              title="Shift range 1 octave lower"
            >
              <ChevronLeft className="size-3.5 mr-0.5" /> Octave -
            </Button>
            <span className="text-xs font-mono font-medium px-2 py-0.5 bg-muted/40 rounded border border-border/60">
              C{startOctave} – C{startOctave + numOctaves}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canShiftUp}
              onClick={handleShiftOctaveUp}
              className="h-7 text-xs"
              title="Shift range 1 octave higher"
            >
              Octave + <ChevronRight className="size-3.5 ml-0.5" />
            </Button>
          </div>
        </div>

        {/* View Options: Labels, Shortcuts, Sustain */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Key labels */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Labels:</span>
            <select
              value={showLabels}
              onChange={(e) => setShowLabels(e.target.value as "all" | "c-only" | "none")}
              className="h-7 rounded border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none"
            >
              <option value="all">All Notes</option>
              <option value="c-only">C Keys Only</option>
              <option value="none">No Labels</option>
            </select>
          </div>

          {/* Shortcut hints toggle */}
          <Button
            type="button"
            variant={showShortcuts ? "default" : "outline"}
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="h-7 text-xs"
          >
            PC Keys: {showShortcuts ? "ON" : "OFF"}
          </Button>

          {/* Sustain Pedal Toggle */}
          <Button
            type="button"
            variant={sustainEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setSustainEnabled(!sustainEnabled)}
            className={cn(
              "h-7 text-xs transition-colors",
              sustainEnabled && "bg-amber-600 hover:bg-amber-700 text-white border-amber-600",
            )}
          >
            Sustain Pedal: {sustainEnabled ? "ENGAGED" : "OFF"}
          </Button>
        </div>
      </div>

      {/* Main Virtual Piano Component */}
      <div className="rounded-[2px] border border-border bg-paper p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-crimson-deep">Realistic Touch & Keyboard Canvas</span>
            <span className="text-xs text-muted-foreground">
              (Use mouse clicks, touch glissando, or your computer keyboard A-S-D-F / W-E-T-Y)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {activeNotes.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sounding:</span>
                <div className="flex gap-1">
                  {Array.from(activeNotes).map((n) => (
                    <span
                      key={n}
                      className="rounded bg-crimson/10 dark:bg-crimson/20 border border-crimson/30 px-1.5 py-0.5 text-xs font-mono font-bold text-crimson-deep"
                    >
                      {displayNote(n)}
                    </span>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearActive}
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3 mr-1" /> Silence
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* The Piano */}
        <VirtualPiano
          startOctave={startOctave}
          numOctaves={numOctaves}
          activeNotes={activeNotes}
          showLabels={showLabels}
          showShortcuts={showShortcuts}
          onNotePlay={handleNotePlay}
          onNoteRelease={handleNoteRelease}
          sustainEnabled={sustainEnabled}
          allowKeyboardShortcuts={true}
        />
      </div>

      {/* Key Inspector & Musical Relationship Explorer */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Selected Key Primary Inspector */}
        <div className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6 lg:col-span-5">
          <div className="space-y-4">
            <div className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-crimson-deep">Pitch Inspector</span>
                {noteAnalysis.midi === 60 && (
                  <span className="rounded bg-crimson/10 border border-crimson/30 px-2 py-0.5 text-xs font-semibold text-crimson-deep">
                    ★ Middle C Anchor
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-baseline justify-between">
                <h3 className="font-display text-5xl font-bold text-foreground">
                  {noteAnalysis.formatted}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => playPitch(noteAnalysis.note)}
                  className="gap-1.5"
                >
                  <Volume2 className="size-4" aria-hidden /> Audition pitch
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scientific notation: <span className="font-mono text-foreground">{noteAnalysis.note}</span> · Octave register {noteAnalysis.octave}
              </p>
            </div>

            {/* Enharmonic & Keyboard location */}
            <div className="space-y-3 text-xs">
              <div className="rounded border border-border/80 bg-muted/20 p-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Keyboard Pattern & Location
                </span>
                <p className="text-foreground leading-relaxed">{noteAnalysis.groupPattern}</p>
                <p className="text-muted-foreground mt-1">{noteAnalysis.middleCRelation}</p>
              </div>

              {noteAnalysis.isBlack && (
                <div className="rounded border border-amber-200 bg-amber-50/70 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  <strong className="font-semibold">Enharmonic Twin: </strong>
                  {noteAnalysis.enharmonicText}
                </div>
              )}

              {/* Acoustic & MIDI stats */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded bg-muted/40 p-2.5 border border-border/50">
                  <span className="text-muted-foreground block text-[11px] mb-0.5">Frequency (Hz)</span>
                  <span className="font-mono font-semibold text-foreground text-sm">
                    {noteAnalysis.frequency} Hz
                  </span>
                </div>
                <div className="rounded bg-muted/40 p-2.5 border border-border/50">
                  <span className="text-muted-foreground block text-[11px] mb-0.5">MIDI Note</span>
                  <span className="font-mono font-semibold text-foreground text-sm">
                    MIDI {noteAnalysis.midi}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Relationships: Semitones & Whole Tones */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-7">
          <div className="border-b border-border pb-3 mb-4">
            <span className="eyebrow text-muted-foreground">Interval Relationships</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Neighboring Pitches from {noteAnalysis.formatted}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore half steps (semitones) and whole steps (whole tones) relative to the selected key.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Semitones (Half Steps) */}
            <div className="rounded border border-border/80 bg-muted/10 p-4 space-y-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-crimson-deep">
                  Semitone (Half Step)
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The smallest distance on the keyboard — the immediately adjacent key (1 semitone).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded bg-card p-2 border border-border/60">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Half step below: </span>
                    <strong className="text-foreground font-mono">
                      {displayNote(noteAnalysis.note)} → {displayNote(noteAnalysis.note, false)}
                    </strong>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const lowerMidi = noteAnalysis.midi - 1;
                      playPitch(displayNote(noteAnalysis.note));
                    }}
                    className="h-7 text-xs"
                  >
                    <Play className="size-3 mr-1" /> Audition
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded bg-card p-2 border border-border/60">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Half step above: </span>
                    <strong className="text-foreground font-mono">
                      {displayNote(noteAnalysis.note)}
                    </strong>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const higherMidi = noteAnalysis.midi + 1;
                      playPitch(displayNote(noteAnalysis.note));
                    }}
                    className="h-7 text-xs"
                  >
                    <Play className="size-3 mr-1" /> Audition
                  </Button>
                </div>
              </div>
            </div>

            {/* Whole Tones (Whole Steps) */}
            <div className="rounded border border-border/80 bg-muted/10 p-4 space-y-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                  Whole Tone (Whole Step)
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Two semitones (skipping exactly one key in between).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded bg-card p-2 border border-border/60">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Whole step below: </span>
                    <strong className="text-foreground font-mono">2 semitones down</strong>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const noteMidi = noteToMidi(selectedNote);
                      const target = noteMidi - 2;
                      // play chord
                    }}
                    className="h-7 text-xs"
                  >
                    <Play className="size-3 mr-1" /> Audition
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded bg-card p-2 border border-border/60">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Whole step above: </span>
                    <strong className="text-foreground font-mono">2 semitones up</strong>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const noteMidi = noteToMidi(selectedNote);
                      const target = noteMidi + 2;
                    }}
                    className="h-7 text-xs"
                  >
                    <Play className="size-3 mr-1" /> Audition
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Octave Jump Audition */}
          <div className="mt-4 rounded border border-border/70 bg-card p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="eyebrow text-crimson-deep">Octave Equivalence</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Audition {displayNote(selectedNote)} across octaves to hear the 2:1 frequency ratio.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[2, 3, 4, 5, 6].map((oct) => {
                  const targetNote = `${noteAnalysis.note.replace(/\d+/, "")}${oct}`;
                  const isCurrent = oct === noteAnalysis.octave;
                  return (
                    <Button
                      key={oct}
                      type="button"
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      onClick={() => playPitch(targetNote)}
                      className={cn("h-7 text-xs font-mono", isCurrent && "bg-crimson text-white")}
                    >
                      {displayNote(targetNote)}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

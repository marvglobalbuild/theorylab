import { Play, Plus, RotateCcw, Trash2, Volume2 } from "lucide-react";
import { useState } from "react";

import { Staff, type StaffChord, type StaffClef, type StaffDuration } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  NOTE_DURATIONS_CATALOG,
  NOTATION_PRESETS,
  noteToMidi,
  midiToFrequency,
} from "@/lib/music/notation-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const PITCH_LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const ACCIDENTALS = [
  { id: "natural", label: "♮ Natural", symbol: "" },
  { id: "sharp", label: "♯ Sharp", symbol: "#" },
  { id: "flat", label: "♭ Flat", symbol: "b" },
] as const;

export function NotationConstructor() {
  const piano = usePiano();

  const [clef, setClef] = useState<StaffClef>("treble");
  const [sequence, setSequence] = useState<StaffChord[]>([
    { keys: ["C4"], duration: "q" },
    { keys: ["E4"], duration: "q" },
    { keys: ["G4"], duration: "q" },
    { keys: ["C5"], duration: "h" },
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  // Note builder state
  const [selectedLetter, setSelectedLetter] = useState<string>("C");
  const [selectedAccidental, setSelectedAccidental] = useState<string>("");
  const [selectedOctave, setSelectedOctave] = useState<number>(4);
  const [selectedDuration, setSelectedDuration] = useState<StaffDuration>("q");
  const [isRestMode, setIsRestMode] = useState<boolean>(false);

  // Construct current pitch
  const candidatePitch = `${selectedLetter}${selectedAccidental}${selectedOctave}`;

  const handlePreviewCandidate = () => {
    if (!isRestMode) {
      piano.playPhrase([{ notes: [candidatePitch], at: 0, duration: 0.7 }]);
    }
  };

  const handleAddNoteToStaff = () => {
    let chordToAdd: StaffChord;
    if (isRestMode) {
      // Map duration to rest duration
      const restDuration = selectedDuration.endsWith("r")
        ? selectedDuration
        : (`${selectedDuration}r` as StaffDuration);
      chordToAdd = { keys: [], duration: restDuration };
    } else {
      const normalDuration = selectedDuration.endsWith("r")
        ? (selectedDuration.replace("r", "") as StaffDuration)
        : selectedDuration;
      chordToAdd = { keys: [candidatePitch], duration: normalDuration };
      // Play sound
      piano.playPhrase([{ notes: [candidatePitch], at: 0, duration: 0.7 }]);
    }

    setSequence((prev) => [...prev, chordToAdd]);
    setSelectedIndex(sequence.length);
  };

  const handleRemoveSelected = () => {
    if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= sequence.length) return;
    setSequence((prev) => prev.filter((_, idx) => idx !== selectedIndex));
    setSelectedIndex((prev) => {
      if (prev === null) return null;
      if (prev >= sequence.length - 1) return Math.max(0, sequence.length - 2);
      return prev;
    });
  };

  const handleClearStaff = () => {
    setSequence([]);
    setSelectedIndex(null);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = NOTATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setClef(preset.clef);
    setSequence(preset.chords);
    setSelectedIndex(0);
  };

  const handlePlaySequence = () => {
    if (sequence.length === 0) return;

    // Convert StaffChords into PhraseSteps
    let currentTime = 0;
    const steps: PhraseStep[] = [];

    const durationToBeats: Record<string, number> = {
      w: 4,
      wr: 4,
      h: 2,
      hr: 2,
      q: 1,
      qr: 1,
      "8": 0.5,
      "8r": 0.5,
      "16": 0.25,
      "16r": 0.25,
      hd: 3,
      qd: 1.5,
      "8d": 0.75,
      "16d": 0.375,
    };

    const tempoFactor = 0.5; // seconds per beat at 120 bpm

    sequence.forEach((chord) => {
      const beats = durationToBeats[chord.duration] ?? 1;
      const stepDuration = beats * tempoFactor;

      if (chord.keys.length > 0 && !chord.duration.endsWith("r")) {
        steps.push({
          notes: chord.keys,
          at: currentTime,
          duration: stepDuration * 0.95,
        });
      }

      currentTime += stepDuration;
    });

    piano.playPhrase(steps, (step) => {
      if (!step) return;
      const stepIndex = steps.indexOf(step);
      if (stepIndex >= 0) {
        setSelectedIndex(stepIndex);
      }
    });
  };

  const handleSelectNotehead = (idx: number) => {
    setSelectedIndex(idx);
    const item = sequence[idx];
    if (item && item.keys.length > 0 && !item.duration.endsWith("r")) {
      piano.playPhrase([{ notes: item.keys, at: 0, duration: 0.8 }]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Clef switch & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-border bg-paper p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Staff Clef:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={clef === "treble" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setClef("treble");
                if (selectedOctave < 4) setSelectedOctave(4);
              }}
              className="h-7 text-xs font-medium"
            >
              𝄞 Treble
            </Button>
            <Button
              type="button"
              variant={clef === "bass" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setClef("bass");
                if (selectedOctave > 3) setSelectedOctave(3);
              }}
              className="h-7 text-xs font-medium"
            >
              𝄢 Bass
            </Button>
          </div>
        </div>

        {/* Presets & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Load Preset:</span>
          <select
            className="h-8 rounded border border-border bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-crimson"
            onChange={(e) => handleLoadPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select an educational preset...
            </option>
            {NOTATION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handlePlaySequence}
            disabled={sequence.length === 0}
            className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white"
          >
            <Play className="mr-1 size-3.5" aria-hidden /> Play staff sequence
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearStaff}
            disabled={sequence.length === 0}
            className="h-8 text-xs text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="mr-1 size-3.5" aria-hidden /> Clear
          </Button>
        </div>
      </div>

      {/* Main Interactive Engraved Staff */}
      <div className="rounded-[2px] border border-border bg-paper p-5">
        <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="eyebrow text-crimson-deep">Interactive Constructor Canvas</span>
            <span className="text-xs text-muted-foreground">
              ({sequence.length} elements · Click any note to inspect or remove)
            </span>
          </div>

          {selectedIndex !== null && sequence[selectedIndex] && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Selected:{" "}
                <strong className="text-foreground">
                  {sequence[selectedIndex]!.keys.length > 0
                    ? displayNote(sequence[selectedIndex]!.keys[0]!)
                    : "Rest"}
                </strong>{" "}
                ({sequence[selectedIndex]!.duration})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveSelected}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 size-3.5" aria-hidden /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto py-2">
          <Staff
            chords={sequence}
            clef={clef}
            height={180}
            selectedIndex={selectedIndex}
            onSelect={handleSelectNotehead}
            label={`${clef} staff constructor canvas`}
            emptyMessage="No notes on the staff yet. Use the note constructor below to place whole, half, quarter, eighth, or sixteenth notes and rests!"
          />
        </div>
      </div>

      {/* Note Construction Tool Palette */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-5">
          <h3 className="font-display text-xl font-semibold text-foreground">
            Note & Rest Constructor Palette
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure pitch name, accidental, octave, and rhythmic duration, then click &quot;Place on Staff&quot;.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Note Type: Sound vs Rest */}
          <div className="space-y-4 md:col-span-3 border-r border-border/60 pr-4">
            <div>
              <span className="eyebrow text-muted-foreground block mb-2">Element Type</span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant={!isRestMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRestMode(false)}
                  className="text-xs"
                >
                  Musical Note
                </Button>
                <Button
                  type="button"
                  variant={isRestMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsRestMode(true)}
                  className="text-xs"
                >
                  Rest (Silence)
                </Button>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <span className="eyebrow text-muted-foreground block mb-2">Duration Value</span>
              <div className="space-y-1.5">
                {[
                  { dur: "w", restDur: "wr", name: "Whole (4 beats)", uk: "Semibreve" },
                  { dur: "h", restDur: "hr", name: "Half (2 beats)", uk: "Minim" },
                  { dur: "q", restDur: "qr", name: "Quarter (1 beat)", uk: "Crotchet" },
                  { dur: "8", restDur: "8r", name: "Eighth (1/2 beat)", uk: "Quaver" },
                  { dur: "16", restDur: "16r", name: "Sixteenth (1/4 beat)", uk: "Semiquaver" },
                ].map((item) => {
                  const targetDuration = isRestMode ? item.restDur : item.dur;
                  const isSelected = selectedDuration === targetDuration;
                  return (
                    <button
                      key={item.dur}
                      type="button"
                      onClick={() => setSelectedDuration(targetDuration as StaffDuration)}
                      className={cn(
                        "w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-medium"
                          : "bg-muted/30 border-border/60 hover:bg-muted text-foreground",
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{item.uk}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pitch Configuration (Disabled in Rest Mode) */}
          <div className="space-y-4 md:col-span-5">
            <div>
              <span className="eyebrow text-muted-foreground block mb-2">
                Pitch Letter {isRestMode && "(Not applicable for rest)"}
              </span>
              <div className="grid grid-cols-7 gap-1">
                {PITCH_LETTERS.map((letter) => (
                  <Button
                    key={letter}
                    type="button"
                    variant={selectedLetter === letter && !isRestMode ? "default" : "outline"}
                    size="sm"
                    disabled={isRestMode}
                    onClick={() => setSelectedLetter(letter)}
                    className="h-10 text-sm font-semibold font-mono"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Accidental */}
              <div>
                <span className="eyebrow text-muted-foreground block mb-2">Accidental</span>
                <div className="flex flex-col gap-1">
                  {ACCIDENTALS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={isRestMode}
                      onClick={() => setSelectedAccidental(acc.symbol)}
                      className={cn(
                        "rounded px-2.5 py-1.5 text-xs text-left border transition-colors",
                        selectedAccidental === acc.symbol && !isRestMode
                          ? "bg-primary text-primary-foreground border-primary font-medium"
                          : "bg-muted/30 border-border/60 hover:bg-muted text-foreground",
                        isRestMode && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Octave */}
              <div>
                <span className="eyebrow text-muted-foreground block mb-2">Octave Register</span>
                <div className="grid grid-cols-3 gap-1">
                  {[2, 3, 4, 5, 6].map((oct) => (
                    <Button
                      key={oct}
                      type="button"
                      variant={selectedOctave === oct && !isRestMode ? "default" : "outline"}
                      size="sm"
                      disabled={isRestMode}
                      onClick={() => setSelectedOctave(oct)}
                      className="h-8 text-xs font-mono"
                    >
                      {oct}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {clef === "treble"
                    ? "Treble staff centered around Octave 4 & 5"
                    : "Bass staff centered around Octave 2 & 3"}
                </p>
              </div>
            </div>
          </div>

          {/* Preview & Action Placement */}
          <div className="flex flex-col justify-between rounded border border-border/80 bg-muted/20 p-4 md:col-span-4">
            <div>
              <span className="eyebrow text-muted-foreground">Element Preview</span>
              <div className="mt-3">
                {isRestMode ? (
                  <div>
                    <h4 className="font-display text-3xl font-semibold text-foreground">Rest</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Duration: <span className="font-mono">{selectedDuration}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-display text-4xl font-semibold text-foreground">
                      {displayNote(candidatePitch)}
                    </h4>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      <p>
                        Scientific: <span className="font-mono text-foreground">{candidatePitch}</span>
                      </p>
                      <p>
                        Pitch Frequency:{" "}
                        <span className="font-mono text-foreground">
                          {midiToFrequency(noteToMidi(candidatePitch))} Hz
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {!isRestMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewCandidate}
                  className="w-full text-xs"
                >
                  <Volume2 className="mr-1.5 size-3.5" aria-hidden /> Test pitch sound
                </Button>
              )}

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleAddNoteToStaff}
                className="w-full text-xs bg-crimson hover:bg-crimson/90 text-white font-medium h-9"
              >
                <Plus className="mr-1.5 size-4" aria-hidden /> Place on staff
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


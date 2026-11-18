import { BookOpen, Info, Play, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getDiatonicChords,
  type ModeType,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

const TONIC_OPTIONS = ["C", "G", "D", "A", "E", "F", "Bb", "Eb"] as const;

export function RomanNumeralAnalysisView() {
  const piano = usePiano();

  const [tonic, setTonic] = useState<string>("C");
  const [mode, setMode] = useState<ModeType>("major");
  const [selectedDegree, setSelectedDegree] = useState<number>(1);

  const diatonicChords = useMemo(() => {
    return getDiatonicChords(tonic, mode, 4);
  }, [tonic, mode]);

  const activeChord = useMemo(() => {
    return diatonicChords.find((c) => c.degree === selectedDegree) ?? diatonicChords[0]!;
  }, [diatonicChords, selectedDegree]);

  const playDiatonicChord = (notes: string[]) => {
    notes.forEach((n) => piano.noteOn(n));
    setTimeout(() => {
      notes.forEach((n) => piano.noteOff(n));
    }, 1000);
  };

  const staffChords: StaffChord[] = useMemo(() => {
    return diatonicChords.map((c) => ({
      keys: c.notes,
      duration: "h" as const,
    }));
  }, [diatonicChords]);

  return (
    <div className="space-y-6">
      {/* Key & Mode Selector Toolbar */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tonic Key:
          </span>
          <div className="flex flex-wrap gap-1">
            {TONIC_OPTIONS.map((t) => (
              <Button
                key={t}
                type="button"
                variant={tonic === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTonic(t)}
                className="h-8 text-xs font-mono font-semibold px-3"
              >
                {displayNote(t)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mode:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={mode === "major" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("major")}
              className="h-7 text-xs font-medium"
            >
              Major Key
            </Button>
            <Button
              type="button"
              variant={mode === "minor" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("minor")}
              className="h-7 text-xs font-medium"
            >
              Harmonic Minor
            </Button>
          </div>
        </div>
      </div>

      {/* Diatonic Chords Matrix Cards */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {diatonicChords.map((chord) => {
          const isSelected = chord.degree === selectedDegree;
          return (
            <button
              key={chord.degree}
              type="button"
              onClick={() => {
                setSelectedDegree(chord.degree);
                playDiatonicChord(chord.notes);
              }}
              className={cn(
                "flex flex-col text-left rounded-[2px] border p-3.5 transition-all duration-150",
                isSelected
                  ? "border-crimson bg-crimson/5 text-foreground shadow-sm ring-1 ring-crimson"
                  : "border-border bg-card hover:bg-muted/40 text-muted-foreground",
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Deg. {chord.degree}</span>
                <span className="text-crimson-deep font-semibold">{chord.root}</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground mt-2">
                {chord.roman}
              </p>
              <p className="text-xs font-medium text-foreground mt-0.5">{chord.degreeName}</p>
              <p className="text-[10px] text-muted-foreground capitalize mt-1">
                {chord.quality} · {chord.functionType}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Diatonic Chord Detail & Staff */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="eyebrow text-crimson-deep">
                Degree {activeChord.degree} · {activeChord.degreeName}
              </span>
              <h3 className="font-display text-3xl font-bold text-foreground mt-0.5">
                {activeChord.roman} ({activeChord.root} {activeChord.quality})
              </h3>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => playDiatonicChord(activeChord.notes)}
              className="h-8 text-xs"
            >
              <Volume2 className="size-3.5 mr-1" /> Audition Chord
            </Button>
          </div>

          <div className="py-2">
            <Staff
              chords={staffChords}
              clef="treble"
              selectedIndex={selectedDegree - 1}
              onSelect={(idx) => {
                setSelectedDegree(idx + 1);
                playDiatonicChord(diatonicChords[idx]!.notes);
              }}
              height={180}
              label={`All 7 diatonic chords in ${tonic} ${mode}`}
            />
          </div>

          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/60 pt-3">
            <span>
              Constituent Notes:{" "}
              <strong className="text-foreground font-mono">
                {activeChord.notes.map((n) => displayNote(n)).join(" – ")}
              </strong>
            </span>
            <span className="capitalize">
              Harmonic Function: <strong className="text-foreground">{activeChord.functionType}</strong>
            </span>
          </div>
        </div>

        {/* Roman Numeral Case Conventions Explanation */}
        <div className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6 lg:col-span-5">
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <span className="eyebrow text-muted-foreground">Standardized Notation</span>
              <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
                Roman Numeral Case Rules
              </h4>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <div className="rounded border border-border/80 bg-muted/20 p-3 space-y-1.5">
                <p>
                  <strong className="text-foreground font-display text-sm">UPPERCASE (I, IV, V):</strong>
                </p>
                <p>Used for <strong>Major</strong> chords (Major 3rd + Perfect 5th).</p>
              </div>

              <div className="rounded border border-border/80 bg-muted/20 p-3 space-y-1.5">
                <p>
                  <strong className="text-foreground font-display text-sm">lowercase (ii, iii, vi):</strong>
                </p>
                <p>Used for <strong>Minor</strong> chords (Minor 3rd + Perfect 5th).</p>
              </div>

              <div className="rounded border border-border/80 bg-muted/20 p-3 space-y-1.5">
                <p>
                  <strong className="text-foreground font-display text-sm">lowercase with degree circle (vii°):</strong>
                </p>
                <p>Used for <strong>Diminished</strong> chords (Minor 3rd + Diminished 5th).</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            In harmonic minor, V is made major with the raised 7th leading tone.
          </div>
        </div>
      </div>
    </div>
  );
}

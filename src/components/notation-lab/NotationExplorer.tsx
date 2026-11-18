import { ChevronLeft, ChevronRight, Play, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

import { type StaffClef } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  BASS_STAFF_NOTES,
  TREBLE_STAFF_NOTES,
  type StaffNoteDefinition,
} from "@/lib/music/notation-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";
import { InteractiveStaffView } from "./InteractiveStaffView";

export function NotationExplorer() {
  const piano = usePiano();
  const [clef, setClef] = useState<StaffClef>("treble");
  const [selectedIndex, setSelectedIndex] = useState<number>(2); // Default to Middle C or G4
  const [rangeFilter, setRangeFilter] = useState<"standard" | "extended">("standard");

  const notesList = useMemo(() => {
    const raw = clef === "treble" ? TREBLE_STAFF_NOTES : BASS_STAFF_NOTES;
    if (rangeFilter === "standard") {
      return raw.filter((n) => n.difficulty === "beginner");
    }
    return raw;
  }, [clef, rangeFilter]);

  const chords = useMemo(() => {
    return notesList.map((item) => ({
      keys: [item.note],
      duration: "q" as const,
    }));
  }, [notesList]);

  // Safe selected item
  const safeIndex = selectedIndex < notesList.length ? selectedIndex : 0;
  const currentNote: StaffNoteDefinition | undefined = notesList[safeIndex];

  const handleSelectNote = (index: number) => {
    setSelectedIndex(index);
    const target = notesList[index];
    if (target) {
      piano.playPhrase([{ notes: [target.note], at: 0, duration: 0.8 }]);
    }
  };

  const handlePlayCurrent = () => {
    if (currentNote) {
      piano.playPhrase([{ notes: [currentNote.note], at: 0, duration: 0.9 }]);
    }
  };

  const handlePlayAll = () => {
    const steps: PhraseStep[] = notesList.map((item, idx) => ({
      notes: [item.note],
      at: idx * 0.45,
      duration: idx === notesList.length - 1 ? 1.0 : 0.4,
    }));

    piano.playPhrase(steps, (step) => {
      if (!step) return;
      const idx = steps.indexOf(step);
      if (idx >= 0) {
        setSelectedIndex(idx);
      }
    });
  };

  const handlePrevNote = () => {
    const nextIdx = (safeIndex - 1 + notesList.length) % notesList.length;
    handleSelectNote(nextIdx);
  };

  const handleNextNote = () => {
    const nextIdx = (safeIndex + 1) % notesList.length;
    handleSelectNote(nextIdx);
  };

  return (
    <div className="space-y-6">
      {/* Clef & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2px] border border-border bg-paper p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Clef:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={clef === "treble" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setClef("treble");
                setSelectedIndex(2);
              }}
              className="h-7 text-xs font-medium"
            >
              𝄞 Treble (G-Clef)
            </Button>
            <Button
              type="button"
              variant={clef === "bass" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setClef("bass");
                setSelectedIndex(4);
              }}
              className="h-7 text-xs font-medium"
            >
              𝄢 Bass (F-Clef)
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pitch Range:
          </span>
          <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
            <Button
              type="button"
              variant={rangeFilter === "standard" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setRangeFilter("standard");
                setSelectedIndex(0);
              }}
              className="h-7 text-xs font-medium"
            >
              Standard Staff
            </Button>
            <Button
              type="button"
              variant={rangeFilter === "extended" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setRangeFilter("extended");
                setSelectedIndex(0);
              }}
              className="h-7 text-xs font-medium"
            >
              Extended + Accidentals
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePlayAll}
            className="h-7 text-xs"
          >
            <Play className="mr-1 size-3.5" aria-hidden /> Play entire sequence
          </Button>
        </div>
      </div>

      {/* Main Staff Visualization & Inspector Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <InteractiveStaffView
            chords={chords}
            clef={clef}
            selectedIndex={safeIndex}
            onSelect={handleSelectNote}
            onPlaySelected={handlePlayCurrent}
            label={`${clef} clef notation reader showing ${notesList.length} notes`}
            height={190}
            showStaffGuides={false}
          />

          {/* Quick Select Pitch Ribbon */}
          <div className="rounded-[2px] border border-border bg-paper p-3">
            <p className="eyebrow mb-2 text-muted-foreground">
              Direct pitch selector ({notesList.length} notes):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {notesList.map((item, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={`${item.note}-${idx}`}
                    type="button"
                    onClick={() => handleSelectNote(idx)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors",
                      isSelected
                        ? "bg-crimson text-white shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-foreground border border-border/60",
                    )}
                  >
                    {displayNote(item.note)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Note Inspector Card */}
        <div className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6 lg:col-span-5">
          {currentNote ? (
            <div className="space-y-5">
              <div className="border-b border-border pb-4">
                <span className="eyebrow text-crimson-deep">Staff Note Inspector</span>
                <div className="mt-2 flex items-baseline justify-between">
                  <h3 className="font-display text-5xl font-semibold text-foreground">
                    {displayNote(currentNote.note)}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePlayCurrent}
                    className="gap-1.5"
                  >
                    <Volume2 className="size-4" aria-hidden /> Hear note
                  </Button>
                </div>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Scientific pitch: <span className="font-mono text-foreground">{currentNote.note}</span> (Octave {currentNote.octave})
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Staff Location
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {currentNote.positionDescription}
                  </p>
                </div>

                {currentNote.mnemonic && (
                  <div className="rounded border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    <strong className="font-semibold">Memory Mnemonic: </strong>
                    {currentNote.mnemonic}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="rounded bg-muted/40 p-2.5 border border-border/50">
                    <span className="text-muted-foreground block mb-0.5">Frequency</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      {currentNote.frequencyHz} Hz
                    </span>
                  </div>
                  <div className="rounded bg-muted/40 p-2.5 border border-border/50">
                    <span className="text-muted-foreground block mb-0.5">MIDI Key</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                      MIDI {currentNote.midiNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a note on the staff to inspect.</p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevNote}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" aria-hidden /> Previous
            </Button>
            <span className="text-xs font-mono text-muted-foreground">
              {safeIndex + 1} of {notesList.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextNote}
              className="gap-1 text-xs"
            >
              Next <ChevronRight className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


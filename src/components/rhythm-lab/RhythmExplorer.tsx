import {
  BookOpen,
  Info,
  Link as LinkIcon,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Staff, type StaffChord, type StaffDuration } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  getRhythmAudioContext,
  scheduleRhythmTone,
} from "@/lib/music/rhythm-audio";
import {
  NoteDurationSpec,
  RHYTHM_DURATIONS_CATALOG,
} from "@/lib/music/rhythm-lab";
import { cn } from "@/lib/utils";

export function RhythmExplorer() {
  const [selectedDurationId, setSelectedDurationId] = useState<StaffDuration>("q");
  const [filterMode, setFilterMode] = useState<"all" | "notes" | "rests" | "dotted">("all");

  const selectedSpec = useMemo(() => {
    return (
      RHYTHM_DURATIONS_CATALOG.find((d) => d.id === selectedDurationId) ??
      RHYTHM_DURATIONS_CATALOG[6]!
    );
  }, [selectedDurationId]);

  const filteredCatalog = useMemo(() => {
    if (filterMode === "notes") return RHYTHM_DURATIONS_CATALOG.filter((d) => !d.isRest);
    if (filterMode === "rests") return RHYTHM_DURATIONS_CATALOG.filter((d) => d.isRest);
    if (filterMode === "dotted") return RHYTHM_DURATIONS_CATALOG.filter((d) => d.isDotted);
    return RHYTHM_DURATIONS_CATALOG;
  }, [filterMode]);

  // Audio Playback of individual rhythmic duration (at standard 60 BPM -> 1 beat = 1.0 second)
  const playDurationAudio = (spec: NoteDurationSpec) => {
    const ctx = getRhythmAudioContext();
    if (!ctx) return;

    const secondsPerBeat = 0.8; // ~75 BPM for clear audible demonstration
    const durationSec = spec.quarterBeats * secondsPerBeat;

    if (spec.isRest) {
      // Play brief cue tick followed by silence
      const now = ctx.currentTime;
      scheduleRhythmTone(ctx, now, 0.04, 300, false);
    } else {
      const now = ctx.currentTime;
      scheduleRhythmTone(ctx, now, durationSec, 440, true);
    }
  };

  const staffChords: StaffChord[] = useMemo(() => {
    return [
      {
        keys: selectedSpec.isRest ? [] : ["C4"],
        duration: selectedSpec.id,
      },
    ];
  }, [selectedSpec]);

  return (
    <div className="space-y-6">
      {/* Category Filter Toolbar */}
      <div className="rounded-[2px] border border-border bg-paper p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow text-muted-foreground block mb-1">
            Note & Rest Taxonomy
          </span>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Explore Note & Rest Durations
          </h3>
        </div>

        <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
          <Button
            type="button"
            variant={filterMode === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("all")}
            className="h-7 text-xs font-medium"
          >
            All Durations
          </Button>
          <Button
            type="button"
            variant={filterMode === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("notes")}
            className="h-7 text-xs font-medium"
          >
            Notes Only
          </Button>
          <Button
            type="button"
            variant={filterMode === "rests" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("rests")}
            className="h-7 text-xs font-medium"
          >
            Rests Only
          </Button>
          <Button
            type="button"
            variant={filterMode === "dotted" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("dotted")}
            className="h-7 text-xs font-medium"
          >
            Dotted Values
          </Button>
        </div>
      </div>

      {/* Grid of Rhythmic Elements */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredCatalog.map((spec) => {
          const isSelected = spec.id === selectedDurationId;
          return (
            <button
              key={spec.id}
              type="button"
              data-testid={`duration-card-${spec.id}`}
              onClick={() => {
                setSelectedDurationId(spec.id);
                playDurationAudio(spec);
              }}
              className={cn(
                "flex flex-col text-left rounded-[2px] border p-3.5 transition-all duration-150 cursor-pointer",
                isSelected
                  ? "border-crimson bg-crimson/5 text-foreground shadow-sm ring-1 ring-crimson"
                  : "border-border bg-card hover:bg-muted/40 text-muted-foreground",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl text-foreground font-bold">
                  {spec.symbolGlyph}
                </span>
                <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono">
                  {spec.quarterBeats} {spec.quarterBeats === 1 ? "beat" : "beats"}
                </span>
              </div>
              <h4 className="mt-2 text-xs font-semibold text-foreground line-clamp-1">
                {spec.nameUs}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{spec.nameUk}</p>
            </button>
          );
        })}
      </div>

      {/* Main Selected Duration Inspector */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: VexFlow Staff Engraving & Sound */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="eyebrow text-crimson-deep">
                {selectedSpec.isRest ? "Rest Symbol" : "Note Symbol"}
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground mt-0.5">
                {selectedSpec.nameUs} ({selectedSpec.nameUk})
              </h3>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => playDurationAudio(selectedSpec)}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white gap-1.5 font-medium"
            >
              <Volume2 className="size-3.5" />
              <span>Hear Duration</span>
            </Button>
          </div>

          <div className="py-2 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 rounded border border-border">
            <Staff
              chords={staffChords}
              clef="treble"
              timeSignature="4/4"
              height={140}
              label={`Musical staff displaying ${selectedSpec.nameUs}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="rounded border border-border/60 bg-muted/20 p-2">
              <div className="text-muted-foreground text-[10px] uppercase">Beat Value</div>
              <div className="font-bold text-foreground mt-0.5">{selectedSpec.quarterBeats} Beat(s)</div>
            </div>
            <div className="rounded border border-border/60 bg-muted/20 p-2">
              <div className="text-muted-foreground text-[10px] uppercase">Sixteenths</div>
              <div className="font-bold text-foreground mt-0.5">{selectedSpec.subdivisionsSixteenths} Subdiv.</div>
            </div>
            <div className="rounded border border-border/60 bg-muted/20 p-2">
              <div className="text-muted-foreground text-[10px] uppercase">Type</div>
              <div className="font-bold text-crimson-deep mt-0.5">
                {selectedSpec.isRest ? "Silence" : selectedSpec.isDotted ? "Dotted" : "Standard"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Academic Theory & Rhythmic Function */}
        <div className="rounded-[2px] border border-border bg-paper p-6 lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-border pb-3">
              <span className="eyebrow text-muted-foreground">Rhythmic Proportion</span>
              <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
                Mathematical Subdivisions & Context
              </h4>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              {selectedSpec.description}
            </p>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-foreground">Equivalencies in 4/4 Time:</div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  One {selectedSpec.nameUs} ={" "}
                  <strong className="text-foreground">
                    {(selectedSpec.quarterBeats / 4).toFixed(3).replace(/\.?0+$/, "")}
                  </strong>{" "}
                  Whole Note(s)
                </li>
                <li>
                  One {selectedSpec.nameUs} ={" "}
                  <strong className="text-foreground">
                    {(selectedSpec.quarterBeats / 1).toFixed(2).replace(/\.?0+$/, "")}
                  </strong>{" "}
                  Quarter Note(s)
                </li>
                <li>
                  One {selectedSpec.nameUs} ={" "}
                  <strong className="text-foreground">
                    {(selectedSpec.quarterBeats * 4).toFixed(0)}
                  </strong>{" "}
                  Sixteenth Note(s)
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="size-4 shrink-0 text-crimson mt-0.5" />
            <div>
              <strong className="text-foreground block">Ties vs. Dotted Notes:</strong>
              An augmentative dot increases duration by 50%. A tie (curved arc) connects two identical pitches to create custom durations that cross beats or bar lines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

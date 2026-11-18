import { CheckCircle2, ChevronRight, Info, Play, Volume2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Staff, type StaffChord } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  SATB_EDUCATIONAL_EXAMPLES,
  checkVoiceLeading,
  type SATBChord,
  type SATBExample,
  type VoiceLeadingRuleViolation,
} from "@/lib/music/harmony-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

export function VoiceLeadingSATBView() {
  const piano = usePiano();

  const [activeExampleId, setActiveExampleId] = useState<string>("authentic-cadence-correct");
  const [soloVoice, setSoloVoice] = useState<"all" | "soprano" | "alto" | "tenor" | "bass">("all");
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);

  const example: SATBExample = useMemo(() => {
    return (
      SATB_EDUCATIONAL_EXAMPLES.find((e) => e.id === activeExampleId) ??
      SATB_EDUCATIONAL_EXAMPLES[0]!
    );
  }, [activeExampleId]);

  // Check voice leading violations across consecutive chord pairs
  const violations = useMemo(() => {
    const list: { pairIndex: number; ruleViolations: VoiceLeadingRuleViolation[] }[] = [];
    for (let i = 0; i < example.chords.length - 1; i++) {
      const v = checkVoiceLeading(example.chords[i]!, example.chords[i + 1]!);
      if (v.length > 0) {
        list.push({ pairIndex: i, ruleViolations: v });
      }
    }
    return list;
  }, [example]);

  // Derive Treble chords (Soprano & Alto) and Bass chords (Tenor & Bass)
  const trebleChords: StaffChord[] = useMemo(() => {
    return example.chords.map((c) => {
      let keys: string[] = [];
      if (soloVoice === "all") keys = [c.alto, c.soprano];
      else if (soloVoice === "soprano") keys = [c.soprano];
      else if (soloVoice === "alto") keys = [c.alto];
      return { keys, duration: "h" as const };
    });
  }, [example, soloVoice]);

  const bassChords: StaffChord[] = useMemo(() => {
    return example.chords.map((c) => {
      let keys: string[] = [];
      if (soloVoice === "all") keys = [c.bass, c.tenor];
      else if (soloVoice === "tenor") keys = [c.tenor];
      else if (soloVoice === "bass") keys = [c.bass];
      return { keys, duration: "h" as const };
    });
  }, [example, soloVoice]);

  const playFullProgression = () => {
    const tempo = 1.0;
    const steps: PhraseStep[] = example.chords.map((c, i) => {
      let notes: string[] = [];
      if (soloVoice === "all") notes = [c.bass, c.tenor, c.alto, c.soprano];
      else if (soloVoice === "soprano") notes = [c.soprano];
      else if (soloVoice === "alto") notes = [c.alto];
      else if (soloVoice === "tenor") notes = [c.tenor];
      else if (soloVoice === "bass") notes = [c.bass];

      return {
        notes,
        at: i * tempo,
        duration: tempo * 0.9,
      };
    });

    piano.playPhrase(steps, (step) => {
      if (!step) {
        setActiveChordIndex(null);
        return;
      }
      const idx = steps.indexOf(step);
      if (idx >= 0) setActiveChordIndex(idx);
    });
  };

  const playSingleSATBChord = (idx: number) => {
    setActiveChordIndex(idx);
    const c = example.chords[idx];
    if (!c) return;

    let notes: string[] = [];
    if (soloVoice === "all") notes = [c.bass, c.tenor, c.alto, c.soprano];
    else if (soloVoice === "soprano") notes = [c.soprano];
    else if (soloVoice === "alto") notes = [c.alto];
    else if (soloVoice === "tenor") notes = [c.tenor];
    else if (soloVoice === "bass") notes = [c.bass];

    notes.forEach((n) => piano.noteOn(n));
    setTimeout(() => {
      notes.forEach((n) => piano.noteOff(n));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Educational Example Selector Ribbon */}
      <div className="rounded-[2px] border border-border bg-paper p-4">
        <span className="eyebrow text-muted-foreground block mb-2.5">
          Select SATB Chorale Case Study:
        </span>
        <div className="grid gap-2 sm:grid-cols-3">
          {SATB_EDUCATIONAL_EXAMPLES.map((ex) => {
            const isSelected = ex.id === activeExampleId;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setActiveExampleId(ex.id);
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
                    {ex.key}
                  </span>
                  {ex.hasErrors ? (
                    <span className="rounded bg-destructive/15 text-destructive px-1.5 py-0.5 text-[10px] font-semibold">
                      Rule Violation
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold">
                      Exemplary
                    </span>
                  )}
                </div>
                <h4 className="mt-1 text-xs font-semibold text-foreground line-clamp-1">
                  {ex.title}
                </h4>
                <p className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                  {ex.progression}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main SATB Analysis & Grand Staff Canvas */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow text-crimson-deep">{example.title}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono font-medium">
                {example.progression}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">{example.description}</p>
          </div>

          {/* Voice Audition Filters & Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Audition Voice:</span>
            <div className="inline-flex rounded border border-border p-0.5 bg-muted/20">
              <Button
                type="button"
                variant={soloVoice === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSoloVoice("all")}
                className="h-7 text-xs font-medium"
              >
                All 4 Voices
              </Button>
              <Button
                type="button"
                variant={soloVoice === "soprano" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSoloVoice("soprano")}
                className="h-7 text-xs font-medium"
              >
                Soprano
              </Button>
              <Button
                type="button"
                variant={soloVoice === "alto" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSoloVoice("alto")}
                className="h-7 text-xs font-medium"
              >
                Alto
              </Button>
              <Button
                type="button"
                variant={soloVoice === "tenor" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSoloVoice("tenor")}
                className="h-7 text-xs font-medium"
              >
                Tenor
              </Button>
              <Button
                type="button"
                variant={soloVoice === "bass" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSoloVoice("bass")}
                className="h-7 text-xs font-medium"
              >
                Bass
              </Button>
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={playFullProgression}
              className="h-8 text-xs bg-crimson hover:bg-crimson/90 text-white ml-2 font-medium"
            >
              <Play className="size-3.5 mr-1" /> Audition Arrangement
            </Button>
          </div>
        </div>

        {/* SATB Voice Matrix Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {example.chords.map((chord, idx) => {
            const isPlaying = activeChordIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => playSingleSATBChord(idx)}
                className={cn(
                  "cursor-pointer rounded-[2px] border p-3.5 transition-all text-center flex flex-col justify-between",
                  isPlaying
                    ? "border-crimson bg-crimson/15 shadow-md scale-102 ring-2 ring-crimson"
                    : "border-border/80 bg-card hover:bg-muted/40",
                )}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-1.5 mb-2">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Chord {idx + 1}
                  </span>
                  <span className="font-display text-sm font-bold text-crimson-deep">
                    {chord.roman ?? `Chord ${idx + 1}`}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-blue-700 dark:text-blue-300">
                    <span className="text-[11px] font-semibold">Soprano:</span>
                    <span className="font-mono font-bold">{displayNote(chord.soprano)}</span>
                  </div>
                  <div className="flex justify-between items-center text-cyan-700 dark:text-cyan-300">
                    <span className="text-[11px] font-semibold">Alto:</span>
                    <span className="font-mono font-bold">{displayNote(chord.alto)}</span>
                  </div>
                  <div className="flex justify-between items-center text-amber-700 dark:text-amber-300">
                    <span className="text-[11px] font-semibold">Tenor:</span>
                    <span className="font-mono font-bold">{displayNote(chord.tenor)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300">
                    <span className="text-[11px] font-semibold">Bass:</span>
                    <span className="font-mono font-bold">{displayNote(chord.bass)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual-Clef Staff Engraving */}
        <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-border/60">
          <div>
            <span className="eyebrow text-muted-foreground block mb-1">
              Treble Staff (Soprano & Alto):
            </span>
            <Staff
              chords={trebleChords}
              clef="treble"
              selectedIndex={activeChordIndex}
              onSelect={playSingleSATBChord}
              height={160}
              label="Treble staff showing Soprano and Alto voices"
            />
          </div>
          <div>
            <span className="eyebrow text-muted-foreground block mb-1">
              Bass Staff (Tenor & Bass):
            </span>
            <Staff
              chords={bassChords}
              clef="bass"
              selectedIndex={activeChordIndex}
              onSelect={playSingleSATBChord}
              height={160}
              label="Bass staff showing Tenor and Bass voices"
            />
          </div>
        </div>

        {/* Voice Leading Rule Inspection Feedback */}
        <div className="pt-3 border-t border-border/60">
          <span className="eyebrow text-muted-foreground block mb-2">
            Automated Voice Leading Diagnostic:
          </span>

          {violations.length > 0 ? (
            <div className="space-y-2">
              {violations.map((item, i) => (
                <div
                  key={i}
                  className="rounded-[2px] border border-destructive/40 bg-destructive/10 p-3.5 text-xs text-destructive-foreground dark:text-red-200"
                >
                  <div className="flex items-start gap-2.5">
                    <XCircle className="size-4 shrink-0 mt-0.5 text-destructive" />
                    <div>
                      <strong className="font-semibold block">
                        Violation between Chord {item.pairIndex + 1} and Chord {item.pairIndex + 2}:
                      </strong>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5">
                        {item.ruleViolations.map((v, vIdx) => (
                          <li key={vIdx}>{v.description}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2px] border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Strict Voice-Leading Validated:</strong> No parallel fifths, no parallel octaves, no voice crossing, and acceptable vocal spacing.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

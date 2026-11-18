import { BookOpen, CheckCircle, Clock, Info, Layers, Sparkles } from "lucide-react";

import {
  RHYTHM_DURATIONS_CATALOG,
  TIME_SIGNATURES_CATALOG,
} from "@/lib/music/rhythm-lab";

export function RhythmTheoryGuide() {
  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="flex items-start gap-4">
          <div className="rounded bg-crimson/10 p-2.5 text-crimson-deep dark:bg-crimson/20">
            <BookOpen className="size-6" />
          </div>
          <div>
            <span className="eyebrow text-crimson-deep">Theoretical Foundations</span>
            <h3 className="font-display text-2xl font-semibold text-foreground mt-0.5">
              Rhythm, Meter & Metric Organization Reference
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
              Rhythm is the temporal ordering of sound and silence. While pitch defines the vertical frequency of music, rhythm governs its horizontal progression through time. Understanding beat hierarchy, time signatures, metric subdivisions, dotted values, and syncopation is vital for expressive performance and accurate notation.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Core Definitions: Beat, Pulse, Tempo & Meter */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Fundamental Terminology</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Beat, Pulse, Tempo & Meter
          </h4>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Pulse (Tactus)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The steady, regular underlying recurrence of temporal units that listeners tap their feet to. It is isomorphic to a heartbeat or the ticking of an unaccented clock.
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Beat</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The fundamental metric unit of time in a given piece, measured against the pulse. Beats can carry primary stresses (downbeats), secondary stresses, or be unaccented.
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Tempo</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The speed or pace at which the pulse unfolds, measured precisely in Beats Per Minute (BPM) or indicated by classical Italian terms (Adagio, Andante, Allegro, Presto).
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Meter</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The recurring pattern of strong and weak beats that organizes pulses into measures (bars). Meter establishes the psychological framework of musical expectation.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Note & Rest Duration Hierarchy */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Graphic Taxonomy</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Note & Rest Values (UK & US Terminology)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Standard Western notation utilizes a base-2 binary subdivision system where each smaller note value is exactly half the duration of its predecessor.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RHYTHM_DURATIONS_CATALOG.filter((d) => !d.isDotted && !d.isRest).map((note) => {
            const matchingRest = RHYTHM_DURATIONS_CATALOG.find((d) => d.id === `${note.id}r`);
            return (
              <div
                key={note.id}
                className="rounded border border-border bg-muted/20 p-4 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl font-bold text-foreground">
                      {note.symbolGlyph}
                    </span>
                    <span className="font-mono text-xl text-crimson font-bold">
                      {matchingRest?.symbolGlyph}
                    </span>
                  </div>
                  <span className="rounded bg-paper px-2 py-0.5 font-mono text-xs font-bold border border-border">
                    {note.quarterBeats} {note.quarterBeats === 1 ? "beat" : "beats"}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-xs text-foreground">{note.nameUs}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{note.nameUk}</div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {note.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Time Signatures: Simple vs Compound */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Simple Meters */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Binary Subdivisions</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Simple Time Signatures
            </h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            In <strong>simple meter</strong>, each beat divides naturally into <strong>two equal parts</strong>. The numerator (top number) always specifies the exact number of beats per measure:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>2/4 (Simple Duple)</span>
                <span className="text-crimson">2 Quarter Beats</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">
                Two quarter-note beats per bar, each dividing into two eighth notes. Strong accent on 1, weak on 2. Common in military marches.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>3/4 (Simple Triple)</span>
                <span className="text-crimson">3 Quarter Beats</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">
                Three quarter-note beats per bar. Strong accent on 1, weak on 2 and 3. The foundation of the classical waltz, minuet, and mazurka.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>4/4 (Simple Quadruple)</span>
                <span className="text-crimson">4 Quarter Beats</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">
                Common Time (C). Four quarter-note beats per bar. Accent hierarchy: Beat 1 (Primary / Strong), Beat 2 (Weak), Beat 3 (Secondary / Medium), Beat 4 (Weak).
              </p>
            </div>
          </div>
        </div>

        {/* Compound Meters */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Ternary Subdivisions</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Compound Time Signatures
            </h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            In <strong>compound meter</strong>, each main pulse is a <strong>dotted note</strong> that subdivides naturally into <strong>three equal parts</strong>. The top number represents the total subdivision count:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>6/8 (Compound Duple)</span>
                <span className="text-crimson">2 Dotted-Quarter Pulses</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">
                Two macro-beats per bar (counted: 1-la-li, 2-la-li). Heavy accent on eighth note 1, secondary accent on eighth note 4. Typical of jigs and barcarolles.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>9/8 (Compound Triple)</span>
                <span className="text-crimson">3 Dotted-Quarter Pulses</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">
                Three macro-beats per bar (counted: 1-la-li, 2-la-li, 3-la-li). Creates a lilting 9-pulse landscape.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>12/8 (Compound Quadruple)</span>
                <span className="text-crimson">4 Dotted-Quarter Pulses</span>
              </div>
              <p className="text-muted-foreground font-sans text-xs">
                Four macro-beats per bar (12 eighth notes total). Creates an expansive flowing backdrop common in slow Baroque movements and blues ballads.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dotted Notes, Ties, and Syncopation */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Advanced Rhythmic Devices</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Dotted Values, Ties & Syncopation
          </h4>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded border border-border bg-muted/20 p-4 space-y-2">
            <div className="font-bold text-sm text-foreground">Augmentation Dot</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A dot placed to the right of a notehead increases its duration by exactly <strong>50% (half its original value)</strong>:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 font-mono list-disc list-inside">
              <li>Dotted Half (𝅗𝅥.) = 2 + 1 = 3 beats</li>
              <li>Dotted Quarter (𝅘𝅥.) = 1 + 0.5 = 1.5 beats</li>
              <li>Dotted Eighth (𝅘𝅥𝅮.) = 0.5 + 0.25 = 0.75 beats</li>
            </ul>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-2">
            <div className="font-bold text-sm text-foreground">The Tie Arc</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A curved line connecting two adjacent noteheads of identical pitch. The second note is not struck again; its duration is added smoothly to the first. Ties permit durations that cross beats or bar lines (e.g. holding across measure 1 into measure 2).
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-2">
            <div className="font-bold text-sm text-foreground">Syncopation & Hemiola</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Syncopation:</strong> Intentionally stressing an offbeat or weak beat while silencing or tying through the strong downbeat, creating musical bounce and tension.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              <strong>Hemiola:</strong> Articulating two bars of 3/4 time as three bars of 2/4 time, creating a momentary shift in metric grouping before cadences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

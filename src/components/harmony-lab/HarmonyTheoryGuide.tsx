import { BookOpen, CheckCircle, Info, Layers, Music, Sparkles } from "lucide-react";

import { CHORD_TYPES_CATALOG } from "@/lib/music/harmony-lab";

export function HarmonyTheoryGuide() {
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
              Tertian Harmony & Voice Leading Reference
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
              Harmony is the simultaneous combination of pitches and their sequential progression through time. In Western art music from the Common Practice Era, harmony is rooted in tertian structures (superimposed thirds), diatonic hierarchical functions (Tonic, Predominant, Dominant), and the contrapuntal voice-leading principles of four-part choral writing (SATB).
            </p>
          </div>
        </div>
      </div>

      {/* 1. Tertian Chords Catalog */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Fundamental Structures</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            The Nine Tertian Chord Qualities (Triads & Seventh Chords)
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Every tertian chord is built by stacking alternating diatonic letter names: Root, 3rd, 5th, and 7th. The combination of major and minor thirds establishes the acoustic quality and stability.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHORD_TYPES_CATALOG.map((chord) => (
            <div
              key={chord.id}
              className="rounded border border-border bg-muted/20 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
                <div>
                  <div className="font-bold text-sm text-foreground">{chord.name}</div>
                  <div className="text-[11px] font-mono text-crimson font-semibold">
                    Formula: {chord.formula}
                  </div>
                </div>
                <span className="rounded bg-paper px-2 py-0.5 font-mono text-xs font-bold border border-border">
                  {chord.symbolSuffix === "" ? "maj" : chord.symbolSuffix}
                </span>
              </div>

              <div className="text-xs text-muted-foreground leading-relaxed">
                {chord.description}
              </div>

              <div className="pt-1 flex flex-wrap gap-1">
                {chord.intervalNames.map((int, i) => (
                  <span
                    key={i}
                    className="rounded bg-paper px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/50"
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Inversions & Figured Bass */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Triad Inversions */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Basso Continuo</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Triad Inversions & Figured Bass
            </h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Inversion is determined entirely by which chord member sounds in the lowest sounding voice (the bass). The upper voices may be arranged in any order or octave.
          </p>

          <div className="space-y-3">
            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">Root Position (5/3)</span>
                <span className="font-mono text-crimson">Abbreviation: none or 5/3</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The root is in the bass. The upper tones lie a third and a fifth above the bass. Maximum acoustic stability.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">First Inversion (6/3)</span>
                <span className="font-mono text-crimson">Abbreviation: 6</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The third is in the bass. The upper tones lie a third and a sixth above the bass. Lightens texture and facilitates stepwise bass lines.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">Second Inversion (6/4)</span>
                <span className="font-mono text-crimson">Abbreviation: 6/4</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The fifth is in the bass. A fourth above the bass was classified as dissonant in Common Practice, requiring preparation and resolution (e.g. Cadential 6/4, Passing 6/4, Pedal 6/4).
              </p>
            </div>
          </div>
        </div>

        {/* Seventh Chord Inversions */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Four-Factor Chords</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Seventh Chord Inversions
            </h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Because seventh chords possess four distinct pitch classes, they introduce a third inversion where the seventh itself serves as the bass:
          </p>

          <div className="space-y-3">
            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">Root Position (7/5/3)</span>
                <span className="font-mono text-crimson">Abbreviation: 7</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Root in bass. Diatonic 7th above the bass creates urgency toward resolution.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">First Inversion (6/5/3)</span>
                <span className="font-mono text-crimson">Abbreviation: 6/5</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Third in bass. Common in V6/5 → I resolutions where the leading-tone bass steps upward to the tonic.
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">Second Inversion (6/4/3)</span>
                <span className="font-mono text-crimson">Abbreviation: 4/3</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Fifth in bass. Commonly used as a passing harmony (e.g. I → V4/3 → I6).
              </p>
            </div>

            <div className="rounded border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-foreground">Third Inversion (6/4/2)</span>
                <span className="font-mono text-crimson">Abbreviation: 4/2 or 2</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Seventh in bass. The chordal seventh MUST resolve downward by step (e.g. V4/2 → I6, bass resolves down to the third of the tonic).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Diatonic Functions & Roman Numeral Conventions */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Functional Analysis</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Diatonic Harmony & Roman Numeral Conventions
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Standard Roman numeral analysis communicates both scale degree and chord quality simultaneously.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded border border-border bg-muted/20 p-4 space-y-2">
            <div className="font-bold text-sm text-foreground">Uppercase vs. Lowercase</div>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-foreground">Uppercase (I, IV, V):</strong> Denotes Major triads.
              </li>
              <li>
                <strong className="text-foreground">Lowercase (ii, iii, vi):</strong> Denotes minor triads.
              </li>
              <li>
                <strong className="text-foreground">Degree Symbol (°):</strong> Lowercase with degree symbol (vii°) denotes diminished triads.
              </li>
              <li>
                <strong className="text-foreground">Plus Symbol (+):</strong> Uppercase with plus symbol (III+) denotes augmented triads.
              </li>
            </ul>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-2">
            <div className="font-bold text-sm text-foreground">Major Key Diatonic Matrix</div>
            <div className="font-mono text-xs space-y-1">
              <div className="flex justify-between"><span>I</span><span className="text-muted-foreground">Tonic (Major)</span></div>
              <div className="flex justify-between"><span>ii</span><span className="text-muted-foreground">Supertonic (minor)</span></div>
              <div className="flex justify-between"><span>iii</span><span className="text-muted-foreground">Mediant (minor)</span></div>
              <div className="flex justify-between"><span>IV</span><span className="text-muted-foreground">Subdominant (Major)</span></div>
              <div className="flex justify-between"><span>V</span><span className="text-muted-foreground">Dominant (Major)</span></div>
              <div className="flex justify-between"><span>vi</span><span className="text-muted-foreground">Submediant (minor)</span></div>
              <div className="flex justify-between"><span>vii°</span><span className="text-muted-foreground">Leading Tone (diminished)</span></div>
            </div>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-2">
            <div className="font-bold text-sm text-foreground">Harmonic Minor Matrix</div>
            <p className="text-[11px] text-muted-foreground">
              Harmonic minor raises the 7th scale degree to create the leading tone necessary for a major dominant:
            </p>
            <div className="font-mono text-xs space-y-1">
              <div className="flex justify-between"><span>i</span><span className="text-muted-foreground">Tonic (minor)</span></div>
              <div className="flex justify-between"><span>ii°</span><span className="text-muted-foreground">Supertonic (diminished)</span></div>
              <div className="flex justify-between"><span>III</span><span className="text-muted-foreground">Mediant (Major)</span></div>
              <div className="flex justify-between"><span>iv</span><span className="text-muted-foreground">Subdominant (minor)</span></div>
              <div className="flex justify-between"><span>V</span><span className="text-muted-foreground">Dominant (Major with raised 7)</span></div>
              <div className="flex justify-between"><span>VI</span><span className="text-muted-foreground">Submediant (Major)</span></div>
              <div className="flex justify-between"><span>vii°</span><span className="text-muted-foreground">Leading Tone (diminished)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Cadence Taxonomy */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Musical Punctuation</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Cadence Taxonomy & Phrase Endings
          </h4>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Authentic Cadence (AC)</div>
            <div className="font-mono text-xs text-crimson font-semibold">V (or V7) → I (or i)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The strongest cadential formula. Classified as <em>Perfect Authentic (PAC)</em> when both chords are in root position with tonic in the soprano, or <em>Imperfect Authentic (IAC)</em> if inverted or soprano ends on 3rd/5th.
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Plagal Cadence (PC)</div>
            <div className="font-mono text-xs text-crimson font-semibold">IV (or iv) → I (or i)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Subdominant resolves directly to tonic without passing through the dominant. Traditionally referred to as the "Amen Cadence" in church liturgy.
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Half Cadence (HC)</div>
            <div className="font-mono text-xs text-crimson font-semibold">Any chord → V</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              An open, inconclusive pause on the Dominant. Functions like a comma or question mark in prose, demanding an answering phrase.
            </p>
          </div>

          <div className="rounded border border-border bg-muted/20 p-4 space-y-1.5">
            <div className="font-bold text-sm text-foreground">Deceptive Cadence (DC)</div>
            <div className="font-mono text-xs text-crimson font-semibold">V → vi (or VI in minor)</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The dominant leads listeners to anticipate the tonic, but resolves surprisingly to the submediant, prolonging harmonic motion.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Four-Part SATB Voice Leading Rules */}
      <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
        <div className="border-b border-border pb-3">
          <span className="eyebrow text-muted-foreground">Chorale Writing</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Four-Part (SATB) Voice Leading Principles
          </h4>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Vocal Ranges */}
          <div className="space-y-3">
            <div className="font-bold text-sm text-foreground">Vocal Ranges (Comfortable Chorale Span)</div>
            <div className="font-mono text-xs space-y-1.5">
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="font-bold text-foreground">Soprano (S)</span>
                <span>C4 to G5 (Treble clef, stems up)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="font-bold text-foreground">Alto (A)</span>
                <span>G3 to D5 (Treble clef, stems down)</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1">
                <span className="font-bold text-foreground">Tenor (T)</span>
                <span>C3 to G4 (Bass clef, stems up)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Bass (B)</span>
                <span>E2 to C4 (Bass clef, stems down)</span>
              </div>
            </div>
          </div>

          {/* Voice Leading Prohibitions */}
          <div className="space-y-2">
            <div className="font-bold text-sm text-foreground">Core Contrapuntal Rules</div>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
              <li>
                <strong className="text-foreground">Prohibition of Parallel 5ths & 8ths:</strong> Never move two voices in parallel motion from one perfect fifth to another, or from one octave/unison to another. This destroys vocal independence.
              </li>
              <li>
                <strong className="text-foreground">No Voice Crossing:</strong> Higher voices must never dip beneath lower voices (S ≥ A ≥ T ≥ B).
              </li>
              <li>
                <strong className="text-foreground">Upper Voice Spacing:</strong> Keep Soprano and Alto within an octave ($≤ 12$ semitones), and Alto and Tenor within an octave. The distance between Tenor and Bass may exceed an octave freely.
              </li>
              <li>
                <strong className="text-foreground">Leading Tone Resolution:</strong> In outer voices, the leading tone (scale degree 7) must resolve up by step to the tonic (scale degree 1).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

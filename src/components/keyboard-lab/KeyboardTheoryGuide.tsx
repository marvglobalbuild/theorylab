import { BookOpen, CheckCircle, Info, Keyboard, Music2, Sparkles } from "lucide-react";

import { ENHARMONIC_PAIRS } from "@/lib/music/keyboard-lab";
import { displayNote } from "@/lib/music/theory";

export function KeyboardTheoryGuide() {
  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="flex items-start gap-4">
          <div className="rounded bg-crimson/10 p-2.5 text-crimson-deep dark:bg-crimson/20">
            <BookOpen className="size-6" />
          </div>
          <div>
            <span className="eyebrow text-crimson-deep">Theoretical Foundation</span>
            <h3 className="font-display text-2xl font-semibold text-foreground mt-0.5">
              Anatomy and Geography of the Piano Keyboard
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
              The piano keyboard is the universal visual coordinate system of Western music theory. Every acoustic relationship — semitones, whole tones, intervals, chords, and scales — is physically arranged in linear, spatial progression from left (low pitch) to right (high pitch).
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 & 3 Black Key Pattern & Middle C */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* The 2-and-3 Pattern */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Keyboard Topography</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              The 2-and-3 Black Key Pattern
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The black keys are arranged in alternating clusters of <strong>two</strong> and <strong>three</strong>. This repeating visual pattern allows you to instantly identify any note without counting from the bottom:
          </p>

          <div className="space-y-2 text-xs">
            <div className="rounded border border-border/80 bg-muted/20 p-3">
              <strong className="text-foreground">Group of Two Black Keys:</strong>
              <ul className="mt-1 list-disc pl-4 space-y-0.5 text-muted-foreground">
                <li><strong>C</strong> sits immediately to the <em>left</em> of the 2 black keys.</li>
                <li><strong>D</strong> sits right in the <em>center</em> between the 2 black keys.</li>
                <li><strong>E</strong> sits immediately to the <em>right</em> of the 2 black keys.</li>
              </ul>
            </div>

            <div className="rounded border border-border/80 bg-muted/20 p-3">
              <strong className="text-foreground">Group of Three Black Keys:</strong>
              <ul className="mt-1 list-disc pl-4 space-y-0.5 text-muted-foreground">
                <li><strong>F</strong> sits immediately to the <em>left</em> of the 3 black keys.</li>
                <li><strong>G & A</strong> sit inside the spaces of the 3 black keys.</li>
                <li><strong>B</strong> sits immediately to the <em>right</em> of the 3 black keys.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Middle C (C4) Anchor */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">The Central Landmark</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Middle C (C4, MIDI 60)
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Middle C sits near the exact geometric center of a standard 88-key piano keyboard. It serves as the primary orientation anchor for both hands:
          </p>

          <div className="space-y-3">
            <div className="rounded bg-muted/30 p-3 text-xs space-y-1.5">
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Acoustic Frequency:</span>
                <span className="font-mono font-semibold text-foreground">261.63 Hz</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Standard MIDI Note:</span>
                <span className="font-mono font-semibold text-foreground">60</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1">
                <span className="text-muted-foreground">Scientific Octave:</span>
                <span className="font-mono font-semibold text-foreground">Octave 4 (C4)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grand Staff Bridge:</span>
                <span className="text-crimson-deep font-medium">1st ledger line between clefs</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              In keyboard literature, notes above Middle C are typically played by the right hand in treble clef; notes below Middle C are played by the left hand in bass clef.
            </p>
          </div>
        </div>
      </div>

      {/* Semitones (Half Steps) vs Whole Tones (Whole Steps) */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-4">
          <span className="eyebrow text-crimson-deep">Fundamental Musical Distances</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Semitones (Half Steps) and Whole Tones (Whole Steps)
          </h4>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Semitones */}
          <div className="rounded border border-border/70 bg-card p-4 space-y-2.5 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crimson-deep">
              Semitone (Half Step)
            </span>
            <p className="text-muted-foreground leading-relaxed">
              A <strong>semitone</strong> is the smallest interval in common-practice music. On the piano, it is the distance between <strong>any key and the immediately adjacent key</strong> (white to black, black to white, or white to white).
            </p>

            <div className="rounded border border-amber-200 bg-amber-50/70 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <strong className="font-semibold">The Natural Semitones:</strong>
              <p className="mt-1 leading-relaxed">
                Between <strong>B and C</strong>, and between <strong>E and F</strong>, there is no black key! Moving from B to C or from E to F is a natural half step (semitone) between two adjacent white keys.
              </p>
            </div>
          </div>

          {/* Whole Tones */}
          <div className="rounded border border-border/70 bg-card p-4 space-y-2.5 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
              Whole Tone (Whole Step)
            </span>
            <p className="text-muted-foreground leading-relaxed">
              A <strong>whole tone</strong> consists of two semitones (half steps). On the keyboard, you <strong>skip exactly one key</strong> (black or white) and land on the next key.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li><strong>C to D</strong> is a whole tone (skips C♯/D♭).</li>
              <li><strong>D to E</strong> is a whole tone (skips D♯/E♭).</li>
              <li><strong>E to F♯</strong> is a whole tone (skips F natural!).</li>
              <li><strong>F to G</strong> is a whole tone (skips F♯/G♭).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enharmonics & Octave Equivalence */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-4">
          <span className="eyebrow text-muted-foreground">Notation & Spelling</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Enharmonic Equivalents on the Black Keys
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Every black key can be named in two ways depending on whether it is approached from below (raised by a sharp ♯) or from above (lowered by a flat ♭).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 font-semibold text-foreground">Sharp Spelling (♯)</th>
                <th className="p-3 font-semibold text-foreground">Flat Spelling (♭)</th>
                <th className="p-3 font-semibold text-foreground">Cluster Location</th>
                <th className="p-3 font-semibold text-foreground">Acoustic Identity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr className="hover:bg-muted/10">
                <td className="p-3 font-display font-bold text-foreground">C♯ (C-Sharp)</td>
                <td className="p-3 font-display font-bold text-foreground">D♭ (D-Flat)</td>
                <td className="p-3 text-muted-foreground">1st key of 2-black group</td>
                <td className="p-3 font-mono text-crimson-deep">Same pitch (1 semitone above C)</td>
              </tr>
              <tr className="hover:bg-muted/10">
                <td className="p-3 font-display font-bold text-foreground">D♯ (D-Sharp)</td>
                <td className="p-3 font-display font-bold text-foreground">E♭ (E-Flat)</td>
                <td className="p-3 text-muted-foreground">2nd key of 2-black group</td>
                <td className="p-3 font-mono text-crimson-deep">Same pitch (1 semitone below E)</td>
              </tr>
              <tr className="hover:bg-muted/10">
                <td className="p-3 font-display font-bold text-foreground">F♯ (F-Sharp)</td>
                <td className="p-3 font-display font-bold text-foreground">G♭ (G-Flat)</td>
                <td className="p-3 text-muted-foreground">1st key of 3-black group</td>
                <td className="p-3 font-mono text-crimson-deep">Same pitch (1 semitone above F)</td>
              </tr>
              <tr className="hover:bg-muted/10">
                <td className="p-3 font-display font-bold text-foreground">G♯ (G-Sharp)</td>
                <td className="p-3 font-display font-bold text-foreground">A♭ (A-Flat)</td>
                <td className="p-3 text-muted-foreground">2nd key of 3-black group</td>
                <td className="p-3 font-mono text-crimson-deep">Same pitch (between G and A)</td>
              </tr>
              <tr className="hover:bg-muted/10">
                <td className="p-3 font-display font-bold text-foreground">A♯ (A-Sharp)</td>
                <td className="p-3 font-display font-bold text-foreground">B♭ (B-Flat)</td>
                <td className="p-3 text-muted-foreground">3rd key of 3-black group</td>
                <td className="p-3 font-mono text-crimson-deep">Same pitch (1 semitone below B)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Computer Keyboard Shortcuts Reference Card */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="size-5 text-crimson-deep" />
            <h4 className="font-display text-xl font-semibold text-foreground">
              Computer Keyboard Controls Reference
            </h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Play the virtual keyboard directly from your physical computer keyboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded border border-border/80 bg-muted/20 p-4 space-y-2">
            <strong className="text-foreground block">White Keys (Diatonic Notes):</strong>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div><code>A</code> → C4 (Middle C)</div>
              <div><code>S</code> → D4</div>
              <div><code>D</code> → E4</div>
              <div><code>F</code> → F4</div>
              <div><code>G</code> → G4</div>
              <div><code>H</code> → A4 (440 Hz)</div>
              <div><code>J</code> → B4</div>
              <div><code>K</code> → C5</div>
              <div><code>L</code> → D5</div>
              <div><code>;</code> → E5</div>
            </div>
          </div>

          <div className="rounded border border-border/80 bg-muted/20 p-4 space-y-2">
            <strong className="text-foreground block">Black Keys (Accidentals):</strong>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div><code>W</code> → C♯4 / D♭4</div>
              <div><code>E</code> → D♯4 / E♭4</div>
              <div><code>T</code> → F♯4 / G♭4</div>
              <div><code>Y</code> → G♯4 / A♭4</div>
              <div><code>U</code> → A♯4 / B♭4</div>
              <div><code>O</code> → C♯5 / D♭5</div>
              <div><code>P</code> → D♯5 / E♭5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  BookOpen,
  Compass,
  FileMusic,
  HelpCircle,
  Lightbulb,
  Music,
  Scale,
  Sparkles,
  Waves,
} from "lucide-react";

import { INTERVALS_CATALOG } from "@/lib/music/ear-training-lab";

export function EarTrainingTheoryGuide() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="space-y-2 border-b border-border/60 pb-6">
        <span className="text-xs font-semibold tracking-wider uppercase text-crimson-deep">
          Academic Compendium
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          The Foundations of Aural Perception & Relative Pitch
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ear training in the classical conservatory tradition is not the cultivation of a magical,
          innate "absolute pitch" (which is statistically rare and musically non-essential). Rather,
          it is the rigorous training of <em>relative pitch</em>: the cognitive capacity to perceive,
          analyze, and anticipate the acoustic intervals, harmonic relationships, and voice leading
          currents that govern western musical literature.
        </p>
      </div>

      {/* 1. Relative Pitch vs Perfect Pitch */}
      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-crimson-deep">
          <Scale className="h-5 w-5" />
          <h3 className="font-display text-lg font-bold text-foreground">
            Relative Pitch vs. Absolute ("Perfect") Pitch
          </h3>
        </div>
        <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
          <p>
            <strong>Absolute pitch</strong> is the ability to name an isolated pitch without
            reference. While historically sensationalized, absolute pitch provides no inherent
            advantage in harmonic analysis, transposition, or counterpoint. In fact, possessors of
            absolute pitch often struggle when performing historical music in non-standard tunings
            (such as Baroque pitch at A=415 Hz).
          </p>
          <p>
            <strong>Relative pitch</strong>, by contrast, is the foundational skill of the
            professional musician, composer, and conductor. It enables you to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-foreground">
            <li>
              Identify intervals, scale degrees, and chord qualities regardless of what key a piece
              is played in.
            </li>
            <li>Transcribe heard melodies (melodic dictation) directly to staff notation.</li>
            <li>Sight-sing complex polyphonic lines by feeling scalar distances.</li>
            <li>Hear voice-leading motion, root movements, and cadential points in real time.</li>
          </ul>
        </div>
      </div>

      {/* 2. Complete 13 Intervals Mnemonic & Acoustic Reference */}
      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-crimson-deep">
          <Waves className="h-5 w-5" />
          <h3 className="font-display text-lg font-bold text-foreground">
            Intervals, Frequency Ratios & Song Mnemonics
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Intervals are the elemental distances between two pitches. In the harmonic overtone
          series, intervals with simple whole-number ratios (such as the octave 2:1 and the fifth
          3:2) sound acoustically pure and stable, whereas complex ratios produce interference beats
          and dissonance.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-border/70 rounded-lg overflow-hidden">
            <thead className="bg-paper font-semibold text-foreground border-b border-border/70">
              <tr>
                <th className="p-3">Interval</th>
                <th className="p-3">Span</th>
                <th className="p-3">Ratio</th>
                <th className="p-3">Consonance Class</th>
                <th className="p-3">Ascending Mnemonic</th>
                <th className="p-3">Descending Mnemonic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-muted-foreground">
              {INTERVALS_CATALOG.map((item) => {
                let descMnemonic = "Same pitch";
                if (item.semitones === 1) descMnemonic = "Für Elise / Joy to the World";
                else if (item.semitones === 2) descMnemonic = "Mary Had a Little Lamb";
                else if (item.semitones === 3) descMnemonic = "Hey Jude / Frosty the Snowman";
                else if (item.semitones === 4) descMnemonic = "Fate Motif (Beethoven 5)";
                else if (item.semitones === 5) descMnemonic = "Born Free / Eine kleine Nachtmusik";
                else if (item.semitones === 6) descMnemonic = "Blue 7 / Danse Macabre";
                else if (item.semitones === 7) descMnemonic = "The Flintstones / Swan Lake";
                else if (item.semitones === 8) descMnemonic = "Love Story / Man of Mystery";
                else if (item.semitones === 9) descMnemonic = "Sweet Caroline / Nobody Knows";
                else if (item.semitones === 10) descMnemonic = "Watermelon Man / Lady Jane";
                else if (item.semitones === 11) descMnemonic = "I Love You (Cole Porter)";
                else if (item.semitones === 12) descMnemonic = "Willow Weep for Me";

                return (
                  <tr key={item.semitones} className="hover:bg-paper/40 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      {item.name} ({item.shortName})
                    </td>
                    <td className="p-3 font-mono">{item.semitones} st</td>
                    <td className="p-3 font-mono">{item.ratioName}</td>
                    <td className="p-3 capitalize">{item.consonanceType.replace("-", " ")}</td>
                    <td className="p-3 text-crimson-deep font-medium">{item.mnemonicSong}</td>
                    <td className="p-3 text-foreground font-medium">{descMnemonic}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Consonance & Dissonance Taxonomy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-300 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Perfect Consonances
          </span>
          <h4 className="font-display text-base font-bold text-foreground">
            Unison, 5th & Octave
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Characterized by simple mathematical ratios (1:1, 2:1, 3:2). They sound open, resonant,
            and completely stable, providing the acoustic resting pillars of cadences.
          </p>
        </div>

        <div className="rounded-xl border border-blue-300 dark:border-blue-800/40 bg-blue-50/40 dark:bg-blue-950/20 p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Imperfect Consonances
          </span>
          <h4 className="font-display text-base font-bold text-foreground">
            3rds & 6ths (Major & Minor)
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Warm, expressive, and full-bodied. They give tertian chords their major or minor
            coloration while remaining consonant enough to sustain long vocal harmonies.
          </p>
        </div>

        <div className="rounded-xl border border-amber-300 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 p-5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Acoustic Dissonances
          </span>
          <h4 className="font-display text-base font-bold text-foreground">
            2nds, 7ths & Tritone
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create sharp auditory tension, friction, or forward propulsion. In tonal music,
            dissonances are the dramatic motor that demands resolution into consonant stability.
          </p>
        </div>
      </div>

      {/* 4. Cadence Recognition Guide */}
      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-crimson-deep">
          <BookOpen className="h-5 w-5" />
          <h3 className="font-display text-lg font-bold text-foreground">
            Cadence Recognition & Harmonic Punctuation
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-border/60 bg-paper/50 space-y-1.5">
            <h5 className="font-bold text-sm text-foreground">Authentic Cadence (V → I)</h5>
            <p className="text-muted-foreground">
              The harmonic full stop of Western music. The leading tone steps up to the tonic while
              the bass leaps down a fifth or up a fourth, producing decisive finality.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border/60 bg-paper/50 space-y-1.5">
            <h5 className="font-bold text-sm text-foreground">Plagal Cadence (IV → I)</h5>
            <p className="text-muted-foreground">
              The famous "Amen" cadence. Lacks a leading tone, creating an introspective, gentle, and
              solemn resolution where the tonic pitch is shared between both chords.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border/60 bg-paper/50 space-y-1.5">
            <h5 className="font-bold text-sm text-foreground">Half Cadence (Ending on V)</h5>
            <p className="text-muted-foreground">
              The musical comma or question mark. The phrase pauses unexpectedly on the dominant
              chord, leaving the listener in mid-air awaiting an eventual resolution.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border/60 bg-paper/50 space-y-1.5">
            <h5 className="font-bold text-sm text-foreground">Deceptive Cadence (V → vi)</h5>
            <p className="text-muted-foreground">
              The dominant leads the listener to expect the tonic, but resolves surprisingly to the
              submediant minor triad (or major VI in minor), creating psychological surprise.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { BookOpen, CheckCircle, Info, Music2 } from "lucide-react";

import { NOTE_DURATIONS_CATALOG } from "@/lib/music/notation-lab";

export function NotationTheoryGuide() {
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
              Comprehensive Music Notation Reference Guide
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-3xl">
              Music notation is the standardized graphic system that translates audible pitch, duration, and silence into precise visual instructions. Understanding the anatomy of the staff, clefs, and rhythmic subdivisions is the gateway to reading and composing all musical literature.
            </p>
          </div>
        </div>
      </div>

      {/* Anatomy of the Staff & Clefs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* The 5-Line Staff */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Fundamental Grid</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              The 5-Line, 4-Space Musical Staff
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            The staff (stave) consists of five parallel horizontal lines and four intervening spaces. 
            <strong> Always count lines and spaces from bottom to top:</strong>
          </p>

          <div className="rounded bg-muted/30 p-3.5 space-y-2 font-mono text-xs text-foreground">
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span>Line 5 (top)</span>
              <span className="text-muted-foreground">Highest line on standard staff</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1 text-muted-foreground">
              <span>Space 4</span>
              <span>Interior top space</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span>Line 4</span>
              <span className="text-muted-foreground">Fourth line</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1 text-muted-foreground">
              <span>Space 3</span>
              <span>Interior middle space</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span>Line 3</span>
              <span className="text-muted-foreground">Center horizontal axis</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1 text-muted-foreground">
              <span>Space 2</span>
              <span>Interior lower space</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1">
              <span>Line 2</span>
              <span className="text-muted-foreground">Second line</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1 text-muted-foreground">
              <span>Space 1</span>
              <span>Interior lowest space</span>
            </div>
            <div className="flex justify-between">
              <span>Line 1 (bottom)</span>
              <span className="text-muted-foreground">Lowest line on standard staff</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            As a note moves higher on the staff, its pitch sounds higher in acoustic frequency (Hz).
          </p>
        </div>

        {/* Clefs & Reference Landmarks */}
        <div className="rounded-[2px] border border-border bg-paper p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <span className="eyebrow text-muted-foreground">Pitch Fixing</span>
            <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
              Clefs: The Anchor Landmarks
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            A staff by itself has no specific pitch values until a <strong>clef</strong> is placed at the far left. The clef assigns an exact pitch reference to one specific line.
          </p>

          <div className="space-y-3">
            <div className="rounded border border-border/80 bg-muted/20 p-3">
              <div className="flex items-baseline justify-between">
                <strong className="text-sm font-display font-semibold text-foreground">
                  𝄞 Treble Clef (G-Clef)
                </strong>
                <span className="text-xs font-mono text-crimson-deep">Line 2 = G4</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The inner spiral wraps directly around <strong>Line 2</strong>, defining it as <strong>G4 (392 Hz)</strong>. Used for higher-register instruments (violin, flute, soprano voice, right hand of keyboard).
              </p>
            </div>

            <div className="rounded border border-border/80 bg-muted/20 p-3">
              <div className="flex items-baseline justify-between">
                <strong className="text-sm font-display font-semibold text-foreground">
                  𝄢 Bass Clef (F-Clef)
                </strong>
                <span className="text-xs font-mono text-crimson-deep">Line 4 = F3</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The dot anchors on <strong>Line 4</strong>, and the two surrounding dots enclose that line, fixing it as <strong>F3 (174.6 Hz)</strong>. Used for cello, bassoon, bass guitar, tuba, and keyboard left hand.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mnemonics & Memory Aids */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-4">
          <span className="eyebrow text-crimson-deep">Essential Memory Aids</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Standard Mnemonic Systems
          </h4>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Treble Lines */}
          <div className="rounded border border-border/70 bg-card p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Treble Clef Lines
            </span>
            <p className="font-display text-lg font-bold text-foreground mt-1">E - G - B - D - F</p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              &quot;Every Good Boy Does Fine&quot;
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] font-mono text-muted-foreground">
              <li>Line 1: E4 (Bottom)</li>
              <li>Line 2: G4 (G-Clef)</li>
              <li>Line 3: B4 (Middle)</li>
              <li>Line 4: D5</li>
              <li>Line 5: F5 (Top)</li>
            </ul>
          </div>

          {/* Treble Spaces */}
          <div className="rounded border border-border/70 bg-card p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Treble Clef Spaces
            </span>
            <p className="font-display text-lg font-bold text-foreground mt-1">F - A - C - E</p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Spells the English word &quot;FACE&quot;
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] font-mono text-muted-foreground">
              <li>Space 1: F4 (Bottom)</li>
              <li>Space 2: A4 (440 Hz)</li>
              <li>Space 3: C5</li>
              <li>Space 4: E5 (Top)</li>
            </ul>
          </div>

          {/* Bass Lines */}
          <div className="rounded border border-border/70 bg-card p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bass Clef Lines
            </span>
            <p className="font-display text-lg font-bold text-foreground mt-1">G - B - D - F - A</p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              &quot;Good Boys Do Fine Always&quot;
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] font-mono text-muted-foreground">
              <li>Line 1: G2 (Bottom)</li>
              <li>Line 2: B2</li>
              <li>Line 3: D3 (Middle)</li>
              <li>Line 4: F3 (F-Clef)</li>
              <li>Line 5: A3 (Top)</li>
            </ul>
          </div>

          {/* Bass Spaces */}
          <div className="rounded border border-border/70 bg-card p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bass Clef Spaces
            </span>
            <p className="font-display text-lg font-bold text-foreground mt-1">A - C - E - G</p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              &quot;All Cows Eat Grass&quot;
            </p>
            <ul className="mt-2 space-y-0.5 text-[11px] font-mono text-muted-foreground">
              <li>Space 1: A2 (Bottom)</li>
              <li>Space 2: C3 (C-Space)</li>
              <li>Space 3: E3</li>
              <li>Space 4: G3 (Top)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grand Staff & Middle C Connection */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-4">
          <span className="eyebrow text-muted-foreground">Structural Synthesis</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            The Grand Staff & The Middle C Bridge
          </h4>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              When a treble staff and bass staff are joined together with a vertical bracket and line, they form the <strong>Grand Staff</strong>.
            </p>
            <p>
              Right in the middle of the Grand Staff lies <strong>Middle C (C4, 261.63 Hz)</strong>. Middle C belongs equally to both clefs:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>In Treble Clef: Middle C sits on the <strong>first ledger line below</strong> the staff.</li>
              <li>In Bass Clef: Middle C sits on the <strong>first ledger line above</strong> the staff.</li>
            </ul>
            <p>
              It is the central bridge uniting the higher and lower acoustic realms.
            </p>
          </div>

          <div className="rounded border border-border/80 bg-muted/20 p-4 space-y-3">
            <span className="eyebrow text-crimson-deep">Ledger Lines</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When musical pitches extend above or below the 5 lines of the staff, small temporary lines called <strong>ledger lines</strong> are drawn parallel to the staff.
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3.5 text-crimson-deep" />
                <span>Notes can sit directly on a ledger line or in the space above/below it.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="size-3.5 text-crimson-deep" />
                <span>Ledger lines maintain the exact same spacing as regular staff lines.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Values & Rests Hierarchy Table */}
      <div className="rounded-[2px] border border-border bg-paper p-6">
        <div className="border-b border-border pb-3 mb-4">
          <span className="eyebrow text-crimson-deep">Rhythmic Subdivision</span>
          <h4 className="font-display text-xl font-semibold text-foreground mt-0.5">
            Note Durations & Corresponding Rests
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Every sound duration in music has an exact counterpart representing silence.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-3 font-semibold text-foreground">Note Value</th>
                <th className="p-3 font-semibold text-foreground">British / International</th>
                <th className="p-3 font-semibold text-foreground">American / Fractional</th>
                <th className="p-3 font-semibold text-foreground">Beats (4/4 meter)</th>
                <th className="p-3 font-semibold text-foreground">Rest Characteristics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {NOTE_DURATIONS_CATALOG.filter((item) => !item.isRest).map((item) => {
                const restItem = NOTE_DURATIONS_CATALOG.find(
                  (r) => r.isRest && r.beats === item.beats,
                );
                return (
                  <tr key={item.id} className="hover:bg-muted/10">
                    <td className="p-3 font-medium text-foreground">
                      <span className="font-mono text-sm font-bold">{item.nameUs}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.nameUk}</td>
                    <td className="p-3 text-muted-foreground">{item.nameUs}</td>
                    <td className="p-3 font-mono font-semibold text-crimson-deep">
                      {item.relativeValue}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {restItem?.description ?? "Silence equivalent"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vital Rule Note */}
        <div className="mt-4 rounded border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <Info className="size-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
            <div>
              <strong className="font-semibold">Whole Rest vs Half Rest Distinction:</strong>
              <p className="mt-0.5 leading-relaxed">
                A <strong>Whole Rest (Semibreve Rest)</strong> hangs down like a heavy box from the 4th line (hanging below). A <strong>Half Rest (Minim Rest)</strong> sits upright like a top hat on the 3rd line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


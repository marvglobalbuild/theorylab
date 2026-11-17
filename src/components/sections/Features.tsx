import { ArrowRight, Play } from "lucide-react";
import { useState, type ReactNode } from "react";

import scoreImage from "@/assets/score-detail.jpg";
import { Reveal, RevealImage } from "@/components/motion/Reveal";
import { SectionLink } from "@/components/layout/SectionLink";
import { KeysGlyph } from "@/components/music/Illustrations";
import { SECTION_IDS } from "@/content/site";
import { cn } from "@/lib/utils";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { EarTrainingDemo } from "./EarTrainingDemo";
import { SectionHeading } from "./SectionHeading";

function Feature({
  index,
  title,
  body,
  children,
  className,
  inverse,
}: {
  index: string;
  title: string;
  body: string;
  children?: ReactNode;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <Reveal className={cn("flex flex-col p-6 md:p-10", inverse ? "bg-ink text-ink-foreground" : "bg-paper", className)}>
      <span className={cn("text-xs tabular-nums", inverse ? "text-crimson-soft" : "text-crimson-deep")}>{index}</span>
      <h3 className="type-display-md mt-4">{title}</h3>
      <p className={cn("mt-3 max-w-sm text-[0.95rem] leading-relaxed", inverse ? "text-ink-muted" : "text-muted-foreground")}>
        {body}
      </p>
      {children}
    </Reveal>
  );
}

const TREBLE_LINES = [
  { letter: "F", note: "F5", label: "5th line — F5" },
  { letter: "D", note: "D5", label: "4th line — D5" },
  { letter: "B", note: "B4", label: "3rd line — B4" },
  { letter: "G", note: "G4", label: "2nd line — G4" },
  { letter: "E", note: "E4", label: "1st line — E4" },
];

/** Treble staff lines labelled E G B D F, bottom to top — interactive. */
function LineNames() {
  const piano = usePiano();
  const [lit, setLit] = useState<number | null>(2);

  const playLine = (index: number) => {
    const line = TREBLE_LINES[index];
    if (!line) return;
    piano.playPhrase([{ notes: [line.note], at: 0, duration: 0.9 }], (s) => setLit(s ? index : index));
  };

  const playAll = () => {
    const ascending = [...TREBLE_LINES].reverse();
    const steps: PhraseStep[] = ascending.map((line, i) => ({
      notes: [line.note],
      at: i * 0.45,
      duration: i === ascending.length - 1 ? 1.1 : 0.45,
    }));
    piano.playPhrase(steps, (s) => {
      if (!s) return;
      const idx = steps.indexOf(s);
      if (idx >= 0) setLit(TREBLE_LINES.length - 1 - idx);
    });
  };

  const activeLine = (lit !== null ? TREBLE_LINES[lit] : undefined) ?? TREBLE_LINES[2]!;

  return (
    <div className="mt-auto pt-10">
      <svg
        viewBox="0 0 320 84"
        className="w-full text-foreground"
        role="group"
        aria-label="The five lines of the treble staff, from the bottom: E, G, B, D, F. Select any note to hear it."
      >
        {TREBLE_LINES.map((line, i) => {
          const y = 10 + i * 16;
          const cx = 40 + (4 - i) * 52;
          const active = lit === i;
          return (
            <g key={line.letter}>
              <line
                x1="0"
                x2="268"
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeWidth={active ? "1.3" : "0.9"}
                opacity={active ? "0.95" : "0.55"}
              />
              <g
                role="button"
                tabIndex={0}
                aria-label={`Play ${line.label}`}
                aria-pressed={active}
                onClick={() => playLine(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    playLine(i);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <circle cx={cx} cy={y} r="14" fill="transparent" />
                <ellipse
                  cx={cx}
                  cy={y}
                  rx="7.5"
                  ry="5.2"
                  transform={`rotate(-20 ${cx} ${y})`}
                  className={cn(
                    "transition-colors duration-200",
                    active ? "fill-primary" : "fill-foreground hover:fill-crimson",
                  )}
                />
              </g>
              <text
                x="284"
                y={y + 5}
                className={cn(
                  "font-display text-[15px] italic transition-colors",
                  active ? "fill-primary" : "fill-muted-foreground",
                )}
              >
                {line.letter}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {activeLine.label} — <span className="italic">Every Good Boy Deserves Fun.</span>
        </p>
        <PlayChip onClick={playAll}>Hear all lines</PlayChip>
      </div>
    </div>
  );
}

const CADENCE = [
  { numeral: "I", name: "C", notes: ["C3", "C4", "E4", "G4"] },
  { numeral: "IV", name: "F", notes: ["F3", "C4", "F4", "A4"] },
  { numeral: "V⁷", name: "G⁷", notes: ["G2", "B3", "F4", "G4"] },
  { numeral: "I", name: "C", notes: ["C3", "C4", "E4", "G4"] },
];

function PlayChip({ onClick, children, label }: { onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <Play className="size-3" aria-hidden /> {children}
    </button>
  );
}

function Progression() {
  const piano = usePiano();
  const [lit, setLit] = useState<number | null>(null);
  const playChord = (i: number) =>
    piano.playPhrase([{ notes: CADENCE[i]!.notes, at: 0, duration: 1.4 }], (s) => setLit(s ? i : null));
  const playAll = () => {
    const steps: PhraseStep[] = CADENCE.map((c, i) => ({ notes: c.notes, at: i * 1.1, duration: i === 3 ? 2.2 : 1.05 }));
    piano.playPhrase(steps, (s) => setLit(s ? steps.indexOf(s) : null));
  };
  return (
    <div className="mt-auto pt-10">
      <div className="grid grid-cols-4 border-y border-border">
        {CADENCE.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => playChord(i)}
            aria-label={`Play chord ${c.numeral}, ${c.name}`}
            className={cn(
              "py-5 text-center transition-colors hover:bg-primary/5",
              i > 0 && "border-l border-border",
              lit === i && "bg-primary/10",
            )}
          >
            <span
              className={cn(
                "block font-display text-4xl transition-colors md:text-5xl",
                lit === i ? "text-primary" : i >= 2 ? "text-crimson" : "text-foreground",
              )}
            >
              {c.numeral}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{c.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">In C major. V⁷–I closes with a perfect cadence. Tap any chord.</p>
        <PlayChip onClick={playAll}>Play progression</PlayChip>
      </div>
    </div>
  );
}

// One bar of 4/4: crotchet, two quavers, crotchet, crotchet (beats sum to 4)
const RHYTHM = [
  { beats: 1, label: "Crotchet" },
  { beats: 0.5, label: "Quaver" },
  { beats: 0.5, label: "Quaver" },
  { beats: 1, label: "Crotchet" },
  { beats: 1, label: "Crotchet" },
];
const BEAT = 0.5; // seconds — ♩ = 120

function RhythmBar() {
  const piano = usePiano();
  const [lit, setLit] = useState<number | null>(null);
  const play = () => {
    let at = 0;
    const steps: PhraseStep[] = [];
    for (let rep = 0; rep < 2; rep++) {
      RHYTHM.forEach((v) => {
        steps.push({ notes: ["G4"], at, duration: v.beats * BEAT * 0.85 });
        at += v.beats * BEAT;
      });
    }
    piano.playPhrase(steps, (s) => setLit(s ? steps.indexOf(s) % RHYTHM.length : null));
  };
  const playSingle = (index: number) => {
    const v = RHYTHM[index];
    if (!v) return;
    piano.playPhrase([{ notes: ["G4"], at: 0, duration: v.beats * BEAT * 0.85 }], (s) =>
      setLit(s ? index : null),
    );
  };
  return (
    <div className="mt-auto pt-10">
      <div className="flex items-end gap-1" role="group" aria-label="Rhythm values in one bar of 4/4">
        {RHYTHM.map((v, i) => (
          <button
            key={i}
            type="button"
            onClick={() => playSingle(i)}
            aria-label={`Play ${v.label} (${v.beats} beat${v.beats === 1 ? "" : "s"})`}
            style={{ flexGrow: v.beats }}
            className="basis-0 cursor-pointer py-1 text-left"
          >
            <div
              className={cn(
                "h-10 rounded-[2px] transition-[background-color,transform] duration-150 hover:opacity-90",
                lit === i ? "-translate-y-1 bg-crimson" : v.beats < 1 ? "bg-primary/75" : "bg-foreground/85",
              )}
            />
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 text-xs text-muted-foreground" aria-hidden>
        {[1, 2, 3, 4].map((b) => (
          <span key={b} className="border-l border-border pl-1.5">{b}</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">One bar of 4/4: crotchet, two quavers, crotchet, crotchet.</p>
        <PlayChip onClick={play}>Hear the rhythm</PlayChip>
      </div>
    </div>
  );
}

function TriadDemo() {
  const piano = usePiano();
  const [lit, setLit] = useState<number[]>([]);
  const TRIAD = ["C4", "E4", "G4"];
  const WHITE_INDEX = [0, 2, 4];
  const play = () => {
    const steps: PhraseStep[] = [
      ...TRIAD.map((n, i) => ({ notes: [n], at: i * 0.35, duration: 0.8 })),
      { notes: TRIAD, at: 1.15, duration: 1.6 },
    ];
    piano.playPhrase(steps, (s) => {
      const i = s ? steps.indexOf(s) : -1;
      setLit(i < 0 ? [] : i < 3 ? [WHITE_INDEX[i]!] : WHITE_INDEX);
    });
  };
  return (
    <div className="mt-auto pt-10">
      <button type="button" onClick={play} aria-label="Play the C major triad" className="block w-full">
        <KeysGlyph highlight={lit.length ? lit : WHITE_INDEX} className="h-24 w-full transition-opacity hover:opacity-90" />
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">C major triad: C – E – G</p>
        <div className="flex items-center gap-3">
          <PlayChip onClick={play}>Play triad</PlayChip>
          <SectionLink
            hash={SECTION_IDS.experience}
            className="link-draw inline-flex items-center gap-1.5 text-xs font-medium text-primary"
          >
            Full keyboard <ArrowRight className="size-3.5" aria-hidden />
          </SectionLink>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id={SECTION_IDS.features} className="border-t border-border bg-secondary py-16 md:py-28 lg:py-32">
      <div className="container-editorial">
        <SectionHeading
          number="04"
          label="Learning tools"
          title="Every concept has a way to be explored."
          emphasis={["explored."]}
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-px overflow-hidden border border-border bg-border md:mt-20 lg:grid-cols-12">
          <Reveal className="grid bg-paper md:grid-cols-2 lg:col-span-12">
            <RevealImage
              src={scoreImage}
              alt="A printed score with pencilled harmonic analysis beneath the staff"
              width={1408}
              height={858}
              className="aspect-[4/3] md:aspect-auto md:min-h-[26rem]"
              parallax={24}
            />
            <div className="flex flex-col justify-between p-6 md:p-12">
              <div>
                <span className="text-xs tabular-nums text-crimson-deep">01</span>
                <h3 className="type-display-lg mt-4">Theory Academy</h3>
                <p className="type-lede mt-4 max-w-md text-muted-foreground">
                  Structured lessons that make complex concepts easier to understand — each one moving from
                  explanation, to example, to practice.
                </p>
              </div>
              <SectionLink
                hash={SECTION_IDS.learningPaths}
                className="link-draw mt-10 inline-flex items-center gap-2 self-start text-sm font-medium text-primary"
              >
                See the learning paths <ArrowRight className="size-4" aria-hidden />
              </SectionLink>
            </div>
          </Reveal>

          <Feature
            index="02"
            title="Music Notation Lab"
            body="Read, identify and practise musical notes using interactive notation."
            className="lg:col-span-5"
          >
            <LineNames />
          </Feature>

          <Feature
            index="03"
            title="Harmony Studio"
            body="Understand how chords and musical progressions work."
            className="lg:col-span-7"
          >
            <Progression />
          </Feature>

          <Feature
            index="04"
            title="Virtual Keyboard"
            body="Explore notes, intervals, scales and chords through sound."
            className="lg:col-span-4"
          >
            <TriadDemo />
          </Feature>

          <Feature
            index="05"
            title="Rhythm Laboratory"
            body="Develop rhythmic understanding through practical exercises."
            className="lg:col-span-4"
          >
            <RhythmBar />
          </Feature>

          <Feature
            index="06"
            title="Ear Training"
            body="Improve your ability to recognise and distinguish musical sounds."
            className="lg:col-span-4"
            inverse
          >
            <EarTrainingDemo />
          </Feature>
        </div>
      </div>
    </section>
  );
}

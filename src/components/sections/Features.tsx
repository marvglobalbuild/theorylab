import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import scoreImage from "@/assets/score-detail.jpg";
import { Reveal, RevealImage } from "@/components/motion/Reveal";
import { SectionLink } from "@/components/layout/SectionLink";
import { KeysGlyph } from "@/components/music/Illustrations";
import { SECTION_IDS } from "@/content/site";
import { cn } from "@/lib/utils";
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
      <span className={cn("text-xs tabular-nums", inverse ? "text-gold" : "text-gold-deep")}>{index}</span>
      <h3 className="type-display-md mt-4">{title}</h3>
      <p className={cn("mt-3 max-w-sm text-[0.95rem] leading-relaxed", inverse ? "text-ink-muted" : "text-muted-foreground")}>
        {body}
      </p>
      {children}
    </Reveal>
  );
}

/** Treble staff lines labelled E G B D F, bottom to top. */
function LineNames() {
  const lines = ["F", "D", "B", "G", "E"];
  return (
    <div className="mt-auto pt-10">
      <svg viewBox="0 0 320 84" className="w-full text-foreground" role="img" aria-label="The five lines of the treble staff, from the bottom: E, G, B, D, F">
        {lines.map((letter, i) => {
          const y = 10 + i * 16;
          return (
            <g key={letter}>
              <line x1="0" x2="268" y1={y} y2={y} stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
              <ellipse cx={40 + (4 - i) * 52} cy={y} rx="7" ry="5" transform={`rotate(-20 ${40 + (4 - i) * 52} ${y})`} className={i === 2 ? "fill-primary" : "fill-foreground"} />
              <text x="284" y={y + 5} className="fill-muted-foreground font-display text-[15px] italic">
                {letter}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-xs text-muted-foreground">
        Lines of the treble staff, from the bottom: <span className="italic">Every Good Boy Deserves Fun.</span>
      </p>
    </div>
  );
}

function Progression() {
  const chords = [
    { numeral: "I", name: "C" },
    { numeral: "IV", name: "F" },
    { numeral: "V⁷", name: "G⁷" },
    { numeral: "I", name: "C" },
  ];
  return (
    <div className="mt-auto pt-10">
      <div className="grid grid-cols-4 border-y border-border">
        {chords.map((c, i) => (
          <div key={i} className={cn("py-5 text-center", i > 0 && "border-l border-border")}>
            <span className={cn("block font-display text-4xl md:text-5xl", i >= 2 ? "text-primary" : "text-foreground")}>
              {c.numeral}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">{c.name}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        In C major. The last two chords, V⁷–I, form a perfect cadence.
      </p>
    </div>
  );
}

function RhythmBar() {
  // One bar of 4/4: crotchet, two quavers, crotchet, crotchet (beats sum to 4)
  const values = [
    { beats: 1, label: "Crotchet" },
    { beats: 0.5, label: "Quaver" },
    { beats: 0.5, label: "Quaver" },
    { beats: 1, label: "Crotchet" },
    { beats: 1, label: "Crotchet" },
  ];
  return (
    <div className="mt-auto pt-10">
      <div className="flex items-end gap-1" aria-hidden>
        {values.map((v, i) => (
          <div key={i} style={{ flexGrow: v.beats }} className="basis-0">
            <div className={cn("h-10 rounded-[2px]", v.beats < 1 ? "bg-primary/80" : "bg-foreground/85")} />
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 text-xs text-muted-foreground" aria-hidden>
        {[1, 2, 3, 4].map((b) => (
          <span key={b} className="border-l border-border pl-1.5">{b}</span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        One bar of 4/4: crotchet, two quavers, crotchet, crotchet.
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section id={SECTION_IDS.features} className="border-t border-border bg-secondary py-24 md:py-32">
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
                <span className="text-xs tabular-nums text-gold-deep">01</span>
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
            <div className="mt-auto pt-10">
              <KeysGlyph highlight={[0, 2, 4]} className="h-24 w-full" />
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">C major triad: C – E – G</p>
                <SectionLink
                  hash={SECTION_IDS.experience}
                  className="link-draw inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  Play it <ArrowRight className="size-3.5" aria-hidden />
                </SectionLink>
              </div>
            </div>
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

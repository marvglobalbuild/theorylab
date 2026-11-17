import { Reveal } from "@/components/motion/Reveal";
import { KeysGlyph, StaffGlyph, StepsGlyph, WaveGlyph } from "@/components/music/Illustrations";
import { SECTION_IDS } from "@/content/site";
import { SectionHeading } from "./SectionHeading";

const PILLARS = [
  {
    title: "Visual explanations",
    body: "Concepts appear on the staff and the keyboard side by side, so you can see how notation and sound relate.",
    Glyph: StaffGlyph,
  },
  {
    title: "Interactive practice",
    body: "Every idea comes with something to play, identify or build — not only a page to read.",
    Glyph: () => <KeysGlyph highlight={[0, 2, 4]} />,
  },
  {
    title: "Listening experiences",
    body: "Hear each interval, chord and progression as you study it, and learn to recognise it by ear.",
    Glyph: WaveGlyph,
  },
  {
    title: "Progressive learning",
    body: "Lessons build on one another, from the musical alphabet to harmonic analysis.",
    Glyph: StepsGlyph,
  },
];

export function LearningIntro() {
  return (
    <section id={SECTION_IDS.about} className="border-y border-border bg-paper py-24 md:py-32">
      <div className="container-editorial grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHeading
            number="01"
            label="The approach"
            title="From understanding the notes to understanding the music."
            emphasis={["understanding", "music."]}
          />
          <Reveal delay={0.2}>
            <p className="type-lede measure mt-8 text-muted-foreground">
              Music theory becomes easier when you can see it, hear it and practise it. THEORYLAB brings the three
              together in every lesson.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:pl-10">
          {PILLARS.map(({ title, body, Glyph }, i) => (
            <Reveal
              key={title}
              delay={i * 0.08}
              className="border-t border-border py-8 sm:px-6 sm:[&:nth-child(odd)]:pl-0 sm:[&:nth-child(even)]:border-l sm:[&:nth-child(even)]:pr-0 sm:[&:nth-child(even)]:pl-8"
            >
              <div className="flex items-start justify-between">
                <Glyph />
                <span className="text-xs tabular-nums text-faint">0{i + 1}</span>
              </div>
              <h3 className="type-display-md mt-8">{title}</h3>
              <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-muted-foreground">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

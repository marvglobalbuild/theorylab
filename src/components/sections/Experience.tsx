import { Reveal } from "@/components/motion/Reveal";
import { Instrument } from "@/components/music/Instrument";
import { SECTION_IDS } from "@/content/site";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  return (
    <section id={SECTION_IDS.experience} className="bg-ink py-16 text-ink-foreground md:py-28 lg:py-32">
      <div className="container-editorial">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            inverse
            number="02"
            label="Interactive"
            title="Do more than read about music. Experience it."
            emphasis={["Experience", "it."]}
            className="lg:col-span-7"
          />
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
            <p className="type-lede text-ink-muted">
              Explore musical concepts through tools designed to turn theory into practical understanding. Play the
              keyboard, read the staff and compare intervals — all in your browser.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.1} y={40} className="mt-14 md:mt-20">
          <Instrument />
        </Reveal>
      </div>
    </section>
  );
}

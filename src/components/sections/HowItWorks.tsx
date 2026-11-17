import { motion } from "motion/react";

import { EASE, Reveal } from "@/components/motion/Reveal";
import { SECTION_IDS } from "@/content/site";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { number: "01", title: "Choose your level", description: "Start from your current understanding of music theory." },
  { number: "02", title: "Explore each concept", description: "Learn through clear explanations and musical examples." },
  { number: "03", title: "Practise interactively", description: "Use the keyboard, notation tools and practical exercises." },
  { number: "04", title: "Measure your progress", description: "Test your knowledge and identify areas for improvement." },
];

/** Staff line index (0 = bottom line) each step's note sits on — a rising line. */
const NOTE_LINE = [0.5, 1.5, 2.5, 3.5];
const LINE_GAP = 16;

export function HowItWorks() {
  return (
    <section id={SECTION_IDS.howItWorks} className="py-24 md:py-32">
      <div className="container-editorial">
        <SectionHeading
          number="05"
          label="How it works"
          title="Learn. Practise. Listen. Improve."
          emphasis={["Listen."]}
        />

        {/* Desktop: four steps rising across one staff */}
        <div className="relative mt-20 hidden md:block">
          <div aria-hidden className="relative h-[5.5rem]">
            {[0, 1, 2, 3, 4].map((line) => (
              <motion.div
                key={line}
                className="absolute inset-x-0 h-px origin-left bg-border"
                style={{ bottom: line * LINE_GAP + 8 }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE, delay: line * 0.06 }}
              />
            ))}
            <div className="absolute inset-0 grid grid-cols-4">
              {STEPS.map((step, i) => (
                <div key={step.number} className="relative">
                  <motion.span
                    className="absolute left-0 block h-[13px] w-[18px] -rotate-[20deg] rounded-[50%] bg-primary"
                    style={{ bottom: (NOTE_LINE[i] ?? 0) * LINE_GAP + 8 - 6.5 }}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.6 + i * 0.15 }}
                  />
                </div>
              ))}
            </div>
          </div>
          <ol className="mt-10 grid grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.number} delay={0.3 + i * 0.1} className="pr-4">
                  <span className="font-display text-5xl text-gold-deep">{step.number}</span>
                  <h3 className="type-display-md mt-4">{step.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Mobile: vertical sequence */}
        <ol className="mt-14 border-l border-border md:hidden">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 0.06} className="relative pb-10 pl-8 last:pb-0">
                <span aria-hidden className="absolute top-3 -left-[7px] h-[10px] w-[14px] -rotate-[20deg] rounded-[50%] bg-primary" />
                <span className="font-display text-4xl text-gold-deep">{step.number}</span>
                <h3 className="type-display-md mt-2">{step.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EASE, Reveal, WordReveal } from "@/components/motion/Reveal";
import { SectionLink } from "@/components/layout/SectionLink";
import { SECTION_IDS } from "@/content/site";

/** Closing staff with a final double barline and "Fine" — the end of the piece. */
function ClosingStaff() {
  return (
    <div aria-hidden className="relative mx-auto mt-20 max-w-4xl">
      <svg viewBox="0 0 800 64" className="w-full text-ink-foreground" fill="none">
        {[8, 20, 32, 44, 56].map((y, i) => (
          <motion.line
            key={y}
            x1="0"
            x2="780"
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.25"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE, delay: i * 0.05 }}
          />
        ))}
        <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.4, duration: 0.8 }}>
          <line x1="768" x2="768" y1="8" y2="56" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          <rect x="774" y="8" width="6" height="48" fill="currentColor" opacity="0.6" />
        </motion.g>
      </svg>
      <span className="absolute -bottom-7 right-0 font-display text-lg italic text-gold">Fine</span>
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="bg-ink-deep py-28 text-center text-ink-foreground md:py-36">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow text-ink-muted">Begin</p>
        </Reveal>
        <WordReveal
          text="Your understanding of music starts here."
          emphasis={["music"]}
          emphasisClassName="italic text-burgundy-soft"
          className="type-display-xl mx-auto mt-8 max-w-[14ch]"
        />
        <Reveal delay={0.25}>
          <p className="type-lede mx-auto mt-8 max-w-xl text-ink-muted">
            Explore music theory with a more practical, visual and engaging learning experience.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="inverse">
              <Link to="/start">
                Start learning <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline-inverse">
              <SectionLink hash={SECTION_IDS.learningPaths}>Explore learning paths</SectionLink>
            </Button>
          </div>
        </Reveal>
        <ClosingStaff />
      </div>
    </section>
  );
}

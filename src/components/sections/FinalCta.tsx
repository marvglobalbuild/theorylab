import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal, WordReveal } from "@/components/motion/Reveal";
import { SectionLink } from "@/components/layout/SectionLink";
import { SECTION_IDS } from "@/content/site";

export function FinalCta() {
  return (
    <section className="bg-ink-deep py-20 text-center text-ink-foreground md:py-32">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow text-ink-muted">Begin</p>
        </Reveal>
        <WordReveal
          text="Your understanding of music starts here."
          emphasis={["music"]}
          emphasisClassName="italic text-primary-soft"
          className="type-display-xl mx-auto mt-8 max-w-[14ch]"
        />
        <Reveal delay={0.25}>
          <p className="type-lede mx-auto mt-8 max-w-xl text-ink-muted">
            Explore music theory with a more practical, visual and engaging learning experience.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="inverse">
              <Link to="/register">
                Start learning <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline-inverse">
              <SectionLink hash={SECTION_IDS.learningPaths}>Explore learning paths</SectionLink>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

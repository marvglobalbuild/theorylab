import * as Accordion from "@radix-ui/react-accordion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { LEARNING_LEVELS, LEVEL_IDS } from "@/content/learning-paths";
import { SECTION_IDS } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

/** Notes on a tiny staff — one more for each level, so levels read at a glance. */
function LevelDensity({ count }: { count: number }) {
  return (
    <svg viewBox="0 0 56 24" aria-hidden className="h-6 w-14 text-foreground">
      {[4, 8, 12, 16, 20].map((y) => (
        <line key={y} x1="0" x2="56" y1={y} y2={y} stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <ellipse
          key={i}
          cx={9 + i * 12}
          cy={18 - i * 4}
          rx="3"
          ry="2.2"
          transform={`rotate(-20 ${9 + i * 12} ${18 - i * 4})`}
          className={i < count ? "fill-primary" : "fill-border"}
        />
      ))}
    </svg>
  );
}

export function LearningPaths() {
  const [openLevels, setOpenLevels] = useState<string[]>(["beginner"]);
  const allExpanded = openLevels.length === LEVEL_IDS.length;

  const toggleAll = () => {
    setOpenLevels(allExpanded ? [] : [...LEVEL_IDS]);
  };

  return (
    <section id={SECTION_IDS.learningPaths} className="py-16 md:py-28 lg:py-32">
      <div className="container-editorial grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              number="03"
              label="Learning paths"
              title="A clear path to musical understanding."
              emphasis={["musical"]}
            />
            <Reveal delay={0.2}>
              <p className="type-lede mt-8 text-muted-foreground">
                Build your knowledge step by step, from the foundations of music theory to more advanced musical
                concepts.
              </p>
              <Link
                to="/start"
                className="link-draw mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Find your starting level <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8 lg:col-start-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="eyebrow text-muted-foreground">Four progressive stages</span>
            <button
              type="button"
              onClick={toggleAll}
              className="link-draw py-0.5 text-xs font-medium text-primary"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <Accordion.Root
            type="multiple"
            value={openLevels}
            onValueChange={setOpenLevels}
            className="border-t border-foreground/80"
          >
            {LEARNING_LEVELS.map((level, i) => (
              <Accordion.Item key={level.id} value={level.id} className="group/item border-b border-border">
                <Reveal delay={i * 0.05}>
                  <Accordion.Header>
                    <Accordion.Trigger className="grid w-full grid-cols-[2.75rem_1fr_auto] items-start gap-x-3 py-6 text-left transition-colors sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-4 md:grid-cols-[5rem_1fr_auto_auto] md:gap-x-8 md:py-9">
                      <span className="font-display text-3xl leading-none text-crimson-deep transition-colors group-data-[state=open]/item:text-primary sm:text-4xl md:text-5xl">
                        {level.numeral}
                      </span>
                      <span>
                        <span className="type-display-md block">{level.name}</span>
                        <span className="mt-2 block max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
                          {level.summary}
                        </span>
                      </span>
                      <span className="hidden pt-2 md:block">
                        <LevelDensity count={i + 1} />
                      </span>
                      <span className="mt-1 inline-flex size-9 items-center justify-center rounded-full border border-border transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-editorial)] group-hover/item:border-foreground/40 group-data-[state=open]/item:rotate-45 group-data-[state=open]/item:border-primary group-data-[state=open]/item:bg-primary group-data-[state=open]/item:text-primary-foreground">
                        <Plus className="size-4" aria-hidden />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="pb-8 pl-0 sm:pl-[4.5rem] md:pb-9 md:pl-[7rem]">
                      <ol className="grid gap-x-10 sm:grid-cols-2">
                        {level.topics.map((topic, t) => (
                          <li key={topic.title} className={cn("flex gap-4 border-t border-border py-4")}>
                            <span className="pt-0.5 text-xs tabular-nums text-faint">
                              {level.numeral}.{t + 1}
                            </span>
                            <span>
                              <span className="block font-medium">{topic.title}</span>
                              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                                {topic.detail}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                      <Link
                        to="/start"
                        search={{ level: level.id }}
                        className="link-draw mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
                      >
                        Begin at {level.name.toLowerCase()} level <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </div>
                  </Accordion.Content>
                </Reveal>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}

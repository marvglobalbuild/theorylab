import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import lecturerImage from "@/assets/lecturer-room.jpg";
import { Button } from "@/components/ui/button";
import { EASE, Reveal, RevealImage } from "@/components/motion/Reveal";
import { SECTION_IDS } from "@/content/site";
import { SectionHeading } from "./SectionHeading";

const LECTURER_FEATURES = [
  {
    title: "Organised teaching resources",
    detail: "Lessons arranged by topic and level, ready to sit alongside your own syllabus and reading lists.",
  },
  {
    title: "Class learning activities",
    detail: "Interactive keyboard, notation and listening exercises you can run in a seminar or set for private study.",
  },
  {
    title: "Student assignments",
    detail: "Set work on specific concepts — from interval identification to harmonic analysis — and collect it in one place.",
  },
  {
    title: "Learning performance monitoring",
    detail: "See which concepts a class has grasped and where individual students may need more support.",
  },
];

export function Lecturers() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section id={SECTION_IDS.lecturers} className="border-t border-border bg-paper py-24 md:py-32">
      <div className="container-editorial grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <RevealImage
            src={lecturerImage}
            alt="A music seminar room with a grand piano and a chalkboard of written harmony"
            width={1200}
            height={1408}
            className="aspect-[4/5] w-full"
          />
          <p className="mt-3 text-xs text-muted-foreground">Designed for the seminar room and the practice room alike.</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-10">
          <SectionHeading
            number="06"
            label="For lecturers"
            title="A better way to teach the language of music."
            emphasis={["language"]}
          />
          <Reveal delay={0.15}>
            <p className="type-lede mt-8 max-w-xl text-muted-foreground">
              Support your teaching with structured learning materials, interactive demonstrations and tools for
              monitoring student progress.
            </p>
          </Reveal>

          <ul id={panelId} className="mt-12 border-t border-foreground/80">
            {LECTURER_FEATURES.map((f, i) => (
              <Reveal as="li" key={f.title} delay={i * 0.06} className="border-b border-border py-5">
                <div className="flex items-baseline gap-5">
                  <span className="text-xs tabular-nums text-gold-deep">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl">{f.title}</h3>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="overflow-hidden text-[0.95rem] leading-relaxed text-muted-foreground"
                        >
                          <span className="block pt-2">{f.detail}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.1} className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              size="lg"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="hover:[&_svg]:translate-x-0"
            >
              {open ? "Hide lecturer features" : "Explore lecturer features"}
              <ChevronDown className={open ? "rotate-180" : ""} />
            </Button>
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Lecturer tools are in development and will open once accounts are introduced.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

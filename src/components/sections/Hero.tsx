import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowRight, Music2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import heroImage from "@/assets/hero-piano.jpg";
import { Button } from "@/components/ui/button";
import { EASE, RevealImage, WordReveal } from "@/components/motion/Reveal";
import { SectionLink } from "@/components/layout/SectionLink";
import { Staff } from "@/components/music/Staff";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { toggleBackgroundMusic } from "@/lib/music/backgroundMusic";
import { useMusic } from "@/lib/music/useMusic";
import { SECTION_IDS } from "@/content/site";

const ARPEGGIO = ["C4", "E4", "G4", "C5"];
const TAGLINE = ["Understand", "Read", "Hear", "Create"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Parallax only where the score card floats beside the image (large screens)
  const [isWide, setIsWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], reduce || !isWide ? [0, 0] : [0, -70]);
  const piano = usePiano();
  const music = useMusic();
  const [lit, setLit] = useState<number | null>(null);

  const hearIt = () => {
    const steps: PhraseStep[] = [
      ...ARPEGGIO.map((n, i) => ({ notes: [n], at: i * 0.42, duration: 0.9 })),
      { notes: ARPEGGIO, at: ARPEGGIO.length * 0.42 + 0.1, duration: 1.8 },
    ];
    piano.playPhrase(steps, (s) => setLit(s ? steps.indexOf(s) : null));
  };

  const playOne = (index: number) => {
    const notes = index < ARPEGGIO.length ? [ARPEGGIO[index]!] : ARPEGGIO;
    piano.playPhrase([{ notes, at: 0, duration: 1.2 }], (s) => setLit(s ? index : null));
  };

  return (
    <section ref={ref} id={SECTION_IDS.top} className="relative overflow-hidden pt-28 md:pt-32 lg:pt-36">
      <div className="container-editorial grid items-end gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="relative z-10 pb-4 lg:col-span-6 lg:pb-24">
          <motion.p
            className="eyebrow flex items-center gap-3 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            <span aria-hidden className="h-px w-10 bg-crimson" />
            Classical music theory, interactive
          </motion.p>

          <WordReveal
            as="h1"
            animateOnMount
            delay={0.2}
            text="Music theory, understood differently."
            emphasis={["understood"]}
            className="type-display-xl mt-7 max-w-[11ch] text-foreground"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.75 }}
          >
            <p className="type-lede measure mt-8 text-muted-foreground">
              Explore the language of music through interactive lessons, visual demonstrations and listening
              experiences designed to make every concept come alive.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg">
                <Link to="/start">
                  Start learning <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="hover:[&_svg]:translate-x-0 hover:[&_svg]:translate-y-0.5">
                <SectionLink hash={SECTION_IDS.experience}>
                  Explore the experience <ArrowDown />
                </SectionLink>
              </Button>
            </div>
            <button
              type="button"
              onClick={toggleBackgroundMusic}
              aria-pressed={music.playing}
              className="group mt-7 inline-flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {music.playing ? <Pause className="size-3.5" /> : <Music2 className="size-3.5" />}
              </span>
              {music.playing ? "Pause Bach" : "Listen to Bach’s Prelude in C while you explore"}
            </button>
          </motion.div>
        </div>

        <div className="relative lg:col-span-6">
          <RevealImage
            priority
            delay={0.15}
            src={heroImage}
            alt="A grand piano keyboard in warm light with an open score on the music stand"
            width={1200}
            height={1504}
            className="aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[4/5]"
            imgClassName="object-[50%_70%]"
          />

          {/* Score card: engraved arpeggio that draws in, playable on request */}
          <motion.figure
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.9 }}
            className="relative z-10 mx-4 -mt-16 border border-border bg-paper p-4 shadow-[var(--shadow-lift)] sm:mx-auto sm:max-w-sm lg:absolute lg:bottom-14 lg:-left-24 lg:mx-0 lg:mt-0 lg:w-[22rem]"
          >
            <Staff
              chords={[...ARPEGGIO.map((k) => ({ keys: [k], duration: "q" as const })), { keys: ARPEGGIO, duration: "w" }]}
              height={130}
              revealNotes
              selectedIndex={lit}
              onSelect={playOne}
              label="C major arpeggio — C, E, G, C — followed by the full chord"
            />
            <figcaption className="mt-2 flex items-center justify-between gap-4 border-t border-border pt-3">
              <span className="text-xs leading-snug text-muted-foreground">
                <span className="font-display text-base italic text-foreground">C major</span>, broken then
                together — tap a note
              </span>
              <button
                type="button"
                onClick={hearIt}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[2px] border border-primary/30 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Play className="size-3" aria-hidden /> Hear it
              </button>
            </figcaption>
          </motion.figure>
        </div>
      </div>

      {/* Tagline: four verbs on a hairline */}
      <div className="container-editorial mt-16 md:mt-24">
        <ul className="grid grid-cols-2 border-t border-border md:grid-cols-4">
          {TAGLINE.map((word, i) => (
            <motion.li
              key={word}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1.1 + i * 0.08 }}
              className="flex items-baseline gap-3 border-border py-5 md:border-l md:pl-6 md:first:border-l-0 md:first:pl-0 [&:nth-child(even)]:border-l [&:nth-child(even)]:pl-5 md:[&:nth-child(even)]:pl-6"
            >
              <span className="text-xs tabular-nums text-crimson-deep">0{i + 1}</span>
              <span className="font-display text-xl sm:text-2xl md:text-[1.7rem]">
                {word} <span className="italic text-muted-foreground">music.</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

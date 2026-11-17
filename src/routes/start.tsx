import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EASE } from "@/components/motion/Reveal";
import { PageShell, PreviewTag } from "@/components/layout/PageShell";
import { SectionLink } from "@/components/layout/SectionLink";
import { LEARNING_LEVELS, LEVEL_IDS, type LevelId } from "@/content/learning-paths";
import { SECTION_IDS } from "@/content/site";
import { cn } from "@/lib/utils";

const FOCUS_AREAS = [
  { id: "reading", label: "Reading notation", tool: "Music Notation Lab" },
  { id: "harmony", label: "Harmony and chords", tool: "Harmony Studio" },
  { id: "ear", label: "Listening and ear training", tool: "Ear Training" },
  { id: "rhythm", label: "Rhythm and meter", tool: "Rhythm Laboratory" },
] as const;

export const Route = createFileRoute("/start")({
  validateSearch: (search: Record<string, unknown>): { level?: LevelId } => {
    const level = search["level"] as LevelId;
    return LEVEL_IDS.includes(level) ? { level } : {};
  },
  head: () => ({
    meta: [
      { title: "Start learning — THEORYLAB" },
      { name: "description", content: "Choose your level and focus to preview where your THEORYLAB learning path begins." },
      { property: "og:title", content: "Start learning — THEORYLAB" },
      { property: "og:description", content: "Preview your starting point in classical music theory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const search = Route.useSearch();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [level, setLevel] = useState<LevelId | null>(search.level ?? null);
  const [focus, setFocus] = useState<string[]>([]);

  const chosenLevel = LEARNING_LEVELS.find((l) => l.id === level);
  const toggleFocus = (id: string) =>
    setFocus((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));

  return (
    <PageShell>
      <div className="container-editorial grid gap-14 py-16 md:py-24 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <PreviewTag>Learning preview</PreviewTag>
          <h1 className="type-display-lg mt-6">Find where your path begins.</h1>
          <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
            Three short questions show the lessons you would start with. This is a preview: nothing you choose is
            stored, and accounts with saved progress will follow at launch.
          </p>
          <ol className="mt-10 space-y-3 text-sm">
            {["Your level", "Your focus", "Your starting point"].map((label, i) => (
              <li key={label} className={cn("flex items-center gap-3", i === step ? "text-foreground" : "text-muted-foreground")}>
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full border text-[0.7rem]",
                    i < step ? "border-primary bg-primary text-primary-foreground" : i === step ? "border-foreground" : "border-border",
                  )}
                >
                  {i < step ? <Check className="size-3" aria-hidden /> : i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </aside>

        <div className="lg:col-span-7 lg:col-start-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {step === 0 && (
                <fieldset>
                  <legend className="type-display-md">How much theory do you know already?</legend>
                  <div className="mt-8 grid gap-3">
                    {LEARNING_LEVELS.map((l) => (
                      <label
                        key={l.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-5 rounded-[2px] border bg-paper p-5 transition-colors",
                          level === l.id ? "border-primary" : "border-border hover:border-foreground/30",
                        )}
                      >
                        <input
                          type="radio"
                          name="level"
                          value={l.id}
                          checked={level === l.id}
                          onChange={() => setLevel(l.id)}
                          className="sr-only"
                        />
                        <span className={cn("font-display text-3xl leading-none", level === l.id ? "text-primary" : "text-crimson-deep")}>
                          {l.numeral}
                        </span>
                        <span>
                          <span className="block font-medium">{l.name}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">{l.summary}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button size="lg" disabled={!level} onClick={() => setStep(1)}>
                      Continue <ArrowRight />
                    </Button>
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset>
                  <legend className="type-display-md">What would you like to focus on?</legend>
                  <p className="mt-2 text-sm text-muted-foreground">Choose any that apply.</p>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {FOCUS_AREAS.map((f) => {
                      const on = focus.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-4 rounded-[2px] border bg-paper p-5 transition-colors",
                            on ? "border-primary" : "border-border hover:border-foreground/30",
                          )}
                        >
                          <input type="checkbox" checked={on} onChange={() => toggleFocus(f.id)} className="sr-only" />
                          <span className="font-medium">{f.label}</span>
                          <span
                            aria-hidden
                            className={cn(
                              "inline-flex size-5 items-center justify-center rounded-[2px] border",
                              on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                            )}
                          >
                            {on && <Check className="size-3" />}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(0)}>
                      <ArrowLeft /> Back
                    </Button>
                    <Button size="lg" onClick={() => setStep(2)}>
                      See my starting point <ArrowRight />
                    </Button>
                  </div>
                </fieldset>
              )}

              {step === 2 && chosenLevel && (
                <div>
                  <p className="eyebrow text-crimson-deep">Level {chosenLevel.numeral}</p>
                  <h2 className="type-display-lg mt-3">{chosenLevel.name}</h2>
                  <p className="mt-4 max-w-lg text-muted-foreground">
                    You would begin with these lessons, in this order:
                  </p>
                  <ol className="mt-8 border-t border-foreground/80">
                    {chosenLevel.topics.map((t, i) => (
                      <li key={t.title} className="flex gap-5 border-b border-border py-5">
                        <span className="font-display text-2xl text-crimson-deep">{i + 1}</span>
                        <span>
                          <span className="block font-medium">{t.title}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">{t.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  {focus.length > 0 && (
                    <p className="mt-6 text-sm text-muted-foreground">
                      Tools matched to your focus:{" "}
                      <span className="text-foreground">
                        {FOCUS_AREAS.filter((f) => focus.includes(f.id)).map((f) => f.tool).join(", ")}
                      </span>
                      .
                    </p>
                  )}
                  <div className="mt-10 border border-primary/25 bg-paper p-6">
                    <p className="font-display text-xl">Full lessons open with the launch of THEORYLAB accounts.</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Until then, the keyboard, notation and interval demonstrations are free to use on the home
                      page.
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Button asChild>
                        <SectionLink hash={SECTION_IDS.experience}>
                          Try the interactive keyboard <ArrowRight />
                        </SectionLink>
                      </Button>
                      <Button variant="outline" onClick={() => setStep(0)}>
                        Start again
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <p className="mt-10 text-xs text-muted-foreground">
            <Link to="/" className="link-draw">Back to home</Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}

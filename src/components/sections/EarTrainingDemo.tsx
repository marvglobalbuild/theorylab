import { useState } from "react";
import { Check, Play, RotateCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { INTERVALS, type Interval } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";

const CHOICES = ["M3", "P5", "P8"].map((id) => INTERVALS.find((i) => i.id === id)!) as Interval[];

/** A real, tiny ear-training round: hear an interval, name it. */
export function EarTrainingDemo() {
  const piano = usePiano();
  const [target, setTarget] = useState<Interval | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const play = (interval: Interval) =>
    piano.playPhrase([
      { notes: [interval.lower], at: 0, duration: 0.8 },
      { notes: [interval.upper], at: 0.8, duration: 1 },
    ]);

  const newRound = () => {
    const next = CHOICES[Math.floor(Math.random() * CHOICES.length)] ?? CHOICES[0]!;
    setTarget(next);
    setAnswer(null);
    play(next);
  };

  const correct = answer !== null && answer === target?.id;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={target && answer === null ? () => play(target) : newRound}
          className="inline-flex h-10 items-center gap-2 rounded-[2px] bg-ink-foreground px-4 text-sm text-ink-deep transition-colors hover:bg-paper"
        >
          {target && answer !== null ? <RotateCcw className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />}
          {!target ? "Play an interval" : answer === null ? "Hear it again" : "Try another"}
        </button>
        <span className="text-xs text-ink-muted">Rising from middle C</span>
      </div>

      <div role="group" aria-label="Which interval did you hear?" className="mt-5 grid grid-cols-3 gap-2">
        {CHOICES.map((choice) => {
          const chosen = answer === choice.id;
          const isTarget = answer !== null && target?.id === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              disabled={!target || answer !== null}
              onClick={() => setAnswer(choice.id)}
              className={cn(
                "rounded-[2px] border px-3 py-3 text-left transition-colors disabled:cursor-default",
                isTarget
                  ? "border-gold bg-gold/15 text-ink-foreground"
                  : chosen
                    ? "border-burgundy-soft text-ink-foreground"
                    : "border-ink-border text-ink-muted enabled:hover:border-ink-muted enabled:hover:text-ink-foreground",
              )}
            >
              <span className="block font-display text-xl leading-none">{choice.short}</span>
              <span className="mt-1.5 block text-[0.7rem]">{choice.name}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex min-h-5 items-center gap-2 text-sm" aria-live="polite">
        {answer !== null && target && (
          <>
            {correct ? (
              <Check className="size-4 text-gold" aria-hidden />
            ) : (
              <X className="size-4 text-burgundy-soft" aria-hidden />
            )}
            <span className="text-ink-foreground/90">
              {correct ? "Correct — " : "Not quite. It was a "}
              {target.name.toLowerCase()}, {target.semitones} semitones.
            </span>
          </>
        )}
      </p>
    </div>
  );
}

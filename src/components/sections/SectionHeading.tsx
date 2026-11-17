import { cn } from "@/lib/utils";
import { Reveal, WordReveal } from "@/components/motion/Reveal";

/** Numbered eyebrow + animated serif headline used by every section. */
export function SectionHeading({
  number,
  label,
  title,
  emphasis,
  inverse = false,
  className,
}: {
  number: string;
  label: string;
  title: string;
  emphasis?: string[] | undefined;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <p className={cn("eyebrow flex items-center gap-3", inverse ? "text-ink-muted" : "text-muted-foreground")}>
          <span className={inverse ? "text-gold" : "text-gold-deep"}>{number}</span>
          <span aria-hidden className={cn("h-px w-8", inverse ? "bg-ink-border" : "bg-border")} />
          {label}
        </p>
      </Reveal>
      <WordReveal
        text={title}
        emphasis={emphasis}
        emphasisClassName={inverse ? "italic text-burgundy-soft" : "italic text-primary"}
        className={cn("type-display-lg mt-6", inverse ? "text-ink-foreground" : "text-foreground")}
      />
    </div>
  );
}

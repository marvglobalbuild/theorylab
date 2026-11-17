import { cn } from "@/lib/utils";

/** THEORYLAB mark: three staff lines with a single burgundy notehead. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-6", className)}>
      <g stroke="currentColor" strokeWidth="1.1" opacity="0.55">
        <line x1="1" y1="8" x2="23" y2="8" />
        <line x1="1" y1="12" x2="23" y2="12" />
        <line x1="1" y1="16" x2="23" y2="16" />
      </g>
      <ellipse cx="13" cy="14" rx="3.4" ry="2.4" transform="rotate(-22 13 14)" className="fill-primary" />
      <line x1="16.1" y1="13.2" x2="16.1" y2="3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Wordmark({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark />
      <span className="font-display text-[1.15rem] font-semibold tracking-[0.3em]">
        THEORY<span className={inverse ? "text-primary-soft" : "text-primary"}>LAB</span>
      </span>
    </span>
  );
}

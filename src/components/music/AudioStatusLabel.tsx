import { cn } from "@/lib/utils";
import type { AudioStatus } from "@/lib/music/audio";

const LABELS: Record<AudioStatus, string> = {
  idle: "Sound off until you play",
  loading: "Loading piano samples…",
  ready: "Concert piano",
  fallback: "Synth piano (samples unavailable)",
};

export function AudioStatusLabel({ status, className }: { status: AudioStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs text-ink-muted", className)} aria-live="polite">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "ready" ? "bg-crimson-soft" : status === "loading" ? "animate-pulse bg-ink-muted" : "bg-ink-border",
        )}
      />
      {LABELS[status]}
    </span>
  );
}

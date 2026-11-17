import { Link } from "@tanstack/react-router";
import { ArrowRight, Info } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Honest notice indicating demonstration content or pending Supabase integration. */
export function PreviewNotice({
  title = "Demonstration workspace",
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3.5 rounded-[2px] border border-border bg-paper px-4 py-3.5 text-sm leading-relaxed",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/** Consistent top heading block inside application workspaces. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow text-crimson-deep">{eyebrow}</p>
        <h1 className="type-display-lg mt-2.5 text-balance text-foreground">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export interface MetricItem {
  label: string;
  value: string;
  detail: string;
}

/** Flat hairline-separated KPI strip with tabular numerals and zero card clutter. */
export function MetricStrip({ items, className }: { items: MetricItem[]; className?: string }) {
  return (
    <dl
      className={cn(
        "grid border-y border-border bg-paper sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "px-5 py-5",
            i > 0 && "border-t border-border sm:border-t-0",
            i % 2 === 1 && "sm:border-l sm:border-border",
            i >= 2 && "sm:border-t lg:border-t-0",
            i > 0 && "lg:border-l lg:border-border",
          )}
        >
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-2 font-display text-3xl leading-none tabular-nums text-foreground">
            {item.value}
          </dd>
          <dd className="mt-2 text-xs text-muted-foreground">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Section block with display title and optional single action link. */
export function SectionBlock({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; to: string } | ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const isLinkObj =
    action !== null && typeof action === "object" && "to" in action && "label" in action;

  return (
    <section className={cn("min-w-0 space-y-4", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="type-display-md text-foreground">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {isLinkObj ? (
          <Link
            to={(action as { label: string; to: string }).to}
            className="link-draw inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary whitespace-nowrap"
          >
            {(action as { label: string; to: string }).label}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        ) : (
          action
        )}
      </div>
      {children}
    </section>
  );
}

/** Clean segmented filter tabs (functional interactive buttons). */
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-[2px] border border-border bg-secondary p-1"
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "min-h-9 rounded-[2px] px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
              active
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Editorial progress bar without heavy rounded bubbles. */
export function ProgressRule({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{clamped}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden bg-border"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full bg-primary transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

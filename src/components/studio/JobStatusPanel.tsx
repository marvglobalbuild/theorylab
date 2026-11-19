import { AlertCircle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProgressRule } from "@/components/workspace/WorkspacePrimitives";
import type { MusicProcessingJob } from "@/services/contracts";
import { humanizeJobStage } from "./studio-types";

export interface JobStatusPanelProps {
  job: MusicProcessingJob | null;
  cancelling: boolean;
  retrying: boolean;
  onCancel: (jobId: string) => void;
  onRetry: (job: MusicProcessingJob) => void;
}

export function JobStatusPanel({
  job,
  cancelling,
  retrying,
  onCancel,
  onRetry,
}: JobStatusPanelProps) {
  if (!job) return null;

  const isActive = job.status === "queued" || job.status === "processing";
  const isCompleted = job.status === "completed";
  const isFailed = job.status === "failed";
  const isCancelled = job.status === "cancelled";

  return (
    <section
      aria-labelledby="stage-d-heading"
      aria-live="polite"
      className="rounded-[2px] border border-border bg-paper p-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {isActive && (
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" aria-hidden />
          )}
          {isCompleted && (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          )}
          {(isFailed || isCancelled) && (
            <XCircle className="mt-0.5 size-4 shrink-0 text-crimson-deep" aria-hidden />
          )}

          <div>
            <p className="eyebrow text-crimson-deep">Stage 04 · Processing Job</p>
            <h2 id="stage-d-heading" className="mt-0.5 text-sm font-semibold text-foreground">
              {humanizeJobStage(job.stage)}
            </h2>
            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              Job {job.job_id.slice(0, 8)} · Type: {job.job_type.replace(/_/g, " ")} · Status:{" "}
              <span className="uppercase text-foreground">{job.status}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isActive && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={cancelling}
              onClick={() => onCancel(job.job_id)}
            >
              {cancelling ? "Cancelling…" : "Cancel job"}
            </Button>
          )}
          {(isFailed || isCancelled) && (
            <Button type="button" size="sm" disabled={retrying} onClick={() => onRetry(job)}>
              <RefreshCw className="size-3.5" aria-hidden />
              {retrying ? "Retrying…" : "Retry safely"}
            </Button>
          )}
        </div>
      </div>

      {/* Strictly grounded in backend progress_percent — never fabricated */}
      <ProgressRule percent={job.progress_percent} label={`Backend reported stage: ${job.stage}`} />

      {isFailed && job.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">
              {job.error.code}: {job.error.message}
            </p>
            <p className="mt-1 text-foreground/80">
              Your original vocal recording remains preserved untouched.{" "}
              {job.error.retryable
                ? "This failure is marked retryable by the backend."
                : "Adjust your configuration or recording before retrying."}
            </p>
          </div>
        </div>
      )}

      {isCancelled && (
        <p className="text-xs text-muted-foreground">
          Processing was cancelled cleanly. Your uploaded vocal recording and current configuration
          are preserved so you can retry whenever ready.
        </p>
      )}
    </section>
  );
}

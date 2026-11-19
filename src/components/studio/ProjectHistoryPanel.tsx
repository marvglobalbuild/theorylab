import { FolderOpen, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MusicProcessingJob } from "@/services/contracts";
import { extractProjectName } from "./studio-types";

export interface ProjectHistoryPanelProps {
  jobs: MusicProcessingJob[];
  loading: boolean;
  error: string | null;
  activeJobId: string | null;
  onRefresh: () => void;
  onReopenJob: (job: MusicProcessingJob) => void;
  onRetryFailedJob: (job: MusicProcessingJob) => void;
}

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function extractStyle(job: MusicProcessingJob): string {
  const arrangementParam = job.parameters?.["arrangement"];
  if (arrangementParam && typeof arrangementParam === "object") {
    const st = (arrangementParam as Record<string, unknown>)["style"];
    if (typeof st === "string" && st) return st;
  }
  const topStyle = job.parameters?.["style"];
  if (typeof topStyle === "string" && topStyle) return topStyle;
  return job.job_type === "audio_analysis" ? "Analysis only" : "—";
}

function extractInstruments(job: MusicProcessingJob): string[] {
  const arrangementParam = job.parameters?.["arrangement"];
  if (arrangementParam && typeof arrangementParam === "object") {
    const list = (arrangementParam as Record<string, unknown>)["selected_instruments"];
    if (Array.isArray(list)) return list.map(String);
  }
  const topList = job.parameters?.["selected_instruments"];
  if (Array.isArray(topList)) return topList.map(String);
  return [];
}

export function ProjectHistoryPanel({
  jobs,
  loading,
  error,
  activeJobId,
  onRefresh,
  onReopenJob,
  onRetryFailedJob,
}: ProjectHistoryPanelProps) {
  return (
    <section
      aria-labelledby="history-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Saved Studio Sessions</p>
          <h2 id="history-heading" className="type-display-md mt-1 text-foreground">
            Project history
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Loaded from your private processing job history. Reopen any completed project to review
            stems, mastering metrics, and downloads, or safely retry a failed job.
          </p>
        </div>

        <Button type="button" size="sm" variant="outline" disabled={loading} onClick={onRefresh}>
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-3.5" aria-hidden />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-crimson-deep">
          {error}
        </p>
      )}

      {loading && jobs.length === 0 ? (
        <div className="space-y-2" role="status">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-16 animate-pulse rounded-[2px] border border-border bg-background"
            />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-[2px] border border-border bg-background px-5 py-8 text-center">
          <p className="text-sm font-medium text-foreground">No studio projects yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload or record a vocal track in the Studio Workspace to create your first saved
            project.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-[2px] border border-border bg-background">
          {jobs.map((job) => {
            const name = extractProjectName(job);
            const style = extractStyle(job);
            const instruments = extractInstruments(job);
            const isActive = job.job_id === activeJobId;

            return (
              <div
                key={job.job_id}
                className="flex flex-col gap-3 px-4 py-3.5 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {name}
                      {isActive ? " (Open)" : ""}
                    </p>
                    <span className="font-mono text-[11px] uppercase text-muted-foreground">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatCreatedAt(job.created_at)} · {job.job_type.replace(/_/g, " ")} · Style:{" "}
                    <span className="capitalize text-foreground/85">{style}</span> ·{" "}
                    {job.artifacts.length} artifact{job.artifacts.length === 1 ? "" : "s"}
                  </p>
                  {instruments.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Instruments: {instruments.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {job.status === "failed" || job.status === "cancelled" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onRetryFailedJob(job)}
                    >
                      <RefreshCw className="size-3.5" aria-hidden /> Retry job
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? "secondary" : "outline"}
                    onClick={() => onReopenJob(job)}
                  >
                    <FolderOpen className="size-3.5" aria-hidden />
                    {isActive ? "Opened" : "Reopen"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

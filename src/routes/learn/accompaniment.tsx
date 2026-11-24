import { createFileRoute, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertCircle, RotateCcw } from "lucide-react";

import { AccompanimentStudio } from "@/components/studio/AccompanimentStudio";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/learn/accompaniment")({
  head: () => ({
    meta: [
      { title: "AI Accompaniment & Arrangement Studio — SONORA" },
      {
        name: "description",
        content:
          "Upload or record vocals, inspect musical analysis, arrange multi-sampled accompaniment, and export loudness-mastered studio audio.",
      },
    ],
  }),
  component: LearnerAccompanimentStudioPage,
  errorComponent: AccompanimentStudioRouteError,
});

function LearnerAccompanimentStudioPage() {
  return <AccompanimentStudio />;
}

function AccompanimentStudioRouteError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-[2px] border border-crimson/40 bg-crimson/5 p-6 md:p-8 space-y-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-6 shrink-0 text-crimson-deep" aria-hidden />
          <div className="space-y-2">
            <h1 className="type-display-md text-foreground">
              Accompaniment Studio notice
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An unexpected layout or state error was caught inside the studio workspace.
              Your background jobs, uploaded recordings, and generated files are safe.
            </p>
            {error?.message && (
              <pre className="mt-2 overflow-x-auto rounded-[2px] border border-border bg-background p-3 font-mono text-xs text-muted-foreground">
                {error.message}
              </pre>
            )}
            <div className="pt-2">
              <Button type="button" onClick={() => reset()} className="gap-2">
                <RotateCcw className="size-4" aria-hidden />
                Reset &amp; Reload Studio Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

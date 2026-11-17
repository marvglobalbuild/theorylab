import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LEARNER_ASSESSMENTS } from "@/content/workspaces";

export const Route = createFileRoute("/admin/assessments")({
  head: () => ({
    meta: [{ title: "Assessments · Administration — THEORYLAB" }],
  }),
  component: AdminAssessmentsPage,
});

function AdminAssessmentsPage() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <PreviewNotice message="Assessment banks and scoring rubrics are demonstration blueprints. Live attempt grading and question authoring require Supabase tables and server-verified submission functions." />

      <PageHeader
        eyebrow="Evaluation Standards"
        title="Assessments"
        description="Oversee diagnostic question banks, stage readiness thresholds and grading rubrics."
      />

      {notice && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-[2px] border border-border bg-paper p-4 text-sm"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{notice}</span>
        </p>
      )}

      <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
        {DEMO_LEARNER_ASSESSMENTS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.14em] text-crimson-deep">
                  {item.levelId}
                </span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{item.questionCount} items</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{item.durationMinutes} min</span>
                <span aria-hidden>·</span>
                <span>{item.statusLabel}</span>
              </div>
              <h2 className="type-display-md mt-1.5 text-foreground">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.topicsCovered}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start sm:self-center"
              onClick={() =>
                setNotice(
                  `Question bank editing for "${item.title}" will connect to Supabase assessment tables in the backend phase.`,
                )
              }
            >
              Inspect rubric
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

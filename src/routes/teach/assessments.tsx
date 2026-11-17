import { createFileRoute } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LEARNER_ASSESSMENTS } from "@/content/workspaces";

export const Route = createFileRoute("/teach/assessments")({
  head: () => ({
    meta: [{ title: "Assessments · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerAssessmentsPage,
});

function LecturerAssessmentsPage() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <PreviewNotice message="Structured assessment builders, timed theory diagnostics and automated scoring will be backed by Supabase functions and RLS." />

      <PageHeader
        eyebrow="Evaluations & Diagnostics"
        title="Assessments"
        description="Prepare diagnostic tests across staff reading, intervals, harmony and harmonic analysis."
        action={
          <Button
            type="button"
            onClick={() =>
              setNotice(
                "Assessment authoring will become active once Supabase question banks are connected.",
              )
            }
          >
            <Plus className="size-4" aria-hidden /> Draft assessment
          </Button>
        }
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
        {DEMO_LEARNER_ASSESSMENTS.map((a) => (
          <div
            key={a.id}
            className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.14em] text-crimson-deep">{a.levelId}</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{a.questionCount} items</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{a.durationMinutes} min</span>
              </div>
              <h2 className="type-display-md mt-1.5 text-foreground">{a.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{a.topicsCovered}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setNotice(
                  `Editing "${a.title}" will be enabled after Supabase schema provisioning.`,
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

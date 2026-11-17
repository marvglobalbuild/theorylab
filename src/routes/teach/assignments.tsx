import { createFileRoute } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LECTURER_ASSIGNMENTS } from "@/content/workspaces";

export const Route = createFileRoute("/teach/assignments")({
  head: () => ({
    meta: [{ title: "Assignments · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerAssignmentsPage,
});

function LecturerAssignmentsPage() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <PreviewNotice message="Student assignment creation, deadlines and submission collection will persist in Supabase once backend integration is connected." />

      <PageHeader
        eyebrow="Student Assignments"
        title="Assignments"
        description="Set work on specific concepts — from interval identification to harmonic analysis — and collect it in one place."
        action={
          <Button
            type="button"
            onClick={() =>
              setNotice(
                "Assignment publishing will connect to Supabase once class schemas are deployed.",
              )
            }
          >
            <Plus className="size-4" aria-hidden /> New assignment
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
        {DEMO_LECTURER_ASSIGNMENTS.map((a) => (
          <div
            key={a.id}
            className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium tabular-nums text-crimson-deep">{a.classCode}</span>
                <span aria-hidden>·</span>
                <span>{a.focus}</span>
                <span aria-hidden>·</span>
                <span>{a.dueLabel}</span>
              </div>
              <h2 className="type-display-md mt-1.5 text-foreground">{a.title}</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm tabular-nums text-muted-foreground">
                {a.submissionsLabel} submitted
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setNotice(
                    `Submission review for "${a.title}" opens once Supabase assignment storage is live.`,
                  )
                }
              >
                Review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

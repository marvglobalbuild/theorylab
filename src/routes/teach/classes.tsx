import { createFileRoute } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PreviewNotice,
  ProgressRule,
} from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LECTURER_SNAPSHOT } from "@/content/workspaces";

export const Route = createFileRoute("/teach/classes")({
  head: () => ({
    meta: [{ title: "My Classes · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerClassesPage,
});

function LecturerClassesPage() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <PreviewNotice message="Class creation, enrolment codes and live rosters will activate once Supabase database tables and lecturer RLS policies are configured." />

      <PageHeader
        eyebrow="Cohorts & Seminars"
        title="My classes"
        description="Organise cohorts by theory stage, schedule seminar activities and track overall completion."
        action={
          <Button
            type="button"
            onClick={() =>
              setNotice(
                "Creating new classes will be enabled once Supabase persistence is connected. No changes were saved.",
              )
            }
          >
            <Plus className="size-4" aria-hidden /> Create class
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

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_LECTURER_SNAPSHOT.classes.map((cls) => (
          <div
            key={cls.id}
            className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6"
          >
            <div>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium tabular-nums text-crimson-deep">{cls.code}</span>
                <span className="tabular-nums text-muted-foreground">
                  {cls.studentCount} students
                </span>
              </div>
              <h2 className="type-display-md mt-2 text-foreground">{cls.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{cls.level}</p>
              <p className="mt-1 text-xs text-muted-foreground">{cls.schedule}</p>
            </div>
            <div className="mt-6">
              <ProgressRule percent={cls.completionPercent} label="Module completion" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

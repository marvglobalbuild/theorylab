import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LEARNER_ASSESSMENTS } from "@/content/workspaces";
import { assessmentService } from "@/services";

export const Route = createFileRoute("/learn/assessments")({
  head: () => ({
    meta: [{ title: "Assessments · Learner Studio — THEORYLAB" }],
  }),
  component: LearnerAssessmentsPage,
});

function LearnerAssessmentsPage() {
  const [notice, setNotice] = useState<string | null>(null);

  const openAssessment = async (
    levelId: "beginner" | "elementary" | "intermediate" | "advanced",
  ) => {
    const res = await assessmentService.getAssessment(levelId);
    if (res.status === "unavailable") {
      setNotice(res.message);
    }
  };

  return (
    <div className="space-y-8">
      <PreviewNotice message="Assessment banks and graded submissions will load from Supabase once backend integration is connected." />

      <PageHeader
        eyebrow="Checkpoints & Diagnostics"
        title="Assessments"
        description="Structured evaluations verifying notation fluency, interval recognition and harmonic analysis at each stage."
      />

      {notice && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-[2px] border border-border bg-paper p-4 text-sm text-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{notice}</span>
        </p>
      )}

      <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
        {DEMO_LEARNER_ASSESSMENTS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="uppercase tracking-[0.14em] text-crimson-deep">
                  {item.levelId}
                </span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{item.questionCount} questions</span>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{item.durationMinutes} min</span>
                <span aria-hidden>·</span>
                <span>{item.statusLabel}</span>
              </div>
              <h2 className="type-display-md mt-2 text-foreground">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.topicsCovered}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => void openAssessment(item.levelId)}
            >
              Open assessment
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

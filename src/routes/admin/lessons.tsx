import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FilterTabs, PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { LEARNING_LEVELS, type LevelId } from "@/content/learning-paths";

export const Route = createFileRoute("/admin/lessons")({
  head: () => ({
    meta: [{ title: "Lessons · Administration — THEORYLAB" }],
  }),
  component: AdminLessonsPage,
});

type StageFilter = "all" | LevelId;

function AdminLessonsPage() {
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [notice, setNotice] = useState<string | null>(null);

  const visibleLevels =
    stageFilter === "all"
      ? LEARNING_LEVELS
      : LEARNING_LEVELS.filter((lvl) => lvl.id === stageFilter);

  const lessonRows = visibleLevels.flatMap((lvl) =>
    lvl.topics.map((topic, index) => ({
      id: `${lvl.id}-${index + 1}`,
      code: `${lvl.numeral}.${index + 1}`,
      stageName: lvl.name,
      title: topic.title,
      detail: topic.detail,
    })),
  );

  return (
    <div className="space-y-8">
      <PreviewNotice message="Lesson catalogue entries reflect the canonical topic definitions ahead of Supabase content storage, revision history and publish-state controls." />

      <PageHeader
        eyebrow="Content Governance"
        title="Lessons"
        description="Inspect syllabus lessons, notation references and audio pairing readiness across all four stages."
      />

      <FilterTabs
        label="Filter lessons by curriculum stage"
        value={stageFilter}
        onChange={setStageFilter}
        options={[
          { id: "all", label: "All stages" },
          { id: "beginner", label: "I · Beginner" },
          { id: "elementary", label: "II · Elementary" },
          { id: "intermediate", label: "III · Intermediate" },
          { id: "advanced", label: "IV · Advanced" },
        ]}
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
        {lessonRows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums font-medium text-crimson-deep">{row.code}</span>
                <span aria-hidden>·</span>
                <span>{row.stageName}</span>
                <span aria-hidden>·</span>
                <span>Canonical syllabus</span>
              </div>
              <h2 className="mt-1 font-display text-xl text-foreground">{row.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{row.detail}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start sm:self-center"
              onClick={() =>
                setNotice(
                  `Editing and publishing workflow for "${row.code} ${row.title}" requires Supabase CMS persistence.`,
                )
              }
            >
              Review readiness
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

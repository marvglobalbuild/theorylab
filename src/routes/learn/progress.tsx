import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FilterTabs,
  MetricStrip,
  PageHeader,
  PreviewNotice,
  ProgressRule,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";
import { useAcademyCatalog } from "@/lib/useAcademyCatalog";

export const Route = createFileRoute("/learn/progress")({
  head: () => ({
    meta: [{ title: "Progress · Theory Academy — THEORYLAB" }],
  }),
  component: LearnerProgressPage,
});

type ProgressFilter = "all" | "completed" | "in_progress" | "not_started";

function LearnerProgressPage() {
  const [filter, setFilter] = useState<ProgressFilter>("all");
  const { catalog, isLoading, errorMessage, refetch, getLessonProgress } = useAcademyCatalog();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading learning progress">
        <div className="h-8 w-48 animate-pulse rounded-[2px] bg-border" />
        <div className="h-28 w-full animate-pulse rounded-[2px] border border-border bg-paper" />
      </div>
    );
  }

  if (errorMessage || !catalog) {
    return (
      <div className="space-y-4 rounded-[2px] border border-border bg-paper p-8">
        <h1 className="type-display-md text-foreground">Unable to load progress</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "Could not retrieve lesson progress records."}
        </p>
        <Button type="button" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const totalLessons = catalog.lessons.length;
  const completedCount = catalog.lessons.filter(
    (l) => getLessonProgress(l)?.status === "completed",
  ).length;
  const inProgressCount = catalog.lessons.filter(
    (l) => getLessonProgress(l)?.status === "in_progress",
  ).length;
  const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const filteredLessons = catalog.lessons.filter((lesson) => {
    const status = getLessonProgress(lesson)?.status ?? "not_started";
    if (filter === "all") return true;
    return status === filter;
  });

  return (
    <div className="space-y-8">
      {catalog.statusNotice && (
        <PreviewNotice
          title={
            catalog.source === "fallback_empty_db"
              ? "Published curriculum pending seed"
              : "Read-only syllabus mode"
          }
          message={catalog.statusNotice}
        />
      )}

      <PageHeader
        eyebrow="Study Log"
        title="Learning progress"
        description="Track completed and in-progress Theory Academy lessons across Foundations, Scales & Tonality, Intervals & Harmony, and Rhythm."
        action={
          catalog.resumeLesson ? (
            <Button asChild>
              <Link
                to="/learn/lessons/$lessonSlug"
                params={{ lessonSlug: catalog.resumeLesson.slug }}
              >
                Resume lesson <ArrowRight />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <MetricStrip
        items={[
          {
            label: "Lessons completed",
            value: `${completedCount}/${totalLessons}`,
            detail: `${overallPercent}% of published curriculum`,
          },
          {
            label: "In progress",
            value: `${inProgressCount}`,
            detail: "Opened and awaiting completion",
          },
          {
            label: "Remaining topics",
            value: `${Math.max(0, totalLessons - completedCount)}`,
            detail: "Across 4 learning paths",
          },
          {
            label: "Persistence status",
            value: catalog.persistenceAvailable ? "Live" : "Read-only",
            detail: catalog.persistenceAvailable
              ? "Synced to Supabase lesson_progress"
              : "Awaiting published DB lessons",
          },
        ]}
      />

      <SectionBlock
        title="Path completion"
        subtitle="Progress broken down across the four structured Theory Academy pillars."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {catalog.paths.map((path) => {
            const pathLessons = path.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
            const done = pathLessons.filter(
              (l) => getLessonProgress(l)?.status === "completed",
            ).length;
            const pct = pathLessons.length > 0 ? Math.round((done / pathLessons.length) * 100) : 0;

            return (
              <div
                key={path.slug}
                className="rounded-[2px] border border-border bg-paper p-5 space-y-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display text-lg text-foreground">
                    {path.numeral} · {path.title}
                  </p>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {done}/{pathLessons.length}
                  </span>
                </div>
                <ProgressRule percent={pct} label="Completed lessons" />
              </div>
            );
          })}
        </div>
      </SectionBlock>

      <SectionBlock title="Lesson log" subtitle="Filter curriculum topics by completion status.">
        <FilterTabs
          label="Filter lessons by progress status"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: `All (${totalLessons})` },
            { id: "completed", label: `Completed (${completedCount})` },
            { id: "in_progress", label: `In progress (${inProgressCount})` },
            {
              id: "not_started",
              label: `Not started (${Math.max(0, totalLessons - completedCount - inProgressCount)})`,
            },
          ]}
        />

        {filteredLessons.length === 0 ? (
          <div className="rounded-[2px] border border-border bg-paper p-8 text-center text-sm text-muted-foreground">
            {filter === "completed" || filter === "in_progress"
              ? catalog.persistenceAvailable
                ? "No lessons currently match this status yet. Open any lesson to begin studying."
                : "No recorded lesson history yet because published curriculum rows are not seeded in Supabase."
              : "No lessons match the selected filter."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2px] border border-border bg-paper">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Lesson</th>
                  <th className="px-5 py-3.5 font-medium">Path</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLessons.map((lesson) => {
                  const prog = getLessonProgress(lesson);
                  const statusLabel =
                    prog?.status === "completed"
                      ? "Completed"
                      : prog?.status === "in_progress"
                        ? "In progress"
                        : "Not started";
                  return (
                    <tr key={lesson.slug} className="hover:bg-background/60">
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        <Link
                          to="/learn/lessons/$lessonSlug"
                          params={{ lessonSlug: lesson.slug }}
                          className="hover:text-primary hover:underline"
                        >
                          {lesson.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {lesson.pathNumeral} · {lesson.pathTitle}
                      </td>
                      <td className="px-5 py-3.5 text-crimson-deep">{statusLabel}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">
                        {lesson.estimatedMinutes} min
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionBlock>
    </div>
  );
}

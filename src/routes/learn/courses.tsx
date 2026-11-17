import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FilterTabs,
  PageHeader,
  PreviewNotice,
  ProgressRule,
} from "@/components/workspace/WorkspacePrimitives";
import { formatAcademyLevel } from "@/content/academy-curriculum";
import type { AcademyLevel } from "@/content/academy/types";
import { useAcademyCatalog } from "@/lib/useAcademyCatalog";

export const Route = createFileRoute("/learn/courses")({
  head: () => ({
    meta: [{ title: "Courses · Theory Academy — THEORYLAB" }],
  }),
  component: LearnerCoursesPage,
});

type LevelFilter = "all" | AcademyLevel;

function LearnerCoursesPage() {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const { catalog, isLoading, errorMessage, refetch, getLessonProgress } = useAcademyCatalog();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading Theory Academy courses">
        <div className="h-8 w-52 animate-pulse rounded-[2px] bg-border" />
        <div className="grid gap-5 md:grid-cols-2">
          <div className="h-52 animate-pulse rounded-[2px] border border-border bg-paper" />
          <div className="h-52 animate-pulse rounded-[2px] border border-border bg-paper" />
        </div>
      </div>
    );
  }

  if (errorMessage || !catalog) {
    return (
      <div className="space-y-4 rounded-[2px] border border-border bg-paper p-8">
        <h1 className="type-display-md text-foreground">Unable to load courses</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "Published course catalogue could not be retrieved."}
        </p>
        <Button type="button" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const filtered =
    levelFilter === "all"
      ? catalog.courses
      : catalog.courses.filter((c) => c.level === levelFilter);

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
        eyebrow="Theory Academy Catalogue"
        title="Courses & descriptions"
        description="Browse published theory courses with difficulty levels, estimated learning durations, and structured topic sequences."
      />

      <FilterTabs
        label="Filter courses by difficulty"
        value={levelFilter}
        onChange={setLevelFilter}
        options={[
          { id: "all", label: "All levels" },
          { id: "beginner", label: "Beginner" },
          { id: "elementary", label: "Elementary" },
          { id: "intermediate", label: "Intermediate" },
        ]}
      />

      {filtered.length === 0 ? (
        <div className="rounded-[2px] border border-border bg-paper p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No published courses match the selected difficulty level.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((course) => {
            const lessons = course.modules.flatMap((m) => m.lessons);
            const completedCount = lessons.filter(
              (l) => getLessonProgress(l)?.status === "completed",
            ).length;
            const pct =
              course.lessonCount > 0 ? Math.round((completedCount / course.lessonCount) * 100) : 0;
            const resumeTarget =
              lessons.find((l) => getLessonProgress(l)?.status === "in_progress") ??
              lessons.find((l) => getLessonProgress(l)?.status !== "completed") ??
              lessons[0];

            return (
              <div
                key={course.slug}
                className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6"
              >
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
                    <span className="uppercase tracking-[0.14em] text-crimson-deep">
                      Path {course.learningPathNumeral} · {formatAcademyLevel(course.level)}
                    </span>
                    <span className="tabular-nums">
                      {course.estimatedMinutes} min · {course.lessonCount} lessons
                    </span>
                  </div>

                  <h2 className="type-display-md mt-2 text-foreground">{course.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    {course.modules.map((mod) => (
                      <li key={mod.slug} className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-foreground">{mod.title}</span>
                        <span className="shrink-0 tabular-nums">{mod.lessons.length} topics</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 space-y-4">
                  <ProgressRule
                    percent={pct}
                    label={`${completedCount} of ${course.lessonCount} lessons completed`}
                  />

                  {resumeTarget && (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to="/learn/lessons/$lessonSlug"
                        params={{ lessonSlug: resumeTarget.slug }}
                      >
                        {completedCount > 0 ? "Continue course" : "Start course"}:{" "}
                        {resumeTarget.title}
                        <ArrowRight />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

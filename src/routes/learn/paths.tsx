import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FilterTabs, PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { formatAcademyLevel } from "@/content/academy-curriculum";
import { useAcademyCatalog } from "@/lib/useAcademyCatalog";

export const Route = createFileRoute("/learn/paths")({
  head: () => ({
    meta: [{ title: "Learning Paths · Theory Academy — THEORYLAB" }],
  }),
  component: LearnerPathsPage,
});

function LearnerPathsPage() {
  const [selectedPath, setSelectedPath] = useState<string>("all");
  const { catalog, isLoading, errorMessage, refetch, getLessonProgress } = useAcademyCatalog();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading learning paths">
        <div className="h-8 w-56 animate-pulse rounded-[2px] bg-border" />
        <div className="h-56 w-full animate-pulse rounded-[2px] border border-border bg-paper" />
      </div>
    );
  }

  if (errorMessage || !catalog) {
    return (
      <div className="space-y-4 rounded-[2px] border border-border bg-paper p-8">
        <h1 className="type-display-md text-foreground">Unable to load learning paths</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "Curriculum could not be retrieved."}
        </p>
        <Button type="button" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const visiblePaths =
    selectedPath === "all" ? catalog.paths : catalog.paths.filter((p) => p.slug === selectedPath);

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
        eyebrow={`Theory Academy · ${catalog.paths.length} Learning Paths · ${catalog.lessons.length} Topics`}
        title="Learning paths"
        description="Structured progression from sound properties, clefs, and basic meter to major/minor scales, functional harmony, and musical passage reading."
        action={
          catalog.resumeLesson ? (
            <Button asChild>
              <Link
                to="/learn/lessons/$lessonSlug"
                params={{ lessonSlug: catalog.resumeLesson.slug }}
              >
                Resume reading <ArrowRight />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <FilterTabs
        label="Filter learning path"
        value={selectedPath}
        onChange={setSelectedPath}
        options={[
          { id: "all", label: "All paths" },
          ...catalog.paths.map((p) => ({ id: p.slug, label: `${p.numeral} · ${p.title}` })),
        ]}
      />

      {visiblePaths.length === 0 ? (
        <div className="rounded-[2px] border border-border bg-paper p-8 text-center text-sm text-muted-foreground">
          No published learning paths match the selected filter.
        </div>
      ) : (
        <div className="space-y-8">
          {visiblePaths.map((path) => {
            const pathLessons = path.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
            const doneCount = pathLessons.filter(
              (l) => getLessonProgress(l)?.status === "completed",
            ).length;

            let runningTopicNumber = 0;

            return (
              <section
                key={path.slug}
                className="rounded-[2px] border border-border bg-paper p-6 space-y-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-3xl text-crimson-deep">{path.numeral}</span>
                    <div>
                      <h2 className="type-display-md text-foreground">{path.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{path.summary}</p>
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatAcademyLevel(path.level)} · {doneCount} of {pathLessons.length} completed
                    · {path.totalEstimatedMinutes} min
                  </span>
                </div>

                <div className="space-y-6">
                  {path.courses.map((course) => (
                    <div key={course.slug} className="space-y-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-lg text-foreground">{course.title}</h3>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {course.estimatedMinutes} min · {course.lessonCount} lessons
                        </span>
                      </div>

                      {course.modules.map((mod) => (
                        <div key={mod.slug} className="space-y-2">
                          <p className="eyebrow text-muted-foreground">{mod.title}</p>
                          <ol className="grid gap-x-8 sm:grid-cols-2">
                            {mod.lessons.map((lesson) => {
                              runningTopicNumber += 1;
                              const prog = getLessonProgress(lesson);
                              const isCompleted = prog?.status === "completed";
                              const isInProgress = prog?.status === "in_progress";

                              return (
                                <li
                                  key={lesson.slug}
                                  className="border-b border-border/70 last:border-b-0"
                                >
                                  <Link
                                    to="/learn/lessons/$lessonSlug"
                                    params={{ lessonSlug: lesson.slug }}
                                    className="group flex items-start justify-between gap-4 py-3.5 transition-colors hover:text-primary"
                                  >
                                    <div className="flex min-w-0 gap-3.5">
                                      <span className="pt-0.5 text-xs tabular-nums text-faint">
                                        {path.numeral}.{runningTopicNumber}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground group-hover:text-primary">
                                          {lesson.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                          {lesson.summary}
                                        </p>
                                        <p className="mt-1 text-xs tabular-nums text-faint">
                                          {lesson.estimatedMinutes} min
                                          {isCompleted
                                            ? " · Completed"
                                            : isInProgress
                                              ? " · In progress"
                                              : ""}
                                        </p>
                                      </div>
                                    </div>

                                    <span className="mt-0.5 shrink-0">
                                      {isCompleted ? (
                                        <CheckCircle2
                                          className="size-4 text-primary"
                                          aria-label="Completed"
                                        />
                                      ) : isInProgress ? (
                                        <Circle
                                          className="size-4 text-crimson-deep"
                                          aria-label="In progress"
                                        />
                                      ) : (
                                        <ArrowRight
                                          className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                                          aria-hidden
                                        />
                                      )}
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

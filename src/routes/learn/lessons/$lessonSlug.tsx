import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { LessonReader } from "@/components/academy/LessonReader";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/WorkspacePrimitives";
import { useAcademyCatalog } from "@/lib/useAcademyCatalog";

export const Route = createFileRoute("/learn/lessons/$lessonSlug")({
  head: () => ({
    meta: [{ title: "Theory Lesson · Academy — THEORYLAB" }],
  }),
  component: AcademyLessonPage,
});

function AcademyLessonPage() {
  const { lessonSlug } = Route.useParams();
  const {
    catalog,
    isLoading,
    errorMessage,
    refetch,
    getLessonProgress,
    recordVisit,
    setCompleted,
  } = useAcademyCatalog();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading lesson">
        <div className="h-6 w-48 animate-pulse rounded-[2px] bg-border" />
        <div className="h-10 w-2/3 animate-pulse rounded-[2px] bg-border" />
        <div className="h-44 w-full animate-pulse rounded-[2px] border border-border bg-paper" />
      </div>
    );
  }

  if (errorMessage || !catalog) {
    return (
      <div className="space-y-4 rounded-[2px] border border-border bg-paper p-8">
        <h1 className="type-display-md text-foreground">Unable to load lesson</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "Theory Academy catalog could not be loaded."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => refetch()}>
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link to="/learn/paths">Back to learning paths</Link>
          </Button>
        </div>
      </div>
    );
  }

  const lesson = catalog.lessons.find((l) => l.slug === lessonSlug) ?? null;

  if (!lesson) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Theory Academy"
          title="Lesson not found"
          description="This lesson could not be found in the published curriculum."
        />
        <div className="rounded-[2px] border border-border bg-paper p-8 space-y-4">
          <p className="text-sm text-muted-foreground">
            Only published curriculum lessons are accessible in Theory Academy. Browse the four
            structured learning paths to select an available topic.
          </p>
          <Button asChild>
            <Link to="/learn/paths">
              <ArrowLeft className="size-4" aria-hidden /> Browse learning paths
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LessonReader
      lesson={lesson}
      progress={getLessonProgress(lesson)}
      persistenceAvailable={catalog.persistenceAvailable}
      statusNotice={catalog.statusNotice}
      onRecordVisit={() => recordVisit(lesson)}
      onToggleCompleted={(completed, score) => setCompleted(lesson, completed, score)}
    />
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, Headphones, Music, Piano, Play } from "lucide-react";

import { Staff } from "@/components/music/Staff";
import { Button } from "@/components/ui/button";
import {
  MetricStrip,
  PageHeader,
  PreviewNotice,
  ProgressRule,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";
import { formatAcademyLevel } from "@/content/academy-curriculum";
import { useAuth } from "@/lib/auth-context";
import { getRoleDisplayName } from "@/lib/auth-routing";
import { usePiano } from "@/lib/music/usePiano";
import { useAcademyCatalog } from "@/lib/useAcademyCatalog";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [{ title: "Theory Academy Dashboard · Learner Studio — THEORYLAB" }],
  }),
  component: LearnerDashboardPage,
});

function LearnerDashboardPage() {
  const piano = usePiano();
  const { session } = useAuth();
  const { catalog, isLoading, errorMessage, refetch, getLessonProgress } = useAcademyCatalog();

  const displayName = session?.displayName ?? "Learner";
  const isStudent = session?.role === "student";
  const dashboardEyebrow = session
    ? `${isStudent ? "Student Theory Academy" : "Theory Academy"} · ${getRoleDisplayName(session.role)}`
    : "Theory Academy";

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading Theory Academy dashboard">
        <div className="h-8 w-64 animate-pulse rounded-[2px] bg-border" />
        <div className="h-28 w-full animate-pulse rounded-[2px] border border-border bg-paper" />
        <div className="h-56 w-full animate-pulse rounded-[2px] border border-border bg-paper" />
      </div>
    );
  }

  if (errorMessage || !catalog) {
    return (
      <div className="space-y-4 rounded-[2px] border border-border bg-paper p-8">
        <h1 className="type-display-md text-foreground">Could not load Theory Academy</h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "Unable to read curriculum records."}
        </p>
        <Button type="button" onClick={() => refetch()}>
          Retry loading curriculum
        </Button>
      </div>
    );
  }

  const totalLessons = catalog.lessons.length;
  const completedLessonsCount = catalog.lessons.filter(
    (l) => getLessonProgress(l)?.status === "completed",
  ).length;
  const inProgressCount = catalog.lessons.filter(
    (l) => getLessonProgress(l)?.status === "in_progress",
  ).length;
  const overallPercent =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const resumeLesson = catalog.resumeLesson ?? catalog.lessons[0] ?? null;
  const resumeNotation =
    resumeLesson?.sections.find((s) => s.notation)?.notation ??
    resumeLesson?.workedExample.notation;
  const resumeAudio =
    resumeLesson?.sections.find((s) => s.audioSteps)?.audioSteps ??
    resumeLesson?.workedExample.audioSteps;
  const resumeProgress = resumeLesson ? getLessonProgress(resumeLesson) : null;
  const totalMinutes = catalog.paths.reduce((sum, p) => sum + p.totalEstimatedMinutes, 0);

  return (
    <div className="space-y-10">
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

      {session && !session.profileComplete && (
        <PreviewNotice
          title="Profile setup pending"
          message="Your authentication session is active using default account details until your profile record finishes saving."
        />
      )}

      <PageHeader
        eyebrow={dashboardEyebrow}
        title={`Welcome back, ${displayName}.`}
        description="Progress systematically from sound fundamentals and clefs through scales, harmony, and musical passage reading."
        action={
          resumeLesson ? (
            <Button asChild>
              <Link to="/learn/lessons/$lessonSlug" params={{ lessonSlug: resumeLesson.slug }}>
                {resumeProgress ? "Continue previous lesson" : "Start first lesson"}
                <ArrowRight />
              </Link>
            </Button>
          ) : undefined
        }
      />

      {/* Academy progress metrics */}
      <SectionBlock
        title="Academy overview"
        subtitle={
          catalog.persistenceAvailable
            ? "Tracked from published lessons and your saved progress records."
            : "Curriculum scope across all four structured Theory Academy paths."
        }
      >
        <MetricStrip
          items={[
            {
              label: "Lessons completed",
              value: `${completedLessonsCount}/${totalLessons}`,
              detail: catalog.persistenceAvailable
                ? `${overallPercent}% completed`
                : "Progress saves when DB curriculum is published",
            },
            {
              label: "Learning paths",
              value: `${catalog.paths.length}`,
              detail: "Foundations, Scales, Harmony, Rhythm",
            },
            {
              label: "Published courses",
              value: `${catalog.courses.length}`,
              detail: `${inProgressCount} active lessons in progress`,
            },
            {
              label: "Total curriculum study",
              value: `${totalMinutes}m`,
              detail: `${totalLessons} interactive lessons`,
            },
          ]}
        />
      </SectionBlock>

      {/* Continue previous lesson + Practice shortcuts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <SectionBlock
          title={resumeProgress ? "Continue your previous lesson" : "Recommended starting lesson"}
          subtitle={
            resumeProgress
              ? "Resume directly from your most recently accessed published lesson."
              : "Begin Path I with acoustics, pitch frequency, and the staff."
          }
          className="lg:col-span-7"
        >
          {resumeLesson ? (
            <div className="rounded-[2px] border border-border bg-paper p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Path {resumeLesson.pathNumeral} · {resumeLesson.courseTitle}
                </span>
                <span className="tabular-nums">
                  {formatAcademyLevel(resumeLesson.level)} · {resumeLesson.estimatedMinutes} min
                </span>
              </div>
              <h3 className="type-display-md mt-2 text-foreground">{resumeLesson.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {resumeLesson.summary}
              </p>

              {resumeNotation && (
                <div className="mt-5 overflow-hidden rounded-[2px] border border-border bg-background px-4 py-3">
                  <Staff
                    clef={resumeNotation.clef}
                    keySignature={resumeNotation.keySignature}
                    timeSignature={resumeNotation.timeSignature}
                    chords={resumeNotation.chords}
                    beamNotes={resumeNotation.beamNotes}
                    height={120}
                    label={resumeNotation.label}
                  />
                </div>
              )}

              {catalog.persistenceAvailable && (
                <div className="mt-5">
                  <ProgressRule
                    percent={resumeProgress?.progressPercent ?? 0}
                    label={
                      resumeProgress?.status === "completed"
                        ? "Lesson completed"
                        : resumeProgress?.status === "in_progress"
                          ? "Lesson in progress"
                          : "Ready to start"
                    }
                  />
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/learn/lessons/$lessonSlug" params={{ lessonSlug: resumeLesson.slug }}>
                    {resumeProgress ? "Resume lesson" : "Open lesson"} <ArrowRight />
                  </Link>
                </Button>
                {resumeAudio && resumeAudio.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => piano.playPhrase(resumeAudio)}
                  >
                    <Play className="size-3.5" aria-hidden /> Hear example
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[2px] border border-border bg-paper p-8 text-sm text-muted-foreground">
              No lessons available.
            </div>
          )}
        </SectionBlock>

        <SectionBlock
          title="Audio & staff reinforcement"
          subtitle="Apply concepts hands-on alongside structured reading."
          className="lg:col-span-5"
        >
          <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
            <Link
              to="/learn/practice"
              className="group flex items-start gap-4 p-5 transition-colors hover:bg-background"
            >
              <Piano className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground group-hover:text-primary">
                  Playable Keyboard & Staff
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Play any pitch or chord and inspect real-time engraved notation with Tone.js
                  audio.
                </p>
              </div>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>

            <Link
              to="/learn/notation"
              className="group flex items-start gap-4 p-5 transition-colors hover:bg-background"
            >
              <Music className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground group-hover:text-primary">
                  Treble Notation Lab
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Step through the C major scale and verify staff positions with instant playback.
                </p>
              </div>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>

            <Link
              to="/learn/progress"
              className="group flex items-start gap-4 p-5 transition-colors hover:bg-background"
            >
              <Headphones className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground group-hover:text-primary">
                  Study Progress Log
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Review completed lessons across Foundations, Scales, Harmony, and Rhythm.
                </p>
              </div>
              <ArrowRight
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
          </div>
        </SectionBlock>
      </div>

      {/* Learning Paths overview */}
      <SectionBlock
        title="Learning paths"
        subtitle="Four sequential pillars spanning beginner sound literacy to intermediate harmony and passage reading."
        action={{ label: "Explore all paths & topics", to: "/learn/paths" }}
      >
        <div className="grid gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {catalog.paths.map((path) => {
            const pathLessons = path.courses.flatMap((c) => c.modules.flatMap((m) => m.lessons));
            const doneCount = pathLessons.filter(
              (l) => getLessonProgress(l)?.status === "completed",
            ).length;
            const firstLesson = pathLessons[0];
            const cardBody = (
              <>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl leading-none text-crimson-deep">
                      {path.numeral}
                    </span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {doneCount}/{path.lessonCount} lessons
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl text-foreground">{path.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatAcademyLevel(path.level)} · {path.totalEstimatedMinutes} min
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                    {path.summary}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  Open path <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </>
            );
            return firstLesson ? (
              <Link
                key={path.slug}
                to="/learn/lessons/$lessonSlug"
                params={{ lessonSlug: firstLesson.slug }}
                className="flex flex-col justify-between bg-paper p-5 transition-colors hover:bg-background"
              >
                {cardBody}
              </Link>
            ) : (
              <Link
                key={path.slug}
                to="/learn/paths"
                className="flex flex-col justify-between bg-paper p-5 transition-colors hover:bg-background"
              >
                {cardBody}
              </Link>
            );
          })}
        </div>
      </SectionBlock>

      {/* Courses overview */}
      <SectionBlock
        title="Academy courses"
        subtitle="Guided topic sequences with difficulty ratings and estimated study times."
        action={{ label: "View full course directory", to: "/learn/courses" }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          {catalog.courses.map((course) => {
            const courseLessons = course.modules.flatMap((m) => m.lessons);
            const completed = courseLessons.filter(
              (l) => getLessonProgress(l)?.status === "completed",
            ).length;
            const pct =
              course.lessonCount > 0 ? Math.round((completed / course.lessonCount) * 100) : 0;
            const nextLesson =
              courseLessons.find((l) => getLessonProgress(l)?.status !== "completed") ??
              courseLessons[0];

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
                      {course.estimatedMinutes} min · {course.lessonCount} topics
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl text-foreground">{course.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <ProgressRule
                    percent={pct}
                    label={`${completed} of ${course.lessonCount} lessons completed`}
                  />
                  {nextLesson && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        {completed === course.lessonCount ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-primary" aria-hidden />
                        ) : (
                          <BookOpen
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                        <span className="truncate">{nextLesson.title}</span>
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          to="/learn/lessons/$lessonSlug"
                          params={{ lessonSlug: nextLesson.slug }}
                        >
                          {completed > 0 ? "Continue" : "Start"} <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionBlock>
    </div>
  );
}

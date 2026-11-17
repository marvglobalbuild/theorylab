import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MetricStrip,
  PageHeader,
  PreviewNotice,
  ProgressRule,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LECTURER_ASSIGNMENTS, DEMO_LECTURER_SNAPSHOT } from "@/content/workspaces";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/teach/")({
  head: () => ({
    meta: [{ title: "Overview · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerOverviewPage,
});

const PROPOSED_CAPABILITIES = [
  {
    index: "01",
    title: "Organised teaching resources",
    detail:
      "Lessons arranged by topic and level, ready to sit alongside your own syllabus and reading lists.",
    to: "/teach/resources",
  },
  {
    index: "02",
    title: "Class learning activities",
    detail:
      "Interactive keyboard, notation and listening exercises you can run in a seminar or set for private study.",
    to: "/teach/classes",
  },
  {
    index: "03",
    title: "Student assignments",
    detail:
      "Set work on specific concepts — from interval identification to harmonic analysis — and collect it in one place.",
    to: "/teach/assignments",
  },
  {
    index: "04",
    title: "Learning performance monitoring",
    detail:
      "See which concepts a class has grasped and where individual students may need more support.",
    to: "/teach/performance",
  },
];

function LecturerOverviewPage() {
  const snap = DEMO_LECTURER_SNAPSHOT;
  const { session } = useAuth();
  const totalStudents = snap.classes.reduce((sum, c) => sum + c.studentCount, 0);
  const lecturerName = session?.displayName ?? snap.lecturerName;

  return (
    <div className="space-y-10">
      <PreviewNotice
        title="Authenticated lecturer session · Cohort queries pending"
        message="Your lecturer session is verified via Supabase Auth and user_roles. Class rosters, assignments and assessment telemetry below remain illustrative until live class data queries are connected."
      />

      <PageHeader
        eyebrow="Lecturer Workspace · Verified Educator"
        title={`Welcome, ${lecturerName}.`}
        description="Review active cohorts, track class progress across stages, and inspect the planned seminar and assessment modules."
        action={
          <Button asChild>
            <Link to="/teach/classes">
              View my classes <ArrowRight />
            </Link>
          </Button>
        }
      />

      <MetricStrip
        items={[
          {
            label: "Active classes",
            value: String(snap.classes.length),
            detail: "Demonstration cohorts",
          },
          {
            label: "Enrolled students",
            value: String(totalStudents),
            detail: "Across Stages I–III",
          },
          {
            label: "Active assignments",
            value: String(snap.activeAssignmentsCount),
            detail: "Notation, harmony & ear",
          },
          {
            label: "Pending reviews",
            value: String(snap.pendingReviewsCount),
            detail: "Awaiting backend grading",
          },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <SectionBlock
          title="My classes"
          subtitle="Active cohorts prepared for syllabus pairing."
          action={{ label: "Manage classes", to: "/teach/classes" }}
          className="lg:col-span-7"
        >
          <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
            {snap.classes.map((cls) => (
              <div key={cls.id} className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-medium tabular-nums text-crimson-deep">
                      {cls.code}
                    </span>
                    <h3 className="font-display text-xl text-foreground">{cls.title}</h3>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {cls.studentCount} students
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {cls.level} · {cls.schedule}
                </p>
                <div className="mt-3">
                  <ProgressRule
                    percent={cls.completionPercent}
                    label="Cohort syllabus completion"
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          title="Recent assignments"
          subtitle="Structured coursework mapped to interactive tools."
          action={{ label: "All assignments", to: "/teach/assignments" }}
          className="lg:col-span-5"
        >
          <ul className="divide-y divide-border rounded-[2px] border border-border bg-paper">
            {DEMO_LECTURER_ASSIGNMENTS.map((a) => (
              <li key={a.id} className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-crimson-deep">{a.classCode}</span>
                  <span className="tabular-nums">{a.submissionsLabel} submitted</span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.focus} · {a.dueLabel}
                </p>
              </li>
            ))}
          </ul>
        </SectionBlock>
      </div>

      <SectionBlock
        title="Lecturer capabilities roadmap"
        subtitle="Core educator modules prepared for Supabase integration."
      >
        <div className="grid gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-2">
          {PROPOSED_CAPABILITIES.map((cap) => (
            <Link
              key={cap.index}
              to={cap.to}
              className="flex flex-col justify-between bg-paper p-6 transition-colors hover:bg-background"
            >
              <div>
                <span className="text-xs tabular-nums text-crimson-deep">{cap.index}</span>
                <h3 className="mt-3 font-display text-2xl text-foreground">{cap.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cap.detail}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                Open module <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

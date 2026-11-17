import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import {
  MetricStrip,
  PageHeader,
  PreviewNotice,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";
import { DEMO_ADMIN_SNAPSHOT } from "@/content/workspaces";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Overview · Administration — THEORYLAB" }],
  }),
  component: AdminOverviewPage,
});

const ADMIN_MODULES = [
  {
    label: "Users",
    detail: "Inspect learner & student accounts and role assignments.",
    to: "/admin/users",
  },
  {
    label: "Lecturers",
    detail: "Approve and provision institutional lecturer permissions.",
    to: "/admin/lecturers",
  },
  {
    label: "Curriculum",
    detail: "Manage the four progressive stages and topic sequencing.",
    to: "/admin/curriculum",
  },
  {
    label: "Lessons",
    detail: "Review published lesson modules, notation and audio references.",
    to: "/admin/lessons",
  },
  {
    label: "Assessments",
    detail: "Govern diagnostic question banks and grading rubrics.",
    to: "/admin/assessments",
  },
  {
    label: "Analytics",
    detail: "Monitor cohort completion and assessment metrics.",
    to: "/admin/analytics",
  },
  {
    label: "Settings",
    detail: "Configure platform policies and Supabase integration status.",
    to: "/admin/settings",
  },
];

function AdminOverviewPage() {
  const { session } = useAuth();

  return (
    <div className="space-y-10">
      <PreviewNotice
        title="Verified administrator session · Management queries pending"
        message="Access to this console is verified against Supabase Auth and PostgreSQL user_roles. Directory and curriculum mutation controls will connect in subsequent phases."
      />

      <PageHeader
        eyebrow={session ? `Administrator Dashboard · ${session.displayName}` : "System Governance"}
        title="Platform overview"
        description="Central oversight for user roles, faculty provisioning, curriculum structure and system policies."
      />

      <MetricStrip
        items={[
          {
            label: "Curriculum stages",
            value: String(DEMO_ADMIN_SNAPSHOT.curriculumStages),
            detail: "Beginner to Advanced",
          },
          {
            label: "Structured topics",
            value: String(DEMO_ADMIN_SNAPSHOT.publishedLessons),
            detail: "Mapped in curriculum",
          },
          {
            label: "User directory",
            value: DEMO_ADMIN_SNAPSHOT.totalUsersLabel,
            detail: "Awaiting Supabase Auth",
          },
          {
            label: "Faculty provisioning",
            value: DEMO_ADMIN_SNAPSHOT.activeLecturersLabel,
            detail: "Admin-issued only",
          },
        ]}
      />

      <SectionBlock
        title="Administrative modules"
        subtitle="Structured views prepared for backend role enforcement."
      >
        <div className="grid gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_MODULES.map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="flex flex-col justify-between bg-paper p-5 transition-colors hover:bg-background"
            >
              <div>
                <h2 className="font-display text-2xl text-foreground">{m.label}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                Open {m.label.toLowerCase()} <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

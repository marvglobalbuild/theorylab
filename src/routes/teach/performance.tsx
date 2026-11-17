import { createFileRoute } from "@tanstack/react-router";

import {
  MetricStrip,
  PageHeader,
  PreviewNotice,
  ProgressRule,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LECTURER_SNAPSHOT } from "@/content/workspaces";

export const Route = createFileRoute("/teach/performance")({
  head: () => ({
    meta: [{ title: "Performance · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerPerformancePage,
});

const CONCEPT_MASTERY_DEMO = [
  { concept: "Treble & bass clef reading", stage: "Stage I", mastery: 88 },
  { concept: "Simple meters & dotted values", stage: "Stage II", mastery: 74 },
  { concept: "Intervals by number and quality", stage: "Stage II", mastery: 66 },
  { concept: "Triad inversions & V7 resolution", stage: "Stage III", mastery: 52 },
];

function LecturerPerformancePage() {
  const snap = DEMO_LECTURER_SNAPSHOT;

  return (
    <div className="space-y-8">
      <PreviewNotice message="Cohort comprehension figures below are demonstration placeholders pending Supabase analytics aggregation." />

      <PageHeader
        eyebrow="Learning Performance Monitoring"
        title="Performance"
        description="See which concepts a class has grasped and where individual students may need more support."
      />

      <MetricStrip
        items={[
          { label: "Cohort median mastery", value: "70%", detail: "Demonstration average" },
          {
            label: "Classes monitored",
            value: String(snap.classes.length),
            detail: "MUS-101, MUS-204, EAR-110",
          },
          { label: "On-time submissions", value: "82%", detail: "Past 14 days (Demo)" },
          { label: "Students flagged", value: "1", detail: "Interval review suggested" },
        ]}
      />

      <SectionBlock
        title="Concept mastery by topic"
        subtitle="Percentage of cohort demonstrating target fluency across interactive drills."
      >
        <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
          {CONCEPT_MASTERY_DEMO.map((row) => (
            <div key={row.concept} className="grid gap-4 p-5 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-5">
                <p className="font-medium text-foreground">{row.concept}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.stage}</p>
              </div>
              <div className="sm:col-span-7">
                <ProgressRule percent={row.mastery} label="Cohort accuracy" />
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

import {
  MetricStrip,
  PageHeader,
  PreviewNotice,
  ProgressRule,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [{ title: "Analytics · Administration — THEORYLAB" }],
  }),
  component: AdminAnalyticsPage,
});

const DEMO_STAGE_ENGAGEMENT = [
  {
    stage: "Stage I · Beginner",
    detail: "Musical alphabet, clefs, note values & simple rhythm",
    completion: 78,
  },
  {
    stage: "Stage II · Elementary",
    detail: "Major/minor scales, intervals & key signatures",
    completion: 56,
  },
  {
    stage: "Stage III · Intermediate",
    detail: "Triads, inversions, seventh chords & diatonic harmony",
    completion: 34,
  },
  {
    stage: "Stage IV · Advanced",
    detail: "Secondary dominants, modulation, cadences & counterpoint",
    completion: 18,
  },
];

function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <PreviewNotice
        title="Telemetry unavailable in frontend preview"
        message="Platform-wide engagement metrics below are demonstration illustrations. Live analytics will query anonymised Postgres views once Supabase telemetry is active."
      />

      <PageHeader
        eyebrow="Platform Telemetry"
        title="Analytics"
        description="Monitor cross-cohort progression, assessment completion and curriculum stage bottlenecks."
      />

      <MetricStrip
        items={[
          { label: "Active learners", value: "Unavailable", detail: "Pending Supabase telemetry" },
          {
            label: "Weekly practice logs",
            value: "Unavailable",
            detail: "Requires learner_progress",
          },
          { label: "Assessment pass rate", value: "Demo · 81%", detail: "Illustrative benchmark" },
          { label: "Audio lab sessions", value: "Client-side", detail: "Tone.js playback local" },
        ]}
      />

      <SectionBlock
        title="Illustrative stage completion"
        subtitle="Demonstration completion distribution across the four progressive stages."
      >
        <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
          {DEMO_STAGE_ENGAGEMENT.map((row) => (
            <div key={row.stage} className="grid gap-4 p-5 sm:grid-cols-12 sm:items-center">
              <div className="sm:col-span-5">
                <p className="font-medium text-foreground">{row.stage}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.detail}</p>
              </div>
              <div className="sm:col-span-7">
                <ProgressRule percent={row.completion} label="Demonstration completion" />
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

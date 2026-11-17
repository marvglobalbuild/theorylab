import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { LEARNING_LEVELS } from "@/content/learning-paths";

export const Route = createFileRoute("/admin/curriculum")({
  head: () => ({
    meta: [{ title: "Curriculum · Administration — THEORYLAB" }],
  }),
  component: AdminCurriculumPage,
});

function AdminCurriculumPage() {
  return (
    <div className="space-y-8">
      <PreviewNotice message="Curriculum stages below mirror the canonical four-stage structure in src/content/learning-paths.ts ahead of Supabase CMS tables." />

      <PageHeader
        eyebrow="Syllabus Architecture"
        title="Curriculum"
        description="Govern stage progression, prerequisite dependencies and topic sequencing across all four levels."
      />

      <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
        {LEARNING_LEVELS.map((lvl) => (
          <div key={lvl.id} className="p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl text-crimson-deep">{lvl.numeral}</span>
                <h2 className="type-display-md text-foreground">{lvl.name}</h2>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {lvl.topics.length} topics
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{lvl.summary}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-xs text-foreground">
              {lvl.topics.map((t, i) => (
                <span key={t.title} className="tabular-nums">
                  {lvl.numeral}.{i + 1} {t.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

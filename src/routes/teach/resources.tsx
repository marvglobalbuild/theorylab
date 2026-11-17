import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_LECTURER_RESOURCES } from "@/content/workspaces";

export const Route = createFileRoute("/teach/resources")({
  head: () => ({
    meta: [{ title: "Resources · Lecturer Workspace — THEORYLAB" }],
  }),
  component: LecturerResourcesPage,
});

function LecturerResourcesPage() {
  return (
    <div className="space-y-8">
      <PreviewNotice message="Curated teaching packs below mirror the THEORYLAB curriculum structure. Custom file uploads via Supabase Storage will be added next." />

      <PageHeader
        eyebrow="Organised Teaching Resources"
        title="Resources"
        description="Lessons arranged by topic and level, ready to sit alongside your own syllabus and reading lists."
        action={
          <Button asChild variant="outline">
            <Link to="/learn/practice">
              Open interactive tools <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        {DEMO_LECTURER_RESOURCES.map((res) => (
          <div
            key={res.id}
            className="flex flex-col justify-between rounded-[2px] border border-border bg-paper p-6"
          >
            <div>
              <p className="text-xs font-medium text-crimson-deep">{res.stage}</p>
              <h2 className="type-display-md mt-2 text-foreground">{res.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{res.format}</p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="tabular-nums">{res.topicCount} interactive topics</span>
              <Link to="/learn/paths" className="link-draw font-medium text-primary">
                View syllabus
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

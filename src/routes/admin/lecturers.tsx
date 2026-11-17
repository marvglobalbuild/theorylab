import { createFileRoute } from "@tanstack/react-router";
import { Info, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_ADMIN_USERS } from "@/content/workspaces";

export const Route = createFileRoute("/admin/lecturers")({
  head: () => ({
    meta: [{ title: "Lecturers · Administration — THEORYLAB" }],
  }),
  component: AdminLecturersPage,
});

function AdminLecturersPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const lecturers = DEMO_ADMIN_USERS.filter((u) => u.role === "Lecturer");

  return (
    <div className="space-y-8">
      <PreviewNotice message="Lecturer permissions cannot be self-assigned during sign-up. Faculty provisioning will run exclusively through verified administrator invitations in Supabase." />

      <PageHeader
        eyebrow="Faculty Provisioning"
        title="Lecturers"
        description="Verify institutional educators and assign lecturer workspace permissions."
        action={
          <Button
            type="button"
            onClick={() =>
              setNotice(
                "Faculty invitation emails and role claims will be dispatched via Supabase Edge Functions once connected.",
              )
            }
          >
            <UserPlus className="size-4" aria-hidden /> Invite lecturer
          </Button>
        }
      />

      {notice && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-[2px] border border-border bg-paper p-4 text-sm"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{notice}</span>
        </p>
      )}

      <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
        {lecturers.map((lec) => (
          <div
            key={lec.id}
            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{lec.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{lec.email}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{lec.accountStatus}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setNotice(
                    `Role auditing for ${lec.name} requires an active Supabase admin session.`,
                  )
                }
              >
                Review access
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

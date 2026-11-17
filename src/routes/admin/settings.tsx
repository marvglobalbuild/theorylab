import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PreviewNotice,
  SectionBlock,
} from "@/components/workspace/WorkspacePrimitives";
import {
  checkSupabaseConnection,
  getSupabaseConfigStatus,
  type SupabaseConnectionResult,
} from "@/lib/supabase";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [{ title: "Settings · Administration — THEORYLAB" }],
  }),
  component: AdminSettingsPage,
});

const ROLE_POLICIES = [
  {
    role: "Independent Learner & Student",
    provisioning: "Open self-registration on /register",
    enforcement: "Default lowest-privilege roles stored in profile & JWT claims.",
  },
  {
    role: "Lecturer",
    provisioning: "Administrator-issued invitation only",
    enforcement:
      "Cannot be self-assigned during public registration; verified via Supabase Edge Function.",
  },
  {
    role: "Administrator",
    provisioning: "Protected system role",
    enforcement: "Enforced server-side via Postgres Row-Level Security and admin claims.",
  },
];

function AdminSettingsPage() {
  const configStatus = getSupabaseConfigStatus();
  const [checking, setChecking] = useState(false);
  const [connectionResult, setConnectionResult] = useState<SupabaseConnectionResult | null>(null);

  const handleCheckConnection = async () => {
    setChecking(true);
    const result = await checkSupabaseConnection();
    setConnectionResult(result);
    setChecking(false);
  };

  const integrationChecklist = [
    {
      service: "Supabase Client Configuration",
      status: configStatus.configured ? "Env configured" : "Awaiting env vars",
      detail: configStatus.configured
        ? "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are present and valid for client initialization."
        : `${configStatus.summary} Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local or deployment env.`,
    },
    {
      service: "Supabase Authentication",
      status: "Not connected yet",
      detail:
        "Sign-in, registration, password reset and email verification still route through preview services until the auth phase.",
    },
    {
      service: "Postgres & Row-Level Security",
      status: "Schema planned",
      detail:
        "User profiles, class enrolments, assignments and mastery progress will be provisioned behind strict RLS policies.",
    },
    {
      service: "Asset Storage",
      status: "Not connected yet",
      detail:
        "Reference score excerpts and lecturer PDF packs will use private Supabase Storage buckets.",
    },
  ];

  return (
    <div className="space-y-10">
      <PreviewNotice
        title="Frontend-only configuration view"
        message="No hardcoded API keys, database URLs or secret keys exist in this repository. Supabase client variables are read exclusively from Vite environment configuration."
      />

      <PageHeader
        eyebrow="Platform Governance"
        title="Settings"
        description="Role assignment policies and Supabase integration readiness for THEORYLAB."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={handleCheckConnection}
            disabled={checking}
          >
            {checking ? "Checking Supabase…" : "Verify Supabase configuration"}
          </Button>
        }
      />

      {connectionResult && (
        <div
          role="status"
          className="rounded-[2px] border border-border bg-paper px-4 py-3.5 text-sm leading-relaxed"
        >
          <p className="font-medium text-foreground">
            {connectionResult.status === "connected"
              ? "Supabase connection verified"
              : connectionResult.configured
                ? "Supabase configuration present, endpoint unreachable"
                : "Supabase configuration missing or invalid"}
          </p>
          <p className="mt-1 text-muted-foreground">{connectionResult.message}</p>
        </div>
      )}

      <SectionBlock
        title="Role & registration policy"
        subtitle="Access boundaries enforced across public sign-up and internal workspaces."
      >
        <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
          {ROLE_POLICIES.map((policy) => (
            <div key={policy.role} className="grid gap-2 p-5 sm:grid-cols-12 sm:gap-4">
              <p className="font-medium text-foreground sm:col-span-4">{policy.role}</p>
              <p className="text-xs font-medium text-crimson-deep sm:col-span-3">
                {policy.provisioning}
              </p>
              <p className="text-sm text-muted-foreground sm:col-span-5">{policy.enforcement}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock
        title="Backend integration readiness"
        subtitle="Environment-variable presence and service milestones contracted under src/services."
      >
        <div className="divide-y divide-border rounded-[2px] border border-border bg-paper">
          {integrationChecklist.map((item) => (
            <div
              key={item.service}
              className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{item.service}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { FilterTabs, PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { DEMO_ADMIN_USERS, type DemoAdminUserRow } from "@/content/workspaces";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [{ title: "Users · Administration — THEORYLAB" }],
  }),
  component: AdminUsersPage,
});

type RoleFilter = "All" | DemoAdminUserRow["role"];

function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [query, setQuery] = useState("");

  const filtered = DEMO_ADMIN_USERS.filter((u) => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-8">
      <PreviewNotice message="User records shown below are illustrative placeholders. Live account management requires Supabase Auth admin APIs and server-side role verification." />

      <PageHeader
        eyebrow="Directory"
        title="Users"
        description="Inspect independent learners, enrolled students, lecturers and administrator accounts."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          label="Filter users by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { id: "All", label: "All roles" },
            { id: "Independent Learner", label: "Independent" },
            { id: "Student", label: "Student" },
            { id: "Lecturer", label: "Lecturer" },
            { id: "Administrator", label: "Admin" },
          ]}
        />

        <input
          type="search"
          aria-label="Search users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email…"
          className="h-10 w-full rounded-[2px] border border-input bg-paper px-3.5 text-sm outline-none focus:border-primary sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[2px] border border-border bg-paper p-8 text-center text-sm text-muted-foreground">
          No demonstration user records match your filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2px] border border-border bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 font-medium">Name</th>
                <th className="px-5 py-3.5 font-medium">Email</th>
                <th className="px-5 py-3.5 font-medium">Role</th>
                <th className="px-5 py-3.5 font-medium">Stage / Scope</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-background/60">
                  <td className="px-5 py-3.5 font-medium text-foreground">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3.5 text-crimson-deep">{u.role}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.stage}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{u.accountStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

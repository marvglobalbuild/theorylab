import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BookOpenCheck,
  FileCheck2,
  Layers,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

import { AdminAccessGate } from "@/components/workspace/AdminAccessGate";
import { WorkspaceShell, type WorkspaceNavItem } from "@/components/workspace/WorkspaceShell";
import { useAuth } from "@/lib/auth-context";

const ADMIN_NAV: WorkspaceNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/lecturers", label: "Lecturers", icon: UserCog },
  { to: "/admin/curriculum", label: "Curriculum", icon: Layers },
  { to: "/admin/lessons", label: "Lessons", icon: BookOpenCheck },
  { to: "/admin/assessments", label: "Assessments", icon: FileCheck2 },
  { to: "/admin/analytics", label: "Analytics", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/admin": "Overview",
  "/admin/users": "Users",
  "/admin/lecturers": "Lecturers",
  "/admin/curriculum": "Curriculum",
  "/admin/lessons": "Lessons",
  "/admin/assessments": "Assessments",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — THEORYLAB" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = TITLES[pathname] ?? "Overview";
  const { session } = useAuth();

  return (
    <AdminAccessGate>
      <WorkspaceShell
        workspaceLabel="Administration"
        workspaceSubtitle="Platform Governance"
        navItems={ADMIN_NAV}
        breadcrumbCurrent={current}
        accountName={session?.displayName ?? "Administrator"}
        accountDetail="Authorized Administrator"
      >
        <Outlet />
      </WorkspaceShell>
    </AdminAccessGate>
  );
}

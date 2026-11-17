import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookMarked,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  LayoutGrid,
  Users,
} from "lucide-react";

import { ProtectedRoute } from "@/components/workspace/ProtectedRoute";
import { WorkspaceShell, type WorkspaceNavItem } from "@/components/workspace/WorkspaceShell";
import { useAuth } from "@/lib/auth-context";

const LECTURER_NAV: WorkspaceNavItem[] = [
  { to: "/teach", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/teach/classes", label: "My Classes", icon: GraduationCap },
  { to: "/teach/students", label: "Students", icon: Users },
  { to: "/teach/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/teach/assessments", label: "Assessments", icon: FileCheck2 },
  { to: "/teach/resources", label: "Resources", icon: BookMarked },
  { to: "/teach/performance", label: "Performance", icon: BarChart3 },
];

const TITLES: Record<string, string> = {
  "/teach": "Overview",
  "/teach/classes": "My Classes",
  "/teach/students": "Students",
  "/teach/assignments": "Assignments",
  "/teach/assessments": "Assessments",
  "/teach/resources": "Resources",
  "/teach/performance": "Performance",
};

export const Route = createFileRoute("/teach")({
  head: () => ({
    meta: [
      { title: "Lecturer Workspace — THEORYLAB" },
      {
        name: "description",
        content: "Manage classes, students, assignments, teaching resources and class performance.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LecturerLayout,
});

function LecturerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = TITLES[pathname] ?? "Lecturer Workspace";
  const { session } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["lecturer"]} workspaceName="Lecturer Workspace">
      <WorkspaceShell
        workspaceLabel="Lecturer Workspace"
        workspaceSubtitle="Educator Studio"
        navItems={LECTURER_NAV}
        breadcrumbCurrent={current}
        accountName={session?.displayName ?? "Lecturer"}
        accountDetail="Authorized Lecturer"
        headerAction={{ label: "My classes", to: "/teach/classes" }}
      >
        <Outlet />
      </WorkspaceShell>
    </ProtectedRoute>
  );
}

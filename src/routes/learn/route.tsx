import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardCheck,
  Clock,
  Compass,
  Layers,
  LayoutDashboard,
  Music,
  Piano,
  TrendingUp,
} from "lucide-react";

import { ProtectedRoute } from "@/components/workspace/ProtectedRoute";
import { WorkspaceShell, type WorkspaceNavItem } from "@/components/workspace/WorkspaceShell";
import { useAuth } from "@/lib/auth-context";
import { getRoleDisplayName } from "@/lib/auth-routing";

const LEARNER_NAV: WorkspaceNavItem[] = [
  { to: "/learn", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/learn/paths", label: "Learning Paths", icon: Compass },
  { to: "/learn/courses", label: "My Courses", icon: BookOpen },
  { to: "/learn/practice", label: "Quick Practice", icon: Piano },
  { to: "/learn/notation", label: "Notation Lab", icon: Music },
  { to: "/learn/keyboard", label: "Virtual Keyboard", icon: Piano },
  { to: "/learn/harmony", label: "Harmony Studio", icon: Layers },
  { to: "/learn/rhythm", label: "Rhythm Lab", icon: Clock },
  { to: "/learn/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/learn/progress", label: "Progress", icon: TrendingUp },
];

const TITLES: Record<string, string> = {
  "/learn": "Dashboard",
  "/learn/paths": "Learning Paths",
  "/learn/courses": "My Courses",
  "/learn/practice": "Quick Practice",
  "/learn/notation": "Notation Lab",
  "/learn/keyboard": "Virtual Keyboard",
  "/learn/harmony": "Harmony Studio",
  "/learn/rhythm": "Rhythm Lab",
  "/learn/assessments": "Assessments",
  "/learn/progress": "Progress",
};

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learner Studio — THEORYLAB" },
      { name: "description", content: "Interactive classical music theory learning workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearnerLayout,
});

function LearnerLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = pathname.startsWith("/learn/lessons/")
    ? "Theory Lesson"
    : (TITLES[pathname] ?? "Learner Studio");
  const { session } = useAuth();
  const isStudent = session?.role === "student";

  return (
    <ProtectedRoute workspaceName={isStudent ? "Student Dashboard" : "Learner Studio"}>
      <WorkspaceShell
        workspaceLabel={isStudent ? "Student Studio" : "Learner Studio"}
        workspaceSubtitle={isStudent ? "Enrolled Class & Guided Study" : "Independent Learning"}
        navItems={LEARNER_NAV}
        breadcrumbCurrent={current}
        accountName={session?.displayName ?? "Learner"}
        accountDetail={session ? getRoleDisplayName(session.role) : "Authenticated session"}
        headerAction={{ label: "Quick practice", to: "/learn/practice" }}
      >
        <Outlet />
      </WorkspaceShell>
    </ProtectedRoute>
  );
}

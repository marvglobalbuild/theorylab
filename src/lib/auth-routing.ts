import type { UserRole } from "@/services/contracts";

const ROLE_PRIORITY: Record<UserRole, number> = {
  administrator: 4,
  lecturer: 3,
  student: 2,
  independent_learner: 1,
};

export type DashboardPath = "/learn" | "/teach" | "/admin";

export function isValidUserRole(value: unknown): value is UserRole {
  return (
    value === "independent_learner" ||
    value === "student" ||
    value === "lecturer" ||
    value === "administrator"
  );
}

/**
 * Resolves the highest-privilege authorized role returned by public.user_roles.
 * Always falls back to "independent_learner" if missing — never elevates privileges.
 */
export function resolvePrimaryRole(roles: readonly UserRole[]): UserRole {
  if (roles.length === 0) return "independent_learner";
  let best: UserRole = "independent_learner";
  for (const role of roles) {
    if (isValidUserRole(role) && ROLE_PRIORITY[role] > ROLE_PRIORITY[best]) {
      best = role;
    }
  }
  return best;
}

/**
 * Maps each authorized role to its corresponding THEORYLAB application dashboard:
 * - administrator       -> /admin (Administrator dashboard)
 * - lecturer            -> /teach (Lecturer workspace)
 * - student             -> /learn (Student dashboard)
 * - independent_learner -> /learn (Learner dashboard)
 */
export function getDashboardPathForRole(role: UserRole): DashboardPath {
  switch (role) {
    case "administrator":
      return "/admin";
    case "lecturer":
      return "/teach";
    case "student":
    case "independent_learner":
    default:
      return "/learn";
  }
}

export function getDashboardLabelForRole(role: UserRole): string {
  switch (role) {
    case "administrator":
      return "Administrator dashboard";
    case "lecturer":
      return "Lecturer workspace";
    case "student":
      return "Student dashboard";
    case "independent_learner":
    default:
      return "Learner dashboard";
  }
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "administrator":
      return "Administrator";
    case "lecturer":
      return "Lecturer";
    case "student":
      return "Student";
    case "independent_learner":
    default:
      return "Independent Learner";
  }
}

/**
 * Prevents open redirects by allowing only internal relative paths (e.g. "/learn/courses").
 * Never allows external URLs or protocol-relative paths ("//...").
 */
export function sanitizeRedirectPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.includes("\\") || /[\r\n]/.test(trimmed)) return null;
  return trimmed;
}

export function canRolesAccessPath(roles: readonly UserRole[], path: string): boolean {
  if (path.startsWith("/admin")) {
    return roles.includes("administrator");
  }
  if (path.startsWith("/teach")) {
    return roles.includes("lecturer");
  }
  if (path.startsWith("/learn")) {
    return roles.length > 0;
  }
  return true;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export const MIN_PASSWORD_LENGTH = 8;

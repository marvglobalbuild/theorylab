import type { ReactNode } from "react";

import { ProtectedRoute } from "./ProtectedRoute";

/**
 * Authorization boundary for /admin/*.
 * Enforces an active Supabase authenticated session with the "administrator" role,
 * paired with server-side PostgreSQL Row-Level Security.
 */
export function AdminAccessGate({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["administrator"]} workspaceName="Administrator Dashboard">
      {children}
    </ProtectedRoute>
  );
}

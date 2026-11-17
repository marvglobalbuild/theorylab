import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { PageShell, PreviewTag } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  getDashboardLabelForRole,
  getDashboardPathForRole,
  getRoleDisplayName,
} from "@/lib/auth-routing";
import type { UserRole } from "@/services/contracts";

export interface ProtectedRouteProps {
  /** Authorized roles allowed to view this route. Omit to allow any authenticated active user. */
  allowedRoles?: readonly UserRole[];
  workspaceName?: string;
  children: ReactNode;
}

/**
 * Client-side route protection guard paired with server-side Supabase Auth + PostgreSQL RLS.
 * Waits until browser session restoration completes so SSR and initial client hydration never mismatch.
 */
export function ProtectedRoute({
  allowedRoles,
  workspaceName = "this workspace",
  children,
}: ProtectedRouteProps) {
  const { initialized, loading, session, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (initialized && !loading && !session) {
      void navigate({
        to: "/sign-in",
        search: { redirect: pathname },
        replace: true,
      });
    }
  }, [initialized, loading, session, navigate, pathname]);

  if (!initialized || loading) {
    return (
      <PageShell>
        <div
          className="container-editorial grid min-h-[70vh] place-items-center py-16"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
            <span>Verifying your session…</span>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell>
        <div className="container-editorial grid min-h-[70vh] place-items-center py-16">
          <div className="w-full max-w-md rounded-[2px] border border-border bg-paper p-7 md:p-9">
            <PreviewTag>Authentication required</PreviewTag>
            <h1 className="type-display-md mt-5 text-foreground">Sign in to continue</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Redirecting you to sign in before opening {workspaceName}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/sign-in" search={{ redirect: pathname }}>
                  Go to sign in <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  <ArrowLeft /> Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (session.accountStatus !== "active") {
    return (
      <PageShell>
        <div className="container-editorial grid min-h-[70vh] place-items-center py-16">
          <div className="w-full max-w-lg rounded-[2px] border border-border bg-paper p-7 md:p-10">
            <PreviewTag>Account restricted</PreviewTag>
            <div className="mt-6 flex items-start gap-3">
              <ShieldAlert className="mt-1 size-5 shrink-0 text-crimson-deep" aria-hidden />
              <div>
                <h1 className="type-display-md text-foreground">Account access is suspended</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Your THEORYLAB account ({session.email}) currently has status{" "}
                  <span className="font-medium text-foreground">{session.accountStatus}</span> and
                  cannot open workspaces.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button type="button" onClick={() => void signOut()}>
                <LogOut /> Sign out
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Return to home</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const authorized =
    !allowedRoles ||
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => session.roles.includes(role) || session.role === role);

  if (!authorized) {
    const dashboardPath = getDashboardPathForRole(session.role);
    const dashboardLabel = getDashboardLabelForRole(session.role);

    return (
      <PageShell>
        <div className="container-editorial grid min-h-[70vh] place-items-center py-16 md:py-24">
          <div className="w-full max-w-lg rounded-[2px] border border-border bg-paper p-7 md:p-10">
            <PreviewTag>Access restricted</PreviewTag>
            <div className="mt-6 flex items-start gap-3">
              <ShieldAlert className="mt-1 size-5 shrink-0 text-crimson-deep" aria-hidden />
              <div>
                <h1 className="type-display-md text-foreground">
                  You do not have permission for {workspaceName}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  You are signed in as{" "}
                  <span className="font-medium text-foreground">{session.displayName}</span> (
                  {getRoleDisplayName(session.role)}). This area requires{" "}
                  {allowedRoles.map(getRoleDisplayName).join(" or ")} authorization enforced by
                  Supabase Row-Level Security.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={dashboardPath}>
                  Open {dashboardLabel} <ArrowRight />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await signOut();
                  void navigate({ to: "/sign-in", replace: true });
                }}
              >
                <LogOut /> Sign out
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return <>{children}</>;
}

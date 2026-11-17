import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Info, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { AuthShell } from "@/components/workspace/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  canRolesAccessPath,
  getDashboardLabelForRole,
  getDashboardPathForRole,
  isValidEmail,
  sanitizeRedirectPath,
} from "@/lib/auth-routing";
import { authService } from "@/services";

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const safe = sanitizeRedirectPath(search["redirect"]);
    return safe ? { redirect: safe } : {};
  },
  head: () => ({
    meta: [
      { title: "Sign in — THEORYLAB" },
      { name: "description", content: "Sign in to your THEORYLAB learner or educator account." },
      { property: "og:title", content: "Sign in — THEORYLAB" },
      { property: "og:description", content: "THEORYLAB account sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

const inputClass =
  "mt-2 block h-11 w-full rounded-[2px] border border-input bg-background px-4 text-[0.95rem] outline-none transition-colors placeholder:text-faint focus:border-primary";

function SignInPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { initialized, configured, session, setSessionDirect } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const safeRedirect = useMemo(() => sanitizeRedirectPath(search.redirect), [search.redirect]);

  const resolveDestination = useMemo(
    () => (roles: Parameters<typeof canRolesAccessPath>[0], fallback: string) => {
      if (safeRedirect && canRolesAccessPath(roles, safeRedirect)) {
        return safeRedirect;
      }
      return fallback;
    },
    [safeRedirect],
  );

  useEffect(() => {
    if (!initialized || !session) return;
    const defaultDashboard = getDashboardPathForRole(session.role);
    const destination = resolveDestination(session.roles, defaultDashboard);
    void navigate({ to: destination, replace: true });
  }, [initialized, session, resolveDestination, navigate]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setUnconfirmedEmail(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Enter your password.");
      return;
    }

    setPending(true);
    const result = await authService.signIn({
      email: trimmedEmail,
      password,
    });
    setPending(false);

    if (result.status === "unavailable") {
      setNotice(result.message);
      return;
    }

    if (result.status === "error") {
      setErrorMessage(result.message);
      if (result.code === "email_not_confirmed") {
        setUnconfirmedEmail(trimmedEmail);
      }
      return;
    }

    setSessionDirect(result.data);
    const defaultDashboard = getDashboardPathForRole(result.data.role);
    const destination = resolveDestination(result.data.roles, defaultDashboard);
    void navigate({ to: destination, replace: true });
  };

  if (initialized && session) {
    const dashboardPath = getDashboardPathForRole(session.role);
    const dashboardLabel = getDashboardLabelForRole(session.role);
    return (
      <AuthShell
        eyebrow="Account session"
        title="Welcome back to your studio."
        intro="Your session is active. Continuing to your THEORYLAB workspace."
      >
        <div className="flex items-center gap-3 text-sm text-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          <span>
            Signed in as <strong>{session.displayName}</strong>. Redirecting to {dashboardLabel}…
          </span>
        </div>
        <div className="mt-6">
          <Button asChild size="lg" className="w-full">
            <Link to={dashboardPath}>
              Open {dashboardLabel} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account access"
      title="Welcome back to your studio."
      intro="Sign in to access your classical theory courses, interactive practice sessions, assignments, and saved progress."
      asideNote="Authentication and role permissions are verified through Supabase Auth and PostgreSQL Row-Level Security."
    >
      <h2 className="type-display-md text-foreground">Sign in</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your account email and password to continue.
      </p>

      {initialized && !configured && !notice && (
        <p
          role="status"
          className="mt-5 flex items-start gap-3 rounded-[2px] border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Supabase credentials (<code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>) are not configured in this environment yet.
          </span>
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <label className="block text-sm font-medium text-foreground">
          Email address
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@conservatory.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="signin-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link to="/forgot-password" className="link-draw text-xs text-primary">
              Forgot password?
            </Link>
          </div>
          <input
            id="signin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
          <ArrowRight aria-hidden />
        </Button>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-[2px] border border-crimson-deep/40 bg-background p-4 text-sm leading-relaxed text-foreground"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-crimson-deep" aria-hidden />
              <div className="space-y-2">
                <p>{errorMessage}</p>
                {unconfirmedEmail && (
                  <Link
                    to="/verify-email"
                    search={{ email: unconfirmedEmail }}
                    className="link-draw inline-block text-xs font-medium text-primary"
                  >
                    Resend confirmation email
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="flex items-start gap-3 rounded-[2px] border border-border bg-background p-4 text-sm leading-relaxed text-foreground"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{notice}</span>
          </p>
        )}
      </form>

      <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          New to THEORYLAB?{" "}
          <Link to="/register" className="link-draw font-medium text-primary">
            Create an independent learner account
          </Link>
        </p>
        <p className="text-xs">
          Need to confirm an address?{" "}
          <Link to="/verify-email" className="link-draw text-foreground hover:text-primary">
            Email verification
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

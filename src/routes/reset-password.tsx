import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Info, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/workspace/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  getDashboardLabelForRole,
  getDashboardPathForRole,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth-routing";
import { authService } from "@/services";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — THEORYLAB" },
      { name: "description", content: "Choose a new password for your THEORYLAB account." },
      { property: "og:title", content: "Set new password — THEORYLAB" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const inputClass =
  "mt-2 block h-11 w-full rounded-[2px] border border-input bg-background px-4 text-[0.95rem] outline-none transition-colors placeholder:text-faint focus:border-primary";

function ResetPasswordPage() {
  const { initialized, configured, session, recoveryMode, clearRecoveryMode, refreshSession } =
    useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);
  const [pending, setPending] = useState(false);

  const hasRecoveryAccess = Boolean(session || recoveryMode);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotice(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setPending(true);
    const result = await authService.updatePassword(password);
    setPending(false);

    if (result.status === "unavailable") {
      setNotice(result.message);
      return;
    }
    if (result.status === "error") {
      setErrorMessage(result.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    clearRecoveryMode();
    await refreshSession();
    setUpdated(true);
  };

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Choose a new password."
      intro="Set a strong password to restore full access to your THEORYLAB account."
      asideNote="Password recovery links are single-use and validated by Supabase Auth."
    >
      {!initialized ? (
        <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          <span>Verifying your recovery link…</span>
        </div>
      ) : updated ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <h2 className="type-display-md text-foreground">Password updated</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your password has been changed successfully.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {session ? (
              <Button asChild size="lg" className="flex-1">
                <Link to={getDashboardPathForRole(session.role)}>
                  Continue to {getDashboardLabelForRole(session.role)} <ArrowRight aria-hidden />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="flex-1">
                <Link to="/sign-in">
                  Sign in with new password <ArrowRight aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : !hasRecoveryAccess && configured ? (
        <div className="space-y-6">
          <h2 className="type-display-md text-foreground">Recovery session required</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open the password reset link sent to your email address, or request a fresh reset link
            if the previous one expired.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/forgot-password">
                Request new reset link <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="type-display-md text-foreground">Set new password</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter a new password of at least {MIN_PASSWORD_LENGTH} characters.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-medium text-foreground">
              New password
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              Confirm new password
              <input
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Updating…" : "Update password"}
              <ArrowRight aria-hidden />
            </Button>

            {errorMessage && (
              <p
                role="alert"
                className="flex items-start gap-3 rounded-[2px] border border-crimson-deep/40 bg-background p-4 text-sm leading-relaxed text-foreground"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-crimson-deep" aria-hidden />
                <span>{errorMessage}</span>
              </p>
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

          <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
            <Link to="/sign-in" className="link-draw inline-flex items-center gap-1.5 text-primary">
              <ArrowLeft className="size-3.5" aria-hidden /> Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

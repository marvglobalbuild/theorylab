import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Info, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/workspace/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  getDashboardLabelForRole,
  getDashboardPathForRole,
  isValidEmail,
} from "@/lib/auth-routing";
import { authService } from "@/services";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { email?: string; token?: string; token_hash?: string } => ({
    ...(typeof search["email"] === "string" ? { email: search["email"] } : {}),
    ...(typeof search["token"] === "string" ? { token: search["token"] } : {}),
    ...(typeof search["token_hash"] === "string" ? { token_hash: search["token_hash"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Verify email — THEORYLAB" },
      { name: "description", content: "Confirm your THEORYLAB account email address." },
      { property: "og:title", content: "Verify email — THEORYLAB" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmailPage,
});

const inputClass =
  "mt-2 block h-11 w-full rounded-[2px] border border-input bg-background px-4 text-[0.95rem] outline-none transition-colors placeholder:text-faint focus:border-primary";

function VerifyEmailPage() {
  const search = Route.useSearch();
  const { session, refreshSession } = useAuth();

  const [email, setEmail] = useState(search.email ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const verificationToken = search.token_hash ?? search.token;

  const handleResend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setPending(true);
    const result = await authService.resendVerification(trimmedEmail);
    setPending(false);

    if (result.status === "unavailable") {
      setNotice(result.message);
      return;
    }
    if (result.status === "error") {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(`A fresh verification email has been sent to ${trimmedEmail}.`);
  };

  const handleVerifyToken = async () => {
    if (!verificationToken) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setNotice(null);

    setPending(true);
    const result = await authService.verifyEmail(verificationToken);
    setPending(false);

    if (result.status === "unavailable") {
      setNotice(result.message);
      return;
    }
    if (result.status === "error") {
      setErrorMessage(result.message);
      return;
    }

    await refreshSession();
    setSuccessMessage("Your email address has been verified.");
  };

  return (
    <AuthShell
      eyebrow="Email confirmation"
      title="Verify your email address."
      intro="Confirming your address keeps your learning progress, assessment submissions and class membership tied securely to your account."
      asideNote="Verification links and confirmation tokens are validated securely by Supabase Auth."
    >
      {session?.emailVerified ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <h2 className="type-display-md text-foreground">Email verified</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your address (<strong className="text-foreground">{session.email}</strong>) is
                confirmed and your session is active.
              </p>
            </div>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link to={getDashboardPathForRole(session.role)}>
              Continue to {getDashboardLabelForRole(session.role)} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <MailCheck className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <h2 className="type-display-md text-foreground">Verification status</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {search.email
                  ? `Pending confirmation for ${search.email}. Open the verification link in your inbox or request another email below.`
                  : "Enter your account email to request a fresh verification link."}
              </p>
            </div>
          </div>

          {verificationToken && (
            <div className="mt-6 border-t border-border pt-6">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => void handleVerifyToken()}
                disabled={pending}
              >
                Confirm verification token <ArrowRight aria-hidden />
              </Button>
            </div>
          )}

          <form
            onSubmit={handleResend}
            className="mt-6 space-y-4 border-t border-border pt-6"
            noValidate
          >
            <label className="block text-sm font-medium text-foreground">
              Account email
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@conservatory.edu"
                className={inputClass}
              />
            </label>

            <Button
              type="submit"
              variant={verificationToken ? "outline" : "default"}
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending ? "Sending…" : "Resend verification email"}
            </Button>

            {successMessage && (
              <p
                role="status"
                className="flex items-start gap-3 rounded-[2px] border border-primary/30 bg-background p-4 text-sm leading-relaxed text-foreground"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{successMessage}</span>
              </p>
            )}

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
              <ArrowLeft className="size-3.5" aria-hidden /> Return to sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

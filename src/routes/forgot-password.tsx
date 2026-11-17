import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/workspace/AuthShell";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/lib/auth-routing";
import { authService } from "@/services";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Password recovery — THEORYLAB" },
      { name: "description", content: "Request a THEORYLAB password reset link." },
      { property: "og:title", content: "Password recovery — THEORYLAB" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

const inputClass =
  "mt-2 block h-11 w-full rounded-[2px] border border-input bg-background px-4 text-[0.95rem] outline-none transition-colors placeholder:text-faint focus:border-primary";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    setPending(true);
    const result = await authService.requestPasswordReset(trimmedEmail);
    setPending(false);

    if (result.status === "unavailable") {
      setNotice(result.message);
      return;
    }
    if (result.status === "error") {
      setErrorMessage(result.message);
      return;
    }

    setSentToEmail(trimmedEmail);
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password."
      intro="Enter the email address associated with your THEORYLAB account and we will send password recovery instructions."
      asideNote="Password recovery tokens are issued securely by Supabase Auth and redirect back to your password reset page."
    >
      <h2 className="type-display-md text-foreground">Password recovery</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We will send a single-use recovery link to your registered email address.
      </p>

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

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset instructions"}
          <ArrowRight aria-hidden />
        </Button>

        {sentToEmail && (
          <p
            role="status"
            className="flex items-start gap-3 rounded-[2px] border border-primary/30 bg-background p-4 text-sm leading-relaxed text-foreground"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              If an account exists for <strong>{sentToEmail}</strong>, a password reset link has
              been sent. Open the link in your email to choose a new password.
            </span>
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
          <ArrowLeft className="size-3.5" aria-hidden /> Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

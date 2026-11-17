import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Info } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { AuthShell } from "@/components/workspace/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getDashboardPathForRole, isValidEmail, MIN_PASSWORD_LENGTH } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";
import { authService, type RegistrationAccountType } from "@/services";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { as?: RegistrationAccountType } => {
    const raw = search["as"];
    return raw === "student" || raw === "lecturer" ? { as: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Create account — THEORYLAB" },
      {
        name: "description",
        content: "Create a THEORYLAB student or lecturer account.",
      },
      { property: "og:title", content: "Create account — THEORYLAB" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

const ACCOUNT_OPTIONS: {
  id: RegistrationAccountType;
  title: string;
  description: string;
}[] = [
  {
    id: "student",
    title: "Student",
    description:
      "Learn classical music theory with interactive notation, keyboard labs, ear training, and class study.",
  },
  {
    id: "lecturer",
    title: "Lecturer",
    description:
      "Apply for an educator account to manage classes and assignments (requires administrator verification).",
  },
];

const inputClass =
  "mt-2 block h-11 w-full rounded-[2px] border border-input bg-background px-4 text-[0.95rem] outline-none transition-colors placeholder:text-faint focus:border-primary";

function RegisterPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { initialized, configured, session, setSessionDirect } = useAuth();

  const [accountType, setAccountType] = useState<RegistrationAccountType>(search.as ?? "student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [registeredInfo, setRegisteredInfo] = useState<{
    email: string;
    accountType: RegistrationAccountType;
  } | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!initialized || !session) return;
    void navigate({ to: getDashboardPathForRole(session.role), replace: true });
  }, [initialized, session, navigate]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotice(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("Enter your full name (at least 2 characters).");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setPending(true);
    const result = await authService.signUp({
      name: trimmedName,
      email: trimmedEmail,
      password,
      accountType,
    });
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

    if (result.data.session) {
      setSessionDirect(result.data.session);
      void navigate({
        to: getDashboardPathForRole(result.data.session.role),
        replace: true,
      });
      return;
    }

    setRegisteredInfo({
      email: result.data.email,
      accountType: result.data.requestedAccountType,
    });
  };

  return (
    <AuthShell
      eyebrow="Account registration"
      title="Begin structured music study."
      intro="Create your THEORYLAB account as a student or lecturer to get started with interactive classical theory study."
      asideNote="Student accounts begin with learner workspace access automatically and gain enrolled student status when joining a class. Lecturer requests are recorded during registration and require administrator verification before educator privileges unlock."
    >
      {registeredInfo ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
            <div>
              <h2 className="type-display-md text-foreground">Confirm your email</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We created your{" "}
                {registeredInfo.accountType === "lecturer" ? "lecturer applicant" : "student"}{" "}
                account and sent a confirmation link to{" "}
                <strong className="text-foreground">{registeredInfo.email}</strong>. Open that link
                to verify your address, then sign in.
              </p>
              {registeredInfo.accountType === "lecturer" && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Note: For account security, the Lecturer Workspace unlocks after an administrator
                  verifies your educator status.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link to="/verify-email" search={{ email: registeredInfo.email }}>
                Verification options <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="type-display-md text-foreground">Create account</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose whether you are joining as a student or a lecturer, then enter your details.
          </p>

          {initialized && !configured && !notice && (
            <p
              role="status"
              className="mt-5 flex items-start gap-3 rounded-[2px] border border-border bg-background p-4 text-xs leading-relaxed text-muted-foreground"
            >
              <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>
                Supabase credentials (<code>VITE_SUPABASE_URL</code> and{" "}
                <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>) are not configured in this environment
                yet.
              </span>
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <fieldset>
              <legend className="text-sm font-medium text-foreground">Sign up as</legend>
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                {ACCOUNT_OPTIONS.map((opt) => {
                  const selected = accountType === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "cursor-pointer rounded-[2px] border bg-background p-4 transition-colors",
                        selected ? "border-primary" : "border-border hover:border-foreground/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value={opt.id}
                        checked={selected}
                        onChange={() => setAccountType(opt.id)}
                        className="sr-only"
                      />
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          selected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {opt.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {opt.description}
                      </span>
                    </label>
                  );
                })}
              </div>
              {accountType === "lecturer" && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Your lecturer request is stored with your account; educator workspace privileges
                  activate once verified by an administrator.
                </p>
              )}
            </fieldset>

            <label className="block text-sm font-medium text-foreground">
              Full name
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Clara Bennett"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </label>

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

            <label className="block text-sm font-medium text-foreground">
              Password
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
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </label>

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? "Creating account…" : "Create account"}
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
            Already have an account?{" "}
            <Link to="/sign-in" className="link-draw font-medium text-primary">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

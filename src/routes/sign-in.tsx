import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageShell, PreviewTag } from "@/components/layout/PageShell";
import { authService } from "@/services";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in (preview) — THEORYLAB" },
      { name: "description", content: "A preview of the THEORYLAB sign-in page. Accounts are not yet available." },
      { property: "og:title", content: "Sign in (preview) — THEORYLAB" },
      { property: "og:description", content: "THEORYLAB accounts are coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignInPage,
});

const inputClass =
  "mt-2 block h-12 w-full rounded-[2px] border border-input bg-paper px-4 text-[0.95rem] outline-none transition-colors placeholder:text-faint focus:border-primary";

function SignInPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    // Integration point: authService is a preview stub until the backend is connected.
    const result = await authService.signIn({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });
    setPending(false);
    if (result.status === "unavailable") setNotice(result.message);
  };

  return (
    <PageShell>
      <div className="container-editorial grid min-h-[70vh] place-items-center py-16 md:py-24">
        <div className="w-full max-w-md">
          <PreviewTag>Sign-in preview</PreviewTag>
          <h1 className="type-display-lg mt-6">Welcome back.</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            This is how signing in will look. Accounts are not open yet, so you can't sign in today.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5" noValidate>
            <label className="block text-sm font-medium">
              Email
              <input name="email" type="email" autoComplete="email" placeholder="you@university.ac.uk" className={inputClass} />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input name="password" type="password" autoComplete="current-password" className={inputClass} />
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              Sign in
            </Button>
            {notice && (
              <p role="status" className="flex gap-3 rounded-[2px] border border-gold/60 bg-paper p-4 text-sm leading-relaxed">
                <Info className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
                {notice}
              </p>
            )}
          </form>

          <p className="mt-10 text-sm text-muted-foreground">
            New to THEORYLAB?{" "}
            <Link to="/start" className="link-draw text-primary">
              Preview your learning path
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}

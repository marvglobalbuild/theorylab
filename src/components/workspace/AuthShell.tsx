import type { ReactNode } from "react";

import { PreviewTag } from "@/components/layout/PageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

/** Consistent editorial shell for authentication and verification screens. */
export function AuthShell({
  eyebrow,
  title,
  intro,
  asideNote,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  asideNote?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader solid />
      <main id="main" className="min-h-[75vh] pt-16">
        <div className="container-editorial grid gap-12 py-14 md:py-24 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:col-span-5">
            <PreviewTag>{eyebrow}</PreviewTag>
            <h1 className="type-display-lg mt-6 text-balance text-foreground">{title}</h1>
            <p className="type-lede mt-5 max-w-md text-muted-foreground">{intro}</p>
            {asideNote && (
              <p className="mt-8 max-w-md border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
                {asideNote}
              </p>
            )}
          </aside>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="rounded-[2px] border border-border bg-paper p-6 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

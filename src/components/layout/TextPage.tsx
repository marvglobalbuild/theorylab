import type { ReactNode } from "react";

import { PageShell, PreviewTag } from "./PageShell";

/** Simple editorial page for contact and legal notices. */
export function TextPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <PageShell>
      <article className="container-editorial py-16 md:py-24">
        <div className="max-w-2xl">
          <PreviewTag>Preview edition</PreviewTag>
          <h1 className="type-display-lg mt-6">{title}</h1>
          <p className="type-lede mt-6 text-muted-foreground">{intro}</p>
          <div className="mt-12 space-y-8 border-t border-border pt-10 leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_p]:mt-3">
            {children}
          </div>
        </div>
      </article>
    </PageShell>
  );
}

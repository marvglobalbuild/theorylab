import type { ReactNode } from "react";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Header + footer frame for secondary pages. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader solid />
      <main id="main" className="min-h-[70vh] pt-16">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

/** Small "Preview" tag used wherever a feature is not yet live. */
export function PreviewTag({ children = "Preview" }: { children?: ReactNode }) {
  return (
    <span className="eyebrow inline-flex items-center gap-2 rounded-[2px] border border-gold/60 px-2.5 py-1 text-gold-deep">
      <span aria-hidden className="size-1 rounded-full bg-gold" />
      {children}
    </span>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";

import { BRAND, SECTION_IDS } from "@/content/site";
import { SectionLink } from "./SectionLink";
import { Wordmark } from "./Wordmark";

const linkClass =
  "link-draw py-0.5 text-sm text-ink-muted transition-colors hover:text-ink-foreground";

export function SiteFooter() {
  return (
    <footer className="bg-ink-deep text-ink-foreground">
      <div className="container-editorial grid gap-12 border-t border-ink-border py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Wordmark inverse />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
            {BRAND.description}
          </p>
          <p className="mt-6 font-display text-lg italic text-ink-foreground/80">{BRAND.tagline}</p>
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 md:col-span-7"
        >
          <div>
            <h3 className="eyebrow mb-4 text-crimson-soft">Explore</h3>
            <ul className="space-y-2.5">
              <li>
                <SectionLink hash={SECTION_IDS.learningPaths} className={linkClass}>
                  Learning paths
                </SectionLink>
              </li>
              <li>
                <SectionLink hash={SECTION_IDS.experience} className={linkClass}>
                  Interactive piano
                </SectionLink>
              </li>
              <li>
                <SectionLink hash={SECTION_IDS.features} className={linkClass}>
                  Learning tools
                </SectionLink>
              </li>
              <li>
                <SectionLink hash={SECTION_IDS.lecturers} className={linkClass}>
                  For lecturers
                </SectionLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-4 text-crimson-soft">THEORYLAB</h3>
            <ul className="space-y-2.5">
              <li>
                <SectionLink hash={SECTION_IDS.about} className={linkClass}>
                  About
                </SectionLink>
              </li>
              <li>
                <Link to="/register" className={linkClass}>
                  Start learning
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className={linkClass}>
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="eyebrow mb-4 text-crimson-soft">Legal</h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5 sm:block sm:space-y-2.5">
              <li>
                <Link to="/privacy" className={linkClass}>
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClass}>
                  Terms of use
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="container-editorial flex flex-col gap-3 border-t border-ink-border pt-6 pb-20 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between md:pb-8">
        <p>© {new Date().getFullYear()} THEORYLAB. All rights reserved.</p>
        <SectionLink
          hash={SECTION_IDS.top}
          className="inline-flex w-fit items-center gap-1.5 text-ink-muted transition-colors hover:text-ink-foreground"
        >
          Back to top <ArrowUp className="size-3.5" aria-hidden />
        </SectionLink>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { EASE } from "@/components/motion/Reveal";
import { NAV_LINKS } from "@/content/site";
import { cn } from "@/lib/utils";
import { SectionLink } from "./SectionLink";
import { Wordmark } from "./Wordmark";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const raised = solid || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-editorial)]",
        raised
          ? "border-b border-border/80 bg-background/88 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "container-editorial flex items-center justify-between transition-[height] duration-500 ease-[var(--ease-editorial)]",
          raised ? "h-16" : "h-20",
        )}
      >
        <SectionLink hash="top" className="rounded-sm text-foreground">
          <Wordmark />
          <span className="sr-only">— home</span>
        </SectionLink>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.hash}>
                <SectionLink
                  hash={link.hash}
                  className="link-draw py-1 text-[0.88rem] text-foreground/75 transition-colors hover:text-foreground"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <Link
            to="/sign-in"
            className="link-draw py-1 text-[0.88rem] text-foreground/75 transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link to="/register">
              Start learning <ArrowRight />
            </Link>
          </Button>
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </Dialog.Trigger>
          <AnimatePresence>
            {open && (
              <Dialog.Portal forceMount>
                <Dialog.Content asChild forceMount aria-describedby={undefined}>
                  <motion.div
                    className="fixed inset-0 z-[60] flex flex-col bg-background lg:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <Dialog.Title className="sr-only">Menu</Dialog.Title>
                    <div className="container-editorial flex h-20 items-center justify-between">
                      <Wordmark />
                      <Dialog.Close
                        className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm"
                        aria-label="Close menu"
                      >
                        <X className="size-5" />
                      </Dialog.Close>
                    </div>
                    <nav
                      aria-label="Mobile"
                      className="container-editorial flex-1 overflow-y-auto pt-6"
                    >
                      <ul className="border-t border-border">
                        {NAV_LINKS.map((link, i) => (
                          <motion.li
                            key={link.hash}
                            className="border-b border-border"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.05 + i * 0.05 }}
                          >
                            <SectionLink
                              hash={link.hash}
                              onClick={() => setOpen(false)}
                              className="flex items-baseline justify-between py-4 font-display text-3xl"
                            >
                              {link.label}
                              <span className="font-sans text-xs text-faint">0{i + 1}</span>
                            </SectionLink>
                          </motion.li>
                        ))}
                      </ul>
                    </nav>
                    <div className="container-editorial grid gap-3 pb-8">
                      <Button asChild size="lg">
                        <Link to="/register" onClick={() => setOpen(false)}>
                          Start learning <ArrowRight />
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link to="/sign-in" onClick={() => setOpen(false)}>
                          Sign in
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </Dialog.Portal>
            )}
          </AnimatePresence>
        </Dialog.Root>
      </div>
    </header>
  );
}

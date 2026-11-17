import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Wordmark } from "@/components/layout/Wordmark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getRoleDisplayName } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

export interface WorkspaceNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface WorkspaceShellProps {
  workspaceLabel: string;
  workspaceSubtitle: string;
  navItems: WorkspaceNavItem[];
  breadcrumbCurrent: string;
  accountName: string;
  accountDetail: string;
  headerAction?: { label: string; to: string };
  children: ReactNode;
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: WorkspaceNavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-[2px] px-3 py-2 text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-background font-medium text-primary shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Shared responsive sidebar + sticky top bar shell for authenticated workspaces. */
export function WorkspaceShell({
  workspaceLabel,
  workspaceSubtitle,
  navItems,
  breadcrumbCurrent,
  accountName,
  accountDetail,
  headerAction,
  children,
}: WorkspaceShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  const resolvedName = session?.displayName || accountName;
  const resolvedDetail = session
    ? `${getRoleDisplayName(session.role)}${session.email ? ` · ${session.email}` : ""}`
    : accountDetail;

  const handleSignOut = async (onNavigate?: () => void) => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    onNavigate?.();
    void navigate({ to: "/sign-in", replace: true });
  };

  const sidebarBody = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-5">
        <Link to="/" onClick={onNavigate} className="inline-flex items-center rounded-sm">
          <Wordmark />
          <span className="sr-only">THEORYLAB Home</span>
        </Link>
        <p className="mt-3 text-xs font-medium text-foreground">{workspaceLabel}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{workspaceSubtitle}</p>
      </div>

      <nav aria-label={`${workspaceLabel} navigation`} className="flex-1 overflow-y-auto px-3 py-5">
        <NavList items={navItems} pathname={pathname} {...(onNavigate ? { onNavigate } : {})} />
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="truncate text-sm font-medium text-foreground">{resolvedName}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{resolvedDetail}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <Link
            to="/"
            onClick={onNavigate}
            className="link-draw inline-flex items-center gap-1 text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            Public site <ArrowUpRight className="size-3" aria-hidden />
          </Link>
          {session ? (
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut(onNavigate)}
              className="link-draw inline-flex items-center gap-1 text-primary whitespace-nowrap disabled:opacity-60"
            >
              <LogOut className="size-3" aria-hidden />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          ) : (
            <Link
              to="/sign-in"
              onClick={onNavigate}
              className="link-draw text-primary whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-paper lg:sticky lg:top-0 lg:block lg:h-screen">
        {sidebarBody()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Consistent single-row top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/92 px-4 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
              <Dialog.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open workspace menu"
                  className="-ml-1.5 inline-flex size-11 shrink-0 items-center justify-center rounded-[2px] text-foreground hover:bg-secondary lg:hidden"
                >
                  <Menu className="size-5" aria-hidden />
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px] lg:hidden" />
                <Dialog.Content
                  aria-describedby={undefined}
                  className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-paper shadow-[var(--shadow-lift)] focus:outline-none lg:hidden"
                >
                  <Dialog.Title className="sr-only">{workspaceLabel} navigation</Dialog.Title>
                  <Dialog.Close
                    aria-label="Close workspace menu"
                    className="absolute top-3.5 right-3 inline-flex size-11 items-center justify-center rounded-[2px] text-foreground hover:bg-secondary"
                  >
                    <X className="size-5" aria-hidden />
                  </Dialog.Close>
                  {sidebarBody(() => setMobileOpen(false))}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2 text-xs md:text-sm"
            >
              <span className="hidden text-muted-foreground sm:inline whitespace-nowrap">
                {workspaceLabel}
              </span>
              <span aria-hidden className="hidden text-border sm:inline">
                /
              </span>
              <span className="truncate font-medium text-foreground">{breadcrumbCurrent}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {headerAction && (
              <Button asChild size="sm">
                <Link to={headerAction.to} className="whitespace-nowrap shrink-0">
                  {headerAction.label}
                </Link>
              </Button>
            )}
          </div>
        </header>

        <main
          id="main"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 pb-24 md:px-8 md:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

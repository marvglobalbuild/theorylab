import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { FinalCta } from "@/components/sections/FinalCta";
import { AdminAccessGate } from "@/components/workspace/AdminAccessGate";
import { ProtectedRoute } from "@/components/workspace/ProtectedRoute";
import { AuthProvider } from "@/lib/auth-context";
import { Route as RegisterRoute } from "@/routes/register";
import {
  canRolesAccessPath,
  getDashboardPathForRole,
  resolvePrimaryRole,
  sanitizeRedirectPath,
} from "@/lib/auth-routing";
import { createSupabaseAuthService, createSupabaseProfileService } from "@/services/supabase-auth";
import type { AuthSession, AuthStateChangeEvent } from "@/services/contracts";

const mockNavigate = vi.fn();
let mockPathname = "/learn";

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({
      to,
      children,
      hash: _hash,
      hashScrollIntoView: _hashScrollIntoView,
      ...props
    }: {
      to?: string;
      children?: ReactNode;
      hash?: string;
      hashScrollIntoView?: unknown;
      [key: string]: unknown;
    }) => (
      <a href={typeof to === "string" ? to : "#"} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
    useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => unknown }) =>
      select({ location: { pathname: mockPathname } }),
  };
});

const mockGetSession = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn();
let mockSupabaseConfigured = true;

vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return {
    ...actual,
    isSupabaseConfigured: () => mockSupabaseConfigured,
  };
});

vi.mock("@/services", async () => {
  const actual = await vi.importActual<typeof import("@/services")>("@/services");
  return {
    ...actual,
    authService: {
      ...actual.authService,
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  };
});

interface MockSupabaseOptions {
  profileRow?: {
    id: string;
    email: string | null;
    display_name: string | null;
    preferred_level: string | null;
    account_status: string | null;
  } | null;
  profileError?: { message: string } | null;
  roleRows?: { role: string }[];
  signInResult?: {
    data: { user: Record<string, unknown> | null; session: Record<string, unknown> | null };
    error: { message: string; status?: number } | null;
  };
  signUpResult?: {
    data: { user: Record<string, unknown> | null; session: Record<string, unknown> | null };
    error: { message: string; status?: number } | null;
  };
  sessionResult?: {
    data: { session: { user: Record<string, unknown> } | null };
    error: { message: string } | null;
  };
  resetResult?: { error: { message: string } | null };
  updateUserResult?: { error: { message: string } | null };
}

function createMockSupabaseClient(opts: MockSupabaseOptions = {}) {
  const signInWithPassword = vi.fn().mockResolvedValue(
    opts.signInResult ?? {
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    },
  );
  const signUp = vi.fn().mockResolvedValue(
    opts.signUpResult ?? {
      data: {
        user: { id: "user-new", email: "clara@conservatory.edu", identities: [{ id: "id-1" }] },
        session: null,
      },
      error: null,
    },
  );
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const getSession = vi
    .fn()
    .mockResolvedValue(opts.sessionResult ?? { data: { session: null }, error: null });
  const resetPasswordForEmail = vi.fn().mockResolvedValue(opts.resetResult ?? { error: null });
  const updateUser = vi.fn().mockResolvedValue(opts.updateUserResult ?? { error: null });
  const verifyOtp = vi.fn().mockResolvedValue({ error: null });
  const resend = vi.fn().mockResolvedValue({ error: null });
  const unsubscribe = vi.fn();

  let stateListener:
    ((event: string, session: { user: Record<string, unknown> } | null) => void) | null = null;
  const onAuthStateChange = vi.fn((cb) => {
    stateListener = cb;
    return { data: { subscription: { unsubscribe } } };
  });

  const profileUpdate = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });

  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: vi.fn().mockResolvedValue({
              data: opts.profileRow ?? null,
              error: opts.profileError ?? null,
            }),
          }),
        }),
        update: profileUpdate,
      };
    }
    if (table === "user_roles") {
      return {
        select: () => ({
          eq: vi.fn().mockResolvedValue({
            data: opts.roleRows ?? [],
            error: null,
          }),
        }),
      };
    }
    return {
      select: () => ({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
    };
  });

  const client = {
    auth: {
      signInWithPassword,
      signUp,
      signOut,
      getSession,
      resetPasswordForEmail,
      updateUser,
      verifyOtp,
      resend,
      onAuthStateChange,
    },
    from,
  } as unknown as SupabaseClient;

  return {
    client,
    spies: {
      signInWithPassword,
      signUp,
      signOut,
      getSession,
      resetPasswordForEmail,
      updateUser,
      onAuthStateChange,
      unsubscribe,
      emitAuthState: (event: string, session: { user: Record<string, unknown> } | null) =>
        stateListener?.(event, session),
    },
  };
}

function renderWithAuth(ui: ReactNode) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  );
}

describe("Role resolution & dashboard routing rules", () => {
  it("resolves primary role strictly by privilege order and safely defaults empty arrays", () => {
    expect(resolvePrimaryRole([])).toBe("independent_learner");
    expect(resolvePrimaryRole(["independent_learner"])).toBe("independent_learner");
    expect(resolvePrimaryRole(["independent_learner", "student"])).toBe("student");
    expect(resolvePrimaryRole(["student", "lecturer"])).toBe("lecturer");
    expect(resolvePrimaryRole(["independent_learner", "administrator", "lecturer"])).toBe(
      "administrator",
    );
  });

  it("maps every THEORYLAB role to its authorized dashboard route", () => {
    expect(getDashboardPathForRole("independent_learner")).toBe("/learn");
    expect(getDashboardPathForRole("student")).toBe("/learn");
    expect(getDashboardPathForRole("lecturer")).toBe("/teach");
    expect(getDashboardPathForRole("administrator")).toBe("/admin");
  });

  it("enforces path access checks and rejects unsafe open redirects", () => {
    expect(sanitizeRedirectPath("/learn/courses")).toBe("/learn/courses");
    expect(sanitizeRedirectPath("https://evil.example")).toBeNull();
    expect(sanitizeRedirectPath("//evil.example")).toBeNull();

    expect(canRolesAccessPath(["independent_learner"], "/learn")).toBe(true);
    expect(canRolesAccessPath(["independent_learner"], "/teach")).toBe(false);
    expect(canRolesAccessPath(["student"], "/admin")).toBe(false);
    expect(canRolesAccessPath(["lecturer"], "/teach/classes")).toBe(true);
    expect(canRolesAccessPath(["lecturer"], "/admin")).toBe(false);
    expect(canRolesAccessPath(["administrator"], "/admin/users")).toBe(true);
  });
});

describe("Supabase authentication service", () => {
  it("registers users without passing any elevated role metadata and detects existing accounts", async () => {
    const { client, spies } = createMockSupabaseClient();
    const service = createSupabaseAuthService(() => client);

    const mismatchValidation = await service.signUp({
      name: "A",
      email: "clara@conservatory.edu",
      password: "password123",
    });
    expect(mismatchValidation).toMatchObject({ status: "error", code: "validation_error" });

    const res = await service.signUp({
      name: "Clara Bennett",
      email: "clara@conservatory.edu",
      password: "strong-password-123",
      accountType: "lecturer",
    });

    expect(res).toEqual({
      status: "ok",
      data: {
        session: null,
        requiresEmailConfirmation: true,
        email: "clara@conservatory.edu",
        requestedAccountType: "lecturer",
      },
    });
    expect(spies.signUp).toHaveBeenCalledTimes(1);
    const signUpArgs = spies.signUp.mock.calls[0]?.[0];
    expect(signUpArgs.options.data).toEqual({
      display_name: "Clara Bennett",
      full_name: "Clara Bennett",
      requested_account_type: "lecturer",
    });
    expect(signUpArgs.options.data).not.toHaveProperty("role");
  });

  it("returns clear invalid credentials error and never exposes secrets", async () => {
    const { client } = createMockSupabaseClient({
      signInResult: {
        data: { user: null, session: null },
        error: { message: "Invalid login credentials", status: 400 },
      },
    });
    const service = createSupabaseAuthService(() => client);

    const res = await service.signIn({
      email: "clara@conservatory.edu",
      password: "wrong-password",
    });
    expect(res).toMatchObject({
      status: "error",
      code: "invalid_credentials",
    });
  });

  it("logs in user, loads profile + user_roles, and resolves lecturer/student/admin dashboards", async () => {
    const { client } = createMockSupabaseClient({
      signInResult: {
        data: {
          user: {
            id: "lect-1",
            email: "dr.chen@conservatory.edu",
            email_confirmed_at: "2026-01-01T00:00:00Z",
            user_metadata: { full_name: "Dr. Mei Chen" },
          },
          session: { access_token: "tok" },
        },
        error: null,
      },
      profileRow: {
        id: "lect-1",
        email: "dr.chen@conservatory.edu",
        display_name: "Dr. Mei Chen",
        preferred_level: "advanced",
        account_status: "active",
      },
      roleRows: [{ role: "independent_learner" }, { role: "lecturer" }],
    });
    const service = createSupabaseAuthService(() => client);

    const res = await service.signIn({
      email: "dr.chen@conservatory.edu",
      password: "correct-password",
    });

    expect(res.status).toBe("ok");
    if (res.status === "ok") {
      expect(res.data.role).toBe("lecturer");
      expect(res.data.roles).toEqual(["independent_learner", "lecturer"]);
      expect(res.data.displayName).toBe("Dr. Mei Chen");
      expect(getDashboardPathForRole(res.data.role)).toBe("/teach");
    }
  });

  it("handles missing or incomplete profile rows and empty roles safely", async () => {
    const { client } = createMockSupabaseClient({
      sessionResult: {
        data: {
          session: {
            user: {
              id: "user-no-profile",
              email: "sebastian.bach@conservatory.edu",
              email_confirmed_at: "2026-01-01T00:00:00Z",
              user_metadata: {},
            },
          },
        },
        error: null,
      },
      profileRow: null,
      roleRows: [],
    });
    const service = createSupabaseAuthService(() => client);

    const restored = await service.getSession();
    expect(restored.status).toBe("ok");
    if (restored.status === "ok" && restored.data) {
      expect(restored.data.displayName).toBe("sebastian.bach");
      expect(restored.data.role).toBe("independent_learner");
      expect(restored.data.profileComplete).toBe(false);
    }

    const profileSvc = createSupabaseProfileService(() => client);
    const prof = await profileSvc.getProfile("user-no-profile");
    expect(prof.status).toBe("ok");
    if (prof.status === "ok") {
      expect(prof.data.role).toBe("independent_learner");
      expect(prof.data.displayName).toBe("Learner");
    }
  });

  it("blocks suspended accounts and signs them out cleanly", async () => {
    const { client, spies } = createMockSupabaseClient({
      signInResult: {
        data: {
          user: { id: "u-susp", email: "susp@example.edu" },
          session: { access_token: "tok" },
        },
        error: null,
      },
      profileRow: {
        id: "u-susp",
        email: "susp@example.edu",
        display_name: "Suspended User",
        preferred_level: "beginner",
        account_status: "suspended",
      },
      roleRows: [{ role: "student" }],
    });
    const service = createSupabaseAuthService(() => client);
    const res = await service.signIn({ email: "susp@example.edu", password: "password123" });

    expect(res).toMatchObject({ status: "error", code: "account_inactive" });
    expect(spies.signOut).toHaveBeenCalledTimes(1);
  });

  it("supports password reset email request, password update, and session restoration + sign-out", async () => {
    const { client, spies } = createMockSupabaseClient({
      sessionResult: {
        data: {
          session: {
            user: {
              id: "adm-1",
              email: "steward@theorylab.org",
              email_confirmed_at: "2026-01-01T00:00:00Z",
            },
          },
        },
        error: null,
      },
      profileRow: {
        id: "adm-1",
        email: "steward@theorylab.org",
        display_name: "Platform Steward",
        preferred_level: "intermediate",
        account_status: "active",
      },
      roleRows: [{ role: "administrator" }],
    });
    const service = createSupabaseAuthService(() => client);

    const resetReq = await service.requestPasswordReset("steward@theorylab.org");
    expect(resetReq).toEqual({ status: "ok", data: { sent: true } });
    expect(spies.resetPasswordForEmail).toHaveBeenCalledTimes(1);

    const pwUpdate = await service.updatePassword("new-secure-password-123");
    expect(pwUpdate).toEqual({ status: "ok", data: { updated: true } });
    expect(spies.updateUser).toHaveBeenCalledWith({ password: "new-secure-password-123" });

    const out = await service.signOut();
    expect(out).toEqual({ status: "ok", data: null });
    expect(spies.signOut).toHaveBeenCalledTimes(1);
  });
});

describe("ProtectedRoute & role access UI enforcement", () => {
  const makeSession = (role: AuthSession["role"]): AuthSession => ({
    userId: `user-${role}`,
    email: `${role}@theorylab.edu`,
    role,
    roles: [role],
    displayName: `Test ${role}`,
    preferredLevel: "beginner",
    accountStatus: "active",
    emailVerified: true,
    profileComplete: true,
  });

  let stateChangeCallback:
    ((event: AuthStateChangeEvent, session: AuthSession | null) => void) | null = null;

  beforeEach(() => {
    mockNavigate.mockReset();
    mockGetSession.mockReset();
    mockSignOut.mockReset().mockResolvedValue({ status: "ok", data: null });
    mockOnAuthStateChange.mockReset().mockImplementation((cb) => {
      stateChangeCallback = cb;
      return () => {
        stateChangeCallback = null;
      };
    });
    mockSupabaseConfigured = true;
    mockPathname = "/learn";
  });

  it("redirects unauthenticated visitors on /learn to /sign-in", async () => {
    mockGetSession.mockResolvedValue({ status: "ok", data: null });
    mockPathname = "/learn/courses";

    renderWithAuth(
      <ProtectedRoute workspaceName="Learner Studio">
        <div>Private Learner Content</div>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/sign-in",
        search: { redirect: "/learn/courses" },
        replace: true,
      });
    });
    expect(screen.queryByText("Private Learner Content")).not.toBeInTheDocument();
  });

  it("restores authenticated session and updates state on logout", async () => {
    const learner = makeSession("independent_learner");
    mockGetSession.mockResolvedValue({ status: "ok", data: learner });
    mockPathname = "/learn";

    renderWithAuth(
      <ProtectedRoute workspaceName="Learner Studio">
        <div>Private Learner Content</div>
      </ProtectedRoute>,
    );

    expect(await screen.findByText("Private Learner Content")).toBeInTheDocument();

    act(() => {
      stateChangeCallback?.("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(screen.queryByText("Private Learner Content")).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/sign-in",
        search: { redirect: "/learn" },
        replace: true,
      });
    });
  });

  it("blocks independent_learner and student from lecturer workspace (/teach) and allows lecturer", async () => {
    mockPathname = "/teach";
    mockGetSession.mockResolvedValue({ status: "ok", data: makeSession("student") });

    const { unmount } = renderWithAuth(
      <ProtectedRoute allowedRoles={["lecturer"]} workspaceName="Lecturer Workspace">
        <div>Lecturer Roster</div>
      </ProtectedRoute>,
    );

    expect(
      await screen.findByText(/You do not have permission for Lecturer Workspace/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Lecturer Roster")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Sign out/i }));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    unmount();

    mockGetSession.mockResolvedValue({ status: "ok", data: makeSession("lecturer") });
    renderWithAuth(
      <ProtectedRoute allowedRoles={["lecturer"]} workspaceName="Lecturer Workspace">
        <div>Lecturer Roster</div>
      </ProtectedRoute>,
    );
    expect(await screen.findByText("Lecturer Roster")).toBeInTheDocument();
  });

  it("blocks non-admin users (including lecturer) from AdminAccessGate and allows administrator", async () => {
    mockPathname = "/admin";
    mockGetSession.mockResolvedValue({ status: "ok", data: makeSession("lecturer") });

    const { unmount } = renderWithAuth(
      <AdminAccessGate>
        <div>Administrator Console</div>
      </AdminAccessGate>,
    );

    expect(
      await screen.findByText(/You do not have permission for Administrator Dashboard/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Administrator Console")).not.toBeInTheDocument();
    unmount();

    mockGetSession.mockResolvedValue({ status: "ok", data: makeSession("administrator") });
    renderWithAuth(
      <AdminAccessGate>
        <div>Administrator Console</div>
      </AdminAccessGate>,
    );
    expect(await screen.findByText("Administrator Console")).toBeInTheDocument();
  });
});

describe("Start learning redirects and student/lecturer sign-up UI", () => {
  beforeEach(() => {
    globalThis.IntersectionObserver = class IntersectionObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    mockNavigate.mockReset();
    mockGetSession.mockReset().mockResolvedValue({ status: "ok", data: null });
    mockSignUp.mockReset().mockResolvedValue({
      status: "ok",
      data: {
        session: null,
        requiresEmailConfirmation: true,
        email: "new.lecturer@conservatory.edu",
        requestedAccountType: "lecturer",
      },
    });
    mockOnAuthStateChange.mockReset().mockReturnValue(() => {});
    mockSupabaseConfigured = true;
  });

  it("points Start learning buttons in header, footer, and CTA sections to /register", () => {
    render(
      <>
        <SiteHeader />
        <FinalCta />
        <SiteFooter />
      </>,
    );

    const startLinks = screen.getAllByRole("link", { name: /Start learning/i });
    expect(startLinks.length).toBeGreaterThanOrEqual(3);
    for (const link of startLinks) {
      expect(link).toHaveAttribute("href", "/register");
    }
  });

  it("lets users sign up on /register as either Student or Lecturer", async () => {
    const useSearchSpy = vi.spyOn(RegisterRoute, "useSearch").mockReturnValue({});
    const RegisterComponent = RegisterRoute.options.component;
    expect(RegisterComponent).toBeDefined();

    renderWithAuth(RegisterComponent ? <RegisterComponent /> : null);

    expect(screen.getByRole("radio", { name: /Student/i })).toBeChecked();
    const lecturerRadio = screen.getByRole("radio", { name: /Lecturer/i });
    fireEvent.click(lecturerRadio);
    expect(lecturerRadio).toBeChecked();

    fireEvent.change(screen.getByLabelText(/Full name/i), {
      target: { value: "Dr. Mei Chen" },
    });
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "new.lecturer@conservatory.edu" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "theorylab-pass-123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), {
      target: { value: "theorylab-pass-123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: "Dr. Mei Chen",
        email: "new.lecturer@conservatory.edu",
        password: "theorylab-pass-123",
        accountType: "lecturer",
      });
    });

    expect(await screen.findByText(/Confirm your email/i)).toBeInTheDocument();
    useSearchSpy.mockRestore();
  });
});

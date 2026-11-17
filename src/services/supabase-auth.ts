import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

import { LEVEL_IDS, type LevelId } from "@/content/learning-paths";
import {
  isValidEmail,
  isValidUserRole,
  MIN_PASSWORD_LENGTH,
  resolvePrimaryRole,
} from "@/lib/auth-routing";
import { getSupabaseConfigStatus, supabase } from "@/lib/supabase";
import type {
  AccountStatus,
  AuthErrorCode,
  AuthService,
  AuthServiceResult,
  AuthSession,
  AuthStateChangeEvent,
  Unavailable,
  UserProfile,
  UserProfileService,
  UserRole,
} from "./contracts";

function supabaseUnavailable(feature: string): Unavailable {
  const config = getSupabaseConfigStatus();
  return {
    status: "unavailable",
    message: `${feature} requires Supabase configuration. ${config.summary}`,
  };
}

function getBrowserOrigin(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.origin;
}

function isValidLevelId(value: unknown): value is LevelId {
  return typeof value === "string" && (LEVEL_IDS as readonly string[]).includes(value);
}

function normalizeAccountStatus(value: unknown): AccountStatus {
  if (value === "suspended" || value === "archived" || value === "active") {
    return value;
  }
  return "active";
}

function deriveFallbackDisplayName(user: User, profileName?: string | null): string {
  const trimmedProfile = typeof profileName === "string" ? profileName.trim() : "";
  if (trimmedProfile) return trimmedProfile;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const metaCandidates = [meta?.["display_name"], meta?.["full_name"], meta?.["name"]];
  for (const candidate of metaCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    const localPart = user.email.split("@")[0]?.trim();
    if (localPart) return localPart;
  }

  return "Learner";
}

function mapSupabaseAuthError(error: AuthError | { message?: string; status?: number }): {
  code: AuthErrorCode;
  message: string;
} {
  const msg = (error.message ?? "").trim();
  const lower = msg.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return {
      code: "invalid_credentials",
      message: "Incorrect email address or password. Please check your details and try again.",
    };
  }
  if (lower.includes("email not confirmed")) {
    return {
      code: "email_not_confirmed",
      message:
        "Your email address has not been confirmed yet. Check your inbox or request a fresh verification link.",
    };
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return {
      code: "email_already_registered",
      message:
        "An account with this email address is already registered. Try signing in or resetting your password.",
    };
  }
  if (
    lower.includes("password") &&
    (lower.includes("least") || lower.includes("weak") || lower.includes("short"))
  ) {
    return {
      code: "weak_password",
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and meet security requirements.`,
    };
  }
  if (lower.includes("same password") || lower.includes("different from the old password")) {
    return {
      code: "validation_error",
      message: "Please choose a new password that differs from your current password.",
    };
  }
  if (lower.includes("rate limit") || lower.includes("too many requests") || error.status === 429) {
    return {
      code: "rate_limited",
      message: "Too many authentication attempts. Please wait a moment before trying again.",
    };
  }
  if (
    lower.includes("auth session missing") ||
    lower.includes("session_not_found") ||
    lower.includes("expired")
  ) {
    return {
      code: "session_missing",
      message:
        "Your authentication or recovery session has expired. Please request a fresh link or sign in again.",
    };
  }

  return {
    code: "auth_error",
    message: msg || "Authentication could not be completed. Please try again.",
  };
}

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  preferred_level: string | null;
  account_status: string | null;
}

interface RoleRow {
  role: string;
}

/**
 * Fetches public.profiles and public.user_roles for an authenticated Supabase Auth user.
 * Safely handles missing/incomplete profile data or empty role rows without throwing or elevating access.
 */
export async function hydrateAuthSession(
  client: SupabaseClient,
  user: User,
): Promise<AuthServiceResult<AuthSession>> {
  const [profileRes, rolesRes] = await Promise.all([
    client
      .from("profiles")
      .select("id, email, display_name, preferred_level, account_status")
      .eq("id", user.id)
      .maybeSingle(),
    client.from("user_roles").select("role").eq("user_id", user.id),
  ]);

  const profileRow = (profileRes.data ?? null) as ProfileRow | null;
  const roleRows = (Array.isArray(rolesRes.data) ? rolesRes.data : []) as RoleRow[];

  const parsedRoles: UserRole[] = [];
  for (const row of roleRows) {
    if (isValidUserRole(row.role) && !parsedRoles.includes(row.role)) {
      parsedRoles.push(row.role);
    }
  }
  if (parsedRoles.length === 0) {
    parsedRoles.push("independent_learner");
  }

  const accountStatus = normalizeAccountStatus(profileRow?.account_status);
  if (accountStatus !== "active") {
    return {
      status: "error",
      code: "account_inactive",
      message:
        "This account is currently suspended or archived and cannot access THEORYLAB workspaces.",
    };
  }

  const primaryRole = resolvePrimaryRole(parsedRoles);
  const displayName = deriveFallbackDisplayName(user, profileRow?.display_name);
  const preferredLevel: LevelId = isValidLevelId(profileRow?.preferred_level)
    ? profileRow.preferred_level
    : "beginner";
  const profileComplete = Boolean(
    profileRow &&
    typeof profileRow.display_name === "string" &&
    profileRow.display_name.trim().length > 0,
  );

  return {
    status: "ok",
    data: {
      userId: user.id,
      email: user.email ?? profileRow?.email ?? "",
      role: primaryRole,
      roles: parsedRoles,
      displayName,
      preferredLevel,
      accountStatus,
      emailVerified: Boolean(user.email_confirmed_at),
      profileComplete,
    },
  };
}

function mapStateEvent(event: string): AuthStateChangeEvent {
  switch (event) {
    case "INITIAL_SESSION":
    case "SIGNED_IN":
    case "SIGNED_OUT":
    case "TOKEN_REFRESHED":
    case "USER_UPDATED":
    case "PASSWORD_RECOVERY":
      return event;
    default:
      return "SIGNED_IN";
  }
}

export function createSupabaseAuthService(
  getClient: () => SupabaseClient | null = () => supabase,
): AuthService {
  return {
    async signIn({ email, password }) {
      const trimmedEmail = email.trim();
      if (!isValidEmail(trimmedEmail)) {
        return {
          status: "error",
          code: "validation_error",
          message: "Enter a valid email address.",
        };
      }
      if (!password) {
        return {
          status: "error",
          code: "validation_error",
          message: "Enter your password.",
        };
      }

      const client = getClient();
      if (!client) return supabaseUnavailable("Signing in");

      const { data, error } = await client.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error || !data.user) {
        const mapped = mapSupabaseAuthError(error ?? { message: "Sign-in failed." });
        return { status: "error", ...mapped };
      }

      const hydrated = await hydrateAuthSession(client, data.user);
      if (hydrated.status === "error" && hydrated.code === "account_inactive") {
        await client.auth.signOut();
      }
      return hydrated;
    },

    async signUp({ email, password, name, accountType }) {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const requestedAccountType = accountType === "lecturer" ? "lecturer" : "student";

      if (trimmedName.length < 2) {
        return {
          status: "error",
          code: "validation_error",
          message: "Enter your full name (at least 2 characters).",
        };
      }
      if (!isValidEmail(trimmedEmail)) {
        return {
          status: "error",
          code: "validation_error",
          message: "Enter a valid email address.",
        };
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return {
          status: "error",
          code: "weak_password",
          message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        };
      }

      const client = getClient();
      if (!client) return supabaseUnavailable("Account registration");

      const origin = getBrowserOrigin();
      const { data, error } = await client.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          // Record display details and requested account type only; DB trigger enforces actual DB role.
          data: {
            display_name: trimmedName,
            full_name: trimmedName,
            requested_account_type: requestedAccountType,
          },
          ...(origin ? { emailRedirectTo: `${origin}/verify-email` } : {}),
        },
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      if (!data.user) {
        return {
          status: "error",
          code: "auth_error",
          message: "Account creation did not return a user record. Please try again.",
        };
      }

      // Supabase returns empty identities when an email already exists and confirmation is enabled.
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          status: "error",
          code: "email_already_registered",
          message:
            "An account with this email address already exists. Sign in or reset your password instead.",
        };
      }

      if (data.session) {
        const hydrated = await hydrateAuthSession(client, data.user);
        if (hydrated.status === "ok") {
          return {
            status: "ok",
            data: {
              session: hydrated.data,
              requiresEmailConfirmation: false,
              email: trimmedEmail,
              requestedAccountType,
            },
          };
        }
        return hydrated;
      }

      return {
        status: "ok",
        data: {
          session: null,
          requiresEmailConfirmation: true,
          email: trimmedEmail,
          requestedAccountType,
        },
      };
    },

    async signOut() {
      const client = getClient();
      if (!client) return supabaseUnavailable("Signing out");

      const { error } = await client.auth.signOut();
      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      return { status: "ok", data: null };
    },

    async getSession() {
      const client = getClient();
      if (!client) return supabaseUnavailable("Session restoration");

      const { data, error } = await client.auth.getSession();
      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      const authUser = data.session?.user;
      if (!authUser) {
        return { status: "ok", data: null };
      }

      const hydrated = await hydrateAuthSession(client, authUser);
      if (hydrated.status === "error" && hydrated.code === "account_inactive") {
        await client.auth.signOut();
      }
      return hydrated;
    },

    async requestPasswordReset(email) {
      const trimmedEmail = email.trim();
      if (!isValidEmail(trimmedEmail)) {
        return {
          status: "error",
          code: "validation_error",
          message: "Enter a valid email address.",
        };
      }

      const client = getClient();
      if (!client) return supabaseUnavailable("Password recovery");

      const origin = getBrowserOrigin();
      const { error } = await client.auth.resetPasswordForEmail(trimmedEmail, {
        ...(origin ? { redirectTo: `${origin}/reset-password` } : {}),
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      return { status: "ok", data: { sent: true } };
    },

    async updatePassword(newPassword) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return {
          status: "error",
          code: "weak_password",
          message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        };
      }

      const client = getClient();
      if (!client) return supabaseUnavailable("Password update");

      const { error } = await client.auth.updateUser({ password: newPassword });
      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      return { status: "ok", data: { updated: true } };
    },

    async verifyEmail(tokenHash) {
      const trimmedToken = tokenHash.trim();
      if (!trimmedToken) {
        return {
          status: "error",
          code: "validation_error",
          message: "Missing verification token.",
        };
      }

      const client = getClient();
      if (!client) return supabaseUnavailable("Email verification");

      const { error } = await client.auth.verifyOtp({
        token_hash: trimmedToken,
        type: "signup",
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      return { status: "ok", data: { verified: true } };
    },

    async resendVerification(email) {
      const trimmedEmail = email.trim();
      if (!isValidEmail(trimmedEmail)) {
        return {
          status: "error",
          code: "validation_error",
          message: "Enter a valid email address.",
        };
      }

      const client = getClient();
      if (!client) return supabaseUnavailable("Verification resend");

      const origin = getBrowserOrigin();
      const { error } = await client.auth.resend({
        type: "signup",
        email: trimmedEmail,
        options: {
          ...(origin ? { emailRedirectTo: `${origin}/verify-email` } : {}),
        },
      });

      if (error) {
        const mapped = mapSupabaseAuthError(error);
        return { status: "error", ...mapped };
      }

      return { status: "ok", data: { sent: true } };
    },

    onAuthStateChange(callback) {
      const client = getClient();
      if (!client) return () => {};

      let active = true;
      const { data } = client.auth.onAuthStateChange((event, supaSession) => {
        const mappedEvent = mapStateEvent(event);

        if (!supaSession?.user) {
          if (active) callback(mappedEvent, null);
          return;
        }

        const authUser = supaSession.user;
        // Defer profile/roles queries slightly so they run outside Supabase's auth lock.
        queueMicrotask(() => {
          void hydrateAuthSession(client, authUser).then((hydrated) => {
            if (!active) return;
            if (hydrated.status === "ok") {
              callback(mappedEvent, hydrated.data);
            } else if (hydrated.status === "error" && hydrated.code === "account_inactive") {
              void client.auth.signOut();
              callback("SIGNED_OUT", null);
            } else {
              callback(mappedEvent, null);
            }
          });
        });
      });

      return () => {
        active = false;
        data.subscription.unsubscribe();
      };
    },
  };
}

export function createSupabaseProfileService(
  getClient: () => SupabaseClient | null = () => supabase,
): UserProfileService {
  return {
    async getProfile(userId) {
      const client = getClient();
      if (!client) return supabaseUnavailable("User profiles");

      const [profileRes, rolesRes] = await Promise.all([
        client
          .from("profiles")
          .select("id, email, display_name, preferred_level, account_status")
          .eq("id", userId)
          .maybeSingle(),
        client.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileRes.error) {
        return {
          status: "error",
          code: "auth_error",
          message: profileRes.error.message,
        };
      }

      const profileRow = (profileRes.data ?? null) as ProfileRow | null;
      const roleRows = (Array.isArray(rolesRes.data) ? rolesRes.data : []) as RoleRow[];

      const roles: UserRole[] = [];
      for (const row of roleRows) {
        if (isValidUserRole(row.role) && !roles.includes(row.role)) {
          roles.push(row.role);
        }
      }
      if (roles.length === 0) roles.push("independent_learner");

      const email = profileRow?.email ?? "";
      const fallbackName =
        profileRow?.display_name?.trim() ||
        (email.includes("@") ? email.split("@")[0] : "") ||
        "Learner";

      const profile: UserProfile = {
        id: profileRow?.id ?? userId,
        displayName: fallbackName,
        email,
        role: resolvePrimaryRole(roles),
        roles,
        level: isValidLevelId(profileRow?.preferred_level)
          ? profileRow.preferred_level
          : "beginner",
        accountStatus: normalizeAccountStatus(profileRow?.account_status),
      };

      return { status: "ok", data: profile };
    },

    async updateProfile(userId, changes) {
      const client = getClient();
      if (!client) return supabaseUnavailable("Profile updates");

      const payload: Record<string, string> = {};
      if (typeof changes.displayName === "string") {
        const trimmed = changes.displayName.trim();
        if (trimmed.length < 1 || trimmed.length > 120) {
          return {
            status: "error",
            code: "validation_error",
            message: "Display name must be between 1 and 120 characters.",
          };
        }
        payload["display_name"] = trimmed;
      }
      if (changes.level && isValidLevelId(changes.level)) {
        payload["preferred_level"] = changes.level;
      }

      const { error } = await client.from("profiles").update(payload).eq("id", userId);
      if (error) {
        return {
          status: "error",
          code: "auth_error",
          message: error.message,
        };
      }

      return this.getProfile(userId);
    },
  };
}

export const supabaseAuthService = createSupabaseAuthService();
export const supabaseProfileService = createSupabaseProfileService();

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PLACEHOLDER_HOST = "your-project-ref.supabase.co";
const PLACEHOLDER_KEY = "your-supabase-publishable-key";

export interface SupabaseEnvInput {
  VITE_SUPABASE_URL?: string | undefined;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string | undefined;
}

export interface SupabaseConfigStatus {
  configured: boolean;
  status: "configured" | "missing" | "invalid";
  hasUrl: boolean;
  hasPublishableKey: boolean;
  urlValid: boolean;
  issues: string[];
  summary: string;
}

export interface SupabaseConnectionResult {
  configured: boolean;
  reachable: boolean;
  status: "connected" | "unconfigured" | "invalid" | "unreachable";
  message: string;
}

function readTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidSupabaseHttpUrl(rawUrl: string): boolean {
  if (!rawUrl || rawUrl.includes(PLACEHOLDER_HOST)) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function isPublishableKeyValid(rawKey: string): { valid: boolean; reason?: string } {
  if (!rawKey) return { valid: false };
  if (rawKey === PLACEHOLDER_KEY || rawKey.startsWith("your-supabase-")) {
    return {
      valid: false,
      reason: "VITE_SUPABASE_PUBLISHABLE_KEY still contains a placeholder value.",
    };
  }
  if (rawKey.startsWith("sb_secret_")) {
    return {
      valid: false,
      reason: "VITE_SUPABASE_PUBLISHABLE_KEY must be a public/publishable key, never a secret key.",
    };
  }
  return { valid: true };
}

function readDefaultEnv(): SupabaseEnvInput {
  return {
    VITE_SUPABASE_URL:
      import.meta.env.VITE_SUPABASE_URL ??
      (typeof process !== "undefined"
        ? (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)
        : undefined),
    VITE_SUPABASE_PUBLISHABLE_KEY:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
      import.meta.env.VITE_SUPABASE_ANON_KEY ??
      (typeof process !== "undefined"
        ? (process.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
           process.env?.VITE_SUPABASE_ANON_KEY ||
           process.env?.SUPABASE_PUBLISHABLE_KEY ||
           process.env?.SUPABASE_ANON_KEY)
        : undefined),
  };
}

/**
 * Inspects whether VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are present
 * and valid without throwing or exposing credential values.
 */
export function getSupabaseConfigStatus(
  env: SupabaseEnvInput = readDefaultEnv(),
): SupabaseConfigStatus {
  const url = readTrimmed(env.VITE_SUPABASE_URL);
  const key = readTrimmed(env.VITE_SUPABASE_PUBLISHABLE_KEY);

  const hasUrl = url.length > 0;
  const hasPublishableKey = key.length > 0;
  const urlValid = isValidSupabaseHttpUrl(url);
  const keyCheck = isPublishableKeyValid(key);

  const issues: string[] = [];
  if (!hasUrl) {
    issues.push("VITE_SUPABASE_URL is missing.");
  } else if (!urlValid) {
    issues.push("VITE_SUPABASE_URL must be a valid Supabase project HTTP/HTTPS URL.");
  }

  if (!hasPublishableKey) {
    issues.push("VITE_SUPABASE_PUBLISHABLE_KEY is missing.");
  } else if (!keyCheck.valid) {
    issues.push(keyCheck.reason ?? "VITE_SUPABASE_PUBLISHABLE_KEY is invalid.");
  }

  if (issues.length === 0) {
    return {
      configured: true,
      status: "configured",
      hasUrl: true,
      hasPublishableKey: true,
      urlValid: true,
      issues: [],
      summary: "Supabase environment variables are present and formatted.",
    };
  }

  const anyPresent = hasUrl || hasPublishableKey;
  return {
    configured: false,
    status:
      anyPresent && (!urlValid || (hasPublishableKey && !keyCheck.valid)) ? "invalid" : "missing",
    hasUrl,
    hasPublishableKey,
    urlValid,
    issues,
    summary: issues.join(" "),
  };
}

/**
 * Creates a reusable Supabase client from environment variables, or returns null when
 * configuration is missing/invalid so unconfigured previews never crash at import time.
 */
export function createSupabaseClientFromEnv(
  env: SupabaseEnvInput = readDefaultEnv(),
): SupabaseClient | null {
  const status = getSupabaseConfigStatus(env);
  if (!status.configured) return null;

  const url = readTrimmed(env.VITE_SUPABASE_URL);
  const key = readTrimmed(env.VITE_SUPABASE_PUBLISHABLE_KEY);
  const isBrowser = typeof window !== "undefined";

  return createClient(url, key, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });
}

/** Shared client instance (null until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured). */
export const supabase: SupabaseClient | null = createSupabaseClientFromEnv();

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const status = getSupabaseConfigStatus();
    throw new Error(`Supabase client is not configured. ${status.summary}`);
  }
  return supabase;
}

/**
 * Verifies configuration presence and, when configured, performs a lightweight
 * Auth health-endpoint check using the public publishable key (requires no DB tables).
 */
export async function checkSupabaseConnection(
  env: SupabaseEnvInput = readDefaultEnv(),
): Promise<SupabaseConnectionResult> {
  const config = getSupabaseConfigStatus(env);
  if (!config.configured) {
    return {
      configured: false,
      reachable: false,
      status: config.status === "invalid" ? "invalid" : "unconfigured",
      message: config.summary,
    };
  }

  const url = readTrimmed(env.VITE_SUPABASE_URL).replace(/\/+$/, "");
  const key = readTrimmed(env.VITE_SUPABASE_PUBLISHABLE_KEY);

  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      headers: { apikey: key },
    });

    if (response.ok) {
      return {
        configured: true,
        reachable: true,
        status: "connected",
        message:
          "Supabase environment variables are configured and the project Auth endpoint responded.",
      };
    }

    return {
      configured: true,
      reachable: false,
      status: "unreachable",
      message: `Supabase project responded with HTTP ${response.status}. Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.`,
    };
  } catch {
    return {
      configured: true,
      reachable: false,
      status: "unreachable",
      message:
        "Supabase environment variables are present, but the health check could not reach the project URL.",
    };
  }
}

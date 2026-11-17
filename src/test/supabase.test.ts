import { describe, expect, it } from "vitest";

import {
  checkSupabaseConnection,
  createSupabaseClientFromEnv,
  getSupabaseConfigStatus,
  supabase,
} from "@/lib/supabase";

describe("Supabase configuration and client helper", () => {
  it("reports missing status and returns null when environment variables are absent", () => {
    const status = getSupabaseConfigStatus({});
    expect(status.configured).toBe(false);
    expect(status.status).toBe("missing");
    expect(status.hasUrl).toBe(false);
    expect(status.hasPublishableKey).toBe(false);
    expect(createSupabaseClientFromEnv({})).toBeNull();
  });

  it("rejects .env.example placeholder values", () => {
    const placeholderEnv = {
      VITE_SUPABASE_URL: "https://your-project-ref.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "your-supabase-publishable-key",
    };
    const status = getSupabaseConfigStatus(placeholderEnv);
    expect(status.configured).toBe(false);
    expect(status.status).toBe("invalid");
    expect(createSupabaseClientFromEnv(placeholderEnv)).toBeNull();
  });

  it("rejects secret keys in frontend configuration", () => {
    const status = getSupabaseConfigStatus({
      VITE_SUPABASE_URL: "https://exampleproject.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_example_do_not_use",
    });
    expect(status.configured).toBe(false);
    expect(status.status).toBe("invalid");
    expect(status.issues.some((i) => i.includes("secret key"))).toBe(true);
  });

  it("rejects malformed Supabase URLs", () => {
    const status = getSupabaseConfigStatus({
      VITE_SUPABASE_URL: "not-a-valid-url",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_valid_placeholder_format",
    });
    expect(status.configured).toBe(false);
    expect(status.status).toBe("invalid");
    expect(status.urlValid).toBe(false);
  });

  it("initializes a reusable Supabase client when valid variables are provided", () => {
    const env = {
      VITE_SUPABASE_URL: "https://abcdefg.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_public_example_key",
    };
    const status = getSupabaseConfigStatus(env);
    expect(status.configured).toBe(true);
    expect(status.status).toBe("configured");
    expect(status.issues).toEqual([]);

    const client = createSupabaseClientFromEnv(env);
    expect(client).not.toBeNull();
    expect(typeof client?.auth.getSession).toBe("function");
    expect(typeof client?.from).toBe("function");
  });

  it("returns unconfigured connection check safely when env is absent", async () => {
    const res = await checkSupabaseConnection({});
    expect(res.configured).toBe(false);
    expect(res.reachable).toBe(false);
    expect(res.status).toBe("unconfigured");
  });

  it("does not throw when importing default supabase client without configured env", () => {
    expect(supabase === null || typeof supabase.from === "function").toBe(true);
  });
});

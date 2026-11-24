import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { createSupabaseClientFromEnv, getSupabaseConfigStatus } from "@/lib/supabase";
import {
  buildUserAudioObjectPath,
  createMusicIntelligenceService,
  getMusicEngineBaseUrl,
  validateAudioFileForUpload,
  validateMusicEngineUrl,
} from "@/services/music-intelligence";

function createMockSupabaseWithToken(accessToken: string | null): SupabaseClient {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: accessToken ? { access_token: accessToken } : null,
        },
        error: null,
      }),
    },
  } as unknown as SupabaseClient;
}

describe("Music Intelligence Engine frontend contract & client", () => {
  it("reports unavailable when VITE_MUSIC_ENGINE_URL is missing or empty", async () => {
    expect(validateMusicEngineUrl(undefined)).toEqual({
      configured: false,
      url: null,
      reason: "missing",
    });
    expect(validateMusicEngineUrl("")).toEqual({
      configured: false,
      url: null,
      reason: "missing",
    });
    expect(validateMusicEngineUrl("   ")).toEqual({
      configured: false,
      url: null,
      reason: "missing",
    });

    expect(getMusicEngineBaseUrl({})).toBeNull();
    expect(getMusicEngineBaseUrl({ VITE_MUSIC_ENGINE_URL: undefined })).toBeNull();
    expect(getMusicEngineBaseUrl({ VITE_MUSIC_ENGINE_URL: "" })).toBeNull();
    expect(getMusicEngineBaseUrl({ VITE_MUSIC_ENGINE_URL: "   " })).toBeNull();

    const fetchSpy = vi.fn();
    const service = createMusicIntelligenceService({
      baseUrl: null,
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });
    expect(service.isConfigured()).toBe(false);

    const healthRes = await service.getHealth();
    expect(healthRes.status).toBe("unavailable");

    const capsRes = await service.getCapabilities();
    expect(capsRes.status).toBe("unavailable");

    const jobRes = await service.createJob({
      job_type: "audio_analysis",
      source_audio: {
        storage_backend: "supabase",
        bucket: "sonora-audio",
        object_path: "user-1/uploads/asset-1/test.wav",
      },
    });
    expect(jobRes.status).toBe("unavailable");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects Supabase project URLs (*.supabase.co) as invalid Music Engine endpoints without issuing network requests", async () => {
    const supabaseUrls = [
      "https://pyxtpaozggpcswdkehwb.supabase.co/",
      "https://pyxtpaozggpcswdkehwb.supabase.co",
      "https://PYXTPAOZGGPCSWDKEHWB.SUPABASE.CO/rest/v1",
      "https://db.pyxtpaozggpcswdkehwb.supabase.co/",
      "https://supabase.co/",
    ];

    for (const candidate of supabaseUrls) {
      expect(validateMusicEngineUrl(candidate)).toEqual({
        configured: false,
        url: null,
        reason: "supabase_url_rejected",
      });
      expect(getMusicEngineBaseUrl({ VITE_MUSIC_ENGINE_URL: candidate })).toBeNull();
    }

    const fetchSpy = vi.fn();
    const service = createMusicIntelligenceService({
      baseUrl: "https://pyxtpaozggpcswdkehwb.supabase.co/",
      getClient: () => createMockSupabaseWithToken("supa-jwt-token"),
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    expect(service.isConfigured()).toBe(false);
    expect((await service.getHealth()).status).toBe("unavailable");
    expect((await service.getCapabilities()).status).toBe("unavailable");
    expect((await service.getInstruments()).status).toBe("unavailable");
    expect((await service.listJobs()).status).toBe("unavailable");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("preserves valid independent HTTPS Music Engine URLs and leaves Supabase auth config unaffected", async () => {
    const validEngineUrl = "https://music-engine.sonora-audio.example.com/";
    expect(validateMusicEngineUrl(validEngineUrl)).toEqual({
      configured: true,
      url: "https://music-engine.sonora-audio.example.com",
      reason: null,
    });
    expect(getMusicEngineBaseUrl({ VITE_MUSIC_ENGINE_URL: validEngineUrl })).toBe(
      "https://music-engine.sonora-audio.example.com",
    );

    const fetchSpy = vi.fn(
      async () =>
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const service = createMusicIntelligenceService({
      baseUrl: validEngineUrl,
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });

    expect(service.isConfigured()).toBe(true);
    const healthRes = await service.getHealth();
    expect(healthRes.status).toBe("ok");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://music-engine.sonora-audio.example.com/health",
      expect.objectContaining({ method: "GET" }),
    );

    // Supabase authentication configuration remains unaffected by rejecting *.supabase.co for the Music Engine
    const supaEnv = {
      VITE_SUPABASE_URL: "https://pyxtpaozggpcswdkehwb.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_public_example_key",
    };
    expect(getSupabaseConfigStatus(supaEnv).configured).toBe(true);
    expect(createSupabaseClientFromEnv(supaEnv)).not.toBeNull();
    expect(getMusicEngineBaseUrl({ VITE_MUSIC_ENGINE_URL: supaEnv.VITE_SUPABASE_URL })).toBeNull();
  });

  it("validates audio upload files and builds user-isolated storage paths", () => {
    const valid = validateAudioFileForUpload({
      name: "vocal_take.wav",
      size: 1024 * 64,
      type: "audio/wav",
    });
    expect(valid.valid).toBe(true);
    expect(valid.sanitizedFilename).toBe("vocal_take.wav");

    const empty = validateAudioFileForUpload({
      name: "empty.wav",
      size: 0,
      type: "audio/wav",
    });
    expect(empty.valid).toBe(false);
    expect(empty.code).toBe("EMPTY_AUDIO_FILE");

    const badExt = validateAudioFileForUpload({
      name: "malware.exe",
      size: 2048,
      type: "application/octet-stream",
    });
    expect(badExt.valid).toBe(false);

    const path = buildUserAudioObjectPath("user-uuid-123", "asset-456", "../My Song (1).mp3");
    expect(path).toBe("user-uuid-123/uploads/asset-456/My_Song__1_.mp3");
  });

  it("requires an active Supabase session token for authenticated job endpoints", async () => {
    const service = createMusicIntelligenceService({
      baseUrl: "http://127.0.0.1:8000",
      getClient: () => createMockSupabaseWithToken(null),
      fetchImpl: vi.fn(),
    });

    const res = await service.createJob({
      job_type: "audio_analysis",
      source_audio: {
        storage_backend: "supabase",
        bucket: "sonora-audio",
        object_path: "user-1/uploads/a/song.wav",
      },
    });
    expect(res.status).toBe("error");
    if (res.status === "error") {
      expect(res.code).toBe("SESSION_MISSING");
      expect(res.httpStatus).toBe(401);
    }
  });

  it("calls health, capabilities, createJob, getJob, and cancelJob with Bearer auth and parses structured errors", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const authHeader = (init?.headers as Record<string, string> | undefined)?.["Authorization"];

      if (url.endsWith("/health")) {
        return new Response(
          JSON.stringify({
            status: "ok",
            service: "sonora-music-engine",
            version: "0.1.0",
            environment: "test",
            uptime_seconds: 1.2,
            timestamp: "2026-11-19T00:00:00Z",
            storage_backend: "supabase",
            job_repository_backend: "memory",
            active_jobs: 0,
            dependencies: {
              ffmpeg_available: true,
              ffprobe_available: true,
              supabase_auth_configured: true,
              supabase_storage_configured: true,
              supabase_db_configured: false,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/v1/jobs") && init?.method === "POST") {
        expect(authHeader).toBe("Bearer supa-jwt-token");
        return new Response(
          JSON.stringify({
            job_id: "job-abc",
            user_id: "user-1",
            job_type: "audio_analysis",
            status: "queued",
            progress_percent: 0,
            stage: "queued",
            source_audio: {
              storage_backend: "supabase",
              bucket: "sonora-audio",
              object_path: "user-1/uploads/a/song.wav",
            },
            trim_window: null,
            parameters: {},
            studio_context: null,
            audio_metadata: null,
            artifacts: [],
            result: null,
            error: null,
            created_at: "2026-11-19T00:00:00Z",
            updated_at: "2026-11-19T00:00:00Z",
            started_at: null,
            completed_at: null,
            cancelled_at: null,
          }),
          { status: 202, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/v1/jobs/forbidden-id") && init?.method === "GET") {
        return new Response(
          JSON.stringify({
            error: {
              code: "JOB_ACCESS_DENIED",
              message: "You do not have permission to access another user's processing job.",
              retryable: false,
              details: {},
            },
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }

      if (url.endsWith("/api/v1/jobs/job-abc/cancel") && init?.method === "POST") {
        expect(authHeader).toBe("Bearer supa-jwt-token");
        return new Response(
          JSON.stringify({
            job_id: "job-abc",
            status: "cancelled",
            cancelled: true,
            message: "User cancelled",
            job: {
              job_id: "job-abc",
              user_id: "user-1",
              job_type: "audio_analysis",
              status: "cancelled",
              progress_percent: 0,
              stage: "cancelled",
              source_audio: {
                storage_backend: "supabase",
                bucket: "sonora-audio",
                object_path: "user-1/uploads/a/song.wav",
              },
              trim_window: null,
              parameters: {},
              studio_context: null,
              audio_metadata: null,
              artifacts: [],
              result: null,
              error: null,
              created_at: "2026-11-19T00:00:00Z",
              updated_at: "2026-11-19T00:00:01Z",
              started_at: null,
              completed_at: null,
              cancelled_at: "2026-11-19T00:00:01Z",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response("Not Found", { status: 404 });
    });

    const service = createMusicIntelligenceService({
      baseUrl: "http://127.0.0.1:8000",
      getClient: () => createMockSupabaseWithToken("supa-jwt-token"),
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const health = await service.getHealth();
    expect(health.status).toBe("ok");

    const created = await service.createJob({
      job_type: "audio_analysis",
      source_audio: {
        storage_backend: "supabase",
        bucket: "sonora-audio",
        object_path: "user-1/uploads/a/song.wav",
      },
    });
    expect(created.status).toBe("ok");
    if (created.status === "ok") {
      expect(created.data.job_id).toBe("job-abc");
      expect(created.data.status).toBe("queued");
    }

    const denied = await service.getJob("forbidden-id");
    expect(denied.status).toBe("error");
    if (denied.status === "error") {
      expect(denied.code).toBe("JOB_ACCESS_DENIED");
      expect(denied.httpStatus).toBe(403);
    }

    const cancelled = await service.cancelJob("job-abc", "User cancelled");
    expect(cancelled.status).toBe("ok");
    if (cancelled.status === "ok") {
      expect(cancelled.data.cancelled).toBe(true);
      expect(cancelled.data.status).toBe("cancelled");
    }
  });
});

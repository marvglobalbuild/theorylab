import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import type {
  ArtifactSignedUrlResponse,
  AudioUploadOptions,
  AudioUploadResponse,
  CancelMusicJobResponse,
  CreateMusicJobRequest,
  DownloadedArtifactPayload,
  InstrumentDiagnostics,
  MusicEngineCapabilities,
  MusicEngineHealth,
  MusicIntelligenceResult,
  MusicIntelligenceService,
  MusicProcessingJob,
} from "./contracts";

export const DEFAULT_AUDIO_BUCKET = "sonora-audio";
export const DEFAULT_MAX_AUDIO_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export const SUPPORTED_AUDIO_EXTENSIONS = [
  ".wav",
  ".wave",
  ".mp3",
  ".flac",
  ".m4a",
  ".aac",
  ".ogg",
  ".oga",
  ".webm",
] as const;

export const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/vnd.wave",
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/aacp",
  "audio/ogg",
  "application/ogg",
  "audio/webm",
] as const;

export interface MusicEngineEnvInput {
  VITE_MUSIC_ENGINE_URL?: string | undefined;
}

export interface AudioFilePrevalidationResult {
  valid: boolean;
  code?: string;
  message?: string;
  sanitizedFilename?: string;
}

export function getMusicEngineBaseUrl(env?: MusicEngineEnvInput): string | null {
  const raw = env ? env.VITE_MUSIC_ENGINE_URL : import.meta.env["VITE_MUSIC_ENGINE_URL"];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function sanitizeAudioFilename(filename: string): string {
  const base = filename.trim().split(/[/\\]/).pop() ?? "recording.wav";
  const cleaned = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "");
  return cleaned || "recording.wav";
}

export function buildUserAudioObjectPath(
  userId: string,
  assetId: string,
  filename: string,
): string {
  const cleanUserId = userId.trim();
  const cleanAssetId = assetId.trim().replace(/[^A-Za-z0-9_-]/g, "");
  if (!cleanUserId || !cleanAssetId) {
    throw new Error("Both userId and assetId are required to build a private audio storage path.");
  }
  return `${cleanUserId}/uploads/${cleanAssetId}/${sanitizeAudioFilename(filename)}`;
}

export function validateAudioFileForUpload(
  file: Pick<File, "name" | "size" | "type">,
  maxSizeBytes: number = DEFAULT_MAX_AUDIO_FILE_SIZE_BYTES,
  allowedFormats?: readonly string[],
): AudioFilePrevalidationResult {
  if (!file || file.size <= 0) {
    return {
      valid: false,
      code: "EMPTY_AUDIO_FILE",
      message: "Selected audio file is empty (0 bytes).",
    };
  }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      code: "AUDIO_FILE_TOO_LARGE",
      message: `Audio file exceeds the maximum allowed size (${Math.round(maxSizeBytes / (1024 * 1024))} MB).`,
    };
  }

  const sanitized = sanitizeAudioFilename(file.name);
  const dotIdx = sanitized.lastIndexOf(".");
  const ext = dotIdx >= 0 ? sanitized.slice(dotIdx).toLowerCase() : "";

  const normalizedMime = (file.type || "").split(";")[0]?.trim().toLowerCase() ?? "";
  if (normalizedMime.startsWith("video/")) {
    return {
      valid: false,
      code: "VIDEO_NOT_SUPPORTED",
      message:
        "Video uploads are not supported. Upload an audio recording (WAV, MP3, FLAC, M4A, AAC, OGG, or WebM audio).",
    };
  }

  const allowedExtList: string[] = allowedFormats?.length
    ? allowedFormats.flatMap((fmt) => {
        const lower = fmt.toLowerCase();
        if (lower === "wav") return [".wav", ".wave"];
        if (lower === "ogg") return [".ogg", ".oga"];
        return [`.${lower}`];
      })
    : [...SUPPORTED_AUDIO_EXTENSIONS];

  const extAllowed = allowedExtList.includes(ext);
  const mimeAllowed =
    normalizedMime.length === 0 ||
    (SUPPORTED_AUDIO_MIME_TYPES as readonly string[]).includes(normalizedMime);

  const labelList = allowedFormats?.length
    ? allowedFormats.map((f) => f.toUpperCase()).join(", ")
    : "WAV, MP3, FLAC, M4A, AAC, OGG, or WebM";

  if (!extAllowed && !mimeAllowed) {
    return {
      valid: false,
      code: "UNSUPPORTED_AUDIO_FORMAT",
      message: `Unsupported audio file type. Please choose ${labelList}.`,
    };
  }
  if (ext && !extAllowed) {
    return {
      valid: false,
      code: "UNSUPPORTED_AUDIO_EXTENSION",
      message: `Unsupported file extension '${ext}'. Please choose ${labelList}.`,
    };
  }
  if (normalizedMime && !mimeAllowed) {
    return {
      valid: false,
      code: "UNSUPPORTED_AUDIO_MIME",
      message: `Unsupported audio MIME type '${normalizedMime}'.`,
    };
  }

  return {
    valid: true,
    sanitizedFilename: sanitized,
  };
}

interface BackendErrorEnvelope {
  error?: {
    code?: unknown;
    message?: unknown;
    retryable?: unknown;
    details?: unknown;
  };
}

async function parseErrorResponse(
  response: Response,
): Promise<Extract<MusicIntelligenceResult<never>, { status: "error" }>> {
  let code = `HTTP_${response.status}`;
  let message = `Music Intelligence Engine request failed with HTTP ${response.status}.`;
  let retryable = response.status >= 500 || response.status === 429;
  let details: Record<string, unknown> | undefined;

  try {
    const body = (await response.json()) as BackendErrorEnvelope;
    if (body?.error && typeof body.error === "object") {
      if (typeof body.error.code === "string" && body.error.code.trim()) {
        code = body.error.code;
      }
      if (typeof body.error.message === "string" && body.error.message.trim()) {
        message = body.error.message;
      }
      if (typeof body.error.retryable === "boolean") {
        retryable = body.error.retryable;
      }
      if (body.error.details && typeof body.error.details === "object") {
        details = body.error.details as Record<string, unknown>;
      }
    }
  } catch {
    // Non-JSON error response; keep HTTP status fallback message
  }

  return {
    status: "error",
    code,
    message,
    httpStatus: response.status,
    retryable,
    ...(details ? { details } : {}),
  };
}

function extractFilenameFromHeader(disposition: string | null, fallbackPath: string): string {
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1].replace(/"/g, "").trim());
      } catch {
        return match[1].replace(/"/g, "").trim();
      }
    }
  }
  const parts = fallbackPath.split("/");
  return parts[parts.length - 1] || "artifact.bin";
}

export interface MusicIntelligenceClientOptions {
  baseUrl?: string | null;
  getClient?: () => SupabaseClient | null;
  fetchImpl?: typeof fetch;
}

export function createMusicIntelligenceService(
  options: MusicIntelligenceClientOptions = {},
): MusicIntelligenceService {
  const resolveBaseUrl = () =>
    options.baseUrl !== undefined ? options.baseUrl : getMusicEngineBaseUrl();
  const getClient = options.getClient ?? (() => supabase);
  const fetchFn = options.fetchImpl ?? globalThis.fetch;

  async function resolveAccessToken(): Promise<
    { ok: true; token: string } | MusicIntelligenceResult<never>
  > {
    const client = getClient();
    if (!client) {
      return {
        status: "unavailable",
        message:
          "Supabase authentication is not configured for Music Intelligence Engine requests.",
      };
    }

    const { data, error } = await client.auth.getSession();
    if (error || !data.session?.access_token) {
      return {
        status: "error",
        code: "SESSION_MISSING",
        message: "Sign in to submit or inspect private audio processing jobs.",
        httpStatus: 401,
        retryable: false,
      };
    }

    return { ok: true, token: data.session.access_token };
  }

  async function requestJson<T>(
    path: string,
    init: RequestInit & { requireAuth: boolean },
  ): Promise<MusicIntelligenceResult<T>> {
    const baseUrl = resolveBaseUrl();
    if (!baseUrl) {
      return {
        status: "unavailable",
        message:
          "Music Intelligence Engine endpoint (VITE_MUSIC_ENGINE_URL) is not configured yet.",
      };
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
    if (init.body !== undefined && !isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (init.requireAuth) {
      const auth = await resolveAccessToken();
      if (!("ok" in auth)) {
        return auth;
      }
      headers["Authorization"] = `Bearer ${auth.token}`;
    }

    try {
      const response = await fetchFn(`${baseUrl}${path}`, {
        ...init,
        headers: {
          ...headers,
          ...(init.headers as Record<string, string> | undefined),
        },
      });

      if (!response.ok) {
        return await parseErrorResponse(response);
      }

      const data = (await response.json()) as T;
      return { status: "ok", data };
    } catch (err) {
      return {
        status: "error",
        code: "NETWORK_ERROR",
        message:
          err instanceof Error
            ? `Unable to reach Music Intelligence Engine: ${err.message}`
            : "Unable to reach Music Intelligence Engine.",
        retryable: true,
      };
    }
  }

  return {
    isConfigured() {
      return Boolean(resolveBaseUrl());
    },

    getHealth() {
      return requestJson<MusicEngineHealth>("/health", {
        method: "GET",
        requireAuth: false,
      });
    },

    getCapabilities() {
      return requestJson<MusicEngineCapabilities>("/api/v1/capabilities", {
        method: "GET",
        requireAuth: false,
      });
    },

    getInstruments() {
      return requestJson<InstrumentDiagnostics>("/api/v1/instruments", {
        method: "GET",
        requireAuth: false,
      });
    },

    async uploadAudio(file: File, uploadOpts?: AudioUploadOptions) {
      const baseUrl = resolveBaseUrl();
      if (!baseUrl) {
        return {
          status: "unavailable",
          message:
            "Music Intelligence Engine endpoint (VITE_MUSIC_ENGINE_URL) is not configured yet.",
        };
      }

      const auth = await resolveAccessToken();
      if (!("ok" in auth)) {
        return auth;
      }

      const formData = new FormData();
      formData.append("file", file, sanitizeAudioFilename(file.name));

      // Use XMLHttpRequest when a progress listener is provided and custom fetchImpl isn't injected
      if (uploadOpts?.onProgress && !options.fetchImpl && typeof XMLHttpRequest !== "undefined") {
        return new Promise<MusicIntelligenceResult<AudioUploadResponse>>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${baseUrl}/api/v1/audio/upload`);
          xhr.setRequestHeader("Authorization", `Bearer ${auth.token}`);
          xhr.setRequestHeader("Accept", "application/json");

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && evt.total > 0) {
              uploadOpts.onProgress?.(Math.min(99, Math.round((evt.loaded / evt.total) * 100)));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                uploadOpts.onProgress?.(100);
                const parsed = JSON.parse(xhr.responseText) as AudioUploadResponse;
                resolve({ status: "ok", data: parsed });
              } catch {
                resolve({
                  status: "error",
                  code: "INVALID_RESPONSE",
                  message:
                    "Received an unreadable upload response from the Music Intelligence Engine.",
                  httpStatus: xhr.status,
                  retryable: true,
                });
              }
              return;
            }

            let code = `HTTP_${xhr.status}`;
            let message = `Audio upload failed with HTTP ${xhr.status}.`;
            let retryable = xhr.status >= 500 || xhr.status === 429;
            let details: Record<string, unknown> | undefined;
            try {
              const body = JSON.parse(xhr.responseText) as BackendErrorEnvelope;
              if (body?.error && typeof body.error === "object") {
                if (typeof body.error.code === "string") code = body.error.code;
                if (typeof body.error.message === "string") message = body.error.message;
                if (typeof body.error.retryable === "boolean") retryable = body.error.retryable;
                if (body.error.details && typeof body.error.details === "object") {
                  details = body.error.details as Record<string, unknown>;
                }
              }
            } catch {
              // Ignore parse failure
            }
            resolve({
              status: "error",
              code,
              message,
              httpStatus: xhr.status,
              retryable,
              ...(details ? { details } : {}),
            });
          };

          xhr.onerror = () => {
            resolve({
              status: "error",
              code: "NETWORK_ERROR",
              message: "Network interruption while uploading audio to Music Intelligence Engine.",
              retryable: true,
            });
          };

          xhr.send(formData);
        });
      }

      uploadOpts?.onProgress?.(20);
      const res = await requestJson<AudioUploadResponse>("/api/v1/audio/upload", {
        method: "POST",
        body: formData,
        requireAuth: true,
      });
      if (res.status === "ok") {
        uploadOpts?.onProgress?.(100);
      }
      return res;
    },

    createJob(request: CreateMusicJobRequest) {
      return requestJson<MusicProcessingJob>("/api/v1/jobs", {
        method: "POST",
        body: JSON.stringify(request),
        requireAuth: true,
      });
    },

    listJobs(limit: number = 25) {
      const clamped = Math.max(1, Math.min(100, Math.round(limit)));
      return requestJson<MusicProcessingJob[]>(`/api/v1/jobs?limit=${clamped}`, {
        method: "GET",
        requireAuth: true,
      });
    },

    getJob(jobId: string) {
      const trimmedId = jobId.trim();
      if (!trimmedId) {
        return Promise.resolve({
          status: "error",
          code: "VALIDATION_ERROR",
          message: "A valid job_id is required.",
          retryable: false,
        });
      }
      return requestJson<MusicProcessingJob>(`/api/v1/jobs/${encodeURIComponent(trimmedId)}`, {
        method: "GET",
        requireAuth: true,
      });
    },

    cancelJob(jobId: string, reason?: string) {
      const trimmedId = jobId.trim();
      if (!trimmedId) {
        return Promise.resolve({
          status: "error",
          code: "VALIDATION_ERROR",
          message: "A valid job_id is required.",
          retryable: false,
        });
      }
      return requestJson<CancelMusicJobResponse>(
        `/api/v1/jobs/${encodeURIComponent(trimmedId)}/cancel`,
        {
          method: "POST",
          body: JSON.stringify(reason ? { reason } : {}),
          requireAuth: true,
        },
      );
    },

    getArtifactSignedUrl(jobId: string, objectPath: string, expiresInSeconds: number = 300) {
      const trimmedId = jobId.trim();
      const trimmedPath = objectPath.trim();
      if (!trimmedId || !trimmedPath) {
        return Promise.resolve({
          status: "error",
          code: "VALIDATION_ERROR",
          message: "Both job_id and object_path are required.",
          retryable: false,
        });
      }
      return requestJson<ArtifactSignedUrlResponse>(
        `/api/v1/jobs/${encodeURIComponent(trimmedId)}/artifacts/signed-url`,
        {
          method: "POST",
          body: JSON.stringify({
            object_path: trimmedPath,
            expires_in_seconds: Math.max(60, Math.min(900, Math.round(expiresInSeconds))),
          }),
          requireAuth: true,
        },
      );
    },

    async downloadArtifactBlob(jobId: string, objectPath: string) {
      const baseUrl = resolveBaseUrl();
      if (!baseUrl) {
        return {
          status: "unavailable",
          message:
            "Music Intelligence Engine endpoint (VITE_MUSIC_ENGINE_URL) is not configured yet.",
        };
      }
      const trimmedId = jobId.trim();
      const trimmedPath = objectPath.trim();
      if (!trimmedId || !trimmedPath) {
        return {
          status: "error",
          code: "VALIDATION_ERROR",
          message: "Both job_id and object_path are required.",
          retryable: false,
        };
      }

      const auth = await resolveAccessToken();
      if (!("ok" in auth)) {
        return auth;
      }

      const url = `${baseUrl}/api/v1/jobs/${encodeURIComponent(trimmedId)}/artifacts/download?object_path=${encodeURIComponent(trimmedPath)}`;
      try {
        const response = await fetchFn(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          return await parseErrorResponse(response);
        }

        const blob = await response.blob();
        const mimeType =
          response.headers.get("Content-Type") || blob.type || "application/octet-stream";
        const filename = extractFilenameFromHeader(
          response.headers.get("Content-Disposition"),
          trimmedPath,
        );
        return {
          status: "ok",
          data: {
            blob,
            filename,
            mimeType,
            objectPath: trimmedPath,
          },
        };
      } catch (err) {
        return {
          status: "error",
          code: "NETWORK_ERROR",
          message:
            err instanceof Error
              ? `Unable to download private artifact: ${err.message}`
              : "Unable to download private artifact.",
          retryable: true,
        };
      }
    },
  };
}

export const musicIntelligenceService = createMusicIntelligenceService();

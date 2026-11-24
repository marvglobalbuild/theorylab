import { AlertCircle, History, Info, Plus, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FilterTabs, PageHeader, PreviewNotice } from "@/components/workspace/WorkspacePrimitives";
import { musicIntelligenceService } from "@/services";
import type {
  AccompanimentJobResult,
  ArrangementConfig,
  AudioAnalysisResult,
  AudioSourceRef,
  InstrumentDiagnostics,
  MixAndExportConfig,
  MusicEngineCapabilities,
  MusicIntelligenceService,
  MusicProcessingJob,
  VerifiedAudioMetadata,
} from "@/services/contracts";
import { AnalysisReviewStage } from "./AnalysisReviewStage";
import { ArrangementConfigStage } from "./ArrangementConfigStage";
import { AudioPreviewDeck } from "./AudioPreviewDeck";
import { ExportsDownloadsPanel } from "./ExportsDownloadsPanel";
import { JobStatusPanel } from "./JobStatusPanel";
import { MixingMasteringStage } from "./MixingMasteringStage";
import { ProjectHistoryPanel } from "./ProjectHistoryPanel";
import { ProjectUploadStage } from "./ProjectUploadStage";
import { StudioErrorBoundary } from "./StudioErrorBoundary";
import {
  DEFAULT_ARRANGEMENT_CONFIG,
  DEFAULT_MIX_CONFIG,
  STUDIO_CONTEXT_ID,
  buildAnalysisResultFromAccompaniment,
  extractProjectName,
  generateIdempotencyKey,
  isAccompanimentJobResult,
  isAnalysisJobResult,
} from "./studio-types";

export interface AccompanimentStudioProps {
  /** Optional injectable service for automated testing; defaults to the live musicIntelligenceService. */
  service?: MusicIntelligenceService;
  /** Polling interval in milliseconds while an async job is queued or processing. */
  pollIntervalMs?: number;
  /** Maximum consecutive transient polling errors before stopping automatically. */
  maxPollRetries?: number;
}

type StudioTab = "workspace" | "history";

export function AccompanimentStudio({
  service = musicIntelligenceService,
  pollIntervalMs = 1500,
  maxPollRetries = 4,
}: AccompanimentStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>("workspace");

  // Capability-driven backend state
  const [capabilities, setCapabilities] = useState<MusicEngineCapabilities | null>(null);
  const [instrumentsDiag, setInstrumentsDiag] = useState<InstrumentDiagnostics | null>(null);
  const [backendStatusError, setBackendStatusError] = useState<string | null>(null);
  const [engineUnavailableMsg, setEngineUnavailableMsg] = useState<string | null>(null);

  // Stage A: Project & Vocal input
  const [projectName, setProjectName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedSource, setUploadedSource] = useState<AudioSourceRef | null>(null);
  const [verifiedMetadata, setVerifiedMetadata] = useState<VerifiedAudioMetadata | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Stage B: Analysis state
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null);

  // Stage C & F: Configuration state
  const [arrangementConfig, setArrangementConfig] = useState<ArrangementConfig>(
    DEFAULT_ARRANGEMENT_CONFIG,
  );
  const [mixConfig, setMixConfig] = useState<MixAndExportConfig>(DEFAULT_MIX_CONFIG);

  // Stage D, E, G: Active Job & Result state
  const [activeJob, setActiveJob] = useState<MusicProcessingJob | null>(null);
  const [accompanimentJob, setAccompanimentJob] = useState<MusicProcessingJob | null>(null);
  const [accompanimentResult, setAccompanimentResult] = useState<AccompanimentJobResult | null>(
    null,
  );
  const [submittingJob, setSubmittingJob] = useState(false);
  const [cancellingJob, setCancellingJob] = useState(false);
  const [retryingJob, setRetryingJob] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);

  // Project History state
  const [historyJobs, setHistoryJobs] = useState<MusicProcessingJob[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const pollTimerRef = useRef<number | null>(null);
  const submitLockRef = useRef(false);
  const stopStage1AudioRef = useRef<(() => void) | null>(null);
  const stopStage5AudioRef = useRef<(() => void) | null>(null);

  const stopAllStudioPlayback = useCallback(() => {
    stopStage1AudioRef.current?.();
    stopStage5AudioRef.current?.();
  }, []);

  const handleRegisterStage1Stop = useCallback((stopFn: () => void) => {
    stopStage1AudioRef.current = stopFn;
  }, []);

  const handleRegisterStage5Stop = useCallback((stopFn: () => void) => {
    stopStage5AudioRef.current = stopFn;
  }, []);

  const handleStage1BeforePlay = useCallback(() => {
    stopStage5AudioRef.current?.();
  }, []);

  const handleStage5BeforePlay = useCallback(() => {
    stopStage1AudioRef.current?.();
  }, []);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPollTimer();
      stopAllStudioPlayback();
    };
  }, [clearPollTimer, stopAllStudioPlayback]);

  const loadHistory = useCallback(async () => {
    if (!service.isConfigured()) return;
    setHistoryLoading(true);
    setHistoryError(null);
    const res = await service.listJobs(30);
    setHistoryLoading(false);
    if (res.status === "ok") {
      setHistoryJobs(res.data);
    } else if (res.status === "error") {
      setHistoryError(
        res.httpStatus === 401
          ? "Session expired. Please sign in again to inspect your saved studio projects."
          : res.message,
      );
    }
  }, [service]);

  // Initial capabilities + instruments + history fetch
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!service.isConfigured()) {
        setEngineUnavailableMsg(
          "Music Intelligence Engine endpoint (VITE_MUSIC_ENGINE_URL) is not configured in this environment. Configure the backend URL to enable live vocal analysis, accompaniment generation, and mastering.",
        );
        return;
      }

      const [capsRes, instRes] = await Promise.all([
        service.getCapabilities(),
        service.getInstruments(),
      ]);
      if (cancelled) return;

      if (capsRes.status === "ok") {
        setCapabilities(capsRes.data);
        setEngineUnavailableMsg(null);
      } else if (capsRes.status === "unavailable") {
        setEngineUnavailableMsg(capsRes.message);
      } else {
        setBackendStatusError(capsRes.message);
      }

      if (instRes.status === "ok") {
        setInstrumentsDiag(instRes.data);
      }

      void loadHistory();
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [service, loadHistory]);

  const applyJobSnapshot = useCallback((job: MusicProcessingJob) => {
    setActiveJob(job);
    if (job.audio_metadata) {
      setVerifiedMetadata(job.audio_metadata);
    }

    if (job.status === "completed" && job.result) {
      if (job.job_type === "audio_analysis" && isAnalysisJobResult(job.result)) {
        setAnalysisResult(job.result);
      } else if (
        (job.job_type === "accompaniment_generation" || job.job_type === "audio_rendering") &&
        isAccompanimentJobResult(job.result)
      ) {
        setAccompanimentJob(job);
        setAccompanimentResult(job.result);
      }
    }
  }, []);

  const activeJobId = activeJob?.job_id ?? null;
  const isJobRunning = activeJob?.status === "queued" || activeJob?.status === "processing";

  // Poll active queued / processing job until terminal state with bounded transient retries
  useEffect(() => {
    clearPollTimer();
    if (!activeJobId || !isJobRunning) return;

    let cancelled = false;
    let inFlight = false;
    let consecutiveErrors = 0;
    let hadTransientError = false;

    const schedulePoll = (delayMs: number) => {
      clearPollTimer();
      if (cancelled) return;
      pollTimerRef.current = window.setTimeout(async () => {
        if (cancelled || inFlight) return;
        inFlight = true;
        try {
          const res = await service.getJob(activeJobId);
          if (cancelled) return;

          if (res.status === "ok") {
            consecutiveErrors = 0;
            if (hadTransientError) {
              hadTransientError = false;
              setStudioError(null);
            }
            applyJobSnapshot(res.data);
            if (
              res.data.status === "completed" ||
              res.data.status === "failed" ||
              res.data.status === "cancelled"
            ) {
              void loadHistory();
              return;
            }
            schedulePoll(pollIntervalMs);
            return;
          }

          if (res.status === "error") {
            if (res.httpStatus === 401) {
              setStudioError(
                "Your session expired while monitoring the processing job. Sign in again to resume.",
              );
              return;
            }
            if (res.httpStatus === 403) {
              setStudioError(`Access denied while monitoring the processing job: ${res.message}`);
              return;
            }

            const isTransient =
              res.retryable ||
              res.httpStatus == null ||
              res.httpStatus >= 500 ||
              res.httpStatus === 429 ||
              res.httpStatus === 408;

            if (!isTransient) {
              setStudioError(res.message);
              return;
            }

            consecutiveErrors += 1;
            if (consecutiveErrors <= maxPollRetries) {
              hadTransientError = true;
              setStudioError(
                `Temporary connection issue while checking job progress (retrying ${consecutiveErrors}/${maxPollRetries})…`,
              );
              const backoffMs = Math.min(
                pollIntervalMs * 2 ** (consecutiveErrors - 1),
                pollIntervalMs * 8,
              );
              schedulePoll(backoffMs);
              return;
            }

            setStudioError(
              `Unable to refresh job status after ${maxPollRetries} retries: ${res.message}. Refresh Project History to inspect the latest server status.`,
            );
            return;
          }

          setStudioError(res.message);
        } finally {
          inFlight = false;
        }
      }, delayMs);
    };

    schedulePoll(pollIntervalMs);
    return () => {
      cancelled = true;
      clearPollTimer();
    };
  }, [
    activeJobId,
    isJobRunning,
    pollIntervalMs,
    maxPollRetries,
    service,
    applyJobSnapshot,
    loadHistory,
    clearPollTimer,
  ]);

  const analysisCapabilityReady = useMemo(() => {
    if (!capabilities) return true;
    const cap = capabilities.job_types.find((j) => j.job_type === "audio_analysis");
    return cap ? cap.status === "ready" : true;
  }, [capabilities]);

  const accompanimentCapabilityReady = useMemo(() => {
    if (!capabilities) return true;
    const cap = capabilities.job_types.find((j) => j.job_type === "accompaniment_generation");
    return cap ? cap.status === "ready" : true;
  }, [capabilities]);

  const renderingCapabilityReady = useMemo(() => {
    if (!capabilities) return true;
    const cap = capabilities.job_types.find((j) => j.job_type === "audio_rendering");
    return cap ? cap.status === "ready" : true;
  }, [capabilities]);

  const unavailableDeferredFeatures = useMemo(() => {
    if (!capabilities) return [];
    return capabilities.job_types
      .filter((j) => j.status !== "ready")
      .map((j) => j.job_type.replace(/_/g, " "));
  }, [capabilities]);

  const handleSelectFile = (file: File | null, validationError?: string | null) => {
    stopAllStudioPlayback();
    setSelectedFile(file);
    setUploadedSource(null);
    setVerifiedMetadata(null);
    setUploadProgress(0);
    setUploadError(validationError ?? null);
    setStudioError(null);
    if (!file) {
      setAnalysisResult(null);
    }
  };

  const ensureSourceUploaded = async (): Promise<AudioSourceRef | null> => {
    if (uploadedSource) return uploadedSource;
    if (!selectedFile) {
      setUploadError("Select or record a vocal audio file first.");
      return null;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    try {
      const res = await service.uploadAudio(selectedFile, {
        onProgress: (pct) => setUploadProgress(pct),
      });
      if (res.status === "ok" && res.data.asset_reference) {
        setUploadedSource(res.data.asset_reference);
        setVerifiedMetadata(res.data.metadata);
        return res.data.asset_reference;
      }
      if (res.status === "error") {
        setUploadError(
          res.httpStatus === 401
            ? "Your session expired. Sign in again to upload private vocal recordings."
            : res.message,
        );
      } else if (res.status === "unavailable") {
        setUploadError(res.message);
      } else {
        setUploadError("Upload completed without a valid private storage reference.");
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const submitJob = async (
    jobType: "audio_analysis" | "accompaniment_generation" | "audio_rendering",
    sourceOverride?: AudioSourceRef,
    extraParameters?: Record<string, unknown>,
  ) => {
    if (submitLockRef.current || isJobRunning) return;
    stopAllStudioPlayback();
    submitLockRef.current = true;
    setSubmittingJob(true);
    setStudioError(null);

    try {
      const source = sourceOverride ?? (await ensureSourceUploaded());
      if (!source) return;

      const resolvedProjectName =
        projectName.trim() ||
        source.original_filename?.replace(/\.[^.]+$/, "") ||
        "Untitled Vocal Project";

      const idempotencyKey = generateIdempotencyKey(`studio-${jobType}`);
      const parameters: Record<string, unknown> = {
        project_name: resolvedProjectName,
        ...(extraParameters ?? {}),
      };

      const res = await service.createJob({
        job_type: jobType,
        source_audio: source,
        parameters,
        studio_context: STUDIO_CONTEXT_ID,
        idempotency_key: idempotencyKey,
      });

      if (res.status === "ok") {
        applyJobSnapshot(res.data);
        void loadHistory();
      } else if (res.status === "error") {
        if (res.httpStatus === 401) {
          setStudioError(
            "Your authentication session expired. Sign in again to submit processing jobs.",
          );
        } else if (res.httpStatus === 403) {
          setStudioError(`Access denied: ${res.message}`);
        } else {
          setStudioError(`${res.code}: ${res.message}`);
        }
      } else {
        setStudioError(res.message);
      }
    } catch (err) {
      setStudioError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while initiating accompaniment generation.",
      );
    } finally {
      setSubmittingJob(false);
      submitLockRef.current = false;
    }
  };

  const handleUploadAndAnalyse = () => {
    void submitJob("audio_analysis", undefined, {
      include_vocal_pitch: true,
    });
  };

  const handleGenerateAccompanimentOnly = () => {
    void submitJob("accompaniment_generation", undefined, {
      arrangement: arrangementConfig,
      mix_with_vocal: false,
    });
  };

  const handleGenerateAndMaster = () => {
    void submitJob("audio_rendering", undefined, {
      arrangement: arrangementConfig,
      mix: {
        ...mixConfig,
        metadata: {
          title: projectName.trim() || "SONORA Studio Master",
          album: "SONORA AI Accompaniment Studio",
        },
      },
    });
  };

  const handleCancelJob = async (jobId: string) => {
    setCancellingJob(true);
    setStudioError(null);
    try {
      const res = await service.cancelJob(jobId, "Cancelled by user from AI Accompaniment Studio");
      if (res.status === "ok") {
        applyJobSnapshot(res.data.job);
        void loadHistory();
      } else if (res.status === "error") {
        setStudioError(res.message);
      }
    } finally {
      setCancellingJob(false);
    }
  };

  const restoreConfigFromJobParameters = (params: Record<string, unknown> | undefined) => {
    const rawArr = params?.["arrangement"];
    if (rawArr && typeof rawArr === "object") {
      setArrangementConfig({
        ...DEFAULT_ARRANGEMENT_CONFIG,
        ...(rawArr as Partial<ArrangementConfig>),
      });
    } else {
      setArrangementConfig(DEFAULT_ARRANGEMENT_CONFIG);
    }

    const rawMix = params?.["mix"];
    if (rawMix && typeof rawMix === "object") {
      setMixConfig({
        ...DEFAULT_MIX_CONFIG,
        ...(rawMix as Partial<MixAndExportConfig>),
      });
    } else {
      setMixConfig(DEFAULT_MIX_CONFIG);
    }
  };

  const restoreAnalysisForJob = useCallback(
    (job: MusicProcessingJob) => {
      if (
        job.status === "completed" &&
        job.job_type === "audio_analysis" &&
        job.result &&
        isAnalysisJobResult(job.result)
      ) {
        setAnalysisResult(job.result);
        return;
      }

      // Prefer a completed sibling audio_analysis job for the exact same source audio
      const siblingAnalysis = historyJobs.find(
        (candidate) =>
          candidate.job_type === "audio_analysis" &&
          candidate.status === "completed" &&
          candidate.result &&
          isAnalysisJobResult(candidate.result) &&
          (candidate.source_audio.object_path === job.source_audio.object_path ||
            (Boolean(job.source_audio.asset_id) &&
              candidate.source_audio.asset_id === job.source_audio.asset_id)),
      );
      if (siblingAnalysis && isAnalysisJobResult(siblingAnalysis.result)) {
        setAnalysisResult(siblingAnalysis.result);
        return;
      }

      // Otherwise restore an honest summary from the completed accompaniment/render payload
      if (
        job.status === "completed" &&
        (job.job_type === "accompaniment_generation" || job.job_type === "audio_rendering") &&
        job.result &&
        isAccompanimentJobResult(job.result)
      ) {
        setAnalysisResult(buildAnalysisResultFromAccompaniment(job, job.result));
        return;
      }

      setAnalysisResult(null);
    },
    [historyJobs],
  );

  const handleRetryJob = async (failedJob: MusicProcessingJob) => {
    if (submitLockRef.current) return;
    stopAllStudioPlayback();
    clearPollTimer();
    setActiveTab("workspace");
    setRetryingJob(true);
    setStudioError(null);
    setUploadError(null);
    setProjectName(extractProjectName(failedJob));
    setSelectedFile(null);
    setUploadedSource(failedJob.source_audio);
    setVerifiedMetadata(failedJob.audio_metadata);
    setAccompanimentJob(null);
    setAccompanimentResult(null);
    restoreAnalysisForJob(failedJob);
    restoreConfigFromJobParameters(failedJob.parameters);

    try {
      const supportedType =
        failedJob.job_type === "audio_analysis" ||
        failedJob.job_type === "accompaniment_generation" ||
        failedJob.job_type === "audio_rendering"
          ? failedJob.job_type
          : "audio_rendering";

      await submitJob(supportedType, failedJob.source_audio, failedJob.parameters);
    } finally {
      setRetryingJob(false);
    }
  };

  const handleReopenHistoryJob = (job: MusicProcessingJob) => {
    stopAllStudioPlayback();
    clearPollTimer();
    setActiveTab("workspace");
    setStudioError(null);
    setUploadError(null);
    setUploadProgress(0);
    setSelectedFile(null);
    setAnalysisResult(null);
    setAccompanimentJob(null);
    setAccompanimentResult(null);
    setArrangementConfig(DEFAULT_ARRANGEMENT_CONFIG);
    setMixConfig(DEFAULT_MIX_CONFIG);

    setProjectName(extractProjectName(job));
    setUploadedSource(job.source_audio);
    setVerifiedMetadata(job.audio_metadata);
    applyJobSnapshot(job);
    restoreAnalysisForJob(job);
    restoreConfigFromJobParameters(job.parameters);
  };

  const handleNewProject = () => {
    stopAllStudioPlayback();
    clearPollTimer();
    setActiveTab("workspace");
    setProjectName("");
    setSelectedFile(null);
    setUploadedSource(null);
    setVerifiedMetadata(null);
    setUploadProgress(0);
    setUploadError(null);
    setAnalysisResult(null);
    setActiveJob(null);
    setAccompanimentJob(null);
    setAccompanimentResult(null);
    setArrangementConfig(DEFAULT_ARRANGEMENT_CONFIG);
    setMixConfig(DEFAULT_MIX_CONFIG);
    setStudioError(null);
  };

  const handleSyncStemControlsToMix = useCallback(
    (
      gainsDb: Record<string, number>,
      pans: Record<string, number>,
      mutedStems: string[] = [],
      soloStems: string[] = [],
    ) => {
      setMixConfig((prev) => ({
        ...prev,
        stem_gains_db: gainsDb,
        stem_pans: pans,
        muted_stems: mutedStems,
        solo_stems: soloStems,
      }));
    },
    [],
  );

  const canRunGeneration =
    Boolean(selectedFile || uploadedSource) &&
    !uploading &&
    !isJobRunning &&
    !engineUnavailableMsg &&
    (accompanimentCapabilityReady || renderingCapabilityReady);

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        eyebrow="SONORA Flagship Production Studio"
        title="AI Accompaniment & Arrangement Studio"
        description="Upload or record a vocal melody, inspect heuristic key, tempo, chord, and monophonic vocal pitch analysis, arrange multi-sampled instrumentation, and export loudness-mastered studio audio."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterTabs<StudioTab>
              label="Studio views"
              value={activeTab}
              onChange={(nextTab) => {
                if (nextTab !== activeTab) {
                  stopAllStudioPlayback();
                }
                setActiveTab(nextTab);
              }}
              options={[
                { id: "workspace", label: "Studio Workspace" },
                { id: "history", label: `Project History (${historyJobs.length})` },
              ]}
            />
            <Button type="button" size="sm" variant="outline" onClick={handleNewProject}>
              <Plus className="size-3.5" aria-hidden /> New project
            </Button>
          </div>
        }
      />

      {/* Engine configuration / backend availability status */}
      {engineUnavailableMsg && (
        <PreviewNotice
          title="Music Intelligence Engine backend not configured"
          message={engineUnavailableMsg}
        />
      )}

      {backendStatusError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Backend capability check failed: {backendStatusError}</span>
        </div>
      )}

      {/* Capability transparency bar driven strictly by /api/v1/capabilities */}
      {capabilities && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-border bg-paper px-4 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span>
              Engine <span className="font-mono text-foreground">v{capabilities.version}</span> ·
              Ready:{" "}
              <span className="font-medium text-foreground">
                {[
                  analysisCapabilityReady && "Musical Analysis & Monophonic Pitch",
                  accompanimentCapabilityReady && "MIDI & SoundFont Accompaniment",
                  renderingCapabilityReady && "Non-Destructive Mix & LUFS Mastering",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
          </div>
          {unavailableDeferredFeatures.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="size-3 shrink-0" aria-hidden />
              Not yet active: {unavailableDeferredFeatures.join(", ")}
            </span>
          )}
        </div>
      )}

      {studioError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{studioError}</span>
        </div>
      )}

      {activeTab === "history" ? (
        <ProjectHistoryPanel
          jobs={historyJobs}
          loading={historyLoading}
          error={historyError}
          activeJobId={activeJob?.job_id ?? null}
          onRefresh={() => void loadHistory()}
          onReopenJob={handleReopenHistoryJob}
          onRetryFailedJob={(job) => void handleRetryJob(job)}
        />
      ) : (
        <div className="space-y-6">
          {/* Stage D: Active Job Status Banner (pinned near top when active/failed/completed) */}
          {activeJob && (
            <JobStatusPanel
              job={activeJob}
              cancelling={cancellingJob}
              retrying={retryingJob}
              onCancel={(id) => void handleCancelJob(id)}
              onRetry={(job) => void handleRetryJob(job)}
            />
          )}

          {/* Stage A: Start a Project & Vocal Upload / Record */}
          <ProjectUploadStage
            projectName={projectName}
            onProjectNameChange={setProjectName}
            capabilities={capabilities}
            selectedFile={selectedFile}
            uploadedSource={uploadedSource}
            verifiedMetadata={verifiedMetadata}
            uploading={uploading}
            uploadProgress={uploadProgress}
            uploadError={uploadError}
            locked={Boolean(isJobRunning || engineUnavailableMsg)}
            onSelectFile={handleSelectFile}
            onUploadAndAnalyse={handleUploadAndAnalyse}
            onBeforePlay={handleStage1BeforePlay}
            registerStopPlayback={handleRegisterStage1Stop}
          />

          {/* Stage B: Musical Analysis & Vocal Pitch Review */}
          <AnalysisReviewStage
            analysis={analysisResult}
            analyzing={Boolean(isJobRunning && activeJob?.job_type === "audio_analysis")}
          />

          {/* Stage C: Arrangement Configuration */}
          <ArrangementConfigStage
            config={arrangementConfig}
            onChange={setArrangementConfig}
            analysis={analysisResult}
            instrumentsDiag={instrumentsDiag}
            disabled={Boolean(isJobRunning || uploading)}
            canGenerate={canRunGeneration}
            isSubmitting={submittingJob}
            onGenerateAccompaniment={handleGenerateAccompanimentOnly}
            onGenerateFullMix={handleGenerateAndMaster}
          />

          {/* Stage E: Audio Preview & Arrangement Review */}
          <StudioErrorBoundary fallbackTitle="Audio Preview Deck notice">
            <AudioPreviewDeck
              job={accompanimentJob}
              result={accompanimentResult}
              service={service}
              localVocalFile={selectedFile}
              onSyncStemControlsToMix={handleSyncStemControlsToMix}
              onBeforePlay={handleStage5BeforePlay}
              registerStopPlayback={handleRegisterStage5Stop}
            />
          </StudioErrorBoundary>

          {/* Stage F: Mixing, Mastering & Format Controls */}
          <StudioErrorBoundary fallbackTitle="Mixing & Mastering stage notice">
            <MixingMasteringStage
              config={mixConfig}
              onChange={setMixConfig}
              selectedInstruments={arrangementConfig.selected_instruments}
              mixingSummary={accompanimentResult?.mixing ?? null}
              masteringReport={accompanimentResult?.mastering ?? null}
              disabled={Boolean(isJobRunning || uploading)}
              canRender={canRunGeneration && renderingCapabilityReady}
              isSubmitting={submittingJob}
              onRenderMaster={handleGenerateAndMaster}
            />
          </StudioErrorBoundary>

          {/* Stage G: Private Exports & Downloads */}
          <StudioErrorBoundary fallbackTitle="Exports & Downloads panel notice">
            <ExportsDownloadsPanel
              job={accompanimentJob}
              result={accompanimentResult}
              service={service}
            />
          </StudioErrorBoundary>

          {/* Quick shortcut to project history at bottom */}
          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>All uploaded vocals and mastered exports remain private to your account.</span>
            <button
              type="button"
              onClick={() => {
                stopAllStudioPlayback();
                setActiveTab("history");
              }}
              className="link-draw inline-flex items-center gap-1.5 font-medium text-primary"
            >
              <History className="size-3.5" aria-hidden /> View saved project history (
              {historyJobs.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

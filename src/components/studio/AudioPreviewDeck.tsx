import {
  AlertCircle,
  ArrowLeftRight,
  Loader2,
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  AccompanimentJobResult,
  MusicIntelligenceService,
  MusicProcessingJob,
} from "@/services/contracts";
import { RealAudioWaveform } from "./RealAudioWaveform";
import { formatPanLabel, formatSecondsClock } from "./studio-types";

export type PreviewMode = "final_mix" | "original_vocal" | "accompaniment" | "stems_mixer";

export interface StemMixerState {
  muted: boolean;
  solo: boolean;
  volume: number; // 0..1.5
  pan: number; // -1..1
}

export interface AudioPreviewDeckProps {
  job: MusicProcessingJob | null;
  result: AccompanimentJobResult | null;
  service: MusicIntelligenceService;
  localVocalFile?: File | null;
  onSyncStemControlsToMix?: (gainsDb: Record<string, number>, pans: Record<string, number>) => void;
}

interface LoadedAudioAsset {
  blob: Blob;
  buffer: AudioBuffer | null;
  durationSec: number;
}

function gainRatioToDb(ratio: number): number {
  if (ratio <= 0.01) return -24;
  return Math.max(-24, Math.min(12, Number((20 * Math.log10(ratio)).toFixed(1))));
}

export function AudioPreviewDeck({
  job,
  result,
  service,
  localVocalFile,
  onSyncStemControlsToMix,
}: AudioPreviewDeckProps) {
  const [mode, setMode] = useState<PreviewMode>("final_mix");
  const [abTarget, setAbTarget] = useState<"final_mix" | "original_vocal">("final_mix");
  const [masterVolume, setMasterVolume] = useState(0.9);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [includeVocalInStemMix, setIncludeVocalInStemMix] = useState(true);

  const [loadedAssets, setLoadedAssets] = useState<Record<string, LoadedAudioAsset>>({});
  const [stemControls, setStemControls] = useState<Record<string, StemMixerState>>({});

  // Web Audio playback engine refs (guarantees zero unintended overlap and complete unmount cleanup)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const stemNodesRef = useRef<Record<string, { gain: GainNode; panner: StereoPannerNode | null }>>(
    {},
  );
  const masterGainRef = useRef<GainNode | null>(null);
  const playStartCtxTimeRef = useRef<number>(0);
  const playStartOffsetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Fallback HTMLAudioElement when Web Audio decodeAudioData is unavailable (e.g., jsdom or unsupported codec)
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const htmlObjectUrlRef = useRef<string | null>(null);

  const masterExportArtifact = useMemo(() => {
    if (!job || !result) return null;
    const exportsList = result.exports ?? [];
    // Prefer WAV or MP3 for universal browser decoding
    const preferred =
      exportsList.find((e) => e.format === "wav") ??
      exportsList.find((e) => e.format === "mp3") ??
      exportsList[0];
    if (preferred) return preferred.object_path;
    const art = job.artifacts.find((a) => a.artifact_type.startsWith("master_audio_"));
    return art?.object_path ?? null;
  }, [job, result]);

  const accompanimentPath = result?.synthesis?.object_path ?? null;
  const stemsList = useMemo(() => result?.synthesis?.individual_stems ?? [], [result]);
  const hasFinalMix = Boolean(masterExportArtifact);

  // Reset default mode when job changes
  useEffect(() => {
    setMode(hasFinalMix ? "final_mix" : "accompaniment");
    setAbTarget(hasFinalMix ? "final_mix" : "original_vocal");
    setCurrentTimeSec(0);
    setPlaybackError(null);
    setLoadedAssets({});

    const nextStems: Record<string, StemMixerState> = {};
    for (const stem of stemsList) {
      nextStems[stem.instrument_id] = {
        muted: false,
        solo: false,
        volume: 1.0,
        pan: 0.0,
      };
    }
    setStemControls(nextStems);
  }, [job?.job_id, hasFinalMix, stemsList]);

  const stopAllPlayback = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    for (const src of activeSourcesRef.current) {
      try {
        src.onended = null;
        src.stop();
        src.disconnect();
      } catch {
        // Ignore already-stopped source
      }
    }
    activeSourcesRef.current = [];
    stemNodesRef.current = {};

    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  // Strict cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllPlayback();
      if (htmlObjectUrlRef.current) {
        URL.revokeObjectURL(htmlObjectUrlRef.current);
        htmlObjectUrlRef.current = null;
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stopAllPlayback]);

  const getOrCreateAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  }, []);

  const fetchAndDecodeAsset = useCallback(
    async (
      assetKey: string,
      objectPath: string | null,
      fallbackBlob?: Blob | null,
    ): Promise<LoadedAudioAsset | null> => {
      if (loadedAssets[assetKey]) return loadedAssets[assetKey]!;

      let blob: Blob | null = fallbackBlob ?? null;
      if (!blob && job && objectPath) {
        const res = await service.downloadArtifactBlob(job.job_id, objectPath);
        if (res.status === "ok") {
          blob = res.data.blob;
        } else if (res.status === "error") {
          setPlaybackError(
            res.httpStatus === 401
              ? "Your session expired. Sign in again to stream private studio audio."
              : res.message,
          );
          return null;
        } else {
          setPlaybackError(res.message);
          return null;
        }
      }
      if (!blob) return null;

      let buffer: AudioBuffer | null = null;
      let durationSec =
        (result?.arrangement?.duration_ms ?? job?.audio_metadata?.duration_ms ?? 0) / 1000;
      const ctx = getOrCreateAudioContext();
      if (ctx) {
        try {
          const arr = await blob.arrayBuffer();
          buffer = await ctx.decodeAudioData(arr.slice(0));
          durationSec = buffer.duration;
        } catch {
          buffer = null;
        }
      }

      const loaded: LoadedAudioAsset = { blob, buffer, durationSec };
      setLoadedAssets((prev) => ({ ...prev, [assetKey]: loaded }));
      return loaded;
    },
    [loadedAssets, job, service, result, getOrCreateAudioContext],
  );

  // Compute effective gain per stem respecting Solo and Mute
  const computeStemEffectiveGain = useCallback(
    (instrumentId: string, controlsMap: Record<string, StemMixerState>): number => {
      const ctrl = controlsMap[instrumentId];
      if (!ctrl) return 1;
      const anySolo = Object.values(controlsMap).some((c) => c.solo);
      if (ctrl.muted) return 0;
      if (anySolo && !ctrl.solo) return 0;
      return ctrl.volume;
    },
    [],
  );

  // Live-update gain & pan nodes while playing without restarting playback
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(masterVolume, audioCtxRef.current.currentTime);
    }
    for (const [id, nodes] of Object.entries(stemNodesRef.current)) {
      if (id === "__vocal__") {
        nodes.gain.gain.setValueAtTime(
          includeVocalInStemMix ? 1.0 : 0.0,
          audioCtxRef.current?.currentTime ?? 0,
        );
        continue;
      }
      const effGain = computeStemEffectiveGain(id, stemControls);
      const ctrl = stemControls[id];
      const now = audioCtxRef.current?.currentTime ?? 0;
      nodes.gain.gain.setValueAtTime(effGain, now);
      if (nodes.panner && ctrl) {
        nodes.panner.pan.setValueAtTime(ctrl.pan, now);
      }
    }
  }, [masterVolume, stemControls, includeVocalInStemMix, computeStemEffectiveGain]);

  const activeAssetKey =
    mode === "final_mix"
      ? "final_mix"
      : mode === "original_vocal"
        ? "original_vocal"
        : mode === "accompaniment"
          ? "accompaniment"
          : "accompaniment";

  const activeDurationSec = useMemo(() => {
    const asset = loadedAssets[activeAssetKey];
    if (asset && asset.durationSec > 0) return asset.durationSec;
    if (mode === "original_vocal" && job?.audio_metadata?.duration_ms) {
      return job.audio_metadata.duration_ms / 1000;
    }
    if (result?.mixing?.mix_duration_ms && mode === "final_mix") {
      return result.mixing.mix_duration_ms / 1000;
    }
    if (result?.synthesis?.duration_ms) {
      return result.synthesis.duration_ms / 1000;
    }
    return 0;
  }, [loadedAssets, activeAssetKey, mode, job, result]);

  const startPlaybackAt = useCallback(
    async (targetMode: PreviewMode, startOffsetSec: number) => {
      if (!job || !result) return;
      stopAllPlayback();
      setPlaybackError(null);
      setLoadingAsset(true);

      try {
        const ctx = getOrCreateAudioContext();
        if (ctx && ctx.state === "suspended") {
          await ctx.resume();
        }

        if (targetMode === "stems_mixer" && stemsList.length > 0) {
          const stemAssets = await Promise.all(
            stemsList.map(async (s) => ({
              id: s.instrument_id,
              asset: await fetchAndDecodeAsset(`stem_${s.instrument_id}`, s.object_path),
            })),
          );
          const vocalAsset = await fetchAndDecodeAsset(
            "original_vocal",
            job.source_audio.object_path,
            localVocalFile,
          );

          const playableStems = stemAssets.filter((item) => item.asset?.buffer);
          if (!ctx || playableStems.length === 0) {
            setPlaybackError(
              "Multi-stem synchronized playback requires browser Web Audio decoding.",
            );
            return;
          }

          const masterGain = ctx.createGain();
          masterGain.gain.value = masterVolume;
          masterGain.connect(ctx.destination);
          masterGainRef.current = masterGain;

          const maxDuration = Math.max(
            ...playableStems.map((s) => s.asset!.buffer!.duration),
            vocalAsset?.buffer?.duration ?? 0,
          );
          const clampedOffset = Math.max(
            0,
            Math.min(startOffsetSec, Math.max(0, maxDuration - 0.05)),
          );
          const scheduledStart = ctx.currentTime + 0.02;

          const newSources: AudioBufferSourceNode[] = [];
          const newNodes: Record<string, { gain: GainNode; panner: StereoPannerNode | null }> = {};

          for (const item of playableStems) {
            const buf = item.asset!.buffer!;
            if (clampedOffset >= buf.duration) continue;
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.value = computeStemEffectiveGain(item.id, stemControls);
            const panner =
              typeof ctx.createStereoPanner === "function" ? ctx.createStereoPanner() : null;
            if (panner) {
              panner.pan.value = stemControls[item.id]?.pan ?? 0;
              src.connect(gain);
              gain.connect(panner);
              panner.connect(masterGain);
            } else {
              src.connect(gain);
              gain.connect(masterGain);
            }
            src.start(scheduledStart, clampedOffset);
            newSources.push(src);
            newNodes[item.id] = { gain, panner };
          }

          if (vocalAsset?.buffer) {
            const introOffsetSec = (result.mixing?.intro_offset_ms ?? 0) / 1000;
            const src = ctx.createBufferSource();
            src.buffer = vocalAsset.buffer;
            const gain = ctx.createGain();
            gain.gain.value = includeVocalInStemMix ? 1.0 : 0.0;
            src.connect(gain);
            gain.connect(masterGain);
            if (clampedOffset >= introOffsetSec) {
              const vocalOffset = clampedOffset - introOffsetSec;
              if (vocalOffset < vocalAsset.buffer.duration) {
                src.start(scheduledStart, vocalOffset);
                newSources.push(src);
                newNodes["__vocal__"] = { gain, panner: null };
              }
            } else {
              src.start(scheduledStart + (introOffsetSec - clampedOffset), 0);
              newSources.push(src);
              newNodes["__vocal__"] = { gain, panner: null };
            }
          }

          activeSourcesRef.current = newSources;
          stemNodesRef.current = newNodes;
          playStartCtxTimeRef.current = scheduledStart;
          playStartOffsetRef.current = clampedOffset;
          setIsPlaying(true);

          const tick = () => {
            if (!audioCtxRef.current) return;
            const elapsed =
              playStartOffsetRef.current +
              Math.max(0, audioCtxRef.current.currentTime - playStartCtxTimeRef.current);
            if (elapsed >= maxDuration) {
              setCurrentTimeSec(0);
              stopAllPlayback();
              return;
            }
            setCurrentTimeSec(elapsed);
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        // Single-source playback (Final Mix, Original Vocal, or Accompaniment)
        const key =
          targetMode === "final_mix"
            ? "final_mix"
            : targetMode === "original_vocal"
              ? "original_vocal"
              : "accompaniment";
        const path =
          targetMode === "final_mix"
            ? masterExportArtifact
            : targetMode === "original_vocal"
              ? job.source_audio.object_path
              : accompanimentPath;

        const asset = await fetchAndDecodeAsset(
          key,
          path,
          targetMode === "original_vocal" ? localVocalFile : null,
        );
        if (!asset) return;

        if (ctx && asset.buffer) {
          const masterGain = ctx.createGain();
          masterGain.gain.value = masterVolume;
          masterGain.connect(ctx.destination);
          masterGainRef.current = masterGain;

          const clampedOffset = Math.max(
            0,
            Math.min(startOffsetSec, Math.max(0, asset.buffer.duration - 0.05)),
          );
          const src = ctx.createBufferSource();
          src.buffer = asset.buffer;
          src.connect(masterGain);

          const scheduledStart = ctx.currentTime + 0.01;
          src.start(scheduledStart, clampedOffset);
          activeSourcesRef.current = [src];
          playStartCtxTimeRef.current = scheduledStart;
          playStartOffsetRef.current = clampedOffset;
          setIsPlaying(true);

          const totalDur = asset.buffer.duration;
          const tick = () => {
            if (!audioCtxRef.current) return;
            const elapsed =
              playStartOffsetRef.current +
              Math.max(0, audioCtxRef.current.currentTime - playStartCtxTimeRef.current);
            if (elapsed >= totalDur) {
              setCurrentTimeSec(0);
              stopAllPlayback();
              return;
            }
            setCurrentTimeSec(elapsed);
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        } else {
          // Fallback HTMLAudioElement
          if (htmlObjectUrlRef.current) {
            URL.revokeObjectURL(htmlObjectUrlRef.current);
          }
          const url = URL.createObjectURL(asset.blob);
          htmlObjectUrlRef.current = url;
          const audio = htmlAudioRef.current ?? new Audio();
          htmlAudioRef.current = audio;
          audio.src = url;
          audio.volume = Math.min(1, masterVolume);
          audio.currentTime = startOffsetSec;
          audio.ontimeupdate = () => setCurrentTimeSec(audio.currentTime);
          audio.onended = () => {
            setIsPlaying(false);
            setCurrentTimeSec(0);
          };
          await audio.play();
          setIsPlaying(true);
        }
      } finally {
        setLoadingAsset(false);
      }
    },
    [
      job,
      result,
      stopAllPlayback,
      getOrCreateAudioContext,
      stemsList,
      fetchAndDecodeAsset,
      localVocalFile,
      masterVolume,
      computeStemEffectiveGain,
      stemControls,
      includeVocalInStemMix,
      masterExportArtifact,
      accompanimentPath,
    ],
  );

  const handleModeChange = (nextMode: PreviewMode) => {
    const wasPlaying = isPlaying;
    const resumeAt = currentTimeSec;
    stopAllPlayback();
    setMode(nextMode);
    if (nextMode === "final_mix" || nextMode === "original_vocal") {
      setAbTarget(nextMode);
    }
    if (wasPlaying) {
      void startPlaybackAt(nextMode, resumeAt);
    }
  };

  const handleToggleAB = () => {
    if (!hasFinalMix) return;
    const nextAB: "final_mix" | "original_vocal" =
      abTarget === "final_mix" ? "original_vocal" : "final_mix";
    setAbTarget(nextAB);
    handleModeChange(nextAB);
  };

  const handleSeek = (nextSec: number) => {
    setCurrentTimeSec(nextSec);
    if (isPlaying) {
      void startPlaybackAt(mode, nextSec);
    }
  };

  const updateStem = (instrumentId: string, patch: Partial<StemMixerState>) => {
    setStemControls((prev) => {
      const current = prev[instrumentId] ?? { muted: false, solo: false, volume: 1.0, pan: 0.0 };
      const updated = { ...prev, [instrumentId]: { ...current, ...patch } };
      if (onSyncStemControlsToMix) {
        const gainsDb: Record<string, number> = {};
        const pans: Record<string, number> = {};
        for (const [id, st] of Object.entries(updated)) {
          gainsDb[id] = st.muted ? -24 : gainRatioToDb(st.volume);
          pans[id] = Number(st.pan.toFixed(2));
        }
        onSyncStemControlsToMix(gainsDb, pans);
      }
      return updated;
    });
  };

  if (!job || !result) {
    return (
      <section
        aria-labelledby="stage-e-heading"
        className="rounded-[2px] border border-border bg-paper p-5 md:p-6"
      >
        <p className="eyebrow text-crimson-deep">Stage 05 · Audio Preview &amp; Review</p>
        <h2 id="stage-e-heading" className="type-display-md mt-1 text-foreground">
          Audio preview &amp; arrangement review
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate an accompaniment or mastered mix in Stage 03 to audition the original vocal,
          generated accompaniment, individual instrument stems, A/B vocal-vs-mix comparison, and
          real decoded audio waveforms here.
        </p>
      </section>
    );
  }

  const activeLoadedAsset = loadedAssets[activeAssetKey] ?? null;

  return (
    <section
      aria-labelledby="stage-e-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Stage 05 · Audio Preview &amp; Review</p>
          <h2 id="stage-e-heading" className="type-display-md mt-1 text-foreground">
            Audition &amp; stem review
          </h2>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {result.arrangement.style} · {result.arrangement.key} ·{" "}
          {result.arrangement.tempo_bpm.toFixed(1)} BPM · {result.arrangement.total_bars} bars ·{" "}
          {result.synthesis.soundfont_name ?? result.synthesis.engine}
        </p>
      </div>

      {/* Mode switcher + A/B comparison button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Audio playback source"
          className="inline-flex flex-wrap gap-1 rounded-[2px] border border-border bg-secondary p-1"
        >
          {hasFinalMix && (
            <button
              type="button"
              role="tab"
              aria-selected={mode === "final_mix"}
              onClick={() => handleModeChange("final_mix")}
              className={cn(
                "min-h-8 rounded-[2px] px-3 py-1 text-xs font-medium transition-colors",
                mode === "final_mix"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Final Mix
            </button>
          )}
          <button
            type="button"
            role="tab"
            aria-selected={mode === "original_vocal"}
            onClick={() => handleModeChange("original_vocal")}
            className={cn(
              "min-h-8 rounded-[2px] px-3 py-1 text-xs font-medium transition-colors",
              mode === "original_vocal"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Original Vocal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "accompaniment"}
            onClick={() => handleModeChange("accompaniment")}
            className={cn(
              "min-h-8 rounded-[2px] px-3 py-1 text-xs font-medium transition-colors",
              mode === "accompaniment"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Accompaniment Only
          </button>
          {stemsList.length > 0 && (
            <button
              type="button"
              role="tab"
              aria-selected={mode === "stems_mixer"}
              onClick={() => handleModeChange("stems_mixer")}
              className={cn(
                "min-h-8 rounded-[2px] px-3 py-1 text-xs font-medium transition-colors",
                mode === "stems_mixer"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Stem Mixer ({stemsList.length})
            </button>
          )}
        </div>

        {hasFinalMix && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleToggleAB}
            aria-label="Toggle A/B comparison between Original Vocal and Final Mix"
          >
            <ArrowLeftRight className="size-3.5" aria-hidden />
            A/B Compare: {abTarget === "final_mix" ? "Final Mix (B)" : "Original Vocal (A)"}
          </Button>
        )}
      </div>

      {/* Transport bar & real decoded waveform */}
      <div className="space-y-3 rounded-[2px] border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={loadingAsset}
              onClick={() => {
                if (isPlaying) {
                  stopAllPlayback();
                } else {
                  void startPlaybackAt(mode, currentTimeSec);
                }
              }}
              aria-label={isPlaying ? "Pause playback" : "Start playback"}
            >
              {loadingAsset ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : isPlaying ? (
                <Pause className="size-3.5" aria-hidden />
              ) : (
                <Play className="size-3.5" aria-hidden />
              )}
              {loadingAsset ? "Loading…" : isPlaying ? "Pause" : "Play"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                stopAllPlayback();
                setCurrentTimeSec(0);
              }}
              aria-label="Stop and rewind"
            >
              <Square className="size-3.5" aria-hidden />
            </Button>

            <span className="ml-2 font-mono text-xs tabular-nums text-foreground">
              {formatSecondsClock(currentTimeSec)} / {formatSecondsClock(activeDurationSec)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {masterVolume === 0 ? (
              <VolumeX className="size-4 text-muted-foreground" aria-hidden />
            ) : (
              <Volume2 className="size-4 text-muted-foreground" aria-hidden />
            )}
            <label htmlFor="preview-master-vol" className="text-xs text-muted-foreground">
              Monitor
            </label>
            <input
              id="preview-master-vol"
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-24 accent-primary"
            />
            <span className="w-9 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
        </div>

        <RealAudioWaveform
          audioBlob={activeLoadedAsset?.blob ?? null}
          audioBuffer={activeLoadedAsset?.buffer ?? null}
          currentTimeSec={currentTimeSec}
          durationSec={activeDurationSec}
          onSeek={handleSeek}
          label={`Decoded waveform for ${mode.replace(/_/g, " ")}`}
          accentColor={mode === "original_vocal" ? "crimson" : "primary"}
        />

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Active source:{" "}
            <strong className="font-medium text-foreground">
              {mode === "final_mix"
                ? "Final Mastered Mix"
                : mode === "original_vocal"
                  ? "Original Preserved Vocal"
                  : mode === "accompaniment"
                    ? "Synthesized Accompaniment"
                    : "Synchronized Multi-Stem Mixer"}
            </strong>
          </span>
          <span>Single-transport lock prevents accidental track overlap</span>
        </div>
      </div>

      {playbackError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{playbackError}</span>
        </div>
      )}

      {/* Per-stem mixer controls */}
      {stemsList.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Individual instrument stems ({stemsList.length})
            </h3>
            <label className="inline-flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeVocalInStemMix}
                onChange={(e) => setIncludeVocalInStemMix(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span>Include original vocal during Stem Mixer playback</span>
            </label>
          </div>

          <div className="divide-y divide-border rounded-[2px] border border-border bg-background">
            {stemsList.map((stem) => {
              const ctrl = stemControls[stem.instrument_id] ?? {
                muted: false,
                solo: false,
                volume: 1.0,
                pan: 0.0,
              };
              return (
                <div
                  key={stem.instrument_id}
                  className="grid gap-3 px-4 py-3 md:grid-cols-12 md:items-center"
                >
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-foreground">{stem.track_name}</p>
                    <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      Ch {stem.channel + 1} · GM #{stem.gm_program}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 md:col-span-2">
                    <button
                      type="button"
                      aria-pressed={ctrl.muted}
                      aria-label={`Mute ${stem.track_name}`}
                      onClick={() => updateStem(stem.instrument_id, { muted: !ctrl.muted })}
                      className={cn(
                        "h-7 min-w-10 rounded-[2px] border px-2 text-xs font-medium transition-colors",
                        ctrl.muted
                          ? "border-crimson bg-crimson text-white"
                          : "border-border bg-paper text-foreground hover:border-foreground",
                      )}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      aria-pressed={ctrl.solo}
                      aria-label={`Solo ${stem.track_name}`}
                      onClick={() => updateStem(stem.instrument_id, { solo: !ctrl.solo })}
                      className={cn(
                        "h-7 min-w-10 rounded-[2px] border px-2 text-xs font-medium transition-colors",
                        ctrl.solo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-paper text-foreground hover:border-foreground",
                      )}
                    >
                      S
                    </button>
                  </div>

                  <div className="space-y-1 md:col-span-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <label htmlFor={`stem-vol-${stem.instrument_id}`}>Volume</label>
                      <span className="font-mono tabular-nums text-foreground">
                        {Math.round(ctrl.volume * 100)}%
                      </span>
                    </div>
                    <input
                      id={`stem-vol-${stem.instrument_id}`}
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={ctrl.volume}
                      onChange={(e) =>
                        updateStem(stem.instrument_id, { volume: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <label htmlFor={`stem-pan-${stem.instrument_id}`}>Pan</label>
                      <span className="font-mono tabular-nums text-foreground">
                        {formatPanLabel(ctrl.pan)}
                      </span>
                    </div>
                    <input
                      id={`stem-pan-${stem.instrument_id}`}
                      type="range"
                      min={-1}
                      max={1}
                      step={0.05}
                      value={ctrl.pan}
                      onChange={(e) =>
                        updateStem(stem.instrument_id, { pan: parseFloat(e.target.value) })
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

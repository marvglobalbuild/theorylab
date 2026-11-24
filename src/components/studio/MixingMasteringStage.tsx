import { AlertTriangle, CheckCircle2, Info, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ExportFormat,
  MasteringReport,
  MixAndExportConfig,
  MixingSummary,
} from "@/services/contracts";
import { EXPORT_FORMAT_OPTIONS, formatDb, formatPanLabel } from "./studio-types";

export interface MixingMasteringStageProps {
  config: MixAndExportConfig;
  onChange: (next: MixAndExportConfig) => void;
  selectedInstruments: string[];
  mixingSummary: MixingSummary | null;
  masteringReport: MasteringReport | null;
  disabled: boolean;
  canRender: boolean;
  isSubmitting: boolean;
  onRenderMaster: () => void;
}

export function MixingMasteringStage({
  config,
  onChange,
  selectedInstruments,
  mixingSummary,
  masteringReport,
  disabled,
  canRender,
  isSubmitting,
  onRenderMaster,
}: MixingMasteringStageProps) {
  const toggleExportFormat = (fmt: ExportFormat) => {
    const exists = config.output_formats.includes(fmt);
    if (exists) {
      if (config.output_formats.length <= 1) return;
      onChange({
        ...config,
        output_formats: config.output_formats.filter((f) => f !== fmt),
      });
    } else {
      onChange({
        ...config,
        output_formats: [...config.output_formats, fmt],
      });
    }
  };

  const setStemGain = (instrumentId: string, db: number) => {
    onChange({
      ...config,
      stem_gains_db: {
        ...config.stem_gains_db,
        [instrumentId]: Number(db.toFixed(1)),
      },
    });
  };

  const setStemPan = (instrumentId: string, pan: number) => {
    onChange({
      ...config,
      stem_pans: {
        ...config.stem_pans,
        [instrumentId]: Number(pan.toFixed(2)),
      },
    });
  };

  return (
    <section
      aria-labelledby="stage-f-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Stage 06 · Mixing &amp; Mastering</p>
          <h2 id="stage-f-heading" className="type-display-md mt-1 text-foreground">
            Non-destructive vocal mix &amp; loudness mastering
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Original vocal timing &amp; pitch remain unmodified
        </p>
      </div>

      {/* Controls grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Vocal / Accompaniment balance */}
        <div className="space-y-4 rounded-[2px] border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <SlidersHorizontal className="size-3.5 text-primary" aria-hidden />
            <span>Vocal &amp; Accompaniment Balance</span>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-foreground">Balance mode</span>
            <div className="grid grid-cols-2 gap-2">
              {(["auto_adaptive", "manual"] as const).map((modeOpt) => {
                const active = config.vocal_balance_mode === modeOpt;
                return (
                  <button
                    key={modeOpt}
                    type="button"
                    aria-pressed={active}
                    disabled={disabled}
                    onClick={() => onChange({ ...config, vocal_balance_mode: modeOpt })}
                    className={cn(
                      "rounded-[2px] border px-3 py-2 text-left text-xs transition-colors",
                      active
                        ? "border-primary bg-paper font-medium text-foreground ring-1 ring-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <p className="font-medium text-foreground">
                      {modeOpt === "auto_adaptive" ? "Auto-adaptive vocal clarity" : "Manual gains"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {modeOpt === "auto_adaptive"
                        ? "Automatically trims accompaniment if louder than vocal"
                        : "Uses your exact vocal & accompaniment dB settings"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="mix-vocal-gain" className="font-medium text-foreground">
                Vocal gain
              </label>
              <span className="font-mono tabular-nums text-foreground">
                {formatDb(config.vocal_gain_db)}
              </span>
            </div>
            <input
              id="mix-vocal-gain"
              type="range"
              min={-24}
              max={18}
              step={0.5}
              value={config.vocal_gain_db}
              disabled={disabled}
              onChange={(e) => onChange({ ...config, vocal_gain_db: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="mix-acc-gain" className="font-medium text-foreground">
                Accompaniment gain
              </label>
              <span className="font-mono tabular-nums text-foreground">
                {formatDb(config.accompaniment_gain_db)}
              </span>
            </div>
            <input
              id="mix-acc-gain"
              type="range"
              min={-36}
              max={12}
              step={0.5}
              value={config.accompaniment_gain_db}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...config, accompaniment_gain_db: parseFloat(e.target.value) })
              }
              className="w-full accent-primary"
            />
          </div>

          {/* Per-stem gain & pan overrides */}
          {selectedInstruments.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Per-stem mix trim &amp; stereo pan
              </p>
              <div className="space-y-2.5">
                {selectedInstruments.map((instId) => {
                  const gain = config.stem_gains_db[instId] ?? 0;
                  const pan = config.stem_pans[instId] ?? 0;
                  const isMuted = config.muted_stems?.includes(instId) ?? false;
                  const isSolo = config.solo_stems?.includes(instId) ?? false;
                  return (
                    <div key={instId} className="grid grid-cols-12 items-center gap-2 text-xs">
                      <span className="col-span-3 truncate font-medium capitalize text-foreground">
                        {instId.replace(/_/g, " ")}
                        {isMuted && (
                          <span className="ml-1 font-mono text-[10px] uppercase text-crimson-deep">
                            [M]
                          </span>
                        )}
                        {!isMuted && isSolo && (
                          <span className="ml-1 font-mono text-[10px] uppercase text-primary">
                            [S]
                          </span>
                        )}
                      </span>
                      <div className="col-span-5 flex items-center gap-1.5">
                        <input
                          type="range"
                          aria-label={`${instId} mix gain dB`}
                          min={-24}
                          max={12}
                          step={0.5}
                          value={gain}
                          disabled={disabled}
                          onChange={(e) => setStemGain(instId, parseFloat(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <span className="w-12 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                          {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-1.5">
                        <input
                          type="range"
                          aria-label={`${instId} stereo pan`}
                          min={-1}
                          max={1}
                          step={0.05}
                          value={pan}
                          disabled={disabled}
                          onChange={(e) => setStemPan(instId, parseFloat(e.target.value))}
                          className="w-full accent-primary"
                        />
                        <span className="w-12 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                          {formatPanLabel(pan)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Loudness Mastering & Export Format Settings */}
        <div className="space-y-4 rounded-[2px] border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Loudness Mastering &amp; Export Formats
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="master-target-lufs" className="font-medium text-foreground">
                  Target integrated loudness
                </label>
                <span className="font-mono tabular-nums text-foreground">
                  {config.target_lufs.toFixed(1)} LUFS
                </span>
              </div>
              <input
                id="master-target-lufs"
                type="range"
                min={-30}
                max={-6}
                step={0.5}
                value={config.target_lufs}
                disabled={disabled}
                onChange={(e) => onChange({ ...config, target_lufs: parseFloat(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="master-tp-ceiling" className="font-medium text-foreground">
                  4× peak ceiling target
                </label>
                <span className="font-mono tabular-nums text-foreground">
                  {config.true_peak_ceiling_dbtp.toFixed(1)} dB (4× est.)
                </span>
              </div>
              <input
                id="master-tp-ceiling"
                type="range"
                min={-6}
                max={-0.1}
                step={0.1}
                value={config.true_peak_ceiling_dbtp}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...config, true_peak_ceiling_dbtp: parseFloat(e.target.value) })
                }
                className="w-full accent-primary"
              />
            </div>
          </div>

          {/* Export formats */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-foreground">Export formats</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {EXPORT_FORMAT_OPTIONS.map((fmt) => {
                const selected = config.output_formats.includes(fmt.id);
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    aria-pressed={selected}
                    disabled={disabled || (selected && config.output_formats.length <= 1)}
                    onClick={() => toggleExportFormat(fmt.id)}
                    className={cn(
                      "rounded-[2px] border p-2.5 text-left transition-colors disabled:opacity-60",
                      selected
                        ? "border-primary bg-paper ring-1 ring-primary"
                        : "border-border bg-background hover:border-foreground/40",
                    )}
                  >
                    <p className="text-xs font-semibold text-foreground">{fmt.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{fmt.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {config.output_formats.includes("wav") && (
              <div className="space-y-1.5">
                <label
                  htmlFor="export-wav-depth"
                  className="block text-xs font-medium text-foreground"
                >
                  WAV bit depth
                </label>
                <select
                  id="export-wav-depth"
                  value={config.wav_bit_depth}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      wav_bit_depth: parseInt(e.target.value, 10) === 24 ? 24 : 16,
                    })
                  }
                  className="h-9 w-full rounded-[2px] border border-input bg-background px-2.5 text-xs text-foreground"
                >
                  <option value={16}>16-bit PCM (CD standard)</option>
                  <option value={24}>24-bit PCM (Studio master)</option>
                </select>
              </div>
            )}

            {config.output_formats.includes("mp3") && (
              <div className="space-y-1.5">
                <label
                  htmlFor="export-mp3-bitrate"
                  className="block text-xs font-medium text-foreground"
                >
                  MP3 bitrate
                </label>
                <select
                  id="export-mp3-bitrate"
                  value={config.mp3_bitrate_kbps}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange({ ...config, mp3_bitrate_kbps: parseInt(e.target.value, 10) })
                  }
                  className="h-9 w-full rounded-[2px] border border-input bg-background px-2.5 text-xs text-foreground"
                >
                  <option value={320}>320 kbps (Highest MP3)</option>
                  <option value={256}>256 kbps</option>
                  <option value={192}>192 kbps</option>
                  <option value={128}>128 kbps</option>
                </select>
              </div>
            )}
          </div>

          <label className="inline-flex items-center gap-2 pt-1 text-xs text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={config.include_original_vocal_copy}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...config, include_original_vocal_copy: e.target.checked })
              }
              className="size-4 accent-primary"
            />
            <span>Include an unmodified WAV copy of the original vocal in exports</span>
          </label>
        </div>
      </div>

      {/* Render / Re-master CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Applies non-destructive vocal + accompaniment mixing, pyloudnorm integrated loudness
          normalization, and 4× oversampled peak limiting.
        </p>
        <Button type="button" disabled={!canRender || isSubmitting} onClick={onRenderMaster}>
          {isSubmitting ? "Rendering master…" : "Render mastered mix & exports"}
        </Button>
      </div>

      {/* Actual Backend Mastering Report */}
      {masteringReport && (
        <div className="space-y-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Mastering report
            </h3>
            <span className="text-xs text-muted-foreground">
              Loudness: pyloudnorm ITU-R BS.1770-4 · Peak guard: 4× oversampled true-peak estimate
            </span>
          </div>

          <dl className="grid border-y border-border bg-background sm:grid-cols-2 lg:grid-cols-4">
            <div className="px-4 py-3.5">
              <dt className="text-xs text-muted-foreground">Integrated Loudness</dt>
              <dd className="mt-1 font-display text-2xl tabular-nums text-foreground">
                {masteringReport.output_metrics?.integrated_lufs != null
                  ? `${masteringReport.output_metrics.integrated_lufs.toFixed(1)} LUFS`
                  : "—"}
              </dd>
              <dd className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                Input:{" "}
                {masteringReport.input_metrics?.integrated_lufs != null
                  ? `${masteringReport.input_metrics.integrated_lufs.toFixed(1)} LUFS`
                  : "—"}{" "}
                · Target: {masteringReport.target_lufs != null ? `${masteringReport.target_lufs.toFixed(1)} LUFS` : "—"}
              </dd>
            </div>

            <div className="border-t border-border px-4 py-3.5 sm:border-t-0 sm:border-l">
              <dt className="text-xs text-muted-foreground">4× oversampled true-peak estimate</dt>
              <dd className="mt-1 font-display text-2xl tabular-nums text-foreground">
                {masteringReport.output_metrics?.true_peak_dbtp != null
                  ? `${masteringReport.output_metrics.true_peak_dbtp.toFixed(2)} dB`
                  : "—"}
              </dd>
              <dd className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                Sample peak:{" "}
                {masteringReport.output_metrics?.sample_peak_dbfs != null
                  ? `${masteringReport.output_metrics.sample_peak_dbfs.toFixed(2)} dBFS`
                  : "—"}{" "}
                · Ceiling {masteringReport.true_peak_ceiling_dbtp != null ? `${masteringReport.true_peak_ceiling_dbtp.toFixed(1)} dB` : "—"}
              </dd>
            </div>

            <div className="border-t border-border px-4 py-3.5 lg:border-t-0 lg:border-l">
              <dt className="text-xs text-muted-foreground">Gain &amp; Limiting</dt>
              <dd className="mt-1 font-display text-2xl tabular-nums text-foreground">
                {formatDb(masteringReport.applied_gain_db)}
              </dd>
              <dd className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                {masteringReport.limiting_applied
                  ? `Limiting GR: ${masteringReport.limiting_gain_reduction_db != null ? masteringReport.limiting_gain_reduction_db.toFixed(2) : "0.00"} dB`
                  : "No limiting required"}
              </dd>
            </div>

            <div className="border-t border-border px-4 py-3.5 sm:border-l lg:border-t-0">
              <dt className="text-xs text-muted-foreground">Target &amp; Protection Status</dt>
              <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                {masteringReport.target_lufs_achieved && !masteringReport.clipping_detected ? (
                  <CheckCircle2 className="size-4 text-primary" aria-hidden />
                ) : (
                  <AlertTriangle className="size-4 text-crimson-deep" aria-hidden />
                )}
                <span>
                  {masteringReport.target_lufs_achieved
                    ? "Target LUFS achieved"
                    : "Headroom-limited"}
                </span>
              </dd>
              <dd className="mt-1 text-[11px] text-muted-foreground">
                {masteringReport.clipping_detected
                  ? "Clipping detected"
                  : "Zero sample clipping · Dynamic range preserved"}
              </dd>
            </div>
          </dl>

          {/* Explicit honesty note on 4x oversampled true-peak estimate */}
          <div className="flex items-start gap-2.5 rounded-[2px] border border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>
              Peak protection uses a{" "}
              <strong className="font-medium text-foreground">
                4× oversampled true-peak estimate
              </strong>{" "}
              (polyphase FIR upsampling) to guard against inter-sample peaks and clipping. It is an
              engineering estimate rather than a certified full ITU-R BS.1770-4 true-peak meter.
              {mixingSummary && (
                <>
                  {" "}
                  Effective mix gains: vocal {formatDb(mixingSummary.effective_vocal_gain_db)},
                  accompaniment {formatDb(mixingSummary.effective_accompaniment_gain_db)}
                  {mixingSummary.adaptive_accompaniment_trim_db !== 0
                    ? ` (adaptive trim ${formatDb(mixingSummary.adaptive_accompaniment_trim_db)})`
                    : ""}
                  .
                </>
              )}
            </span>
          </div>

          {(masteringReport.warnings ?? []).length > 0 && (
            <div
              role="alert"
              className="rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep space-y-1"
            >
              <p className="font-medium">Mastering warnings</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {(masteringReport.warnings ?? []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

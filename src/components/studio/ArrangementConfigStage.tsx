import { AlertTriangle, Check, RotateCcw, Sliders } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ArrangementConfig,
  ArrangementStyle,
  AudioAnalysisResult,
  InstrumentDiagnostics,
  InstrumentFamily,
} from "@/services/contracts";
import { ARRANGEMENT_STYLES, INSTRUMENT_FAMILIES, KEY_SIGNATURE_OPTIONS } from "./studio-types";

export interface ArrangementConfigStageProps {
  config: ArrangementConfig;
  onChange: (next: ArrangementConfig) => void;
  analysis: AudioAnalysisResult | null;
  instrumentsDiag: InstrumentDiagnostics | null;
  disabled: boolean;
  canGenerate: boolean;
  isSubmitting: boolean;
  onGenerateAccompaniment: () => void;
  onGenerateFullMix: () => void;
}

export function ArrangementConfigStage({
  config,
  onChange,
  analysis,
  instrumentsDiag,
  disabled,
  canGenerate,
  isSubmitting,
  onGenerateAccompaniment,
  onGenerateFullMix,
}: ArrangementConfigStageProps) {
  const synthReady =
    instrumentsDiag === null
      ? true
      : instrumentsDiag.fluidsynth_available && instrumentsDiag.sound_library.available;

  const detectedKey = analysis?.estimated_key ?? null;
  const detectedTempo = analysis?.tempo_bpm ?? null;

  const handleStyleSelect = (styleId: ArrangementStyle) => {
    const preset = ARRANGEMENT_STYLES.find((s) => s.id === styleId);
    onChange({
      ...config,
      style: styleId,
      selected_instruments: preset ? [...preset.defaultInstruments] : config.selected_instruments,
    });
  };

  const toggleInstrument = (family: InstrumentFamily) => {
    const exists = config.selected_instruments.includes(family);
    if (exists) {
      // Keep at least 1 instrument selected so backend ArrangementConfig stays valid
      if (config.selected_instruments.length <= 1) return;
      onChange({
        ...config,
        selected_instruments: config.selected_instruments.filter((id) => id !== family),
      });
    } else {
      onChange({
        ...config,
        selected_instruments: [...config.selected_instruments, family],
      });
    }
  };

  const setInstrumentVolume = (family: InstrumentFamily, volume: number) => {
    onChange({
      ...config,
      instrument_volumes: {
        ...config.instrument_volumes,
        [family]: Number(volume.toFixed(2)),
      },
    });
  };

  const resetOverrides = () => {
    onChange({
      ...config,
      key_override: null,
      tempo_override_bpm: null,
      transpose_semitones: 0,
      intro_bars: 0,
      outro_bars: 0,
    });
  };

  return (
    <section
      aria-labelledby="stage-c-heading"
      className="rounded-[2px] border border-border bg-paper p-5 md:p-6 space-y-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="eyebrow text-crimson-deep">Stage 03 · Arrangement Configuration</p>
          <h2 id="stage-c-heading" className="type-display-md mt-1 text-foreground">
            Configure accompaniment
          </h2>
        </div>
        {instrumentsDiag && (
          <p className="text-xs text-muted-foreground">
            Synthesis:{" "}
            <span className="font-medium text-foreground">
              {synthReady
                ? `${instrumentsDiag.sound_library.soundfont_name ?? "Verified SoundFont"} · FluidSynth`
                : "Synthesis prerequisites unavailable"}
            </span>
          </p>
        )}
      </div>

      {instrumentsDiag && !synthReady && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[2px] border border-crimson/40 bg-crimson/5 px-4 py-3 text-xs text-crimson-deep"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">
              Multi-sampled instrument library is not ready on the backend
            </p>
            <p className="mt-0.5 text-foreground/80">
              {instrumentsDiag.sound_library.missing_reason ||
                "FluidSynth or a verified SF2/SF3 SoundFont is missing. SONORA will not substitute basic oscillator waveforms."}
            </p>
          </div>
        </div>
      )}

      {/* 1. Accompaniment Style */}
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Arrangement style
          </h3>
          <span className="text-xs text-muted-foreground">5 theory-driven arrangement styles</span>
        </div>
        <div
          role="radiogroup"
          aria-label="Arrangement style"
          className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5"
        >
          {ARRANGEMENT_STYLES.map((style) => {
            const active = config.style === style.id;
            return (
              <button
                key={style.id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => handleStyleSelect(style.id)}
                className={cn(
                  "flex flex-col items-start rounded-[2px] border p-3.5 text-left transition-colors disabled:opacity-60",
                  active
                    ? "border-primary bg-background ring-1 ring-primary"
                    : "border-border bg-background/70 hover:border-foreground/40 hover:bg-background",
                )}
              >
                <span className="text-sm font-medium text-foreground">{style.label}</span>
                <span className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {style.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Instrument Families + Per-Instrument Volume */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Instrument ensemble ({config.selected_instruments.length} of 6 selected)
          </h3>
          <label className="inline-flex items-center gap-2 text-xs text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={config.render_individual_stems}
              disabled={disabled}
              onChange={(e) => onChange({ ...config, render_individual_stems: e.target.checked })}
              className="size-4 accent-primary"
            />
            <span>Render individual instrument stems for mixer &amp; download</span>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INSTRUMENT_FAMILIES.map((inst) => {
            const selected = config.selected_instruments.includes(inst.id);
            const vol = config.instrument_volumes[inst.id] ?? inst.defaultVolume;
            return (
              <div
                key={inst.id}
                className={cn(
                  "rounded-[2px] border p-3.5 transition-colors",
                  selected
                    ? "border-foreground/30 bg-background"
                    : "border-border bg-background/40 opacity-75",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{inst.label}</p>
                    <p className="text-[11px] text-muted-foreground">{inst.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? "Remove" : "Include"} ${inst.label}`}
                    disabled={disabled || (selected && config.selected_instruments.length <= 1)}
                    onClick={() => toggleInstrument(inst.id)}
                    className={cn(
                      "inline-flex h-7 items-center gap-1 rounded-[2px] border px-2.5 text-xs font-medium transition-colors disabled:opacity-50",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-paper text-foreground hover:border-foreground",
                    )}
                  >
                    {selected && <Check className="size-3" aria-hidden />}
                    {selected ? "Active" : "Add"}
                  </button>
                </div>

                {selected && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <label htmlFor={`inst-vol-${inst.id}`}>MIDI velocity level</label>
                      <span className="font-mono tabular-nums text-foreground">
                        {Math.round(vol * 100)}%
                      </span>
                    </div>
                    <input
                      id={`inst-vol-${inst.id}`}
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={vol}
                      disabled={disabled}
                      onChange={(e) => setInstrumentVolume(inst.id, parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Energy, Density, Musical Overrides & Structure */}
      <div className="grid gap-5 border-t border-border pt-5 lg:grid-cols-2">
        {/* Dynamics & Density */}
        <div className="space-y-4 rounded-[2px] border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <Sliders className="size-3.5 text-primary" aria-hidden />
            <span>Expression &amp; Structure</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="arr-energy" className="font-medium text-foreground">
                Energy
              </label>
              <span className="font-mono tabular-nums text-muted-foreground">
                {Math.round(config.energy * 100)}%
              </span>
            </div>
            <input
              id="arr-energy"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.energy}
              disabled={disabled}
              onChange={(e) => onChange({ ...config, energy: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="arr-density" className="font-medium text-foreground">
                Arrangement density
              </label>
              <span className="font-mono tabular-nums text-muted-foreground">
                {Math.round(config.density * 100)}%
              </span>
            </div>
            <input
              id="arr-density"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.density}
              disabled={disabled}
              onChange={(e) => onChange({ ...config, density: parseFloat(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="arr-intro-bars" className="font-medium text-foreground">
                  Intro bars
                </label>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {config.intro_bars} bars
                </span>
              </div>
              <input
                id="arr-intro-bars"
                type="range"
                min={0}
                max={8}
                step={1}
                value={config.intro_bars}
                disabled={disabled}
                onChange={(e) => onChange({ ...config, intro_bars: parseInt(e.target.value, 10) })}
                className="w-full accent-primary"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="arr-outro-bars" className="font-medium text-foreground">
                  Outro bars
                </label>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {config.outro_bars} bars
                </span>
              </div>
              <input
                id="arr-outro-bars"
                type="range"
                min={0}
                max={8}
                step={1}
                value={config.outro_bars}
                disabled={disabled}
                onChange={(e) => onChange({ ...config, outro_bars: parseInt(e.target.value, 10) })}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Musical Overrides */}
        <div className="space-y-4 rounded-[2px] border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Key, Tempo &amp; Transposition Overrides
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={resetOverrides}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
            >
              <RotateCcw className="size-3" aria-hidden /> Use auto-detected
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="arr-key-override"
                className="block text-xs font-medium text-foreground"
              >
                Key override
              </label>
              <select
                id="arr-key-override"
                value={config.key_override ?? ""}
                disabled={disabled}
                onChange={(e) =>
                  onChange({ ...config, key_override: e.target.value ? e.target.value : null })
                }
                className="h-9 w-full rounded-[2px] border border-input bg-background px-2.5 text-xs text-foreground"
              >
                <option value="">Auto-detected ({detectedKey ?? "run analysis first"})</option>
                {KEY_SIGNATURE_OPTIONS.map((keyOpt) => (
                  <option key={keyOpt} value={keyOpt}>
                    {keyOpt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="arr-tempo-override"
                className="block text-xs font-medium text-foreground"
              >
                Tempo override (40–220 BPM)
              </label>
              <input
                id="arr-tempo-override"
                type="number"
                min={40}
                max={220}
                step={0.5}
                value={config.tempo_override_bpm ?? ""}
                disabled={disabled}
                placeholder={
                  detectedTempo ? `Auto (${detectedTempo.toFixed(1)} BPM)` : "Auto-detected"
                }
                onChange={(e) => {
                  const val = e.target.value.trim();
                  if (!val) {
                    onChange({ ...config, tempo_override_bpm: null });
                    return;
                  }
                  const parsed = parseFloat(val);
                  if (Number.isFinite(parsed)) {
                    onChange({
                      ...config,
                      tempo_override_bpm: Math.max(40, Math.min(220, parsed)),
                    });
                  }
                }}
                className="h-9 w-full rounded-[2px] border border-input bg-background px-2.5 font-mono text-xs tabular-nums text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="arr-transpose" className="font-medium text-foreground">
                Accompaniment transposition
              </label>
              <span className="font-mono tabular-nums text-muted-foreground">
                {config.transpose_semitones > 0
                  ? `+${config.transpose_semitones}`
                  : config.transpose_semitones}{" "}
                semitones
              </span>
            </div>
            <input
              id="arr-transpose"
              type="range"
              min={-12}
              max={12}
              step={1}
              value={config.transpose_semitones}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...config, transpose_semitones: parseInt(e.target.value, 10) })
              }
              className="w-full accent-primary"
            />
            <p className="text-[11px] text-muted-foreground">
              Shifts the arranged accompaniment harmony without pitch-shifting your original vocal
              recording.
            </p>
          </div>
        </div>
      </div>

      {/* Stage C -> D submission buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Generate accompaniment audio + MIDI only, or run the full vocal mix &amp; mastered export
          pipeline.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!canGenerate || isSubmitting || !synthReady}
            onClick={onGenerateAccompaniment}
          >
            Generate accompaniment only
          </Button>
          <Button
            type="button"
            disabled={!canGenerate || isSubmitting || !synthReady}
            onClick={onGenerateFullMix}
          >
            {isSubmitting ? "Submitting job…" : "Generate & master full mix"}
          </Button>
        </div>
      </div>
    </section>
  );
}

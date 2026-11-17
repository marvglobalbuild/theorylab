import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Eraser, Play, Volume2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePiano, type PhraseStep } from "@/lib/music/usePiano";
import { useMusic } from "@/lib/music/useMusic";
import {
  INTERVALS,
  ORDINALS,
  SHORTCUT_TO_NOTE,
  TREBLE_READING,
  displayNote,
  enharmonic,
  isSameKey,
  noteFrequency,
  semitonesBetween,
} from "@/lib/music/theory";
import { Piano } from "./Piano";
import { Staff, type StaffChord } from "./Staff";
import { AudioStatusLabel } from "./AudioStatusLabel";

type Mode = "play" | "read" | "intervals";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "play", label: "Keyboard", hint: "Play any key — each note is written on the staff." },
  { id: "read", label: "Notation", hint: "Select a note on the staff, or find it on the keyboard." },
  { id: "intervals", label: "Intervals", hint: "Choose an interval above middle C, then listen." },
];

const MAX_PLAYED = 8;
const EASE = [0.22, 1, 0.36, 1] as const;

export function Instrument() {
  const piano = usePiano();
  const music = useMusic();
  const [mode, setMode] = useState<Mode>("play");
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [sounding, setSounding] = useState<string[]>([]);
  const [played, setPlayed] = useState<string[]>([]);
  const [playedLitIndex, setPlayedLitIndex] = useState<number | null>(null);
  const [readIndex, setReadIndex] = useState<number | null>(0);
  const [readMiss, setReadMiss] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState("P5");
  const [showLabels, setShowLabels] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const interval = INTERVALS.find((i) => i.id === intervalId) ?? INTERVALS[0]!;

  const handleNoteStart = useCallback(
    (note: string) => {
      piano.noteOn(note);
      setPressed((prev) => new Set(prev).add(note));
      if (mode === "play") {
        setPlayed((prev) => {
          const next = [...prev, note].slice(-MAX_PLAYED);
          setPlayedLitIndex(next.length - 1);
          return next;
        });
      } else if (mode === "read") {
        const idx = TREBLE_READING.findIndex((n) => isSameKey(n.note, note));
        setReadIndex(idx >= 0 ? idx : null);
        setReadMiss(idx >= 0 ? null : note);
      }
    },
    [mode, piano],
  );

  const handleNoteEnd = useCallback(
    (note: string) => {
      piano.noteOff(note);
      setPressed((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    },
    [piano],
  );

  // Computer keyboard: active only while the instrument is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let visible = false;
    const io = new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? false), {
      threshold: 0.3,
    });
    io.observe(el);
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
    const down = (e: KeyboardEvent) => {
      if (!visible || e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const note = SHORTCUT_TO_NOTE[e.key.toLowerCase()];
      if (note) {
        e.preventDefault();
        handleNoteStart(note);
      }
    };
    const up = (e: KeyboardEvent) => {
      const note = SHORTCUT_TO_NOTE[e.key.toLowerCase()];
      if (note) handleNoteEnd(note);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [handleNoteStart, handleNoteEnd]);

  const selectReadNote = (index: number) => {
    setReadIndex(index);
    setReadMiss(null);
    const note = TREBLE_READING[index]?.note;
    if (!note) return;
    piano.playPhrase([{ notes: [note], at: 0, duration: 0.9 }], (s) => setSounding(s?.notes ?? []));
  };

  const playScale = () => {
    setReadMiss(null);
    const steps: PhraseStep[] = TREBLE_READING.map((item, i) => ({
      notes: [item.note],
      at: i * 0.42,
      duration: i === TREBLE_READING.length - 1 ? 1.1 : 0.45,
    }));
    piano.playPhrase(steps, (s) => {
      if (!s) {
        setSounding([]);
        return;
      }
      const idx = steps.indexOf(s);
      if (idx >= 0) setReadIndex(idx);
      setSounding(s.notes);
    });
  };

  const playPlayedPhrase = () => {
    if (!played.length) return;
    const steps: PhraseStep[] = played.map((n, i) => ({
      notes: [n],
      at: i * 0.42,
      duration: i === played.length - 1 ? 1.1 : 0.45,
    }));
    piano.playPhrase(steps, (s) => {
      if (!s) {
        setSounding([]);
        setPlayedLitIndex(played.length - 1);
        return;
      }
      const idx = steps.indexOf(s);
      if (idx >= 0) setPlayedLitIndex(idx);
      setSounding(s.notes);
    });
  };

  const selectPlayedNote = (index: number) => {
    const note = played[index];
    if (!note) return;
    setPlayedLitIndex(index);
    piano.playPhrase([{ notes: [note], at: 0, duration: 0.9 }], (s) => setSounding(s?.notes ?? []));
  };

  const playIntervalFor = (item: (typeof INTERVALS)[number], kind: "melodic" | "harmonic" | "both") => {
    const { lower, upper } = item;
    const melodic = [
      { notes: [lower], at: 0, duration: 0.7 },
      { notes: [upper], at: 0.75, duration: 0.7 },
    ];
    const harmonic = (at: number) => [{ notes: [lower, upper], at, duration: 1.4 }];
    const steps =
      kind === "melodic" ? melodic : kind === "harmonic" ? harmonic(0) : [...melodic, ...harmonic(1.6)];
    piano.playPhrase(steps, (s) => setSounding(s?.notes ?? []));
  };

  const playInterval = (kind: "melodic" | "harmonic" | "both") => playIntervalFor(interval, kind);

  const chooseInterval = (item: (typeof INTERVALS)[number]) => {
    setIntervalId(item.id);
    playIntervalFor(item, "melodic");
  };

  const activeNotes = useMemo(
    () => new Set([...pressed, ...sounding, ...music.notes]),
    [pressed, sounding, music.notes],
  );

  const highlightNotes = useMemo(() => {
    const reading = readIndex !== null ? TREBLE_READING[readIndex] : undefined;
    if (mode === "read" && reading) return new Set([reading.note]);
    if (mode === "intervals") {
      const toSharp = (n: string) => (enharmonic(n) && n.includes("b") ? enharmonic(n)! : n);
      return new Set([toSharp(interval.lower), toSharp(interval.upper)]);
    }
    return new Set<string>();
  }, [mode, readIndex, interval]);

  const chords: StaffChord[] = useMemo(() => {
    if (mode === "play") return played.map((n) => ({ keys: [n], duration: "q" }));
    if (mode === "read") return TREBLE_READING.map((n) => ({ keys: [n.note], duration: "q" }));
    return [
      { keys: [interval.lower], duration: "q" },
      { keys: [interval.upper], duration: "q" },
      { keys: [interval.lower, interval.upper], duration: "h" },
    ];
  }, [mode, played, interval]);

  const activePlayIndex =
    played.length === 0 ? null : playedLitIndex !== null && playedLitIndex < played.length ? playedLitIndex : played.length - 1;
  const activePlayedNote = activePlayIndex !== null ? played[activePlayIndex] : undefined;
  const previousPlayedNote =
    activePlayIndex !== null && activePlayIndex > 0 ? played[activePlayIndex - 1] : undefined;

  const currentReadIndex = readIndex ?? 0;

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-sm border border-ink-border bg-ink-raised shadow-[var(--shadow-lift)]"
    >
      <Tabs.Root value={mode} onValueChange={(v) => setMode(v as Mode)}>
        {/* Top bar */}
        <div className="flex flex-col gap-3 border-b border-ink-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <Tabs.List aria-label="Demonstration" className="flex w-full gap-1 rounded-sm bg-ink-deep p-1 sm:w-auto">
            {MODES.map((m) => (
              <Tabs.Trigger
                key={m.id}
                value={m.id}
                className="relative flex-1 rounded-[2px] px-3 py-2 text-center text-sm text-ink-muted transition-colors hover:text-ink-foreground data-[state=active]:text-ink-foreground sm:flex-initial sm:px-4"
              >
                {mode === m.id && (
                  <motion.span
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-[2px] bg-ink-raised"
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                )}
                <span className="relative">{m.label}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
            <AudioStatusLabel status={piano.status} />
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="size-3.5 accent-[var(--primary-soft)]"
              />
              Note names
            </label>
          </div>
        </div>

        {/* Score + readout */}
        <div className="grid lg:grid-cols-12">
          <div className="paper-grain border-b border-ink-border bg-paper px-3 py-5 text-foreground md:px-6 lg:col-span-7 lg:border-r lg:border-b-0">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 px-1">
              <span className="eyebrow text-muted-foreground">Treble staff</span>
              {mode === "play" && played.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={playPlayedPhrase}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    <Play className="size-3.5" aria-hidden /> Play back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlayed([]);
                      setPlayedLitIndex(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <Eraser className="size-3.5" aria-hidden /> Clear
                  </button>
                </div>
              )}
            </div>
            <Staff
              chords={chords}
              height={160}
              label={staffLabel(mode, played, interval.name)}
              selectedIndex={mode === "read" ? readIndex : mode === "play" ? activePlayIndex : null}
              {...(mode === "read"
                ? { onSelect: selectReadNote }
                : mode === "play" && played.length > 0
                  ? { onSelect: selectPlayedNote }
                  : {})}
              emptyMessage="Play a key to write it here"
            />
          </div>

          <div className="flex min-h-[12rem] flex-col justify-between gap-6 px-5 py-6 md:min-h-[15rem] md:px-8 lg:col-span-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
                aria-live="polite"
              >
                <p className="eyebrow mb-4 text-crimson-soft">{MODES.find((m) => m.id === mode)?.hint}</p>
                {mode === "play" && (
                  <PlayReadout note={activePlayedNote} previousNote={previousPlayedNote} />
                )}
                {mode === "read" && <ReadReadout index={readIndex} miss={readMiss} />}
                {mode === "intervals" && (
                  <div>
                    <p className="type-display-md text-ink-foreground">{interval.name}</p>
                    <p className="mt-2 text-sm text-ink-muted">
                      {displayNote(interval.lower)} – {displayNote(interval.upper)} ·{" "}
                      {interval.semitones} semitone{interval.semitones > 1 ? "s" : ""} · a{" "}
                      {ORDINALS[interval.number]}
                    </p>
                    <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-foreground/85">
                      {interval.description}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {mode === "play" && activePlayedNote && (
              <div className="flex flex-wrap gap-2">
                <PlayButton onClick={() => selectPlayedNote(activePlayIndex!)}>
                  Hear {displayNote(activePlayedNote)}
                </PlayButton>
                {played.length > 1 && (
                  <PlayButton onClick={playPlayedPhrase} primary>
                    Play phrase ({played.length})
                  </PlayButton>
                )}
              </div>
            )}

            {mode === "read" && (
              <div className="flex flex-wrap items-center gap-2">
                <PlayButton onClick={playScale} primary>
                  Play scale
                </PlayButton>
                <button
                  type="button"
                  onClick={() => selectReadNote((currentReadIndex - 1 + TREBLE_READING.length) % TREBLE_READING.length)}
                  aria-label="Previous note"
                  className="inline-flex h-10 items-center gap-1 rounded-[2px] border border-ink-border px-3 text-sm text-ink-foreground transition-colors hover:border-ink-muted"
                >
                  <ChevronLeft className="size-4" aria-hidden /> Prev
                </button>
                <button
                  type="button"
                  onClick={() => selectReadNote((currentReadIndex + 1) % TREBLE_READING.length)}
                  aria-label="Next note"
                  className="inline-flex h-10 items-center gap-1 rounded-[2px] border border-ink-border px-3 text-sm text-ink-foreground transition-colors hover:border-ink-muted"
                >
                  Next <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            )}

            {mode === "intervals" && (
              <div className="flex flex-wrap gap-2">
                <PlayButton onClick={() => playInterval("both")} primary>
                  Play both ways
                </PlayButton>
                <PlayButton onClick={() => playInterval("melodic")}>Melodic</PlayButton>
                <PlayButton onClick={() => playInterval("harmonic")}>Harmonic</PlayButton>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mode === "intervals" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden border-t border-ink-border"
            >
              <div className="px-4 py-4 md:px-6">
                <div
                  role="radiogroup"
                  aria-label="Interval above middle C"
                  className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12"
                >
                  {INTERVALS.map((i) => (
                    <button
                      key={i.id}
                      type="button"
                      role="radio"
                      aria-checked={i.id === intervalId}
                      aria-label={i.name}
                      onClick={() => chooseInterval(i)}
                      className={cn(
                        "rounded-[2px] border px-2 py-2.5 text-center transition-colors",
                        i.id === intervalId
                          ? "border-primary-soft bg-primary text-primary-foreground"
                          : "border-ink-border text-ink-muted hover:border-ink-muted hover:text-ink-foreground",
                      )}
                    >
                      <span className="block font-display text-lg leading-none">{i.short}</span>
                      <span className="mt-1 block text-[0.62rem] tracking-wide opacity-80">
                        {i.semitones} st
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard */}
        <div className="border-t border-ink-border bg-ink-deep px-2 pt-3 pb-4 md:px-5 md:pb-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />
          </div>
          <Piano
            className="h-40 sm:h-44 md:h-52"
            activeNotes={activeNotes}
            highlightNotes={highlightNotes}
            showLabels={showLabels}
            onNoteStart={handleNoteStart}
            onNoteEnd={handleNoteEnd}
          />
          <p className="mt-3 hidden px-1 text-xs text-ink-muted lg:block">
            Tip: your computer keyboard plays too — <kbd className="font-sans text-ink-foreground">A</kbd> is
            middle C, the row above gives the black keys.
          </p>
        </div>
      </Tabs.Root>
    </div>
  );
}

function staffLabel(mode: Mode, played: string[], intervalName: string) {
  if (mode === "play")
    return played.length
      ? `Treble staff showing ${played.map((n) => displayNote(n)).join(", ")}`
      : "Empty treble staff";
  if (mode === "read") return "Treble staff showing the C major scale from middle C to C5";
  return `Treble staff showing a ${intervalName} above middle C, melodically then harmonically`;
}

function PlayReadout({ note, previousNote }: { note: string | undefined; previousNote: string | undefined }) {
  if (!note)
    return (
      <p className="type-display-md text-ink-foreground/80">
        Press a key to begin. Sound starts only when you play.
      </p>
    );
  const alt = enharmonic(note);
  const stepSemitones = previousNote ? Math.abs(semitonesBetween(previousNote, note)) : null;
  const stepLabel =
    stepSemitones === null
      ? null
      : stepSemitones === 0
        ? "Unison"
        : `${stepSemitones} semitone${stepSemitones === 1 ? "" : "s"}`;

  return (
    <div>
      <p className="font-display text-5xl leading-none text-ink-foreground sm:text-6xl md:text-7xl">
        {displayNote(note)}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-ink-muted">Also written</dt>
          <dd className="mt-0.5 text-ink-foreground">{alt ? displayNote(alt) : "—"}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Frequency</dt>
          <dd className="mt-0.5 text-ink-foreground tabular-nums">{noteFrequency(note).toFixed(2)} Hz</dd>
        </div>
        {previousNote && stepLabel && (
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-ink-muted">From {displayNote(previousNote)}</dt>
            <dd className="mt-0.5 text-ink-foreground">{stepLabel}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function ReadReadout({ index, miss }: { index: number | null; miss: string | null }) {
  if (miss)
    return (
      <div>
        <p className="font-display text-5xl leading-none text-ink-foreground sm:text-6xl md:text-7xl">
          {displayNote(miss)}
        </p>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-foreground/85">
          Not part of this C major scale. Find one of the eight notes on the staff — the white keys from middle
          C upward.
        </p>
      </div>
    );
  const item = index === null ? undefined : TREBLE_READING[index];
  if (!item) return null;
  return (
    <div>
      <p className="font-display text-5xl leading-none text-ink-foreground sm:text-6xl md:text-7xl">
        {displayNote(item.note)}
      </p>
      <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-foreground/85">{item.position}</p>
    </div>
  );
}

function PlayButton({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-[2px] px-4 text-sm transition-colors",
        primary
          ? "bg-ink-foreground text-ink-deep hover:bg-paper"
          : "border border-ink-border text-ink-foreground hover:border-ink-muted",
      )}
    >
      {primary ? <Play className="size-3.5" aria-hidden /> : <Volume2 className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}

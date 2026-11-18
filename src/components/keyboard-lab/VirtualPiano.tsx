import { Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight, Music } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  generateKeyboardKeys,
  type VirtualKeyDefinition,
} from "@/lib/music/keyboard-lab";
import { displayNote } from "@/lib/music/theory";
import { usePiano } from "@/lib/music/usePiano";
import { cn } from "@/lib/utils";

export interface VirtualPianoProps {
  startOctave?: number | undefined;
  numOctaves?: number | undefined;
  activeNotes?: ReadonlySet<string> | undefined;
  highlightNotes?: ReadonlySet<string> | undefined;
  targetNotes?: ReadonlySet<string> | undefined; // For practice targets
  showLabels?: "all" | "c-only" | "none" | undefined;
  showShortcuts?: boolean | undefined;
  onNotePlay?: ((note: string) => void) | undefined;
  onNoteRelease?: ((note: string) => void) | undefined;
  className?: string | undefined;
  allowKeyboardShortcuts?: boolean | undefined;
  sustainEnabled?: boolean | undefined;
}

export function VirtualPiano({
  startOctave = 3,
  numOctaves = 3,
  activeNotes: externalActiveNotes,
  highlightNotes,
  targetNotes,
  showLabels = "all",
  showShortcuts = true,
  onNotePlay,
  onNoteRelease,
  className,
  allowKeyboardShortcuts = true,
  sustainEnabled = false,
}: VirtualPianoProps) {
  const piano = usePiano();

  // Internal state for held notes if not externally driven
  const [internalActiveNotes, setInternalActiveNotes] = useState<Set<string>>(new Set());
  const activeSet = externalActiveNotes ?? internalActiveNotes;

  // Track pointer IDs to notes for multi-touch & slide glissando
  const pointers = useRef(new Map<number, string>());
  // Track notes held by sustain
  const sustainedNotes = useRef<Set<string>>(new Set());

  // Generate piano keys according to octave range
  const keys = useMemo(() => {
    return generateKeyboardKeys(startOctave, numOctaves);
  }, [startOctave, numOctaves]);

  // Group white keys and their corresponding black keys
  interface WhiteKeyBundle {
    white: VirtualKeyDefinition;
    black?: VirtualKeyDefinition;
  }

  const bundles = useMemo(() => {
    const list: WhiteKeyBundle[] = [];
    keys.forEach((key) => {
      if (key.isBlack) {
        const last = list.at(-1);
        if (last) last.black = key;
      } else {
        list.push({ white: key });
      }
    });
    return list;
  }, [keys]);

  // Handle note attack
  const handleNoteStart = useCallback(
    (note: string) => {
      setInternalActiveNotes((prev) => new Set(prev).add(note));
      piano.noteOn(note);
      onNotePlay?.(note);
    },
    [piano, onNotePlay],
  );

  // Handle note release
  const handleNoteEnd = useCallback(
    (note: string) => {
      if (sustainEnabled) {
        sustainedNotes.current.add(note);
        return;
      }
      setInternalActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      piano.noteOff(note);
      onNoteRelease?.(note);
    },
    [sustainEnabled, piano, onNoteRelease],
  );

  // Release sustained notes when sustain is toggled off
  useEffect(() => {
    if (!sustainEnabled && sustainedNotes.current.size > 0) {
      sustainedNotes.current.forEach((note) => {
        piano.noteOff(note);
        onNoteRelease?.(note);
      });
      sustainedNotes.current.clear();
      setInternalActiveNotes(new Set());
    }
  }, [sustainEnabled, piano, onNoteRelease]);

  // Physical computer keyboard event listener
  useEffect(() => {
    if (!allowKeyboardShortcuts) return;

    const keyMap = new Map<string, string>();
    keys.forEach((k) => {
      if (k.shortcut) {
        keyMap.set(k.shortcut.toLowerCase(), k.note);
      }
    });

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing into input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.repeat) return;
      const char = e.key.toLowerCase();
      const note = keyMap.get(char);
      if (note) {
        e.preventDefault();
        handleNoteStart(note);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const char = e.key.toLowerCase();
      const note = keyMap.get(char);
      if (note) {
        e.preventDefault();
        handleNoteEnd(note);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [keys, allowKeyboardShortcuts, handleNoteStart, handleNoteEnd]);

  // Pointer event helpers for piano keys
  const startPointerNote = (pointerId: number, note: string) => {
    const prev = pointers.current.get(pointerId);
    if (prev === note) return;
    if (prev) handleNoteEnd(prev);
    pointers.current.set(pointerId, note);
    handleNoteStart(note);
  };

  const endPointerNote = (pointerId: number) => {
    const note = pointers.current.get(pointerId);
    if (!note) return;
    pointers.current.delete(pointerId);
    handleNoteEnd(note);
  };

  const getKeyProps = (key: VirtualKeyDefinition) => {
    const isActive = activeSet.has(key.note);
    const isHighlight = highlightNotes?.has(key.note) ?? false;
    const isTarget = targetNotes?.has(key.note) ?? false;

    return {
      type: "button" as const,
      "aria-label": `${key.note} ${key.isBlack ? "Black Key" : "White Key"}${key.isMiddleC ? " (Middle C)" : ""}`,
      "data-note": key.note,
      "data-active": isActive,
      "data-highlight": isHighlight,
      "data-target": isTarget,
      onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (
          typeof e.currentTarget.hasPointerCapture === "function" &&
          e.currentTarget.hasPointerCapture(e.pointerId)
        ) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        startPointerNote(e.pointerId, key.note);
      },
      onPointerEnter: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.buttons === 1) {
          startPointerNote(e.pointerId, key.note);
        }
      },
      onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
        endPointerNote(e.pointerId);
      },
      onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
        endPointerNote(e.pointerId);
      },
      onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
        if (e.pointerType === "mouse") {
          endPointerNote(e.pointerId);
        }
      },
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    };
  };

  return (
    <div className={cn("relative w-full select-none touch-none", className)}>
      {/* Horizontal scrolling wrapper to support small mobile viewports cleanly */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div
          role="group"
          aria-label="Interactive Virtual Piano Keyboard"
          className="relative mx-auto flex h-48 sm:h-56 md:h-64 min-w-[640px] max-w-full rounded-[4px] border-2 border-stone-800 bg-stone-900 p-1.5 shadow-2xl"
          onPointerUp={(e) => endPointerNote(e.pointerId)}
        >
          {bundles.map(({ white, black }, idx) => {
            const isC = white.letter === "C";
            const isMiddleC = white.isMiddleC;
            const isWhiteActive = activeSet.has(white.note);
            const isWhiteHighlight = highlightNotes?.has(white.note);
            const isWhiteTarget = targetNotes?.has(white.note);

            const showWhiteLabel =
              showLabels === "all" || (showLabels === "c-only" && isC);

            return (
              <div key={white.note} className="relative flex-1 h-full">
                {/* White Key */}
                <button
                  {...getKeyProps(white)}
                  className={cn(
                    "flex h-full w-full flex-col items-center justify-end rounded-b-[4px] border border-stone-300 pb-3 transition-all duration-75 outline-none",
                    isWhiteActive
                      ? "bg-amber-100 dark:bg-amber-200 border-amber-400 translate-y-0.5 shadow-inner"
                      : isWhiteTarget
                        ? "bg-emerald-100 border-emerald-500 shadow-sm"
                        : isWhiteHighlight
                          ? "bg-crimson/15 border-crimson"
                          : "bg-white hover:bg-stone-50 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.15)]",
                  )}
                >
                  {/* Middle C Indicator Marker */}
                  {isMiddleC && (
                    <div className="mb-2 flex items-center justify-center">
                      <span className="inline-flex size-2 rounded-full bg-crimson shadow" />
                    </div>
                  )}

                  {/* Keyboard shortcut hint */}
                  {showShortcuts && white.shortcut && (
                    <span className="mb-1 text-[10px] font-mono font-bold uppercase text-stone-400">
                      {white.shortcut}
                    </span>
                  )}

                  {/* Note label */}
                  {showWhiteLabel && (
                    <span
                      className={cn(
                        "font-display text-xs font-semibold leading-none",
                        isMiddleC
                          ? "text-crimson-deep font-bold"
                          : isC
                            ? "text-stone-900 font-bold"
                            : "text-stone-600",
                      )}
                    >
                      {displayNote(white.note)}
                    </span>
                  )}
                </button>

                {/* Black Key */}
                {black && (
                  <button
                    {...getKeyProps(black)}
                    className={cn(
                      "absolute top-0 right-0 z-20 flex h-[62%] w-[64%] translate-x-1/2 flex-col items-center justify-end rounded-b-[3px] border border-stone-950 pb-2 transition-all duration-75 outline-none shadow-md",
                      activeSet.has(black.note)
                        ? "bg-amber-600 border-amber-300 translate-y-0.5"
                        : targetNotes?.has(black.note)
                          ? "bg-emerald-600 border-emerald-300"
                          : highlightNotes?.has(black.note)
                            ? "bg-crimson border-crimson/50"
                            : "bg-stone-900 hover:bg-stone-800 shadow-[inset_0_-3px_3px_rgba(255,255,255,0.15)]",
                    )}
                  >
                    {showShortcuts && black.shortcut && (
                      <span className="mb-1 text-[9px] font-mono font-bold uppercase text-stone-300">
                        {black.shortcut}
                      </span>
                    )}

                    {showLabels === "all" && (
                      <span className="text-[10px] font-mono font-medium text-stone-200 line-clamp-1">
                        {displayNote(black.note, false)}
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";
import { KEYBOARD_KEYS, displayNote, type KeyboardKey } from "@/lib/music/theory";

interface PianoProps {
  activeNotes: ReadonlySet<string>;
  highlightNotes?: ReadonlySet<string>;
  showLabels: boolean;
  onNoteStart: (note: string) => void;
  onNoteEnd: (note: string) => void;
  className?: string;
}

/** Number of white keys shown on phones (C4–C5); larger screens show C4–C6. */
const MOBILE_WHITE_KEYS = 8;

interface WhiteKeyGroup {
  white: KeyboardKey;
  black?: KeyboardKey;
}

const GROUPS: WhiteKeyGroup[] = KEYBOARD_KEYS.reduce<WhiteKeyGroup[]>((acc, key) => {
  const last = acc.at(-1);
  if (key.isBlack && last) last.black = key;
  else acc.push({ white: key });
  return acc;
}, []);

function spokenName(note: string) {
  return displayNote(note).replace("♯", " sharp ").replace("♭", " flat ");
}

export function Piano({
  activeNotes,
  highlightNotes,
  showLabels,
  onNoteStart,
  onNoteEnd,
  className,
}: PianoProps) {
  // pointerId -> note, so multi-touch chords and glissandi release correctly
  const pointers = useRef(new Map<number, string>());

  const start = useCallback(
    (pointerId: number, note: string) => {
      const prev = pointers.current.get(pointerId);
      if (prev === note) return;
      if (prev) onNoteEnd(prev);
      pointers.current.set(pointerId, note);
      onNoteStart(note);
    },
    [onNoteStart, onNoteEnd],
  );

  const end = useCallback(
    (pointerId: number) => {
      const note = pointers.current.get(pointerId);
      if (!note) return;
      pointers.current.delete(pointerId);
      onNoteEnd(note);
    },
    [onNoteEnd],
  );

  const keyProps = (key: KeyboardKey) => ({
    type: "button" as const,
    "aria-label": spokenName(key.note),
    "data-active": activeNotes.has(key.note),
    "data-highlight": highlightNotes?.has(key.note) ?? false,
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      // Release implicit touch capture so a finger can slide across keys
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      start(e.pointerId, key.note);
    },
    onPointerEnter: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.buttons === 1 && pointers.current.has(e.pointerId)) start(e.pointerId, key.note);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => end(e.pointerId),
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => end(e.pointerId),
    onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "mouse") end(e.pointerId);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
        e.preventDefault();
        onNoteStart(key.note);
      }
    },
    onKeyUp: (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") onNoteEnd(key.note);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div
      role="group"
      aria-label="Piano keyboard"
      className={cn("relative flex select-none touch-none", className)}
      onPointerUp={(e) => end(e.pointerId)}
    >
      {GROUPS.map(({ white, black }, i) => {
        const hiddenOnMobile = i >= MOBILE_WHITE_KEYS;
        const blackHiddenOnMobile = i >= MOBILE_WHITE_KEYS - 1;
        const isC = white.note.startsWith("C");
        return (
          <div key={white.note} className={cn("relative flex-1", hiddenOnMobile && "hidden md:block")}>
            <button
              {...keyProps(white)}
              className="key-white flex h-full w-full flex-col items-center justify-end rounded-b-[3px] pb-2.5 outline-offset-[-4px] md:pb-3"
            >
              {showLabels && (
                <>
                  {white.shortcut && (
                    <span className="mb-1 hidden text-[0.62rem] uppercase text-faint lg:block">
                      {white.shortcut}
                    </span>
                  )}
                  <span
                    className={cn(
                      "font-sans text-[0.7rem] font-medium md:text-xs",
                      isC ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {isC ? displayNote(white.note) : displayNote(white.note, false)}
                  </span>
                </>
              )}
            </button>
            {black && (
              <button
                {...keyProps(black)}
                className={cn(
                  "key-black absolute top-0 right-0 z-10 flex h-[60%] w-[60%] translate-x-1/2 flex-col items-center justify-end rounded-b-[3px] pb-2 outline-offset-[-3px]",
                  blackHiddenOnMobile && "hidden md:flex",
                )}
              >
                {showLabels && (
                  <span className="text-[0.58rem] font-medium text-ink-muted md:text-[0.62rem]">
                    {displayNote(black.note, false)}
                  </span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

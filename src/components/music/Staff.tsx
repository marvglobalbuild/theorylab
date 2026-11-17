import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { displayNote, parseNote, toVexKey } from "@/lib/music/theory";

export type StaffDuration =
  "16" | "8" | "q" | "h" | "w" | "8d" | "qd" | "hd" | "8r" | "qr" | "hr" | "wr";

export type StaffClef = "treble" | "bass" | "alto" | "tenor";

export interface StaffChord {
  /** Scientific pitch names, e.g. ["C4", "E4"] (omit or empty for rests) */
  keys: string[];
  duration: StaffDuration;
}

interface HitBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface StaffProps {
  chords: StaffChord[];
  /** Accessible description of the whole staff */
  label: string;
  clef?: StaffClef | undefined;
  keySignature?: string | undefined;
  timeSignature?: string | undefined;
  beamNotes?: boolean | undefined;
  tuplet?: { start: number; end: number; numNotes?: number | undefined } | undefined;
  selectedIndex?: number | null | undefined;
  onSelect?: ((index: number) => void) | undefined;
  /** Animate noteheads in one after another on first render */
  revealNotes?: boolean | undefined;
  height?: number | undefined;
  className?: string | undefined;
  emptyMessage?: string | undefined;
}

type VexModule = typeof import("vexflow/bravura");

let vexPromise: Promise<VexModule["default"]> | null = null;
function loadVex() {
  if (!vexPromise) {
    vexPromise = import("vexflow/bravura").then(async (m) => {
      await document.fonts.load("30px Bravura").catch(() => undefined);
      return m.default;
    });
  }
  return vexPromise;
}

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function restDefaultKey(clef: StaffClef): string {
  if (clef === "bass") return "d/3";
  if (clef === "alto") return "c/4";
  if (clef === "tenor") return "a/3";
  return "b/4";
}

function parseDurationSpec(raw: StaffDuration): {
  baseDuration: string;
  isRest: boolean;
  isDotted: boolean;
} {
  const isRest = raw.endsWith("r");
  if (isRest) {
    return { baseDuration: raw, isRest: true, isDotted: false };
  }
  const isDotted = raw.endsWith("d");
  return {
    baseDuration: isDotted ? raw.slice(0, -1) : raw,
    isRest: false,
    isDotted,
  };
}

/**
 * Musical staff engraved with VexFlow. Supports treble, bass, alto, and tenor
 * clefs, key/time signatures, dotted values, rests, beaming, and tuplets.
 * Rendering is client-only; the server outputs an empty frame of the same
 * height so layout does not shift.
 */
export function Staff({
  chords,
  label,
  clef = "treble",
  keySignature,
  timeSignature,
  beamNotes = false,
  tuplet,
  selectedIndex = null,
  onSelect,
  revealNotes = false,
  height = 150,
  className,
  emptyMessage,
}: StaffProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [boxes, setBoxes] = useState<HitBox[]>([]);
  const revealed = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(
      ([entry]) => entry && setWidth(Math.round(entry.contentRect.width)),
    );
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const signature = JSON.stringify({
    chords,
    clef,
    keySignature: keySignature ?? "",
    timeSignature: timeSignature ?? "",
    beamNotes,
    tuplet: tuplet ?? null,
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host || width === 0) return;
    let cancelled = false;

    loadVex().then((VF) => {
      if (cancelled || !hostRef.current) return;
      const { Renderer, Stave, StaveNote, Accidental, Formatter, Dot, Beam, Tuplet } = VF;
      const W = Math.max(280, Math.min(width, 720));
      host.innerHTML = "";
      const renderer = new Renderer(host, Renderer.Backends.SVG);
      renderer.resize(W, height);
      const ctx = renderer.getContext();
      const ink = cssVar("--foreground");
      const highlight = cssVar("--primary");
      ctx.setFillStyle(ink);
      ctx.setStrokeStyle(ink);

      const top = (height - 100) / 2;
      const stave = new Stave(6, top, W - 12);
      stave.addClef(clef);
      if (keySignature) {
        stave.addKeySignature(keySignature);
      }
      if (timeSignature) {
        stave.addTimeSignature(timeSignature);
      }
      stave.setContext(ctx).draw();

      const notes = chords.map((chord, i) => {
        const { baseDuration, isRest, isDotted } = parseDurationSpec(chord.duration);
        const vexKeys = isRest
          ? [chord.keys[0] ? toVexKey(chord.keys[0]) : restDefaultKey(clef)]
          : chord.keys.map(toVexKey);

        const note = new StaveNote({
          clef,
          keys: vexKeys,
          duration: baseDuration,
          autoStem: !isRest,
        });

        if (!isRest) {
          chord.keys.forEach((k, ki) => {
            const acc = parseNote(k).accidental;
            if (acc) note.addModifier(new Accidental(acc), ki);
          });
        }

        if (isDotted) {
          Dot.buildAndAttach([note], { all: true });
        }

        const color = i === selectedIndex ? highlight : ink;
        note.setStyle({ fillStyle: color, strokeStyle: color });
        return note;
      });

      const beams = beamNotes && notes.length > 1 ? Beam.generateBeams(notes) : [];
      const tupletObj =
        tuplet && notes.length > tuplet.end && tuplet.start >= 0
          ? new Tuplet(notes.slice(tuplet.start, tuplet.end + 1), {
              numNotes: tuplet.numNotes ?? tuplet.end - tuplet.start + 1,
            })
          : null;

      if (notes.length) {
        Formatter.FormatAndDraw(ctx, stave, notes);
      }
      beams.forEach((b) => b.setContext(ctx).draw());
      if (tupletObj) {
        tupletObj.setContext(ctx).draw();
      }

      const svg = host.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${W} ${height}`);
        svg.setAttribute("aria-hidden", "true");
        svg.removeAttribute("width");
        svg.removeAttribute("height");
      }

      const shouldReveal = revealNotes && !revealed.current;
      notes.forEach((n, i) => {
        const el = n.getSVGElement();
        if (el && shouldReveal) {
          el.classList.add("staff-note-reveal");
          el.style.animationDelay = `${600 + i * 180}ms`;
        }
      });
      if (shouldReveal) revealed.current = true;

      setBoxes(
        notes.map((n) => {
          const bb = n.getBoundingBox();
          const w = Math.max(bb.getW(), 32);
          const x = bb.getX() - (w - bb.getW()) / 2;
          return {
            left: (x / W) * 100,
            width: (w / W) * 100,
            top: (Math.max(bb.getY(), 0) / height) * 100,
            height: (Math.min(bb.getH(), height) / height) * 100,
          };
        }),
      );
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, selectedIndex, width, height]);

  return (
    <div className={cn("relative", className)} role="img" aria-label={label}>
      <div
        ref={hostRef}
        className="staff-svg text-foreground"
        style={{ minHeight: height * 0.6 }}
      />
      {emptyMessage && chords.length === 0 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
      {onSelect &&
        boxes.map((box, i) => {
          const chord = chords[i];
          if (!chord) return null;
          const isRest = chord.duration.endsWith("r");
          const ariaLabel = isRest
            ? `Rest ${i + 1}`
            : `Note ${i + 1}: ${chord.keys.map((k) => displayNote(k)).join(" and ")}`;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={selectedIndex === i}
              aria-label={ariaLabel}
              className="absolute rounded-sm transition-colors hover:bg-primary/8 focus-visible:bg-primary/10"
              style={{
                left: `${box.left}%`,
                width: `${box.width}%`,
                top: `${box.top}%`,
                height: `${box.height}%`,
              }}
            />
          );
        })}
    </div>
  );
}

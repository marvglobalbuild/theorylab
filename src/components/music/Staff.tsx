import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { displayNote, parseNote, toVexKey } from "@/lib/music/theory";

export interface StaffChord {
  /** Scientific pitch names, e.g. ["C4", "E4"] */
  keys: string[];
  duration: "q" | "h" | "w";
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
  selectedIndex?: number | null;
  onSelect?: (index: number) => void;
  /** Animate noteheads in one after another on first render */
  revealNotes?: boolean;
  height?: number;
  className?: string;
  emptyMessage?: string;
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

/**
 * Treble staff engraved with VexFlow. Rendering is client-only; the server
 * outputs an empty frame of the same height so layout does not shift.
 */
export function Staff({
  chords,
  label,
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
    if (!host) return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(Math.round(entry.contentRect.width)));
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  const signature = JSON.stringify(chords);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || width === 0) return;
    let cancelled = false;

    loadVex().then((VF) => {
      if (cancelled || !hostRef.current) return;
      const { Renderer, Stave, StaveNote, Accidental, Formatter } = VF;
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
      stave.addClef("treble");
      stave.setContext(ctx).draw();

      const notes = chords.map((chord, i) => {
        const note = new StaveNote({
          keys: chord.keys.map(toVexKey),
          duration: chord.duration,
          autoStem: true,
        });
        chord.keys.forEach((k, ki) => {
          const acc = parseNote(k).accidental;
          if (acc) note.addModifier(new Accidental(acc), ki);
        });
        const color = i === selectedIndex ? highlight : ink;
        note.setStyle({ fillStyle: color, strokeStyle: color });
        return note;
      });

      if (notes.length) Formatter.FormatAndDraw(ctx, stave, notes);

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
          const w = Math.max(bb.getW(), 26);
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
      <div ref={hostRef} className="staff-svg text-foreground" style={{ minHeight: height * 0.6 }} />
      {emptyMessage && chords.length === 0 && (
        <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
      {onSelect &&
        boxes.map((box, i) => {
          const chord = chords[i];
          if (!chord) return null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={selectedIndex === i}
              aria-label={`Note ${i + 1}: ${chord.keys.map((k) => displayNote(k)).join(" and ")}`}
              className="absolute rounded-sm transition-colors hover:bg-primary/8 focus-visible:bg-primary/10"
              style={{ left: `${box.left}%`, width: `${box.width}%`, top: `${box.top}%`, height: `${box.height}%` }}
            />
          );
        })}
    </div>
  );
}

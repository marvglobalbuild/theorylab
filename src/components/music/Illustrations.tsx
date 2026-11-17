/** Small line illustrations drawn in currentColor. Purely decorative. */
import { cn } from "@/lib/utils";

const base = "h-12 w-auto text-foreground";

export function StaffGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 48" aria-hidden className={cn(base, className)} fill="none">
      {[10, 17, 24, 31, 38].map((y) => (
        <line key={y} x1="0" x2="88" y1={y} y2={y} stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      ))}
      <ellipse cx="22" cy="34.5" rx="4.4" ry="3.2" transform="rotate(-20 22 34.5)" className="fill-primary" />
      <line x1="26" y1="33.5" x2="26" y2="12" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="46" cy="27.5" rx="4.4" ry="3.2" transform="rotate(-20 46 27.5)" fill="currentColor" />
      <line x1="50" y1="26.5" x2="50" y2="5" stroke="currentColor" strokeWidth="1" />
      <ellipse cx="70" cy="20.5" rx="4.4" ry="3.2" transform="rotate(-20 70 20.5)" fill="currentColor" />
      <line x1="66" y1="21.5" x2="66" y2="43" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function KeysGlyph({ className, highlight = [] }: { className?: string; highlight?: number[] }) {
  const whites = 7;
  const w = 12;
  const blacks = [0, 1, 3, 4, 5];
  return (
    <svg viewBox={`0 0 ${whites * w + 1} 48`} aria-hidden className={cn(base, className)}>
      {Array.from({ length: whites }, (_, i) => (
        <rect
          key={i}
          x={i * w + 0.5}
          y="0.5"
          width={w}
          height="47"
          rx="1"
          className={highlight.includes(i) ? "fill-primary/15" : "fill-paper"}
          stroke="currentColor"
          strokeWidth="0.8"
        />
      ))}
      {blacks.map((i) => (
        <rect key={i} x={i * w + w * 0.68} y="0.5" width={w * 0.64} height="29" rx="1" fill="currentColor" />
      ))}
      {highlight.map((i) => (
        <circle key={i} cx={i * w + w / 2 + 0.5} cy="40" r="2.2" className="fill-primary" />
      ))}
    </svg>
  );
}

export function WaveGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 48" aria-hidden className={cn(base, className)} fill="none">
      <path d="M0 24 Q 5.5 8 11 24 T 22 24 T 33 24 T 44 24" stroke="currentColor" strokeWidth="1" />
      <path d="M44 24 Q 49.5 14 55 24 T 66 24 T 77 24 T 88 24" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path d="M0 24 Q 11 2 22 24 T 44 24 T 66 24 T 88 24" className="stroke-primary" strokeWidth="1.2" />
    </svg>
  );
}

export function StepsGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 48" aria-hidden className={cn(base, className)} fill="none">
      <path d="M2 44 H 22 V 33 H 44 V 22 H 66 V 11 H 86" stroke="currentColor" strokeWidth="1" />
      {[
        [12, 41],
        [33, 30],
        [55, 19],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="2" fill="currentColor" />
      ))}
      <circle cx="76" cy="8" r="2.6" className="fill-primary" />
    </svg>
  );
}

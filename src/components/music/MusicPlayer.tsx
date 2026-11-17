import { AnimatePresence, motion } from "motion/react";
import { Pause, Play } from "lucide-react";

import { EASE } from "@/components/motion/Reveal";
import { PIECE, toggleBackgroundMusic } from "@/lib/music/backgroundMusic";
import { useMusic } from "@/lib/music/useMusic";
import { cn } from "@/lib/utils";

/** Little equaliser bars that move only while music plays. */
function Bars({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-[2px] rounded-full bg-primary-soft", active ? "music-bar" : "h-1")}
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </span>
  );
}

/** Floating control for the background Bach performance. Never starts on its own. */
export function MusicPlayer() {
  const music = useMusic();
  const bar = PIECE.bars[music.bar];
  const progress = ((music.bar + 1) / PIECE.bars.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 1.6 }}
      className="fixed right-3 bottom-3 z-40 max-w-[calc(100vw-1.5rem)] md:right-6 md:bottom-6"
    >
      <div className="relative flex max-w-full items-center gap-3 overflow-hidden rounded-full border border-ink-border bg-ink-deep/95 py-1.5 pr-4 pl-1.5 text-ink-foreground shadow-[var(--shadow-lift)] backdrop-blur">
        <button
          type="button"
          onClick={toggleBackgroundMusic}
          aria-pressed={music.playing}
          aria-label={music.playing ? `Pause ${PIECE.composer}, ${PIECE.title}` : `Play ${PIECE.composer}, ${PIECE.title}`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          {music.playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </button>
        <div className="min-w-0 leading-tight">
          <p className="flex items-center gap-2 text-[0.7rem] text-ink-muted">
            <Bars active={music.playing} />
            {music.playing ? `Bar ${music.bar + 1} of ${PIECE.bars.length}` : "Background music"}
          </p>
          <span className="block truncate text-[0.82rem] font-medium">
            <span className="hidden sm:inline">{PIECE.composer} · </span>Prelude in C
          </span>
        </div>
        <div className={cn("relative h-6 shrink-0 overflow-hidden text-right transition-[width] duration-500", music.playing ? "w-16" : "w-0")} aria-hidden={!music.playing}>
            <AnimatePresence mode="popLayout" initial={false}>
              {music.playing && bar && (
                <motion.span
                  key={music.bar}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0 font-display text-base leading-6 italic whitespace-nowrap text-crimson-soft"
                  aria-live="off"
                >
                  {bar.chord}
                </motion.span>
              )}
            </AnimatePresence>
        </div>
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px] bg-primary-soft/70 transition-[width] duration-700"
          style={{ width: music.playing ? `${progress}%` : "0%" }}
        />
      </div>
    </motion.div>
  );
}

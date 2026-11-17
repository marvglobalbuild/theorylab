import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** One easing curve and duration family for the whole site. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const DURATION = 0.9;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li";
}

/** Fades and lifts content once as it scrolls into view. */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: RevealProps) {
  const Comp = as === "li" ? motion.li : motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: DURATION, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Headline whose words rise from behind a mask, one after another. */
export function WordReveal({
  text,
  className,
  delay = 0,
  emphasis = [],
  emphasisClassName = "italic text-primary",
  as: Tag = "h2",
  animateOnMount = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  emphasis?: string[] | undefined;
  emphasisClassName?: string;
  as?: "h1" | "h2";
  animateOnMount?: boolean;
}) {
  const words = text.split(" ");
  const trigger = animateOnMount
    ? { animate: { y: "0%" } }
    : { whileInView: { y: "0%" }, viewport: { once: true, margin: "0px 0px -10% 0px" } };
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className={cn("inline-block", emphasis.includes(word) && emphasisClassName)}
            initial={{ y: "105%" }}
            {...trigger}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * 0.07 }}
          >
            {word}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Image revealed by an upward wipe, with gentle parallax while scrolling. */
export function RevealImage({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  priority = false,
  delay = 0,
  parallax = 40,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  delay?: number;
  parallax?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-parallax, parallax]);
  const trigger = priority
    ? { animate: { clipPath: "inset(0% 0% 0% 0%)" } }
    : { whileInView: { clipPath: "inset(0% 0% 0% 0%)" }, viewport: { once: true, margin: "0px 0px -10% 0px" } };

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      {...trigger}
      transition={{ duration: 1.4, ease: EASE, delay }}
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        style={{ y }}
        className={cn("absolute inset-x-0 -top-10 h-[calc(100%+5rem)] w-full object-cover", imgClassName)}
      />
    </motion.div>
  );
}

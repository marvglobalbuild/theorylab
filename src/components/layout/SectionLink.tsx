import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Link to a section of the landing page, scrolling smoothly when motion is allowed. */
export function SectionLink({
  hash,
  children,
  className,
  onClick,
}: {
  hash: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <Link
      to="/"
      hash={hash}
      hashScrollIntoView={{ behavior: reduce ? "auto" : "smooth", block: "start" }}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

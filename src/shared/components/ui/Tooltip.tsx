import type { ReactNode } from "react";
import styles from "./Tooltip.module.css";

/**
 * A lightweight, CSS-only tooltip for icon-only controls. Decorative: the bubble
 * is aria-hidden, so give the wrapped trigger its own accessible name (e.g.
 * aria-label). Appears instantly on hover/focus — no JS state, no delay.
 */
export function Tooltip({
  label,
  placement = "bottom",
  children,
}: {
  label: string;
  placement?: "top" | "bottom";
  children: ReactNode;
}) {
  return (
    <span className={styles.wrap}>
      {children}
      <span
        role="tooltip"
        aria-hidden
        className={[styles.bubble, styles[placement]].filter(Boolean).join(" ")}
      >
        {label}
      </span>
    </span>
  );
}

import type { ReactNode } from "react";
import { cx } from "../../../../shared/lib/cx";
import styles from "./rail.module.css";

export interface RailToggleProps {
  /** Layout class for the row (legend item, slot row); applied either way.
   *  Optional because CSS module lookups are typed `string | undefined`. */
  className?: string;
  isPressed: boolean;
  /** Without it the row renders as plain text. */
  onToggle?: () => void;
  children: ReactNode;
}

/**
 * A rail count that filters the table when the desk wires it up. With
 * `onToggle` it is a toggle button whose `aria-pressed` mirrors the table's
 * filter; without it the same row renders as text, so the card reads the same
 * wherever it is mounted. Children must be phrasing content (spans only).
 */
export function RailToggle({
  className,
  isPressed,
  onToggle,
  children,
}: RailToggleProps) {
  if (!onToggle) return <span className={className}>{children}</span>;
  return (
    <button
      type="button"
      className={cx(className, styles.toggle)}
      aria-pressed={isPressed}
      onClick={onToggle}
    >
      {children}
    </button>
  );
}

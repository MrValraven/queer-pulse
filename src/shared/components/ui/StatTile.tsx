import { type ReactNode } from "react";
import styles from "./StatTile.module.css";

export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional third line — a trend, context, or sub-label. */
  hint?: ReactNode;
}

/**
 * A single labeled stat: big serif value over a muted label, plus an optional
 * hint line. Consolidates the admin/governance/safety stat tiles (and replaces
 * the safety tiles' hardcoded inline font styles with tokens). Wrap a set in
 * `StatGrid`.
 */
export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className={styles.tile}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {hint != null && hint !== "" && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

export interface StatGridProps {
  children: ReactNode;
  /** Fixed column count. Omit for a responsive auto-fit grid. */
  columns?: number;
  /** `contrast` restyles tiles for a dark/plum panel (cream text). */
  tone?: "surface" | "contrast";
  className?: string;
}

/** Responsive grid wrapper for a set of `StatTile`s. */
export function StatGrid({
  children,
  columns,
  tone = "surface",
  className,
}: StatGridProps) {
  return (
    <div
      className={[
        styles.grid,
        tone === "contrast" && styles.gridContrast,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        columns
          ? ({ gridTemplateColumns: `repeat(${columns}, 1fr)` })
          : undefined
      }
    >
      {children}
    </div>
  );
}

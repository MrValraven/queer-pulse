import { type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./StatTile.module.css";

export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional third line — a trend, context, or sub-label. */
  hint?: ReactNode;
  /** Route to this stat's detail view, if one exists. Renders the tile as a
   *  link with hover/focus affordances instead of a static card. */
  to?: string;
}

/**
 * A single labeled stat: big serif value over a muted label, plus an optional
 * hint line. Consolidates the admin/governance/safety stat tiles (and replaces
 * the safety tiles' hardcoded inline font styles with tokens). Wrap a set in
 * `StatGrid`.
 *
 * Passing `to` renders the tile as a `Link` instead of a plain `div` — only
 * do this when the stat has a real destination page; a tile with no `to`
 * stays a static, non-interactive card.
 */
export function StatTile({ label, value, hint, to }: StatTileProps) {
  const content = (
    <>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {hint != null && hint !== "" && <div className={styles.hint}>{hint}</div>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${styles.tile} ${styles.tileLink}`}>
        {content}
      </Link>
    );
  }

  return <div className={styles.tile}>{content}</div>;
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
        columns && styles.gridFixed,
        tone === "contrast" && styles.gridContrast,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // The column count drives a CSS custom property rather than an inline
      // `grid-template-columns`. An inline value would beat every responsive
      // rule, pinning N columns at any width and overflowing on mobile; the
      // `.gridFixed` track formula caps at N wide and wraps down gracefully.
      style={columns ? ({ "--sg-cols": columns } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

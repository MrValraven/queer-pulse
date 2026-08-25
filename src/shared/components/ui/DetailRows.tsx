import { type ReactNode } from "react";
import styles from "./DetailRows.module.css";

export interface DetailRow {
  label: ReactNode;
  value: ReactNode;
}

export interface DetailRowsProps {
  rows: DetailRow[];
  /** Tighter rows with no dividers — for use inside a tinted summary box. */
  dense?: boolean;
}

/**
 * Key/value list — consolidates the `.detailRow` / `.csRow` duplicates across
 * the system state pages, safety flows and admin drawers. Default rows are
 * spaced with a dashed divider (the system-page look); `dense` drops the gap
 * and divider (the safety summary-box look). The container surface (accent-left
 * card, tinted panel) stays the caller's — this renders only the row list.
 */
export function DetailRows({ rows, dense = false }: DetailRowsProps) {
  return (
    <dl
      className={[styles.list, dense && styles.dense].filter(Boolean).join(" ")}
    >
      {rows.map((row, index) => (
        <div className={styles.row} key={index}>
          <dt className={styles.label}>{row.label}</dt>
          <dd className={styles.value}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

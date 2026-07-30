import type { ReactNode } from "react";
import styles from "./SafeSpaceBadge.module.css";

/**
 * The verified-safe-space pill: a jade dot + label. Shared between the Safe
 * Spaces hub card (`SafeSpaceCard`) and the Local directory card
 * (`LocalBusinessCard`) so both surfaces render the exact same "verified"
 * visual instead of duplicating the markup.
 *
 * Purely presentational — the caller supplies an already-translated label so
 * each surface keeps its own i18n key/namespace (the hub uses `safety:`, the
 * directory card uses `marketing:`).
 */
export function SafeSpaceBadge({
  label,
  className,
}: {
  label: ReactNode;
  className?: string;
}) {
  return (
    <div className={[styles.badge, className].filter(Boolean).join(" ")}>
      <div className={styles.dot} />
      {label}
    </div>
  );
}

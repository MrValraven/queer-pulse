import { Spinner } from "../ui/Spinner";
import { usePrefersReducedMotion } from "../../hooks";
import styles from "./RouteFallback.module.css";

/**
 * Suspense fallback for lazy route chunks — replaces the old blank `<div />`.
 * A centered status region so screen readers announce the wait; the spinner is
 * suppressed under reduced-motion, leaving a static label. Cream background,
 * never white.
 */
export function RouteFallback() {
  const reduced = usePrefersReducedMotion();
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      {!reduced && <Spinner className={styles.spin} />}
      <span className={styles.label}>Loading…</span>
    </div>
  );
}

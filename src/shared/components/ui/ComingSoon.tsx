import styles from "./ComingSoon.module.css";

/**
 * Inline marker for a control that is intentionally not yet functional (no
 * backend behind it). Purely presentational — the consumer is responsible for
 * disabling the control it annotates.
 */
export function ComingSoon({ label = "Coming soon" }: { label?: string }) {
  return (
    <span className={styles.badge} role="note">
      {label}
    </span>
  );
}

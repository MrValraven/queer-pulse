import type { ReactNode } from "react";
import styles from "./ModerationQueueHealth.module.css";

/**
 * One measured figure with the band it is judged against underneath it.
 *
 * `note` is where the applicable threshold goes, so a moderator reads how close
 * a queue is to tripping rather than only that it has. It also carries the
 * explanation for a reading that is not a number at all, which is why
 * `isMuted` exists: "this queue has no claiming" and "the queue is empty" are
 * both real answers, and neither should look like a measurement.
 */
export function ModerationQueueStat({
  label,
  value,
  note,
  isMuted = false,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  /** True when `value` is a statement rather than a measurement. */
  isMuted?: boolean;
}) {
  return (
    <div className={styles.stat}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd
        className={[styles.statValue, isMuted && styles.statValueMuted]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </dd>
      {note && <dd className={styles.statNote}>{note}</dd>}
    </div>
  );
}

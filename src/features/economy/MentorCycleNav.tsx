import { Link } from "react-router-dom";
import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Previous / position / next navigation between mentor profiles. */
export function MentorCycleNav({
  base,
  prev,
  next,
  pos,
  total,
  last,
}: {
  base: string;
  prev: Mentor;
  next: Mentor;
  pos: number;
  total: number;
  last?: boolean;
}) {
  return (
    <div
      className={styles.cycle}
      style={last ? { marginBottom: 0 } : undefined}
    >
      <Link to={`${base}/${prev.slug}`} className={styles.cycleBtn}>
        <span className={styles.cycleDir}>← Previous</span>
        <span className={styles.cycleName}>{prev.name}</span>
      </Link>
      <span className={styles.cyclePos}>
        {pos} of {total}
      </span>
      <Link
        to={`${base}/${next.slug}`}
        className={`${styles.cycleBtn} ${styles.next}`}
      >
        <span className={styles.cycleDir}>Next →</span>
        <span className={styles.cycleName}>{next.name}</span>
      </Link>
    </div>
  );
}

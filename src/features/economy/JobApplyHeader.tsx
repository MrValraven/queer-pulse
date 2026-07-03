import type { Job } from "./jobs.data";
import styles from "./JobApplyPage.module.css";

export function JobApplyHeader({
  job,
  deadlineFull,
  pct,
}: {
  job: Job;
  deadlineFull: string;
  pct: number;
}) {
  return (
    <div className={styles.head}>
      <div>
        <div className={styles.eyebrow}>Apply · {job.title}</div>
        <h1 className={styles.h1}>
          Tell <em>{job.org}</em> about you.
        </h1>
        <div className={styles.meta}>
          <b>{job.location}</b>
          <span className={styles.dot} />
          <span>{job.type}</span>
          <span className={styles.dot} />
          <span>{job.salary}</span>
          <span className={styles.dot} />
          <span>Closes {deadlineFull}</span>
        </div>
      </div>

      <div className={styles.prog}>
        <div className={styles.progPct}>
          <em>{pct}</em>%
        </div>
        <div className={styles.progLbl}>Application complete</div>
        <div className={styles.progBar}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

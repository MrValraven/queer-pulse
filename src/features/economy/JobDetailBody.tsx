import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { Job } from "./jobs.data";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import styles from "./JobDetailPage.module.css";

export function JobDetailBody({ job }: { job: Job }) {
  const d = job.detail;
  return (
    <div>
      <div className={styles.section}>
        <h2 className={styles.secTitle}>About the role</h2>
        {d.about.map((p, i) => (
          <p key={i} className={styles.text}>
            {p}
          </p>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>Day to day</h2>
        <div className={styles.list}>
          {d.dayToDay.map((item) => (
            <div key={item} className={styles.li}>
              <div className={styles.liDot} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>What we're looking for</h2>
        <div className={styles.list}>
          {d.lookingFor.map((item) => (
            <div key={item} className={styles.li}>
              <div className={`${styles.liDot} ${styles.jade}`} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>What we offer</h2>
        <div className={styles.list}>
          {d.offer.map((item) => (
            <div key={item} className={styles.li}>
              <div className={styles.liDot} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>About {job.org}</h2>
        <p className={styles.text}>{d.aboutCompany}</p>
      </div>

      {safetyFor(job.org) && (
        <div className={styles.section}>
          <h2 className={styles.secTitle}>Safety</h2>
          <p className={styles.text}>
            How {job.org} is rated by the community on the things that matter to
            queer professionals.
          </p>
          <div className={styles.safetyBlock}>
            <SafetyBadges signals={safetyFor(job.org)} />
            <Button variant="ghost" to={routes.employerReviews}>
              See safety reviews →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

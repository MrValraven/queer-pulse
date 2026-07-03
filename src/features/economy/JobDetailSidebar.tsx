import { FaRainbow } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { Job } from "./jobs.data";
import { COMPANY_SLUG_BY_NAME } from "./companies.data";
import styles from "./JobDetailPage.module.css";

export function JobDetailSidebar({
  job,
  deadlineFull,
}: {
  job: Job;
  deadlineFull: string;
}) {
  const d = job.detail;
  const companySlug = COMPANY_SLUG_BY_NAME[job.org];
  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div
          className={styles.logoFallback}
          style={{ background: job.logoBg, color: job.logoText }}
        >
          {job.logo}
        </div>
        <div className={styles.coName}>
          {companySlug ? (
            <Link to={`${routes.company}/${companySlug}`}>{job.org}</Link>
          ) : (
            job.org
          )}
        </div>
        {job.qr && (
          <div className={styles.coQr}>
            <FaRainbow /> {job.qrLabel}
          </div>
        )}

        <div className={styles.detailRow}>
          <span className={styles.dl}>Salary</span>
          <span className={`${styles.dv} ${styles.salary}`}>{job.salary}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>Type</span>
          <span className={styles.dv}>{job.type}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>Location</span>
          <span className={styles.dv}>{job.location}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>Category</span>
          <span className={styles.dv}>{d.category}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.dl}>Deadline</span>
          <span className={styles.dv}>{deadlineFull}</span>
        </div>
        <div className={styles.posted}>{d.posted}</div>

        <div className={styles.applyWrap}>
          <Button
            variant="primary"
            to={`${routes.jobs}/${job.slug}/apply`}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Apply now →
          </Button>
        </div>
      </div>

      <div className={styles.noteCard}>
        <p>{d.reviewerNote}</p>
      </div>
    </aside>
  );
}

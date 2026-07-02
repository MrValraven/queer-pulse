import { FaRainbow } from "react-icons/fa6";
import type { Job } from "./jobs.data";
import { SalaryIcon, TypeIcon, PinIcon, ClockIcon } from "./JobDetailIcons";
import styles from "./JobDetailPage.module.css";

export function JobDetailHeader({
  job,
  deadlineFull,
  saved,
  onToggleSave,
}: {
  job: Job;
  deadlineFull: string;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>{job.title}</h1>
        <button
          type="button"
          className={`${styles.save} ${saved ? styles.saved : ""}`}
          onClick={onToggleSave}
          aria-pressed={saved}
          title="Save listing"
        >
          <svg viewBox="0 0 16 16">
            <path d="M8 1.5l1.8 3.6 4 .58-2.9 2.82.68 3.98L8 10.4l-3.58 1.9.68-3.98L2.2 5.68l4-.58z" />
          </svg>
        </button>
      </div>
      <div className={styles.org}>
        {job.org}
        {job.qr && (
          <span className={styles.qrBadge}>
            <FaRainbow /> {job.qrLabel}
          </span>
        )}
      </div>
      <div className={styles.chips}>
        <span className={`${styles.chip} ${styles.salary}`}>
          <SalaryIcon /> {job.salary}
        </span>
        <span className={styles.chip}>
          <TypeIcon /> {job.type}
        </span>
        <span className={styles.chip}>
          <PinIcon /> {job.location}
        </span>
        <span className={styles.chip}>
          <ClockIcon /> Apply by {deadlineFull}
        </span>
      </div>
    </div>
  );
}

import { FaRainbow } from "react-icons/fa6";
import { SaveButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  /** Pre-resolved by JobDetailPage — a formatted date or the "Open" string. */
  deadlineFull: string;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>{job.title}</h1>
        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>
      <div className={styles.org}>
        {job.organization}
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
          <ClockIcon />{" "}
          {t("economy:jobDetail.chip.applyBy", { date: deadlineFull })}
        </span>
      </div>
    </div>
  );
}

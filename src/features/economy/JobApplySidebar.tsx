import { FiMapPin, FiBriefcase, FiDollarSign, FiClock } from "react-icons/fi";
import { FaRainbow } from "react-icons/fa6";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Job } from "./jobs.data";
import { APPLY_TIP_KEYS } from "./jobApply.data";
import styles from "./JobApplyPage.module.css";

export function JobApplySidebar({
  job,
  deadlineFull,
}: {
  job: Job;
  deadlineFull: string;
}) {
  const { t } = useTranslation();
  const info = [
    { icon: <FiMapPin size={13} aria-hidden />, node: <b>{job.location}</b> },
    {
      icon: <FiBriefcase size={13} aria-hidden />,
      node: <span>{job.type}</span>,
    },
    {
      icon: <FiDollarSign size={13} aria-hidden />,
      node: <b>{job.salary}</b>,
    },
    {
      icon: <FiClock size={13} aria-hidden />,
      node: (
        <span>
          <Translation
            i18nKey="economy:jobApply.sidebar.closes"
            values={{ date: deadlineFull }}
            components={{ b: <b /> }}
          />
        </span>
      ),
    },
  ];

  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <div className={styles.sideEmp}>
          <div
            className={styles.sideLogo}
            style={{ background: job.logoBg, color: job.logoText }}
          >
            {job.logo}
          </div>
          <div>
            <div className={styles.sideName}>{job.org}</div>
            <div className={styles.sideRole}>{job.detail.category}</div>
          </div>
        </div>
        <div className={styles.sideInfo}>
          {info.map((row, i) => (
            <div key={i} className={styles.sideInfoRow}>
              {row.icon}
              {row.node}
            </div>
          ))}
        </div>
        {job.qr && (
          <div className={styles.qrBadge}>
            <FaRainbow aria-hidden /> {job.qrLabel}
          </div>
        )}
      </div>

      <div className={`${styles.sideCard} ${styles.tips}`}>
        <h4>{t("economy:jobApply.sidebar.tipsTitle")}</h4>
        <ul className={styles.tipsList}>
          {APPLY_TIP_KEYS.map((tipKey) => (
            <li key={tipKey}>{t(tipKey)}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  return (
    <div className={styles.head}>
      <div>
        <div className={styles.eyebrow}>
          {t("economy:jobApply.header.eyebrow", { title: job.title })}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="economy:jobApply.header.title"
            values={{ org: job.org }}
            components={{ em: <em /> }}
          />
        </h1>
        <div className={styles.meta}>
          <b>{job.location}</b>
          <span className={styles.dot} />
          <span>{job.type}</span>
          <span className={styles.dot} />
          <span>{job.salary}</span>
          <span className={styles.dot} />
          <span>
            {t("economy:jobApply.header.closes", { date: deadlineFull })}
          </span>
        </div>
      </div>

      <div className={styles.prog}>
        <div className={styles.progPct}>
          <em>{pct}</em>%
        </div>
        <div className={styles.progLbl}>
          {t("economy:jobApply.header.progressLabel")}
        </div>
        <div className={styles.progBar}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

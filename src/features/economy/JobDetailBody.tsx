import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { Job } from "./jobs.data";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import { COMPANY_SLUG_BY_NAME } from "./companies.data";
import styles from "./JobDetailPage.module.css";

export function JobDetailBody({ job }: { job: Job }) {
  const { t } = useTranslation();
  const d = job.detail;
  const companySlug = COMPANY_SLUG_BY_NAME[job.org];
  return (
    <div>
      <div className={styles.section}>
        <h2 className={styles.secTitle}>
          {t("economy:jobDetail.section.about")}
        </h2>
        {d.about.map((p, i) => (
          <p key={i} className={styles.text}>
            {p}
          </p>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.secTitle}>
          {t("economy:jobDetail.section.dayToDay")}
        </h2>
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
        <h2 className={styles.secTitle}>
          {t("economy:jobDetail.section.lookingFor")}
        </h2>
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
        <h2 className={styles.secTitle}>
          {t("economy:jobDetail.section.offer")}
        </h2>
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
        <h2 className={styles.secTitle}>
          {t("economy:jobDetail.section.aboutCompany", { company: job.org })}
        </h2>
        <p className={styles.text}>{d.aboutCompany}</p>
        {companySlug && (
          <Button
            variant="ghost"
            to={`${routes.company}/${companySlug}`}
            style={{ marginTop: 16 }}
          >
            {t("economy:jobDetail.section.viewCompany")}
          </Button>
        )}
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

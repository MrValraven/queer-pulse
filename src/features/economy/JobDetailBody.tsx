import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Job } from "./jobs.data";
import { safetyFor } from "./employerSafety.data";
import { SafetyBadges } from "./SafetyBadges";
import { COMPANY_SLUG_BY_NAME } from "./companies.data";
import styles from "./JobDetailPage.module.css";

export function JobDetailBody({ job }: { job: Job }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const d = job.detail;
  // Company slugs and safety signals are demo fixtures keyed by company name.
  // Live listings carry neither, so a real employer that shares a name with a
  // fixture must not inherit its link or its rating.
  const companySlug = demoMode
    ? COMPANY_SLUG_BY_NAME[job.organization]
    : undefined;
  const safetySignals = demoMode ? safetyFor(job.organization) : undefined;
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
          {t("economy:jobDetail.section.aboutCompany", {
            company: job.organization,
          })}
        </h2>
        <p className={styles.text}>{d.aboutCompany}</p>
        {companySlug && (
          <Button
            variant="ghost"
            to={`${routes.company}/${companySlug}`}
            style={{ marginTop: 16 }}
          >
            {t("economy:jobDetail.section.viewCompany")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>

      {safetySignals && (
        <div className={styles.section}>
          <h2 className={styles.secTitle}>
            {t("economy:jobDetail.section.safety")}
          </h2>
          <p className={styles.text}>
            {t("economy:jobDetail.section.safetyBody", {
              company: job.organization,
            })}
          </p>
          <div className={styles.safetyBlock}>
            <SafetyBadges signals={safetySignals} />
            <Button variant="ghost" to={routes.employerReviews}>
              {t("economy:jobDetail.section.safetyReviews")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useId } from "react";
import { FiClock } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { STUDIO_LANDING_PLAN_POINTS } from "./studioLanding.data";
import styles from "./StudioLandingPlan.module.css";

/**
 * The plan: what Studio wants to become, the co-op, the money and the
 * masters. A full card on the raised Studio tint with a solid border and
 * larger icons gives it weight, the three points sit in a row from 900px,
 * and the dashed "Coming later" chip marks it as the direction ahead.
 */
export function StudioLandingPlan() {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <p className={styles.eyebrow}>{t("studio:landing.plan.eyebrow")}</p>
            <span className={styles.chip}>
              <FiClock aria-hidden="true" />
              {t("studio:landing.plan.chip")}
            </span>
          </div>
          <h2 id={headingId} className={styles.title}>
            <Translation
              i18nKey="studio:landing.plan.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.intro}>{t("studio:landing.plan.intro")}</p>
        </header>

        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- grid with list-style none loses the list role in Safari */}
        <ul className={styles.points} role="list">
          {STUDIO_LANDING_PLAN_POINTS.map(
            ({ pointId, titleKey, bodyKey, Icon }) => (
              <li key={pointId} className={styles.point}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon />
                </span>
                <h3 className={styles.pointTitle}>{t(titleKey)}</h3>
                <p className={styles.pointBody}>{t(bodyKey)}</p>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { STUDIO_LANDING_COMPARISON_ROWS } from "./studioLanding.data";
import styles from "./StudioLandingComparison.module.css";

/**
 * Studio next to the big streaming apps, row by row. A grid with a header row
 * and hairline dividers on wide screens; stacked cards on phones with
 * Studio's answer highlighted. Each answer starts with the full column name
 * and a colon, visually hidden and always read by screen readers. Phones also
 * show a short visible label ("Big apps", "Studio"), hidden from assistive
 * technology so the column name is announced once.
 */
export function StudioLandingComparison() {
  const { t } = useTranslation();
  const headingId = useId();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner} ref={ref} data-revealed={isVisible}>
        <p className={styles.eyebrow}>{t("studio:landing.compare.eyebrow")}</p>
        <h2 id={headingId} className={styles.title}>
          <Translation
            i18nKey="studio:landing.compare.title"
            components={{ em: <em /> }}
          />
        </h2>

        <div className={styles.headerRow} aria-hidden="true">
          <span>{t("studio:landing.compare.topicHeading")}</span>
          <span>{t("studio:landing.compare.bigAppsHeading")}</span>
          <span className={styles.studioHeading}>
            {t("studio:landing.compare.studioHeading")}
          </span>
        </div>

        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- grid with list-style none loses the list role in Safari */}
        <ul className={styles.list} role="list">
          {STUDIO_LANDING_COMPARISON_ROWS.map(
            ({ rowId, topicKey, bigAppsKey, studioKey }) => (
              <li key={rowId} className={styles.row}>
                <h3 className={styles.topic}>{t(topicKey)}</h3>
                <p className={styles.bigApps}>
                  <span className={styles.label}>
                    <span className={styles.labelFull}>
                      {t("studio:landing.compare.bigAppsHeading")}
                      {": "}
                    </span>
                    <span className={styles.labelShort} aria-hidden="true">
                      {t("studio:landing.compare.bigAppsShort")}
                    </span>
                  </span>
                  {t(bigAppsKey)}
                </p>
                <p className={styles.studio}>
                  <FiCheck className={styles.check} aria-hidden="true" />
                  <span className={styles.studioText}>
                    <span className={styles.label}>
                      <span className={styles.labelFull}>
                        {t("studio:landing.compare.studioHeading")}
                        {": "}
                      </span>
                      <span className={styles.labelShort} aria-hidden="true">
                        {t("studio:landing.compare.studioShort")}
                      </span>
                    </span>
                    {t(studioKey)}
                  </span>
                </p>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

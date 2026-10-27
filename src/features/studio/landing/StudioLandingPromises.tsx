import { useId } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { STUDIO_LANDING_PROMISES } from "./studioLanding.data";
import styles from "./StudioLandingPromises.module.css";

/**
 * Four short promises about what Studio is for, set as an editorial list in
 * the manifesto's style: hairline rules with a short coral tick, a small
 * quiet icon, the title in the serif and the body below it. One column on
 * phones and tablets, two from 1024px up.
 */
export function StudioLandingPromises() {
  const { t } = useTranslation();
  const headingId = useId();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner} ref={ref} data-revealed={isVisible}>
        <p className={styles.eyebrow}>{t("studio:landing.promises.eyebrow")}</p>
        <h2 id={headingId} className={styles.title}>
          <Translation
            i18nKey="studio:landing.promises.title"
            components={{ em: <em /> }}
          />
        </h2>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- grid with list-style none loses the list role in Safari */}
        <ul className={styles.list} role="list">
          {STUDIO_LANDING_PROMISES.map(
            ({ pointId, titleKey, bodyKey, Icon }) => (
              <li key={pointId} className={styles.item}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon />
                </span>
                <h3 className={styles.itemTitle}>{t(titleKey)}</h3>
                <p className={styles.itemBody}>{t(bodyKey)}</p>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}

import { useId } from "react";
import { FiMic } from "react-icons/fi";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useScrollReveal } from "../../../shared/hooks/useScrollReveal";
import { STUDIO_LANDING_WHY_PARAGRAPH_KEYS } from "./studioLanding.data";
import styles from "./StudioLandingManifesto.module.css";

/**
 * Why it matters. The pull quote is the section's h2, so it names the section
 * for assistive technology while reading as an editorial quote. The three
 * paragraphs sit beside it on wide screens and below it on phones.
 */
export function StudioLandingManifesto() {
  const { t } = useTranslation();
  const headingId = useId();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner} ref={ref} data-revealed={isVisible}>
        <div className={styles.quoteColumn}>
          <p className={styles.eyebrow}>{t("studio:landing.why.eyebrow")}</p>
          <span className={styles.micMark} aria-hidden="true">
            <FiMic />
          </span>
          <h2 id={headingId} className={styles.quote}>
            <Translation
              i18nKey="studio:landing.why.quote"
              components={{ em: <em /> }}
            />
          </h2>
        </div>

        <div className={styles.textColumn}>
          {STUDIO_LANDING_WHY_PARAGRAPH_KEYS.map((paragraphKey) => (
            <p key={paragraphKey} className={styles.paragraph}>
              {t(paragraphKey)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

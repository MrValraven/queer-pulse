import { useId } from "react";
import { FiMic } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_COMING_SOON_PARAGRAPH_KEYS } from "./studioComingSoon.data";
import styles from "./StudioComingSoonManifesto.module.css";

/**
 * "Why it matters": the emotional centre of the coming-soon page. The pull
 * line is the section's h2, so it names the section for assistive technology
 * while reading as an editorial quote. A microphone opens it and a faint
 * recorded waveform runs under it. The three paragraphs sit beside it on wide
 * screens and below it on phones.
 */
export function StudioComingSoonManifesto() {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <div className={styles.quoteColumn}>
          <p className={styles.eyebrow}>{t("studio:comingSoon.why.eyebrow")}</p>
          <div className={styles.quoteWrap}>
            <span className={styles.micMark} aria-hidden="true">
              <FiMic />
            </span>
            <h2 id={headingId} className={styles.quote}>
              <Translation
                i18nKey="studio:comingSoon.why.quote"
                components={{ em: <em /> }}
              />
            </h2>
            <span className={styles.waveform} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.textColumn}>
          {STUDIO_COMING_SOON_PARAGRAPH_KEYS.map((paragraphKey) => (
            <p key={paragraphKey} className={styles.paragraph}>
              {t(paragraphKey)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

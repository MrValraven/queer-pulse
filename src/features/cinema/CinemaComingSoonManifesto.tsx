import { useId } from "react";
import { LuQuote } from "react-icons/lu";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CINEMA_COMING_SOON_PARAGRAPH_KEYS } from "./cinemaComingSoon.data";
import styles from "./CinemaComingSoonManifesto.module.css";

/**
 * "Why it matters": the emotional centre of the coming-soon page. The pull
 * line is the section's h2, so it names the section for assistive technology
 * while reading as an editorial quote. The three paragraphs sit beside it on
 * wide screens and below it on phones.
 */
export function CinemaComingSoonManifesto() {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <div className={styles.quoteColumn}>
          <p className={styles.eyebrow}>{t("cinema:comingSoon.why.eyebrow")}</p>
          <div className={styles.quoteWrap}>
            <span className={styles.quoteMark} aria-hidden="true">
              <LuQuote />
            </span>
            <h2 id={headingId} className={styles.quote}>
              <Translation
                i18nKey="cinema:comingSoon.why.quote"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
        </div>

        <div className={styles.textColumn}>
          {CINEMA_COMING_SOON_PARAGRAPH_KEYS.map((paragraphKey) => (
            <p key={paragraphKey} className={styles.paragraph}>
              {t(paragraphKey)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

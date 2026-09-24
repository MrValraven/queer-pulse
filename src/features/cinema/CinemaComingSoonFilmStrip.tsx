import { useId } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CINEMA_COMING_SOON_FRAMES } from "./cinemaComingSoon.data";
import styles from "./CinemaComingSoonFilmStrip.module.css";

/**
 * "What it will be like": three stills on a strip of 35mm film. Each frame is
 * a projected plate drawn in CSS (its own tint and scene, with a large
 * numeral) captioned by its title and body. On wide screens the film base
 * tilts and drifts behind upright frames, so the type stays crisp; below
 * that the strip stands upright. Sprocket holes are drawn in CSS on the base,
 * so the list stays a plain ordered list for assistive technology.
 */
export function CinemaComingSoonFilmStrip() {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          {t("cinema:comingSoon.preview.eyebrow")}
        </p>
        <h2 id={headingId} className={styles.title}>
          <Translation
            i18nKey="cinema:comingSoon.preview.title"
            components={{ em: <em /> }}
          />
        </h2>
      </header>

      <div className={styles.stage}>
        <div className={styles.band}>
          <span className={styles.filmBase} aria-hidden="true" />
          <ol className={styles.frames}>
            {CINEMA_COMING_SOON_FRAMES.map(
              ({ id, titleKey, bodyKey }, frameIndex) => (
                <li key={id} className={styles.frame}>
                  <div className={styles.plate} aria-hidden="true">
                    <span className={styles.plateNumeral}>
                      {frameIndex + 1}
                    </span>
                  </div>
                  <div className={styles.caption}>
                    <span className={styles.reelLabel}>
                      {t("cinema:comingSoon.preview.reelLabel", {
                        number: frameIndex + 1,
                      })}
                    </span>
                    <h3 className={styles.frameTitle}>{t(titleKey)}</h3>
                    <p className={styles.frameBody}>{t(bodyKey)}</p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}

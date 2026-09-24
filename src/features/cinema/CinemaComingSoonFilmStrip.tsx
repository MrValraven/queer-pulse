import { useId } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CINEMA_COMING_SOON_FRAMES } from "./cinemaComingSoon.data";
import { CinemaComingSoonPlate } from "./CinemaComingSoonPlate";
import styles from "./CinemaComingSoonFilmStrip.module.css";

/**
 * "What it will be like": three stills on a strip of 35mm film. Each still
 * shows the film artefact behind its point (see CinemaComingSoonPlate) and is
 * captioned by its title and body. On wide screens the strip runs straight
 * across the page; below that it stands upright. Sprocket holes are drawn in
 * CSS on the base, so the list stays a plain ordered list for assistive
 * technology.
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

      <div className={styles.band}>
        <span className={styles.filmBase} aria-hidden="true" />
        <ol className={styles.frames}>
          {CINEMA_COMING_SOON_FRAMES.map(
            ({ id, titleKey, bodyKey, plate }, frameIndex) => (
              <li key={id} className={styles.frame}>
                <CinemaComingSoonPlate plate={plate} />
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
    </section>
  );
}

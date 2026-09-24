import { useId } from "react";
import { FiFilm } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CinemaComingSoonHero.module.css";

/** How many dust motes drift through the beam. Each one is placed and timed
 *  by its own `:nth-child` rule in the stylesheet. */
const DUST_MOTE_COUNT = 7;
const DUST_MOTE_KEYS = Array.from(
  { length: DUST_MOTE_COUNT },
  (_unused, moteIndex) => `mote-${moteIndex}`,
);

/**
 * Opening scene of the live-mode Cinema teaser: the page's only `<h1>`, lit by
 * a projector beam that falls from the top of the viewport onto the headline.
 * The beam and the dust motes are pure decoration (`aria-hidden`), and the
 * pool of light behind the headline is a pseudo-element of the `<h1>`; every
 * word comes from the `cinema:comingSoon.hero.*` keys.
 * The status pill says plainly that nothing streams or sells yet.
 */
export function CinemaComingSoonHero() {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.hero} aria-labelledby={titleId}>
      <div className={styles.projection} aria-hidden="true">
        <span className={styles.lens} />
        <span className={styles.beam} />
        <span className={styles.beamCore} />
        <span className={styles.dust}>
          {DUST_MOTE_KEYS.map((moteKey) => (
            <span key={moteKey} className={styles.mote} />
          ))}
        </span>
        <span className={styles.vignette} />
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <FiFilm aria-hidden="true" className={styles.eyebrowIcon} />
          {t("cinema:comingSoon.hero.eyebrow")}
        </p>
        <h1 id={titleId} className={styles.title}>
          <Translation
            i18nKey="cinema:comingSoon.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lede}>{t("cinema:comingSoon.hero.lede")}</p>
        <p className={styles.status}>
          <span className={styles.pulseDot} aria-hidden="true" />
          {t("cinema:comingSoon.hero.status")}
        </p>
      </div>
    </section>
  );
}

import { useId, type CSSProperties } from "react";
import { FiMic } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StudioComingSoonHero.module.css";

/** Resting height of each bar in the level meter, left to right, as a share
 *  of the meter's height. The envelope swells towards the middle, where the
 *  headline sits, and stays uneven so it reads as a signal. Each bar breathes
 *  around its own level with a delay taken from its position. */
const METER_BAR_LEVELS = [
  0.28, 0.4, 0.34, 0.52, 0.46, 0.62, 0.55, 0.74, 0.66, 0.84, 0.72, 0.95, 0.8, 1,
  0.88, 0.97, 0.78, 0.9, 0.68, 0.8, 0.6, 0.7, 0.5, 0.58, 0.42, 0.48, 0.32, 0.26,
];
const METER_BARS = METER_BAR_LEVELS.map((barLevel, barIndex) => ({
  barKey: `bar-${barIndex}`,
  barStyle: {
    "--bar-level": barLevel,
    "--bar-index": barIndex,
  } as CSSProperties,
}));

/**
 * Opening scene of the live-mode Studio teaser: the page's only `<h1>`, in a
 * recording studio at night. The copy column opens on an ON AIR lamp, its
 * valve still warming, set in the flow just above the eyebrow so it travels
 * with the copy at every screen height. A soft jade level meter breathes
 * behind the headline, and the booth behind everything holds only the
 * vignette. The lamp with its halo, the meter and the vignette are pure
 * decoration (`aria-hidden`); the lamp's word still comes from the catalog,
 * and every other word comes from the `studio:comingSoon.hero.*` keys.
 * The status pill says plainly that nothing plays or sells yet.
 */
export function StudioComingSoonHero() {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.hero} aria-labelledby={titleId}>
      <div className={styles.booth} aria-hidden="true">
        <span className={styles.vignette} />
      </div>

      <div className={styles.inner}>
        <div className={styles.lampFixture} aria-hidden="true">
          <span className={styles.lampHalo} />
          <span className={styles.lamp}>
            {t("studio:comingSoon.hero.onAir")}
          </span>
        </div>
        <p className={styles.eyebrow}>
          <FiMic aria-hidden="true" className={styles.eyebrowIcon} />
          {t("studio:comingSoon.hero.eyebrow")}
        </p>
        <div className={styles.titleStage}>
          <div className={styles.meter} aria-hidden="true">
            {METER_BARS.map(({ barKey, barStyle }) => (
              <span key={barKey} className={styles.bar} style={barStyle} />
            ))}
          </div>
          <h1 id={titleId} className={styles.title}>
            <Translation
              i18nKey="studio:comingSoon.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
        </div>
        <p className={styles.lede}>{t("studio:comingSoon.hero.lede")}</p>
        <p className={styles.status}>
          <span className={styles.pulseDot} aria-hidden="true" />
          {t("studio:comingSoon.hero.status")}
        </p>
      </div>
    </section>
  );
}

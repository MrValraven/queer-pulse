import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { MARQUEE_WORD_KEYS } from "./performersLanding.data";
import styles from "./PerformersMarquee.module.css";

/** One run of the marquee: every section word with a star between them. */
function MarqueeRun() {
  const { t } = useTranslation();
  return (
    <span className={styles.run}>
      {MARQUEE_WORD_KEYS.map((wordKey) => (
        <span key={wordKey} className={styles.word}>
          {t(wordKey)}
          <FiStar className={styles.star} />
        </span>
      ))}
    </span>
  );
}

/**
 * The marquee band under the hero: the section names a stage persona page
 * can carry, lit and running sideways. Two identical runs make the loop
 * seamless. It runs three times and comes to rest. It repeats what the
 * page says elsewhere, so it is decorative and stays out of the
 * accessibility tree. With reduced motion it stands still.
 */
export function PerformersMarquee() {
  return (
    <div className={styles.band} aria-hidden>
      <div className={styles.track}>
        <MarqueeRun />
        <MarqueeRun />
      </div>
    </div>
  );
}

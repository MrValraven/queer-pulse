import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CURRENT_MARK_PATH } from "./logoConcepts.data";
import styles from "./LogoConcepts.module.css";

/** Edge of the medium preview of today's mark. */
const MEDIUM_SIZE = 96;
/** Edge of the avatar-sized circle crop of today's mark. */
const AVATAR_SIZE = 40;

/**
 * Today's pulse-dots mark at a medium size and as a 40px avatar circle, so
 * each concept below can be judged against what QueerPulse uses now. The mark
 * has a transparent ground drawn in plum, so it sits on a fixed cream surface
 * in both themes.
 */
export function CurrentMarkReference() {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <section className={styles.current} aria-labelledby={headingId}>
      <div className={styles.currentPreviews}>
        <div className={styles.currentFrame}>
          <img
            src={CURRENT_MARK_PATH}
            width={MEDIUM_SIZE}
            height={MEDIUM_SIZE}
            alt={t("admin:logoConcepts.current.alt")}
            decoding="async"
          />
        </div>
        <img
          className={styles.currentAvatar}
          src={CURRENT_MARK_PATH}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          alt=""
          decoding="async"
        />
      </div>
      <div className={styles.currentText}>
        <h2 id={headingId} className={styles.currentTitle}>
          {t("admin:logoConcepts.current.title")}
        </h2>
        <p className={styles.currentBody}>
          {t("admin:logoConcepts.current.body")}
        </p>
      </div>
    </section>
  );
}

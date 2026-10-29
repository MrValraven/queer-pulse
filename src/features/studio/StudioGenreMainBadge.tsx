import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StudioGenrePicker.module.css";

/** The "Main" mark inside the lead genre's chip. It grows in when a genre
 *  becomes the lead (the first pick, or the next one after the lead is
 *  removed) and folds away when it stops being the lead. */
export function StudioGenreMainBadge({ isMain }: { isMain: boolean }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const transition = { duration: reducedMotion ? 0 : 0.2 };
  return (
    <AnimatePresence initial={false}>
      {isMain && (
        <m.span
          key="main"
          className={styles.mainBadge}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={transition}
        >
          <span className={styles.mainBadgeText}>
            {t("studio:uploadFlow.release.genresMain")}
          </span>
        </m.span>
      )}
    </AnimatePresence>
  );
}

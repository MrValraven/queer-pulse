import { AnimatePresence, m } from "motion/react";
import { FiCast } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer } from "../studioPlayerContext";
import styles from "./StudioPlayerControls.module.css";

/** AirPlay or Cast through the browser's own picker (spec 4.5, 7.1). The
 *  picker opens synchronously inside the click, so the browser still counts
 *  it as a user gesture. */
export function StudioCastButton() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { remote, promptRemotePlayback } = useStudioPlayer();
  return (
    <AnimatePresence initial={false}>
      {remote.isAvailable && (
        <m.button
          key="cast"
          type="button"
          className={styles.iconButton}
          aria-pressed={remote.isConnected}
          aria-label={
            remote.isConnected
              ? t("studio:player.castConnected")
              : t("studio:player.cast")
          }
          onClick={() => promptRemotePlayback()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.16 }}
        >
          <FiCast aria-hidden />
        </m.button>
      )}
    </AnimatePresence>
  );
}

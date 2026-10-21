import { AnimatePresence, m } from "motion/react";
import { FiCast } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { IconButton } from "../../../../shared/components/ui/IconButton";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import { useStudioPlayer } from "../studioPlayerContext";
import styles from "./StudioPlayerControls.module.css";

/** AirPlay or Cast through the browser's own picker (spec 4.5, 7.1). The
 *  picker opens synchronously inside the click, so the browser still counts
 *  it as a user gesture. */
export function StudioCastButton() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { remote, promptRemotePlayback } = useStudioPlayer();
  const label = remote.isConnected
    ? t("studio:player.castConnected")
    : t("studio:player.cast");
  return (
    <AnimatePresence initial={false}>
      {remote.isAvailable && (
        <m.span
          key="cast"
          className={styles.castSlot}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: reducedMotion ? { duration: 0 } : STUDIO_FADE,
          }}
          exit={{
            opacity: 0,
            transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
          }}
        >
          <IconButton
            className={styles.iconButton}
            aria-pressed={remote.isConnected}
            aria-label={label}
            tooltip
            data-active={remote.isConnected || undefined}
            onClick={() => promptRemotePlayback()}
          >
            <FiCast aria-hidden />
            <span className={styles.onDot} aria-hidden="true" />
          </IconButton>
        </m.span>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, m } from "motion/react";
import { LuQuote } from "react-icons/lu";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE, STUDIO_SPRING } from "../../studioMotion";
import styles from "./StudioSyncedLyrics.module.css";

/** The round "Share lyric" button beside the focused line (and the line a
 *  mouse hovers). It springs in and fades out; under reduced motion it only
 *  fades. Shown by hover alone it stays out of the Tab order, so the list
 *  never holds a second Tab stop. */
export function StudioLyricShareButton({
  isShown,
  isFocusable,
  onShare,
}: {
  isShown: boolean;
  isFocusable: boolean;
  onShare: (button: HTMLElement) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key="share"
          className={styles.shareSlot}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: STUDIO_EXIT }}
          transition={reducedMotion ? STUDIO_FADE : STUDIO_SPRING}
        >
          <IconButton
            size="sm"
            className={styles.shareButton}
            aria-label={t("studio:player.lyrics.shareLine")}
            tooltip
            tabIndex={isFocusable ? undefined : -1}
            onClick={(event) => onShare(event.currentTarget)}
          >
            <LuQuote aria-hidden />
          </IconButton>
        </m.span>
      )}
    </AnimatePresence>
  );
}

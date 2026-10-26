import { AnimatePresence, m } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import {
  Button,
  Tooltip,
  useChipMotion,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioQueueItem } from "../studioPlayerContext";
import styles from "../../StudioPlayer.module.css";

/** The bar's way back to the playing track's page, for a member browsing
 *  elsewhere. A real link, so a middle or modified press opens a new tab.
 *  A private preview has no public page, so the control folds away. */
export function StudioGoToTrackButton({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { transition } = useChipMotion();
  const isShown = !item.previewToken;
  const isOnTrackPage =
    `${location.pathname}${location.search}` === item.trackHref;
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key="go-to-track"
          className={styles.goToTrackSlot}
          // Folded, the negative margin takes back the row's 4px gap, so
          // the tools glide with no step at the end.
          initial={{
            width: 0,
            marginInlineEnd: -4,
            opacity: 0,
            overflow: "hidden",
          }}
          animate={{
            width: "auto",
            marginInlineEnd: 0,
            opacity: 1,
            overflow: "visible",
          }}
          exit={{
            width: 0,
            marginInlineEnd: -4,
            opacity: 0,
            overflow: "hidden",
            transition: { ...transition, overflow: { duration: 0 } },
          }}
          transition={{
            ...transition,
            overflow: { duration: 0, delay: transition.duration },
          }}
        >
          <Tooltip label={t("studio:player.goToTrack")} placement="top">
            <Button
              variant="icon"
              to={item.trackHref}
              className={styles.toolButton}
              aria-label={t("studio:player.goToTrackAria", {
                title: item.title,
                artist: item.artistName,
              })}
              aria-current={isOnTrackPage ? "page" : undefined}
            >
              <FiArrowUpRight aria-hidden />
            </Button>
          </Tooltip>
        </m.span>
      )}
    </AnimatePresence>
  );
}

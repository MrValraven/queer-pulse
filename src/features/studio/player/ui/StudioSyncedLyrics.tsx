import { AnimatePresence, m } from "motion/react";
import { FiArrowDown, FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";
import { useLyricFollow } from "./useLyricFollow";
import styles from "./StudioSyncedLyrics.module.css";

/** Timed lyrics with the current line lit and centred (spec 7.5). Shared by
 *  Now playing, the track page and the timing tool's preview.
 *  `isInPageFlow` marks a list that scrolls with the page (the track page):
 *  its box is capped to the space between the topbar and the player bar,
 *  the line centres in the part of the box on screen, and "Back to current
 *  line" sticks above the player bar while the box runs past it. */
export function StudioSyncedLyrics({
  lines,
  activeIndex,
  onSeekLine,
  label,
  isInPageFlow = false,
}: {
  lines: readonly StudioSyncedLyricView[];
  activeIndex: number | null;
  onSeekLine: (ms: number) => void;
  label: string;
  isInPageFlow?: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const {
    listRef,
    isFollowing,
    resumeFollowing,
    resumeAndFocusActive,
    userScrollHandlers,
  } = useLyricFollow(activeIndex, { isInPageFlow });
  return (
    <div className={styles.root} data-page-flow={isInPageFlow ? "" : undefined}>
      <ol
        ref={listRef}
        className={styles.list}
        aria-label={label}
        data-player-keys="own-arrows"
        {...userScrollHandlers}
      >
        {lines.map((line, index) =>
          line.text ? (
            <li key={`${line.ms}-${index}`} data-line-index={index}>
              <button
                type="button"
                className={styles.line}
                data-past={
                  activeIndex !== null && index < activeIndex ? "" : undefined
                }
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => {
                  onSeekLine(line.ms);
                  resumeFollowing();
                }}
              >
                {line.text}
              </button>
            </li>
          ) : (
            <li
              key={`${line.ms}-${index}`}
              data-line-index={index}
              className={styles.gap}
              aria-hidden="true"
            >
              <FiMoreHorizontal />
            </li>
          ),
        )}
      </ol>
      <AnimatePresence>
        {!isFollowing && activeIndex !== null && (
          <m.button
            key="back"
            type="button"
            className={styles.back}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
            onClick={resumeAndFocusActive}
          >
            <FiArrowDown aria-hidden />{" "}
            {t("studio:player.lyrics.backToCurrent")}
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}

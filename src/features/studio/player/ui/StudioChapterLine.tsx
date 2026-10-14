import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer, useStudioPlayerClock } from "../studioPlayerContext";
import styles from "../../StudioPlayer.module.css";

/** The current chapter under the bar's title (spec 7.6). */
export function StudioChapterLine() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { currentChapters } = useStudioPlayer();
  const { currentChapterIndex } = useStudioPlayerClock();
  const chapter =
    currentChapterIndex === null
      ? null
      : (currentChapters?.[currentChapterIndex] ?? null);
  const text = chapter
    ? chapter.artist
      ? `${chapter.artist} · ${chapter.title}`
      : chapter.title
    : "";
  return (
    <AnimatePresence initial={false} mode="wait">
      {chapter && (
        <m.span
          key={chapter.startSeconds}
          className={styles.chapter}
          title={t("studio:player.chapterAria", {
            number: (currentChapterIndex ?? 0) + 1,
            title: text,
          })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {text}
        </m.span>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import type { QueueUndoNotice } from "./useStudioQueueUndo";
import styles from "./StudioQueue.module.css";

function UndoRow({ notice }: { notice: QueueUndoNotice }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const rise = reducedMotion ? 0 : 6;
  return (
    <m.div
      className={styles.undoRow}
      inert={!isPresent}
      initial={{ opacity: 0, y: rise }}
      animate={{ opacity: 1, y: 0, transition: STUDIO_FADE }}
      exit={{ opacity: 0, y: rise, transition: STUDIO_EXIT }}
    >
      <span className={styles.undoText}>{notice.message}</span>
      {notice.onUndo && (
        <Button
          variant="quiet"
          size="sm"
          className={styles.clear}
          onClick={notice.onUndo}
        >
          {t("studio:queue.undo")}
        </Button>
      )}
    </m.div>
  );
}

/** Inside Now playing: "Removed {title}" with Undo, in the queue itself,
 *  for as long as the page's toast would stay. The line also reaches the
 *  queue's status region, so the row itself stays quiet. */
export function StudioQueueUndoRow({
  notice,
}: {
  notice: QueueUndoNotice | null;
}) {
  return (
    <AnimatePresence initial={false}>
      {notice && <UndoRow key={notice.id} notice={notice} />}
    </AnimatePresence>
  );
}

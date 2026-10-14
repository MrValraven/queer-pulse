import type { PointerEvent as ReactPointerEvent } from "react";
import { m, useIsPresent } from "motion/react";
import { FiArrowDown, FiArrowUp, FiMenu, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import styles from "./StudioQueue.module.css";

export type QueueRowControl = "moveUp" | "moveDown" | "remove";

const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;

export function QueueRowSummary({
  item,
  noteId,
  note,
}: {
  item: StudioQueueItem;
  noteId?: string;
  note?: string;
}) {
  return (
    <>
      <span className={styles.cover}>
        <ImageSlot
          src={item.coverUrl ?? undefined}
          tint={item.tint}
          width={40}
          height={40}
          radius={6}
          placeholder=""
        />
      </span>
      <span className={styles.titles}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.artist}>{item.artistName}</span>
        {note ? (
          <span id={noteId} className={styles.hiddenNote}>
            {note}
          </span>
        ) : null}
      </span>
    </>
  );
}

/** One reorderable queue row. The grip is pointer and touch only; the
 *  three buttons are the keyboard and screen reader path. Title and artist
 *  are plain text in every row (a private preview's pages are closed to
 *  visitors), and a row fading out is inert, so the drag geometry skips it
 *  and its buttons leave the tab order. */
export function StudioQueueRow({
  item,
  index,
  rowCount,
  isDragging,
  gripHandlers,
  registerControl,
  onPlay,
  onMove,
  onRemove,
}: {
  item: StudioQueueItem;
  index: number;
  rowCount: number;
  isDragging: boolean;
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  registerControl: (
    control: QueueRowControl,
    element: HTMLButtonElement | null,
  ) => void;
  onPlay: () => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const player = useStudioPlayer();
  const isHiddenBySettings =
    player.playbackSettings.hideExplicit && item.isExplicit;
  const hiddenNoteId = `queue-hidden-${item.queueEntryId}`;
  const title = item.title;
  const isFirst = index === 0;
  const isLast = index === rowCount - 1;
  const isPresent = useIsPresent();
  return (
    <m.div
      role="listitem"
      inert={!isPresent}
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: reducedMotion ? 0 : 0.18 },
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: 0.25, ease: LAYOUT_EASE },
      }}
      className={[styles.row, isDragging && styles.rowDragging]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={styles.grip}
        aria-hidden="true"
        title={t("studio:queue.dragHint")}
        {...gripHandlers}
      >
        <FiMenu />
      </span>
      <button
        type="button"
        className={styles.play}
        aria-label={t("studio:release.playTrack", { title })}
        aria-disabled={isHiddenBySettings || undefined}
        aria-describedby={isHiddenBySettings ? hiddenNoteId : undefined}
        onClick={() => {
          if (!isHiddenBySettings) onPlay();
        }}
      >
        <QueueRowSummary
          item={item}
          noteId={hiddenNoteId}
          note={isHiddenBySettings ? t("studio:hiddenTrack.label") : undefined}
        />
      </button>
      <div className={styles.actions}>
        <button
          type="button"
          ref={(element) => registerControl("moveUp", element)}
          className={styles.control}
          aria-disabled={isFirst || undefined}
          aria-label={t("studio:queue.moveUp", { title })}
          onClick={() => {
            if (!isFirst) onMove(-1);
          }}
        >
          <FiArrowUp aria-hidden />
        </button>
        <button
          type="button"
          ref={(element) => registerControl("moveDown", element)}
          className={styles.control}
          aria-disabled={isLast || undefined}
          aria-label={t("studio:queue.moveDown", { title })}
          onClick={() => {
            if (!isLast) onMove(1);
          }}
        >
          <FiArrowDown aria-hidden />
        </button>
        <button
          type="button"
          ref={(element) => registerControl("remove", element)}
          className={styles.control}
          aria-label={t("studio:queue.remove", { title })}
          onClick={onRemove}
        >
          <FiX aria-hidden />
        </button>
      </div>
    </m.div>
  );
}

import type { PointerEvent as ReactPointerEvent } from "react";
import { m } from "motion/react";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ShelfResource } from "./api/useCommunityResources";
import { RESOURCE_ICON } from "./communityResourceIcons";
import styles from "./CommunityResources.module.css";

/** Reorder glide, tuned to the repo's motion tokens so the drag/arrow reflow
 *  matches every other transition in the app. Instant under reduced motion. */
const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;
const LAYOUT_DURATION = 0.25;

interface GripDragHandlers {
  /** Only `onPointerDown` arms the drag — the move/up lifecycle is owned by
   *  window listeners in `useRowDragReorder`. */
  onPointerDown: (event: ReactPointerEvent) => void;
}

/**
 * One row of the staff resource editor: a grip drag handle, the entry's kind
 * icon, its title and URL, then move up / move down / edit / remove.
 *
 * Pointer-capture drag plus motion `layout`, the house pattern
 * (`EditorItemRow`, `OverviewEditorRow`) — never motion's `drag` gesture,
 * which floats the row at an arbitrary offset that fights `layout`, and never
 * motion's `Reorder`, which this app's `LazyMotion strict` refuses outright.
 * The up/down buttons are the keyboard and assistive-tech path, which is what
 * lets the grip stay `aria-hidden`: reordering never requires a drag.
 *
 * `position: relative` on the row is load-bearing for the lift while dragging.
 */
export function CommunityResourceRow({
  resource,
  isFirst,
  isLast,
  isDragging,
  isBusy,
  gripHandlers,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}: {
  resource: ShelfResource;
  isFirst: boolean;
  isLast: boolean;
  isDragging: boolean;
  /** True while a shelf write is in flight — freezes every row action. */
  isBusy: boolean;
  gripHandlers: GripDragHandlers;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const Icon = RESOURCE_ICON[resource.kind];

  return (
    <m.div
      className={[styles.row, isDragging && styles.rowDragging]
        .filter(Boolean)
        .join(" ")}
      layout
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
      }}
    >
      <span
        className={styles.grip}
        aria-hidden
        title={t("communities:detail.resources.editor.dragToReorder")}
        {...gripHandlers}
      >
        <FiMoreVertical size={16} />
      </span>
      <span className={styles.rowIcon} aria-hidden>
        <Icon />
      </span>
      <div className={styles.rowMain}>
        <b className={styles.rowTitle}>{resource.title}</b>
        <small className={styles.rowUrl}>{resource.href}</small>
      </div>
      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.rowAction}
          onClick={onMoveUp}
          disabled={isFirst || isBusy}
          aria-label={t("communities:detail.resources.editor.moveUpAria", {
            title: resource.title,
          })}
        >
          <FiArrowUp size={15} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.rowAction}
          onClick={onMoveDown}
          disabled={isLast || isBusy}
          aria-label={t("communities:detail.resources.editor.moveDownAria", {
            title: resource.title,
          })}
        >
          <FiArrowDown size={15} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.rowAction}
          onClick={onEdit}
          disabled={isBusy}
          aria-label={t("communities:detail.resources.editor.editAria", {
            title: resource.title,
          })}
        >
          <FiEdit2 size={15} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.rowAction}
          onClick={onRemove}
          disabled={isBusy}
          aria-label={t("communities:detail.resources.editor.removeAria", {
            title: resource.title,
          })}
        >
          <FiTrash2 size={15} aria-hidden />
        </button>
      </div>
    </m.div>
  );
}

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { m } from "motion/react";
import { FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/MotionProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminGovernancePage.module.css";

const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;
const LAYOUT_DURATION = 0.25;

/** Moves `items[from]` to index `to`, leaving every other row's relative
 *  order unchanged. Shared by every overview section editor. */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

interface GripDragHandlers {
  onPointerDown: (event: ReactPointerEvent) => void;
}

/**
 * One reorderable row inside an overview section editor: a grip drag handle,
 * the caller's fields, and an optional remove button. Pointer-capture drag +
 * motion `layout` glide, mirroring `EditorItemRow` (subprofiles) — never
 * motion's `drag` gesture, which floats the row and fights `layout` (see
 * the motion-react-strict-no-reorder skill note).
 */
export function OverviewEditorRow({
  gripHandlers,
  isDragging,
  onRemove,
  children,
}: {
  gripHandlers: GripDragHandlers;
  isDragging: boolean;
  onRemove?: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();

  return (
    <m.div
      className={isDragging ? `${styles.ovRow} ${styles.ovRowDragging}` : styles.ovRow}
      layout
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
      }}
    >
      <span
        className={styles.ovGrip}
        aria-hidden
        title={t("admin:governance.overview.edit.dragToReorder")}
        {...gripHandlers}
      >
        <FiMoreVertical size={16} />
      </span>
      <div className={styles.ovRowBody}>{children}</div>
      {onRemove && (
        <button
          type="button"
          className={styles.ovRemoveBtn}
          onClick={onRemove}
          aria-label={t("admin:governance.overview.edit.removeRow")}
          title={t("admin:governance.overview.edit.removeRow")}
        >
          <FiTrash2 size={15} aria-hidden />
        </button>
      )}
    </m.div>
  );
}

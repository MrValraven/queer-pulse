import { useRef, type ReactNode, type RefObject } from "react";
import { m } from "motion/react";
import {
  FiArrowDown,
  FiArrowUp,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { OverviewRowReorderProps } from "./useOverviewRowReorder";
import styles from "./AdminGovernancePolicy.module.css";

const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;
const LAYOUT_DURATION = 0.25;

/**
 * One row of a Policy-tab section: the drag grip and position number, the
 * caller's cells laid on the section's shared column grid, and the move /
 * remove cluster at the end.
 *
 * Reordering keeps both paths the overview editors established: a pointer drag
 * on the grip and a pair of move buttons that are the keyboard and
 * assistive-tech route — which is what lets the grip stay `aria-hidden`. The
 * `layout` glide is motion's, never its `drag` gesture (which floats the row
 * and fights `layout`) and never `Reorder` (which this app's `LazyMotion
 * strict` refuses outright).
 *
 * An accent bar down the left edge marks a row that differs from what members
 * can read right now; it is decoration, and the same fact is spoken by the
 * section's "Unsaved changes" line and counted on the draft bar.
 */
export function AdminGovernanceGridRow({
  label,
  gripHandlers,
  isDragging,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  isRemoveDisabled = false,
  removeDisabledReason,
  ordinal,
  isChanged,
  lead,
  children,
}: OverviewRowReorderProps & {
  onRemove: () => void;
  /** A row the page cannot lose, e.g. a figure counted live from accounts. */
  isRemoveDisabled?: boolean;
  removeDisabledReason?: string;
  /** 1-based position, shown beside the grip. */
  ordinal: number;
  isChanged: boolean;
  /** The first column's content, sitting beside the grip and the number. */
  lead: ReactNode;
  /** The remaining cells, in column order. */
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const moveUpButtonRef = useRef<HTMLButtonElement>(null);
  const moveDownButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * A row that reaches an end disables the very button that moved it there,
   * which drops focus to `<body>` mid-reorder. Hand focus to the opposite
   * button in that case so the keyboard path never dead-ends. Deferred a frame
   * so React has committed the new order (and the new `disabled` state) first.
   */
  const moveAndKeepFocus = (
    move: () => void,
    pressedButtonRef: RefObject<HTMLButtonElement | null>,
    oppositeButtonRef: RefObject<HTMLButtonElement | null>,
  ): void => {
    move();
    window.requestAnimationFrame(() => {
      const pressedButton = pressedButtonRef.current;
      if (pressedButton && !pressedButton.disabled) {
        pressedButton.focus();
        return;
      }
      oppositeButtonRef.current?.focus();
    });
  };

  return (
    <m.div
      className={[
        styles.row,
        isChanged && styles.rowChanged,
        isDragging && styles.rowDragging,
      ]
        .filter(Boolean)
        .join(" ")}
      layout
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: LAYOUT_DURATION, ease: LAYOUT_EASE },
      }}
    >
      <div className={styles.lead}>
        <span
          className={styles.grip}
          aria-hidden
          title={t("admin:governance.overview.edit.dragToReorder")}
          {...gripHandlers}
        >
          <FiMoreVertical size={16} />
        </span>
        <span className={styles.ordinal} aria-hidden>
          {ordinal}
        </span>
        <div className={styles.leadBody}>{lead}</div>
      </div>

      {children}

      <div className={styles.actions}>
        <button
          type="button"
          ref={moveUpButtonRef}
          className={styles.actionBtn}
          onClick={() =>
            moveAndKeepFocus(onMoveUp, moveUpButtonRef, moveDownButtonRef)
          }
          disabled={isFirst}
          aria-label={t("admin:governance.overview.edit.moveRowUp", { label })}
        >
          <FiArrowUp size={15} aria-hidden />
        </button>
        <button
          type="button"
          ref={moveDownButtonRef}
          className={styles.actionBtn}
          onClick={() =>
            moveAndKeepFocus(onMoveDown, moveDownButtonRef, moveUpButtonRef)
          }
          disabled={isLast}
          aria-label={t("admin:governance.overview.edit.moveRowDown", {
            label,
          })}
        >
          <FiArrowDown size={15} aria-hidden />
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionBtnRemove}`}
          onClick={onRemove}
          disabled={isRemoveDisabled}
          title={
            isRemoveDisabled
              ? removeDisabledReason
              : t("admin:governance.overview.edit.removeRow")
          }
          aria-label={t("admin:governance.overview.edit.removeRowNamed", {
            label,
          })}
        >
          <FiTrash2 size={15} aria-hidden />
        </button>
      </div>
    </m.div>
  );
}

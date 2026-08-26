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
import styles from "./AdminGovernancePage.module.css";

const LAYOUT_EASE = [0.22, 0.68, 0.16, 1] as const;
const LAYOUT_DURATION = 0.25;

/**
 * One reorderable row inside an overview section editor: a grip drag handle,
 * the caller's fields, move up / move down buttons, and an optional remove
 * button. Pointer-capture drag + motion `layout` glide, mirroring
 * `EditorItemRow` (subprofiles) — never motion's `drag` gesture, which floats
 * the row and fights `layout` (see the motion-react-strict-no-reorder skill
 * note), and never motion's `Reorder`, which this app's `LazyMotion strict`
 * refuses outright.
 *
 * The move buttons are the keyboard and assistive-tech path, which is what
 * lets the grip stay `aria-hidden`: reordering never requires a drag. Their
 * accessible names name the item being moved, so a screen reader reading the
 * list hears "Move Reserve breakdown up", never five identical "Move up"s.
 * `useOverviewRowReorder` supplies every reorder prop here and owns the polite
 * announcement of the row's new position.
 */
export function OverviewEditorRow({
  label,
  gripHandlers,
  isDragging,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: OverviewRowReorderProps & {
  onRemove?: () => void;
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
      className={
        isDragging ? `${styles.ovRow} ${styles.ovRowDragging}` : styles.ovRow
      }
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
      <div className={styles.ovRowActions}>
        <button
          type="button"
          ref={moveUpButtonRef}
          className={styles.ovMoveBtn}
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
          className={styles.ovMoveBtn}
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
        {onRemove && (
          <button
            type="button"
            className={styles.ovRemoveBtn}
            onClick={onRemove}
            aria-label={t("admin:governance.overview.edit.removeRowNamed", {
              label,
            })}
            title={t("admin:governance.overview.edit.removeRow")}
          >
            <FiTrash2 size={15} aria-hidden />
          </button>
        )}
      </div>
    </m.div>
  );
}

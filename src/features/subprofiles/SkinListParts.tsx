import type { ReactNode } from "react";
import { FiArrowDown, FiArrowUp, FiX } from "react-icons/fi";
import { m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { REORDER_EASE, reorderLayoutTransition } from "./reorderMotion";
import styles from "./SkinListControls.module.css";

export {
  SkinListFrame,
  type SkinListFrameProps,
  type SkinListKeyHint,
} from "./SkinListFrame";
export {
  SkinListGrip,
  type SkinListGripProps,
  type SkinListGripReorder,
} from "./SkinListGrip";

/** A row the person just added eases in: a short fade and a small drop. */
const ENTER_DURATION = 0.18;
const ENTER_OFFSET = -4;
const INSTANT = { duration: 0 } as const;

/** One row: the kind's own layout plus the shared hairline, lifted while it
 *  is held under the pointer. The data attribute lets `useSkinListRows` find
 *  the row a focused control belongs to.
 *
 *  A motion `layout="position"` row, so a drag or a keyboard or menu move
 *  glides every row into its new slot. Position only: rows holding
 *  auto-growing textareas change height as the person types, and a size
 *  animation would stretch the text. The glide runs only when
 *  `shouldGlide` (from `useSkinListRows().shouldRowsGlide`, true after a
 *  move): after an insert or a remove the rows jump to their places, so a
 *  new row never fades in over neighbours still gliding from their old
 *  slots. The held row never glides either, since the drag engine moves it
 *  itself. With `isEntering` (a row added by the add button, Enter or a
 *  paste, from `useSkinListRows().isInsertedRow`) it also eases in on mount;
 *  rows already there on the first render appear as they are. Instant under
 *  reduced motion. */
export function SkinListRow({
  className,
  isDragging,
  isEntering = false,
  shouldGlide = true,
  children,
}: {
  className?: string;
  isDragging: boolean;
  isEntering?: boolean;
  shouldGlide?: boolean;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      data-skin-list-row=""
      className={[styles.row, className, isDragging && styles.rowDragging]
        .filter(Boolean)
        .join(" ")}
      layout="position"
      initial={isEntering ? { opacity: 0, y: ENTER_OFFSET } : false}
      animate={isEntering ? { opacity: 1, y: 0 } : undefined}
      transition={{
        duration: reducedMotion ? 0 : ENTER_DURATION,
        ease: REORDER_EASE,
        layout:
          isDragging || !shouldGlide
            ? INSTANT
            : reorderLayoutTransition(reducedMotion),
      }}
    >
      {children}
    </m.div>
  );
}

/** The row a remove button acts on, for its accessible name
 *  ("Remove Question 2"). */
export interface SkinListRowName {
  rowLabel: string;
  rowNumber: number;
}

/** Remove one row. No confirm: the editor's "Discard all" restores it. */
export function SkinListRemoveButton({
  onRemove,
  rowLabel,
  rowNumber,
  isLabelUnique = false,
  className,
}: SkinListRowName & {
  onRemove: () => void;
  /** `rowLabel` names this row alone, so the name drops the row number
   *  (matching `SkinListGrip`). */
  isLabelUnique?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={[styles.toolButton, className].filter(Boolean).join(" ")}
      aria-label={
        isLabelUnique
          ? t("subprofiles:skinList.removeRowNamed", { label: rowLabel })
          : t("subprofiles:skinList.removeRow", {
              label: rowLabel,
              index: rowNumber,
            })
      }
      onClick={onRemove}
    >
      <FiX size={16} aria-hidden />
    </button>
  );
}

/** Move up, move down and remove, dimmed at rest until the row is hovered
 *  or holds focus (always full on touch screens). */
export function SkinListRowTools({
  index,
  count,
  onMove,
  onRemove,
  rowLabel,
  className,
}: {
  /** Names the row in the remove button's label. */
  rowLabel: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={[styles.tools, className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.toolButton}
        disabled={index === 0}
        aria-label={t("subprofiles:skinBlock.moveUp")}
        onClick={() => onMove(index, index - 1)}
      >
        <FiArrowUp size={15} aria-hidden />
      </button>
      <button
        type="button"
        className={styles.toolButton}
        disabled={index === count - 1}
        aria-label={t("subprofiles:skinBlock.moveDown")}
        onClick={() => onMove(index, index + 1)}
      >
        <FiArrowDown size={15} aria-hidden />
      </button>
      <SkinListRemoveButton
        onRemove={onRemove}
        rowLabel={rowLabel}
        rowNumber={index + 1}
      />
    </div>
  );
}

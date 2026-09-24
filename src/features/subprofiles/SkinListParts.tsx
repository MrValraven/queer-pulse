import type {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { FiArrowDown, FiArrowUp, FiMoreVertical, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { SkinListAddButton } from "./SkinListAddButton";
import { SkinRefinedField } from "./SkinRefinedField";
import styles from "./SkinListControls.module.css";
import refinedStyles from "./SkinRefinedList.module.css";

/** One row: the kind's own layout plus the shared hairline, lifted while it
 *  is held under the pointer. The data attribute lets `useSkinListRows` find
 *  the row a focused control belongs to. */
export function SkinListRow({
  className,
  isDragging,
  children,
}: {
  className?: string;
  isDragging: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-skin-list-row=""
      className={[styles.row, className, isDragging && styles.rowDragging]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export interface SkinListFrameProps {
  control: SkinBlockControl;
  isLabelHidden: boolean;
  itemCount: number;
  /** From `useSkinListRows`: wraps only the rows, for drag and focus. */
  containerRef: RefObject<HTMLDivElement | null>;
  addButtonRef: RefObject<HTMLButtonElement | null>;
  onAdd: () => void;
  /** The add button's label when the control sets no `addLabelKey`. */
  defaultAddLabelKey?: string;
  header?: ReactNode;
  children: ReactNode;
}

/**
 * The frame every list control shares: the control's label and helper come
 * from `SkinRefinedField` (sentence case, the hint above the rows), and the
 * rows sit in a group named by that label through `aria-labelledby`, with
 * the add button under them.
 */
export function SkinListFrame({
  control,
  isLabelHidden,
  itemCount,
  containerRef,
  addButtonRef,
  onAdd,
  defaultAddLabelKey = "subprofiles:skinBlock.addItem",
  header,
  children,
}: SkinListFrameProps) {
  const { t } = useTranslation();

  return (
    <SkinRefinedField
      label={t(control.labelKey)}
      isLabelHidden={isLabelHidden}
      labelMode="span"
      helper={control.helperKey ? t(control.helperKey) : undefined}
      helperTone={control.helperTone}
    >
      {(field) => (
        <div
          className={`${styles.list} ${refinedStyles.list}`}
          role="group"
          aria-labelledby={field.labelId}
          aria-describedby={field.describedBy}
        >
          {itemCount > 0 && header}
          <div className={styles.rows} ref={containerRef}>
            {children}
          </div>
          <SkinListAddButton
            label={t(control.addLabelKey ?? defaultAddLabelKey)}
            onAdd={onAdd}
            buttonRef={addButtonRef}
          />
        </div>
      )}
    </SkinRefinedField>
  );
}

/** The drag handle. Pointer only: keyboard reordering goes through the move
 *  buttons or Alt with an arrow key, so the grip stays out of the a11y tree. */
export function SkinListGrip({
  onPointerDown,
  className,
}: {
  onPointerDown: (event: ReactPointerEvent) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <span
      className={[styles.grip, className].filter(Boolean).join(" ")}
      aria-hidden
      title={t("subprofiles:skinList.reorderHint")}
      onPointerDown={onPointerDown}
    >
      <FiMoreVertical size={16} />
    </span>
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
  className,
}: SkinListRowName & {
  onRemove: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={[styles.toolButton, className].filter(Boolean).join(" ")}
      aria-label={t("subprofiles:skinList.removeRow", {
        label: rowLabel,
        index: rowNumber,
      })}
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

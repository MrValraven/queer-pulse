import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FiMoreVertical } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import { SkinListMoveMenu } from "./SkinListMoveMenu";
import { useSkinListMoveItems } from "./useSkinListMoveItems";
import styles from "./SkinListControls.module.css";

/** What a grip needs to move its row without a drag. */
export interface SkinListGripReorder {
  /** Names the row in the grip's label ("Move Reasons 2"). */
  rowLabel: string;
  /** 1-based. */
  rowNumber: number;
  rowCount: number;
  /** True when `rowLabel` already names this row alone (a topic's heading),
   *  so the grip's name drops the row number. */
  isLabelUnique?: boolean;
  /** Moves the row to `toIndex` (0-based). */
  onMove: (toIndex: number) => void;
}

export interface SkinListGripProps {
  onPointerDown: (event: ReactPointerEvent) => void;
  className?: string;
  /** Makes the grip a button that opens a move menu, once the list holds
   *  more than one row. */
  reorder?: SkinListGripReorder;
  /** The handle's glyph, for a list nested in another that needs its grips
   *  told apart (therapist topics use six dots over their lines' three). */
  icon?: IconType;
}

/**
 * The drag handle. With `reorder` it is also a menu button: a click, a tap,
 * Enter or Space opens Move up, Move down, Move to top and Move to bottom
 * (`SkinListMoveMenu`), Arrow Down or Up opens it on the first or last
 * choice, and Alt with an arrow moves the row one place at once. A drag
 * still starts from `onPointerDown`, and the drag engine lets a tap through
 * as a click. A press on the grip closes an open menu, and so does a drag
 * once it begins (the engine's `rowdragstart`). Without `reorder`,
 * or in a list of one row, it is pointer only and stays out of the a11y tree,
 * for rows that reorder by other buttons or have nowhere to go.
 */
export function SkinListGrip({
  onPointerDown,
  className,
  reorder,
  icon: Icon = FiMoreVertical,
}: SkinListGripProps) {
  const { t } = useTranslation();
  if (reorder && reorder.rowCount > 1) {
    return (
      <SkinListGripButton
        onPointerDown={onPointerDown}
        className={className}
        reorder={reorder}
        icon={Icon}
      />
    );
  }
  return (
    <span
      className={cx(styles.grip, className)}
      aria-hidden
      title={t("subprofiles:skinList.reorderHint")}
      onPointerDown={onPointerDown}
    >
      <Icon size={16} />
    </span>
  );
}

function SkinListGripButton({
  onPointerDown,
  className,
  reorder,
  icon: Icon = FiMoreVertical,
}: SkinListGripProps & { reorder: SkinListGripReorder }) {
  const { t } = useTranslation();
  const [openFrom, setOpenFrom] = useState<"first" | "last" | null>(null);
  const isOpen = openFrom !== null;
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Set by a press that closed the menu, so the click ending that same press
  // does not open it again.
  const shouldSkipClickRef = useRef(false);
  const baseId = useId();
  const gripId = `${baseId}-grip`;
  const menuId = `${baseId}-menu`;
  const { rowLabel, rowNumber, rowCount, onMove } = reorder;
  const rowIndex = rowNumber - 1;
  const isFirst = rowIndex <= 0;
  const isLast = rowIndex >= rowCount - 1;
  const items = useSkinListMoveItems({ rowIndex, rowCount, onMove });

  // The drag engine fires `rowdragstart` on the grip once a press becomes a
  // drag, and the menu has no place over a row on the move.
  useEffect(() => {
    const grip = triggerRef.current;
    if (!grip) return;
    const closeOnDrag = () => setOpenFrom(null);
    grip.addEventListener("rowdragstart", closeOnDrag);
    return () => grip.removeEventListener("rowdragstart", closeOnDrag);
  }, []);

  function close(shouldRestoreFocus: boolean) {
    setOpenFrom(null);
    if (shouldRestoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  function handlePointerDown(event: ReactPointerEvent) {
    shouldSkipClickRef.current = isOpen;
    if (isOpen) close(true);
    onPointerDown(event);
  }

  function handleClick() {
    if (shouldSkipClickRef.current) {
      shouldSkipClickRef.current = false;
      return;
    }
    setOpenFrom(isOpen ? null : "first");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    // A key's own click (Enter, Space) always acts, even after a press whose
    // click the drag engine swallowed.
    shouldSkipClickRef.current = false;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const isUp = event.key === "ArrowUp";
    if (!event.altKey) {
      setOpenFrom(isUp ? "last" : "first");
      return;
    }
    if (isUp ? !isFirst : !isLast) onMove(rowIndex + (isUp ? -1 : 1));
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={gripId}
        type="button"
        className={cx(styles.grip, className)}
        aria-label={
          reorder.isLabelUnique
            ? t("subprofiles:skinList.gripLabelNamed", { label: rowLabel })
            : t("subprofiles:skinList.gripLabel", {
                label: rowLabel,
                index: rowNumber,
              })
        }
        title={t("subprofiles:skinList.reorderHint")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Icon size={16} aria-hidden />
      </button>
      {openFrom && (
        <SkinListMoveMenu
          items={items}
          triggerRef={triggerRef}
          menuId={menuId}
          labelledBy={gripId}
          initialFocus={openFrom}
          onClose={close}
        />
      )}
    </>
  );
}

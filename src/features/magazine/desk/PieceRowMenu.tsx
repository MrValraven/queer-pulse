import { useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PieceRowMenuPopover } from "./PieceRowMenuPopover";
import {
  buildPieceRowMenuItems,
  type PieceRowMenuActions,
} from "./pieceRowMenuItems";
import styles from "./PieceRowMenu.module.css";

export interface PieceRowMenuProps extends PieceRowMenuActions {
  /** Names the trigger for screen readers ("More actions for {title}"). */
  pieceTitle: string;
  /** Whether any issue exists; with none, the issue item is left out. */
  hasAnyIssue: boolean;
  /** The issue item's label key ("Add to issue" or "Move issue"). */
  assignLabelKey: string;
}

/**
 * The piece row's trailing More menu. The row leads with one next action;
 * everything else an editor can do to a piece (edit, chase, hand off, file to
 * an issue, delete) waits here, so the row stays one clear verb wide and
 * deleting stays a deliberate second step below a rule.
 *
 * The open menu is a separate, portaled component (`PieceRowMenuPopover`), so
 * it floats over sticky group headers and the table's clipped corners.
 */
export function PieceRowMenu({
  pieceTitle,
  hasAnyIssue,
  assignLabelKey,
  ...actions
}: PieceRowMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = t("magazine:desk.pieceRow.moreAria", { title: pieceTitle });

  const items = buildPieceRowMenuItems({
    translate: t,
    hasAnyIssue,
    assignLabelKey,
    ...actions,
  });

  function close(shouldRestoreFocus: boolean): void {
    setIsOpen(false);
    if (shouldRestoreFocus) triggerRef.current?.focus();
  }

  return (
    <div className={styles.wrap} data-menu-open={isOpen || undefined}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        // Keeps Enter and Space on the trigger away from the desk's own
        // keyboard shortcuts, which listen further up the tree.
        onKeyDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((previous) => !previous);
        }}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {isOpen && (
        <PieceRowMenuPopover
          items={items}
          triggerRef={triggerRef}
          label={label}
          onClose={close}
        />
      )}
    </div>
  );
}

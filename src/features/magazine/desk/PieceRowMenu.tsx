import { useRef, useState } from "react";
import { FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PieceRowMenuPopover } from "./PieceRowMenuPopover";
import type { PieceRowMenuItem } from "./pieceRowMenuItems";
import styles from "./PieceRowMenu.module.css";

export interface PieceRowMenuProps {
  /** Names the trigger for screen readers ("More actions for {title}"). */
  pieceTitle: string;
  /** Opens the delete confirmation for this piece. */
  onDelete: () => void;
}

/**
 * The piece row's trailing "⋯" menu. Delete lives here rather than as a fifth
 * inline button because the row's action strip is hover-revealed: a destructive
 * control sitting one stray click from Hand off is the wrong default, and a
 * menu makes deleting a deliberate second step.
 *
 * The open menu is a separate, portaled component (`PieceRowMenuPopover`) —
 * `.pieces` is `overflow: hidden`, so a dropdown in normal flow would be
 * clipped off the lower rows.
 */
export function PieceRowMenu({ pieceTitle, onDelete }: PieceRowMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const label = t("magazine:desk.pieceRow.moreAria", { title: pieceTitle });

  const items: PieceRowMenuItem[] = [
    {
      key: "delete",
      label: t("magazine:desk.pieceRow.delete"),
      icon: <FiTrash2 aria-hidden />,
      danger: true,
      onSelect: onDelete,
    },
  ];

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
        // The row's own Enter handler opens the piece; without this, opening
        // the menu by keyboard would navigate away at the same time.
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

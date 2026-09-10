import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { usePieceRowMenuPlacement } from "./usePieceRowMenuPlacement";
import styles from "./PieceRowMenu.module.css";
import type { PieceRowMenuItem } from "./pieceRowMenuItems";

export interface PieceRowMenuPopoverProps {
  items: PieceRowMenuItem[];
  /** The ⋯ button this popover hangs off, for both anchoring and dismissal. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Names the menu for screen readers, matching its trigger. */
  label: string;
  /** Closes the menu. `restoreFocus` returns focus to the trigger, which is
   *  right for Escape and wrong when a selected item opens a dialog of its
   *  own — that dialog owns focus from there. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The open menu itself, portaled to `<body>`. Mounted only while the menu is
 * open, so every open measures fresh (see `usePieceRowMenuPlacement`).
 *
 * Implements the APG menu keyboard contract: focus enters the menu on open,
 * Arrow Up/Down rove, Home/End jump to the ends, Escape closes and hands focus
 * back to the trigger.
 */
export function PieceRowMenuPopover({
  items,
  triggerRef,
  label,
  onClose,
}: PieceRowMenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const placement = usePieceRowMenuPlacement(triggerRef, popoverRef, () =>
    onClose(false),
  );

  // APG menu-button contract: focus moves into the menu when it opens. Waits
  // for the measurement so focus never lands on an unpositioned element.
  useEffect(() => {
    if (placement) itemRefs.current[0]?.focus();
  }, [placement]);

  function moveTo(index: number): void {
    itemRefs.current[(index + items.length) % items.length]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    // The desk row is a `role="button"` whose Enter handler opens the piece.
    // React portals still bubble events through the React tree, so without this
    // every key pressed in the menu would also reach that handler.
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      onClose(true);
      return;
    }
    const current = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveTo(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveTo(current - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(items.length - 1);
        break;
    }
  }

  return createPortal(
    <div
      ref={popoverRef}
      className={styles.popover}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      style={{
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        transformOrigin: placement?.transformOrigin,
        // Keep the pre-measure frame unpainted rather than flashing the menu
        // at the viewport corner for a frame.
        visibility: placement ? "visible" : "hidden",
      }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <button
          key={item.key}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          type="button"
          role="menuitem"
          tabIndex={-1}
          className={item.danger ? styles.itemDanger : styles.item}
          onClick={(event) => {
            event.stopPropagation();
            onClose(false);
            item.onSelect();
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

import {
  Fragment,
  useEffect,
  useRef,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePresence } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { usePieceRowMenuPlacement } from "./usePieceRowMenuPlacement";
import styles from "./PieceRowMenu.module.css";
import type { PieceRowMenuItem } from "./pieceRowMenuItems";

/** Longest the exit may linger when `animationend` never arrives (a hidden
 *  tab, a cancelled animation). Sits just past `--dur-fast`. */
const EXIT_FALLBACK_MS = 400;

export interface PieceRowMenuPopoverProps {
  items: PieceRowMenuItem[];
  /** The More button this popover hangs off, for both anchoring and dismissal. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Names the menu for screen readers, matching its trigger. */
  label: string;
  /** Closes the menu. `restoreFocus` returns focus to the trigger before a
   *  selected item runs, so a dialog the item opens records the trigger as
   *  its own place to return focus to when it closes. Escape and Tab always
   *  restore it; an outside press or a scroll/resize does not, since focus
   *  has already moved somewhere else. */
  onClose: (restoreFocus: boolean) => void;
}

/**
 * The open menu itself, portaled to `<body>`. Mounted only while the menu is
 * open, so every open measures fresh (see `usePieceRowMenuPlacement`).
 * `PieceRowMenu` renders it inside an `AnimatePresence`, which keeps it
 * mounted through the close: it turns inert, plays the reverse of the open
 * and hands removal back once the animation ends (at once under reduced
 * motion).
 *
 * Implements the APG menu keyboard contract: focus enters the menu on open,
 * Arrow Up/Down rove, Home/End jump to the ends, Escape and Tab close and
 * hand focus back to the trigger.
 */
export function PieceRowMenuPopover({
  items,
  triggerRef,
  label,
  onClose,
}: PieceRowMenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [isPresent, safeToRemove] = usePresence();
  const { reducedMotion } = useMotionPrefs();
  // Read through a ref so a fresh function from motion never restarts the
  // fallback timer below.
  const safeToRemoveRef = useRef(safeToRemove);
  useEffect(() => {
    safeToRemoveRef.current = safeToRemove;
  });
  // The dismissal listeners stand down while the menu is exiting, so an
  // outside press or scroll cannot close it a second time.
  const placement = usePieceRowMenuPlacement(
    triggerRef,
    popoverRef,
    () => onClose(false),
    isPresent,
  );

  // Removal waits for the exit animation (`onAnimationEnd` below); this
  // covers an animation that never reports back, and reduced motion, which
  // has none to wait for.
  useEffect(() => {
    if (isPresent) return;
    if (reducedMotion) {
      safeToRemoveRef.current?.();
      return;
    }
    const timeoutId = window.setTimeout(
      () => safeToRemoveRef.current?.(),
      EXIT_FALLBACK_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isPresent, reducedMotion]);

  // APG menu-button contract: focus moves into the menu when it opens. Waits
  // for the measurement so focus never lands on an unpositioned element, and
  // runs again when a re-open reclaims a menu that was still exiting.
  useEffect(() => {
    if (placement && isPresent) itemRefs.current[0]?.focus();
  }, [placement, isPresent]);

  function moveTo(index: number): void {
    itemRefs.current[(index + items.length) % items.length]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    // React portals still bubble events through the React tree, and the desk's
    // shortcuts listen on the window: without this, Arrow keys and letters
    // pressed in the menu would also move the desk's current row.
    event.stopPropagation();
    if (event.key === "Escape" || event.key === "Tab") {
      // Tab would otherwise walk out of the portaled menu while it stays
      // open, since it never reaches a focusable element after the last
      // item: closing here and returning focus to the trigger keeps the
      // menu from lingering open behind whatever Tab would land on next.
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
      className={isPresent ? styles.popover : styles.popoverClosing}
      inert={!isPresent}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      style={{
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        transformOrigin: placement?.transformOrigin,
        // The pre-measure frame stays unpainted, so the menu first appears
        // in place beside its trigger.
        visibility: placement ? "visible" : "hidden",
      }}
      onKeyDown={handleKeyDown}
      onAnimationEnd={(event) => {
        if (!isPresent && event.target === event.currentTarget) {
          safeToRemoveRef.current?.();
        }
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Fragment key={item.key}>
            {/* Outside the roving index: Arrow keys skip the rule. */}
            {item.hasSeparatorBefore && (
              <div role="separator" className={styles.separator} />
            )}
            <button
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={item.danger ? styles.itemDanger : styles.item}
              onClick={(event) => {
                event.stopPropagation();
                // Focus returns to the trigger before the item runs, so a
                // dialog it opens (Chase, Hand off, Move issue, Delete)
                // records the trigger as where focus goes back to when it
                // closes, ahead of this menu item unmounting.
                onClose(true);
                item.onSelect();
              }}
            >
              <Icon aria-hidden />
              {item.label}
            </button>
          </Fragment>
        );
      })}
    </div>,
    document.body,
  );
}

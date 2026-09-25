import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useSkinListMenuPlacement } from "./useSkinListMenuPlacement";
import styles from "./PersonaRowActionsMenu.module.css";

/** One choice in a list grip's move menu. */
export interface SkinListMoveMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  /** Kept in the arrow path (as the APG menu does) but inert, for a move
   *  the row cannot make from where it is. */
  isDisabled: boolean;
}

/**
 * A list grip's open move menu, portalled to `<body>` so the row's card
 * cannot clip it, and placed by `useSkinListMenuPlacement`. It borrows the
 * persona row menu's look (PersonaRowActionsMenu.module.css) and its keys:
 * focus enters on the first usable item (the last with `initialFocus`
 * "last"), Arrow Up and Down rove with wrap-around, Home and End jump to the
 * ends, Escape closes and hands focus back to the grip, and Tab closes and
 * moves on from the grip.
 *
 * Choosing an item focuses the grip and closes the menu before the move
 * runs, so `useSkinListRows` finds focus on the grip and keeps it on the
 * moved row's grip.
 */
export function SkinListMoveMenu({
  items,
  triggerRef,
  menuId,
  labelledBy,
  initialFocus,
  onClose,
}: {
  items: SkinListMoveMenuItem[];
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuId: string;
  /** The grip's id, whose name ("Move Reasons 2") names the menu. */
  labelledBy: string;
  initialFocus: "first" | "last";
  /** Closes the menu. `shouldRestoreFocus` returns focus to the grip. */
  onClose: (shouldRestoreFocus: boolean) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const placement = useSkinListMenuPlacement(triggerRef, popoverRef, onClose);
  // Read once: focus moves in on open, and a later render must not pull it
  // back to an end.
  const initialFocusRef = useRef(initialFocus);
  const initialIndexRef = useRef(
    initialFocus === "last"
      ? items.findLastIndex((item) => !item.isDisabled)
      : items.findIndex((item) => !item.isDisabled),
  );

  // Waits for the measurement so focus never lands on an unpositioned menu.
  useEffect(() => {
    if (!placement) return;
    const nodes = itemRefs.current;
    const fallbackIndex =
      initialFocusRef.current === "last" ? nodes.length - 1 : 0;
    const index =
      initialIndexRef.current >= 0 ? initialIndexRef.current : fallbackIndex;
    nodes[index]?.focus({ preventScroll: true });
  }, [placement]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // A portal still bubbles through the React tree, so keys pressed here
    // would otherwise reach the row and the list around it.
    event.stopPropagation();
    if (event.key === "Tab") {
      triggerRef.current?.focus({ preventScroll: true });
      onClose(false);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose(true);
      return;
    }
    const nodes = itemRefs.current.filter((node) => node !== null);
    const current = nodes.findIndex((node) => node === document.activeElement);
    const targets: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowUp: current < 0 ? nodes.length - 1 : current - 1,
      Home: 0,
      End: nodes.length - 1,
    };
    const targetIndex = targets[event.key];
    if (targetIndex === undefined) return;
    event.preventDefault();
    nodes[(targetIndex + nodes.length) % nodes.length]?.focus({
      preventScroll: true,
    });
  }

  function choose(item: SkinListMoveMenuItem) {
    if (item.isDisabled) return;
    triggerRef.current?.focus({ preventScroll: true });
    onClose(false);
    item.onSelect();
  }

  return createPortal(
    <div
      ref={popoverRef}
      id={menuId}
      className={styles.popover}
      role="menu"
      tabIndex={-1}
      aria-labelledby={labelledBy}
      style={{
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        transformOrigin: placement?.transformOrigin,
        // The unplaced frame hides by opacity, which still takes focus. Under
        // reduced motion base.css gives every property a 0.01ms transition,
        // so a visibility switch would still read hidden when the focus
        // effect runs, and focus would stay on the grip.
        opacity: placement ? undefined : 0,
        pointerEvents: placement ? undefined : "none",
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
          aria-disabled={item.isDisabled || undefined}
          className={styles.item}
          onClick={() => choose(item)}
        >
          {item.icon}
          <span className={styles.itemLabel}>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePersonaRowMenuPlacement } from "./usePersonaRowMenuPlacement";
import styles from "./PersonaRowActionsMenu.module.css";

/** One entry in the persona row's Actions menu. */
export interface PersonaRowMenuItem {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  /** Delete or Leave: danger ink, and a hairline above it. */
  isDanger?: boolean;
  /** Shown and focusable (APG keeps disabled items in the arrow path) but
   *  inert, with the menu's note as its description. */
  isDisabled?: boolean;
}

export interface PersonaRowActionsPopoverProps {
  items: PersonaRowMenuItem[];
  /** The Actions button this menu hangs off, for anchoring, dismissal and
   *  handing focus back. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  menuId: string;
  /** Names the menu for screen readers, matching its trigger. */
  label: string;
  /** Which item takes focus on open: the first (click, Enter, Arrow Down) or
   *  the last (Arrow Up on the trigger). */
  initialFocus: "first" | "last";
  /** Why the disabled items are disabled, set just under the last of them so
   *  the reason sits where the choice is made. */
  note?: string;
  /** Closes the menu. `shouldRestoreFocus` returns focus to the trigger. */
  onClose: (shouldRestoreFocus: boolean) => void;
}

/**
 * The open Actions menu, portalled to `<body>` and placed by
 * `usePersonaRowMenuPlacement`. Follows the magazine desk's
 * `PieceRowMenuPopover`: focus enters the menu once it is measured, Arrow
 * Up/Down rove with wrap-around, Home/End jump to the ends, Escape closes and
 * hands focus back to the trigger.
 *
 * Tab closes the menu too. The menu sits at the end of `<body>`, so a Tab
 * left alone would walk out of it into whatever follows the page while the
 * menu stayed open over it. Focus goes back to the trigger during the
 * keydown and the browser's own Tab then moves on from there, which is the
 * APG behaviour: Tab leaves the menu button as if the menu were not there.
 *
 * Choosing an item returns focus to the trigger and closes the menu BEFORE the
 * action runs. Share, Delete and Leave open dialogs that remember the element
 * focused when they open and give focus back to it when they close, so that
 * element is the Actions button, still on the page, and never a menu item that
 * has just unmounted.
 */
export function PersonaRowActionsPopover({
  items,
  triggerRef,
  menuId,
  label,
  initialFocus,
  note,
  onClose,
}: PersonaRowActionsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const noteId = useId();
  const placement = usePersonaRowMenuPlacement(triggerRef, popoverRef, onClose);
  // Read once: focus moves in on open, and a later render (Delete or Leave
  // arriving while the menu is up) must not pull it back to an end.
  const initialFocusRef = useRef(initialFocus);
  const lastDisabledIndex = items.findLastIndex((item) => item.isDisabled);

  // Waits for the measurement so focus never lands on an unpositioned menu.
  useEffect(() => {
    if (!placement) return;
    const nodes = mountedItems(itemRefs.current);
    const target =
      initialFocusRef.current === "last" ? nodes[nodes.length - 1] : nodes[0];
    target?.focus({ preventScroll: true });
  }, [placement]);

  function moveTo(index: number): void {
    const nodes = mountedItems(itemRefs.current);
    nodes[(index + nodes.length) % nodes.length]?.focus({
      preventScroll: true,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    // A portal still bubbles through the React tree, so keys pressed here
    // would otherwise reach the row and the reorder controls around it.
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
    const nodes = mountedItems(itemRefs.current);
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
    moveTo(targetIndex);
  }

  function choose(item: PersonaRowMenuItem): void {
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
      aria-label={label}
      style={{
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        transformOrigin: placement?.transformOrigin,
        visibility: placement ? "visible" : "hidden",
      }}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <div key={item.key} role="none" className={styles.entry}>
          {item.isDanger && <div role="separator" className={styles.rule} />}
          <button
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            aria-disabled={item.isDisabled || undefined}
            aria-describedby={item.isDisabled && note ? noteId : undefined}
            className={item.isDanger ? styles.itemDanger : styles.item}
            onClick={() => choose(item)}
          >
            {item.icon}
            <span className={styles.itemLabel}>{item.label}</span>
          </button>
          {note && index === lastDisabledIndex && (
            <p id={noteId} role="none" className={styles.note}>
              {note}
            </p>
          )}
        </div>
      ))}
    </div>,
    document.body,
  );
}

/** The item buttons currently mounted, in menu order. An item that has left
 *  the list (the ref callback set its slot to `null`) drops out. */
function mountedItems(
  slots: (HTMLButtonElement | null)[],
): HTMLButtonElement[] {
  return slots.filter((node) => node !== null);
}

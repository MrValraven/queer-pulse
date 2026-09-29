import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { DeskMenuList } from "./DeskMenuList";
import type { DeskMenuItem } from "./deskMenuItems";

export type {
  DeskMenuActionItem,
  DeskMenuCheckboxItem,
  DeskMenuHeadingItem,
  DeskMenuItem,
  DeskMenuRadioItem,
  DeskMenuSeparatorItem,
} from "./deskMenuItems";

/**
 * Spread these on the trigger `<button>`, whole: they carry the ref the menu
 * anchors to, `type="button"`, the ARIA state and both handlers. Add your own
 * `className`, `aria-label` and content beside them.
 *
 * To compose with the trigger, go through `DeskMenuProps`: `triggerRef` gets
 * the same button node once it commits (a tooltip anchor, refocusing after a
 * bulk action), and
 * `onTriggerKeyDown` runs before the menu's own key handler (toolbar roving).
 * `onClick`, `onKeyDown` and `ref` written after the spread would replace the
 * menu's and break it.
 */
export interface DeskMenuTriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  type: "button";
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  /** Points at the menu while it is open; unset while closed, when the menu
   *  is not in the DOM. */
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

export interface DeskMenuProps {
  /** Render prop for the trigger; spread `triggerProps` on a button. */
  renderTrigger: (
    triggerProps: DeskMenuTriggerProps,
    isOpen: boolean,
  ) => ReactNode;
  items: DeskMenuItem[];
  /** Accessible name of the menu ("Sort pieces"). Usually the trigger's. */
  label: string;
  /** Which trigger edge the menu lines up with. Default `"start"`. Either way
   *  it is clamped inside the viewport with a 16px gutter. */
  align?: "start" | "end";
  /** Whether choosing an item closes the menu, for every item. Leave unset for
   *  the usual split: checkbox items keep the menu open (tick several filters
   *  in one visit), actions and radios close it. */
  shouldCloseOnSelect?: boolean;
  /** `"trigger"` matches the trigger's width (the scope switcher); `"sm"` is
   *  the default floor and `"md"` suits two-line items. The menu never grows
   *  past the viewport minus 32px. */
  minWidth?: "trigger" | "sm" | "md";
  /** Receives the trigger button too, alongside the menu's own ref. Filled in
   *  a layout effect after commit and cleared on unmount. */
  triggerRef?: Ref<HTMLButtonElement>;
  /** Runs first on every trigger keydown. Call `event.preventDefault()` to
   *  keep the menu from handling that key (ArrowDown/ArrowUp open it). */
  onTriggerKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

/** Writes `node` into a caller's ref, whichever shape of ref it is. */
function assignRef(
  ref: Ref<HTMLButtonElement> | undefined,
  node: HTMLButtonElement | null,
): void {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

type OpenFocus = "first" | "last";

/**
 * The desk's one dropdown menu: scope switcher, New, Filter, Sort and the
 * bulk stage picker are all this, so they share one keyboard model, one look
 * and one set of dismiss rules. Follows the WAI-ARIA menu button pattern.
 *
 * Enter, Space and ArrowDown on the trigger open it on the first item (Enter
 * and Space through the button's native click), ArrowUp on the last. Inside,
 * `useDeskMenuKeyboard` handles roving, type-ahead, Escape and Tab; an outside
 * press closes it. The open menu is portaled and placed by
 * `useDeskMenuPlacement` (see there for why it cannot sit in flow).
 *
 * The trigger is a render prop so each caller keeps its own button styling
 * (a header title, a toolbar chip, a bulk-bar button) while the menu owns the
 * behaviour.
 */
export function DeskMenu({
  renderTrigger,
  items,
  label,
  align = "start",
  shouldCloseOnSelect,
  minWidth = "sm",
  triggerRef: callerTriggerRef,
  onTriggerKeyDown,
}: DeskMenuProps) {
  const [openFocus, setOpenFocus] = useState<OpenFocus | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const isOpen = openFocus !== null;

  // Mirrors the trigger node into the caller's ref after commit. A merged
  // callback ref would do it inline, but `react-hooks/refs` rejects handing a
  // ref-writing function to `renderTrigger` during render. Re-runs when the
  // caller's ref changes; the trigger node itself is stable while mounted.
  useLayoutEffect(() => {
    assignRef(callerTriggerRef, triggerRef.current);
    return () => assignRef(callerTriggerRef, null);
  }, [callerTriggerRef]);

  const close = useCallback((shouldRestoreFocus: boolean) => {
    setOpenFocus(null);
    if (shouldRestoreFocus) triggerRef.current?.focus();
  }, []);

  const triggerProps: DeskMenuTriggerProps = {
    ref: triggerRef,
    type: "button",
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? menuId : undefined,
    onClick: () => {
      // Focus restore on close as well: Safari does not focus a clicked
      // button, and the focused item is about to unmount.
      if (isOpen) close(true);
      else setOpenFocus("first");
    },
    onKeyDown: (event) => {
      onTriggerKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      // Keeps the arrow from also reaching a surrounding list's own roving.
      event.stopPropagation();
      setOpenFocus(event.key === "ArrowDown" ? "first" : "last");
    },
  };

  return (
    <>
      {renderTrigger(triggerProps, isOpen)}
      {openFocus !== null && (
        <DeskMenuList
          menuId={menuId}
          items={items}
          label={label}
          align={align}
          minWidth={minWidth}
          initialFocus={openFocus}
          shouldCloseOnSelect={shouldCloseOnSelect}
          triggerRef={triggerRef}
          onClose={close}
        />
      )}
    </>
  );
}

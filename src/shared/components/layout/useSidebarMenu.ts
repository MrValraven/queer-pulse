import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";

/** Both roles the admin sidebar's menus use: plain items and the role
 *  switcher's radio group. Anchors carrying `role="menuitem"` match too, so a
 *  menu of `<Link>`s roves exactly like a menu of `<button>`s. */
const MENU_ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"]';

export interface SidebarMenu {
  open: boolean;
  toggle: () => void;
  close: () => void;
  /** Wraps trigger + menu. Gives the menu its positioning context, and bounds
   *  the outside-click test. */
  wrapRef: RefObject<HTMLDivElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onMenuKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * The APG menu-button behaviour shared by the admin sidebar's two menus
 * (`AdminRoleSwitcher` at the top, `AdminAccountMenu` at the bottom): close on
 * outside click, Escape closes and restores focus to the trigger, focus moves
 * to the first item on open, and Up/Down/Home/End rove between items.
 *
 * Extracted verbatim from `AdminRoleSwitcher`, which grew all of this first —
 * a second menu in the same rail should not re-implement it and drift.
 */
export function useSidebarMenu(): SidebarMenu {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node))
        setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      // Escape closes and restores focus to the trigger (APG menu button).
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Move focus into the menu (first item) when it opens.
  useEffect(() => {
    if (open)
      menuRef.current?.querySelector<HTMLElement>(MENU_ITEM_SELECTOR)?.focus();
  }, [open]);

  // Up/Down roving between the items, Home/End to the ends.
  const onMenuKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [],
    );
    if (items.length === 0) return;
    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else {
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length;
    }
    items[nextIndex]?.focus();
  }, []);

  const toggle = useCallback(() => setOpen((isOpen) => !isOpen), []);
  const close = useCallback(() => setOpen(false), []);

  return { open, toggle, close, wrapRef, menuRef, triggerRef, onMenuKeyDown };
}

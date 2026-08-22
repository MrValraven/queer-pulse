import { useEffect, useRef, type RefObject } from "react";

/**
 * Keyboard + dismissal behaviour for a small `role="menu"` popover.
 *
 * Opening moves focus onto the first `role="menuitem"`, Arrow/Home/End move
 * between items, and Escape (or a pointer press outside the wrapper) closes the
 * menu and returns focus to the trigger. Without this a keyboard user had to
 * Tab past the trigger to reach the items, and Escape dropped focus to `body`.
 *
 * `close` is held in a latest-callback ref so an inline lambda from the caller
 * cannot re-run the setup effect and yank focus back to the first item on every
 * parent render.
 */
export function useMenuNavigation({
  isOpen,
  close,
  wrapRef,
  menuRef,
  triggerRef,
}: {
  isOpen: boolean;
  close: () => void;
  /** Wraps the trigger AND the menu; a press outside it dismisses. */
  wrapRef: RefObject<HTMLElement | null>;
  /** The `role="menu"` element holding the items. */
  menuRef: RefObject<HTMLElement | null>;
  /** The button that opened the menu; focus returns here on close. */
  triggerRef: RefObject<HTMLElement | null>;
}): void {
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!isOpen) return;
    const itemsOf = (): HTMLElement[] =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
          [],
      );

    itemsOf()[0]?.focus();

    function onPointerDownOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        closeRef.current();
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        triggerRef.current?.focus();
        return;
      }
      const items = itemsOf();
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      const focusAt = (index: number) => {
        event.preventDefault();
        items[(index + items.length) % items.length]?.focus();
      };
      if (event.key === "ArrowDown") focusAt(current + 1);
      else if (event.key === "ArrowUp") focusAt(current - 1);
      else if (event.key === "Home") focusAt(0);
      else if (event.key === "End") focusAt(items.length - 1);
    }

    document.addEventListener("mousedown", onPointerDownOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDownOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, wrapRef, menuRef, triggerRef]);
}

import { useEffect, type RefObject } from "react";

// Focusable-descendant selector for the Tab focus-trap (mirrors Modal.tsx).
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Close on Escape; move focus into the menu; trap Tab within the dialog so
 * keyboard/screen-reader users can't reach the inert message list behind it;
 * restore focus on unmount. (Trap mirrors the Modal.tsx pattern.) Split out of
 * `MessageActionOverlay` purely to keep that component under the 200-line
 * cap — this hook carries no return value, just the mount-time effect.
 */
export function useActionOverlayFocusTrap(
  menuRef: RefObject<HTMLDivElement | null>,
  columnRef: RefObject<HTMLDivElement | null>,
  onClose: () => void,
): void {
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    menuRef.current?.focus();

    const focusableItems = (): HTMLElement[] => {
      const column = columnRef.current;
      return column
        ? Array.from(
            column.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
          ).filter((element) => element.offsetParent !== null)
        : [];
    };

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const column = columnRef.current;
      if (!column) return;
      const items = focusableItems();
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const activeElement = document.activeElement;
      if (!firstItem || !lastItem) {
        event.preventDefault();
        menuRef.current?.focus();
        return;
      }
      if (
        event.shiftKey &&
        (activeElement === firstItem ||
          activeElement === column ||
          activeElement === menuRef.current)
      ) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose, menuRef, columnRef]);
}

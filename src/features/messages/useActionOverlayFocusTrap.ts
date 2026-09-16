import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

// Focusable-descendant selector for the Tab focus-trap (mirrors Modal.tsx).
// Excludes `[tabindex="-1"]` on EVERY entry, including the bare `[tabindex]`
// one: the reaction picker's roving-tabindex row (`ReactionPicker`) puts
// `tabindex="-1"` on every button except the one active roving stop, and
// without this exclusion those `-1` buttons still matched
// `button:not([disabled])`, and the trap then treated one of them as the
// first/last item, so Tab could land on a non-tab-stop and Shift+Tab from the
// picker's real tab stop escaped the dialog entirely.
const FOCUSABLE_SELECTOR =
  'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])';

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
  // Keep the latest onClose reachable without it being a dependency of the
  // mount effect below: the call site (ConversationOverlays) passes a new
  // inline closure on every render, and depending on it directly re-ran the
  // effect on every unrelated parent render (typing ticks, presence,
  // incoming messages), which restored focus to the bubble and then
  // immediately refocused the menu each time. Updated in a layout effect so
  // the ref is current before the keydown handler (attached in the mount
  // effect) can ever fire.
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    menuRef.current?.focus();

    const focusableItems = (): HTMLElement[] => {
      const column = columnRef.current;
      // Excludes anything inside an `aria-hidden="true"` subtree: the lifted
      // bubble/media clone (see MessageActionOverlay.tsx) is a read-only
      // preview marked `aria-hidden`, but `offsetParent` alone still counts
      // any visible link/document-card inside it (it's not display:none),
      // so the trap would otherwise still collect it as a real tab stop.
      return column
        ? Array.from(
            column.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
          ).filter(
            (element) =>
              element.offsetParent !== null &&
              !element.closest('[aria-hidden="true"]'),
          )
        : [];
    };

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
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
      // Both directions wrap symmetrically: Shift+Tab wraps to the last item
      // from the first item (the usual case) AND whenever focus is on
      // something outside the collected list entirely: a roving-tabindex
      // button the selector now excludes, the dialog/menu container itself,
      // or anywhere else focus could have landed. Forward Tab mirrors this,
      // wrapping to the first item from the last item AND from that same
      // "outside the list" case. Without the "outside the list" half, focus
      // sitting on one of those (e.g. the picker's non-active roving
      // buttons) let Tab/Shift+Tab escape the trap natively instead of
      // wrapping.
      const isOutsideItems = !items.includes(activeElement as HTMLElement);
      if (event.shiftKey && (activeElement === firstItem || isOutsideItems)) {
        event.preventDefault();
        lastItem.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastItem || isOutsideItems)
      ) {
        event.preventDefault();
        firstItem.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
    // Intentionally NOT depending on `onClose`: it is read via
    // `onCloseRef` above so an identity change on every parent render (the
    // call site passes an inline closure) can't re-run this effect. `menuRef`
    // and `columnRef` are stable ref objects for the lifetime of the overlay.
  }, [menuRef, columnRef]);
}

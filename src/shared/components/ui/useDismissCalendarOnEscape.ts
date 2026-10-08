/**
 * Escape-to-close for a date picker's desktop calendar panel, matching
 * `DatePickerPopover`'s non-modal dialog contract (no focus trap, no
 * `aria-modal`): the panel closes on Escape, on an outside press, or once a
 * pick completes. The listener sits on `document` in the capture phase and
 * calls `stopPropagation`, so it runs ahead of a host dialog's `useDismiss`
 * and Escape closes the calendar alone (see `DatePickerPopover`'s header).
 *
 * `onClose` is read through a ref (mirrors `DatePickerPopover`), so the
 * listener subscribes once per open/close and callers can pass a fresh
 * closure each render. Pass `isActive` as false on mobile: `ModalSheet`
 * owns its own Escape handling there.
 */

import { useEffect, useRef, type RefObject } from "react";

export function useDismissCalendarOnEscape(
  isActive: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  const savedOnClose = useRef(onClose);
  useEffect(() => {
    savedOnClose.current = onClose;
  });
  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // A modal dialog opened above the picker, one that does not hold its
      // trigger, owns this press.
      const focusedDialog =
        document.activeElement?.closest('[aria-modal="true"]') ?? null;
      const anchor = anchorRef.current;
      if (focusedDialog && anchor && !focusedDialog.contains(anchor)) return;
      event.preventDefault();
      event.stopPropagation();
      savedOnClose.current();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isActive, anchorRef]);
}

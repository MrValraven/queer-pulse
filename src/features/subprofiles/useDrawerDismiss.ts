import { useEffect, useId, useRef } from "react";
import { useScrollLock } from "../../shared/hooks";
import {
  pushModal,
  popModal,
  isTopmostModal,
} from "../../shared/components/ui/modalStack";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * `SubprofileItemDrawer` a11y: scroll-lock, Escape-to-close (only while
 * topmost on the shared modal stack), initial focus into the panel, a Tab
 * focus-trap, and focus restore to the trigger on close.
 *
 * Mirrors the shared `<Modal>`'s private `useDismiss` (`shared/components/
 * ui/Modal.tsx`) almost verbatim — duplicated rather than imported because
 * that hook isn't exported, and the drawer's shape (a right-anchored
 * `.drawer` panel with its own `.scrim.right` classes from
 * `persona-editor.css`) doesn't fit either of `Modal`'s two portal variants.
 */
export function useDrawerDismiss(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const drawerId = useId();
  // Latest-callback ref so the setup effect below can run once on mount
  // (deps `[drawerId]`) without an inline `onClose` re-running the focus
  // trap + initial focus on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useScrollLock();

  useEffect(() => {
    pushModal(drawerId);
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null,
          )
        : [];

    const first = focusables()[0];
    if (first) first.focus();
    else dialog?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only the topmost dialog dismisses — a confirm dialog opened from
        // inside the drawer shouldn't also close the drawer on one press.
        if (isTopmostModal(drawerId)) onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = focusables();
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) {
        e.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || active === dialog)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      popModal(drawerId);
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [drawerId]);

  return dialogRef;
}

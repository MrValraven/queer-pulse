import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The shared focus-trap + keyboard behaviour for the persona lightboxes
 * (`StudioLightbox`, `GalleryLightbox`), which render different shells (global
 * `.lightbox` classes vs a CSS-module overlay) but need the identical dialog
 * interaction: focus the first focusable on open (falling back to the dialog),
 * Escape to close, ←/→ to move, Tab/Shift+Tab cycling within the dialog, and
 * restoring focus to the previously-focused element on unmount.
 *
 * The caller owns the `dialogRef` (attached to its overlay element) and the
 * `useScrollLock()` call, so this hook adds no rendering of its own.
 */
export function useLightboxDialog(
  dialogRef: RefObject<HTMLDivElement | null>,
  { onClose, onMove }: { onClose: () => void; onMove: (delta: number) => void },
): void {
  useEffect(() => {
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

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        onMove(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        onMove(1);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const elements = focusables();
      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];
      if (!firstEl || !lastEl) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === firstEl || active === dialog)) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [dialogRef, onClose, onMove]);
}

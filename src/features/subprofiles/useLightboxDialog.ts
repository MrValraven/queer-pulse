import { useEffect, useRef, type RefObject } from "react";

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
 *
 * `onClose`/`onMove` are held in latest-callback refs so the setup effect runs
 * exactly once per open, the way `useDrawerDismiss` already does. Keying it on
 * the callbacks meant every Next/Prev press (a `setIndex` → parent re-render →
 * fresh callback identities) tore the whole thing down and set it up again,
 * which restored focus to the previously-focused element and then re-focused
 * the first control: a keyboard user who tabbed to "Next" had focus yanked back
 * to the close button after every single image.
 */
export function useLightboxDialog(
  dialogRef: RefObject<HTMLDivElement | null>,
  { onClose, onMove }: { onClose: () => void; onMove: (delta: number) => void },
): void {
  const onCloseRef = useRef(onClose);
  const onMoveRef = useRef(onMove);
  useEffect(() => {
    onCloseRef.current = onClose;
    onMoveRef.current = onMove;
  });

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
        onCloseRef.current();
        return;
      }
      if (event.key === "ArrowLeft") {
        onMoveRef.current(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        onMoveRef.current(1);
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
    // Setup runs once per open (the lightbox is only mounted while open), so
    // focus is never stolen mid-interaction. `onClose`/`onMove` are read
    // through refs above, so they are deliberately not dependencies.
  }, [dialogRef]);
}

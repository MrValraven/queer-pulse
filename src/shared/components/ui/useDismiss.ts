import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useScrollLock } from "../../hooks";
import { pushModal, popModal, isTopmostModal } from "./modalStack";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal a11y for both variants: scroll-lock, Escape-to-close, an initial focus
 * into the dialog, a Tab focus-trap so keyboard/screen-reader users can't tab
 * out to the inert page behind, and focus restore to the trigger on close.
 * Returns a ref to attach to the dialog container. Mount the modal only while
 * open (self-contained modals own their state), so this runs per open.
 */
export function useDismiss<ElementType extends HTMLElement = HTMLDivElement>(
  onClose: () => void,
) {
  // Generic so a dialog that is semantically something other than a div can
  // still use it: AdminDrawer's container is an <aside>, and weakening that to
  // a div just to satisfy the ref type would lose the landmark.
  const dialogRef = useRef<ElementType>(null);
  // Stable per-instance id so this dialog can register itself on the shared
  // modal stack (see `./modalStack`) and only act on Escape while topmost.
  const modalId = useId();
  // Latest-callback ref so the setup effect can run once on mount (deps `[]`)
  // without an inline `onClose` re-running the focus-trap + initial focus on
  // every parent render, which would yank focus back mid-interaction.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useScrollLock();

  useEffect(() => {
    pushModal(modalId);
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null,
          )
        : [];

    // Initial focus: first focusable inside, else the dialog itself.
    const first = focusables()[0];
    if (first) first.focus();
    else dialog?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Only the topmost dialog dismisses — a lone dialog is always
        // topmost, so single-modal behavior is unchanged; a dialog opened
        // from inside another (e.g. a confirm dialog in a drawer's footer)
        // no longer closes both on one Escape press.
        if (isTopmostModal(modalId)) onCloseRef.current();
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
      popModal(modalId);
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [modalId]);

  return dialogRef;
}

/**
 * Backdrop-dismiss props for a scrim, safe against text-selection drags.
 *
 * A `click` event's target is the nearest common ancestor of the `mousedown`
 * and the `mouseup` elements, so dragging to select text inside a dialog and
 * releasing a few pixels past its edge fires a click whose target IS the scrim.
 * A `target === currentTarget` test alone therefore closes the dialog and
 * throws away whatever the member had typed into it. Requiring the pointer to
 * have gone DOWN on the scrim as well makes "click the backdrop" mean what it
 * looks like.
 *
 * Spread onto the scrim element: `<div className={scrim} {...scrimProps} />`.
 */
export function useScrimDismiss(onClose: () => void): {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
} {
  const didPressScrim = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    didPressScrim.current = event.target === event.currentTarget;
  }, []);

  const onClick = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    const wasPressOnScrim = didPressScrim.current;
    didPressScrim.current = false;
    if (event.target === event.currentTarget && wasPressOnScrim) {
      onCloseRef.current();
    }
  }, []);

  return useMemo(() => ({ onPointerDown, onClick }), [onPointerDown, onClick]);
}

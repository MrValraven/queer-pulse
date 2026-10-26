import { useEffect, type RefObject } from "react";
import { useIsPresent } from "motion/react";

/** The app's toast container (ToastProvider). Its Undo and dismiss buttons
 *  keep their focus while a dialog is open. */
const TOAST_REGION_SELECTOR = "[data-toast-region]";

/**
 * Holds focus inside the dialog around `anchorRef` while it is open. The
 * reauth dialog can open over another dialog that is still up
 * (DestructiveActionFlow stays on its confirm step), and that dialog moves
 * focus to its own button when its phase changes, so focus landing on
 * anything earlier in the page comes back here. A dialog portaled after this
 * one and the toast region are left alone, and a closing dialog (`inert`)
 * lets focus go back to its opener. After the dialog unmounts, focus that
 * fell to <body> goes to the dialog still open underneath, when there is one.
 */
export function useFocusStaysOnTop(
  anchorRef: RefObject<HTMLElement | null>,
): void {
  const isPresent = useIsPresent();

  useEffect(() => {
    const dialog = anchorRef.current?.closest<HTMLElement>('[role="dialog"]');
    if (!isPresent || !dialog) return;
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || dialog.inert) return;
      if (dialog.contains(target)) return;
      if (target.closest(TOAST_REGION_SELECTOR)) return;
      const isEarlier = Boolean(
        dialog.compareDocumentPosition(target) &
        Node.DOCUMENT_POSITION_PRECEDING,
      );
      if (!isEarlier) return;
      const codeBox = dialog.querySelector<HTMLElement>("input:not(:disabled)");
      (codeBox ?? dialog).focus();
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [anchorRef, isPresent]);

  useEffect(
    () => () => {
      // After the shared dialog's own focus return, which runs in a later
      // cleanup of the same unmount.
      window.setTimeout(() => {
        if (document.activeElement !== document.body) return;
        const dialogs = document.querySelectorAll<HTMLElement>(
          '[aria-modal="true"]',
        );
        const underneath = dialogs[dialogs.length - 1];
        const firstButton = underneath?.querySelector<HTMLElement>(
          "button:not(:disabled)",
        );
        (firstButton ?? underneath)?.focus();
      }, 0);
    },
    [],
  );
}

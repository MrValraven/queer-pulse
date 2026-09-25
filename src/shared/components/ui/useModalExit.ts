import {
  useEffect,
  useLayoutEffect,
  useRef,
  type AnimationEvent as ReactAnimationEvent,
  type RefObject,
} from "react";
import { usePresence } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** Longest a closing dialog may stay up if its exit animation never reports
 *  back (hidden, `display: none`, a browser that skipped the event), so an
 *  invisible dialog can never keep blocking the page. */
const EXIT_FALLBACK_MS = 400;

export interface ModalExit {
  /** True while an `AnimatePresence` parent holds this dialog on its way out. */
  isClosing: boolean;
  /** The caller's `onClose`, silenced while closing so Escape, the scrim and
   *  the close button cannot ask for a second close during the exit. */
  close: () => void;
  /** The dialog's `onAnimationEnd`: the end of its exit releases it. */
  handleExitAnimationEnd: (event: ReactAnimationEvent<HTMLElement>) => void;
  /** Where focus sat when the closing dialog was removed (see below). */
  focusAtRemovalRef: RefObject<Element | null>;
}

/**
 * Opt-in exit animation for the shared dialogs. Outside an `AnimatePresence`
 * `usePresence` always reports present, so the dialog unmounts the moment its
 * caller stops rendering it, exactly as before. Inside one, the dialog stays
 * mounted with a closing class and `inert` until its exit keyframes finish
 * (at once with reduced motion), then tells motion it is safe to remove.
 *
 * Call it BEFORE `useDismiss`, and `useFocusHandBack` right AFTER it: React
 * runs unmount cleanups in declaration order, so this hook's cleanup can note
 * where focus is before `useDismiss` sends it back to the opener, and
 * `useFocusHandBack`'s layout effects run ahead of `useDismiss`'s own.
 */
export function useModalExit(onClose: () => void): ModalExit {
  const [isPresent, safeToRemove] = usePresence();
  const { reducedMotion } = useMotionPrefs();
  const isClosing = !isPresent;
  const focusAtRemovalRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isClosing || !safeToRemove) return;
    if (reducedMotion) {
      safeToRemove();
      return;
    }
    const fallbackTimer = window.setTimeout(safeToRemove, EXIT_FALLBACK_MS);
    return () => window.clearTimeout(fallbackTimer);
  }, [isClosing, safeToRemove, reducedMotion]);

  useEffect(() => {
    if (!isClosing) return;
    const focusRecord = focusAtRemovalRef;
    return () => {
      focusRecord.current = document.activeElement;
    };
  }, [isClosing]);

  const close = () => {
    if (!isClosing) onClose();
  };

  const handleExitAnimationEnd = (event: ReactAnimationEvent<HTMLElement>) => {
    // A child's own animation bubbles up here too; only the dialog's counts.
    if (isClosing && event.target === event.currentTarget) safeToRemove?.();
  };

  return { isClosing, close, handleExitAnimationEnd, focusAtRemovalRef };
}

/**
 * Focus for a dialog that leaves with an exit animation. Only a dialog that
 * goes through an exit is affected; an instant unmount keeps `useDismiss`'s
 * behaviour untouched.
 *
 * - As the exit starts, focus inside the dialog goes straight back to the
 *   opener, so keyboard use carries on at once and a screen that opens in the
 *   same moment (a success screen, say) records the opener as its own.
 * - When the dialog is finally removed, `useDismiss` returns focus to the
 *   opener. If something else took focus during the exit (that next screen,
 *   or a field the member clicked into), the newer focus is put back.
 */
export function useFocusHandBack(
  { isClosing, focusAtRemovalRef }: ModalExit,
  dialogRef: RefObject<HTMLElement | null>,
) {
  const openerRef = useRef<Element | null>(null);

  // A layout effect runs before `useDismiss` moves focus into the dialog, so
  // this still sees the element that opened it.
  useLayoutEffect(() => {
    openerRef.current = document.activeElement;
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const opener = openerRef.current;
    if (!isClosing || !dialog?.contains(document.activeElement)) return;
    if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
  }, [isClosing, dialogRef]);

  useEffect(() => {
    if (!isClosing) return;
    const focusRecord = focusAtRemovalRef;
    return () => {
      const focusAtRemoval = focusRecord.current;
      focusRecord.current = null;
      if (
        focusAtRemoval instanceof HTMLElement &&
        focusAtRemoval !== document.body &&
        focusAtRemoval.isConnected
      )
        focusAtRemoval.focus();
    };
  }, [isClosing, focusAtRemovalRef]);
}

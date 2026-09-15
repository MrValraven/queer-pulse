import { useCallback, useEffect, useRef, useState } from "react";
import { VIEWER_EXIT_MS } from "./chatViewerMotion";

/**
 * Why the viewer is closing, because the two want different exits.
 *
 * `drag` means a downward swipe already carried the photo most of the way out
 * and left it parked where the finger let go (see `useDragFeedback`), so the
 * exit only has to fade what is left. Every other close — Escape, the close
 * button, a backdrop click, Reply/Forward — starts from a photo sitting still
 * in the middle of the screen and plays the entrance in reverse.
 */
export type ViewerCloseReason = "default" | "drag";

/**
 * Holds the viewer on screen long enough for its exit animation to play, then
 * lets the parent unmount it.
 *
 * The viewer is mounted on `photoIndex !== null` in `ConversationOverlays`, so
 * calling `onClose` is what unmounts it — which is exactly why it cannot be
 * called first. This flips a `closing` phase on instead, and calls the real
 * `onClose` once the animation has had its time.
 *
 * `beginClose` keeps ONE identity for the life of the viewer, which is not
 * cosmetic: it is handed to the stage as `onDismiss`, and the gesture layer
 * memoizes its drag controller on the callbacks it is given, with that
 * controller a dependency of a layout effect that resets zoom and pan. A fresh
 * identity per render would reset a member's zoom out from under their fingers.
 * Hence the latest-value refs rather than dependencies.
 */
export function useViewerClose(
  onClose: () => void,
  reducedMotion: boolean,
): {
  closing: ViewerCloseReason | null;
  beginClose: (reason?: ViewerCloseReason) => void;
} {
  const [closing, setClosing] = useState<ViewerCloseReason | null>(null);
  const onCloseRef = useRef(onClose);
  const reducedMotionRef = useRef(reducedMotion);
  useEffect(() => {
    onCloseRef.current = onClose;
    reducedMotionRef.current = reducedMotion;
  });
  // Guards against a second close request landing during the exit: Escape
  // pressed twice, or a backdrop click on the way to the close button. Without
  // it the second call would restart the phase and hold the viewer up for
  // another full exit.
  const isClosingRef = useRef(false);

  const beginClose = useCallback((reason: ViewerCloseReason = "default") => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    // Under reduced motion there is no exit to wait for, and holding a photo
    // on screen for 180ms with nothing moving is just a delay.
    if (reducedMotionRef.current) {
      onCloseRef.current();
      return;
    }
    setClosing(reason);
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => onCloseRef.current(), VIEWER_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  return { closing, beginClose };
}

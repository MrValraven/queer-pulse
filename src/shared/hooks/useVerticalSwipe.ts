import {
  useLayoutEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createVerticalSwipeTracker } from "./verticalSwipeTracker";

interface UseVerticalSwipeOptions {
  direction: "up" | "down";
  onSwipe: () => void;
  /** Travel while the finger is down, then 0 when it springs back. */
  onDrag?: (offset: number) => void;
  isEnabled?: boolean;
  /** Mouse presses are ignored unless this is true (as in ModalSheet). */
  isMouseAllowed?: boolean;
}

/**
 * A swipe on one element, threshold and flick velocity as ModalSheet's
 * drag-to-dismiss. Spread the result onto the handle; give the handle
 * `touch-action: none` so the page does not scroll under the finger.
 */
export function useVerticalSwipe(options: UseVerticalSwipeOptions) {
  const latestRef = useRef(options);
  useLayoutEffect(() => {
    latestRef.current = options;
  });
  const trackerRef = useRef(
    createVerticalSwipeTracker({ direction: options.direction }),
  );
  return useMemo(
    () => ({
      onPointerDown(event: ReactPointerEvent<HTMLElement>) {
        const latest = latestRef.current;
        if (latest.isEnabled === false) return;
        if (event.pointerType === "mouse" && !latest.isMouseAllowed) return;
        trackerRef.current.start(event.clientY, event.timeStamp);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is optional: jsdom and some webviews lack it.
        }
      },
      onPointerMove(event: ReactPointerEvent<HTMLElement>) {
        if (!trackerRef.current.isActive()) return;
        latestRef.current.onDrag?.(trackerRef.current.move(event.clientY));
      },
      onPointerUp(event: ReactPointerEvent<HTMLElement>) {
        if (!trackerRef.current.isActive()) return;
        const isSwipe = trackerRef.current.end(event.clientY, event.timeStamp);
        if (isSwipe) latestRef.current.onSwipe();
        else latestRef.current.onDrag?.(0);
      },
      onPointerCancel() {
        if (!trackerRef.current.isActive()) return;
        trackerRef.current.cancel();
        latestRef.current.onDrag?.(0);
      },
    }),
    [],
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import { useVerticalSwipe } from "../../../shared/hooks/useVerticalSwipe";

/** How long the sheet plays its leave animation before it unmounts. MUST
 *  match `--dur-base`, the leave transition in EventSheet.module.css. */
export const EVENT_SHEET_EXIT_MS = 250;

/**
 * Every way the event sheet closes, routed through one leave animation:
 * Close, Escape, a tap on the scrim and, on phones, a drag down on the
 * sheet's top bar. `requestClose` plays the leave (the sheet slides down on
 * phones, fades and settles on wider screens), then calls `onClose`. Under
 * reduced motion it calls `onClose` at once. It runs once per sheet, so a
 * second Escape during the leave never closes twice (which would step Back
 * twice through history).
 *
 * `dragOffset` is how far the finger has pulled the sheet down; the sheet
 * follows it and springs back when the drag falls short.
 */
export function useEventSheetDismiss(
  onClose: () => void,
  isSwipeEnabled: boolean,
) {
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const isReducedMotion = usePrefersReducedMotion();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const hasRequestedCloseRef = useRef(false);
  const leaveTimeoutRef = useRef<number | null>(null);

  // Unmounted mid-leave (Back pressed while the sheet slides away): the URL
  // already closed it, so the pending `onClose` must not run.
  useEffect(
    () => () => {
      if (leaveTimeoutRef.current !== null) {
        window.clearTimeout(leaveTimeoutRef.current);
      }
    },
    [],
  );

  const requestClose = useCallback(() => {
    if (hasRequestedCloseRef.current) return;
    hasRequestedCloseRef.current = true;
    if (isReducedMotion) {
      onCloseRef.current();
      return;
    }
    setDragOffset(0);
    setIsClosing(true);
    leaveTimeoutRef.current = window.setTimeout(() => {
      leaveTimeoutRef.current = null;
      onCloseRef.current();
    }, EVENT_SHEET_EXIT_MS);
  }, [isReducedMotion]);

  const swipeHandlers = useVerticalSwipe({
    direction: "down",
    onSwipe: requestClose,
    onDrag: setDragOffset,
    isEnabled: isSwipeEnabled && !isClosing,
  });

  return { isClosing, dragOffset, requestClose, swipeHandlers };
}

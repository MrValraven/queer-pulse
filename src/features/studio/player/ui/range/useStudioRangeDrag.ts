import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  clampValue,
  fractionFromPointer,
  isRightToLeft,
  valueOfFraction,
} from "./studioRangeGeometry";
import {
  toRangePointerType,
  type StudioRangeLatestRef,
  type StudioRangePointerType,
  type StudioRangePreviewControl,
} from "./studioRangeInteraction";
import type { StudioRangeHoverControl } from "./useStudioRangeHover";

interface StudioRangeDragSession {
  pointerId: number;
  pointerType: StudioRangePointerType;
  /** The value before the press; continuous mode returns to it on cancel. */
  originValue: number;
  left: number;
  width: number;
  isRightToLeft: boolean;
  /** The newest pointer value, waiting for the next frame. */
  pendingValue: number | null;
  /** The value the drag last drew. */
  lastValue: number;
  frameId: number;
}

export interface StudioRangeDragControl {
  handlePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  /** False when no drag owns the pointer, so the hover can take it. */
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => boolean;
  handlePointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  handlePointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  /** Cancels like pointercancel when the root itself loses the capture. */
  handleLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => void;
  /** Escape: cancels a drag in progress; true when there was one. */
  cancelDrag: () => boolean;
  isDragging: () => boolean;
}

interface StudioRangeDragOptions {
  rootRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  latestRef: StudioRangeLatestRef;
  preview: StudioRangePreviewControl;
  hover: StudioRangeHoverControl;
  /** Lands a pending key burst before a press starts. */
  flushKeyCommit: () => void;
  /** The pointer type while a drag runs, null once it ends. */
  setDragPointerType: (pointerType: StudioRangePointerType | null) => void;
  /** Bumps when the slider resets; a drag in progress ends with no commit. */
  resetGeneration: number;
}

function isInsideElement(element: Element, clientX: number, clientY: number) {
  const bounds = element.getBoundingClientRect();
  return (
    clientX >= bounds.left &&
    clientX <= bounds.left + bounds.width &&
    clientY >= bounds.top &&
    clientY <= bounds.top + bounds.height
  );
}

/** Unmounting mid drag ends the preview; continuous mode returns to the
 *  origin once, as a cancel does. Release mode commits nothing. */
function useEndDragOnUnmount(
  sessionRef: RefObject<StudioRangeDragSession | null>,
  latestRef: StudioRangeLatestRef,
) {
  useEffect(
    () => () => {
      const session = sessionRef.current;
      if (!session) return;
      if (session.frameId) cancelAnimationFrame(session.frameId);
      sessionRef.current = null;
      const latest = latestRef.current;
      latest.onPreviewChange?.(null);
      if (latest.commitMode === "continuous") {
        latest.onCommit(session.originValue);
      }
    },
    [sessionRef, latestRef],
  );
}

/** Press, drag and release with pointer capture. A press jumps the thumb
 *  under the pointer and drags at once (touch too); moves draw once per
 *  frame. Release mode commits once on pointerup; continuous mode commits on
 *  press and every move. */
export function useStudioRangeDrag({
  rootRef,
  inputRef,
  latestRef,
  preview,
  hover,
  flushKeyCommit,
  setDragPointerType,
  resetGeneration,
}: StudioRangeDragOptions): StudioRangeDragControl {
  const sessionRef = useRef<StudioRangeDragSession | null>(null);

  const control = useMemo(() => {
    const valueAt = (session: StudioRangeDragSession, clientX: number) => {
      const { min, max } = latestRef.current;
      const fraction = fractionFromPointer(
        clientX,
        session,
        session.isRightToLeft,
      );
      return clampValue(valueOfFraction(fraction, min, max), min, max);
    };
    const drawValue = (session: StudioRangeDragSession, value: number) => {
      const isRepeat = value === session.lastValue;
      session.lastValue = value;
      preview.showPreview(value);
      hover.showDragValue(value, session);
      const latest = latestRef.current;
      if (latest.commitMode === "continuous" && !isRepeat)
        latest.onCommit(value);
    };
    const cancelFrame = (session: StudioRangeDragSession) => {
      if (session.frameId) cancelAnimationFrame(session.frameId);
      session.frameId = 0;
    };
    const drawPending = (session: StudioRangeDragSession) => {
      cancelFrame(session);
      const pendingValue = session.pendingValue;
      session.pendingValue = null;
      if (pendingValue !== null) drawValue(session, pendingValue);
    };
    const endSession = (session: StudioRangeDragSession) => {
      cancelFrame(session);
      sessionRef.current = null;
      setDragPointerType(null);
      preview.endPreview();
    };
    /** Ends a drag with no release commit. */
    const abortSession = (
      session: StudioRangeDragSession,
      shouldRestoreOrigin: boolean,
    ) => {
      session.pendingValue = null;
      endSession(session);
      const root = rootRef.current;
      try {
        if (root?.hasPointerCapture(session.pointerId)) {
          root.releasePointerCapture(session.pointerId);
        }
      } catch {
        // The capture is already gone.
      }
      hover.hide();
      const latest = latestRef.current;
      if (shouldRestoreOrigin && latest.commitMode === "continuous") {
        latest.onCommit(session.originValue);
      }
    };
    const matchingSession = (event: PointerEvent<HTMLDivElement>) => {
      const session = sessionRef.current;
      return session && session.pointerId === event.pointerId ? session : null;
    };

    return {
      handlePointerDown: (event: PointerEvent<HTMLDivElement>) => {
        // The phone Now Playing sheet starts a swipe on any press; the bar keeps its own.
        event.stopPropagation();
        const latest = latestRef.current;
        const root = rootRef.current;
        // The same pointer pressing again means its last drag never ended.
        const staleSession = matchingSession(event);
        if (staleSession) abortSession(staleSession, false);
        if (latest.isDisabled || sessionRef.current || !root) return;
        const pointerType = toRangePointerType(event.pointerType);
        if (pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        const originValue = preview.previewRef.current ?? latest.displayedValue;
        flushKeyCommit();
        inputRef.current?.focus({ preventScroll: true });
        const trackBounds = root.getBoundingClientRect();
        const session: StudioRangeDragSession = {
          pointerId: event.pointerId,
          pointerType,
          originValue,
          left: trackBounds.left,
          width: trackBounds.width,
          isRightToLeft: isRightToLeft(root),
          pendingValue: null,
          lastValue: Number.NaN,
          frameId: 0,
        };
        try {
          root.setPointerCapture(event.pointerId);
        } catch {
          // Without capture the drag still follows moves over the bar.
        }
        sessionRef.current = session;
        setDragPointerType(pointerType);
        drawValue(session, valueAt(session, event.clientX));
      },
      handlePointerMove: (event: PointerEvent<HTMLDivElement>) => {
        const session = sessionRef.current;
        if (!session) return false;
        if (session.pointerId !== event.pointerId) return true;
        session.pendingValue = valueAt(session, event.clientX);
        if (!session.frameId) {
          session.frameId = requestAnimationFrame(() => {
            session.frameId = 0;
            if (sessionRef.current === session) drawPending(session);
          });
        }
        return true;
      },
      handlePointerUp: (event: PointerEvent<HTMLDivElement>) => {
        const session = matchingSession(event);
        if (!session) return;
        drawPending(session);
        const latest = latestRef.current;
        if (latest.commitMode === "release") latest.onCommit(session.lastValue);
        endSession(session);
        const root = rootRef.current;
        if (
          session.pointerType === "mouse" &&
          root &&
          isInsideElement(root, event.clientX, event.clientY)
        ) {
          hover.trackPointer(event.clientX);
        } else {
          hover.hide();
        }
      },
      handlePointerCancel: (event: PointerEvent<HTMLDivElement>) => {
        const session = matchingSession(event);
        if (session) abortSession(session, true);
      },
      handleLostPointerCapture: (event: PointerEvent<HTMLDivElement>) => {
        // A descendant losing its own capture bubbles here; the drag keeps going.
        if (event.target !== event.currentTarget) return;
        const session = matchingSession(event);
        if (session) abortSession(session, true);
      },
      cancelDrag: () => {
        const session = sessionRef.current;
        if (!session) return false;
        abortSession(session, true);
        return true;
      },
      isDragging: () => sessionRef.current !== null,
      abortWithoutCommit: () => {
        const session = sessionRef.current;
        if (session) abortSession(session, false);
      },
    };
  }, [
    rootRef,
    inputRef,
    latestRef,
    preview,
    hover,
    flushKeyCommit,
    setDragPointerType,
  ]);

  useLayoutEffect(() => {
    if (resetGeneration > 0) control.abortWithoutCommit();
  }, [control, resetGeneration]);

  useEndDragOnUnmount(sessionRef, latestRef);

  return control;
}

import { useRef, useState, type RefObject } from "react";

export interface UseFramePanPinchOptions {
  zoom: number;
  panX: number;
  panY: number;
  minZoom: number;
  maxZoom: number;
  setZoom: (updater: (current: number) => number) => void;
  setPanX: (updater: (current: number) => number) => void;
  setPanY: (updater: (current: number) => number) => void;
  /** The current crop's width and height as fractions of the source image
   *  (the rect the frame shows), or null before the image has loaded. A drag
   *  needs them to move the image exactly as far as the finger. */
  cropWidthFraction: number | null;
  cropHeightFraction: number | null;
}

function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pointerDistance(
  first: { x: number; y: number },
  second: { x: number; y: number },
): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

/**
 * Converts a drag distance, as a fraction of the frame's size on one axis,
 * into the matching change of the 0-1 pan value on that axis. Pan 0-1 spans
 * only the crop's travel (`1 - cropSize` of the image) while the frame shows
 * `cropSize` of it, so a raw frame fraction would move the image at
 * `(1 - cropSize) / cropSize` of the finger's speed. Scaling by
 * `cropSize / (1 - cropSize)` keeps the image under the finger. Returns 0 when
 * the axis has no travel (the crop already spans the whole image there).
 */
export function panDeltaFromFrameDelta(
  frameDeltaFraction: number,
  cropSizeFraction: number | null,
): number {
  if (cropSizeFraction === null) return 0;
  const travelFraction = 1 - cropSizeFraction;
  if (travelFraction <= 0) return 0;
  return (frameDeltaFraction * cropSizeFraction) / travelFraction;
}

/**
 * Pointer-drag pan + two-finger pinch-zoom over a frame `<div>`. Split out of
 * `useImageReframerState` so both hooks stay under the repo's 200-line
 * function limit; owns nothing about crop geometry, only raw gesture state
 * (which pointers are down, the drag/pinch start points) translated into
 * `panX`/`panY`/`zoom` updates via the setters passed in.
 */
export function useFramePanPinch({
  zoom,
  panX,
  panY,
  minZoom,
  maxZoom,
  setZoom,
  setPanX,
  setPanY,
  cropWidthFraction,
  cropHeightFraction,
}: UseFramePanPinchOptions): {
  frameRef: RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  handleFramePointerDown: (
    pointerId: number,
    clientX: number,
    clientY: number,
  ) => void;
  handleFramePointerMove: (
    pointerId: number,
    clientX: number,
    clientY: number,
  ) => void;
  endFramePointer: (pointerId: number) => void;
} {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const pinchStateRef = useRef<{
    startDistance: number;
    startZoom: number;
  } | null>(null);

  function handleFramePointerDown(
    pointerId: number,
    clientX: number,
    clientY: number,
  ) {
    activePointersRef.current.set(pointerId, { x: clientX, y: clientY });
    if (activePointersRef.current.size >= 2) {
      // A second finger turns the drag into a pinch: the one-finger drag
      // stops, but `isDragging` stays true so the frame's ease stays off and
      // the zoom follows the fingers without lag.
      dragStateRef.current = null;
      setIsDragging(true);
      const [firstPointer, secondPointer] = activePointersRef.current.values();
      if (firstPointer && secondPointer) {
        pinchStateRef.current = {
          startDistance: pointerDistance(firstPointer, secondPointer),
          startZoom: zoom,
        };
      }
      return;
    }
    setIsDragging(true);
    dragStateRef.current = {
      pointerId,
      startX: clientX,
      startY: clientY,
      startPanX: panX,
      startPanY: panY,
    };
  }

  function handleFramePointerMove(
    pointerId: number,
    clientX: number,
    clientY: number,
  ) {
    if (!activePointersRef.current.has(pointerId)) return;
    activePointersRef.current.set(pointerId, { x: clientX, y: clientY });

    if (pinchStateRef.current && activePointersRef.current.size >= 2) {
      const [firstPointer, secondPointer] = activePointersRef.current.values();
      if (
        firstPointer &&
        secondPointer &&
        pinchStateRef.current.startDistance > 0
      ) {
        const currentDistance = pointerDistance(firstPointer, secondPointer);
        const scale = currentDistance / pinchStateRef.current.startDistance;
        setZoom(() =>
          clampValue(
            pinchStateRef.current!.startZoom * scale,
            minZoom,
            maxZoom,
          ),
        );
      }
      return;
    }

    const drag = dragStateRef.current;
    const frame = frameRef.current;
    if (!drag || !frame || drag.pointerId !== pointerId) return;
    const frameRect = frame.getBoundingClientRect();
    if (frameRect.width === 0 || frameRect.height === 0) return;
    const panDeltaX = panDeltaFromFrameDelta(
      (clientX - drag.startX) / frameRect.width,
      cropWidthFraction,
    );
    const panDeltaY = panDeltaFromFrameDelta(
      (clientY - drag.startY) / frameRect.height,
      cropHeightFraction,
    );
    // Dragging the image right reveals more of its left side, so pan moves
    // against the pointer. An axis without travel gets a zero delta, so its
    // pan stays where the drag started.
    setPanX(() => clampValue(drag.startPanX - panDeltaX, 0, 1));
    setPanY(() => clampValue(drag.startPanY - panDeltaY, 0, 1));
  }

  function endFramePointer(pointerId: number) {
    activePointersRef.current.delete(pointerId);
    if (dragStateRef.current?.pointerId === pointerId) {
      dragStateRef.current = null;
    }
    // A finger left over from a pinch starts no new drag (dragStateRef stays
    // null), so it cannot jump the pan; it does nothing until it lifts.
    if (activePointersRef.current.size < 2) {
      pinchStateRef.current = null;
    }
    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
    }
  }

  return {
    frameRef,
    isDragging,
    handleFramePointerDown,
    handleFramePointerMove,
    endFramePointer,
  };
}

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
}: UseFramePanPinchOptions): {
  frameRef: RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  handleFramePointerDown: (pointerId: number, clientX: number, clientY: number) => void;
  handleFramePointerMove: (pointerId: number, clientX: number, clientY: number) => void;
  endFramePointer: (pointerId: number) => void;
} {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const pinchStateRef = useRef<{ startDistance: number; startZoom: number } | null>(null);

  function handleFramePointerDown(pointerId: number, clientX: number, clientY: number) {
    activePointersRef.current.set(pointerId, { x: clientX, y: clientY });
    if (activePointersRef.current.size >= 2) {
      dragStateRef.current = null;
      setIsDragging(false);
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
    dragStateRef.current = { pointerId, startX: clientX, startY: clientY, startPanX: panX, startPanY: panY };
  }

  function handleFramePointerMove(pointerId: number, clientX: number, clientY: number) {
    if (!activePointersRef.current.has(pointerId)) return;
    activePointersRef.current.set(pointerId, { x: clientX, y: clientY });

    if (pinchStateRef.current && activePointersRef.current.size >= 2) {
      const [firstPointer, secondPointer] = activePointersRef.current.values();
      if (firstPointer && secondPointer && pinchStateRef.current.startDistance > 0) {
        const currentDistance = pointerDistance(firstPointer, secondPointer);
        const scale = currentDistance / pinchStateRef.current.startDistance;
        setZoom(() => clampValue(pinchStateRef.current!.startZoom * scale, minZoom, maxZoom));
      }
      return;
    }

    const drag = dragStateRef.current;
    const frame = frameRef.current;
    if (!drag || !frame || drag.pointerId !== pointerId) return;
    const frameRect = frame.getBoundingClientRect();
    if (frameRect.width === 0 || frameRect.height === 0) return;
    const deltaX = (clientX - drag.startX) / frameRect.width;
    const deltaY = (clientY - drag.startY) / frameRect.height;
    setPanX(() => clampValue(drag.startPanX - deltaX, 0, 1));
    setPanY(() => clampValue(drag.startPanY - deltaY, 0, 1));
  }

  function endFramePointer(pointerId: number) {
    activePointersRef.current.delete(pointerId);
    if (dragStateRef.current?.pointerId === pointerId) {
      dragStateRef.current = null;
      setIsDragging(false);
    }
    if (activePointersRef.current.size < 2) {
      pinchStateRef.current = null;
    }
  }

  return { frameRef, isDragging, handleFramePointerDown, handleFramePointerMove, endFramePointer };
}

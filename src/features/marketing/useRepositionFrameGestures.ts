import {
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import type { SourceSize } from "../../shared/components/ui/cropGeometry";
import { useFramePanPinch } from "../../shared/components/ui/useFramePanPinch";
import {
  LISTING_PHOTO_ZOOM_MAX,
  type ListingPhotoFraming,
} from "./api/directory.api";
import {
  coverRenderedSize,
  nudgePhotoFraming,
  visibleFractionOf,
} from "./photoFramingGeometry";

const MIN_ZOOM = 1;
/** A visible fraction at or above this leaves an axis no travel worth a key press. */
const FULL_VIEW_FRACTION = 0.999;

interface FrameMetrics {
  frame: SourceSize;
  natural: SourceSize;
}

export interface UseRepositionFrameGesturesOptions {
  framing: ListingPhotoFraming;
  onFramingChange: (framing: ListingPhotoFraming) => void;
  isEnabled: boolean;
}

export interface RepositionFrameGestures {
  frameRef: RefObject<HTMLDivElement | null>;
  imageRef: RefObject<HTMLImageElement | null>;
  isDragging: boolean;
  frameHandlers: Pick<
    HTMLAttributes<HTMLDivElement>,
    | "onPointerDown"
    | "onPointerMove"
    | "onPointerUp"
    | "onPointerCancel"
    | "onKeyDown"
  >;
}

/** Frame and natural image size at pointer down or key press, or null while the image has no natural size yet. */
function measureFrame(
  frame: HTMLDivElement | null,
  image: HTMLImageElement | null,
): FrameMetrics | null {
  if (!frame || !image) return null;
  if (image.naturalWidth === 0 || image.naturalHeight === 0) return null;
  const frameRect = frame.getBoundingClientRect();
  return {
    frame: { width: frameRect.width, height: frameRect.height },
    natural: { width: image.naturalWidth, height: image.naturalHeight },
  };
}

/**
 * Whether a key may change the framing. An arrow on an axis the frame already
 * shows in full would shift the focus point with nothing visible moving, and
 * would still turn Save on and shift the zoom anchor, so it counts as a no-op,
 * as it does while the image has no natural size to measure. Every other key
 * passes.
 */
function canKeyMovePhoto(
  key: string,
  metrics: FrameMetrics | null,
  zoom: number,
): boolean {
  const isHorizontal = key === "ArrowLeft" || key === "ArrowRight";
  const isVertical = key === "ArrowUp" || key === "ArrowDown";
  if (!isHorizontal && !isVertical) return true;
  if (!metrics) return false;
  const rendered = coverRenderedSize(metrics.frame, metrics.natural);
  const visibleFraction = isHorizontal
    ? visibleFractionOf(metrics.frame.width, rendered.width, zoom)
    : visibleFractionOf(metrics.frame.height, rendered.height, zoom);
  return visibleFraction !== null && visibleFraction < FULL_VIEW_FRACTION;
}

/**
 * Drag, pinch and keyboard reframing for one gallery photo. The shared
 * `useFramePanPinch` does the gesture maths with focusX and focusY as its pan
 * values; this hook measures the frame and image so a drag tracks the finger,
 * and composes every field change onto the latest framing so a diagonal drag
 * reports both axes in its final change.
 */
export function useRepositionFrameGestures({
  framing,
  onFramingChange,
  isEnabled,
}: UseRepositionFrameGesturesOptions): RepositionFrameGestures {
  const imageRef = useRef<HTMLImageElement>(null);
  const latestFramingRef = useRef(framing);
  const [metrics, setMetrics] = useState<FrameMetrics | null>(null);

  useLayoutEffect(() => {
    latestFramingRef.current = framing;
  });

  function changeField(
    field: keyof ListingPhotoFraming,
    updater: (current: number) => number,
  ) {
    const current = latestFramingRef.current;
    const nextValue = updater(current[field]);
    if (nextValue === current[field]) return;
    const next = { ...current, [field]: nextValue };
    latestFramingRef.current = next;
    onFramingChange(next);
  }

  const rendered = metrics
    ? coverRenderedSize(metrics.frame, metrics.natural)
    : null;
  const cropWidthFraction =
    metrics && rendered
      ? visibleFractionOf(metrics.frame.width, rendered.width, framing.zoom)
      : null;
  const cropHeightFraction =
    metrics && rendered
      ? visibleFractionOf(metrics.frame.height, rendered.height, framing.zoom)
      : null;

  const {
    frameRef,
    isDragging,
    handleFramePointerDown,
    handleFramePointerMove,
    endFramePointer,
  } = useFramePanPinch({
    zoom: framing.zoom,
    panX: framing.focusX,
    panY: framing.focusY,
    minZoom: MIN_ZOOM,
    maxZoom: LISTING_PHOTO_ZOOM_MAX,
    setZoom: (updater) => changeField("zoom", updater),
    setPanX: (updater) => changeField("focusX", updater),
    setPanY: (updater) => changeField("focusY", updater),
    cropWidthFraction,
    cropHeightFraction,
  });

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!isEnabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setMetrics(measureFrame(frameRef.current, imageRef.current));
    handleFramePointerDown(event.pointerId, event.clientX, event.clientY);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isEnabled) return;
    handleFramePointerMove(event.pointerId, event.clientX, event.clientY);
  }

  // Ending a pointer runs even while disabled, so a frame locked mid-drag
  // still lets go of its pointer and clears the dragging state.
  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    endFramePointer(event.pointerId);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!isEnabled) return;
    const current = latestFramingRef.current;
    const next = nudgePhotoFraming(current, event.key);
    if (!next) return;
    event.preventDefault();
    const keyMetrics = measureFrame(frameRef.current, imageRef.current);
    if (!canKeyMovePhoto(event.key, keyMetrics, current.zoom)) return;
    latestFramingRef.current = next;
    onFramingChange(next);
  }

  return {
    frameRef,
    imageRef,
    isDragging,
    frameHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onKeyDown,
    },
  };
}

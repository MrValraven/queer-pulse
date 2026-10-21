import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
import type { StudioRangeBubbleRefs } from "./studioRange.types";
import {
  fractionFromPointer,
  fractionOfValue,
  isRightToLeft,
  valueOfFraction,
} from "./studioRangeGeometry";
import type {
  StudioRangeDragGeometry,
  StudioRangeLatestRef,
} from "./studioRangeInteraction";

export interface StudioRangeHoverControl {
  /** The nodes StudioRangeBubble attaches. */
  bubbleRefs: StudioRangeBubbleRefs;
  /** Caches the reading direction for the hover that starts now. */
  beginHover: () => void;
  /** Mouse hover with no drag: one DOM write per frame. */
  trackPointer: (clientX: number) => void;
  /** During a drag the bubble follows the drag value. */
  showDragValue: (value: number, geometry: StudioRangeDragGeometry) => void;
  /** Clears the hover and hides the bubble. */
  hide: () => void;
}

interface StudioRangeHoverOptions {
  rootRef: RefObject<HTMLDivElement | null>;
  latestRef: StudioRangeLatestRef;
  /** Bumps when the slider resets; the hover clears. */
  resetGeneration: number;
}

function setTextIfChanged(element: HTMLElement | null, text: string) {
  if (element && element.textContent !== text) element.textContent = text;
}

/** Hover ghost, `data-hovering` and the value bubble, written straight to
 *  the DOM so a moving pointer never renders React. */
export function useStudioRangeHover({
  rootRef,
  latestRef,
  resetGeneration,
}: StudioRangeHoverOptions): StudioRangeHoverControl {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const detailRef = useRef<HTMLSpanElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const frameIdRef = useRef(0);
  const pendingClientXRef = useRef<number | null>(null);
  const isRightToLeftRef = useRef<boolean | null>(null);

  const control = useMemo(() => {
    const cancelFrame = () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = 0;
      pendingClientXRef.current = null;
    };
    const hideBubble = () => bubbleRef.current?.removeAttribute("data-visible");
    /** physicalFraction runs left to right, whatever the reading order. */
    const showBubble = (
      value: number,
      physicalFraction: number,
      width: number,
    ) => {
      const describeValue = latestRef.current.describeValue;
      const anchor = anchorRef.current;
      const bubble = bubbleRef.current;
      if (!describeValue || !anchor || !bubble) return;
      const content = describeValue(value);
      if (!content) {
        hideBubble();
        return;
      }
      setTextIfChanged(valueRef.current, content.valueLabel);
      setTextIfChanged(detailRef.current, content.detailLabel ?? "");
      detailRef.current?.toggleAttribute("data-empty", !content.detailLabel);
      // The unrounded width keeps the clamp exact at the track ends.
      const halfWidth = bubble.getBoundingClientRect().width / 2;
      const centre = Math.max(
        halfWidth,
        Math.min(width - halfWidth, physicalFraction * width),
      );
      anchor.style.transform = `translate3d(${centre - halfWidth}px, 0, 0)`;
      bubble.setAttribute("data-visible", "");
    };
    const writeHover = (fraction: number) => {
      const root = rootRef.current;
      if (!root) return;
      root.style.setProperty("--studio-range-hover", String(fraction));
      root.setAttribute("data-hovering", "");
    };
    const drawHover = (clientX: number) => {
      const root = rootRef.current;
      if (!root) return;
      const trackBounds = root.getBoundingClientRect();
      const isReversed = isRightToLeftRef.current ?? isRightToLeft(root);
      const fraction = fractionFromPointer(clientX, trackBounds, isReversed);
      const { min, max } = latestRef.current;
      writeHover(fraction);
      showBubble(
        valueOfFraction(fraction, min, max),
        isReversed ? 1 - fraction : fraction,
        trackBounds.width,
      );
    };
    return {
      bubbleRefs: { anchorRef, bubbleRef, detailRef, valueRef },
      beginHover: () => {
        const root = rootRef.current;
        isRightToLeftRef.current = root ? isRightToLeft(root) : null;
      },
      trackPointer: (clientX: number) => {
        pendingClientXRef.current = clientX;
        if (frameIdRef.current) return;
        frameIdRef.current = requestAnimationFrame(() => {
          frameIdRef.current = 0;
          const pendingClientX = pendingClientXRef.current;
          pendingClientXRef.current = null;
          if (pendingClientX !== null) drawHover(pendingClientX);
        });
      },
      showDragValue: (value: number, geometry: StudioRangeDragGeometry) => {
        cancelFrame();
        const { min, max } = latestRef.current;
        const fraction = fractionOfValue(value, min, max);
        if (geometry.pointerType === "mouse") writeHover(fraction);
        showBubble(
          value,
          geometry.isRightToLeft ? 1 - fraction : fraction,
          geometry.width,
        );
      },
      hide: () => {
        cancelFrame();
        rootRef.current?.removeAttribute("data-hovering");
        hideBubble();
        isRightToLeftRef.current = null;
      },
    };
  }, [rootRef, latestRef]);

  useLayoutEffect(() => {
    if (resetGeneration > 0) control.hide();
  }, [control, resetGeneration]);

  useEffect(
    () => () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    },
    [],
  );

  return control;
}

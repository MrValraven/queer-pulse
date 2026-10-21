import { useState, type PointerEvent } from "react";
import {
  toRangePointerType,
  type StudioRangePointerType,
} from "./studioRangeInteraction";
import type { StudioRangeDragControl } from "./useStudioRangeDrag";
import type { StudioRangeHoverControl } from "./useStudioRangeHover";

interface StudioRangePointerHoverOptions {
  isDisabled: boolean;
  hover: StudioRangeHoverControl;
  drag: StudioRangeDragControl;
}

/** Pointer enter, move and leave on the root. A drag in progress owns the
 *  moves; a mouse with no drag drives the hover. */
export function useStudioRangePointerHover({
  isDisabled,
  hover,
  drag,
}: StudioRangePointerHoverOptions) {
  const [hoverPointerType, setHoverPointerType] =
    useState<StudioRangePointerType | null>(null);

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    const pointerType = toRangePointerType(event.pointerType);
    setHoverPointerType(pointerType);
    if (pointerType === "mouse" && !isDisabled) hover.beginHover();
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.handlePointerMove(event)) return;
    if (toRangePointerType(event.pointerType) === "mouse" && !isDisabled) {
      hover.trackPointer(event.clientX);
    }
  };
  const handlePointerLeave = () => {
    setHoverPointerType(null);
    if (!drag.isDragging()) hover.hide();
  };

  return {
    hoverPointerType,
    handlePointerEnter,
    handlePointerMove,
    handlePointerLeave,
  };
}

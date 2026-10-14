/** Space kept between a popover and the viewport edge (the phone gutter). */
export const POPOVER_VIEWPORT_MARGIN = 16;
/** The CSS gap between the trigger and the popover (`100% + 8px`). */
export const POPOVER_TRIGGER_GAP = 8;
/** A popover keeps at least this much height and scrolls inside it. */
export const POPOVER_MIN_BLOCK_SIZE = 160;

export interface StudioPopoverFit {
  /** Horizontal shift in px that keeps the panel inside the viewport. */
  shiftX: number;
  /** The tallest the panel may grow before it scrolls. */
  maxBlockSize: number;
}

/** Where a popover goes so it stays on screen: a horizontal shift toward
 *  the middle when an edge would overflow (the start edge wins on a viewport
 *  narrower than the panel) and a height cap from the room beside the
 *  trigger on its side. Rects are the unshifted measurements. */
export function fitStudioPopover({
  panelLeft,
  panelWidth,
  triggerTop,
  triggerBottom,
  viewportWidth,
  viewportHeight,
  placement,
}: {
  panelLeft: number;
  panelWidth: number;
  triggerTop: number;
  triggerBottom: number;
  viewportWidth: number;
  viewportHeight: number;
  placement: "up" | "down";
}): StudioPopoverFit {
  const panelRight = panelLeft + panelWidth;
  const rightLimit = viewportWidth - POPOVER_VIEWPORT_MARGIN;
  let shiftX = panelRight > rightLimit ? rightLimit - panelRight : 0;
  if (panelLeft + shiftX < POPOVER_VIEWPORT_MARGIN)
    shiftX = POPOVER_VIEWPORT_MARGIN - panelLeft;
  const room =
    placement === "up"
      ? triggerTop - POPOVER_TRIGGER_GAP - POPOVER_VIEWPORT_MARGIN
      : viewportHeight -
        triggerBottom -
        POPOVER_TRIGGER_GAP -
        POPOVER_VIEWPORT_MARGIN;
  return { shiftX, maxBlockSize: Math.max(POPOVER_MIN_BLOCK_SIZE, room) };
}

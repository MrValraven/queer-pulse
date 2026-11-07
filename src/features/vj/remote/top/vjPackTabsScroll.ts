/**
 * The pack tabs' scroll rules: where the scroller goes to centre the shown
 * chip, and which edges hold chips out of view (those edges fade, so a chip
 * cut by the edge reads as "more this way").
 */

export interface VjScrollerBox {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}

export interface VjChipBox {
  offsetLeft: number;
  offsetWidth: number;
}

/** One pixel of slack, so sub-pixel layouts never count as overflow. */
const VJ_EDGE_SLACK_PX = 1;

/**
 * The scrollLeft that puts the chip's centre on the scroller's centre,
 * clamped to the scroll range; `null` when the scroller is already there.
 */
export function vjCenteredScrollLeft(
  scroller: VjScrollerBox,
  chip: VjChipBox,
): number | null {
  const maxLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  const centredLeft =
    chip.offsetLeft + chip.offsetWidth / 2 - scroller.clientWidth / 2;
  const nextLeft = Math.round(Math.min(maxLeft, Math.max(0, centredLeft)));
  return Math.abs(nextLeft - scroller.scrollLeft) <= VJ_EDGE_SLACK_PX
    ? null
    : nextLeft;
}

export interface VjHiddenEdges {
  hasHiddenStart: boolean;
  hasHiddenEnd: boolean;
}

/**
 * Which edges hold chips out of view. scrollLeft is negative in a
 * right-to-left scroller, so the distance from the start is its magnitude.
 */
export function vjHiddenEdgesOf(scroller: VjScrollerBox): VjHiddenEdges {
  const scrolledFromStart = Math.abs(scroller.scrollLeft);
  return {
    hasHiddenStart: scrolledFromStart > VJ_EDGE_SLACK_PX,
    hasHiddenEnd:
      scrolledFromStart + scroller.clientWidth <
      scroller.scrollWidth - VJ_EDGE_SLACK_PX,
  };
}

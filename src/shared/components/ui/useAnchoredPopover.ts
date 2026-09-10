/**
 * Viewport placement for a date picker popover that is portalled to
 * `document.body` and positioned `fixed`.
 *
 * Why portalled rather than absolutely positioned inside the trigger: an
 * absolutely-positioned panel is trapped in the nearest ancestor stacking
 * context, so its `z-index: var(--z-popover)` only ever competes with its own
 * siblings. `FadeIn` (`will-change: opacity, transform` plus a filling
 * `qpGridIn` animation) creates one such context around most page sections,
 * and any later sibling that creates a stacking context of its own paints on
 * top of the whole subtree: a `position: sticky` sidebar, or a run of text
 * with a filling `opacity`/`transform` entrance animation such as the create
 * gathering wizard's requirement checklist. The panel then reads as if text
 * from the page below were printed through it. `Tooltip`'s `placement="right"`
 * already portals for the same reason.
 *
 * Placement mirrors what the old absolute anchoring did, in viewport
 * coordinates: right edge aligned to the anchor's right edge, `ANCHOR_GAP`
 * below it, clamped so neither side runs off screen. Two things are new and
 * only possible now that the panel is `fixed`: it flips above the anchor when
 * there is no room below, and it follows the anchor on scroll instead of
 * scrolling away from it.
 *
 * Measurement uses `offsetWidth`/`offsetHeight`, not `getBoundingClientRect`,
 * because the panel's `qpMenuIn` entrance animation includes a `scale(0.97)`
 * and a rect measured mid-animation would place a panel that is about to grow.
 */

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/** Breathing room kept between the panel and the viewport edge, in px. */
const VIEWPORT_MARGIN = 12;

/** Gap between the trigger row and the panel, in px. Matches the
 *  `calc(100% + 6px)` the absolute `.popover` used to carry in CSS. */
const ANCHOR_GAP = 6;

export interface AnchoredPopoverPlacement {
  /** Inline style for the panel: `fixed` plus its resolved offsets. */
  style: CSSProperties;
  /** True when there was no room below and the panel opened upward, so the
   *  caller can move its `transform-origin` to the bottom edge. */
  isFlipped: boolean;
}

/** Placement is `null` for the single commit before the first measurement,
 *  during which the caller should keep the panel hidden rather than let it
 *  paint at the end of `<body>`. */
export function useAnchoredPopover(
  anchorRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
): AnchoredPopoverPlacement | null {
  const [placement, setPlacement] = useState<AnchoredPopoverPlacement | null>(
    null,
  );
  // What was last published, so a scroll that does not actually move the
  // panel (a scrolling container elsewhere on the page, a rubber-band frame)
  // costs a measurement rather than a re-render per frame.
  const lastPlacedRef = useRef<{
    top: number;
    right: number;
    isFlipped: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    // Closed: nothing to place, and the last placement is deliberately left
    // standing rather than cleared. It is only ever read by a mounted panel,
    // and the next opening re-measures in this same layout effect, before the
    // browser paints, so no stale position can reach the screen. Clearing it
    // would mean a `setState` in the effect body for no visible gain.
    if (!isOpen) return;
    const anchor = anchorRef.current;
    const popover = popoverRef.current;
    if (!anchor || !popover) return;

    const place = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const popoverWidth = popover.offsetWidth;
      const popoverHeight = popover.offsetHeight;

      // Horizontal: a larger `right` moves the panel left, so keeping the left
      // edge on screen sets the ceiling and keeping the right edge on screen
      // sets the floor. Anchored to the trigger (0 nudge) is the preference.
      const anchoredRight = window.innerWidth - anchorRect.right;
      const largestRight = window.innerWidth - popoverWidth - VIEWPORT_MARGIN;
      const right =
        largestRight < VIEWPORT_MARGIN
          ? // Wider than the viewport allows either way: keep the left edge on
            // screen, since that is the side the panel is read from.
            largestRight
          : Math.min(Math.max(anchoredRight, VIEWPORT_MARGIN), largestRight);

      // Vertical: below the trigger by default, above it when the panel would
      // otherwise hang off the bottom of the viewport and be unreachable (a
      // `fixed` panel does not scroll into view the way the absolute one did).
      const topBelow = anchorRect.bottom + ANCHOR_GAP;
      const topAbove = anchorRect.top - ANCHOR_GAP - popoverHeight;
      const hasRoomBelow =
        topBelow + popoverHeight <= window.innerHeight - VIEWPORT_MARGIN;
      const hasRoomAbove = topAbove >= VIEWPORT_MARGIN;
      const isFlipped = !hasRoomBelow && hasRoomAbove;
      // No room on either side (a panel taller than the viewport, or a trigger
      // stranded mid-screen on a short one): shift up against the top margin,
      // which shows as much of the panel as the viewport can hold. `.popover`
      // deliberately has no scroll container of its own, because one would
      // clip the month/year dropdowns that open inside it.
      const top = isFlipped
        ? topAbove
        : hasRoomBelow
          ? topBelow
          : VIEWPORT_MARGIN;

      const roundedTop = Math.round(top);
      const roundedRight = Math.round(right);
      const lastPlaced = lastPlacedRef.current;
      if (
        lastPlaced !== null &&
        lastPlaced.top === roundedTop &&
        lastPlaced.right === roundedRight &&
        lastPlaced.isFlipped === isFlipped
      ) {
        return;
      }
      lastPlacedRef.current = {
        top: roundedTop,
        right: roundedRight,
        isFlipped,
      };
      setPlacement({
        style: { position: "fixed", top: roundedTop, right: roundedRight },
        isFlipped,
      });
    };

    place();
    // The panel's own height changes while it is open: paging from a 5-row
    // month to a 6-row one, or a `mode="datetime"` grid growing its time row.
    // A flipped panel placed against a stale height would drift off its
    // trigger, so re-place whenever the box itself resizes.
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(popover);
    window.addEventListener("resize", place);
    // Capture phase: the trigger may sit in a scrolling column rather than the
    // document, and those scroll events never reach `window` by bubbling.
    window.addEventListener("scroll", place, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, popoverRef, isOpen]);

  return placement;
}

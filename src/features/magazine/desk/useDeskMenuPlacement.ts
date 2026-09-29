import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Gap kept between the menu and either viewport edge. Matches the 16px phone
 *  gutter, and the `--menu-edge` token the stylesheet caps the width with. */
const EDGE_GAP = 16;
/** Gap between the trigger and the menu hanging off it. */
const ANCHOR_GAP = 6;

export interface DeskMenuPlacement {
  top: number;
  left: number;
  /** The trigger's width, for `minWidth="trigger"`. */
  triggerWidth: number;
}

/**
 * Places a `DeskMenu` against its trigger in viewport coordinates. The menu is
 * portaled to `<body>` and `fixed`, for the reason `useAnchoredPopover` gives:
 * desk chrome sits inside `FadeIn` stacking contexts and rounded
 * `overflow: hidden` cards, and an in-flow dropdown gets clipped or painted
 * under a later sibling.
 *
 * Same flip-and-clamp logic as `useAnchoredPopover`, which only anchors by the
 * right edge; the desk needs both edges (the scope switcher opens from the
 * left of the header, the New menu from the right). Returns `null` for the one
 * commit before the first measurement, which the menu keeps transparent.
 *
 * Measures with `offsetWidth`/`offsetHeight`, which ignore the entrance
 * `translate`. Re-places whenever something can move either box: scroll,
 * window resize, a resize of the menu (a filter description appearing) or of
 * the trigger ("Filter" becoming "Filter · 2"), and every commit of the menu,
 * which covers a toolbar reflow that shifts the trigger without resizing it.
 * A placement equal to the last one is dropped, so a no-op re-place costs one
 * measurement and no render.
 */
export function useDeskMenuPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  menuRef: RefObject<HTMLElement | null>,
  align: "start" | "end",
  shouldMatchTriggerWidth: boolean,
): DeskMenuPlacement | null {
  const [placement, setPlacement] = useState<DeskMenuPlacement | null>(null);
  const lastPlacementRef = useRef<DeskMenuPlacement | null>(null);
  // The current `place`, so the per-commit effect below can call it without
  // re-subscribing the observers on every render.
  const placeRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return undefined;

    const place = () => {
      const anchorRect = trigger.getBoundingClientRect();
      // clientWidth leaves out a classic scrollbar, which innerWidth counts,
      // so an end-clamped menu keeps its gutter clear of the scrollbar.
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      // With `minWidth="trigger"` the rendered width is at least the
      // trigger's, so plan for that width before the min-width lands.
      const menuWidth = shouldMatchTriggerWidth
        ? Math.max(menu.offsetWidth, anchorRect.width)
        : menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      const preferredLeft =
        align === "start" ? anchorRect.left : anchorRect.right - menuWidth;
      const largestLeft = viewportWidth - menuWidth - EDGE_GAP;
      const left = Math.max(EDGE_GAP, Math.min(preferredLeft, largestLeft));

      const topBelow = anchorRect.bottom + ANCHOR_GAP;
      const topAbove = anchorRect.top - ANCHOR_GAP - menuHeight;
      const hasRoomBelow = topBelow + menuHeight <= viewportHeight - EDGE_GAP;
      const hasRoomAbove = topAbove >= EDGE_GAP;
      const isFlipped = !hasRoomBelow && hasRoomAbove;
      // No room either side: pin to the top gutter. The stylesheet caps the
      // menu's height at the viewport minus both gutters and lets it scroll.
      const top = isFlipped ? topAbove : hasRoomBelow ? topBelow : EDGE_GAP;

      const nextPlacement: DeskMenuPlacement = {
        top: Math.round(top),
        left: Math.round(left),
        triggerWidth: Math.round(anchorRect.width),
      };
      const lastPlacement = lastPlacementRef.current;
      if (
        lastPlacement !== null &&
        lastPlacement.top === nextPlacement.top &&
        lastPlacement.left === nextPlacement.left &&
        lastPlacement.triggerWidth === nextPlacement.triggerWidth
      ) {
        return;
      }
      lastPlacementRef.current = nextPlacement;
      setPlacement(nextPlacement);
    };

    placeRef.current = place;
    place();
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(menu);
    resizeObserver.observe(trigger);
    window.addEventListener("resize", place);
    // Capture phase: the trigger may sit in a scrolling column whose scroll
    // events never bubble to `window`.
    window.addEventListener("scroll", place, true);
    return () => {
      placeRef.current = () => {};
      resizeObserver.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [triggerRef, menuRef, align, shouldMatchTriggerWidth]);

  // Every commit: the menu re-renders with its parent, so a parent change
  // that moved the trigger (a sibling chip appearing) is caught before paint.
  // Deliberately dependency-free; the dedupe above makes it cheap.
  useLayoutEffect(() => {
    placeRef.current();
  });

  return placement;
}

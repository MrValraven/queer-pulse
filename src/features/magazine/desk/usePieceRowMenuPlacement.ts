import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

/** Gap kept between the popover and any viewport edge. */
const EDGE_GAP = 8;
/** Gap between the trigger and the popover hanging off it. */
const ANCHOR_GAP = 4;

export interface PieceRowMenuPlacement {
  left: number;
  top: number;
  transformOrigin: string;
}

/**
 * Positions `PieceRowMenuPopover` against its trigger and owns its dismissals.
 * Mount-scoped: the popover only exists while the menu is open, so a fresh
 * measurement comes with every open and no stale position can survive a close.
 *
 * The popover is portaled to `<body>` and positioned `fixed` because it cannot
 * hang off the row in normal flow: `.pieces` in PiecesPipeline.module.css is
 * `overflow: hidden` (it's a rounded card), which clips an in-flow dropdown off
 * the lower rows entirely. Same reasoning as `Tooltip`'s `right` placement.
 *
 * Returns `null` until the first measure lands — the caller keeps that frame
 * unpainted rather than flashing the popover at the viewport corner.
 */
export function usePieceRowMenuPlacement(
  triggerRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
): PieceRowMenuPlacement | null {
  const [placement, setPlacement] = useState<PieceRowMenuPlacement | null>(
    null,
  );
  // The dismiss callback is read through a ref so the row doesn't have to
  // memoize it: the listeners below subscribe once, never on every render.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  // Measure and clamp/flip BEFORE paint, so the popover never spills off an
  // edge and never paints at the unclamped position first.
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;
    const anchor = trigger.getBoundingClientRect();
    const { width, height } = popover.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    // Right-aligned to the trigger and hanging below it, flipped above when the
    // row sits near the bottom of the viewport.
    const shouldOpenUp = anchor.bottom + height + EDGE_GAP > viewportHeight;
    setPlacement({
      left: clampToViewport(anchor.right - width, viewportWidth - width),
      top: clampToViewport(
        shouldOpenUp
          ? anchor.top - height - ANCHOR_GAP
          : anchor.bottom + ANCHOR_GAP,
        viewportHeight - height,
      ),
      transformOrigin: `${shouldOpenUp ? "bottom" : "top"} right`,
    });
  }, [triggerRef, popoverRef]);

  // Dismiss on an outside press, and on scroll/resize — both invalidate the
  // measured anchor, and a popover floating away from its own row is worse than
  // one that closes. The pointerdown test spans BOTH the trigger and the
  // portaled popover: treating a press on the trigger as "outside" would close
  // the menu here before the trigger's own click handler reopened it, so the
  // trigger could never close what it had opened.
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      onDismissRef.current();
    }
    const dismiss = () => onDismissRef.current();
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [triggerRef, popoverRef]);

  return placement;
}

/** Clamps one coordinate into the viewport, keeping `EDGE_GAP` at both ends. */
function clampToViewport(value: number, max: number): number {
  return Math.min(
    Math.max(EDGE_GAP, value),
    Math.max(EDGE_GAP, max - EDGE_GAP),
  );
}

import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/** Where a studio menu opens from: its trigger, or a pointer (a right-click). */
export interface QuizshowStudioMenuAnchor {
  element: HTMLElement;
  point: { x: number; y: number } | null;
}

export type QuizshowStudioMenuPlacement = "bottom-end" | "bottom-start";

export interface StudioMenuPosition {
  top: number;
  left: number;
  maxHeight: number;
  isFlippedUp: boolean;
  /** The panel hangs from its anchor's start edge (bottom-start, a right-click point). */
  isAlignedStart: boolean;
}

/** The space kept between the panel and the viewport edge, in px. */
const EDGE_PX = 8;
/** The gap between the anchor and the panel, in px. */
const GAP_PX = 6;
/** A panel never shrinks below this, even on a very short screen. */
const MIN_HEIGHT_PX = 120;

function anchorRectOf(anchor: QuizshowStudioMenuAnchor) {
  if (anchor.point === null) return anchor.element.getBoundingClientRect();
  const { x, y } = anchor.point;
  return { left: x, right: x, top: y, bottom: y };
}

function placePanel(
  panel: HTMLElement,
  anchor: QuizshowStudioMenuAnchor,
  placement: QuizshowStudioMenuPlacement,
): StudioMenuPosition {
  const rect = anchorRectOf(anchor);
  const width = panel.offsetWidth;
  const borders = panel.offsetHeight - panel.clientHeight;
  const height = panel.scrollHeight + borders;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isStart = placement === "bottom-start" || anchor.point !== null;
  const preferredLeft = isStart ? rect.left : rect.right - width;
  const left = Math.min(
    Math.max(preferredLeft, EDGE_PX),
    Math.max(EDGE_PX, viewportWidth - width - EDGE_PX),
  );
  const spaceBelow = viewportHeight - rect.bottom - GAP_PX - EDGE_PX;
  const spaceAbove = rect.top - GAP_PX - EDGE_PX;
  const isFlippedUp = height > spaceBelow && spaceAbove > spaceBelow;
  const maxHeight = Math.max(
    MIN_HEIGHT_PX,
    isFlippedUp ? spaceAbove : spaceBelow,
  );
  const top = isFlippedUp
    ? Math.max(EDGE_PX, rect.top - GAP_PX - Math.min(height, maxHeight))
    : rect.bottom + GAP_PX;
  return { top, left, maxHeight, isFlippedUp, isAlignedStart: isStart };
}

/**
 * Places a fixed menu panel against its anchor before paint, keeps it inside
 * the viewport (flipping above the anchor when there is more room there), and
 * follows a resize. A scroll anywhere outside the panel closes it, since the
 * anchor has moved away from where the panel points.
 */
export function useStudioMenuPosition(
  panelRef: RefObject<HTMLElement | null>,
  anchor: QuizshowStudioMenuAnchor,
  placement: QuizshowStudioMenuPlacement,
  onScrollAway: () => void,
): StudioMenuPosition | null {
  const [position, setPosition] = useState<StudioMenuPosition | null>(null);
  const onScrollAwayRef = useRef(onScrollAway);
  useLayoutEffect(() => {
    onScrollAwayRef.current = onScrollAway;
  });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    const place = () => setPosition(placePanel(panel, anchor, placement));
    const handleScroll = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      onScrollAwayRef.current();
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [panelRef, anchor, placement]);

  return position;
}

/** Space kept between the panel and the viewport edge, px. */
const VIEWPORT_GUTTER = 12;
/** Gap between the trigger and the panel, px. */
const TRIGGER_GAP = 8;
/** Tallest the panel grows before its list scrolls, px. */
const PANEL_MAX_HEIGHT = 560;

export interface AnchoredPanelPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxHeight: number;
  transformOrigin: string;
}

/**
 * Where a floating panel anchored to `trigger` should sit, in viewport
 * coordinates, for a `position: fixed` element portalled to `<body>`.
 *
 * The notifications bell lives in three places: the top bar (top right), the
 * foot of the left rail and the foot of the Messages inbox column (both bottom
 * left). Rather than a placement prop per host, the panel opens toward the side
 * with more room: down from a trigger in the top half of the screen, up from
 * one in the bottom half, and it grows away from the nearer side edge.
 */
export function measureAnchoredPanel(
  trigger: HTMLElement,
): AnchoredPanelPosition {
  const rect = trigger.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const spaceAbove = rect.top - TRIGGER_GAP - VIEWPORT_GUTTER;
  const spaceBelow =
    viewportHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_GUTTER;
  const isOpeningUpward = spaceAbove > spaceBelow;
  const isAnchoredLeft = rect.left + rect.width / 2 < viewportWidth / 2;
  return {
    top: isOpeningUpward ? undefined : rect.bottom + TRIGGER_GAP,
    bottom: isOpeningUpward
      ? viewportHeight - rect.top + TRIGGER_GAP
      : undefined,
    left: isAnchoredLeft ? Math.max(VIEWPORT_GUTTER, rect.left) : undefined,
    right: isAnchoredLeft
      ? undefined
      : Math.max(VIEWPORT_GUTTER, viewportWidth - rect.right),
    maxHeight: Math.min(
      PANEL_MAX_HEIGHT,
      isOpeningUpward ? spaceAbove : spaceBelow,
    ),
    transformOrigin: `${isOpeningUpward ? "bottom" : "top"} ${
      isAnchoredLeft ? "left" : "right"
    }`,
  };
}

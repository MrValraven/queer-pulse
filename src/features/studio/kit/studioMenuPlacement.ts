/* Viewport placement for StudioMenu, which is portalled to <body> and
   positioned fixed. Kept pure so the numbers read in one place. */

export type StudioMenuPlacement = "bottom-end" | "bottom-start";

/** How a point menu was asked for (see useStudioContextMenu). */
export type StudioMenuPointSource = "mouse" | "touch" | "keyboard";

export interface StudioMenuAnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Space the viewport keeps for itself on each side: the notch and rounded
 *  corners (safe-area insets), and at the bottom the player bar, the phone
 *  tab bar and the consent banner as well. */
export interface StudioMenuViewportInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface StudioMenuPosition {
  top: number;
  left: number;
  maxHeight: number;
  /** The panel hangs from the anchor's start edge (or, from a point, opens
   *  towards the inline end). */
  isAlignedStart: boolean;
  /** The panel opens above its anchor. */
  isFlippedUp: boolean;
  /** The corner the spring grows from, the one nearest the anchor. */
  transformOrigin: string;
}

/** The gap kept from every viewport edge, inside the insets. */
const EDGE_GAP = 8;
/** Between a trigger and the panel. */
const ANCHOR_GAP = 6;
/** Between a cursor and the panel. */
const POINT_GAP = 2;
/** Between a fingertip and the panel: clear of the finger pad. */
const FINGER_GAP = 16;
/** A panel never shrinks below about three rows; it scrolls inside. */
const MIN_MENU_HEIGHT = 136;

/** Resolves the insets with one probe, since env() and the published
 *  custom properties are only known to the live tree. */
export function measureViewportInsets(): StudioMenuViewportInsets {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;inline-size:0;box-sizing:content-box;" +
    "padding-top:env(safe-area-inset-top, 0px);" +
    "padding-right:env(safe-area-inset-right, 0px);" +
    "padding-left:env(safe-area-inset-left, 0px);" +
    "padding-bottom:env(safe-area-inset-bottom, 0px);" +
    "block-size:calc(var(--studio-player-inset, 0px) + max(var(--bottom-inset, 0px), var(--consent-inset, 0px)))";
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const pixels = (value: string) => parseFloat(value) || 0;
  const reservedBottom = pixels(style.height);
  // --bottom-inset already carries the bottom safe area where it is set;
  // the larger of the two is what the bottom edge loses.
  const insets = {
    top: pixels(style.paddingTop),
    right: pixels(style.paddingRight),
    bottom: Math.max(reservedBottom, pixels(style.paddingBottom)),
    left: pixels(style.paddingLeft),
  };
  probe.remove();
  return insets;
}

export function pointRect(point: {
  x: number;
  y: number;
}): StudioMenuAnchorRect {
  return { top: point.y, bottom: point.y, left: point.x, right: point.x };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Which way the panel grows from its anchor, in physical terms. A trigger
 *  menu follows its placement; a cursor menu opens towards the inline end;
 *  a finger menu opens towards the inline start, so the hand that pressed
 *  does not cover it. RTL mirrors all three. */
function growsRightwards(input: {
  placement: StudioMenuPlacement;
  pointSource: StudioMenuPointSource | null;
  isRtl: boolean;
}): boolean {
  const growsTowardsEnd =
    input.pointSource === null
      ? input.placement === "bottom-start"
      : input.pointSource !== "touch";
  return growsTowardsEnd !== input.isRtl;
}

export function placeStudioMenu(input: {
  anchor: StudioMenuAnchorRect;
  menuWidth: number;
  menuHeight: number;
  placement: StudioMenuPlacement;
  /** Null for a trigger menu. */
  pointSource: StudioMenuPointSource | null;
  isRtl: boolean;
  viewportWidth: number;
  viewportHeight: number;
  insets: StudioMenuViewportInsets;
}): StudioMenuPosition {
  const { anchor, menuWidth, menuHeight, pointSource, insets } = input;
  const isTouch = pointSource === "touch";
  const gap =
    pointSource === null ? ANCHOR_GAP : isTouch ? FINGER_GAP : POINT_GAP;
  const leftLimit = insets.left + EDGE_GAP;
  const rightLimit = input.viewportWidth - insets.right - EDGE_GAP;

  let isRightwards = growsRightwards(input);
  let left = isRightwards ? anchor.left : anchor.right - menuWidth;
  if (isRightwards && left + menuWidth > rightLimit) {
    isRightwards = false;
    left = anchor.right - menuWidth;
  } else if (!isRightwards && left < leftLimit) {
    isRightwards = true;
    left = anchor.left;
  }
  left = clamp(left, leftLimit, rightLimit - menuWidth);

  const topLimit = insets.top + EDGE_GAP;
  const bottomLimit = input.viewportHeight - insets.bottom - EDGE_GAP;
  const roomBelow = bottomLimit - (anchor.bottom + gap);
  const roomAbove = anchor.top - gap - topLimit;
  // A finger menu prefers the space above the finger; everything else
  // prefers below. Either flips when the other side has the room.
  const isFlippedUp = isTouch
    ? menuHeight <= roomAbove || roomAbove > roomBelow
    : menuHeight > roomBelow && roomAbove > roomBelow;
  const maxHeight = Math.max(
    MIN_MENU_HEIGHT,
    isFlippedUp ? roomAbove : roomBelow,
  );
  const shownHeight = Math.min(menuHeight, maxHeight);
  const top = isFlippedUp
    ? anchor.top - gap - shownHeight
    : Math.min(anchor.bottom + gap, bottomLimit - shownHeight);
  return {
    top: Math.round(Math.max(topLimit, top)),
    left: Math.round(left),
    maxHeight: Math.floor(maxHeight),
    isAlignedStart: isRightwards !== input.isRtl,
    isFlippedUp,
    transformOrigin: `${isRightwards ? "left" : "right"} ${isFlippedUp ? "bottom" : "top"}`,
  };
}

export function isSamePosition(
  previous: StudioMenuPosition | null,
  next: StudioMenuPosition,
): boolean {
  return (
    previous !== null &&
    previous.top === next.top &&
    previous.left === next.left &&
    previous.maxHeight === next.maxHeight &&
    previous.isFlippedUp === next.isFlippedUp &&
    previous.isAlignedStart === next.isAlignedStart
  );
}

import type { ToastAction, ToastType } from "./toastContext";

export interface ToastItem {
  id: number;
  title: string;
  detail?: string;
  type: ToastType;
  isLeaving: boolean;
  action?: ToastAction;
  /** The whole auto-dismiss lifetime, which the timer hairline drains over. */
  lifetimeMs: number;
}

/** Where one card sits in the deck, worked out by `layoutDeck`. */
export interface ToastPlacement {
  offsetPx: number;
  scale: number;
  /** Stacking order inside the container: the newest card is highest. */
  layer: number;
  /** Folded too deep to show: faded out, still in the DOM and its live region. */
  isTucked: boolean;
  /** Folded behind the front card: its content fades out and it takes the
   *  front card's height, so only its bottom edge peeks out. */
  isBehind: boolean;
  /** The height the card is drawn at, once a measurement exists. */
  heightPx?: number;
}

/** How much of each card behind the front one shows under it while folded. */
const FOLDED_PEEK_PX = 8;
/** How much each card behind the front one shrinks while the deck is folded. */
const DECK_SCALE_STEP = 0.05;
/** Cards at this depth and beyond fade out of the folded deck. */
const DECK_VISIBLE_DEPTH = 3;
/** Space between cards once the deck spreads into a column. */
const SPREAD_GAP_PX = 10;

export const RESTING_PLACEMENT: ToastPlacement = {
  offsetPx: 0,
  scale: 1,
  layer: 1,
  isTucked: false,
  isBehind: false,
};

/**
 * Lays every toast out as one deck across both live regions, newest in front.
 *
 * Folded, every card behind the front one takes the front card's height and
 * shrinks 5% per step from its top edge. Each step drops by the peek plus the
 * height that 5% takes off, so every card behind shows the same 8px strip
 * under the one in front of it, and from the fourth card on they fade away.
 * Spread, each card keeps its own measured height and sits below the cards
 * in front of it. A leaving card keeps its spot while the cards behind it
 * move up, since only the cards still showing count toward the depth and
 * offset of the next. `stackHeightPx` is the height the container takes so
 * the pointer stays on the stack across the gaps between spread cards.
 */
export function layoutDeck(
  toasts: readonly ToastItem[],
  heights: ReadonlyMap<number, number>,
  isSpread: boolean,
) {
  const newestFirst = [...toasts].sort((first, second) => second.id - first.id);
  const frontToast = newestFirst.find((toast) => !toast.isLeaving);
  const frontHeightPx = frontToast ? heights.get(frontToast.id) : undefined;
  const foldedStepPx = FOLDED_PEEK_PX + DECK_SCALE_STEP * (frontHeightPx ?? 0);
  const placements = new Map<number, ToastPlacement>();
  let showingInFront = 0;
  let spreadOffsetPx = 0;
  let stackHeightPx = 0;
  newestFirst.forEach((toast, position) => {
    const depth = Math.min(showingInFront, DECK_VISIBLE_DEPTH);
    const isBehind = !isSpread && showingInFront > 0;
    const naturalHeightPx = heights.get(toast.id);
    const heightPx = isBehind
      ? (frontHeightPx ?? naturalHeightPx)
      : naturalHeightPx;
    const offsetPx = isSpread ? spreadOffsetPx : depth * foldedStepPx;
    const scale = isSpread ? 1 : 1 - depth * DECK_SCALE_STEP;
    const isTucked = !isSpread && showingInFront >= DECK_VISIBLE_DEPTH;
    placements.set(toast.id, {
      offsetPx,
      scale,
      layer: newestFirst.length - position,
      isTucked,
      isBehind,
      heightPx,
    });
    if (toast.isLeaving) return;
    if (!isTucked) {
      stackHeightPx = Math.max(
        stackHeightPx,
        offsetPx + (heightPx ?? 0) * scale,
      );
    }
    showingInFront += 1;
    spreadOffsetPx += (naturalHeightPx ?? 0) + SPREAD_GAP_PX;
  });
  return { placements, stackHeightPx };
}

const DEFAULT_LIFETIME_MS = 3400;
/** Action toasts (e.g. Undo) linger a little longer so they're reachable. */
const ACTION_LIFETIME_MS = 5200;
/** Errors stay long enough to read the reason and act on it. */
const ERROR_LIFETIME_MS = 7000;

/** The lifetime a toast gets when its caller names none: the longer of its
 *  type's default and the action default. */
export function defaultLifetimeMs(type: ToastType, hasAction: boolean) {
  const typeLifetimeMs =
    type === "error" ? ERROR_LIFETIME_MS : DEFAULT_LIFETIME_MS;
  return Math.max(typeLifetimeMs, hasAction ? ACTION_LIFETIME_MS : 0);
}

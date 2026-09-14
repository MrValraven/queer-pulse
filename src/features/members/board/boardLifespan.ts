import type { BoardItem } from "../data/members";

/** Once this many days or fewer remain, the row nudges: the figure and the
 *  meter fill take the accent colour. Carried over from the old BoardRow. */
export const EXPIRY_WARNING_DAYS = 7;

/** How long each kind of post runs, mirroring the backend's
 *  BOARD_ITEM_LIFESPAN_DAYS. A member searching for something needs a shorter
 *  shelf life than one advertising something they have to give. */
export const BOARD_WINDOW_DAYS: Record<BoardItem["kind"], number> = {
  looking: 30,
  offering: 90,
};

/** How many times a post can be renewed before a member rewrites it. Mirrors
 *  the backend's BOARD_RENEW_LIMIT; the server is the one that enforces it. */
export const BOARD_RENEW_LIMIT = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface BoardLifespan {
  /** The post's full run in days, from its kind. */
  windowDays: number;
  /** Whole days remaining, rounded up so "expires later today" reads as 1.
   *  Zero for an expired post. */
  daysLeft: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  /** Proportion of the window still to run, clamped to 0..1, for the meter. */
  fractionLeft: number;
}

/**
 * Everything the lifespan meter needs, from one post and an explicit clock.
 *
 * The clock is a parameter rather than a `Date.now()` call because every demo
 * board post is dated in the past: reading the real clock would show the whole
 * demo board as expired and replace the section's main interaction with a wall
 * of terminal states. Demo mode passes a pinned reference date; live mode
 * passes `Date.now()`.
 *
 * A closed post has no lifespan left to describe, so it is never expired and
 * never expiring: "Found, closed" already says where it stands.
 */
export function boardLifespan(item: BoardItem, nowMs: number): BoardLifespan {
  const windowDays = BOARD_WINDOW_DAYS[item.kind];
  const expiresAtMs = new Date(item.expiresAt).getTime();
  const isClosed = item.status === "closed";

  if (Number.isNaN(expiresAtMs)) {
    return {
      windowDays,
      daysLeft: 0,
      isExpired: false,
      isExpiringSoon: false,
      fractionLeft: 0,
    };
  }

  const remainingMs = expiresAtMs - nowMs;
  const isExpired = !isClosed && remainingMs <= 0;
  const daysLeft = isExpired ? 0 : Math.max(0, Math.ceil(remainingMs / DAY_MS));

  return {
    windowDays,
    daysLeft,
    isExpired,
    isExpiringSoon: !isClosed && !isExpired && daysLeft <= EXPIRY_WARNING_DAYS,
    fractionLeft: Math.min(1, Math.max(0, remainingMs / (windowDays * DAY_MS))),
  };
}

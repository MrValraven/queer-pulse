import type {
  CommunityBadgeDTO,
  CommunityShelfGiftDTO,
} from "./api/communityBadges.api";

/**
 * The badge sheet lives in the URL, so a notification, the sidebar card and
 * the hero button can all open it by link: `?badges=open` opens the badge
 * list, `?badges=gifts` the gift shelf, and `&badge=<id>` names the row to
 * bring into view. Every other param on the page is kept as it is.
 */

export const BADGES_PARAM = "badges";
export const BADGE_FOCUS_PARAM = "badge";

export type BadgeSheetTab = "badges" | "gifts";

const PARAM_VALUE_BY_TAB: Record<BadgeSheetTab, string> = {
  badges: "open",
  gifts: "gifts",
};

/**
 * The router state marker the sidebar card and hero button push with the
 * sheet's URL. Closing steps back one entry when the marker is there, so a
 * single Back always has something to do; a link that landed on the open
 * sheet (a notification) has no marker and closes by replacing.
 */
export const BADGE_SHEET_PUSHED_STATE = { isBadgeSheetPushed: true } as const;

/** Whether the page's router state says the sheet's entry was pushed. */
export function wasBadgeSheetPushed(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    "isBadgeSheetPushed" in state &&
    state.isBadgeSheetPushed === true
  );
}

export interface BadgeSheetParams {
  isOpen: boolean;
  tab: BadgeSheetTab;
  focusBadgeId: string | null;
}

/** "open" opens the badge list, "gifts" the shelf; any other value stays shut. */
export function readBadgeSheetParams(
  search: URLSearchParams,
): BadgeSheetParams {
  const value = search.get(BADGES_PARAM);
  const isOpen =
    value === PARAM_VALUE_BY_TAB.badges || value === PARAM_VALUE_BY_TAB.gifts;
  const focusBadgeId = search.get(BADGE_FOCUS_PARAM);
  return {
    isOpen,
    tab: value === PARAM_VALUE_BY_TAB.gifts ? "gifts" : "badges",
    focusBadgeId: isOpen && focusBadgeId ? focusBadgeId : null,
  };
}

/** A copy of `search` with the sheet open on `tab`. */
export function withBadgeSheetOpen(
  search: URLSearchParams,
  tab: BadgeSheetTab = "badges",
): URLSearchParams {
  const next = new URLSearchParams(search);
  next.set(BADGES_PARAM, PARAM_VALUE_BY_TAB[tab]);
  return next;
}

/** A copy of `search` with the sheet and its focus id both gone. */
export function withBadgeSheetClosed(search: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(search);
  next.delete(BADGES_PARAM);
  next.delete(BADGE_FOCUS_PARAM);
  return next;
}

export interface BadgeProgressView {
  isEarned: boolean;
  progressCount: number;
  /** Share of the threshold reached, capped at 1 for the bar. */
  ratio: number;
}

/** The member's progress on one badge; null for a visitor, who has none. */
export function badgeProgressView(
  badge: CommunityBadgeDTO,
): BadgeProgressView | null {
  if (badge.progress === null) return null;
  const ratio =
    badge.threshold > 0 ? Math.min(badge.progress / badge.threshold, 1) : 1;
  return {
    isEarned: badge.earnedAt !== null,
    progressCount: badge.progress,
    ratio: Math.max(ratio, 0),
  };
}

/** Whether the gift still shows beside the recipient's name. */
export function isMarkShowing(
  gift: CommunityShelfGiftDTO,
  now: number,
): boolean {
  return !gift.isHidden && Date.parse(gift.markEndsAt) > now;
}

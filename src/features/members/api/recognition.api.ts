import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";

/** Current level + progress toward the next one. */
export interface LevelDTO {
  level: number;
  name: string;
  xp: number;
  xpMax: number;
  /** 0..100 progress toward the next level. */
  percent: number;
  xpToNext: number;
  /** Next level's name, or null at max level. */
  nextName: string | null;
}

export type LadderState = "done" | "current" | "locked";
export interface LevelLadderRowDTO {
  num: number;
  name: string;
  state: LadderState;
}

export type BadgeRarity = "common" | "rare" | "legendary";
export type BadgeTint = "jade" | "accent" | "plum";
export type BadgeVerificationDTO = "auto" | "host" | "review" | "peer";
export interface BadgeProgressDTO {
  units: number;
  target: number;
}
export interface BadgeDTO {
  /** Stable slug the frontend maps to an icon (see badgeIcons). */
  key: string;
  cat: string;
  name: string;
  /** Free text: when/how it was earned (earned) or how to earn it (locked). */
  context: string;
  rarity: BadgeRarity;
  tint: BadgeTint;
  /** Longer "what it takes" copy for the badge drawer. Falls back to `context`. */
  criteria?: string;
  xpReward?: number;
  /** Omitted when progress tracking isn't wired for this badge yet — the
   *  frontend shows a binary locked state rather than guessing a number. */
  progress?: BadgeProgressDTO;
  verifiedBy?: BadgeVerificationDTO;
  /** Present only for time-limited badges. */
  seasonal?: { when: string };
  /** Own view only, and only when true: the member has hidden this badge from
   *  how other people see them. Another member's read omits the badge itself,
   *  so this field never appears there. */
  hiddenFromProfile?: boolean;
}

/** One dated row in the member's XP history. `[]` until the backend adds
 *  real event logging — the frontend renders its own empty state for that. */
export interface XpLedgerEntryDTO {
  /** ISO timestamp — the UI formats it locally so it respects the member's language. */
  createdAt: string;
  description: string;
  xp: number;
  /** Present only on a correction/adjustment row. */
  reason?: string;
}
export interface BadgesDTO {
  earnedCount: number;
  /** Number still to discover (catalogue minus earned). */
  discoverCount: number;
  earned: BadgeDTO[];
  locked: BadgeDTO[];
  /** Time-limited badges, shown in their own band rather than the main grid. */
  seasonal: BadgeDTO[];
}

export type PerkState = "available" | "locked" | "claimed";
export type PerkFooterDTO =
  | { type: "active-auto"; autoLabel: string }
  | { type: "button"; label: string; toast: string }
  | { type: "link-auto"; label: string; to: string; autoLabel: string }
  | { type: "lock"; label: string }
  | { type: "claimed"; date: string };
export interface PerkDTO {
  /** Stable catalogue key. The path segment the claim endpoint takes. */
  key: string;
  cat: string;
  title: string;
  desc: string;
  state: PerkState;
  footer: PerkFooterDTO;
}
export interface PerkGroupDTO {
  label: string;
  perks: PerkDTO[];
}

export type PerkLadderState = "achieved" | "current" | "locked";
export interface PerkLadderRowDTO {
  num: number;
  name: string;
  state: PerkLadderState;
  /** Short status label, e.g. "Done", "Current", "320 XP away", "Locked". */
  status: string;
  perks: string[];
}
export interface PerksDTO {
  /** Perks currently claimable (drives the profile card chip). */
  availableCount: number;
  groups: PerkGroupDTO[];
  ladder: PerkLadderRowDTO[];
}

/** One "what you did to earn it" row — a signal category (e.g. `"vouches"`)
 *  or the synthetic `"badges"` bonus row. `key` is a stable id the frontend
 *  resolves to a label/icon itself (see `xpBreakdown.data.ts`) — no display
 *  text crosses the wire. Owner-only: `[]` on another member's recognition. */
export interface XpBreakdownItemDTO {
  key: string;
  units: number;
  cap: number;
  perUnit: number;
  xp: number;
}

/** The full Recognition payload: level, badges and perks for one member. */
export interface RecognitionDTO {
  level: LevelDTO;
  levelLadder: LevelLadderRowDTO[];
  badges: BadgesDTO;
  perks: PerksDTO;
  xpBreakdown: XpBreakdownItemDTO[];
  xpLedger: XpLedgerEntryDTO[];
}

/** The answer to a perk claim: the claim itself plus the rebuilt perks block,
 *  so the page can re-bucket the card without waiting on a refetch. */
export interface PerkClaimDTO {
  key: string;
  state: "claimed";
  /** ISO timestamp — the UI formats it locally. */
  claimedAt: string;
  perks: PerksDTO;
}

/** POST /me/recognition/perks/:key/claim. The backend recomputes the caller's
 *  level from stored XP and refuses a claim below the perk's unlock level with
 *  a 403 carrying `code: "PERK_LEVEL_NOT_REACHED"`. Claiming twice returns the
 *  first claim rather than erroring. */
export const claimPerk = (key: string) =>
  apiPost<PerkClaimDTO>(
    `/me/recognition/perks/${encodeURIComponent(key)}/claim`,
  );

/** The answer to a badge-visibility change. */
export interface BadgeVisibilityDTO {
  key: string;
  hiddenFromProfile: boolean;
}

/** PATCH /me/recognition/badges/:key/visibility. Server-side and real: a
 *  hidden badge is dropped from `GET /profiles/:slug/recognition` entirely,
 *  and stays on the owner's own read flagged `hiddenFromProfile`. */
export const setBadgeVisibility = (key: string, hiddenFromProfile: boolean) =>
  apiPatch<BadgeVisibilityDTO>(
    `/me/recognition/badges/${encodeURIComponent(key)}/visibility`,
    { hiddenFromProfile },
  );

/** Own recognition (GET /me/recognition) or another member's public subset
 *  (GET /profiles/:slug/recognition — perks omitted for non-owners). `force`
 *  (own view only) bypasses the backend's recompute throttle. */
export const getRecognition = (slug?: string, force?: boolean) =>
  apiGet<RecognitionDTO>(
    slug
      ? `/profiles/${slug}/recognition`
      : force
        ? "/me/recognition?force=true"
        : "/me/recognition",
  );

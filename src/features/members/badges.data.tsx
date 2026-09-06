import type { ReactNode } from "react";
import { currentUser, fullName } from "./data/members";

export type BadgeRarity = "common" | "rare" | "legendary";
export type BadgeTint = "jade" | "accent" | "plum";

/** How far a locked badge is toward its target — omitted when the backend
 *  hasn't wired real progress tracking for that badge yet (the UI degrades
 *  to a binary locked state rather than guessing a number). */
export interface BadgeProgress {
  units: number;
  target: number;
}

/** How a badge is checked, shown in the drawer's "how it's checked" copy.
 *  Omitted rather than defaulted when the backend hasn't classified it. */
export type BadgeVerification = "auto" | "host" | "review" | "peer";

export interface Badge {
  key: string;
  category: string;
  name: string;
  when: string;
  rarity: BadgeRarity;
  tint: BadgeTint;
  icon: ReactNode;
  /** Longer "what it takes" copy for the drawer. Falls back to `when`. */
  criteria?: string;
  /** XP this badge is worth when earned. */
  xpReward?: number;
  progress?: BadgeProgress;
  verifiedBy?: BadgeVerification;
  /** Present only for time-limited badges; drives the seasonal band. */
  seasonal?: { when: string };
  /** Own view only: the member has hidden this earned badge from how other
   *  people see them. Server-backed since SUS-04 (`recognition_awards`), so
   *  another member's read of this profile omits the badge entirely. */
  hiddenFromProfile?: boolean;
}

/** One dated entry in a member's XP history — see `XpLedgerEntryDTO`. `createdAt`
 *  is a raw ISO timestamp; the UI formats it locally via `useFormat()` so it
 *  renders in the member's language instead of a backend-baked English string. */
export interface XpLedgerEntry {
  createdAt: string;
  description: string;
  xp: number;
  /** Present only on a correction/adjustment row. */
  reason?: string;
}

/** One badge in whichever list opened the drawer (momentum, the case grid,
 *  or the seasonal band) — the drawer's prev/next paging stays scoped to
 *  that list rather than jumping across sections. */
export interface BadgeDrawerEntry {
  badge: Badge;
  earned: boolean;
}

export interface LevelInfo {
  level: number;
  name: string;
  xp: number;
  xpMax: number;
  percent: number;
  xpToNext: number;
  nextName: string;
  member: string;
  since: string;
}

export interface LadderPill {
  number: number;
  name: string;
  state: "done" | "current" | "locked";
}

export type PerkRowState = "achieved" | "current" | "locked";

/** One capability named on a level's ladder row. `id` is a baseline
 *  capability id (`BASE_PERKS_BY_LEVEL`) or a claimable perk's catalogue key;
 *  `label` is the English fallback for an id this build does not know. See
 *  `perkCatalog.data.ts`. */
export interface PerkLadderEntry {
  id: string;
  label: string;
}

/**
 * How a ladder row's status reads. `xp-away` carries the gap in `xpAway`.
 *
 * `locked` is DEMO-ONLY: the live backend always knows how much XP is left,
 * so it only ever sends `done`, `current` or `xp-away`. The prototype's top
 * two rungs say a plain "Locked" instead, and this keeps that reading the way
 * it always has without inventing a number the demo never computed.
 */
export type PerkLadderStatusKind = "done" | "current" | "xp-away" | "locked";

export interface PerkLadderRow {
  number: number;
  name: string;
  state: PerkRowState;
  perks: PerkLadderEntry[];
  statusKind: PerkLadderStatusKind;
  /** XP still to go, set only when `statusKind` is `xp-away`. */
  xpAway?: number;
  /** English fallback for the status label. */
  status: string;
}

/** Total badges still to discover (more exist in the catalogue than are shown). */
export const discoverCount = 28;

export const levelInfo: LevelInfo = {
  level: 4,
  name: "Familiar",
  xp: 680,
  xpMax: 1000,
  percent: 68,
  xpToNext: 320,
  nextName: "Trusted",
  member: fullName(currentUser),
  since: "Jan 2025",
};

export const levelLadder: LadderPill[] = [
  { number: 1, name: "Newcomer", state: "done" },
  { number: 2, name: "Explorer", state: "done" },
  { number: 3, name: "Regular", state: "done" },
  { number: 4, name: "Familiar", state: "current" },
  { number: 5, name: "Trusted", state: "locked" },
  { number: 6, name: "Anchor", state: "locked" },
  { number: 7, name: "Pillar", state: "locked" },
];

export { earnedBadges, lockedBadges, seasonalBadges } from "./badges.icons";

/**
 * DEMO fixture for the "what each level opens" ladder. Mirrors the backend's
 * `BASE_PERKS_BY_LEVEL` + `PERK_CATALOG` after SUS-04 cut both down to what
 * the code really does: everything a member can do is open at Level 1 (nothing
 * in the backend gates messaging, saving, joining or hosting on a level), and
 * the only level-gated grants left are the two invite-quota rungs. Levels with
 * no entry open nothing extra, and say so by staying empty rather than listing
 * a perk that was never built.
 */
export const perksLadder: PerkLadderRow[] = [
  {
    number: 1,
    name: "Newcomer",
    state: "achieved",
    statusKind: "done",
    status: "Done",
    perks: [
      { id: "browse-directory", label: "Browse the member directory" },
      { id: "join-gatherings", label: "Join gatherings & RSVP" },
      { id: "direct-messages", label: "Message other members directly" },
      { id: "save-articles", label: "Save articles & resources" },
      { id: "join-communities", label: "Join communities" },
      { id: "host-gathering", label: "Host a gathering" },
      { id: "vouch-access", label: "Vouch access" },
    ],
  },
  {
    number: 2,
    name: "Explorer",
    state: "achieved",
    statusKind: "done",
    status: "Done",
    perks: [],
  },
  {
    number: 3,
    name: "Regular",
    state: "achieved",
    statusKind: "done",
    status: "Done",
    perks: [],
  },
  {
    number: 4,
    name: "Familiar",
    state: "current",
    statusKind: "current",
    status: "Current",
    perks: [{ id: "invite-quota-level-4", label: "More invites each month" }],
  },
  {
    number: 5,
    name: "Trusted",
    state: "locked",
    statusKind: "xp-away",
    xpAway: 320,
    status: "320 XP away",
    perks: [
      { id: "invite-quota-level-5", label: "The highest invite allowance" },
    ],
  },
  {
    number: 6,
    name: "Anchor",
    state: "locked",
    statusKind: "locked",
    status: "Locked",
    perks: [],
  },
  {
    number: 7,
    name: "Pillar",
    state: "locked",
    statusKind: "locked",
    status: "Locked",
    perks: [],
  },
];

import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
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

export interface PerkLadderRow {
  number: number;
  name: string;
  state: PerkRowState;
  perks: string[];
  status: ReactNode;
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

export const perksLadder: PerkLadderRow[] = [
  {
    number: 1,
    name: "Newcomer",
    state: "achieved",
    status: (
      <>
        <FiCheck /> Done
      </>
    ),
    perks: [
      "Browse the member directory",
      "Join gatherings & RSVP",
      "Access the resource library",
    ],
  },
  {
    number: 2,
    name: "Explorer",
    state: "achieved",
    status: (
      <>
        <FiCheck /> Done
      </>
    ),
    perks: [
      "Message other members directly",
      "Save articles & resources",
      "Join communities",
    ],
  },
  {
    number: 3,
    name: "Regular",
    state: "achieved",
    status: (
      <>
        <FiCheck /> Done
      </>
    ),
    perks: [
      "Vouch for new members on the waitlist",
      "Apply to host a gathering",
    ],
  },
  {
    number: 4,
    name: "Familiar",
    state: "current",
    status: "Current",
    perks: [
      "48-hour early RSVP access to new gatherings",
      "Access to the Trusted Lounge community",
    ],
  },
  {
    number: 5,
    name: "Trusted",
    state: "locked",
    status: "320 XP away",
    perks: [
      "Host gatherings without approval review",
      "Monthly invite quota increases to 3",
    ],
  },
  {
    number: 6,
    name: "Anchor",
    state: "locked",
    status: "Locked",
    perks: [
      "Permanent founding discount on future paid features",
      '"Anchor" legendary badge unlocked',
    ],
  },
  {
    number: 7,
    name: "Pillar",
    state: "locked",
    status: "Locked",
    perks: [
      "Advisory board eligibility",
      'Lifetime "Pillar" status, permanent badge',
    ],
  },
];

import type { Recognition, XpBreakdownItem } from "./api/recognition.adapters";
import type { XpLedgerEntry } from "./badges.data";
import {
  discoverCount,
  earnedBadges,
  levelInfo,
  levelLadder,
  lockedBadges,
  perksLadder,
  seasonalBadges,
} from "./badges.data";
import { availableCount, perkGroups } from "./perks.data";

// Illustrative only — a fresh, independently-computed breakdown, so it
// doesn't need to sum exactly to `levelInfo.xp` (the live backend has the
// same property: XP is a stored, no-regression total, while the breakdown
// is derived from current signals; see `recognition.scoring.ts`).
const demoXpBreakdown: XpBreakdownItem[] = [
  { key: "profile", units: 1, cap: 1, perUnit: 50, xp: 50 },
  { key: "communities", units: 2, cap: 3, perUnit: 40, xp: 80 },
  { key: "personas", units: 1, cap: 3, perUnit: 40, xp: 40 },
  { key: "vouches", units: 2, cap: 10, perUnit: 60, xp: 120 },
  { key: "connections", units: 3, cap: 20, perUnit: 25, xp: 75 },
  { key: "events", units: 1, cap: 12, perUnit: 50, xp: 50 },
  { key: "posts", units: 4, cap: 20, perUnit: 15, xp: 60 },
  { key: "endorsements", units: 1, cap: 10, perUnit: 20, xp: 20 },
  { key: "tenure", units: 60, cap: 365, perUnit: 1, xp: 60 },
  { key: "verified", units: 1, cap: 1, perUnit: 50, xp: 50 },
  { key: "gettingStarted", units: 6, cap: 6, perUnit: 25, xp: 150 },
  {
    key: "badges",
    units: earnedBadges.length,
    cap: earnedBadges.length + lockedBadges.length,
    perUnit: 0,
    xp: 75,
  },
];

// Illustrative only, same as demoXpBreakdown above — a running receipt list
// that doesn't need to sum exactly to levelInfo.xp. Newest first; the ledger
// component computes each row's running total itself.
const demoXpLedger: XpLedgerEntry[] = [
  {
    createdAt: "2026-08-12T00:00:00.000Z",
    description: "Badge earned: Rooted",
    xp: 130,
  },
  {
    createdAt: "2026-07-28T00:00:00.000Z",
    description: "Attended Queer Cinema Club",
    xp: 25,
  },
  {
    createdAt: "2026-07-14T00:00:00.000Z",
    description: "Badge earned: Vouch",
    xp: 100,
  },
  {
    createdAt: "2026-07-02T00:00:00.000Z",
    description: "Answered 3 board posts",
    xp: 45,
  },
  {
    createdAt: "2026-06-19T00:00:00.000Z",
    description: "Adjustment after a listing correction",
    xp: -20,
    reason: "A duplicate connection entry was removed.",
  },
  {
    createdAt: "2026-05-30T00:00:00.000Z",
    description: "Badge earned: Connector",
    xp: 50,
  },
  {
    createdAt: "2026-04-18T00:00:00.000Z",
    description: "Badge earned: Regular",
    xp: 110,
  },
  {
    createdAt: "2026-03-21T00:00:00.000Z",
    description: "Badge earned: Three's Company",
    xp: 70,
  },
  {
    createdAt: "2026-02-09T00:00:00.000Z",
    description: "Attended Newcomers Mixer",
    xp: 25,
  },
  {
    createdAt: "2025-01-18T00:00:00.000Z",
    description: "Badge earned: First Gathering",
    xp: 60,
  },
];

/**
 * The mock Recognition model, assembled from the static badges/perks data. Used
 * as the demo-mode source and as a placeholder while live data loads (see
 * useRecognition). Mirrors `currentUser` standing in for the profile in demo.
 */
export const demoRecognition: Recognition = {
  level: {
    level: levelInfo.level,
    name: levelInfo.name,
    xp: levelInfo.xp,
    xpMax: levelInfo.xpMax,
    percent: levelInfo.percent,
    xpToNext: levelInfo.xpToNext,
    nextName: levelInfo.nextName,
  },
  levelLadder,
  badges: {
    earned: earnedBadges,
    locked: lockedBadges,
    seasonal: seasonalBadges,
    earnedCount: earnedBadges.length,
    discoverCount,
  },
  perks: {
    groups: perkGroups,
    ladder: perksLadder,
    availableCount,
  },
  xpBreakdown: demoXpBreakdown,
  xpLedger: demoXpLedger,
};

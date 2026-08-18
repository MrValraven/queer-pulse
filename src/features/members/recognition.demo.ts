import type { Recognition, XpBreakdownItem } from "./api/recognition.adapters";
import {
  discoverCount,
  earnedBadges,
  levelInfo,
  levelLadder,
  lockedBadges,
  perksLadder,
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
  { key: "workshops", units: 0, cap: 5, perUnit: 80, xp: 0 },
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
    earnedCount: earnedBadges.length,
    discoverCount,
  },
  perks: {
    groups: perkGroups,
    ladder: perksLadder,
    availableCount,
  },
  xpBreakdown: demoXpBreakdown,
};

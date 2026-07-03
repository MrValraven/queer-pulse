import type { Recognition } from "./api/recognition.adapters";
import {
  discoverCount,
  earnedBadges,
  levelInfo,
  levelLadder,
  lockedBadges,
  perksLadder,
} from "./badges.data";
import { availableCount, perkGroups } from "./perks.data";

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
};

import type { DemoFeatureUsageProfile } from "./adminFeatureUsage.data";
import { utcDayNumber } from "./featureUsageRange";

/**
 * Per-day value generators behind `adminFeatureUsageDemo.ts`. Every value is
 * a pure function of (feature, absolute UTC day, today): a mulberry32 PRNG
 * seeded from a hash of the feature key XOR the day number, with a weekday
 * shape (weekends at about 0.7) and a level that blends from the profile's
 * previous level to its recent one. Every draw comes from that seed.
 */

const WEEKEND_FACTOR = 0.7;
const WEEKDAY_FACTOR = (7 - 2 * WEEKEND_FACTOR) / 5;
const RECENT_LEVEL_DAYS = 30;
const PREVIOUS_LEVEL_DAYS = 60;

/** FNV-1a, 32-bit. */
function hashText(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: a small, fast, seedable PRNG returning values in [0, 1). */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function weekdayFactor(dayNumber: number): number {
  // 1970-01-01 (day 0) was a Thursday; 0 is Sunday and 6 is Saturday.
  const weekday = (((dayNumber + 4) % 7) + 7) % 7;
  return weekday === 0 || weekday === 6 ? WEEKEND_FACTOR : WEEKDAY_FACTOR;
}

function levelFor(profile: DemoFeatureUsageProfile, daysAgo: number): number {
  if (daysAgo <= RECENT_LEVEL_DAYS) return profile.reachPerDay;
  if (daysAgo >= PREVIOUS_LEVEL_DAYS) return profile.previousReachPerDay;
  const blend =
    (daysAgo - RECENT_LEVEL_DAYS) / (PREVIOUS_LEVEL_DAYS - RECENT_LEVEL_DAYS);
  return (
    profile.reachPerDay +
    (profile.previousReachPerDay - profile.reachPerDay) * blend
  );
}

/** Rounds up with a probability equal to the fraction, so a level of 0.1
 *  per day still yields about one row every ten days. */
function roundByChance(value: number, draw: number): number {
  const whole = Math.floor(value);
  return whole + (draw < value - whole ? 1 : 0);
}

export interface DayContext {
  todayNumber: number;
  retentionStartNumber: number;
}

export function reachOn(
  profile: DemoFeatureUsageProfile,
  dayNumber: number,
  context: DayContext,
): number {
  if (!profile.isLaunched || profile.reachPerDay <= 0) return 0;
  if (dayNumber < context.retentionStartNumber) return 0;
  if (dayNumber >= context.todayNumber) return 0;
  const random = seededRandom(hashText(profile.featureKey) ^ dayNumber);
  if (random() < profile.zeroDayChance) return 0;
  const level =
    levelFor(profile, context.todayNumber - dayNumber) /
    (1 - profile.zeroDayChance);
  const noisy = level * weekdayFactor(dayNumber) * (0.8 + 0.4 * random());
  return roundByChance(noisy, random());
}

export function createdOn(
  profile: DemoFeatureUsageProfile,
  dayNumber: number,
  context: DayContext,
): number {
  const createdPerDay = profile.createdPerDay ?? 0;
  if (!profile.isLaunched || createdPerDay <= 0) return 0;
  if (dayNumber >= context.todayNumber) return 0;
  // A day with no requests at all has no creations either.
  const reachRandom = seededRandom(hashText(profile.featureKey) ^ dayNumber);
  if (reachRandom() < profile.zeroDayChance) return 0;
  const random = seededRandom(
    hashText(`${profile.featureKey}:created`) ^ dayNumber,
  );
  const level = createdPerDay / (1 - profile.zeroDayChance);
  const noisy = level * weekdayFactor(dayNumber) * (0.6 + 0.8 * random());
  return roundByChance(noisy, random());
}

export function seriesFrom(
  startDay: string,
  count: number,
  valueOn: (dayNumber: number) => number,
): number[] {
  const startNumber = utcDayNumber(startDay);
  return Array.from({ length: Math.max(0, count) }, (_unused, index) =>
    valueOn(startNumber + index),
  );
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : (sorted[middle] ?? 0);
}

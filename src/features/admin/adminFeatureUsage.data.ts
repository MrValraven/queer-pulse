import type { FeatureUsageState } from "./api/adminFeatureUsage.api";

/**
 * Static per-feature profiles behind the feature usage demo. The series
 * themselves are built by `adminFeatureUsageDemo.ts`, day by day, from these
 * levels; the order below is the order the backend returns (states that need
 * a decision first: `browsed-but-empty`, then `quiet`, then `busy`, then
 * `not-launched`).
 *
 * Covers all four `FeatureUsageState` values so the demo surface exercises
 * every branch a moderator can land on:
 *  - `browsed-but-empty`: `housingListings` with healthy reach, almost nothing
 *    created.
 *  - `quiet`: `events`, `landlords`, `magazine`, `content` with reach at or
 *    below the launched median.
 *  - `busy`: `feed`, `communities`, `forum` with healthy reach and
 *    (where depth applies) healthy depth.
 *  - `not-launched`: `cinema`, `companies`, `jobs`, `barter` flagged off, no
 *    traffic by construction.
 *
 * `feed`, `cinema`, and `content` are the three reach-only features and carry
 * `createdPerDay: null` plus a `reason`; the builder turns that into
 * `depth: null`. A zero there would misread "there is nothing here to
 * create" as "reached, and nothing was created".
 *
 * `reachPerDay` is the level over the last 30 days, `previousReachPerDay` the
 * level 60 or more days back, blended linearly in between. `zeroDayChance` is
 * the share of days with no requests at all (`landlords` and `magazine` have
 * real gaps). `depthTotalAtYesterday` is the row count as of yesterday; the
 * builder subtracts what was created after a range's end.
 */
export interface DemoFeatureUsageProfile {
  featureKey: string;
  isLaunched: boolean;
  state: FeatureUsageState;
  reason: string | null;
  reachPerDay: number;
  previousReachPerDay: number;
  createdPerDay: number | null;
  depthTotalAtYesterday: number | null;
  zeroDayChance: number;
}

/** Communities active in the last 7 days. A rolling count, the same for
 *  every range, as the live drill-down is. */
export const DEMO_COMMUNITIES_STILL_POSTING_THIS_WEEK = 58;

export const DEMO_FEATURE_USAGE_PROFILES: DemoFeatureUsageProfile[] = [
  {
    featureKey: "housingListings",
    isLaunched: true,
    state: "browsed-but-empty",
    reason: null,
    reachPerDay: 30,
    previousReachPerDay: 29,
    createdPerDay: 0.1,
    depthTotalAtYesterday: 391,
    zeroDayChance: 0,
  },
  {
    featureKey: "events",
    isLaunched: true,
    state: "quiet",
    reason: null,
    reachPerDay: 29,
    previousReachPerDay: 26,
    createdPerDay: 1.7,
    depthTotalAtYesterday: 1480,
    zeroDayChance: 0,
  },
  {
    featureKey: "landlords",
    isLaunched: true,
    state: "quiet",
    reason: null,
    reachPerDay: 11,
    previousReachPerDay: 12,
    createdPerDay: 0.07,
    depthTotalAtYesterday: 64,
    zeroDayChance: 0.12,
  },
  {
    featureKey: "magazine",
    isLaunched: true,
    state: "quiet",
    reason: null,
    reachPerDay: 7,
    previousReachPerDay: 8,
    createdPerDay: 0.13,
    depthTotalAtYesterday: 158,
    zeroDayChance: 0.2,
  },
  {
    featureKey: "content",
    isLaunched: true,
    state: "quiet",
    reason:
      "Topics are a curated taxonomy with no member create route, and topic posts are derived from forum threads that are already counted as forum depth.",
    reachPerDay: 5,
    previousReachPerDay: 6,
    createdPerDay: null,
    depthTotalAtYesterday: null,
    zeroDayChance: 0,
  },
  {
    featureKey: "feed",
    isLaunched: true,
    state: "busy",
    reason: "The feed is a read surface and creates nothing.",
    reachPerDay: 73,
    previousReachPerDay: 70,
    createdPerDay: null,
    depthTotalAtYesterday: null,
    zeroDayChance: 0,
  },
  {
    featureKey: "communities",
    isLaunched: true,
    state: "busy",
    reason: null,
    reachPerDay: 41,
    previousReachPerDay: 35,
    createdPerDay: 2.9,
    depthTotalAtYesterday: 2512,
    zeroDayChance: 0,
  },
  {
    featureKey: "forum",
    isLaunched: true,
    state: "busy",
    reason: null,
    reachPerDay: 33,
    previousReachPerDay: 30,
    createdPerDay: 2.1,
    depthTotalAtYesterday: 2360,
    zeroDayChance: 0,
  },
  {
    featureKey: "cinema",
    isLaunched: false,
    state: "not-launched",
    reason:
      "Titles are published by editorial staff only; no member route creates a CinemaTitle, and WatchProgress is excluded on the same privacy grounds as messaging.",
    reachPerDay: 0,
    previousReachPerDay: 0,
    createdPerDay: null,
    depthTotalAtYesterday: null,
    zeroDayChance: 0,
  },
  ...["companies", "jobs", "barter"].map(
    (featureKey): DemoFeatureUsageProfile => ({
      featureKey,
      isLaunched: false,
      state: "not-launched",
      reason: null,
      reachPerDay: 0,
      previousReachPerDay: 0,
      createdPerDay: 0,
      depthTotalAtYesterday: 0,
      zeroDayChance: 0,
    }),
  ),
];

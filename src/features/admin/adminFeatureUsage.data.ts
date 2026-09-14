import type { AdminFeatureUsageDTO } from "./api/adminFeatureUsage.api";

/**
 * Demo fixture for `useAdminFeatureUsage`, assembled to the exact
 * `AdminFeatureUsageDTO` shape the live endpoint returns, ordered the same
 * way the backend orders it (states that need a decision first: a
 * `browsed-but-empty` row, then `quiet`, then `busy`, then `not-launched`)
 * and internally consistent with the drill-down counts below wherever the
 * two describe the same underlying rows (`housingListings`'s depth matches
 * `drillDowns.housingListings.listings`, `forum`'s depth matches
 * `drillDowns.forum.threads + drillDowns.forum.replies`, and `communities`'s
 * depth matches `drillDowns.communities.created`).
 *
 * Covers all four `FeatureUsageState` values so the demo surface exercises
 * every branch a moderator can land on:
 *  - `browsed-but-empty`: `housingListings` with healthy reach, almost nothing
 *    created.
 *  - `quiet`: `events`, `landlords`, `magazine`, `content` with reach at or
 *    below the launched median (`events`'s 860 sits just under it).
 *  - `busy`: `feed`, `communities`, `forum` with healthy reach and
 *    (where depth applies) healthy depth.
 *  - `not-launched`: `cinema`, `companies`, `jobs`, `barter` flagged off, no
 *    traffic by construction.
 *
 * `feed`, `cinema`, and `content` are the three reach-only features and carry
 * `depth: null` / `depthTotal: null` plus a `reason`; these never get coerced
 * to `0` because that would misread "there is nothing here to create" as
 * "reached, and nothing was created".
 */
export const DEMO_FEATURE_USAGE: AdminFeatureUsageDTO = {
  rangeDays: 30,
  // The demo range always has a usable reach signal, so the fixture keeps
  // exercising the normal four-state classification rather than the
  // no-reach-signal notice.
  hasReachSignal: true,
  features: [
    {
      featureKey: "housingListings",
      isLaunched: true,
      reach: 910,
      depth: 3,
      depthTotal: 391,
      reachPrevious: 870,
      reason: null,
      state: "browsed-but-empty",
    },
    {
      featureKey: "events",
      isLaunched: true,
      reach: 860,
      depth: 51,
      depthTotal: 298,
      reachPrevious: 790,
      reason: null,
      state: "quiet",
    },
    {
      featureKey: "landlords",
      isLaunched: true,
      reach: 340,
      depth: 2,
      depthTotal: 19,
      reachPrevious: 360,
      reason: null,
      state: "quiet",
    },
    {
      featureKey: "magazine",
      isLaunched: true,
      reach: 210,
      depth: 4,
      depthTotal: 58,
      reachPrevious: 240,
      reason: null,
      state: "quiet",
    },
    {
      featureKey: "content",
      isLaunched: true,
      reach: 150,
      depth: null,
      depthTotal: null,
      reachPrevious: 180,
      reason:
        "Topics are a curated taxonomy with no member create route, and topic posts are derived from forum threads that are already counted as forum depth.",
      state: "quiet",
    },
    {
      featureKey: "feed",
      isLaunched: true,
      reach: 2200,
      depth: null,
      depthTotal: null,
      reachPrevious: 2100,
      reason: "The feed is a read surface and creates nothing.",
      state: "busy",
    },
    {
      featureKey: "communities",
      isLaunched: true,
      reach: 1240,
      depth: 86,
      depthTotal: 512,
      reachPrevious: 1050,
      reason: null,
      state: "busy",
    },
    {
      featureKey: "forum",
      isLaunched: true,
      reach: 980,
      depth: 64,
      depthTotal: 1360,
      reachPrevious: 890,
      reason: null,
      state: "busy",
    },
    {
      featureKey: "cinema",
      isLaunched: false,
      reach: 0,
      depth: null,
      depthTotal: null,
      reachPrevious: 0,
      reason:
        "Titles are published by editorial staff only; no member route creates a CinemaTitle, and WatchProgress is excluded on the same privacy grounds as messaging.",
      state: "not-launched",
    },
    {
      featureKey: "companies",
      isLaunched: false,
      reach: 0,
      depth: 0,
      depthTotal: 0,
      reachPrevious: 0,
      reason: null,
      state: "not-launched",
    },
    {
      featureKey: "jobs",
      isLaunched: false,
      reach: 0,
      depth: 0,
      depthTotal: 0,
      reachPrevious: 0,
      reason: null,
      state: "not-launched",
    },
    {
      featureKey: "barter",
      isLaunched: false,
      reach: 0,
      depth: 0,
      depthTotal: 0,
      reachPrevious: 0,
      reason: null,
      state: "not-launched",
    },
  ],
  drillDowns: {
    housingListings: { listings: 3, savedSearches: 18, viewings: 64 },
    forum: { threads: 22, replies: 42 },
    communities: { created: 86, stillPostingThisWeek: 58 },
  },
};

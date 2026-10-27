import type {
  AdminFeatureUsageDetailDTO,
  AdminFeatureUsageDTO,
  ClassifiedFeature,
} from "./api/adminFeatureUsage.api";
import {
  DEMO_COMMUNITIES_STILL_POSTING_THIS_WEEK,
  DEMO_FEATURE_USAGE_PROFILES,
  type DemoFeatureUsageProfile,
} from "./adminFeatureUsage.data";
import {
  createdOn,
  median,
  reachOn,
  seriesFrom,
  sum,
  type DayContext,
} from "./adminFeatureUsageDemoSeries";
import {
  FEATURE_USAGE_RETENTION_DAYS,
  addUtcDays,
  countDaysInclusive,
  todayUtcDay,
  utcDayNumber,
  type FeatureUsageRangeSelection,
  type FeatureUsageWindow,
} from "./featureUsageRange";

/**
 * Deterministic demo series for the feature usage panel. Every value is a
 * pure function of (feature, absolute UTC day, today): a seeded PRNG keyed
 * to the feature and the day, so two overlapping ranges agree on every
 * shared day and the same `now` always builds the same DTO. Days before the
 * retention start read zero, the way the live table has deleted them.
 */

/** The window the backend would resolve for `selection` on `now`'s day. */
function resolveDemoWindow(
  selection: FeatureUsageRangeSelection,
  now: Date,
): FeatureUsageWindow {
  const today = todayUtcDay(now);
  const isPreset = selection.kind === "preset";
  const rangeStart = isPreset
    ? addUtcDays(today, -selection.rangeDays)
    : selection.from;
  const rangeEnd = isPreset ? addUtcDays(today, -1) : selection.to;
  const rangeDays = countDaysInclusive(rangeStart, rangeEnd);
  const previousRangeStart = addUtcDays(rangeStart, -rangeDays);
  const retentionStart = addUtcDays(today, -FEATURE_USAGE_RETENTION_DAYS);
  return {
    rangeDays,
    rangeStart,
    rangeEnd,
    previousRangeStart,
    previousRangeEnd: addUtcDays(rangeStart, -1),
    retentionStart,
    isPreviousRangePartial: previousRangeStart < retentionStart,
  };
}

function dayContextFor(window: FeatureUsageWindow, now: Date): DayContext {
  return {
    todayNumber: utcDayNumber(todayUtcDay(now)),
    retentionStartNumber: utcDayNumber(window.retentionStart),
  };
}

function createdSeries(
  profile: DemoFeatureUsageProfile,
  window: FeatureUsageWindow,
  context: DayContext,
): number[] | null {
  if (profile.createdPerDay === null) return null;
  return seriesFrom(window.rangeStart, window.rangeDays, (dayNumber) =>
    createdOn(profile, dayNumber, context),
  );
}

function buildFeature(
  profile: DemoFeatureUsageProfile,
  window: FeatureUsageWindow,
  context: DayContext,
): ClassifiedFeature {
  const reachDaily = seriesFrom(window.rangeStart, window.rangeDays, (day) =>
    reachOn(profile, day, context),
  );
  const reachPreviousDaily = seriesFrom(
    window.previousRangeStart,
    window.rangeDays,
    (day) => reachOn(profile, day, context),
  );
  const createdDaily = createdSeries(profile, window, context);
  const depth = createdDaily === null ? null : sum(createdDaily);
  let depthTotal: number | null = null;
  if (depth !== null && profile.depthTotalAtYesterday !== null) {
    const daysAfterRange =
      context.todayNumber - utcDayNumber(window.rangeEnd) - 1;
    const createdAfterRange = sum(
      seriesFrom(addUtcDays(window.rangeEnd, 1), daysAfterRange, (day) =>
        createdOn(profile, day, context),
      ),
    );
    depthTotal = Math.max(
      depth,
      profile.depthTotalAtYesterday - createdAfterRange,
    );
  }
  return {
    featureKey: profile.featureKey,
    isLaunched: profile.isLaunched,
    reach: sum(reachDaily),
    depth,
    depthTotal,
    reachPrevious: sum(reachPreviousDaily),
    reason: profile.reason,
    reachDaily,
    reachPreviousDaily,
    state: profile.state,
  };
}

/** The demo `AdminFeatureUsageDTO` for `selection`, as of `now`. */
export function buildDemoFeatureUsage(
  selection: FeatureUsageRangeSelection,
  now: Date = new Date(),
): AdminFeatureUsageDTO {
  const window = resolveDemoWindow(selection, now);
  const context = dayContextFor(window, now);
  const features = DEMO_FEATURE_USAGE_PROFILES.map((profile) =>
    buildFeature(profile, window, context),
  );
  const reachMedian = median(
    features
      .filter((feature) => feature.isLaunched)
      .map((feature) => feature.reach),
  );
  const featureByKey = new Map(
    features.map((feature) => [feature.featureKey, feature]),
  );
  const housingReach = featureByKey.get("housingListings")?.reach ?? 0;
  const forumDepth = featureByKey.get("forum")?.depth ?? 0;
  const forumThreads = Math.round(forumDepth * 0.35);
  return {
    ...window,
    reachMedian,
    hasReachSignal: reachMedian > 0,
    features,
    drillDowns: {
      housingListings: {
        listings: featureByKey.get("housingListings")?.depth ?? 0,
        savedSearches: Math.round(housingReach * 0.02),
        viewings: Math.round(housingReach * 0.07),
      },
      forum: { threads: forumThreads, replies: forumDepth - forumThreads },
      communities: {
        created: featureByKey.get("communities")?.depth ?? 0,
        stillPostingThisWeek: DEMO_COMMUNITIES_STILL_POSTING_THIS_WEEK,
      },
    },
  };
}

/** The demo detail for one feature. Its `createdDaily` sums to the same
 *  `depth` `buildDemoFeatureUsage` reports for that selection. A reach-only
 *  or unlisted key carries `createdDaily: null`. */
export function buildDemoFeatureUsageDetail(
  featureKey: string,
  selection: FeatureUsageRangeSelection,
  now: Date = new Date(),
): AdminFeatureUsageDetailDTO {
  const window = resolveDemoWindow(selection, now);
  const profile = DEMO_FEATURE_USAGE_PROFILES.find(
    (candidate) => candidate.featureKey === featureKey,
  );
  return {
    featureKey,
    rangeDays: window.rangeDays,
    rangeStart: window.rangeStart,
    rangeEnd: window.rangeEnd,
    createdDaily: profile
      ? createdSeries(profile, window, dayContextFor(window, now))
      : null,
  };
}

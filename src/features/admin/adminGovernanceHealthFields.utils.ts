export const HEALTH_TREND_KEYS = [
  "upThisQuarter",
  "steady",
  "allResolved",
  "cocViolations",
  "upVsQ1",
  "ofFiled",
] as const;

export type HealthTrendKey = (typeof HEALTH_TREND_KEYS)[number];

/**
 * The trend lines whose public wording interpolates `{count}`
 * (`governance:health.trend.*`). Only these rows get a live "Trend number"
 * input; the other three lines are fixed phrases, so a number typed against
 * them would never appear anywhere.
 */
const HEALTH_TREND_KEYS_WITH_COUNT: ReadonlySet<string> = new Set([
  "upThisQuarter",
  "upVsQ1",
  "ofFiled",
]);

export function trendTakesCount(trendKey: string): boolean {
  return HEALTH_TREND_KEYS_WITH_COUNT.has(trendKey);
}

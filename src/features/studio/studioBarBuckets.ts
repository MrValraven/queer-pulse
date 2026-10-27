import { DAILY_ACTIVITY, DASHBOARD_TODAY_ISO } from "./studioDashboard.data";
import { fixtureDate } from "./studioFixtureDate";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const AXIS_STEP = 10;

/** One column of a Studio bar chart: a day of demo activity or a week of
 *  follower growth, oldest first in a series. */
export interface StudioBarBucket {
  key: string;
  date: Date;
  count: number;
  /** Today, or the current week: drawn in jade. */
  isCurrent: boolean;
  /** The server withheld this count (1 to 4): reads "Fewer than 5", draws the empty bar. */
  isWithheld?: boolean;
}

/** The next multiple of 10 above the largest count, at least the floor (10 with no floor). */
export function barAxisMaximumOf(
  buckets: StudioBarBucket[],
  floor: number | null,
): number {
  const largest = Math.max(
    ...buckets.map((bucket) => bucket.count),
    floor ?? 0,
  );
  return Math.max(AXIS_STEP, Math.ceil(largest / AXIS_STEP) * AXIS_STEP);
}

/** The demo's rule kept exactly: any count under the floor is withheld, 0 included. */
export function isBelowBarFloor(count: number, floor: number | null): boolean {
  return floor !== null && count < floor;
}

/** True when the server flagged the bucket as withheld, or its count falls under the floor. */
export function isBucketWithheld(
  bucket: StudioBarBucket,
  floor: number | null,
): boolean {
  return bucket.isWithheld === true || isBelowBarFloor(bucket.count, floor);
}

/** The demo activity series for one range, oldest first, ending on the
 *  fixture's today. */
export function activityBucketsOf(dayCount: number): StudioBarBucket[] {
  const todayTime = fixtureDate(DASHBOARD_TODAY_ISO).getTime();
  const counts = DAILY_ACTIVITY.slice(-dayCount);
  return counts.map((count, index) => {
    const date = new Date(
      todayTime - (counts.length - 1 - index) * MILLISECONDS_PER_DAY,
    );
    return {
      key: date.toISOString().slice(0, 10),
      date,
      count,
      isCurrent: index === counts.length - 1,
    };
  });
}

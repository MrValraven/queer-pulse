import { describe, expect, it } from "vitest";
import {
  activityBucketsOf,
  barAxisMaximumOf,
  isBelowBarFloor,
  isBucketWithheld,
  type StudioBarBucket,
} from "./studioBarBuckets";
import { DAILY_ACTIVITY } from "./studioDashboard.data";

function buckets(counts: number[]): StudioBarBucket[] {
  return counts.map((count, index) => ({
    key: `bucket-${index}`,
    date: new Date(Date.UTC(2026, 9, 1 + index)),
    count,
    isCurrent: index === counts.length - 1,
  }));
}

describe("studioBarBuckets", () => {
  it("keeps the demo's axis: the next ten above the largest day, at least the floor", () => {
    expect(barAxisMaximumOf(buckets([3, 41]), 5)).toBe(50);
    expect(barAxisMaximumOf(buckets([0, 2]), 5)).toBe(10);
  });

  it("gives an all-zero series without a floor an axis of 10", () => {
    expect(barAxisMaximumOf(buckets([0, 0]), null)).toBe(10);
  });

  it("withholds counts under the floor and draws every count without one", () => {
    expect(isBelowBarFloor(3, 5)).toBe(true);
    expect(isBelowBarFloor(0, 5)).toBe(true);
    expect(isBelowBarFloor(5, 5)).toBe(false);
    expect(isBelowBarFloor(3, null)).toBe(false);
    expect(isBelowBarFloor(0, null)).toBe(false);
  });

  it("ends the activity series on the fixture's today", () => {
    const days = activityBucketsOf(7);
    expect(days).toHaveLength(7);
    expect(days.at(-1)?.isCurrent).toBe(true);
    expect(days.at(-1)?.count).toBe(DAILY_ACTIVITY.at(-1));
    expect(days.filter((day) => day.isCurrent)).toHaveLength(1);
    expect(new Set(days.map((day) => day.key)).size).toBe(7);
  });
});

it("withholds a flagged bucket whatever the floor, and a count under the floor", () => {
  const base = { key: "d", date: new Date(0), isCurrent: false };
  expect(isBucketWithheld({ ...base, count: 0, isWithheld: true }, null)).toBe(
    true,
  );
  expect(isBucketWithheld({ ...base, count: 0 }, null)).toBe(false);
  expect(isBucketWithheld({ ...base, count: 3 }, 5)).toBe(true);
  expect(isBucketWithheld({ ...base, count: 9 }, 5)).toBe(false);
});

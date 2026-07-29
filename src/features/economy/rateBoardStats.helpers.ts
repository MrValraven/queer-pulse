/* Pure numeric helpers for the rate board stats. Split out of RateBoardStats.tsx
 * so that file only exports its component (react-refresh/only-export-components). */

/** Median of a numeric list (0 for empty). */
export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export function min(nums: number[]): number {
  return nums.length ? Math.min(...nums) : 0;
}

export function max(nums: number[]): number {
  return nums.length ? Math.max(...nums) : 0;
}

/** Percentile rank (0–100) of `value` within `nums` — share at or below it. */
export function percentile(nums: number[], value: number): number {
  if (nums.length === 0) return 0;
  const atOrBelow = nums.filter((n) => n <= value).length;
  return Math.round((atOrBelow / nums.length) * 100);
}

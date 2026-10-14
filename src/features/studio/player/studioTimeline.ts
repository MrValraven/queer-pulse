/** The last index whose start is at or before `timeSeconds`, or null before
 *  the first start (and for an empty list). Starts are ascending; equal
 *  starts resolve to the last of them. */
export function activeIndexAt(
  startTimesSeconds: readonly number[],
  timeSeconds: number,
): number | null {
  let low = 0;
  let high = startTimesSeconds.length - 1;
  let found: number | null = null;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const start = startTimesSeconds[middle] ?? Number.POSITIVE_INFINITY;
    if (start <= timeSeconds) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
}

/** The first start strictly after `timeSeconds`, or null when none follows. */
export function nextStartAfter(
  startTimesSeconds: readonly number[],
  timeSeconds: number,
): number | null {
  const index = activeIndexAt(startTimesSeconds, timeSeconds);
  return startTimesSeconds[index === null ? 0 : index + 1] ?? null;
}

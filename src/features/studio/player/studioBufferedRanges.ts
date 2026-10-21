import type { StudioBufferedRange } from "./studioPlayerContext";

/** Ranges closer than this to the last report count as unchanged, so the
 *  steady growth of a download does not flood the clock. */
const BUFFERED_TOLERANCE_SECONDS = 1;

/** The loaded spans of a media element, ascending; empty when the element
 *  exposes none or the browser refuses to read them. */
export function readBufferedRanges(element: {
  buffered?: TimeRanges | null;
}): StudioBufferedRange[] {
  const buffered = element.buffered;
  if (!buffered) return [];
  const ranges: StudioBufferedRange[] = [];
  try {
    for (let index = 0; index < buffered.length; index += 1) {
      const startSeconds = buffered.start(index);
      const endSeconds = buffered.end(index);
      if (Number.isFinite(startSeconds) && Number.isFinite(endSeconds))
        ranges.push({ startSeconds, endSeconds });
    }
  } catch {
    return [];
  }
  return ranges;
}

/** True when both lists have the same spans within the tolerance. */
export function areBufferedRangesEqual(
  first: readonly StudioBufferedRange[],
  second: readonly StudioBufferedRange[],
  toleranceSeconds = BUFFERED_TOLERANCE_SECONDS,
): boolean {
  if (first.length !== second.length) return false;
  return first.every((range, index) => {
    const other = second[index];
    if (!other) return false;
    return (
      Math.abs(range.startSeconds - other.startSeconds) <= toleranceSeconds &&
      Math.abs(range.endSeconds - other.endSeconds) <= toleranceSeconds
    );
  });
}

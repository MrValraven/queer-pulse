/**
 * Frame statistics for the screen health report (contract 3.8): frames per
 * second over the last 5 s, frames dropped over the same window and the
 * display's refresh interval.
 *
 * The refresh interval is a low percentile (p10) of the window's intervals:
 * a page that mostly runs at half the display's rate still shows the
 * display's own interval on the frames that keep up, so its long intervals
 * count as drops. A page that never once keeps up reads its own rate.
 *
 * `record` runs once per animation frame, so the ring and the scratch buffer
 * are allocated once and nothing is allocated per frame.
 */

export const VJ_FRAME_STATS_WINDOW_MS = 5000;

/** 240 Hz for 5 s: the most frames one window can hold. */
const RING_CAPACITY = 1200;
/** The contract's fps ceiling (3.8). */
const MAX_FPS = 240;
/** The contract's dropped frame ceiling (3.8). */
const MAX_DROPPED_FRAMES = 1_000_000;
/** An interval longer than this many refresh intervals counts as dropped frames. */
const DROPPED_INTERVAL_FACTOR = 1.5;
/** The percentile of the window's intervals read as the refresh interval. */
const REFRESH_INTERVAL_PERCENTILE = 0.1;

export interface VjFrameStatsReading {
  fps: number;
  droppedFrames: number;
  refreshIntervalMs: number;
}

export class VjFrameStats {
  private readonly timestamps = new Float64Array(RING_CAPACITY);
  private readonly intervals = new Float64Array(RING_CAPACITY);
  /** Index the next timestamp is written to. */
  private writeIndex = 0;
  private storedCount = 0;

  record(frameTimeMs: number): void {
    if (!Number.isFinite(frameTimeMs)) return;
    if (this.storedCount > 0 && frameTimeMs < this.newestTimestamp()) return;
    this.timestamps[this.writeIndex] = frameTimeMs;
    this.writeIndex = (this.writeIndex + 1) % RING_CAPACITY;
    if (this.storedCount < RING_CAPACITY) this.storedCount += 1;
  }

  read(nowMs: number): VjFrameStatsReading {
    const windowStartMs = nowMs - VJ_FRAME_STATS_WINDOW_MS;
    const windowCount = this.countSince(windowStartMs);
    if (windowCount < 2) {
      return { fps: 0, droppedFrames: 0, refreshIntervalMs: 0 };
    }

    const oldestIndex = this.ringIndexFromNewest(windowCount - 1);
    const coveredMs = nowMs - valueAt(this.timestamps, oldestIndex);
    const intervalCount = this.fillIntervals(windowCount);
    const refreshMs = percentileOf(
      this.intervals,
      intervalCount,
      REFRESH_INTERVAL_PERCENTILE,
    );
    const rawFps = coveredMs > 0 ? (intervalCount * 1000) / coveredMs : 0;

    return {
      fps: Math.min(MAX_FPS, Math.round(rawFps * 10) / 10),
      droppedFrames: this.countDropped(intervalCount, refreshMs),
      refreshIntervalMs: refreshMs,
    };
  }

  reset(): void {
    this.writeIndex = 0;
    this.storedCount = 0;
  }

  private newestTimestamp(): number {
    return this.timestampAt(0);
  }

  /** Timestamp of the frame `stepsBack` frames before the newest. */
  private timestampAt(stepsBack: number): number {
    return valueAt(this.timestamps, this.ringIndexFromNewest(stepsBack));
  }

  /** Ring index of the frame `stepsBack` frames before the newest. */
  private ringIndexFromNewest(stepsBack: number): number {
    return (
      (this.writeIndex - 1 - stepsBack + RING_CAPACITY * 2) % RING_CAPACITY
    );
  }

  /** How many stored frames, newest first, sit at or after `windowStartMs`. */
  private countSince(windowStartMs: number): number {
    let count = 0;
    while (count < this.storedCount) {
      if (this.timestampAt(count) < windowStartMs) break;
      count += 1;
    }
    return count;
  }

  /** Writes the window's intervals into the scratch buffer; answers how many. */
  private fillIntervals(windowCount: number): number {
    for (let step = 0; step < windowCount - 1; step += 1) {
      const newer = this.timestampAt(step);
      const older = this.timestampAt(step + 1);
      this.intervals[step] = newer - older;
    }
    return windowCount - 1;
  }

  /**
   * Each interval over 1.5 refresh intervals hides
   * `round(interval / refresh) - 1` frames. Reads the timestamps again
   * because `percentileOf` reorders the scratch buffer.
   */
  private countDropped(intervalCount: number, refreshMs: number): number {
    if (refreshMs <= 0) return 0;
    let dropped = 0;
    for (let step = 0; step < intervalCount; step += 1) {
      const newer = this.timestampAt(step);
      const older = this.timestampAt(step + 1);
      const intervalMs = newer - older;
      if (intervalMs > refreshMs * DROPPED_INTERVAL_FACTOR) {
        dropped += Math.round(intervalMs / refreshMs) - 1;
      }
    }
    return Math.min(MAX_DROPPED_FRAMES, dropped);
  }
}

/**
 * The `fraction` percentile (nearest rank, rounded down) of the first
 * `length` values, found in place by quickselect so the read allocates no
 * array. Reorders those values.
 */
function percentileOf(
  values: Float64Array,
  length: number,
  fraction: number,
): number {
  if (length === 0) return 0;
  const targetIndex = Math.min(
    length - 1,
    Math.max(0, Math.floor(fraction * (length - 1))),
  );
  return selectNth(values, length, targetIndex);
}

/** Hoare quickselect: puts the `targetIndex`th smallest value at that index. */
function selectNth(
  values: Float64Array,
  length: number,
  targetIndex: number,
): number {
  let left = 0;
  let right = length - 1;
  while (left < right) {
    const pivot = valueAt(values, (left + right) >> 1);
    let low = left;
    let high = right;
    while (low <= high) {
      while (valueAt(values, low) < pivot) low += 1;
      while (valueAt(values, high) > pivot) high -= 1;
      if (low <= high) {
        const swapped = valueAt(values, low);
        values[low] = valueAt(values, high);
        values[high] = swapped;
        low += 1;
        high -= 1;
      }
    }
    if (targetIndex <= high) right = high;
    else if (targetIndex >= low) left = low;
    else break;
  }
  return valueAt(values, targetIndex);
}

/** Typed array read that satisfies noUncheckedIndexedAccess. */
function valueAt(values: Float64Array, index: number): number {
  return values[index] ?? 0;
}

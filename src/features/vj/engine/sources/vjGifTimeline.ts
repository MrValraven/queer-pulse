/**
 * A decoded GIF's frame timeline on our own clock. The playhead clock
 * (vjPlayheadClock.ts) moves a position over `0..totalMs`; this module maps
 * a position to the frame showing at it. The lookup runs once per animation
 * frame and allocates nothing.
 */

/** A frame delay under this plays at VJ_GIF_FALLBACK_FRAME_MS, as browsers do. */
export const VJ_GIF_MIN_FRAME_MS = 20;
export const VJ_GIF_FALLBACK_FRAME_MS = 100;

export interface VjGifTimeline {
  /** Start of each frame in ms from the first frame, ascending. */
  frameStartsMs: Float64Array;
  totalMs: number;
}

function playedFrameMs(frameDurationMs: number): number {
  return Number.isFinite(frameDurationMs) &&
    frameDurationMs >= VJ_GIF_MIN_FRAME_MS
    ? frameDurationMs
    : VJ_GIF_FALLBACK_FRAME_MS;
}

/** A delay under 20 ms plays as 100 ms (the browser rule). */
export function createVjGifTimeline(
  frameDurationsMs: readonly number[],
): VjGifTimeline {
  const frameStartsMs = new Float64Array(frameDurationsMs.length);
  let elapsedMs = 0;
  frameDurationsMs.forEach((frameDurationMs, frameIndex) => {
    frameStartsMs[frameIndex] = elapsedMs;
    elapsedMs += playedFrameMs(frameDurationMs);
  });
  return { frameStartsMs, totalMs: elapsedMs };
}

/**
 * The frame showing at `positionMs`, wrapped into the timeline so any
 * position (negative, or past the end) answers a frame. An empty timeline
 * answers 0.
 */
export function vjGifFrameIndexAt(
  timeline: VjGifTimeline,
  positionMs: number,
): number {
  const frameCount = timeline.frameStartsMs.length;
  if (frameCount <= 1 || !(timeline.totalMs > 0)) return 0;
  if (!Number.isFinite(positionMs)) return 0;
  const wrappedMs =
    ((positionMs % timeline.totalMs) + timeline.totalMs) % timeline.totalMs;
  let lowIndex = 0;
  let highIndex = frameCount - 1;
  while (lowIndex < highIndex) {
    const middleIndex = (lowIndex + highIndex + 1) >> 1;
    const middleStartMs =
      timeline.frameStartsMs[middleIndex] ?? Number.POSITIVE_INFINITY;
    if (middleStartMs <= wrappedMs) lowIndex = middleIndex;
    else highIndex = middleIndex - 1;
  }
  return lowIndex;
}

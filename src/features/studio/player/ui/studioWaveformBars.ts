/** One bar per this many CSS pixels. */
export const WAVEFORM_BAR_PITCH = 3;

/** The stored slice levels (0..1) shrunk to the bars that fit `width`, each
 *  bar the loudest slice of its group so short loud passages stay visible. */
export function barsForWidth(
  peaks: readonly number[],
  width: number,
  pitch: number = WAVEFORM_BAR_PITCH,
): number[] {
  if (peaks.length === 0 || width <= 0) return [];
  const count = Math.max(1, Math.min(peaks.length, Math.floor(width / pitch)));
  return Array.from({ length: count }, (_bar, index) => {
    const start = Math.floor((index * peaks.length) / count);
    const end = Math.max(
      start + 1,
      Math.floor(((index + 1) * peaks.length) / count),
    );
    let largest = 0;
    for (let peakIndex = start; peakIndex < end; peakIndex += 1)
      largest = Math.max(largest, peaks[peakIndex] ?? 0);
    return largest;
  });
}

/** Chapter starts as fractions of the track; the opening chapter at 0 has no tick. */
export function chapterTickPositions(
  starts: readonly number[],
  duration: number,
): number[] {
  if (duration <= 0) return [];
  return starts
    .filter((start) => start > 0 && start < duration)
    .map((start) => start / duration);
}

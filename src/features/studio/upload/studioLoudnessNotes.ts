/** Spec 8.3: above -9 LUFS is loud; a peak above -0.3 dB is near the top. */
const LOUD_LUFS_THRESHOLD = -9;
const PEAK_DB_THRESHOLD = -0.3;

export interface LoudnessNote {
  trackNumber: number;
  kind: "loud" | "peak";
  loudnessLufs: number;
  peakDb: number;
}

/** One informational note per track, in row order; loud wins over peak. */
export function loudnessNotesFor(
  measurements: readonly ({
    loudnessLufs: number | null;
    peakDb: number | null;
  } | null)[],
): LoudnessNote[] {
  return measurements.flatMap((measurement, index): LoudnessNote[] => {
    if (
      !measurement ||
      measurement.loudnessLufs === null ||
      measurement.peakDb === null
    )
      return [];
    const { loudnessLufs, peakDb } = measurement;
    const trackNumber = index + 1;
    if (loudnessLufs > LOUD_LUFS_THRESHOLD)
      return [{ trackNumber, kind: "loud" as const, loudnessLufs, peakDb }];
    if (peakDb > PEAK_DB_THRESHOLD)
      return [{ trackNumber, kind: "peak" as const, loudnessLufs, peakDb }];
    return [];
  });
}

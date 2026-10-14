import { STUDIO_LISTENING_LIMITS } from "../api/studio.types";

/** Spec 4.4: even loudness aims every track at -14 LUFS. */
export const STUDIO_LOUDNESS_TARGET_LUFS = -14;
const MAX_CUT_DB = -12;
const MAX_BOOST_DB = 6;
const PEAK_CEILING_DBFS = -1;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), maximum);

/**
 * The gain that brings a track to the target: clamp(-14 - loudness, -12, +6),
 * then at most -1 - peak so a boost keeps the peak at or below -1 dBFS.
 * Missing measurements mean 0 dB, and the inputs are clamped to the wire
 * ranges, so a bad upload value cannot blast a listener.
 */
export function trackGainDb(input: {
  loudnessLufs: number | null;
  peakDb: number | null;
}): number {
  const { loudnessLufs, peakDb } = input;
  if (
    typeof loudnessLufs !== "number" ||
    typeof peakDb !== "number" ||
    !Number.isFinite(loudnessLufs) ||
    !Number.isFinite(peakDb)
  )
    return 0;
  const loudness = clamp(
    loudnessLufs,
    STUDIO_LISTENING_LIMITS.loudnessLufsMin,
    STUDIO_LISTENING_LIMITS.loudnessLufsMax,
  );
  const peak = clamp(
    peakDb,
    STUDIO_LISTENING_LIMITS.peakDbMin,
    STUDIO_LISTENING_LIMITS.peakDbMax,
  );
  const towardTarget = clamp(
    STUDIO_LOUDNESS_TARGET_LUFS - loudness,
    MAX_CUT_DB,
    MAX_BOOST_DB,
  );
  return clamp(
    Math.min(towardTarget, PEAK_CEILING_DBFS - peak),
    MAX_CUT_DB,
    MAX_BOOST_DB,
  );
}

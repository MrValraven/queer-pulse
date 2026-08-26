/**
 * The coarse "recently active" signal, frontend side.
 *
 * The backend stores one value per member: the MONTH they last held a live
 * session, and nothing finer. It never sends that month over the wire. What
 * arrives is one of three bands, so a member who signed in on the 2nd and one
 * who signed in on the 27th are indistinguishable here, and there is nothing to
 * render as a live presence dot.
 *
 * `null` is a real, common answer with three causes the UI treats identically
 * by rendering nothing at all: the member opted out, the member has held no
 * session since the signal existed, and this build simply did not ask. The
 * third band, `dormant`, is only ever shown on a member the platform has
 * actually observed. Showing "not active recently" on a member with no value
 * would be a claim about somebody made from an absence of data.
 */
export type ActivityBand = "thisMonth" | "last3Months" | "dormant";

/** Display label per band, resolved through `t()` at the render site. */
export const ACTIVITY_BAND_LABEL_KEY: Record<ActivityBand, string> = {
  thisMonth: "members:activityBand.thisMonth",
  last3Months: "members:activityBand.last3Months",
  dormant: "members:activityBand.dormant",
};

const KNOWN_BANDS = new Set<string>(Object.keys(ACTIVITY_BAND_LABEL_KEY));

/**
 * Narrow a wire value to a band, dropping anything this build does not know
 * (the same defensive rule `toOpenToEntries` follows: a backend ahead of the
 * frontend must degrade to "no band" rather than render a raw token or crash).
 */
export function toActivityBand(
  value: string | null | undefined,
): ActivityBand | null {
  return value && KNOWN_BANDS.has(value) ? (value as ActivityBand) : null;
}

/** Sort weight, newest band first. `null` always sorts last. */
const BAND_RANK: Record<ActivityBand, number> = {
  thisMonth: 0,
  last3Months: 1,
  dormant: 2,
};

/**
 * Demo-mode comparator for the "Recently active" sort. Live mode sorts
 * server-side and never reaches this.
 */
export function compareActivityBands(
  left: ActivityBand | null | undefined,
  right: ActivityBand | null | undefined,
): number {
  const leftRank = left ? BAND_RANK[left] : Number.MAX_SAFE_INTEGER;
  const rightRank = right ? BAND_RANK[right] : Number.MAX_SAFE_INTEGER;
  return leftRank - rightRank;
}

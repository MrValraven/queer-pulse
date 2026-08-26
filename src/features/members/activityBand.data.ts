import type { ActivityBand } from "./activityBand";

/**
 * Demo-mode stand-in for the coarse "recently active" signal.
 *
 * Live mode reads a real band off `GET /members` and `GET /profiles/:slug`;
 * this file is what the prototype renders instead, so the directory, the sort
 * and the privacy switch are all visible with no backend. Deterministic from
 * the slug, so a demo member's band does not shuffle between renders.
 *
 * `null` is in the cycle on purpose: it is the most common state on a real
 * platform the day this ships, and the demo has to show that it renders as
 * nothing at all rather than as "not active recently".
 */
const DEMO_BAND_CYCLE: (ActivityBand | null)[] = [
  "thisMonth",
  "thisMonth",
  "last3Months",
  null,
  "thisMonth",
  "dormant",
  "last3Months",
  null,
];

/** Stable hash of a slug, matching the spirit of `tintForSlug`. */
function hashSlug(slug: string): number {
  let hash = 0;
  for (let index = 0; index < slug.length; index++) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function demoBandForSlug(slug: string): ActivityBand | null {
  return DEMO_BAND_CYCLE[hashSlug(slug) % DEMO_BAND_CYCLE.length] ?? null;
}

/** What the demo privacy switch reads back: a visible band, not opted out. */
export const DEMO_ACTIVITY_VISIBILITY = {
  band: "thisMonth" as ActivityBand | null,
  isHidden: false,
};

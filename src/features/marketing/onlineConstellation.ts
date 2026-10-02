import { websiteLabel } from "./directoryPlaces";

/** How many businesses each orbit holds before the next one starts. */
export const ORBIT_CAPACITY = [5, 9] as const;

/** The two orbits' radii, as a percentage of the stage's width. Far enough
 *  apart that a full set of nodes (each 18% of the stage wide) never
 *  overlaps across orbits, and the outer one stops short of 50 so a node's
 *  centre always sits on the stage. */
export const ORBIT_RADII = [24, 42] as const;

/** The most businesses the constellation draws; the rest wait in the grid. */
export const CONSTELLATION_LIMIT = ORBIT_CAPACITY[0] + ORBIT_CAPACITY[1];

export interface ConstellationNode<T> {
  item: T;
  /** 0 for the inner orbit, 1 for the outer one. */
  orbit: 0 | 1;
  /** Offset from the stage's centre, in percent of its width (and height: the
   *  stage is square). Rounded so the inline styles stay stable between
   *  renders and readable in devtools. */
  x: number;
  y: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Seat up to `CONSTELLATION_LIMIT` items on two concentric orbits around the
 * stage's centre. Up to `ORBIT_CAPACITY[0]` share the inner orbit; beyond
 * that the two orbits split them about 2:3, in order. Each orbit spaces its items
 * evenly from twelve o'clock, and the outer one is turned half a step so its
 * nodes sit in the gaps of the inner one and no two line up on one spoke.
 *
 * Positions are percentages, so the layout scales with the stage at any width
 * and nothing is measured at runtime.
 */
export function layoutConstellation<T>(
  items: readonly T[],
): ConstellationNode<T>[] {
  const seated = items.slice(0, CONSTELLATION_LIMIT);
  // A handful sits on the inner orbit alone. Past that the two orbits share
  // the load, the outer one taking the larger part as its longer path allows,
  // so six businesses read as three and three, never five and a straggler.
  const innerCount =
    seated.length <= ORBIT_CAPACITY[0]
      ? seated.length
      : Math.min(ORBIT_CAPACITY[0], Math.ceil(seated.length * 0.4));
  const outerCount = seated.length - innerCount;

  return seated.map((item, index) => {
    const orbit: 0 | 1 = index < innerCount ? 0 : 1;
    const slot = orbit === 0 ? index : index - innerCount;
    const count = orbit === 0 ? innerCount : outerCount;
    const step = (Math.PI * 2) / count;
    const turn = orbit === 0 ? 0 : step / 2;
    const angle = -Math.PI / 2 + turn + slot * step;
    const radius = ORBIT_RADII[orbit];
    return {
      item,
      orbit,
      x: round(Math.cos(angle) * radius),
      y: round(Math.sin(angle) * radius),
    };
  });
}

/**
 * The address a card's browser bar shows: the website's bare hostname, else
 * the Instagram profile, else nothing (the caller falls back to a plain
 * "Online").
 */
export function onlineAddressOf(social: {
  website?: string;
  instagram?: string;
}): string | null {
  const website = social.website?.trim();
  if (website) return websiteLabel(website);
  const instagram = social.instagram?.trim();
  if (instagram) {
    return `instagram.com/${instagram.replace(/^@/, "")}`;
  }
  return null;
}

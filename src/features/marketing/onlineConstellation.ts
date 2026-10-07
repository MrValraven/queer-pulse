import { websiteLabel } from "./directoryPlaces";

/** How many businesses each orbit holds before the next one starts. */
export const ORBIT_CAPACITY = [5, 9] as const;

/** The two orbits' radii, as a percentage of the stage's width. 20 apart,
 *  more than a node's 18% width, so an inner and an outer node clear each
 *  other even when they sit only a few degrees apart. The inner one still
 *  clears the 21% pulse at the centre, and the outer one stops short of 50
 *  so a node's centre always sits on the stage. */
export const ORBIT_RADII = [22, 42] as const;

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

const FULL_TURN = Math.PI * 2;

/** How many offsets `outerTurnFor` tries across one outer step. Fine enough
 *  to land exactly on the best offset for every inner count up to five. */
const TURN_CANDIDATES = 360;

/** Two gaps closer than this count as equal, so float noise never decides. */
const GAP_TOLERANCE = 1e-9;

/** The smallest angle, in radians, between any outer node and any inner node
 *  once the outer orbit is turned by `turn`. */
function smallestGapFor(
  innerCount: number,
  outerCount: number,
  turn: number,
): number {
  const innerStep = FULL_TURN / innerCount;
  const outerStep = FULL_TURN / outerCount;
  let smallest = Math.PI;
  for (let outerSlot = 0; outerSlot < outerCount; outerSlot += 1) {
    for (let innerSlot = 0; innerSlot < innerCount; innerSlot += 1) {
      const apart =
        (((turn + outerSlot * outerStep - innerSlot * innerStep) % FULL_TURN) +
          FULL_TURN) %
        FULL_TURN;
      smallest = Math.min(smallest, apart, FULL_TURN - apart);
    }
  }
  return smallest;
}

/**
 * How far to turn the outer orbit from twelve o'clock. A fixed half step lands
 * outer nodes right on an inner spoke for some counts (nine businesses seat
 * four and five, and the fifth outer node met the third inner one at six
 * o'clock), so this tries offsets across one outer step and keeps the one
 * whose closest outer and inner pair sit furthest apart. Among equally good
 * offsets, the one nearest half a step wins, so the familiar staggered look
 * holds wherever it already worked.
 */
export function outerTurnFor(innerCount: number, outerCount: number): number {
  if (innerCount === 0 || outerCount === 0) return 0;
  const outerStep = FULL_TURN / outerCount;
  let bestTurn = outerStep / 2;
  let bestGap = smallestGapFor(innerCount, outerCount, bestTurn);
  for (let candidate = 0; candidate < TURN_CANDIDATES; candidate += 1) {
    const turn = (candidate * outerStep) / TURN_CANDIDATES;
    const gap = smallestGapFor(innerCount, outerCount, turn);
    const isWider = gap > bestGap + GAP_TOLERANCE;
    const isAsWideAndCloserToHalf =
      Math.abs(gap - bestGap) <= GAP_TOLERANCE &&
      Math.abs(turn - outerStep / 2) < Math.abs(bestTurn - outerStep / 2);
    if (isWider || isAsWideAndCloserToHalf) {
      bestTurn = turn;
      bestGap = gap;
    }
  }
  return bestTurn;
}

/**
 * Seat up to `CONSTELLATION_LIMIT` items on two concentric orbits around the
 * stage's centre. Up to `ORBIT_CAPACITY[0]` share the inner orbit; beyond
 * that the two orbits split them about 2:3, in order. Each orbit spaces its items
 * evenly from twelve o'clock, and the outer one is turned by `outerTurnFor` so
 * its nodes sit in the gaps of the inner one and no two line up on one spoke.
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
  const outerTurn = outerTurnFor(innerCount, outerCount);

  return seated.map((item, index) => {
    const orbit: 0 | 1 = index < innerCount ? 0 : 1;
    const slot = orbit === 0 ? index : index - innerCount;
    const count = orbit === 0 ? innerCount : outerCount;
    const step = (Math.PI * 2) / count;
    const turn = orbit === 0 ? 0 : outerTurn;
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

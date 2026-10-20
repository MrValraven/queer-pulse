import type { EgoRelation } from "./trustGraph/egoRelation";

/** Rings layout (spec C1): the focus sits at the origin and every visible
 *  member sits on a ring chosen by how it relates to the focus. */

export type RingSlot = EgoRelation | "bubble";

export const RING_BASE_RADII = {
  inner: 130,
  middle: 230,
  outer: 330,
  withdrawn: 410,
} as const;
export const RING_MIN_GAP = 90;
export const RING_NODE_SPACING = 56;
export const SECOND_HOP_OFFSET = 90;
export const SECOND_HOP_SPREAD_RADIANS = 0.12;

type RingName = keyof typeof RING_BASE_RADII;

/** Ring order from the centre outwards. */
const RING_ORDER: RingName[] = ["inner", "middle", "outer", "withdrawn"];

const RING_FOR_SLOT: Record<Exclude<RingSlot, "secondHop">, RingName> = {
  mutual: "inner",
  vouchedBy: "middle",
  vouchedFor: "outer",
  invited: "outer",
  bubble: "outer",
  withdrawnOnly: "withdrawn",
};

const START_ANGLE = -Math.PI / 2;

export interface RingLayoutInput {
  focusId: string;
  nodeIds: string[];
  slotFor: (id: string) => RingSlot;
  parentFor: (id: string) => string | null;
  nameFor: (id: string) => string;
}

type Point = { x: number; y: number };

function compareByName(nameFor: (id: string) => string) {
  return (firstId: string, secondId: string) =>
    nameFor(firstId).localeCompare(nameFor(secondId), undefined, {
      sensitivity: "base",
    }) || (firstId < secondId ? -1 : firstId > secondId ? 1 : 0);
}

function pointAt(radius: number, angle: number): Point {
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

/** Radius per ring: max(base, count × spacing / 2π, previous ring + gap). */
export function computeRingRadii(
  countByRing: Record<RingName, number>,
): Record<RingName, number> {
  const radii = { inner: 0, middle: 0, outer: 0, withdrawn: 0 };
  let previousRadius = -Infinity;
  for (const ringName of RING_ORDER) {
    const radius = Math.max(
      RING_BASE_RADII[ringName],
      (countByRing[ringName] * RING_NODE_SPACING) / (2 * Math.PI),
      previousRadius + RING_MIN_GAP,
    );
    radii[ringName] = radius;
    previousRadius = radius;
  }
  return radii;
}

function placeSecondHop(
  secondHopIds: string[],
  radius: number,
  targets: Map<string, Point>,
  input: RingLayoutInput,
): void {
  const childrenByParent = new Map<string, string[]>();
  const orphanIds: string[] = [];
  for (const id of secondHopIds) {
    const parentId = input.parentFor(id);
    if (parentId === null || !targets.has(parentId)) {
      orphanIds.push(id);
      continue;
    }
    const children = childrenByParent.get(parentId) ?? [];
    children.push(id);
    childrenByParent.set(parentId, children);
  }
  const byName = compareByName(input.nameFor);
  for (const [parentId, childIds] of childrenByParent) {
    const parentPoint = targets.get(parentId)!;
    const parentAngle = Math.atan2(parentPoint.y, parentPoint.x);
    childIds.sort(byName);
    const middleIndex = (childIds.length - 1) / 2;
    childIds.forEach((childId, childIndex) => {
      const angle =
        parentAngle + (childIndex - middleIndex) * SECOND_HOP_SPREAD_RADIANS;
      targets.set(childId, pointAt(radius, angle));
    });
  }
  // second-hop members with no placed parent spread evenly around the ring
  orphanIds.sort(byName);
  const orphanStep = (2 * Math.PI) / Math.max(orphanIds.length, 1);
  orphanIds.forEach((orphanId, orphanIndex) => {
    targets.set(
      orphanId,
      pointAt(radius, START_ANGLE + orphanIndex * orphanStep),
    );
  });
}

/** Distinct ring radii in a target map, smallest first, for the faint guide
 *  circles the rings layout draws. The focus at the origin adds none. */
export function ringGuideRadii(
  targets: ReadonlyMap<string, Point> | null,
): number[] {
  if (!targets) return [];
  const radii = new Set<number>();
  for (const point of targets.values()) {
    const radius = Math.round(Math.hypot(point.x, point.y));
    if (radius > 0) radii.add(radius);
  }
  return [...radii].sort((first, second) => first - second);
}

/** Target position for every id in `nodeIds`. The focus maps to (0, 0); ring
 *  members sort by name and start at the top (-π/2), with every other ring
 *  turned by half a step; second-hop members sit one gap past the outermost
 *  occupied ring, fanned out around their parent's angle. */
export function computeRingTargets(input: RingLayoutInput): Map<string, Point> {
  const { focusId, nodeIds } = input;
  const idsByRing: Record<RingName, string[]> = {
    inner: [],
    middle: [],
    outer: [],
    withdrawn: [],
  };
  const secondHopIds: string[] = [];
  for (const id of nodeIds) {
    if (id === focusId) continue;
    const slot = input.slotFor(id);
    if (slot === "secondHop") secondHopIds.push(id);
    else idsByRing[RING_FOR_SLOT[slot]].push(id);
  }

  const radii = computeRingRadii({
    inner: idsByRing.inner.length,
    middle: idsByRing.middle.length,
    outer: idsByRing.outer.length,
    withdrawn: idsByRing.withdrawn.length,
  });

  const targets = new Map<string, Point>();
  if (nodeIds.includes(focusId)) targets.set(focusId, { x: 0, y: 0 });

  const byName = compareByName(input.nameFor);
  let outermostOccupiedRadius = 0;
  RING_ORDER.forEach((ringName, ringIndex) => {
    const ringIds = idsByRing[ringName];
    if (ringIds.length === 0) return;
    ringIds.sort(byName);
    const radius = radii[ringName];
    const step = (2 * Math.PI) / ringIds.length;
    const startAngle = START_ANGLE + (ringIndex % 2 === 1 ? step / 2 : 0);
    ringIds.forEach((id, slotIndex) => {
      targets.set(id, pointAt(radius, startAngle + slotIndex * step));
    });
    outermostOccupiedRadius = radius;
  });

  if (secondHopIds.length > 0) {
    const baseRadius = outermostOccupiedRadius || RING_BASE_RADII.inner;
    placeSecondHop(
      secondHopIds,
      baseRadius + SECOND_HOP_OFFSET,
      targets,
      input,
    );
  }
  return targets;
}

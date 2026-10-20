/** Barnes-Hut repulsion for the force layout (spec C6). Above
 *  `BARNES_HUT_MIN_NODES` the layout approximates far-away groups of nodes by
 *  their centre of mass, so one physics step costs about n log n. */

export const BARNES_HUT_THETA = 0.9;
/** The force layout switches to Barnes-Hut when the node count exceeds this. */
export const BARNES_HUT_MIN_NODES = 120;

/** Anything with a position and a velocity; `NodePos` fits this shape. */
export interface RepulsionBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Keeps the quadtree finite when many nodes share one point. */
const MAX_TREE_DEPTH = 24;
const DISTANCE_SOFTENING = 0.01;

interface QuadCell {
  centerX: number;
  centerY: number;
  halfSize: number;
  mass: number;
  massX: number;
  massY: number;
  /** bodies held directly; only leaves hold bodies */
  bodies: RepulsionBody[];
  children: (QuadCell | null)[] | null;
}

function createCell(centerX: number, centerY: number, halfSize: number) {
  const cell: QuadCell = {
    centerX,
    centerY,
    halfSize,
    mass: 0,
    massX: 0,
    massY: 0,
    bodies: [],
    children: null,
  };
  return cell;
}

function quadrantFor(cell: QuadCell, body: RepulsionBody): number {
  const eastOffset = body.x >= cell.centerX ? 1 : 0;
  const southOffset = body.y >= cell.centerY ? 2 : 0;
  return eastOffset + southOffset;
}

function childFor(cell: QuadCell, quadrant: number): QuadCell {
  const children = cell.children ?? [null, null, null, null];
  cell.children = children;
  const existing = children[quadrant];
  if (existing) return existing;
  const quarter = cell.halfSize / 2;
  const offsetX = quadrant % 2 === 1 ? quarter : -quarter;
  const offsetY = quadrant >= 2 ? quarter : -quarter;
  const child = createCell(
    cell.centerX + offsetX,
    cell.centerY + offsetY,
    quarter,
  );
  children[quadrant] = child;
  return child;
}

function insertBody(root: QuadCell, body: RepulsionBody): void {
  let cell = root;
  let depth = 0;
  for (;;) {
    cell.mass += 1;
    cell.massX += body.x;
    cell.massY += body.y;
    if (cell.children) {
      cell = childFor(cell, quadrantFor(cell, body));
      depth += 1;
      continue;
    }
    if (cell.bodies.length === 0 || depth >= MAX_TREE_DEPTH) {
      cell.bodies.push(body);
      return;
    }
    // split the leaf: push its bodies one level down, then keep descending
    const heldBodies = cell.bodies;
    cell.bodies = [];
    for (const heldBody of heldBodies) {
      const child = childFor(cell, quadrantFor(cell, heldBody));
      child.mass += 1;
      child.massX += heldBody.x;
      child.massY += heldBody.y;
      child.bodies.push(heldBody);
    }
    cell = childFor(cell, quadrantFor(cell, body));
    depth += 1;
  }
}

function buildTree(bodies: RepulsionBody[]): QuadCell {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const body of bodies) {
    minX = Math.min(minX, body.x);
    minY = Math.min(minY, body.y);
    maxX = Math.max(maxX, body.x);
    maxY = Math.max(maxY, body.y);
  }
  const halfSize = Math.max(maxX - minX, maxY - minY, 1) / 2 + 1;
  const root = createCell((minX + maxX) / 2, (minY + maxY) / 2, halfSize);
  for (const body of bodies) insertBody(root, body);
  return root;
}

function pushApart(
  body: RepulsionBody,
  sourceX: number,
  sourceY: number,
  strength: number,
): void {
  const deltaX = body.x - sourceX;
  const deltaY = body.y - sourceY;
  const distanceSquared =
    deltaX * deltaX + deltaY * deltaY + DISTANCE_SOFTENING;
  const distance = Math.sqrt(distanceSquared);
  const force = strength / distanceSquared;
  body.vx += (deltaX / distance) * force;
  body.vy += (deltaY / distance) * force;
}

function repelFromTree(
  body: RepulsionBody,
  root: QuadCell,
  strength: number,
  thetaSquared: number,
): void {
  const stack: QuadCell[] = [root];
  while (stack.length > 0) {
    const cell = stack.pop()!;
    if (cell.mass === 0) continue;
    if (!cell.children) {
      for (const otherBody of cell.bodies) {
        if (otherBody !== body) {
          pushApart(body, otherBody.x, otherBody.y, strength);
        }
      }
      continue;
    }
    const massCenterX = cell.massX / cell.mass;
    const massCenterY = cell.massY / cell.mass;
    const deltaX = body.x - massCenterX;
    const deltaY = body.y - massCenterY;
    const distanceSquared =
      deltaX * deltaX + deltaY * deltaY + DISTANCE_SOFTENING;
    const cellWidth = cell.halfSize * 2;
    if ((cellWidth * cellWidth) / distanceSquared < thetaSquared) {
      pushApart(body, massCenterX, massCenterY, strength * cell.mass);
      continue;
    }
    for (const child of cell.children) if (child) stack.push(child);
  }
}

/** Adds the repulsion every other body exerts on each body to its velocity.
 *  The force between two bodies is `strength / distance²`, matching the exact
 *  pairwise loop in the layout. */
export function applyBarnesHutRepulsion(
  bodies: RepulsionBody[],
  strength: number,
  theta: number = BARNES_HUT_THETA,
): void {
  if (bodies.length < 2) return;
  const root = buildTree(bodies);
  const thetaSquared = theta * theta;
  for (const body of bodies) repelFromTree(body, root, strength, thetaSquared);
}

/** Exact pairwise repulsion, O(n²); used for small graphs. */
export function applyExactRepulsion(
  bodies: RepulsionBody[],
  strength: number,
): void {
  for (let firstIndex = 0; firstIndex < bodies.length; firstIndex++) {
    const first = bodies[firstIndex]!;
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < bodies.length;
      secondIndex++
    ) {
      const second = bodies[secondIndex]!;
      const deltaX = first.x - second.x;
      const deltaY = first.y - second.y;
      const distanceSquared =
        deltaX * deltaX + deltaY * deltaY + DISTANCE_SOFTENING;
      const distance = Math.sqrt(distanceSquared);
      const force = strength / distanceSquared;
      const forceX = (deltaX / distance) * force;
      const forceY = (deltaY / distance) * force;
      first.vx += forceX;
      first.vy += forceY;
      second.vx -= forceX;
      second.vy -= forceY;
    }
  }
}

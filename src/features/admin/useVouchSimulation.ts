import { useCallback, useEffect, useRef } from "react";
import type { VouchLayoutKind } from "./vouchGraph.types";
import {
  BARNES_HUT_MIN_NODES,
  applyBarnesHutRepulsion,
  applyExactRepulsion,
} from "./vouchBarnesHut";

export interface NodePos {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface LayoutEdge {
  id: string;
  from: string;
  to: string;
  isMutual: boolean;
}

export interface LayoutRunArgs {
  nodeIds: string[];
  edges: LayoutEdge[];
  focusId: string;
  layoutKind: VouchLayoutKind;
  /** rings layout targets; null falls back to the force layout */
  ringTargets: ReadonlyMap<string, { x: number; y: number }> | null;
  /** where a member's community sector sits (force layout pull and seeding) */
  sceneAnchorFor: (id: string) => { x: number; y: number };
  /** how strongly nodes are pulled toward their community sector */
  clusterStrength: number;
  /** nodes the admin dragged into place; every layout leaves these fixed */
  pinned: ReadonlySet<string>;
  /** called after every step so the caller can paint the DOM imperatively */
  paint: () => void;
  /** called once the layout has settled (the caller fits the view) */
  onSettled?: () => void;
}

export interface VouchSimulation {
  getPos: (id: string) => NodePos | undefined;
  setPos: (id: string, x: number, y: number) => void;
  clearPositions: () => void;
  run: (args: LayoutRunArgs) => void;
  stop: () => void;
}

const REPULSION_STRENGTH = 4200;
const SPRING_STRENGTH = 0.018;
const SPRING_LENGTH_MUTUAL = 150;
const SPRING_LENGTH = 175;
const VELOCITY_DAMPING = 0.86;
const SEED_JITTER_PX = 70;
/** Force layout step counts (spec C6). */
const SMALL_GRAPH_MAX_NODES = 200;
const PRESETTLE_STEPS_SMALL = 150;
const ANIMATED_STEPS_SMALL = 140;
const PRESETTLE_STEPS_LARGE = 80;
const ANIMATED_STEPS_LARGE = 90;
/** Rings transition (spec C1): ease a fifth of the way each frame. */
const RING_LERP = 0.2;
const RING_FRAMES = 36;
const RING_SETTLED_DISTANCE_PX = 0.5;

type Positions = Map<string, NodePos>;
type FrameScheduler = (step: () => void) => void;

function seedPositions(positions: Positions, args: LayoutRunArgs): void {
  for (const id of args.nodeIds) {
    const existing = positions.get(id);
    if (existing) {
      existing.vx = 0;
      existing.vy = 0;
      continue;
    }
    const ringTarget =
      args.layoutKind === "rings" ? args.ringTargets?.get(id) : undefined;
    if (id === args.focusId) {
      positions.set(id, { x: 0, y: 0, vx: 0, vy: 0 });
    } else if (ringTarget) {
      positions.set(id, { x: ringTarget.x, y: ringTarget.y, vx: 0, vy: 0 });
    } else {
      const anchor = args.sceneAnchorFor(id);
      positions.set(id, {
        x: anchor.x + (Math.random() - 0.5) * SEED_JITTER_PX,
        y: anchor.y + (Math.random() - 0.5) * SEED_JITTER_PX,
        vx: 0,
        vy: 0,
      });
    }
  }
  const focusPosition = positions.get(args.focusId);
  if (focusPosition) {
    focusPosition.x = 0;
    focusPosition.y = 0;
  }
}

/** Eases every free node toward its ring target; the focus and pinned nodes
 *  stay put. Reduced motion places the targets in one pass. */
function runRings(
  positions: Positions,
  args: LayoutRunArgs,
  ringTargets: ReadonlyMap<string, { x: number; y: number }>,
  isReducedMotion: boolean,
  scheduleFrame: FrameScheduler,
): void {
  const movers: {
    id: string;
    position: NodePos;
    target: { x: number; y: number };
  }[] = [];
  let hasDistantMover = false;
  for (const id of args.nodeIds) {
    if (id === args.focusId || args.pinned.has(id)) continue;
    const position = positions.get(id);
    const target = ringTargets.get(id);
    if (!position || !target) continue;
    movers.push({ id, position, target });
    const distance = Math.hypot(target.x - position.x, target.y - position.y);
    if (distance > RING_SETTLED_DISTANCE_PX) hasDistantMover = true;
  }
  const placeAtTargets = () => {
    for (const { id, position, target } of movers) {
      if (args.pinned.has(id)) continue;
      position.x = target.x;
      position.y = target.y;
      position.vx = 0;
      position.vy = 0;
    }
    args.paint();
    args.onSettled?.();
  };
  if (isReducedMotion || !hasDistantMover) {
    placeAtTargets();
    return;
  }
  args.paint();
  let frameCount = 0;
  const step = () => {
    frameCount += 1;
    if (frameCount >= RING_FRAMES) {
      placeAtTargets();
      return;
    }
    for (const { id, position, target } of movers) {
      // re-checked each frame: the admin may grab a node mid-transition
      if (args.pinned.has(id)) continue;
      position.x += (target.x - position.x) * RING_LERP;
      position.y += (target.y - position.y) * RING_LERP;
    }
    args.paint();
    scheduleFrame(step);
  };
  scheduleFrame(step);
}

/** One physics step factory for the force layout: repulsion (Barnes-Hut above
 *  BARNES_HUT_MIN_NODES), edge springs, then the pull toward each member's
 *  scene sector. Lookups are resolved once per run. */
function createForceStep(positions: Positions, args: LayoutRunArgs) {
  const bodies = args.nodeIds
    .map((id) => positions.get(id))
    .filter((position): position is NodePos => position !== undefined);
  const springs: { start: NodePos; end: NodePos; length: number }[] = [];
  for (const edge of args.edges) {
    const start = positions.get(edge.from);
    const end = positions.get(edge.to);
    if (!start || !end) continue;
    const length = edge.isMutual ? SPRING_LENGTH_MUTUAL : SPRING_LENGTH;
    springs.push({ start, end, length });
  }
  const freeNodes = args.nodeIds
    .filter((id) => id !== args.focusId)
    .map((id) => ({
      id,
      position: positions.get(id)!,
      anchor: args.sceneAnchorFor(id),
    }));
  const focusPosition = positions.get(args.focusId);
  const shouldUseBarnesHut = bodies.length > BARNES_HUT_MIN_NODES;

  return () => {
    if (shouldUseBarnesHut) applyBarnesHutRepulsion(bodies, REPULSION_STRENGTH);
    else applyExactRepulsion(bodies, REPULSION_STRENGTH);
    for (const { start, end, length } of springs) {
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) + 0.01;
      const force = (distance - length) * SPRING_STRENGTH;
      const forceX = (deltaX / distance) * force;
      const forceY = (deltaY / distance) * force;
      start.vx += forceX;
      start.vy += forceY;
      end.vx -= forceX;
      end.vy -= forceY;
    }
    if (focusPosition) {
      focusPosition.x = 0;
      focusPosition.y = 0;
      focusPosition.vx = 0;
      focusPosition.vy = 0;
    }
    for (const { id, position, anchor } of freeNodes) {
      if (args.pinned.has(id)) {
        // the admin dropped this node here; hold it still
        position.vx = 0;
        position.vy = 0;
        continue;
      }
      position.vx += (anchor.x - position.x) * args.clusterStrength;
      position.vy += (anchor.y - position.y) * args.clusterStrength;
      position.vx *= VELOCITY_DAMPING;
      position.vy *= VELOCITY_DAMPING;
      position.x += position.vx;
      position.y += position.vy;
    }
  };
}

/** Force layout: a synchronous pre-settle so the first painted frame is
 *  already spread out, then animated steps. Reduced motion runs every step
 *  synchronously and paints once, so nothing moves on screen. */
function runForce(
  positions: Positions,
  args: LayoutRunArgs,
  isReducedMotion: boolean,
  scheduleFrame: FrameScheduler,
): void {
  const physicsStep = createForceStep(positions, args);
  const isSmallGraph = args.nodeIds.length <= SMALL_GRAPH_MAX_NODES;
  const presettleSteps = isSmallGraph
    ? PRESETTLE_STEPS_SMALL
    : PRESETTLE_STEPS_LARGE;
  const animatedSteps = isSmallGraph
    ? ANIMATED_STEPS_SMALL
    : ANIMATED_STEPS_LARGE;
  const synchronousSteps = isReducedMotion
    ? presettleSteps + animatedSteps
    : presettleSteps;
  for (let stepIndex = 0; stepIndex < synchronousSteps; stepIndex++) {
    physicsStep();
  }
  args.paint();
  args.onSettled?.();
  if (isReducedMotion) return;

  let stepCount = 0;
  const step = () => {
    stepCount += 1;
    physicsStep();
    args.paint();
    if (stepCount < animatedSteps) scheduleFrame(step);
    else args.onSettled?.();
  };
  scheduleFrame(step);
}

/**
 * Layout engine for the trust network. Positions live in a ref and are
 * mutated in place each frame; the caller paints them onto SVG nodes and
 * edges via `paint` (transform only). The rings layout eases toward fixed
 * targets; the force layout runs a spring simulation.
 */
export function useVouchSimulation(isReducedMotion: boolean): VouchSimulation {
  const positionsRef = useRef<Positions>(new Map());
  const frameRef = useRef<number | null>(null);
  /** bumped by every run and stop; a frame from an older run does nothing */
  const runGenerationRef = useRef(0);

  const stop = useCallback(() => {
    runGenerationRef.current += 1;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const getPos = useCallback((id: string) => positionsRef.current.get(id), []);

  const setPos = useCallback((id: string, x: number, y: number) => {
    const position = positionsRef.current.get(id);
    if (position) {
      position.x = x;
      position.y = y;
      position.vx = 0;
      position.vy = 0;
    }
  }, []);

  /** drop cached positions so the next run lays the graph out fresh */
  const clearPositions = useCallback(() => positionsRef.current.clear(), []);

  const run = useCallback(
    (args: LayoutRunArgs) => {
      stop();
      const runGeneration = runGenerationRef.current;
      const isCurrentRun = () => runGenerationRef.current === runGeneration;
      const positions = positionsRef.current;
      seedPositions(positions, args);
      // an onSettled callback may start a new run synchronously; the older
      // run then schedules nothing more and any frame it queued exits early
      const scheduleFrame: FrameScheduler = (step) => {
        if (!isCurrentRun()) return;
        frameRef.current = requestAnimationFrame(() => {
          if (isCurrentRun()) step();
        });
      };
      if (args.layoutKind === "rings" && args.ringTargets) {
        runRings(
          positions,
          args,
          args.ringTargets,
          isReducedMotion,
          scheduleFrame,
        );
      } else {
        runForce(positions, args, isReducedMotion, scheduleFrame);
      }
    },
    [isReducedMotion, stop],
  );

  return { getPos, setPos, clearPositions, run, stop };
}

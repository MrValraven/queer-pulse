/** Pure 3D maths for the Q: placing the flat letter on a gently curved
 *  surface, turning it (yaw, then pitch) and projecting it through a
 *  perspective camera. Positions are in bowl units; +z points at the
 *  viewer. Every function writes into a caller-owned object, so the frame
 *  loop never allocates. */

export interface Projected {
  screenX: number;
  screenY: number;
  /** Perspective scale: above 1 when nearer than the letter's plane. */
  perspective: number;
  /** Depth after turning: bigger is nearer the viewer. */
  depth: number;
}

export interface Camera {
  originX: number;
  originY: number;
  pixelsPerUnit: number;
  /** Distance from the camera to the letter's plane, in bowl units. */
  distance: number;
  yaw: number;
  pitch: number;
}

/** How far the bowl bulges toward the viewer at its centre. */
const BULGE = 0.5;
/** The surface's reach: past this radius it has curved back to z = 0. */
const SURFACE_REACH = 1.9;
/** The tail sits this much nearer, so it passes in front of the bowl. */
export const TAIL_LIFT = 0.24;

/** Height of the shallow dome at (u, v): a smooth cap, 0 at its rim. */
export function surfaceDepth(u: number, v: number): number {
  const reach = (u * u + v * v) / (SURFACE_REACH * SURFACE_REACH);
  return BULGE * Math.max(-0.25, 1 - reach);
}

export function createProjected(): Projected {
  return { screenX: 0, screenY: 0, perspective: 1, depth: 0 };
}

export function project(
  camera: Camera,
  modelX: number,
  modelY: number,
  modelZ: number,
  out: Projected,
): void {
  const cosYaw = Math.cos(camera.yaw);
  const sinYaw = Math.sin(camera.yaw);
  const cosPitch = Math.cos(camera.pitch);
  const sinPitch = Math.sin(camera.pitch);
  const turnedX = modelX * cosYaw + modelZ * sinYaw;
  const turnedZ = -modelX * sinYaw + modelZ * cosYaw;
  const tiltedY = modelY * cosPitch - turnedZ * sinPitch;
  const tiltedZ = modelY * sinPitch + turnedZ * cosPitch;
  const perspective =
    camera.distance / Math.max(0.2, camera.distance - tiltedZ);
  out.screenX = camera.originX + turnedX * perspective * camera.pixelsPerUnit;
  out.screenY = camera.originY + tiltedY * perspective * camera.pixelsPerUnit;
  out.perspective = perspective;
  out.depth = tiltedZ;
}

/** 0 for far and soft, 1 for near and crisp, from a projected depth. */
export function depthFocus(depth: number): number {
  return Math.min(1, Math.max(0, (depth + 0.55) / 1.05));
}

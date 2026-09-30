/** Drawing helpers for the Q's threads and lights: one scratch quadratic
 *  curve (reused for every thread, so drawing never allocates), pieces of
 *  it, and soft glow sprites. */

/** Scratch curve, reused for every thread so drawing never allocates. */
const curve = {
  startX: 0,
  startY: 0,
  controlX: 0,
  controlY: 0,
  endX: 0,
  endY: 0,
};

/** Sets the scratch curve from one point to another, bowed sideways by
 *  `bend` (a signed fraction of its length). */
export function setCurve(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  bend: number,
) {
  curve.startX = fromX;
  curve.startY = fromY;
  curve.endX = toX;
  curve.endY = toY;
  curve.controlX = (fromX + toX) / 2 - (toY - fromY) * bend;
  curve.controlY = (fromY + toY) / 2 + (toX - fromX) * bend;
}

/** The blossom of the quadratic curve: blossom(t, t) is the point at t, and
 *  blossom(a, b) is the control point of the piece between a and b. */
export function blossom(first: number, second: number, isX: boolean): number {
  const start = isX ? curve.startX : curve.startY;
  const control = isX ? curve.controlX : curve.controlY;
  const end = isX ? curve.endX : curve.endY;
  return (
    (1 - first) * (1 - second) * start +
    ((1 - first) * second + first * (1 - second)) * control +
    first * second * end
  );
}

export function tracePiece(
  context: CanvasRenderingContext2D,
  from: number,
  to: number,
) {
  context.beginPath();
  context.moveTo(blossom(from, from, true), blossom(from, from, false));
  context.quadraticCurveTo(
    blossom(from, to, true),
    blossom(from, to, false),
    blossom(to, to, true),
    blossom(to, to, false),
  );
}

export function drawGlow(
  context: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  radius: number,
  alpha: number,
) {
  if (alpha <= 0.003 || radius <= 0) return;
  context.globalAlpha = Math.min(1, alpha);
  context.drawImage(
    sprite,
    centerX - radius,
    centerY - radius,
    radius * 2,
    radius * 2,
  );
}

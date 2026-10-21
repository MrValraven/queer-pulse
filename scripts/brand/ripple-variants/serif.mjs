/** ripple-serif: the traced Fraunces bowl as the Q ring, smaller even copies
 *  of it as the ripples, the P's stem leaving where the serif's tail does. */
import {
  bowlLine,
  crossing,
  isOutsideBowl,
  pointAtDistance,
} from "../logo-geometry.mjs";
import { stressedBowlWidth } from "../thread-variants/profiles.mjs";
import { bowlRipple, layOver, tiltedP } from "./ripples.mjs";

export const SERIF_DEFAULTS = {
  /** The bowl's size against the traced letter's (1 is the trace). */
  bowlScale: 1,
  bowl: { thick: 36, thin: 15 },
  ripples: [
    { scale: 0.5, strokeWidth: 12 },
    { scale: 0.68, strokeWidth: 12 },
  ],
  letterP: {
    landing: { x: 0, y: -6 },
    bowlWidth: 86,
    bowlHeight: 94,
    halfWidth: 20,
    cornerRadius: 12,
  },
  /** Where the stem leaves the bowl: this far along the bowl from the
   *  traced tail's own crossing (negative runs toward three o'clock, which
   *  leans the P further over). */
  exitShift: -36,
  /** How far the stem's tip runs past the bowl's outer edge. */
  tailLength: 44,
  gap: 13,
};

/** The tilt that sends the stem's centre line through `target`. */
function tiltThrough(target, letterOptions) {
  const offsetAt = (tiltDegrees) =>
    tiltedP({ ...letterOptions, tiltDegrees, footDepthFor: () => 10 }).toFrame(
      target,
    ).x;
  let low = 0;
  let high = 80;
  for (let step = 0; step < 40; step++) {
    const middle = (low + high) / 2;
    if (Math.sign(offsetAt(middle)) === Math.sign(offsetAt(low))) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/** How far below its top the stem must run to end `outerReach` past the
 *  bowl's centre line (the bowl's outline grown to that reach; 215 is the
 *  traced bowl's mean radius). */
function footDepthPast(bowlScale, outerReach) {
  return ({ toWorld }) => {
    const grow = bowlScale + outerReach / 215;
    const isPast = (depth) => {
      const point = toWorld({ x: 0, y: depth });
      return isOutsideBowl({ x: point.x / grow, y: point.y / grow });
    };
    let depth = 0;
    while (!isPast(depth)) depth += 1;
    return depth;
  };
}

export function buildSerif(options = SERIF_DEFAULTS) {
  const bowlHalfWidthAt = stressedBowlWidth(options.bowl);
  const waters = [
    bowlRipple(options.bowlScale, { halfWidthAt: bowlHalfWidthAt }),
    ...options.ripples.map((ripple) =>
      bowlRipple(ripple.scale, { strokeWidth: ripple.strokeWidth }),
    ),
  ];
  // The stem leaves the bowl close to where the traced tail crosses it.
  const exitOnTrace = pointAtDistance(
    bowlLine,
    crossing.bowlDistance + options.exitShift,
  );
  const exitThrough = {
    x: exitOnTrace.x * options.bowlScale,
    y: exitOnTrace.y * options.bowlScale,
  };
  const tiltDegrees = tiltThrough(exitThrough, options.letterP);
  const letterP = tiltedP({
    ...options.letterP,
    tiltDegrees,
    footDepthFor: footDepthPast(
      options.bowlScale,
      options.bowl.thick + options.tailLength,
    ),
  });
  if (options.gap > 0) {
    layOver(letterP, waters, {
      gap: options.gap,
      colorways: options.gapColorways,
    });
  }
  return [...waters.flatMap((water) => water.shapes), ...letterP.shapes];
}

/** The small cut: the bowl drawn larger against a heavier P (whose counter
 *  must stay 64 units open), its contrast eased. */
export const SERIF_SMALL = {
  ...SERIF_DEFAULTS,
  bowlScale: 1.42,
  bowl: { thick: 50, thin: 40 },
  ripples: [],
  letterP: {
    landing: { x: 0, y: -6 },
    bowlWidth: 150,
    bowlHeight: 150,
    halfWidth: 37,
    cornerRadius: 20,
  },
  tailLength: 56,
  gap: 0,
};

export const serif = {
  id: "ripple-serif",
  centring: "enclosing",
  build: () => buildSerif(),
  buildSmall: () => buildSerif(SERIF_SMALL),
};

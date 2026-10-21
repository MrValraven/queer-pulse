/** ripple-drop: the sketch drawn faithfully. Broken ripples, the P's stem
 *  as the Q's tail, a coral bead falling after it. */
import {
  brokenRipple,
  layOver,
  tailStub,
  tiltedP,
  tipBead,
  wholeRipple,
} from "./ripples.mjs";

const CENTRE = { x: 0, y: 0 };

export const DROP_DEFAULTS = {
  ring: { radius: 300, strokeWidth: 60 },
  // Breaks sit unevenly and never line up across ripples, as a hand draws
  // them, and keep clear of where the stem crosses (about 65 to 75 degrees).
  ripples: [
    {
      radius: 141,
      strokeWidth: 16,
      breaks: [
        { at: 200, gap: 44 },
        { at: 335, gap: 32 },
      ],
    },
    {
      radius: 184,
      strokeWidth: 16,
      breaks: [
        { at: 15, gap: 34 },
        { at: 160, gap: 40 },
        { at: 268, gap: 54 },
      ],
    },
    {
      radius: 230,
      strokeWidth: 16,
      breaks: [
        { at: 125, gap: 46 },
        { at: 228, gap: 36 },
        { at: 312, gap: 30 },
      ],
    },
  ],
  letterP: {
    landing: CENTRE,
    tiltDegrees: 40,
    bowlWidth: 108,
    bowlHeight: 120,
    halfWidth: 28,
    cornerRadius: 16,
  },
  /** How far the stem's tip runs past the ring's outer edge. */
  tailLength: 58,
  gap: 16,
  bead: { gap: 18, radius: 34 },
  stub: { length: 60, halfWidth: 26 },
};

/** The concentric family: the Q ring, ripples round its centre (whole, or
 *  broken where a ripple lists breaks), the P landing in the middle. */
export function buildConcentric(options) {
  const { ring, ripples, letterP: letterOptions } = options;
  const ringOuter = ring.radius + ring.strokeWidth / 2;
  const waters = [
    wholeRipple(CENTRE, ring.radius, ring.strokeWidth),
    ...ripples.map((ripple) =>
      ripple.breaks
        ? brokenRipple(
            ripple.centre ?? CENTRE,
            ripple.radius,
            ripple.strokeWidth,
            ripple.breaks,
          )
        : wholeRipple(
            ripple.centre ?? CENTRE,
            ripple.radius,
            ripple.strokeWidth,
          ),
    ),
  ];
  const letterP = tiltedP({
    ...letterOptions,
    exitCentre: CENTRE,
    exitRadius: ringOuter + options.tailLength,
  });
  if (options.gap > 0) {
    layOver(letterP, waters, {
      gap: options.gap,
      colorways: options.gapColorways,
    });
  }
  const stub = options.stub
    ? [
        tailStub(letterP, {
          centre: CENTRE,
          fromRadius: ring.radius,
          outerRadius: ringOuter + options.stub.length,
          gap: options.gap,
          halfWidth: options.stub.halfWidth,
        }),
      ]
    : [];
  return [
    ...waters.flatMap((water) => water.shapes),
    ...stub,
    ...letterP.shapes,
    ...(options.bead ? [tipBead(letterP, options.bead)] : []),
  ];
}

/**
 * The small cut every concentric variant shares: the ring and the P only,
 * heavier. The P's counter is 64 units across and stands 64 clear of the
 * ring; the stem joins the ring where it leaves it, so in mono the two run
 * together into a Q with its tail, and in colour the coral lies on top.
 */
export const CONCENTRIC_SMALL = {
  ring: { radius: 262, strokeWidth: 92 },
  ripples: [],
  letterP: {
    landing: CENTRE,
    tiltDegrees: 40,
    bowlWidth: 150,
    bowlHeight: 152,
    halfWidth: 40,
    cornerRadius: 24,
  },
  tailLength: 64,
  gap: 0,
  bead: null,
  stub: null,
};

export const drop = {
  id: "ripple-drop",
  centring: "enclosing",
  build: () => buildConcentric(DROP_DEFAULTS),
  buildSmall: () => buildConcentric(CONCENTRIC_SMALL),
};

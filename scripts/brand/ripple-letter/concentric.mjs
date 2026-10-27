/**
 * The drop family with a real P: the water of ripple-drop (the heavy Q ring
 * and three broken ripples, imported as they are) round a coral P set in a
 * font. A stretched P lands with its bowl on the ripples' centre and its
 * stem runs on out through the ring as the Q's tail, with the coral bead
 * after its tip and the ink stub beside it. An upright P sits in the middle
 * like a monogram, and the Q draws its own tapered ink tail at the lower
 * right.
 *
 * Every water line keeps clear of the P by `gap` all round its outline (a
 * halo), and the halo fills the P's counter too, so the ripples never show
 * through the bowl and the P reads as one clean letter on the water.
 *
 * Letter coordinates as in ripples.mjs: the Q ring's centre is the origin
 * and y runs down. Angles are in degrees, clockwise on screen from three
 * o'clock.
 */
import {
  CONCENTRIC_SMALL,
  DROP_DEFAULTS,
  concentricWaters,
} from "../ripple-variants/drop.mjs";
import {
  pointOnCircle,
  tailStub,
  tipBead,
} from "../ripple-variants/ripples.mjs";
import { outlineShape, strandFrom } from "../thread-variants/strands.mjs";
import { glyphP } from "./glyph-p.mjs";

const CENTRE = { x: 0, y: 0 };
/** How many points along the Q's own tail. */
const TAIL_SAMPLES = 120;

/**
 * The Q's own tail: a tapered ink stroke that leaves the ring low on the
 * right. It starts on the ring's centre line (`fromRadius`) at
 * `angleDegrees`, as wide as the ring, heading `startHeadingDegrees`, and
 * curves round to `endHeadingDegrees` over `length`, thinning to
 * `endHalfWidth` at a round tip. Headings are screen angles like the rest.
 */
export function taperedTail({
  fromRadius,
  angleDegrees,
  startHeadingDegrees,
  endHeadingDegrees,
  length,
  startHalfWidth,
  endHalfWidth,
}) {
  const start = pointOnCircle(CENTRE, fromRadius, angleDegrees);
  // A quadratic whose ends follow the two headings.
  const control = pointOnCircle(start, length / 2, startHeadingDegrees);
  const end = pointOnCircle(control, length / 2, endHeadingDegrees);
  const points = Array.from({ length: TAIL_SAMPLES + 1 }, (_, sampleIndex) => {
    const along = sampleIndex / TAIL_SAMPLES;
    const remaining = 1 - along;
    return {
      x:
        remaining * remaining * start.x +
        2 * remaining * along * control.x +
        along * along * end.x,
      y:
        remaining * remaining * start.y +
        2 * remaining * along * control.y +
        along * along * end.y,
    };
  });
  const strand = strandFrom(points);
  return outlineShape(
    strand,
    {
      halfWidthAt: (distance) =>
        startHalfWidth +
        (endHalfWidth - startHalfWidth) * (distance / strand.total),
      startCap: "flat",
    },
    "ink",
  );
}

/** Gives every shape a halo of the P's outline grown by `gap`. */
export function haloUnder(shapes, letterP, gap, colorways) {
  for (const shape of shapes) {
    shape.halos = [
      ...(shape.halos ?? []),
      { contours: letterP.haloContours, gap, ...(colorways && { colorways }) },
    ];
  }
}

/**
 * The drop family's builder. `letterP` holds the glyph options (see
 * glyphP); a `tailLength` stretches the stem until it ends that far past
 * the ring's outer edge, and without one the P stands as drawn. `bead`,
 * `stub` and `qTail` are each drawn when given.
 */
export function buildDropLetter(options) {
  const { ring, tailLength, gap } = options;
  const ringOuter = ring.radius + ring.strokeWidth / 2;
  const waters = concentricWaters(options);
  const letterP = glyphP({
    ...options.letterP,
    exitCentre: CENTRE,
    exitRadius: tailLength === undefined ? undefined : ringOuter + tailLength,
  });
  const inkShapes = [
    ...waters.flatMap((water) => water.shapes),
    ...(options.stub
      ? [
          tailStub(
            {
              halfWidth: letterP.halfWidth,
              toWorld: letterP.toStemWorld,
              depthAtRadius: letterP.depthAtRadius,
            },
            {
              centre: CENTRE,
              fromRadius: ring.radius,
              outerRadius: ringOuter + options.stub.length,
              gap,
              halfWidth: options.stub.halfWidth,
            },
          ),
        ]
      : []),
    ...(options.qTail ? [taperedTail(options.qTail)] : []),
  ];
  if (gap > 0) haloUnder(inkShapes, letterP, gap, options.gapColorways);
  return [
    ...inkShapes,
    letterP,
    ...(options.bead ? [tipBead(letterP, options.bead)] : []),
  ];
}

/* -------------------------------------------------------------------------- */
/* The variants                                                               */
/* -------------------------------------------------------------------------- */

/** What every drop variant keeps from ripple-drop: its ring and ripples. */
const DROP_WATER = { ring: DROP_DEFAULTS.ring, ripples: DROP_DEFAULTS.ripples };

/** What every small cut keeps from CONCENTRIC_SMALL: the heavier ring
 *  alone, the stem joining it where it leaves it. */
const SMALL_WATER = {
  ring: CONCENTRIC_SMALL.ring,
  ripples: [],
  tailLength: CONCENTRIC_SMALL.tailLength,
  gap: 0,
  bead: null,
  stub: null,
};

export const DROP_FRAUNCES = {
  ...DROP_WATER,
  letterP: {
    glyph: "frauncesRoman900",
    capHeight: 300,
    tiltDegrees: 28,
    landing: { x: 0, y: 8 },
    anchor: "bowlCircle",
  },
  // The stem runs further out than ripple-drop's and the stub stops
  // shorter, so the foot's little spurs keep their gap from the stub.
  tailLength: 80,
  gap: DROP_DEFAULTS.gap,
  bead: DROP_DEFAULTS.bead,
  stub: { ...DROP_DEFAULTS.stub, length: 36 },
};

export const DROP_FRAUNCES_SMALL = {
  ...SMALL_WATER,
  letterP: {
    ...DROP_FRAUNCES.letterP,
    glyph: "frauncesRoman800",
    capHeight: 300,
  },
};

export const DROP_SANS = {
  ...DROP_FRAUNCES,
  letterP: {
    ...DROP_FRAUNCES.letterP,
    glyph: "dmSans1000",
    capHeight: 310,
    tiltDegrees: 30,
    landing: { x: 0, y: -8 },
  },
  // DM Sans has a plain square foot, so ripple-drop's tail and stub fit.
  tailLength: DROP_DEFAULTS.tailLength,
  stub: DROP_DEFAULTS.stub,
};

export const DROP_SANS_SMALL = {
  ...SMALL_WATER,
  letterP: {
    ...DROP_SANS.letterP,
    capHeight: 310,
    landing: { x: 10, y: -10 },
  },
};

export const DROP_UPRIGHT = {
  ...DROP_WATER,
  letterP: {
    glyph: "frauncesSoft900",
    capHeight: 300,
    landing: CENTRE,
    anchor: "letterCircle",
  },
  gap: DROP_DEFAULTS.gap,
  // The monogram reads whole with the Q's own tail, so the bead stays
  // out: a coral dot beside a coral letter would split the eye.
  bead: null,
  stub: null,
  qTail: {
    fromRadius: DROP_DEFAULTS.ring.radius,
    angleDegrees: 62,
    startHeadingDegrees: 72,
    endHeadingDegrees: 8,
    length: 190,
    startHalfWidth: DROP_DEFAULTS.ring.strokeWidth / 2,
    endHalfWidth: 16,
  },
};

export const DROP_UPRIGHT_SMALL = {
  ...SMALL_WATER,
  tailLength: undefined,
  letterP: {
    ...DROP_UPRIGHT.letterP,
    glyph: "frauncesSoft700",
    capHeight: 260,
  },
  qTail: {
    ...DROP_UPRIGHT.qTail,
    fromRadius: CONCENTRIC_SMALL.ring.radius,
    length: 170,
    startHalfWidth: CONCENTRIC_SMALL.ring.strokeWidth / 2,
    endHalfWidth: 34,
  },
};

export const dropFraunces = {
  id: "ripple-letter-drop-fraunces",
  centring: "enclosing",
  build: () => buildDropLetter(DROP_FRAUNCES),
  buildSmall: () => buildDropLetter(DROP_FRAUNCES_SMALL),
};

export const dropSans = {
  id: "ripple-letter-drop-sans",
  centring: "enclosing",
  build: () => buildDropLetter(DROP_SANS),
  buildSmall: () => buildDropLetter(DROP_SANS_SMALL),
};

export const dropUpright = {
  id: "ripple-letter-drop-upright",
  centring: "enclosing",
  build: () => buildDropLetter(DROP_UPRIGHT),
  buildSmall: () => buildDropLetter(DROP_UPRIGHT_SMALL),
};

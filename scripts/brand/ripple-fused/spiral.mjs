/**
 * ripple-fused-spiral: the P and the Q as one stroke. The line starts at
 * the top of the P's stem, runs down it, loops once round the P's round
 * bowl (back onto the stem, as a geometric p's bowl meets its stem), carries
 * on down the stem, swings into one turn round the Q, turning the same way
 * as the bowl did, and peels away as the tail.
 */
import {
  outlineShape,
  smoothStep,
  strandBetween,
  strandFrom,
} from "../thread-variants/strands.mjs";
import { tiltForExit, turnBy } from "./fused.mjs";

const RADIANS_PER_DEGREE = Math.PI / 180;
/** How far apart the centre line's points sit. */
const PATH_STEP = 3;

export const SPIRAL_DEFAULTS = {
  ringRadius: 300,
  bowlRadius: 92,
  stemRise: 120,
  /** Where the stem's line would cross the Q ring. */
  exitDegrees: 62,
  /** The bend from the stem into the Q ring, and from the ring out into
   *  the tail. */
  entryRadius: 50,
  peelRadius: 200,
  /** Where the line leaves the ring for the tail, and how it heads out. */
  peelDegrees: 92,
  tailHeadingDegrees: 15,
  tailLength: 70,
  /** Half widths: the P's, and the Q's (the line eases from one to the
   *  other through the bend into the ring). */
  letterHalfWidth: 28,
  ringHalfWidth: 31,
  /** Where the coral P hands over to the ink Q, as a distance back from the
   *  start of the bend into the ring. */
  colourSwitchBack: 0,
};

/** The small cut: one heavier line, its bowl's counter and every gap at
 *  least 64 units. */
export const SPIRAL_SMALL = {
  ...SPIRAL_DEFAULTS,
  bowlRadius: 98,
  stemRise: 104,
  exitDegrees: 55,
  entryRadius: 72,
  // A wider opening, and a tail that heads more steeply down, so the tail
  // and the stem stay 64 units apart.
  peelDegrees: 100,
  peelRadius: 90,
  tailHeadingDegrees: 35,
  tailLength: 76,
  letterHalfWidth: 40,
  ringHalfWidth: 46,
};

function arcPoints(centre, radius, fromDegrees, toDegrees) {
  const sweep = toDegrees - fromDegrees;
  const count = Math.max(
    2,
    Math.ceil((Math.abs(sweep) * RADIANS_PER_DEGREE * radius) / PATH_STEP),
  );
  return Array.from({ length: count + 1 }, (_, pointIndex) => {
    const angle =
      (fromDegrees + (sweep * pointIndex) / count) * RADIANS_PER_DEGREE;
    return {
      x: centre.x + radius * Math.cos(angle),
      y: centre.y + radius * Math.sin(angle),
    };
  });
}

function linePoints(from, to) {
  const count = Math.max(
    2,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / PATH_STEP),
  );
  return Array.from({ length: count + 1 }, (_, pointIndex) => ({
    x: from.x + ((to.x - from.x) * pointIndex) / count,
    y: from.y + ((to.y - from.y) * pointIndex) / count,
  }));
}

function angleOf(vector) {
  return Math.atan2(vector.y, vector.x) / RADIANS_PER_DEGREE;
}

/** Degrees from `from` down to `to`, between 0 and 360. */
function sweepDown(from, to) {
  return (((from - to) % 360) + 360) % 360;
}

/** Degrees from `from` up to `to`, between 0 and 360. */
function sweepUp(from, to) {
  return sweepDown(to, from);
}

/** The whole centre line, in pieces, each piece's points in order. */
export function spiralPieces(options) {
  const {
    ringRadius,
    bowlRadius,
    stemRise,
    entryRadius,
    peelRadius,
    peelDegrees,
    tailHeadingDegrees,
    tailLength,
  } = options;
  const tiltDegrees = tiltForExit({
    radius: ringRadius,
    bowlRadius,
    exitDegrees: options.exitDegrees,
  });
  const turn = turnBy(tiltDegrees);
  const direction = turn({ x: 0, y: 1 });
  const bowlSide = turn({ x: 1, y: 0 });
  const stemTop = turn({ x: -bowlRadius, y: -stemRise });
  const touch = turn({ x: -bowlRadius, y: 0 });

  // The bend into the ring: a circle of `entryRadius` touching the stem on
  // the bowl's side and the ring from inside.
  const offsetStart = {
    x: touch.x + bowlSide.x * entryRadius,
    y: touch.y + bowlSide.y * entryRadius,
  };
  const along = offsetStart.x * direction.x + offsetStart.y * direction.y;
  const reach = ringRadius - entryRadius;
  const travel =
    -along +
    Math.sqrt(
      along * along - (offsetStart.x ** 2 + offsetStart.y ** 2) + reach * reach,
    );
  const bendStart = {
    x: touch.x + direction.x * travel,
    y: touch.y + direction.y * travel,
  };
  const entryCentre = {
    x: offsetStart.x + direction.x * travel,
    y: offsetStart.y + direction.y * travel,
  };
  const entryAngle = angleOf(entryCentre);
  const bendFromDegrees = angleOf({
    x: bendStart.x - entryCentre.x,
    y: bendStart.y - entryCentre.y,
  });

  // The peel out of the ring: a circle of `peelRadius` touching the ring
  // from outside at `peelDegrees`, followed until the line heads out along
  // `tailHeadingDegrees`.
  const peelCentre = {
    x: (ringRadius + peelRadius) * Math.cos(peelDegrees * RADIANS_PER_DEGREE),
    y: (ringRadius + peelRadius) * Math.sin(peelDegrees * RADIANS_PER_DEGREE),
  };
  // Round that circle the line turns outward (clockwise on screen), and
  // heads along `tailHeadingDegrees` once it reaches 90 degrees short of it.
  const peelFromDegrees = peelDegrees + 180;
  const peelEndDegrees =
    peelFromDegrees + sweepUp(peelFromDegrees, tailHeadingDegrees - 90);
  const peelEnd = {
    x:
      peelCentre.x + peelRadius * Math.cos(peelEndDegrees * RADIANS_PER_DEGREE),
    y:
      peelCentre.y + peelRadius * Math.sin(peelEndDegrees * RADIANS_PER_DEGREE),
  };
  const tailHeading = tailHeadingDegrees * RADIANS_PER_DEGREE;
  const tip = {
    x: peelEnd.x + Math.cos(tailHeading) * tailLength,
    y: peelEnd.y + Math.sin(tailHeading) * tailLength,
  };

  const bowlCentre = { x: 0, y: 0 };
  return {
    letter: [
      ...linePoints(stemTop, touch),
      // Round the bowl the way a downstroke turns into it: from the stem
      // side, under, up the far side and over, back onto the stem.
      ...arcPoints(
        bowlCentre,
        bowlRadius,
        angleOf(touch),
        angleOf(touch) - 360,
      ).slice(1),
      ...linePoints(touch, bendStart).slice(1),
    ],
    ring: [
      ...arcPoints(
        entryCentre,
        entryRadius,
        bendFromDegrees,
        bendFromDegrees - sweepDown(bendFromDegrees, entryAngle),
      ).slice(1),
      ...arcPoints(
        bowlCentre,
        ringRadius,
        entryAngle,
        entryAngle - sweepDown(entryAngle, peelDegrees),
      ).slice(1),
      ...arcPoints(
        peelCentre,
        peelRadius,
        peelFromDegrees,
        peelEndDegrees,
      ).slice(1),
      ...linePoints(peelEnd, tip).slice(1),
    ],
  };
}

export function buildSpiral(options = SPIRAL_DEFAULTS) {
  const pieces = spiralPieces(options);
  const line = strandFrom([...pieces.letter, ...pieces.ring]);
  const switchDistance =
    strandFrom(pieces.letter).total - options.colourSwitchBack;
  const bendLength = Math.PI * options.entryRadius * 0.5;
  const halfWidthAt = (distance) =>
    options.letterHalfWidth +
    (options.ringHalfWidth - options.letterHalfWidth) *
      smoothStep((distance - switchDistance) / bendLength);
  const letterPart = strandBetween(line, 0, switchDistance);
  const ringPart = strandBetween(line, switchDistance, line.total);
  return [
    outlineShape(letterPart, { halfWidthAt, endCap: "flat" }, "accent", {
      colorways: ["plum", "cream"],
    }),
    outlineShape(
      ringPart,
      {
        halfWidthAt: (distance) => halfWidthAt(distance + switchDistance),
        startCap: "flat",
      },
      "ink",
      { colorways: ["plum", "cream"] },
    ),
    outlineShape(line, { halfWidthAt }, "ink", { colorways: ["mono"] }),
  ];
}

export const fusedSpiral = {
  id: "ripple-fused-spiral",
  centring: "enclosing",
  build: () => buildSpiral(),
  buildSmall: () => buildSpiral(SPIRAL_SMALL),
};

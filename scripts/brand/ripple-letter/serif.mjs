/**
 * The serif family with a real P: the water of ripple-serif (the traced
 * Fraunces bowl swelling with the serif's stress, and two even ripples,
 * imported as they are) round a coral Fraunces P. In serif-fraunces the
 * stretched P leans so its stem's centre line passes where the traced tail
 * crosses the bowl and runs on out through it as the Q's tail. In
 * serif-soft and serif-italic an upright P sits inside the bowl like a
 * monogram (a heavy, rounded soft P, or a slanted italic one), and the Q
 * draws its own traced Fraunces tail, starting inside the bowl's stroke.
 *
 * Every water line keeps clear of the P by `gap` all round its outline, as
 * in the drop family (concentric.mjs).
 *
 * Letter coordinates as in ripples.mjs: the bowl's centre is the origin and
 * y runs down.
 */
import { bowlLine, crossing, pointAtDistance } from "../logo-geometry.mjs";
import {
  SERIF_DEFAULTS,
  SERIF_SMALL,
  footDepthPast,
  serifWaters,
} from "../ripple-variants/serif.mjs";
import { swellingTailWidth } from "../thread-variants/profiles.mjs";
import {
  outlineShape,
  strandBetween,
  strandFrom,
  tailStrand,
} from "../thread-variants/strands.mjs";
import { haloUnder } from "./concentric.mjs";
import { glyphP, tiltThrough } from "./glyph-p.mjs";

/**
 * The Q's traced tail, from `from` along the trace to its tip, swelling as
 * in thread-swell, grown with the bowl by `bowlScale`. `lengthScale` (1
 * when left out) draws it shorter or longer about where it crosses the
 * bowl, so it still leaves the bowl at the same point.
 */
function tracedTail({ from, width, lengthScale = 1 }, bowlScale) {
  const traced = strandBetween(tailStrand, from, tailStrand.total);
  const tail = strandFrom(
    traced.points.map((point) => ({
      x:
        (crossing.point.x + (point.x - crossing.point.x) * lengthScale) *
        bowlScale,
      y:
        (crossing.point.y + (point.y - crossing.point.y) * lengthScale) *
        bowlScale,
    })),
  );
  return outlineShape(
    tail,
    { halfWidthAt: swellingTailWidth({ ...width, length: tail.total }) },
    "ink",
  );
}

/**
 * The serif family's builder. With a `tailLength` the P is stretched and
 * tilted so its stem leaves the bowl `exitShift` along the bowl from the
 * traced tail's crossing and ends `tailLength` past the bowl's outer edge;
 * without one it stands upright as drawn. `qTail` draws the traced tail.
 */
export function buildSerifLetter(options) {
  const { bowlScale, tailLength, gap } = options;
  const waters = serifWaters(options);
  let letterOptions = options.letterP;
  if (tailLength !== undefined) {
    const exitOnTrace = pointAtDistance(
      bowlLine,
      crossing.bowlDistance + options.exitShift,
    );
    const exitThrough = {
      x: exitOnTrace.x * bowlScale,
      y: exitOnTrace.y * bowlScale,
    };
    letterOptions = {
      ...letterOptions,
      tiltDegrees: tiltThrough(exitThrough, letterOptions),
      footDepthFor: footDepthPast(bowlScale, options.bowl.thick + tailLength),
    };
  }
  const letterP = glyphP(letterOptions);
  const inkShapes = [
    ...waters.flatMap((water) => water.shapes),
    ...(options.qTail ? [tracedTail(options.qTail, bowlScale)] : []),
  ];
  if (gap > 0) haloUnder(inkShapes, letterP, gap, options.gapColorways);
  return [...inkShapes, letterP];
}

/* -------------------------------------------------------------------------- */
/* The variants                                                               */
/* -------------------------------------------------------------------------- */

/** What every serif variant keeps from ripple-serif: its bowl and ripples. */
const SERIF_WATER = {
  bowlScale: SERIF_DEFAULTS.bowlScale,
  bowl: SERIF_DEFAULTS.bowl,
  ripples: SERIF_DEFAULTS.ripples,
};

/** What every small cut keeps from SERIF_SMALL: the larger bowl with its
 *  contrast eased, alone, the stem joining it where it leaves it. */
const SMALL_WATER = {
  bowlScale: SERIF_SMALL.bowlScale,
  bowl: SERIF_SMALL.bowl,
  ripples: [],
  exitShift: SERIF_SMALL.exitShift,
  tailLength: SERIF_SMALL.tailLength,
  gap: 0,
};

/** The traced tail starts where it crosses the bowl, so its start stays
 *  hidden inside the bowl's stroke. */
const TAIL_FROM = crossing.tailDistance;

export const SERIF_FRAUNCES = {
  ...SERIF_WATER,
  letterP: {
    glyph: "frauncesRoman900",
    capHeight: 230,
    landing: { x: 30, y: 20 },
  },
  exitShift: 0,
  tailLength: SERIF_DEFAULTS.tailLength,
  gap: SERIF_DEFAULTS.gap,
};

export const SERIF_FRAUNCES_SMALL = {
  ...SMALL_WATER,
  exitShift: 0,
  letterP: {
    ...SERIF_FRAUNCES.letterP,
    glyph: "frauncesRoman700",
    capHeight: 300,
    landing: { x: 25, y: -10 },
  },
};

export const SERIF_SOFT = {
  ...SERIF_WATER,
  letterP: {
    glyph: "frauncesSoft900",
    capHeight: 215,
    landing: { x: -10, y: -25 },
    anchor: "letterCircle",
  },
  tailLength: undefined,
  gap: SERIF_DEFAULTS.gap,
  qTail: {
    from: TAIL_FROM,
    width: { start: 15, peak: 30, end: 15, peakAt: 0.62 },
  },
};

export const SERIF_SOFT_SMALL = {
  ...SMALL_WATER,
  tailLength: undefined,
  // The heaviest soft P that keeps its counter and its gap to the bowl
  // both 64 units open sits between two named weights.
  letterP: {
    ...SERIF_SOFT.letterP,
    glyph: "frauncesSoft650",
    capHeight: 285,
    landing: { x: -25, y: -25 },
  },
  // The tail drawn a little shorter, so the whole mark can grow.
  qTail: {
    from: TAIL_FROM,
    width: { start: 30, peak: 44, end: 30, peakAt: 0.6 },
    lengthScale: 0.8,
  },
};

export const SERIF_ITALIC = {
  ...SERIF_WATER,
  letterP: {
    glyph: "frauncesItalic800",
    capHeight: 205,
    landing: { x: -10, y: -25 },
    anchor: "letterCircle",
  },
  tailLength: undefined,
  gap: SERIF_DEFAULTS.gap,
  qTail: {
    from: TAIL_FROM,
    width: { start: 15, peak: 30, end: 15, peakAt: 0.62 },
  },
};

export const SERIF_ITALIC_SMALL = {
  ...SMALL_WATER,
  tailLength: undefined,
  // An exception to the 64-unit rule: an italic P is wide for the bowl's
  // left lean, and the lighter weight that keeps every gap at 64 turns
  // faint at 24px. Legibility of the P at 24px won over the gap, so this
  // cut keeps the 700 weight with its gap to the bowl and its counter at
  // about 57 units.
  letterP: {
    ...SERIF_ITALIC.letterP,
    glyph: "frauncesItalic700",
    capHeight: 250,
    landing: { x: -10, y: -10 },
  },
  // The tail drawn a little shorter, so the whole mark can grow.
  qTail: {
    from: TAIL_FROM,
    width: { start: 30, peak: 44, end: 30, peakAt: 0.6 },
    lengthScale: 0.8,
  },
};

export const serifFraunces = {
  id: "ripple-letter-serif-fraunces",
  centring: "enclosing",
  build: () => buildSerifLetter(SERIF_FRAUNCES),
  buildSmall: () => buildSerifLetter(SERIF_FRAUNCES_SMALL),
};

export const serifSoft = {
  id: "ripple-letter-serif-soft",
  centring: "enclosing",
  build: () => buildSerifLetter(SERIF_SOFT),
  buildSmall: () => buildSerifLetter(SERIF_SOFT_SMALL),
};

export const serifItalic = {
  id: "ripple-letter-serif-italic",
  centring: "enclosing",
  build: () => buildSerifLetter(SERIF_ITALIC),
  buildSmall: () => buildSerifLetter(SERIF_ITALIC_SMALL),
};

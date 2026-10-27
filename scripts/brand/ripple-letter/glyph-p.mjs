/**
 * A real P from a font, placed in the water. The frozen outline from
 * glyphs.mjs is scaled to a cap height and turned upside up into letter
 * coordinates (the Q's centre at the origin, y running down, as in
 * ripples.mjs). Its stem can then be stretched: every point below a
 * threshold on the straight run of the stem, between where the bowl joins
 * the stem and the baseline, moves down by one computed length, so the
 * stem's foot ends `tailLength` past the Q's outer edge and the stem becomes
 * the Q's tail. The letter is turned by a tilt about the middle of its bowl
 * and that middle lands on the landing point.
 *
 * The quadratic outline is flattened to points about PATH_STEP apart, and a
 * point where the outline turns sharply is marked `isCorner`, so the SVG
 * writer keeps the glyph's corners crisp and its curves smooth.
 *
 * Inside the P's own frame (scaled, upright, before the tilt) x runs right
 * from the glyph's origin and y runs down, with the cap top at
 * -capHeight and the baseline at 0.
 */
import { enclosingCentre } from "../logo-geometry.mjs";
import { GLYPHS } from "./glyphs.mjs";

const RADIANS_PER_DEGREE = Math.PI / 180;
/** How far apart the flattened outline's points sit, in letter units. */
const PATH_STEP = 3;
/** An on-curve point whose two tangents part by more than this is a corner. */
const CORNER_DEGREES = 20;
/** Where the stem is first found: this fraction of the cap height above
 *  the baseline, below the bowl. */
const STEM_PROBE_HEIGHT = 0.2;
/** Where the stretch starts by default, and where the stem is measured:
 *  this far from the bowl's lowest point toward the baseline, on the
 *  straight run of stem above any flare into a foot serif. */
const DEFAULT_STRETCH_AT = 0.2;
/** A crossing edge leaning further than this off vertical is no straight
 *  stem, so stretching across it would bend a curve. */
const STRAIGHT_STEM_SLOPE = 0.08;
/** The tilt search range, in degrees. */
const TILT_SEARCH = { low: -20, high: 80, steps: 48 };

/* -------------------------------------------------------------------------- */
/* Reading and flattening the outline                                         */
/* -------------------------------------------------------------------------- */

/** A frozen contour as frame points, each knowing if it lies on the curve,
 *  with the implied on-curve points between two off-curve ones filled in. */
function framePoints(triples, scale) {
  const points = [];
  for (let tripleIndex = 0; tripleIndex < triples.length; tripleIndex += 3) {
    points.push({
      x: triples[tripleIndex] * scale,
      y: -triples[tripleIndex + 1] * scale,
      isOnCurve: triples[tripleIndex + 2] === 1,
    });
  }
  const filled = points.flatMap((point, pointIndex) => {
    const next = points[(pointIndex + 1) % points.length];
    if (point.isOnCurve || next.isOnCurve) return [point];
    return [
      point,
      { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2, isOnCurve: true },
    ];
  });
  const firstOnCurve = filled.findIndex((point) => point.isOnCurve);
  return [...filled.slice(firstOnCurve), ...filled.slice(0, firstOnCurve)];
}

function angleBetween(first, second) {
  const cosine =
    (first.x * second.x + first.y * second.y) /
    (Math.hypot(first.x, first.y) * Math.hypot(second.x, second.y) || 1);
  return Math.acos(Math.min(1, Math.max(-1, cosine))) / RADIANS_PER_DEGREE;
}

/** The outline as points along it: lines keep their two ends (filled in
 *  later), quadratics are sampled about PATH_STEP apart. */
function flatten(controlPoints) {
  const count = controlPoints.length;
  const at = (pointIndex) => controlPoints[(pointIndex + count) % count];
  const outline = [];
  for (let pointIndex = 0; pointIndex < count; pointIndex++) {
    const point = at(pointIndex);
    if (!point.isOnCurve) continue;
    const incoming = {
      x: point.x - at(pointIndex - 1).x,
      y: point.y - at(pointIndex - 1).y,
    };
    const outgoing = {
      x: at(pointIndex + 1).x - point.x,
      y: at(pointIndex + 1).y - point.y,
    };
    outline.push({
      x: point.x,
      y: point.y,
      isCorner: angleBetween(incoming, outgoing) > CORNER_DEGREES,
    });
    const control = at(pointIndex + 1);
    if (control.isOnCurve) continue;
    const end = at(pointIndex + 2);
    const roughLength =
      Math.hypot(control.x - point.x, control.y - point.y) +
      Math.hypot(end.x - control.x, end.y - control.y);
    const samples = Math.max(2, Math.ceil(roughLength / PATH_STEP));
    for (let sampleIndex = 1; sampleIndex < samples; sampleIndex++) {
      const along = sampleIndex / samples;
      const remaining = 1 - along;
      outline.push({
        x:
          remaining * remaining * point.x +
          2 * remaining * along * control.x +
          along * along * end.x,
        y:
          remaining * remaining * point.y +
          2 * remaining * along * control.y +
          along * along * end.y,
        isCorner: false,
      });
    }
  }
  return outline.filter((point, pointIndex) => {
    const previous =
      outline[(pointIndex - 1 + outline.length) % outline.length];
    return Math.hypot(point.x - previous.x, point.y - previous.y) > 0.01;
  });
}

/** Adds a point wherever the outline crosses y = `threshold`, so the
 *  stretch splits the outline exactly there. */
function splitAt(outline, threshold) {
  return outline.flatMap((point, pointIndex) => {
    const next = outline[(pointIndex + 1) % outline.length];
    const isCrossing =
      (point.y - threshold) * (next.y - threshold) < 0 && next.y !== point.y;
    if (!isCrossing) return [point];
    const along = (threshold - point.y) / (next.y - point.y);
    const slope = Math.abs((next.x - point.x) / (next.y - point.y));
    if (slope > STRAIGHT_STEM_SLOPE) {
      throw new Error(
        `The stretch line at y ${threshold.toFixed(1)} crosses a curve (slope ${slope.toFixed(2)}), so stretching there would bend it; move stretchAt onto the straight stem`,
      );
    }
    return [
      point,
      {
        x: point.x + (next.x - point.x) * along,
        y: threshold,
        isCorner: false,
      },
    ];
  });
}

/** Fills long straight runs with points about PATH_STEP apart. */
function fillIn(outline) {
  return outline.flatMap((point, pointIndex) => {
    const next = outline[(pointIndex + 1) % outline.length];
    const count = Math.ceil(
      Math.hypot(next.x - point.x, next.y - point.y) / PATH_STEP,
    );
    return [
      point,
      ...Array.from({ length: Math.max(0, count - 1) }, (_, fillIndex) => ({
        x: point.x + ((next.x - point.x) * (fillIndex + 1)) / count,
        y: point.y + ((next.y - point.y) * (fillIndex + 1)) / count,
        isCorner: false,
      })),
    ];
  });
}

/** Where a horizontal line crosses the outline, left to right. */
function crossingsAtHeight(outlines, height) {
  return outlines
    .flatMap((outline) =>
      outline.flatMap((point, pointIndex) => {
        const next = outline[(pointIndex + 1) % outline.length];
        if ((point.y - height) * (next.y - height) >= 0) return [];
        return [
          point.x +
            ((next.x - point.x) * (height - point.y)) / (next.y - point.y),
        ];
      }),
    )
    .sort((first, second) => first - second);
}

/** The convex hull of some points (monotone chain), as a contour. */
function convexHull(points) {
  const sorted = [...points].sort(
    (first, second) => first.x - second.x || first.y - second.y,
  );
  const turn = (origin, first, second) =>
    (first.x - origin.x) * (second.y - origin.y) -
    (first.y - origin.y) * (second.x - origin.x);
  const half = (ordered) => {
    const chain = [];
    for (const point of ordered) {
      while (
        chain.length >= 2 &&
        turn(chain[chain.length - 2], chain[chain.length - 1], point) <= 0
      ) {
        chain.pop();
      }
      chain.push(point);
    }
    return chain.slice(0, -1);
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

/* -------------------------------------------------------------------------- */
/* Measuring the letter                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The landmarks of an upright, unstretched P in its frame: its cap top and
 * baseline, the bowl's lowest and rightmost points, the bowl's middle, the
 * stretch line (`stretchAt` of the way from the bowl's lowest point to the
 * baseline) and the stem's two edges measured on it.
 */
function measure(outlines, stretchAt) {
  const points = outlines.flat();
  const top = Math.min(...points.map((point) => point.y));
  const baseline = Math.max(...points.map((point) => point.y));
  const capHeight = baseline - top;
  const probeHeight = baseline - capHeight * STEM_PROBE_HEIGHT;
  const [, probeRight] = crossingsAtHeight(outlines, probeHeight);
  const bowlPoints = points.filter(
    (point) => point.x > probeRight + 2 && point.y < probeHeight,
  );
  const bowlBottom = Math.max(...bowlPoints.map((point) => point.y));
  const bowlRight = Math.max(...bowlPoints.map((point) => point.x));
  const stretchLine = bowlBottom + (baseline - bowlBottom) * stretchAt;
  const [stemLeft, stemRight] = crossingsAtHeight(outlines, stretchLine);
  const boundsLeft = Math.min(...points.map((point) => point.x));
  const boundsRight = Math.max(...points.map((point) => point.x));
  return {
    top,
    baseline,
    stemLeft,
    stemRight,
    stemCentre: (stemLeft + stemRight) / 2,
    stemHalfWidth: (stemRight - stemLeft) / 2,
    bowlBottom,
    bowlRight,
    stretchLine,
    bowlMiddle: { x: (stemLeft + bowlRight) / 2, y: (top + bowlBottom) / 2 },
    boundsMiddle: {
      x: (boundsLeft + boundsRight) / 2,
      y: (top + baseline) / 2,
    },
    bowlCircleMiddle: enclosingCentre(
      points
        .filter((point) => point.y <= bowlBottom)
        .map((point) => ({ ...point, pad: 0 })),
    ),
    letterCircleMiddle: enclosingCentre(
      points.map((point) => ({ ...point, pad: 0 })),
    ),
  };
}

/**
 * Throws unless nonzero fill leaves the bowl's counter open: some Fraunces
 * outlines are one contour that laps itself where the bowl meets the stem,
 * and the counter must still wind to 0. The counter is probed midway up the
 * bowl, between the stem's inner edge and the bowl's inner edge.
 */
function assertCounterOpen(glyphKey, outlines, landmarks) {
  const height = (landmarks.top + landmarks.bowlBottom) / 2;
  const edges = crossingsAtHeight(outlines, height);
  const probe = { x: (edges[1] + edges[2]) / 2, y: height };
  if (edges.length < 4 || windingAt(outlines, probe) !== 0) {
    throw new Error(
      `${glyphKey} fills its own counter under nonzero fill (${edges.length} edges across the bowl), so the P would read as a solid blob`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Placing the letter                                                         */
/* -------------------------------------------------------------------------- */

/** The frame-to-world helpers for a P turned by `tiltDegrees` about `pivot`
 *  (a frame point) with the pivot landing on `landing`. */
function framing(tiltDegrees, pivot, landing) {
  const tilt = tiltDegrees * RADIANS_PER_DEGREE;
  const toWorld = ({ x, y }) => {
    const alongX = x - pivot.x;
    const alongY = y - pivot.y;
    return {
      x: landing.x + alongX * Math.cos(tilt) + alongY * Math.sin(tilt),
      y: landing.y - alongX * Math.sin(tilt) + alongY * Math.cos(tilt),
    };
  };
  const toFrame = ({ x, y }) => {
    const alongX = x - landing.x;
    const alongY = y - landing.y;
    return {
      x: pivot.x + alongX * Math.cos(tilt) - alongY * Math.sin(tilt),
      y: pivot.y + alongX * Math.sin(tilt) + alongY * Math.cos(tilt),
    };
  };
  return {
    toWorld,
    toFrame,
    direction: { x: Math.sin(tilt), y: Math.cos(tilt) },
  };
}

/** The glyph's outlines, upright in its frame at this cap height. */
function uprightOutlines(glyphKey, capHeight) {
  const glyph = GLYPHS[glyphKey];
  if (!glyph) throw new Error(`No frozen glyph named ${glyphKey}`);
  const unscaled = glyph.contours.map((triples) =>
    flatten(framePoints(triples, 1)),
  );
  const fontCapHeight = Math.max(...unscaled.flat().map((point) => -point.y));
  const scale = capHeight / fontCapHeight;
  return glyph.contours.map((triples) => flatten(framePoints(triples, scale)));
}

/**
 * The tilt that sends the stem's centre line through `target`, for a P
 * placed with these options (the stretch does not move the stem's line).
 */
export function tiltThrough(
  target,
  { glyph, capHeight, landing, anchor, stretchAt = DEFAULT_STRETCH_AT },
) {
  const landmarks = measure(uprightOutlines(glyph, capHeight), stretchAt);
  const pivot = anchorPoint(landmarks, anchor);
  const offsetAt = (tiltDegrees) =>
    framing(tiltDegrees, pivot, landing).toFrame(target).x -
    landmarks.stemCentre;
  let { low, high } = TILT_SEARCH;
  if (Math.sign(offsetAt(low)) === Math.sign(offsetAt(high))) {
    throw new Error(
      `No tilt between ${low} and ${high} degrees sends the stem through (${target.x.toFixed(1)}, ${target.y.toFixed(1)})`,
    );
  }
  for (let step = 0; step < TILT_SEARCH.steps; step++) {
    const middle = (low + high) / 2;
    if (Math.sign(offsetAt(middle)) === Math.sign(offsetAt(low))) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

/** The frame point an anchor names. */
function anchorPoint(landmarks, anchor = "bowl") {
  const named = {
    bowl: landmarks.bowlMiddle,
    bounds: landmarks.boundsMiddle,
    bowlCircle: landmarks.bowlCircleMiddle,
    letterCircle: landmarks.letterCircleMiddle,
  };
  return named[anchor] ?? anchor;
}

/**
 * The glyph as a coral outline shape in letter coordinates.
 *
 * Options: `glyph` (a key of GLYPHS), `capHeight`, `tiltDegrees`,
 * `landing` (where the anchor lands), `anchor` ("bowl" for the middle of
 * the bowl's box, "bounds" for the middle of the letter's box,
 * "bowlCircle" or "letterCircle" for the centre of the smallest circle
 * round the bowl or the whole letter, or a frame point),
 * and for a stretched stem `exitCentre` and `exitRadius` (the stem ends that
 * far from that centre) or `footDepthFor` (gets `toStemWorld` and
 * `depthAtRadius`, returns how far below the cap top the stem's foot ends,
 * as in tiltedP). `stretchAt` moves the stretch line between the bowl's
 * lowest point (0) and the baseline (1).
 *
 * Returns the shape plus `tip` (the foot's middle), `direction` (down the
 * stem), `halfWidth` (the stem's), `toWorld` and `toFrame`, `landmarks`, and
 * `haloContours` (the outline with the bowl's counter filled in, for a halo
 * that clears the whole letter).
 */
export function glyphP({
  glyph,
  capHeight,
  tiltDegrees = 0,
  landing = { x: 0, y: 0 },
  anchor = "bowl",
  exitCentre = { x: 0, y: 0 },
  exitRadius,
  footDepthFor,
  stretchAt = DEFAULT_STRETCH_AT,
}) {
  const upright = uprightOutlines(glyph, capHeight);
  const landmarks = measure(upright, stretchAt);
  assertCounterOpen(glyph, upright, landmarks);
  const pivot = anchorPoint(landmarks, anchor);
  const { toWorld, toFrame, direction } = framing(tiltDegrees, pivot, landing);

  /** The stem's own frame: x = 0 on its centre line, y = 0 at the cap top. */
  const toStemWorld = ({ x, y }) =>
    toWorld({ x: landmarks.stemCentre + x, y: landmarks.top + y });
  /** How far down the stem's line x = `offset` a point sits `radius` from
   *  `centre`, on the foot's side. */
  const depthAtRadius = (offset, centre, radius) => {
    const start = toStemWorld({ x: offset, y: 0 });
    const fromCentre = { x: start.x - centre.x, y: start.y - centre.y };
    const along = fromCentre.x * direction.x + fromCentre.y * direction.y;
    const squared = fromCentre.x ** 2 + fromCentre.y ** 2 - radius ** 2;
    return -along + Math.sqrt(along * along - squared);
  };

  const isStretched = Boolean(footDepthFor) || exitRadius !== undefined;
  const footDepth = footDepthFor
    ? footDepthFor({ toWorld: toStemWorld, depthAtRadius })
    : isStretched
      ? depthAtRadius(0, exitCentre, exitRadius)
      : landmarks.baseline - landmarks.top;
  const stretch = footDepth - (landmarks.baseline - landmarks.top);
  if (stretch < -0.5) {
    throw new Error(
      `${glyph} at cap height ${capHeight} already reaches ${(-stretch).toFixed(1)} past its tail end, so its stem cannot stretch there; lower the cap height or lengthen the tail`,
    );
  }
  const threshold = landmarks.stretchLine;
  const stretched = upright.map((outline) =>
    fillIn(
      (stretch > 0 ? splitAt(outline, threshold) : outline).map((point) =>
        point.y > threshold ? { ...point, y: point.y + stretch } : point,
      ),
    ),
  );
  const toWorldPoint = (point) => ({
    ...toWorld(point),
    isCorner: point.isCorner,
  });
  const contours = stretched.map((outline) => outline.map(toWorldPoint));
  // The hull winds the same way as the letter's outer contour, so the two
  // add up under nonzero fill and the counter fills in. Every hull point is
  // a corner, so its edges stay straight lines inside the letter.
  const hull = convexHull(
    upright.flat().filter((point) => point.y <= landmarks.bowlBottom),
  ).map((point) => ({ ...toWorld(point), isCorner: true }));
  const outerArea = contours
    .map(signedArea)
    .reduce((largest, area) =>
      Math.abs(area) > Math.abs(largest) ? area : largest,
    );
  const bowlHull =
    Math.sign(signedArea(hull)) === Math.sign(outerArea)
      ? hull
      : hull.reverse();
  return {
    kind: "outline",
    contours,
    tone: "accent",
    haloContours: [...contours, bowlHull],
    tip: toWorld({ x: landmarks.stemCentre, y: landmarks.baseline + stretch }),
    direction,
    halfWidth: landmarks.stemHalfWidth,
    stretch,
    landmarks,
    toWorld,
    toFrame,
    toStemWorld,
    depthAtRadius,
  };
}

/** Twice the signed area of a contour (positive runs clockwise on screen). */
function signedArea(contour) {
  return contour.reduce((sum, point, pointIndex) => {
    const next = contour[(pointIndex + 1) % contour.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
}

/** How many times the outline winds round a point (nonzero fill paints it
 *  when this is not 0). */
function windingAt(contours, target) {
  let winding = 0;
  for (const contour of contours) {
    contour.forEach((point, pointIndex) => {
      const next = contour[(pointIndex + 1) % contour.length];
      if (point.y <= target.y && next.y > target.y) {
        const side =
          (next.x - point.x) * (target.y - point.y) -
          (target.x - point.x) * (next.y - point.y);
        if (side > 0) winding += 1;
      } else if (point.y > target.y && next.y <= target.y) {
        const side =
          (next.x - point.x) * (target.y - point.y) -
          (target.x - point.x) * (next.y - point.y);
        if (side < 0) winding -= 1;
      }
    });
  }
  return winding;
}

/**
 * The shared drawing kit behind the Q logo marks: the traced Fraunces Q, the
 * circle-crop safe zone, how a mark is placed on the canvas, and the SVG
 * writer. logo-concepts.mjs and thread-variants.mjs both draw with it.
 *
 * Shapes are plain objects in letter coordinates (the bowl's centre is the
 * origin, y runs down). Kinds: circle, ring, polyline, ellipse, cubicPath
 * (stroked), and outline (a filled closed contour, for lines whose width
 * varies). Any shape may carry `knockouts` (thin rings cut out of every
 * knocked-out shape by one shared clip, as the first concepts do), `cutouts`
 * (regions cut out of this shape alone, each with its own clip, so a gap
 * stays a gap in mono too) and `colorways` (the colourways it is drawn in).
 */
export const OUTPUT_DIRECTORY = new URL(
  "../../public/brand/logo-concepts/",
  import.meta.url,
);

export const CANVAS_SIZE = 1024;
export const CANVAS_CENTRE = CANVAS_SIZE / 2;
/** Radius of the circle every platform's avatar crop keeps. */
export const SAFE_RADIUS = 400;
/** How far the mark reaches from the centre: inside the safe zone, with air. */
export const MARK_RADIUS = 386;

export const COLORS = {
  plum: "#2D1B3D",
  cream: "#F7F3EE",
  coral: "#E8775A",
  jade: "#4A8C6F",
};

/** What each tone paints in each colourway. `background: null` is transparent. */
export const COLORWAYS = {
  plum: {
    background: COLORS.plum,
    ink: COLORS.cream,
    accent: COLORS.coral,
    jade: COLORS.jade,
    hearth: COLORS.coral,
    // The back of a ribbon: cream warmed a quarter of the way to coral.
    shade: "#E9C7B9",
  },
  cream: {
    background: COLORS.cream,
    ink: COLORS.plum,
    accent: COLORS.coral,
    jade: COLORS.jade,
    hearth: COLORS.coral,
    // The back of a ribbon: plum warmed a third of the way to coral.
    shade: "#8C4F5A",
  },
  mono: {
    background: null,
    ink: COLORS.plum,
    accent: COLORS.plum,
    jade: COLORS.plum,
    hearth: COLORS.plum,
    // One colour only: a mark shows the back of its ribbon with gaps.
    shade: COLORS.plum,
  },
};

/* -------------------------------------------------------------------------- */
/* The traced letter                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The Q's centre line, in trace pixels (the glyph drawn at 700px). The bowl's
 * stroke midpoints fit an ellipse leaning a little left, as Fraunces' counter
 * does; the tail starts inside the counter, crosses the bowl low on the right
 * and sweeps out with a small upturn.
 */
export const TRACED_Q = {
  bowl: {
    centreX: 465.3,
    centreY: 457.9,
    radiusX: 192,
    radiusY: 240,
    tiltDegrees: -11.4,
  },
  tail: {
    start: [490, 566],
    segments: [
      [
        [512, 640],
        [540, 740],
        [630, 758],
      ],
      [
        [680, 768],
        [712, 758],
        [724, 726],
      ],
    ],
  },
  /** Where the bowl's stroke is thickest (the stress), as an angle around
   *  the counter: Fraunces is heavy at the lower left and the upper right. */
  stressAngleDegrees: 160,
};

export const BOWL_SAMPLES = 1440;
export const TAIL_SAMPLES_PER_SEGMENT = 400;

/** A point relative to the bowl's centre, so the letter sits on the origin. */
export function fromTrace([traceX, traceY]) {
  return {
    x: traceX - TRACED_Q.bowl.centreX,
    y: traceY - TRACED_Q.bowl.centreY,
  };
}

export function distanceBetween(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

/** A point on the bowl's centre line, at an angle parameter in radians. */
export function bowlPointAt(parameter) {
  const { radiusX, radiusY, tiltDegrees } = TRACED_Q.bowl;
  const tilt = (tiltDegrees * Math.PI) / 180;
  const alongX = radiusX * Math.cos(parameter);
  const alongY = radiusY * Math.sin(parameter);
  return {
    x: alongX * Math.cos(tilt) - alongY * Math.sin(tilt),
    y: alongX * Math.sin(tilt) + alongY * Math.cos(tilt),
  };
}

/** Is the point outside the bowl's centre line? */
export function isOutsideBowl(point) {
  const { radiusX, radiusY, tiltDegrees } = TRACED_Q.bowl;
  const tilt = (-tiltDegrees * Math.PI) / 180;
  const alongX = point.x * Math.cos(tilt) - point.y * Math.sin(tilt);
  const alongY = point.x * Math.sin(tilt) + point.y * Math.cos(tilt);
  return (alongX / radiusX) ** 2 + (alongY / radiusY) ** 2 > 1;
}

export function cubicPointAt(start, controlOne, controlTwo, end, parameter) {
  const remaining = 1 - parameter;
  const weights = [
    remaining ** 3,
    3 * remaining ** 2 * parameter,
    3 * remaining * parameter ** 2,
    parameter ** 3,
  ];
  const corners = [start, controlOne, controlTwo, end];
  return {
    x: corners.reduce(
      (sum, corner, cornerIndex) => sum + corner.x * weights[cornerIndex],
      0,
    ),
    y: corners.reduce(
      (sum, corner, cornerIndex) => sum + corner.y * weights[cornerIndex],
      0,
    ),
  };
}

/** The tail as cubic segments in letter coordinates, each one
 *  [start, first control, second control, end]. */
export function tailCubics() {
  let segmentStart = fromTrace(TRACED_Q.tail.start);
  return TRACED_Q.tail.segments.map(([controlOne, controlTwo, end]) => {
    const cubic = [
      segmentStart,
      fromTrace(controlOne),
      fromTrace(controlTwo),
      fromTrace(end),
    ];
    segmentStart = cubic[3];
    return cubic;
  });
}

/** Splits a cubic at a parameter and keeps the part after it. */
export function cubicTail([start, controlOne, controlTwo, end], parameter) {
  const interpolate = (first, second) => ({
    x: first.x + (second.x - first.x) * parameter,
    y: first.y + (second.y - first.y) * parameter,
  });
  const firstMid = interpolate(start, controlOne);
  const secondMid = interpolate(controlOne, controlTwo);
  const thirdMid = interpolate(controlTwo, end);
  const firstInner = interpolate(firstMid, secondMid);
  const secondInner = interpolate(secondMid, thirdMid);
  return [interpolate(firstInner, secondInner), secondInner, thirdMid, end];
}

/** The part of a cubic between two parameters. */
export function cubicBetween(cubic, fromParameter, toParameter) {
  const head = cubicTail([...cubic].reverse(), 1 - toParameter).reverse();
  return toParameter > 0 ? cubicTail(head, fromParameter / toParameter) : head;
}

/** A dense polyline with running length, for placing points by distance. */
export function measuredPolyline(points) {
  const lengths = [0];
  points.slice(1).forEach((point, pointIndex) => {
    lengths.push(
      lengths[pointIndex] + distanceBetween(points[pointIndex], point),
    );
  });
  return { points, lengths, total: lengths[lengths.length - 1] };
}

export function pointAtDistance(polyline, distance) {
  const { points, lengths, total } = polyline;
  const clamped = Math.min(Math.max(distance, 0), total);
  const segmentIndex = Math.max(
    0,
    lengths.findIndex((length) => length >= clamped) - 1,
  );
  const segmentLength = lengths[segmentIndex + 1] - lengths[segmentIndex] || 1;
  const along = (clamped - lengths[segmentIndex]) / segmentLength;
  const from = points[segmentIndex];
  const to = points[segmentIndex + 1] ?? from;
  return {
    x: from.x + (to.x - from.x) * along,
    y: from.y + (to.y - from.y) * along,
  };
}

export const bowlLine = measuredPolyline(
  Array.from({ length: BOWL_SAMPLES + 1 }, (_, sampleIndex) =>
    bowlPointAt((sampleIndex / BOWL_SAMPLES) * Math.PI * 2),
  ),
);

export const tailLine = measuredPolyline(
  tailCubics().flatMap((cubic, cubicIndex) =>
    Array.from({ length: TAIL_SAMPLES_PER_SEGMENT + 1 }, (_, sampleIndex) =>
      cubicPointAt(...cubic, sampleIndex / TAIL_SAMPLES_PER_SEGMENT),
    ).slice(cubicIndex === 0 ? 0 : 1),
  ),
);

/** Where the tail crosses the bowl: its distance along the tail, and the
 *  distance along the bowl of the same point. */
export const crossing = (() => {
  const sampleIndex = tailLine.points.findIndex((point) =>
    isOutsideBowl(point),
  );
  const point = tailLine.points[sampleIndex];
  let nearestIndex = 0;
  bowlLine.points.forEach((bowlPoint, bowlIndex) => {
    if (
      distanceBetween(bowlPoint, point) <
      distanceBetween(bowlLine.points[nearestIndex], point)
    ) {
      nearestIndex = bowlIndex;
    }
  });
  return {
    point,
    tailDistance: tailLine.lengths[sampleIndex],
    bowlDistance: bowlLine.lengths[nearestIndex],
  };
})();

/** 0 to 1: how heavy the serif's stroke is at this point of the bowl. */
export function stressAt(point) {
  const angle = Math.atan2(point.y, point.x);
  const stressAngle = (TRACED_Q.stressAngleDegrees * Math.PI) / 180;
  return 0.5 + 0.5 * Math.cos(2 * (angle - stressAngle));
}

/** `count` points spread evenly round the bowl, the first one on the
 *  crossing, or `phase` of a step past it (0.5 puts the crossing midway
 *  between two points). */
export function bowlPointsFromCrossing(count, phase = 0) {
  return Array.from({ length: count }, (_, pointIndex) =>
    pointAtDistance(
      bowlLine,
      (crossing.bowlDistance +
        ((pointIndex + phase) * bowlLine.total) / count) %
        bowlLine.total,
    ),
  );
}

/** A point on the tail, by its distance from the tail's start. */
export function tailPointAt(distance) {
  return pointAtDistance(tailLine, distance);
}

/** Which tail cubic a distance falls on, and the parameter on it. */
export function tailParameterAt(distance) {
  const { lengths } = tailLine;
  const segmentIndex = Math.max(
    0,
    lengths.findIndex((length) => length >= distance) - 1,
  );
  const segmentLength = lengths[segmentIndex + 1] - lengths[segmentIndex] || 1;
  const samplePosition =
    segmentIndex + (distance - lengths[segmentIndex]) / segmentLength;
  const cubicIndex = samplePosition > TAIL_SAMPLES_PER_SEGMENT ? 1 : 0;
  return {
    cubicIndex,
    parameter: samplePosition / TAIL_SAMPLES_PER_SEGMENT - cubicIndex,
  };
}

/** The stretch of the tail between two distances along it, as cubics. */
export function tailCubicsBetween(fromDistance, toDistance) {
  const cubics = tailCubics();
  const from = tailParameterAt(fromDistance);
  const to = tailParameterAt(toDistance);
  if (from.cubicIndex === to.cubicIndex) {
    return [
      cubicBetween(cubics[from.cubicIndex], from.parameter, to.parameter),
    ];
  }
  return [
    cubicBetween(cubics[from.cubicIndex], from.parameter, 1),
    cubicBetween(cubics[to.cubicIndex], 0, to.parameter),
  ];
}

/* -------------------------------------------------------------------------- */
/* Shape helpers (in letter coordinates; placed on the canvas later)         */
/* -------------------------------------------------------------------------- */

/** The counter's centre, nudged up to where the eye puts it. */
export const HEARTH_CENTRE = { x: 0, y: -8 };

export function circle(centre, radius, tone) {
  return { kind: "circle", x: centre.x, y: centre.y, radius, tone };
}

export function ring(centre, radius, strokeWidth, tone) {
  return { kind: "ring", x: centre.x, y: centre.y, radius, strokeWidth, tone };
}

/* -------------------------------------------------------------------------- */
/* Placing a mark on the canvas                                               */
/* -------------------------------------------------------------------------- */

/** Points on the outline of a shape, each with how far the paint reaches
 *  beyond it (a dot's radius, half a stroke). */
export function shapeReach(shape) {
  switch (shape.kind) {
    case "circle":
      return [{ x: shape.x, y: shape.y, pad: shape.radius }];
    case "ring":
      return [
        { x: shape.x, y: shape.y, pad: shape.radius + shape.strokeWidth / 2 },
      ];
    case "polyline":
      return shape.points.map((point) => ({
        ...point,
        pad: shape.strokeWidth / 2,
      }));
    case "ellipse":
      return bowlLine.points.map((point) => ({
        x: point.x + shape.x,
        y: point.y + shape.y,
        pad: shape.strokeWidth / 2,
      }));
    case "cubicPath":
      return shape.cubics.flatMap((cubic) =>
        Array.from({ length: 65 }, (_, sampleIndex) => ({
          ...cubicPointAt(...cubic, sampleIndex / 64),
          pad: shape.strokeWidth / 2,
        })),
      );
    case "outline":
      return shape.contours.flat().map((point) => ({ ...point, pad: 0 }));
    default:
      throw new Error(`Unknown shape: ${shape.kind}`);
  }
}

export function furthestReach(reach, centre) {
  return Math.max(
    ...reach.map((point) => distanceBetween(point, centre) + point.pad),
  );
}

/** The centre of the smallest circle holding every shape, found by a
 *  shrinking grid search (precise enough for placement). */
export function enclosingCentre(reach) {
  let best = { x: 0, y: 0 };
  for (let step = 64; step >= 0.25; step /= 2) {
    let hasImproved = true;
    while (hasImproved) {
      hasImproved = false;
      for (const [offsetX, offsetY] of [
        [step, 0],
        [-step, 0],
        [0, step],
        [0, -step],
      ]) {
        const candidate = { x: best.x + offsetX, y: best.y + offsetY };
        if (furthestReach(reach, candidate) < furthestReach(reach, best)) {
          best = candidate;
          hasImproved = true;
        }
      }
    }
  }
  return best;
}

/** How much of the bowl's own centre the optical centre keeps: the bowl
 *  carries the weight, so the eye reads the letter's middle closer to it
 *  than the tail's reach suggests. */
export const BOWL_PULL = 0.12;

/** The smallest enclosing circle's centre, pulled toward the bowl. */
export function pulledCentre(reach) {
  const enclosing = enclosingCentre(reach);
  return {
    x: enclosing.x * (1 - BOWL_PULL),
    y: enclosing.y * (1 - BOWL_PULL),
  };
}

/** The centre of the box round all the ink. */
export function boundsCentre(reach) {
  const lefts = reach.map((point) => point.x - point.pad);
  const rights = reach.map((point) => point.x + point.pad);
  const tops = reach.map((point) => point.y - point.pad);
  const bottoms = reach.map((point) => point.y + point.pad);
  return {
    x: (Math.min(...lefts) + Math.max(...rights)) / 2,
    y: (Math.min(...tops) + Math.max(...bottoms)) / 2,
  };
}

/** Scale and offset that put the mark's optical centre on the canvas centre
 *  with its furthest paint at MARK_RADIUS. */
export function placement(shapes, centring) {
  const reach = shapes.flatMap(shapeReach);
  const anchor =
    centring === "bounds" ? boundsCentre(reach) : pulledCentre(reach);
  const scale = MARK_RADIUS / furthestReach(reach, anchor);
  const toCanvas = (point) => ({
    x: CANVAS_CENTRE + (point.x - anchor.x) * scale,
    y: CANVAS_CENTRE + (point.y - anchor.y) * scale,
  });
  return { scale, toCanvas };
}

/* -------------------------------------------------------------------------- */
/* SVG output                                                                 */
/* -------------------------------------------------------------------------- */

export function round(value) {
  return Number(value.toFixed(1));
}

export function shapeSvg(shape, { scale, toCanvas }, colorway) {
  const color = COLORWAYS[colorway][shape.tone];
  const stroke = (width) =>
    `fill="none" stroke="${color}" stroke-width="${round(width * scale)}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (shape.kind) {
    case "circle": {
      const centre = toCanvas(shape);
      return `<circle cx="${round(centre.x)}" cy="${round(centre.y)}" r="${round(shape.radius * scale)}" fill="${color}"/>`;
    }
    case "ring": {
      const centre = toCanvas(shape);
      return `<circle cx="${round(centre.x)}" cy="${round(centre.y)}" r="${round(shape.radius * scale)}" ${stroke(shape.strokeWidth)}/>`;
    }
    case "polyline": {
      const path = shape.points
        .map(toCanvas)
        .map(
          (point, pointIndex) =>
            `${pointIndex === 0 ? "M" : "L"}${round(point.x)} ${round(point.y)}`,
        )
        .join(" ");
      return `<path d="${path}" ${stroke(shape.strokeWidth)}/>`;
    }
    case "ellipse": {
      // Two half arcs, so the bowl needs no transform (a transform would
      // also turn the knockout clip with it).
      const [first, second] = [0, Math.PI].map((parameter) => {
        const placed = toCanvas(bowlPointAt(parameter));
        return `${round(placed.x)} ${round(placed.y)}`;
      });
      const arc = `A${round(shape.radiusX * scale)} ${round(shape.radiusY * scale)} ${shape.tiltDegrees} 1 1`;
      return `<path d="M${first} ${arc} ${second} ${arc} ${first}Z" ${stroke(shape.strokeWidth)}/>`;
    }
    case "cubicPath": {
      const pair = (point) => {
        const placed = toCanvas(point);
        return `${round(placed.x)} ${round(placed.y)}`;
      };
      const [first] = shape.cubics;
      const path = [
        `M${pair(first[0])}`,
        ...shape.cubics.map(
          ([, controlOne, controlTwo, end]) =>
            `C${pair(controlOne)} ${pair(controlTwo)} ${pair(end)}`,
        ),
      ].join(" ");
      return `<path d="${path}" ${stroke(shape.strokeWidth)}/>`;
    }
    case "outline": {
      const path = shape.contours
        .map((contour) => contourPath(contour, toCanvas))
        .join("");
      return `<path d="${path}" fill="${color}"/>`;
    }
    default:
      throw new Error(`Unknown shape: ${shape.kind}`);
  }
}

/** A closed contour as a smooth path: a Catmull-Rom curve through its
 *  points, drawn as cubics. A point marked `isCorner` keeps its corner (the
 *  curve leaves and enters it straight toward its neighbours). */
export function contourPath(contour, toCanvas) {
  const placed = contour.map((point) => ({
    ...toCanvas(point),
    isCorner: point.isCorner,
  }));
  const count = placed.length;
  const at = (pointIndex) => placed[(pointIndex + count) % count];
  const pair = (point) => `${round(point.x)} ${round(point.y)}`;
  const segments = placed.map((point, pointIndex) => {
    const next = at(pointIndex + 1);
    const before = point.isCorner ? point : at(pointIndex - 1);
    const after = next.isCorner ? next : at(pointIndex + 2);
    const controlOne = {
      x: point.x + (next.x - before.x) / 6,
      y: point.y + (next.y - before.y) / 6,
    };
    const controlTwo = {
      x: next.x - (after.x - point.x) / 6,
      y: next.y - (after.y - point.y) / 6,
    };
    return `C${pair(controlOne)} ${pair(controlTwo)} ${pair(next)}`;
  });
  return `M${pair(placed[0])}${segments.join("")}Z`;
}

/** A cutout region as a path: a circle, or a closed contour. */
function cutoutPath(cutout, { scale, toCanvas }) {
  if (cutout.kind === "circle") {
    const centre = toCanvas(cutout);
    const radius = round(cutout.radius * scale);
    return `M${round(centre.x - radius)} ${round(centre.y)}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0Z`;
  }
  return contourPath(cutout.points, toCanvas);
}

/** The box round a cutout, in letter coordinates. */
function cutoutBox(cutout) {
  const points =
    cutout.kind === "circle"
      ? [
          { x: cutout.x - cutout.radius, y: cutout.y - cutout.radius },
          { x: cutout.x + cutout.radius, y: cutout.y + cutout.radius },
        ]
      : cutout.points;
  return {
    left: Math.min(...points.map((point) => point.x)),
    right: Math.max(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    bottom: Math.max(...points.map((point) => point.y)),
  };
}

function boxesOverlap(first, second) {
  return (
    first.left < second.right &&
    second.left < first.right &&
    first.top < second.bottom &&
    second.top < first.bottom
  );
}

/** Sorts cutouts into layers whose regions never overlap, so each layer can
 *  be one even-odd clip (two holes that overlapped would fill each other
 *  back in). Nesting one clip per layer cuts out the union of them all. */
function cutoutLayers(cutouts) {
  const layers = [];
  for (const cutout of cutouts) {
    const box = cutoutBox(cutout);
    const layer = layers.find((candidate) =>
      candidate.every((member) => !boxesOverlap(member.box, box)),
    );
    if (layer) layer.push({ cutout, box });
    else layers.push([{ cutout, box }]);
  }
  return layers.map((layer) => layer.map(({ cutout }) => cutout));
}

/** Is this shape or cutout drawn in this colourway? */
function isDrawnIn(item, colorway) {
  return !item.colorways || item.colorways.includes(colorway);
}

/** Throws when any paint would fall outside the circle-crop safe zone. */
export function assertInsideSafeZone(conceptId, shapes, { scale, toCanvas }) {
  const canvasCentre = { x: CANVAS_CENTRE, y: CANVAS_CENTRE };
  const reach = Math.max(
    ...shapes
      .flatMap(shapeReach)
      .map(
        (point) =>
          distanceBetween(toCanvas(point), canvasCentre) + point.pad * scale,
      ),
  );
  if (reach > SAFE_RADIUS) {
    throw new Error(
      `${conceptId} reaches ${reach.toFixed(1)}px, past the ${SAFE_RADIUS}px safe zone`,
    );
  }
  return reach;
}

/** A clip that cuts a thin ring round each bead out of the line under it. */
export function knockoutClip(clipId, shapes, { scale, toCanvas }) {
  const knockouts =
    shapes.find((shape) => shape.knockouts?.length)?.knockouts ?? [];
  if (knockouts.length === 0) return [];
  const holes = knockouts.map((knockout) => {
    const centre = toCanvas(knockout);
    const radius = round(knockout.radius * scale);
    return `M${round(centre.x - radius)} ${round(centre.y)}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0Z`;
  });
  return [
    `<defs><clipPath id="${clipId}"><path clip-rule="evenodd" d="M0 0H${CANVAS_SIZE}V${CANVAS_SIZE}H0Z${holes.join("")}"/></clipPath></defs>`,
  ];
}

export function markSvg(conceptId, shapes, placed, colorway) {
  const { background } = COLORWAYS[colorway];
  const clipId = `${conceptId}-${colorway}-knockout`;
  const { clipIds: cutoutClipIds, lines: cutoutDefinitions } = cutoutClips(
    conceptId,
    shapes,
    placed,
    colorway,
  );
  const lines = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" role="img" aria-label="QueerPulse">`,
    ...knockoutClip(clipId, shapes, placed),
    ...cutoutDefinitions,
    ...(background
      ? [
          `<rect width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" fill="${background}"/>`,
        ]
      : []),
    ...shapes
      .filter((shape) => isDrawnIn(shape, colorway))
      .map((shape) => {
        const element = shapeSvg(shape, placed, colorway);
        const knockedOut = shape.knockouts?.length
          ? element.replace(/\/>$/, ` clip-path="url(#${clipId})"/>`)
          : element;
        const layerIds = cutoutClipIds.get(shape) ?? [];
        return layerIds.reduceRight(
          (inner, layerId) => `<g clip-path="url(#${layerId})">${inner}</g>`,
          knockedOut,
        );
      }),
  ];
  return `${lines.join("\n  ")}\n</svg>\n`;
}

/** One clip per layer of each shape's own cutouts, with ids unique in the
 *  file. Shapes without cutouts add nothing. */
function cutoutClips(conceptId, shapes, placed, colorway) {
  const clipIds = new Map();
  const definitions = [];
  shapes.forEach((shape, shapeIndex) => {
    if (!isDrawnIn(shape, colorway)) return;
    const cutouts = (shape.cutouts ?? []).filter((cutout) =>
      isDrawnIn(cutout, colorway),
    );
    if (cutouts.length === 0) return;
    const layerIds = cutoutLayers(cutouts).map((layer, layerIndex) => {
      const layerId = `${conceptId}-${colorway}-cut-${shapeIndex}-${layerIndex}`;
      const holes = layer.map((cutout) => cutoutPath(cutout, placed)).join("");
      definitions.push(
        `<clipPath id="${layerId}"><path clip-rule="evenodd" d="M0 0H${CANVAS_SIZE}V${CANVAS_SIZE}H0Z${holes}"/></clipPath>`,
      );
      return layerId;
    });
    clipIds.set(shape, layerIds);
  });
  return {
    clipIds,
    lines: definitions.length ? [`<defs>${definitions.join("")}</defs>`] : [],
  };
}

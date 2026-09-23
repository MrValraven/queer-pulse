import {
  INTERSEX_COLORS,
  PROGRESS_CHEVRON_COLORS,
  flagBandSpans,
} from "../../../shared/data/flagStripes.data";
import type { PathCommand, Primitive } from "./primitives";

/**
 * Each flag's own design as sticker primitives, so a template paints any
 * flag with one call and never needs to know whether it is bands, a chevron,
 * or a ring. Every colour comes from `flagStripes.data.ts`, the same source
 * the membership card gradients read.
 */

export interface FlagBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A share of the flag's AREA, 0..1. A flag's shares sum to 1. */
export interface FlagColorShare {
  color: string;
  share: number;
}

const PROGRESS_FLAG_ID = "progress";
const INTERSEX_FLAG_ID = "intersex";

/**
 * The Progress chevron's geometry.
 *
 * Every chevron edge runs at 45 degrees (a rise of 1 per 1 of run), as on
 * the published flag. The outer black edge's apex sits at 52% of the box's
 * shorter side from the hoist, on the vertical centre line. On the Uno
 * card's portrait inner box (284 by 444 at the default frame) that is an
 * apex at x = 147.7, with the arms meeting the hoist 147.7 above and below
 * the centre: the chevron reads clearly beside the tilted oval and leaves
 * the rainbow its full run across the right half. (On the flag's own 3:2 box
 * the published outer edge runs from each hoist corner to the centre, an
 * apex at 50% of the height; 52% trades a sliver of rainbow for bands wide
 * enough to read at sticker size.) On a landscape box the arms reach 2% of
 * the height past the top and bottom, which the caller's clip trims.
 *
 * The five bands split that apex distance evenly: each band's apex steps
 * in by a fifth (29.5 on the card, a perpendicular band width of about 21),
 * and the white triangle at the hoist keeps the last fifth, which is also
 * how the published flag divides its hoist edge.
 */
const CHEVRON_ARM_SLOPE = 1;
const CHEVRON_APEX_SHARE_OF_SHORT_SIDE = 0.52;

/**
 * The Intersex ring's geometry. The ring's outer diameter is 76% of the
 * box's shorter side, which on the portrait card is its width (215.8 of 284
 * at the default frame). The published flag's ring is about 57% of its
 * short side; the card runs it larger because the centre glyph covers the
 * ring's middle, and at 76% the ring passes under the glyph's arrow tips and
 * fills the top-left and bottom-right gaps the diagonal leaves, while
 * keeping clear of the corner glyphs and the card edge. The ring is 15% of
 * that outer diameter thick (32.4 on the card), the published flag's own
 * proportion. On the 2:3 share box it covers about 15.4% of the area.
 */
const INTERSEX_RING_DIAMETER_SHARE_OF_SHORT_SIDE = 0.76;
const INTERSEX_RING_THICKNESS_SHARE_OF_DIAMETER = 0.15;

/**
 * The box the area shares are measured on: a 2:3 portrait, the shape of the
 * sticker card. Bands give the same shares on any box, but a chevron or a
 * ring covers a share that depends on the box's aspect ratio.
 */
const SHARE_REFERENCE_BOX: FlagBox = { x: 0, y: 0, width: 2, height: 3 };

function stripedPrimitives(flagId: string, box: FlagBox): Primitive[] {
  return flagBandSpans(flagId).map((band) => ({
    type: "rect" as const,
    x: box.x,
    y: box.y + band.start * box.height,
    // A hairline overlap stops a seam of the card body showing between two
    // bands when the canvas rounds their edges to different device pixels.
    height: (band.end - band.start) * box.height + 0.5,
    width: box.width,
    fill: band.color,
  }));
}

/** The horizontal distance from the hoist to each chevron band's apex,
 *  outermost (black) first. */
function chevronApexDistances(box: FlagBox): number[] {
  const outerApex =
    Math.min(box.width, box.height) * CHEVRON_APEX_SHARE_OF_SHORT_SIDE;
  const bandCount = PROGRESS_CHEVRON_COLORS.length;
  return PROGRESS_CHEVRON_COLORS.map(
    (_color, index) => (outerApex * (bandCount - index)) / bandCount,
  );
}

/** One chevron band as a triangle on the hoist: the next band in paints over
 *  its inner part, which leaves a parallel band showing. */
function chevronTriangle(box: FlagBox, apexDistance: number): PathCommand[] {
  const centerY = box.y + box.height / 2;
  const armRise = apexDistance * CHEVRON_ARM_SLOPE;
  return [
    { type: "moveTo", x: box.x, y: centerY - armRise },
    { type: "lineTo", x: box.x + apexDistance, y: centerY },
    { type: "lineTo", x: box.x, y: centerY + armRise },
    { type: "close" },
  ];
}

/** The six rainbow stripes as the ground, then the chevron back to front,
 *  black (the largest triangle) first. */
function progressPrimitives(box: FlagBox): Primitive[] {
  const apexDistances = chevronApexDistances(box);
  const chevron: Primitive[] = PROGRESS_CHEVRON_COLORS.map((color, index) => ({
    type: "path",
    commands: chevronTriangle(box, apexDistances[index] ?? 0),
    fill: color,
  }));
  return [...stripedPrimitives("rainbow", box), ...chevron];
}

interface IntersexRing {
  centerX: number;
  centerY: number;
  /** The radius of the stroke's centre line. */
  radius: number;
  thickness: number;
}

function intersexRing(box: FlagBox): IntersexRing {
  const outerDiameter =
    Math.min(box.width, box.height) *
    INTERSEX_RING_DIAMETER_SHARE_OF_SHORT_SIDE;
  const thickness = outerDiameter * INTERSEX_RING_THICKNESS_SHARE_OF_DIAMETER;
  return {
    centerX: box.x + box.width / 2,
    centerY: box.y + box.height / 2,
    radius: outerDiameter / 2 - thickness / 2,
    thickness,
  };
}

/** The yellow field, then the purple ring as a stroked circle. */
function intersexPrimitives(box: FlagBox): Primitive[] {
  const ring = intersexRing(box);
  return [
    {
      type: "rect",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      fill: INTERSEX_COLORS.field,
    },
    {
      type: "ellipse",
      centerX: ring.centerX,
      centerY: ring.centerY,
      radiusX: ring.radius,
      radiusY: ring.radius,
      stroke: INTERSEX_COLORS.ring,
      strokeWidth: ring.thickness,
    },
  ];
}

/**
 * Every primitive that paints `flagId`'s own design inside `box` (the caller
 * clips: the last band's hairline overlap reaches half a unit past the
 * bottom edge, and on a landscape box the chevron's arms reach just past the
 * top and bottom). Throws `Unknown flag id: <id>` for an unknown id.
 */
export function flagBodyPrimitives(flagId: string, box: FlagBox): Primitive[] {
  if (flagId === PROGRESS_FLAG_ID) return progressPrimitives(box);
  if (flagId === INTERSEX_FLAG_ID) return intersexPrimitives(box);
  return stripedPrimitives(flagId, box);
}

/** The area under `height(y)` between `fromY` and `toY`, where `height` is
 *  piecewise linear with its only bends at `bendYs`. The trapezoid rule is
 *  exact on each straight piece. */
function areaUnderPiecewiseLinear(
  height: (y: number) => number,
  bendYs: readonly number[],
  fromY: number,
  toY: number,
): number {
  const cutYs = [
    fromY,
    ...bendYs.filter((bendY) => bendY > fromY && bendY < toY),
    toY,
  ].sort((first, second) => first - second);
  let area = 0;
  for (let index = 1; index < cutYs.length; index += 1) {
    const startY = cutYs[index - 1] ?? fromY;
    const endY = cutYs[index] ?? toY;
    area += ((height(startY) + height(endY)) / 2) * (endY - startY);
  }
  return area;
}

/** Adds `share` to `color`'s running total, keeping first-seen order. */
function addShare(
  sharesByColor: Map<string, number>,
  color: string,
  share: number,
): void {
  sharesByColor.set(color, (sharesByColor.get(color) ?? 0) + share);
}

function toShareList(sharesByColor: Map<string, number>): FlagColorShare[] {
  return [...sharesByColor].map(([color, share]) => ({ color, share }));
}

function stripedShares(flagId: string): Map<string, number> {
  const sharesByColor = new Map<string, number>();
  for (const band of flagBandSpans(flagId)) {
    addShare(sharesByColor, band.color, band.end - band.start);
  }
  return sharesByColor;
}

/** Each chevron band's triangle, measured as the width it covers at height
 *  `y` (triangles nest, so a band's own area is its triangle minus the next
 *  one in). Each rainbow stripe keeps whatever the black triangle leaves. */
function progressShares(box: FlagBox): Map<string, number> {
  const boxArea = box.width * box.height;
  const centerY = box.y + box.height / 2;
  const apexDistances = chevronApexDistances(box);
  const triangleWidthAt = (apexDistance: number) => (y: number) =>
    Math.min(
      box.width,
      Math.max(0, apexDistance - Math.abs(y - centerY) / CHEVRON_ARM_SLOPE),
    );
  const triangleArea = (apexDistance: number, fromY: number, toY: number) =>
    areaUnderPiecewiseLinear(
      triangleWidthAt(apexDistance),
      [
        centerY - apexDistance * CHEVRON_ARM_SLOPE,
        centerY,
        centerY + apexDistance * CHEVRON_ARM_SLOPE,
      ],
      fromY,
      toY,
    );
  const boxTop = box.y;
  const boxBottom = box.y + box.height;

  const sharesByColor = new Map<string, number>();
  const outerApex = apexDistances[0] ?? 0;
  for (const band of flagBandSpans("rainbow")) {
    const bandTop = boxTop + band.start * box.height;
    const bandBottom = boxTop + band.end * box.height;
    const stripeArea =
      (bandBottom - bandTop) * box.width -
      triangleArea(outerApex, bandTop, bandBottom);
    addShare(sharesByColor, band.color, stripeArea / boxArea);
  }
  PROGRESS_CHEVRON_COLORS.forEach((color, index) => {
    const ownTriangle = triangleArea(
      apexDistances[index] ?? 0,
      boxTop,
      boxBottom,
    );
    const nextTriangle = triangleArea(
      apexDistances[index + 1] ?? 0,
      boxTop,
      boxBottom,
    );
    addShare(sharesByColor, color, (ownTriangle - nextTriangle) / boxArea);
  });
  return sharesByColor;
}

/** The ring's area is the annulus between its outer and inner edges. */
function intersexShares(box: FlagBox): Map<string, number> {
  const ring = intersexRing(box);
  const outerRadius = ring.radius + ring.thickness / 2;
  const innerRadius = ring.radius - ring.thickness / 2;
  const ringShare =
    (Math.PI * (outerRadius ** 2 - innerRadius ** 2)) /
    (box.width * box.height);
  const sharesByColor = new Map<string, number>();
  addShare(sharesByColor, INTERSEX_COLORS.field, 1 - ringShare);
  addShare(sharesByColor, INTERSEX_COLORS.ring, ringShare);
  return sharesByColor;
}

/**
 * The share of the flag's area each colour covers, for contrast checks.
 * One entry per distinct colour, in the order the colour first appears, so a
 * colour used by two bands (the transgender flag's blue) is summed into one
 * entry. Striped flags: each band's height share. The chevron and the ring
 * are measured on a 2:3 portrait box, the sticker card's shape. Throws
 * `Unknown flag id: <id>` for an unknown id.
 */
export function flagColorShares(flagId: string): FlagColorShare[] {
  if (flagId === PROGRESS_FLAG_ID) {
    return toShareList(progressShares(SHARE_REFERENCE_BOX));
  }
  if (flagId === INTERSEX_FLAG_ID) {
    return toShareList(intersexShares(SHARE_REFERENCE_BOX));
  }
  return toShareList(stripedShares(flagId));
}

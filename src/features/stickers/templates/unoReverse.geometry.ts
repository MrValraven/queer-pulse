import { flagBandSpans } from "../../../shared/data/flagStripes.data";
import type { PathCommand, Primitive } from "./primitives";
import {
  STICKER_CANVAS_SIZE,
  UNO_ARROW_OUTLINE,
  UNO_CARD_HEIGHT,
  UNO_CARD_RADIUS,
  UNO_CARD_WIDTH,
  UNO_CARD_X,
  UNO_CARD_Y,
  type UnoReverseParams,
} from "./unoReverse.params";

/** The reverse glyph is authored in its own 100 by 100 box and scaled into
 *  place, so the centre glyph and the two corner glyphs are one definition at
 *  three sizes. */
const GLYPH_BOX = 100;

function moveTo(x: number, y: number): PathCommand {
  return { type: "moveTo", x, y };
}

function lineTo(x: number, y: number): PathCommand {
  return { type: "lineTo", x, y };
}

/** One arrow's outline in its own frame: `along` runs from tail to tip,
 *  `across` runs perpendicular to it. The head is a right angle at the tip,
 *  so on the diagonal its two edges run level and plumb, as on the printed
 *  card. */
const ARROW_OUTLINE: { along: number; across: number }[] = [
  { along: -2, across: -10 },
  { along: 24, across: -10 },
  { along: 24, across: -24 },
  { along: 48, across: 0 },
  { along: 24, across: 24 },
  { along: 24, across: 10 },
  { along: -2, across: 10 },
];

/** How far the arrow sits off the glyph's diagonal, so the pair stands side
 *  by side in a zigzag instead of stacking into one double-headed line. */
const ARROW_SIDE_OFFSET = 10;

/** Map an outline point onto the up-right diagonal of the glyph box. */
function onUpRightDiagonal(
  along: number,
  across: number,
): { x: number; y: number } {
  const half = GLYPH_BOX / 2;
  const shiftedAcross = across - ARROW_SIDE_OFFSET;
  return {
    x: half + (along + shiftedAcross) / Math.SQRT2,
    y: half + (shiftedAcross - along) / Math.SQRT2,
  };
}

/** One arrow, pointing up and to the right, as a closed polygon in the glyph
 *  box, sitting just to the upper left of the diagonal. */
const UP_RIGHT_ARROW: PathCommand[] = [
  ...ARROW_OUTLINE.map((point, index) => {
    const { x, y } = onUpRightDiagonal(point.along, point.across);
    return index === 0 ? moveTo(x, y) : lineTo(x, y);
  }),
  { type: "close" },
];

/** The same arrow rotated a half turn about the glyph box's centre, which is
 *  what makes the pair read as "reverse". Derived rather than hand-written so
 *  the two can never drift apart. */
const DOWN_LEFT_ARROW: PathCommand[] = UP_RIGHT_ARROW.map((command) =>
  command.type === "close"
    ? command
    : { ...command, x: GLYPH_BOX - command.x, y: GLYPH_BOX - command.y },
);

/** The extrusion behind each arrow, down and to the left, which gives the
 *  glyph the printed card's raised, 3D look. */
const EXTRUSION_OFFSET = 5;

/** Both arrows' extrusions first, then both arrows, so neither arrow's
 *  shadow can land on top of the other arrow. */
function reverseGlyph(fill: string, strokeWidth: number): Primitive[] {
  const arrows = [UP_RIGHT_ARROW, DOWN_LEFT_ARROW];
  const extrusions: Primitive[] = arrows.map((commands) => ({
    type: "group",
    translateX: -EXTRUSION_OFFSET,
    translateY: EXTRUSION_OFFSET,
    children: [
      {
        type: "path",
        commands,
        fill: UNO_ARROW_OUTLINE,
        stroke: UNO_ARROW_OUTLINE,
        strokeWidth,
      },
    ],
  }));
  const faces: Primitive[] = arrows.map((commands) => ({
    type: "path",
    commands,
    fill,
    stroke: UNO_ARROW_OUTLINE,
    strokeWidth,
  }));
  return [...extrusions, ...faces];
}

/** Place the glyph so its box centre lands on (centreX, centreY) at `scale`. */
function placedGlyph(
  centerX: number,
  centerY: number,
  scale: number,
  fill: string,
): Primitive {
  return {
    type: "group",
    translateX: centerX - (GLYPH_BOX * scale) / 2,
    translateY: centerY - (GLYPH_BOX * scale) / 2,
    scale,
    // The outline is authored in glyph units, so dividing by the scale keeps
    // it the same apparent thickness at every size.
    children: reverseGlyph(fill, 3 / scale),
  };
}

/**
 * The Uno reverse card for one flag, as primitives in a
 * `STICKER_CANVAS_SIZE` square.
 *
 * Painted back to front: the card body in the frame colour, the flag bands,
 * the tilted oval, the centre glyph, and the two corner glyphs. The bands and
 * the oval are each clipped to the inner rounded rect, which keeps the oval's
 * rotated extent from bulging into the frame at any angle or frame width.
 */
export function unoReverseGeometry(params: UnoReverseParams): Primitive[] {
  const innerX = UNO_CARD_X + params.frameWidth;
  const innerY = UNO_CARD_Y + params.frameWidth;
  const innerWidth = UNO_CARD_WIDTH - params.frameWidth * 2;
  const innerHeight = UNO_CARD_HEIGHT - params.frameWidth * 2;
  const innerRadius = Math.max(UNO_CARD_RADIUS - params.frameWidth, 4);
  const centerX = UNO_CARD_X + UNO_CARD_WIDTH / 2;
  const centerY = UNO_CARD_Y + UNO_CARD_HEIGHT / 2;

  const bands = flagBandSpans(params.flagId).map((band) => ({
    type: "rect" as const,
    x: innerX,
    y: innerY + band.start * innerHeight,
    // A hairline overlap stops a seam of the card body showing between two
    // bands when the canvas rounds their edges to different device pixels.
    height: (band.end - band.start) * innerHeight + 0.5,
    width: innerWidth,
    fill: band.color,
  }));

  const centerGlyphScale = (innerWidth * 0.8) / GLYPH_BOX;
  const cornerGlyphScale = centerGlyphScale * params.cornerArrowScale;
  const cornerInset = params.frameWidth + innerWidth * 0.17;

  const primitives: Primitive[] = [
    {
      type: "rect",
      x: UNO_CARD_X,
      y: UNO_CARD_Y,
      width: UNO_CARD_WIDTH,
      height: UNO_CARD_HEIGHT,
      radius: UNO_CARD_RADIUS,
      fill: params.frameColor,
    },
    {
      type: "group",
      clipRect: {
        x: innerX,
        y: innerY,
        width: innerWidth,
        height: innerHeight,
        radius: innerRadius,
      },
      children: bands,
    },
    {
      type: "group",
      clipRect: {
        x: innerX,
        y: innerY,
        width: innerWidth,
        height: innerHeight,
        radius: innerRadius,
      },
      children: [
        {
          type: "ellipse",
          centerX,
          centerY,
          // A tall oval, taller than the card is wide, so the tilt carries
          // its ends out past the edges the way the printed card does.
          radiusX: innerWidth * 0.46,
          radiusY: innerHeight * 0.52,
          rotationDeg: params.ringAngleDeg,
          stroke: params.frameColor,
          strokeWidth: params.ringStrokeWidth,
        },
      ],
    },
    placedGlyph(centerX, centerY, centerGlyphScale, params.frameColor),
  ];

  if (params.hasCornerArrows) {
    primitives.push(
      placedGlyph(
        UNO_CARD_X + cornerInset,
        UNO_CARD_Y + cornerInset,
        cornerGlyphScale,
        params.frameColor,
      ),
      placedGlyph(
        UNO_CARD_X + UNO_CARD_WIDTH - cornerInset,
        UNO_CARD_Y + UNO_CARD_HEIGHT - cornerInset,
        cornerGlyphScale,
        params.frameColor,
      ),
    );
  }

  return primitives;
}

/** Re-exported so a consumer needs one import for "draw a sticker". */
export { STICKER_CANVAS_SIZE };

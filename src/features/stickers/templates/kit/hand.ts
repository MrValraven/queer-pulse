import type { Primitive } from "../primitives";
import type { Point } from "./curves";
import { DIE_CUT_WIDTH, STICKER_INK, STICKER_WHITE } from "./palette";
import { lineOf, rectOf, rotateAbout } from "./shapes";
import type { StickerSketch } from "./stickerSketch";

/**
 * The four-finger cartoon hand, shared by Tea (nails, no forearm) and the
 * parked Blip Facepalm (a forearm, no nails). Ported from `tea-reference.mjs`
 * `api.hand` (the palm, fingers and thumb) and, for the forearm only, from
 * `blip-reference.mjs` `drawHand`.
 */

export interface HandOptions {
  x: number;
  y: number;
  angleDeg: number;
  size: number;
  fill: string;
  /** Paint nails in this colour (Tea "Unbothered"). */
  nailColor?: string;
  /** Which side the thumb sits on, seen from the viewer. */
  thumbSide: "left" | "right";
  /** Optional forearm from this point to the wrist, drawn under the hand. */
  armFrom?: readonly [number, number];
}

/** One rounded-rect part of the hand, in the hand's own local coordinate
 *  space (before the hand's own translate/rotate/scale is applied), with its
 *  own rotation about its own pivot. */
interface HandPart {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotationDeg: number;
  pivotX: number;
  pivotY: number;
}

const PALM: HandPart = {
  x: -48,
  y: -14,
  width: 96,
  height: 86,
  radius: 36,
  rotationDeg: 0,
  pivotX: 0,
  pivotY: 0,
};

const FINGER_DEFINITIONS: readonly { centerX: number; rotationDeg: number }[] =
  [
    { centerX: -36, rotationDeg: -9 },
    { centerX: -12, rotationDeg: -3 },
    { centerX: 12, rotationDeg: 3 },
    { centerX: 36, rotationDeg: 9 },
  ];

function fingerPart(
  definition: { centerX: number; rotationDeg: number },
  fingerIndex: number,
): HandPart {
  const isOuterLeftFinger = fingerIndex === 0;
  const isOuterRightFinger = fingerIndex === 3;
  return {
    x: definition.centerX - 13,
    y: -86 + (isOuterLeftFinger || isOuterRightFinger ? 14 : 0),
    width: 26,
    height: 84 - (isOuterLeftFinger ? 12 : isOuterRightFinger ? 18 : 0),
    radius: 13,
    rotationDeg: definition.rotationDeg,
    pivotX: definition.centerX,
    pivotY: -4,
  };
}

function thumbPart(thumbSide: "left" | "right"): HandPart {
  const isThumbOnLeftSide = thumbSide === "left";
  return {
    x: isThumbOnLeftSide ? -70 : 44,
    y: 6,
    width: 27,
    height: 58,
    radius: 13.5,
    rotationDeg: isThumbOnLeftSide ? -50 : 50,
    pivotX: isThumbOnLeftSide ? -48 : 48,
    pivotY: 30,
  };
}

/** The palm, four fingers and thumb, in that order (so `parts.slice(1, 5)`
 *  is exactly the four fingers, matching the nail loop below). */
function handParts(thumbSide: "left" | "right"): HandPart[] {
  return [
    PALM,
    ...FINGER_DEFINITIONS.map((definition, fingerIndex) =>
      fingerPart(definition, fingerIndex),
    ),
    thumbPart(thumbSide),
  ];
}

function partPrimitive(
  part: HandPart,
  style: { fill?: string; stroke?: string; strokeWidth?: number },
): Primitive {
  const rect = rectOf(
    part.x,
    part.y,
    part.width,
    part.height,
    part.radius,
    style,
  );
  if (part.rotationDeg === 0) return rect;
  return rotateAbout([rect], part.rotationDeg, part.pivotX, part.pivotY);
}

/** The nail's own ink outline: strokeWidth 5, scaled down so it keeps its
 *  apparent thickness once the hand group scales up by `size`. */
const NAIL_OUTLINE_STROKE_WIDTH_AT_UNIT_SIZE = 5;

/** The nail rectangle and its small white highlight for one finger, painted
 *  with the finger's own rotation and pivot. */
function nailPrimitives(
  finger: HandPart,
  nailColor: string,
  size: number,
): Primitive[] {
  const nailX = finger.x + 5;
  const nailY = finger.y + 5;
  const nailWidth = finger.width - 10;
  const nailHeight = 24;
  const nailRadius = 8;
  const nailRect = rectOf(nailX, nailY, nailWidth, nailHeight, nailRadius, {
    fill: nailColor,
    stroke: STICKER_INK,
    strokeWidth: NAIL_OUTLINE_STROKE_WIDTH_AT_UNIT_SIZE / size,
  });
  const highlightRect = rectOf(nailX + 4, nailY + 4, 5, 10, 2.5, {
    fill: STICKER_WHITE,
  });
  if (finger.rotationDeg === 0) return [nailRect, highlightRect];
  return [
    rotateAbout([nailRect], finger.rotationDeg, finger.pivotX, finger.pivotY),
    rotateAbout(
      [highlightRect],
      finger.rotationDeg,
      finger.pivotX,
      finger.pivotY,
    ),
  ];
}

interface HandTransform {
  translateX: number;
  translateY: number;
  rotationDeg: number;
  scale: number;
}

function handGroup(children: Primitive[], transform: HandTransform): Primitive {
  return { type: "group", ...transform, children };
}

/** The paint pass's ink outline: strokeWidth 16, scaled down so it keeps its
 *  apparent thickness once the hand group scales up by `size`. */
const INK_OUTLINE_STROKE_WIDTH_AT_UNIT_SIZE = 16;
/** The finger-gap lines: strokeWidth 5, scaled down the same way. */
const GAP_LINE_STROKE_WIDTH_AT_UNIT_SIZE = 5;

const GAP_LINE_X_POSITIONS: readonly number[] = [-24, 0, 24];
const GAP_LINE_TOP_Y = -44;
const GAP_LINE_BOTTOM_Y = -12;

/** The forearm's ink stroke is `44 * size + 14`; its fill stroke is
 *  `44 * size`, both drawn in canvas space (the forearm is not inside the
 *  hand's own scaled group), with round caps. Its underlay stroke is
 *  `46 * size + 44` (blip-reference.mjs's own forearm underlay width), which
 *  is the fill stroke's own `44 * size` plus a cutWidth of `2 * size + 44`. */
const FOREARM_STROKE_MULTIPLIER = 44;
const FOREARM_INK_STROKE_EXTRA = 14;
const FOREARM_UNDERLAY_CUT_WIDTH_SIZE_MULTIPLIER = 2;
const FOREARM_WRIST_Y_OFFSET = 20;

export function drawHand(sketch: StickerSketch, options: HandOptions): void {
  const parts = handParts(options.thumbSide);
  const transform: HandTransform = {
    translateX: options.x,
    translateY: options.y,
    rotationDeg: options.angleDeg,
    scale: options.size,
  };
  const armPoints: Point[] | null = options.armFrom
    ? [options.armFrom, [options.x, options.y + FOREARM_WRIST_Y_OFFSET]]
    : null;

  // 1. The forearm's ink pass, drawn under everything else.
  if (armPoints) {
    sketch.paint(
      lineOf(
        armPoints,
        STICKER_INK,
        FOREARM_STROKE_MULTIPLIER * options.size + FOREARM_INK_STROKE_EXTRA,
      ),
    );
  }

  // 2. Every part's ink outline, which merges into one mitten silhouette.
  sketch.paint(
    handGroup(
      parts.map((part) =>
        partPrimitive(part, {
          fill: STICKER_INK,
          stroke: STICKER_INK,
          strokeWidth: INK_OUTLINE_STROKE_WIDTH_AT_UNIT_SIZE / options.size,
        }),
      ),
      transform,
    ),
  );

  // 3. The forearm's fill pass, cut into the die-cut underlay.
  if (armPoints) {
    sketch.silhouette(
      lineOf(armPoints, options.fill, FOREARM_STROKE_MULTIPLIER * options.size),
      {
        cutWidth:
          FOREARM_UNDERLAY_CUT_WIDTH_SIZE_MULTIPLIER * options.size +
          DIE_CUT_WIDTH,
      },
    );
  }

  // 4. Every part filled, also cut into the die-cut underlay.
  sketch.silhouette(
    handGroup(
      parts.map((part) => partPrimitive(part, { fill: options.fill })),
      transform,
    ),
    { cutWidth: DIE_CUT_WIDTH / options.size },
  );

  // 5. The three finger-gap lines, on top of the fill.
  sketch.paint(
    handGroup(
      GAP_LINE_X_POSITIONS.map((gapX) =>
        lineOf(
          [
            [gapX, GAP_LINE_TOP_Y],
            [gapX, GAP_LINE_BOTTOM_Y],
          ],
          STICKER_INK,
          GAP_LINE_STROKE_WIDTH_AT_UNIT_SIZE / options.size,
        ),
      ),
      transform,
    ),
  );

  // 6. The nails, last, on top of everything.
  if (options.nailColor) {
    const nailColor = options.nailColor;
    sketch.paint(
      handGroup(
        parts
          .slice(1, 5)
          .flatMap((finger) => nailPrimitives(finger, nailColor, options.size)),
        transform,
      ),
    );
  }
}

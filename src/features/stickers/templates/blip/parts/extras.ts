import { arc, fourPointStar, heartPoints, type Point } from "../../kit/curves";
import { STICKER_INK, STICKER_WHITE } from "../../kit/palette";
import {
  ellipseOf,
  lineOf,
  pathOf,
  rectOf,
  rotateAbout,
  type PaintStyle,
} from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import type { Primitive } from "../../primitives";
import { BLIP_COLORS, type BlipFrame, type BlipPose } from "../blip.params";

/**
 * Blip's face and outside extras, ported from `blip-reference.mjs`'s
 * `extras.includes(...)` blocks. `sigh` and `sweatLeft` are facepalm-only
 * and out of scope; `BlipExtra` never includes them.
 *
 * `blipFaceExtras` returns plain primitives (no sketch calls): none of
 * `blush`, `bigBlush` or `tears` gets its own die-cut underlay in the
 * reference, since each sits over the body or beside the eyes, within the
 * die-cut those shapes already provide.
 *
 * `drawBlipOutsideExtras` draws the extras that float outside the body.
 * Where the reference's white halo shares the painted shape's own geometry
 * (`zzz`, `motion`, `heat`, `floatHearts`, the steam puffs), this silhouettes
 * that same primitive with a `cutWidth` computed from the reference's own
 * underlay stroke width, so the halo correctly toggles off with the
 * sticker's die-cut. Where the reference's halo is a genuinely different
 * shape from what gets painted (`sweat`'s bigger circle behind a smaller,
 * offset teardrop; `sparkles`' fatter, differently-proportioned outer star;
 * `confetti`'s bigger rounded rect), `silhouette`'s `cutWidth` cannot derive
 * it (that only grows the SAME primitive's own stroke), so the exact
 * reference shape is built and handed to the sketch's `underlay`, then the
 * coloured shape is painted on top. This keeps the die-cut toggle correct
 * and keeps the halo sitting behind the body and face in the paint order.
 */

const TEARDROP_TIP_Y_OFFSET = 22;
const TEARDROP_HALF_WIDTH = 12;
const TEARDROP_BULGE = 16;
const TEARDROP_STROKE_WIDTH = 5;

function teardropPrimitive(x: number, y: number, scale = 1): Primitive {
  const tipY = y - TEARDROP_TIP_Y_OFFSET * scale;
  const points: Point[] = [
    [x, tipY],
    ...arc(
      x + TEARDROP_HALF_WIDTH * scale,
      y,
      x - TEARDROP_HALF_WIDTH * scale,
      y,
      TEARDROP_BULGE * scale,
    ),
    [x, tipY],
  ];
  return pathOf(points, {
    fill: BLIP_COLORS.tear,
    stroke: STICKER_INK,
    strokeWidth: TEARDROP_STROKE_WIDTH,
    isClosed: true,
  });
}

const BLUSH_X_OFFSET = 30;
const BLUSH_Y_OFFSET = 40;
const BLUSH_RADIUS_X = 22;
const BLUSH_RADIUS_Y = 11;
const BIG_BLUSH_X_OFFSET = 22;
const BIG_BLUSH_Y_OFFSET = 38;
const BIG_BLUSH_RADIUS_X = 34;
const BIG_BLUSH_RADIUS_Y = 16;
const BIG_BLUSH_FLAG_STROKE_WIDTH = 4;
const TEARS_X_OFFSET = 44;
const TEARS_Y_OFFSET = 22;

/** `blush` (solid bodies only), `bigBlush` (an ink edge on flag bodies),
 *  `tears`. */
export function blipFaceExtras(frame: BlipFrame, pose: BlipPose): Primitive[] {
  const extras = pose.extras ?? [];
  const primitives: Primitive[] = [];

  if (extras.includes("blush") && !frame.isFlagBody) {
    primitives.push(
      ellipseOf(
        frame.leftEyeX - BLUSH_X_OFFSET,
        frame.eyeY + BLUSH_Y_OFFSET,
        BLUSH_RADIUS_X,
        BLUSH_RADIUS_Y,
        { fill: BLIP_COLORS.blush },
      ),
      ellipseOf(
        frame.rightEyeX + BLUSH_X_OFFSET,
        frame.eyeY + BLUSH_Y_OFFSET,
        BLUSH_RADIUS_X,
        BLUSH_RADIUS_Y,
        { fill: BLIP_COLORS.blush },
      ),
    );
  }

  if (extras.includes("bigBlush")) {
    const bigBlushStyle: PaintStyle = frame.isFlagBody
      ? {
          fill: BLIP_COLORS.blush,
          stroke: STICKER_INK,
          strokeWidth: BIG_BLUSH_FLAG_STROKE_WIDTH,
        }
      : { fill: BLIP_COLORS.blush };
    primitives.push(
      ellipseOf(
        frame.leftEyeX - BIG_BLUSH_X_OFFSET,
        frame.eyeY + BIG_BLUSH_Y_OFFSET,
        BIG_BLUSH_RADIUS_X,
        BIG_BLUSH_RADIUS_Y,
        bigBlushStyle,
      ),
      ellipseOf(
        frame.rightEyeX + BIG_BLUSH_X_OFFSET,
        frame.eyeY + BIG_BLUSH_Y_OFFSET,
        BIG_BLUSH_RADIUS_X,
        BIG_BLUSH_RADIUS_Y,
        bigBlushStyle,
      ),
    );
  }

  if (extras.includes("tears")) {
    primitives.push(
      teardropPrimitive(
        frame.leftEyeX - TEARS_X_OFFSET,
        frame.eyeY + TEARS_Y_OFFSET,
      ),
      teardropPrimitive(
        frame.rightEyeX + TEARS_X_OFFSET,
        frame.eyeY + TEARS_Y_OFFSET,
      ),
    );
  }

  return primitives;
}

const SWEAT_X_SHARE = 0.42;
const SWEAT_Y_SHARE = 0.18;
const SWEAT_HALO_RADIUS = 30;
const SWEAT_DROP_Y_OFFSET = 8;
const SWEAT_DROP_SCALE = 1.2;

function drawSweatDrop(sketch: StickerSketch, frame: BlipFrame): void {
  const x = frame.centerX + frame.width * SWEAT_X_SHARE;
  const y = frame.top + frame.height * SWEAT_Y_SHARE;
  sketch.underlay(
    ellipseOf(x, y, SWEAT_HALO_RADIUS, SWEAT_HALO_RADIUS, {
      fill: STICKER_WHITE,
    }),
  );
  sketch.paint(teardropPrimitive(x, y + SWEAT_DROP_Y_OFFSET, SWEAT_DROP_SCALE));
}

const SPARKLE_POSITIONS: readonly {
  xShare: number;
  yShare: number;
  radius: number;
}[] = [
  { xShare: -0.62, yShare: 0.1, radius: 24 },
  { xShare: 0.62, yShare: 0.28, radius: 18 },
  { xShare: -0.58, yShare: 0.7, radius: 14 },
];
const SPARKLE_HALO_RADIUS_EXTRA = 12;
const SPARKLE_HALO_INNER_RATIO = 0.5;
const SPARKLE_HALO_STROKE_WIDTH = 10;
const SPARKLE_INNER_RATIO = 0.34;
const SPARKLE_STROKE_WIDTH = 5;

function drawSparkles(sketch: StickerSketch, frame: BlipFrame): void {
  for (const sparkle of SPARKLE_POSITIONS) {
    const x = frame.centerX + sparkle.xShare * frame.width;
    const y = frame.top + sparkle.yShare * frame.height;
    sketch.underlay(
      pathOf(
        fourPointStar(
          x,
          y,
          sparkle.radius + SPARKLE_HALO_RADIUS_EXTRA,
          SPARKLE_HALO_INNER_RATIO,
        ),
        {
          fill: STICKER_WHITE,
          stroke: STICKER_WHITE,
          strokeWidth: SPARKLE_HALO_STROKE_WIDTH,
          isClosed: true,
        },
      ),
    );
    sketch.paint(
      pathOf(fourPointStar(x, y, sparkle.radius, SPARKLE_INNER_RATIO), {
        fill: BLIP_COLORS.spark,
        stroke: STICKER_INK,
        strokeWidth: SPARKLE_STROKE_WIDTH,
        isClosed: true,
      }),
    );
  }
}

const ZZZ_MARKS: readonly {
  xShare: number;
  topOffset: number;
  size: number;
}[] = [
  { xShare: 0.5, topOffset: -10, size: 22 },
  { xShare: 0.66, topOffset: -56, size: 30 },
  { xShare: 0.5, topOffset: -112, size: 38 },
];
const ZZZ_INK_STROKE_WIDTH = 9;
/** Reference underlay stroke 28, painted stroke 9: same points both times. */
const ZZZ_HALO_CUT_WIDTH = 19;

function drawZzz(sketch: StickerSketch, frame: BlipFrame): void {
  for (const mark of ZZZ_MARKS) {
    const x = frame.centerX + mark.xShare * frame.width;
    const y = frame.top + mark.topOffset;
    const half = mark.size / 2;
    const points: Point[] = [
      [x - half, y - half],
      [x + half, y - half],
      [x - half, y + half],
      [x + half, y + half],
    ];
    sketch.silhouette(lineOf(points, STICKER_INK, ZZZ_INK_STROKE_WIDTH), {
      cutWidth: ZZZ_HALO_CUT_WIDTH,
    });
  }
}

const STEAM_SIDES: readonly number[] = [-1, 1];
const STEAM_X_SHARE = 0.56;
const STEAM_Y_SHARE = 0.02;
const STEAM_PUFFS: readonly {
  sideXOffset: number;
  yOffset: number;
  radius: number;
}[] = [
  { sideXOffset: 0, yOffset: 0, radius: 18 },
  { sideXOffset: 18, yOffset: -18, radius: 14 },
  { sideXOffset: -6, yOffset: -26, radius: 12 },
];
const STEAM_PUFF_STROKE_WIDTH = 5;
/** Reference underlay is the same circle, radius + 12, no stroke of its
 *  own: (STEAM_PUFF_STROKE_WIDTH + cutWidth) / 2 = 12. */
const STEAM_PUFF_HALO_CUT_WIDTH = 19;

function drawSteamPuffs(sketch: StickerSketch, frame: BlipFrame): void {
  for (const side of STEAM_SIDES) {
    const baseX = frame.centerX + side * frame.width * STEAM_X_SHARE;
    const baseY = frame.top + frame.height * STEAM_Y_SHARE;
    for (const puff of STEAM_PUFFS) {
      const puffX = baseX + side * puff.sideXOffset;
      const puffY = baseY + puff.yOffset;
      sketch.silhouette(
        ellipseOf(puffX, puffY, puff.radius, puff.radius, {
          fill: BLIP_COLORS.steam,
          stroke: STICKER_INK,
          strokeWidth: STEAM_PUFF_STROKE_WIDTH,
        }),
        { cutWidth: STEAM_PUFF_HALO_CUT_WIDTH },
      );
    }
  }
}

const CONFETTI_BITS: readonly {
  xShare: number;
  yShare: number;
  color: string;
  rotationDeg: number;
}[] = [
  { xShare: -0.62, yShare: 0.05, color: "#e40303", rotationDeg: 20 },
  { xShare: 0.66, yShare: 0.0, color: "#004dff", rotationDeg: -30 },
  { xShare: -0.7, yShare: 0.55, color: "#ffed00", rotationDeg: 45 },
  { xShare: 0.72, yShare: 0.5, color: "#008026", rotationDeg: 10 },
  { xShare: -0.3, yShare: -0.3, color: "#750787", rotationDeg: -20 },
  { xShare: 0.36, yShare: -0.28, color: "#ff8c00", rotationDeg: 35 },
];
const CONFETTI_HALO_HALF_WIDTH = 16;
const CONFETTI_HALO_HALF_HEIGHT = 9;
const CONFETTI_HALO_RADIUS = 4;
const CONFETTI_HALO_STROKE_WIDTH = 16;
const CONFETTI_PIECE_HALF_WIDTH = 11;
const CONFETTI_PIECE_HALF_HEIGHT = 5;
const CONFETTI_PIECE_RADIUS = 3;
const CONFETTI_PIECE_STROKE_WIDTH = 4;

function confettiRect(
  centerX: number,
  centerY: number,
  halfWidth: number,
  halfHeight: number,
  radius: number,
  rotationDeg: number,
  style: PaintStyle,
): Primitive {
  const rect = rectOf(
    centerX - halfWidth,
    centerY - halfHeight,
    halfWidth * 2,
    halfHeight * 2,
    radius,
    style,
  );
  return rotateAbout([rect], rotationDeg, centerX, centerY);
}

function drawConfetti(sketch: StickerSketch, frame: BlipFrame): void {
  for (const bit of CONFETTI_BITS) {
    const x = frame.centerX + bit.xShare * frame.width;
    const y = frame.top + bit.yShare * frame.height;
    sketch.underlay(
      confettiRect(
        x,
        y,
        CONFETTI_HALO_HALF_WIDTH,
        CONFETTI_HALO_HALF_HEIGHT,
        CONFETTI_HALO_RADIUS,
        bit.rotationDeg,
        {
          fill: STICKER_WHITE,
          stroke: STICKER_WHITE,
          strokeWidth: CONFETTI_HALO_STROKE_WIDTH,
        },
      ),
    );
    sketch.paint(
      confettiRect(
        x,
        y,
        CONFETTI_PIECE_HALF_WIDTH,
        CONFETTI_PIECE_HALF_HEIGHT,
        CONFETTI_PIECE_RADIUS,
        bit.rotationDeg,
        {
          fill: bit.color,
          stroke: STICKER_INK,
          strokeWidth: CONFETTI_PIECE_STROKE_WIDTH,
        },
      ),
    );
  }
}

const MOTION_LINES: readonly { yOffset: number; length: number }[] = [
  { yOffset: -40, length: 60 },
  { yOffset: 0, length: 90 },
  { yOffset: 40, length: 60 },
];
const MOTION_START_X_OFFSET = 30;
const MOTION_INK_STROKE_WIDTH = 9;
/** Reference underlay stroke 28, painted stroke 9: same points both times. */
const MOTION_HALO_CUT_WIDTH = 19;

function drawMotionLines(sketch: StickerSketch, frame: BlipFrame): void {
  const leftEdgeX = frame.centerX - frame.width / 2;
  const startX = leftEdgeX - MOTION_START_X_OFFSET;
  for (const line of MOTION_LINES) {
    const y = frame.centerY + line.yOffset;
    const points: Point[] = [
      [startX - line.length, y],
      [startX, y],
    ];
    sketch.silhouette(lineOf(points, STICKER_INK, MOTION_INK_STROKE_WIDTH), {
      cutWidth: MOTION_HALO_CUT_WIDTH,
    });
  }
}

const HEAT_X_OFFSETS: readonly number[] = [-70, 0, 70];
const HEAT_START_Y_OFFSET = 30;
const HEAT_WAVE_AMPLITUDE = 8;
const HEAT_WAVE_PERIOD = 1.7;
const HEAT_STEP_Y = 5;
const HEAT_STEPS = 12;
const HEAT_STROKE_WIDTH = 8;
/** Reference underlay stroke 26, painted stroke 8: same points both times. */
const HEAT_HALO_CUT_WIDTH = 18;

function drawHeatWaves(sketch: StickerSketch, frame: BlipFrame): void {
  for (const offsetX of HEAT_X_OFFSETS) {
    const points: Point[] = [];
    for (let stepIndex = 0; stepIndex <= HEAT_STEPS; stepIndex += 1) {
      points.push([
        frame.centerX +
          offsetX +
          Math.sin(stepIndex / HEAT_WAVE_PERIOD) * HEAT_WAVE_AMPLITUDE,
        frame.top - HEAT_START_Y_OFFSET - stepIndex * HEAT_STEP_Y,
      ]);
    }
    sketch.silhouette(lineOf(points, BLIP_COLORS.heat, HEAT_STROKE_WIDTH), {
      cutWidth: HEAT_HALO_CUT_WIDTH,
    });
  }
}

const FLOAT_HEARTS: readonly {
  xShare: number;
  yShare: number;
  scale: number;
}[] = [
  { xShare: -0.62, yShare: 0.05, scale: 1.3 },
  { xShare: 0.64, yShare: 0.25, scale: 1.0 },
];
const FLOAT_HEART_STROKE_WIDTH = 5;
/** Reference underlay stroke 26, painted stroke 5: same heart points, same
 *  scale, both times. */
const FLOAT_HEART_HALO_CUT_WIDTH = 21;

function drawFloatHearts(sketch: StickerSketch, frame: BlipFrame): void {
  for (const heart of FLOAT_HEARTS) {
    const x = frame.centerX + heart.xShare * frame.width;
    const y = frame.top + heart.yShare * frame.height;
    sketch.silhouette(
      pathOf(heartPoints(x, y, heart.scale), {
        fill: BLIP_COLORS.heart,
        stroke: STICKER_INK,
        strokeWidth: FLOAT_HEART_STROKE_WIDTH,
        isClosed: true,
      }),
      { cutWidth: FLOAT_HEART_HALO_CUT_WIDTH },
    );
  }
}

/** `sweat`, `sparkles`, `zzz`, `steam`, `confetti`, `motion`, `heat`,
 *  `floatHearts`: everything that floats outside the body. */
export function drawBlipOutsideExtras(
  sketch: StickerSketch,
  frame: BlipFrame,
  pose: BlipPose,
): void {
  const extras = pose.extras ?? [];
  if (extras.includes("sweat")) drawSweatDrop(sketch, frame);
  if (extras.includes("sparkles")) drawSparkles(sketch, frame);
  if (extras.includes("zzz")) drawZzz(sketch, frame);
  if (extras.includes("steam")) drawSteamPuffs(sketch, frame);
  if (extras.includes("confetti")) drawConfetti(sketch, frame);
  if (extras.includes("motion")) drawMotionLines(sketch, frame);
  if (extras.includes("heat")) drawHeatWaves(sketch, frame);
  if (extras.includes("floatHearts")) drawFloatHearts(sketch, frame);
}

import { arc, heartPoints, type Point } from "../../kit/curves";
import { STICKER_INK, STICKER_WHITE } from "../../kit/palette";
import { ellipseOf, lineOf, pathOf, rectOf } from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import { BLIP_COLORS, type BlipFrame, type BlipPose } from "../blip.params";

/**
 * Blip's arm poses, ported from `blip-reference.mjs`'s `nub` helper and its
 * `switch (pose.arms)`. Facepalm-only cases (`facepalm`, `palmOne`,
 * `palmTwo`, `palmForehead`) are out of scope; `BlipArms` never includes
 * them.
 *
 * A "back" nub sits behind the body (the template must call
 * `drawBlipBackArms` before painting the body) and is a real silhouette: the
 * reference draws an independent white ellipse, radius + 16 on each axis,
 * behind it. Silhouetting the same painted ellipse with
 * `NUB_BACK_HALO_CUT_WIDTH` grows the underlay stroke to
 * `NUB_INK_STROKE_WIDTH + cutWidth` = 32, whose half-width (16) reproduces
 * that margin. A "front" nub is paint-only, matching the reference (only a
 * `layer === back` nub gets an `under.push`).
 */

const NUB_INK_STROKE_WIDTH = 7;
const NUB_DEFAULT_RADIUS_X = 32;
const NUB_DEFAULT_RADIUS_Y = 21;
const NUB_BACK_HALO_CUT_WIDTH = 25;

function drawNub(
  sketch: StickerSketch,
  frame: BlipFrame,
  x: number,
  y: number,
  angleDeg: number,
  layer: "back" | "front",
  radiusX: number = NUB_DEFAULT_RADIUS_X,
  radiusY: number = NUB_DEFAULT_RADIUS_Y,
): void {
  const nubEllipse = ellipseOf(x, y, radiusX, radiusY, {
    rotationDeg: angleDeg,
    fill: frame.armColor,
    stroke: STICKER_INK,
    strokeWidth: NUB_INK_STROKE_WIDTH,
  });
  if (layer === "back") {
    sketch.silhouette(nubEllipse, { cutWidth: NUB_BACK_HALO_CUT_WIDTH });
  } else {
    sketch.paint(nubEllipse);
  }
}

const WAVE_NUB_ANGLE_DEG = -55;
const WAVE_NUB_X_OFFSET = 10;
const WAVE_NUB_Y_OFFSET = -34;
const WAVE_ARC_LENGTHS: readonly number[] = [52, 70];
const WAVE_ARC_X_OFFSET = 30;
const WAVE_ARC_STEPS = 8;
const WAVE_ARC_STROKE_WIDTH = 7;
/** Reference underlay stroke 24, painted arc stroke 7. */
const WAVE_ARC_HALO_CUT_WIDTH = 17;

function drawWaveArm(sketch: StickerSketch, frame: BlipFrame): void {
  const rightEdgeX = frame.centerX + frame.width / 2;
  const handX = rightEdgeX + WAVE_NUB_X_OFFSET;
  const handY = frame.centerY + WAVE_NUB_Y_OFFSET;
  drawNub(sketch, frame, handX, handY, WAVE_NUB_ANGLE_DEG, "back");
  for (const armLength of WAVE_ARC_LENGTHS) {
    const arcPoints = arc(
      rightEdgeX + WAVE_ARC_X_OFFSET,
      handY - armLength,
      rightEdgeX + WAVE_ARC_X_OFFSET + armLength * 0.8,
      handY - armLength * 0.3,
      -armLength * 0.2,
      WAVE_ARC_STEPS,
    );
    sketch.silhouette(lineOf(arcPoints, STICKER_INK, WAVE_ARC_STROKE_WIDTH), {
      cutWidth: WAVE_ARC_HALO_CUT_WIDTH,
    });
  }
}

const UP_NUB_TOP_OFFSET = 18;
const UP_NUB_SIDE_OFFSET = 26;
const UP_NUB_ANGLE_DEG = 62;
const UP_NUB_RADIUS_X = 36;
const UP_NUB_RADIUS_Y = 22;

function drawUpArms(sketch: StickerSketch, frame: BlipFrame): void {
  const leftEdgeX = frame.centerX - frame.width / 2;
  const rightEdgeX = frame.centerX + frame.width / 2;
  const nubY = frame.top + UP_NUB_TOP_OFFSET;
  drawNub(
    sketch,
    frame,
    leftEdgeX - UP_NUB_SIDE_OFFSET,
    nubY,
    UP_NUB_ANGLE_DEG,
    "back",
    UP_NUB_RADIUS_X,
    UP_NUB_RADIUS_Y,
  );
  drawNub(
    sketch,
    frame,
    rightEdgeX + UP_NUB_SIDE_OFFSET,
    nubY,
    -UP_NUB_ANGLE_DEG,
    "back",
    UP_NUB_RADIUS_X,
    UP_NUB_RADIUS_Y,
  );
}

const HIPS_NUB_SIDE_OFFSET = 4;
const HIPS_NUB_CENTER_Y_OFFSET = 44;
const HIPS_NUB_ANGLE_DEG = 60;
const HIPS_NUB_RADIUS_X = 30;
const HIPS_NUB_RADIUS_Y = 18;

function drawHipsArms(sketch: StickerSketch, frame: BlipFrame): void {
  const leftEdgeX = frame.centerX - frame.width / 2;
  const rightEdgeX = frame.centerX + frame.width / 2;
  const nubY = frame.centerY + HIPS_NUB_CENTER_Y_OFFSET;
  drawNub(
    sketch,
    frame,
    leftEdgeX - HIPS_NUB_SIDE_OFFSET,
    nubY,
    -HIPS_NUB_ANGLE_DEG,
    "back",
    HIPS_NUB_RADIUS_X,
    HIPS_NUB_RADIUS_Y,
  );
  drawNub(
    sketch,
    frame,
    rightEdgeX + HIPS_NUB_SIDE_OFFSET,
    nubY,
    HIPS_NUB_ANGLE_DEG,
    "back",
    HIPS_NUB_RADIUS_X,
    HIPS_NUB_RADIUS_Y,
  );
}

const SHRUG_NUB_SIDE_OFFSET = 18;
const SHRUG_NUB_CENTER_Y_OFFSET = 6;
const SHRUG_NUB_ANGLE_DEG = 25;

function drawShrugArms(sketch: StickerSketch, frame: BlipFrame): void {
  const leftEdgeX = frame.centerX - frame.width / 2;
  const rightEdgeX = frame.centerX + frame.width / 2;
  const nubY = frame.centerY + SHRUG_NUB_CENTER_Y_OFFSET;
  drawNub(
    sketch,
    frame,
    leftEdgeX - SHRUG_NUB_SIDE_OFFSET,
    nubY,
    -SHRUG_NUB_ANGLE_DEG,
    "back",
  );
  drawNub(
    sketch,
    frame,
    rightEdgeX + SHRUG_NUB_SIDE_OFFSET,
    nubY,
    SHRUG_NUB_ANGLE_DEG,
    "back",
  );
}

/** Confetti (extras.ts) keeps its own inline copy: the two files draw
 *  unrelated pieces and neither should import art constants from the
 *  other. */
const FAN_RAINBOW_COLORS: readonly string[] = [
  "#e40303",
  "#ff8c00",
  "#ffed00",
  "#008026",
  "#004dff",
  "#750787",
];
const FAN_WEDGE_START_ANGLE_DEG = -150;
const FAN_WEDGE_SPAN_DEG = 22;
const FAN_WEDGE_RADIUS = 120;
const FAN_WEDGE_INK_STROKE_WIDTH = 5;
/** Reference underlay stroke 30, painted wedge stroke 5. */
const FAN_WEDGE_HALO_CUT_WIDTH = 25;
const FAN_RIVET_RADIUS = 9;
const FAN_RIVET_STROKE_WIDTH = 5;
const FAN_HAND_X_OFFSET = 18;
const FAN_HAND_Y_OFFSET = 20;
const FAN_NUB_X_OFFSET = -4;
const FAN_NUB_Y_OFFSET = 10;
const FAN_NUB_ANGLE_DEG = -40;
const FAN_NUB_RADIUS_X = 26;
const FAN_NUB_RADIUS_Y = 18;

function drawFanArm(sketch: StickerSketch, frame: BlipFrame): void {
  const rightEdgeX = frame.centerX + frame.width / 2;
  const pivotX = rightEdgeX + FAN_HAND_X_OFFSET;
  const pivotY = frame.centerY + FAN_HAND_Y_OFFSET;
  for (
    let wedgeIndex = 0;
    wedgeIndex < FAN_RAINBOW_COLORS.length;
    wedgeIndex += 1
  ) {
    const startAngle =
      ((FAN_WEDGE_START_ANGLE_DEG + wedgeIndex * FAN_WEDGE_SPAN_DEG) *
        Math.PI) /
      180;
    const endAngle =
      ((FAN_WEDGE_START_ANGLE_DEG + (wedgeIndex + 1) * FAN_WEDGE_SPAN_DEG) *
        Math.PI) /
      180;
    const wedgePoints: Point[] = [
      [pivotX, pivotY],
      [
        pivotX + Math.cos(startAngle) * FAN_WEDGE_RADIUS,
        pivotY + Math.sin(startAngle) * FAN_WEDGE_RADIUS,
      ],
      [
        pivotX + Math.cos(endAngle) * FAN_WEDGE_RADIUS,
        pivotY + Math.sin(endAngle) * FAN_WEDGE_RADIUS,
      ],
    ];
    sketch.silhouette(
      pathOf(wedgePoints, {
        fill: FAN_RAINBOW_COLORS[wedgeIndex],
        stroke: STICKER_INK,
        strokeWidth: FAN_WEDGE_INK_STROKE_WIDTH,
        isClosed: true,
      }),
      { cutWidth: FAN_WEDGE_HALO_CUT_WIDTH },
    );
  }
  sketch.paint(
    ellipseOf(pivotX, pivotY, FAN_RIVET_RADIUS, FAN_RIVET_RADIUS, {
      fill: BLIP_COLORS.cream,
      stroke: STICKER_INK,
      strokeWidth: FAN_RIVET_STROKE_WIDTH,
    }),
  );
  drawNub(
    sketch,
    frame,
    pivotX + FAN_NUB_X_OFFSET,
    pivotY + FAN_NUB_Y_OFFSET,
    FAN_NUB_ANGLE_DEG,
    "back",
    FAN_NUB_RADIUS_X,
    FAN_NUB_RADIUS_Y,
  );
}

/** `wave` (plus its two motion arcs), `up`, `hips`, `shrug`, `fan` (the
 *  rainbow fan and its rivet). Call before painting the body: these render
 *  behind it. */
export function drawBlipBackArms(
  sketch: StickerSketch,
  frame: BlipFrame,
  pose: BlipPose,
): void {
  switch (pose.arms) {
    case "wave":
      drawWaveArm(sketch, frame);
      return;
    case "up":
      drawUpArms(sketch, frame);
      return;
    case "hips":
      drawHipsArms(sketch, frame);
      return;
    case "shrug":
      drawShrugArms(sketch, frame);
      return;
    case "fan":
      drawFanArm(sketch, frame);
      return;
    default:
      return;
  }
}

const HUG_HEART_CENTER_Y_SHARE_OF_HEIGHT = 0.24;
const HUG_HEART_SCALE = 3.3;
const HUG_HEART_STROKE_WIDTH = 7;
const HUG_NUB_X_OFFSET = 52;
const HUG_NUB_Y_OFFSET = 8;
const HUG_NUB_ANGLE_DEG = 30;

function drawHugArms(sketch: StickerSketch, frame: BlipFrame): void {
  const heartX = frame.centerX;
  const heartY =
    frame.centerY + frame.height * HUG_HEART_CENTER_Y_SHARE_OF_HEIGHT;
  sketch.paint(
    pathOf(heartPoints(heartX, heartY, HUG_HEART_SCALE), {
      fill: BLIP_COLORS.heart,
      stroke: STICKER_INK,
      strokeWidth: HUG_HEART_STROKE_WIDTH,
      isClosed: true,
    }),
  );
  drawNub(
    sketch,
    frame,
    heartX - HUG_NUB_X_OFFSET,
    heartY + HUG_NUB_Y_OFFSET,
    HUG_NUB_ANGLE_DEG,
    "front",
  );
  drawNub(
    sketch,
    frame,
    heartX + HUG_NUB_X_OFFSET,
    heartY + HUG_NUB_Y_OFFSET,
    -HUG_NUB_ANGLE_DEG,
    "front",
  );
}

const CHIN_NUB_X_OFFSET = 34;
const CHIN_NUB_Y_OFFSET = 30;
const CHIN_NUB_ANGLE_DEG = -40;
const CHIN_NUB_RADIUS_X = 28;
const CHIN_NUB_RADIUS_Y = 19;

function drawChinArm(sketch: StickerSketch, frame: BlipFrame): void {
  drawNub(
    sketch,
    frame,
    frame.faceX + CHIN_NUB_X_OFFSET,
    frame.mouthY + CHIN_NUB_Y_OFFSET,
    CHIN_NUB_ANGLE_DEG,
    "front",
    CHIN_NUB_RADIUS_X,
    CHIN_NUB_RADIUS_Y,
  );
}

const TOGETHER_NUB_X_OFFSET = 22;
const TOGETHER_NUB_CENTER_Y_SHARE_OF_HEIGHT = 0.3;
const TOGETHER_NUB_ANGLE_DEG = 18;
const TOGETHER_NUB_RADIUS_X = 30;
const TOGETHER_NUB_RADIUS_Y = 18;

function drawTogetherArms(sketch: StickerSketch, frame: BlipFrame): void {
  const nubY =
    frame.centerY + frame.height * TOGETHER_NUB_CENTER_Y_SHARE_OF_HEIGHT;
  drawNub(
    sketch,
    frame,
    frame.centerX - TOGETHER_NUB_X_OFFSET,
    nubY,
    TOGETHER_NUB_ANGLE_DEG,
    "front",
    TOGETHER_NUB_RADIUS_X,
    TOGETHER_NUB_RADIUS_Y,
  );
  drawNub(
    sketch,
    frame,
    frame.centerX + TOGETHER_NUB_X_OFFSET,
    nubY,
    -TOGETHER_NUB_ANGLE_DEG,
    "front",
    TOGETHER_NUB_RADIUS_X,
    TOGETHER_NUB_RADIUS_Y,
  );
}

const CUP_X_OFFSET = 14;
const CUP_Y_OFFSET = 22;
const CUP_RIM_HALF_WIDTH = 50;
const CUP_RIM_Y_OFFSET = 36;
const CUP_BOWL_BULGE = 84;
const CUP_STROKE_WIDTH = 7;
const CUP_BAND_HALF_WIDTH = 40;
const CUP_BAND_Y_OFFSET = 22;
const CUP_BAND_WIDTH = 80;
const CUP_BAND_HEIGHT = 12;
const CUP_BAND_RADIUS = 6;
const CUP_HANDLE_X_OFFSET = 60;
const CUP_HANDLE_Y_OFFSET = 4;
const CUP_HANDLE_RADIUS_X = 17;
const CUP_HANDLE_RADIUS_Y = 20;
const CUP_STEAM_X_OFFSETS: readonly number[] = [-14, 12];
const CUP_STEAM_TOP_Y_OFFSET = 46;
const CUP_STEAM_STEP_Y = 4;
const CUP_STEAM_WAVE_AMPLITUDE = 5;
const CUP_STEAM_WAVE_PERIOD = 1.3;
const CUP_STEAM_STEPS = 8;
const CUP_STEAM_STROKE_WIDTH = 7;
const CUP_NUB_X_OFFSET = 52;
const CUP_NUB_Y_OFFSET = 30;
const CUP_NUB_ANGLE_DEG = -20;
const CUP_NUB_RADIUS_X = 28;
const CUP_NUB_RADIUS_Y = 19;

function drawCupArm(sketch: StickerSketch, frame: BlipFrame): void {
  const cupX = frame.faceX + CUP_X_OFFSET;
  const cupY = frame.mouthY + CUP_Y_OFFSET;
  const rimTopY = cupY - CUP_RIM_Y_OFFSET;
  const rimPoints: Point[] = [
    [cupX - CUP_RIM_HALF_WIDTH, rimTopY],
    [cupX + CUP_RIM_HALF_WIDTH, rimTopY],
    ...arc(
      cupX + CUP_RIM_HALF_WIDTH,
      rimTopY,
      cupX - CUP_RIM_HALF_WIDTH,
      rimTopY,
      CUP_BOWL_BULGE,
    ).slice(1),
  ];
  sketch.paint(
    pathOf(rimPoints, {
      fill: BLIP_COLORS.cream,
      stroke: STICKER_INK,
      strokeWidth: CUP_STROKE_WIDTH,
      isClosed: true,
    }),
  );
  sketch.paint(
    rectOf(
      cupX - CUP_BAND_HALF_WIDTH,
      cupY - CUP_BAND_Y_OFFSET,
      CUP_BAND_WIDTH,
      CUP_BAND_HEIGHT,
      CUP_BAND_RADIUS,
      { fill: BLIP_COLORS.coral },
    ),
  );
  sketch.paint(
    ellipseOf(
      cupX + CUP_HANDLE_X_OFFSET,
      cupY - CUP_HANDLE_Y_OFFSET,
      CUP_HANDLE_RADIUS_X,
      CUP_HANDLE_RADIUS_Y,
      { stroke: STICKER_INK, strokeWidth: CUP_STROKE_WIDTH },
    ),
  );
  for (const steamOffsetX of CUP_STEAM_X_OFFSETS) {
    const steamPoints: Point[] = [];
    for (let stepIndex = 0; stepIndex <= CUP_STEAM_STEPS; stepIndex += 1) {
      steamPoints.push([
        cupX +
          steamOffsetX +
          Math.sin(stepIndex / CUP_STEAM_WAVE_PERIOD) *
            CUP_STEAM_WAVE_AMPLITUDE,
        cupY - CUP_STEAM_TOP_Y_OFFSET - stepIndex * CUP_STEAM_STEP_Y,
      ]);
    }
    sketch.paint(lineOf(steamPoints, STICKER_WHITE, CUP_STEAM_STROKE_WIDTH));
  }
  drawNub(
    sketch,
    frame,
    cupX + CUP_NUB_X_OFFSET,
    cupY + CUP_NUB_Y_OFFSET,
    CUP_NUB_ANGLE_DEG,
    "front",
    CUP_NUB_RADIUS_X,
    CUP_NUB_RADIUS_Y,
  );
}

/** `hug` (heart plus two nubs), `chin`, `together`, `cup` (teacup, coral
 *  band, handle, white steam, nub). Call after the face: these render in
 *  front of the body. */
export function drawBlipFrontArms(
  sketch: StickerSketch,
  frame: BlipFrame,
  pose: BlipPose,
): void {
  switch (pose.arms) {
    case "hug":
      drawHugArms(sketch, frame);
      return;
    case "chin":
      drawChinArm(sketch, frame);
      return;
    case "together":
      drawTogetherArms(sketch, frame);
      return;
    case "cup":
      drawCupArm(sketch, frame);
      return;
    default:
      return;
  }
}

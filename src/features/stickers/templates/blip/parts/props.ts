import { heartPoints, type Point } from "../../kit/curves";
import { STICKER_INK } from "../../kit/palette";
import { pathOf, rectOf } from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import { BLIP_COLORS, type BlipFrame, type BlipPose } from "../blip.params";

/**
 * Blip's props, ported from `blip-reference.mjs`'s `pose.prop === "house"`
 * block. `house` is the only prop `BlipProp` defines.
 */

const HOUSE_LEFT_OFFSET = 70;
const HOUSE_HALF_WIDTH = 60;
const HOUSE_WALL_HEIGHT = 80;
const HOUSE_ROOF_HEIGHT = 136;
const HOUSE_BODY_STROKE_WIDTH = 8;
/** Reference underlay stroke 44, painted house-body stroke 8. */
const HOUSE_BODY_HALO_CUT_WIDTH = 36;
const HOUSE_ROOF_OUTLINE_HALF_WIDTH = 74;
const HOUSE_ROOF_OUTLINE_Y_OFFSET = 70;
const HOUSE_ROOF_PEAK_Y_OFFSET = 146;
const HOUSE_ROOF_CORAL_STROKE_WIDTH = 16;
const HOUSE_ROOF_INK_STROKE_WIDTH = 4;
const HOUSE_DOOR_HALF_WIDTH = 18;
const HOUSE_DOOR_HEIGHT = 52;
const HOUSE_DOOR_RADIUS = 6;
const HOUSE_DOOR_STROKE_WIDTH = 6;
const HOUSE_HEART_Y_OFFSET = 88;
const HOUSE_HEART_SCALE = 0.95;
const HOUSE_HEART_STROKE_WIDTH = 4;

/** `house`: a little cream cottage with a coral roof edge, door and heart,
 *  planted to the body's left. */
export function drawBlipProp(
  sketch: StickerSketch,
  frame: BlipFrame,
  pose: BlipPose,
): void {
  if (pose.prop !== "house") return;

  const houseX = frame.centerX - frame.width / 2 - HOUSE_LEFT_OFFSET;
  const houseY = frame.baseY;
  const wallTopY = houseY - HOUSE_WALL_HEIGHT;

  const bodyPoints: Point[] = [
    [houseX - HOUSE_HALF_WIDTH, houseY],
    [houseX - HOUSE_HALF_WIDTH, wallTopY],
    [houseX, houseY - HOUSE_ROOF_HEIGHT],
    [houseX + HOUSE_HALF_WIDTH, wallTopY],
    [houseX + HOUSE_HALF_WIDTH, houseY],
  ];
  sketch.silhouette(
    pathOf(bodyPoints, {
      fill: BLIP_COLORS.cream,
      stroke: STICKER_INK,
      strokeWidth: HOUSE_BODY_STROKE_WIDTH,
      isClosed: true,
    }),
    { cutWidth: HOUSE_BODY_HALO_CUT_WIDTH },
  );

  const roofOutlineY = houseY - HOUSE_ROOF_OUTLINE_Y_OFFSET;
  const roofPeakY = houseY - HOUSE_ROOF_PEAK_Y_OFFSET;
  const roofPoints: Point[] = [
    [houseX - HOUSE_ROOF_OUTLINE_HALF_WIDTH, roofOutlineY],
    [houseX, roofPeakY],
    [houseX + HOUSE_ROOF_OUTLINE_HALF_WIDTH, roofOutlineY],
  ];
  sketch.paint(
    pathOf(roofPoints, {
      stroke: BLIP_COLORS.coral,
      strokeWidth: HOUSE_ROOF_CORAL_STROKE_WIDTH,
      isClosed: false,
      lineCap: "round",
    }),
  );
  sketch.paint(
    pathOf(roofPoints, {
      stroke: STICKER_INK,
      strokeWidth: HOUSE_ROOF_INK_STROKE_WIDTH,
      isClosed: false,
      lineCap: "round",
    }),
  );

  sketch.paint(
    rectOf(
      houseX - HOUSE_DOOR_HALF_WIDTH,
      houseY - HOUSE_DOOR_HEIGHT,
      HOUSE_DOOR_HALF_WIDTH * 2,
      HOUSE_DOOR_HEIGHT,
      HOUSE_DOOR_RADIUS,
      {
        fill: BLIP_COLORS.coral,
        stroke: STICKER_INK,
        strokeWidth: HOUSE_DOOR_STROKE_WIDTH,
      },
    ),
  );

  sketch.paint(
    pathOf(
      heartPoints(houseX, houseY - HOUSE_HEART_Y_OFFSET, HOUSE_HEART_SCALE),
      {
        fill: BLIP_COLORS.heart,
        stroke: STICKER_INK,
        strokeWidth: HOUSE_HEART_STROKE_WIDTH,
        isClosed: true,
      },
    ),
  );
}

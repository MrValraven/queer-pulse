import {
  flagStripesOf,
  STRIPED_FLAG_IDS,
} from "../../../../../shared/data/flagStripes.data";
import {
  flagBodyPrimitives,
  flagColorShares,
  type FlagBox,
} from "../../flagArt";
import { toPathCommands, type Point } from "../../kit/curves";
import { ellipseOf, pathOf } from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import type { GroupPrimitive, Primitive } from "../../primitives";
import {
  BLIP_COLORS,
  type BlipFrame,
  type BlipPose,
  type BlipStyle,
} from "../blip.params";

/**
 * Blip's body: the squircle silhouette every part places itself against
 * (`blipFrame`), and the fill pass that paints it (`drawBlipBody`). Ported
 * from the top of `renderBlip` in `blip-reference.mjs`.
 */

const CENTER_X = 256;
const BASE_Y = 430;
const BASE_WIDTH = 300;
const BASE_HEIGHT = 250;
const WIDTH_MELT_FACTOR = 0.1;
const HEIGHT_MELT_FACTOR = 0.12;
const BODY_POINT_COUNT = 144;
const SUPERELLIPSE_EXPONENT = 3.2;
const LOWER_HALF_SPREAD_MELT_FACTOR = 0.12;
const EYE_Y_HEIGHT_SHARE = 0.48;
const EYE_GAP_WIDTH_SHARE = 0.18;
const MOUTH_Y_HEIGHT_SHARE = 0.2;
const ANTENNA_X_WIDTH_SHARE = 0.06;
const ANTENNA_Y_OFFSET = 6;
const DEFAULT_LOOK: readonly [number, number] = [0, 0];

/** Reference painted fill has no stroke of its own (the keyline is a
 *  separate path), so cutWidth is the reference underlay's own stroke-width:
 *  `under.push(... stroke-width="44" ...)`, blip-reference.mjs line 87. */
const BODY_CUT_WIDTH = 44;
const BODY_KEYLINE_STROKE_WIDTH = 8;
const FORM_SHADOW_CENTER_Y_HEIGHT_SHARE = 0.55;
const FORM_SHADOW_RADIUS_X_WIDTH_SHARE = 0.75;
const FORM_SHADOW_RADIUS_Y_HEIGHT_SHARE = 0.42;
const SHINE_RADIUS_X = 22;
const SHINE_RADIUS_Y = 12;
const SHINE_ROTATION_DEG = -35;
const SHINE_CENTER_X_WIDTH_SHARE = 0.3;
const SHINE_CENTER_Y_HEIGHT_SHARE = 0.2;

/** `Math.sign(value) * Math.abs(value) ** (2 / exponent)`, the superellipse
 *  radius term the reference applies to both cos(t) and sin(t). */
function superellipseTerm(value: number): number {
  return Math.sign(value) * Math.abs(value) ** (2 / SUPERELLIPSE_EXPONENT);
}

/** 144 superellipse points at exponent 3.2, with the lower half spread out
 *  by `melt` (blip-reference.mjs lines 79-84). */
function bodySuperellipsePoints(
  centerX: number,
  centerY: number,
  halfWidth: number,
  halfHeight: number,
  melt: number,
): Point[] {
  const points: Point[] = [];
  for (let pointIndex = 0; pointIndex < BODY_POINT_COUNT; pointIndex += 1) {
    const angle = (pointIndex / BODY_POINT_COUNT) * Math.PI * 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const spread = 1 + Math.max(0, sine) * melt * LOWER_HALF_SPREAD_MELT_FACTOR;
    points.push([
      centerX + halfWidth * spread * superellipseTerm(cosine),
      centerY + halfHeight * superellipseTerm(sine),
    ]);
  }
  return points;
}

/** The body colour, or, for a flag body, the flag's middle colour
 *  (blip-reference.mjs line 61: `fill[Math.floor(fill.length / 2)]`, taken
 *  against the raw band list, e.g. white for the transgender flag). A
 *  striped flag reads its raw, undeduplicated band list from
 *  `flagStripesOf`, matching the approved preview exactly. Progress and
 *  Intersex are drawn as shapes (`flagArt.ts` gives them their own
 *  geometry), so `STRIPED_FLAG_IDS` does not cover them; for those two,
 *  `flagColorShares`' deduplicated middle entry is the closest equivalent. */
function armColorOf(style: BlipStyle): string {
  const bodyFlagId = style.bodyFlagId;
  if (!bodyFlagId) return style.bodyColor;
  if (STRIPED_FLAG_IDS.includes(bodyFlagId)) {
    const bands = flagStripesOf(bodyFlagId);
    const middleIndex = Math.floor(bands.length / 2);
    return bands[middleIndex]?.color ?? style.bodyColor;
  }
  const shares = flagColorShares(bodyFlagId);
  const middleIndex = Math.floor(shares.length / 2);
  return shares[middleIndex]?.color ?? style.bodyColor;
}

/** Port of `renderBlip`'s body geometry and face grid (blip-reference.mjs
 *  lines 70-102, 138-144). */
export function blipFrame(pose: BlipPose, style: BlipStyle): BlipFrame {
  const squash = pose.squash ?? 1;
  const melt = pose.melt ?? 0;
  const width = BASE_WIDTH * Math.sqrt(squash) * (1 + melt * WIDTH_MELT_FACTOR);
  const height =
    (BASE_HEIGHT / Math.sqrt(squash)) * (1 - melt * HEIGHT_MELT_FACTOR);
  const centerY = BASE_Y - height / 2;
  const top = BASE_Y - height;
  const points = bodySuperellipsePoints(
    CENTER_X,
    centerY,
    width / 2,
    height / 2,
    melt,
  );
  const eyeY = top + height * EYE_Y_HEIGHT_SHARE + (pose.faceDrop ?? 0);
  const eyeGap = width * EYE_GAP_WIDTH_SHARE;
  const faceX = CENTER_X + (pose.faceShift ?? 0);
  const mouthY = eyeY + height * MOUTH_Y_HEIGHT_SHARE;
  const mouthX = faceX + (pose.mouthShift ?? 0);

  return {
    centerX: CENTER_X,
    baseY: BASE_Y,
    width,
    height,
    top,
    centerY,
    melt,
    bodyPoints: points,
    bodyPath: toPathCommands(points, true),
    eyeY,
    faceX,
    eyeGap,
    leftEyeX: faceX - eyeGap,
    rightEyeX: faceX + eyeGap,
    mouthX,
    mouthY,
    look: pose.look ?? DEFAULT_LOOK,
    isFlagBody: style.bodyFlagId !== null,
    armColor: armColorOf(style),
    antennaX: CENTER_X - width * ANTENNA_X_WIDTH_SHARE,
    antennaY: top + ANTENNA_Y_OFFSET,
  };
}

function bodyPointsXBounds(frame: BlipFrame): { minX: number; maxX: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  for (const [x] of frame.bodyPoints) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
  }
  return { minX, maxX };
}

/** A flag body: the body's bounding box, filled with the flag's own art,
 *  clipped to the squircle. No shadow and no shine (blip-reference.mjs
 *  lines 89-92). */
function flagBodyGroup(frame: BlipFrame, bodyFlagId: string): GroupPrimitive {
  const { minX, maxX } = bodyPointsXBounds(frame);
  const box: FlagBox = {
    x: minX,
    y: frame.top,
    width: maxX - minX,
    height: frame.height,
  };
  return {
    type: "group",
    clipPath: frame.bodyPath,
    children: flagBodyPrimitives(bodyFlagId, box),
  };
}

/** The flat form shadow: a darker ellipse clipped to the body
 *  (blip-reference.mjs line 96). */
function formShadowGroup(frame: BlipFrame): GroupPrimitive {
  return {
    type: "group",
    clipPath: frame.bodyPath,
    children: [
      ellipseOf(
        frame.centerX,
        frame.baseY + frame.height * FORM_SHADOW_CENTER_Y_HEIGHT_SHARE,
        frame.width * FORM_SHADOW_RADIUS_X_WIDTH_SHARE,
        frame.height * FORM_SHADOW_RADIUS_Y_HEIGHT_SHARE,
        { fill: BLIP_COLORS.formShadow },
      ),
    ],
  };
}

/** The top-left shine (blip-reference.mjs line 97). */
function shinePrimitive(frame: BlipFrame): Primitive {
  return ellipseOf(
    frame.centerX - frame.width * SHINE_CENTER_X_WIDTH_SHARE,
    frame.top + frame.height * SHINE_CENTER_Y_HEIGHT_SHARE,
    SHINE_RADIUS_X,
    SHINE_RADIUS_Y,
    { fill: BLIP_COLORS.shine, rotationDeg: SHINE_ROTATION_DEG },
  );
}

/** Port of `renderBlip`'s body paint (blip-reference.mjs lines 86-99). */
export function drawBlipBody(
  sketch: StickerSketch,
  frame: BlipFrame,
  style: BlipStyle,
): void {
  const bodyFlagId = style.bodyFlagId;
  const baseFill = frame.isFlagBody ? frame.armColor : style.bodyColor;

  // The body path's own silhouette: this paint pass is fully covered by the
  // flag group below when the body is a flag, so its fill never shows.
  sketch.silhouette(pathOf(frame.bodyPoints, { fill: baseFill }), {
    cutWidth: BODY_CUT_WIDTH,
  });

  if (frame.isFlagBody && bodyFlagId) {
    sketch.paint(flagBodyGroup(frame, bodyFlagId));
  } else {
    sketch.paint(formShadowGroup(frame));
    sketch.paint(shinePrimitive(frame));
  }

  sketch.paint(
    pathOf(frame.bodyPoints, {
      stroke: BLIP_COLORS.ink,
      strokeWidth: BODY_KEYLINE_STROKE_WIDTH,
    }),
  );
}

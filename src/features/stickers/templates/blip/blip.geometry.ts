import type { Primitive } from "../primitives";
import { createSketch, withHalo } from "../kit/stickerSketch";
import { drawBlipAntenna } from "./parts/antenna";
import { drawBlipBackArms, drawBlipFrontArms } from "./parts/arms";
import { blipFrame, drawBlipBody } from "./parts/body";
import { blipBrows } from "./parts/brows";
import { blipEyes } from "./parts/eyes";
import { blipFaceExtras, drawBlipOutsideExtras } from "./parts/extras";
import { blipMouth } from "./parts/mouths";
import { drawBlipProp } from "./parts/props";
import { BLIP_COLORS, type BlipStyle } from "./blip.params";
import { BLIP_POSES } from "./blip.poses.data";

/**
 * Assembles one Blip item's full art: prop and back arms behind the body,
 * the body itself, the antenna, then the face (haloed on a flag body so it
 * stays legible over the stripes), front arms and outside extras on top.
 * Ported from the assembly order at the top of `renderBlip`
 * (blip-reference.mjs).
 */

const POSE_BY_ID = new Map(BLIP_POSES.map((pose) => [pose.id as string, pose]));

/** One Blip item's primitives, fitted to the 512 canvas. Throws on an
 *  unknown item id. */
export function blipGeometry(style: BlipStyle, itemId: string): Primitive[] {
  const pose = POSE_BY_ID.get(itemId);
  if (!pose) throw new Error(`Unknown Blip item: ${itemId}`);
  const frame = blipFrame(pose, style);
  const sketch = createSketch();
  drawBlipProp(sketch, frame, pose);
  drawBlipBackArms(sketch, frame, pose);
  drawBlipBody(sketch, frame, style);
  drawBlipAntenna(sketch, frame, pose.antenna);
  const face = [
    ...blipFaceExtras(frame, pose),
    ...blipEyes(frame, pose),
    ...blipBrows(frame, pose),
    ...blipMouth(frame, pose),
  ];
  for (const primitive of frame.isFlagBody
    ? withHalo(face, BLIP_COLORS.cream, 10)
    : face) {
    sketch.paint(primitive);
  }
  drawBlipFrontArms(sketch, frame, pose);
  drawBlipOutsideExtras(sketch, frame, pose);
  return sketch.build({
    hasDieCut: style.hasDieCut,
    rotation: pose.tiltDeg
      ? { degrees: pose.tiltDeg, originX: frame.centerX, originY: frame.baseY }
      : undefined,
  });
}

import type { Primitive } from "../../primitives";
import { arc } from "../../kit/curves";
import { lineOf } from "../../kit/shapes";
import { BLIP_COLORS, type BlipFrame, type BlipPose } from "../blip.params";

/**
 * Blip's brow shapes, ported from the `brow` table in the approved reference
 * generator (blip-reference.mjs). Paint-only primitives in 512 space.
 *
 * The reference also has `frustratedLeft` and `sadLeft`, one-sided brows
 * used only by the parked facepalm poses; `BlipBrows` leaves them out, so
 * they are not ported here.
 */
const STROKE_WIDTH = 8;

/** `[]` when the pose has no brows, matching the reference's
 *  `if (pose.brows) face.push(brow[pose.brows]())`. */
export function blipBrows(frame: BlipFrame, pose: BlipPose): Primitive[] {
  if (!pose.brows) return [];
  const { leftEyeX, rightEyeX, eyeY } = frame;
  switch (pose.brows) {
    case "worried":
      return [
        lineOf(
          [
            [leftEyeX - 24, eyeY - 32],
            [leftEyeX + 16, eyeY - 44],
          ],
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
        lineOf(
          [
            [rightEyeX - 16, eyeY - 44],
            [rightEyeX + 24, eyeY - 32],
          ],
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
      ];
    case "determined":
      return [
        lineOf(
          [
            [leftEyeX - 22, eyeY - 46],
            [leftEyeX + 18, eyeY - 34],
          ],
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
        lineOf(
          [
            [rightEyeX - 18, eyeY - 34],
            [rightEyeX + 22, eyeY - 46],
          ],
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
      ];
    case "raised":
      return [
        lineOf(
          [
            [leftEyeX - 22, eyeY - 36],
            [leftEyeX + 20, eyeY - 36],
          ],
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
        lineOf(
          arc(rightEyeX - 22, eyeY - 42, rightEyeX + 22, eyeY - 46, -12),
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
      ];
    case "up":
      return [
        lineOf(
          arc(leftEyeX - 20, eyeY - 44, leftEyeX + 20, eyeY - 44, -10),
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
        lineOf(
          arc(rightEyeX - 20, eyeY - 44, rightEyeX + 20, eyeY - 44, -10),
          BLIP_COLORS.ink,
          STROKE_WIDTH,
        ),
      ];
  }
}

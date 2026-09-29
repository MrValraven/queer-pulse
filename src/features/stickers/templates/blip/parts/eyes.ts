import type { Primitive } from "../../primitives";
import { arc, fourPointStar, heartPoints, type Point } from "../../kit/curves";
import { ellipseOf, lineOf, pathOf } from "../../kit/shapes";
import { BLIP_COLORS, type BlipFrame, type BlipPose } from "../blip.params";

/**
 * Blip's eye shapes, ported from the `eye` table in the approved reference
 * generator (blip-reference.mjs). Paint-only primitives in 512 space; the
 * assembler adds the flag halo and the die-cut underlay.
 *
 * Highlights and eyelids use a literal pure white, since the reference's
 * `#fff` is a different colour from `BLIP_COLORS.cream` (the flag halo and
 * prop cream).
 */
const WHITE = "#ffffff";

/** `inkStroke()`'s default width in the reference. */
const DEFAULT_STROKE_WIDTH = 9;

/** One eye at `eyeX`, in the reference's `eye` table order. Parked-only
 *  shapes (`squeezeL`, `squeezeR`, `shutDown`, `shutTear`, `closedTight`,
 *  `tired`) are not ported: they never reach a launch pose. */
function eyeAt(
  eyeX: number,
  eyeY: number,
  look: BlipFrame["look"],
  eyes: BlipPose["eyes"],
): Primitive[] {
  const [lookX, lookY] = look;
  switch (eyes) {
    case "bean":
      return [
        ellipseOf(eyeX + lookX, eyeY + lookY, 19, 27, {
          fill: BLIP_COLORS.ink,
        }),
        ellipseOf(eyeX - 6 + lookX * 1.2, eyeY - 10 + lookY * 1.2, 7, 9, {
          fill: WHITE,
        }),
      ];
    case "arcs":
      return [
        lineOf(
          arc(eyeX - 20, eyeY + 6, eyeX + 20, eyeY + 6, -22),
          BLIP_COLORS.ink,
          DEFAULT_STROKE_WIDTH,
        ),
      ];
    case "closed":
      return [
        lineOf(
          arc(eyeX - 20, eyeY, eyeX + 20, eyeY, 10),
          BLIP_COLORS.ink,
          DEFAULT_STROKE_WIDTH,
        ),
      ];
    case "wide":
      return [
        ellipseOf(eyeX, eyeY, 26, 32, {
          fill: WHITE,
          stroke: BLIP_COLORS.ink,
          strokeWidth: 7,
        }),
        ellipseOf(eyeX + lookX, eyeY + lookY, 8, 10, { fill: BLIP_COLORS.ink }),
      ];
    case "hearts":
      return [
        pathOf(heartPoints(eyeX, eyeY + 2, 1.9), {
          fill: BLIP_COLORS.heart,
          stroke: BLIP_COLORS.ink,
          strokeWidth: 5,
        }),
      ];
    case "stars":
      return [
        pathOf(fourPointStar(eyeX, eyeY, 30, 0.38), {
          fill: BLIP_COLORS.spark,
          stroke: BLIP_COLORS.ink,
          strokeWidth: 5,
        }),
      ];
    case "half": {
      const eyelidPoints: Point[] = [
        [eyeX - 26, eyeY - 4],
        [eyeX + 26, eyeY - 4],
        ...arc(eyeX + 26, eyeY - 4, eyeX - 26, eyeY - 4, 24),
      ];
      return [
        pathOf(eyelidPoints, {
          fill: WHITE,
          stroke: BLIP_COLORS.ink,
          strokeWidth: 7,
        }),
        ellipseOf(eyeX + lookX, eyeY + 6 + lookY, 9, 10, {
          fill: BLIP_COLORS.ink,
        }),
      ];
    }
    case "teary":
      return [
        ellipseOf(eyeX, eyeY, 20, 27, { fill: BLIP_COLORS.ink }),
        ellipseOf(eyeX - 6, eyeY - 9, 8, 10, { fill: WHITE }),
        ellipseOf(eyeX + 5, eyeY + 8, 4, 5, { fill: WHITE }),
        lineOf(
          arc(eyeX - 17, eyeY + 16, eyeX + 17, eyeY + 16, 9),
          BLIP_COLORS.tear,
          7,
        ),
      ];
    case "none":
      return [];
  }
}

/** Both eyes, mirrored across the face centre, in the reference's paint
 *  order: left eye, then right eye. */
export function blipEyes(frame: BlipFrame, pose: BlipPose): Primitive[] {
  return [
    ...eyeAt(frame.leftEyeX, frame.eyeY, frame.look, pose.eyes),
    ...eyeAt(frame.rightEyeX, frame.eyeY, frame.look, pose.eyes),
  ];
}

import type { Primitive } from "../../primitives";
import { arc, type Point } from "../../kit/curves";
import { ellipseOf, lineOf, pathOf } from "../../kit/shapes";
import { BLIP_COLORS, type BlipFrame, type BlipPose } from "../blip.params";

/**
 * Blip's mouth shapes, ported from the `mouth` table in the approved
 * reference generator (blip-reference.mjs). Paint-only primitives in 512
 * space.
 *
 * `grin` and `laugh` bulge downward: the reference fixed an earlier upside
 * down render, and this ports that fixed version.
 *
 * The reference also has `groan`, `groanSmall`, `frownBig`, `frownWobble`,
 * `gritSide` and `wail`, used only by the parked facepalm poses; `BlipMouth`
 * leaves them out, so they are not ported here.
 */
const DEFAULT_STROKE_WIDTH = 9;

export function blipMouth(frame: BlipFrame, pose: BlipPose): Primitive[] {
  const { mouthX, mouthY } = frame;
  switch (pose.mouth) {
    case "smile":
      return [
        lineOf(
          arc(mouthX - 24, mouthY - 6, mouthX + 24, mouthY - 6, 16),
          BLIP_COLORS.ink,
          DEFAULT_STROKE_WIDTH,
        ),
      ];
    case "grin": {
      const grinPoints: Point[] = [
        [mouthX - 30, mouthY - 8],
        ...arc(mouthX + 30, mouthY - 8, mouthX - 30, mouthY - 8, 36).slice(1),
      ];
      return [
        pathOf(grinPoints, {
          fill: BLIP_COLORS.ink,
          stroke: BLIP_COLORS.ink,
          strokeWidth: 5,
        }),
        ellipseOf(mouthX, mouthY + 16, 13, 7, { fill: BLIP_COLORS.blush }),
      ];
    }
    case "laugh": {
      const laughPoints: Point[] = [
        [mouthX - 44, mouthY - 14],
        [mouthX + 44, mouthY - 14],
        ...arc(mouthX + 44, mouthY - 14, mouthX - 44, mouthY - 14, 60).slice(1),
      ];
      return [
        pathOf(laughPoints, { fill: BLIP_COLORS.ink }),
        ellipseOf(mouthX, mouthY + 24, 20, 11, { fill: BLIP_COLORS.blush }),
      ];
    }
    case "o":
      return [ellipseOf(mouthX, mouthY + 4, 16, 21, { fill: BLIP_COLORS.ink })];
    case "small":
      return [ellipseOf(mouthX, mouthY, 8, 6, { fill: BLIP_COLORS.ink })];
    case "wobbly":
      return [
        lineOf(
          [
            [mouthX - 26, mouthY],
            [mouthX - 16, mouthY - 6],
            [mouthX - 6, mouthY],
            [mouthX + 4, mouthY - 6],
            [mouthX + 14, mouthY],
            [mouthX + 24, mouthY - 6],
          ],
          BLIP_COLORS.ink,
          8,
        ),
      ];
    case "flat":
      return [
        lineOf(
          [
            [mouthX - 18, mouthY],
            [mouthX + 18, mouthY - 2],
          ],
          BLIP_COLORS.ink,
          DEFAULT_STROKE_WIDTH,
        ),
      ];
    case "smirk": {
      const smirkPoints: Point[] = [
        [mouthX - 16, mouthY],
        ...arc(mouthX - 16, mouthY, mouthX + 24, mouthY - 8, 6).slice(1),
      ];
      return [lineOf(smirkPoints, BLIP_COLORS.ink, DEFAULT_STROKE_WIDTH)];
    }
    case "cat": {
      const catPoints: Point[] = [
        ...arc(mouthX - 26, mouthY - 6, mouthX, mouthY - 6, 10),
        ...arc(mouthX, mouthY - 6, mouthX + 26, mouthY - 6, 10).slice(1),
      ];
      return [lineOf(catPoints, BLIP_COLORS.ink, 8)];
    }
    case "tongue": {
      const tonguePoints: Point[] = [
        [mouthX + 2, mouthY - 2],
        [mouthX + 22, mouthY - 2],
        ...arc(mouthX + 22, mouthY - 2, mouthX + 2, mouthY - 2, -22).slice(1),
      ];
      return [
        pathOf(tonguePoints, {
          fill: BLIP_COLORS.blush,
          stroke: BLIP_COLORS.ink,
          strokeWidth: 6,
        }),
        lineOf(
          arc(mouthX - 26, mouthY - 6, mouthX + 26, mouthY - 6, 12),
          BLIP_COLORS.ink,
          DEFAULT_STROKE_WIDTH,
        ),
      ];
    }
    case "frown":
      return [
        lineOf(
          arc(mouthX - 20, mouthY + 6, mouthX + 20, mouthY + 6, -12),
          BLIP_COLORS.ink,
          DEFAULT_STROKE_WIDTH,
        ),
      ];
    case "pout":
      return [
        lineOf(
          arc(mouthX - 12, mouthY + 4, mouthX + 12, mouthY + 4, -7),
          BLIP_COLORS.ink,
          8,
        ),
      ];
    case "none":
      return [];
  }
}

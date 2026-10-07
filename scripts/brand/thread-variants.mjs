/**
 * Five variants of the Thread concept on /admin/logo-concepts, as static
 * SVGs, each with a small cut for 24 to 32px use.
 *
 * Thread started as one even line with six beads on it and read flat: the
 * serif's thick and thin were gone, the tail lay on the bowl with no over or
 * under, the beads were spaced like a chart and melted into the line when
 * small. Every variant keeps the traced Fraunces Q, people as beads on the
 * thread and the coral hearth in the counter, in flat colour only, and finds
 * depth a different way:
 *
 * - thread-woven: the bowl is a loop of thread that runs once round and
 *   laps over its own start at the upper left, and the tail lies over the
 *   bowl low on the right. The run on top cuts a gap in the ground colour
 *   out of the run beneath, so the bowl's closing run passes under the tail,
 *   then over its own start. Its end narrows against the bowl's outer edge
 *   into a tongue with a round tip, so the lap shows as one gap line inside
 *   the stroke and the outline stays an oval Q and its tail.
 * - thread-swell: the line swells and thins with the serif's stress, heavy
 *   at the lower left and upper right, close to a hairline where the bowl
 *   turns. A bead sits at the thin top like a knot; the tail swells through
 *   its sweep and ends in the coral bead.
 * - thread-trio: an even line and only three people, each one distinct and
 *   each strung on the line's centre: a coral bead at the tail's tip (the
 *   largest), and a jade bead and a hollow ring walking together down the
 *   bowl's left side. In mono they differ by size, solid and ring.
 * - thread-ribbon: the line is a flat ribbon, one continuous shape. The tail
 *   starts in the counter with a round end, lies over the bowl, and folds
 *   over on a diagonal crease just before the tip, where it shows its back
 *   in one warm shade tone of the ink. In mono the back is the ink, parted
 *   from the face by one clean cut along the crease.
 * - thread-signature: Swell's line with the tail laid over the bowl (a gap
 *   parts them), and the trio's three people threaded on it: jade and a
 *   hollow ring walking together over the thin top, coral at the tip a step
 *   ahead.
 *
 * Each small cut keeps only the line, the hearth and one coral bead, with
 * heavier strokes and every gap and feature at least 64 units on the 1024
 * canvas (1.5px at 24px). Its crossings are drawn solid, since a gap that
 * wide would break the letter apart, and the coral bead caps the tail.
 * Signature's small cut is Swell's, since at that size the two are one.
 *
 * Output: public/brand/logo-concepts/<variant>-<colorway>.svg and
 * <variant>-<colorway>-small.svg, thirty files, drawn with the shared kit in
 * logo-geometry.mjs (same canvas, colourways, placement and safe zone as the
 * first three concepts). The script stops with an error if any shape would
 * leave the circle-crop safe zone.
 *
 * Run: node scripts/brand/thread-variants.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  COLORWAYS,
  OUTPUT_DIRECTORY,
  assertInsideSafeZone,
  markSvg,
  placement,
} from "./logo-geometry.mjs";
import { ribbon } from "./thread-variants/ribbon.mjs";
import { signature } from "./thread-variants/signature.mjs";
import { swell } from "./thread-variants/swell.mjs";
import { trio } from "./thread-variants/trio.mjs";
import { woven } from "./thread-variants/woven.mjs";

const VARIANTS = [woven, swell, trio, ribbon, signature];

await mkdir(OUTPUT_DIRECTORY, { recursive: true });
for (const variant of VARIANTS) {
  for (const cut of [
    { suffix: "", build: variant.build },
    { suffix: "-small", build: variant.buildSmall },
  ]) {
    const markId = `${variant.id}${cut.suffix}`;
    const shapes = cut.build();
    const placed = placement(shapes, variant.centring);
    const reach = assertInsideSafeZone(markId, shapes, placed);
    for (const colorway of Object.keys(COLORWAYS)) {
      await writeFile(
        new URL(`${variant.id}-${colorway}${cut.suffix}.svg`, OUTPUT_DIRECTORY),
        markSvg(markId, shapes, placed, colorway),
      );
    }
    console.log(
      `${markId}: scale ${placed.scale.toFixed(3)}, reach ${reach.toFixed(1)}px`,
    );
  }
}

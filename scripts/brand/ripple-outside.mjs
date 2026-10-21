/**
 * P on the outside: three variants of a QueerPulse mark that turn the
 * Ripple family inside out, as static SVGs, each with a small cut for 24 to
 * 32px use.
 *
 * In Ripple the coral P lands in the middle and its ripples grow into the
 * Q. Here the P is the big letter on the outside: an upright monoline
 * capital in ink, its bowl a ring with rounded corners on the stem's side,
 * and the small Q sits inside that bowl in coral, the pulse at its heart.
 * The P stands upright because a leaning ring and stem is itself a Q (and
 * a map pin), so the outer letter would stop reading as a P. Wherever one
 * line lies across another, the line beneath loses a gap round it, so the
 * crossing reads in mono too.
 *
 * - ripple-outside-nest: the P with a whole small Q resting in its bowl,
 *   like the hearth in the Thread concepts. The Q's short tail starts in its
 *   own counter and crosses its ring, the ring parted round it.
 * - ripple-outside-rings (Echo): the P's bowl is the outermost ripple. Two
 *   thinner whole ripples spread inward from it, lighter toward the middle,
 *   and the Q ring sits at their centre, its short tail pointing down and to
 *   the right inside the first ripple.
 * - ripple-outside-tail (Break): the Ripple idea mirrored. The Q's tail
 *   runs out of its counter, across its ring and on through the P's bowl,
 *   lying over it with a gap, and ends outside the P with a coral bead after
 *   it, like the drop in ripple-drop. The tail leaves at a shallow angle, so
 *   it never reads as the leg of an R.
 *
 * Each small cut keeps only the P and the Q, with heavier strokes and every
 * gap and feature at least 64 units on the 1024 canvas (1.5px at 24px). A
 * ring Q with a 64 unit counter and stroke leaves no room for a tail inside
 * the bowl at that size, so the Q becomes a coral dot with a short tail.
 * Nest and Echo share one small cut, since without ripples the two are one.
 * Break's small cut keeps the tail breaking out; in colour the coral lies on
 * top of the bowl, and in mono the bowl keeps a 64 unit gap round it.
 *
 * Output: public/brand/logo-concepts/ripple-outside-<variant>-<colorway>.svg
 * and ripple-outside-<variant>-<colorway>-small.svg, eighteen files, drawn
 * with the shared kit in logo-geometry.mjs (same canvas, colourways,
 * placement and safe zone as the Ripple and Thread concepts). Each mark is
 * centred on the box round its ink, since a tall P throws the smallest
 * enclosing circle off to the right. The script stops with an error if any
 * shape would leave the circle-crop safe zone.
 *
 * Run: node scripts/brand/ripple-outside.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  COLORWAYS,
  OUTPUT_DIRECTORY,
  assertInsideSafeZone,
  markSvg,
  placement,
} from "./logo-geometry.mjs";
import { nest } from "./ripple-outside/nest.mjs";
import { rings } from "./ripple-outside/rings.mjs";
import { tail } from "./ripple-outside/tail.mjs";

const VARIANTS = [nest, rings, tail];

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

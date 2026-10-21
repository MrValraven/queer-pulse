/**
 * Ripple: four variants of a QueerPulse mark drawn from a designer friend's
 * sketch, as static SVGs, each with a small cut for 24 to 32px use.
 *
 * The P is the letter that makes the pulse: it breaks the surface like a
 * drop landing in water, and the ripples it sends out grow until the
 * outermost one is the Q. The P is monoline coral, tilted about 40 degrees
 * so its stem swings down to the lower right; its bowl sits where the drop
 * lands, and its stem runs on out through the Q ring low on the right, where
 * it becomes the Q's tail. Wherever the P lies across the ring or a ripple,
 * that line loses a gap round the P, so the P reads as on top in mono too.
 * Today's mark (a coral dot inside rings) grows straight into it.
 *
 * - ripple-drop: the sketch drawn faithfully. A heavy Q ring and three thin
 *   ripples between it and the P, each broken into two or three round-capped
 *   arcs with the breaks set unevenly, as a hand draws them. Past the ring
 *   the stem's tip is followed, after a gap, by a coral bead (the dot of an
 *   exclamation mark), and a short ink stub steps out of the ring beside the
 *   stem: the Q's own tail.
 * - ripple-rings: the Q ring and two whole ripples round the same centre,
 *   lighter toward the middle. The stem leaves as a plain tail with a round
 *   cap. The strongest at avatar sizes.
 * - ripple-splash: the drop lands up and to the left of the Q's centre. Each
 *   ripple's centre moves from that landing point toward the Q's centre, so
 *   the rings crowd together on the P's side and open out on the far side,
 *   a wave front travelling outward, until the last one is the Q ring.
 * - ripple-serif: the Q ring is the traced Fraunces bowl, tilted and swelling
 *   with the serif's stress as in thread-swell; the ripples are smaller even
 *   copies of the same tilted oval. The stem leaves the bowl low on the
 *   right, close to where the traced tail crosses it, so the mark sits in
 *   the Thread family.
 *
 * Each small cut keeps only the ring and the P, with heavier strokes and
 * every gap and feature at least 64 units on the 1024 canvas (1.5px at
 * 24px). The ripples go, and the P joins the ring where its stem leaves it:
 * in colour the coral lies on top, and in mono the two run together into a
 * Q and its tail, while the P's bowl stands well clear of the ring. Drop and
 * Rings share one small cut, since at that size the two are one.
 *
 * Output: public/brand/logo-concepts/ripple-<variant>-<colorway>.svg and
 * ripple-<variant>-<colorway>-small.svg, twenty-four files, drawn with the
 * shared kit in logo-geometry.mjs (same canvas, colourways, placement and
 * safe zone as the Thread concepts). The script stops with an error if any
 * shape would leave the circle-crop safe zone.
 *
 * Run: node scripts/brand/ripple-variants.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  COLORWAYS,
  OUTPUT_DIRECTORY,
  assertInsideSafeZone,
  markSvg,
  placement,
} from "./logo-geometry.mjs";
import { drop } from "./ripple-variants/drop.mjs";
import { rings } from "./ripple-variants/rings.mjs";
import { serif } from "./ripple-variants/serif.mjs";
import { splash } from "./ripple-variants/splash.mjs";

const VARIANTS = [drop, rings, splash, serif];

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

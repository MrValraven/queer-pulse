/**
 * Ripple, fused: three variants where the P is the Q's first ripple, as
 * static SVGs, each with a small cut for 24 to 32px use.
 *
 * In the first Ripple family (ripple-variants.mjs) the P lands in the
 * water and the Q is its outermost ripple. Here the two letters fuse: the
 * P's bowl is itself a ring round the Q's centre, the innermost ripple, and
 * the P's stem runs out through the Q ring as the Q's tail. The bowl is
 * round, and the stem's centre line touches it on the stem side, the way a
 * geometric p's stem meets its bowl. The stem's tilt is solved so the tail
 * leaves the ring low on the right: its line crosses the ring at 62 degrees
 * clockwise from three o'clock, about five o'clock. A smaller bowl would
 * lean the P less, a larger one more; about 0.3 of the Q's radius keeps it
 * reading as a P.
 *
 * - ripple-fused-ring: two rings only. The coral P (its bowl a closed ring)
 *   inside the ink Q ring, round one centre; the stem lies over the Q ring
 *   with a gap round it and runs out as the tail.
 * - ripple-fused-spiral: one continuous line. It starts at the top of the
 *   P's stem, runs down it and loops once round the bowl back onto the
 *   stem, carries on down, swings into one turn round the Q (turning the
 *   same way the bowl did, so the line spirals outward) and peels off as
 *   the tail at the bottom. The turn stops short of the stem, so the line
 *   never crosses itself and needs no gap. The line is coral for the P and ink for the Q, handing over
 *   with one straight cut where the stem starts to bend into the ring; it
 *   eases from the P's weight to the Q's through that bend. In mono it is
 *   one plain line.
 * - ripple-fused-stack: three rings round one centre, the P's bowl, one
 *   thin ripple and the Q. The stem lies over the ripple and the Q ring with
 *   a gap at each.
 *
 * Each small cut is heavier, with every gap and feature at least 64 units
 * on the 1024 canvas (1.5px at 24px). The stem joins the Q ring solid where
 * it leaves it: in colour the coral lies on top, and in mono the two run
 * together into a Q and its tail. Stack's middle ripple cannot keep 64
 * units clear on both sides, so Stack's small cut is Ring's.
 *
 * Output: public/brand/logo-concepts/ripple-fused-<variant>-<colorway>.svg
 * and ripple-fused-<variant>-<colorway>-small.svg, eighteen files, drawn
 * with the shared kit in logo-geometry.mjs. The script stops with an error
 * if any shape would leave the circle-crop safe zone.
 *
 * Run: node scripts/brand/ripple-fused.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  COLORWAYS,
  OUTPUT_DIRECTORY,
  assertInsideSafeZone,
  markSvg,
  placement,
} from "./logo-geometry.mjs";
import { fusedRing } from "./ripple-fused/ring.mjs";
import { fusedSpiral } from "./ripple-fused/spiral.mjs";
import { fusedStack } from "./ripple-fused/stack.mjs";

const VARIANTS = [fusedRing, fusedSpiral, fusedStack];

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

/**
 * Ripple, lettered: six variants of the Ripple marks whose P is a real
 * letter set in a font, as static SVGs, each with a small cut for 24 to
 * 32px use.
 *
 * In ripple-drop and ripple-serif (ripple-variants.mjs) the Q is the
 * outermost ripple and the P is a monoline coral stroke that breaks the
 * surface. Here each Q stays exactly as it is and the P is a glyph from
 * Fraunces or DM Sans, frozen into ripple-letter/glyphs.mjs, so it carries
 * the type's own weight and contrast. Every water line keeps an even gap
 * round the P's whole outline (a halo), which also clears the ripples out
 * of its counter, so the P reads as one clean letter lying on the water.
 *
 * - ripple-letter-drop-fraunces: the ripple-drop water round a heavy
 *   Fraunces P, tilted gently, its stem stretched out through the ring as
 *   the Q's tail, the coral bead after its tip and the ink stub beside it.
 * - ripple-letter-drop-sans: the same construction with the DM Sans P, the
 *   geometric letter of the site's interface, matching the even ripples.
 * - ripple-letter-drop-upright: a soft Fraunces P standing upright in the
 *   middle like a monogram, and the Q drawing its own tapered ink tail at
 *   the lower right.
 * - ripple-letter-serif-fraunces: the ripple-serif water round a Fraunces
 *   P whose stem matches the bowl's heavy stroke, stretched to leave the
 *   bowl where the traced tail crosses it.
 * - ripple-letter-serif-soft: a heavy soft Fraunces P upright inside the
 *   bowl as a monogram, the friendlier sibling of serif-italic, and the Q
 *   with its own traced Fraunces tail.
 * - ripple-letter-serif-italic: an italic Fraunces P upright inside the
 *   bowl as a monogram, and the Q with its own traced Fraunces tail.
 *
 * Each small cut keeps only the Q (with its own tail where the variant has
 * one) and the P, heavier, with every gap and feature and the P's counter
 * at least 64 units on the 1024 canvas (1.5px at 24px). The ripples and
 * the bead go, and a stretched stem joins the Q where it leaves it. One
 * exception: serif-italic keeps its gap and counter at about 57 units, so
 * its P stays heavy enough to read at 24px.
 *
 * Output: public/brand/logo-concepts/<variant>-<colorway>.svg and
 * <variant>-<colorway>-small.svg, thirty-six files, drawn with the shared
 * kit in logo-geometry.mjs. The script stops with an error if any shape
 * would leave the circle-crop safe zone.
 *
 * Run: node scripts/brand/ripple-letter.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  COLORWAYS,
  OUTPUT_DIRECTORY,
  assertInsideSafeZone,
  markSvg,
  placement,
} from "./logo-geometry.mjs";
import {
  dropFraunces,
  dropSans,
  dropUpright,
} from "./ripple-letter/concentric.mjs";
import {
  serifFraunces,
  serifItalic,
  serifSoft,
} from "./ripple-letter/serif.mjs";

const VARIANTS = [
  dropFraunces,
  dropSans,
  dropUpright,
  serifFraunces,
  serifSoft,
  serifItalic,
];

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

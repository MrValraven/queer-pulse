import type { Primitive } from "../primitives";
import { createSketch } from "../kit/stickerSketch";
import { TEA_ART_GROUP_ONE } from "./art/groupOne";
import { TEA_ART_GROUP_THREE } from "./art/groupThree";
import { TEA_ART_GROUP_TWO } from "./art/groupTwo";
import type { TeaArt, TeaStyle } from "./tea.params";

/** Every Tea item's art, keyed by item id, assembled from the three approved
 *  art groups. */
const TEA_ART: Readonly<Record<string, TeaArt>> = {
  ...TEA_ART_GROUP_ONE,
  ...TEA_ART_GROUP_TWO,
  ...TEA_ART_GROUP_THREE,
};

/** One Tea item's primitives, fitted to the 512 canvas. Throws on an unknown
 *  item id. */
export function teaGeometry(style: TeaStyle, itemId: string): Primitive[] {
  const art = Object.hasOwn(TEA_ART, itemId) ? TEA_ART[itemId] : undefined;
  if (!art) throw new Error(`Unknown Tea item: ${itemId}`);
  const sketch = createSketch();
  art(sketch, style.accentColor);
  return sketch.build({ hasDieCut: style.hasDieCut });
}

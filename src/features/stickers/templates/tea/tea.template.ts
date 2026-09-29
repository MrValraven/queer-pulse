import {
  defineStickerTemplate,
  isHexColor,
  type StickerTemplate,
} from "../templateDefinition";
import { teaGeometry } from "./tea.geometry";
import { TEA_ITEMS } from "./tea.items.data";
import { TEA_DEFAULTS, type TeaStyle } from "./tea.params";

/** The stored params narrowed to the template's style fields, or null when
 *  either field is missing or has the wrong type. */
function parseTeaStyle(
  params: Readonly<Record<string, unknown>>,
): TeaStyle | null {
  const { accentColor, hasDieCut } = params;
  if (!isHexColor(accentColor) || typeof hasDieCut !== "boolean") {
    return null;
  }
  return { accentColor, hasDieCut };
}

function teaParamsOf(
  style: TeaStyle,
  itemId: string,
): { itemId: string; accentColor: string; hasDieCut: boolean } {
  return { itemId, accentColor: style.accentColor, hasDieCut: style.hasDieCut };
}

export const TEA_TEMPLATE: StickerTemplate = defineStickerTemplate<TeaStyle>({
  id: "tea-slang",
  slugPrefix: "tea-",
  coverItemId: "spill-the-tea",
  items: TEA_ITEMS,
  defaultStyle: TEA_DEFAULTS,
  parseStyle: parseTeaStyle,
  itemIdOfParams: (params) =>
    typeof params.itemId === "string" && params.itemId.length > 0
      ? params.itemId
      : null,
  toParams: (style, itemId) => teaParamsOf(style, itemId),
  geometry: (style, itemId) => teaGeometry(style, itemId),
});

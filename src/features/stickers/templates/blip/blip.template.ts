import {
  defineStickerTemplate,
  isHexColor,
  type StickerTemplate,
} from "../templateDefinition";
import { UNO_REVERSE_FLAG_IDS } from "../unoReverse.params";
import { blipGeometry } from "./blip.geometry";
import { BLIP_ITEMS } from "./blip.items.data";
import { BLIP_DEFAULTS, type BlipStyle } from "./blip.params";

const BLIP_ITEM_IDS = new Set(BLIP_ITEMS.map((item) => item.id));

/** The stored params narrowed to the template's style fields, or null when
 *  any field is missing or has the wrong type: `bodyColor` must be a hex
 *  colour, `bodyFlagId` either null or one of `UNO_REVERSE_FLAG_IDS`, and
 *  `hasDieCut` a boolean. */
function parseBlipStyle(
  params: Readonly<Record<string, unknown>>,
): BlipStyle | null {
  const { bodyColor, bodyFlagId, hasDieCut } = params;
  if (!isHexColor(bodyColor)) return null;
  if (typeof hasDieCut !== "boolean") return null;
  const isKnownBodyFlagId =
    bodyFlagId === null ||
    (typeof bodyFlagId === "string" &&
      UNO_REVERSE_FLAG_IDS.includes(bodyFlagId));
  if (!isKnownBodyFlagId) return null;
  return { bodyColor, bodyFlagId, hasDieCut };
}

/** `params.itemId` when it names a Blip item, otherwise null. Blip's item
 *  ids are a closed set (the 22 poses), so this accepts only a known id;
 *  Tea and Uno Reverse accept any non-empty string. */
function itemIdOfBlipParams(
  params: Readonly<Record<string, unknown>>,
): string | null {
  const { itemId } = params;
  return typeof itemId === "string" && BLIP_ITEM_IDS.has(itemId)
    ? itemId
    : null;
}

function blipParamsOf(
  style: BlipStyle,
  itemId: string,
): {
  itemId: string;
  bodyColor: string;
  bodyFlagId: string | null;
  hasDieCut: boolean;
} {
  return {
    itemId,
    bodyColor: style.bodyColor,
    bodyFlagId: style.bodyFlagId,
    hasDieCut: style.hasDieCut,
  };
}

export const BLIP_TEMPLATE: StickerTemplate = defineStickerTemplate<BlipStyle>({
  id: "blip",
  slugPrefix: "blip-",
  coverItemId: "hi",
  items: BLIP_ITEMS,
  defaultStyle: BLIP_DEFAULTS,
  parseStyle: parseBlipStyle,
  itemIdOfParams: itemIdOfBlipParams,
  toParams: (style, itemId) => blipParamsOf(style, itemId),
  geometry: (style, itemId) => blipGeometry(style, itemId),
});

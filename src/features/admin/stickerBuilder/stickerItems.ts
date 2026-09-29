import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import type { Language, TFunction } from "../../../shared/i18n/types";
import { templateById } from "../../stickers/templates/registry";
import type {
  StickerTemplate,
  StickerTemplateId,
  TemplateStyle,
} from "../../stickers/templates/templateDefinition";
import { UNO_REVERSE_TEMPLATE } from "../../stickers/templates/unoReverse.template";
import type {
  ItemPackState,
  ItemPlanEntry,
  PublishMode,
} from "./stickerBuilder.types";

/** The template a pack with no stickers starts on. */
export const DEFAULT_TEMPLATE_ID: StickerTemplateId = "uno-reverse";

/**
 * The template id of the pack's first sticker that resolves in the registry,
 * or null. A sticker from an unknown template (legacy, or hand-edited) is
 * passed over, so it never decides the pack's template. Its params are not
 * checked: a legacy Uno sticker with empty params still names its template.
 */
export function packTemplateId(
  pack: AdminStickerPackResponse | null,
): StickerTemplateId | null {
  for (const sticker of pack?.stickers ?? []) {
    const template = templateById(sticker.templateId);
    if (template !== null) return template.id;
  }
  return null;
}

/** The template with this id, falling back to the default template when the
 *  id is null or unknown. */
export function resolveTemplate(templateId: string | null): StickerTemplate {
  const template = templateId === null ? null : templateById(templateId);
  if (template !== null) return template;
  // The default id is always registered; the Uno constant only satisfies the
  // type checker, since `templateById` returns null for unknown ids.
  return templateById(DEFAULT_TEMPLATE_ID) ?? UNO_REVERSE_TEMPLATE;
}

/** Whether `itemId` is one of the items the template can draw. */
function isTemplateItem(template: StickerTemplate, itemId: string): boolean {
  return template.items.some((item) => item.id === itemId);
}

/**
 * The item a sticker was drawn from under `template`: the item id its params
 * name, else its slug suffix after the template's prefix (a legacy Uno
 * sticker saved before `flagId` joined its params). Only ids in
 * `template.items` count, since `template.geometry` throws on any other, so
 * this is null when the sticker belongs to another template or names no item
 * the template knows (a hand-edited `blip-zzz`, say).
 */
export function itemIdOfSticker(
  sticker: AdminStickerResponse,
  template: StickerTemplate,
): string | null {
  if (sticker.templateId !== template.id) return null;
  const paramsItemId = template.itemIdOfParams(sticker.templateParams);
  if (paramsItemId !== null && isTemplateItem(template, paramsItemId)) {
    return paramsItemId;
  }
  if (!sticker.slug.startsWith(template.slugPrefix)) return null;
  const slugSuffix = sticker.slug.slice(template.slugPrefix.length);
  return isTemplateItem(template, slugSuffix) ? slugSuffix : null;
}

/** Every item the template can draw, in its canonical order. */
export function templateItemIds(template: StickerTemplate): string[] {
  return template.items.map((item) => item.id);
}

/** Sorts any item id list into the template's canonical order, dropping ids
 *  the template does not know and any repeats. */
export function sortItemIds(
  template: StickerTemplate,
  itemIds: readonly string[],
): string[] {
  const canonicalIndexByItem = new Map(
    templateItemIds(template).map((itemId, index) => [itemId, index]),
  );
  const knownItemIds = [...new Set(itemIds)].filter((itemId) =>
    canonicalIndexByItem.has(itemId),
  );
  return knownItemIds.sort(
    (first, second) =>
      (canonicalIndexByItem.get(first) ?? 0) -
      (canonicalIndexByItem.get(second) ?? 0),
  );
}

/** The first sticker in the pack drawn from each of the template's items,
 *  keyed by item id. */
function stickerByItemId(
  pack: AdminStickerPackResponse | null,
  template: StickerTemplate,
): Map<string, AdminStickerResponse> {
  const stickersByItem = new Map<string, AdminStickerResponse>();
  for (const sticker of pack?.stickers ?? []) {
    const itemId = itemIdOfSticker(sticker, template);
    if (itemId !== null && !stickersByItem.has(itemId)) {
      stickersByItem.set(itemId, sticker);
    }
  }
  return stickersByItem;
}

/** Per template item, whether the pack already holds a sticker drawn from it. */
export function packStateByItem(
  pack: AdminStickerPackResponse | null,
  template: StickerTemplate,
): Record<string, ItemPackState> {
  const stickersByItem = stickerByItemId(pack, template);
  const stateByItem: Record<string, ItemPackState> = {};
  for (const itemId of templateItemIds(template)) {
    stateByItem[itemId] = stickersByItem.has(itemId) ? "in-pack" : "new";
  }
  return stateByItem;
}

/**
 * What a run will do with each selected item, in canonical order. An item the
 * pack lacks is always added; an item it already holds is redrawn in place
 * under "replace" and skipped under "add-missing". Ids the template does not
 * know (left over from another template) never reach the plan.
 */
export function buildItemPlan(
  template: StickerTemplate,
  selectedItemIds: readonly string[],
  pack: AdminStickerPackResponse | null,
  mode: PublishMode,
): ItemPlanEntry[] {
  const stickersByItem = stickerByItemId(pack, template);
  return sortItemIds(template, selectedItemIds).map((itemId) => {
    const existingSticker = stickersByItem.get(itemId) ?? null;
    if (existingSticker === null) {
      return { itemId, action: "add", existingSticker };
    }
    return {
      itemId,
      action: mode === "replace" ? "replace" : "skip",
      existingSticker,
    };
  });
}

/**
 * The style a pack's stickers were made with under `template` (the first
 * sticker of that template whose params parse), or null when there is none.
 * The params arrive from the server as an open record, so the template's own
 * parser checks each field before the builder loads it into its controls.
 */
export function packTemplateStyle(
  pack: AdminStickerPackResponse | null,
  template: StickerTemplate,
): TemplateStyle | null {
  for (const sticker of pack?.stickers ?? []) {
    if (sticker.templateId !== template.id) continue;
    const templateStyle = template.parseStyle(sticker.templateParams);
    if (templateStyle !== null) return templateStyle;
  }
  return null;
}

/** The item's label in `language`, or its id when the template lacks it. */
export function itemName(
  template: StickerTemplate,
  itemId: string,
  language: Language,
): string {
  const item = template.items.find(
    (templateItem) => templateItem.id === itemId,
  );
  return item?.label[language] ?? itemId;
}

/** The label a published sticker gets: Uno keeps
 *  admin:stickerPacks.publish.stickerLabel, the rest use the item label. */
export function stickerLabelFor(
  template: StickerTemplate,
  itemId: string,
  t: TFunction,
  language: Language,
): string {
  const name = itemName(template, itemId, language);
  if (template.id !== UNO_REVERSE_TEMPLATE.id) return name;
  return t("admin:stickerPacks.publish.stickerLabel", { flag: name });
}

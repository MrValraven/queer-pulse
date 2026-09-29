import { BLIP_TEMPLATE } from "./blip/blip.template";
import { TEA_TEMPLATE } from "./tea/tea.template";
import type { StickerTemplate } from "./templateDefinition";
import { UNO_REVERSE_TEMPLATE } from "./unoReverse.template";

/**
 * Every sticker template the builder, the demo generator and a stored
 * sticker's `templateId` can resolve, in the order the pack picker and the
 * demo generator list them: Uno reverse, Blip, then Tea. A new template
 * belongs here too, alongside the `StickerTemplateId` union, `BUILDER_TEMPLATES`,
 * the generator's pack table, and its i18n keys.
 */
export const STICKER_TEMPLATES: readonly StickerTemplate[] = [
  UNO_REVERSE_TEMPLATE,
  BLIP_TEMPLATE,
  TEA_TEMPLATE,
];

/** The template with this id, or null when the id is unknown (a legacy or
 *  hand-edited sticker whose template no longer exists). */
export function templateById(templateId: string): StickerTemplate | null {
  return (
    STICKER_TEMPLATES.find((template) => template.id === templateId) ?? null
  );
}

import type { JSX } from "react";
import type {
  StickerTemplateId,
  TemplateStyle,
} from "../../../stickers/templates/templateDefinition";
import { BlipControls } from "./BlipControls";
import { TeaControls } from "./TeaControls";
import { UnoReverseControls } from "./UnoReverseControls";

/** What the builder hands every template's style panel. */
export interface TemplateControlsProps {
  style: TemplateStyle;
  onStyleChange: (style: TemplateStyle) => void;
  /** The ticked items. Uno checks its frame colour against these flags. */
  selectedItemIds: string[];
  /** The selected pack's stored style, or null when there is none to load. */
  packStyle: TemplateStyle | null;
  onLoadPackStyle: () => void;
}

export interface BuilderTemplate {
  Controls: (props: TemplateControlsProps) => JSX.Element;
  /** Keys under `admin:stickerPacks.templates.*`. The picker hands every
   *  description the template's item count as `{count}`. */
  nameKey: string;
  descriptionKey: string;
}

/**
 * The builder's side of each template: its style panel and the name and
 * description the picker shows. The registry (`STICKER_TEMPLATES`) owns the
 * art, including the cover sticker the picker previews (`coverItemId`); this
 * owns the admin UI.
 */
export const BUILDER_TEMPLATES: Readonly<
  Record<StickerTemplateId, BuilderTemplate>
> = {
  "uno-reverse": {
    Controls: UnoReverseControls,
    nameKey: "admin:stickerPacks.templates.unoReverse.name",
    descriptionKey: "admin:stickerPacks.templates.unoReverse.description",
  },
  blip: {
    Controls: BlipControls,
    nameKey: "admin:stickerPacks.templates.blip.name",
    descriptionKey: "admin:stickerPacks.templates.blip.description",
  },
  "tea-slang": {
    Controls: TeaControls,
    nameKey: "admin:stickerPacks.templates.tea.name",
    descriptionKey: "admin:stickerPacks.templates.tea.description",
  },
};

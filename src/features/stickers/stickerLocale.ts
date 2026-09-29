import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import type { Language } from "../../shared/i18n/types";

/**
 * A sticker's name in `language`: the Portuguese name for a Portuguese
 * reader when one was written, the English `label` otherwise. The name is the
 * sticker's alt text and its button label, so it follows the reader's
 * language, whatever language the publishing admin used.
 *
 * `labelPt` is also read defensively as possibly absent, so a catalogue
 * cached before the field existed still resolves to `label`.
 */
export function stickerLabelIn(
  sticker: Pick<StickerResponse, "label"> & { labelPt?: string | null },
  language: Language,
): string {
  if (language === "pt" && sticker.labelPt) return sticker.labelPt;
  return sticker.label;
}

/** A pack's name in `language`, with the same English fallback as
 *  {@link stickerLabelIn}. */
export function stickerPackNameIn(
  pack: Pick<StickerPackResponse, "name"> & { namePt?: string | null },
  language: Language,
): string {
  if (language === "pt" && pack.namePt) return pack.namePt;
  return pack.name;
}

const stickerIndexCache = new WeakMap<
  StickerPackResponse[],
  Map<string, StickerResponse>
>();

/**
 * Every sticker in `packs` by id. Built once per catalogue array and cached
 * against it, so each sticker bubble in a long thread looks its sticker up
 * without walking every pack again.
 */
export function stickerIndexOf(
  packs: StickerPackResponse[],
): Map<string, StickerResponse> {
  const cachedIndex = stickerIndexCache.get(packs);
  if (cachedIndex) return cachedIndex;
  const stickerIndex = new Map<string, StickerResponse>();
  for (const pack of packs) {
    for (const sticker of pack.stickers) stickerIndex.set(sticker.id, sticker);
  }
  stickerIndexCache.set(packs, stickerIndex);
  return stickerIndex;
}

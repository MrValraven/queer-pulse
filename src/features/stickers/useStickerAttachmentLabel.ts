import type { StickerAttachmentResponse } from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStickerPacks } from "./api/useStickerPacks";
import { stickerIndexOf, stickerLabelIn } from "./stickerLocale";

/**
 * The name to show for a sent sticker, in the reader's language.
 *
 * A sticker message bakes the English `label` it had when it was sent, and
 * its Portuguese `labelPt` too when it had one. A Portuguese reader gets, in
 * order: the baked `labelPt`; the sticker's current Portuguese name from the
 * catalogue, for a message sent before `labelPt` was baked (or while the
 * sticker had none) when the sticker is still published and has one now;
 * the baked English `label`. An English reader always gets `label`. The
 * catalogue is therefore only fetched for a Portuguese reader holding a
 * sticker with no baked `labelPt` (callers pass `null` for any other
 * message).
 */
export function useStickerAttachmentLabel(
  attachment: Pick<
    StickerAttachmentResponse,
    "stickerId" | "label" | "labelPt"
  > | null,
): string {
  const { language } = useTranslation();
  const isPortugueseReader = language === "pt";
  const sentLabel = attachment?.label ?? "";
  const bakedLabelPt = attachment?.labelPt ?? "";
  const { data: packs } = useStickerPacks({
    isEnabled: isPortugueseReader && attachment !== null && !bakedLabelPt,
  });
  if (!isPortugueseReader || !attachment) return sentLabel;
  if (bakedLabelPt) return bakedLabelPt;
  if (!packs) return sentLabel;
  const sticker = stickerIndexOf(packs).get(attachment.stickerId);
  return sticker ? stickerLabelIn(sticker, language) : sentLabel;
}

import { useCallback, useState } from "react";
import { useUploadImage } from "../../members/api/useUploadImage";
import { renderStickerBlob } from "../../stickers/render/renderStickerBlob";
import { primitivesToSvg } from "../../stickers/render/primitivesToSvg";
import { unoReverseGeometry } from "../../stickers/templates/unoReverse.geometry";
import {
  STICKER_CANVAS_SIZE,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";
import { useAddSticker } from "../../stickers/api/useAdminStickerPacks";

export interface StickerPublishProgress {
  done: number;
  total: number;
}

/**
 * Publish one sticker per selected flag, sequentially.
 *
 * Sequential on purpose: every flag is a presign round trip plus an S3 PUT
 * plus a metadata POST, and firing twelve of those at once would burn the
 * per-user presign rate limit (20 per minute) and give no usable progress.
 *
 * A failure part-way leaves the stickers already created in place and
 * collects the flags that did not land, so a retry adds only the missing
 * ones instead of duplicating the pack.
 *
 * `flagLabelsById` carries the translated "<Flag> reverse" label for every
 * flag the page currently shows, resolved by the caller through `t()`. This
 * hook stays translation-free on purpose: `useTranslation` inside a
 * sequential loop would re-read the active language on every iteration
 * instead of once, and a raw flag id must never ship as a sticker's label,
 * because that label becomes the sticker's alt text and its reply-quote
 * line.
 */
export function useStickerPublish(packId: string | null) {
  const uploadImage = useUploadImage("sticker");
  const addSticker = useAddSticker();
  const [progress, setProgress] = useState<StickerPublishProgress | null>(null);
  const [failedFlagIds, setFailedFlagIds] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const publish = useCallback(
    async (
      flagIds: string[],
      params: UnoReverseParams,
      flagLabelsById: Record<string, string>,
    ) => {
      if (!packId || flagIds.length === 0) return;
      setIsPublishing(true);
      setFailedFlagIds([]);
      setProgress({ done: 0, total: flagIds.length });
      const failures: string[] = [];
      // The teardown belongs in `finally`, structurally, rather than as the
      // loop's last two statements: a synchronous throw between iterations,
      // or a step added later outside its own inner try, must still clear
      // `isPublishing`, or the button stays dead until a page reload.
      try {
        for (const [index, flagId] of flagIds.entries()) {
          try {
            const stickerParams: UnoReverseParams = { ...params, flagId };
            const primitives = unoReverseGeometry(stickerParams);
            const blob = await renderStickerBlob(primitives);
            const file = new File([blob], `${flagId}.png`, {
              type: "image/png",
            });
            const uploaded = await uploadImage(file);
            await addSticker.mutateAsync({
              packId,
              body: {
                slug: `uno-reverse-${flagId}`,
                label: flagLabelsById[flagId] ?? flagId,
                storageKey: uploaded.key,
                width: STICKER_CANVAS_SIZE,
                height: STICKER_CANVAS_SIZE,
                svgSource: primitivesToSvg(primitives, STICKER_CANVAS_SIZE),
                templateId: "uno-reverse",
                templateParams: { ...stickerParams },
                keywords: {
                  en: [flagId, "uno", "reverse"],
                  pt: [flagId, "uno", "reverso"],
                },
              },
            });
          } catch {
            failures.push(flagId);
          }
          setProgress({ done: index + 1, total: flagIds.length });
        }
      } finally {
        setFailedFlagIds(failures);
        setIsPublishing(false);
      }
    },
    [packId, uploadImage, addSticker],
  );

  return { publish, progress, failedFlagIds, isPublishing };
}

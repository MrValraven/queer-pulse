import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useClipboard } from "../../../shared/hooks/useClipboard";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gatheringShareDisplayUrl, gatheringShareUrl } from "../data";
import type { GatheringForm } from "../useGatheringForm";
import { COPY_FALLBACK_TOAST_MS } from "./shareKit.data";
import { whatsAppShareUrl } from "./shareLinks";
import { buildStoryContent } from "./storyContent";
import { renderStoryImageBlob } from "./storyImage";
import { useShareKitCalendar } from "./useShareKitCalendar";

/**
 * The four share actions on the published screen, for the gathering the
 * backend just created under `slug` (its first date). The link, WhatsApp and
 * the story image point at that first date. The story image renders once and
 * waits in `storyPreviewBlob` for the preview dialog, which downloads or shares
 * it. `calendarSheet` feeds the "Add to calendar" picker, whose downloaded file
 * links each date to its own slug from `occurrenceSlugs` when the backend
 * returned one per date.
 */
export function useShareKitActions(
  form: GatheringForm,
  slug: string,
  occurrenceSlugs: readonly string[],
) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { copy } = useClipboard();
  const [isStoryImageBusy, setIsStoryImageBusy] = useState(false);
  const [storyPreviewBlob, setStoryPreviewBlob] = useState<Blob | null>(null);
  const calendarSheet = useShareKitCalendar(form, slug, occurrenceSlugs);
  // The running instance's origin plus the gathering's path, so a link copied
  // in dev opens in dev.
  const shareUrl = gatheringShareUrl(slug);

  const copyLink = async () => {
    const didCopy = await copy(shareUrl);
    if (didCopy) {
      showToast(t("gatherings:create.v2.success.linkCopied"), "success");
      return;
    }
    // The clipboard can refuse (permissions, an insecure origin). The link
    // then goes in the toast itself, where the host can select it.
    showToast(
      t("gatherings:create.v2.success.copyFallback", { url: shareUrl }),
      "info",
      COPY_FALLBACK_TOAST_MS,
    );
  };

  const openStoryPreview = async () => {
    if (isStoryImageBusy) return;
    setIsStoryImageBusy(true);
    try {
      const content = buildStoryContent(form, {
        t,
        fmt,
        displayUrl: gatheringShareDisplayUrl(slug),
      });
      const blob = await renderStoryImageBlob(content);
      setStoryPreviewBlob(blob);
    } catch {
      showToast(t("gatherings:create.v2.success.storyFailed"), "error");
    } finally {
      setIsStoryImageBusy(false);
    }
  };

  return {
    whatsAppHref: whatsAppShareUrl(form.title, shareUrl),
    copyLink,
    openStoryPreview,
    closeStoryPreview: () => setStoryPreviewBlob(null),
    storyPreviewBlob,
    isStoryImageBusy,
    calendarSheet,
  };
}

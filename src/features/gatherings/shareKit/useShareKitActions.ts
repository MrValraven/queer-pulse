import { useState } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useClipboard } from "../../../shared/hooks/useClipboard";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  downloadBlob,
  downloadBlobFile,
} from "../../../shared/lib/downloadBlob";
import { gatheringShareDisplayUrl, gatheringShareUrl } from "../data";
import type { GatheringForm } from "../useGatheringForm";
import {
  buildGatheringCalendarEvents,
  buildMultiEventIcs,
} from "./gatheringCalendar";
import { CALENDAR_MIME_TYPE, COPY_FALLBACK_TOAST_MS } from "./shareKit.data";
import {
  calendarFileName,
  storyImageFileName,
  whatsAppShareUrl,
} from "./shareLinks";
import { gatheringPlaceLabel } from "./shareText";
import { buildStoryContent } from "./storyContent";
import { renderStoryImageBlob } from "./storyImage";

/**
 * The four share actions on the published screen, for the gathering the
 * backend just created under `slug` (its first date). The link, WhatsApp and
 * the story image point at that first date. The calendar file links each date
 * to its own slug from `occurrenceSlugs` when the backend returned one per
 * date.
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

  const downloadStoryImage = async () => {
    if (isStoryImageBusy) return;
    setIsStoryImageBusy(true);
    try {
      const content = buildStoryContent(form, {
        t,
        fmt,
        displayUrl: gatheringShareDisplayUrl(slug),
      });
      const blob = await renderStoryImageBlob(content);
      downloadBlobFile(storyImageFileName(slug), blob);
      showToast(t("gatherings:create.v2.success.storyDownloaded"), "success");
    } catch {
      showToast(t("gatherings:create.v2.success.storyFailed"), "error");
    } finally {
      setIsStoryImageBusy(false);
    }
  };

  const downloadCalendar = () => {
    const events = buildGatheringCalendarEvents({
      form,
      slug,
      occurrenceSlugs,
      urlForSlug: gatheringShareUrl,
      location: gatheringPlaceLabel(form, t),
    });
    if (events.length === 0) return;
    downloadBlob(
      calendarFileName(slug),
      buildMultiEventIcs(events),
      CALENDAR_MIME_TYPE,
    );
    showToast(t("gatherings:create.v2.success.calendarDownloaded"), "success");
  };

  return {
    whatsAppHref: whatsAppShareUrl(form.title, shareUrl),
    copyLink,
    downloadStoryImage,
    isStoryImageBusy,
    downloadCalendar,
  };
}

import type { UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "../../../../shared/api/client";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleDraftDto, PublishArticleDto } from "../../api/pieces.api";
import {
  buildPublishPayload,
  publishSuccessToastKey,
} from "./articlePublishAction";
import type { PublishStatus } from "./PublishRail";

/**
 * The editor's explicit publish/schedule/unpublish action, kept out of
 * `ArticleEditorPage` so that component stays under the 200-line cap. Takes
 * its situational arguments at call time rather than as hook options, so the
 * page can create the handler before its loading/not-found early returns.
 *
 * Flushing the autosave first is the whole reason this is a two-step action:
 * the Publish button is enabled by the LOCAL readiness checklist while the
 * server re-checks the SAVED draft, so publishing within the ~1.2s debounce
 * window would otherwise be rejected as "not ready" against content the
 * writer already finished, and a still-pending save could land after the
 * publish and overwrite what went live.
 */
export function useArticlePublishHandler(
  publish: UseMutationResult<ArticleDraftDto | null, Error, PublishArticleDto>,
  saveNow: () => Promise<void>,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return async function handlePublish(
    published: boolean,
    publishStatus: PublishStatus,
    scheduledAt: string | null,
    onPublished: () => void,
  ): Promise<void> {
    try {
      await saveNow();
    } catch {
      showToast(t("magazine:write.header.savedError"), "error");
      return;
    }
    try {
      await publish.mutateAsync(
        buildPublishPayload(published, publishStatus, scheduledAt),
      );
      showToast(t(publishSuccessToastKey(published, publishStatus)), "success");
      if (!published) onPublished();
    } catch (error) {
      // A 400 here means the server-side readiness re-check rejected it
      // (see `publishArticle`).
      showToast(
        error instanceof ApiError && error.status === 400
          ? t("magazine:write.header.publishNotReadyError")
          : t("magazine:write.header.publishError"),
        "error",
      );
    }
  };
}

import { useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "../../../../shared/api/client";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleDraftDto, PublishArticleDto } from "../../api/pieces.api";
import {
  buildPublishPayload,
  publishGateToastKey,
  publishSuccessToastKey,
  readPublishGateFailure,
  type PublishGateFailure,
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
 *
 * The hook also owns `gateFailure`, the server's structured refusal
 * (`magazine_care_gate_open` / `magazine_publish_not_ready`). It lives here
 * rather than on the page because it is produced and cleared entirely by this
 * action: a fresh attempt clears it, a refusal sets it, and the publish rail
 * renders the open items it carries. Before that the desk got one flat
 * "Couldn't publish, try again" toast for a state that no amount of trying
 * again resolves, and the care gate itself is not rendered anywhere in this
 * editor, so there was no way to find out what was blocking.
 */
export function useArticlePublishHandler(
  publish: UseMutationResult<ArticleDraftDto | null, Error, PublishArticleDto>,
  saveNow: () => Promise<void>,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [gateFailure, setGateFailure] = useState<PublishGateFailure | null>(
    null,
  );

  async function handlePublish(
    published: boolean,
    publishStatus: PublishStatus,
    scheduledAt: string | null,
    onPublished: () => void,
  ): Promise<void> {
    // Each attempt starts clean: leaving the previous refusal on screen while
    // a new one is in flight would describe items the desk may have closed.
    setGateFailure(null);
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
      const failure = readPublishGateFailure(error);
      if (failure) {
        setGateFailure(failure);
        showToast(t(publishGateToastKey(failure)), "error");
        return;
      }
      // Any other 400 is still the server-side readiness re-check, from a
      // server that has not been given the structured payload yet.
      showToast(
        error instanceof ApiError && error.status === 400
          ? t("magazine:write.header.publishNotReadyError")
          : t("magazine:write.header.publishError"),
        "error",
      );
    }
  }

  return { handlePublish, gateFailure };
}

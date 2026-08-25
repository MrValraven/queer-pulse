import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  createArticleVersion,
  restoreArticleVersion,
  type ArticleDraftDto,
  type ArticleVersionSummaryDto,
} from "./pieces.api";
import { articleVersionsQueryKey } from "./useArticleVersions";
import {
  DEMO_ARTICLE,
  DEMO_ARTICLE_VERSION_DETAILS,
} from "../data/articleDraft.data";

/** A synthetic id for a demo-only version row — never sent to a server, only
 *  ever used as a React `key` within the same session. */
function demoVersionId(): string {
  return `demo-version-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Write side of the VersionsRail (Phase 7 Wave E), dual-mode.
 *
 * `saveVersion` ("save a version now"): demo patches the
 * `useArticleVersions` cache directly (prepends a synthetic row) and toasts,
 * no network; live calls `POST .../versions` then invalidates that query.
 *
 * `restoreVersion`: demo looks the version up in
 * `DEMO_ARTICLE_VERSION_DETAILS` and returns a full `ArticleDraftDto` built
 * from `DEMO_ARTICLE` with that version's blocks swapped in — the caller
 * (`ArticleEditorPage`) uses the returned draft to reset the editor's local
 * state directly (a query invalidation alone would not do it: the page seeds
 * its local title/blocks/etc. once per `pieceId` and does not re-seed on a
 * mere refetch, by design — see its own doc comment). Live mode calls
 * `POST .../versions/:versionId/restore` (server-side lossless: it snapshots
 * "Before restore" first) and ALSO invalidates both the versions query and
 * this piece's `useArticleDraft` query, so any other reader of the draft
 * (not just this open editor) sees the restored content next time it asks.
 */
export function useVersionMutations(pieceId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const versionsQueryKey = articleVersionsQueryKey(demoMode, pieceId);
  const demoAuthor = t("magazine:write.versions.you");

  const saveVersion = useMutation<void, Error, { label?: string }>({
    mutationFn: async ({ label }) => {
      if (demoMode) {
        const newVersion: ArticleVersionSummaryDto = {
          id: demoVersionId(),
          label: label?.trim() || t("magazine:write.versions.manualSaveLabel"),
          author: demoAuthor,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<ArticleVersionSummaryDto[]>(
          versionsQueryKey,
          (versions = []) => [newVersion, ...versions],
        );
        showToast(t("magazine:write.versions.saveToast"), "success");
        return;
      }
      await createArticleVersion(pieceId, label);
    },
    onSuccess: () => {
      if (!demoMode)
        void queryClient.invalidateQueries({ queryKey: versionsQueryKey });
    },
  });

  const restoreVersion = useMutation<
    ArticleDraftDto,
    Error,
    { versionId: string; label: string }
  >({
    mutationFn: async ({ versionId, label }) => {
      if (demoMode) {
        const versionDetail = DEMO_ARTICLE_VERSION_DETAILS[versionId];
        const restoredVersion: ArticleVersionSummaryDto = {
          id: demoVersionId(),
          label: t("magazine:write.versions.restoredFromLabel", { label }),
          author: demoAuthor,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<ArticleVersionSummaryDto[]>(
          versionsQueryKey,
          (versions = []) => [restoredVersion, ...versions],
        );
        return {
          ...DEMO_ARTICLE,
          blocks: versionDetail?.blocks ?? DEMO_ARTICLE.blocks,
        };
      }
      return restoreArticleVersion(pieceId, versionId);
    },
    onSuccess: (_draft, { label }) => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: versionsQueryKey });
        void queryClient.invalidateQueries({
          queryKey: ["magazine-article-draft", pieceId],
        });
      }
      showToast(
        t("magazine:write.versions.restoreToast", { label }),
        "success",
      );
    },
  });

  return { saveVersion, restoreVersion };
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getArticleVersion,
  getArticleVersions,
  type ArticleVersionDetailDto,
  type ArticleVersionSummaryDto,
} from "./pieces.api";
import {
  DEMO_ARTICLE_VERSION_DETAILS,
  DEMO_ARTICLE_VERSIONS,
} from "../data/articleDraft.data";

/** Shared by `useArticleVersions` and `useVersionMutations` so the list query
 *  and its cache invalidation always agree on the exact key. */
export function articleVersionsQueryKey(demoMode: boolean, pieceId: string) {
  return ["magazine-article-versions", demoMode, pieceId] as const;
}

/**
 * The article editor's version history (Phase 7 Wave E VersionsRail) —
 * summaries only (no `blocks`, see `ArticleVersionSummaryDto`), newest-first.
 * Demo mode always returns the static `DEMO_ARTICLE_VERSIONS` fixture (same
 * one-record limitation as `useArticleDraft`/`useArticleComments`); live mode
 * calls `GET /magazine/admin/pieces/:id/versions`.
 */
export function useArticleVersions(pieceId: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ArticleVersionSummaryDto[]>({
    queryKey: articleVersionsQueryKey(demoMode, pieceId),
    queryFn: async () => {
      if (demoMode) return DEMO_ARTICLE_VERSIONS;
      return getArticleVersions(pieceId);
    },
  });

  return {
    versions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * A single version's full block snapshot, for `VersionDiff`. `versionId`
 * `null` means "nothing selected to compare" — the query stays disabled
 * (`enabled: versionId !== null`), so opening the diff view is what triggers
 * the fetch, not mounting `VersionsRail`. Demo mode looks the id up in
 * `DEMO_ARTICLE_VERSION_DETAILS`; live mode calls
 * `GET /magazine/admin/versions/:versionId`.
 */
export function useArticleVersion(versionId: string | null) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ArticleVersionDetailDto | null>({
    queryKey: ["magazine-article-version", demoMode, versionId],
    queryFn: async () => {
      if (versionId === null) return null;
      if (demoMode) return DEMO_ARTICLE_VERSION_DETAILS[versionId] ?? null;
      return getArticleVersion(versionId);
    },
    enabled: versionId !== null,
  });

  return {
    version: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

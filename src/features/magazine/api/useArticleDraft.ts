import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getArticleDraft, type ArticleDraftDto } from "./pieces.api";
import { DEMO_ARTICLE } from "../data/articleDraft.data";

/**
 * The block-based article draft behind `/magazine/editor/write/:id` (`:id`
 * is the piece id — `pieces.api.ts`'s `getArticleDraft`/`updateArticleDraft`
 * both hang off `/magazine/admin/pieces/:id/article`). Demo mode always
 * returns the single `DEMO_ARTICLE` fixture regardless of `pieceId` (same
 * one-record limitation as `usePieceRecord`/`useDeck`). Live mode calls
 * `GET /magazine/admin/pieces/:id/article`, which auto-creates an empty
 * draft article the first time it's requested (see Phase 3 Task 3's
 * `ensureArticleForPiece`).
 *
 * The query key is prefixed `["magazine-article-draft", pieceId]` so
 * `useArticleMutations`' invalidation (and any future desk-wide bust) can
 * target it precisely.
 *
 * `reload` (ENG-111) is the escape hatch out of a save conflict: it forces a
 * fresh read and hands the draft straight back to the caller, because the
 * editor seeds its local state once per piece and does NOT re-seed on a mere
 * refetch (see `useArticleEditorDraftState`). Returning the draft rather than
 * relying on the query result reaching the caller a render later is what lets
 * the reload be a single awaited step.
 */
export function useArticleDraft(pieceId: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ArticleDraftDto>({
    queryKey: ["magazine-article-draft", pieceId, demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_ARTICLE;
      return getArticleDraft(pieceId);
    },
  });

  const { refetch } = query;
  const reload = useCallback(async (): Promise<ArticleDraftDto | undefined> => {
    const result = await refetch();
    return result.data;
  }, [refetch]);

  return {
    article: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isReloading: query.isRefetching,
    reload,
  };
}

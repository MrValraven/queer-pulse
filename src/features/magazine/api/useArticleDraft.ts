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

  return {
    article: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

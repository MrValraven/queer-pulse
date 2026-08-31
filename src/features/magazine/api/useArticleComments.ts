import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getArticleComments, type ArticleCommentDto } from "./pieces.api";
import { DEMO_ARTICLE_COMMENTS } from "../data/articleDraft.data";

/** Shared by `useArticleComments` and `useCommentMutations` so the query and
 *  its cache patches always agree on the exact key. */
export function articleCommentsQueryKey(demoMode: boolean, pieceId: string) {
  return ["magazine-article-comments", demoMode, pieceId] as const;
}

/**
 * The article editor's threaded comment tree (Phase 7 Wave D NotesRail).
 * Demo mode always returns the static `DEMO_ARTICLE_COMMENTS` fixture
 * (same one-record limitation as `useArticleDraft`/`usePieceRecord`) —
 * `useCommentMutations` patches this exact query's cache directly so adding
 * a note/reply or resolving one is visibly interactive in demo, with no
 * network involved. Live mode calls `GET /magazine/admin/pieces/:id/comments`,
 * which returns the tree pre-sorted (top-level newest-first, replies
 * oldest-first) — this hook renders it as-is.
 */
export function useArticleComments(pieceId: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ArticleCommentDto[]>({
    queryKey: articleCommentsQueryKey(demoMode, pieceId),
    queryFn: async () => {
      if (demoMode) return DEMO_ARTICLE_COMMENTS;
      return getArticleComments(pieceId);
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

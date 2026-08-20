import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getReaderComments, type ReaderCommentsPage } from "./readerComments.api";
import { DEMO_READER_COMMENTS } from "./readerComments.data";

/** Shared by `useReaderComments` and `useReaderCommentMutations` so the
 *  query and its cache patches/invalidations always agree on the exact key. */
export function readerCommentsQueryKey(
  demoMode: boolean,
  articleSlug: string,
  page: number,
) {
  return ["magazine-reader-comments", demoMode, articleSlug, page] as const;
}

/**
 * An article's public reader-comments list (CNT-10): top-level comments
 * newest-first, each with its flat one-level replies oldest-first. Demo mode
 * always returns the static `DEMO_READER_COMMENTS` fixture as a single
 * terminal page; live mode calls GET /magazine/articles/:slug/comments?page=.
 */
export function useReaderComments(articleSlug: string, page = 1) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ReaderCommentsPage>({
    queryKey: readerCommentsQueryKey(demoMode, articleSlug, page),
    queryFn: async () => {
      if (demoMode) {
        return {
          items: DEMO_READER_COMMENTS,
          total: DEMO_READER_COMMENTS.length,
          page: 1,
          pageSize: 20,
        };
      }
      return getReaderComments(articleSlug, page);
    },
    enabled: Boolean(articleSlug),
  });

  return {
    comments: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? 20,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

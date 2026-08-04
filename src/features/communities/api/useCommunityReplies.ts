import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPostReplies, type CommunityReplyDTO } from "./communities.api";

export interface CommunityRepliesResult {
  /** Replies beyond the post's embedded preview, oldest-first, in the order
   *  loaded so far. Append after the embedded `post.replies` preview. */
  extraReplies: CommunityReplyDTO[];
  /** True once another page of replies is known/likely to exist. */
  hasMore: boolean;
  /** Fetch the next page (a no-op in demo, or once nothing more exists). */
  loadMore: () => void;
  isLoadingMore: boolean;
}

/**
 * "Load more replies" for a single community post, continuing past the
 * bounded preview `CommunityPostDTO.replies` already embeds (see
 * `community-posts.service.ts`'s `topRepliesByPost`). `page=1` there is the
 * SAME window as the embedded preview (same page size, same oldest-first
 * order), so this hook starts requesting at `page=2` — no separate cursor to
 * keep in sync between the embedded preview and this endpoint.
 *
 * Lazy by design: nothing fetches until `loadMore()` is called once (a click
 * on "Load more replies"), so simply expanding a thread never issues an extra
 * request for posts that fit entirely in the preview. Demo mode never has
 * more than the mock's own full array, so this is always inert there.
 */
export function useCommunityReplies(
  slug: string,
  postId: string | undefined,
  replyCount: number,
  previewCount: number,
): CommunityRepliesResult {
  const { demoMode } = useDemoMode();
  const [triggered, setTriggered] = useState(false);
  const live = !demoMode && Boolean(postId) && previewCount < replyCount;

  const query = useInfiniteQuery({
    queryKey: ["community-post-replies", slug, postId],
    // Never auto-fetches on mount/enable — every fetch (first page and every
    // "load more" after) is driven explicitly by `loadMore()` below, so
    // simply expanding a thread never issues a request on its own.
    enabled: false,
    initialPageParam: 2,
    queryFn: ({ pageParam }) => getPostReplies(slug, postId!, pageParam),
    getNextPageParam: (last, all) => {
      const loaded = previewCount + all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const extraReplies = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.items),
    [query.data],
  );

  return {
    extraReplies,
    hasMore: live && (!triggered || Boolean(query.hasNextPage)),
    loadMore: () => {
      if (!live) return;
      setTriggered(true);
      void query.fetchNextPage();
    },
    isLoadingMore: triggered && (query.isLoading || query.isFetchingNextPage),
  };
}

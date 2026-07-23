import { useMemo } from "react";
import { useCommunityPosts, type PulsePaging } from "./useCommunityPosts";
import { postToThread } from "./communities.adapters";
import type { Thread } from "../communityDetails";

/**
 * A community's discussions — the same `community_post` store the Pulse feed
 * uses, presented as threads. `useCommunityPosts` already branches demo/live
 * and returns `pinned`/`pulse` (`Post[]`); here we flatten both (pinned first,
 * matching server order) and map each to the Discussion widget's `Thread`.
 * Paging is passed straight through so the widget gets the same "Load more".
 */
export function useCommunityDiscussions(slug: string | undefined): {
  threads: Thread[];
  paging: PulsePaging;
} {
  const { pinned, pulse, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCommunityPosts(slug);

  const threads = useMemo<Thread[]>(
    () => [...pinned, ...pulse].map(postToThread),
    [pinned, pulse],
  );

  return {
    threads,
    paging: { hasNextPage, fetchNextPage, isFetchingNextPage },
  };
}

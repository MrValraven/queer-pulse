import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { SubprofileDirectoryPageVM } from "./useSubprofileDirectory";

/** The query-key prefix every cached directory page lives under: the
 *  results grid and the hero wall, in both modes, for every search, filter
 *  set and sort. */
export const DIRECTORY_QUERY_KEY_PREFIX = ["subprofiles", "directory"] as const;

/** The authoritative follow state the follow endpoints answer with. */
export interface DirectoryCardFollowPatch {
  followerCount: number;
  viewerFollowing: boolean;
}

/** One page with the matching card rewritten, or the same page object when it
 *  holds no card with this id, so untouched pages keep their identity. */
function patchPage(
  page: SubprofileDirectoryPageVM,
  subprofileId: string,
  patch: DirectoryCardFollowPatch,
): SubprofileDirectoryPageVM {
  const hasMatchingCard = page.items.some((card) => card.id === subprofileId);
  if (!hasMatchingCard) return page;
  return {
    ...page,
    items: page.items.map((card) =>
      card.id === subprofileId
        ? {
            ...card,
            followerCount: patch.followerCount,
            viewerFollowing: patch.viewerFollowing,
          }
        : card,
    ),
  };
}

/**
 * Write a follow or an unfollow into every cached directory page that holds
 * the persona, so the card and the wall update without a refetch. The updater
 * returns `undefined` for an entry with no matching card: `setQueryData` skips
 * the write only for `undefined`, and any other return value (even the same
 * object) refreshes `dataUpdatedAt` and clears `isInvalidated`, which would
 * make every stale directory query look fresh and skip its next refetch. The
 * order of a `followed` sort is left as it was until the next fetch, so a card
 * never jumps away from under the tap that moved it.
 */
export function patchDirectoryCardFollow(
  queryClient: QueryClient,
  subprofileId: string,
  patch: DirectoryCardFollowPatch,
): void {
  queryClient.setQueriesData<InfiniteData<SubprofileDirectoryPageVM>>(
    { queryKey: DIRECTORY_QUERY_KEY_PREFIX },
    (previous): InfiniteData<SubprofileDirectoryPageVM> | undefined => {
      if (!previous) return undefined;
      const pages = previous.pages.map((page) =>
        patchPage(page, subprofileId, patch),
      );
      const hasChangedPage = pages.some(
        (page, index) => page !== previous.pages[index],
      );
      return hasChangedPage ? { ...previous, pages } : undefined;
    },
  );
}

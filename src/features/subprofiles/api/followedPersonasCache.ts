import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { FollowedPersonasPage } from "./subprofiles.api";

/** The query-key prefix every cached followed-personas list lives under: the
 *  "You follow" tab's infinite pages and the older numbered pages, in both
 *  modes. */
export const FOLLOWED_PERSONAS_QUERY_KEY_PREFIX = [
  "subprofile",
  "following",
] as const;

/** The authoritative follow state the follow endpoints answer with. */
export interface FollowedPersonaFollowPatch {
  followerCount: number;
  viewerFollowing: boolean;
}

/** One page with the matching row rewritten, plus whether the viewer's
 *  follow flag actually moved. The same page object comes back when it holds
 *  no row with this id, so untouched pages keep their identity. */
function patchPage(
  page: FollowedPersonasPage,
  subprofileId: string,
  patch: FollowedPersonaFollowPatch,
): { page: FollowedPersonasPage; hasFlagChanged: boolean } {
  const matchingRow = page.items.find((item) => item.id === subprofileId);
  if (!matchingRow) return { page, hasFlagChanged: false };
  // A row the server sent is a follow, so an absent flag reads as true.
  const hasFlagChanged =
    (matchingRow.viewerFollowing ?? true) !== patch.viewerFollowing;
  return {
    page: {
      ...page,
      items: page.items.map((item) =>
        item.id === subprofileId
          ? {
              ...item,
              followerCount: patch.followerCount,
              viewerFollowing: patch.viewerFollowing,
            }
          : item,
      ),
    },
    hasFlagChanged,
  };
}

/** How far `total` moves when the flag changed: one fewer follow on an
 *  unfollow, one more on a re-follow. */
function totalDelta(patch: FollowedPersonaFollowPatch): number {
  return patch.viewerFollowing ? 1 : -1;
}

function patchInfiniteEntry(
  previous: InfiniteData<FollowedPersonasPage>,
  subprofileId: string,
  patch: FollowedPersonaFollowPatch,
): InfiniteData<FollowedPersonasPage> | undefined {
  const results = previous.pages.map((page) =>
    patchPage(page, subprofileId, patch),
  );
  const hasChangedPage = results.some(
    (result, index) => result.page !== previous.pages[index],
  );
  if (!hasChangedPage) return undefined;
  const hasFlagChanged = results.some((result) => result.hasFlagChanged);
  const delta = hasFlagChanged ? totalDelta(patch) : 0;
  return {
    ...previous,
    // Every page carries the list's `total`, and the tab reads it off the
    // first, so all of them move together.
    pages: results.map((result) => ({
      ...result.page,
      total: Math.max(0, result.page.total + delta),
    })),
  };
}

function patchNumberedEntry(
  previous: FollowedPersonasPage,
  subprofileId: string,
  patch: FollowedPersonaFollowPatch,
): FollowedPersonasPage | undefined {
  const result = patchPage(previous, subprofileId, patch);
  if (result.page === previous) return undefined;
  const delta = result.hasFlagChanged ? totalDelta(patch) : 0;
  return { ...result.page, total: Math.max(0, result.page.total + delta) };
}

function isInfiniteData(
  data: InfiniteData<FollowedPersonasPage> | FollowedPersonasPage,
): data is InfiniteData<FollowedPersonasPage> {
  return "pages" in data;
}

/**
 * Write a follow or an unfollow into every cached followed-personas page that
 * holds the persona, so the "You follow" tab's card flips its button in place
 * and STAYS on the grid: a mis-tapped unfollow is one tap to undo, and the
 * row is gone the next time the tab loads. Both cache shapes are patched, the
 * infinite pages and the older numbered `["subprofile", "following", page]`
 * entries.
 *
 * The updater returns `undefined` for an entry with no matching row:
 * `setQueryData` skips the write only for `undefined`, and any other return
 * value (even the same object) refreshes `dataUpdatedAt` and clears
 * `isInvalidated`, which would make a stale list look fresh and skip its next
 * refetch. The same `directoryCardCache.ts` rule.
 */
export function patchFollowedPersonaFollow(
  queryClient: QueryClient,
  subprofileId: string,
  patch: FollowedPersonaFollowPatch,
): void {
  queryClient.setQueriesData<
    InfiniteData<FollowedPersonasPage> | FollowedPersonasPage
  >({ queryKey: FOLLOWED_PERSONAS_QUERY_KEY_PREFIX }, (previous) => {
    if (!previous) return undefined;
    return isInfiniteData(previous)
      ? patchInfiniteEntry(previous, subprofileId, patch)
      : patchNumberedEntry(previous, subprofileId, patch);
  });
}

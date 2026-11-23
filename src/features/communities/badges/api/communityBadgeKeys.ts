import type { QueryClient } from "@tanstack/react-query";
import type { CommunityBadgesDemoViewer } from "../communityBadgesDemoStore";

/**
 * Query keys for a community's badges, gifts and worn badge. Language rides in
 * the key per house convention (as `communityGivingKey` does). Every write
 * invalidates `all(slug)`, which prefixes every key below.
 *
 * Each builder takes an optional last part, the demo viewer's key part (see
 * `demoViewerKeyPart`). Live passes none; demo passes what the store reads, so
 * a demo join, leave or role change reads under a fresh key.
 */
export const communityBadgeKeys = {
  all: (slug: string) => ["community-badges", slug] as const,
  list: (
    slug: string,
    isDemoMode: boolean,
    language: string,
    viewerKeyPart: readonly unknown[] = [],
  ) =>
    [
      "community-badges",
      slug,
      "list",
      isDemoMode,
      language,
      ...viewerKeyPart,
    ] as const,
  manage: (
    slug: string,
    isDemoMode: boolean,
    language: string,
    viewerKeyPart: readonly unknown[] = [],
  ) =>
    [
      "community-badges",
      slug,
      "manage",
      isDemoMode,
      language,
      ...viewerKeyPart,
    ] as const,
  allowance: (
    slug: string,
    isDemoMode: boolean,
    language: string,
    viewerKeyPart: readonly unknown[] = [],
  ) =>
    [
      "community-badges",
      slug,
      "allowance",
      isDemoMode,
      language,
      ...viewerKeyPart,
    ] as const,
  shelf: (
    slug: string,
    isDemoMode: boolean,
    language: string,
    viewerKeyPart: readonly unknown[] = [],
  ) =>
    [
      "community-badges",
      slug,
      "shelf",
      isDemoMode,
      language,
      ...viewerKeyPart,
    ] as const,
  memberGifts: (
    slug: string,
    memberSlug: string,
    isDemoMode: boolean,
    language: string,
    viewerKeyPart: readonly unknown[] = [],
  ) =>
    [
      "community-badges",
      slug,
      "member-gifts",
      memberSlug,
      isDemoMode,
      language,
      ...viewerKeyPart,
    ] as const,
};

/**
 * What the demo badge store reads off the viewer: whether they are a member
 * and their seat. Append it to a demo key (live keys take none), so the cache
 * follows a demo join, leave or role change even under an infinite stale time.
 */
export function demoViewerKeyPart(
  viewer: CommunityBadgesDemoViewer,
): readonly [isMember: boolean, role: string | null] {
  return [viewer.isMember, viewer.role] as const;
}

/**
 * The live queries that carry a name line's worn badge and gift mark: the
 * roster rows and their search, the community posts and their search, and the
 * loaded-more replies. A live flair, gift or badge write invalidates these so
 * the name lines follow. Demo reads the demo store at render, so it needs
 * none of this.
 */
export const LIVE_NAME_LINE_KEYS = (slug: string) =>
  [
    ["roster", slug],
    ["rosterSearch", slug],
    ["community-posts", slug],
    ["community-posts-search", slug],
    ["community-post-replies", slug],
  ] as const;

/**
 * Re-reads every loaded-more replies list in place. `useCommunityReplies` is
 * an infinite query with `enabled: false`, which neither `invalidateQueries`
 * nor `refetchQueries` re-fetches (both skip a disabled query). Fetching the
 * cached query directly refetches every page already loaded and keeps the old
 * pages on screen until the new ones land.
 */
function refetchLoadedReplies(queryClient: QueryClient, slug: string): void {
  const loadedReplies = queryClient
    .getQueryCache()
    .findAll({ queryKey: ["community-post-replies", slug] })
    .filter((query) => query.state.data !== undefined);
  for (const query of loadedReplies) {
    void query.fetch().catch(() => {});
  }
}

/** Invalidates `LIVE_NAME_LINE_KEYS` and refreshes the loaded-more replies. */
export function refreshLiveNameLines(
  queryClient: QueryClient,
  slug: string,
): void {
  for (const queryKey of LIVE_NAME_LINE_KEYS(slug)) {
    void queryClient.invalidateQueries({ queryKey });
  }
  refetchLoadedReplies(queryClient, slug);
}

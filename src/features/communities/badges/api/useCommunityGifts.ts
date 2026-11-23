import { useMemo } from "react";
import {
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Paginated } from "../../../../shared/api/refs";
import {
  type CommunityBadgesDemoViewer,
  demoGetGiftAllowance,
  demoListShelf,
  demoMemberGifts,
} from "../communityBadgesDemoStore";
import { useDemoBadgeViewerResolver } from "../useDemoBadgeViewer";
import {
  getCommunityGiftAllowance,
  getCommunityMemberGifts,
  getMyCommunityGifts,
  type CommunityGiftAllowanceDTO,
  type CommunityMemberGiftsResponse,
  type CommunityShelfGiftDTO,
} from "./communityBadges.api";
import { communityBadgeKeys, demoViewerKeyPart } from "./communityBadgeKeys";

/**
 * Gift reads: the sender's weekly allowance, the recipient's own shelf and the
 * marks anyone can see on a member. Demo answers from the badges demo store
 * through the viewer resolver (an error the store throws is the query's
 * error); live calls the gift routes. No caller mounts these in a space.
 */

interface GiftReadOptions {
  enabled?: boolean;
}

interface ShelfPage {
  items: CommunityShelfGiftDTO[];
  total: number;
  page: number;
}

export interface MyCommunityGiftsResult {
  gifts: CommunityShelfGiftDTO[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  /** The failure behind `isError`, for a cause line that names it. */
  error: unknown;
  /** The latest next-page fetch failed; the pages already loaded stay. */
  isFetchNextPageError: boolean;
  /** A retry or background read is in flight. */
  isRefetching: boolean;
  refetch: () => void;
}

/** The demo store never changes on its own, so a demo read stays fresh until a
 *  write invalidates it. */
const demoStaleTime = (isDemoMode: boolean) =>
  isDemoMode ? Infinity : undefined;

/** Demo reads depend on the viewer's membership and seat, so those ride in the
 *  key and a demo join, leave or role change reads fresh. Live has none. */
function demoViewerKeyPartFor(
  isDemoMode: boolean,
  slug: string | undefined,
  resolveViewer: (slug: string) => CommunityBadgesDemoViewer,
): readonly unknown[] {
  return isDemoMode && slug ? demoViewerKeyPart(resolveViewer(slug)) : [];
}

/** The staff caller's gifts sent in the last 7 days against the weekly cap. */
export function useCommunityGiftAllowance(
  slug: string | undefined,
  options: GiftReadOptions = {},
): UseQueryResult<CommunityGiftAllowanceDTO> {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const resolveViewer = useDemoBadgeViewerResolver();
  const viewerKeyPart = demoViewerKeyPartFor(demoMode, slug, resolveViewer);
  return useQuery<CommunityGiftAllowanceDTO>({
    queryKey: communityBadgeKeys.allowance(
      slug ?? "",
      demoMode,
      language,
      viewerKeyPart,
    ),
    enabled: enabled && Boolean(slug),
    staleTime: demoStaleTime(demoMode),
    queryFn: () =>
      demoMode
        ? demoGetGiftAllowance(slug!, resolveViewer(slug!))
        : getCommunityGiftAllowance(slug!),
  });
}

/**
 * The viewer's own received gifts, newest first, hidden ones included. Pages
 * of 20 are appended until the server `total`, shaped like `useRoster`.
 */
export function useMyCommunityGifts(
  slug: string | undefined,
  options: GiftReadOptions = {},
): MyCommunityGiftsResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const resolveViewer = useDemoBadgeViewerResolver();
  const viewerKeyPart = demoViewerKeyPartFor(demoMode, slug, resolveViewer);
  const isEnabled = enabled && Boolean(slug);
  const query = useInfiniteQuery<ShelfPage>({
    queryKey: communityBadgeKeys.shelf(
      slug ?? "",
      demoMode,
      language,
      viewerKeyPart,
    ),
    enabled: isEnabled,
    initialPageParam: 1,
    staleTime: demoStaleTime(demoMode),
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const response: Paginated<CommunityShelfGiftDTO> = demoMode
        ? demoListShelf(slug!, resolveViewer(slug!), page)
        : await getMyCommunityGifts(slug!, page);
      return {
        items: response.items,
        total: response.total,
        page: response.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((count, page) => count + page.items.length, 0);
      return last.items.length > 0 && loaded < last.total
        ? last.page + 1
        : undefined;
    },
  });

  const gifts = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.items),
    [query.data],
  );

  return {
    gifts,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    // Status-based: a query paused offline has no data and is not fetching.
    isLoading: isEnabled && query.isPending,
    isError: query.isError,
    error: query.error,
    isFetchNextPageError: query.isFetchNextPageError,
    isRefetching: query.isRefetching,
    refetch: () => void query.refetch(),
  };
}

/** The visible gift marks on one member, with whether the viewer may remove each. */
export function useCommunityMemberGifts(
  slug: string | undefined,
  memberSlug: string | undefined,
  options: GiftReadOptions = {},
): UseQueryResult<CommunityMemberGiftsResponse> {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const resolveViewer = useDemoBadgeViewerResolver();
  const viewerKeyPart = demoViewerKeyPartFor(demoMode, slug, resolveViewer);
  return useQuery<CommunityMemberGiftsResponse>({
    queryKey: communityBadgeKeys.memberGifts(
      slug ?? "",
      memberSlug ?? "",
      demoMode,
      language,
      viewerKeyPart,
    ),
    enabled: enabled && Boolean(slug) && Boolean(memberSlug),
    staleTime: demoStaleTime(demoMode),
    queryFn: () =>
      demoMode
        ? demoMemberGifts(slug!, resolveViewer(slug!), memberSlug!)
        : getCommunityMemberGifts(slug!, memberSlug!),
  });
}

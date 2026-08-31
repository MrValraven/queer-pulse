/**
 * COMMUNITY-LEVEL join requests: existing members asking to join one gated
 * community (that community's mod queue). Do not confuse this hook with
 * `src/features/admin/api/useJoinRequests.ts`, which lists PLATFORM-LEVEL
 * join requests, strangers with no account asking to join QueerPulse itself.
 * Same name, same vocabulary (approve/decline), unrelated data: this one
 * reads `GET /communities/:slug/join-requests`, the other `GET
 * /join-requests`.
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
import { refToPerson } from "./communities.adapters";
import {
  getJoinRequestsForReview,
  type CommunityJoinRequestReviewDTO,
} from "./communityJoin.api";
import { getLiving } from "../livingCommunities.data";
import type { ModRequest } from "../community.model";

export interface JoinRequestsResult {
  /** The rows loaded so far: page one, plus every page `fetchNextPage` added. */
  items: ModRequest[];
  /**
   * How many requests are PENDING in this community altogether, which is not
   * `items.length` once the queue runs past one page. Before ENG-41 there was no
   * such number to show: the endpoint returned a flat array capped at 200 rows
   * and the queue simply rendered its length, so a community with more pending
   * requests than that understated its own backlog and hid the newest requests
   * in it.
   */
  total: number;
  /** Loading/failure signal plus its retry, shaped for `ModQueueStatus`: a 403
   *  or a dropped request must render as "we could not load this", never as an
   *  empty queue that reads as "nothing to review". */
  state: { isLoading: boolean; isError: boolean; retry: () => void };
  /** The queue's own pagination, the same shape the roster's load-more takes.
   *  `hasNextPage` is false once every pending request has been loaded. */
  paging: {
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
  };
}

/**
 * One queue row → the mod-tools `ModRequest`, carrying the reviewer-side
 * context the applicant card renders (pronouns, account age, shared
 * connections, shared communities) and the involvement answer as its own
 * field. All of it is optional: any of these can be null on a row the backend
 * computed no context for, and the card simply shows fewer lines.
 */
function reviewDtoToModRequest(
  dto: CommunityJoinRequestReviewDTO,
  translate: TFunction,
): ModRequest {
  return {
    id: dto.id,
    person: refToPerson(dto.member, translate),
    note: dto.note ?? undefined,
    createdAt: dto.createdAt,
    pronouns: dto.member.pronouns ?? undefined,
    involvement: dto.involvement ?? undefined,
    accountCreatedAt: dto.accountCreatedAt ?? undefined,
    sharedConnectionCount: dto.sharedConnectionCount ?? undefined,
    sharedCommunityCount: dto.sharedCommunityCount ?? undefined,
  };
}

/**
 * Pending join requests for a gated community's mod queue, PAGINATED (ENG-41).
 * Demo returns the flagship's mock requests synchronously; live calls GET
 * /communities/:slug/join-requests (mod-only) and adapts each to a ModRequest.
 *
 * `total` rides out beside `items` because they are different numbers: the
 * endpoint used to answer with a flat array capped at 200 rows and the queue
 * rendered its length as the backlog, so a community past that cap both
 * understated how many people were waiting and hid its newest requests
 * entirely. `fetchNextPage` is how a moderator reaches the rest.
 *
 * The failure signal is part of the result on purpose. This endpoint can 403
 * (the documented community-mod vs. platform-moderator gap, see
 * `communities.api.ts`), and swallowing that into `[]` painted the "No pending
 * requests" empty state — which a moderator reads as "all clear" when in fact
 * the queue was never loaded.
 */
export function useJoinRequests(slug: string | undefined): JoinRequestsResult {
  const { demoMode } = useDemoMode();
  // Live rows resolve a nulled-out member ref to a translated placeholder, so
  // the mapping runs outside `queryFn` and follows a language switch directly.
  const { t } = useTranslation();
  const query = useInfiniteQuery<ItemsPage<CommunityJoinRequestReviewDTO>>({
    queryKey: ["join-requests", slug],
    enabled: !demoMode && Boolean(slug),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      getJoinRequestsForReview(slug!, pageParam as number, signal),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const refetch = () => void query.refetch();
  if (demoMode) {
    // The demo flagship's mock queue is one synthetic page: it is a fixture, so
    // there is never a later page to reach and its length IS its total.
    const demoRequests = getLiving(slug)?.joinRequests ?? [];
    return {
      items: demoRequests,
      total: demoRequests.length,
      state: { isLoading: false, isError: false, retry: () => {} },
      paging: {
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: () => {},
      },
    };
  }
  return {
    items:
      query.data?.pages.flatMap((page) =>
        page.items.map((dto) => reviewDtoToModRequest(dto, t)),
      ) ?? [],
    total: query.data?.pages[0]?.total ?? 0,
    state: {
      isLoading: query.isLoading,
      isError: query.isError,
      retry: refetch,
    },
    paging: {
      hasNextPage: query.hasNextPage,
      isFetchingNextPage: query.isFetchingNextPage,
      fetchNextPage: () => void query.fetchNextPage(),
    },
  };
}

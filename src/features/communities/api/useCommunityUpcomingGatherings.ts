import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityEvent } from "../community.model";
import { pulseEventToCommunityEvent } from "./communities.adapters";
import { getCommunityUpcomingGatherings } from "./communityUpcomingGatherings.api";

export interface CommunityUpcomingGatheringsResult {
  /** Every page loaded so far, soonest first. */
  events: CommunityEvent[];
  isLoading: boolean;
  isError: boolean;
  /** A further page is waiting behind "Show more gatherings". */
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

const NOOP = () => {};
const EMPTY: CommunityUpcomingGatheringsResult = {
  events: [],
  isLoading: false,
  isError: false,
  hasMore: false,
  isLoadingMore: false,
  loadMore: NOOP,
  refetch: NOOP,
};

/**
 * `GET /communities/:slug/upcoming-gatherings` — the gatherings a PROSPECTIVE
 * member may see on a community's Events tab (PRD-145).
 *
 * The exact mirror image of `useCommunityPulse`: that one is enabled for a
 * roster member and this one for everybody else, and the two are never called
 * together. A non-member used to get the pulse's `enabled: false` and
 * therefore an empty list, so the Events tab told every prospective member
 * "No gatherings on the calendar yet" no matter how full the calendar was.
 *
 * Demo mode short-circuits to `EMPTY`, exactly as `useCommunityPulse` does:
 * the prototype keeps reading the mock `living.events`.
 *
 * Paged at 10 by the server. Two surfaces subscribe to this one query (the
 * detail state hook, which feeds the events into the hub's view-model and the
 * tab's count, and `EventsTab` itself, which owns the "show more" control), so
 * they share a single react-query cache entry and a single request.
 */
export function useCommunityUpcomingGatherings(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
): CommunityUpcomingGatheringsResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const fmt = useFormat();
  const query = useInfiniteQuery({
    queryKey: ["community-upcoming-gatherings", slug],
    enabled: !demoMode && enabled && Boolean(slug),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getCommunityUpcomingGatherings(slug!, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  if (demoMode) return EMPTY;
  if (!query.data) {
    return {
      ...EMPTY,
      isLoading: query.isLoading,
      isError: query.isError,
      refetch: () => void query.refetch(),
    };
  }

  const onlineLabel = t("gatherings:spots.online");
  const events = query.data.pages.flatMap((page) =>
    page.items.map((gathering) =>
      pulseEventToCommunityEvent(
        {
          slug: gathering.slug,
          title: gathering.title,
          startAt: gathering.startAt,
          venue: gathering.venue,
          isOnline: gathering.isOnline,
          // The pulse lane's count is never null; this one is, and null means
          // the host turned the attendee count off. Both null and zero read as
          // "open to all" rather than as "0 going", which would be a number
          // this response deliberately does not carry.
          goingCount: gathering.goingCount ?? 0,
        },
        fmt,
        gathering.goingCount && gathering.goingCount > 0
          ? t("gatherings:spots.going", { count: gathering.goingCount })
          : t("gatherings:spots.openToAll"),
        onlineLabel,
      ),
    ),
  );

  return {
    events,
    isLoading: false,
    isError: false,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
    refetch: () => void query.refetch(),
  };
}

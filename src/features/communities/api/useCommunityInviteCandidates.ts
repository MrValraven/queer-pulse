import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSocial } from "../../../app/providers/useSocial";
import type { MemberSelectPerson } from "../../../shared/components/ui";
import { useConnectionsList } from "../../connect/api/useConnectionsList";
import { getLiving } from "../livingCommunities.data";
import {
  getCommunityInviteCandidates,
  type CommunityInviteCandidateDTO,
} from "./communityInvites.api";

export interface CommunityInviteCandidatesResult {
  /** The people to offer, every page fetched so far, in the server's order. */
  people: MemberSelectPerson[];
  /** True while the first page for the current term is in flight. */
  isLoading: boolean;
  /** The first page for the current term failed. A failed next page leaves
   *  the loaded rows in place and reports `isFetchNextPageError` instead. */
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  /** The server total for the current term, or the local count in demo.
   *  `undefined` while the first live page is still loading. */
  total: number | undefined;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

interface CandidatesPageVM {
  people: MemberSelectPerson[];
  total: number;
  page: number;
}

const NOOP = () => {};

function candidateToPerson(
  candidate: CommunityInviteCandidateDTO,
): MemberSelectPerson {
  return {
    slug: candidate.slug,
    name: `${candidate.firstName} ${candidate.lastName}`.trim(),
    avatarUrl: candidate.avatarUrl ?? undefined,
    pronouns: candidate.pronouns ?? undefined,
  };
}

/**
 * `GET /communities/:slug/invites/candidates`: the staff invite picker's
 * pool, meaning the caller's own connections who could be invited here,
 * searched on the server (`q`) and paged through `fetchNextPage`.
 *
 * The picker used to page in the first page of connections and the first page
 * of the roster and filter one against the other in the browser, so anybody
 * past either first page was out of reach and people already invited were
 * still offered. The server now answers the whole question, so the rows are
 * rendered exactly as sent: a client filter over them would hide real matches.
 *
 * `searchTerm` should arrive already debounced; each trimmed term is its own
 * infinite query, so a page 2 is never appended onto another term's page 1.
 * `options.enabled` carries the staff gate (the endpoint 403s anybody else).
 *
 * Demo mode has no server. It derives the pool the way the panel always did:
 * the demo connections (searched locally by `useConnectionsList`) minus
 * blocked people and minus the demo roster, all in one page.
 */
export function useCommunityInviteCandidates(
  slug: string,
  searchTerm: string,
  options: { enabled?: boolean } = {},
): CommunityInviteCandidatesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { isBlocked } = useSocial();
  const trimmedSearchTerm = searchTerm.trim();
  // Idle in live mode: the candidates endpoint replaces it there.
  const demoConnections = useConnectionsList("all", {
    searchTerm: trimmedSearchTerm,
    isEnabled: demoMode,
  });

  const query = useInfiniteQuery<CandidatesPageVM>({
    queryKey: [
      "community-invite-candidates",
      slug,
      demoMode,
      trimmedSearchTerm,
    ],
    enabled: !demoMode && enabled && Boolean(slug),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await getCommunityInviteCandidates(slug, {
        searchTerm: trimmedSearchTerm,
        page: pageParam as number,
      });
      return {
        people: response.items.map(candidateToPerson),
        total: response.total,
        page: response.page,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (count, page) => count + page.people.length,
        0,
      );
      return loadedCount < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  // The demo roster is the flagship mock `useRoster` serves in demo. It is
  // read here directly so live mode never fires a roster request it does not
  // need.
  const demoPeople = useMemo<MemberSelectPerson[]>(() => {
    if (!demoMode) return [];
    const rosterSlugs = new Set(
      (getLiving(slug)?.roster ?? []).map((member) => member.slug),
    );
    return demoConnections.views
      .filter((view) => !isBlocked(view.slug) && !rosterSlugs.has(view.slug))
      .map((view) => ({
        slug: view.slug,
        name: view.name,
        avatarUrl: view.photo,
        pronouns: view.pron,
      }));
  }, [demoMode, slug, demoConnections.views, isBlocked]);

  const livePeople = useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page.people),
    [query.data],
  );

  if (demoMode) {
    return {
      people: demoPeople,
      isLoading: false,
      // Local state, so there is no request to fail.
      isError: false,
      hasNextPage: false,
      fetchNextPage: NOOP,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
      total: demoPeople.length,
      refetch: NOOP,
    };
  }

  return {
    people: livePeople,
    // An idle query is pending in React Query's terms; nothing is loading.
    isLoading: enabled && query.isPending,
    // A failed next page also sets `isError`. Only a first page that never
    // landed is an error the picker must own; blanking the rows already on
    // screen for a missing page 2 would be worse than the missing page.
    isError: query.isError && livePeople.length === 0,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    // Every page echoes the same server total; take the freshest one.
    total: query.data?.pages.at(-1)?.total,
    refetch: () => void query.refetch(),
  };
}

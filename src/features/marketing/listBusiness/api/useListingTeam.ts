import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import { getListingTeam, searchListingTeamCandidates } from "./listingTeam.api";
import {
  isCandidateQueryReady,
  normalizeCandidateQuery,
  toListingTeamManagerListView,
  toPersonaCandidateViews,
} from "./listingTeam.adapters";
import {
  demoGetListingTeam,
  demoSearchListingTeamCandidates,
} from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import type {
  ListingTeamManagerListView,
  ListingTeamPersonaCandidateView,
} from "./listingTeam.types";

/** How long the persona search waits for typing to pause. */
const CANDIDATE_SEARCH_DELAY_MS = 300;
const NO_CANDIDATES: ListingTeamPersonaCandidateView[] = [];

/**
 * One listing's team for the people who run it: requests waiting, invites
 * sent and the accepted team in page order. Demo reads the in-memory store
 * through the same adapters as live.
 */
export function useListingTeam(listingRef: string): {
  team: ListingTeamManagerListView | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery({
    queryKey: listingTeamQueryKeys.manager(listingRef, demoMode),
    enabled: loggedIn && listingRef.length > 0,
    queryFn: async () =>
      toListingTeamManagerListView(
        demoMode
          ? demoGetListingTeam(listingRef)
          : await getListingTeam(listingRef),
      ),
  });
  return {
    team: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * Personas the business can invite, searched on the server once typing
 * pauses. A leading at sign is dropped, and the search waits for the query
 * to reach the contract's length window.
 */
export function useListingTeamCandidates(
  listingRef: string,
  rawQuery: string,
): {
  candidates: ListingTeamPersonaCandidateView[];
  isQueryReady: boolean;
  isSearching: boolean;
  isError: boolean;
} {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const typedQuery = normalizeCandidateQuery(rawQuery, { shouldDropAt: true });
  const settledQuery = normalizeCandidateQuery(
    useDebouncedValue(rawQuery, CANDIDATE_SEARCH_DELAY_MS),
    { shouldDropAt: true },
  );
  const isQueryReady = isCandidateQueryReady(typedQuery);
  const isSettledQueryReady = isCandidateQueryReady(settledQuery);
  const query = useQuery({
    queryKey: listingTeamQueryKeys.managerCandidates(
      listingRef,
      settledQuery,
      demoMode,
    ),
    enabled: loggedIn && listingRef.length > 0 && isSettledQueryReady,
    queryFn: async ({ signal }) =>
      toPersonaCandidateViews(
        demoMode
          ? demoSearchListingTeamCandidates(listingRef, settledQuery)
          : await searchListingTeamCandidates(listingRef, settledQuery, signal),
      ),
  });
  const isWaitingForTyping = typedQuery !== settledQuery;
  return {
    candidates:
      isQueryReady && isSettledQueryReady
        ? (query.data ?? NO_CANDIDATES)
        : NO_CANDIDATES,
    isQueryReady,
    isSearching: isQueryReady && (isWaitingForTyping || query.isFetching),
    isError: isQueryReady && query.isError,
  };
}

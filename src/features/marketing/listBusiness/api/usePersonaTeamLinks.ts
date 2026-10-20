import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import {
  getPersonaTeamLinks,
  searchPersonaTeamListingCandidates,
} from "./listingTeam.api";
import {
  isCandidateQueryReady,
  normalizeCandidateQuery,
  toListingCandidateViews,
  toListingTeamPersonaListView,
} from "./listingTeam.adapters";
import {
  demoGetPersonaTeamLinks,
  demoSearchPersonaTeamListingCandidates,
} from "./listingTeam.demo";
import { listingTeamQueryKeys } from "./listingTeamQueryKeys";
import type {
  ListingTeamListingCandidateView,
  ListingTeamPersonaListView,
} from "./listingTeam.types";

/** How long the listing search waits for typing to pause. */
const CANDIDATE_SEARCH_DELAY_MS = 300;
const NO_CANDIDATES: ListingTeamListingCandidateView[] = [];

/**
 * One persona's team links for its owner: invites waiting, requests sent and
 * the teams it is on. Demo reads the in-memory store through the same
 * adapters as live.
 */
export function usePersonaTeamLinks(subprofileId: string): {
  links: ListingTeamPersonaListView | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery({
    queryKey: listingTeamQueryKeys.persona(subprofileId, demoMode),
    enabled: loggedIn && subprofileId.length > 0,
    queryFn: async () =>
      toListingTeamPersonaListView(
        demoMode
          ? demoGetPersonaTeamLinks(subprofileId)
          : await getPersonaTeamLinks(subprofileId),
      ),
  });
  return {
    links: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * Listings the persona can ask to join, searched on the server once typing
 * pauses. The query keeps an at sign as typed (listing names may hold one).
 */
export function usePersonaTeamListingCandidates(
  subprofileId: string,
  rawQuery: string,
): {
  candidates: ListingTeamListingCandidateView[];
  isQueryReady: boolean;
  isSearching: boolean;
  isError: boolean;
} {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const typedQuery = normalizeCandidateQuery(rawQuery, { shouldDropAt: false });
  const settledQuery = normalizeCandidateQuery(
    useDebouncedValue(rawQuery, CANDIDATE_SEARCH_DELAY_MS),
    { shouldDropAt: false },
  );
  const isQueryReady = isCandidateQueryReady(typedQuery);
  const isSettledQueryReady = isCandidateQueryReady(settledQuery);
  const query = useQuery({
    queryKey: listingTeamQueryKeys.personaCandidates(
      subprofileId,
      settledQuery,
      demoMode,
    ),
    enabled: loggedIn && subprofileId.length > 0 && isSettledQueryReady,
    queryFn: async ({ signal }) =>
      toListingCandidateViews(
        demoMode
          ? demoSearchPersonaTeamListingCandidates(subprofileId, settledQuery)
          : await searchPersonaTeamListingCandidates(
              subprofileId,
              settledQuery,
              signal,
            ),
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

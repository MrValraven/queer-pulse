import { useMemo } from "react";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../shared/hooks/useDebouncedValue";
import { useTrustNetworkMemberSearch } from "./api/useTrustNetwork";
import type { TrustNetworkMemberSearchResultDTO } from "./api/adminTrustNetwork.api";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import { matchMembersInGraph } from "./vouchGraphSearch";

/** A4: the "In this graph" group lists at most this many local matches. */
export const IN_GRAPH_RESULT_LIMIT = 8;
/** Shortest term the "All members" server query fires on. Mirrors
 *  `MIN_SEARCH_LENGTH` in `api/useTrustNetwork.ts`. */
export const ALL_MEMBERS_MIN_LENGTH = 2;
/** A4: the server query waits for typing to pause this long. */
const SERVER_DEBOUNCE_MS = 300;

/** One pickable row of the search listbox, in display order. */
export type VouchSearchOption =
  | { kind: "graph"; key: string; person: VouchPerson }
  | { kind: "member"; key: string; member: TrustNetworkMemberSearchResultDTO };

export interface VouchGraphSearchResults {
  /** Local matches over every loaded member, by name, initials or slug. */
  graphMatches: VouchPerson[];
  /** Server matches across QueerPulse, minus anyone already in this graph. */
  memberMatches: TrustNetworkMemberSearchResultDTO[];
  /** Both groups flattened, "In this graph" first, for arrow-key moves. */
  options: VouchSearchOption[];
  /** The typed term holds something besides whitespace. */
  hasTerm: boolean;
  /** The term is long enough for the "All members" query. */
  isAllMembersReady: boolean;
  /** The "All members" query is waiting on the debounce or the network. */
  isSearchingMembers: boolean;
  /** Typing has paused and the server answer for this exact term is in, so
   *  the counts are safe to announce. */
  isSettled: boolean;
}

/** Index of an option's DOM id, shared by the combobox and its listbox. */
export function vouchSearchOptionId(listboxId: string, index: number): string {
  return `${listboxId}-option-${index}`;
}

/**
 * Feeds the trust network's one search box (A4). Local matches update on
 * every keystroke; the "All members" server query runs on the debounced term
 * once it reaches `ALL_MEMBERS_MIN_LENGTH`, and drops slugs already loaded
 * into the graph so each member appears in one group only.
 */
export function useVouchGraphSearchResults(
  search: string,
): VouchGraphSearchResults {
  const graph = useTrustGraph();
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, SERVER_DEBOUNCE_MS);
  const { results, isFetching, isPlaceholderData } =
    useTrustNetworkMemberSearch(debouncedSearch);
  const isAllMembersReady = trimmedSearch.length >= ALL_MEMBERS_MIN_LENGTH;
  const isDebouncing = isDebounceSettling(trimmedSearch, debouncedSearch);
  // Rows from an earlier term (the debounce gap, or the query's placeholder
  // data while the next request runs) are held back, so Enter never lands
  // on a member the current term does not match.
  const isMemberDataStale = isDebouncing || isPlaceholderData;
  const isSearchingMembers =
    isAllMembersReady && (isMemberDataStale || isFetching);

  const graphMatches = useMemo(
    () => matchMembersInGraph(graph, trimmedSearch, IN_GRAPH_RESULT_LIMIT),
    [graph, trimmedSearch],
  );

  const memberMatches = useMemo(() => {
    if (!isAllMembersReady || isMemberDataStale) return [];
    return results.filter((member) => !graph.peopleById[member.slug]);
  }, [graph, isAllMembersReady, isMemberDataStale, results]);

  const options = useMemo<VouchSearchOption[]>(
    () => [
      ...graphMatches.map((person) => ({
        kind: "graph" as const,
        key: `graph:${person.id}`,
        person,
      })),
      ...memberMatches.map((member) => ({
        kind: "member" as const,
        key: `member:${member.slug}`,
        member,
      })),
    ],
    [graphMatches, memberMatches],
  );

  return {
    graphMatches,
    memberMatches,
    options,
    hasTerm: trimmedSearch.length > 0,
    isAllMembersReady,
    isSearchingMembers,
    isSettled: !isDebouncing && !isSearchingMembers,
  };
}

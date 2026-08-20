import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  DEMO_TRUST_GRAPH_DATA,
  searchDemoTrustNetworkMembers,
} from "../adminVouchGraph.data";
import type { TrustGraphData } from "../trustGraph/trustGraphModel";
import {
  getAdminTrustNetwork,
  searchTrustNetworkMembers,
  type TrustNetworkMemberSearchResultDTO,
} from "./adminTrustNetwork.api";
import { trustNetworkDtoToData } from "./adminTrustNetwork.adapters";

/** Shortest term the member-finder fires on — a 1-char ILIKE would match
 *  almost everyone. Mirrors the admin media console's uploader search. */
const MIN_SEARCH_LENGTH = 2;

/**
 * The whole admin trust network. Demo mode returns the colocated fixture
 * graph (so the demo story stays intact and no live fetch fires); live mode
 * fetches `/admin/trust-network` and adapts it.
 *
 * `focus`, when set, pins that member's slug into the returned node set even
 * when their join date falls outside the graph's node cap — so opening the
 * modal for an older member (from `AdminMemberDrawer`, or after picking a
 * member-finder result) never renders "not found" (ADM-10). Demo mode
 * ignores it: the fixture graph is small and already includes everyone.
 */
export function useTrustNetwork(focus?: string) {
  const { demoMode } = useDemoMode();
  return useQuery<TrustGraphData>({
    queryKey: ["admin-trust-network", demoMode, focus ?? null],
    initialData: demoMode ? DEMO_TRUST_GRAPH_DATA : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_TRUST_GRAPH_DATA;
      return trustNetworkDtoToData(await getAdminTrustNetwork(focus));
    },
  });
}

/**
 * Typeahead behind the graph modal's "find a member" search box (ADM-10) —
 * lets an admin locate a member outside the MAX_NODES join-date window
 * instead of only ever seeing the newest ones. Disabled until the term
 * reaches `MIN_SEARCH_LENGTH`; `placeholderData` keeps the last results on
 * screen while the next keystroke's request is in flight (mirrors
 * `useAdminMediaUploaders`).
 */
export function useTrustNetworkMemberSearch(term: string) {
  const { demoMode } = useDemoMode();
  const trimmed = term.trim();
  const query = useQuery<TrustNetworkMemberSearchResultDTO[]>({
    queryKey: ["admin-trust-network", "search", demoMode, trimmed],
    enabled: trimmed.length >= MIN_SEARCH_LENGTH,
    queryFn: async () => {
      if (demoMode) return searchDemoTrustNetworkMembers(trimmed);
      return searchTrustNetworkMembers(trimmed);
    },
    placeholderData: (previous) => previous,
  });
  return { ...query, results: query.data ?? [] };
}

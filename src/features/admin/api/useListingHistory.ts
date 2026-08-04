import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getDemoListingHistory } from "../adminListings.data";
import { getListingHistory, type ListingHistoryDTO } from "./adminListings.api";

/** Shared with `useAskListingQuestion`/`useSetListingStatus`/`useRemoveListing`,
 *  which invalidate this key (scoped to the affected `ref`) on a live-mode
 *  success, since asking a question / changing status / removing a listing
 *  all append to that listing's moderation history. */
export const LISTING_HISTORY_KEY = "listing-history";

/** The exact query key for one listing's history in one mode, matching what
 *  `useListingHistory` below queries with (`[LISTING_HISTORY_KEY, demoMode,
 *  ref]` — `demoMode` sits before `ref` in the key, so a mutation invalidating
 *  history must pass it too; there's no `[LISTING_HISTORY_KEY, ref]` prefix
 *  that would match both modes at once). Live-mode mutations call this with
 *  `demoMode: false`, since only a live success needs to invalidate. */
export function listingHistoryQueryKey(
  ref: string,
  demoMode: boolean,
): [string, boolean, string] {
  return [LISTING_HISTORY_KEY, demoMode, ref];
}

const EMPTY_HISTORY: ListingHistoryDTO = { events: [], questions: [] };

/**
 * The moderation-event timeline + Q&A thread for one listing, read by
 * `ListingHistoryPanel` inside the preview drawer. `ref` is optional purely
 * as a defensive guard (`enabled: Boolean(ref)`) — in practice the drawer
 * that mounts this hook only renders while a row is open, so `ref` is always
 * set by the time this fires. Demo mode reads the colocated fixture
 * (`getDemoListingHistory`, keyed by ref — a fixture-less ref answers an
 * honest empty history); live mode calls `GET /listings/admin/:ref/history`.
 */
export function useListingHistory(ref: string | undefined) {
  const { demoMode } = useDemoMode();
  const query = useQuery<ListingHistoryDTO>({
    queryKey: [LISTING_HISTORY_KEY, demoMode, ref],
    enabled: Boolean(ref),
    queryFn: async () => {
      if (!ref) return EMPTY_HISTORY;
      return demoMode ? getDemoListingHistory(ref) : getListingHistory(ref);
    },
  });

  return {
    history: query.data ?? EMPTY_HISTORY,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

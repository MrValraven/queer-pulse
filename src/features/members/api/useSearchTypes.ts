import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getSearchTypes } from "./searchTypes.api";
import type { LiveResultType } from "./search.api";

export interface SearchTypesResult {
  /**
   * The result types live search will actually return, or `null` while that
   * is unknown: demo mode (which searches a local corpus and needs no
   * answer), a logged-out or still-checking session, a request in flight, or
   * one that failed.
   */
  launchedTypes: readonly LiveResultType[] | null;
  /** True in live mode while the answer is still on its way. */
  isPending: boolean;
  /**
   * True when the live request failed. The caller must not fall back to the
   * full hardcoded taxonomy: that is exactly the state this hook exists to
   * end, a category offered that can only ever come back empty.
   */
  isError: boolean;
  /** Re-runs the failed request. Wire it to the error panel's retry. */
  refetch: () => void;
}

/** Stable no-op retry for the modes that never issue a request. */
const noRetry = () => {};

/**
 * Which result types `/search` can currently answer with.
 *
 * The backend gates each result type on its feature's launch flag, so a
 * closed surface (the Work and Economy board, say) is queried for nothing and
 * returns nothing. The search page renders one category tab per result type,
 * and a tab for a closed type can only ever show "no results" — which reads
 * to a member as "your query found nothing" when the truth is "this surface
 * is not open". This hook is how the page learns the difference, instead of
 * carrying a hand-written exclusion list beside the taxonomy it mirrors.
 *
 * The answer is a compile-time registry on the backend: it changes on deploy,
 * never per member and never mid-session, so it is fetched once and held.
 */
export function useSearchTypes(): SearchTypesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const isEnabled = !demoMode && !checking && loggedIn;

  const typesQuery = useQuery({
    queryKey: ["search-types"],
    enabled: isEnabled,
    queryFn: ({ signal }) => getSearchTypes(signal),
    // Deploy-scoped data: refetching it on every remount or window focus buys
    // nothing, and a stale answer cannot outlive the bundle that asked for it.
    staleTime: Infinity,
    // One retry, then surface it. The tab strip degrades to the categories
    // that stand on no feature flag, so a long retry ladder just leaves the
    // member waiting on chrome.
    retry: 1,
  });

  const { refetch: refetchTypes } = typesQuery;
  const refetch = useCallback(() => {
    void refetchTypes();
  }, [refetchTypes]);

  if (demoMode) {
    return {
      launchedTypes: null,
      isPending: false,
      isError: false,
      refetch: noRetry,
    };
  }

  return {
    launchedTypes: typesQuery.data?.types ?? null,
    // `checking` counts as pending: the request has not been allowed to start
    // yet, and reporting "settled, nothing launched" would blank the strip.
    isPending: checking || (isEnabled && typesQuery.isPending),
    isError: typesQuery.isError,
    refetch,
  };
}

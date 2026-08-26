import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getIssueCosts, type IssueCostsDto } from "./issueCosts.api";
import { DEMO_ISSUE_COSTS } from "../desk/issue/issueCosts.data";

/** Shared query key so the costs card and any future money surface agree on
 *  one cache entry per issue. */
export const ISSUE_COSTS_QUERY_KEY = "magazine-issue-costs";

/**
 * What an issue cost (CON-18): fees, expenses, paid and outstanding, per
 * currency, summed on the server. Staff-only, so it hangs off the admin
 * issue routes rather than the public archive.
 *
 * Demo mode serves `DEMO_ISSUE_COSTS` so the card renders with no backend,
 * the same way `useDeskIssues` serves `DEMO_ISSUES`.
 */
export function useIssueCosts(number: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<IssueCostsDto>({
    queryKey: [ISSUE_COSTS_QUERY_KEY, demoMode, number],
    queryFn: async () => {
      if (demoMode) return { ...DEMO_ISSUE_COSTS, number };
      return getIssueCosts(number);
    },
  });

  return {
    costs: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

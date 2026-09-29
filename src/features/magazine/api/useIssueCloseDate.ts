import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_ISSUE, DEMO_ISSUES } from "../data/desk.data";
import { getIssueClosesOn, updateIssueClosesOn } from "./pieces.api";
import { CURRENT_ISSUE_QUERY_KEY } from "./useCurrentIssue";
import { DESK_ISSUES_QUERY_KEY } from "./useDeskIssues";

/** Query key for one issue's close date (`[key, issueNumber, demoMode]`). */
export const ISSUE_CLOSE_DATE_QUERY_KEY = "magazine-issue-close-date";

/** The demo close date for `issueNumber`, read from the same fixtures the
 *  switcher and header read, so the three never disagree. */
function readDemoClosesOn(issueNumber: string): string | null {
  const demoIssue = DEMO_ISSUES.find((entry) => entry.number === issueNumber);
  return demoIssue?.closesOn ?? null;
}

export interface UseIssueCloseDateOptions {
  /** False for a caller that only ever saves and already gets `closesOn`
   *  from its own props (`IssueCloseDatePopover`, whose parent already read
   *  the issues list): skips the GET, which would otherwise cost one request
   *  per mount for an answer the desk already has. Defaults to true. */
  isQueryEnabled?: boolean;
}

/**
 * The day an issue stops taking copy, with its save. Live mode reads and
 * writes `GET|PATCH /magazine/admin/issues/:number/closes-on`; demo mode
 * patches `DEMO_ISSUES` (and `DEMO_ISSUE` for the current one) in place, the
 * way `useIssueMutations` saves a publish date, so the desk header's
 * countdown moves in both modes.
 *
 * A save invalidates the current-issue summary and the switcher list, since
 * both carry `closesOn` and the header derives `closes`/`daysLeft` from it.
 * The caller owns any toast. `null` clears the date.
 */
export function useIssueCloseDate(
  issueNumber: string,
  options: UseIssueCloseDateOptions = {},
) {
  const { isQueryEnabled = true } = options;
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const query = useQuery<string | null>({
    queryKey: [ISSUE_CLOSE_DATE_QUERY_KEY, issueNumber, demoMode],
    enabled: issueNumber !== "" && isQueryEnabled,
    queryFn: async () => {
      if (demoMode) return readDemoClosesOn(issueNumber);
      const response = await getIssueClosesOn(issueNumber);
      return response.closesOn;
    },
  });

  const save = useMutation<void, Error, string | null>({
    // Both callers toast their own failure, so the app-wide handler stays
    // quiet here and a failed save shows one toast.
    meta: { silentError: true },
    mutationFn: async (closesOn) => {
      if (demoMode) {
        // A fresh row object: the query cache keeps the previous array's rows
        // when they compare equal, and a row mutated in place compares equal
        // to itself, so a field write would leave the header unchanged.
        const demoIndex = DEMO_ISSUES.findIndex(
          (entry) => entry.number === issueNumber,
        );
        const demoIssue = DEMO_ISSUES[demoIndex];
        if (demoIssue) DEMO_ISSUES[demoIndex] = { ...demoIssue, closesOn };
        if (DEMO_ISSUE.number === issueNumber) DEMO_ISSUE.closesOn = closesOn;
        return;
      }
      await updateIssueClosesOn(issueNumber, closesOn);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ISSUE_CLOSE_DATE_QUERY_KEY, issueNumber],
      });
      void queryClient.invalidateQueries({
        queryKey: [CURRENT_ISSUE_QUERY_KEY],
      });
      void queryClient.invalidateQueries({ queryKey: [DESK_ISSUES_QUERY_KEY] });
    },
  });

  return {
    closesOn: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    saveClosesOn: save.mutateAsync,
    isSaving: save.isPending,
  };
}

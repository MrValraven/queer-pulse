import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { getCurrentIssue } from "./pieces.api";
import {
  currentIssueDtoToView,
  DESK_CALENDAR_DAY_FORMAT,
  issueCalendarToView,
} from "./pieces.adapters";
import { DEMO_ISSUE, type Issue } from "../data/desk.data";

/** Query key for the current-issue summary; the close-date hook invalidates it. */
export const CURRENT_ISSUE_QUERY_KEY = "magazine-current-issue";

/**
 * The desk header's current issue (number/theme/slot progress and its
 * editorial calendar). Demo mode uses the static `DEMO_ISSUE`; live mode calls
 * `GET /magazine/admin/issues/current`, which returns `null` before any issue
 * exists yet. Callers that get `null` back should keep rendering the
 * honest-blank header (no issue yet, no Produce button).
 *
 * The backend models the close day (`closesOn`) beside the publish day, so
 * `closes`, `publishes` and `daysLeft` are derived from those ISO days in both
 * modes. An issue with no close date set gets a blank `closes` and a
 * `daysLeft` of 0, and the header hides the countdown. The strings are built
 * at render time from the active language, outside the query cache.
 */
export function useCurrentIssue() {
  const { demoMode } = useDemoMode();
  const formatters = useFormat();
  const query = useQuery<Issue | null>({
    queryKey: [CURRENT_ISSUE_QUERY_KEY, demoMode],
    queryFn: async () => {
      // A copy, so a demo close-date save (which edits `DEMO_ISSUE`) reads
      // as new data to the query cache.
      if (demoMode) return { ...DEMO_ISSUE };

      const currentIssueDto = await getCurrentIssue();
      if (!currentIssueDto) return null;
      return currentIssueDtoToView(currentIssueDto);
    },
  });

  const rawIssue = query.data ?? null;
  const issue = useMemo<Issue | null>(() => {
    if (!rawIssue) return null;
    return {
      ...rawIssue,
      ...issueCalendarToView(
        {
          closesOn: rawIssue.closesOn ?? null,
          publishedOn: rawIssue.publishedOn ?? null,
        },
        (day) => formatters.date(day, DESK_CALENDAR_DAY_FORMAT),
        new Date(),
      ),
    };
  }, [rawIssue, formatters]);

  return {
    issue,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

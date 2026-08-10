import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCurrentIssue } from "./pieces.api";
import { DEMO_ISSUE, type Issue } from "../data/desk.data";

/**
 * The desk header's current issue (number/theme/slot progress). Demo mode
 * uses the static `DEMO_ISSUE`; live mode calls
 * `GET /magazine/admin/issues/current`, which returns `null` before any
 * issue exists yet. The backend doesn't model an editorial calendar, so
 * `closes`/`publishes`/`daysLeft` are blanked out on the live mapping
 * (`''`/`0`) rather than fabricated — same honest-header treatment as the
 * Phase 1 desk header. Callers that get `null` back should keep rendering
 * the honest-blank header (no issue yet, no Produce button).
 */
export function useCurrentIssue() {
  const { demoMode } = useDemoMode();
  const query = useQuery<Issue | null>({
    queryKey: ["magazine-current-issue", demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_ISSUE;

      const currentIssueDto = await getCurrentIssue();
      if (!currentIssueDto) return null;

      return {
        number: currentIssueDto.number,
        theme: currentIssueDto.theme,
        closes: "",
        publishes: "",
        daysLeft: 0,
        filled: currentIssueDto.filled,
        slots: currentIssueDto.slots,
      };
    },
  });

  return { issue: query.data ?? null, isLoading: query.isLoading, isError: query.isError };
}

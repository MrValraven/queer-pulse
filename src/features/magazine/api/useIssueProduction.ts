import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getIssueProduction,
  type IssueProductionDto,
} from "./issueProduction.api";
import { DEMO_ISSUE_PRODUCTION } from "../data/issueProduction.data";

/**
 * The issue-production detail — running order/cover/coverlines/digest/ship
 * checklist — behind `/magazine/editor/issue/:number`. Demo mode always
 * returns the single `DEMO_ISSUE_PRODUCTION` fixture (issue "14") regardless
 * of `number`, mirroring `usePieceRecord`'s one-record limitation. Live mode
 * calls `GET /magazine/admin/issues/:number`, which already returns the full
 * shape.
 *
 * The query key includes `number` (so navigating between issues in live
 * mode refetches) and `demoMode`, and is prefixed `["magazine-issue-
 * production", number]` so `useIssueMutations`' invalidation busts this
 * cache.
 */
export function useIssueProduction(number: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<IssueProductionDto>({
    queryKey: ["magazine-issue-production", number, demoMode],
    queryFn: async () => {
      if (demoMode) return DEMO_ISSUE_PRODUCTION;
      return getIssueProduction(number);
    },
  });

  return {
    issue: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

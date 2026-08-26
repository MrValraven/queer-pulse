import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { IssueDTO } from "./magazine.api";
import {
  getMagazineFront,
  getPublishedCurrentIssue,
  type MagazineFrontDto,
} from "./magazineFront.api";

/**
 * The magazine front in the desk's own running order (CON-13).
 *
 * The live front used to be `articles.slice(0, 9)` in `published_at DESC`.
 * The editorial arrangement existed all along in `magazine_issue.run_order`
 * and nothing read it, so a desk that can commission, edit, gate and ship an
 * issue published to a reverse-chronological blog roll.
 *
 * Demo mode never calls this: `MagazineSections` renders its own curated mock
 * front there, the same split `useMagazineHome`/`useIssues` already use.
 */
export function useMagazineFront() {
  const { demoMode } = useDemoMode();
  const query = useQuery<MagazineFrontDto>({
    queryKey: ["magazine-front"],
    enabled: !demoMode,
    queryFn: getMagazineFront,
  });

  return {
    data: query.data,
    isLoading: !demoMode && query.isLoading,
    isError: query.isError,
  };
}

/**
 * The issue the masthead names, on every magazine page.
 *
 * Its own tiny query rather than a slice of `useMagazineFront`: the masthead
 * renders on eleven pages and needs a number and a date, while the front
 * payload carries the whole run order. Both read the SAME backend definition
 * of "current" (`MagazineFrontService.findCurrentIssue`), so the label can
 * never name a different issue from the one arranged on screen below it.
 */
export function useCurrentIssueLabel() {
  const { demoMode } = useDemoMode();
  const query = useQuery<IssueDTO | null>({
    queryKey: ["magazine-current-issue-label"],
    enabled: !demoMode,
    queryFn: getPublishedCurrentIssue,
  });

  return query.data ?? null;
}

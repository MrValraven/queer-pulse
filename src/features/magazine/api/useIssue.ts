import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { formatDayMonthYear, issueTitleNode } from "./magazine.adapters";
import { getIssue, type IssueDTO } from "./magazine.api";

export interface IssueCoverData {
  number: string;
  title: ReactNode;
  dek: string;
  publishedLabel: string;
}

/**
 * `IssuePage.tsx` always renders the current issue (the prototype's route has
 * no `:number` param yet — it's a single always-on-issue-09 page). Demo mode
 * keeps `IssueCover`'s hardcoded copy; live mode fetches that same issue by
 * number and overlays its live title/dek/publish date onto the same layout.
 */
export function useIssue(number: string) {
  const { demoMode } = useDemoMode();
  return useQuery<IssueCoverData | null>({
    queryKey: ["magazine-issue", demoMode, number],
    queryFn: async () => {
      if (demoMode) return null;
      const dto: IssueDTO = await getIssue(number);
      return {
        number: dto.number,
        title: issueTitleNode(dto.title),
        dek: dto.dek,
        publishedLabel: formatDayMonthYear(dto.publishedOn),
      };
    },
  });
}

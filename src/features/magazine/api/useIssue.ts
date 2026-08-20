import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDayMonthYear, issueTitleNode } from "./magazine.adapters";
import { getIssue, getIssues, type IssueDTO } from "./magazine.api";

export interface IssueCoverData {
  number: string;
  title: ReactNode;
  dek: string;
  publishedLabel: string;
}

/**
 * `IssuePage.tsx` renders the issue named by its `:number` route param
 * (CNT-8 fix — every issue link used to point at the same bare route, so no
 * past issue was reachable). With no `number` (the bare `/magazine/issue`
 * route, e.g. the masthead's "Current issue" link), it falls back to the
 * newest issue from `GET /magazine/issues` (already returned newest-first).
 * Demo mode keeps `IssueCover`'s hardcoded copy regardless.
 *
 * i18n: `language` joins the query key because `publishedLabel` is
 * locale-formatted via `fmt` — switching language must re-derive it.
 */
export function useIssue(number: string | undefined) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();
  return useQuery<IssueCoverData | null>({
    queryKey: ["magazine-issue", demoMode, language, number ?? "current"],
    queryFn: async () => {
      if (demoMode) return null;
      let dto: IssueDTO;
      if (number) {
        dto = await getIssue(number);
      } else {
        const issues = await getIssues();
        if (issues.length === 0) return null;
        dto = issues[0]!;
      }
      return {
        number: dto.number,
        title: issueTitleNode(dto.title),
        dek: dto.dek,
        publishedLabel: formatDayMonthYear(dto.publishedOn, fmt),
      };
    },
  });
}

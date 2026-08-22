import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { issueToTile, type IssueTile } from "./magazine.adapters";
import { getIssues } from "./magazine.api";

/**
 * The magazine archive grid/list (`IssuesPage.tsx`'s `ISSUES` array). Demo
 * mode keeps the page's own mock untouched; live mode calls GET
 * /magazine/issues (already newest-first) and adapts each row into the same
 * tile shape the grid/list renders.
 *
 * i18n: `language` joins the query key because `issueToTile` locale-formats
 * the "Published …" date via `fmt` — switching language must re-derive it.
 */
export function useIssues() {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { t, language } = useTranslation();
  return useQuery<IssueTile[] | null>({
    queryKey: ["magazine-issues", demoMode, language],
    queryFn: async () => {
      if (demoMode) return null; // caller falls back to its own ISSUES mock
      const rows = await getIssues();
      return rows.map((dto, index) => issueToTile(dto, index, rows.length, fmt, t));
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { issueToTile, type IssueTile } from "./magazine.adapters";
import { getIssues } from "./magazine.api";

/**
 * The magazine archive grid/list (`IssuesPage.tsx`'s `ISSUES` array). Demo
 * mode keeps the page's own mock untouched; live mode calls GET
 * /magazine/issues (already newest-first) and adapts each row into the same
 * tile shape the grid/list renders.
 */
export function useIssues() {
  const { demoMode } = useDemoMode();
  return useQuery<IssueTile[] | null>({
    queryKey: ["magazine-issues", demoMode],
    queryFn: async () => {
      if (demoMode) return null; // caller falls back to its own ISSUES mock
      const rows = await getIssues();
      return rows.map((dto, i) => issueToTile(dto, i, rows.length));
    },
  });
}

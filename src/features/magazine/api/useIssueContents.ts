import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getIssueContents, type IssueContentsDto } from "./issueContents.api";

/**
 * The curated "In this issue" panel for `/magazine/issue/:number` (CON-05).
 *
 * Enabled only in live mode with a real issue number: demo mode renders the
 * fabricated issue-09 contents from `issue.data`, and the bare
 * `/magazine/issue` route resolves its number through `useIssue` first, so
 * there is nothing to ask for until that lands.
 */
export function useIssueContents(number: string | undefined) {
  const { demoMode } = useDemoMode();
  const isEnabled = !demoMode && Boolean(number);
  const query = useQuery<IssueContentsDto | null>({
    queryKey: ["magazine-issue-contents", number],
    queryFn: () => getIssueContents(number!),
    enabled: isEnabled,
  });
  return {
    contents: query.data ?? null,
    isLoading: isEnabled && query.isLoading,
    isError: query.isError,
  };
}

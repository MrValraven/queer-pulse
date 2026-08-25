import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createIssue as sendCreateIssue,
  getIssues as getDeskIssues,
  type CreateIssueDto,
  type IssueSummaryDto,
} from "./issueProduction.api";
import { DEMO_ISSUES } from "../data/desk.data";

/** Shared query key so the switcher list and every mutation that changes it
 *  agree on one cache entry. */
export const DESK_ISSUES_QUERY_KEY = "magazine-desk-issues";

/**
 * Every issue, newest number first, for the desk's issue switcher and the
 * new-issue modal. Distinct from `useIssues()`, which drives the PUBLIC
 * archive off `GET /magazine/issues` and adapts rows into display tiles —
 * that response omits `id`, and `id` is precisely what assignment writes
 * onto a piece.
 *
 * Demo mode serves `DEMO_ISSUES` so the switcher, the create flow, and
 * assignment all work with no backend.
 */
export function useDeskIssues() {
  const { demoMode } = useDemoMode();
  const query = useQuery<IssueSummaryDto[]>({
    queryKey: [DESK_ISSUES_QUERY_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return [...DEMO_ISSUES];
      return getDeskIssues();
    },
  });

  return {
    issues: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Suggests the number a new issue should take: one past the highest existing
 * display number, zero-padded to the two-digit form every stored number and
 * every `/magazine/editor/issue/:number` route already uses. Falls back to
 * "01" for a magazine with no issues yet.
 *
 * Numbers are varchar and may be non-numeric in principle, so anything that
 * does not parse is skipped rather than poisoning the max with `NaN`.
 */
export function suggestNextIssueNumber(issues: IssueSummaryDto[]): string {
  const highest = issues.reduce((currentHighest, issue) => {
    const parsed = Number.parseInt(issue.number, 10);
    return Number.isNaN(parsed)
      ? currentHighest
      : Math.max(currentHighest, parsed);
  }, 0);
  return String(highest + 1).padStart(2, "0");
}

/**
 * POST /magazine/admin/issues. Silent by contract (`meta.silentError`): the
 * modal owns both toasts so it can name the created issue and surface a 409
 * ("that number already exists") as a field-level message rather than a
 * generic failure banner.
 *
 * Demo mode pushes onto `DEMO_ISSUES` so the new issue really does show up in
 * the switcher and can be assigned to, matching how `usePieceMutations`
 * patches `DEMO_PIECES` in place.
 */
export function useCreateIssue() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<IssueSummaryDto, Error, CreateIssueDto>({
    meta: { silentError: true },
    mutationFn: async (body) => {
      const number = body.number.trim().padStart(2, "0");
      if (demoMode) {
        const created: IssueSummaryDto = {
          id: `demo-issue-${number}`,
          number,
          title: body.title,
          theme: body.theme,
          publishedOn: body.publishedOn ?? null,
          filled: 0,
          slots: DEMO_ISSUES[0]?.slots ?? 0,
        };
        DEMO_ISSUES.unshift(created);
        return created;
      }
      return sendCreateIssue({ ...body, number });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [DESK_ISSUES_QUERY_KEY] });
      void queryClient.invalidateQueries({
        queryKey: ["magazine-current-issue"],
      });
      // The public archive lists issues too — a newly created issue belongs
      // there as soon as it exists, not only once it ships.
      void queryClient.invalidateQueries({ queryKey: ["magazine-issues"] });
    },
  });
}

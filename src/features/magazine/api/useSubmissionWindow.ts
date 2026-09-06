import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { apiGet, apiGetNullable, apiPatch } from "../../../shared/api/client";
import { demoOpenIssue } from "../submitStory.data";

/**
 * The submission window: which issue the desk is taking pitches for, and when
 * it closes (PRD-106).
 *
 * Before this, `submitStory.data.ts` held a hardcoded
 * `{ number: 26, openDate: July 2026, deadlineDate: 15 August 2026 }`, and the
 * public submit-story form printed it as fact. Nothing on the backend said
 * which issue was open, so the date could only go stale: by September 2026
 * every writer opening the form read a deadline three weeks in the past on an
 * issue number the desk had never created.
 *
 * Both sides of the same field live here:
 *  - `useOpenIssue` is the PUBLIC read (`GET /magazine/issues/open`), which
 *    answers `null` when the desk has nothing open;
 *  - `useIssueSubmissionDeadline` / `useSaveSubmissionDeadline` are the DESK
 *    read and write behind `magazine_editor`, which is how a real date gets
 *    into the column in the first place.
 */

/** `GET /magazine/issues/open`, or `null` when no issue is open. */
export interface OpenIssueDto {
  /** Display number, e.g. "26". A string, the way every issue route uses it. */
  number: string;
  title: string;
  /** `YYYY-MM-DD`, or null while the issue is still unscheduled. */
  publishedOn: string | null;
  /** `YYYY-MM-DD`, or null when the desk has set no deadline. */
  submissionDeadline: string | null;
}

export const OPEN_ISSUE_QUERY_KEY = "magazine-open-issue";
export const SUBMISSION_DEADLINE_QUERY_KEY = "magazine-submission-deadline";

/**
 * The issue currently open for submissions, for the public submit-story form.
 *
 * `null` is a real answer, never an error: the desk genuinely may have nothing
 * open, and the form has to say something true rather than name an issue.
 * Consumed through `apiGetNullable` because Nest returns a bare `null` body,
 * which react-query refuses as `undefined`.
 */
export function useOpenIssue() {
  const { demoMode } = useDemoMode();
  const query = useQuery<OpenIssueDto | null>({
    queryKey: [OPEN_ISSUE_QUERY_KEY, demoMode],
    queryFn: async () => {
      if (demoMode) return demoOpenIssue();
      return apiGetNullable<OpenIssueDto>("/magazine/issues/open");
    },
  });
  return {
    openIssue: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * Demo store for the desk's deadline field, mirroring how `useIssueMutations`
 * patches `DEMO_ISSUE_PRODUCTION` in place: demo mode never touches the
 * network, but the editor still has to see the value they just typed survive
 * the refetch that follows a save.
 */
const demoSubmissionDeadlineByIssueNumber = new Map<string, string | null>();

/** `GET /magazine/admin/issues/:number/submission-deadline` (desk). */
export function useIssueSubmissionDeadline(issueNumber: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery<{ submissionDeadline: string | null }>({
    queryKey: [SUBMISSION_DEADLINE_QUERY_KEY, issueNumber, demoMode],
    queryFn: async () => {
      if (demoMode) {
        return {
          submissionDeadline:
            demoSubmissionDeadlineByIssueNumber.get(issueNumber) ?? null,
        };
      }
      return apiGet<{ submissionDeadline: string | null }>(
        `/magazine/admin/issues/${encodeURIComponent(issueNumber)}/submission-deadline`,
      );
    },
  });
  return {
    submissionDeadline: query.data?.submissionDeadline ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/**
 * `PATCH /magazine/admin/issues/:number/submission-deadline` (desk). `null`
 * clears the deadline, which is how an editor takes the line back off the
 * public form, so the argument is required-but-nullable rather than optional.
 *
 * Invalidates the public open-issue read alongside the desk one: the issue the
 * editor just dated is usually the very issue the submit-story form is naming.
 */
export function useSaveSubmissionDeadline(issueNumber: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  return useMutation<void, Error, string | null>({
    mutationFn: async (submissionDeadline) => {
      if (demoMode) {
        demoSubmissionDeadlineByIssueNumber.set(
          issueNumber,
          submissionDeadline,
        );
        return;
      }
      await apiPatch<{ submissionDeadline: string | null }>(
        `/magazine/admin/issues/${encodeURIComponent(issueNumber)}/submission-deadline`,
        { submissionDeadline },
      );
    },
    onSuccess: () => {
      // Confirms in BOTH modes. The toast used to fire only on the demo
      // branch, which meant a live editor dated an issue and got no
      // acknowledgement at all, and the demo string bypassed i18n.
      showToast(t("magazine:issue.submissionDeadline.savedToast"), "success");
      void queryClient.invalidateQueries({
        queryKey: [SUBMISSION_DEADLINE_QUERY_KEY, issueNumber],
      });
      void queryClient.invalidateQueries({ queryKey: [OPEN_ISSUE_QUERY_KEY] });
    },
  });
}

import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiPost } from "../../../shared/api/client";
import type { ReasonCode } from "../../safety/reportReasons";

export interface ReportQuestionInput {
  /** The question's own uuid (`ListingPublicQuestion.id`), sent as the
   *  report's `subjectId`. */
  questionId: string;
  reasonCode: ReasonCode;
}

/**
 * "Report this question", filed through the same shared report and moderation
 * pipeline every other surface uses (`POST /reports`), targeting the
 * question's uuid with `subjectType: "listing_public_question"`.
 *
 * Posts directly via `apiPost` rather than through `safety/api/useCreateReport`
 * for the same reason `useReportReview` does: that wrapper's
 * `ReportSubjectType` union lives in `src/features/safety` (out of this
 * folder's scope) and does not list this subject yet, while the backend accepts
 * it end to end. The offered reasons are shared with the review report, since a
 * question is abusive in exactly the same ways a review is. Demo mode never
 * touches the network, mirroring `useReportReview`.
 */
export function useReportQuestion() {
  const { demoMode } = useDemoMode();

  return useMutation<void, Error, ReportQuestionInput>({
    // The report modal renders its own error state, so silence the duplicate.
    meta: { silentError: true },
    mutationFn: async ({ questionId, reasonCode }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      await apiPost("/reports", {
        subjectType: "listing_public_question",
        subjectId: questionId,
        reasonCode,
      });
    },
  });
}

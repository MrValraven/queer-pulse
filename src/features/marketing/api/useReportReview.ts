import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiPost } from "../../../shared/api/client";
import type { ReasonCode } from "../../safety/reportReasons";

/**
 * The reasons offered for reporting a single review (gap-audit HSG-6) — no
 * new codes, mirrors the backend's `SUBJECT_REASONS[ReportSubjectType.Review]`
 * exactly (`reason-catalogue.ts`): `harassment` an abusive review,
 * `hate_speech` a slur, `discrimination` a discriminatory one, `housing_scam`
 * ("Scam or fake listing") a fake/planted review, `spam` self-promotion
 * abuse, `other` (free-text) anything else. Kept local rather than added to
 * `src/features/safety/reportReasons.ts`'s `SUBJECT_REASONS` map (out of this
 * folder's scope) — the backend already accepts `subjectType: "review"`
 * end-to-end (`AddReviewReportSubject`), this is just the frontend's matching
 * offered-reasons list for it.
 */
export const REVIEW_REPORT_REASONS: ReasonCode[] = [
  "harassment",
  "hate_speech",
  "discrimination",
  "housing_scam",
  "spam",
  "other",
];

export interface ReportReviewInput {
  /** The review's own uuid (`Review.id`) — the report's `subjectId`. */
  reviewId: string;
  reasonCode: ReasonCode;
}

/**
 * "Report this review" (gap-audit HSG-6, `PLATFORM-PRODUCT-GAP-AUDIT-2026-08-20.md`
 * §6): before this, a member could only dispute/report the WHOLE listing
 * (`useDisputeListing`) — there was no way to flag a single abusive or fake
 * review. Files through the same shared report+moderation pipeline every
 * other surface uses (`POST /reports`), targeting the review's uuid as
 * `subjectId` with `subjectType: "review"`.
 *
 * Posts directly via `apiPost` rather than through
 * `safety/api/useCreateReport`'s typed `CreateReportInput` wrapper: that
 * type's `ReportSubjectType` union (owned by `src/features/safety`, out of
 * this folder's scope) doesn't include `"review"` yet, even though the
 * backend's own `ReportSubjectType` enum and reason catalogue already support
 * it end-to-end (`AddReviewReportSubject`). Demo mode never touches the
 * network, mirroring `useDisputeListing`/`useSuggestEdit`'s identical
 * resolve-after-a-beat shape — there's no local review-report inbox to patch.
 */
export function useReportReview() {
  const { demoMode } = useDemoMode();

  return useMutation<void, Error, ReportReviewInput>({
    // DirectoryReportModal renders its own error state, so silence the
    // global duplicate toast, mirroring useDisputeListing/useSuggestEdit.
    meta: { silentError: true },
    mutationFn: async ({ reviewId, reasonCode }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }
      await apiPost("/reports", {
        subjectType: "review",
        subjectId: reviewId,
        reasonCode,
      });
    },
  });
}

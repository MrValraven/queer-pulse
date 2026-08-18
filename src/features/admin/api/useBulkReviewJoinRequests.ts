import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  bulkReviewJoinRequests,
  type BulkReviewResult,
} from "../../auth/api/joinRequest.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

interface BulkReviewJoinRequestsVars {
  ids: string[];
  status: "approved" | "declined" | "waitlisted";
  declineReason?: string;
}

/**
 * Bulk approve/waitlist/decline for the join-request queue (Task 6) — built
 * on `useDemoAwareMutation`, matching the real established pattern
 * (`useBulkDecideVerificationRequests`, the verification-requests queue's own
 * bulk hook) rather than a bare `useMutation`.
 *
 * Unlike that sibling hook, there is no query-cache row to patch for the demo
 * optimistic update: `useJoinRequests`'s demo path re-derives its list from
 * the plain imported `JOIN_REQUESTS` array on every queryFn call rather than
 * reading the query cache, the same reason the single-row
 * `useReviewJoinRequest` leaves it to `AdminVerifyQueue`'s own local state to
 * drop a reviewed row from view instead of a cache patch. So demo mode here
 * simply reports every id as succeeded; `AdminVerifyQueue` does the same
 * local-state bookkeeping for a bulk decision that it already does for a
 * single one.
 */
export function useBulkReviewJoinRequests() {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useDemoAwareMutation<
    BulkReviewResult,
    Error,
    BulkReviewJoinRequestsVars
  >({
    demoMode,
    logLabel: "admin.joinRequest.bulkReview",
    logContext: ({ ids, status }) => ({ ids, status }),
    demoResult: ({ ids }) => ({ succeeded: ids, failed: [] }),
    live: ({ ids, status, declineReason }) =>
      bulkReviewJoinRequests(ids, status, declineReason),
    // Invalidates in BOTH modes, same reasoning as the single-row hook: the
    // demo queue's queryFn re-derives from the mock registry on every
    // refetch, so there's nothing this invalidation loses by also running in
    // demo mode.
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      if (result.failed.length > 0) {
        showToast(
          t("admin:members.verify.bulk.partialFailure", {
            count: result.failed.length,
          }),
          "warning",
        );
      }
    },
    meta: { silentError: true },
  });

  return {
    bulkReview: (
      ids: string[],
      status: "approved" | "declined" | "waitlisted",
      declineReason?: string,
    ) => mutation.mutateAsync({ ids, status, declineReason }),
    pending: mutation.isPending,
  };
}

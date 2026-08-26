import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
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
 * Bulk approve/waitlist/decline for the join-request queue, built on
 * `useDemoAwareMutation`, matching the established pattern
 * (`useBulkDecideVerificationRequests`, the verification queue's own bulk hook)
 * rather than a bare `useMutation`.
 *
 * THE RESULT IS PER-ITEM, and this hook hands it back untouched. It reports
 * nothing itself: `useJoinRequestBulkDecision` decides what to announce, because
 * only it knows whether the batch swept cleanly (a toast) or half-applied (the
 * result panel, naming each applicant the server refused and why). A toast here
 * would double up on that announcement in a screen reader.
 *
 * Unlike the verification sibling there is no query-cache row to patch for a
 * demo optimistic update: `useJoinRequests`'s demo path re-derives its list from
 * the plain imported `JOIN_REQUESTS` array on every queryFn call rather than
 * reading the query cache, the same reason the single-row `useReviewJoinRequest`
 * leaves it to the queue's own local state to drop a reviewed row from view. So
 * demo mode reports every id as succeeded and `useJoinRequestQueueDecisions`
 * does the same bookkeeping for a bulk decision it already does for a single one.
 */
export function useBulkReviewJoinRequests() {
  const { demoMode } = useDemoMode();
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
    // demo queue's queryFn re-derives from the mock registry on every refetch,
    // so there is nothing this invalidation loses by also running in demo mode.
    //
    // Two keys, because a decision moves a request between them. The prefix
    // `["join-requests"]` is every status, filter and sort of the queue plus
    // the pending count the members page reads off it, exactly what the
    // single-decision mutation invalidates. `["join-requests-sample"]` is the
    // peer-review pool, which only holds decided requests: a bulk approve or
    // decline adds to it, so a stale sample would be missing the decisions most
    // worth looking at.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      void queryClient.invalidateQueries({
        queryKey: ["join-requests-sample"],
      });
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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { replyToCompanyReview } from "./companies.api";
import { economyKeys } from "./economyKeys";

/** Body for `PATCH /companies/:slug/reviews/:reviewId/reply`. */
export interface CompanyReviewReplyInput {
  reviewId: string;
  text: string;
}

/**
 * Post (or overwrite) the EMPLOYER's single public reply to one review of them
 * (PRD-47). Mirrors the directory's `useReplyToReview`.
 *
 * Live mode PATCHes the owner-gated endpoint and then invalidates the reviews
 * list, so the reply that renders comes back from the server rather than from a
 * guess made here: `isEditedAfterOwnerReply` and the reply timestamp are both
 * server-decided, and inventing them locally is how the two get out of step.
 *
 * Demo mode never reaches the network. It has no live review ids and no owned
 * company, so the compose affordance is hidden there entirely and this hook
 * resolves without doing anything.
 */
export function useCompanyReviewReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CompanyReviewReplyInput>({
    // The composer shows its own error, so silence the global duplicate toast.
    meta: { silentError: true },
    mutationFn: async ({ reviewId, text }) => {
      if (demoMode) return;
      await replyToCompanyReview(slug, reviewId, text);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: economyKeys.companyReviewsBySlug(slug),
      });
    },
  });
}

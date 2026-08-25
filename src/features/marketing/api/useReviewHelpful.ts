import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { DirectoryPlace } from "../directoryPlaces";
import {
  clearReviewHelpful,
  voteReviewHelpful,
  type ReviewHelpfulResponse,
} from "./directory.api";
import { DIRECTORY_KEY } from "./useDirectory";

export interface ReviewHelpfulVariables {
  reviewId: string;
  /** The state the member is moving TO: `true` casts the vote, `false` takes
   *  it back. Both endpoints are idempotent, so a repeat of either is safe. */
  isVoting: boolean;
  /** The count currently on screen, used only to synthesise a demo-mode
   *  answer. Live mode always takes the server's number instead. */
  currentHelpful: number;
}

/**
 * Cast or withdraw a "this was helpful" vote on a review.
 *
 * `hasVoted` is deliberately absent from every public read: those responses
 * are CDN-cached, so carrying a member's own vote state in them would serve
 * one member's vote to the next reader. A member therefore only ever learns
 * their vote state from their OWN mutation response, which is what this hook
 * returns. `DirectoryReviewHelpful` builds on that: it starts un-voted, moves
 * optimistically, and then takes whatever the response says as the truth.
 *
 * The count is patched into the cached detail rather than invalidated: a
 * refetch would replace the row with the CDN's (possibly stale) number and
 * cannot restore the vote state anyway, so patching is both cheaper and more
 * accurate here. Demo mode never hits the network and answers locally.
 */
export function useReviewHelpful(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<ReviewHelpfulResponse, Error, ReviewHelpfulVariables>({
    // The control reverts itself and toasts on failure, so silence the
    // global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ reviewId, isVoting, currentHelpful }) => {
      if (demoMode) {
        return {
          reviewId,
          helpful: Math.max(0, currentHelpful + (isVoting ? 1 : -1)),
          hasVoted: isVoting,
        };
      }
      return isVoting
        ? voteReviewHelpful(slug, reviewId)
        : clearReviewHelpful(slug, reviewId);
    },
    onSuccess: (response) => {
      queryClient.setQueriesData<DirectoryPlace | undefined>(
        { queryKey: [DIRECTORY_KEY, "detail", slug] },
        (place) =>
          place
            ? {
                ...place,
                reviews: place.reviews.map((review) =>
                  review.id === response.reviewId
                    ? { ...review, helpful: response.helpful }
                    : review,
                ),
              }
            : place,
      );
    },
  });
}

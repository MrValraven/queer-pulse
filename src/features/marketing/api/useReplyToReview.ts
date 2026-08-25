import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { DirectoryPlace } from "../directoryPlaces";
import { apiPatch } from "../../../shared/api/client";
import { DIRECTORY_KEY } from "./useDirectory";

/** Body for `PATCH /listings/:ref/reviews/:reviewId/reply`. */
export interface ReplyToReviewInput {
  reviewId: string;
  text: string;
}

/**
 * Post (or overwrite) the listing owner's single public reply to a review.
 *
 * Live mode PATCHes the owner-gated endpoint — addressed by the listing's
 * `ref` (not its `slug`; those are different identifiers, see
 * `DirectorySpacePage`'s `owned.ref`) — and invalidates the detail query so
 * the refreshed reply comes straight from the server. Demo mode never hits
 * the network: it patches the matching review's `ownerReply` directly into
 * the cached detail (keyed by `slug`, the detail page's own read key),
 * mirroring `useSubmitReview`'s cache-patch approach.
 */
export function useReplyToReview(ref: string, slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReplyToReviewInput>({
    // The composer toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ reviewId, text }) => {
      if (demoMode) return;
      await apiPatch(`/listings/${ref}/reviews/${reviewId}/reply`, { text });
    },
    onSuccess: (_data, { reviewId, text }) => {
      if (demoMode) {
        const at = new Date().toISOString();
        queryClient.setQueriesData<DirectoryPlace | undefined>(
          { queryKey: [DIRECTORY_KEY, "detail", slug] },
          (place) => {
            if (!place) return place;
            return {
              ...place,
              reviews: place.reviews.map((review) =>
                review.id === reviewId
                  ? { ...review, ownerReply: { text, at } }
                  : review,
              ),
            };
          },
        );
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: [DIRECTORY_KEY, "detail", slug],
      });
    },
  });
}

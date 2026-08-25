import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { DirectoryPlace, Review } from "../directoryPlaces";
import { editReview, type EditReviewInput } from "./directory.api";
import { DIRECTORY_KEY } from "./useDirectory";

/** Mean of a review set to one decimal, as the detail page displays it. */
function recomputeRating(reviews: Review[]): { score: string; count: number } {
  if (reviews.length === 0) return { score: "0", count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.stars, 0);
  return { score: (total / reviews.length).toFixed(1), count: reviews.length };
}

export interface EditReviewVariables extends EditReviewInput {
  reviewId: string;
}

/**
 * Rewrite your own review in place.
 *
 * The endpoint is author-gated and answers 403 for anybody else, so the UI
 * offers the affordance only on a review whose `authorSlug` matches the
 * signed-in member (see `DirectoryReviewCard`). The API is the enforcement;
 * this is the matching signifier.
 *
 * Live mode PATCHes and invalidates the listing's detail query, so the edited
 * text, the recomputed star rating and the server-owned
 * `editedAt`/`isEditedAfterOwnerReply` flags all come straight from the server
 * rather than being guessed client-side. Demo mode never hits the network: it
 * patches the matching review in the cached detail directly, mirroring
 * `useSubmitReview`.
 */
export function useEditReview(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<Review | null, Error, EditReviewVariables>({
    // The composer toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ reviewId, ...input }) => {
      if (demoMode) return null;
      return editReview(slug, reviewId, input);
    },
    onSuccess: (updated, variables) => {
      if (demoMode) {
        const editedAt = new Date().toISOString();
        queryClient.setQueriesData<DirectoryPlace | undefined>(
          { queryKey: [DIRECTORY_KEY, "detail", slug] },
          (place) => {
            if (!place) return place;
            const reviews = place.reviews.map((review) =>
              review.id === variables.reviewId
                ? {
                    ...review,
                    stars: variables.stars,
                    text: variables.text,
                    editedAt,
                  }
                : review,
            );
            return { ...place, reviews, rating: recomputeRating(reviews) };
          },
        );
        return;
      }
      // Patch the server's own answer straight in so the row settles without a
      // flash, then revalidate for the recomputed listing rating.
      if (updated) {
        queryClient.setQueriesData<DirectoryPlace | undefined>(
          { queryKey: [DIRECTORY_KEY, "detail", slug] },
          (place) =>
            place
              ? {
                  ...place,
                  reviews: place.reviews.map((review) =>
                    review.id === updated.id ? updated : review,
                  ),
                }
              : place,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: [DIRECTORY_KEY, "detail", slug],
      });
    },
  });
}

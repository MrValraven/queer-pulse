import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useProfileData } from "../../../app/providers/useProfile";
import type { DirectoryPlace, Review } from "../directoryPlaces";
import { submitReview, type SubmitReviewInput } from "./directory.api";
import { DIRECTORY_KEY } from "./useDirectory";

/** Mean of a review set to one decimal, as the detail page displays it. */
function recomputeRating(reviews: Review[]): { score: string; count: number } {
  if (reviews.length === 0) return { score: "0", count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.stars, 0);
  return { score: (total / reviews.length).toFixed(1), count: reviews.length };
}

/**
 * Leave a review on a directory listing.
 *
 * Live mode POSTs to the member-gated endpoint, patches the created review into
 * the cached detail so it lands on screen immediately, then invalidates that
 * query so the server has the last word. Demo mode never hits the network: it
 * builds the review from the signed-in mock profile and takes the same patch
 * path, mirroring how the rest of the app's demo writes stay self-contained.
 */
export function useSubmitReview(slug: string) {
  const { demoMode } = useDemoMode();
  const { profile } = useProfileData();
  const queryClient = useQueryClient();

  return useMutation<Review, Error, SubmitReviewInput>({
    // DirectoryReviewForm toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) {
        const demoReview: Review = {
          id: crypto.randomUUID(),
          initials: profile.initials ?? "",
          name: `${profile.first} ${profile.last}`.trim(),
          tint: "coral",
          byline: profile.pronouns ?? "",
          stars: input.stars,
          text: input.text,
          helpful: 0,
          createdAt: new Date().toISOString(),
          editedAt: null,
          isEditedAfterOwnerReply: false,
          // In demo mode `useUploadImage` hands back a local blob preview as
          // its "key", so the attached photo is already displayable as-is.
          photoUrl: input.photo || null,
        };
        return demoReview;
      }
      return submitReview(slug, input);
    },
    onSuccess: (review) => {
      // Patch the review into every cached detail entry for this slug (its key
      // also carries demoMode + language), newest first, so it is on screen the
      // moment the write succeeds rather than one network round trip later. In
      // live mode this is the server's own review object, in the same shape the
      // detail read returns (`reviews: dto.reviews` passes straight through),
      // so nothing here is a client-side guess. The rating is safe to recompute
      // because the detail derives its own aggregate from this same array (see
      // `getDirectoryBySlug`), so the two cannot disagree.
      queryClient.setQueriesData<DirectoryPlace | undefined>(
        { queryKey: [DIRECTORY_KEY, "detail", slug] },
        (place) => {
          if (!place) return place;
          const reviews = [review, ...place.reviews];
          return { ...place, reviews, rating: recomputeRating(reviews) };
        },
      );
      if (demoMode) return;
      // Then revalidate, so anything the server owns and this patch cannot know
      // (the author identity it resolved, moderation state) settles from the
      // real read.
      void queryClient.invalidateQueries({
        queryKey: [DIRECTORY_KEY, "detail", slug],
      });
    },
  });
}

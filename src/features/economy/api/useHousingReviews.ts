import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoListingReviews,
  demoViewingReviewPair,
} from "../housingViewings.data";
import { economyKeys } from "./economyKeys";
import {
  getListingReviews,
  getViewingReviewPair,
  submitHousingReview,
  type HousingListingReviewsDTO,
  type HousingReviewDTO,
  type HousingViewingReviewPairDTO,
  type SubmitReviewBody,
} from "./housingReviews.api";

/** A listing's public revealed reviews + average. Demo reads fixtures. */
export function useListingReviews(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<HousingListingReviewsDTO>({
    queryKey: economyKeys.listingReviews(demoMode, slug),
    enabled: Boolean(slug),
    initialData:
      demoMode && slug ? demoListingReviews(slug) : undefined,
    queryFn: async () => {
      if (!slug) return { averageRating: null, count: 0, reviews: [] };
      if (demoMode) return demoListingReviews(slug);
      return getListingReviews(slug);
    },
  });
}

/** The blind-review pair for a viewing (your review + the counterparty's, once
 * unlocked). Demo reads a fixture. */
export function useViewingReviewPair(viewingId: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<HousingViewingReviewPairDTO | null>({
    queryKey: economyKeys.viewingReviewPair(demoMode, viewingId),
    enabled: Boolean(viewingId),
    queryFn: async () => {
      if (!viewingId) return null;
      if (demoMode) return demoViewingReviewPair(viewingId);
      return getViewingReviewPair(viewingId);
    },
  });
}

/** Submit a blind review after a completed viewing. Demo fakes latency; live
 * posts and refreshes the pair. */
export function useSubmitHousingReview(viewingId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<HousingReviewDTO | null, Error, SubmitReviewBody>({
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return submitHousingReview(body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.viewingReviewPair(false, viewingId),
        });
      }
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoListingReviews,
  demoViewingReviewPair,
} from "../housingViewings.data";
import { economyKeys } from "./economyKeys";
import {
  getListingReviews,
  getViewingReviewPair,
  replyToHousingReview,
  submitHousingReview,
  updateHousingReview,
  type HousingListingReviewsDTO,
  type HousingReviewDTO,
  type HousingViewingReviewPairDTO,
  type ReplyToHousingReviewBody,
  type SubmitReviewBody,
  type UpdateHousingReviewBody,
} from "./housingReviews.api";

/** A listing's public revealed reviews + average. Demo reads fixtures. */
export function useListingReviews(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<HousingListingReviewsDTO>({
    queryKey: economyKeys.listingReviews(demoMode, slug),
    enabled: Boolean(slug),
    initialData: demoMode && slug ? demoListingReviews(slug) : undefined,
    queryFn: async () => {
      if (!slug) return { averageRating: null, count: 0, reviews: [] };
      if (demoMode) return demoListingReviews(slug);
      return getListingReviews(slug);
    },
  });
}

/**
 * The blind-review pair for a viewing (your review + the counterparty's, once
 * unlocked). Demo reads a fixture.
 *
 * `isEnabled: false` gives a CACHE-ONLY read: same key, same cache entry, no
 * request. The viewings list uses it to label a completed viewing's button with
 * whatever the review modal has already loaded for that viewing, without firing
 * one pair request per row of an unbounded "past viewings" list.
 */
export function useViewingReviewPair(
  viewingId: string | undefined,
  { isEnabled = true }: { isEnabled?: boolean } = {},
) {
  const { demoMode } = useDemoMode();
  return useQuery<HousingViewingReviewPairDTO | null>({
    queryKey: economyKeys.viewingReviewPair(demoMode, viewingId),
    enabled: isEnabled && Boolean(viewingId),
    queryFn: async () => {
      if (!viewingId) return null;
      if (demoMode) return demoViewingReviewPair(viewingId);
      return getViewingReviewPair(viewingId);
    },
  });
}

/**
 * The lister posts or overwrites their public reply to one review of their home
 * (PRD-47).
 *
 * `silentError` because the compose box shows its own inline failure with a
 * retry: a toast on top of that would say the same thing twice and then vanish,
 * which is the wrong shape for text somebody has just typed and could lose.
 *
 * Live only. Demo fakes the latency and refreshes nothing, so the demo reviews
 * block stays exactly the fixture it is: writing a fake reply into it would be
 * the demo-persona leak this codebase keeps having to fix.
 */
export function useReplyToHousingReview(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    HousingReviewDTO | null,
    Error,
    { reviewId: string } & ReplyToHousingReviewBody
  >({
    meta: { silentError: true },
    mutationFn: async ({ reviewId, text }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        return null;
      }
      return replyToHousingReview(reviewId, { text });
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.listingReviews(false, slug),
        });
      }
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

/**
 * Why an edit was refused, in the terms a member can be told.
 *
 * The backend answers `PATCH /housing-reviews/:reviewId` with three statuses
 * that mean genuinely different things, and it made them distinct so the UI
 * could keep them distinct. Collapsing them into one "could not save" would
 * tell somebody who is a few hours late the same thing it tells somebody
 * reaching for a review that was never theirs.
 *
 *  - `gonePublic` (409) — yours, and it has already revealed. Terminal, and the
 *    only one of the three that is a normal thing to happen to an honest
 *    member: the counterparty can submit theirs while the form is open.
 *  - `notYours` (403) — somebody else's review. Terminal.
 *  - `missing` (404) — no such review, e.g. a moderator removed it. Terminal.
 *  - `unknown` — a network blip or a 5xx. Worth retrying, so the form keeps
 *    offering to save.
 */
export type HousingReviewEditRefusal =
  "gonePublic" | "notYours" | "missing" | "unknown";

export function housingReviewEditRefusal(
  error: unknown,
): HousingReviewEditRefusal {
  if (!(error instanceof ApiError)) return "unknown";
  if (error.status === 409) return "gonePublic";
  if (error.status === 403) return "notYours";
  if (error.status === 404) return "missing";
  return "unknown";
}

/**
 * The author corrects their own blind review, before it goes public.
 *
 * `silentError` because every refusal here has a specific thing to say and the
 * form says it inline, beside the words the member just typed. A generic toast
 * would talk over the 409 copy and then vanish, which is the wrong shape for
 * text somebody could still lose.
 *
 * A 409 invalidates the pair on the way out. The review went public while the
 * form was open, which means the pair on screen is stale in exactly the field
 * the form is gating on, and refetching it is what settles the modal on the
 * "this is public now" panel rather than leaving it on a form that will refuse
 * again.
 *
 * Live only. Demo fakes the latency and writes nothing: the demo fixtures are
 * hand-authored and a fake edit into them is the demo-persona leak this
 * codebase keeps having to fix.
 */
export function useUpdateHousingReview(viewingId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    HousingReviewDTO | null,
    Error,
    { reviewId: string } & UpdateHousingReviewBody
  >({
    meta: { silentError: true },
    mutationFn: async ({ reviewId, rating, text }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        return null;
      }
      return updateHousingReview(reviewId, { rating, text });
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.viewingReviewPair(false, viewingId),
        });
      }
    },
    onError: (error) => {
      if (!demoMode && housingReviewEditRefusal(error) === "gonePublic") {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.viewingReviewPair(false, viewingId),
        });
      }
    },
  });
}

import { apiGet, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { HousingViewingParty } from "./housingViewings.api";

export interface HousingReviewDTO {
  id: string;
  author: MemberRefDTO | null;
  authorRole: HousingViewingParty;
  rating: number;
  text: string;
  submittedAt: string;
}

/** The blind-review pair for one viewing, from the caller's perspective. The
 * counterparty's review is present only once it has unlocked (both submitted,
 * or the window elapsed). */
export interface HousingViewingReviewPairDTO {
  viewingId: string;
  canReview: boolean;
  youReviewed: boolean;
  yourReview: HousingReviewDTO | null;
  counterpartySubmitted: boolean;
  counterpartyReview: HousingReviewDTO | null;
  revealsAt: string | null;
}

/** Public reviews block for a listing — aggregate computed on read over the
 * revealed reviews only. */
export interface HousingListingReviewsDTO {
  averageRating: number | null;
  count: number;
  reviews: HousingReviewDTO[];
}

export interface SubmitReviewBody {
  viewingId: string;
  rating: number;
  text: string;
}

export const getListingReviews = (slug: string) =>
  apiGet<HousingListingReviewsDTO>(`/housing-reviews/listing/${slug}`);

export const getViewingReviewPair = (viewingId: string) =>
  apiGet<HousingViewingReviewPairDTO>(`/housing-reviews/viewing/${viewingId}`);

export const submitHousingReview = (body: SubmitReviewBody) =>
  apiPost<HousingReviewDTO>("/housing-reviews", body);

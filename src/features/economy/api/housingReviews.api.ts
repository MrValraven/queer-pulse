import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { HousingViewingParty } from "./housingViewings.api";

/**
 * The LISTER's single public reply to a review of their home (PRD-47).
 *
 * Named after the lister rather than left as a neutral `reply`, because the
 * page has to say on screen whose words these are: a reader who mistakes the
 * reply for a second reviewer reads a defence as a corroboration.
 */
export interface HousingReviewListerReplyDTO {
  text: string;
  /** ISO-8601, when the lister wrote or last overwrote it. */
  at: string;
}

export interface HousingReviewDTO {
  id: string;
  /** `null` for a review whose author has since erased their account. Render
   * the removed-member placeholder; never assume there is a slug. */
  author: MemberRefDTO | null;
  authorRole: HousingViewingParty;
  rating: number;
  text: string;
  submittedAt: string;
  /**
   * The three PRD-47 fields are optional on the wire on purpose, and it is not
   * laziness: the demo fixtures in `housingViewings.data.ts` author these rows
   * by hand, and a response from a backend that has not shipped the columns yet
   * simply omits them. Optional means both degrade to "no reply, never edited",
   * which is the honest reading of an absent field. Every read site below
   * treats `undefined` and `null` identically.
   */
  editedAt?: string | null;
  /**
   * True when the review changed AFTER the lister answered it, so the reply on
   * screen may be answering words that are no longer there. Precomputed by the
   * backend from the two timestamps.
   *
   * ON HOUSING THIS NO LONGER HAPPENS, and the field is still read. Edits close
   * the moment a review goes public and replies open at that same moment, so
   * the two windows are exact complements and no housing review can be edited
   * after it has been answered. The backend keeps deriving the flag from the
   * row rather than hardcoding `false`, so anything that ever does carry that
   * ordering still warns instead of rendering silently. Do not go looking for a
   * way to trigger it in the product: there is not one, by design.
   */
  isEditedAfterListerReply?: boolean;
  listerReply?: HousingReviewListerReplyDTO | null;
}

/** The blind-review pair for one viewing, from the caller's perspective. The
 * counterparty's review is present only once it has unlocked (both submitted,
 * or the window elapsed). */
export interface HousingViewingReviewPairDTO {
  viewingId: string;
  canReview: boolean;
  youReviewed: boolean;
  yourReview: HousingReviewDTO | null;
  /**
   * Has the CALLER'S OWN review gone public, which is the same thing as saying
   * their edit window has closed? Server-computed from the same predicate
   * `PATCH /housing-reviews/:reviewId` gates on, so a save control shown while
   * this is `false` is a control the endpoint will actually accept.
   *
   * READ IT THROUGH `hasHousingReviewGonePublic` IN `ReviewViewingRules.ts`,
   * never directly. It is optional here for the same reason the review fields
   * above are: the demo fixtures in `housingViewings.data.ts` are hand-authored
   * and do not carry it, and a backend that has not shipped it simply omits it.
   * That helper holds the one decision about what absence means, so the answer
   * cannot differ between two call sites.
   *
   * IT CAN BE `true` BESIDE `counterpartySubmitted: false`, AND THAT IS NOT A
   * CONTRADICTION. Two different questions: reveal asks whether reciprocity
   * happened, and `counterpartySubmitted` asks whether there is anything the
   * caller may read. A moderator takedown on the counterparty's review clears
   * the second and leaves the first alone, because the review was still
   * submitted and a takedown must not re-blind a review that had already gone
   * public. The same shape appears when the anti-retaliation window elapses and
   * the counterparty never wrote anything at all.
   */
  isYourReviewRevealed?: boolean;
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
  /**
   * True when the caller is the lister these reviews are about, which is
   * exactly who may write or change the reply (PRD-47). Server-computed, so the
   * compose affordance never renders for somebody the endpoint would refuse.
   *
   * Optional for the same reason the review fields above are: the demo fixtures
   * do not author it. Absent reads as `false`, so a demo reader is shown the
   * reply and never the compose box.
   */
  isViewerTheLister?: boolean;
}

export interface SubmitReviewBody {
  viewingId: string;
  rating: number;
  text: string;
}

/** Body for the lister's reply. Posting again overwrites: one reply, not a
 * thread. */
export interface ReplyToHousingReviewBody {
  text: string;
}

/** Body for the author editing their own review, while it is still blind.
 * Never clears the lister's reply; the backend stamps `editedAt` when something
 * actually changed. */
export interface UpdateHousingReviewBody {
  rating: number;
  text: string;
}

export const getListingReviews = (slug: string) =>
  apiGet<HousingListingReviewsDTO>(`/housing-reviews/listing/${slug}`);

export const getViewingReviewPair = (viewingId: string) =>
  apiGet<HousingViewingReviewPairDTO>(`/housing-reviews/viewing/${viewingId}`);

export const submitHousingReview = (body: SubmitReviewBody) =>
  apiPost<HousingReviewDTO>("/housing-reviews", body);

/**
 * The lister answers one review of their home. Refused by the backend for
 * anybody but the review's subject, on the private lister-to-guest review, and
 * while the review is still blind: replying proves the lister has read it, so it
 * only opens once the review has revealed.
 */
export const replyToHousingReview = (
  reviewId: string,
  body: ReplyToHousingReviewBody,
) => apiPatch<HousingReviewDTO>(`/housing-reviews/${reviewId}/reply`, body);

/**
 * The author changes their own review, and only while it is still blind.
 *
 * EDITS CLOSE WHEN THE REVIEW GOES PUBLIC. Housing reviews are blind and
 * mutual, so an edit allowed after reveal would let someone settle their rating
 * only once they had read the counterparty's review of them. A member can
 * correct their words up until the moment they go public, and not after.
 *
 * THREE REFUSALS, AND THEY MEAN DIFFERENT THINGS. 404 is no such review, 403 is
 * somebody else's review, and 409 is your own review that has already gone
 * public. Any caller that surfaces a failure here has to tell the last one
 * apart from the other two: "you are a few hours late" and "this was never
 * yours" are not the same message to put in front of a member, and only the
 * status distinguishes them.
 *
 * WHO CALLS THIS. `useUpdateHousingReview` in `useHousingReviews.ts`, reached
 * from `ReviewViewingEditPanel` inside `ReviewViewingModal`. The panel only
 * offers to save while the pair says the review is still blind, so the control
 * is not one that always 4xxs, and it still handles the 409 because the
 * counterparty can submit theirs while the form sits open.
 *
 * WHAT THE PAIR DTO TELLS THAT CALLER. `HousingViewingReviewPairDTO` carries
 * `isYourReviewRevealed`, derived server-side from the same predicate this
 * endpoint gates on, and `ReviewViewingRules.hasHousingReviewGonePublic` is
 * what reads it. Earlier the UI gated on `counterpartySubmitted`, which is a
 * sound signal in one direction only: their row existing means both submitted,
 * which reveals both, while its absence means nothing, because the other half
 * of the reveal rule is the elapsed anti-retaliation window and the window
 * length lives only in the backend service. So a review whose counterparty
 * never wrote one and whose window had since elapsed was public and still
 * LOOKED editable on the wire, and the save control it offered came back 409.
 * The field closes that.
 *
 * THE 409 IS STILL LOAD-BEARING. The field makes the control correct at render
 * time; it cannot make it correct forever. The counterparty can submit theirs
 * while the form sits open, which reveals both reviews underneath the member,
 * and an older backend omits the field entirely. Both land here.
 */
export const updateHousingReview = (
  reviewId: string,
  body: UpdateHousingReviewBody,
) => apiPatch<HousingReviewDTO>(`/housing-reviews/${reviewId}`, body);

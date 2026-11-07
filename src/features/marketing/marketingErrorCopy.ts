import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import type { ToastMessage } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Cause lines for the failed actions in the directory, the listing owner
 * tools, volunteering, the contact form and the roadmap. Each map holds only
 * what the backend really tells apart; every other failure falls through to
 * the shared `shared:apiError.*` lines in `causeErrorKey` (no connection,
 * signed out, restricted, inactive membership, rate limited, server fault, timeout).
 *
 * The routes behind these maps send no feature-specific machine `code`, so the
 * maps are keyed by HTTP status, read from the controllers in
 * queerpulse-backend.
 */

/** The toast a failed action shows: a short title over the specific cause. */
export function failureToast(
  error: unknown,
  t: TFunction,
  titleKey: string,
  overrides?: CauseErrorOverrides,
): ToastMessage {
  const cause = causeErrorKey(error, overrides);
  return { title: t(titleKey), detail: t(cause.key, cause.values) };
}

/** A 400 whose sentence carries the cause, since the backend sends no code. */
interface SentenceRule {
  /** Lowercase fragment of the backend's English sentence. */
  fragment: string;
  key: string;
}

/**
 * The cause for `error`, looking first at the backend's English sentence on a
 * 400 (the only way to tell those apart, because the routes below send no
 * machine code), then at `overrides`, then at the shared lines. A reworded
 * backend sentence falls back to the override for the status, so nothing
 * breaks, it only reads less specific.
 */
function causeWithSentenceRules(
  error: unknown,
  sentenceRules: readonly SentenceRule[],
  overrides: CauseErrorOverrides,
): CauseErrorCopy {
  if (error instanceof ApiError && error.status === 400) {
    const sentence = error.message.toLowerCase();
    const matchedRule = sentenceRules.find((rule) =>
      sentence.includes(rule.fragment),
    );
    if (matchedRule) return { key: matchedRule.key };
  }
  return causeErrorKey(error, overrides);
}

export function toastForCause(
  cause: CauseErrorCopy,
  t: TFunction,
  titleKey: string,
): ToastMessage {
  return { title: t(titleKey), detail: t(cause.key, cause.values) };
}

/** `POST /directory/:slug/reviews`: 400 is a review of your own place (told apart by sentence) or a missing rating or text; 409 is a second review. */
const REVIEW_SUBMIT_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:directory.detail.review.cause.incomplete",
  409: "marketing:directory.detail.review.cause.alreadyReviewed",
};
const REVIEW_SUBMIT_SENTENCES: readonly SentenceRule[] = [
  {
    fragment: "review your own listing",
    key: "marketing:directory.detail.review.cause.ownListing",
  },
];

export function directoryReviewSubmitCause(error: unknown): CauseErrorCopy {
  return causeWithSentenceRules(
    error,
    REVIEW_SUBMIT_SENTENCES,
    REVIEW_SUBMIT_OVERRIDES,
  );
}

export function directoryReviewSubmitToast(
  error: unknown,
  t: TFunction,
): ToastMessage {
  return toastForCause(
    directoryReviewSubmitCause(error),
    t,
    "marketing:directory.detail.review.errorTitle",
  );
}

/** `PATCH /directory/:slug/reviews/:id`: 400 is an empty review, 403 someone else's review. */
export const REVIEW_EDIT_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:directory.detail.review.cause.incomplete",
  403: "marketing:directory.detail.review.cause.notYours",
};

/** `PATCH /listings/:ref/reviews/:id/reply`: 400 is an empty reply. */
export const REVIEW_REPLY_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:directory.detail.reply.cause.empty",
};

/**
 * `POST /listings/:ref/claim`: both 400s are told apart by sentence: a listing
 * you already own, and a listing that already has a real owner (the backend's
 * own advice is to file a dispute).
 */
const CLAIM_SENTENCES: readonly SentenceRule[] = [
  {
    fragment: "already own this listing",
    key: "marketing:directory.detail.claim.cause.alreadyYours",
  },
  {
    fragment: "already has an owner",
    key: "marketing:directory.detail.claim.cause.hasOwner",
  },
];

export function directoryClaimCause(error: unknown): CauseErrorCopy {
  return causeWithSentenceRules(error, CLAIM_SENTENCES, {});
}

export function directoryClaimToast(
  error: unknown,
  t: TFunction,
): ToastMessage {
  return toastForCause(
    directoryClaimCause(error),
    t,
    "marketing:directory.detail.claim.errorTitle",
  );
}

/** `POST /volunteering/opportunities`: 400 is a refused detail, such as two organisations linked at once. */
export const OPPORTUNITY_CREATE_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:postOpportunity.cause.invalid",
};

/** `PATCH /volunteering/opportunities/:slug`: only the poster edits, and the posting may be gone. */
export const OPPORTUNITY_EDIT_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:postOpportunity.cause.invalid",
  403: "marketing:postOpportunity.cause.notPoster",
  404: "marketing:postOpportunity.cause.gone",
};

/** `POST /inquiries`: five a minute per visitor. */
export const CONTACT_INQUIRY_OVERRIDES: CauseErrorOverrides = {
  429: "marketing:contact.cause.rateLimited",
};

/** `POST /roadmap/ideas`: five a minute per member. */
export const ROADMAP_IDEA_OVERRIDES: CauseErrorOverrides = {
  429: "marketing:roadmap.submitIdea.cause.rateLimited",
};

/**
 * `PATCH /listings/:ref` (the owner editor): 403 is a co-manager changing a
 * field only the owner may change, 404 a listing no longer yours to edit, 413 a
 * body past the size limit (many photos).
 */
export const LISTING_EDIT_SAVE_OVERRIDES: CauseErrorOverrides = {
  403: "marketing:listBusiness.edit.cause.ownerOnly",
  404: "marketing:listBusiness.edit.cause.gone",
  413: "marketing:listBusiness.edit.cause.tooLarge",
};

/** `POST /listings` (the wizard's submit): 413 is a body past the size limit. */
export const LISTING_SUBMIT_OVERRIDES: CauseErrorOverrides = {
  413: "marketing:listBusiness.edit.cause.tooLarge",
};

/** Presigning a menu PDF: 400 a refused type, 413 a file past the cap, 429 too many uploads. */
export const MENU_PDF_UPLOAD_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:listBusiness.menu.fileError.rejected",
  413: "marketing:listBusiness.menu.fileError.size",
  429: "marketing:listBusiness.menu.fileError.tooManyUploads",
};

/** Answering a co-manager invitation: 404 the invitation or listing is gone, 409 already answered. */
export const CO_MANAGER_ANSWER_OVERRIDES: CauseErrorOverrides = {
  404: "marketing:listBusiness.coManagerInvites.cause.gone",
  409: "marketing:listBusiness.coManagerInvites.cause.alreadyAnswered",
};

/**
 * Answering an ownership offer: 404 the offer or listing is gone; 409 is
 * "already answered" or "claimed by somebody else since" (the sentence tells
 * them apart, since the backend sends no code).
 */
const OWNER_OFFER_SENTENCE = "claimed by somebody else";

export function ownerOfferAnswerCause(error: unknown): CauseErrorCopy {
  if (
    error instanceof ApiError &&
    error.status === 409 &&
    error.message.toLowerCase().includes(OWNER_OFFER_SENTENCE)
  ) {
    return { key: "marketing:listBusiness.ownerOffers.cause.claimedSince" };
  }
  return causeErrorKey(error, {
    404: "marketing:listBusiness.ownerOffers.cause.gone",
    409: "marketing:listBusiness.ownerOffers.cause.alreadyAnswered",
  });
}

/** The cause line as one string, for an inline refusal beside a form. */
export function causeLine(
  error: unknown,
  t: TFunction,
  overrides?: CauseErrorOverrides,
): string {
  const cause = causeErrorKey(error, overrides);
  return t(cause.key, cause.values);
}

/** `DELETE /listings/:ref`: 404 is a listing that is already gone. */
export const LISTING_DELETE_OVERRIDES: CauseErrorOverrides = {
  404: "marketing:listBusiness.deleteFlow.cause.gone",
};

/** Removing or leaving a co-manager seat: 404 is a seat that no longer exists. */
export const CO_MANAGER_SEAT_OVERRIDES: CauseErrorOverrides = {
  404: "marketing:listBusiness.coManagers.cause.gone",
};

/** `POST /directory/:slug/reviews/:id/helpful`: 400 is marking your own review. */
export const REVIEW_HELPFUL_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:directory.detail.reviews.cause.ownReview",
};

/**
 * Confirming a volunteer session: 400 is hours outside the allowed range, 403
 * is confirming your own session (someone else has to), 409 is handled by the
 * dashboard itself ("already done").
 */
export const VOLUNTEER_COMPLETION_OVERRIDES: CauseErrorOverrides = {
  400: "marketing:volunteerManage.completion.cause.hours",
  403: "marketing:volunteerManage.completion.cause.ownSession",
};

import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import type { ToastMessage } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Cause lines for the failed actions on the housing, verification and
 * company surfaces. Each map holds only what the backend really tells apart;
 * every other failure falls through to the shared `shared:apiError.*` lines in
 * `causeErrorKey` (no connection, signed out, restricted, inactive membership, rate
 * limited, server fault, timeout).
 *
 * The routes behind these maps send no machine `code`, so they are keyed by
 * HTTP status, read from the controllers in queerpulse-backend.
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

/** The cause line as one string, for an inline refusal beside a form. */
export function causeLine(
  error: unknown,
  t: TFunction,
  overrides?: CauseErrorOverrides,
): string {
  const cause = causeErrorKey(error, overrides);
  return t(cause.key, cause.values);
}

/**
 * A housing viewing action (accept, propose, decline, cancel, complete):
 * `HousingViewingsService`. 403 is "wait for the other person" or "withdraw
 * with cancel instead" (it is never a missing role), 404 is a viewing or home
 * that is gone, and 409 is the slot clash with another accepted viewing.
 */
export const HOUSING_VIEWING_ACTION_OVERRIDES: CauseErrorOverrides = {
  400: "economy:housingViewing.cause.moved",
  403: "economy:housingViewing.cause.notYourTurn",
  404: "economy:housingViewing.cause.missing",
  409: "economy:housingViewing.cause.slotTaken",
};

/**
 * The 400 refusals on a viewing carry no machine code, only a sentence, so
 * the three that need their own advice are told apart by that sentence. This is
 * the one place that reads English prose; a reworded backend sentence falls
 * back to the general "this viewing has moved on" line instead of breaking.
 */
const HOME_OFF_BOARD_SENTENCE = "no longer on the board";
const TIME_PASSED_SENTENCES = ["must be in the future", "already passed"];
const NOT_YET_HAPPENED_SENTENCE = "has not happened yet";

export function housingViewingActionCause(error: unknown): CauseErrorCopy {
  if (error instanceof ApiError && error.status === 400) {
    const sentence = error.message.toLowerCase();
    if (sentence.includes(HOME_OFF_BOARD_SENTENCE)) {
      return { key: "economy:housingViewing.cause.homeOffBoard" };
    }
    if (TIME_PASSED_SENTENCES.some((part) => sentence.includes(part))) {
      return { key: "economy:housingViewing.cause.timePassed" };
    }
    if (sentence.includes(NOT_YET_HAPPENED_SENTENCE)) {
      return { key: "economy:housingViewing.cause.notYetHappened" };
    }
  }
  return causeErrorKey(error, HOUSING_VIEWING_ACTION_OVERRIDES);
}

/** The toast for a failed viewing action, with the sentence-aware 400 lines. */
export function housingViewingActionToast(
  error: unknown,
  t: TFunction,
): ToastMessage {
  const cause = housingViewingActionCause(error);
  return {
    title: t("economy:housingViewing.list.actionErrorTitle"),
    detail: t(cause.key, cause.values),
  };
}

/** `POST /housing-reviews`: one review per home, only after a completed viewing. */
export const HOUSING_REVIEW_SUBMIT_OVERRIDES: CauseErrorOverrides = {
  400: "economy:housingViewing.review.cause.notCompleted",
  403: "economy:housingViewing.review.cause.notParticipant",
  404: "economy:housingViewing.cause.missing",
  409: "economy:housingViewing.review.cause.alreadyReviewed",
};

/**
 * `POST /housing-reviews/:id/reply`: 400 is an empty reply, 403 is a review
 * that is not about you, is private, or has not been revealed yet.
 */
export const HOUSING_REVIEW_REPLY_OVERRIDES: CauseErrorOverrides = {
  400: "economy:housingReview.reply.cause.empty",
  403: "economy:housingReview.reply.cause.notYetYours",
};

/**
 * `POST /companies/:slug/reviews/:id/reply`: 400 is an empty reply, 403 is a
 * caller who is not the company's owner or a company nobody has claimed.
 */
export const COMPANY_REVIEW_REPLY_OVERRIDES: CauseErrorOverrides = {
  400: "economy:company.reviews.reply.cause.empty",
  403: "economy:company.reviews.reply.cause.notOwner",
};

/** `POST /housing-saved-searches`: 409 is the cap of saved searches per member. */
export const HOUSING_SAVE_SEARCH_OVERRIDES: CauseErrorOverrides = {
  409: "economy:housing.saveSearch.cause.limit",
};

/** `POST /flatmate-profiles/:slug/decision`: 400 is your own profile, 404 a profile no longer shown. */
export const FLATMATE_DECISION_OVERRIDES: CauseErrorOverrides = {
  400: "economy:flatmates.discovery.cause.ownProfile",
  404: "economy:flatmates.discovery.cause.missing",
};

/** Mark filled, extend, edit or delete one of your own housing listings: 404 is a listing no longer in your list. */
export const MY_HOUSING_LISTING_OVERRIDES: CauseErrorOverrides = {
  404: "economy:myHousingListings.cause.missing",
};

/** `POST /verification/requests`: 409 is a request that is already open. */
export const VERIFICATION_SUBMIT_OVERRIDES: CauseErrorOverrides = {
  409: "economy:verification.request.cause.alreadyOpen",
};

/** Withdrawing a request: 409 is a request that has already been decided. */
export const VERIFICATION_WITHDRAW_OVERRIDES: CauseErrorOverrides = {
  409: "economy:verification.request.cause.alreadyDecided",
};

/** Appealing a decision: 409 is a request already appealed once, or not appealable now. */
export const VERIFICATION_APPEAL_OVERRIDES: CauseErrorOverrides = {
  409: "economy:verification.request.cause.alreadyAppealed",
};

/** `POST /companies`: 409 is no unique page address left for that company name. */
export const COMPANY_CREATE_OVERRIDES: CauseErrorOverrides = {
  409: "economy:affiliateCompanyModal.cause.nameTaken",
};

/**
 * `POST /housing-viewings`: 404 is a home that is filled, expired or off the
 * board, 409 is a viewing already open on that home.
 */
export const REQUEST_VIEWING_OVERRIDES: CauseErrorOverrides = {
  404: "economy:housingViewing.request.unavailable",
  409: "economy:housingViewing.request.cause.alreadyOpen",
};

/**
 * `POST /companies/:slug/reviews`: 400 is an empty review, 403 is reviewing a
 * company you own or sit on the team of. (A 409, a second review, has its own
 * toast at the call sites.)
 */
export const COMPANY_REVIEW_SUBMIT_OVERRIDES: CauseErrorOverrides = {
  400: "economy:companyReview.cause.empty",
  403: "economy:companyReview.cause.ownOrTeam",
};

/** `POST /barter` from the post strip: 400 is a listing the form could not accept. */
export const BARTER_POST_STRIP_OVERRIDES: CauseErrorOverrides = {
  400: "economy:barter.postStrip.errorInvalid",
};

/** Taking your flatmate profile down: 404 is a profile that is already gone. */
export const FLATMATE_PROFILE_DELETE_OVERRIDES: CauseErrorOverrides = {
  404: "economy:flatmateDangerZone.cause.gone",
};

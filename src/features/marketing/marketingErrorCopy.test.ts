import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { causeErrorKey } from "../../shared/api/causeErrorKey";
import {
  CONTACT_INQUIRY_OVERRIDES,
  CO_MANAGER_ANSWER_OVERRIDES,
  LISTING_EDIT_SAVE_OVERRIDES,
  LISTING_SUBMIT_OVERRIDES,
  MENU_PDF_UPLOAD_OVERRIDES,
  OPPORTUNITY_CREATE_OVERRIDES,
  OPPORTUNITY_EDIT_OVERRIDES,
  REVIEW_EDIT_OVERRIDES,
  REVIEW_REPLY_OVERRIDES,
  ROADMAP_IDEA_OVERRIDES,
  directoryClaimCause,
  directoryClaimToast,
  directoryReviewSubmitCause,
  directoryReviewSubmitToast,
  failureToast,
  ownerOfferAnswerCause,
  toastForCause,
} from "./marketingErrorCopy";

/** Echoes the key (and any values) so a test reads which line was chosen. */
function echoTranslate(
  key: string,
  options?: Record<string, string | number | undefined>,
): string {
  return options && Object.keys(options).length > 0
    ? `${key}|${JSON.stringify(options)}`
    : key;
}

describe("failureToast and toastForCause", () => {
  it("puts the title key over the cause line", () => {
    expect(
      failureToast(new ApiError(429, "x"), echoTranslate, "m:title", {
        429: "m:cause",
      }),
    ).toEqual({ title: "m:title", detail: "m:cause" });
  });

  it("names the lost connection for a non-ApiError", () => {
    expect(
      failureToast(new TypeError("Failed to fetch"), echoTranslate, "m:title")
        .detail,
    ).toBe("shared:apiError.noConnection");
  });

  it("builds a toast from a ready cause", () => {
    expect(
      toastForCause({ key: "m:cause", values: { n: 2 } }, echoTranslate, "m:t"),
    ).toEqual({ title: "m:t", detail: 'm:cause|{"n":2}' });
  });
});

describe("directory review submit", () => {
  it("tells a review of your own listing apart from other 400s", () => {
    expect(
      directoryReviewSubmitCause(
        new ApiError(400, "You cannot review your own listing"),
      ).key,
    ).toBe("marketing:directory.detail.review.cause.ownListing");
    expect(
      directoryReviewSubmitCause(new ApiError(400, "stars must be 1 to 5")).key,
    ).toBe("marketing:directory.detail.review.cause.incomplete");
  });

  it("names a second review on a 409", () => {
    expect(directoryReviewSubmitCause(new ApiError(409, "x")).key).toBe(
      "marketing:directory.detail.review.cause.alreadyReviewed",
    );
  });

  it("falls back to the shared lines and the restricted account", () => {
    expect(directoryReviewSubmitCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(
      directoryReviewSubmitCause(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ).key,
    ).toBe("shared:apiError.accountRestricted");
    expect(directoryReviewSubmitCause(new TypeError("offline")).key).toBe(
      "shared:apiError.noConnection",
    );
  });

  it("builds the toast with the review title", () => {
    expect(
      directoryReviewSubmitToast(new ApiError(409, "x"), echoTranslate),
    ).toEqual({
      title: "marketing:directory.detail.review.errorTitle",
      detail: "marketing:directory.detail.review.cause.alreadyReviewed",
    });
  });
});

describe("directory review edit and reply", () => {
  it("maps the edit 400 and 403", () => {
    expect(
      causeErrorKey(new ApiError(400, "x"), REVIEW_EDIT_OVERRIDES).key,
    ).toBe("marketing:directory.detail.review.cause.incomplete");
    expect(
      causeErrorKey(new ApiError(403, "x"), REVIEW_EDIT_OVERRIDES).key,
    ).toBe("marketing:directory.detail.review.cause.notYours");
  });

  it("maps the reply 400", () => {
    expect(
      causeErrorKey(new ApiError(400, "x"), REVIEW_REPLY_OVERRIDES).key,
    ).toBe("marketing:directory.detail.reply.cause.empty");
  });
});

describe("directory claim", () => {
  it("tells a listing you own apart from a listing that has an owner", () => {
    expect(
      directoryClaimCause(new ApiError(400, "You already own this listing"))
        .key,
    ).toBe("marketing:directory.detail.claim.cause.alreadyYours");
    expect(
      directoryClaimCause(
        new ApiError(
          400,
          "This listing already has an owner. If it is wrong or misrepresents you, file a dispute instead",
        ),
      ).key,
    ).toBe("marketing:directory.detail.claim.cause.hasOwner");
  });

  it("uses the shared invalid line for any other 400", () => {
    expect(directoryClaimCause(new ApiError(400, "note too long")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
  });

  it("builds the toast with the claim title", () => {
    expect(directoryClaimToast(new ApiError(404, "x"), echoTranslate)).toEqual({
      title: "marketing:directory.detail.claim.errorTitle",
      detail: "shared:apiError.notFound",
    });
  });
});

describe("status override maps", () => {
  it.each([
    [
      "create 400",
      OPPORTUNITY_CREATE_OVERRIDES,
      400,
      "marketing:postOpportunity.cause.invalid",
    ],
    [
      "edit 400",
      OPPORTUNITY_EDIT_OVERRIDES,
      400,
      "marketing:postOpportunity.cause.invalid",
    ],
    [
      "edit 403",
      OPPORTUNITY_EDIT_OVERRIDES,
      403,
      "marketing:postOpportunity.cause.notPoster",
    ],
    [
      "edit 404",
      OPPORTUNITY_EDIT_OVERRIDES,
      404,
      "marketing:postOpportunity.cause.gone",
    ],
    [
      "contact 429",
      CONTACT_INQUIRY_OVERRIDES,
      429,
      "marketing:contact.cause.rateLimited",
    ],
    [
      "roadmap 429",
      ROADMAP_IDEA_OVERRIDES,
      429,
      "marketing:roadmap.submitIdea.cause.rateLimited",
    ],
    [
      "listing edit 403",
      LISTING_EDIT_SAVE_OVERRIDES,
      403,
      "marketing:listBusiness.edit.cause.ownerOnly",
    ],
    [
      "listing edit 404",
      LISTING_EDIT_SAVE_OVERRIDES,
      404,
      "marketing:listBusiness.edit.cause.gone",
    ],
    [
      "listing edit 413",
      LISTING_EDIT_SAVE_OVERRIDES,
      413,
      "marketing:listBusiness.edit.cause.tooLarge",
    ],
    [
      "listing submit 413",
      LISTING_SUBMIT_OVERRIDES,
      413,
      "marketing:listBusiness.edit.cause.tooLarge",
    ],
    [
      "menu pdf 400",
      MENU_PDF_UPLOAD_OVERRIDES,
      400,
      "marketing:listBusiness.menu.fileError.rejected",
    ],
    [
      "menu pdf 413",
      MENU_PDF_UPLOAD_OVERRIDES,
      413,
      "marketing:listBusiness.menu.fileError.size",
    ],
    [
      "menu pdf 429",
      MENU_PDF_UPLOAD_OVERRIDES,
      429,
      "marketing:listBusiness.menu.fileError.tooManyUploads",
    ],
    [
      "co-manager 404",
      CO_MANAGER_ANSWER_OVERRIDES,
      404,
      "marketing:listBusiness.coManagerInvites.cause.gone",
    ],
    [
      "co-manager 409",
      CO_MANAGER_ANSWER_OVERRIDES,
      409,
      "marketing:listBusiness.coManagerInvites.cause.alreadyAnswered",
    ],
  ])("%s", (_name, overrides, status, key) => {
    expect(causeErrorKey(new ApiError(status, "x"), overrides).key).toBe(key);
  });

  it("keeps the shared line for a status a map does not override", () => {
    expect(
      causeErrorKey(new ApiError(500, "x"), CONTACT_INQUIRY_OVERRIDES).key,
    ).toBe("shared:apiError.serverFault");
    expect(
      causeErrorKey(new ApiError(429, "x"), OPPORTUNITY_EDIT_OVERRIDES).key,
    ).toBe("shared:apiError.reasonRateLimited");
  });
});

describe("ownerOfferAnswerCause", () => {
  it("tells an offer claimed by somebody else apart from one already answered", () => {
    expect(
      ownerOfferAnswerCause(
        new ApiError(
          409,
          "This listing has been claimed by somebody else since the offer was made",
        ),
      ).key,
    ).toBe("marketing:listBusiness.ownerOffers.cause.claimedSince");
    expect(
      ownerOfferAnswerCause(
        new ApiError(409, "This offer has already been answered"),
      ).key,
    ).toBe("marketing:listBusiness.ownerOffers.cause.alreadyAnswered");
  });

  it("maps 404 and falls back to the shared lines", () => {
    expect(ownerOfferAnswerCause(new ApiError(404, "x")).key).toBe(
      "marketing:listBusiness.ownerOffers.cause.gone",
    );
    expect(ownerOfferAnswerCause(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(ownerOfferAnswerCause(new TypeError("offline")).key).toBe(
      "shared:apiError.noConnection",
    );
  });
});

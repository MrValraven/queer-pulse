import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  BARTER_POST_STRIP_OVERRIDES,
  COMPANY_CREATE_OVERRIDES,
  FLATMATE_PROFILE_DELETE_OVERRIDES,
  COMPANY_REVIEW_SUBMIT_OVERRIDES,
  REQUEST_VIEWING_OVERRIDES,
  COMPANY_REVIEW_REPLY_OVERRIDES,
  FLATMATE_DECISION_OVERRIDES,
  HOUSING_REVIEW_REPLY_OVERRIDES,
  HOUSING_REVIEW_SUBMIT_OVERRIDES,
  HOUSING_SAVE_SEARCH_OVERRIDES,
  MY_HOUSING_LISTING_OVERRIDES,
  VERIFICATION_APPEAL_OVERRIDES,
  VERIFICATION_SUBMIT_OVERRIDES,
  VERIFICATION_WITHDRAW_OVERRIDES,
  causeLine,
  failureToast,
  housingViewingActionCause,
  housingViewingActionToast,
} from "./economyErrorCopy";

/** Echoes the key (and any values) so a test reads which line was chosen. */
function echoTranslate(
  key: string,
  options?: Record<string, string | number | undefined>,
): string {
  return options && Object.keys(options).length > 0
    ? `${key}|${JSON.stringify(options)}`
    : key;
}

describe("failureToast and causeLine", () => {
  it("puts the title key over the cause line", () => {
    expect(
      failureToast(
        new ApiError(409, "x"),
        echoTranslate,
        "economy:some.title",
        { 409: "economy:some.cause" },
      ),
    ).toEqual({ title: "economy:some.title", detail: "economy:some.cause" });
  });

  it("names the lost connection for a non-ApiError", () => {
    expect(
      failureToast(new TypeError("Failed to fetch"), echoTranslate, "t:title")
        .detail,
    ).toBe("shared:apiError.noConnection");
    expect(causeLine(new TypeError("x"), echoTranslate)).toBe(
      "shared:apiError.noConnection",
    );
  });

  it("falls back to the shared line for a status with no override", () => {
    expect(causeLine(new ApiError(429, "x"), echoTranslate, {})).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(causeLine(new ApiError(503, "x"), echoTranslate, {})).toBe(
      "shared:apiError.serverFault",
    );
  });

  it("keeps a restricted account ahead of a status override", () => {
    const restricted = new ApiError(403, "Restricted", {
      code: "ACCOUNT_RESTRICTED",
    });
    expect(
      causeLine(restricted, echoTranslate, HOUSING_REVIEW_REPLY_OVERRIDES),
    ).toBe("shared:apiError.accountRestricted");
  });
});

describe("housingViewingActionCause", () => {
  it("tells the home leaving the board apart from the other 400s", () => {
    expect(
      housingViewingActionCause(
        new ApiError(400, "This home is no longer on the board"),
      ).key,
    ).toBe("economy:housingViewing.cause.homeOffBoard");
  });

  it.each([
    "Proposed times must be in the future",
    "That time has already passed. Propose a new time instead",
  ])("names a time that has gone for %s", (sentence) => {
    expect(housingViewingActionCause(new ApiError(400, sentence)).key).toBe(
      "economy:housingViewing.cause.timePassed",
    );
  });

  it("names a viewing that has not happened yet", () => {
    expect(
      housingViewingActionCause(
        new ApiError(
          400,
          "This viewing has not happened yet. You can mark it completed once the agreed time has passed",
        ),
      ).key,
    ).toBe("economy:housingViewing.cause.notYetHappened");
  });

  it("uses the general moved line for any other 400", () => {
    expect(
      housingViewingActionCause(
        new ApiError(400, "This viewing can no longer be cancelled"),
      ).key,
    ).toBe("economy:housingViewing.cause.moved");
  });

  it.each([
    [403, "economy:housingViewing.cause.notYourTurn"],
    [404, "economy:housingViewing.cause.missing"],
    [409, "economy:housingViewing.cause.slotTaken"],
    [429, "shared:apiError.reasonRateLimited"],
    [500, "shared:apiError.serverFault"],
  ])("maps %i to its line", (status, key) => {
    expect(housingViewingActionCause(new ApiError(status, "x")).key).toBe(key);
  });

  it("lets a restricted account and offline win", () => {
    expect(
      housingViewingActionCause(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ).key,
    ).toBe("shared:apiError.accountRestricted");
    expect(housingViewingActionCause(new TypeError("offline")).key).toBe(
      "shared:apiError.noConnection",
    );
  });

  it("builds the toast with the viewing title", () => {
    expect(
      housingViewingActionToast(new ApiError(409, "x"), echoTranslate),
    ).toEqual({
      title: "economy:housingViewing.list.actionErrorTitle",
      detail: "economy:housingViewing.cause.slotTaken",
    });
  });
});

describe("economy override maps", () => {
  it.each([
    [
      "review submit 400",
      HOUSING_REVIEW_SUBMIT_OVERRIDES,
      400,
      "economy:housingViewing.review.cause.notCompleted",
    ],
    [
      "review submit 403",
      HOUSING_REVIEW_SUBMIT_OVERRIDES,
      403,
      "economy:housingViewing.review.cause.notParticipant",
    ],
    [
      "review submit 404",
      HOUSING_REVIEW_SUBMIT_OVERRIDES,
      404,
      "economy:housingViewing.cause.missing",
    ],
    [
      "review submit 409",
      HOUSING_REVIEW_SUBMIT_OVERRIDES,
      409,
      "economy:housingViewing.review.cause.alreadyReviewed",
    ],
    [
      "housing reply 400",
      HOUSING_REVIEW_REPLY_OVERRIDES,
      400,
      "economy:housingReview.reply.cause.empty",
    ],
    [
      "housing reply 403",
      HOUSING_REVIEW_REPLY_OVERRIDES,
      403,
      "economy:housingReview.reply.cause.notYetYours",
    ],
    [
      "company reply 400",
      COMPANY_REVIEW_REPLY_OVERRIDES,
      400,
      "economy:company.reviews.reply.cause.empty",
    ],
    [
      "company reply 403",
      COMPANY_REVIEW_REPLY_OVERRIDES,
      403,
      "economy:company.reviews.reply.cause.notOwner",
    ],
    [
      "saved search 409",
      HOUSING_SAVE_SEARCH_OVERRIDES,
      409,
      "economy:housing.saveSearch.cause.limit",
    ],
    [
      "flatmate 400",
      FLATMATE_DECISION_OVERRIDES,
      400,
      "economy:flatmates.discovery.cause.ownProfile",
    ],
    [
      "flatmate 404",
      FLATMATE_DECISION_OVERRIDES,
      404,
      "economy:flatmates.discovery.cause.missing",
    ],
    [
      "my listing 404",
      MY_HOUSING_LISTING_OVERRIDES,
      404,
      "economy:myHousingListings.cause.missing",
    ],
    [
      "verification submit 409",
      VERIFICATION_SUBMIT_OVERRIDES,
      409,
      "economy:verification.request.cause.alreadyOpen",
    ],
    [
      "verification withdraw 409",
      VERIFICATION_WITHDRAW_OVERRIDES,
      409,
      "economy:verification.request.cause.alreadyDecided",
    ],
    [
      "verification appeal 409",
      VERIFICATION_APPEAL_OVERRIDES,
      409,
      "economy:verification.request.cause.alreadyAppealed",
    ],
    [
      "company create 409",
      COMPANY_CREATE_OVERRIDES,
      409,
      "economy:affiliateCompanyModal.cause.nameTaken",
    ],
    [
      "barter strip 400",
      BARTER_POST_STRIP_OVERRIDES,
      400,
      "economy:barter.postStrip.errorInvalid",
    ],
    [
      "flatmate profile delete 404",
      FLATMATE_PROFILE_DELETE_OVERRIDES,
      404,
      "economy:flatmateDangerZone.cause.gone",
    ],
    [
      "request viewing 404",
      REQUEST_VIEWING_OVERRIDES,
      404,
      "economy:housingViewing.request.unavailable",
    ],
    [
      "request viewing 409",
      REQUEST_VIEWING_OVERRIDES,
      409,
      "economy:housingViewing.request.cause.alreadyOpen",
    ],
    [
      "company review 400",
      COMPANY_REVIEW_SUBMIT_OVERRIDES,
      400,
      "economy:companyReview.cause.empty",
    ],
    [
      "company review 403",
      COMPANY_REVIEW_SUBMIT_OVERRIDES,
      403,
      "economy:companyReview.cause.ownOrTeam",
    ],
  ])("%s", (_name, overrides, status, key) => {
    expect(causeLine(new ApiError(status, "x"), echoTranslate, overrides)).toBe(
      key,
    );
  });

  it("keeps the shared line for a status a map does not override", () => {
    expect(
      causeLine(
        new ApiError(404, "x"),
        echoTranslate,
        HOUSING_SAVE_SEARCH_OVERRIDES,
      ),
    ).toBe("shared:apiError.notFound");
  });
});

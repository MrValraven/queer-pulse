import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  cardHolderStatusErrorCopy,
  cardProgrammeErrorCopy,
  cardRenewErrorCopy,
  myCardWriteErrorCopy,
} from "./cardActionErrors";

const offline = new TypeError("Failed to fetch");
const restricted = new ApiError(403, "Restricted", {
  code: "ACCOUNT_RESTRICTED",
});

describe("cardProgrammeErrorCopy", () => {
  it("names a space that cannot run cards by its code", () => {
    expect(
      cardProgrammeErrorCopy(
        new ApiError(400, "A space cannot run a membership card program", {
          code: "SUBCOMMUNITY_FEATURE_UNAVAILABLE",
        }),
      ).key,
    ).toBe("cards:error.spaceNoCards");
  });

  it("falls back to the shared causes", () => {
    expect(cardProgrammeErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(cardProgrammeErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
    expect(cardProgrammeErrorCopy(new ApiError(403, "x")).key).toBe(
      "shared:apiError.forbidden",
    );
    expect(cardProgrammeErrorCopy(new ApiError(400, "x")).key).toBe(
      "shared:apiError.reasonInvalid",
    );
    expect(cardProgrammeErrorCopy(new ApiError(404, "x")).key).toBe(
      "shared:apiError.notFound",
    );
    expect(cardProgrammeErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(cardProgrammeErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("cardHolderStatusErrorCopy", () => {
  it("names a missing reason for a 400 and keeps the space refusal", () => {
    expect(cardHolderStatusErrorCopy(new ApiError(400, "x")).key).toBe(
      "cards:error.reasonRequired",
    );
    expect(
      cardHolderStatusErrorCopy(
        new ApiError(400, "x", { code: "SUBCOMMUNITY_FEATURE_UNAVAILABLE" }),
      ).key,
    ).toBe("cards:error.spaceNoCards");
  });

  it("falls back to the shared causes", () => {
    expect(cardHolderStatusErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(cardHolderStatusErrorCopy(new ApiError(409, "x")).key).toBe(
      "shared:apiError.reasonConflict",
    );
    expect(cardHolderStatusErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

describe("myCardWriteErrorCopy", () => {
  it("names a card that left the wallet", () => {
    expect(myCardWriteErrorCopy(new ApiError(404, "Card not found")).key).toBe(
      "cards:error.cardGone",
    );
  });

  it("falls back to the shared causes", () => {
    expect(myCardWriteErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(myCardWriteErrorCopy(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(myCardWriteErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(
      myCardWriteErrorCopy(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ).key,
    ).toBe("shared:apiError.notActive");
  });
});

describe("cardRenewErrorCopy", () => {
  it.each([
    ["self_renew_not_allowed", "cards:renew.error.notAllowed"],
    ["card_withdrawn", "cards:renew.error.withdrawn"],
    ["not_a_member", "cards:renew.error.notAMember"],
    ["programme_paused", "cards:renew.error.paused"],
    ["no_expiry", "cards:renew.error.noExpiry"],
    ["not_due", "cards:renew.error.notDue"],
  ])("maps the reasonCode %s", (reasonCode, key) => {
    expect(cardRenewErrorCopy(new ApiError(403, "x", { reasonCode })).key).toBe(
      key,
    );
  });

  it("falls back to the shared causes for an unknown or missing reasonCode", () => {
    expect(
      cardRenewErrorCopy(new ApiError(403, "x", { reasonCode: "new_reason" }))
        .key,
    ).toBe("shared:apiError.forbidden");
    expect(cardRenewErrorCopy(new ApiError(404, "x")).key).toBe(
      "cards:error.cardGone",
    );
    expect(cardRenewErrorCopy(offline).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(cardRenewErrorCopy(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(cardRenewErrorCopy(restricted).key).toBe(
      "shared:apiError.accountRestricted",
    );
  });
});

import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { causeErrorKeyWithSentences } from "./causeBySentence";

const RULES = {
  overrides: { 404: "feature:gone", SOME_CODE: "feature:coded" },
  sentences: [
    { pattern: /^this thread is locked/i, key: "feature:locked" },
    { pattern: /^only members can do that/i, key: "feature:members" },
  ],
} as const;

describe("causeErrorKeyWithSentences", () => {
  it("matches an uncoded refusal by its sentence", () => {
    const error = new ApiError(403, "This thread is locked");
    expect(causeErrorKeyWithSentences(error, RULES)).toEqual({
      key: "feature:locked",
    });
  });

  it("trims the sentence before matching", () => {
    const error = new ApiError(403, "  Only members can do that \n");
    expect(causeErrorKeyWithSentences(error, RULES)).toEqual({
      key: "feature:members",
    });
  });

  it("never lets a sentence shadow a coded refusal", () => {
    const error = new ApiError(403, "This thread is locked", {
      code: "SOME_CODE",
    });
    expect(causeErrorKeyWithSentences(error, RULES)).toEqual({
      key: "feature:coded",
    });
  });

  it("keeps a moderation restriction ahead of any sentence", () => {
    const error = new ApiError(403, "This thread is locked", {
      code: "ACCOUNT_RESTRICTED",
    });
    expect(causeErrorKeyWithSentences(error, RULES)).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("falls back to a status override when no sentence matches", () => {
    expect(
      causeErrorKeyWithSentences(new ApiError(404, "Nope"), RULES),
    ).toEqual({ key: "feature:gone" });
  });

  it("falls back to the shared status line", () => {
    expect(
      causeErrorKeyWithSentences(new ApiError(429, "Too Many Requests"), RULES),
    ).toEqual({ key: "shared:apiError.reasonRateLimited" });
  });

  it("names a lost connection for a non-ApiError and ignores the rules", () => {
    expect(
      causeErrorKeyWithSentences(new TypeError("Failed to fetch"), RULES),
    ).toEqual({ key: "shared:apiError.noConnection" });
  });

  it("works with no rules at all", () => {
    expect(causeErrorKeyWithSentences(new ApiError(500, "x"), {})).toEqual({
      key: "shared:apiError.serverFault",
    });
  });
});

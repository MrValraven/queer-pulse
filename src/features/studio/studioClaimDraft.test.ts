import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import {
  EMPTY_CLAIM_DRAFT,
  claimBodyOf,
  claimDraftErrors,
  claimSubmitErrorKeyOf,
  isHttpsLink,
  type StudioClaimDraft,
} from "./studioClaimDraft";

const valid: StudioClaimDraft = {
  claimantRole: "rights_holder",
  originalWork: "  Candeia, by Rosa Marinho  ",
  originalLink: "",
  details: " The chorus from 0:40 ",
  isGoodFaith: true,
};

const coded = (status: number, code: string) =>
  new ApiError(status, code, { statusCode: status, code, message: code });

describe("claimDraftErrors", () => {
  it("names every missing field on an empty draft", () => {
    expect(claimDraftErrors(EMPTY_CLAIM_DRAFT)).toEqual({
      claimantRole: "studio:claims.form.error.roleRequired",
      originalWork: "studio:claims.form.error.originalWorkRequired",
      details: "studio:claims.form.error.detailsRequired",
      isGoodFaith: "studio:claims.form.error.goodFaithRequired",
    });
  });

  it("accepts https links only", () => {
    for (const link of [
      "javascript:alert(1)",
      "mailto:someone@example.org",
      "example.org/song",
      "ftp://example.org/song",
      "http://example.org/song",
    ])
      expect(
        claimDraftErrors({ ...valid, originalLink: link }).originalLink,
      ).toBe("studio:claims.form.error.linkInvalid");
    expect(isHttpsLink("https://example.org/song")).toBe(true);
    expect(isHttpsLink("http://example.org")).toBe(false);
    expect(
      claimDraftErrors({ ...valid, originalLink: "https://example.org/song" }),
    ).toEqual({});
  });

  it("holds each field to its limit", () => {
    expect(
      claimDraftErrors({ ...valid, originalWork: "a".repeat(201) })
        .originalWork,
    ).toBe("studio:claims.form.error.originalWorkTooLong");
    expect(
      claimDraftErrors({ ...valid, details: "a".repeat(2001) }).details,
    ).toBe("studio:claims.form.error.detailsTooLong");
    expect(
      claimDraftErrors({
        ...valid,
        originalLink: `https://example.org/${"a".repeat(490)}`,
      }).originalLink,
    ).toBe("studio:claims.form.error.linkTooLong");
    expect(
      claimDraftErrors({ ...valid, originalWork: "a".repeat(200) }),
    ).toEqual({});
  });

  it("requires the good-faith statement", () => {
    expect(claimDraftErrors({ ...valid, isGoodFaith: false })).toEqual({
      isGoodFaith: "studio:claims.form.error.goodFaithRequired",
    });
  });
});

describe("claimBodyOf", () => {
  it("trims the text and sends an empty link as null", () => {
    expect(claimBodyOf(valid)).toEqual({
      claimantRole: "rights_holder",
      originalWork: "Candeia, by Rosa Marinho",
      originalLink: null,
      details: "The chorus from 0:40",
      goodFaith: true,
    });
  });

  it("sends nothing for an invalid draft", () => {
    expect(claimBodyOf({ ...valid, isGoodFaith: false })).toBeNull();
  });
});

describe("claimSubmitErrorKeyOf", () => {
  it("gives each refusal its own line", () => {
    expect(claimSubmitErrorKeyOf(coded(409, "studio_claim_exists"))).toBe(
      "studio:errors.claimExists",
    );
    expect(claimSubmitErrorKeyOf(coded(409, "studio_claim_own_track"))).toBe(
      "studio:errors.claimOwnTrack",
    );
    expect(claimSubmitErrorKeyOf(coded(409, "studio_claim_limit"))).toBe(
      "studio:errors.claimLimit",
    );
    expect(claimSubmitErrorKeyOf(new ApiError(429, "Too Many Requests"))).toBe(
      "studio:claims.form.throttled",
    );
    expect(claimSubmitErrorKeyOf(new ApiError(404, "Track not found"))).toBe(
      "studio:claims.form.trackGone",
    );
    expect(claimSubmitErrorKeyOf(coded(403, "ACCOUNT_RESTRICTED"))).toBe(
      "shared:apiError.accountRestricted",
    );
  });
});

import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  FEED_ALREADY_CONNECTED_CODE,
  FEED_LIMIT_CODE,
  SECTION_FULL_CODE,
  SYNC_TOO_SOON_CODE,
  feedErrorCode,
  feedErrorMessageKey,
  feedLastErrorKey,
} from "./feedImportErrors";
import { PERSONA_EDIT_CONFLICT_CODE } from "./personaEditConflict";
import { subprofiles as enSubprofiles } from "../../../shared/i18n/catalogs/en/subprofiles";
import { subprofiles as ptSubprofiles } from "../../../shared/i18n/catalogs/pt/subprofiles";

const refused = (status: number, code?: string) =>
  new ApiError(status, code ?? "x", code ? { code } : undefined);

describe("feedErrorMessageKey", () => {
  it.each([
    "unreachable",
    "timeout",
    "http_error",
    "too_large",
    "not_a_feed",
  ] as const)("maps the %s feed error code to its own message", (code) => {
    expect(feedErrorMessageKey(refused(422, code))).toBe(
      `subprofiles:feedImport.error.${code}`,
    );
  });

  it("maps the typed refusals", () => {
    expect(feedErrorMessageKey(refused(409, FEED_ALREADY_CONNECTED_CODE))).toBe(
      "subprofiles:feedImport.error.alreadyConnected",
    );
    expect(feedErrorMessageKey(refused(422, FEED_LIMIT_CODE))).toBe(
      "subprofiles:feedImport.error.limit",
    );
    expect(feedErrorMessageKey(refused(422, SECTION_FULL_CODE))).toBe(
      "subprofiles:feedImport.error.sectionFull",
    );
  });

  it("maps a persona edit conflict", () => {
    expect(feedErrorMessageKey(refused(409, PERSONA_EDIT_CONFLICT_CODE))).toBe(
      "subprofiles:feedImport.error.editConflict",
    );
  });

  it("tells a check inside the cooldown from the per-member fetch limit", () => {
    // SYNC_TOO_SOON: the feed was checked less than 5 minutes ago.
    expect(feedErrorMessageKey(refused(429, SYNC_TOO_SOON_CODE))).toBe(
      "subprofiles:feedImport.error.tooSoon",
    );
    // A 429 with no code: lookups, connects and checks share 20 fetches a minute.
    expect(feedErrorMessageKey(refused(429))).toBe(
      "subprofiles:feedImport.error.rateLimited",
    );
  });

  it("reads a code sent as the body message, the way Nest writes it", () => {
    const error = new ApiError(409, FEED_ALREADY_CONNECTED_CODE, {
      message: FEED_ALREADY_CONNECTED_CODE,
    });
    expect(feedErrorCode(error)).toBe(FEED_ALREADY_CONNECTED_CODE);
    expect(feedErrorMessageKey(error)).toBe(
      "subprofiles:feedImport.error.alreadyConnected",
    );
  });

  it("reads a 400 by the call it came from, and stays generic elsewhere", () => {
    expect(feedErrorMessageKey(refused(400), "update")).toBe(
      "subprofiles:feedImport.error.sectionNotAllowed",
    );
    expect(feedErrorMessageKey(refused(400), "preview")).toBe(
      "subprofiles:feedImport.error.invalidAddress",
    );
    expect(feedErrorMessageKey(refused(400), "connect")).toBe(
      "subprofiles:feedImport.error.connectRejected",
    );
    expect(feedErrorMessageKey(refused(400))).toBe(
      "subprofiles:feedImport.error.generic",
    );
    expect(feedErrorMessageKey(refused(400), "preview")).not.toBe(
      "subprofiles:feedImport.error.sectionNotAllowed",
    );
  });

  it("falls back to the plain generic message for anything else", () => {
    expect(feedErrorMessageKey(refused(500))).toBe(
      "subprofiles:feedImport.error.generic",
    );
    expect(feedErrorMessageKey(new Error("offline"))).toBe(
      "subprofiles:feedImport.error.generic",
    );
    expect(feedErrorMessageKey(refused(422, "SOMETHING_NEW"))).toBe(
      "subprofiles:feedImport.error.generic",
    );
  });
});

describe("feedLastErrorKey", () => {
  it("has plain words for every code a failing feed can carry", () => {
    for (const code of [
      "unreachable",
      "timeout",
      "http_error",
      "too_large",
      "not_a_feed",
      null,
    ] as const) {
      const key = feedLastErrorKey(code).replace("subprofiles:", "");
      expect(enSubprofiles[key], key).toBeTruthy();
      expect(ptSubprofiles[key], key).toBeTruthy();
    }
  });

  it("has a message in both languages for every key feedErrorMessageKey can return", () => {
    const keys = [
      ...["unreachable", "timeout", "http_error", "too_large", "not_a_feed"],
      "alreadyConnected",
      "limit",
      "sectionFull",
      "sectionNotAllowed",
      "invalidAddress",
      "connectRejected",
      "editConflict",
      "tooSoon",
      "rateLimited",
      "generic",
    ].map((name) => `feedImport.error.${name}`);
    for (const key of keys) {
      expect(enSubprofiles[key], key).toBeTruthy();
      expect(ptSubprofiles[key], key).toBeTruthy();
    }
  });
});

import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
import { MAX_GROUP_MEMBERS } from "../groupLimits";
import {
  groupErrorCodeOf,
  groupErrorMessage,
  groupErrorToastKey,
} from "./groupErrorMessages";

/** Identity-ish stub: returns the key itself (with any interpolation params
 *  appended as JSON), so assertions can check exactly which key AND params
 *  were resolved without wiring a real catalog. */
const identityT: TFunction = (key, options) =>
  options && Object.keys(options).length > 0
    ? `${key}:${JSON.stringify(options)}`
    : key;

function coded(status: number, code: string): ApiError {
  return new ApiError(status, "refused", { code });
}

describe("groupErrorCodeOf", () => {
  it("reads a recognised code off an ApiError's data", () => {
    expect(groupErrorCodeOf(coded(409, "GROUP_FULL"))).toBe("GROUP_FULL");
    expect(groupErrorCodeOf(coded(403, "GROUP_ADD_REFUSED"))).toBe(
      "GROUP_ADD_REFUSED",
    );
  });

  it("returns null for an un-coded or unrecognised error", () => {
    expect(groupErrorCodeOf(new ApiError(500, "boom"))).toBeNull();
    expect(groupErrorCodeOf(coded(400, "SOMETHING_ELSE"))).toBeNull();
    expect(groupErrorCodeOf(new Error("not an ApiError"))).toBeNull();
    expect(groupErrorCodeOf(null)).toBeNull();
    expect(groupErrorCodeOf(undefined)).toBeNull();
  });

  it("recognises every code section 8 defines", () => {
    const codes = [
      "GROUP_FULL",
      "GROUP_DISSOLVED",
      "GROUP_ADD_REFUSED",
      "INVITE_NOT_FOUND",
      "INVITE_LINK_INVALID",
      "REMOVED_FROM_GROUP",
      "PIN_LIMIT_REACHED",
    ] as const;
    for (const code of codes) {
      expect(groupErrorCodeOf(coded(400, code))).toBe(code);
    }
  });
});

describe("groupErrorToastKey", () => {
  it("maps GROUP_FULL to the shared picker toast key, not a separate one", () => {
    expect(groupErrorToastKey(coded(409, "GROUP_FULL"))).toBe(
      "messages:group.fullToast",
    );
  });

  it("returns null for an unrecognised error", () => {
    expect(groupErrorToastKey(new ApiError(500, "boom"))).toBeNull();
  });
});

describe("groupErrorMessage", () => {
  it("translates the mapped key for a recognised code", () => {
    expect(
      groupErrorMessage(coded(409, "GROUP_ADD_REFUSED"), identityT, "fallback"),
    ).toBe("messages:group.error.addRefused");
  });

  it("interpolates the member cap into GROUP_FULL's shared toast", () => {
    expect(
      groupErrorMessage(coded(409, "GROUP_FULL"), identityT, "fallback"),
    ).toBe(
      `messages:group.fullToast:${JSON.stringify({ max: MAX_GROUP_MEMBERS })}`,
    );
  });

  it("falls back for an un-coded error", () => {
    expect(
      groupErrorMessage(new ApiError(500, "boom"), identityT, "fallback"),
    ).toBe("fallback");
  });
});

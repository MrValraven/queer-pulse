import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  FUNDING_ERROR_MESSAGE_KEYS,
  FUNDING_ERROR_MESSAGE_VALUES,
  fundingAwareErrorKey,
  fundingErrorCode,
} from "./fundingErrors";

describe("fundingErrorCode", () => {
  it("reads a contract code off a 400, 403 or 409 body", () => {
    expect(
      fundingErrorCode(
        new ApiError(400, "Bad", { code: "funding_link_host_not_allowed" }),
      ),
    ).toBe("funding_link_host_not_allowed");
    expect(
      fundingErrorCode(
        new ApiError(403, "No", { code: "funding_ask_verification_required" }),
      ),
    ).toBe("funding_ask_verification_required");
    expect(
      fundingErrorCode(
        new ApiError(409, "Busy", { code: "funding_ask_limit_reached" }),
      ),
    ).toBe("funding_ask_limit_reached");
  });

  it("ignores codes it does not know and errors that carry none", () => {
    expect(
      fundingErrorCode(new ApiError(400, "Bad", { code: "something_else" })),
    ).toBeNull();
    expect(fundingErrorCode(new ApiError(500, "Oops"))).toBeNull();
    expect(fundingErrorCode(new Error("network"))).toBeNull();
  });

  it("has a message key for every code", () => {
    for (const key of Object.values(FUNDING_ERROR_MESSAGE_KEYS)) {
      expect(key.startsWith("forum:funding.error.")).toBe(true);
    }
  });
});

describe("fundingAwareErrorKey", () => {
  it("names the funding refusal's own copy, and the fallback for anything else", () => {
    expect(
      fundingAwareErrorKey(
        new ApiError(400, "Bad", { code: "funding_link_host_not_allowed" }),
        "forum:toast.error",
      ),
    ).toBe("forum:funding.error.linkHostNotAllowed");
    expect(
      fundingAwareErrorKey(new Error("network"), "forum:toast.error"),
    ).toBe("forum:toast.error");
  });

  it("lists the allowed hosts the host refusal interpolates", () => {
    expect(FUNDING_ERROR_MESSAGE_VALUES.hosts).toContain("gofundme.com");
  });
});

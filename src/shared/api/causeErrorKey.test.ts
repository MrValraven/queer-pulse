import { describe, expect, it } from "vitest";
import { ApiError } from "./client";
import {
  apiErrorCode,
  causeErrorKey,
  causeErrorKeyForStatus,
  CSRF_REJECTED_CODE,
  NOT_ACTIVE_MEMBER_CODE,
  SHARED_CAUSE_KEY,
} from "./causeErrorKey";

describe("causeErrorKey: no answer at all", () => {
  it("names the lost connection for a fetch TypeError", () => {
    expect(causeErrorKey(new TypeError("Failed to fetch"))).toEqual({
      key: "shared:apiError.noConnection",
    });
  });

  it("names the lost connection for any other non-ApiError value", () => {
    expect(causeErrorKey(new Error("boom"))).toEqual({
      key: SHARED_CAUSE_KEY.noConnection,
    });
    expect(causeErrorKey("a string")).toEqual({
      key: SHARED_CAUSE_KEY.noConnection,
    });
    expect(causeErrorKey(undefined)).toEqual({
      key: SHARED_CAUSE_KEY.noConnection,
    });
  });

  it("ignores overrides for a non-ApiError, which has no code or status", () => {
    expect(
      causeErrorKey(new TypeError("Failed to fetch"), {
        0: "feature:never",
        noConnection: "feature:never",
      }),
    ).toEqual({ key: SHARED_CAUSE_KEY.noConnection });
  });
});

describe("causeErrorKey: one shared line per status", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [422, "shared:apiError.reasonInvalid"],
    [401, "shared:apiError.signedOut"],
    [403, "shared:apiError.forbidden"],
    [404, "shared:apiError.notFound"],
    [408, "shared:apiError.timedOut"],
    [409, "shared:apiError.reasonConflict"],
    [410, "shared:apiError.reasonGone"],
    [413, "shared:apiError.reasonTooLarge"],
    [429, "shared:apiError.reasonRateLimited"],
    [500, "shared:apiError.serverFault"],
    [502, "shared:apiError.serverFault"],
    [503, "shared:apiError.serverFault"],
    [504, "shared:apiError.serverFault"],
  ])("maps %i to %s", (status, key) => {
    expect(causeErrorKey(new ApiError(status, "x"))).toEqual({ key });
  });

  it("names the status in the refused line for any other status", () => {
    expect(causeErrorKey(new ApiError(418, "I'm a teapot"))).toEqual({
      key: "shared:apiError.refused",
      values: { status: 418 },
    });
    expect(causeErrorKey(new ApiError(402, "Payment Required"))).toEqual({
      key: SHARED_CAUSE_KEY.refused,
      values: { status: 402 },
    });
  });

  it("never reads the server's sentence for a plain status", () => {
    expect(
      causeErrorKey(new ApiError(409, "That name is taken already")),
    ).toEqual({ key: SHARED_CAUSE_KEY.conflict });
  });
});

describe("causeErrorKey: causes the backend identifies", () => {
  it("names a moderation restriction for ACCOUNT_RESTRICTED", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Your account is restricted.", {
          code: "ACCOUNT_RESTRICTED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.accountRestricted" });
  });

  it("names an inactive membership for the machine code", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Whatever the server says", {
          code: NOT_ACTIVE_MEMBER_CODE,
        }),
      ),
    ).toEqual({ key: SHARED_CAUSE_KEY.notActive });
    expect(NOT_ACTIVE_MEMBER_CODE).toBe("ACTIVE_MEMBERSHIP_REQUIRED");
  });

  it("maps the bare guard sentence without the code to forbidden", () => {
    expect(
      causeErrorKey(new ApiError(403, "Active membership required")),
    ).toEqual({ key: SHARED_CAUSE_KEY.forbidden });
    expect(
      causeErrorKey(new ApiError(403, "  active membership REQUIRED ")),
    ).toEqual({ key: SHARED_CAUSE_KEY.forbidden });
  });

  it("names a refused security check for CSRF_REJECTED", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Invalid or missing CSRF token", {
          code: CSRF_REJECTED_CODE,
        }),
      ),
    ).toEqual({ key: "shared:apiError.securityCheck" });
    expect(CSRF_REJECTED_CODE).toBe("CSRF_REJECTED");
  });

  it("maps the bare CSRF sentences without the code to forbidden", () => {
    for (const sentence of [
      "Invalid or missing CSRF token",
      "Cross-site request rejected",
      "Origin not allowed",
    ]) {
      expect(causeErrorKey(new ApiError(403, sentence))).toEqual({
        key: SHARED_CAUSE_KEY.forbidden,
      });
    }
  });

  it("reads the machine codes on a 403 only", () => {
    expect(
      causeErrorKey(
        new ApiError(400, "Active membership required", {
          code: NOT_ACTIVE_MEMBER_CODE,
        }),
      ),
    ).toEqual({ key: SHARED_CAUSE_KEY.invalid });
  });

  it("keeps the 413 status line for a PAYLOAD_TOO_LARGE body", () => {
    expect(
      causeErrorKey(
        new ApiError(413, "request entity too large", {
          code: "PAYLOAD_TOO_LARGE",
        }),
      ),
    ).toEqual({ key: SHARED_CAUSE_KEY.tooLarge });
  });

  it("keeps the restriction ahead of a feature's 403 status override", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Restricted", { code: "ACCOUNT_RESTRICTED" }),
        { 403: "feature:notHost" },
      ),
    ).toEqual({ key: SHARED_CAUSE_KEY.accountRestricted });
  });

  it("keeps an inactive membership ahead of a feature's 403 status override", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Active membership required", {
          code: NOT_ACTIVE_MEMBER_CODE,
        }),
        { 403: "feature:notHost" },
      ),
    ).toEqual({ key: SHARED_CAUSE_KEY.notActive });
  });

  it("keeps a refused security check ahead of a feature's 403 status override", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Cross-site request rejected", {
          code: CSRF_REJECTED_CODE,
        }),
        { 403: "feature:notHost" },
      ),
    ).toEqual({ key: SHARED_CAUSE_KEY.securityCheck });
  });

  it("lets a feature's own CSRF_REJECTED line win over the shared one", () => {
    expect(
      causeErrorKey(new ApiError(403, "x", { code: CSRF_REJECTED_CODE }), {
        CSRF_REJECTED: "feature:staleForm",
      }),
    ).toEqual({ key: "feature:staleForm" });
  });
});

describe("causeErrorKey: feature overrides", () => {
  it("uses a status override ahead of the shared line", () => {
    expect(
      causeErrorKey(new ApiError(404, "Not Found"), {
        404: "economy:listing.error.closed",
      }),
    ).toEqual({ key: "economy:listing.error.closed" });
  });

  it("accepts a status written as a string key", () => {
    expect(
      causeErrorKey(new ApiError(409, "Conflict"), {
        "409": "feature:alreadyThere",
      }),
    ).toEqual({ key: "feature:alreadyThere" });
  });

  it("uses a code override ahead of the shared line", () => {
    expect(
      causeErrorKey(new ApiError(429, "x", { code: "REPORT_FLOOD_CAP" }), {
        REPORT_FLOOD_CAP: "safety:report.floodCap",
      }),
    ).toEqual({ key: "safety:report.floodCap" });
  });

  it("prefers the code override over a status override for the same error", () => {
    expect(
      causeErrorKey(new ApiError(429, "x", { code: "REPORT_FLOOD_CAP" }), {
        429: "feature:slowDown",
        REPORT_FLOOD_CAP: "safety:report.floodCap",
      }),
    ).toEqual({ key: "safety:report.floodCap" });
  });

  it("falls back to the status override when the code has no entry", () => {
    expect(
      causeErrorKey(new ApiError(429, "x", { code: "SOME_OTHER_CODE" }), {
        429: "feature:slowDown",
      }),
    ).toEqual({ key: "feature:slowDown" });
  });

  it("lets a code override win over a moderation restriction", () => {
    expect(
      causeErrorKey(
        new ApiError(403, "Restricted", { code: "ACCOUNT_RESTRICTED" }),
        { ACCOUNT_RESTRICTED: "feature:restrictedHere" },
      ),
    ).toEqual({ key: "feature:restrictedHere" });
  });

  it("falls back to the shared line when no override matches", () => {
    expect(
      causeErrorKey(new ApiError(500, "boom"), { 404: "feature:gone" }),
    ).toEqual({ key: SHARED_CAUSE_KEY.serverFault });
  });

  it("returns an override without values, even for an unmapped status", () => {
    expect(
      causeErrorKey(new ApiError(418, "x"), { 418: "feature:teapot" }),
    ).toEqual({ key: "feature:teapot" });
  });

  it("ignores inherited object properties as override keys", () => {
    expect(
      causeErrorKey(new ApiError(409, "x", { code: "toString" }), {}),
    ).toEqual({ key: SHARED_CAUSE_KEY.conflict });
  });

  it("skips an override entry whose value is empty", () => {
    expect(causeErrorKey(new ApiError(404, "x"), { 404: "" })).toEqual({
      key: SHARED_CAUSE_KEY.notFound,
    });
  });
});

describe("causeErrorKeyForStatus", () => {
  it("maps a bare status the same way as an ApiError", () => {
    expect(causeErrorKeyForStatus(413)).toEqual({
      key: SHARED_CAUSE_KEY.tooLarge,
    });
    expect(causeErrorKeyForStatus(503)).toEqual({
      key: SHARED_CAUSE_KEY.serverFault,
    });
    expect(causeErrorKeyForStatus(451)).toEqual({
      key: SHARED_CAUSE_KEY.refused,
      values: { status: 451 },
    });
  });

  it("uses a status override first", () => {
    expect(
      causeErrorKeyForStatus(403, { 403: "members:upload.error.linkExpired" }),
    ).toEqual({ key: "members:upload.error.linkExpired" });
  });
});

describe("apiErrorCode", () => {
  it("reads a string code off the parsed body", () => {
    expect(apiErrorCode(new ApiError(400, "x", { code: "SOME_CODE" }))).toBe(
      "SOME_CODE",
    );
  });

  it("returns null without a usable code", () => {
    expect(apiErrorCode(new ApiError(400, "x"))).toBeNull();
    expect(apiErrorCode(new ApiError(400, "x", "plain text body"))).toBeNull();
    expect(apiErrorCode(new ApiError(400, "x", { code: 42 }))).toBeNull();
    expect(apiErrorCode(new ApiError(400, "x", { code: "" }))).toBeNull();
    expect(apiErrorCode(new Error("x"))).toBeNull();
  });
});

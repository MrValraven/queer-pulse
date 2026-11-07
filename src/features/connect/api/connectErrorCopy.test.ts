import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { connectionActionCause, connectionNoteCause } from "./connectErrorCopy";

const OFFLINE = new TypeError("Failed to fetch");

describe("connectionActionCause", () => {
  it("says the connection is gone for a 404", () => {
    expect(connectionActionCause(new ApiError(404, "x"))).toEqual({
      key: "connect:toast.requestGone",
    });
  });

  it("says the request was already answered for a 409", () => {
    expect(connectionActionCause(new ApiError(409, "x"))).toEqual({
      key: "connect:toast.alreadyAnswered",
    });
  });

  it("names a moderation restriction and an inactive membership", () => {
    expect(
      connectionActionCause(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ).key,
    ).toBe("shared:apiError.accountRestricted");
    expect(
      connectionActionCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ).key,
    ).toBe("shared:apiError.notActive");
  });

  it("falls back to the shared causes", () => {
    expect(connectionActionCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(connectionActionCause(new ApiError(401, "x")).key).toBe(
      "shared:apiError.signedOut",
    );
    expect(
      connectionActionCause(new ApiError(403, "Not your connection")).key,
    ).toBe("shared:apiError.forbidden");
    expect(connectionActionCause(new ApiError(429, "x")).key).toBe(
      "shared:apiError.reasonRateLimited",
    );
    expect(connectionActionCause(new ApiError(500, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
    expect(connectionActionCause(new ApiError(408, "x")).key).toBe(
      "shared:apiError.timedOut",
    );
  });
});

describe("connectionNoteCause", () => {
  it("names the note length cap for a 400", () => {
    expect(connectionNoteCause(new ApiError(400, "x"))).toEqual({
      key: "connect:note.error.tooLong",
    });
  });

  it("says the connection is gone for a 404", () => {
    expect(connectionNoteCause(new ApiError(404, "x"))).toEqual({
      key: "connect:toast.requestGone",
    });
  });

  it("falls back to the shared causes", () => {
    expect(connectionNoteCause(OFFLINE).key).toBe(
      "shared:apiError.noConnection",
    );
    expect(connectionNoteCause(new ApiError(502, "x")).key).toBe(
      "shared:apiError.serverFault",
    );
  });
});

import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  messageRequestCause,
  messageRequestErrorKey,
} from "./firstContactError";

describe("messageRequestErrorKey", () => {
  it("explains that a business, persona or company mailbox only replies", () => {
    const error = new ApiError(403, "Cannot initiate", {
      code: "IDENTITY_CANNOT_INITIATE",
    });
    expect(messageRequestErrorKey(error)).toBe(
      "messages:mailbox.failure.cannotStart",
    );
  });

  it("keeps the caller's generic copy for an uncoded refusal", () => {
    expect(messageRequestErrorKey(new ApiError(403, "Forbidden"))).toBeNull();
  });
});

describe("messageRequestCause", () => {
  it.each([
    ["CONNECTION_REQUEST_DAILY_LIMIT", "messages:request.error.dailyLimit"],
    ["CONNECTION_REQUEST_PENDING_LIMIT", "messages:request.error.pendingLimit"],
    ["CONNECTION_REQUESTS_PAUSED", "messages:request.error.paused"],
    [
      "RECIPIENT_NOT_ACCEPTING_REQUESTS",
      "messages:request.error.recipientConnectionsOnly",
    ],
    ["IDENTITY_CANNOT_INITIATE", "messages:mailbox.failure.cannotStart"],
  ])("names %s", (code, key) => {
    expect(messageRequestCause(new ApiError(403, "x", { code }))).toEqual({
      key,
    });
  });

  it("lets the daily cap win over the 429 status it shares with the throttle", () => {
    expect(
      messageRequestCause(
        new ApiError(429, "x", { code: "CONNECTION_REQUEST_DAILY_LIMIT" }),
      ),
    ).toEqual({ key: "messages:request.error.dailyLimit" });
  });

  it("names the burst throttle for an uncoded 429", () => {
    expect(messageRequestCause(new ApiError(429, "Too Many"))).toEqual({
      key: "messages:request.error.rateLimited",
    });
  });

  it("says the recipient was not found for a 404", () => {
    expect(messageRequestCause(new ApiError(404, "x"))).toEqual({
      key: "messages:request.error.notFound",
    });
  });

  it("names a restriction, an inactive membership, a fault and a lost connection", () => {
    expect(
      messageRequestCause(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toEqual({ key: "shared:apiError.accountRestricted" });
    expect(
      messageRequestCause(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ key: "shared:apiError.notActive" });
    expect(messageRequestCause(new ApiError(500, "x"))).toEqual({
      key: "shared:apiError.serverFault",
    });
    expect(messageRequestCause(new ApiError(400, "x"))).toEqual({
      key: "shared:apiError.reasonInvalid",
    });
    expect(messageRequestCause(new TypeError("Failed to fetch"))).toEqual({
      key: "shared:apiError.noConnection",
    });
  });
});

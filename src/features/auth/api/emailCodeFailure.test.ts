import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  asFieldFailure,
  isSignupFailure,
  readEmailCodeFailure,
} from "./emailCodeFailure";

describe("readEmailCodeFailure", () => {
  it("reads a contract reason with its extras", () => {
    const error = new ApiError(400, "x", {
      reason: "code_incorrect",
      attemptsLeft: 3,
    });
    expect(readEmailCodeFailure(error)).toEqual({
      kind: "reason",
      reason: "code_incorrect",
      attemptsLeft: 3,
    });
  });

  it("keeps retryAt on too_many_codes and too_many_attempts", () => {
    const retryAt = "2026-10-26T12:00:00.000Z";
    expect(
      readEmailCodeFailure(
        new ApiError(429, "x", { reason: "too_many_codes", retryAt }),
      ),
    ).toEqual({ kind: "reason", reason: "too_many_codes", retryAt });
    expect(
      readEmailCodeFailure(
        new ApiError(429, "x", { reason: "too_many_attempts", retryAt }),
      ),
    ).toEqual({ kind: "reason", reason: "too_many_attempts", retryAt });
  });

  it("reads network_busy from the per-IP guards with its retryAt", () => {
    const retryAt = "2026-10-26T12:30:00.000Z";
    expect(
      readEmailCodeFailure(
        new ApiError(429, "x", { reason: "network_busy", retryAt }),
      ),
    ).toEqual({ kind: "reason", reason: "network_busy", retryAt });
  });

  it("keeps resendAvailableAt on resend_too_soon", () => {
    const resendAvailableAt = "2026-10-26T12:01:00.000Z";
    expect(
      readEmailCodeFailure(
        new ApiError(429, "x", {
          reason: "resend_too_soon",
          resendAvailableAt,
        }),
      ),
    ).toEqual({
      kind: "reason",
      reason: "resend_too_soon",
      resendAvailableAt,
    });
  });

  it("reads email_send_failed from a 503", () => {
    expect(
      readEmailCodeFailure(
        new ApiError(503, "x", { reason: "email_send_failed" }),
      ),
    ).toEqual({ kind: "reason", reason: "email_send_failed" });
  });

  it("reads a signup reason with its statusUrl", () => {
    const statusUrl = "https://q.test/auth/request-invite/status?token=t";
    const failure = readEmailCodeFailure(
      new ApiError(403, "x", { reason: "invite_required", statusUrl }),
    );
    expect(failure).toEqual({
      kind: "signup",
      reason: "invite_required",
      statusUrl,
    });
    expect(isSignupFailure(failure)).toBe(true);
    expect(asFieldFailure(failure)).toEqual({
      kind: "unexpected",
      status: 403,
    });
  });

  it("reads a 429 with no reason as throttled", () => {
    expect(
      readEmailCodeFailure(
        new ApiError(429, "ThrottlerException: Too Many Requests", {
          statusCode: 429,
        }),
      ),
    ).toEqual({ kind: "throttled" });
  });

  it("reads a timeout and a thrown TypeError as network", () => {
    expect(
      readEmailCodeFailure(new ApiError(408, "Request timed out")),
    ).toEqual({ kind: "network" });
    expect(readEmailCodeFailure(new TypeError("Failed to fetch"))).toEqual({
      kind: "network",
    });
  });

  it("reads the 503 email_code_unavailable as its own reason", () => {
    const failure = readEmailCodeFailure(
      new ApiError(503, "email_code_unavailable", {
        reason: "email_code_unavailable",
        message: "email_code_unavailable",
      }),
    );
    expect(failure).toEqual({
      kind: "reason",
      reason: "email_code_unavailable",
    });
    expect(isSignupFailure(failure)).toBe(false);
  });

  it("reads an unknown reason as unexpected with its status", () => {
    const failure = readEmailCodeFailure(
      new ApiError(400, "x", { reason: "something_new" }),
    );
    expect(failure).toEqual({ kind: "unexpected", status: 400 });
    expect(isSignupFailure(failure)).toBe(false);
    expect(asFieldFailure(failure)).toBe(failure);
  });

  it("drops extras of the wrong type", () => {
    expect(
      readEmailCodeFailure(
        new ApiError(400, "x", {
          reason: "code_incorrect",
          attemptsLeft: "3",
        }),
      ),
    ).toEqual({
      kind: "reason",
      reason: "code_incorrect",
      attemptsLeft: undefined,
    });
  });
});

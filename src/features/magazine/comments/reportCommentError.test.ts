import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { reportCommentErrorCopy } from "./reportCommentError";
import {
  CSRF_REFUSAL,
  codedRefusal,
  expectKeyInBothCatalogs,
  INACTIVE_MEMBER_REFUSAL,
  LEGACY_CSRF_REFUSAL,
  NO_ANSWER,
  PLATFORM_LOCKED_REFUSAL,
  RESTRICTED_REFUSAL,
  uncodedRefusal,
} from "../magazineErrorTestSupport";

const REPORT = "magazine:comments.report.error";

/** The flood-cap body (queerpulse-backend `reports/report-flood-limits.ts`). */
function floodCapRefusal(cap: "daily" | "subject"): ApiError {
  return new ApiError(429, "You have filed a lot of reports", {
    statusCode: 429,
    error: "Too Many Requests",
    code: "REPORT_FLOOD_CAP",
    cap,
    message: "You have filed a lot of reports",
  });
}

describe("reportCommentErrorCopy: one line per backend code", () => {
  it.each(["daily", "subject"] as const)("names the %s flood cap", (cap) => {
    expect(reportCommentErrorCopy(floodCapRefusal(cap))).toEqual({
      key: `${REPORT}.floodCap`,
    });
    expectKeyInBothCatalogs(`${REPORT}.floodCap`);
  });

  it("names a reason the comment subject does not offer", () => {
    expect(
      reportCommentErrorCopy(codedRefusal(400, "REPORT_REASON_NOT_OFFERED")),
    ).toEqual({ key: `${REPORT}.reasonNotOffered` });
    expectKeyInBothCatalogs(`${REPORT}.reasonNotOffered`);
  });

  it("shows the maintenance line for the platform lock", () => {
    expect(reportCommentErrorCopy(PLATFORM_LOCKED_REFUSAL)).toEqual({
      key: `${REPORT}.maintenance`,
    });
    expectKeyInBothCatalogs(`${REPORT}.maintenance`);
  });

  it("shows the fault line for a 503 without the lock code", () => {
    expect(
      reportCommentErrorCopy(uncodedRefusal(503, "Service Unavailable")),
    ).toEqual({ key: `${REPORT}.serverFault` });
  });
});

describe("reportCommentErrorCopy: the code wins over the English sentence", () => {
  it("still names the cap when the backend rewords its sentence", () => {
    expect(
      reportCommentErrorCopy(
        codedRefusal(429, "REPORT_FLOOD_CAP", "Slow down, friend"),
      ),
    ).toEqual({ key: `${REPORT}.floodCap` });
  });

  it("reads an uncoded 429 as the burst throttle, whatever it says", () => {
    expect(
      reportCommentErrorCopy(
        uncodedRefusal(429, "ThrottlerException: Too Many Requests"),
      ),
    ).toEqual({ key: `${REPORT}.tooFast` });
  });
});

describe("reportCommentErrorCopy: a code this filing does not know", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [403, `${REPORT}.securityCheck`],
    [404, "shared:apiError.notFound"],
    [422, "shared:apiError.reasonInvalid"],
    [429, `${REPORT}.tooFast`],
    [500, `${REPORT}.serverFault`],
  ])("falls back to the line for status %i", (status, key) => {
    expect(
      reportCommentErrorCopy(codedRefusal(status, "REPORT_SOMETHING_NEW")),
    ).toEqual({ key });
  });

  it("reads the message-subject codes by their status", () => {
    expect(
      reportCommentErrorCopy(codedRefusal(400, "REPORT_EVIDENCE_EXPIRED")),
    ).toEqual({ key: "shared:apiError.reasonInvalid" });
    expect(
      reportCommentErrorCopy(codedRefusal(403, "REPORT_NOT_PARTICIPANT")),
    ).toEqual({ key: `${REPORT}.securityCheck` });
  });
});

describe("reportCommentErrorCopy: causes outside the magazine module", () => {
  it("names the lost connection when no answer came", () => {
    expect(reportCommentErrorCopy(NO_ANSWER)).toEqual({
      key: `${REPORT}.noConnection`,
    });
    // The modal's own test fails the mutation with a plain Error.
    expect(reportCommentErrorCopy(new Error("boom"))).toEqual({
      key: `${REPORT}.noConnection`,
    });
  });

  it("names a moderation restriction", () => {
    expect(reportCommentErrorCopy(RESTRICTED_REFUSAL)).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("names an inactive membership", () => {
    expect(reportCommentErrorCopy(INACTIVE_MEMBER_REFUSAL)).toEqual({
      key: `${REPORT}.notActive`,
    });
  });

  it("reads a CSRF 403 that survived the retry as the security check", () => {
    expect(reportCommentErrorCopy(CSRF_REFUSAL)).toEqual({
      key: `${REPORT}.securityCheck`,
    });
  });

  it("keeps the security check for a CSRF 403 from a backend without the code", () => {
    expect(reportCommentErrorCopy(LEGACY_CSRF_REFUSAL)).toEqual({
      key: `${REPORT}.securityCheck`,
    });
  });
});

describe("reportCommentErrorCopy: one line per status", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [401, `${REPORT}.signedOut`],
    [403, `${REPORT}.securityCheck`],
    [404, "shared:apiError.notFound"],
    [408, `${REPORT}.timedOut`],
    [409, "shared:apiError.reasonConflict"],
    [410, "shared:apiError.reasonGone"],
    [413, "shared:apiError.reasonTooLarge"],
    [422, "shared:apiError.reasonInvalid"],
    [429, `${REPORT}.tooFast`],
    [500, `${REPORT}.serverFault`],
    [502, `${REPORT}.serverFault`],
    [503, `${REPORT}.serverFault`],
    [504, `${REPORT}.serverFault`],
  ])("maps an uncoded %i to %s", (status, key) => {
    expect(reportCommentErrorCopy(new ApiError(status, "x"))).toEqual({ key });
    expectKeyInBothCatalogs(key);
  });

  it("names the status in the refused line for any other status", () => {
    const copy = reportCommentErrorCopy(new ApiError(418, "x"));
    expect(copy).toEqual({ key: `${REPORT}.refused`, values: { status: 418 } });
    expectKeyInBothCatalogs(copy.key);
  });

  it("has every remaining line in both catalogs", () => {
    for (const key of [
      `${REPORT}.noConnection`,
      `${REPORT}.notActive`,
      "shared:apiError.accountRestricted",
    ]) {
      expectKeyInBothCatalogs(key);
    }
  });
});

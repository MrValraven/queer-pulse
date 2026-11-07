import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  classifyReportSubmissionError,
  useReportSubmissionError,
} from "./reportSubmissionError";

// The key stands in for its own text, with the interpolated values appended,
// so a test can read exactly which catalog line a refusal resolved to.
const translate = vi.fn((key: string, options?: Record<string, unknown>) =>
  options ? `${key}|${JSON.stringify(options)}` : `T:${key}`,
);
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: translate }),
}));

function coded(status: number, code: string): ApiError {
  return new ApiError(status, "x", { code });
}

describe("classifyReportSubmissionError", () => {
  it("reads a request that never arrived as no connection", () => {
    expect(
      classifyReportSubmissionError(new TypeError("Failed to fetch")),
    ).toEqual({ kind: "noConnection" });
  });

  it("keeps the coded report refusals", () => {
    expect(
      classifyReportSubmissionError(coded(429, "REPORT_FLOOD_CAP")),
    ).toEqual({ kind: "cap" });
    expect(
      classifyReportSubmissionError(coded(403, "REPORT_NOT_PARTICIPANT")),
    ).toEqual({ kind: "notParticipant" });
    expect(
      classifyReportSubmissionError(coded(400, "REPORT_EVIDENCE_EXPIRED")),
    ).toEqual({ kind: "evidenceExpired" });
    expect(
      classifyReportSubmissionError(coded(422, "studio_use_copyright_claim")),
    ).toEqual({ kind: "useCopyrightClaim" });
  });

  it("reads an uncoded 429 as the burst throttle", () => {
    expect(
      classifyReportSubmissionError(new ApiError(429, "Too Many")),
    ).toEqual({
      kind: "burst",
    });
  });

  it("names a moderation restriction instead of asking the member to sign in", () => {
    expect(
      classifyReportSubmissionError(coded(403, "ACCOUNT_RESTRICTED")),
    ).toEqual({ kind: "restricted" });
  });

  it("names an inactive membership instead of asking the member to sign in", () => {
    expect(
      classifyReportSubmissionError(
        new ApiError(403, "Active membership required", {
          code: "ACTIVE_MEMBERSHIP_REQUIRED",
        }),
      ),
    ).toEqual({ kind: "notActive" });
    expect(
      classifyReportSubmissionError(coded(403, "ACTIVE_MEMBERSHIP_REQUIRED")),
    ).toEqual({ kind: "notActive" });
  });

  it("keeps the auth refusal for a plain 401 or 403", () => {
    expect(classifyReportSubmissionError(new ApiError(401, "x"))).toEqual({
      kind: "auth",
    });
    expect(
      classifyReportSubmissionError(new ApiError(403, "Forbidden")),
    ).toEqual({ kind: "auth" });
  });

  it.each([
    [408, { kind: "timedOut" }],
    [500, { kind: "serverFault" }],
    [503, { kind: "serverFault" }],
    [400, { kind: "invalid" }],
    [422, { kind: "invalid" }],
    [404, { kind: "notFound" }],
    [409, { kind: "conflict" }],
    [410, { kind: "gone" }],
    [413, { kind: "tooLarge" }],
    [418, { kind: "failure", status: 418 }],
  ])("reads status %i as its own kind", (status, expected) => {
    expect(classifyReportSubmissionError(new ApiError(status, "x"))).toEqual(
      expected,
    );
  });
});

describe("useReportSubmissionError", () => {
  function describeWith(error: unknown): string {
    const { result } = renderHook(() => useReportSubmissionError());
    return result.current(error, "FALLBACK");
  }

  it.each([
    [new TypeError("Failed to fetch"), "shared:apiError.noConnection"],
    [new ApiError(408, "x"), "shared:apiError.timedOut"],
    [new ApiError(503, "x"), "shared:apiError.serverFault"],
    [new ApiError(400, "x"), "shared:apiError.reasonInvalid"],
    [coded(403, "ACCOUNT_RESTRICTED"), "shared:apiError.accountRestricted"],
    [
      new ApiError(403, "Active membership required", {
        code: "ACTIVE_MEMBERSHIP_REQUIRED",
      }),
      "shared:apiError.notActive",
    ],
    [new ApiError(404, "x"), "shared:apiError.notFound"],
    [new ApiError(409, "x"), "shared:apiError.reasonConflict"],
    [new ApiError(410, "x"), "shared:apiError.reasonGone"],
    [new ApiError(413, "x"), "shared:apiError.reasonTooLarge"],
  ])("shows the shared cause line for %#", (error, key) => {
    expect(describeWith(error)).toBe(`T:${key}`);
  });

  it("shows the safety lines for the coded refusals", () => {
    expect(describeWith(coded(429, "REPORT_FLOOD_CAP"))).toBe(
      "T:safety:report.floodCap",
    );
    expect(describeWith(new ApiError(429, "x"))).toBe(
      "T:safety:report.tooFast",
    );
    expect(describeWith(new ApiError(401, "x"))).toBe(
      "T:safety:report.authRefused",
    );
  });

  it("names the status for a refusal with no line of its own", () => {
    expect(describeWith(new ApiError(418, "x"))).toBe(
      'shared:apiError.refused|{"status":418}',
    );
  });

  it("falls back to the surface's wording while a catalog chunk has not loaded", () => {
    translate.mockImplementation((key) => key);
    expect(describeWith(new ApiError(404, "x"))).toBe("FALLBACK");
    expect(describeWith(new ApiError(418, "x"))).toBe("FALLBACK");
    translate.mockImplementation((key, options) =>
      options ? `${key}|${JSON.stringify(options)}` : `T:${key}`,
    );
  });
});

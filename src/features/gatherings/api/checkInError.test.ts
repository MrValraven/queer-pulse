import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { isAttendanceWindowClosed } from "./checkInError";

/**
 * The door reads `code` and nothing else (see `checkInError.ts`). These pin
 * that down, because the failure mode of getting it wrong is silent: a refusal
 * misread as an ordinary failure puts the host back on a button that will
 * never work, and an ordinary failure misread as a refusal takes a working
 * door down mid-gathering.
 */

const body = (code: string) => ({
  statusCode: 403,
  error: "Forbidden",
  code,
  message: "Arrivals are only recorded for 30 days after a gathering.",
});

describe("isAttendanceWindowClosed", () => {
  it("recognises the typed 403 refusal", () => {
    const error = new ApiError(
      403,
      "Arrivals are only recorded for 30 days after a gathering.",
      body("EVENT_ATTENDANCE_WINDOW_CLOSED"),
    );
    expect(isAttendanceWindowClosed(error)).toBe(true);
  });

  it("ignores a 403 carrying some other code", () => {
    const error = new ApiError(403, "Not yours", body("BANNED_FROM_COMMUNITY"));
    expect(isAttendanceWindowClosed(error)).toBe(false);
  });

  it("ignores a 403 with no code at all", () => {
    expect(isAttendanceWindowClosed(new ApiError(403, "Forbidden"))).toBe(
      false,
    );
  });

  it("never matches on the message prose alone", () => {
    // A future rewording of the server's human fallback must not change the
    // answer, so the same sentence with no code stays unrecognised.
    const error = new ApiError(
      403,
      "Arrivals are only recorded for 30 days after a gathering.",
      { statusCode: 403, error: "Forbidden" },
    );
    expect(isAttendanceWindowClosed(error)).toBe(false);
  });

  it("ignores other statuses and non-API failures", () => {
    expect(
      isAttendanceWindowClosed(
        new ApiError(500, "boom", body("EVENT_ATTENDANCE_WINDOW_CLOSED")),
      ),
    ).toBe(false);
    expect(isAttendanceWindowClosed(new Error("offline"))).toBe(false);
    expect(isAttendanceWindowClosed(null)).toBe(false);
    expect(isAttendanceWindowClosed(undefined)).toBe(false);
  });
});

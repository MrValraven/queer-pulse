import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  isAttendanceWindowClosed,
  isCardUnreadable,
  isCheckInMaybe,
  isCheckInWaitlisted,
  isMemberNotFound,
  isNotOnGuestList,
} from "./checkInError";

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

/**
 * Round 3's other five refusals. Each is coded the same way the window-closed
 * refusal above is, so these pin the same two things down per code: the right
 * code on the right status is recognised, and a code or status swap is not.
 */
const coded = (statusCode: number, code: string, message: string) => ({
  statusCode,
  error: statusCode === 400 ? "Bad Request" : "Not Found",
  code,
  message,
});

describe("isCardUnreadable", () => {
  it("recognises the typed 400 refusal", () => {
    const error = new ApiError(
      400,
      "That card could not be read.",
      coded(400, "CHECK_IN_CARD_UNREADABLE", "That card could not be read."),
    );
    expect(isCardUnreadable(error)).toBe(true);
  });

  it("ignores a 400 carrying some other code", () => {
    const error = new ApiError(
      400,
      "On the waitlist",
      coded(400, "CHECK_IN_WAITLISTED", "On the waitlist"),
    );
    expect(isCardUnreadable(error)).toBe(false);
  });

  it("ignores the same code on the wrong status", () => {
    const error = new ApiError(
      404,
      "Not used at this status",
      coded(404, "CHECK_IN_CARD_UNREADABLE", "Not used at this status"),
    );
    expect(isCardUnreadable(error)).toBe(false);
  });

  it("ignores a 400 with no code at all", () => {
    expect(isCardUnreadable(new ApiError(400, "Bad request"))).toBe(false);
  });
});

describe("isCheckInWaitlisted", () => {
  it("recognises the typed 400 refusal", () => {
    const error = new ApiError(
      400,
      "That member is on the waitlist. Promote them first, then check them in.",
      coded(
        400,
        "CHECK_IN_WAITLISTED",
        "That member is on the waitlist. Promote them first, then check them in.",
      ),
    );
    expect(isCheckInWaitlisted(error)).toBe(true);
  });

  it("ignores a differently coded 400", () => {
    const error = new ApiError(
      400,
      "That member answered maybe and has no seat yet",
      coded(
        400,
        "CHECK_IN_MAYBE",
        "That member answered maybe and has no seat yet",
      ),
    );
    expect(isCheckInWaitlisted(error)).toBe(false);
  });

  it("ignores the same code on the wrong status", () => {
    const error = new ApiError(
      404,
      "Not used at this status",
      coded(404, "CHECK_IN_WAITLISTED", "Not used at this status"),
    );
    expect(isCheckInWaitlisted(error)).toBe(false);
  });
});

describe("isCheckInMaybe", () => {
  it("recognises the typed 400 refusal", () => {
    const error = new ApiError(
      400,
      "That member answered maybe and has no seat yet",
      coded(
        400,
        "CHECK_IN_MAYBE",
        "That member answered maybe and has no seat yet",
      ),
    );
    expect(isCheckInMaybe(error)).toBe(true);
  });

  it("ignores a differently coded 400", () => {
    const error = new ApiError(
      400,
      "That member is on the waitlist. Promote them first, then check them in.",
      coded(
        400,
        "CHECK_IN_WAITLISTED",
        "That member is on the waitlist. Promote them first, then check them in.",
      ),
    );
    expect(isCheckInMaybe(error)).toBe(false);
  });
});

describe("isNotOnGuestList", () => {
  it("recognises the typed 404 refusal", () => {
    const error = new ApiError(
      404,
      "That member is not on the guest list",
      coded(
        404,
        "CHECK_IN_NOT_ON_GUEST_LIST",
        "That member is not on the guest list",
      ),
    );
    expect(isNotOnGuestList(error)).toBe(true);
  });

  it("ignores the same code on the wrong status", () => {
    const error = new ApiError(
      400,
      "Not used at this status",
      coded(400, "CHECK_IN_NOT_ON_GUEST_LIST", "Not used at this status"),
    );
    expect(isNotOnGuestList(error)).toBe(false);
  });

  it("ignores a differently coded 404", () => {
    const error = new ApiError(
      404,
      "Member not found",
      coded(404, "CHECK_IN_MEMBER_NOT_FOUND", "Member not found"),
    );
    expect(isNotOnGuestList(error)).toBe(false);
  });
});

describe("isMemberNotFound", () => {
  it("recognises the typed 404 refusal", () => {
    const error = new ApiError(
      404,
      "Member not found",
      coded(404, "CHECK_IN_MEMBER_NOT_FOUND", "Member not found"),
    );
    expect(isMemberNotFound(error)).toBe(true);
  });

  it("ignores a differently coded 404", () => {
    const error = new ApiError(
      404,
      "That member is not on the guest list",
      coded(
        404,
        "CHECK_IN_NOT_ON_GUEST_LIST",
        "That member is not on the guest list",
      ),
    );
    expect(isMemberNotFound(error)).toBe(false);
  });

  it("ignores a 404 with no code at all", () => {
    expect(isMemberNotFound(new ApiError(404, "Not found"))).toBe(false);
  });

  it("ignores other statuses and non-API failures", () => {
    expect(
      isMemberNotFound(
        new ApiError(
          500,
          "boom",
          coded(500, "CHECK_IN_MEMBER_NOT_FOUND", "boom"),
        ),
      ),
    ).toBe(false);
    expect(isMemberNotFound(new Error("offline"))).toBe(false);
    expect(isMemberNotFound(null)).toBe(false);
    expect(isMemberNotFound(undefined)).toBe(false);
  });
});

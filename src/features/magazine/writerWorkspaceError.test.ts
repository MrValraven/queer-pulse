import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { writerWorkspaceErrorCopy } from "./writerWorkspaceError";
import {
  codedRefusal,
  expectKeyInBothCatalogs,
  INACTIVE_MEMBER_REFUSAL,
  NO_ANSWER,
  PLATFORM_LOCKED_REFUSAL,
  RESTRICTED_REFUSAL,
  uncodedRefusal,
} from "./magazineErrorTestSupport";

const PAGE = "magazine:writer.page.error";

describe("writerWorkspaceErrorCopy: the one coded refusal a read can get", () => {
  it("shows the maintenance line for the platform lock", () => {
    expect(writerWorkspaceErrorCopy(PLATFORM_LOCKED_REFUSAL)).toEqual({
      key: `${PAGE}.maintenance`,
    });
    expectKeyInBothCatalogs(`${PAGE}.maintenance`);
  });

  it("names the lock by its code even when the admin rewrote the message", () => {
    expect(
      writerWorkspaceErrorCopy(
        codedRefusal(503, "PLATFORM_LOCKED", "Back after the party"),
      ),
    ).toEqual({ key: `${PAGE}.maintenance` });
  });

  it("shows the fault line for a 503 without the lock code", () => {
    expect(
      writerWorkspaceErrorCopy(uncodedRefusal(503, "Service Unavailable")),
    ).toEqual({ key: `${PAGE}.serverFault` });
  });
});

describe("writerWorkspaceErrorCopy: a code this page does not know", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [403, `${PAGE}.notWriter`],
    [404, `${PAGE}.notOpen`],
    [409, "shared:apiError.reasonConflict"],
    [500, `${PAGE}.serverFault`],
  ])("falls back to the line for status %i", (status, key) => {
    expect(
      writerWorkspaceErrorCopy(codedRefusal(status, "MAGAZINE_SOMETHING_NEW")),
    ).toEqual({ key });
  });
});

describe("writerWorkspaceErrorCopy: causes outside the magazine module", () => {
  it("names the lost connection when no answer came", () => {
    expect(writerWorkspaceErrorCopy(NO_ANSWER)).toEqual({
      key: `${PAGE}.noConnection`,
    });
  });

  it("names a moderation restriction", () => {
    expect(writerWorkspaceErrorCopy(RESTRICTED_REFUSAL)).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("tells an inactive membership apart from a missing writer role", () => {
    expect(writerWorkspaceErrorCopy(INACTIVE_MEMBER_REFUSAL)).toEqual({
      key: `${PAGE}.notActive`,
    });
    expect(
      writerWorkspaceErrorCopy(codedRefusal(403, "ACTIVE_MEMBERSHIP_REQUIRED")),
    ).toEqual({ key: `${PAGE}.notActive` });
    // `StaffRolesGuard` returning false: Nest's default sentence, no code.
    expect(
      writerWorkspaceErrorCopy(uncodedRefusal(403, "Forbidden resource")),
    ).toEqual({ key: `${PAGE}.notWriter` });
  });

  it("reads the guard sentence without its code as the writer-role line", () => {
    expect(
      writerWorkspaceErrorCopy(
        uncodedRefusal(403, "Active membership required"),
      ),
    ).toEqual({ key: `${PAGE}.notWriter` });
    expect(
      writerWorkspaceErrorCopy(uncodedRefusal(403, "Active membership needed")),
    ).toEqual({ key: `${PAGE}.notWriter` });
  });
});

describe("writerWorkspaceErrorCopy: one line per status", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [401, `${PAGE}.signedOut`],
    [403, `${PAGE}.notWriter`],
    [404, `${PAGE}.notOpen`],
    [408, `${PAGE}.timedOut`],
    [409, "shared:apiError.reasonConflict"],
    [410, "shared:apiError.reasonGone"],
    [413, "shared:apiError.reasonTooLarge"],
    [422, `${PAGE}.unreadable`],
    [429, "shared:apiError.reasonRateLimited"],
    [500, `${PAGE}.serverFault`],
    [502, `${PAGE}.serverFault`],
    [503, `${PAGE}.serverFault`],
    [504, `${PAGE}.serverFault`],
  ])("maps an uncoded %i to %s", (status, key) => {
    expect(writerWorkspaceErrorCopy(new ApiError(status, "x"))).toEqual({
      key,
    });
    expectKeyInBothCatalogs(key);
  });

  it("names the status in the refused line for any other status", () => {
    const copy = writerWorkspaceErrorCopy(new ApiError(418, "x"));
    expect(copy).toEqual({ key: `${PAGE}.refused`, values: { status: 418 } });
    expectKeyInBothCatalogs(copy.key);
  });

  it("has every remaining line in both catalogs", () => {
    for (const key of [
      `${PAGE}.noConnection`,
      `${PAGE}.notActive`,
      "shared:apiError.accountRestricted",
    ]) {
      expectKeyInBothCatalogs(key);
    }
  });
});

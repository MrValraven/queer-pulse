import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { writerApplicationErrorCopy } from "./writerApplicationError";
import {
  BODY_TOO_LARGE_REFUSAL,
  CSRF_REFUSAL,
  codedRefusal,
  expectKeyInBothCatalogs,
  fieldCheckRefusal,
  INACTIVE_MEMBER_REFUSAL,
  LEGACY_BODY_TOO_LARGE_REFUSAL,
  LEGACY_CSRF_REFUSAL,
  NO_ANSWER,
  PLATFORM_LOCKED_REFUSAL,
  RESTRICTED_REFUSAL,
  uncodedRefusal,
} from "./magazineErrorTestSupport";

const FORM = "magazine:applyToWrite.form";

describe("writerApplicationErrorCopy: one line per backend code", () => {
  it.each([
    [400, "WRITER_APPLICATION_SAMPLE_REQUIRED", `${FORM}.sampleRequiredError`],
    [
      400,
      "WRITER_APPLICATION_SAMPLE_LINK_INVALID",
      `${FORM}.error.linkInvalid`,
    ],
    [
      400,
      "WRITER_APPLICATION_SAMPLE_LINK_TOO_LONG",
      `${FORM}.error.linkTooLong`,
    ],
    [
      400,
      "WRITER_APPLICATION_SAMPLE_TEXT_TOO_LONG",
      `${FORM}.error.sampleTooLong`,
    ],
    [
      400,
      "WRITER_APPLICATION_PITCH_NOTE_TOO_LONG",
      `${FORM}.error.pitchTooLong`,
    ],
    [409, "WRITER_APPLICATION_ALREADY_WRITER", `${FORM}.error.alreadyWriter`],
    [409, "WRITER_APPLICATION_ALREADY_PENDING", `${FORM}.error.alreadyPending`],
    [503, "PLATFORM_LOCKED", `${FORM}.error.maintenance`],
  ])("maps a %i with code %s to %s", (status, code, key) => {
    expect(writerApplicationErrorCopy(codedRefusal(status, code))).toEqual({
      key,
    });
    expectKeyInBothCatalogs(key);
  });

  it("maps a field-check 400 by its code", () => {
    expect(
      writerApplicationErrorCopy(
        fieldCheckRefusal(["WRITER_APPLICATION_SAMPLE_LINK_INVALID"]),
      ),
    ).toEqual({ key: `${FORM}.error.linkInvalid` });
  });
});

describe("writerApplicationErrorCopy: the code wins over the English sentence", () => {
  it("still names the cause when the backend rewords its sentence", () => {
    expect(
      writerApplicationErrorCopy(
        codedRefusal(
          409,
          "WRITER_APPLICATION_ALREADY_PENDING",
          "Hold on, there is one in the queue",
        ),
      ),
    ).toEqual({ key: `${FORM}.error.alreadyPending` });
  });

  it("never reads the old English sentences when no code came with them", () => {
    expect(
      writerApplicationErrorCopy(
        uncodedRefusal(400, "Include a writing sample: paste text or a link"),
      ),
    ).toEqual({ key: "shared:apiError.reasonInvalid" });
    expect(
      writerApplicationErrorCopy(
        uncodedRefusal(409, "You are already a magazine writer"),
      ),
    ).toEqual({ key: "shared:apiError.reasonConflict" });
  });

  it("reads the code even when it disagrees with the sentence", () => {
    expect(
      writerApplicationErrorCopy(
        codedRefusal(
          400,
          "WRITER_APPLICATION_PITCH_NOTE_TOO_LONG",
          "sampleText must be shorter than or equal to 20000 characters",
        ),
      ),
    ).toEqual({ key: `${FORM}.error.pitchTooLong` });
  });
});

describe("writerApplicationErrorCopy: several failed field checks", () => {
  it("names the first code in `codes` that has a line", () => {
    expect(
      writerApplicationErrorCopy(
        fieldCheckRefusal([
          "WRITER_APPLICATION_PITCH_NOTE_TOO_LONG",
          "WRITER_APPLICATION_SAMPLE_TEXT_TOO_LONG",
        ]),
      ),
    ).toEqual({ key: `${FORM}.error.pitchTooLong` });
    expect(
      writerApplicationErrorCopy(
        fieldCheckRefusal([
          "WRITER_APPLICATION_SAMPLE_TEXT_TOO_LONG",
          "WRITER_APPLICATION_PITCH_NOTE_TOO_LONG",
        ]),
      ),
    ).toEqual({ key: `${FORM}.error.sampleTooLong` });
  });

  it("skips a code with no line of its own and names the next one", () => {
    expect(
      writerApplicationErrorCopy(
        fieldCheckRefusal([
          "MAGAZINE_FIELD_NOT_TEXT",
          "WRITER_APPLICATION_SAMPLE_LINK_TOO_LONG",
        ]),
      ),
    ).toEqual({ key: `${FORM}.error.linkTooLong` });
  });

  it("falls back to the 400 line when no code in `codes` has a line", () => {
    expect(
      writerApplicationErrorCopy(
        fieldCheckRefusal(["MAGAZINE_FIELD_NOT_TEXT"]),
      ),
    ).toEqual({ key: "shared:apiError.reasonInvalid" });
  });
});

describe("writerApplicationErrorCopy: a code this form does not know", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [404, `${FORM}.error.notOpen`],
    [409, "shared:apiError.reasonConflict"],
    [500, `${FORM}.error.serverFault`],
  ])("falls back to the line for status %i", (status, key) => {
    expect(
      writerApplicationErrorCopy(
        codedRefusal(status, "WRITER_APPLICATION_SOMETHING_NEW"),
      ),
    ).toEqual({ key });
  });
});

describe("writerApplicationErrorCopy: causes outside the magazine module", () => {
  it("names the lost connection when no answer came", () => {
    expect(writerApplicationErrorCopy(NO_ANSWER)).toEqual({
      key: `${FORM}.error.noConnection`,
    });
    expect(writerApplicationErrorCopy(new Error("boom"))).toEqual({
      key: `${FORM}.error.noConnection`,
    });
  });

  it("names a moderation restriction", () => {
    expect(writerApplicationErrorCopy(RESTRICTED_REFUSAL)).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("names an inactive membership by its code", () => {
    expect(writerApplicationErrorCopy(INACTIVE_MEMBER_REFUSAL)).toEqual({
      key: `${FORM}.error.notActive`,
    });
    expect(
      writerApplicationErrorCopy(
        codedRefusal(403, "ACTIVE_MEMBERSHIP_REQUIRED"),
      ),
    ).toEqual({ key: `${FORM}.error.notActive` });
  });

  it("reads a CSRF 403 that survived the retry as the security check", () => {
    expect(writerApplicationErrorCopy(CSRF_REFUSAL)).toEqual({
      key: `${FORM}.error.securityCheck`,
    });
  });

  it("keeps the security check for a CSRF 403 from a backend without the code", () => {
    expect(writerApplicationErrorCopy(LEGACY_CSRF_REFUSAL)).toEqual({
      key: `${FORM}.error.securityCheck`,
    });
    expect(
      writerApplicationErrorCopy(
        uncodedRefusal(403, "Cross-site request rejected"),
      ),
    ).toEqual({ key: `${FORM}.error.securityCheck` });
  });

  it("does not read the bare guard sentence as an inactive membership", () => {
    expect(
      writerApplicationErrorCopy(
        uncodedRefusal(403, "Active membership required"),
      ),
    ).toEqual({ key: `${FORM}.error.securityCheck` });
  });

  it("names the pasted sample for the body-limit 413, with no character count", () => {
    expect(writerApplicationErrorCopy(BODY_TOO_LARGE_REFUSAL)).toEqual({
      key: `${FORM}.error.sampleTooLarge`,
    });
    expect(writerApplicationErrorCopy(LEGACY_BODY_TOO_LARGE_REFUSAL)).toEqual({
      key: `${FORM}.error.sampleTooLarge`,
    });
  });

  it("shows the maintenance line for the platform lock, and the fault line for any other 503", () => {
    expect(writerApplicationErrorCopy(PLATFORM_LOCKED_REFUSAL)).toEqual({
      key: `${FORM}.error.maintenance`,
    });
    expect(
      writerApplicationErrorCopy(uncodedRefusal(503, "Service Unavailable")),
    ).toEqual({ key: `${FORM}.error.serverFault` });
  });
});

describe("writerApplicationErrorCopy: one line per status", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [401, `${FORM}.error.signedOut`],
    [403, `${FORM}.error.securityCheck`],
    [404, `${FORM}.error.notOpen`],
    [408, `${FORM}.error.timedOut`],
    [409, "shared:apiError.reasonConflict"],
    [410, "shared:apiError.reasonGone"],
    [413, `${FORM}.error.sampleTooLarge`],
    [422, "shared:apiError.reasonInvalid"],
    [429, "shared:apiError.reasonRateLimited"],
    [500, `${FORM}.error.serverFault`],
    [502, `${FORM}.error.serverFault`],
    [503, `${FORM}.error.serverFault`],
    [504, `${FORM}.error.serverFault`],
  ])("maps an uncoded %i to %s", (status, key) => {
    expect(writerApplicationErrorCopy(new ApiError(status, "x"))).toEqual({
      key,
    });
    expectKeyInBothCatalogs(key);
  });

  it("names the status in the refused line for any other status", () => {
    const copy = writerApplicationErrorCopy(new ApiError(418, "x"));
    expect(copy).toEqual({
      key: `${FORM}.error.refused`,
      values: { status: 418 },
    });
    expectKeyInBothCatalogs(copy.key);
  });

  it("has every remaining line in both catalogs", () => {
    for (const key of [
      `${FORM}.error.noConnection`,
      `${FORM}.error.notActive`,
      "shared:apiError.accountRestricted",
    ]) {
      expectKeyInBothCatalogs(key);
    }
  });
});

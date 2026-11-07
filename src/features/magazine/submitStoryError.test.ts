import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { submitStoryErrorCopy } from "./submitStoryError";
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
  UPLOAD_NOT_YOURS_REFUSAL,
} from "./magazineErrorTestSupport";

const EDITOR = "magazine:submitStory.editor";

describe("submitStoryErrorCopy: one line per backend code", () => {
  it.each([
    ["STORY_SUBMISSION_FORMAT_REQUIRED", `${EDITOR}.chooseSectionError`],
    ["STORY_SUBMISSION_FORMAT_TOO_LONG", `${EDITOR}.error.sectionInvalid`],
    ["STORY_SUBMISSION_WORKING_TITLE_REQUIRED", `${EDITOR}.needHeadlineError`],
    [
      "STORY_SUBMISSION_WORKING_TITLE_TOO_LONG",
      `${EDITOR}.error.headlineTooLong`,
    ],
    ["STORY_SUBMISSION_PITCH_REQUIRED", `${EDITOR}.error.summaryRequired`],
    ["STORY_SUBMISSION_PITCH_TOO_LONG", `${EDITOR}.error.deckTooLong`],
    ["STORY_SUBMISSION_DECK_TOO_LONG", `${EDITOR}.error.deckTooLong`],
    ["STORY_SUBMISSION_BODY_TOO_LONG", `${EDITOR}.error.bodyTooLong`],
    ["STORY_SUBMISSION_COVER_INVALID", `${EDITOR}.error.coverInvalid`],
  ])("maps a field-check 400 with %s to %s", (code, key) => {
    expect(submitStoryErrorCopy(fieldCheckRefusal([code]))).toEqual({ key });
    expectKeyInBothCatalogs(key);
  });

  it("shows the maintenance line for the platform lock", () => {
    expect(submitStoryErrorCopy(PLATFORM_LOCKED_REFUSAL)).toEqual({
      key: `${EDITOR}.error.maintenance`,
    });
    expectKeyInBothCatalogs(`${EDITOR}.error.maintenance`);
  });

  it("shows the fault line for a 503 without the lock code", () => {
    expect(
      submitStoryErrorCopy(uncodedRefusal(503, "Service Unavailable")),
    ).toEqual({ key: `${EDITOR}.error.serverFault` });
  });
});

describe("submitStoryErrorCopy: the code wins over the English sentence", () => {
  it("still names the cause when the backend rewords its sentence", () => {
    expect(
      submitStoryErrorCopy(
        codedRefusal(
          400,
          "STORY_SUBMISSION_DECK_TOO_LONG",
          "Standfirst: too wordy",
        ),
      ),
    ).toEqual({ key: `${EDITOR}.error.deckTooLong` });
  });

  it("never reads the old English sentences when no code came with them", () => {
    expect(
      submitStoryErrorCopy(
        uncodedRefusal(
          400,
          "workingTitle must be shorter than or equal to 200 characters",
        ),
      ),
    ).toEqual({ key: "shared:apiError.reasonInvalid" });
  });

  it("names a coded 403 by its code, whatever its sentence says", () => {
    expect(
      submitStoryErrorCopy(
        codedRefusal(
          403,
          "PLATFORM_LOCKED",
          "Referenced upload does not belong to you",
        ),
      ),
    ).toEqual({ key: `${EDITOR}.error.maintenance` });
  });
});

describe("submitStoryErrorCopy: several failed field checks", () => {
  it("names the first code in `codes` that has a line", () => {
    expect(
      submitStoryErrorCopy(
        fieldCheckRefusal([
          "STORY_SUBMISSION_WORKING_TITLE_TOO_LONG",
          "STORY_SUBMISSION_BODY_TOO_LONG",
        ]),
      ),
    ).toEqual({ key: `${EDITOR}.error.headlineTooLong` });
  });

  it("reads a standfirst past 5,000 characters as the standfirst line", () => {
    // `pitch` is the standfirst, so both checks fail, pitch first.
    expect(
      submitStoryErrorCopy(
        fieldCheckRefusal([
          "STORY_SUBMISSION_PITCH_TOO_LONG",
          "STORY_SUBMISSION_DECK_TOO_LONG",
        ]),
      ),
    ).toEqual({ key: `${EDITOR}.error.deckTooLong` });
  });

  it("skips a code with no line of its own and names the next one", () => {
    expect(
      submitStoryErrorCopy(
        fieldCheckRefusal([
          "MAGAZINE_FIELD_NOT_TEXT",
          "STORY_SUBMISSION_COVER_INVALID",
        ]),
      ),
    ).toEqual({ key: `${EDITOR}.error.coverInvalid` });
  });

  it("falls back to the 400 line when no code in `codes` has a line", () => {
    expect(
      submitStoryErrorCopy(fieldCheckRefusal(["MAGAZINE_FIELD_NOT_TEXT"])),
    ).toEqual({ key: "shared:apiError.reasonInvalid" });
  });
});

describe("submitStoryErrorCopy: a code this form does not know", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    // The withdraw route's codes cannot reach this form; if one did, the
    // status line answers.
    [404, `${EDITOR}.error.notOpen`],
    [409, "shared:apiError.reasonConflict"],
    [500, `${EDITOR}.error.serverFault`],
  ])("falls back to the line for status %i", (status, key) => {
    expect(
      submitStoryErrorCopy(
        codedRefusal(status, "STORY_SUBMISSION_SOMETHING_NEW"),
      ),
    ).toEqual({ key });
  });

  it("reads STORY_SUBMISSION_ALREADY_ANSWERED by its status", () => {
    expect(
      submitStoryErrorCopy(
        codedRefusal(409, "STORY_SUBMISSION_ALREADY_ANSWERED"),
      ),
    ).toEqual({ key: "shared:apiError.reasonConflict" });
  });
});

describe("submitStoryErrorCopy: causes outside the magazine module", () => {
  it("names the lost connection when no answer came", () => {
    expect(submitStoryErrorCopy(NO_ANSWER)).toEqual({
      key: `${EDITOR}.error.noConnection`,
    });
  });

  it("names a moderation restriction", () => {
    expect(submitStoryErrorCopy(RESTRICTED_REFUSAL)).toEqual({
      key: "shared:apiError.accountRestricted",
    });
  });

  it("names an inactive membership", () => {
    expect(submitStoryErrorCopy(INACTIVE_MEMBER_REFUSAL)).toEqual({
      key: `${EDITOR}.error.notActive`,
    });
  });

  it("names a cover uploaded from another account, by the UPLOAD_NOT_YOURS code", () => {
    expect(submitStoryErrorCopy(UPLOAD_NOT_YOURS_REFUSAL)).toEqual({
      key: `${EDITOR}.error.coverNotYours`,
    });
  });

  it("no longer reads the interceptor's sentence without its code", () => {
    // An older backend sends the sentence with no code: it reads as the 403 line.
    expect(
      submitStoryErrorCopy(
        uncodedRefusal(403, "Referenced upload does not belong to you"),
      ),
    ).toEqual({ key: `${EDITOR}.error.securityCheck` });
  });

  it("reads a CSRF 403 that survived the retry as the security check", () => {
    expect(submitStoryErrorCopy(CSRF_REFUSAL)).toEqual({
      key: `${EDITOR}.error.securityCheck`,
    });
  });

  it("keeps the security check for a CSRF 403 from a backend without the code", () => {
    expect(submitStoryErrorCopy(LEGACY_CSRF_REFUSAL)).toEqual({
      key: `${EDITOR}.error.securityCheck`,
    });
  });

  it("names the story body for the body-limit 413, coded or not", () => {
    expect(submitStoryErrorCopy(BODY_TOO_LARGE_REFUSAL)).toEqual({
      key: `${EDITOR}.error.bodyTooLarge`,
    });
    expect(submitStoryErrorCopy(LEGACY_BODY_TOO_LARGE_REFUSAL)).toEqual({
      key: `${EDITOR}.error.bodyTooLarge`,
    });
  });
});

describe("submitStoryErrorCopy: one line per status", () => {
  it.each([
    [400, "shared:apiError.reasonInvalid"],
    [401, `${EDITOR}.error.signedOut`],
    [403, `${EDITOR}.error.securityCheck`],
    [404, `${EDITOR}.error.notOpen`],
    [408, `${EDITOR}.error.timedOut`],
    [409, "shared:apiError.reasonConflict"],
    [410, "shared:apiError.reasonGone"],
    [413, `${EDITOR}.error.bodyTooLarge`],
    [422, "shared:apiError.reasonInvalid"],
    [429, "shared:apiError.reasonRateLimited"],
    [500, `${EDITOR}.error.serverFault`],
    [502, `${EDITOR}.error.serverFault`],
    [503, `${EDITOR}.error.serverFault`],
    [504, `${EDITOR}.error.serverFault`],
  ])("maps an uncoded %i to %s", (status, key) => {
    expect(submitStoryErrorCopy(new ApiError(status, "x"))).toEqual({ key });
    expectKeyInBothCatalogs(key);
  });

  it("names the status in the refused line for any other status", () => {
    const copy = submitStoryErrorCopy(new ApiError(418, "x"));
    expect(copy).toEqual({
      key: `${EDITOR}.error.refused`,
      values: { status: 418 },
    });
    expectKeyInBothCatalogs(copy.key);
  });

  it("has every remaining line in both catalogs", () => {
    for (const key of [
      `${EDITOR}.error.noConnection`,
      `${EDITOR}.error.notActive`,
      `${EDITOR}.error.coverNotYours`,
      "shared:apiError.accountRestricted",
    ]) {
      expectKeyInBothCatalogs(key);
    }
  });
});

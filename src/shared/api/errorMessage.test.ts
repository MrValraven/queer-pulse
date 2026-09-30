import { afterEach, describe, expect, it } from "vitest";
import { ApiError } from "./client";
import {
  describeError,
  isAccountRestricted,
  isInviteBlocked,
  reasonFor,
  setErrorReasonLocale,
} from "./errorMessage";

describe("reasonFor", () => {
  it("returns null for auth-owned and empty-state statuses", () => {
    expect(reasonFor(new ApiError(401, "Not authenticated"))).toBeNull();
    expect(reasonFor(new ApiError(404, "Not Found"))).toBeNull();
  });

  it("returns null for a PLATFORM_LOCKED 503", () => {
    expect(
      reasonFor(new ApiError(503, "Locked", { code: "PLATFORM_LOCKED" })),
    ).toBeNull();
  });

  it("returns null for a SUBPROFILE_INVITE_BLOCKED code (M7, fix round 1)", () => {
    // ENG-450: the invite flow shows its own translated copy for this code
    // (`InviteCoOwnerModal`, `PersonaInvitesBanner`), so the raw backend
    // string must never surface through the generic path.
    expect(
      reasonFor(
        new ApiError(400, "This invite is no longer available.", {
          code: "SUBPROFILE_INVITE_BLOCKED",
        }),
      ),
    ).toBeNull();
  });

  it("returns the server message for an ACCOUNT_RESTRICTED 403 (ENG-448)", () => {
    // Most callers show this reason as-is: it names the appeal on the
    // backend's own terms. A caller that wants the translated
    // `shared:apiError.accountRestricted` copy instead checks
    // `isAccountRestricted` before calling `reasonFor`.
    expect(
      reasonFor(
        new ApiError(403, "Your account is restricted. Appeal at /appeal.", {
          code: "ACCOUNT_RESTRICTED",
        }),
      ),
    ).toBe("Your account is restricted. Appeal at /appeal.");
  });

  it("never leaks 5xx internals", () => {
    expect(
      reasonFor(new ApiError(500, "Cannot read property x of undefined")),
    ).toBeNull();
    expect(reasonFor(new ApiError(502, "Bad Gateway"))).toBeNull();
  });

  it("surfaces a real 4xx reason", () => {
    expect(reasonFor(new ApiError(409, "That name is taken"))).toBe(
      "That name is taken",
    );
    expect(reasonFor(new ApiError(422, "Bio is too long"))).toBe(
      "Bio is too long",
    );
    expect(
      reasonFor(new ApiError(403, "You are blocked from this community")),
    ).toBe("You are blocked from this community");
  });

  it("suppresses a bare HTTP status word as no reason", () => {
    expect(reasonFor(new ApiError(400, "Bad Request"))).toBeNull();
    expect(reasonFor(new ApiError(403, "Forbidden"))).toBeNull();
    expect(reasonFor(new ApiError(409, "Conflict"))).toBeNull();
    expect(reasonFor(new ApiError(422, "Unprocessable Entity"))).toBeNull();
  });

  it("returns null for every non-ApiError input (only ApiError carries a shown reason)", () => {
    expect(reasonFor(new Error("The upload was too large"))).toBeNull();
    expect(reasonFor(new TypeError("Failed to fetch"))).toBeNull();
    expect(reasonFor(new SyntaxError("Unexpected token '<'"))).toBeNull();
    expect(reasonFor(new Error("Conflict"))).toBeNull();
    expect(reasonFor(new Error(""))).toBeNull();
    expect(reasonFor("just a string")).toBeNull();
    expect(reasonFor(null)).toBeNull();
    expect(reasonFor(undefined)).toBeNull();
  });
});

describe("describeError", () => {
  it("frames the reason when there is one", () => {
    expect(
      describeError(
        "Couldn't save that co-op",
        new ApiError(409, "That name is taken"),
      ),
    ).toBe(
      // The reason's own casing is preserved verbatim (only a single trailing
      // period is trimmed): `describeError` never lower-cases the first letter.
      "Couldn't save that co-op: That name is taken.",
    );
  });

  it("trims a single trailing period on the reason", () => {
    expect(
      describeError("Couldn't save", new ApiError(422, "Bio is too long.")),
    ).toBe("Couldn't save: Bio is too long.");
  });

  it("falls back to please-try-again with no reason", () => {
    expect(
      describeError(
        "Couldn't save that co-op",
        new TypeError("Failed to fetch"),
      ),
    ).toBe("Couldn't save that co-op. Please try again.");
    expect(
      describeError("Couldn't save that co-op", new ApiError(500, "boom")),
    ).toBe("Couldn't save that co-op. Please try again.");
  });
});

// M7 (fix round 1). ENG-450's invite flow branches on this code to show its
// own translated copy; `reasonFor` never surfaces the raw backend message for
// it (see the `reasonFor` case above).
describe("isInviteBlocked", () => {
  it("is true for the SUBPROFILE_INVITE_BLOCKED code", () => {
    expect(
      isInviteBlocked(
        new ApiError(400, "x", { code: "SUBPROFILE_INVITE_BLOCKED" }),
      ),
    ).toBe(true);
  });

  it("is false for a different code", () => {
    expect(
      isInviteBlocked(new ApiError(400, "x", { code: "SOME_OTHER_CODE" })),
    ).toBe(false);
  });

  it("is false for an ApiError with no code", () => {
    expect(isInviteBlocked(new ApiError(400, "x"))).toBe(false);
  });

  it("is false for a non-ApiError", () => {
    expect(isInviteBlocked(new Error("SUBPROFILE_INVITE_BLOCKED"))).toBe(false);
    expect(isInviteBlocked("SUBPROFILE_INVITE_BLOCKED")).toBe(false);
    expect(isInviteBlocked(null)).toBe(false);
    expect(isInviteBlocked(undefined)).toBe(false);
  });
});

// ENG-448: callers that own their error UI branch on this code to show the
// translated restriction copy.
describe("isAccountRestricted", () => {
  it("is true for a 403 with the ACCOUNT_RESTRICTED code", () => {
    expect(
      isAccountRestricted(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toBe(true);
  });

  it("is false for a plain 403 or another code", () => {
    expect(isAccountRestricted(new ApiError(403, "Forbidden"))).toBe(false);
    expect(
      isAccountRestricted(new ApiError(403, "x", { code: "SOME_OTHER_CODE" })),
    ).toBe(false);
  });

  it("is false for the code on another status", () => {
    expect(
      isAccountRestricted(
        new ApiError(400, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toBe(false);
  });

  it("is false for a non-ApiError", () => {
    expect(isAccountRestricted(new Error("ACCOUNT_RESTRICTED"))).toBe(false);
    expect(isAccountRestricted(null)).toBe(false);
  });
});

// PRD-467: a member reading a language other than English gets a translated
// reason chosen by status, where English shows the backend's sentence. The
// stub translator tags each key so the assertions name the copy it chose.
describe("reasonFor and describeError with a registered locale", () => {
  const taggedTranslate = (key: string) => `[${key}]`;

  afterEach(() => {
    setErrorReasonLocale(null);
  });

  function registerLanguage(language: string) {
    setErrorReasonLocale({
      translate: taggedTranslate,
      getLanguage: () => language,
    });
  }

  it("keeps the server sentence byte-identical in English", () => {
    registerLanguage("en");
    expect(reasonFor(new ApiError(409, "That name is taken"))).toBe(
      "That name is taken",
    );
    expect(
      reasonFor(
        new ApiError(403, "Your account is restricted. Appeal at /appeal.", {
          code: "ACCOUNT_RESTRICTED",
        }),
      ),
    ).toBe("Your account is restricted. Appeal at /appeal.");
  });

  it("picks a translated reason by status in Portuguese", () => {
    registerLanguage("pt");
    const cases: [number, string][] = [
      [400, "shared:apiError.reasonInvalid"],
      [422, "shared:apiError.reasonInvalid"],
      [403, "shared:apiError.forbidden"],
      [409, "shared:apiError.reasonConflict"],
      [410, "shared:apiError.reasonGone"],
      [413, "shared:apiError.reasonTooLarge"],
      [429, "shared:apiError.reasonRateLimited"],
      [418, "shared:apiError.generic"],
    ];
    for (const [status, key] of cases) {
      expect(reasonFor(new ApiError(status, "An English sentence"))).toBe(
        `[${key}]`,
      );
    }
  });

  it("returns the translated appeal copy for ACCOUNT_RESTRICTED in Portuguese", () => {
    registerLanguage("pt");
    expect(
      reasonFor(
        new ApiError(403, "Your account is restricted.", {
          code: "ACCOUNT_RESTRICTED",
        }),
      ),
    ).toBe("[shared:apiError.accountRestricted]");
  });

  it("keeps every null case null in Portuguese", () => {
    registerLanguage("pt");
    expect(reasonFor(new ApiError(401, "Not authenticated"))).toBeNull();
    expect(reasonFor(new ApiError(404, "Missing"))).toBeNull();
    expect(reasonFor(new ApiError(500, "boom"))).toBeNull();
    expect(reasonFor(new ApiError(409, "Conflict"))).toBeNull();
    expect(
      reasonFor(new ApiError(503, "Locked", { code: "PLATFORM_LOCKED" })),
    ).toBeNull();
    expect(
      reasonFor(
        new ApiError(400, "Gone", { code: "SUBPROFILE_INVITE_BLOCKED" }),
      ),
    ).toBeNull();
    expect(reasonFor(new TypeError("Failed to fetch"))).toBeNull();
  });

  it("translates the default retry tail once a translator is registered", () => {
    registerLanguage("pt");
    expect(describeError("Frame", new TypeError("Failed to fetch"))).toBe(
      "Frame.[shared:apiError.tryAgainTail]",
    );
    expect(
      describeError("Frame", new TypeError("Failed to fetch"), " Own tail."),
    ).toBe("Frame. Own tail.");
  });

  it("keeps the English retry tail with an English translator registered", () => {
    // A translator that returns each fallback stands in for the EN catalog,
    // so this pins the tail's English wording and its leading space.
    setErrorReasonLocale({
      translate: (_key, fallback) => fallback,
      getLanguage: () => "en",
    });
    expect(describeError("Frame", new ApiError(409, "Conflict"))).toBe(
      "Frame. Please try again.",
    );
  });
});

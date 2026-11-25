import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { QUIZSHOW_ERROR_CODES } from "../../../shared/contracts/quizshow";
import {
  isQuizshowEventMissing,
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowLoadFailureKeyOf,
  quizshowRefusalActionOf,
  quizshowRefusalKeyOf,
  QUIZSHOW_TRANSPORT_TIMEOUT_KEY,
  quizshowOpenSessionRefOf,
  quizshowProblemsOf,
  quizshowQuizChangedDetailsOf,
  quizshowSuggestedScreenNameOf,
} from "./quizshowErrors";

describe("quizshow error readers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads a coded refusal off an ApiError body", () => {
    const error = new ApiError(409, "x", {
      code: "quizshow_quiz_changed",
      updatedAt: "2026-10-19T10:00:00.000Z",
    });
    expect(quizshowErrorCodeOf(error)).toBe("quizshow_quiz_changed");
  });

  it("answers null for an uncoded error and for a code outside the list", () => {
    expect(quizshowErrorCodeOf(new Error("plain"))).toBeNull();
    expect(quizshowErrorCodeOf(new ApiError(500, "x"))).toBeNull();
    expect(
      quizshowErrorCodeOf(new ApiError(400, "x", { code: "not_a_code" })),
    ).toBeNull();
  });

  it("reads the problems off a 422", () => {
    const problems = [
      {
        code: "option_count",
        roundIndex: 0,
        questionIndex: 1,
        language: null,
      },
    ];
    const error = new ApiError(422, "x", {
      code: "quizshow_quiz_invalid",
      problems,
    });
    expect(quizshowProblemsOf(error)).toEqual(problems);
    expect(quizshowProblemsOf(new ApiError(422, "x"))).toEqual([]);
  });

  it("reads the open session off a session_already_open 409", () => {
    const error = new ApiError(409, "x", {
      code: "quizshow_session_already_open",
      sessionId: "session-1",
      joinCode: "QZ7KP4",
    });
    expect(quizshowOpenSessionRefOf(error)).toEqual({
      sessionId: "session-1",
      joinCode: "QZ7KP4",
    });
    expect(
      quizshowOpenSessionRefOf(
        new ApiError(409, "x", { code: "quizshow_results_exist" }),
      ),
    ).toBeNull();
  });

  it("maps a code to its catalog key", () => {
    expect(quizshowErrorKeyOf("quizshow_join_code_not_found")).toBe(
      "quizshow:errors.join_code_not_found",
    );
    expect(quizshowErrorKeyOf("ACCOUNT_RESTRICTED")).toBe(
      "quizshow:errors.account_restricted",
    );
    expect(quizshowErrorKeyOf(null)).toBe("quizshow:errors.generic");
  });

  it("has EN and PT copy for every error code", async () => {
    const keys = [
      ...QUIZSHOW_ERROR_CODES.map((code) => quizshowErrorKeyOf(code)),
      quizshowErrorKeyOf(null),
      "quizshow:errors.offline",
      "quizshow:errors.server_unavailable",
      "quizshow:errors.refused_unknown",
      "quizshow:errors.refused_signed_out",
      "quizshow:errors.refused_session_revoked",
      "quizshow:errors.refused_platform_locked",
      "quizshow:errors.refused_feature_hidden",
      "quizshow:errors.refused_forbidden",
      "quizshow:errors.refused_server_error",
      QUIZSHOW_TRANSPORT_TIMEOUT_KEY,
    ].map((key) => key.replace(/^quizshow:/, ""));
    for (const language of ["en", "pt"] as const) {
      const catalog = (await loadNamespace(language, "quizshow")) as Record<
        string,
        unknown
      >;
      for (const key of keys) {
        expect(typeof catalog[key], `${language} ${key}`).toBe("string");
      }
    }
  });

  it("tells a refused connection and a failed load apart", () => {
    expect(quizshowRefusalKeyOf("quizshow_join_code_not_found")).toBe(
      "quizshow:errors.join_code_not_found",
    );
    expect(quizshowRefusalKeyOf("not_a_code")).toBe(
      "quizshow:errors.refused_unknown",
    );
    expect(quizshowRefusalKeyOf(null)).toBe("quizshow:errors.refused_unknown");
    expect(quizshowLoadFailureKeyOf(new ApiError(503, "x"))).toBe(
      "quizshow:errors.server_unavailable",
    );
    expect(quizshowLoadFailureKeyOf(new TypeError("Failed to fetch"))).toBe(
      "quizshow:errors.server_unavailable",
    );
    expect(quizshowLoadFailureKeyOf(new ApiError(429, "x"))).toBe(
      "quizshow:errors.server_unavailable",
    );
    expect(quizshowLoadFailureKeyOf(new ApiError(401, "x"))).toBe(
      "quizshow:errors.signed_out",
    );
    expect(quizshowLoadFailureKeyOf(new ApiError(403, "x"))).toBe(
      "quizshow:errors.not_organiser",
    );
    expect(
      quizshowLoadFailureKeyOf(
        new ApiError(403, "x", { code: "ACCOUNT_RESTRICTED" }),
      ),
    ).toBe("shared:apiError.accountRestricted");
    expect(
      quizshowLoadFailureKeyOf(
        new ApiError(403, "x", { code: "ACTIVE_MEMBERSHIP_REQUIRED" }),
      ),
    ).toBe("shared:apiError.notActive");
    expect(quizshowLoadFailureKeyOf(new ApiError(404, "x"))).toBe(
      "quizshow:errors.generic",
    );
    expect(quizshowLoadFailureKeyOf(new Error("Network down"))).toBe(
      "quizshow:errors.server_unavailable",
    );
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    expect(quizshowLoadFailureKeyOf(new TypeError("Failed to fetch"))).toBe(
      "quizshow:errors.offline",
    );
    expect(quizshowLoadFailureKeyOf(new ApiError(503, "x"))).toBe(
      "quizshow:errors.offline",
    );
    expect(quizshowRefusalKeyOf(null)).toBe("quizshow:errors.offline");
  });

  it("names each transport refusal and the action that fits it", () => {
    const cases: Array<[string, string, string]> = [
      ["UNAUTHORIZED", "quizshow:errors.refused_signed_out", "signIn"],
      ["TOKEN_EXPIRED", "quizshow:errors.refused_signed_out", "signIn"],
      ["SESSION_REVOKED", "quizshow:errors.refused_session_revoked", "signIn"],
      [
        "PLATFORM_LOCKED",
        "quizshow:errors.refused_platform_locked",
        "enterCode",
      ],
      ["NOT_FOUND", "quizshow:errors.refused_feature_hidden", "enterCode"],
      ["FORBIDDEN", "quizshow:errors.refused_forbidden", "enterCode"],
      ["SERVER_ERROR", "quizshow:errors.refused_server_error", "reload"],
      ["BAD_REQUEST", "quizshow:errors.refused_unknown", "reload"],
      [
        "quizshow_session_finished",
        "quizshow:errors.session_finished",
        "enterCode",
      ],
    ];
    for (const [code, key, action] of cases) {
      expect(quizshowRefusalKeyOf(code), code).toBe(key);
      expect(quizshowRefusalActionOf(code), code).toBe(action);
    }
    expect(quizshowRefusalActionOf(null)).toBe("reload");
    expect(quizshowRefusalKeyOf("constructor")).toBe(
      "quizshow:errors.refused_unknown",
    );
  });

  it("says offline for a server fault on an offline device, and keeps a lapsed sign-in named", () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    expect(quizshowRefusalKeyOf("SERVER_ERROR")).toBe(
      "quizshow:errors.offline",
    );
    expect(quizshowRefusalKeyOf("UNAUTHORIZED")).toBe(
      "quizshow:errors.refused_signed_out",
    );
  });

  it("reads only a plain 4xx refusal as a missing event", () => {
    expect(isQuizshowEventMissing(new ApiError(404, "x"))).toBe(true);
    for (const status of [401, 403, 408, 429, 500, 503]) {
      expect(
        isQuizshowEventMissing(new ApiError(status, "x")),
        `${status}`,
      ).toBe(false);
    }
    expect(isQuizshowEventMissing(new TypeError("Failed to fetch"))).toBe(
      false,
    );
    expect(isQuizshowEventMissing(null)).toBe(false);
  });
});

describe("quizshow conflict and screen name readers", () => {
  it("reads who saved the quiz off a quiz_changed 409", () => {
    const error = new ApiError(409, "x", {
      code: "quizshow_quiz_changed",
      updatedAt: "2026-11-20T18:30:00.000Z",
      updatedByName: "Philippine",
    });
    expect(quizshowQuizChangedDetailsOf(error)).toEqual({
      updatedAt: "2026-11-20T18:30:00.000Z",
      updatedByName: "Philippine",
    });
  });

  it("keeps a quiz_changed 409 without a name, and one on a target with no quiz", () => {
    const goneAccount = new ApiError(409, "x", {
      code: "quizshow_quiz_changed",
      updatedAt: "2026-11-20T18:30:00.000Z",
      updatedByName: null,
    });
    expect(quizshowQuizChangedDetailsOf(goneAccount)).toEqual({
      updatedAt: "2026-11-20T18:30:00.000Z",
      updatedByName: null,
    });
    const noQuiz = new ApiError(409, "x", {
      code: "quizshow_quiz_changed",
      updatedAt: null,
      updatedByName: null,
    });
    expect(quizshowQuizChangedDetailsOf(noQuiz)).toEqual({
      updatedAt: null,
      updatedByName: null,
    });
  });

  it("answers null details for a missing or malformed field and for another code", () => {
    expect(
      quizshowQuizChangedDetailsOf(
        new ApiError(409, "x", {
          code: "quizshow_quiz_changed",
          updatedAt: "2026-11-20T18:30:00.000Z",
        }),
      ),
    ).toBeNull();
    expect(
      quizshowQuizChangedDetailsOf(
        new ApiError(409, "x", {
          code: "quizshow_quiz_changed",
          updatedAt: 1_700_000_000_000,
          updatedByName: "Philippine",
        }),
      ),
    ).toBeNull();
    expect(
      quizshowQuizChangedDetailsOf(
        new ApiError(409, "x", {
          code: "quizshow_results_exist",
          updatedAt: "2026-11-20T18:30:00.000Z",
          updatedByName: "Philippine",
        }),
      ),
    ).toBeNull();
    expect(quizshowQuizChangedDetailsOf(new Error("plain"))).toBeNull();
  });

  it("reads the suggested screen name off a screen_name_taken ack only", () => {
    expect(
      quizshowSuggestedScreenNameOf({
        code: "quizshow_screen_name_taken",
        suggestedScreenName: "  Alex 2 ",
      }),
    ).toBe("Alex 2");
    expect(
      quizshowSuggestedScreenNameOf({ code: "quizshow_screen_name_taken" }),
    ).toBeNull();
    expect(
      quizshowSuggestedScreenNameOf({
        code: "quizshow_screen_name_taken",
        suggestedScreenName: "   ",
      }),
    ).toBeNull();
    expect(
      quizshowSuggestedScreenNameOf({
        code: "quizshow_joining_locked",
        suggestedScreenName: "Alex 2",
      }),
    ).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { loadNamespace } from "../../../shared/i18n/catalogs";
import { QUIZSHOW_ERROR_CODES } from "../../../shared/contracts/quizshow";
import {
  quizshowErrorCodeOf,
  quizshowErrorKeyOf,
  quizshowOpenSessionRefOf,
  quizshowProblemsOf,
} from "./quizshowErrors";

describe("quizshow error readers", () => {
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
});

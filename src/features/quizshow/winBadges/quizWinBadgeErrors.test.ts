import { beforeAll, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { causeErrorKey } from "../../../shared/api/causeErrorKey";
import { loadNamespace, loadPtNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import {
  QUIZ_REVOKED_AT_FORMAT,
  QUIZ_WIN_BADGE_REASON_STATUS,
  quizWinBadgeErrorCopy,
  quizWinBadgeErrorKeyOf,
  quizWinBadgeErrorText,
  quizWinBadgeReasonOf,
  quizWinBadgeRefusal,
} from "./quizWinBadgeErrors";

const resolvedCatalogs: Partial<Record<Language, Catalog>> = {};

beforeAll(async () => {
  resolvedCatalogs.en = await loadNamespace("en", "quizshow");
  resolvedCatalogs.pt = await loadPtNamespace("quizshow");
});

function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const hit = resolveEntry(
      resolvedCatalogs[language],
      path,
      language,
      options,
    );
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const englishFormatters = createFormatters("en");
const portugueseFormatters = createFormatters("pt");

function quizBadgeError(data: Record<string, unknown>): ApiError {
  const code = String(data.code);
  const status = Object.prototype.hasOwnProperty.call(
    QUIZ_WIN_BADGE_REASON_STATUS,
    code,
  )
    ? QUIZ_WIN_BADGE_REASON_STATUS[
        code as keyof typeof QUIZ_WIN_BADGE_REASON_STATUS
      ]
    : 400;
  return new ApiError(status, code, data);
}

describe("quizWinBadgeErrorCopy", () => {
  it.each(Object.keys(QUIZ_WIN_BADGE_REASON_STATUS))(
    "gives %s its own line",
    (code) => {
      const error = quizBadgeError({ code });
      const copy = quizWinBadgeErrorCopy(error, makeT("en"), englishFormatters);
      expect(copy.key).toBe(`quizshow:winBadges.errors.${code}`);
      expect(quizWinBadgeErrorKeyOf(error)).toBe(copy.key);
      expect(quizWinBadgeReasonOf(error)).toBe(code);
    },
  );

  it("names the field that was not text", () => {
    const text = quizWinBadgeErrorText(
      quizBadgeError({
        code: "quiz_badge_text_invalid",
        field: "description.pt",
      }),
      makeT("en"),
      englishFormatters,
    );
    expect(text).toContain("Portuguese description");
  });

  it("leaves the field empty for a field it does not know", () => {
    const copy = quizWinBadgeErrorCopy(
      quizBadgeError({ code: "quiz_badge_text_invalid", field: "mystery" }),
      makeT("en"),
      englishFormatters,
    );
    expect(copy.values?.field).toBe("");
  });

  it("names the Portuguese name in quiz_badge_name_taken", () => {
    const text = quizWinBadgeErrorText(
      quizBadgeError({ code: "quiz_badge_name_taken", language: "pt" }),
      makeT("en"),
      englishFormatters,
    );
    expect(text).toBe(
      "Another badge already uses this Portuguese name. Pick a different one.",
    );
  });

  it("names the holder count in quiz_badge_in_use with the plural form", () => {
    const one = quizWinBadgeErrorText(
      quizBadgeError({ code: "quiz_badge_in_use", holderCount: 1 }),
      makeT("en"),
      englishFormatters,
    );
    expect(one).toBe("1 member holds this badge, so it can only be archived.");
    const four = quizWinBadgeErrorText(
      quizBadgeError({ code: "quiz_badge_in_use", holderCount: 4 }),
      makeT("en"),
      englishFormatters,
    );
    expect(four).toBe("4 members hold this badge, so it can only be archived.");
  });

  it("copies the holder count through as both holderCount and count", () => {
    const copy = quizWinBadgeErrorCopy(
      quizBadgeError({ code: "quiz_badge_in_use", holderCount: 4 }),
      makeT("en"),
      englishFormatters,
    );
    expect(copy.values?.holderCount).toBe(4);
    expect(copy.values?.count).toBe(4);
  });

  it("formats revokedAt in the viewer's language", () => {
    const revokedDate = new Date(2026, 10, 20, 12, 0, 0);
    const error = quizBadgeError({
      code: "quiz_badge_winner_already_revoked",
      revokedAt: revokedDate.toISOString(),
    });
    const englishText = quizWinBadgeErrorText(
      error,
      makeT("en"),
      englishFormatters,
    );
    expect(englishText).toContain(
      englishFormatters.date(revokedDate, QUIZ_REVOKED_AT_FORMAT),
    );
    expect(englishText).toMatch(/November 20, 2026|20 November 2026/);
    const portugueseText = quizWinBadgeErrorText(
      error,
      makeT("pt"),
      portugueseFormatters,
    );
    expect(portugueseText).toContain("novembro");
  });

  it("names the slot cap with its game", () => {
    const text = quizWinBadgeErrorText(
      quizBadgeError({
        code: "quiz_badge_slot_limit_reached",
        gameNumber: 2,
        limit: 3,
      }),
      makeT("en"),
      englishFormatters,
    );
    expect(text).toBe(
      "Game 2 already gives 3 badges, the most one game can give.",
    );
  });

  it("copies maxLength through", () => {
    const copy = quizWinBadgeErrorCopy(
      quizBadgeError({
        code: "quiz_badge_name_too_long",
        language: "en",
        maxLength: 40,
      }),
      makeT("en"),
      englishFormatters,
    );
    expect(copy.values?.maxLength).toBe(40);
  });

  it("reads every code in both languages without a bare token", () => {
    const body = {
      field: "name.en",
      language: "pt",
      maxLength: 40,
      limit: 3,
      gameNumber: 2,
      holderCount: 2,
      revokedAt: new Date(2026, 10, 20, 12, 0, 0).toISOString(),
    };
    for (const code of Object.keys(QUIZ_WIN_BADGE_REASON_STATUS)) {
      const error = quizBadgeError({ code, ...body });
      expect(
        quizWinBadgeErrorText(error, makeT("en"), englishFormatters),
      ).not.toContain("{");
      expect(
        quizWinBadgeErrorText(error, makeT("pt"), portugueseFormatters),
      ).not.toContain("{");
    }
  });

  it("falls back to the shared cause line for an error with no code", () => {
    const offline = new TypeError("Failed to fetch");
    expect(quizWinBadgeErrorKeyOf(offline)).toBe(
      "shared:apiError.noConnection",
    );
    expect(
      quizWinBadgeErrorCopy(offline, makeT("en"), englishFormatters),
    ).toEqual(causeErrorKey(offline));
    const unavailable = new ApiError(404, "This feature is not available yet.");
    expect(quizWinBadgeReasonOf(unavailable)).toBeNull();
    expect(quizWinBadgeErrorKeyOf(unavailable)).toBe(
      causeErrorKey(unavailable).key,
    );
  });

  it("ignores a code that is not one of the quiz badge reasons", () => {
    const other = quizBadgeError({ code: "SOMETHING_ELSE" });
    expect(quizWinBadgeReasonOf(other)).toBeNull();
    expect(quizWinBadgeErrorKeyOf(other)).toBe(causeErrorKey(other).key);
  });
});

describe("quizWinBadgeRefusal", () => {
  it("builds a refusal with the contract status", () => {
    const refusal = quizWinBadgeRefusal("quiz_badge_in_use", {
      holderCount: 2,
    });
    expect(refusal).toBeInstanceOf(ApiError);
    expect(refusal.status).toBe(409);
    expect(refusal.data).toMatchObject({
      statusCode: 409,
      message: "quiz_badge_in_use",
      code: "quiz_badge_in_use",
      holderCount: 2,
    });
  });

  it("is read back by the same copy builder", () => {
    const refusal = quizWinBadgeRefusal("quiz_badge_in_use", {
      holderCount: 2,
    });
    expect(quizWinBadgeReasonOf(refusal)).toBe("quiz_badge_in_use");
    expect(quizWinBadgeErrorText(refusal, makeT("en"), englishFormatters)).toBe(
      "2 members hold this badge, so it can only be archived.",
    );
  });
});

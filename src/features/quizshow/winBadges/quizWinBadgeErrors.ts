import { ApiError } from "../../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
} from "../../../shared/api/causeErrorKey";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";

/**
 * Every reason code the quiz win badge routes can refuse with, and the HTTP
 * status each arrives under (contract section 8). The demo store throws the
 * same codes through `quizWinBadgeRefusal`.
 */
export const QUIZ_WIN_BADGE_REASON_STATUS = {
  quiz_badge_not_found: 404,
  quiz_badge_text_invalid: 400,
  quiz_badge_name_required: 400,
  quiz_badge_name_too_long: 400,
  quiz_badge_name_taken: 409,
  quiz_badge_description_required: 400,
  quiz_badge_description_too_long: 400,
  quiz_badge_icon_unknown: 400,
  quiz_badge_tint_unknown: 400,
  quiz_badge_rarity_unknown: 400,
  quiz_badge_archived: 409,
  quiz_badge_in_use: 409,
  quiz_badge_event_not_found: 404,
  quiz_badge_event_has_no_quiz: 409,
  quiz_badge_setup_invalid: 400,
  quiz_badge_game_number_invalid: 400,
  quiz_badge_game_limit_reached: 400,
  quiz_badge_slot_limit_reached: 400,
  quiz_badge_slot_duplicate: 400,
  quiz_badge_winner_not_found: 404,
  quiz_badge_winner_already_revoked: 409,
  quiz_badge_revoke_reason_required: 400,
  quiz_badge_revoke_reason_too_long: 400,
} as const;

export type QuizWinBadgeReasonCode = keyof typeof QUIZ_WIN_BADGE_REASON_STATUS;

/** How a revoke date reads in the "already revoked" line. */
export const QUIZ_REVOKED_AT_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

const ERROR_KEY_PREFIX = "quizshow:winBadges.errors.";
const KNOWN_FIELDS: readonly string[] = [
  "name.en",
  "name.pt",
  "description.en",
  "description.pt",
];
const KNOWN_LANGUAGES: readonly string[] = ["en", "pt"];

function isQuizWinBadgeReasonCode(
  code: unknown,
): code is QuizWinBadgeReasonCode {
  return (
    typeof code === "string" &&
    Object.prototype.hasOwnProperty.call(QUIZ_WIN_BADGE_REASON_STATUS, code)
  );
}

function bodyOf(error: unknown): Record<string, unknown> {
  return error instanceof ApiError &&
    typeof error.data === "object" &&
    error.data !== null
    ? (error.data as Record<string, unknown>)
    : {};
}

/** The quiz badge reason code on a failed call, or null when it has none. */
export function quizWinBadgeReasonOf(
  error: unknown,
): QuizWinBadgeReasonCode | null {
  const { code } = bodyOf(error);
  return isQuizWinBadgeReasonCode(code) ? code : null;
}

/** The catalog key of a failed call: its own line for a quiz badge reason, the shared cause line otherwise. */
export function quizWinBadgeErrorKeyOf(error: unknown): string {
  const code = quizWinBadgeReasonOf(error);
  return code === null
    ? causeErrorKey(error).key
    : `${ERROR_KEY_PREFIX}${code}`;
}

function valuesFor(
  body: Record<string, unknown>,
  t: TFunction,
  fmt: Formatters,
): Record<string, string | number> {
  const values: Record<string, string | number> = {};
  const { field, language, maxLength, limit, gameNumber, holderCount } = body;
  if (typeof field === "string") {
    values.field = KNOWN_FIELDS.includes(field)
      ? t(`${ERROR_KEY_PREFIX}field.${field}`)
      : "";
  }
  if (typeof language === "string") {
    values.language = KNOWN_LANGUAGES.includes(language)
      ? t(`${ERROR_KEY_PREFIX}language.${language}`)
      : "";
  }
  if (typeof maxLength === "number") values.maxLength = maxLength;
  if (typeof limit === "number") values.limit = limit;
  if (typeof gameNumber === "number") values.gameNumber = gameNumber;
  if (typeof holderCount === "number") {
    values.holderCount = holderCount;
    values.count = holderCount;
  }
  const { revokedAt } = body;
  if (typeof revokedAt === "string" || typeof revokedAt === "number") {
    const revokedDate = new Date(revokedAt);
    values.revokedAt = Number.isNaN(revokedDate.getTime())
      ? ""
      : fmt.date(revokedDate, QUIZ_REVOKED_AT_FORMAT);
  }
  return values;
}

/**
 * The cause line for a failed quiz badge call. A quiz badge reason code gets
 * its own line with the values its sentence names (field, language, limits,
 * holder count, revoke date). Any other failure keeps the shared cause line,
 * so offline, signed-out and refused calls read as everywhere else.
 */
export function quizWinBadgeErrorCopy(
  error: unknown,
  t: TFunction,
  fmt: Formatters,
): CauseErrorCopy {
  const code = quizWinBadgeReasonOf(error);
  if (code === null) return causeErrorKey(error);
  const values = valuesFor(bodyOf(error), t, fmt);
  const key = `${ERROR_KEY_PREFIX}${code}`;
  return Object.keys(values).length === 0 ? { key } : { key, values };
}

/** The ready-to-show text for a failed quiz badge call. */
export function quizWinBadgeErrorText(
  error: unknown,
  t: TFunction,
  fmt: Formatters,
): string {
  const copy = quizWinBadgeErrorCopy(error, t, fmt);
  return t(copy.key, copy.values);
}

/**
 * The refusal the demo store throws, shaped like the backend's body so the
 * same `quizWinBadgeErrorCopy` reads it in both modes.
 */
export function quizWinBadgeRefusal(
  code: QuizWinBadgeReasonCode,
  extras?: Record<string, string | number>,
): ApiError {
  const status = QUIZ_WIN_BADGE_REASON_STATUS[code];
  return new ApiError(status, code, {
    statusCode: status,
    message: code,
    code,
    ...extras,
  });
}

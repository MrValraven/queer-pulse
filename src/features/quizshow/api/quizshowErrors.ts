import { ApiError } from "../../../shared/api/client";
import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
} from "../../../shared/api/causeErrorKey";
import {
  QUIZSHOW_ERROR_CODES,
  type QuizshowErrorCode,
  type QuizshowQuizChangedDetails,
  type QuizshowQuizProblem,
} from "../../../shared/contracts/quizshow";

const KNOWN_ERROR_CODES: ReadonlySet<string> = new Set(QUIZSHOW_ERROR_CODES);

function bodyOf(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof ApiError)) return null;
  const { data } = error;
  if (typeof data !== "object" || data === null) return null;
  return data as Record<string, unknown>;
}

export function quizshowErrorCodeOf(error: unknown): QuizshowErrorCode | null {
  const code = bodyOf(error)?.code;
  if (typeof code !== "string" || !KNOWN_ERROR_CODES.has(code)) return null;
  return code as QuizshowErrorCode;
}

export function quizshowProblemsOf(error: unknown): QuizshowQuizProblem[] {
  const problems = bodyOf(error)?.problems;
  return Array.isArray(problems) ? (problems as QuizshowQuizProblem[]) : [];
}

export function quizshowOpenSessionRefOf(
  error: unknown,
): { sessionId: string; joinCode: string } | null {
  if (quizshowErrorCodeOf(error) !== "quizshow_session_already_open") {
    return null;
  }
  const body = bodyOf(error);
  const sessionId = body?.sessionId;
  const joinCode = body?.joinCode;
  if (typeof sessionId !== "string" || typeof joinCode !== "string") {
    return null;
  }
  return { sessionId, joinCode };
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/**
 * Who saved the quiz this save collided with, and when (C6.29, item 54). The
 * server puts both fields on the `quizshow_quiz_changed` 409 body; `updatedAt`
 * is null when the target has no quiz and `updatedByName` is null when the
 * account is gone. Null for any other error, or when either field is missing
 * or has the wrong type.
 */
export function quizshowQuizChangedDetailsOf(
  error: unknown,
): QuizshowQuizChangedDetails | null {
  if (quizshowErrorCodeOf(error) !== "quizshow_quiz_changed") return null;
  const body = bodyOf(error);
  const updatedAt = body?.updatedAt;
  const updatedByName = body?.updatedByName;
  if (!isNullableString(updatedAt) || !isNullableString(updatedByName)) {
    return null;
  }
  return { updatedAt, updatedByName };
}

/**
 * The free screen name a `quizshow_screen_name_taken` ack suggests, such as
 * "Alex 2" (C4.2, C6.13), trimmed. Null for any other code, and when the
 * server found no free name.
 */
export function quizshowSuggestedScreenNameOf(failure: {
  code: string;
  suggestedScreenName?: string;
}): string | null {
  if (failure.code !== "quizshow_screen_name_taken") return null;
  const suggestion = failure.suggestedScreenName?.trim() ?? "";
  return suggestion === "" ? null : suggestion;
}

export function quizshowErrorKeyOf(code: QuizshowErrorCode | null): string {
  if (code === null) return "quizshow:errors.generic";
  if (code === "ACCOUNT_RESTRICTED")
    return "quizshow:errors.account_restricted";
  return `quizshow:errors.${code.replace(/^quizshow_/, "")}`;
}

const NOT_A_MISSING_EVENT_STATUSES: ReadonlySet<number> = new Set([
  401, 403, 408, 429,
]);

/**
 * Whether the event read was answered with a plain refusal (a 4xx that is not
 * a sign-in, permission, timeout or rate-limit answer, such as a 404 for an
 * event that is gone). An offline device, a timeout, a rate limit or a server
 * fault is a load failure with its own line and does not read as a missing
 * event.
 */
export function isQuizshowEventMissing(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    !NOT_A_MISSING_EVENT_STATUSES.has(error.status)
  );
}

/** The 403 causes the shared classifier names on its own, read before a bare
 *  403 is taken to mean the member is not one of the event's hosts. */
const SHARED_FORBIDDEN_CAUSE_KEYS: ReadonlySet<string> = new Set([
  SHARED_CAUSE_KEY.accountRestricted,
  SHARED_CAUSE_KEY.notActive,
  SHARED_CAUSE_KEY.securityCheck,
]);

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/**
 * The line for a load that failed without a Pulse Live code. Only a device the
 * browser reports as offline says so. Online, a 401 says the session ended. A
 * 403 that the shared classifier names (a restricted account, an inactive
 * membership, a refused security check) keeps that shared line; any other 403
 * says only the event's hosts run these screens. A request that never
 * reached the server (a fetch TypeError), a 5xx, a timeout, a rate limit and a
 * failure whose error the caller no longer holds all say the server did not
 * answer; another 4xx answer that names no code keeps the generic line.
 */
export function quizshowLoadFailureKeyOf(error?: unknown): string {
  if (isDeviceOffline()) return "quizshow:errors.offline";
  if (error instanceof ApiError && error.status === 401)
    return "quizshow:errors.signed_out";
  if (error instanceof ApiError && error.status === 403) {
    const sharedCauseKey = causeErrorKey(error).key;
    return SHARED_FORBIDDEN_CAUSE_KEYS.has(sharedCauseKey)
      ? sharedCauseKey
      : "quizshow:errors.not_organiser";
  }
  if (
    error instanceof ApiError &&
    error.status < 500 &&
    error.status !== 408 &&
    error.status !== 429
  )
    return "quizshow:errors.generic";
  return "quizshow:errors.server_unavailable";
}

const KNOWN_CODES: ReadonlySet<string> = new Set(QUIZSHOW_ERROR_CODES);

/** The transport codes a refused connection names on its own line (contract 6.1). */
const TRANSPORT_REFUSAL_KEYS: ReadonlyMap<string, string> = new Map([
  ["UNAUTHORIZED", "quizshow:errors.refused_signed_out"],
  ["TOKEN_EXPIRED", "quizshow:errors.refused_signed_out"],
  ["SESSION_REVOKED", "quizshow:errors.refused_session_revoked"],
  ["PLATFORM_LOCKED", "quizshow:errors.refused_platform_locked"],
  // The gateway answers NOT_FOUND while Pulse Live is hidden from the account.
  ["NOT_FOUND", "quizshow:errors.refused_feature_hidden"],
  ["FORBIDDEN", "quizshow:errors.refused_forbidden"],
]);

/**
 * The line for a live connection the server refused. A code this build knows
 * gets its own line, and so does a transport code that names the cause (a
 * lapsed or revoked sign-in, a platform pause, missing access to Pulse Live). An
 * offline device says so; a server fault asks for a reload; a refusal that
 * names no known code says the session turned the connection away without a
 * reason.
 */
export function quizshowRefusalKeyOf(refusalCode: string | null): string {
  if (refusalCode !== null && KNOWN_CODES.has(refusalCode)) {
    return quizshowErrorKeyOf(refusalCode as QuizshowErrorCode);
  }
  const transportKey =
    refusalCode === null ? undefined : TRANSPORT_REFUSAL_KEYS.get(refusalCode);
  if (transportKey !== undefined) return transportKey;
  if (isDeviceOffline()) return "quizshow:errors.offline";
  if (refusalCode === "SERVER_ERROR") {
    return "quizshow:errors.refused_server_error";
  }
  return "quizshow:errors.refused_unknown";
}

/** What a refused screen offers: sign in again, reload the page, or go back to the code entry. */
export type QuizshowRefusalAction = "signIn" | "reload" | "enterCode";

const SIGN_IN_REFUSAL_CODES: ReadonlySet<string> = new Set([
  "UNAUTHORIZED",
  "TOKEN_EXPIRED",
  "SESSION_REVOKED",
]);

/**
 * The action that fits a refusal's cause: a lapsed or revoked sign-in signs
 * in again; a server fault, an offline device or a refusal with no known
 * reason reloads; every named refusal (a quiz code, a platform pause,
 * missing access) goes back to the code entry.
 */
export function quizshowRefusalActionOf(
  refusalCode: string | null,
): QuizshowRefusalAction {
  if (refusalCode !== null && SIGN_IN_REFUSAL_CODES.has(refusalCode)) {
    return "signIn";
  }
  if (refusalCode !== null && KNOWN_CODES.has(refusalCode)) return "enterCode";
  if (refusalCode !== null && TRANSPORT_REFUSAL_KEYS.has(refusalCode)) {
    return "enterCode";
  }
  return "reload";
}

/** The line for a frame whose ack never came back: the game did not answer in time. */
export const QUIZSHOW_TRANSPORT_TIMEOUT_KEY =
  "quizshow:errors.transport_timeout";

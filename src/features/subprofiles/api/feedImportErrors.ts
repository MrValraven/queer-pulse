import { ApiError } from "../../../shared/api/client";
import { isAccountRestricted } from "../../../shared/api/errorMessage";
import type { TFunction } from "../../../shared/i18n/types";
import { MAX_ITEMS_PER_SECTION } from "../subprofileEditor.data";
import { isPersonaEditConflict } from "./personaEditConflict";
import {
  MAX_FEEDS_PER_PERSONA,
  type FeedErrorCode,
} from "./subprofileFeeds.api";

/** Typed codes the feed endpoints answer with, beyond `FeedErrorCode`. */
export const FEED_ALREADY_CONNECTED_CODE = "FEED_ALREADY_CONNECTED";
export const FEED_LIMIT_CODE = "FEED_LIMIT";
export const SECTION_FULL_CODE = "SECTION_FULL";
/** A manual check inside the 5-minute cooldown (429, with `retryAfterSeconds`). */
export const SYNC_TOO_SOON_CODE = "SYNC_TOO_SOON";

const FEED_ERROR_CODES: readonly FeedErrorCode[] = [
  "unreachable",
  "timeout",
  "http_error",
  "too_large",
  "not_a_feed",
];

export function isFeedErrorCode(value: unknown): value is FeedErrorCode {
  return (
    typeof value === "string" &&
    (FEED_ERROR_CODES as readonly string[]).includes(value)
  );
}

/** The typed `code` off a refused feed call: the parsed body's `code`, else a
 *  body `message` that is itself the code (Nest's `new ConflictException(CODE)`
 *  shape). Null for a failure that carries none. */
export function feedErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data as { code?: unknown; message?: unknown } | null;
  if (typeof body?.code === "string") return body.code;
  if (typeof body?.message === "string" && /^[A-Z_]+$/.test(body.message)) {
    return body.message;
  }
  return null;
}

/** Which call was refused, for the statuses that mean different things per call. */
export type FeedErrorContext = "generic" | "preview" | "connect" | "update";

/**
 * The catalog key for what to tell the member when a feed call was refused.
 * `context` says which call it was, for the statuses that mean different
 * things per call (a 400).
 * Every failure gets plain, recoverable words in their own language, so a raw
 * backend sentence never reaches the screen.
 */
export function feedErrorMessageKey(
  error: unknown,
  context: FeedErrorContext = "generic",
): string {
  if (isAccountRestricted(error)) return "shared:apiError.accountRestricted";
  if (isPersonaEditConflict(error)) {
    return "subprofiles:feedImport.error.editConflict";
  }
  const code = feedErrorCode(error);
  if (isFeedErrorCode(code)) return `subprofiles:feedImport.error.${code}`;
  switch (code) {
    case FEED_ALREADY_CONNECTED_CODE:
      return "subprofiles:feedImport.error.alreadyConnected";
    case FEED_LIMIT_CODE:
      return "subprofiles:feedImport.error.limit";
    case SECTION_FULL_CODE:
      return "subprofiles:feedImport.error.sectionFull";
    case SYNC_TOO_SOON_CODE:
      return "subprofiles:feedImport.error.tooSoon";
    default:
      break;
  }
  // A 429 with no code is the per-member limit on feed fetches (lookups,
  // connects and checks share it).
  if (error instanceof ApiError && error.status === 429) {
    return "subprofiles:feedImport.error.rateLimited";
  }
  // A 400 means something different per call: the address did not validate
  // (lookup), the address or section was refused (connect), or the section is
  // not one this kind takes (settings). Anywhere else it stays generic.
  if (error instanceof ApiError && error.status === 400) {
    if (context === "preview")
      return "subprofiles:feedImport.error.invalidAddress";
    if (context === "connect")
      return "subprofiles:feedImport.error.connectRejected";
    if (context === "update")
      return "subprofiles:feedImport.error.sectionNotAllowed";
  }
  return "subprofiles:feedImport.error.generic";
}

/** The numbers the feed error messages quote. */
export const FEED_ERROR_TOKENS = {
  maxFeeds: MAX_FEEDS_PER_PERSONA,
  maxItems: MAX_ITEMS_PER_SECTION,
} as const;

/** What to tell the member when a feed call was refused, in their language. */
export function translateFeedError(
  t: TFunction,
  error: unknown,
  context: FeedErrorContext = "generic",
): string {
  return t(feedErrorMessageKey(error, context), FEED_ERROR_TOKENS);
}

/** The catalog key describing why a connected feed is failing, in plain words. */
export function feedLastErrorKey(code: FeedErrorCode | null): string {
  return code
    ? `subprofiles:feedImport.lastError.${code}`
    : "subprofiles:feedImport.lastError.unknown";
}

import { ApiError } from "../../../shared/api/client";
import type { TFunction } from "../../../shared/i18n/types";
import { EVENT_BATCH_MAX_ROWS } from "./addMonth.data";
import type {
  EventBatchErrorCode,
  EventBatchRowError,
} from "../api/eventBatch.api";

/**
 * Why a batch read or publish failed, one reason per cause the page names
 * (contract section 7). The coded reasons read `code` and the uncoded shared
 * refusals read the status, so a reworded server sentence never changes the
 * copy. The two 403 sentences from the shared upload interceptor and the
 * membership guard are matched exactly, because neither carries a code.
 */
export type EventBatchFailureReason =
  | "noAccess"
  | "templateNotFound"
  | "communityOnly"
  | "tooManyDates"
  | "duplicateDate"
  | "dateInPast"
  | "dateTooFar"
  | "rowInvalid"
  | "venueNotFound"
  | "restricted"
  | "membershipInactive"
  | "coverNotYours"
  | "rateLimited"
  | "invalid"
  | "tooLarge"
  | "signedOut"
  | "timedOut"
  | "offline"
  | "unreachable"
  | "server"
  | "unreadableAnswer"
  | "refused";

export interface EventBatchFailure {
  reason: EventBatchFailureReason;
  /** The HTTP status, or null when no answer came back. */
  status: number | null;
  /** Set for the four row-coded reasons when the body names a row. */
  rowError: EventBatchRowError | null;
  /** `communityOnly`: the community the starting event is limited to. */
  communityName: string | null;
  /** `tooManyDates`: the most dates one batch may hold. */
  limit: number | null;
  /** `dateTooFar`: the last date the server accepts, "YYYY-MM-DD". */
  lastDate: string | null;
}

const ACCOUNT_RESTRICTED_CODE = "ACCOUNT_RESTRICTED";
/** `StorageKeyOwnershipInterceptor`: a body cover is someone else's upload. */
const COVER_NOT_YOURS_MESSAGE = "Referenced upload does not belong to you";
/** `ActiveMemberGuard`: the caller's membership is paused or lapsed. */
const MEMBERSHIP_INACTIVE_MESSAGE = "Active membership required";
const REQUEST_TIMEOUT_STATUS = 408;
/** The client's status for a 2xx answer whose body would not parse. */
const UNREADABLE_ANSWER_STATUS = 422;

/** The codes a 400 can carry. */
type BadRequestCode = Exclude<
  EventBatchErrorCode,
  "EVENT_BATCH_TEMPLATE_NOT_FOUND" | "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY"
>;

/** The 400 codes and the reason each one names. */
const BAD_REQUEST_REASONS: Record<BadRequestCode, EventBatchFailureReason> = {
  EVENT_BATCH_TOO_MANY_DATES: "tooManyDates",
  EVENT_BATCH_DUPLICATE_DATE: "duplicateDate",
  EVENT_BATCH_DATE_IN_PAST: "dateInPast",
  EVENT_BATCH_DATE_TOO_FAR: "dateTooFar",
  EVENT_BATCH_ROW_INVALID: "rowInvalid",
  EVENT_BATCH_VENUE_NOT_FOUND: "venueNotFound",
};

/** The codes whose body names one row of the request. */
const ROW_CODES: ReadonlySet<string> = new Set<EventBatchErrorCode>([
  "EVENT_BATCH_DUPLICATE_DATE",
  "EVENT_BATCH_DATE_IN_PAST",
  "EVENT_BATCH_DATE_TOO_FAR",
  "EVENT_BATCH_ROW_INVALID",
]);

const ROW_FIELDS: readonly EventBatchRowError["field"][] = [
  "date",
  "startTime",
  "endTime",
];

type ErrorBody = Record<string, unknown>;

function bodyOf(error: ApiError): ErrorBody {
  const data = error.data;
  return typeof data === "object" && data !== null ? (data as ErrorBody) : {};
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

/** The row a row-coded body names, or null when its row keys are missing.
 *  A missing or unknown `field` reads as `date`, so the card still gets the
 *  mark through its date. */
function rowErrorOf(body: ErrorBody): EventBatchRowError | null {
  const code = body.code;
  if (typeof code !== "string" || !ROW_CODES.has(code)) return null;
  if (typeof body.rowIndex !== "number" || typeof body.date !== "string") {
    return null;
  }
  const field = ROW_FIELDS.find((rowField) => rowField === body.field);
  return {
    code: code as EventBatchErrorCode,
    rowIndex: body.rowIndex,
    field: field ?? "date",
    date: body.date,
  };
}

function reasonOf(
  error: ApiError,
  code: unknown,
  context: EventBatchFailureContext,
): EventBatchFailureReason {
  const status = error.status;
  if (status === 401) return "signedOut";
  // A publish answer that would not parse came after the month committed,
  // so the host checks their events before a retry.
  if (status === UNREADABLE_ANSWER_STATUS && context === "publish") {
    return "unreadableAnswer";
  }
  // A publish can commit after the client gives up waiting, so a timeout
  // gets its own reason: the host checks their events before a retry.
  if (status === REQUEST_TIMEOUT_STATUS) return "timedOut";
  if (status === 413) return "tooLarge";
  if (status === 429) return "rateLimited";
  if (status === 404) {
    return code === "EVENT_BATCH_TEMPLATE_NOT_FOUND"
      ? "templateNotFound"
      : "noAccess";
  }
  if (status === 409) {
    return code === "EVENT_BATCH_TEMPLATE_COMMUNITY_ONLY"
      ? "communityOnly"
      : "refused";
  }
  if (status === 403) {
    if (code === ACCOUNT_RESTRICTED_CODE) return "restricted";
    if (error.message === COVER_NOT_YOURS_MESSAGE) return "coverNotYours";
    if (error.message === MEMBERSHIP_INACTIVE_MESSAGE) {
      return "membershipInactive";
    }
    return "refused";
  }
  if (status === 400) {
    return typeof code === "string" && Object.hasOwn(BAD_REQUEST_REASONS, code)
      ? BAD_REQUEST_REASONS[code as BadRequestCode]
      : "invalid";
  }
  if (status >= 500) return "server";
  return "refused";
}

function emptyFailure(
  reason: EventBatchFailureReason,
  status: number | null,
): EventBatchFailure {
  return {
    reason,
    status,
    rowError: null,
    communityName: null,
    limit: null,
    lastDate: null,
  };
}

/** Names the cause of a failed batch read or publish. `isOffline` defaults to
 *  the browser's own `navigator.onLine`, and an offline browser is named
 *  first whatever the error says. `context` defaults to the read, where an
 *  unreadable answer stays a refusal; a publish names it on its own. */
export function eventBatchFailureOf(
  error: unknown,
  options: { isOffline?: boolean; context?: EventBatchFailureContext } = {},
): EventBatchFailure {
  const status = error instanceof ApiError ? error.status : null;
  const isOffline =
    options.isOffline ??
    (typeof navigator !== "undefined" && navigator.onLine === false);
  if (isOffline) return emptyFailure("offline", status);
  if (!(error instanceof ApiError)) return emptyFailure("unreachable", null);
  const body = bodyOf(error);
  const reason = reasonOf(error, body.code, options.context ?? "read");
  return {
    ...emptyFailure(reason, error.status),
    rowError: rowErrorOf(body),
    communityName:
      reason === "communityOnly" ? stringOrNull(body.communityName) : null,
    limit:
      reason === "tooManyDates" && typeof body.limit === "number"
        ? body.limit
        : null,
    lastDate: reason === "dateTooFar" ? stringOrNull(body.lastDate) : null,
  };
}

/** The catalog key for each reason. A full `Record`, so a new reason fails
 *  to compile until it has copy. */
export const EVENT_BATCH_FAILURE_KEYS: Record<EventBatchFailureReason, string> =
  {
    noAccess: "gatherings:addMonth.error.noAccess",
    templateNotFound: "gatherings:addMonth.error.templateNotFound",
    communityOnly: "gatherings:addMonth.error.communityOnly",
    tooManyDates: "gatherings:addMonth.error.tooManyDates",
    duplicateDate: "gatherings:addMonth.error.duplicateDate",
    dateInPast: "gatherings:addMonth.error.dateInPast",
    dateTooFar: "gatherings:addMonth.error.dateTooFar",
    rowInvalid: "gatherings:addMonth.error.rowInvalid",
    venueNotFound: "gatherings:addMonth.error.venueNotFound",
    restricted: "gatherings:addMonth.error.restricted",
    membershipInactive: "gatherings:addMonth.error.membershipInactive",
    coverNotYours: "gatherings:addMonth.error.coverNotYours",
    rateLimited: "gatherings:addMonth.error.rateLimited",
    invalid: "gatherings:addMonth.error.invalid",
    tooLarge: "gatherings:addMonth.error.tooLarge",
    signedOut: "gatherings:addMonth.error.signedOut",
    timedOut: "gatherings:addMonth.error.timedOut",
    offline: "gatherings:addMonth.error.offline",
    unreachable: "gatherings:addMonth.error.unreachable",
    server: "gatherings:addMonth.error.server",
    unreadableAnswer: "gatherings:addMonth.error.unreadableAnswer",
    refused: "gatherings:addMonth.error.refused",
  };

/** `communityOnly` copy for a body that names no community. */
export const EVENT_BATCH_COMMUNITY_ONLY_UNNAMED_KEY =
  "gatherings:addMonth.error.communityOnlyUnnamed";

/** Which request failed: reading the starting event, or publishing. */
export type EventBatchFailureContext = "read" | "publish";

/** The reasons a failed read of the starting event names in its own words,
 *  since their publish copy talks about publishing and saved dates. */
type ReadReason =
  | "offline"
  | "unreachable"
  | "server"
  | "signedOut"
  | "rateLimited"
  | "refused"
  | "timedOut";

export const EVENT_BATCH_READ_FAILURE_KEYS: Record<ReadReason, string> = {
  offline: "gatherings:addMonth.error.read.offline",
  unreachable: "gatherings:addMonth.error.read.unreachable",
  server: "gatherings:addMonth.error.read.server",
  signedOut: "gatherings:addMonth.error.read.signedOut",
  rateLimited: "gatherings:addMonth.error.read.rateLimited",
  refused: "gatherings:addMonth.error.read.refused",
  timedOut: "gatherings:addMonth.error.read.timedOut",
};

/** Row-coded reasons whose copy names the row's date. */
type DatedReason = "duplicateDate" | "dateInPast" | "dateTooFar" | "rowInvalid";

/** Copy for a row-coded body that lacks its date (or, for `dateTooFar`, its
 *  last date), so the sentence holds no empty placeholder. */
export const EVENT_BATCH_UNDATED_FAILURE_KEYS: Record<DatedReason, string> = {
  duplicateDate: "gatherings:addMonth.error.plain.duplicateDate",
  dateInPast: "gatherings:addMonth.error.plain.dateInPast",
  dateTooFar: "gatherings:addMonth.error.plain.dateTooFar",
  rowInvalid: "gatherings:addMonth.error.plain.rowInvalid",
};

function isReadReason(reason: EventBatchFailureReason): reason is ReadReason {
  return Object.hasOwn(EVENT_BATCH_READ_FAILURE_KEYS, reason);
}

function isDatedReason(reason: EventBatchFailureReason): reason is DatedReason {
  return Object.hasOwn(EVENT_BATCH_UNDATED_FAILURE_KEYS, reason);
}

/** The catalog key that names this failure in this context. */
function failureKeyOf(
  failure: EventBatchFailure,
  context: EventBatchFailureContext,
): string {
  const reason = failure.reason;
  if (context === "read" && isReadReason(reason)) {
    return EVENT_BATCH_READ_FAILURE_KEYS[reason];
  }
  if (reason === "communityOnly" && failure.communityName === null) {
    return EVENT_BATCH_COMMUNITY_ONLY_UNNAMED_KEY;
  }
  if (isDatedReason(reason)) {
    const isMissingDate =
      failure.rowError === null ||
      (reason === "dateTooFar" && failure.lastDate === null);
    if (isMissingDate) return EVENT_BATCH_UNDATED_FAILURE_KEYS[reason];
  }
  return EVENT_BATCH_FAILURE_KEYS[reason];
}

/** The sentence that names a failure, with the row's date and the last
 *  allowed date read through `formatDate`. `context` picks the read copy for
 *  a failed load of the starting event; publishing is the default. */
export function eventBatchFailureText(
  failure: EventBatchFailure,
  t: TFunction,
  formatDate: (date: string) => string,
  context: EventBatchFailureContext = "publish",
): string {
  return t(failureKeyOf(failure, context), {
    date: failure.rowError ? formatDate(failure.rowError.date) : undefined,
    lastDate: failure.lastDate ? formatDate(failure.lastDate) : undefined,
    limit: failure.limit ?? EVENT_BATCH_MAX_ROWS,
    communityName: failure.communityName ?? undefined,
    status: failure.status ?? undefined,
  });
}

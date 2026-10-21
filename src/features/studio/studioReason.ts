import { ApiError } from "../../shared/api/client";
import { isAccountRestricted } from "../../shared/api/errorMessage";

/** Why a Studio read, save, play, upload or queue change failed, in the
 *  words a member can act on. Every failure maps to exactly one. */
export type StudioFailureReason =
  | "offline"
  | "timeout"
  | "rateLimited"
  | "server"
  | "unreachable"
  | "forbidden"
  | "notFound"
  | "restricted"
  | "unknown";

/** Where the failure happened; picks the sentence the member reads. */
export type StudioFailureContext =
  "load" | "save" | "play" | "upload" | "queue";

/** The client turns its own 15s ceiling into a 408 (see `request()` in
 *  `shared/api/client.ts`). */
const TIMEOUT_STATUS = 408;
const RATE_LIMITED_STATUS = 429;
const FIRST_SERVER_STATUS = 500;

function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** `fetch` rejects with a TypeError ("Failed to fetch", "Load failed",
 *  "NetworkError when attempting to fetch resource") when no response came
 *  back at all: offline, DNS, a dropped connection or CORS. */
function isNetworkFailure(error: unknown): boolean {
  return error instanceof TypeError;
}

/** A deadline abort from `AbortSignal.timeout()`. A plain `AbortError` is a
 *  caller walking away, so it stays "unknown". */
function isTimeoutAbort(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  return (error as { name?: unknown }).name === "TimeoutError";
}

/** The status the server actually answered with, or null when no answer
 *  arrived (a client-side 408 counts as no answer). */
function answeredStatusOf(error: unknown): number | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === TIMEOUT_STATUS) return null;
  return error.status;
}

function reasonOfStatus(status: number): StudioFailureReason {
  if (status === RATE_LIMITED_STATUS) return "rateLimited";
  if (status >= FIRST_SERVER_STATUS) return "server";
  if (status === 401 || status === 403) return "forbidden";
  if (status === 404 || status === 410) return "notFound";
  return "unknown";
}

/**
 * One rule for every Studio failure. A device with no network reads
 * "offline" whenever the server never answered, so the member is never told
 * the fault is ours while their connection is down. A real HTTP answer keeps
 * its own reason: the server did reply, so the connection was not the cause.
 */
export function studioReasonOf(error: unknown): StudioFailureReason {
  const answeredStatus = answeredStatusOf(error);
  if (answeredStatus === null && isDeviceOffline()) return "offline";
  if (isAccountRestricted(error)) return "restricted";
  if (answeredStatus !== null) return reasonOfStatus(answeredStatus);
  if (error instanceof ApiError || isTimeoutAbort(error)) return "timeout";
  // Online, yet nothing came back: a captive portal, DNS, CORS or Wi-Fi
  // without internet. The server never answered, so it is never "on us".
  if (isNetworkFailure(error)) return "unreachable";
  return "unknown";
}

/** The catalog key for a reason in a context: `studio:errors.<context>.<reason>`. */
export function studioReasonCopyKey(
  reason: StudioFailureReason,
  context: StudioFailureContext,
): string {
  return `studio:errors.${context}.${reason}`;
}

import { ApiError } from "../../../shared/api/client";

/**
 * The one refusal `POST /appeals` gives that is a STATE rather than a fault:
 * the filing window for the decision being appealed has already closed
 * (TS-11).
 *
 * A member learned about the 14-day window by being refused on day 15, and the
 * refusal arrived as a generic error toast built from the backend's English
 * sentence. That is the worst possible moment to hand somebody a toast: the
 * decision they are contesting is still in force, the form still looks
 * fileable, and pressing submit again produces the identical refusal forever.
 * So the submit page renders this as its own panel with the deadline in it and
 * a way onward, instead of flashing prose past them.
 *
 * ## The contract: `code`, never the prose
 *
 * ```json
 * { "statusCode": 400, "error": "Bad Request",
 *   "code": "APPEAL_WINDOW_CLOSED",
 *   "windowDays": 14,
 *   "decisionTakenAt": "2026-08-01T09:14:22.113Z",
 *   "closedAt": "2026-08-15T09:14:22.113Z",
 *   "message": "Appeals are open for 14 days after a decision…" }
 * ```
 *
 * `code` is the whole test, exactly as `classifyReportSubmissionError` reads
 * `REPORT_FLOOD_CAP`, `isAttendanceWindowClosed` reads
 * `EVENT_ATTENDANCE_WINDOW_CLOSED`, and `INVITE_QUOTA_EXCEEDED` /
 * `PLATFORM_LOCKED` / `BANNED_FROM_COMMUNITY` are read elsewhere in this app.
 * Matching the English sentence would break the first time the copy is reworded
 * or localized, and would silently start showing framework wording instead.
 *
 * The STATUS is deliberately not part of the test. The code is unique to this
 * refusal, so reading it alone keeps this working whether the backend answers
 * 400 (as it does today) or moves to 403 later, and one fewer coupling is one
 * fewer way for a member locked out by a decision to be told nothing useful.
 *
 * ## Why `windowDays` is read rather than assumed
 *
 * `windowDays` is the number the server ACTUALLY enforced on this filing. The
 * panel renders that in preference to the client's mirrored
 * `APPEAL_FILING_WINDOW_DAYS`, so a member refused by a 14-day rule can never
 * be told the rule was some other length because one side of the wire shipped
 * first. The local constant stays the fallback, and it is what the submit form
 * states before any refusal exists.
 *
 * `windowDays`, `closedAt` and `decisionTakenAt` are all additive: when they
 * are there the panel names the exact day, and when they are missing it still
 * states the window. Nothing here depends on any of them being present.
 */

/** The backend's typed discriminator for a late appeal filing. */
const APPEAL_WINDOW_CLOSED_CODE = "APPEAL_WINDOW_CLOSED";

/** A refused-because-late filing, with whatever detail the server sent with it. */
export interface AppealWindowClosedRefusal {
  /** The instant the window shut, or null when the server did not name it. */
  closedAt: Date | null;
  /** The window length the server enforced, or null when it did not send one. */
  windowDays: number | null;
}

/**
 * Read `closedAt` off the error body. Accepts either spelling the backend may
 * use (`closedAt`, or `closesAt` after the local variable in
 * `ModerationService.createAppeal`), because the panel degrades to the
 * window-only sentence when neither is present and a wrong guess must never
 * turn a real deadline into a crash.
 */
function readClosedAt(body: Record<string, unknown>): Date | null {
  const raw = body.closedAt ?? body.closesAt;
  if (typeof raw !== "string") return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Read `windowDays`, accepting only a real positive count. */
function readWindowDays(body: Record<string, unknown>): number | null {
  const raw = body.windowDays;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return null;
  return raw;
}

/**
 * Whether this failure is the deterministic "the appeal window has closed"
 * refusal, and what date it closed on. Returns null for every other failure, so
 * the caller keeps its existing toast for anything a retry might still get
 * through.
 *
 * Pure and dependency-free, so it can be unit tested and called from both the
 * mutation's `onError` and any other surface that files an appeal. Reads the
 * parsed body off `ApiError.data`, which the API client already filled in.
 */
export function classifyAppealWindowClosed(
  error: unknown,
): AppealWindowClosedRefusal | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data as Record<string, unknown> | null | undefined;
  if (!body || body.code !== APPEAL_WINDOW_CLOSED_CODE) return null;
  return { closedAt: readClosedAt(body), windowDays: readWindowDays(body) };
}

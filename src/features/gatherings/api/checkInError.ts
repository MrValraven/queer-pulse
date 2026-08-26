import { ApiError } from "../../../shared/api/client";

/**
 * Why a door check-in was refused (LOC-03).
 *
 * `POST /events/:slug/check-ins` answers 403 once a gathering is past its
 * attendance window, on both the tapped-name and the scanned-card variant.
 * Honouring it then would write a fresh `checked_in_at` onto a row the
 * retention sweep has already cleared, re-creating the exact personal data the
 * published privacy policy promises to have deleted and leaving one
 * re-identifying arrival among the erased ones.
 *
 * ## The contract: `code`, never the prose
 *
 * ```json
 * { "statusCode": 403, "error": "Forbidden",
 *   "code": "EVENT_ATTENDANCE_WINDOW_CLOSED",
 *   "message": "Arrivals are only recorded for 30 days after a gathering..." }
 * ```
 *
 * `code` is the contract; `message` is a human fallback for a client that has
 * not been taught the code, and the number inside it comes from a configurable
 * retention window. So the door renders its OWN copy
 * (`gatherings:door.checkInClosedNotice`) and reads nothing but the code, the
 * same way `classifyReportSubmissionError` reads `REPORT_FLOOD_CAP` and the
 * same way `INVITE_QUOTA_EXCEEDED`, `PLATFORM_LOCKED` and
 * `BANNED_FROM_COMMUNITY` are read elsewhere in this app. Matching English
 * prose breaks the moment the copy is reworded or localised.
 *
 * `DELETE /events/:slug/check-ins/:memberSlug` is deliberately NOT guarded and
 * keeps working past the window, so an undo affordance stays live on a cleared
 * row: refusing it would strand a stray arrival stamp the sweep has not reached
 * yet with nobody allowed to remove it.
 */

/** The backend's typed discriminator, mirroring
 *  `EVENT_ATTENDANCE_WINDOW_CLOSED_CODE` in its `events/event-attendance-window.ts`. */
const EVENT_ATTENDANCE_WINDOW_CLOSED_CODE = "EVENT_ATTENDANCE_WINDOW_CLOSED";

/**
 * Whether this failure is the deterministic "that gathering's check-in window
 * has closed" refusal, rather than something a second tap might get through.
 *
 * Pure and dependency-free so it can be unit tested and called from both the
 * mutation's own `onError` and the door's per-call handlers. Reads the parsed
 * body off `ApiError.data`, which the API client already filled in.
 *
 * Runs on the failure path only: the happy path never calls it, so a door desk
 * mid-gathering pays nothing for it.
 */
export function isAttendanceWindowClosed(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 403) return false;
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  return code === EVENT_ATTENDANCE_WINDOW_CLOSED_CODE;
}

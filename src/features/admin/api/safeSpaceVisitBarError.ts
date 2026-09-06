import { ApiError } from "../../../shared/api/client";

/**
 * The independent-visit bar, as the two badge-granting endpoints refuse it.
 *
 * QueerPulse publishes the three-visit guarantee in five places ("Minimum 3
 * independent visits", "Three independent visits", "Three members with no stake
 * in the place go there and write up what they found", the nomination
 * confirmation and the governance page). The count was computed on every award
 * and written into the audit trail, and nothing consulted it, so the bar was
 * advisory. Both doors to a badge now enforce it:
 *
 * - `POST /admin/safe-space-nominations/:id/decide` with `outcome: "award"`
 * - `PATCH /admin/listings/:ref/safe-space` on a transition INTO `verified`
 *
 * Both refuse with the SAME 400 body, and both accept the same audited
 * exception (`belowVisitBarReason`, minimum 20 characters):
 *
 * ```json
 * { "statusCode": 400, "error": "Bad Request",
 *   "code": "SAFE_SPACE_VISIT_BAR_NOT_MET",
 *   "independentVisitCount": 1, "requiredVisitCount": 3,
 *   "notIndependentVouchCount": 2,
 *   "message": "This listing has 1 of 3 independent member visits. …" }
 * ```
 *
 * `code` is the contract and `message` is a human fallback for a client that
 * has not been taught the code. This module reads the code and the numbers and
 * never the prose, the same way `isAttendanceWindowClosed` reads
 * `EVENT_ATTENDANCE_WINDOW_CLOSED` and `classifyReportSubmissionError` reads
 * `REPORT_FLOOD_CAP`. Matching English prose breaks the moment the copy is
 * reworded or localised, and the two endpoints already word their messages
 * differently from one another.
 */

/** The backend's typed discriminator, thrown by both badge-granting paths. */
const SAFE_SPACE_VISIT_BAR_NOT_MET_CODE = "SAFE_SPACE_VISIT_BAR_NOT_MET";

/**
 * The second refusal, and a DIFFERENT problem from the one above.
 *
 * `SAFE_SPACE_VISIT_BAR_NOT_MET` (400) says "write a reason". This one (403)
 * says "this is not yours to waive": the caller reached the endpoint on the
 * additive `directory_moderator` grant alone, and waiving a guarantee the
 * platform publishes is limited to a real moderator or admin account tier.
 *
 * The two must never be collapsed. Treating this as the first would tell a
 * delegate to go and write twenty characters into a field that can never be
 * accepted. A delegate keeps everything else: they still decide nominations,
 * still award above the bar, still decline.
 */
const SAFE_SPACE_VISIT_BAR_OVERRIDE_FORBIDDEN_CODE =
  "SAFE_SPACE_VISIT_BAR_OVERRIDE_FORBIDDEN";

/**
 * The floor `DecideNominationDto.belowVisitBarReason` and
 * `UpdateSafeSpaceDto.belowVisitBarReason` both enforce with `@MinLength(20)`,
 * mirrored here so the form gates on exactly what the server gates on. Looser
 * hands the operator an avoidable 400; tighter blocks a legitimate award.
 */
export const BELOW_VISIT_BAR_REASON_MIN_LENGTH = 20;

/** Whether a reason clears the server's floor. Trimmed, because the server
 *  trims before it checks. */
export function isBelowVisitBarReasonLongEnough(reason: string): boolean {
  return reason.trim().length >= BELOW_VISIT_BAR_REASON_MIN_LENGTH;
}

/** The counts a refusal carries, for rendering back to the operator. */
export interface VisitBarRefusal {
  independentVisitCount: number;
  requiredVisitCount: number;
  notIndependentVouchCount: number;
}

function readCount(source: Record<string, unknown>, key: string): number {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * The refusal's counts when this failure is the visit-bar gate, otherwise
 * `null`. Pure and dependency-free so it can be unit tested and called from
 * both the direct listings editor and the row's own mark control. The reviewed
 * decide form gates client-side on the tally it already holds and does not read
 * this yet; the two endpoints answer with the same body, so it is ready for it.
 *
 * A mis-shaped body degrades to zeroed counts rather than throwing: the
 * operator still gets the "write a reason" branch, which is the part that
 * matters, instead of a generic failure toast that tells them nothing.
 */
export function classifyVisitBarRefusal(
  error: unknown,
): VisitBarRefusal | null {
  if (!(error instanceof ApiError) || error.status !== 400) return null;
  const body = error.data as Record<string, unknown> | null | undefined;
  if (!body || body.code !== SAFE_SPACE_VISIT_BAR_NOT_MET_CODE) return null;
  return {
    independentVisitCount: readCount(body, "independentVisitCount"),
    requiredVisitCount: readCount(body, "requiredVisitCount"),
    notIndependentVouchCount: readCount(body, "notIndependentVouchCount"),
  };
}

/**
 * True when this failure is the platform-staff-only refusal on the override.
 *
 * Branches on the typed `code` and the 403 status, never on prose, for the same
 * reason `classifyVisitBarRefusal` does: the two endpoints word their messages
 * differently from one another and both are localised.
 */
export function isVisitBarOverrideForbidden(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 403) return false;
  const body = error.data as Record<string, unknown> | null | undefined;
  return body?.code === SAFE_SPACE_VISIT_BAR_OVERRIDE_FORBIDDEN_CODE;
}

/** The visit counts carried on the 403, so the refusal can say how many are on
 *  file and how many are needed rather than only that permission was refused. */
export function readVisitBarOverrideCounts(error: unknown): {
  independentVisitCount: number;
  requiredVisitCount: number;
} | null {
  if (!isVisitBarOverrideForbidden(error)) return null;
  const body = (error as ApiError).data as Record<string, unknown>;
  return {
    independentVisitCount: readCount(body, "independentVisitCount"),
    requiredVisitCount: readCount(body, "requiredVisitCount"),
  };
}

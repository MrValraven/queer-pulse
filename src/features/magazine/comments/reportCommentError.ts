import { ApiError } from "../../../shared/api/client";
import { classifyReportSubmissionError } from "../../safety/api/reportSubmissionError";

/**
 * Turns a failed `POST /reports` for a reader comment (`subjectType:
 * "magazine_comment"`) into the catalog key of the specific reason, the way
 * `writerApplicationErrorCopy` does for the application form. Every failure the
 * backend can return for this filing has a line of its own (queerpulse-backend
 * `reports/reports.controller.ts`, `reports/reports.service.ts`,
 * `reports/dto/create-report.dto.ts`, `security/csrf.guard.ts`), plus one for a
 * request that got no answer.
 *
 * What the backend does NOT refuse for this subject type, so there is no line
 * for it: reporting your own comment, a comment that was already removed, or a
 * comment you reported before. `ReportsService.create` never looks the comment
 * up (the `magazine_comment` branch is only a reason check and the flood caps),
 * and a second report from the same member on the same comment is answered
 * with their existing open report as a success, not an error.
 *
 * The two 429 refusals are told apart by the typed `code`, never by prose, via
 * the safety module's own classifier (`classifyReportSubmissionError`), which
 * this file reads and does not change. That classifier folds every 401/403 into
 * one "auth" kind, which is too coarse here (a suspended account and an expired
 * security token are different causes), so those statuses are handled below.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface ReportCommentErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

/** Mirrors `REPORT_REASON_NOT_OFFERED_CODE` in the backend's
 *  `reports/reports.service.ts`: a 400 for a reason the subject type does not
 *  offer. */
const REPORT_REASON_NOT_OFFERED_CODE = "REPORT_REASON_NOT_OFFERED";

function bodyCode(error: ApiError): unknown {
  return (error.data as { code?: unknown } | null | undefined)?.code;
}

function messageHas(error: ApiError, fragment: string): boolean {
  return error.message.toLowerCase().includes(fragment.toLowerCase());
}

export function reportCommentErrorCopy(error: unknown): ReportCommentErrorCopy {
  // No answer at all: fetch threw (offline, DNS, CORS) before any status.
  if (!(error instanceof ApiError)) {
    return { key: "magazine:comments.report.error.noConnection" };
  }
  const refusal = classifyReportSubmissionError(error);
  if (refusal.kind === "cap") {
    return { key: "magazine:comments.report.error.floodCap" };
  }
  if (refusal.kind === "burst") {
    return { key: "magazine:comments.report.error.tooFast" };
  }
  switch (error.status) {
    case 400:
    case 422:
      return {
        key:
          bodyCode(error) === REPORT_REASON_NOT_OFFERED_CODE
            ? "magazine:comments.report.error.reasonNotOffered"
            : "shared:apiError.reasonInvalid",
      };
    case 401:
      return { key: "magazine:comments.report.error.signedOut" };
    case 403:
      // The controller's own 'Active membership required' for a signed-in
      // caller who is not active; any other 403 that reaches here is the
      // CsrfGuard refusing after the client already re-fetched its token once.
      return {
        key: messageHas(error, "active membership required")
          ? "magazine:comments.report.error.notActive"
          : "magazine:comments.report.error.securityCheck",
      };
    case 408:
      return { key: "magazine:comments.report.error.timedOut" };
    default:
      if (error.status >= 500) {
        return { key: "magazine:comments.report.error.serverFault" };
      }
      return {
        key: "magazine:comments.report.error.refused",
        values: { status: error.status },
      };
  }
}

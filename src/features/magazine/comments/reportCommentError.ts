import {
  CSRF_REJECTED_CODE,
  SHARED_CAUSE_KEY,
} from "../../../shared/api/causeErrorKey";
import {
  magazineCauseErrorCopy,
  PLATFORM_LOCKED_CODE,
  type MagazineCauseLines,
} from "../magazineCauseError";

/**
 * Turns a failed `POST /reports` for a reader comment (`subjectType:
 * "magazine_comment"`) into the catalog key of the specific reason. Every
 * failure the backend can return for this filing has a line of its own
 * (queerpulse-backend `reports/reports.controller.ts`,
 * `reports/reports.service.ts`, `reports/report-flood-limits.ts`,
 * `reports/dto/create-report.dto.ts`, `security/csrf.guard.ts`,
 * `common/platform-lockdown.guard.ts`), plus one for a request that got no
 * answer.
 *
 * What the backend does NOT refuse for this subject type, so there is no line
 * for it: reporting your own comment, a comment that was already removed, or a
 * comment you reported before. `ReportsService.create` never looks the comment
 * up (the `magazine_comment` branch is only a reason check and the flood caps),
 * and a second report from the same member on the same comment is answered
 * with their existing open report as a success.
 *
 * `/reports` lives outside the magazine module, so only some of its refusals
 * carry a machine code, and those are read here: `REPORT_FLOOD_CAP` (the
 * rolling daily or per-subject cap, a 429), `REPORT_REASON_NOT_OFFERED` (a
 * 400), `CSRF_REJECTED` (a 403 from the CsrfGuard) and `PLATFORM_LOCKED` (the
 * 503 maintenance lock). The other codes
 * `/reports` sends belong to message and Studio subjects and cannot reach
 * this filing; with any code this file does not know, the line for its
 * status answers.
 *
 * The uncoded refusals are told apart by status:
 *  - 429 with no code is the burst throttler (`@Throttle`), so `tooFast`;
 *  - 403 `ACTIVE_MEMBERSHIP_REQUIRED` (the controller's own check) is named
 *    by the shared classifier and worded below as `notActive`; 403
 *    `CSRF_REJECTED` is the CsrfGuard refusing after the API client already
 *    re-fetched its token and retried once, so `securityCheck`. A 403 with no
 *    code (an older backend) reads the same way;
 *  - 413 cannot happen: the modal sends a subject id and a reason code only.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface ReportCommentErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

const REPORT_COMMENT_LINES: MagazineCauseLines = {
  codeKeys: {
    // Mirrors `REPORT_FLOOD_CAP_CODE` in the backend's
    // `reports/report-flood-limits.ts`; one code covers both caps.
    REPORT_FLOOD_CAP: "magazine:comments.report.error.floodCap",
    // Mirrors `REPORT_REASON_NOT_OFFERED_CODE` in the backend's
    // `reports/reports.service.ts`.
    REPORT_REASON_NOT_OFFERED:
      "magazine:comments.report.error.reasonNotOffered",
    [CSRF_REJECTED_CODE]: "magazine:comments.report.error.securityCheck",
    [PLATFORM_LOCKED_CODE]: "magazine:comments.report.error.maintenance",
  },
  statusKeys: {
    401: "magazine:comments.report.error.signedOut",
    // Old backends send the CSRF refusal with no code.
    403: "magazine:comments.report.error.securityCheck",
    408: "magazine:comments.report.error.timedOut",
    429: "magazine:comments.report.error.tooFast",
  },
  sharedKeys: {
    [SHARED_CAUSE_KEY.noConnection]:
      "magazine:comments.report.error.noConnection",
    [SHARED_CAUSE_KEY.notActive]: "magazine:comments.report.error.notActive",
    [SHARED_CAUSE_KEY.serverFault]:
      "magazine:comments.report.error.serverFault",
    [SHARED_CAUSE_KEY.refused]: "magazine:comments.report.error.refused",
  },
};

export function reportCommentErrorCopy(error: unknown): ReportCommentErrorCopy {
  return magazineCauseErrorCopy(error, REPORT_COMMENT_LINES);
}

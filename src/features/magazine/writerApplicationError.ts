import {
  CSRF_REJECTED_CODE,
  SHARED_CAUSE_KEY,
} from "../../shared/api/causeErrorKey";
import {
  magazineCauseErrorCopy,
  PLATFORM_LOCKED_CODE,
  type MagazineCauseLines,
} from "./magazineCauseError";

/**
 * Turns a failed `POST /magazine/writer-applications` into the catalog key of
 * the specific reason. Every failure the backend can return for this endpoint
 * has a line of its own (queerpulse-backend
 * `magazine/writer-applications.service.ts`,
 * `dto/create-writer-application.dto.ts`, `auth/guards/active-member.guard.ts`,
 * `security/csrf.guard.ts`, `common/platform-lockdown.guard.ts` and the
 * feature gate), plus one for a request that got no answer.
 *
 * The causes are told apart by the machine `code` on the body
 * (`magazine/magazine-error-codes.ts`) alone. When
 * one request fails several field checks, the first code in `codes` that has
 * a line here wins (see `magazineCauseError.ts`). A code this file does not
 * know (a newer backend) falls back to the line for its status.
 *
 * Refusals that come from outside the magazine module, told apart by the
 * platform codes in queerpulse-backend `common/coded-error.ts`:
 *  - 403 `ACTIVE_MEMBERSHIP_REQUIRED` (`ActiveMemberGuard`), named by the
 *    shared classifier and worded below as this form's `notActive` line;
 *  - 403 `CSRF_REJECTED` (`CsrfGuard`), after the API client already
 *    re-fetched its token and retried once, so it reads as `securityCheck`. A
 *    403 with no code (an older backend) reads the same way, as this endpoint
 *    has no role check of its own;
 *  - 404 is the `magazine` feature gate;
 *  - 413 is Express's 100 kB JSON body limit (`main.ts` sets none, so the
 *    body-parser default applies). Only the pasted sample (20,000 characters)
 *    is big enough to reach it, so the line names the sample without claiming
 *    a character count the member may not have passed.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface WriterApplicationErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

const WRITER_APPLICATION_LINES: MagazineCauseLines = {
  codeKeys: {
    WRITER_APPLICATION_SAMPLE_REQUIRED:
      "magazine:applyToWrite.form.sampleRequiredError",
    WRITER_APPLICATION_SAMPLE_LINK_INVALID:
      "magazine:applyToWrite.form.error.linkInvalid",
    WRITER_APPLICATION_SAMPLE_LINK_TOO_LONG:
      "magazine:applyToWrite.form.error.linkTooLong",
    WRITER_APPLICATION_SAMPLE_TEXT_TOO_LONG:
      "magazine:applyToWrite.form.error.sampleTooLong",
    WRITER_APPLICATION_PITCH_NOTE_TOO_LONG:
      "magazine:applyToWrite.form.error.pitchTooLong",
    WRITER_APPLICATION_ALREADY_WRITER:
      "magazine:applyToWrite.form.error.alreadyWriter",
    WRITER_APPLICATION_ALREADY_PENDING:
      "magazine:applyToWrite.form.error.alreadyPending",
    [CSRF_REJECTED_CODE]: "magazine:applyToWrite.form.error.securityCheck",
    [PLATFORM_LOCKED_CODE]: "magazine:applyToWrite.form.error.maintenance",
  },
  statusKeys: {
    401: "magazine:applyToWrite.form.error.signedOut",
    // Old backends send the CSRF refusal with no code.
    403: "magazine:applyToWrite.form.error.securityCheck",
    404: "magazine:applyToWrite.form.error.notOpen",
    408: "magazine:applyToWrite.form.error.timedOut",
    413: "magazine:applyToWrite.form.error.sampleTooLarge",
  },
  sharedKeys: {
    [SHARED_CAUSE_KEY.noConnection]:
      "magazine:applyToWrite.form.error.noConnection",
    [SHARED_CAUSE_KEY.notActive]: "magazine:applyToWrite.form.error.notActive",
    [SHARED_CAUSE_KEY.serverFault]:
      "magazine:applyToWrite.form.error.serverFault",
    [SHARED_CAUSE_KEY.refused]: "magazine:applyToWrite.form.error.refused",
  },
};

export function writerApplicationErrorCopy(
  error: unknown,
): WriterApplicationErrorCopy {
  return magazineCauseErrorCopy(error, WRITER_APPLICATION_LINES);
}

import {
  CSRF_REJECTED_CODE,
  SHARED_CAUSE_KEY,
  UPLOAD_NOT_YOURS_CODE,
} from "../../shared/api/causeErrorKey";
import {
  magazineCauseErrorCopy,
  PLATFORM_LOCKED_CODE,
  type MagazineCauseLines,
} from "./magazineCauseError";

/**
 * Turns a failed `POST /magazine/submissions` into the catalog key of the
 * specific reason. Every failure the backend can return for this endpoint has
 * a line of its own (queerpulse-backend `magazine/magazine.controller.ts`
 * `createSubmission`, `magazine/dto/create-story-submission.dto.ts`,
 * `auth/guards/active-member.guard.ts`,
 * `storage/storage-key-ownership.interceptor.ts`, `security/csrf.guard.ts`,
 * `common/platform-lockdown.guard.ts` and the feature gates), plus one for a
 * request that got no answer.
 *
 * What the backend does NOT refuse, so there is no line for it:
 *  - a member who is not an approved writer (any active member may submit;
 *    the writer role guards `/magazine/writer/*`, and this route sits outside it),
 *  - a second submission (`StorySubmissionsService.create` always inserts),
 *  - a closed submission window (the issue deadline is shown to the member but
 *    never checked by `create`),
 *  - `STORY_SUBMISSION_NOT_FOUND` and `STORY_SUBMISSION_ALREADY_ANSWERED`,
 *    which only the withdraw route throws.
 *
 * Field checks are told apart by the machine `code`; when the body fails
 * several, the first code in `codes` that has a line wins (see
 * `magazineCauseError.ts`). A code this file does not know falls back to the
 * line for its status.
 *
 * Refusals that come from outside the magazine module, told apart by the
 *  platform codes in queerpulse-backend `common/coded-error.ts`:
 *  - 403 `ACTIVE_MEMBERSHIP_REQUIRED` (`ActiveMemberGuard`), named by the
 *    shared classifier and worded below as this form's `notActive` line;
 *  - 403 `UPLOAD_NOT_YOURS` (`StorageKeyOwnershipInterceptor`) for a cover key
 *    another member uploaded;
 *  - 403 `CSRF_REJECTED` (`CsrfGuard`), after the API client already
 *    re-fetched its token and retried once, so `securityCheck`. A 403 with no
 *    code (an older backend) reads the same way, as this endpoint has no role
 *    check of its own;
 *  - 404 is the `magazine` feature gate;
 *  - 413 is Express's 100 kB JSON body limit (`main.ts` sets none, so the
 *    body-parser default applies). The story body is the only field big
 *    enough to reach it, and it does so before its own 120,000-character
 *    check: 120,000 plain characters are already about 117 kB.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface SubmitStoryErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

const SUBMIT_STORY_LINES: MagazineCauseLines = {
  codeKeys: {
    STORY_SUBMISSION_FORMAT_REQUIRED:
      "magazine:submitStory.editor.chooseSectionError",
    STORY_SUBMISSION_FORMAT_TOO_LONG:
      "magazine:submitStory.editor.error.sectionInvalid",
    STORY_SUBMISSION_WORKING_TITLE_REQUIRED:
      "magazine:submitStory.editor.needHeadlineError",
    STORY_SUBMISSION_WORKING_TITLE_TOO_LONG:
      "magazine:submitStory.editor.error.headlineTooLong",
    // The form sends the standfirst as `pitch`, or an excerpt of the body when
    // the standfirst is empty, so an empty `pitch` means both were empty.
    STORY_SUBMISSION_PITCH_REQUIRED:
      "magazine:submitStory.editor.error.summaryRequired",
    // The body excerpt is capped at 280 characters, so only a standfirst past
    // 5,000 characters makes `pitch` too long.
    STORY_SUBMISSION_PITCH_TOO_LONG:
      "magazine:submitStory.editor.error.deckTooLong",
    STORY_SUBMISSION_DECK_TOO_LONG:
      "magazine:submitStory.editor.error.deckTooLong",
    STORY_SUBMISSION_BODY_TOO_LONG:
      "magazine:submitStory.editor.error.bodyTooLong",
    STORY_SUBMISSION_COVER_INVALID:
      "magazine:submitStory.editor.error.coverInvalid",
    [UPLOAD_NOT_YOURS_CODE]: "magazine:submitStory.editor.error.coverNotYours",
    [CSRF_REJECTED_CODE]: "magazine:submitStory.editor.error.securityCheck",
    [PLATFORM_LOCKED_CODE]: "magazine:submitStory.editor.error.maintenance",
  },
  statusKeys: {
    401: "magazine:submitStory.editor.error.signedOut",
    // Old backends send the CSRF refusal with no code.
    403: "magazine:submitStory.editor.error.securityCheck",
    404: "magazine:submitStory.editor.error.notOpen",
    408: "magazine:submitStory.editor.error.timedOut",
    413: "magazine:submitStory.editor.error.bodyTooLarge",
  },
  sharedKeys: {
    [SHARED_CAUSE_KEY.noConnection]:
      "magazine:submitStory.editor.error.noConnection",
    [SHARED_CAUSE_KEY.notActive]: "magazine:submitStory.editor.error.notActive",
    [SHARED_CAUSE_KEY.serverFault]:
      "magazine:submitStory.editor.error.serverFault",
    [SHARED_CAUSE_KEY.refused]: "magazine:submitStory.editor.error.refused",
  },
};

export function submitStoryErrorCopy(error: unknown): SubmitStoryErrorCopy {
  return magazineCauseErrorCopy(error, SUBMIT_STORY_LINES);
}

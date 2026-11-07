import { ApiError } from "../../../shared/api/client";
import {
  apiErrorCode,
  CSRF_REJECTED_CODE,
  NOT_ACTIVE_MEMBER_CODE,
  UPLOAD_NOT_YOURS_CODE,
} from "../../../shared/api/causeErrorKey";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";

const NO_FEATURE_ACCESS_KEY = "quizshow:templates.errors.noFeatureAccess";
const NO_STAFF_ROLE_KEY = "quizshow:templates.errors.noStaffRole";
const OFFLINE_KEY = "quizshow:templates.errors.offline";
const SERVER_KEY = "quizshow:templates.errors.server";
const QUIZ_INVALID_KEY = "quizshow:templates.errors.quizInvalid";
const INVALID_INPUT_KEY = "quizshow:templates.errors.invalidInput";
const SIGNED_OUT_KEY = "quizshow:templates.errors.signedOut";
const MEMBERSHIP_INACTIVE_KEY = "quizshow:templates.errors.membershipInactive";
const FOREIGN_UPLOAD_KEY = "quizshow:templates.errors.foreignUpload";
const STALE_SESSION_KEY = "quizshow:templates.errors.staleSession";

const BAD_REQUEST_STATUS = 400;
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const REQUEST_TIMEOUT_STATUS = 408;

/**
 * The copy for each platform-coded 403 the backend sends, by its machine code
 * (`queerpulse-backend/src/common/coded-error.ts`). The member guard names a
 * lapsed membership; the upload ownership check names a picture stored by
 * another account; every CSRF guard refusal reads as a page whose session went
 * stale. A 403 with none of these codes is the role guard's refusal (Nest's
 * plain "Forbidden resource" carries no code) and reads as a missing staff role.
 */
const FORBIDDEN_KEY_BY_CODE: ReadonlyMap<string, string> = new Map([
  [NOT_ACTIVE_MEMBER_CODE, MEMBERSHIP_INACTIVE_KEY],
  [UPLOAD_NOT_YOURS_CODE, FOREIGN_UPLOAD_KEY],
  [CSRF_REJECTED_CODE, STALE_SESSION_KEY],
]);

function forbiddenKeyOf(error: ApiError): string {
  const platformCode = apiErrorCode(error);
  const codedKey =
    platformCode === null ? undefined : FORBIDDEN_KEY_BY_CODE.get(platformCode);
  return codedKey ?? NO_STAFF_ROLE_KEY;
}

/**
 * The copy key for a refused staff read or write on templates. A known quizshow
 * code names itself. An uncoded 400 is a field the server's validation refused,
 * and an uncoded 401 an ended session. A 403 reads by its platform code (see
 * `FORBIDDEN_KEY_BY_CODE`); any other one reads as an account without
 * the moderator or admin role, the role guard's refusal. The
 * feature guard answers an uncoded 404 for an account without Pulse Live access.
 * A request that never reached the server or timed out reads as offline;
 * anything else is a server problem.
 */
export function quizshowTemplateErrorKeyOf(error: unknown): string {
  const code = quizshowErrorCodeOf(error);
  if (code !== null) return quizshowErrorKeyOf(code);
  if (!(error instanceof ApiError)) return OFFLINE_KEY;
  switch (error.status) {
    case BAD_REQUEST_STATUS:
      return INVALID_INPUT_KEY;
    case UNAUTHORIZED_STATUS:
      return SIGNED_OUT_KEY;
    case FORBIDDEN_STATUS:
      return forbiddenKeyOf(error);
    case NOT_FOUND_STATUS:
      return NO_FEATURE_ACCESS_KEY;
    case REQUEST_TIMEOUT_STATUS:
      return OFFLINE_KEY;
    default:
      return SERVER_KEY;
  }
}

/** A publish refused for its quiz points at the problem list; other refusals read as above. */
export function quizshowTemplatePublishErrorKeyOf(error: unknown): string {
  const code = quizshowErrorCodeOf(error);
  if (code === "quizshow_quiz_invalid" || code === "quizshow_quiz_incomplete") {
    return QUIZ_INVALID_KEY;
  }
  return quizshowTemplateErrorKeyOf(error);
}

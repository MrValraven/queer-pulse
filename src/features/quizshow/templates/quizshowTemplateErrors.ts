import { ApiError } from "../../../shared/api/client";
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
 * The copy for each uncoded 403 the backend sends, by the exact message it
 * sends (the client puts it on `error.message`). The role guard answers with
 * Nest's own "Forbidden resource"; the member guard names a lapsed membership;
 * the upload ownership check names a picture stored by another account; the
 * CSRF guard names a token, a cross-site request or an origin it refused,
 * which all read as a page whose session went stale.
 */
const FORBIDDEN_KEY_BY_MESSAGE: ReadonlyMap<string, string> = new Map([
  ["Forbidden resource", NO_STAFF_ROLE_KEY],
  ["Active membership required", MEMBERSHIP_INACTIVE_KEY],
  ["Referenced upload does not belong to you", FOREIGN_UPLOAD_KEY],
  ["Invalid or missing CSRF token", STALE_SESSION_KEY],
  ["Cross-site request rejected", STALE_SESSION_KEY],
  ["Origin not allowed", STALE_SESSION_KEY],
]);

/**
 * The copy key for a refused staff read or write on templates. A known quizshow
 * code names itself. An uncoded 400 is a field the server's validation refused,
 * and an uncoded 401 an ended session. An uncoded 403 reads by its message
 * (see `FORBIDDEN_KEY_BY_MESSAGE`); any other one reads as an account without
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
      return FORBIDDEN_KEY_BY_MESSAGE.get(error.message) ?? NO_STAFF_ROLE_KEY;
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

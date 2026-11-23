import type { TFunction } from "../../../shared/i18n/types";

/**
 * The toast for a failed Google step-up, keyed by the `#reauthError=<code>`
 * the backend leaves on the page the member started from (PRD-502). Codes
 * come from `AuthController.googleCallback` (`invalid_state`,
 * `reauth_session_expired`, `reauth_account_mismatch`) and from
 * `OAuthCallbackFilter`, which carries Google's own allowlisted `?error=` or a
 * profile refusal. `oauth_failed`, the retired `reauth_failed` and any unknown
 * value share the general line; the raw code is never shown.
 */
const REAUTH_ERROR_KEYS: ReadonlyMap<string, string> = new Map([
  ["access_denied", "settings:reauth.completion.cancelled"],
  ["invalid_state", "settings:reauth.completion.timedOut"],
  ["reauth_session_expired", "settings:reauth.completion.sessionExpired"],
  ["reauth_account_mismatch", "settings:reauth.completion.wrongAccount"],
  ["admin_policy_enforced", "settings:reauth.completion.adminPolicy"],
  ["server_error", "settings:reauth.completion.googleServerError"],
  ["temporarily_unavailable", "settings:reauth.completion.googleUnavailable"],
  ["no_email", "settings:reauth.completion.noEmail"],
  ["email_unverified", "settings:reauth.completion.emailUnverified"],
  ["invalid_request", "settings:reauth.completion.googleSetup"],
  ["invalid_scope", "settings:reauth.completion.googleSetup"],
  ["unauthorized_client", "settings:reauth.completion.googleSetup"],
  ["unsupported_response_type", "settings:reauth.completion.googleSetup"],
]);

const GENERAL_FAILURE_KEY = "settings:reauth.completion.failed";

export function reauthErrorKey(code: string): string {
  return REAUTH_ERROR_KEYS.get(code) ?? GENERAL_FAILURE_KEY;
}

export function reauthErrorMessage(code: string, t: TFunction): string {
  return t(reauthErrorKey(code));
}

import { ApiError } from "../../../shared/api/client";

/**
 * Maps a failed vouch attempt to a specific, actionable message (PRD-425
 * replaced the single "try again" message every cause used to share).
 * `VouchService.createVouch` throws distinct failures the client can tell
 * apart mostly by HTTP status, plus two machine-readable codes and one
 * message-text check for the guards that carry neither:
 *
 * - 409 already vouched.
 * - 404 the member is gone or inactive (the vouchee lookup is an
 *   active-status join).
 * - 403 with `data.code === "ACCOUNT_RESTRICTED"` (`NotRestrictedGuard`): a
 *   moderation restriction, distinct from a block. This gets the shared,
 *   existing `shared:apiError.accountRestricted` copy, because that copy names the
 *   appeal route the way `errorHandling.ts` does for every other write this
 *   guard protects; the generic "blocked" copy would point at the target
 *   member and hide it.
 * - 403 with `data.code === "VOUCH_DAILY_LIMIT"` once the backend sends it;
 *   until then (and as a fallback after) the daily-cap message is the only
 *   403 whose text mentions "per day".
 * - 403 "Active membership required" (`ActiveMemberGuard`, which throws a
 *   plain string with no code): this is the VOUCHER's own membership going
 *   inactive, so it gets the generic `members:vouch.modal.error` copy. The
 *   "unavailable" copy names the target member, which would misplace the
 *   blame here.
 * - Any other 403 is a block on the target member.
 *
 * Demo mode and any other failure fall back to the generic
 * `members:vouch.modal.error` copy that already existed.
 */
export function vouchErrorMessageKey(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "members:vouch.modal.error";
  }
  if (error.status === 409) {
    return "members:vouch.modal.error.alreadyVouched";
  }
  if (error.status === 404) {
    return "members:vouch.modal.error.unavailable";
  }
  if (error.status === 403) {
    const code = (error.data as { code?: string } | null)?.code;
    if (code === "ACCOUNT_RESTRICTED") {
      return "shared:apiError.accountRestricted";
    }
    if (code === "VOUCH_DAILY_LIMIT" || /per day/i.test(error.message)) {
      return "members:vouch.modal.error.dailyCap";
    }
    if (/active membership/i.test(error.message)) {
      return "members:vouch.modal.error";
    }
    return "members:vouch.modal.error.blocked";
  }
  return "members:vouch.modal.error";
}

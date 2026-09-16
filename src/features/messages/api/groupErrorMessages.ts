import { ApiError } from "../../../shared/api/client";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import { MAX_GROUP_MEMBERS } from "../groupLimits";

/**
 * Coded backend refusals a group-management call can answer with (section 8
 * of the messaging scan). The backend follows the repo's existing coded-
 * exception convention (`BadRequestException({ code, message })` etc, see
 * `ApiError.data` in `shared/api/client.ts`); this maps each code to an i18n
 * toast key so every caller (add/invite members, join by link, accept an
 * invite, pin/unpin) shows the SAME bilingual copy for the SAME refusal
 * instead of each screen inventing its own text or falling back to the raw
 * server `message` (English-only, not one of ours).
 *
 * - `GROUP_FULL`: the group is at `MAX_GROUP_MEMBERS` active members. Reuses
 *   the picker's own `messages:group.fullToast` key (DES-229) so a member
 *   sees the SAME "this group can have up to {max} members" toast whether
 *   they hit the cap in a picker or on the server round-trip.
 * - `GROUP_DISSOLVED`: the group has ended; every write is refused.
 * - `GROUP_ADD_REFUSED`: PRD-354, the candidate is blocked either way with
 *   the adder or with any active member. Deliberately generic, never
 *   reveals who or which side blocked whom.
 * - `INVITE_NOT_FOUND`: the invite id no longer exists (already answered or
 *   revoked, or belongs to someone else).
 * - `INVITE_LINK_INVALID`: the join token is unknown, rotated away, or the
 *   group behind it was dissolved.
 * - `REMOVED_FROM_GROUP`: a previously-removed member tried to re-seat
 *   themself through the link/invite path.
 * - `PIN_LIMIT_REACHED`: `MAX_PINNED_MESSAGES` (50) already pinned.
 */
export type GroupErrorCode =
  | "GROUP_FULL"
  | "GROUP_DISSOLVED"
  | "GROUP_ADD_REFUSED"
  | "INVITE_NOT_FOUND"
  | "INVITE_LINK_INVALID"
  | "REMOVED_FROM_GROUP"
  | "PIN_LIMIT_REACHED";

/** i18n keys: copy lives in `scratchpad/i18n-B3.md`/`scratchpad/i18n-A4.md`
 *  until a catalog owner merges it (this build must not touch
 *  `src/shared/i18n/catalogs/**`). `GROUP_FULL` deliberately points at the
 *  picker's existing `messages:group.fullToast` (see `groupErrorParams`)
 *  instead of a second, near-duplicate "group full" toast string. */
const GROUP_ERROR_TOAST_KEYS: Record<GroupErrorCode, string> = {
  GROUP_FULL: "messages:group.fullToast",
  GROUP_DISSOLVED: "messages:group.error.groupDissolved",
  GROUP_ADD_REFUSED: "messages:group.error.addRefused",
  INVITE_NOT_FOUND: "messages:group.error.inviteNotFound",
  INVITE_LINK_INVALID: "messages:group.error.inviteLinkInvalid",
  REMOVED_FROM_GROUP: "messages:group.error.removedFromGroup",
  PIN_LIMIT_REACHED: "messages:group.error.pinLimitReached",
};

/** Template params a coded error's toast key needs, keyed the same way as
 *  `GROUP_ERROR_TOAST_KEYS` (most codes need none). */
function groupErrorParams(code: GroupErrorCode): TranslateOptions {
  return code === "GROUP_FULL" ? { max: MAX_GROUP_MEMBERS } : {};
}

const GROUP_ERROR_CODES = new Set<string>(Object.keys(GROUP_ERROR_TOAST_KEYS));

/** Pulls one of the codes above off an `ApiError`, else null (a network
 *  fault, an un-coded 500, or any other error shape). */
export function groupErrorCodeOf(error: unknown): GroupErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  const code = (error.data as { code?: string } | undefined)?.code;
  return code && GROUP_ERROR_CODES.has(code) ? (code as GroupErrorCode) : null;
}

/** The i18n key for a coded group error, else null. */
export function groupErrorToastKey(error: unknown): string | null {
  const code = groupErrorCodeOf(error);
  return code ? GROUP_ERROR_TOAST_KEYS[code] : null;
}

/** Resolves the bilingual toast copy for a group-management failure:
 *  `t(GROUP_ERROR_TOAST_KEYS[code])` for a recognised code, else `fallback`
 *  (the caller's own generic "something went wrong" copy). Callers:
 *
 *  ```ts
 *  onError: (error) =>
 *    showToast(
 *      groupErrorMessage(error, t, t("messages:group.error.generic")),
 *      "error",
 *    ),
 *  ```
 */
export function groupErrorMessage(
  error: unknown,
  t: TFunction,
  fallback: string,
): string {
  const code = groupErrorCodeOf(error);
  if (!code) return fallback;
  return t(GROUP_ERROR_TOAST_KEYS[code], groupErrorParams(code));
}

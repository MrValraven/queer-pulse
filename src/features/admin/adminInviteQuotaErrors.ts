import { ApiError } from "../../shared/api/client";
import { isAccountRestricted, reasonFor } from "../../shared/api/errorMessage";
import type { TFunction } from "../../shared/i18n/types";

/** True when the request never reached the server: a dropped connection, an
 *  offline device, or a fetch the browser refused. Only an `ApiError` carries
 *  a status the server sent. */
function isConnectionFailure(error: unknown): boolean {
  return !(error instanceof ApiError);
}

/**
 * The sentence a failed save shows on the member's row, naming the cause:
 * the member was removed, the admin lost access, the connection dropped, the
 * server failed, or the server's own reason when it sends one.
 */
export function describeInviteQuotaSaveError(
  error: unknown,
  memberName: string,
  t: TFunction,
): string {
  if (isConnectionFailure(error)) {
    return t("admin:adminInvites.quota.error.saveConnection", {
      name: memberName,
    });
  }
  if (isAccountRestricted(error)) return t("shared:apiError.accountRestricted");
  const apiError = error as ApiError;
  if (apiError.status === 404) {
    return t("admin:adminInvites.quota.error.memberGone", { name: memberName });
  }
  if (apiError.status === 403) {
    return t("admin:adminInvites.quota.error.adminOnly");
  }
  const reason = reasonFor(error);
  if (reason) {
    return t("admin:adminInvites.quota.error.saveWithReason", {
      name: memberName,
      reason: reason.replace(/\.$/, ""),
    });
  }
  return t("admin:adminInvites.quota.error.saveServer", { name: memberName });
}

/** The description under "Couldn't load invite limits", naming the cause in
 *  the same way as {@link describeInviteQuotaSaveError}. */
export function describeInviteQuotaLoadError(
  error: unknown,
  t: TFunction,
): string {
  if (isConnectionFailure(error)) {
    return t("admin:adminInvites.quota.error.loadConnection");
  }
  const apiError = error as ApiError;
  if (apiError.status === 403) {
    return t("admin:adminInvites.quota.error.adminOnly");
  }
  // The route itself is missing: a backend older than this list.
  if (apiError.status === 404) {
    return t("admin:adminInvites.quota.error.loadMissing");
  }
  const reason = reasonFor(error);
  if (reason) return reason;
  return t("admin:adminInvites.quota.error.loadServer");
}

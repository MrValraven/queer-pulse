import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";

/**
 * The cause lines for the member's own account writes: sessions, devices,
 * uploads, and the step-up gated lifecycle actions (deactivate, deletion,
 * export, data request). These are writes on the member's own account, so a
 * moderation restriction never applies (no `NotRestrictedGuard` on these
 * routes); signed out, a failed step-up, a throttle, a server fault and no
 * connection do. Statuses and sentences are quoted from queerpulse-backend
 * `account/account.service.ts`, `account/account.controller.ts`,
 * `my-media/my-media.service.ts` and `push/push.service.ts`.
 */

/** A plain own-account setting write (a toggle, a preference): no feature
 *  lines, just the shared causes. */
export function settingWriteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error);
}

function messageHas(error: ApiError, fragment: string): boolean {
  return error.message.toLowerCase().includes(fragment.toLowerCase());
}

/**
 * Deactivate and request-deletion both need a fresh step-up token. The
 * backend answers an expired or missing token with a 401 ("Recent
 * re-authentication required"), which the shared 401 line would misread as a
 * lost session, so this action says what to redo. A real session loss never
 * reaches a caller as a 401: the client refreshes or signs the member out
 * first.
 *
 * The 409s carry no machine code, only a sentence, so they are told apart by
 * it: "You're the only remaining admin..." and "A deletion request is already
 * scheduled". A reworded sentence falls through to the shared conflict line.
 * Candidates for backend codes (see the report).
 */
const STEP_UP_OVERRIDES: CauseErrorOverrides = {
  401: "settings:accountAction.error.reauthExpired",
};

export function accountStepUpErrorCopy(error: unknown): CauseErrorCopy {
  if (error instanceof ApiError && error.status === 409) {
    if (messageHas(error, "only remaining admin")) {
      return { key: "settings:accountAction.error.onlyAdmin" };
    }
    if (messageHas(error, "already scheduled")) {
      return { key: "settings:accountAction.error.deletionAlreadyScheduled" };
    }
  }
  return causeErrorKey(error, STEP_UP_OVERRIDES);
}

/** `DELETE /account/deletion-request`: 404 when nothing is pending, 409 once
 *  the erasure job has claimed the account (no code on either). */
export function cancelDeletionErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    404: "settings:accountAction.error.noPendingDeletion",
    409: "settings:accountAction.error.deletionProcessing",
  });
}

/** `POST /account/export`: step-up gated, throttled to 3 per hour. */
export function exportStartErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    401: "settings:accountAction.error.reauthExpired",
    429: "settings:accountAction.error.exportRateLimited",
  });
}

/** `POST /account/dsar`: step-up gated, throttled to 5 per hour. */
export function dsarSubmitErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    401: "settings:accountAction.error.reauthExpired",
    429: "settings:accountAction.error.dsarRateLimited",
  });
}

/** `DELETE /account/sessions/:id`: 404 when the session is already gone. */
export function sessionRevokeErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    404: "settings:sessions.error.notFound",
  });
}

/** `DELETE /push/subscriptions/:id`: 404 when the device is already removed. */
export function pushDeviceRemoveErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    404: "settings:pushDevices.error.notFound",
  });
}

/** `DELETE /me/media`: 403 an upload that is not the member's, 409 one that
 *  is still used somewhere (its references travel in the body), 503 when the
 *  reference check is degraded and the backend refuses rather than risk a live
 *  image. */
export function deleteUploadErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    403: "settings:uploads.delete.error.notYours",
    409: "settings:uploads.delete.error.stillUsed",
    503: "settings:uploads.delete.error.unverified",
  });
}

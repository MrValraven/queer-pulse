import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import { ApiError } from "../../shared/api/client";
import { reasonFor } from "../../shared/api/errorMessage";
import type { TFunction } from "../../shared/i18n/types";
import { PERSONA_EDIT_CONFLICT_CODE } from "./api/personaEditConflict";

/**
 * Why a persona action failed, said as the specific cause: the one error-copy
 * helper for the persona owner tools (endorse, delete, cover reposition,
 * reorder) and for the toasts that used to fall back to one retry line.
 *
 * Every line resolves through `causeErrorKey`: a moderation restriction, an
 * inactive membership, no connection, a rate limit and a server fault read
 * their shared `shared:apiError.*` line; this file adds only the lines the
 * persona routes can say themselves. The backend's machine `code` wins over
 * its HTTP status; its English sentence is read in exactly one place, marked
 * below, because that refusal carries no code.
 */

/** Resolves a cause line in the reader's language, filling in its values. */
export function personaCauseMessage(
  t: TFunction,
  copy: CauseErrorCopy,
): string {
  return t(copy.key, copy.values);
}

/** The cause line for a failure with no persona-specific refusal of its own. */
export function personaFallbackCauseMessage(
  error: unknown,
  t: TFunction,
): string {
  return personaCauseMessage(t, causeErrorKey(error));
}

/**
 * A toast that used to read `reasonFor(error) ?? "<one retry line>"`: the
 * server's own reason for a 4xx (English sentence, or a translated status line
 * in another language) and the shared cause for what `reasonFor` never shows
 * (a lost connection, a 404, a 5xx, a signed-out session).
 */
export function reasonOrCauseMessage(error: unknown, t: TFunction): string {
  return reasonFor(error) ?? personaFallbackCauseMessage(error, t);
}

/**
 * `POST/DELETE /subprofiles/:id/endorse` (`subprofile-endorsements.service
 * .ts`). The 400 for endorsing a persona you own or co-own carries no
 * machine `code`, so its English sentence is matched. The 404 is one status
 * for a persona that is missing, unpublished, taken down or blocked from this
 * viewer, on purpose, so its line says none of those. The route is throttled
 * to 20 a minute (429, the shared rate-limit line).
 */
const OWN_PERSONA_ENDORSE_SENTENCE = "You cannot endorse your own persona";

const ENDORSE_OVERRIDES: CauseErrorOverrides = {
  404: "subprofiles:hero.endorse.errorGone",
};

export function endorseErrorCopy(error: unknown): CauseErrorCopy {
  if (
    error instanceof ApiError &&
    error.status === 400 &&
    error.message.includes(OWN_PERSONA_ENDORSE_SENTENCE)
  ) {
    return { key: "subprofiles:hero.endorse.errorOwnPersona" };
  }
  return causeErrorKey(error, ENDORSE_OVERRIDES);
}

export function endorseErrorMessage(error: unknown, t: TFunction): string {
  return personaCauseMessage(t, endorseErrorCopy(error));
}

/** `DELETE /subprofiles/:id`: a 403 means the caller is not the creator
 *  ("Only the persona creator can delete it"); a 404 means it is gone. */
const DELETE_OVERRIDES: CauseErrorOverrides = {
  403: "subprofiles:mine.toastDeleteCreatorOnly",
  404: "subprofiles:mine.toastDeleteGone",
};

export function personaDeleteErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return personaCauseMessage(t, causeErrorKey(error, DELETE_OVERRIDES));
}

/** `PATCH /subprofiles/:id` from an owner bar (cover position, availability
 *  status): `PERSONA_EDIT_CONFLICT` (a co-owner saved first) by its code, and
 *  a 403 for a persona the caller no longer owns. */
const OWNER_PATCH_OVERRIDES: CauseErrorOverrides = {
  [PERSONA_EDIT_CONFLICT_CODE]: "subprofiles:ownerAction.conflict",
  403: "subprofiles:ownerAction.notOwner",
};

export function personaOwnerPatchErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return personaCauseMessage(t, causeErrorKey(error, OWNER_PATCH_OVERRIDES));
}

/** `PUT /subprofiles/order`: a 400 means the sent list is not exactly the
 *  caller's current personas (one was added, removed or left meanwhile). */
const REORDER_OVERRIDES: CauseErrorOverrides = {
  400: "subprofiles:mine.order.saveErrorStale",
};

export function personaReorderErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return personaCauseMessage(t, causeErrorKey(error, REORDER_OVERRIDES));
}

/** Restoring an earlier version of an item (`POST .../revisions/:id/restore`):
 *  a 403 means ownership lapsed, a 404 that the version no longer exists. A
 *  restriction, a lost connection and a fault read their shared lines. */
const RESTORE_REVISION_OVERRIDES: CauseErrorOverrides = {
  403: "subprofiles:ownerAction.notOwner",
  404: "subprofiles:history.restoreGone",
};

export function itemRevisionRestoreErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return personaCauseMessage(
    t,
    causeErrorKey(error, RESTORE_REVISION_OVERRIDES),
  );
}

import {
  causeErrorKey,
  type CauseErrorCopy,
} from "../../shared/api/causeErrorKey";

/**
 * The cause lines for the two optimistic stores that sync to the server in the
 * background: saved items (`SavedProvider`) and drafts (`DraftsProvider`). Both
 * roll back the optimistic change when the write fails, so the toast has to
 * say why it did not stick. Statuses are quoted from queerpulse-backend
 * `saved/saved.service.ts` and `drafts/drafts.service.ts` (no machine codes).
 */

/** `PUT /me/saved/:id`: no feature-specific cause beyond the shared ones. */
export function saveItemErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error);
}

/** `DELETE /me/saved/:id`: no feature-specific cause beyond the shared ones. */
export function unsaveItemErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error);
}

/** `POST /me/drafts`: 409 "You already have a draft with this id." */
export function createDraftErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, { 409: "members:drafts.error.idExists" });
}

/** `DELETE /me/drafts/:id`: 404 "Draft not found" (deleted elsewhere). */
export function removeDraftErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, { 404: "members:drafts.error.gone" });
}

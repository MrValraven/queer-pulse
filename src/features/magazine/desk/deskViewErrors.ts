import { ApiError } from "../../../shared/api/client";

const CONFLICT_STATUS = 409;

/**
 * The message key for a failed save or rename of a desk view, shown beside
 * the name field.
 *
 * The backend answers 409 for both a taken name and a full list. The dialogs
 * check both before sending, so a 409 here means another tab changed the
 * list in the meantime. A known-full list reads as the limit; otherwise the
 * refusal's own text decides, since only the taken-name refusal (backend and
 * `useDeskViews` pre-check alike) mentions the name. Any other failure is
 * the generic retry message.
 */
export function deskViewSaveErrorKey(
  error: unknown,
  isListFull: boolean,
): string {
  if (!(error instanceof ApiError) || error.status !== CONFLICT_STATUS) {
    return "magazine:desk.savedViews.saveFailed";
  }
  const isNameConflict = !isListFull && /\bname\b/i.test(error.message);
  return isNameConflict
    ? "magazine:desk.savedViews.duplicateName"
    : "magazine:desk.savedViews.limitReached";
}

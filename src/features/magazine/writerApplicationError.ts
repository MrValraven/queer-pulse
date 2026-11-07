import { ApiError } from "../../shared/api/client";
import { isAccountRestricted } from "../../shared/api/errorMessage";

/**
 * Turns a failed `POST /magazine/writer-applications` into the catalog key of
 * the specific reason, the way `messageRequestErrorKey` does for first-contact
 * refusals. Every failure the backend can return for this endpoint has a line
 * of its own (queerpulse-backend `magazine/writer-applications.service.ts`,
 * `dto/create-writer-application.dto.ts`, `auth/guards/active-member.guard.ts`
 * and the feature gate), plus one for a request that got no answer.
 *
 * This endpoint sends no machine `code`, only a status and an English
 * sentence, so the two statuses that hold more than one cause (400 and 409)
 * are told apart by that sentence. The sentences are quoted from the backend;
 * a reworded one falls through to the status-level line below it.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface WriterApplicationErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

function messageHas(error: ApiError, fragment: string): boolean {
  return error.message.toLowerCase().includes(fragment.toLowerCase());
}

function badRequestKey(error: ApiError): string {
  // The service's own refusal when neither a pasted sample nor a link is set.
  if (messageHas(error, "include a writing sample")) {
    return "magazine:applyToWrite.form.sampleRequiredError";
  }
  // class-validator messages from `CreateWriterApplicationDto`.
  if (messageHas(error, "samplelink must be a url")) {
    return "magazine:applyToWrite.form.error.linkInvalid";
  }
  if (messageHas(error, "sampletext must be shorter")) {
    return "magazine:applyToWrite.form.error.sampleTooLong";
  }
  if (messageHas(error, "pitchnote must be shorter")) {
    return "magazine:applyToWrite.form.error.pitchTooLong";
  }
  if (messageHas(error, "samplelink must be shorter")) {
    return "magazine:applyToWrite.form.error.linkTooLong";
  }
  return "shared:apiError.reasonInvalid";
}

function conflictKey(error: ApiError): string {
  if (messageHas(error, "already a magazine writer")) {
    return "magazine:applyToWrite.form.error.alreadyWriter";
  }
  if (messageHas(error, "application is already pending")) {
    return "magazine:applyToWrite.form.error.alreadyPending";
  }
  return "shared:apiError.reasonConflict";
}

export function writerApplicationErrorCopy(
  error: unknown,
): WriterApplicationErrorCopy {
  // No answer at all: fetch threw (offline, DNS, CORS) before any status.
  if (!(error instanceof ApiError)) {
    return { key: "magazine:applyToWrite.form.error.noConnection" };
  }
  if (isAccountRestricted(error)) {
    return { key: "shared:apiError.accountRestricted" };
  }
  switch (error.status) {
    case 400:
    case 422:
      return { key: badRequestKey(error) };
    case 401:
      return { key: "magazine:applyToWrite.form.error.signedOut" };
    case 403:
      return {
        key: messageHas(error, "active membership required")
          ? "magazine:applyToWrite.form.error.notActive"
          : "shared:apiError.forbidden",
      };
    case 404:
      return { key: "magazine:applyToWrite.form.error.notOpen" };
    case 408:
      return { key: "magazine:applyToWrite.form.error.timedOut" };
    case 409:
      return { key: conflictKey(error) };
    case 413:
      return { key: "magazine:applyToWrite.form.error.sampleTooLong" };
    case 429:
      return { key: "shared:apiError.reasonRateLimited" };
    default:
      if (error.status >= 500) {
        return { key: "magazine:applyToWrite.form.error.serverFault" };
      }
      return {
        key: "magazine:applyToWrite.form.error.refused",
        values: { status: error.status },
      };
  }
}

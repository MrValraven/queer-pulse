import { ApiError } from "../../shared/api/client";

/**
 * Turns a failed `POST /magazine/submissions` into the catalog key of the
 * specific reason, the way `writerApplicationErrorCopy` does for the
 * application form. Every failure the backend can return for this endpoint has
 * a line of its own (queerpulse-backend `magazine/magazine.controller.ts`
 * `createSubmission`, `magazine/dto/create-story-submission.dto.ts`,
 * `auth/guards/active-member.guard.ts`,
 * `storage/storage-key-ownership.interceptor.ts`, `security/csrf.guard.ts` and
 * the feature gates), plus one for a request that got no answer.
 *
 * What the backend does NOT refuse, so there is no line for it:
 *  - a member who is not an approved writer (any active member may submit;
 *    the writer role guards `/magazine/writer/*`, not this route),
 *  - a second submission (`StorySubmissionsService.create` always inserts),
 *  - a closed submission window (the issue deadline is shown to the member but
 *    never checked by `create`),
 *  - a restricted account (this handler has no `NotRestrictedGuard`).
 *
 * This endpoint sends no machine `code`, only a status and an English sentence,
 * so the two statuses that hold more than one cause (400 and 403) are told apart
 * by that sentence. The sentences are quoted from the backend; a reworded one
 * falls through to the status-level line below it.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface SubmitStoryErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

function messageHas(error: ApiError, fragment: string): boolean {
  return error.message.toLowerCase().includes(fragment.toLowerCase());
}

function badRequestKey(error: ApiError): string {
  // class-validator messages from `CreateStorySubmissionDto`. The client joins
  // an array of messages with ", ", so every fragment is searched for.
  if (messageHas(error, "workingtitle must be shorter")) {
    return "magazine:submitStory.editor.error.headlineTooLong";
  }
  if (messageHas(error, "deck must be shorter")) {
    return "magazine:submitStory.editor.error.deckTooLong";
  }
  if (messageHas(error, "body must be shorter")) {
    return "magazine:submitStory.editor.error.bodyTooLong";
  }
  if (messageHas(error, "coverimagekey must be")) {
    return "magazine:submitStory.editor.error.coverInvalid";
  }
  return "shared:apiError.reasonInvalid";
}

export function submitStoryErrorCopy(error: unknown): SubmitStoryErrorCopy {
  // No answer at all: fetch threw (offline, DNS, CORS) before any status.
  if (!(error instanceof ApiError)) {
    return { key: "magazine:submitStory.editor.error.noConnection" };
  }
  switch (error.status) {
    case 400:
    case 422:
      return { key: badRequestKey(error) };
    case 401:
      return { key: "magazine:submitStory.editor.error.signedOut" };
    case 403:
      // `ActiveMemberGuard` throws 'Active membership required';
      // `StorageKeyOwnershipInterceptor` throws 'Referenced upload does not
      // belong to you' for a cover key another member uploaded. Any other 403 is
      // the CsrfGuard refusing after the client already re-fetched its token.
      if (messageHas(error, "active membership required")) {
        return { key: "magazine:submitStory.editor.error.notActive" };
      }
      if (messageHas(error, "upload does not belong to you")) {
        return { key: "magazine:submitStory.editor.error.coverNotYours" };
      }
      return { key: "magazine:submitStory.editor.error.securityCheck" };
    case 404:
      // The `magazine` feature gate ('This feature is not available yet.').
      return { key: "magazine:submitStory.editor.error.notOpen" };
    case 408:
      return { key: "magazine:submitStory.editor.error.timedOut" };
    case 413:
      // Express's default JSON body limit; the DTO allows 120,000 characters of
      // body, which can pass 100 kB once accents and quotes are encoded.
      return { key: "magazine:submitStory.editor.error.bodyTooLarge" };
    case 429:
      return { key: "shared:apiError.reasonRateLimited" };
    default:
      if (error.status >= 500) {
        return { key: "magazine:submitStory.editor.error.serverFault" };
      }
      return {
        key: "magazine:submitStory.editor.error.refused",
        values: { status: error.status },
      };
  }
}

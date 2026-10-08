import { ApiError } from "../../shared/api/client";

/** The backend's sentence for a business that cannot take a new "Run by"
 *  link: unknown, paused, permanently closed, or hidden by a moderator. */
const RUN_BY_NOT_FOUND_MESSAGE = "Run by listing not found";

/** The backend's code for an organiser who does not run the business. */
const RUN_BY_NOT_MANAGER_CODE = "RUN_BY_NOT_MANAGER";

/**
 * Did the server refuse the gathering's "Run by" business? A duplicate, a
 * resumed draft or a co-host's edit can name a business that has been paused
 * or hidden since, or one this organiser does not run. The form reads this
 * and points at the "Run by" field, where the generic failure would only
 * offer a retry.
 */
export function isRefusedRunByListingError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 400) {
    return error.message.includes(RUN_BY_NOT_FOUND_MESSAGE);
  }
  if (error.status !== 403) return false;
  const body = error.data;
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { code?: unknown }).code === RUN_BY_NOT_MANAGER_CODE
  );
}

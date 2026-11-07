import { ApiError } from "../../shared/api/client";

/**
 * Turns a failed load of the writer workspace (`GET /magazine/writer/assignments`,
 * `/pitches` and `/payments`, which share one controller and one guard chain)
 * into the catalog key of the specific reason, the way
 * `writerApplicationErrorCopy` does for the application form. Every failure
 * those routes can return has a line of its own (queerpulse-backend
 * `magazine/magazine-writer.controller.ts`, `auth/guards/active-member.guard.ts`,
 * `auth/guards/staff-roles.guard.ts` and the feature gates), plus one for a
 * request that got no answer.
 *
 * None of the three reads can answer 400, 409 or 413: they take no body, no
 * params and no query. They carry no `@Throttle` of their own, so a 429 can
 * only be the global throttler. The "restricted account" refusal is not used on
 * this controller either, so it has no line here.
 *
 * Only one status holds more than one cause (403), and it is told apart by the
 * backend's English sentence, quoted below. A reworded one falls through to the
 * writer-role line, which is the other cause of that status.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface WriterWorkspaceErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

function messageHas(error: ApiError, fragment: string): boolean {
  return error.message.toLowerCase().includes(fragment.toLowerCase());
}

export function writerWorkspaceErrorCopy(
  error: unknown,
): WriterWorkspaceErrorCopy {
  // No answer at all: fetch threw (offline, DNS, CORS) before any status.
  if (!(error instanceof ApiError)) {
    return { key: "magazine:writer.page.error.noConnection" };
  }
  switch (error.status) {
    case 401:
      return { key: "magazine:writer.page.error.signedOut" };
    case 403:
      // `ActiveMemberGuard` throws 'Active membership required'; the other 403
      // is `StaffRolesGuard` returning false (Nest's default 'Forbidden
      // resource') for an account without the `magazine_writer` role.
      return {
        key: messageHas(error, "active membership required")
          ? "magazine:writer.page.error.notActive"
          : "magazine:writer.page.error.notWriter",
      };
    case 404:
      // The `magazine` feature gate ('This feature is not available yet.').
      return { key: "magazine:writer.page.error.notOpen" };
    case 408:
      return { key: "magazine:writer.page.error.timedOut" };
    case 422:
      // Only the API client raises 422 on a read: a 2xx body that was not JSON.
      return { key: "magazine:writer.page.error.unreadable" };
    case 429:
      return { key: "shared:apiError.reasonRateLimited" };
    default:
      if (error.status >= 500) {
        return { key: "magazine:writer.page.error.serverFault" };
      }
      return {
        key: "magazine:writer.page.error.refused",
        values: { status: error.status },
      };
  }
}

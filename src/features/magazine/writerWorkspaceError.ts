import { SHARED_CAUSE_KEY } from "../../shared/api/causeErrorKey";
import {
  magazineCauseErrorCopy,
  PLATFORM_LOCKED_CODE,
  type MagazineCauseLines,
} from "./magazineCauseError";

/**
 * Turns a failed load of the writer workspace (`GET /magazine/writer/assignments`,
 * `/pitches` and `/payments`, which share one controller and one guard chain)
 * into the catalog key of the specific reason. Every failure those routes can
 * return has a line of its own (queerpulse-backend
 * `magazine/magazine-writer.controller.ts`, `auth/guards/active-member.guard.ts`,
 * `auth/guards/staff-roles.guard.ts`, `common/platform-lockdown.guard.ts` and
 * the feature gates), plus one for a request that got no answer.
 *
 * The reads carry no magazine code of their own: they take no body, params or
 * query, and the services behind them throw nothing. The one coded refusal
 * they can get is the platform lock (`PLATFORM_LOCKED`). 400, 409 and 413
 * cannot happen here and fall through to the shared line for their status,
 * as does any code a newer backend adds. GETs skip the CSRF check, so a 403
 * is never a stale security token.
 *
 * The two 403 causes: `ActiveMemberGuard` (code `ACTIVE_MEMBERSHIP_REQUIRED`,
 * named by the shared classifier and worded below as this page's `notActive`
 * line) and `StaffRolesGuard` returning false for an account without the
 * `magazine_writer` role, which sends no code and is every other 403.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface WriterWorkspaceErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

const WRITER_WORKSPACE_LINES: MagazineCauseLines = {
  codeKeys: {
    [PLATFORM_LOCKED_CODE]: "magazine:writer.page.error.maintenance",
  },
  statusKeys: {
    401: "magazine:writer.page.error.signedOut",
    403: "magazine:writer.page.error.notWriter",
    // The `magazine` feature gate.
    404: "magazine:writer.page.error.notOpen",
    408: "magazine:writer.page.error.timedOut",
    // Only the API client raises 422 on a read: a 2xx body that was not JSON.
    422: "magazine:writer.page.error.unreadable",
  },
  sharedKeys: {
    [SHARED_CAUSE_KEY.noConnection]: "magazine:writer.page.error.noConnection",
    [SHARED_CAUSE_KEY.notActive]: "magazine:writer.page.error.notActive",
    [SHARED_CAUSE_KEY.serverFault]: "magazine:writer.page.error.serverFault",
    [SHARED_CAUSE_KEY.refused]: "magazine:writer.page.error.refused",
  },
};

export function writerWorkspaceErrorCopy(
  error: unknown,
): WriterWorkspaceErrorCopy {
  return magazineCauseErrorCopy(error, WRITER_WORKSPACE_LINES);
}

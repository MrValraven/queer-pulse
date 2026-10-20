import type { ReportSubjectType } from "../safety/reportReasons";
import { studioClaimNewPath } from "../studio/studioClaimPaths";

/** Studio safety (spec 4.2): on a Studio track or release, `copyright`
 *  opens the claim form and files nothing (the server refuses it with 422
 *  `studio_use_copyright_claim`). Null on every other subject, which keeps
 *  filing it. A release report asks which track first. */
export function copyrightClaimRouteFor(
  subjectType: ReportSubjectType,
  subjectId: string,
): string | null {
  if (subjectType === "studio_track")
    return studioClaimNewPath({ trackId: subjectId });
  if (subjectType === "studio_release")
    return studioClaimNewPath({ releaseId: subjectId });
  return null;
}

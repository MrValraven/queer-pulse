import type { SubprofileView } from "../api/subprofiles.adapters";

/**
 * Whether a persona can join a business team: published, visible to members or
 * everyone, with a handle. The server refuses anything else.
 */
export function isPersonaTeamEligible(
  subprofile: Pick<SubprofileView, "status" | "visibility" | "handle">,
): boolean {
  return (
    subprofile.status === "published" &&
    subprofile.visibility !== "private" &&
    subprofile.handle !== null &&
    subprofile.handle.trim().length > 0
  );
}

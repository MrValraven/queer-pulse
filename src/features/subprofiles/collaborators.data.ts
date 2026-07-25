import { personaPath, routes } from "../../app/routeMap";
import type { CollaboratorDTO } from "./api/subprofiles.api";

/** Max collaborator credits per item (mirrors the backend cap). */
export const MAX_COLLABORATORS = 10;

/** Where a collaborator credit links to: a member's main profile
 *  (`/members/:slug`) when `type === "member"`, or a standalone persona's
 *  public page (`/p/:handle`) when `type === "persona"` — personas have no
 *  slug, so they resolve by handle. */
export function collaboratorHref(collaborator: CollaboratorDTO): string {
  return collaborator.type === "member" && collaborator.slug
    ? `${routes.members}/${collaborator.slug}`
    : personaPath(collaborator.handle);
}

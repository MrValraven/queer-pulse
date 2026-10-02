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

/** How many connections the collaborator search lists at once. */
export const COLLABORATOR_RESULT_LIMIT = 6;

/** How long the collaborator search waits after the last keystroke before it
 *  asks the server. */
export const COLLABORATOR_SEARCH_DEBOUNCE_MS = 300;

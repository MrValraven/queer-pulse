import { routes } from "../../app/routeMap";

/* Link helpers split out of ForumAuthor.tsx so that file only exports
 * components (react-refresh/only-export-components). */

/** Profile path for a member slug (canonical member page). */
export const memberPath = (slug: string) => `/members/${slug}`;

/** Where an author's name/avatar should link, or undefined if it shouldn't.
 * Official posts point at the governance page (who runs QueerPulse and how);
 * real members point at their profile. */
export function authorHref(person: {
  slug?: string;
  official?: boolean;
}): string | undefined {
  if (person.official) return routes.governance;
  if (person.slug) return memberPath(person.slug);
  return undefined;
}

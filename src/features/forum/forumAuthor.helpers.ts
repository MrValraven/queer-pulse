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

/**
 * Is this thread's byline the server's MASKED one?
 *
 * An anonymous thread reaches an ordinary reader with its author block already
 * masked: an EMPTY handle, which is what makes the name link nowhere. A
 * moderator receives the real author instead, with `isAnonymous` still true
 * beside it, because anonymity is a rendering decision for the room rather than
 * a gap in the record.
 *
 * So the test is the empty handle, never `isAnonymous` on its own: this reads
 * what the response decided rather than deciding it a second time, and a
 * moderator's view keeps the real name it was sent. `official` is excluded
 * because the institutional byline is a name the platform chose to publish
 * under, and it links to governance.
 */
export function isMaskedByline(thread: {
  isAnonymous?: boolean;
  author: { slug?: string; official?: boolean };
}): boolean {
  return !!thread.isAnonymous && !thread.author.slug && !thread.author.official;
}

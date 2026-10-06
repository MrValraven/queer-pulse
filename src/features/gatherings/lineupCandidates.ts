import type { MemberSelectPerson } from "../../shared/components/ui";

/** A going attendee as the lineup picker needs them. */
export interface GoingCandidate {
  slug: string;
  name: string;
  pronouns?: string;
}

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * The lineup picker's pool: the host's server-searched connections first,
 * then anyone going to the gathering who is not already among them, filtered
 * locally by the same query (accent-insensitive, name or slug, a leading "@"
 * ignored as `useConnectionsSearch` does). One row per slug.
 */
export function buildLineupCandidates(
  connections: MemberSelectPerson[],
  goingAttendees: GoingCandidate[],
  searchQuery: string,
): MemberSelectPerson[] {
  const needle = fold(searchQuery.trim().replace(/^@+/, ""));
  const connectionSlugs = new Set(connections.map((person) => person.slug));
  const matchingGoing = goingAttendees
    .filter((attendee) => !connectionSlugs.has(attendee.slug))
    .filter(
      (attendee) =>
        needle === "" ||
        fold(attendee.name).includes(needle) ||
        fold(attendee.slug).includes(needle),
    )
    .map((attendee) => ({
      slug: attendee.slug,
      name: attendee.name,
      pronouns: attendee.pronouns,
    }));
  return [...connections, ...matchingGoing];
}

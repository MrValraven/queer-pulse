import type { Person } from "./communityDetails";
import type { RosterMember } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { memberProfiles } from "../members/data/memberProfiles";

/**
 * Resolve a person's avatar photo: their own `avatarUrl` (the real picture the
 * owner/member set on their profile) when present, otherwise the static
 * registry photo their slug maps to. Undefined → the Avatar renders initials.
 *
 * The registry fallback is DEMO-ONLY — pass `demoMode` from the caller's
 * `useDemoMode()`. In live mode a real person without an `avatarUrl` must render
 * initials rather than borrow a mock persona's photo on a slug collision. The
 * default (`false`) is the safe direction: a caller that forgets loses a mock
 * avatar in demo mode, never leaks one into production.
 */
export function photoOf(person: Person, demoMode = false): string | undefined {
  return (
    person.avatarUrl ??
    (demoMode && person.slug ? memberProfiles[person.slug]?.photo : undefined)
  );
}

/**
 * Build a role lookup from a roster — matches a Person to their role by slug
 * (preferred) or name, so role badges render wherever an author appears.
 */
export function roleLookup(
  roster: RosterMember[],
): (person: Person) => CommunityRole | undefined {
  const bySlug = new Map<string, CommunityRole>();
  const byName = new Map<string, CommunityRole>();
  for (const m of roster) {
    if (m.slug) bySlug.set(m.slug, m.role);
    byName.set(m.name, m.role);
  }
  return (person) =>
    (person.slug && bySlug.get(person.slug)) || byName.get(person.name);
}

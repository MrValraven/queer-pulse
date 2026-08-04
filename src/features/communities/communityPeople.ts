import type { Person } from "./communityDetails";
import type { RosterMember } from "./community.model";
import type { CommunityRole } from "./membership.types";
import type { AuthUser } from "../auth/api/auth.api";
import { memberProfiles } from "../members/data/memberProfiles";

/**
 * The signed-in viewer as a community `Person`, so their own optimistic posts
 * and replies render with their real name, initials and avatar instead of a
 * generic "You". Reads the session user from `useAuth()` (the real member in
 * both demo and live mode) — never the mock registry. Returns null when logged
 * out, so the call site keeps its own fallback.
 */
export function viewerPerson(user: AuthUser | null): Person | null {
  if (!user) return null;
  const { firstName, lastName, slug, avatarUrl } = user.profile;
  const name = [firstName, lastName].filter(Boolean).join(" ") || firstName;
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}` || firstName.slice(0, 2);
  return {
    initials: initials.toUpperCase(),
    name,
    tint: "plum",
    slug,
    avatarUrl: avatarUrl ?? undefined,
  };
}

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

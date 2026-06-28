import type { Person } from './communityDetails'
import type { RosterMember } from './community.model'
import type { CommunityRole } from './membership.types'
import { memberProfiles } from '../members/data/memberProfiles'

/** Resolve a registry photo for a person, when their slug maps to one. */
export function photoOf(person: Person): string | undefined {
  return person.slug ? memberProfiles[person.slug]?.photo : undefined
}

/**
 * Build a role lookup from a roster — matches a Person to their role by slug
 * (preferred) or name, so role badges render wherever an author appears.
 */
export function roleLookup(roster: RosterMember[]): (person: Person) => CommunityRole | undefined {
  const bySlug = new Map<string, CommunityRole>()
  const byName = new Map<string, CommunityRole>()
  for (const m of roster) {
    if (m.slug) bySlug.set(m.slug, m.role)
    byName.set(m.name, m.role)
  }
  return (person) => (person.slug && bySlug.get(person.slug)) || byName.get(person.name)
}

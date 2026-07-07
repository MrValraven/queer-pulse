import type { AvatarTint } from "../components/ui/Avatar";

/**
 * Shared API primitives used across every domain (communities, companies, jobs,
 * volunteering, partners). `MemberRef` is how the backend surfaces authorship /
 * ownership on any resource; `Paginated<T>` is the standard list envelope.
 */

/** A lightweight reference to a member — the author/owner/steward of a resource. */
export interface MemberRefDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

/** Standard paginated envelope returned by every `GET /<domain>?page=` list. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** The subset of avatar tints tintForSlug assigns (its deterministic palette).
 *  Narrower than AvatarTint on purpose — view-models like CompanyTeamAv.tone and
 *  the partners tint map only accept coral/jade/plum. */
const TINTS = ["coral", "plum", "jade"] as const;
export type SlugTint = (typeof TINTS)[number];

/**
 * Deterministic avatar tint from a slug — stable across renders/sessions.
 * Canonical home for the helper; feature adapters (e.g. members.adapters) keep
 * their own copies for their view-models, but new domains reuse this one.
 */
export function tintForSlug(slug: string): SlugTint {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length]!;
}

/** Two-letter initials from a first/last name pair. */
export function initialsOf(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

/** A member reference normalized for rendering an avatar + display name. */
export interface Person {
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  avatarUrl: string | null;
  tint: AvatarTint;
}

/**
 * Map a (possibly null) `MemberRef` DTO to a render-ready `Person`, or `null`
 * when the backend omitted the author (deleted member, private, etc.). Domains
 * layer their own view-model fields over this.
 */
export function memberRefToPerson(
  ref: MemberRefDTO | null | undefined,
): Person | null {
  if (!ref) return null;
  return {
    slug: ref.slug,
    name: `${ref.firstName} ${ref.lastName}`.trim(),
    firstName: ref.firstName,
    lastName: ref.lastName,
    initials: initialsOf(ref.firstName, ref.lastName),
    avatarUrl: ref.avatarUrl ?? null,
    tint: tintForSlug(ref.slug),
  };
}

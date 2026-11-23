import type { AvatarTint } from "../components/ui/Avatar";
import { catalogs } from "../i18n/catalogs";
import { detectLanguage } from "../i18n/locale";
import type { TFunction } from "../i18n/types";
import { initialsFromParts } from "../lib/initials";

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
  /**
   * Present (and `true`) only on the stand-in the backend sends for a member
   * whose account is paused, suspended or inside the deletion grace. The
   * stand-in carries an empty slug, empty names and no photo, so a renderer
   * shows {@link INACTIVE_MEMBER_LABEL_KEY}, links nowhere and draws no face.
   * Two stand-ins on one list share the empty slug, so a list keys them by
   * something else (the row id, or the slug plus the index).
   */
  isInactiveMember?: true;
}

/** The label every person renderer shows for an inactive member's stand-in. */
export const INACTIVE_MEMBER_LABEL_KEY = "common:member.inactiveLabel";

/**
 * The inactive label resolved outside React, for an adapter that maps a DTO
 * with no translator in reach (the Studio playlist views, `memberRefToPerson`
 * called without `translate`). `common` is an eager shell namespace for both languages,
 * so this reads it synchronously in the persisted language, the same way
 * `activeLocale()` resolves the locale. Inside a component, prefer
 * `t(INACTIVE_MEMBER_LABEL_KEY)`, which follows a language switch at once.
 */
export function inactiveMemberLabel(): string {
  const path = "member.inactiveLabel";
  return (
    catalogs[detectLanguage()].common[path] ?? catalogs.en.common[path] ?? ""
  );
}

/**
 * True for the backend's "[deactivated member]" stand-in. Takes any object so
 * the flattened author shapes (`AuthorSummary`, the pulse author) can be
 * asked too: they carry the same optional flag beside an empty display name
 * and handle.
 */
export function isInactiveMemberRef(ref: object | null | undefined): boolean {
  return (
    ref != null && "isInactiveMember" in ref && ref.isInactiveMember === true
  );
}

/**
 * The byline for a flattened author (`{ displayName, handle }`): the inactive
 * label for the stand-in, the display name otherwise.
 */
export function authorDisplayName(
  author: { displayName: string },
  translate: TFunction,
): string {
  return isInactiveMemberRef(author)
    ? translate(INACTIVE_MEMBER_LABEL_KEY)
    : author.displayName;
}

/**
 * The name a person renderer shows for a ref: the inactive label for the
 * stand-in, the trimmed full name otherwise, and "" for an absent ref (the
 * caller picks its own wording for an erased account).
 */
export function memberRefDisplayName(
  ref: MemberRefDTO | null | undefined,
  translate: TFunction,
): string {
  if (!ref) return "";
  if (isInactiveMemberRef(ref)) return translate(INACTIVE_MEMBER_LABEL_KEY);
  return `${ref.firstName} ${ref.lastName}`.trim();
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

/** Two-letter initials from a first/last name pair.
 *  Thin re-export of the canonical helper, kept for its many existing callers. */
export const initialsOf = initialsFromParts;

/** A member reference normalized for rendering an avatar + display name. */
export interface Person {
  slug: string;
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  avatarUrl: string | null;
  tint: AvatarTint;
  /** Set on the inactive member's stand-in, whose slug, photo and initials
   *  are all blank. */
  isInactiveMember?: boolean;
}

/**
 * Map a (possibly null) `MemberRef` DTO to a render-ready `Person`, or `null`
 * when the backend omitted the author (deleted member, private, etc.). Domains
 * layer their own view-model fields over this.
 *
 * The inactive stand-in maps to a person with an empty slug (so nothing links
 * to a profile), an empty photo and initials, and the neutral tint. Its `name` is the
 * translated inactive label: through `translate` when the caller passes one,
 * and through `inactiveMemberLabel()` otherwise, so no byline renders blank.
 */
export function memberRefToPerson(
  ref: MemberRefDTO | null | undefined,
  translate?: TFunction,
): Person | null {
  if (!ref) return null;
  if (isInactiveMemberRef(ref)) {
    return {
      slug: "",
      name: translate
        ? translate(INACTIVE_MEMBER_LABEL_KEY)
        : inactiveMemberLabel(),
      firstName: "",
      lastName: "",
      initials: "",
      avatarUrl: null,
      tint: "default",
      isInactiveMember: true,
    };
  }
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

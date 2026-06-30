import type { Member } from '../data/members'
import type { AvatarTint } from '../../../shared/components/ui/Avatar'
import type { MemberCardDTO, ProfileDTO } from './members.api'
import type { MemberCard } from '../memberDirectoryFilter.data'

const TINTS: AvatarTint[] = ['coral', 'plum', 'jade']

/** Deterministic avatar tint from a slug (stable across renders/sessions). */
export function tintForSlug(slug: string): AvatarTint {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0
  return TINTS[h % TINTS.length]!
}

export function initialsOf(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

/** Map a directory card DTO to the prototype's Member shape, defaulting the rest. */
export function cardToMember(dto: MemberCardDTO): Member {
  return {
    id: 0,
    slug: dto.slug,
    first: dto.firstName,
    last: dto.lastName,
    role: dto.tagline ?? '',
    pronouns: dto.pronouns,
    hood: '',
    tags: dto.tags ?? [],
    visibility: dto.visibility,
    initials: initialsOf(dto.firstName, dto.lastName),
    tint: tintForSlug(dto.slug),
    photo: dto.avatarUrl ?? undefined,
    verified: false,
    since: '',
    bio: '',
    now: '',
    openTo: [],
    work: [],
    board: [],
    // Placeholder entries preserve the vouch COUNT; faces resolve via getVouchers.
    vouchers: Array.from({ length: dto.vouchCount }, (_, i) => `__vouch_${i}`),
    voucherNames: '',
    related: [],
    shapings: {},
    skills: [],
    groups: [],
    activity: [],
  }
}

/** Map the thin GET /members card DTO to the directory's rich MemberCard.
 *  Filter-only fields the API doesn't provide are defaulted (live-mode filters
 *  on those dimensions are no-ops — a documented known gap). */
export function cardDtoToMemberCard(dto: MemberCardDTO): MemberCard {
  return {
    slug: dto.slug,
    meta: dto.pronouns ?? dto.tagline ?? '',
    role: dto.tagline ?? '',
    firstName: dto.firstName,
    lastName: dto.lastName,
    avatarUrl: dto.avatarUrl ?? null,
    tags: (dto.tags ?? []).map((label) => ({ label })),
    vouch: '',
    mutuals: '',
    openTo: [],
    hood: '',
    discipline: '',
    profession: '',
    identities: [],
    languages: [],
    years: 0,
    activeRank: 0,
    joinedRank: 0,
    vouchCount: dto.vouchCount,
    mutualsCount: 0,
  }
}

/** Map a full profile DTO, layering the richer fields over the card mapping. */
export function profileToMember(dto: ProfileDTO): Member {
  return {
    ...cardToMember(dto),
    role: dto.tagline ?? '',
    hood: dto.location ?? '',
    bio: dto.bio ?? '',
    openTo: dto.openTo ?? [],
    work: (dto.work ?? []).map((w) => ({
      category: w.category,
      title: w.title,
      year: w.year,
      image: w.imageUrl,
    })),
  }
}

import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiEdit3,
  FiFileText,
  FiMessageCircle,
  FiMusic,
} from "react-icons/fi";
import type { Member } from "../data/members";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import { initialsFromParts } from "../../../shared/lib/initials";
import {
  OPEN_TO_PRESETS,
  type OpenToEntry,
  type OpenToId,
} from "../openTo.data";
import type { WorkLink, WorkRefEntity } from "../workLink.data";
import type {
  ActivityKind,
  BoardItemDTO,
  GroupMembershipDTO,
  MemberCardDTO,
  OpenToEntryDTO,
  ProfileDTO,
  ShapingItemDTO,
  ShapingKind,
  SkillItemDTO,
  SocialLinkDTO,
  WorkItemDTO,
} from "./members.api";
import type { MemberCard } from "../memberDirectoryFilter.data";

const TINTS: AvatarTint[] = ["coral", "plum", "jade"];

const KNOWN_OPEN_TO_IDS = new Set<string>(
  OPEN_TO_PRESETS.map((preset) => preset.id),
);

/** Map wire entries to the domain union, dropping preset ids this build doesn't
 *  know (a backend ahead of the frontend must not crash the profile) and
 *  customs with no text. */
export function toOpenToEntries(dto?: OpenToEntryDTO[]): OpenToEntry[] {
  return (dto ?? []).flatMap((entry): OpenToEntry[] => {
    if (entry.kind === "preset") {
      return KNOWN_OPEN_TO_IDS.has(entry.id)
        ? [{ kind: "preset", id: entry.id as OpenToId }]
        : [];
    }
    const label = entry.label?.trim();
    return label ? [{ kind: "custom", label }] : [];
  });
}

/** Backend activity kinds → the icon each renders with in "Recent activity". */
const ACTIVITY_ICONS: Record<ActivityKind, IconType> = {
  post: FiFileText,
  event: FiCalendar,
  message: FiMessageCircle,
  reading: FiBookOpen,
  edit: FiEdit3,
  photo: FiCamera,
  music: FiMusic,
};

const KNOWN_WORK_REF_ENTITIES = new Set<WorkRefEntity>([
  "collection",
  "filmmaker",
  "curator",
  "gathering",
  "place",
]);

/** Reconstruct a work item's link union from the wire's flat ref/href fields,
 *  dropping a `refEntity` this build doesn't know (same not-crash principle as
 *  `toOpenToEntries`) rather than sending the viewer to a broken path. */
function toWorkLink(dto: WorkItemDTO): WorkLink | undefined {
  if (
    dto.refEntity &&
    dto.refSlug &&
    KNOWN_WORK_REF_ENTITIES.has(dto.refEntity as WorkRefEntity)
  ) {
    return {
      kind: "ref",
      entity: dto.refEntity as WorkRefEntity,
      slug: dto.refSlug,
    };
  }
  if (dto.href) return { kind: "external", href: dto.href };
  return undefined;
}

/** Format an ISO join date to the year the hero shows ("2024"); "" if absent. */
function joinYear(iso?: string): string {
  const year = iso?.slice(0, 4) ?? "";
  return /^\d{4}$/.test(year) ? year : "";
}

/** Deterministic avatar tint from a slug (stable across renders/sessions). */
export function tintForSlug(slug: string): AvatarTint {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length]!;
}

/** Thin re-export of the canonical helper, kept for its many existing callers. */
export const initialsOf = initialsFromParts;

/** Map a directory card DTO to the prototype's Member shape, defaulting the rest. */
export function cardToMember(dto: MemberCardDTO): Member {
  return {
    id: 0,
    slug: dto.slug,
    first: dto.firstName,
    last: dto.lastName,
    role: dto.tagline ?? "",
    pronouns: dto.pronouns,
    hood: dto.location ?? "",
    tags: dto.tags ?? [],
    visibility: dto.visibility,
    initials: initialsOf(dto.firstName, dto.lastName),
    tint: tintForSlug(dto.slug),
    photo: dto.avatarUrl ?? undefined,
    verified: false,
    since: "",
    bio: "",
    now: "",
    openTo: toOpenToEntries(dto.openTo),
    work: [],
    board: [],
    // Placeholder entries preserve the vouch COUNT; faces resolve via getVouchers.
    vouchers: Array.from({ length: dto.vouchCount }, (_, i) => `__vouch_${i}`),
    voucherNames: "",
    related: [],
    shapings: {},
    skills: [],
    groups: [],
    activity: [],
  };
}

/** Map the thin GET /members card DTO to the directory's rich MemberCard. All
 *  filter facets the API returns are populated for real now — every facet
 *  filters server-side (see MemberDirectoryFilterPage), so these fields are
 *  DISPLAY/count-badge data here, never re-run through `matchesFilters` in
 *  live mode (the server's page is already the filtered result; see the
 *  comment there). `discipline`/`profession` are singular on `MemberCard`
 *  (a demo-mode simplification predating this DTO) while the backend holds
 *  arrays — first value wins, matching how the demo's `SLUG_FACETS` already
 *  picks one primary discipline/profession per member. */
export function cardDtoToMemberCard(dto: MemberCardDTO): MemberCard {
  return {
    slug: dto.slug,
    meta: dto.pronouns ?? dto.tagline ?? "",
    role: dto.tagline ?? "",
    firstName: dto.firstName,
    lastName: dto.lastName,
    avatarUrl: dto.avatarUrl ?? null,
    tags: (dto.tags ?? []).map((label) => ({ label })),
    openTo: toOpenToEntries(dto.openTo).flatMap((entry) =>
      entry.kind === "preset" ? [entry.id] : [],
    ),
    hood: dto.hood ?? "",
    discipline: dto.discipline?.[0] ?? "",
    profession: dto.profession?.[0] ?? "",
    identities: (dto.identityFacets ?? []) as MemberCard["identities"],
    languages: dto.languages ?? [],
    years: dto.years ?? 0,
    joinedRank: 0,
    vouchCount: dto.vouchCount,
    mutualsCount: 0,
  };
}

/** Map a full profile DTO, layering the richer fields over the card mapping. */
export function profileToMember(dto: ProfileDTO): Member {
  return {
    ...cardToMember(dto),
    role: dto.tagline ?? "",
    hood: dto.location ?? "",
    bio: dto.bio ?? "",
    verified: dto.verified ?? false,
    since: joinYear(dto.joinedAt),
    now: dto.now ?? "",
    openTo: toOpenToEntries(dto.openTo),
    identities: dto.identities ?? [],
    lookingFor: dto.lookingFor ?? [],
    lookingForPublic: dto.lookingForPublic ?? false,
    privateNetwork: dto.privateNetwork ?? false,
    featuredConsent: dto.featuredConsent ?? false,
    discipline: dto.discipline ?? [],
    profession: dto.profession ?? [],
    languages: dto.languages ?? [],
    socials: (dto.socials ?? []).map((s) => ({
      platform: s.platform,
      urlOrHandle: s.urlOrHandle,
    })),
    work: (dto.work ?? []).map((w) => ({
      category: w.category,
      title: w.title,
      year: w.year,
      image: w.imageUrl,
      link: toWorkLink(w),
    })),
    board: (dto.board ?? []).map((b) => ({
      kind: b.kind,
      title: b.title,
      slug: b.slug,
    })),
    skills: (dto.skills ?? []).map((s) => ({ name: s.name, meta: s.meta })),
    groups: (dto.groups ?? []).map((g) => ({ name: g.name, role: g.role })),
    shapings: Object.fromEntries(
      (dto.shapings ?? []).map((s) => [
        s.kind,
        { title: s.title, note: s.note },
      ]),
    ),
    activity: (dto.activity ?? []).map((a) => ({
      icon: ACTIVITY_ICONS[a.kind] ?? FiFileText,
      title: a.title,
      sub: a.sub,
      to: a.to,
    })),
    // "Also in the room": the backend already returns full related-member
    // cards, so we resolve them here into `relatedCards` (name, hood, avatar,
    // derived initials/tint) rather than throwing away everything but the slug.
    // `related` (slugs) is left empty in live mode — the demo path uses it to
    // resolve against the mock registry, but real members aren't in that
    // registry, so RelatedSection prefers `relatedCards` when present.
    related: [],
    relatedCards: (dto.related ?? []).map((related) => ({
      slug: related.slug,
      first: related.firstName,
      last: related.lastName,
      role: related.tagline ?? "",
      hood: related.location ?? "",
      initials: initialsOf(related.firstName, related.lastName),
      tint: tintForSlug(related.slug),
      avatarUrl: related.avatarUrl ?? undefined,
    })),
    featuredCommunities: (dto.featuredCommunities ?? []).map((ref) => ({
      slug: ref.slug,
      name: ref.name,
      tagline: ref.tagline,
      type: ref.type,
      typeLabel: ref.typeLabel,
      countLabel: ref.countLabel,
      role: ref.role,
    })),
  };
}

// ── View-model → sub-resource PUT payloads ───────────────────────────────────
// These map the `Member` shape the profile editor holds onto the `items` DTOs
// the PUT /profiles/me/* endpoints expect. Each fully replaces its list.

export function workToDto(work: Member["work"]): WorkItemDTO[] {
  return work.map((w) => ({
    category: w.category,
    title: w.title,
    year: w.year,
    ...(w.image ? { imageUrl: w.image } : {}),
    ...(w.link?.kind === "ref"
      ? { refEntity: w.link.entity, refSlug: w.link.slug }
      : {}),
    ...(w.link?.kind === "external" ? { href: w.link.href } : {}),
  }));
}

export function skillsToDto(skills: Member["skills"]): SkillItemDTO[] {
  return skills.map((skill) => ({ name: skill.name, meta: skill.meta }));
}

/** Map the member's barter-board posts to the PUT /profiles/me/board `items`
 *  DTOs. `BoardItem` is already structurally the wire shape, so this is a plain
 *  pass-through kept for symmetry with the other list adapters. */
export function boardToDto(board: Member["board"]): BoardItemDTO[] {
  return board.map((post) => ({
    kind: post.kind,
    title: post.title,
    slug: post.slug,
  }));
}

/** `Member.groups` carries a group `name` (not a slug); the endpoint keys on a
 *  `groupSlug`. Until the editor tracks slugs, we derive a stable slug from the
 *  name so the PUT round-trips — documented in the summary as a known gap. */
export function groupsToDto(groups: Member["groups"]): GroupMembershipDTO[] {
  return groups.map((g) => ({
    groupSlug: g.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
    role: g.role,
  }));
}

const SHAPING_ORDER: ShapingKind[] = ["film", "book", "song", "moment"];

export function shapingsToDto(shapings: Member["shapings"]): ShapingItemDTO[] {
  return SHAPING_ORDER.flatMap((kind) => {
    const item = shapings[kind];
    return item ? [{ kind, title: item.title, note: item.note }] : [];
  });
}

/** Map the member's social links to the PUT /profiles/me/socials `items` DTOs. */
export function socialsToDto(socials: Member["socials"]): SocialLinkDTO[] {
  return (socials ?? []).map((s) => ({
    platform: s.platform,
    urlOrHandle: s.urlOrHandle,
  }));
}

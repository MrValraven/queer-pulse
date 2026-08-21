import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
} from "../../../shared/api/client";
import { validateProfile } from "../../../shared/api/validation";
import type { VouchRelationship } from "../vouchMember.data";
import type { CommunityType } from "../../homepage/data/types";
export type Visibility = "open" | "network" | "private";

/** One "open to" entry on the wire: a shared preset id, or the member's words. */
export type OpenToEntryDTO =
  { kind: "preset"; id: string } | { kind: "custom"; label: string };

export interface MemberCardDTO {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  /** Phonetic spelling of the member's name, read aloud via SpeechSynthesis
   *  on the profile hero. Ungated, same as `pronouns`. */
  pronunciation?: string;
  tagline?: string;
  avatarUrl?: string | null;
  tags?: string[];
  vouchCount: number;
  visibility: Visibility;
  openTo?: OpenToEntryDTO[];
  /** Neighbourhood / area shown as the profile's "hood". */
  location?: string;
  /** Neighbourhood matched out of `location` against the curated list — see
   *  the directory's `hoods` filter. `""`/absent when unset or unmatched. */
  hood?: string | null;
  /** Broad professional field(s) — drives the "What they do" filter. */
  discipline?: string[];
  /** Specific job(s) within `discipline` — drives the "Profession" filter. */
  profession?: string[];
  languages?: string[];
  /** Directory identity facets this member has published — powers the
   *  filter's per-option count badges. Not the identities themselves. */
  identityFacets?: string[];
  /** Years on QueerPulse, floor-rounded from `joinedAt`. */
  years?: number;
  /** Member-controlled visibility toggles (backend `ProfileCard.photoVisible`).
   *  ALWAYS the true stored value for every viewer — they say whether `avatarUrl`
   *  is gated, they are never themselves gated. Backend default `true`; optional
   *  here only defensively (a backend ahead of this build must not crash). */
  photoVisible?: boolean;
  /** Member-controlled visibility toggle (backend `ProfileCard.hoodVisible`) —
   *  same shape/defensiveness as `photoVisible`, gates `location`/`hood`. */
  hoodVisible?: boolean;
  /** Member-controlled visibility toggle (backend `ProfileCard.vouchersVisible`)
   *  — same shape/defensiveness as `photoVisible`, gates the vouchers list. */
  vouchersVisible?: boolean;
}

export interface MembersPage {
  items: MemberCardDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SocialLinkDTO {
  platform: string;
  urlOrHandle: string;
}
/** A work item's link, wire-shaped exactly like the backend's `WorkLinkDto`
 *  (see `replace-work.dto.ts`): `entity`/`slug` only apply to `kind: "ref"`,
 *  `href` only to `kind: "external"`. Kept looser than the domain `WorkLink`
 *  union (generic `string` fields, not narrowed to `WorkRefEntity`) so the
 *  adapter can defensively drop an entry this build doesn't recognise instead
 *  of crashing — see `toWorkLinks`. */
export interface WorkLinkDTO {
  kind: "ref" | "external";
  entity?: string;
  slug?: string;
  href?: string;
}
export interface WorkItemDTO {
  category: string;
  title: string;
  year: string;
  imageUrl?: string;
  /** Where the card points: 0–2 entries, each a platform ref or an
   *  off-platform URL. Matches `WorkView.links` / `WorkItemDto.links`
   *  server-side (`@ArrayMaxSize(2)`). Absent/empty when the item is
   *  unlinked. */
  links?: WorkLinkDTO[];
}

/** A barter-board post by the member ("On the board"). The lifecycle fields
 *  (`status`/`closedNote`/`closedAt`/`expiresAt`/`createdAt`) are read-only —
 *  present on every item the GET profile response returns (see backend
 *  `BoardView`), but never sent back on the PUT /profiles/me/board replace
 *  (see `boardToDto`, which only forwards `kind`/`title`/`slug`) or accepted
 *  by the backend's `ReplaceBoardDto`. `status` only changes via the
 *  dedicated `PATCH /profiles/me/board/:slug/close`. */
export interface BoardItemDTO {
  kind: "looking" | "offering";
  title: string;
  /** Slug of the linked board post — anchors to #<slug> on the barter board. */
  slug: string;
  status?: "open" | "closed";
  closedNote?: string | null;
  closedAt?: string | null;
  expiresAt?: string;
  createdAt?: string;
}

/** A skill or service the member offers ("Skills & offerings"). */
export interface SkillItemDTO {
  name: string;
  /** Short meta line, e.g. "Available · React, TypeScript, Node" or "Trade · backend". */
  meta: string;
}

/** A group / circle / collective the member belongs to ("Groups & circles"). */
export interface GroupItemDTO {
  name: string;
  /** The member's role in the group, e.g. "Member", "Host", "Co-founder". */
  role: string;
}

/** A community the member has chosen to feature on their profile, resolved for
 *  display ("Communities"). */
export interface FeaturedCommunityRefDTO {
  slug: string;
  name: string;
  tagline: string;
  type: CommunityType;
  typeLabel: string;
  countLabel: string;
  role: "owner" | "mod" | "member";
  /** Curated tag ids (⊆ `COMMUNITY_TAGS`, `communities/communityTags.data.ts`)
   *  — the profile's community card renders these as pills. */
  tags?: string[];
}

export type ShapingKind = "film" | "book" | "song" | "moment";
/** A formative film/book/song/moment ("What shaped me"). */
export interface ShapingItemDTO {
  kind: ShapingKind;
  title: string;
  note: string;
}

/** Semantic activity type; the frontend maps each to an icon. */
export type ActivityKind =
  "post" | "event" | "message" | "reading" | "edit" | "photo" | "music";
/** A recent public action, linking to where it happened ("Recent activity"). */
export interface ActivityItemDTO {
  kind: ActivityKind;
  title: string;
  sub: string;
  /** Path (or URL) the activity links to. */
  to: string;
}

export interface ProfileDTO extends MemberCardDTO {
  bio?: string;
  /** Portuguese translation of `bio`. Ungated, same as `bio`. */
  bioPt?: string;
  openTo?: OpenToEntryDTO[];
  /** Private Interests preferences — not shown on the profile (Settings → Interests). */
  identities?: string[];
  lookingFor?: string[];
  /** Whether `lookingFor` is shown on the profile to other viewers. */
  lookingForPublic?: boolean;
  /** Whether the member's trust network (vouchers/vouched-for) is hidden
   *  from other members. Admins can still see it for safety. */
  privateNetwork?: boolean;
  /** Whether the member has opted in to being featured on the admin-curated
   *  homepage. Only surfaced to the profile owner. */
  featuredConsent?: boolean;
  socials?: SocialLinkDTO[];
  work?: WorkItemDTO[];
  /** Whether the member is identity-verified (drives the "Verified member" badge). */
  verified?: boolean;
  /** ISO 8601 timestamp the member joined; the frontend formats it to a year. */
  joinedAt?: string;
  /** Free-text "what I'm in the middle of" status ("Now"). */
  now?: string;
  /** What the member is explicitly not here for, shown alongside `now`.
   *  Ungated, same as `now`. */
  notHereFor?: string;
  /** Barter-board posts by this member ("On the board"). */
  board?: BoardItemDTO[];
  /** Skills/services offered on the barter board ("Skills & offerings"). */
  skills?: SkillItemDTO[];
  /** Groups, circles and collectives the member belongs to ("Groups & circles"). */
  groups?: GroupItemDTO[];
  /** Formative films/books/songs/moments ("What shaped me"). */
  shapings?: ShapingItemDTO[];
  /** Recent public activity across the platform ("Recent activity"). */
  activity?: ActivityItemDTO[];
  /** Related members ("Also in the room") — nearby in craft or neighbourhood. */
  related?: MemberCardDTO[];
  /** Communities the member has chosen to feature on their profile, resolved
   *  for display ("Communities"). */
  featuredCommunities?: FeaturedCommunityRefDTO[];
  /** True when the viewer only gets the limited card (network/private). */
  limited: boolean;
  /** ISO 8601 timestamp until which the member has self-hidden their profile,
   *  or `null` when not hidden. Owner-only — never sent to non-owner viewers
   *  (see backend `FullProfileResponse`'s `isOwner` conditional spread). */
  hiddenUntil?: string | null;
}

export interface VoucherDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  note?: string;
  createdAt: string;
  /**
   * When true, this voucher vouched anonymously and the backend has shielded
   * their identity: `slug`/`firstName`/`lastName`/`avatarUrl` are empty. Render
   * an un-linked "Anonymous" face, never a link to `/members/`.
   */
  anonymous?: boolean;
}
export interface VouchersResponse {
  count: number;
  vouchers: VoucherDTO[];
}

/**
 * `tags` and `identities` are two different filters over two different columns
 * and must never be conflated — the directory's identity filter used to send its
 * selections as `tags`, which matched `profiles.tags` (skills: 'Illustration',
 * 'NestJS') and so returned zero members for every identity, always.
 *
 * - `tags` — skills/craft words, matched against `profiles.tags`.
 * - `identities` — directory identity facet ids (`lesbian`, `transNonBinary`, …),
 *   matched against each member's OPT-IN published set. Members who have not
 *   published an identity are not findable by it; the private list is never
 *   searched.
 */
export function getMembers(
  params: {
    query?: string;
    tags?: string[];
    identities?: string[];
    openTo?: string[];
    hoods?: string[];
    disciplines?: string[];
    professions?: string[];
    languages?: string[];
    yearsFrom?: number;
    yearsTo?: number;
    /** Server-side sort order; one of the `MemberSort` wire tokens
     *  (`recentlyJoined` | `closestMutuals` | `aToZ` | `mostVouched`). */
    sort?: string;
    page?: number;
  } = {},
) {
  const q = new URLSearchParams();
  if (params.query) q.set("query", params.query);
  if (params.tags?.length) q.set("tags", params.tags.join(","));
  if (params.identities?.length)
    q.set("identities", params.identities.join(","));
  if (params.openTo?.length) q.set("openTo", params.openTo.join(","));
  if (params.hoods?.length) q.set("hoods", params.hoods.join(","));
  if (params.disciplines?.length)
    q.set("disciplines", params.disciplines.join(","));
  if (params.professions?.length)
    q.set("professions", params.professions.join(","));
  if (params.languages?.length) q.set("languages", params.languages.join(","));
  if (params.yearsFrom !== undefined)
    q.set("yearsFrom", String(params.yearsFrom));
  if (params.yearsTo !== undefined) q.set("yearsTo", String(params.yearsTo));
  if (params.sort) q.set("sort", params.sort);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<MembersPage>(`/members${qs ? `?${qs}` : ""}`);
}

/** GET /profiles/:slug — accepts an `AbortSignal` (react-query forwards its
 *  `queryFn` signal here) so navigating away from a member profile mid-fetch
 *  cancels the underlying request instead of letting it run to completion. */
export const getProfile = (slug: string, signal?: AbortSignal) =>
  apiGet<ProfileDTO>(`/profiles/${slug}`, undefined, validateProfile, signal);

/** Fields the current member can edit on their own profile (PATCH /profiles/me). */
export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  pronouns?: string;
  tagline?: string;
  bio?: string;
  /** Portuguese translation of `bio`. */
  bioPt?: string;
  location?: string;
  /** Storage key from an avatar upload, or `null`/`""` to clear it back to the
   *  Google OAuth fallback. */
  avatarUrl?: string | null;
  visibility?: Visibility;
  /** Free-text "what I'm in the middle of" status ("Now"); "" clears it. */
  now?: string;
  /** What the member is explicitly not here for, shown alongside `now`. */
  notHereFor?: string;
  /** Phonetic spelling of the member's name. */
  pronunciation?: string;
  openTo?: OpenToEntryDTO[];
  /** Private Interests preferences — not shown on the profile (Settings → Interests). */
  identities?: string[];
  lookingFor?: string[];
  lookingForPublic?: boolean;
  /** Whether the member's trust network (vouchers/vouched-for) is hidden
   *  from other members. Admins can still see it for safety. */
  privateNetwork?: boolean;
  /** Whether the member has opted in to being featured on the admin-curated
   *  homepage. Only meaningful when `visibility` is `"open"`. */
  featuredConsent?: boolean;
  tags?: string[];
  /** Broad professional field(s) — see `DISCIPLINES` in
   *  memberDirectoryFilter.data.ts. Implies its matching `profession`'s
   *  parent field is included too; the backend reconciles either way. */
  discipline?: string[];
  profession?: string[];
  languages?: string[];
  /** Ordered slugs of the communities the member has chosen to feature on
   *  their profile. */
  featuredCommunities?: string[];
  /** Member-controlled visibility toggle (backend `ProfileCard.photoVisible`) —
   *  see the read-side doc on `MemberCardDTO.photoVisible`. First wired up by
   *  the "Who sees what" sheet's instant-save field toggles. */
  photoVisible?: boolean;
  /** Member-controlled visibility toggle (backend `ProfileCard.hoodVisible`). */
  hoodVisible?: boolean;
  /** Member-controlled visibility toggle (backend `ProfileCard.vouchersVisible`). */
  vouchersVisible?: boolean;
  /** ISO 8601 timestamp until which the member has self-hidden their profile,
   *  or `null` to unhide. The profile rail's "Hide me for 24h" / "Bring me
   *  back" instant-save toggle. */
  hiddenUntil?: string | null;
}

/** Persist edits to the logged-in member's profile. Returns the saved profile. */
export const updateProfile = (dto: UpdateProfileDTO) =>
  apiPatch<ProfileDTO>("/profiles/me", dto);

// ── Profile sub-resources ────────────────────────────────────────────────────
// Each of these fully REPLACES the corresponding list on the logged-in member's
// profile (PUT semantics). The backend caps each list; we forward the caller's
// items and let the server enforce the limits documented in the comments.

/** Replace the member's social links (≤50). PUT /profiles/me/socials. */
export const replaceSocials = (items: SocialLinkDTO[]) =>
  apiPut<ProfileDTO>("/profiles/me/socials", { items });

/** Replace the member's selected work (≤100). PUT /profiles/me/work. */
export const replaceWork = (items: WorkItemDTO[]) =>
  apiPut<ProfileDTO>("/profiles/me/work", { items });

/** Replace the member's skills & offerings (≤100). PUT /profiles/me/skills. */
export const replaceSkills = (items: SkillItemDTO[]) =>
  apiPut<ProfileDTO>("/profiles/me/skills", { items });

/** Replace the member's barter-board posts (≤100). PUT /profiles/me/board. */
export const replaceBoard = (items: BoardItemDTO[]) =>
  apiPut<ProfileDTO>("/profiles/me/board", { items });

/** Mark one of the member's own board posts closed/found. Returns just that
 *  item (now closed), not the full profile — unlike `replaceBoard`'s
 *  full-replace PUT, this is the dedicated lifecycle action.
 *  PATCH /profiles/me/board/:slug/close. */
export const closeBoardItem = (slug: string, note?: string) =>
  apiPatch<BoardItemDTO>(
    `/profiles/me/board/${encodeURIComponent(slug)}/close`,
    { note },
  );

/** Replace the member's formative films/books/songs/moments (≤4). PUT /profiles/me/shapings. */
export const replaceShapings = (items: ShapingItemDTO[]) =>
  apiPut<ProfileDTO>("/profiles/me/shapings", { items });

/** A group membership as the groups-PUT expects it (referenced by slug, not name). */
export interface GroupMembershipDTO {
  groupSlug: string;
  role: string;
}

/** Replace the member's group / circle memberships (≤50). PUT /profiles/me/groups. */
export const replaceGroups = (items: GroupMembershipDTO[]) =>
  apiPut<ProfileDTO>("/profiles/me/groups", { items });

export const vouchFor = (
  slug: string,
  input: {
    relationships?: VouchRelationship[];
    note?: string;
    anonymous?: boolean;
  } = {},
) =>
  apiPost<{ vouchCount: number }>(`/members/${slug}/vouch`, {
    ...(input.note ? { note: input.note } : {}),
    ...(input.relationships?.length
      ? { relationships: input.relationships }
      : {}),
    ...(input.anonymous ? { anonymous: true } : {}),
  });

export const unvouch = (slug: string) =>
  apiDelete<{ ok: true }>(`/members/${slug}/vouch`);

export const getVouchers = (slug: string) =>
  apiGet<VouchersResponse>(`/members/${slug}/vouchers`);

/**
 * One vouch the current user has given, as `GET /me/vouches/given` returns it
 * (`GivenVouchView`). Carries the vouched member's identity plus `createdAt`, so
 * callers can render a named/dated row — not just a bare slug.
 */
export interface GivenVouchDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  note?: string;
  createdAt: string;
  anonymous?: boolean;
}

/** Vouches the current user has given, newest-first. */
export const getGivenVouches = () =>
  apiGet<GivenVouchDTO[]>("/me/vouches/given");

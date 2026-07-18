import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
} from "../../../shared/api/client";

export type Visibility = "open" | "network" | "private";

/** One "open to" entry on the wire: a shared preset id, or the member's words. */
export type OpenToEntryDTO =
  { kind: "preset"; id: string } | { kind: "custom"; label: string };

export interface MemberCardDTO {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  tagline?: string;
  avatarUrl?: string | null;
  tags?: string[];
  vouchCount: number;
  visibility: Visibility;
  openTo?: OpenToEntryDTO[];
  /** Neighbourhood / area shown as the profile's "hood". */
  location?: string;
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
export interface WorkItemDTO {
  category: string;
  title: string;
  year: string;
  imageUrl?: string;
  /** Where the card points, wire-shaped: a platform ref (`refEntity` + `refSlug`)
   *  or an off-platform `href`. Absent when the item is unlinked. */
  refEntity?: string;
  refSlug?: string;
  href?: string;
}

/** A barter-board post by the member ("On the board"). */
export interface BoardItemDTO {
  kind: "looking" | "offering";
  title: string;
  /** Slug of the linked board post — anchors to #<slug> on the barter board. */
  slug: string;
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
  openTo?: OpenToEntryDTO[];
  /** Private Interests preferences — not shown on the profile (Settings → Interests). */
  identities?: string[];
  lookingFor?: string[];
  socials?: SocialLinkDTO[];
  work?: WorkItemDTO[];
  /** Whether the member is identity-verified (drives the "Verified member" badge). */
  verified?: boolean;
  /** ISO 8601 timestamp the member joined; the frontend formats it to a year. */
  joinedAt?: string;
  /** Free-text "what I'm in the middle of" status ("Now"). */
  now?: string;
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
  /** True when the viewer only gets the limited card (network/private). */
  limited: boolean;
}

export interface VoucherDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  note?: string;
  createdAt: string;
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
    page?: number;
  } = {},
) {
  const q = new URLSearchParams();
  if (params.query) q.set("query", params.query);
  if (params.tags?.length) q.set("tags", params.tags.join(","));
  if (params.identities?.length)
    q.set("identities", params.identities.join(","));
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  return apiGet<MembersPage>(`/members${qs ? `?${qs}` : ""}`);
}

export const getProfile = (slug: string) =>
  apiGet<ProfileDTO>(`/profiles/${slug}`);

/** Fields the current member can edit on their own profile (PATCH /profiles/me).
 *  Note: the avatar/photo is not part of this endpoint, so it isn't persisted here. */
export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  pronouns?: string;
  tagline?: string;
  bio?: string;
  location?: string;
  visibility?: Visibility;
  /** Free-text "what I'm in the middle of" status ("Now"); "" clears it. */
  now?: string;
  openTo?: OpenToEntryDTO[];
  /** Private Interests preferences — not shown on the profile (Settings → Interests). */
  identities?: string[];
  lookingFor?: string[];
  tags?: string[];
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

export const vouchFor = (slug: string, note?: string) =>
  apiPost<{ vouchCount: number }>(
    `/members/${slug}/vouch`,
    note ? { note } : {},
  );

export const unvouch = (slug: string) =>
  apiDelete<{ ok: true }>(`/members/${slug}/vouch`);

export const getVouchers = (slug: string) =>
  apiGet<VouchersResponse>(`/members/${slug}/vouchers`);

/** Vouches the current user has given. Shape assumed `{ slug }[]`; adjust if the API differs. */
export const getGivenVouches = () =>
  apiGet<{ slug: string }[]>("/me/vouches/given");

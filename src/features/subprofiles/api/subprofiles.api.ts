import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
} from "../../../shared/api/client";

// ── Wire DTOs (contract C3) ──────────────────────────────────────────────────
// These types are IDENTICAL to the backend `subprofile-response.ts` views. Keep
// them verbatim so the API, the public view, and the owner editor never drift.

export type Visibility = "open" | "network" | "private";
export type LinkVisibility = "linked" | "unlinked";
export type SubprofileStatus = "draft" | "published";

export type AccentKey = "plum" | "coral" | "jade" | "amber" | "violet";
export type AvailabilityKey = "open_to_collabs" | "booking" | "not_available";

export interface SocialLinkDTO {
  platform: string;
  urlOrHandle: string;
}

/** One resolved persona→entity link ("Part of"). Dropped server-side (on read)
 *  when the target no longer resolves or is block-filtered against the viewer. */
export interface AffiliationDTO {
  targetType: "event" | "community";
  targetSlug: string;
  role: string;
  name: string;
  imageUrl: string | null;
}

/** Owner-authored input for `PUT /subprofiles/:id/affiliations` (replace-all). */
export interface AffiliationInputDTO {
  targetType: "event" | "community";
  targetSlug: string;
  role: string;
}

/** One member's endorsement of a persona (returned by the endorsers list). */
export interface EndorserDTO {
  slug: string;
  name: string;
  avatarUrl: string | null;
  note: string | null;
}

export type SubprofileKind =
  | "developer"
  | "writer"
  | "musician"
  | "visual_artist"
  | "filmmaker"
  | "designer"
  | "maker"
  | "drag"
  | "dj"
  | "dancer"
  | "performer"
  | "photographer"
  | "videomaker"
  | "generic";

export type SubprofileSection =
  | "projects"
  | "open_source" // developer
  | "publications"
  | "readings" // writer
  | "discography"
  | "gigs" // musician + dj
  | "portfolio"
  | "exhibitions" // visual_artist + photographer
  | "filmography"
  | "screenings" // filmmaker + videomaker
  | "selected_work"
  | "clients" // designer
  | "collections"
  | "workshops" // maker
  | "shows"
  | "looks" // drag
  | "mixes" // dj
  | "performances"
  | "reel" // dancer + performer
  | "appearances" // performer
  | "series" // photographer
  | "videos" // videomaker
  | "showcase" // generic
  | "links"; // every kind

export interface SubprofileItemDTO {
  section: SubprofileSection;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  date?: string | null;
  meta?: string | null;
  tags: string[];
  isFeatured: boolean;
}

/** Owner-facing (full), returned by GET /subprofiles/mine, GET /subprofiles/:id,
 *  and all mutations. */
export interface SubprofileDTO {
  id: string;
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
  bio: string | null;
  coverUrl: string | null;
  accent: string | null;
  availability: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  visibility: Visibility;
  status: SubprofileStatus;
  position: number;
  items: SubprofileItemDTO[]; // all sections, ordered by (section, position)
  affiliations: AffiliationDTO[]; // event/community links ("Part of")
  endorsementCount: number;
  followerCount: number;
}

/** Public view: owner-stripped when linkVisibility === 'unlinked'.
 *  ownerSlug/ownerName present only when linkVisibility === 'linked'. */
export interface SubprofilePublicDTO {
  id: string;
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
  bio: string | null;
  coverUrl: string | null;
  accent: string | null;
  availability: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  socialLinks: SocialLinkDTO[];
  linkVisibility: LinkVisibility;
  items: SubprofileItemDTO[];
  affiliations: AffiliationDTO[]; // event/community links ("Part of")
  ownerSlug?: string; // linked only
  ownerName?: string; // linked only
  endorsementCount: number;
  viewerEndorsed: boolean;
  followerCount: number;
  viewerFollowing: boolean;
}

/** Directory / list card. */
export interface SubprofileCardDTO {
  handle: string;
  kind: SubprofileKind;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
  accent: string | null;
  availability: string | null;
  socialCount: number;
  tags: string[];
}

/** Publish failure body (HTTP 422). */
export interface PublishUnmetDTO {
  unmet: string[];
}

export interface CreateSubprofileDTO {
  // kind + displayName required. The backend derives the slug server-side (it
  // rejects a `slug` on create); rename the address afterwards via PATCH.
  kind: SubprofileKind;
  displayName: string; // 1–120 chars; callers fall back to the kind label
}

export interface UpdateSubprofileDTO {
  // all optional; PATCH semantics
  displayName?: string;
  slug?: string; // per-owner unique (linked URL)
  handle?: string; // desired handle (validated on publish)
  avatarUrl?: string | null;
  tagline?: string | null;
  bio?: string | null;
  coverUrl?: string | null;
  accent?: string | null;
  availability?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  linkVisibility?: LinkVisibility;
  visibility?: Visibility;
  position?: number;
}

export interface SubprofileItemInputDTO {
  // section comes from the URL, not the body
  title: string;
  subtitle?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  date?: string;
  meta?: string;
  tags?: string[];
  isFeatured?: boolean;
}

// ── Endpoint fns (contract C4) ───────────────────────────────────────────────

/** Linked + published personas of a member (their public main-profile "Also as…"). */
export const getProfileSubprofiles = (slug: string) =>
  apiGet<SubprofilePublicDTO[]>(`/profiles/${slug}/subprofiles`);

/** The current owner's subprofiles, all statuses. */
export const getMySubprofiles = () =>
  apiGet<SubprofileDTO[]>("/subprofiles/mine");

/** Create a draft subprofile. */
export const createSubprofile = (dto: CreateSubprofileDTO) =>
  apiPost<SubprofileDTO>("/subprofiles", dto);

/** Owner fetch of a single subprofile (for editing). */
export const getSubprofile = (id: string) =>
  apiGet<SubprofileDTO>(`/subprofiles/${id}`);

/** Update subprofile meta (PATCH semantics). */
export const updateSubprofile = (id: string, dto: UpdateSubprofileDTO) =>
  apiPatch<SubprofileDTO>(`/subprofiles/${id}`, dto);

/** Fully replace the items of one section (section comes from the URL). */
export const replaceSubprofileSection = (
  id: string,
  section: SubprofileSection,
  items: SubprofileItemInputDTO[],
) => apiPut<SubprofileDTO>(`/subprofiles/${id}/sections/${section}`, { items });

/** Fully replace a persona's social links. */
export const replaceSocialLinks = (id: string, items: SocialLinkDTO[]) =>
  apiPut<SubprofileDTO>(`/subprofiles/${id}/social-links`, { items });

/** Fully replace a persona's event/community affiliations ("Part of"). */
export const replaceAffiliations = (id: string, items: AffiliationInputDTO[]) =>
  apiPut<SubprofileDTO>(`/subprofiles/${id}/affiliations`, { items });

/** Validate + publish. Rejects with an ApiError(422) whose body is PublishUnmetDTO. */
export const publishSubprofile = (id: string) =>
  apiPost<SubprofileDTO>(`/subprofiles/${id}/publish`);

/** Revert to draft (nulls the handle when unlinked). */
export const unpublishSubprofile = (id: string) =>
  apiPost<SubprofileDTO>(`/subprofiles/${id}/unpublish`);

/** Delete a subprofile. */
export const deleteSubprofile = (id: string) =>
  apiDelete<{ ok: true }>(`/subprofiles/${id}`);

/** Public fetch of a standalone (unlinked) persona by its global handle. */
export const getSubprofileByHandle = (handle: string) =>
  apiGet<SubprofilePublicDTO>(`/subprofiles/by-handle/${handle}`);

/** Directory of standalone personas, filterable by kind + free-text query. */
export const getSubprofileDirectory = (
  params: { kind?: SubprofileKind; query?: string } = {},
) => {
  const q = new URLSearchParams();
  if (params.kind) q.set("kind", params.kind);
  if (params.query) q.set("query", params.query);
  const qs = q.toString();
  return apiGet<{ items: SubprofileCardDTO[] }>(
    `/subprofiles/directory${qs ? `?${qs}` : ""}`,
  );
};

/** Endorse a published persona (one-tap + optional note). Keyed on the
 *  persona's non-identifying `id`, not its slug/handle. */
export const endorseSubprofile = (id: string, note?: string) =>
  apiPost<{ endorsementCount: number; viewerEndorsed: boolean }>(
    `/subprofiles/${id}/endorse`,
    note ? { note } : {},
  );

/** Withdraw the current member's endorsement of a persona. */
export const withdrawEndorsement = (id: string) =>
  apiDelete<{ endorsementCount: number; viewerEndorsed: boolean }>(
    `/subprofiles/${id}/endorse`,
  );

/** List a persona's active endorsers (newest first, capped server-side). */
export const getEndorsers = (id: string) =>
  apiGet<{ count: number; endorsers: EndorserDTO[] }>(
    `/subprofiles/${id}/endorsements`,
  );

/** Follow a published persona (one-way, instant, count-only). Keyed on the
 *  persona's non-identifying `id`, not its slug/handle. */
export const followSubprofile = (id: string) =>
  apiPost<{ followerCount: number; viewerFollowing: boolean }>(
    `/subprofiles/${id}/follow`,
    {},
  );

/** Unfollow a persona the current member is following. */
export const unfollowSubprofile = (id: string) =>
  apiDelete<{ followerCount: number; viewerFollowing: boolean }>(
    `/subprofiles/${id}/follow`,
  );

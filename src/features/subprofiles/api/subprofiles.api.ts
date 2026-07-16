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

export type SubprofileKind =
  | "developer"
  | "writer"
  | "musician"
  | "visual_artist"
  | "filmmaker"
  | "designer"
  | "maker"
  | "generic";

export type SubprofileSection =
  | "projects"
  | "open_source" // developer
  | "publications"
  | "readings" // writer
  | "discography"
  | "gigs" // musician
  | "portfolio"
  | "exhibitions" // visual_artist
  | "filmography"
  | "screenings" // filmmaker
  | "selected_work"
  | "clients" // designer
  | "collections"
  | "workshops" // maker
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
  linkVisibility: LinkVisibility;
  visibility: Visibility;
  status: SubprofileStatus;
  position: number;
  items: SubprofileItemDTO[]; // all sections, ordered by (section, position)
}

/** Public view: owner-stripped when linkVisibility === 'unlinked'.
 *  ownerSlug/ownerName present only when linkVisibility === 'linked'. */
export interface SubprofilePublicDTO {
  kind: SubprofileKind;
  slug: string;
  handle: string | null;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
  bio: string | null;
  linkVisibility: LinkVisibility;
  items: SubprofileItemDTO[];
  ownerSlug?: string; // linked only
  ownerName?: string; // linked only
}

/** Directory / list card. */
export interface SubprofileCardDTO {
  handle: string;
  kind: SubprofileKind;
  displayName: string;
  avatarUrl: string | null;
  tagline: string | null;
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

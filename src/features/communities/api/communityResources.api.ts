import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/**
 * A community's resource shelf — `GET/POST/PATCH/DELETE
 * /communities/:slug/resources` plus `PATCH /communities/:slug/resources/order`.
 *
 * Its own module rather than more calls in `communities.api.ts`, mirroring the
 * backend's standalone `CommunityResourcesController`. Reads are open to any
 * roster member; every write is owner, co-owner or moderator.
 */

/** What a shelf entry points at, so the row can label and icon it without
 *  guessing from the URL. */
export type CommunityResourceKind = "link" | "doc" | "guide";

export const COMMUNITY_RESOURCE_KINDS: CommunityResourceKind[] = [
  "link",
  "doc",
  "guide",
];

export interface CommunityResourceDTO {
  id: string;
  title: string;
  url: string;
  note: string | null;
  kind: CommunityResourceKind;
  position: number;
  /** The owner/mod who pinned it, or null once their account is erased. */
  addedBy: MemberRefDTO | null;
  createdAt: string;
  updatedAt: string;
}

/** The shelf as the About tab reads it: the ordered rows plus the cap, so the
 *  editor can disable its add control at the ceiling instead of discovering it
 *  through a 409. */
export interface CommunityResourceShelfDTO {
  resources: CommunityResourceDTO[];
  maxResources: number;
}

export interface CreateCommunityResourceDto {
  title: string;
  url: string;
  note?: string | null;
  kind: CommunityResourceKind;
}

export interface UpdateCommunityResourceDto {
  title?: string;
  url?: string;
  note?: string | null;
  kind?: CommunityResourceKind;
}

export const getCommunityResources = (slug: string) =>
  apiGet<CommunityResourceShelfDTO>(`/communities/${slug}/resources`);

export const createCommunityResource = (
  slug: string,
  dto: CreateCommunityResourceDto,
) => apiPost<CommunityResourceDTO>(`/communities/${slug}/resources`, dto);

export const updateCommunityResource = (
  slug: string,
  id: string,
  dto: UpdateCommunityResourceDto,
) =>
  apiPatch<CommunityResourceDTO>(`/communities/${slug}/resources/${id}`, dto);

export const deleteCommunityResource = (slug: string, id: string) =>
  apiDelete<{ ok: boolean }>(`/communities/${slug}/resources/${id}`);

/** The whole shelf's order in one call: every resource id, exactly once, in
 *  the order it should appear. The server assigns `position` from each id's
 *  index, so a partial list is refused with a 400. */
export const reorderCommunityResources = (slug: string, resourceIds: string[]) =>
  apiPatch<CommunityResourceShelfDTO>(`/communities/${slug}/resources/order`, {
    resourceIds,
  });

import type { InfiniteData } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { StudioAccessGrantDTO } from "../../studio/api/studio.types";

// Waiting for Studio (contract 12.3): the members who asked for Studio access
// and hold no grant yet. Artists first, then the oldest request.

export interface AdminStudioAccessRequestDTO {
  id: string;
  member: {
    id: string;
    slug: string;
    displayName: string;
    avatarUrl: string | null;
  };
  wantsToRelease: boolean;
  requestedAt: string;
  /** Rows our team filed from an invite read true. */
  isFromInvite: boolean;
}

export interface AdminStudioAccessRequestPageDTO {
  items: AdminStudioAccessRequestDTO[];
  nextCursor: string | null;
  /** Every request waiting, across all pages. */
  totalCount: number;
  /** The waiting requests whose member wants to release music. */
  artistCount: number;
}

const BASE_PATH = "/admin/studio/access-requests";
const requestPath = (requestId: string) =>
  `${BASE_PATH}/${encodeURIComponent(requestId)}`;

/** GET /admin/studio/access-requests?cursor= (30 a page). */
export const getAdminStudioAccessRequests = (cursor: string | null) =>
  apiGet<AdminStudioAccessRequestPageDTO>(
    cursor ? `${BASE_PATH}?cursor=${encodeURIComponent(cursor)}` : BASE_PATH,
  );
/** Grants the requester Studio access; 404 studio_access_request_not_found
 *  when the request is already gone. */
export const grantAdminStudioAccessRequest = (requestId: string) =>
  apiPost<StudioAccessGrantDTO>(`${requestPath(requestId)}/grant`);
/** Deletes the request quietly: the member gets no notification. Idempotent. */
export const dismissAdminStudioAccessRequest = (requestId: string) =>
  apiDelete<void>(requestPath(requestId));

/** The loaded pages without the rows `isRemoved` picks, each page's counts
 *  lowered by what left (an artist row also lowers `artistCount`). A pure
 *  cache rewrite, so the drawer's grant can reuse it without loading the
 *  hooks module. Returns the same object when nothing matched. */
export function accessRequestPagesWithout(
  data: InfiniteData<AdminStudioAccessRequestPageDTO> | undefined,
  isRemoved: (request: AdminStudioAccessRequestDTO) => boolean,
): InfiniteData<AdminStudioAccessRequestPageDTO> | undefined {
  if (!data) return data;
  const removedRows = data.pages
    .flatMap((page) => page.items)
    .filter(isRemoved);
  if (removedRows.length === 0) return data;
  const removedArtistCount = removedRows.filter(
    (request) => request.wantsToRelease,
  ).length;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((request) => !isRemoved(request)),
      totalCount: Math.max(0, page.totalCount - removedRows.length),
      artistCount: Math.max(0, page.artistCount - removedArtistCount),
    })),
  };
}

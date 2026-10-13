import { routes } from "../../app/routeMap";
import type { StudioSearchType } from "./api/studio.types";

// Studio's id-carrying links. The routes keep their existing paths
// (routeMap.ts:435-525) and carry the id as a query parameter.

export const studioReleasePath = (releaseId: string) =>
  `${routes.studioAlbum}?id=${encodeURIComponent(releaseId)}`;
export const studioTrackPath = (trackId: string) =>
  `${routes.studioTrack}?id=${encodeURIComponent(trackId)}`;
export const studioArtistPath = (subprofileId: string) =>
  `${routes.studioArtist}?id=${encodeURIComponent(subprofileId)}`;

export function studioSearchPath(
  query: string,
  type: StudioSearchType = "all",
): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (type !== "all") params.set("type", type);
  const queryString = params.toString();
  return queryString
    ? `${routes.studioSearch}?${queryString}`
    : routes.studioSearch;
}

/** The upload flow; with an id it reopens that release for editing. */
export const studioUploadPath = (releaseId?: string) =>
  releaseId
    ? `${routes.studioUpload}?release=${encodeURIComponent(releaseId)}`
    : routes.studioUpload;

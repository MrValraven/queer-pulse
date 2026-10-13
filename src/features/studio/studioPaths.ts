import { routes } from "../../app/routeMap";
import {
  FUNDING_CATEGORY_ID,
  FUNDING_MUSIC_TAG,
} from "../forum/funding/funding.data";
import type { StudioGenre, StudioSearchType } from "./api/studio.types";

// Studio's id-carrying links. The routes keep their existing paths
// (routeMap.ts) and carry the id as a query parameter.

export const studioReleasePath = (releaseId: string) =>
  `${routes.studioAlbum}?id=${encodeURIComponent(releaseId)}`;
export const studioTrackPath = (trackId: string) =>
  `${routes.studioTrack}?id=${encodeURIComponent(trackId)}`;
export const studioArtistPath = (subprofileId: string) =>
  `${routes.studioArtist}?id=${encodeURIComponent(subprofileId)}`;
/** The playlist page lives on the old collection route (Studio v2). */
export const studioPlaylistPath = (playlistId: string) =>
  `${routes.studioCollection}?id=${encodeURIComponent(playlistId)}`;

export function studioSearchPath(
  query: string,
  type: StudioSearchType = "all",
  genre: StudioGenre | null = null,
): string {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (type !== "all") params.set("type", type);
  if (genre) params.set("genre", genre);
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

export const STUDIO_LIBRARY_TABS = [
  "playlists",
  "releases",
  "tracks",
  "artists",
] as const;
export type StudioLibraryTab = (typeof STUDIO_LIBRARY_TABS)[number];

/** The library opens on Playlists; the other tabs live in `?tab=`. */
export function studioLibraryPath(tab: StudioLibraryTab = "playlists") {
  return tab === "playlists"
    ? routes.studioLibrary
    : `${routes.studioLibrary}?tab=${tab}`;
}

export function studioBrowsePath(genre: StudioGenre | null = null) {
  return genre
    ? `${routes.studioBrowse}?genre=${encodeURIComponent(genre)}`
    : routes.studioBrowse;
}

/** "Your numbers"; with a persona id it opens on that persona. */
export function studioDashboardPath(subprofileId: string | null = null) {
  return subprofileId
    ? `${routes.studioDashboard}?persona=${encodeURIComponent(subprofileId)}`
    : routes.studioDashboard;
}

/** Funding & Grants filtered to music. The forum reads `category`,
 *  `fundingView` and `tag` from its URL (useForumUrlParams). */
const musicFundingPath = (fundingView: "open" | "asks") =>
  `${routes.forum}?category=${FUNDING_CATEGORY_ID}&fundingView=${fundingView}&tag=${FUNDING_MUSIC_TAG}`;
export const STUDIO_MUSIC_CALLS_HREF = musicFundingPath("open");
export const STUDIO_MUSIC_FUNDRAISERS_HREF = musicFundingPath("asks");
/** The composer seeded with the music tag (`?tag=`, read once by
 *  useComposeThreadSeeds); the member picks open call or fundraiser there. */
export const STUDIO_NEW_MUSIC_FUNDING_POST_HREF = `${routes.forumNew}?tag=${FUNDING_MUSIC_TAG}`;

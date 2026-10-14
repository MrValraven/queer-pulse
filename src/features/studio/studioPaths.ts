import { routes } from "../../app/routeMap";
import {
  FUNDING_CATEGORY_ID,
  FUNDING_MUSIC_TAG,
} from "../forum/funding/funding.data";
import type {
  StudioFormat,
  StudioGenre,
  StudioMood,
  StudioSearchType,
} from "./api/studio.types";

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

/** A private preview link's page (Studio v3). */
export const studioPreviewPath = (token: string) =>
  `${routes.studioPreview}/${encodeURIComponent(token)}`;
/** The absolute address the owner copies and shares. */
export const studioPreviewUrl = (token: string) =>
  `${window.location.origin}${studioPreviewPath(token)}`;
export const STUDIO_PREVIEW_ROUTE = `${routes.studioPreview}/:token`;

/** A persona's live press kit. */
export const studioPressPath = (subprofileId: string) =>
  `${routes.studioPress}?id=${encodeURIComponent(subprofileId)}`;
/** The press kit editor; without an id it opens on the first persona. */
export const studioPressEditPath = (subprofileId: string | null = null) =>
  subprofileId
    ? `${routes.studioPressEdit}?persona=${encodeURIComponent(subprofileId)}`
    : routes.studioPressEdit;
/** The A4 one-sheet; `shouldPrint` opens the print dialog once it is ready. */
export const studioPressPrintPath = (
  subprofileId: string,
  shouldPrint = false,
) =>
  `${routes.studioPressPrint}?id=${encodeURIComponent(subprofileId)}${shouldPrint ? "&print=1" : ""}`;

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

/** Browse by genre, by mood, by format, or a mix (they combine with AND). */
export function studioBrowsePath(
  genre: StudioGenre | null = null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
) {
  const params = new URLSearchParams();
  if (genre) params.set("genre", genre);
  if (mood) params.set("mood", mood);
  if (format) params.set("format", format);
  const queryString = params.toString();
  return queryString
    ? `${routes.studioBrowse}?${queryString}`
    : routes.studioBrowse;
}

/** Studio home, narrowed to one format by the chips above the genre row. */
export const studioHomePath = (format: StudioFormat | null) =>
  format
    ? `${routes.studio}?format=${encodeURIComponent(format)}`
    : routes.studio;

/** Episode mode of the upload page: a new episode on a live show, or one
 *  episode to edit. */
export const studioEpisodeUploadPath = (
  releaseId: string,
  trackId: string | null = null,
) =>
  `${routes.studioUpload}?release=${encodeURIComponent(releaseId)}&episode=${encodeURIComponent(trackId ?? "new")}`;

/** A scene page; the slug travels as a query parameter like every other
 *  Studio id. */
export const studioScenePath = (slug: string) =>
  `${routes.studioScene}?slug=${encodeURIComponent(slug)}`;

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

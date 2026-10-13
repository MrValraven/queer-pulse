import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import type {
  CreateStudioPlaylistBody,
  StudioPageDTO,
  StudioPlaylistCardDTO,
  StudioPlaylistDTO,
  UpdateStudioPlaylistBody,
} from "./studio.types";

// One raw call per playlist endpoint of the Studio v2 contract. Nothing here
// records listening: playing or shuffling a playlist never reaches the server.

const segment = (id: string) => encodeURIComponent(id);
const cursorQuery = (cursor: string | null) =>
  cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";

/**
 * The member profile's Studio playlists block: `GET /studio/members/:slug/
 * playlists` (contract, amended 2026-10-13: a profile page knows only the
 * member's slug). Built in this one place.
 */
export const STUDIO_MEMBER_PLAYLISTS_PATH = (memberSlug: string) =>
  `/studio/members/${segment(memberSlug)}/playlists`;

export const getMyStudioPlaylists = (cursor: string | null) =>
  apiGet<StudioPageDTO<StudioPlaylistCardDTO>>(
    `/studio/playlists/mine${cursorQuery(cursor)}`,
  );

export const createStudioPlaylist = (body: CreateStudioPlaylistBody) =>
  apiPost<StudioPlaylistDTO>("/studio/playlists", body);

export const getStudioPlaylist = (playlistId: string) =>
  apiGet<StudioPlaylistDTO>(`/studio/playlists/${segment(playlistId)}`);

export const updateStudioPlaylist = (
  playlistId: string,
  body: UpdateStudioPlaylistBody,
) =>
  apiPatch<StudioPlaylistDTO>(`/studio/playlists/${segment(playlistId)}`, body);

export const deleteStudioPlaylist = (playlistId: string) =>
  apiDelete<void>(`/studio/playlists/${segment(playlistId)}`);

/** Appends in the order given; ids already in the playlist are skipped. */
export const addStudioPlaylistTracks = (
  playlistId: string,
  trackIds: string[],
) =>
  apiPost<StudioPlaylistDTO>(
    `/studio/playlists/${segment(playlistId)}/tracks`,
    { trackIds },
  );

export const removeStudioPlaylistEntry = (
  playlistId: string,
  entryId: string,
) =>
  apiDelete<void>(
    `/studio/playlists/${segment(playlistId)}/entries/${segment(entryId)}`,
  );

/** Every entry exactly once, unavailable ones included. */
export const putStudioPlaylistOrder = (
  playlistId: string,
  entryIds: string[],
) =>
  apiPut<StudioPlaylistDTO>(
    `/studio/playlists/${segment(playlistId)}/entry-order`,
    { entryIds },
  );

export const getStudioMemberPlaylists = (
  memberSlug: string,
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<StudioPlaylistCardDTO>>(
    `${STUDIO_MEMBER_PLAYLISTS_PATH(memberSlug)}${cursorQuery(cursor)}`,
  );

export const getStudioTrackPlaylists = (trackId: string) =>
  apiGet<{ items: StudioPlaylistCardDTO[] }>(
    `/studio/tracks/${segment(trackId)}/playlists`,
  );

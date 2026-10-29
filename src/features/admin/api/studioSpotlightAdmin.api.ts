import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import type { StudioArtistRefDTO } from "../../studio/api/studio.types";

/**
 * The Studio spotlight's staff surface, mirroring the backend's
 * `AdminStudioSpotlightController`
 * (QUEERPULSE-STUDIO-SPOTLIGHT-CURATION-CONTRACT-2026-10-29.md, sections 2
 * and 3). Every route admits Moderator, Admin and holders of the
 * `music_manager_producer` grant.
 */

export const STUDIO_SPOTLIGHT_SLOTS = [
  "artist_of_the_month",
  "new_stars",
] as const;
export type StudioSpotlightSlot = (typeof STUDIO_SPOTLIGHT_SLOTS)[number];

export interface AdminStudioSpotlightArtistDTO {
  /** The spotlight row id. */
  id: string;
  slot: StudioSpotlightSlot;
  /** 1-based, contiguous per slot. */
  position: number;
  note: string | null;
  /** "Picked {date}" and the stale month line read it. */
  createdAt: string;
  /** The persona is listenable and has a published release; staff see
   *  blocks ignored. */
  isListenable: boolean;
  artist: StudioArtistRefDTO;
}

/** Every row, listenable or hidden. */
export interface AdminStudioSpotlightDTO {
  artistOfTheMonth: AdminStudioSpotlightArtistDTO | null;
  newStars: AdminStudioSpotlightArtistDTO[];
}

export interface AdminStudioSpotlightArtistOptionDTO {
  artist: StudioArtistRefDTO;
  /** The newest published release, for the result row. */
  latestReleaseTitle: string | null;
  isInArtistOfTheMonth: boolean;
  isInNewStars: boolean;
}

export interface SetAdminStudioSpotlightArtistBody {
  subprofileId: string;
  note?: string | null;
}

const SPOTLIGHT_PATH = "/admin/studio/spotlight";
const segment = (value: string) => encodeURIComponent(value);
const searchQuery = (query: string) => `q=${encodeURIComponent(query)}`;

export const getAdminStudioSpotlight = () =>
  apiGet<AdminStudioSpotlightDTO>(SPOTLIGHT_PATH);

/** Studio artist personas with a published release, by name or handle; at
 *  most 20. */
export const searchAdminStudioSpotlightArtists = (query: string) =>
  apiGet<{ items: AdminStudioSpotlightArtistOptionDTO[] }>(
    `${SPOTLIGHT_PATH}/artist-search?${searchQuery(query)}`,
  );

/** Replaces the current artist of the month with a fresh row; the old note
 *  goes with it. */
export const putAdminStudioArtistOfTheMonth = (
  body: SetAdminStudioSpotlightArtistBody,
) =>
  apiPut<AdminStudioSpotlightArtistDTO>(
    `${SPOTLIGHT_PATH}/artist-of-the-month`,
    body,
  );

/** 204, also when the slot is already empty. */
export const clearAdminStudioArtistOfTheMonth = () =>
  apiDelete<void>(`${SPOTLIGHT_PATH}/artist-of-the-month`);

/** Appended last. */
export const addAdminStudioNewStar = (
  body: SetAdminStudioSpotlightArtistBody,
) =>
  apiPost<AdminStudioSpotlightArtistDTO>(`${SPOTLIGHT_PATH}/new-stars`, body);

/** Every New stars row exactly once. */
export const reorderAdminStudioNewStars = (body: { spotlightIds: string[] }) =>
  apiPost<AdminStudioSpotlightArtistDTO[]>(
    `${SPOTLIGHT_PATH}/new-stars/reorder`,
    body,
  );

/** A null note clears it; the row keeps its `createdAt`. */
export const updateAdminStudioSpotlightNote = (
  spotlightId: string,
  body: { note: string | null },
) =>
  apiPatch<AdminStudioSpotlightArtistDTO>(
    `${SPOTLIGHT_PATH}/${segment(spotlightId)}`,
    body,
  );

/** 204; the slot closes the gap. */
export const removeAdminStudioSpotlightArtist = (spotlightId: string) =>
  apiDelete<void>(`${SPOTLIGHT_PATH}/${segment(spotlightId)}`);

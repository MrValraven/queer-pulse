import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import type {
  StudioLandingPhotoSlot,
  AdminStudioLandingPreviewDTO,
  AdminStudioLandingTrackOptionDTO,
  AdminStudioLandingArtistCardDTO,
  AdminStudioLandingPersonaOptionDTO,
  AdminStudioLandingPhotoDTO,
  AdminStudioFoundingArtistDTO,
  AdminStudioLandingSettingsDTO,
  AdminStudioLandingDTO,
  CreateAdminStudioLandingPreviewBody,
  ReorderAdminStudioLandingPreviewsBody,
  CreateAdminStudioLandingCardBody,
  UpdateAdminStudioLandingCardBody,
  ReorderAdminStudioLandingCardsBody,
  PutAdminStudioLandingPhotoBody,
  AddAdminStudioFoundingArtistBody,
  ReorderAdminStudioFoundingArtistsBody,
  SetAdminStudioLandingSettingsBody,
} from "./studioLandingAdmin.types";

/**
 * The Studio page's staff surface, mirroring the backend's
 * `AdminStudioLandingController`
 * (QUEERPULSE-STUDIO-LANDING-V2-CONTRACT-2026-10-28.md, section 9). Every
 * route is Moderator and Admin.
 */

export type * from "./studioLandingAdmin.types";

const LANDING_PATH = "/admin/studio/landing";
const segment = (value: string) => encodeURIComponent(value);
const searchQuery = (query: string) => `q=${encodeURIComponent(query)}`;

export const getAdminStudioLanding = () =>
  apiGet<AdminStudioLandingDTO>(LANDING_PATH);

export const searchAdminStudioLandingTracks = (query: string) =>
  apiGet<{ items: AdminStudioLandingTrackOptionDTO[] }>(
    `${LANDING_PATH}/track-search?${searchQuery(query)}`,
  );

export const searchAdminStudioLandingPersonas = (query: string) =>
  apiGet<{ items: AdminStudioLandingPersonaOptionDTO[] }>(
    `${LANDING_PATH}/persona-search?${searchQuery(query)}`,
  );

export const requestAdminStudioLandingPreview = (
  body: CreateAdminStudioLandingPreviewBody,
) => apiPost<AdminStudioLandingPreviewDTO>(`${LANDING_PATH}/previews`, body);

export const removeAdminStudioLandingPreview = (previewId: string) =>
  apiDelete<void>(`${LANDING_PATH}/previews/${segment(previewId)}`);

export const reorderAdminStudioLandingPreviews = (
  body: ReorderAdminStudioLandingPreviewsBody,
) =>
  apiPost<AdminStudioLandingPreviewDTO[]>(
    `${LANDING_PATH}/previews/reorder`,
    body,
  );

export const createAdminStudioLandingCard = (
  body: CreateAdminStudioLandingCardBody,
) =>
  apiPost<AdminStudioLandingArtistCardDTO>(
    `${LANDING_PATH}/artist-cards`,
    body,
  );

export const updateAdminStudioLandingCard = (
  cardId: string,
  body: UpdateAdminStudioLandingCardBody,
) =>
  apiPatch<AdminStudioLandingArtistCardDTO>(
    `${LANDING_PATH}/artist-cards/${segment(cardId)}`,
    body,
  );

export const removeAdminStudioLandingCard = (cardId: string) =>
  apiDelete<void>(`${LANDING_PATH}/artist-cards/${segment(cardId)}`);

export const reorderAdminStudioLandingCards = (
  body: ReorderAdminStudioLandingCardsBody,
) =>
  apiPost<AdminStudioLandingArtistCardDTO[]>(
    `${LANDING_PATH}/artist-cards/reorder`,
    body,
  );

/** A foreign upload may answer a 403 with no `code`. */
export const putAdminStudioLandingPhoto = (
  slot: StudioLandingPhotoSlot,
  body: PutAdminStudioLandingPhotoBody,
) =>
  apiPut<AdminStudioLandingPhotoDTO>(
    `${LANDING_PATH}/photos/${segment(slot)}`,
    body,
  );

/** Idempotent: removing an empty slot answers 204 too. */
export const removeAdminStudioLandingPhoto = (slot: StudioLandingPhotoSlot) =>
  apiDelete<void>(`${LANDING_PATH}/photos/${segment(slot)}`);

export const addAdminStudioFoundingArtist = (
  body: AddAdminStudioFoundingArtistBody,
) =>
  apiPost<AdminStudioFoundingArtistDTO>(
    `${LANDING_PATH}/founding-artists`,
    body,
  );

export const removeAdminStudioFoundingArtist = (foundingArtistId: string) =>
  apiDelete<void>(
    `${LANDING_PATH}/founding-artists/${segment(foundingArtistId)}`,
  );

export const reorderAdminStudioFoundingArtists = (
  body: ReorderAdminStudioFoundingArtistsBody,
) =>
  apiPost<AdminStudioFoundingArtistDTO[]>(
    `${LANDING_PATH}/founding-artists/reorder`,
    body,
  );

export const setAdminStudioLandingSettings = (
  body: SetAdminStudioLandingSettingsBody,
) => apiPut<AdminStudioLandingSettingsDTO>(`${LANDING_PATH}/settings`, body);

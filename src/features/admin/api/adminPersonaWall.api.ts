import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  PersonaWallAdminDTO,
  PersonaWallFillOrder,
  PersonaWallSearchResultDTO,
} from "../../subprofiles/api/personaWall.api";

/**
 * The admin persona wall routes (contract section 5,
 * `@Controller('admin/personas/wall')`, Admin only). Every write answers
 * with the whole admin wall: picks in position order, fill order, preview.
 */
const PERSONA_WALL_PATH = "/admin/personas/wall";

/** `GET /admin/personas/wall/search` answers with a wrapped list. */
interface PersonaWallSearchResponseDTO {
  items: PersonaWallSearchResultDTO[];
}

/** GET /admin/personas/wall: picks, fill order and the wall preview. */
export const getAdminPersonaWall = (
  signal?: AbortSignal,
): Promise<PersonaWallAdminDTO> =>
  apiGet<PersonaWallAdminDTO>(PERSONA_WALL_PATH, undefined, undefined, signal);

/** GET /admin/personas/wall/search?q=: listed personas, at most 20, with
 *  the picked ones flagged. */
export const searchAdminPersonaWall = async (
  query: string,
  signal?: AbortSignal,
): Promise<PersonaWallSearchResultDTO[]> =>
  (
    await apiGet<PersonaWallSearchResponseDTO>(
      `${PERSONA_WALL_PATH}/search?q=${encodeURIComponent(query)}`,
      undefined,
      undefined,
      signal,
    )
  ).items;

/** POST /admin/personas/wall/picks: appends the persona to the picks. */
export const addAdminPersonaWallPick = (body: {
  subprofileId: string;
}): Promise<PersonaWallAdminDTO> =>
  apiPost<PersonaWallAdminDTO>(`${PERSONA_WALL_PATH}/picks`, body);

/** PATCH /admin/personas/wall/picks/reorder: every pick id, each once. */
export const reorderAdminPersonaWallPicks = (body: {
  ids: string[];
}): Promise<PersonaWallAdminDTO> =>
  apiPatch<PersonaWallAdminDTO>(`${PERSONA_WALL_PATH}/picks/reorder`, body);

/** DELETE /admin/personas/wall/picks/:id: the positions after it close up. */
export const removeAdminPersonaWallPick = (
  pickId: string,
): Promise<PersonaWallAdminDTO> =>
  apiDelete<PersonaWallAdminDTO>(
    `${PERSONA_WALL_PATH}/picks/${encodeURIComponent(pickId)}`,
  );

/** PATCH /admin/personas/wall/settings: how the empty tiles fill. */
export const setAdminPersonaWallFillOrder = (body: {
  fillOrder: PersonaWallFillOrder;
}): Promise<PersonaWallAdminDTO> =>
  apiPatch<PersonaWallAdminDTO>(`${PERSONA_WALL_PATH}/settings`, body);

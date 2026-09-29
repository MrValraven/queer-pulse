import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type { DeskFocusId } from "../desk/deskFocus";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Mirrors `queerpulse-backend/src/magazine/magazine-desk-views.service.ts`
// (`DeskViewResponse`), `entities/magazine-desk-view.entity.ts`
// (`DeskViewQuery`) and `dto/{create,update}-desk-view.dto.ts`.

/**
 * The desk URL state a saved view restores. Every key is optional: a view
 * stores only what differs from the desk defaults. The backend refuses
 * unknown keys and values outside the desk's own sets
 * (`desk-view-query.validation.ts`), so this stays in step with
 * `DeskTrack`, `DeskFocusId`, `PieceFormatFilter`, `PieceSortOption` and
 * `DeskGroupBy`.
 */
export interface DeskViewQuery {
  track?: "unassigned" | "issue" | "everything";
  focus?: DeskFocusId[];
  format?: "all" | "article" | "deck";
  sections?: string[];
  stages?: string[];
  /** One editor's queue, or `null` for everyone's. */
  editor?: string | null;
  sort?: "due" | "stage" | "sec";
  groupBy?: "waiting" | "stage" | "section" | "none";
}

/** One of the caller's saved desk views. */
export interface DeskView {
  id: string;
  name: string;
  query: DeskViewQuery;
  /** Order in the list, lowest first. */
  position: number;
}

export interface CreateDeskViewDto {
  name: string;
  query: DeskViewQuery;
}

/** Every field optional; `position` is the view's new zero-based index. */
export interface UpdateDeskViewDto {
  name?: string;
  position?: number;
  query?: DeskViewQuery;
}

/** How many views one editor may keep. Mirrors `DESK_VIEWS_PER_OWNER_MAX`. */
export const DESK_VIEWS_PER_OWNER_MAX = 20;

/** Mirrors `DESK_VIEW_NAME_MAX`, for the name field's `maxLength`. */
export const DESK_VIEW_NAME_MAX = 60;

const DESK_VIEWS_PATH = "/magazine/admin/desk-views";

export const getDeskViews = () => apiGet<DeskView[]>(DESK_VIEWS_PATH);

export const createDeskView = (body: CreateDeskViewDto) =>
  apiPost<DeskView>(DESK_VIEWS_PATH, body);

export const updateDeskView = (id: string, body: UpdateDeskViewDto) =>
  apiPatch<DeskView>(`${DESK_VIEWS_PATH}/${id}`, body);

export const deleteDeskView = (id: string) =>
  apiDelete<void>(`${DESK_VIEWS_PATH}/${id}`);

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

// ── Public read (GET /press-kit) ────────────────────────────────────────────
// The public press-kit page's `usePressKit()` hook (owned by a separate agent)
// imports these DTOs + `getPressKitPublic` from here, mirroring how the public
// landing hook imports its DTOs from `landingFeatures.api.ts`.

/** One derived headline number. `key` maps to an i18n label
 *  (`marketing:pressKit.facts.<key>`); `value` is already formatted for
 *  display (e.g. `"1,847"`, `"96%"`, `"€278k"`). */
export interface PressKitFactDTO {
  key: string;
  value: string;
}

/** One piece of external press coverage. `url` is `null` when the outlet has
 *  no linkable online version. */
export interface PressCoverageDTO {
  id: string;
  source: string;
  title: string;
  meta: string;
  publishedOn: string;
  url: string | null;
}

/** One press-desk contact / spokesperson. `avatarUrl` is `null` when no photo
 *  has been uploaded. */
export interface PressContactDTO {
  id: string;
  name: string;
  role: string;
  description: string;
  languages: string;
  email: string;
  avatarUrl: string | null;
}

export interface PressKitResponseDTO {
  facts: PressKitFactDTO[];
  coverage: PressCoverageDTO[];
  contacts: PressContactDTO[];
}

export const getPressKitPublic = () =>
  apiGet<PressKitResponseDTO>("/press-kit");

// ── Admin list DTOs = public DTO + { position, active } ─────────────────────
export interface AdminPressCoverageDTO extends PressCoverageDTO {
  position: number;
  active: boolean;
}

export interface AdminPressContactDTO extends PressContactDTO {
  position: number;
  active: boolean;
}

/** The editable fields of a coverage row (everything but its server `id`,
 *  `position` and `active` flag). */
export type PressCoverageInput = Omit<PressCoverageDTO, "id">;
export type PressContactInput = Omit<PressContactDTO, "id">;

export type PressCoveragePatch = Partial<PressCoverageInput> & {
  active?: boolean;
};
export type PressContactPatch = Partial<PressContactInput> & {
  active?: boolean;
};

// ── Admin coverage CRUD (/admin/press-kit/coverage) ─────────────────────────
export const getAdminPressCoverage = () =>
  apiGet<AdminPressCoverageDTO[]>("/admin/press-kit/coverage");

export const createPressCoverage = (body: PressCoverageInput) =>
  apiPost<AdminPressCoverageDTO>("/admin/press-kit/coverage", body);

export const updatePressCoverage = (id: string, body: PressCoveragePatch) =>
  apiPatch<AdminPressCoverageDTO>(`/admin/press-kit/coverage/${id}`, body);

export const deletePressCoverage = (id: string) =>
  apiDelete<void>(`/admin/press-kit/coverage/${id}`);

export const reorderPressCoverage = (body: { orderedIds: string[] }) =>
  apiPatch<AdminPressCoverageDTO[]>(
    "/admin/press-kit/coverage/reorder",
    body,
  );

// ── Admin contact CRUD (/admin/press-kit/contacts) ──────────────────────────
export const getAdminPressContacts = () =>
  apiGet<AdminPressContactDTO[]>("/admin/press-kit/contacts");

export const createPressContact = (body: PressContactInput) =>
  apiPost<AdminPressContactDTO>("/admin/press-kit/contacts", body);

export const updatePressContact = (id: string, body: PressContactPatch) =>
  apiPatch<AdminPressContactDTO>(`/admin/press-kit/contacts/${id}`, body);

export const deletePressContact = (id: string) =>
  apiDelete<void>(`/admin/press-kit/contacts/${id}`);

export const reorderPressContacts = (body: { orderedIds: string[] }) =>
  apiPatch<AdminPressContactDTO[]>(
    "/admin/press-kit/contacts/reorder",
    body,
  );

import { apiGet, apiPost, apiDelete } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import type { Draft } from "../drafts.data";

// ── Backend DTO ─────────────────────────────────────────────────────────────
// The drafts contract (spec 09). Only the SERIALISABLE subset of Draft syncs —
// `meta`/`actions` are ReactNode and stay client-only, rebuilt as empty arrays
// when a synced draft comes back from the server.

export interface DraftDTO {
  id: string;
  kind: string;
  kindVariant: Draft["kindVariant"];
  title: string;
  desc: string;
  progress: number;
  ready?: boolean;
  category?: Draft["category"];
  status?: Draft["status"];
  href?: string;
  editedMinutes?: number;
  deadlineDays?: number | null;
  sortTitle?: string;
  searchText?: string;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export async function getDrafts(page?: number): Promise<Paginated<DraftDTO>> {
  const qs = page ? `?page=${page}` : "";
  const res = await apiGet<DraftDTO[] | Paginated<DraftDTO>>(`/me/drafts${qs}`);
  return toItemsPage(res);
}

export const createDraft = (dto: DraftDTO) =>
  apiPost<DraftDTO>("/me/drafts", dto);

export const deleteDraft = (id: string) => apiDelete<void>(`/me/drafts/${id}`);

// ── Adapters ────────────────────────────────────────────────────────────────

/** Pick the serialisable fields of a Draft; coerce title/desc to strings. */
export function draftToDto(d: Draft): DraftDTO {
  return {
    id: d.id,
    kind: d.kind,
    kindVariant: d.kindVariant,
    title: typeof d.title === "string" ? d.title : (d.sortTitle ?? ""),
    desc: typeof d.description === "string" ? d.description : "",
    progress: d.progress,
    ready: d.ready,
    category: d.category,
    status: d.status,
    href: d.href,
    editedMinutes: d.editedMinutes,
    deadlineDays: d.deadlineDays,
    sortTitle: d.sortTitle,
    searchText: d.searchText,
  };
}

/** Rebuild a client Draft from a DTO, defaulting the client-only ReactNode fields. */
export function dtoToDraft(dto: DraftDTO): Draft {
  return {
    id: dto.id,
    kind: dto.kind,
    kindVariant: dto.kindVariant,
    title: dto.title,
    description: dto.desc,
    meta: [],
    progress: dto.progress,
    ready: dto.ready,
    actions: [],
    category: dto.category,
    status: dto.status,
    href: dto.href,
    editedMinutes: dto.editedMinutes,
    deadlineDays: dto.deadlineDays,
    sortTitle: dto.sortTitle,
    searchText: dto.searchText,
  };
}

import { apiGet, apiPut, apiDelete } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import type {
  SavedItem,
  SavedKind,
} from "../../../app/providers/SavedProvider";

// ── Backend DTO ─────────────────────────────────────────────────────────────
// The saved-items contract (spec 09). Mirrors the client-side SavedItem plus a
// server-assigned `savedAt` timestamp the client drops when mapping back.

export interface SavedItemDTO {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string;
  kind: SavedKind;
  title: string;
  href?: string;
  meta?: string;
  description?: string;
  readTime?: string;
  /** ISO 8601 timestamp the save happened. */
  savedAt: string;
}

/** The mutable subset PUT accepts (everything except id + savedAt). */
export interface SavedItemBody {
  kind: SavedKind;
  title: string;
  href?: string;
  meta?: string;
  description?: string;
  readTime?: string;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export async function getSaved(
  params: { kind?: SavedKind; page?: number } = {},
): Promise<Paginated<SavedItemDTO>> {
  const q = new URLSearchParams();
  if (params.kind) q.set("kind", params.kind);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<SavedItemDTO[] | Paginated<SavedItemDTO>>(
    `/me/saved${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

/** Upsert a saved item. Returns 204. The id contains a colon → encode it. */
export const putSaved = (id: string, body: SavedItemBody) =>
  apiPut<void>(`/me/saved/${encodeURIComponent(id)}`, body);

export const deleteSaved = (id: string) =>
  apiDelete<void>(`/me/saved/${encodeURIComponent(id)}`);

/** Map a server DTO to the client-side SavedItem (drops savedAt). */
export function dtoToSavedItem(dto: SavedItemDTO): SavedItem {
  return {
    id: dto.id,
    kind: dto.kind,
    title: dto.title,
    href: dto.href,
    meta: dto.meta,
    description: dto.description,
    readTime: dto.readTime,
  };
}

/** Extract the PUT body from a SavedItem. */
export function savedItemToBody(item: SavedItem): SavedItemBody {
  return {
    kind: item.kind,
    title: item.title,
    href: item.href,
    meta: item.meta,
    description: item.description,
    readTime: item.readTime,
  };
}

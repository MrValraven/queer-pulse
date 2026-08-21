import { apiGet, apiPost, apiPatch, apiDelete } from "../../../shared/api/client";
import type { SavedItemDTO } from "./saved.api";

// ── Backend DTO ─────────────────────────────────────────────────────────────
// The collections contract (P2-11): member-named groupings of saved items.
// Mirrors `CollectionDTO`/`CollectionDetailDTO` on the NestJS side
// (`collections/collections-response.ts`). Owner-scoped — the API only ever
// answers with the caller's own collections.

export interface CollectionDTO {
  id: string;
  name: string;
  emoji?: string;
  cover?: string;
  /** Number of saved items filed in this collection. */
  itemCount: number;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

/** A collection plus its filed items, hydrated from the member's saved rows. */
export interface CollectionDetailDTO extends CollectionDTO {
  items: SavedItemDTO[];
}

export interface CreateCollectionBody {
  name: string;
  emoji?: string;
  cover?: string;
}

export type UpdateCollectionBody = Partial<CreateCollectionBody>;

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

/** `GET /me/collections` — the member's collections, newest-updated first. */
export const getCollections = () =>
  apiGet<CollectionDTO[]>("/me/collections");

/**
 * `GET /me/collections/filed-refs` — every saved-item ref filed in any of the
 * member's collections, across the whole set. Lets the "recently saved · not
 * yet in a collection" list tell unfiled saves apart from ones already filed
 * without fetching each collection's items.
 */
export const getFiledRefs = () =>
  apiGet<string[]>("/me/collections/filed-refs");

/** `GET /me/collections/:id` — one collection with its hydrated items. */
export const getCollection = (id: string) =>
  apiGet<CollectionDetailDTO>(`/me/collections/${encodeURIComponent(id)}`);

/** `POST /me/collections` — create an empty collection. */
export const createCollection = (body: CreateCollectionBody) =>
  apiPost<CollectionDTO>("/me/collections", body);

/** `PATCH /me/collections/:id` — rename / re-cover. */
export const updateCollection = (id: string, body: UpdateCollectionBody) =>
  apiPatch<CollectionDTO>(`/me/collections/${encodeURIComponent(id)}`, body);

/** `DELETE /me/collections/:id` — delete (its items cascade). Returns 204. */
export const deleteCollection = (id: string) =>
  apiDelete<void>(`/me/collections/${encodeURIComponent(id)}`);

/**
 * `POST /me/collections/:id/items` — file a saved item. `ref` is the composite
 * saved-item id (`<kind>:<subjectId>`) from `saved.api.ts`. Returns 204.
 */
export const addCollectionItem = (id: string, ref: string) =>
  apiPost<void>(`/me/collections/${encodeURIComponent(id)}/items`, { ref });

/** `DELETE /me/collections/:id/items/:ref` — unfile an item. Returns 204. */
export const removeCollectionItem = (id: string, ref: string) =>
  apiDelete<void>(
    `/me/collections/${encodeURIComponent(id)}/items/${encodeURIComponent(ref)}`,
  );

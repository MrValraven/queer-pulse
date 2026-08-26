import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import type { SavedItemBody, SavedItemDTO } from "./saved.api";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// The saved-lists contract (SOC-12). Mirrors `SavedListDTO` /
// `SharedSavedListDTO` on the NestJS side (`saved/saved-list-response.ts`).
//
// This replaces `collections.api.ts`, which talked to an owner-private
// `/me/collections` that had no way to share. A saved list is the same idea
// with three differences that matter: every member has one default list holding
// everything they saved, an item can sit in several lists at once, and a list
// can carry a revocable share link.

export interface SavedListDTO {
  id: string;
  name: string;
  /** The member's "everything I saved" list. It cannot be deleted, and items
   *  leave it by being unsaved rather than by being removed from it. */
  isDefault: boolean;
  itemCount: number;
  /** Whether a share link exists right now. False until the owner asks. */
  isShared: boolean;
  /**
   * The share secret itself, or `null` when the list is private. The API only
   * ever returns this on the owner's own reads, because it IS the link they are
   * about to send somebody. Build the URL with `sharedSavedListUrl`.
   */
  shareToken: string | null;
  /** ISO 8601 timestamp the current link was minted, or `null`. */
  sharedAt: string | null;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

/**
 * What somebody holding a share link sees. Deliberately anonymous: the API
 * returns the list's name and its items and nothing at all about who owns it.
 */
export interface SharedSavedListDTO {
  name: string;
  itemCount: number;
  items: SavedItemDTO[];
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

/** `GET /me/saved/lists` — the member's lists, default first then newest. */
export const getSavedLists = () => apiGet<SavedListDTO[]>("/me/saved/lists");

/** `GET /me/saved?listId=` — the items filed in one of the member's lists. */
export async function getSavedListItems(
  listId: string,
  page?: number,
): Promise<Paginated<SavedItemDTO>> {
  const query = new URLSearchParams({ listId });
  if (page) query.set("page", String(page));
  const response = await apiGet<SavedItemDTO[] | Paginated<SavedItemDTO>>(
    `/me/saved?${query.toString()}`,
  );
  return toItemsPage(response);
}

/** `POST /me/saved/lists` — create a named, empty, private list. */
export const createSavedList = (name: string) =>
  apiPost<SavedListDTO>("/me/saved/lists", { name });

/** `PATCH /me/saved/lists/:listId` — rename a list. */
export const renameSavedList = (listId: string, name: string) =>
  apiPatch<SavedListDTO>(`/me/saved/lists/${encodeURIComponent(listId)}`, {
    name,
  });

/** `DELETE /me/saved/lists/:listId` — delete a list. The items stay saved. */
export const deleteSavedList = (listId: string) =>
  apiDelete<void>(`/me/saved/lists/${encodeURIComponent(listId)}`);

/**
 * `PUT /me/saved/lists/:listId/items/:ref` — save an item and file it in this
 * list in one call. `ref` is the composite `<kind>:<subjectId>` saved-item id.
 */
export const addItemToSavedList = (
  listId: string,
  ref: string,
  body: SavedItemBody,
) =>
  apiPut<void>(
    `/me/saved/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(ref)}`,
    body,
  );

/** `DELETE /me/saved/lists/:listId/items/:ref` — take an item out of this list
 *  without unsaving it. Refused on the default list, where unsaving is the
 *  honest way to remove something. */
export const removeItemFromSavedList = (listId: string, ref: string) =>
  apiDelete<void>(
    `/me/saved/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(ref)}`,
  );

/** `POST /me/saved/lists/:listId/share` — mint (or return) the share link.
 *  Idempotent: asking twice never rotates a link already sent to somebody. */
export const shareSavedList = (listId: string) =>
  apiPost<SavedListDTO>(`/me/saved/lists/${encodeURIComponent(listId)}/share`);

/** `DELETE /me/saved/lists/:listId/share` — revoke the link. Every copy of the
 *  URL anyone holds stops working immediately. Idempotent. */
export const unshareSavedList = (listId: string) =>
  apiDelete<SavedListDTO>(
    `/me/saved/lists/${encodeURIComponent(listId)}/share`,
  );

/**
 * `GET /saved-lists/:token` — the read behind a share link.
 *
 * PUBLIC AND UNAUTHENTICATED on the backend (`@Public()` on
 * `SharedSavedListController`), by design: the point is sending it to a friend
 * who has just moved to the city and may not have an account. Anyone holding
 * the link can read it. The sharing UI has to say that before a link is made.
 *
 * A revoked, malformed, or never-real token all answer 404 with the same
 * message, so the endpoint cannot be used to tell them apart.
 */
export const getSharedSavedList = (token: string) =>
  apiGet<SharedSavedListDTO>(`/saved-lists/${encodeURIComponent(token)}`);

/**
 * The absolute URL a member sends somebody, built from the token the API
 * returned. Absolute because it is going into a chat message or a clipboard,
 * where a relative path means nothing.
 */
export function sharedSavedListUrl(shareToken: string): string {
  return `${window.location.origin}/lists/${encodeURIComponent(shareToken)}`;
}

import { apiGet, apiPut, apiDelete } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import type {
  SavedItem,
  SavedItemAvailability,
  SavedItemUnavailableReason,
  SavedKind,
} from "../../../app/providers/useSaved";

// ── Backend DTO ─────────────────────────────────────────────────────────────
// The saved-items contract (spec 09). Mirrors the client-side SavedItem plus a
// server-assigned `savedAt` timestamp the client drops when mapping back.
//
// The API resolves every save against its subject before answering, so `href`
// and `availability` are the server's live verdict rather than the snapshot the
// save was written with (PRD-169). An item whose subject can no longer be
// opened STAYS in the response and still counts toward the total: the member
// saved it, and silently dropping it would leave them wondering what happened.

export interface SavedItemDTO {
  /** Stable unique id, conventionally `${kind}:${slug}`. */
  id: string;
  kind: SavedKind;
  title: string;
  /** Always present. `null` when the subject can no longer be opened, except
   *  a withdrawn Studio save, which keeps its href (see `unavailableReason`). */
  href: string | null;
  meta?: string;
  description?: string;
  readTime?: string;
  /** ISO 8601 timestamp the save happened. */
  savedAt: string;
  /**
   * The server's verdict on the subject. Always present. `"unavailable"` names
   * a cause only through `unavailableReason`, and only for a Studio takedown;
   * any other cause stays unnamed on purpose: it would leak whether something
   * was deleted, made private, or hidden from this member in particular.
   */
  availability: SavedItemAvailability;
  /**
   * Studio open pages: "withdrawn" on a `studio_release` or `studio_track`
   * save our team took down. The only reason the API ever names, and such a
   * row keeps its stored `href`, because that release's own URL explains it
   * without saying more. Every other unavailable row has `href: null`.
   */
  unavailableReason?: SavedItemUnavailableReason;
  /**
   * Studio Library cards: on every `studio_release` and `studio_playlist`
   * row, the release cover or the playlist's first playable cover. `null`
   * when there is none, and always `null` on an unavailable row.
   */
  coverUrl?: string | null;
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
    availability: dto.availability,
    unavailableReason:
      dto.availability === "unavailable" ? dto.unavailableReason : undefined,
    ...(dto.coverUrl !== undefined ? { coverUrl: dto.coverUrl } : {}),
  };
}

/**
 * Extract the PUT body from a SavedItem. `availability` is deliberately not in
 * it: it is the server's verdict, and a client claiming its own save is still
 * live would be claiming something it cannot know.
 */
export function savedItemToBody(item: SavedItem): SavedItemBody {
  return {
    kind: item.kind,
    title: item.title,
    href: item.href ?? undefined,
    meta: item.meta,
    description: item.description,
    readTime: item.readTime,
  };
}

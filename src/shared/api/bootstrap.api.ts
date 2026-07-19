import { apiGet } from "./client";
import type { ItemsPage } from "./pagination";
import type { ProfileDTO } from "../../features/members/api/members.api";
import type { SavedItemDTO } from "../../features/members/api/saved.api";
import type { BlockDTO, MuteDTO } from "../../features/social/api/social.api";

/**
 * The session bootstrap payload (backend `BootstrapResponse`). Each list slice
 * is the same shape its standalone endpoint returns, so the values drop
 * straight into the caches those endpoints already populate — see
 * `useSessionBootstrap`.
 *
 * `saved`/`blocks`/`mutes` carry the same defensive union their standalone
 * fetchers type their raw response as (see `getSaved`/`getBlocks`/`getMutes`,
 * each `T[] | Paginated<T>` before `toItemsPage`): some backend list endpoints
 * answer with a bare array instead of the `{ items, total, page, pageSize }`
 * envelope, and this endpoint composes the same underlying list handlers, so
 * it can carry the same shape on the wire. `useSessionBootstrap` normalizes
 * each slice through `toItemsPage` before seeding or returning it, so nothing
 * downstream — the seeded `["blocks"/"mutes", false]` caches, or
 * `SavedProvider` reading `bootstrap.saved.items` — ever reads `.items` off a
 * bare array.
 */
export interface BootstrapDTO {
  profile: ProfileDTO;
  saved: ItemsPage<SavedItemDTO> | SavedItemDTO[];
  blocks: ItemsPage<BlockDTO> | BlockDTO[];
  mutes: ItemsPage<MuteDTO> | MuteDTO[];
}

/** GET /me/bootstrap — one round trip for the four session slices. */
export const getBootstrap = () => apiGet<BootstrapDTO>("/me/bootstrap");

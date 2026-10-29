import { apiGet, apiPost } from "../../../../shared/api/client";
import type {
  AdminMusicEventListPageDTO,
  MusicEventBucket,
  StudioArtistSearchPageDTO,
} from "./musicEvents.types";

/** One bucket page of the house music events (contract route 2). */
export const getMusicEvents = (bucket: MusicEventBucket, page: number) =>
  apiGet<AdminMusicEventListPageDTO>(
    `/admin/music-events?bucket=${bucket}&page=${page}`,
  );

/** Members who created a linked, listenable artist persona, matched on `q`
 *  (contract route 1). An empty `q` lists all of them. */
export const searchStudioArtists = (query: string, page: number) =>
  apiGet<StudioArtistSearchPageDTO>(
    `/admin/music-events/studio-artists/search?${new URLSearchParams({
      q: query,
      page: String(page),
    })}`,
  );

/** Adds a cohost straight away, with no invite (contract route 27). */
export const addMusicEventCohost = (eventSlug: string, memberSlug: string) =>
  apiPost<{ ok: true }>(`/admin/music-events/${eventSlug}/cohosts`, {
    slug: memberSlug,
  });

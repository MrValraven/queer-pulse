// Feeds the extra clips (contract 9.1 cache retention) through the v1
// preloader. preloadVjPack asks its fetchMedia for a whole pack first
// (clipIds null) and then once more for the clips whose URL expired; this
// adapter answers both from GET /admin/vj/clips/media under a pseudo pack id,
// so the extra clips get the pack's expiry, retry and failure rules as they
// stand.

import {
  VJ_LIMITS,
  type VjClipMediaListDTO,
  type VjPackMediaDTO,
} from "../../../shared/contracts/vj";

/** The pack id the extra clips' preload runs and answers under. */
export const VJ_EXTRA_CLIPS_PACK_ID = "vj-extra-clips";

export type VjExtraClipsMediaSource = (
  clipIds: string[],
  signal?: AbortSignal,
) => Promise<VjClipMediaListDTO>;

export type VjExtraClipFetcher = (
  packId: string,
  clipIds: string[] | null,
  signal?: AbortSignal,
) => Promise<VjPackMediaDTO>;

/**
 * Adapts getVjClipsMedia to the preloader's fetchMedia shape: a pseudo pack
 * id, items in query order. The first request (clipIds null) asks for
 * `extraClipIds`; the preloader's re-request asks for the ids it names.
 */
export function createVjExtraClipFetcher(
  getClipsMedia: VjExtraClipsMediaSource,
  extraClipIds: readonly string[],
): VjExtraClipFetcher {
  return async (_packId, clipIds, signal) => {
    const requestedClipIds = (clipIds ?? extraClipIds).slice(
      0,
      VJ_LIMITS.mediaClipIdsMax,
    );
    if (requestedClipIds.length === 0) {
      return { packId: VJ_EXTRA_CLIPS_PACK_ID, items: [] };
    }
    const media = await getClipsMedia(requestedClipIds, signal);
    return { packId: VJ_EXTRA_CLIPS_PACK_ID, items: media.items };
  };
}

import { getStudioLikedStatus } from "./studioLiked.api";

/** One liked-status request holds at most this many tracks (the server's
 *  cap). */
const MAX_IDS_PER_REQUEST = 100;
/** Hearts mount together (a tracklist, a search page); a short wait gathers
 *  them into one request. */
const GATHER_DELAY_MS = 30;

interface Waiter {
  resolve: (isLiked: boolean) => void;
  reject: (error: unknown) => void;
}

const waitersByTrackId = new Map<string, Waiter[]>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  flushTimer = null;
  const batch = new Map(waitersByTrackId);
  waitersByTrackId.clear();
  const trackIds = [...batch.keys()];
  for (let start = 0; start < trackIds.length; start += MAX_IDS_PER_REQUEST) {
    const chunk = trackIds.slice(start, start + MAX_IDS_PER_REQUEST);
    try {
      const { likedTrackIds } = await getStudioLikedStatus(chunk);
      const likedIds = new Set(likedTrackIds.map((id) => id.toLowerCase()));
      for (const trackId of chunk)
        for (const waiter of batch.get(trackId) ?? [])
          waiter.resolve(likedIds.has(trackId.toLowerCase()));
    } catch (error) {
      for (const trackId of chunk)
        for (const waiter of batch.get(trackId) ?? []) waiter.reject(error);
    }
  }
}

/** Whether the member has liked this track, asked of the server. Every
 *  call within a short window shares one request. */
export function readStudioLikedStatus(trackId: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    const waiters = waitersByTrackId.get(trackId) ?? [];
    waiters.push({ resolve, reject });
    waitersByTrackId.set(trackId, waiters);
    flushTimer ??= setTimeout(() => void flush(), GATHER_DELAY_MS);
  });
}

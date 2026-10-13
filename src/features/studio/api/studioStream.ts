import { getStudioStream } from "./studio.api";
import type { StudioStreamDTO } from "./studio.types";

const DEMO_STREAM_LIFETIME_MS = 15 * 60_000;

/**
 * A fresh signed stream URL for one track. Fetched imperatively by the player
 * for the one track that is loading: the URL expires in 15 minutes and lives
 * in memory only. Demo has no audio files, so it answers
 * an empty URL that the simulated engine plays as a silent clock.
 */
export async function fetchStudioStream(
  demoMode: boolean,
  trackId: string,
): Promise<StudioStreamDTO> {
  if (demoMode) {
    return {
      url: "",
      expiresAt: new Date(Date.now() + DEMO_STREAM_LIFETIME_MS).toISOString(),
    };
  }
  return getStudioStream(trackId);
}

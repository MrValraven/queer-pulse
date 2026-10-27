import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioArtistView } from "../api/studio.adapters";
import { useStudioAccess } from "../api/useStudioAccess";
import { useStudioArtist } from "../api/useStudioArtist";
import type { StudioQueueItem } from "./studioPlayerContext";

export type StudioNowPlayingArtistState =
  | { status: "loading"; artist: null }
  | { status: "ready"; artist: StudioArtistView }
  | { status: "failed"; artist: null };

const LOADING: StudioNowPlayingArtistState = {
  status: "loading",
  artist: null,
};
const FAILED: StudioNowPlayingArtistState = { status: "failed", artist: null };

/**
 * The persona behind the playing item, for the Now playing artist sections.
 * It reads the same cache as the artist page, so a Follow there or here
 * shows on both. A view only counts as ready when its persona id matches
 * the item's artist, so a new track never shows the previous artist while
 * its own read is on the way. A failed read, a missing persona or a member
 * without Studio access reads as failed, and the sections fold away
 * quietly.
 */
export function useStudioNowPlayingArtist(
  item: StudioQueueItem,
): StudioNowPlayingArtistState {
  const { demoMode } = useDemoMode();
  const access = useStudioAccess();
  const hasArtistId = item.artistId !== "";
  // An empty id reads as failed: passing null would open the demo's
  // default artist, which is someone else.
  const { artist, loadState } = useStudioArtist(
    hasArtistId ? item.artistId : null,
    { isSilent: true, isEnabled: hasArtistId },
  );
  if (!hasArtistId) return FAILED;
  if (!demoMode && access.status === "denied") return FAILED;
  if (loadState.isError || loadState.isNotFound || loadState.isWithdrawn)
    return FAILED;
  if (artist?.artist.id === item.artistId) return { status: "ready", artist };
  return LOADING;
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { isTranscriptFormat } from "../../api/studio.adapters";
import { studioTrackQueryOptions } from "../../api/studioTrackQuery";
import { useStudioAccess } from "../../api/useStudioAccess";
import type { StudioQueueItem } from "../studioPlayerContext";

/** Artist kinds: an episode or a spoken word track carries a transcript
 *  where music carries lyrics (spec 5.4, 6.4). An episode says so on its
 *  queue item; a spoken word track says so through its release format, read
 *  from the same track detail the player already holds. A private preview
 *  never asks for that detail. */
export function useNowPlayingIsTranscript(item: StudioQueueItem): boolean {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const isEpisode = item.isEpisode === true;
  const detail = useQuery({
    ...studioTrackQueryOptions(demoMode, item.trackId),
    enabled: !isEpisode && !item.previewToken && (demoMode || hasAccess),
  });
  if (isEpisode) return true;
  const track = detail.data?.id === item.trackId ? detail.data : null;
  return track !== null && isTranscriptFormat(track.release.format);
}

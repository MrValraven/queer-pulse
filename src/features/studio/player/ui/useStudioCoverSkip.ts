import { useStudioPlayer } from "../studioPlayerContext";
import type { CoverSkipDirection } from "./useNowPlayingCoverSwipe";

/** Whether a sideways pull may skip. An episode moves by its seek skips
 *  and not between tracks, so its cover only springs back. Previous always
 *  has somewhere to go: with nothing before, it restarts the track. */
export function useStudioCoverSkip() {
  const player = useStudioPlayer();
  const isEpisode = player.currentItem?.isEpisode === true;
  return {
    canSkip: (direction: CoverSkipDirection) =>
      !isEpisode && (direction === "previous" || player.hasNext),
    onSkip: (direction: CoverSkipDirection) => {
      if (direction === "next") player.next();
      else player.previous();
    },
  };
}

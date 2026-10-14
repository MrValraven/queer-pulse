import { useCallback } from "react";
import { findMainLandmark } from "../../../app/mainLandmarkFocus";
import { saveCurrentEpisodePlace } from "./studioEpisodePlay";
import { useStudioPlayer } from "./studioPlayerContext";
import { useStudioPlayerSurface } from "./studioPlayerSurface";

/** Focus goes to the page's <main>, without scrolling, since the pressed
 *  button is leaving with the bar. A <main> with no tabindex gets the
 *  programmatic-only -1 first, or focus() would pass it by. */
function focusMainLandmark() {
  const mainLandmark = findMainLandmark();
  if (!mainLandmark) return;
  if (!mainLandmark.hasAttribute("tabindex"))
    mainLandmark.setAttribute("tabindex", "-1");
  mainLandmark.focus({ preventScroll: true });
}

/**
 * Closes the Studio player, for every close control (bar, mini player, More).
 * An episode's place is saved first, Now playing, the queue panel and the
 * shortcuts sheet close, then the audio stops at once: both decks drop their
 * source, which ends the stream's download, and the saved queue goes, so a
 * reload keeps the bar away. Any Play brings it back.
 */
export function useStudioPlayerClose(): () => void {
  const { stop } = useStudioPlayer();
  const { closeNowPlaying, closeQueuePanel, closeShortcuts } =
    useStudioPlayerSurface();
  return useCallback(() => {
    saveCurrentEpisodePlace();
    closeNowPlaying();
    closeQueuePanel();
    closeShortcuts();
    stop();
    focusMainLandmark();
  }, [stop, closeNowPlaying, closeQueuePanel, closeShortcuts]);
}

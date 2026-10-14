import { useStudioEpisodeTracking } from "./useStudioEpisodeTracking";

/** Renders nothing: keeps the episode memory in step with the player while
 *  a queue exists. */
export function StudioEpisodeTracker() {
  useStudioEpisodeTracking();
  return null;
}

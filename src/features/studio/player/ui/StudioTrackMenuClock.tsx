import { useLayoutEffect } from "react";
import { useStudioPlayerClock } from "../studioPlayerContext";

/** Reads the playhead for the open menu of the track that is playing, so
 *  only that one menu re-renders as it plays, once a second. Closed menus
 *  and every other row stay still. */
export function StudioTrackMenuClock({
  onSeconds,
}: {
  onSeconds: (seconds: number) => void;
}) {
  const { currentTime } = useStudioPlayerClock();
  const seconds = Math.floor(currentTime);
  useLayoutEffect(() => {
    onSeconds(seconds);
  }, [onSeconds, seconds]);
  return null;
}

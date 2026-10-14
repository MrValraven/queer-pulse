import { Suspense } from "react";
import { AnimatePresence } from "motion/react";
import { lazyNamed } from "../../app/routeHelpers";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioPlayerInset } from "./useStudioPlayerInset";
import { StudioEpisodeTracker } from "./player/StudioEpisodeTracker";
import { useStudioPlayer } from "./player/studioPlayerContext";

// Lazy: the bar's chunk loads the first time a member presses play.
const StudioPlayer = lazyNamed(() => import("./StudioPlayer"), "StudioPlayer");

/** The bar shows only while something is queued and the member has access.
 *  When the queue empties (the member closed the player) the bar plays its
 *  exit before it unmounts; a Play during that exit brings it straight back. */
export function StudioPlayerMount() {
  const player = useStudioPlayer();
  const { hasAccess } = useStudioAccess();
  const barRef = useStudioPlayerInset();
  const isShown = player.hasQueue && hasAccess;
  return (
    <>
      {isShown && <StudioEpisodeTracker />}
      <AnimatePresence>
        {isShown && (
          <Suspense key="studio-player" fallback={null}>
            <StudioPlayer barRef={barRef} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}

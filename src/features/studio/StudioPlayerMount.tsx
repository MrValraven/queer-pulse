import { Suspense } from "react";
import { lazyNamed } from "../../app/routeHelpers";
import { useStudioAccess } from "./api/useStudioAccess";
import { useStudioPlayerInset } from "./useStudioPlayerInset";
import { useStudioPlayer } from "./player/studioPlayerContext";

// Lazy: the bar's chunk loads the first time a member presses play.
const StudioPlayer = lazyNamed(() => import("./StudioPlayer"), "StudioPlayer");

/** The bar shows only while something is queued and the member has access. */
export function StudioPlayerMount() {
  const player = useStudioPlayer();
  const { hasAccess } = useStudioAccess();
  const barRef = useStudioPlayerInset();
  if (player.queue.length === 0 || !hasAccess) return null;
  return (
    <Suspense fallback={null}>
      <StudioPlayer barRef={barRef} />
    </Suspense>
  );
}

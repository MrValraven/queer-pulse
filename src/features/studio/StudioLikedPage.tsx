import type { ReactNode } from "react";
import { useStudioLikedTracks } from "./api/useStudioLikedTracks";
import { StudioLikedEntries } from "./StudioLikedEntries";
import { StudioLikedHero } from "./StudioLikedHero";
import { StudioDetailSkeleton, StudioLoadError } from "./StudioLoadStates";
import { StudioShell } from "./StudioShell";

/** Liked songs at /studio/liked: every member's own private playlist, made
 *  of the tracks they liked with a heart. Nobody else can open it. */
export function StudioLikedPage() {
  const liked = useStudioLikedTracks();
  let body: ReactNode;
  if (liked.loadState.isError)
    body = <StudioLoadError loadState={liked.loadState} />;
  else if (liked.loadState.isLoading) body = <StudioDetailSkeleton />;
  else
    body = (
      <>
        <StudioLikedHero
          playableTracks={liked.playableTracks}
          trackCount={liked.trackCount}
          totalDurationSeconds={liked.totalDurationSeconds}
        />
        <StudioLikedEntries liked={liked} />
      </>
    );
  return <StudioShell>{body}</StudioShell>;
}

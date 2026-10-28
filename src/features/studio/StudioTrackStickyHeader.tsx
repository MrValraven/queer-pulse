import type { StudioTrackView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioStickyHeader } from "./kit/StudioStickyHeader";
import { StudioStickyCover } from "./StudioDetailSticky";
import { useStudioTrackPlay } from "./useStudioTrackPlay";

/** The track page's compact header: the release cover, the title and the
 *  hero's own Play, once the hero has scrolled away. A hidden track keeps
 *  the title alone, as its hero offers no Play. */
export function StudioTrackStickyHeader({
  track,
  sentinel,
}: {
  track: StudioTrackView;
  sentinel: Element | null;
}) {
  const play = useStudioTrackPlay(track);
  return (
    <StudioStickyHeader
      sentinel={sentinel}
      title={track.title}
      tint={track.release.tint}
      coverUrl={track.release.coverUrl}
      cover={
        <StudioStickyCover
          src={track.release.coverUrl}
          tint={track.release.tint}
        />
      }
      actions={
        play.isHidden ? undefined : (
          <StudioPlayButton
            size="card"
            state={play.state}
            onToggle={play.toggle}
            label={play.label}
            blockedReason={play.blockedReason}
          />
        )
      }
    />
  );
}

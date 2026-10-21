import type { StudioArtistView } from "./api/studio.adapters";
import { StudioPlayButton } from "./kit/StudioPlayButton";
import { StudioStickyHeader } from "./kit/StudioStickyHeader";
import { StudioStickyCover } from "./StudioDetailSticky";
import { useStudioArtistPlay } from "./useStudioArtistPlay";

/** The artist page's compact header: the round portrait, the name and the
 *  hero's Play all, once the hero has scrolled away. */
export function StudioArtistStickyHeader({
  artist,
  sentinel,
}: {
  artist: StudioArtistView;
  sentinel: Element | null;
}) {
  const play = useStudioArtistPlay(artist);
  const person = artist.artist;
  return (
    <StudioStickyHeader
      sentinel={sentinel}
      title={person.name}
      tint={person.tint}
      cover={
        <StudioStickyCover src={person.avatarUrl} tint={person.tint} isRound />
      }
      actions={
        <StudioPlayButton
          size="card"
          state={play.state}
          onToggle={play.toggle}
          label={play.label}
          blockedReason={play.blockedReason}
        />
      }
    />
  );
}

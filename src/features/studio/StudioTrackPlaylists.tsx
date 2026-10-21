import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useStudioTrackPlaylists } from "./api/useStudioTrackPlaylists";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import { StudioShelf } from "./kit/StudioShelf";

/** "In these playlists": up to six public playlists holding this track.
 *  Quiet by design: nothing renders while it loads, when it fails or when
 *  there are none, and it grows in when there are. */
export function StudioTrackPlaylists({ trackId }: { trackId: string }) {
  const headingId = useId();
  const { playlists } = useStudioTrackPlaylists(trackId);
  return (
    <Collapse isOpen={playlists.length > 0}>
      <StudioShelf
        id={headingId}
        title={
          <Translation
            i18nKey="studio:playlist.inThese.heading"
            components={{ em: <em /> }}
          />
        }
      >
        {playlists.map((playlist) => (
          <StudioPlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </StudioShelf>
    </Collapse>
  );
}

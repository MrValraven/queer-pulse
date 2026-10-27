import type { StudioQueueItem } from "../studioPlayerContext";
import { useStudioNowPlayingArtist } from "../useStudioNowPlayingArtist";
import { StudioNowPlayingAbout } from "./StudioNowPlayingAbout";
import { StudioNowPlayingArtistExtras } from "./StudioNowPlayingArtistExtras";
import css from "./StudioNowPlayingArtist.module.css";

/** The phone Now playing's Artist tab: the About card and the artist
 *  extras, reading the playing item's persona once for both. */
export function StudioNowPlayingArtistPane({
  item,
}: {
  item: StudioQueueItem;
}) {
  const artistState = useStudioNowPlayingArtist(item);
  return (
    <div className={css.pane}>
      <StudioNowPlayingAbout item={item} artistState={artistState} />
      <StudioNowPlayingArtistExtras item={item} artistState={artistState} />
    </div>
  );
}

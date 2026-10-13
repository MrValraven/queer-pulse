import { useId } from "react";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useStudioTrackPlaylists } from "./api/useStudioTrackPlaylists";
import { StudioPlaylistCard } from "./StudioPlaylistCard";
import styles from "./studio.module.css";

/** "In these playlists": up to six public playlists holding this track.
 *  Quiet by design: nothing renders while it loads, when it fails or when
 *  there are none, and it grows in when there are. */
export function StudioTrackPlaylists({ trackId }: { trackId: string }) {
  const headingId = useId();
  const { playlists } = useStudioTrackPlaylists(trackId);
  return (
    <Collapse isOpen={playlists.length > 0}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation
              i18nKey="studio:playlist.inThese.heading"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={styles.rowGrid}>
          {playlists.map((playlist) => (
            <StudioPlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>
    </Collapse>
  );
}

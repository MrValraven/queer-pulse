import { useId } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import { StudioArtistCard } from "./StudioArtistCard";
import { HOME_ARTIST_LIMIT, uniqueArtists } from "./studioHome.data";
import styles from "./studio.module.css";

export function StudioArtistsRow({
  releases,
}: {
  releases: StudioReleaseCardView[];
}) {
  const headingId = useId();
  const artists = uniqueArtists(releases, HOME_ARTIST_LIMIT);
  if (artists.length === 0) return null;
  return (
    <section className={styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation
            i18nKey="studio:home.artists.title"
            components={{ em: <em /> }}
          />
        </h2>
      </div>
      <div className={styles.rowGrid}>
        {artists.map((artist) => (
          <StudioArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}

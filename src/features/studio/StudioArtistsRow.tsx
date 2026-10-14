import { useId } from "react";
import { Translation } from "../../shared/i18n/Translation";
import type {
  StudioArtistRefView,
  StudioReleaseCardView,
} from "./api/studio.adapters";
import { StudioArtistCard } from "./StudioArtistCard";
import { HOME_ARTIST_LIMIT, uniqueArtists } from "./studioHome.data";
import styles from "./studio.module.css";

/** A row of artist cards: the artists behind `releases` (home), or a given
 *  list (a scene's artists, related artists). Empty renders nothing; a
 *  caller that shows and hides it wraps it in Collapse. `className`
 *  replaces the row's own spacing for a page with its own section rhythm. */
export function StudioArtistsRow({
  releases = [],
  artists,
  titleKey = "studio:home.artists.title",
  className,
}: {
  releases?: StudioReleaseCardView[];
  artists?: StudioArtistRefView[];
  titleKey?: string;
  className?: string;
}) {
  const headingId = useId();
  const rowArtists = artists ?? uniqueArtists(releases, HOME_ARTIST_LIMIT);
  if (rowArtists.length === 0) return null;
  return (
    <section className={className ?? styles.row} aria-labelledby={headingId}>
      <div className={styles.rowH}>
        <h2 id={headingId}>
          <Translation i18nKey={titleKey} components={{ em: <em /> }} />
        </h2>
      </div>
      <div className={styles.rowGrid}>
        {rowArtists.map((artist) => (
          <StudioArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </section>
  );
}

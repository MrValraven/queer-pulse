import { Translation } from "../../shared/i18n/Translation";
import type {
  StudioArtistRefView,
  StudioReleaseCardView,
} from "./api/studio.adapters";
import { StudioShelf } from "./kit/StudioShelf";
import { StudioArtistCard } from "./StudioArtistCard";
import { HOME_ARTIST_LIMIT, uniqueArtists } from "./studioHome.data";
import { useStudioHomeShelf } from "./useStudioHomeShelf";
import kit from "./studioKit.module.css";

interface StudioArtistsRowProps {
  releases?: StudioReleaseCardView[];
  artists?: StudioArtistRefView[];
  titleKey?: string;
  className?: string;
  /** Home only: the `?shelf=` value its See all sets. See all then opens
   *  every artist behind the loaded releases as a grid. */
  shelfKey?: string;
}

function StudioArtistsShelf({
  id,
  titleKey,
  artists,
  layout,
  seeAllHref,
  seeAllLabel,
  seeAllReplace,
}: {
  id: string;
  titleKey: string;
  artists: StudioArtistRefView[];
  layout?: "row" | "grid";
  seeAllHref?: string;
  seeAllLabel?: string;
  seeAllReplace?: boolean;
}) {
  return (
    <StudioShelf
      id={id}
      title={<Translation i18nKey={titleKey} components={{ em: <em /> }} />}
      layout={layout}
      seeAllHref={seeAllHref}
      seeAllLabel={seeAllLabel}
      seeAllReplace={seeAllReplace}
    >
      {artists.map((artist) => (
        <StudioArtistCard key={artist.id} artist={artist} />
      ))}
    </StudioShelf>
  );
}

function StudioHomeArtistsShelf({
  releases,
  titleKey,
  shelfKey,
}: {
  releases: StudioReleaseCardView[];
  titleKey: string;
  shelfKey: string;
}) {
  const allArtists = uniqueArtists(releases, Number.POSITIVE_INFINITY);
  const { attachFrame, ...shelf } = useStudioHomeShelf(
    shelfKey,
    allArtists.length,
  );
  const artists = shelf.isExpanded
    ? allArtists
    : allArtists.slice(0, HOME_ARTIST_LIMIT);
  if (artists.length === 0) return null;
  return (
    <div ref={attachFrame}>
      <StudioArtistsShelf
        id={`studio-home-${shelfKey}`}
        titleKey={titleKey}
        artists={artists}
        layout={shelf.layout}
        seeAllHref={
          allArtists.length > HOME_ARTIST_LIMIT
            ? shelf.toggleHref
            : shelf.seeAllHref
        }
        seeAllLabel={shelf.seeAllLabel}
        seeAllReplace={shelf.seeAllReplace}
      />
    </div>
  );
}

/** One swipeable row of artist cards: the artists behind `releases` (home),
 *  or a given list (a scene's artists, related artists). Empty renders
 *  nothing; a caller that shows and hides it wraps it in Collapse.
 *  `className` sets the spacing for a page with its own section rhythm, in
 *  place of the shelf's own. */
export function StudioArtistsRow({
  releases = [],
  artists,
  titleKey = "studio:home.artists.title",
  className,
  shelfKey,
}: StudioArtistsRowProps) {
  const id = `studio-artists-${titleKey.replace(/[^a-zA-Z0-9]+/g, "-")}`;
  if (shelfKey && !artists)
    return (
      <StudioHomeArtistsShelf
        releases={releases}
        titleKey={titleKey}
        shelfKey={shelfKey}
      />
    );
  const rowArtists = artists ?? uniqueArtists(releases, HOME_ARTIST_LIMIT);
  if (rowArtists.length === 0) return null;
  const shelf = (
    <StudioArtistsShelf id={id} titleKey={titleKey} artists={rowArtists} />
  );
  return className ? (
    <div className={`${className} ${kit.shelfFlush}`}>{shelf}</div>
  ) : (
    shelf
  );
}

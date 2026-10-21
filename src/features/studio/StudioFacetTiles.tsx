import { useState, type CSSProperties, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import type { StudioGenre, StudioMood } from "./api/studio.types";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import { STUDIO_GENRE_MOTIF } from "./studioGenreMotifs";
import { STUDIO_MOOD_MOTIF } from "./studioMoodMotifs";
import { studioBrowsePath } from "./studioPaths";
import css from "./StudioFacetTiles.module.css";
import skeleton from "./studioSkeleton.module.css";

/** Placeholder tiles while a list loads: enough for two rows at most
 *  widths, so the section holds its place before the real tiles land. */
const SKELETON_TILE_COUNT = 8;
const SKELETON_TILE_KEYS = Array.from(
  { length: SKELETON_TILE_COUNT },
  (_cell, index) => `skeleton-${index}`,
);

/** Which vocabulary a tile grid lists, with the newest cover per value. */
export type StudioFacetTilesFacet =
  | {
      kind: "genre";
      values: StudioGenre[];
      coverByValue: Partial<Record<StudioGenre, string>>;
    }
  | {
      kind: "mood";
      values: StudioMood[];
      coverByValue: Partial<Record<StudioMood, string>>;
    };

interface StudioFacetTileView {
  value: StudioGenre | StudioMood;
  label: string;
  href: string;
  coverUrl: string | undefined;
  motif: ReactElement;
}

/** The release cover tilted into the tile's corner. It fades in once it
 *  has loaded and steps aside when the image fails, so the motif carries
 *  the tile alone. */
function StudioFacetCover({ coverUrl }: { coverUrl: string }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  if (hasFailed) return null;
  return (
    <img
      className={hasLoaded ? `${css.cover} ${css.coverLoaded}` : css.cover}
      src={coverUrl}
      alt=""
      width={160}
      height={160}
      loading="lazy"
      decoding="async"
      onLoad={() => setHasLoaded(true)}
      onError={() => setHasFailed(true)}
    />
  );
}

function StudioFacetTile({ tile }: { tile: StudioFacetTileView }) {
  const toneStyle = {
    "--facet-tone": `var(--studio-facet-${tile.value})`,
  } as CSSProperties;
  return (
    <Link
      to={tile.href}
      className={tile.coverUrl ? `${css.tile} ${css.hasCover}` : css.tile}
      style={toneStyle}
    >
      <svg
        className={css.motif}
        viewBox="0 0 160 100"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        {tile.motif}
      </svg>
      {tile.coverUrl ? <StudioFacetCover coverUrl={tile.coverUrl} /> : null}
      <span className={css.label}>{tile.label}</span>
    </Link>
  );
}

/** Genres or moods as Spotify-style browse tiles into /studio/browse: each
 *  its own colour and drawn motif, with its newest cover when there is one. */
export function StudioFacetTiles({
  facet,
  label,
  isLoading = false,
}: {
  facet: StudioFacetTilesFacet;
  label: string;
  /** Shows plain skeleton tiles in the grid's place. */
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  // Real tiles fade in only when they replace skeletons; a list already in
  // the cache paints at once.
  const [shouldFadeIn] = useState(isLoading);
  if (isLoading) {
    return (
      <div
        className={css.nav}
        role="status"
        aria-label={t("studio:states.loadingLabel")}
      >
        <div className={css.grid}>
          {SKELETON_TILE_KEYS.map((key) => (
            <div
              key={key}
              className={`${css.item} ${skeleton.shimmer} ${css.skeletonTile}`}
            />
          ))}
        </div>
      </div>
    );
  }
  const tiles: StudioFacetTileView[] =
    facet.kind === "genre"
      ? facet.values.map((genre) => ({
          value: genre,
          label: t(STUDIO_GENRE_LABEL_KEY[genre]),
          href: studioBrowsePath(genre, null, null),
          coverUrl: facet.coverByValue[genre],
          motif: STUDIO_GENRE_MOTIF[genre],
        }))
      : facet.values.map((mood) => ({
          value: mood,
          label: t(STUDIO_MOOD_LABEL_KEY[mood]),
          href: studioBrowsePath(null, mood, null),
          coverUrl: facet.coverByValue[mood],
          motif: STUDIO_MOOD_MOTIF[mood],
        }));
  return (
    <nav aria-label={label} className={css.nav}>
      <ul className={shouldFadeIn ? `${css.grid} ${css.gridEnter}` : css.grid}>
        {tiles.map((tile) => (
          <li key={tile.value} className={css.item}>
            <StudioFacetTile tile={tile} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

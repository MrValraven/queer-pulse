import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type RefObject,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import type { StudioFormat, StudioGenre, StudioMood } from "./api/studio.types";
import { StudioShelf } from "./kit/StudioShelf";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import { STUDIO_GENRE_MOTIF } from "./studioGenreMotifs";
import { STUDIO_MOOD_MOTIF } from "./studioMoodMotifs";
import { studioBrowsePath } from "./studioPaths";
import css from "./StudioFacetTiles.module.css";
import skeleton from "./studioSkeleton.module.css";

/** Placeholder columns while a list loads: enough to fill a wide row. */
const SKELETON_COLUMN_KEYS = Array.from(
  { length: 6 },
  (_column, index) => `skeleton-${index}`,
);

/** Tiles stacked in each column of the two-row scroller. */
const TILES_PER_COLUMN = 2;

/** The tile grid's floor and gap, as StudioFacetTiles.module.css sets
 *  them (`.fitGrid`: `repeat(auto-fit, minmax(160px, 1fr))`, 12px gaps). */
const GRID_TILE_MIN_PX = 160;
const GRID_GAP_PX = 12;

/** True when the tiles lay out as a plain wrapping grid in place of the
 *  two-row scroller: every tile fits one row at the width the shelf has,
 *  or a phone's two columns hold them all in two rows. It measures before
 *  paint and again on every resize. */
function useFitsGrid(
  ref: RefObject<HTMLElement | null>,
  tileCount: number,
): boolean {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  if (width === 0 || tileCount === 0) return false;
  const columns = Math.max(
    1,
    Math.floor((width + GRID_GAP_PX) / (GRID_TILE_MIN_PX + GRID_GAP_PX)),
  );
  return tileCount <= columns || (columns <= 2 && tileCount <= 2 * columns);
}

/** "Fado / contemporâneo" breaks after the slash, never before it: a
 *  no-break space joins the slash to the word ahead of it. */
function keepSlashWithWord(label: string): string {
  return label.replace(/ \//g, "\u00a0/");
}

/** Which vocabulary a tile row lists, with the newest cover per value. */
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
      <span className={css.label}>{keepSlashWithWord(tile.label)}</span>
    </Link>
  );
}

function tilesOf(
  facet: StudioFacetTilesFacet,
  activeFormat: StudioFormat | null,
  translate: (key: string) => string,
): StudioFacetTileView[] {
  return facet.kind === "genre"
    ? facet.values.map((genre) => ({
        value: genre,
        label: translate(STUDIO_GENRE_LABEL_KEY[genre]),
        href: studioBrowsePath(genre, null, activeFormat),
        coverUrl: facet.coverByValue[genre],
        motif: STUDIO_GENRE_MOTIF[genre],
      }))
    : facet.values.map((mood) => ({
        value: mood,
        label: translate(STUDIO_MOOD_LABEL_KEY[mood]),
        href: studioBrowsePath(null, mood, activeFormat),
        coverUrl: facet.coverByValue[mood],
        motif: STUDIO_MOOD_MOTIF[mood],
      }));
}

/** The tiles in columns of two, top to bottom then left to right. */
function columnsOf(tiles: StudioFacetTileView[]): StudioFacetTileView[][] {
  const columns: StudioFacetTileView[][] = [];
  for (let start = 0; start < tiles.length; start += TILES_PER_COLUMN)
    columns.push(tiles.slice(start, start + TILES_PER_COLUMN));
  return columns;
}

/** Genres or moods as colour tiles into /studio/browse, each its own colour
 *  and drawn motif with its newest cover when there is one, laid out as a
 *  compact two-row shelf that scrolls sideways. Every tile keeps the active
 *  `?format`, so the member's narrowing survives the tap. Skeleton tiles
 *  hold the row while the list loads and the real tiles fade in over them. */
export function StudioFacetTiles({
  facet,
  id,
  title,
  label,
  activeFormat = null,
  isLoading = false,
  hasSeeAll = true,
}: {
  /** False on Browse itself, where See all would lead back to the page. */
  hasSeeAll?: boolean;
  facet: StudioFacetTilesFacet;
  /** The shelf heading's id. */
  id: string;
  title: ReactElement;
  /** Names the navigation landmark ("Genres", "Moods"). */
  label: string;
  activeFormat?: StudioFormat | null;
  isLoading?: boolean;
}) {
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement>(null);
  const tiles = tilesOf(facet, activeFormat, t);
  const columns = columnsOf(tiles);
  // Few enough tiles for the grid: a plain wrapping grid of tiles in place
  // of the two-row scroller, so no column stands half empty.
  const isOneRow = useFitsGrid(navRef, isLoading ? 0 : tiles.length);
  const countStyle = { "--facet-count": tiles.length } as CSSProperties;
  return (
    <nav
      ref={navRef}
      aria-label={label}
      aria-busy={isLoading || undefined}
      className={isOneRow ? css.fitGrid : undefined}
      style={countStyle}
    >
      <StudioShelf
        id={id}
        title={title}
        layout={isOneRow ? "grid" : "row"}
        seeAllHref={
          hasSeeAll ? studioBrowsePath(null, null, activeFormat) : undefined
        }
      >
        {isLoading
          ? SKELETON_COLUMN_KEYS.map((key) => (
              <div key={key} className={css.column} aria-hidden="true">
                <div className={`${skeleton.shimmer} ${css.skeletonTile}`} />
                <div className={`${skeleton.shimmer} ${css.skeletonTile}`} />
              </div>
            ))
          : isOneRow
            ? tiles.map((tile) => (
                <div key={tile.value} className={css.cell}>
                  <StudioFacetTile tile={tile} />
                </div>
              ))
            : columns.map((column) => (
                <div
                  key={column.map((tile) => tile.value).join("|")}
                  className={css.column}
                >
                  {column.map((tile) => (
                    <div key={tile.value} className={css.cell}>
                      <StudioFacetTile tile={tile} />
                    </div>
                  ))}
                </div>
              ))}
      </StudioShelf>
    </nav>
  );
}

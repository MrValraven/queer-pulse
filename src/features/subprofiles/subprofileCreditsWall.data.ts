import type { AccentKey } from "./api/subprofiles.api";

/** How one tile sits on the wall of faces, and how wide an image to ask the
 *  image host for (about twice the tile's widest rendered width, so it stays
 *  sharp on a 2x screen). */
export interface WallTileSpan {
  columnSpan: 1 | 2;
  rowSpan: 1 | 2;
  imageSrcSize: number;
}

/** A whole wall: its column count and one span per tile, in order. The spans
 *  are chosen so the tiles fill the grid as a full rectangle. */
export interface WallLayout {
  columns: 3 | 4;
  spans: readonly WallTileSpan[];
}

// ── Desktop (4 columns at 118px rows, about 147px per column at 620px) ─────

const DESKTOP_LEAD: WallTileSpan = {
  columnSpan: 2,
  rowSpan: 2,
  imageSrcSize: 620,
};
const DESKTOP_WIDE: WallTileSpan = {
  columnSpan: 2,
  rowSpan: 1,
  imageSrcSize: 620,
};
const DESKTOP_TALL: WallTileSpan = {
  columnSpan: 1,
  rowSpan: 2,
  imageSrcSize: 520,
};
const DESKTOP_SMALL: WallTileSpan = {
  columnSpan: 1,
  rowSpan: 1,
  imageSrcSize: 300,
};

/**
 * Nine tiles over a 4 by 4 grid, every cell filled:
 *
 *   lead  lead  small tall
 *   lead  lead  small tall
 *   wide  wide  tall  small
 *   wide  wide  tall  small
 */
export const WALL_LAYOUT_DESKTOP_NINE: WallLayout = {
  columns: 4,
  spans: [
    DESKTOP_LEAD,
    DESKTOP_SMALL,
    DESKTOP_TALL,
    DESKTOP_SMALL,
    DESKTOP_WIDE,
    DESKTOP_TALL,
    DESKTOP_SMALL,
    DESKTOP_WIDE,
    DESKTOP_SMALL,
  ],
};

// ── Three columns (a phone, or a desktop with fewer than nine personas) ────

/** Six tiles over a 3 by 3 grid: the lead tile with two beside it, then a
 *  row of three. Widths here suit a desktop wall of three columns. */
export const WALL_LAYOUT_DESKTOP_SIX: WallLayout = {
  columns: 3,
  spans: [
    { columnSpan: 2, rowSpan: 2, imageSrcSize: 760 },
    ...Array.from({ length: 5 }, (): WallTileSpan => ({
      columnSpan: 1,
      rowSpan: 1,
      imageSrcSize: 380,
    })),
  ],
};

/** The same six tiles at phone widths (3 columns at 92px rows). */
export const WALL_LAYOUT_PHONE_SIX: WallLayout = {
  columns: 3,
  spans: [
    { columnSpan: 2, rowSpan: 2, imageSrcSize: 560 },
    ...Array.from({ length: 5 }, (): WallTileSpan => ({
      columnSpan: 1,
      rowSpan: 1,
      imageSrcSize: 320,
    })),
  ],
};

/** The smallest wall the hero draws: the lead tile with two stacked beside
 *  it, a full 3 by 2 rectangle. Under three personas the wall is left out. */
export const WALL_MIN_TILES = 3;

/**
 * Accent tints whose own on-colour misses AA (4.5:1) for the 14px name, so a
 * tile on them without a photo keeps the caption scrim. Measured against
 * ACCENT_TOKENS:
 *   coral  cream on --accent             2.63:1
 *   jade   ink on --jade                 4.35:1
 *   violet cream on dark-mode --violet   3.61:1 (5.08:1 in light)
 * Plum (cream, about 14:1) and amber (ink, about 9:1) pass and show their
 * tint clean, as in the approved design.
 */
export const WALL_SCRIM_ACCENTS: ReadonlySet<AccentKey> = new Set<AccentKey>([
  "coral",
  "jade",
  "violet",
]);

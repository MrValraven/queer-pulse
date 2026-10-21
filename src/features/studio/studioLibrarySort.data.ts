import type { SavedItem } from "../../app/providers/useSaved";
import type { ImageSlotTint } from "../../shared/components/ui";
import type {
  StudioArtistRefView,
  StudioPlaylistCardView,
} from "./api/studio.adapters";
import type { StudioListSort } from "./useStudioListFilter";

/** Library's sorts. Recent keeps the server's order: the newest save, or
 *  the playlist edited last, first. */
export type StudioLibrarySort = "recent" | "title" | "creator";

export interface StudioLibrarySortOption {
  id: StudioLibrarySort;
  labelKey: string;
  listSort: StudioListSort;
}

const RECENT: StudioLibrarySortOption = {
  id: "recent",
  labelKey: "studio:libraryLive.sort.recent",
  listSort: "custom",
};

/** Playlists and releases: Recent, Title, Creator. */
export const STUDIO_LIBRARY_SORTS: readonly StudioLibrarySortOption[] = [
  RECENT,
  { id: "title", labelKey: "studio:libraryLive.sort.title", listSort: "title" },
  {
    id: "creator",
    labelKey: "studio:libraryLive.sort.creator",
    listSort: "artist",
  },
];

/** Followed artists have no creator of their own: Recent and Name. */
export const STUDIO_LIBRARY_ARTIST_SORTS: readonly StudioLibrarySortOption[] = [
  RECENT,
  { id: "title", labelKey: "studio:libraryLive.sort.name", listSort: "title" },
];

const SORT_IDS: ReadonlySet<string> = new Set(
  STUDIO_LIBRARY_SORTS.map((option) => option.id),
);

export const isStudioLibrarySort = (
  value: string | null,
): value is StudioLibrarySort => value !== null && SORT_IDS.has(value);

/** The list sort for a Library sort. A sort the tab does not offer
 *  (Creator on the artists tab) reads as Recent, as its menu shows. */
export function studioListSortOf(
  sort: StudioLibrarySort,
  options: readonly StudioLibrarySortOption[] = STUDIO_LIBRARY_SORTS,
): StudioListSort {
  return options.find((option) => option.id === sort)?.listSort ?? "custom";
}

/** What the filter box matches, per kind of Library card. Module level, so
 *  `useStudioListFilter` keeps a stable result. */
export const ownPlaylistFilterText = (playlist: StudioPlaylistCardView) =>
  `${playlist.name} ${playlist.credit.name}`;
export const savedItemFilterText = (item: SavedItem) =>
  `${item.title} ${item.meta ?? ""}`;
export const artistFilterText = (artist: StudioArtistRefView) =>
  `${artist.name} ${artist.handle}`;

const PLACEHOLDER_TINTS: readonly ImageSlotTint[] = [
  "coral",
  "jade",
  "plum",
  "default",
];

/** A save carries no art, so its placeholder takes a tint picked from its
 *  id: the same card keeps the same colour on every visit. */
export function savedCoverTintOf(savedId: string): ImageSlotTint {
  let hash = 0;
  for (const character of savedId)
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return PLACEHOLDER_TINTS[hash % PLACEHOLDER_TINTS.length] ?? "default";
}

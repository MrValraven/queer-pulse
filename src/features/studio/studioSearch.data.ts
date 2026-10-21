import type { StudioSearchType } from "./api/studio.types";

/** The search filters, one per server `type`. Sheet music stays a demo-only
 *  link beside them (StudioSearchFilters). */
export const STUDIO_SEARCH_FILTERS: {
  id: StudioSearchType;
  labelKey: string;
}[] = [
  { id: "all", labelKey: "studio:search.filter.everything" },
  { id: "releases", labelKey: "studio:searchPage.filter.releases" },
  { id: "tracks", labelKey: "studio:searchPage.filter.tracks" },
  { id: "artists", labelKey: "studio:search.filter.artists" },
  { id: "playlists", labelKey: "studio:searchPage.filter.playlists" },
];

/** The server answers 20 per type (ENG-05). A section of the all-types view
 *  that came back full may hold more, so its "See all" names the count with
 *  a plus. */
export const STUDIO_SEARCH_PAGE_SIZE = 20;

/** The all-types view previews this many tracks; "See all" opens the rest
 *  under the Tracks tab. */
export const STUDIO_SEARCH_ALL_VIEW_TRACKS = 6;

/** Recent searches live on this device only, under this key, and the
 *  listening-memory wipe removes them (clearStudioListeningMemory). */
export const STUDIO_RECENT_SEARCHES_STORAGE_KEY = "qp.studio.searches.v1";
export const STUDIO_RECENT_SEARCHES_LIMIT = 8;

/** Demo-only suggestion chips, shown while this device has no recent
 *  searches of its own. Catalog keys, so the terms read in the member's
 *  language. */
export const STUDIO_SEARCH_SUGGESTION_KEYS = [
  "studio:searchPage.suggestion.fadoReworked",
  "studio:searchPage.suggestion.saraMarques",
  "studio:searchPage.suggestion.transComposers",
  "studio:searchPage.suggestion.sheetMusic",
] as const;

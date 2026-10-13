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

/** Demo-only suggestion chips (the showcase never stored searches). */
export const RECENT = [
  "fado reworked",
  "sara marques",
  "trans composers",
  "sheet music",
];

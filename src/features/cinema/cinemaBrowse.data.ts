import { films, type Access, type CinemaFilm } from "./data";

/**
 * Browse-only poster overrides, keyed by film id. The browse grid shows a
 * different crop than the cinema-home thumbnail, so posters live here rather
 * than on the shared film record. Falls back to `film.image` when absent.
 */
const BROWSE_POSTER_BY_ID: Record<string, string> = {
  cascais:
    "https://images.unsplash.com/photo-1770902895934-b04a10daa893?q=80&w=400&auto=format&fit=crop",
  paris:
    "https://images.unsplash.com/photo-1759547020777-14a1ca4c3fdf?q=80&w=400&auto=format&fit=crop",
  pharmacy:
    "https://images.unsplash.com/photo-1759773944717-0e3617799860?q=80&w=400&auto=format&fit=crop",
  mother:
    "https://images.unsplash.com/photo-1760031009842-9175946953c8?q=80&w=400&auto=format&fit=crop",
  archive:
    "https://images.unsplash.com/photo-1761142681497-b2dc51f4e28c?q=80&w=400&auto=format&fit=crop",
  carta:
    "https://images.unsplash.com/photo-1761948245703-cbf27a3e7502?q=80&w=400&auto=format&fit=crop",
};

/** Poster URL for a film in the browse grid (override → shared image → none). */
export function browsePoster(film: CinemaFilm): string | undefined {
  return BROWSE_POSTER_BY_ID[film.id] ?? film.image;
}

/**
 * i18n Pattern A. `value` is the canonical (untranslated) identifier used by
 * `filterFilms()`/`sortFilms()` and by the "made by"/mood per-film lookups
 * below — it never changes. `labelKey` is what the sidebar/active-chips UI
 * displays, resolved with `t()` in `CinemaBrowseControls.tsx` /
 * `CinemaBrowsePage.tsx`.
 */
export const ACCESS_FILTERS: { value: Access; labelKey: string }[] = [
  { value: "free", labelKey: "cinema:access.free" },
  { value: "member", labelKey: "cinema:access.sustainer" },
  { value: "rent", labelKey: "cinema:browse.filters.accessRent" },
];

export const FORMAT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Documentary", labelKey: "cinema:format.documentary" },
  { value: "Feature", labelKey: "cinema:format.feature" },
  { value: "Short", labelKey: "cinema:format.short" },
  { value: "Series", labelKey: "cinema:format.series" },
  { value: "Experimental", labelKey: "cinema:format.experimental" },
];
export const FORMATS = FORMAT_OPTIONS.map((f) => f.value);

export const MADE_BY_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Trans filmmakers", labelKey: "cinema:browse.madeBy.trans" },
  { value: "Lesbian filmmakers", labelKey: "cinema:browse.madeBy.lesbian" },
  { value: "Gay filmmakers", labelKey: "cinema:browse.madeBy.gay" },
  {
    value: "Non-binary filmmakers",
    labelKey: "cinema:browse.madeBy.nonBinary",
  },
  { value: "QP members", labelKey: "cinema:browse.madeBy.qpMembers" },
];
export const MADE_BY = MADE_BY_OPTIONS.map((m) => m.value);

/**
 * "Made by" tags per film. Not on the shared film record, so kept here as a
 * browse-only classification keyed by film id.
 */
const MADE_BY_BY_ID: Record<string, string[]> = {
  cascais: ["Lesbian filmmakers", "QP members"],
  paris: ["Gay filmmakers"],
  pharmacy: ["Trans filmmakers", "QP members"],
  mother: ["Gay filmmakers"],
  archive: ["Non-binary filmmakers"],
  carta: ["Trans filmmakers", "QP members"],
};

/** Moods per film, keyed by id (also browse-only). */
const MOOD_BY_ID: Record<string, string[]> = {
  cascais: ["Slow", "Tender", "Healing"],
  paris: ["Political", "Joyful"],
  pharmacy: ["Tender", "Healing"],
  mother: ["Slow", "Tender"],
  archive: ["Political", "Slow"],
  carta: ["Tender", "Funny", "Joyful"],
};

/** Country names shown in the sidebar, with the film code(s) they match. */
export const COUNTRY_OPTIONS: { value: string; labelKey: string; codes: string[] }[] =
  [
    { value: "Portugal", labelKey: "cinema:browse.country.portugal", codes: ["PT"] },
    { value: "Brazil", labelKey: "cinema:browse.country.brazil", codes: ["BR"] },
    { value: "France", labelKey: "cinema:browse.country.france", codes: ["FR"] },
    { value: "Japan", labelKey: "cinema:browse.country.japan", codes: ["JP"] },
    { value: "UK", labelKey: "cinema:browse.country.uk", codes: ["UK"] },
    { value: "Senegal", labelKey: "cinema:browse.country.senegal", codes: ["SN"] },
    { value: "Egypt", labelKey: "cinema:browse.country.egypt", codes: ["EG"] },
  ];
export const COUNTRIES = COUNTRY_OPTIONS.map((c) => c.value);

export const ACCESSIBILITY_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "PT subtitles", labelKey: "cinema:browse.accessibility.ptSubtitles" },
  { value: "EN subtitles", labelKey: "cinema:browse.accessibility.enSubtitles" },
  {
    value: "Audio description",
    labelKey: "cinema:browse.accessibility.audioDescription",
  },
  {
    value: "Sign language",
    labelKey: "cinema:browse.accessibility.signLanguage",
  },
];
export const ACCESSIBILITY = ACCESSIBILITY_OPTIONS.map((a) => a.value);

/** Maps an accessibility label to the `subs` substring(s) that satisfy it. */
const ACCESS_NEEDLE: Record<string, string[]> = {
  "PT subtitles": ["PT subs"],
  "EN subtitles": ["EN subs"],
  "Audio description": ["AD", "Audio description"],
  "Sign language": ["Sign", "LGP", "BSL"],
};

export const MOOD_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Slow", labelKey: "cinema:browse.mood.slow" },
  { value: "Tender", labelKey: "cinema:browse.mood.tender" },
  { value: "Political", labelKey: "cinema:browse.mood.political" },
  { value: "Funny", labelKey: "cinema:browse.mood.funny" },
  { value: "Healing", labelKey: "cinema:browse.mood.healing" },
  { value: "Joyful", labelKey: "cinema:browse.mood.joyful" },
];
export const MOODS = MOOD_OPTIONS.map((m) => m.value);

export interface BrowseFilters {
  access: Set<Access>;
  format: string | null;
  madeBy: Set<string>;
  country: Set<string>;
  accessibility: Set<string>;
  mood: Set<string>;
}

export const emptyFilters = (): BrowseFilters => ({
  access: new Set(),
  format: null,
  madeBy: new Set(),
  country: new Set(),
  accessibility: new Set(),
  mood: new Set(),
});

function matchCountry(film: CinemaFilm, selected: Set<string>): boolean {
  const filmCodes = film.country.split("/").map((c) => c.trim());
  return [...selected].some((value) => {
    const codes = COUNTRY_OPTIONS.find((c) => c.value === value)?.codes ?? [];
    return codes.some((code) => filmCodes.includes(code));
  });
}

function matchAccessibility(film: CinemaFilm, selected: Set<string>): boolean {
  const haystack = film.subs.join(" ").toLowerCase();
  // AND within accessibility: a film must satisfy every selected need.
  return [...selected].every((label) =>
    (ACCESS_NEEDLE[label] ?? [label]).some((needle) =>
      haystack.includes(needle.toLowerCase()),
    ),
  );
}

/** AND across groups, multi-select (OR) within each group. */
export function filterFilms(filters: BrowseFilters): CinemaFilm[] {
  return films.filter((f) => {
    if (filters.access.size > 0 && !filters.access.has(f.access)) return false;
    if (filters.format && f.format !== filters.format) return false;
    if (filters.madeBy.size > 0) {
      const tags = MADE_BY_BY_ID[f.id] ?? [];
      if (![...filters.madeBy].some((m) => tags.includes(m))) return false;
    }
    if (filters.country.size > 0 && !matchCountry(f, filters.country))
      return false;
    if (
      filters.accessibility.size > 0 &&
      !matchAccessibility(f, filters.accessibility)
    )
      return false;
    if (filters.mood.size > 0) {
      const moods = MOOD_BY_ID[f.id] ?? [];
      if (![...filters.mood].some((m) => moods.includes(m))) return false;
    }
    return true;
  });
}

export type SortKey = "curated" | "newest" | "oldest" | "az";

export const SORT_OPTIONS: { value: SortKey; labelKey: string }[] = [
  { value: "curated", labelKey: "cinema:browse.sort.curated" },
  { value: "newest", labelKey: "cinema:browse.sort.newest" },
  { value: "oldest", labelKey: "cinema:browse.sort.oldest" },
  { value: "az", labelKey: "cinema:browse.sort.az" },
];

/** Number of films in the full (unfiltered) catalogue, for the hero copy. */
export const FILM_CATALOGUE_COUNT = 142;

function filmTitle(f: CinemaFilm): string {
  return `${f.titlePre}${f.titleEm ?? ""}${f.titlePost ?? ""}`.trim();
}

export function sortFilms(list: CinemaFilm[], key: SortKey): CinemaFilm[] {
  const copy = [...list];
  switch (key) {
    case "newest":
      return copy.sort((a, b) => Number(b.year) - Number(a.year));
    case "oldest":
      return copy.sort((a, b) => Number(a.year) - Number(b.year));
    case "az":
      return copy.sort((a, b) => filmTitle(a).localeCompare(filmTitle(b)));
    default:
      return copy; // curated = source order
  }
}

import type { TFunction } from "../../shared/i18n/types";
import type { ConnectionSort } from "./api/connections.api";
import type { ConnectionView } from "./connections.data";

/**
 * The orderings the connections list offers. The ids are the same stable
 * English values the API accepts, so nothing has to be translated on the way
 * to the server; only the label is resolved through `t()` at render (i18n
 * Pattern A).
 */
export const CONNECTION_SORTS: readonly ConnectionSort[] = [
  "recent",
  "alphabetical",
  "mutuals",
];

export function connectionSortLabel(
  sort: ConnectionSort,
  t: TFunction,
): string {
  switch (sort) {
    case "alphabetical":
      return t("connect:allTab.sortAToZ");
    case "mutuals":
      return t("connect:allTab.sortClosestMutuals");
    default:
      return t("connect:allTab.sortRecentlyConnected");
  }
}

/**
 * Case- and accent-folded text, so a member typing "Sao" finds "São" and
 * "ines" finds "Inês". Mirrors what the backend does in SQL (`translate()`
 * over the same Latin-1 letters), so demo mode and live mode agree on what
 * counts as a match.
 */
export function foldForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Whether a card matches a search term across name, handle, headline, tags. */
export function matchesSearchTerm(
  view: ConnectionView,
  foldedTerm: string,
): boolean {
  if (!foldedTerm) return true;
  const haystack = [view.name, view.slug, view.role, ...view.tags].join(" ");
  return foldForSearch(haystack).includes(foldedTerm);
}

/**
 * Demo-mode equivalent of the server's `q` + `sort`.
 *
 * Live mode never calls this: the server already filtered and ordered the page,
 * and re-filtering here would drop a row the server matched on a field this
 * function does not read. Demo mode has no server, so the same rules are
 * applied locally to the mock relationships.
 */
export function filterAndSortViews(
  views: ConnectionView[],
  searchTerm: string,
  sort: ConnectionSort,
): ConnectionView[] {
  const foldedTerm = foldForSearch(searchTerm.trim());
  const matched = foldedTerm
    ? views.filter((view) => matchesSearchTerm(view, foldedTerm))
    : views;
  if (sort === "alphabetical") {
    return [...matched].sort((left, right) =>
      foldForSearch(left.name).localeCompare(foldForSearch(right.name)),
    );
  }
  if (sort === "mutuals") {
    return [...matched].sort(
      (left, right) => (right.meta.mutuals ?? 0) - (left.meta.mutuals ?? 0),
    );
  }
  return matched;
}
